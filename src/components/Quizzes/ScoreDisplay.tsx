import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface ScoreDisplayProps {
  quizId: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ quizId }) => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScore = async () => {
      const db = getFirestore();
      const scoreDoc = await getDoc(doc(db, 'quizzes', quizId, 'scores', 'userScoreId')); // Replace 'userScoreId' with the actual user ID or document ID

      if (scoreDoc.exists()) {
        setScore(scoreDoc.data().score);
      } else {
        setScore(0); // Default score if no document is found
      }

      setLoading(false);
    };

    fetchScore();
  }, [quizId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Typography variant="h4" gutterBottom>
        Your Score: {score} / {quizId ? quizId.length : 0}
      </Typography>
    </Box>
  );
};

export default ScoreDisplay;