import React, { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function QuestionGeneration() {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/ai/generate-questions/', { text: inputText }); // Your API endpoint
      setQuestions(response.data.questions);
    } catch (error) {
      setError((error as Error).message || 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Question Generation</Typography>
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
          Generate Questions
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

      {questions && (
        <Box mt={2}>
          <Typography variant="h6">Generated Questions:</Typography>
          <ul>
            {questions.map((question: string, index: number) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
}

export default QuestionGeneration;
