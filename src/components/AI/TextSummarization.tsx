import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function TextSummarization() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/summarize-text/', { text: inputText }); // Your API endpoint
      setSummary(response.data.summary);
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Text Summarization</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Enter Text"
          multiline
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          Summarize Text
        </Button>
      </form>

      {loading && (
        <Box mt={2}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box mt={2}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {summary && (
        <Box mt={2}>
          <Typography variant="h6">Summary:</Typography>
          <Typography variant="body1">{summary}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default TextSummarization;
