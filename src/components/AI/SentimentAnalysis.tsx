import React, { useEffect, useState } from 'react';
import { Typography, Chip, CircularProgress } from '@mui/material';
import { getSentiment } from '../../utils/api';

interface SentimentDisplayProps {
  text: string;
  initialSentiment?: string;
}

const SentimentDisplay: React.FC<SentimentDisplayProps> = ({ text, initialSentiment }) => {
  const [sentiment, setSentiment] = useState<string | null>(initialSentiment || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sentiment) {
      const analyzeSentiment = async () => {
        setIsLoading(true);
        try {
          const response = await getSentiment(text);
          if (response && response.sentiment) {
            setSentiment(response.sentiment as string);
          } else {
            setError('Failed to get sentiment from response');
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('An unexpected error occurred');
          }
        } finally {
          setIsLoading(false);
        }
      };
      analyzeSentiment();
    }
  }, [text, sentiment]);

  const getSentimentColor = (sentiment: string | null) => {
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
        <CircularProgress />
      ) : error ? (
        <Chip label="Error" color="error" />
      ) : (
        <Chip label={sentiment || 'Not Analyzed'} color={getSentimentColor(sentiment)} />
      )}
    </Typography>
  );
};

export default SentimentDisplay;