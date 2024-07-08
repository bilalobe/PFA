import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chip } from '@mui/material';

// Define the type for the post prop
interface PostProps {
  id: number;
  title: string;
  content: string;
  // Add any other relevant props here
}

// Define the type for the sentiment analysis response
interface SentimentResponse {
  sentiment: 'positive' | 'negative' | 'neutral';
}

const Post: React.FC<PostProps> = ({ id, title, content }) => {
  const [sentiment, setSentiment] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await axios.post<SentimentResponse>('/api/sentiment/analyze/', { text: content });
        setSentiment(response.data.sentiment);
      } catch (error) {
        console.error("Error fetching sentiment:", error);
      }
    };

    fetchSentiment();
  }, [content]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      {sentiment && (
        <Chip
          label={`Sentiment: ${sentiment}`}
          color={getSentimentColor(sentiment)}
          size="small"
        />
      )}
      {/* Add any additional markup or components for the post */}
    </div>
  );
};

export default Post;
