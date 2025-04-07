import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Divider,
} from '@mui/material';
import { AddCircleOutline, PlayArrow, Stop, Poll, Delete, Videocam, VideocamOff } from '@mui/icons-material';
import { Timestamp, collection, query, where, orderBy, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { LiveSession, LiveSessionPoll } from '../../interfaces/types';
import { db, functions } from '../../firebaseConfig';
import { httpsCallable } from 'firebase/functions';

interface TeacherSessionManagerProps {
    courseId: string;
}

// Define callable functions
const createSessionFunction = httpsCallable(functions, 'createLiveSession');
const startSessionFunction = httpsCallable(functions, 'startLiveSession');
const endSessionFunction = httpsCallable(functions, 'endLiveSession');
const createPollFunction = httpsCallable(functions, 'createLiveSessionPoll');

const TeacherSessionManager: React.FC<TeacherSessionManagerProps> = ({ courseId }) => {
    const { user } = useAuth();
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    // State for creating a new session
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [newSessionDescription, setNewSessionDescription] = useState('');
    const [newSessionTime, setNewSessionTime] = useState<string>(new Date().toISOString().slice(0, 16));

    // State for creating a poll
    const [showPollDialog, setShowPollDialog] = useState(false);
    const [currentSessionForPoll, setCurrentSessionForPoll] = useState<LiveSession | null>(null);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

    // State for recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<BlobPart[]>([]);

    // Fetch live sessions using the real-time hook
    const sessionsQuery = query(
        collection(db, 'liveSessions'),
        where('courseId', '==', courseId),
        orderBy('scheduledStartTime', 'desc')
    );
    const { data: sessions, loading: sessionsLoading, error: sessionsError } =
        useFirestoreCollectionData<LiveSession>(sessionsQuery);

    // --- Session Creation ---
    const handleOpenCreateDialog = () => setShowCreateDialog(true);
    const handleCloseCreateDialog = () => {
        setShowCreateDialog(false);
        setNewSessionTitle('');
        setNewSessionDescription('');
        setNewSessionTime(new Date().toISOString().slice(0, 16));
    };

    const handleCreateSession = async () => {
        if (!newSessionTitle || !newSessionTime || !user) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const scheduledStartTime = Timestamp.fromDate(new Date(newSessionTime));
            await createSessionFunction({
                title: newSessionTitle,
                description: newSessionDescription,
                courseId: courseId,
                scheduledStartTime: scheduledStartTime,
                hostId: user.uid,
            });
            handleCloseCreateDialog();
        } catch (err: any) {
            setActionError(err.message || 'Failed to create session.');
            console.error("Error creating session:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Session Control ---
    const handleStartSession = async (sessionId: string) => {
        setActionLoading(true);
        setActionError(null);
        try {
            await startSessionFunction({ sessionId });
        } catch (err: any) {
            setActionError(err.message || 'Failed to start session.');
            console.error("Error starting session:", err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndSession = async (sessionId: string) => {
        setActionLoading(true);
        setActionError(null);
        try {
            await endSessionFunction({ sessionId });
        } catch (err: any) {
            setActionError(err.message || 'Failed to end session.');
            console.error("Error ending session:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Poll Creation ---
    const handleOpenPollDialog = (session: LiveSession) => {
        setCurrentSessionForPoll(session);
        setShowPollDialog(true);
    };

    const handleClosePollDialog = () => {
        setShowPollDialog(false);
        setCurrentSessionForPoll(null);
        setPollQuestion('');
        setPollOptions(['', '']);
    };

    const handlePollOptionChange = (index: number, value: string) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const handleAddPollOption = () => {
        setPollOptions([...pollOptions, '']);
    };

    const handleRemovePollOption = (index: number) => {
        if (pollOptions.length > 2) {
            const newOptions = pollOptions.filter((_, i) => i !== index);
            setPollOptions(newOptions);
        }
    };

    const handleCreatePoll = async () => {
        if (!currentSessionForPoll || !pollQuestion || pollOptions.some(opt => !opt.trim())) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await createPollFunction({
                sessionId: currentSessionForPoll.id,
                question: pollQuestion,
                options: pollOptions.filter(opt => opt.trim()),
            });
            handleClosePollDialog();
        } catch (err: any) {
            setActionError(err.message || 'Failed to create poll.');
            console.error("Error creating poll:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Recording ---
    const handleToggleRecording = async (sessionId: string) => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        } else {
            try {
                // Start recording
                const stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { cursor: "always" },
                    audio: true
                });

                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = mediaRecorder;
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    setRecordingBlob(blob);
                    setIsRecording(false);

                    // Upload recording to Firebase Storage
                    try {
                        const storage = getStorage();
                        const storageRef = ref(storage, `recordings/${sessionId}/${Date.now()}.webm`);
                        await uploadBytes(storageRef, blob);

                        const downloadUrl = await getDownloadURL(storageRef);

                        // Update session with recording URL
                        const sessionRef = doc(db, 'liveSessions', sessionId);
                        await updateDoc(sessionRef, {
                            recordings: arrayUnion({
                                url: downloadUrl,
                                createdAt: serverTimestamp(),
                                title: `Recording ${new Date().toLocaleString()}`
                            })
                        });

                        console.log('Recording uploaded successfully');
                    } catch (error) {
                        console.error('Error uploading recording:', error);
                    }

                    // Release screen sharing
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (error) {
                console.error('Error starting screen recording:', error);
            }
        }
    };

    // --- Rendering ---
    if (sessionsLoading && (!sessions || sessions.length === 0)) {
        return <CircularProgress />;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>Live Sessions Management</Typography>
            {sessionsError && <Alert severity="error" sx={{ mb: 2 }}>{sessionsError.message || 'Error loading sessions.'}</Alert>}
            {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

            <Button
                variant="contained"
                startIcon={<AddCircleOutline />}
                onClick={handleOpenCreateDialog}
                sx={{ mb: 2 }}
                disabled={actionLoading || sessionsLoading}
            >
                Schedule New Session
            </Button>

            <List>
                {(!sessions || sessions.length === 0) && !sessionsLoading && (
                    <ListItem>
                        <ListItemText primary="No sessions scheduled yet." />
                    </ListItem>
                )}
                {sessions && sessions.map((session) => (
                    <ListItem key={session.id} divider>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <ListItemText
                                    primary={session.title}
                                    secondary={`Scheduled: ${session.scheduledStartTime?.toDate ? session.scheduledStartTime.toDate().toLocaleString() : 'Invalid Date'}`}
                                />
                                <Typography variant="body2" color="text.secondary">Status: {session.status}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={8} container spacing={1} justifyContent="flex-end">
                                {session.status === 'scheduled' && (
                                    <Grid item>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<PlayArrow />}
                                            onClick={() => handleStartSession(session.id)}
                                            disabled={actionLoading}
                                        >
                                            Start
                                        </Button>
                                    </Grid>
                                )}
                                {session.status === 'live' && (
                                    <>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="secondary"
                                                startIcon={<Stop />}
                                                onClick={() => handleEndSession(session.id)}
                                                disabled={actionLoading}
                                            >
                                                End
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Poll />}
                                                onClick={() => handleOpenPollDialog(session)}
                                                disabled={actionLoading || !session.id}
                                            >
                                                Create Poll
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color={isRecording ? "error" : "secondary"}
                                                startIcon={isRecording ? <VideocamOff /> : <Videocam />}
                                                onClick={() => handleToggleRecording(session.id)}
                                            >
                                                {isRecording ? 'Stop Recording' : 'Record Session'}
                                            </Button>
                                        </Grid>
                                    </>
                                )}
                                {session.status === 'ended' && (
                                    <Grid item>
                                        <Typography variant="caption" color="text.secondary">Session Ended</Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                    </ListItem>
                ))}
            </List>

            {/* Create Session Dialog */}
            <Dialog open={showCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Schedule New Live Session</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Session Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newSessionTitle}
                        onChange={(e) => setNewSessionTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newSessionDescription}
                        onChange={(e) => setNewSessionDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Scheduled Start Time"
                        type="datetime-local"
                        fullWidth
                        variant="outlined"
                        value={newSessionTime}
                        onChange={(e) => setNewSessionTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} disabled={actionLoading}>Cancel</Button>
                    <Button onClick={handleCreateSession} variant="contained" disabled={actionLoading || !newSessionTitle || !newSessionTime}>
                        {actionLoading ? <CircularProgress size={24} /> : 'Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Poll Dialog */}
            <Dialog open={showPollDialog} onClose={handleClosePollDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create Poll for "{currentSessionForPoll?.title}"</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Poll Question"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Options (min 2):</Typography>
                    {pollOptions.map((option, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TextField
                                margin="dense"
                                label={`Option ${index + 1}`}
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={option}
                                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                            />
                            {pollOptions.length > 2 && (
                                <IconButton onClick={() => handleRemovePollOption(index)} size="small" sx={{ ml: 1 }}>
                                    <Delete />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    <Button onClick={handleAddPollOption} size="small" sx={{ mt: 1 }}>
                        Add Option
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePollDialog} disabled={actionLoading}>Cancel</Button>
                    <Button
                        onClick={handleCreatePoll}
                        variant="contained"
                        disabled={actionLoading || !pollQuestion || pollOptions.filter(opt => opt.trim()).length < 2}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : 'Create Poll'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TeacherSessionManager;