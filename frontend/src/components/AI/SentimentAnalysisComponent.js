import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { green, red, grey } from '@mui/material/colors';

const SentimentAnalysisComponent = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError('Please enter some text for analysis.');
      return;
    }

    try {
      const response = await axios.post('/api/analyze-sentiment/', { text });
      setResult(response.data);
      setError(null);
    } catch (err) {
      let errorMessage = 'Error analyzing sentiment: ';
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage += 'The sentiment analysis service is currently unavailable.';
        } else if (err.response.data && err.response.data.error) {
          errorMessage += err.response.data.error;
        } else {
          errorMessage += 'An unknown error occurred.';
        }
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      setResult(null);
    }
  };


  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return { color: green[500] };
      case 'negative':
        return { color: red[500] };
      case 'neutral':
        return { color: grey[500] };
      default:
        return {};
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }} component={Paper} elevation={3} p={2}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analyze Sentiment
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Enter text to analyze"
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Analyze
        </Button>
      </form>
      {result && (
        <Typography variant="h5" style={getSentimentStyle(result.sentiment)} gutterBottom>
          Sentiment: {result.sentiment}
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

export default SentimentAnalysisComponent;
