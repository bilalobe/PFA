import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/types/store';
import { clearContent, generateContent } from '@/features/contentGenerationSlice';
import {
  Button, TextField, Typography, Box, CircularProgress, Alert, Select, MenuItem, InputLabel, FormControl,
  Snackbar, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { ContentCopy as ContentCopyIcon, Clear as ClearIcon } from '@mui/icons-material';

const ContentGeneration: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [contentType, setContentType] = useState('');
  const dispatch = useDispatch();
  const { generatedContent, loading, error } = useSelector((state: RootState) => state.contentGeneration);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

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
    dispatch(clearContent());
    setInputText('');
    setContentType('');
  };

  const handleGenerateContent = async () => {
    if (inputText.trim() === '') {
      setLocalError('Please enter some text.');
      return;
    }
    setLocalError(null);
    dispatch(generateContent({ text: inputText, type: contentType }));
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
            <MenuItem value="summary">Summary</MenuItem>
            <MenuItem value="uppercase">Uppercase</MenuItem>
            <MenuItem value="lowercase">Lowercase</MenuItem>
            <MenuItem value="reverse">Reverse</MenuItem>
            <MenuItem value="paraphrase">Paraphrase</MenuItem>
            <MenuItem value="grammar">Grammar Correction</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleGenerateContent}
          disabled={loading}
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
      {localError && <Alert severity="error" sx={{ mt: 2 }}>{localError}</Alert>}
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
