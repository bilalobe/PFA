import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function AutoCorrect() {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/correct-text/', { text: inputText }); // Your API endpoint
      setCorrectedText(response.data.corrected_text);
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>AutoCorrect</Typography>
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
          Correct Text
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

      {correctedText && (
        <Box mt={2}>
          <Typography variant="h6">Corrected Text:</Typography>
          <Typography variant="body1">{correctedText}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default AutoCorrect;
