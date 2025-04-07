import { useState, useEffect, useRef } from 'react';
import { 
  TextField, 
  Box, 
  Paper, 
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { Save, WifiOff, Sync, DeleteOutline } from '@mui/icons-material';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { debounce } from 'lodash';

interface SessionNotesProps {
  sessionId: string;
  courseId: string;
}

const SessionNotes = ({ sessionId, courseId }: SessionNotesProps) => {
  const { user, isOnline } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const notesTimestampRef = useRef<number>(Date.now());
  
  const localStorageKey = `session_notes_${sessionId}_${user?.uid}`;

  // Load notes from IndexedDB or Firestore depending on connection status
  useEffect(() => {
    const loadNotes = async () => {
      // Try to load from local storage first
      const localNotes = localStorage.getItem(localStorageKey);
      const localTimestamp = localStorage.getItem(`${localStorageKey}_timestamp`);
      
      if (localNotes) {
        setNotes(localNotes);
        if (localTimestamp) {
          notesTimestampRef.current = parseInt(localTimestamp);
        }
      }
      
      // If we're online, try to fetch from Firestore
      if (isOnline && user) {
        try {
          const notesRef = doc(db, `users/${user.uid}/sessionNotes/${sessionId}`);
          const notesDoc = await getDoc(notesRef);
          
          if (notesDoc.exists()) {
            const serverNotes = notesDoc.data();
            
            // If server has newer notes, use those
            if (serverNotes.updatedAt?.toMillis() > notesTimestampRef.current) {
              setNotes(serverNotes.content || '');
              notesTimestampRef.current = serverNotes.updatedAt.toMillis();
              localStorage.setItem(localStorageKey, serverNotes.content || '');
              localStorage.setItem(`${localStorageKey}_timestamp`, notesTimestampRef.current.toString());
            } else if (localNotes) {
              // If local notes are newer, mark that we have changes to sync
              setHasLocalChanges(true);
            }
          }
        } catch (error) {
          console.error('Error loading notes from server:', error);
        }
      }
    };
    
    loadNotes();
  }, [sessionId, user, isOnline, localStorageKey]);

  // Auto-sync effect when coming back online
  useEffect(() => {
    if (isOnline && hasLocalChanges && user) {
      syncNotesToServer();
    }
  }, [isOnline, hasLocalChanges, user]);

  // Handle notes change and local saving
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setHasLocalChanges(true);
    
    // Save to local storage
    localStorage.setItem(localStorageKey, newNotes);
    notesTimestampRef.current = Date.now();
    localStorage.setItem(`${localStorageKey}_timestamp`, notesTimestampRef.current.toString());
    
    // Debounced save to server if online
    debouncedSaveToServer(newNotes);
  };

  // Debounced function to save notes to server
  const debouncedSaveToServer = useRef(
    debounce(async (content: string) => {
      if (isOnline && user) {
        await saveNotesToServer(content);
      }
    }, 2000)
  ).current;

  // Save notes to Firestore
  const saveNotesToServer = async (content: string = notes) => {
    if (!user || !isOnline) return;
    
    setIsSaving(true);
    try {
      const notesRef = doc(db, `users/${user.uid}/sessionNotes/${sessionId}`);
      await setDoc(notesRef, {
        content,
        courseId,
        sessionId,
        updatedAt: serverTimestamp(),
        localTimestamp: notesTimestampRef.current
      }, { merge: true });
      
      setLastSaved(new Date());
      setHasLocalChanges(false);
    } catch (error) {
      console.error('Error saving notes to server:', error);
      setHasLocalChanges(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Force sync to server
  const syncNotesToServer = async () => {
    if (!isOnline || !user) {
      setSyncMessage('You are offline. Notes will sync when you reconnect.');
      setShowSnackbar(true);
      return;
    }
    
    setSyncing(true);
    try {
      await saveNotesToServer();
      setSyncMessage('Notes synced successfully');
      setShowSnackbar(true);
    } catch (error) {
      setSyncMessage('Failed to sync notes. Will retry later.');
      setShowSnackbar(true);
    } finally {
      setSyncing(false);
    }
  };

  // Clear notes
  const handleClearNotes = () => {
    if (window.confirm('Are you sure you want to clear your notes? This cannot be undone.')) {
      setNotes('');
      localStorage.removeItem(localStorageKey);
      saveNotesToServer('');
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 1 
      }}>
        <Typography variant="h6">Session Notes</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isOnline && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
              <WifiOff fontSize="small" sx={{ mr: 0.5 }} />
              Offline Mode
            </Typography>
          )}
          {hasLocalChanges && (
            <Typography variant="caption" color="info.main">
              Unsaved changes
            </Typography>
          )}
          <IconButton 
            color="error" 
            size="small" 
            onClick={handleClearNotes} 
            title="Clear notes"
          >
            <DeleteOutline fontSize="small" />
          </IconButton>
          <Button
            size="small"
            startIcon={syncing ? <CircularProgress size={16} /> : <Sync />}
            onClick={syncNotesToServer}
            disabled={syncing || !hasLocalChanges}
            variant="outlined"
            color="primary"
          >
            Sync
          </Button>
        </Box>
      </Box>
      
      <TextField
        multiline
        fullWidth
        variant="outlined"
        value={notes}
        onChange={handleNotesChange}
        placeholder="Take notes during the session..."
        sx={{ 
          flexGrow: 1,
          '& .MuiInputBase-root': {
            height: '100%',
            display: 'flex',
            '& textarea': {
              flexGrow: 1
            }
          }
        }}
      />
      
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
        </Typography>
        
        {isSaving && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="caption">Saving...</Typography>
          </Box>
        )}
      </Box>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={syncMessage}
      />
    </Paper>
  );
};

export default SessionNotes;