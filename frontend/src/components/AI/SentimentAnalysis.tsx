import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Chip } from '@mui/material';

function SentimentDisplay({ text, sentiment: initialSentiment }) {
  const [sentiment, setSentiment] = useState(initialSentiment);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If the sentiment was not provided, fetch it from the API
    if (!sentiment) {
      const analyzeSentiment = async () => {
        setIsLoading(true);
        try {
          const response = await axios.post('/api/sentiment/', { text });
          setSentiment(response.data.sentiment);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };
      analyzeSentiment();
    }
  }, [text, sentiment]);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Typography component="div">
      {isLoading ? (
        <Chip label="Loading..." />
      ) : error ? (
        <Chip label="Error" color="error" />
      ) : (
        <Chip label={sentiment || 'Not Analyzed'} color={getSentimentColor(sentiment)} />
      )}
    </Typography>
  );
}

export default SentimentDisplay;