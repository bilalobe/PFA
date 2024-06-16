import React, { useState } from 'react';
import {
    Button,
    TextField,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Snackbar,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import axios from 'axios';
import { ContentCopy as ContentCopyIcon, Clear as ClearIcon } from '@mui/icons-material';

const ContentGeneration: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [contentType, setContentType] = useState('');
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // Function to handle Dialog open
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    // Function to handle Dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const handleCopyToClipboard = () => {
        if (generatedContent) {
            navigator.clipboard.writeText(generatedContent);
            setOpenSnackbar(true);
        }
    };

    const handleClearContent = () => {
        setGeneratedContent(null);
        setInputText('');
        setContentType('');
        setError(null);
    };

    const generateContent = async () => {
        setLoading(true);
        setError(null);
        setGeneratedContent(null);

        if (inputText.trim() === '') {
            setError('Please enter some text.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/gemini/generate', {
                text: inputText,
                type: contentType
            });
            setGeneratedContent(response.data.content);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred while generating content.');
            setLoading(false);
        }
    };


    return (
        <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Content Generation
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
                <TextField
                    label="Input Text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="content-type-label">Content Type</InputLabel>
                    <Select
                        labelId="content-type-label"
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value as string)}
                    >
                        <MenuItem value="description">Course Description</MenuItem>
                        <MenuItem value="quiz">Quiz Question</MenuItem>
                        <MenuItem value="article">Article</MenuItem>
                        <MenuItem value="summary">Summary</MenuItem>
                        {/* Add more content types as needed */}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={generateContent}
                    disabled={loading || inputText.trim() === ''}
                >
                    {loading ? <CircularProgress size={24} /> : 'Generate Content'}
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    sx={{ mt: 2, ml: 2 }}
                    onClick={handleClearContent}
                    disabled={loading}
                >
                    <ClearIcon />
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {generatedContent && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Generated Content</Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 2 }}>
                        {generatedContent}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={handleCopyToClipboard}
                    >
                        <ContentCopyIcon />
                    </Button>
                </Box>
            )}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Content copied to clipboard"
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                }
            />
            <Button onClick={generateContent} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Generate'}
            </Button>
            {/* Dialog component */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Generated Content</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {generatedContent ? generatedContent : "No content generated yet."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ContentGeneration;
