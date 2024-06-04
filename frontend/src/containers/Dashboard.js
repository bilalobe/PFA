import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import RecommendationList from '../components/AdaptiveLearning/RecommendationList';
import Chatbot from '../components/Chat/Chatbot';
import SentimentAnalysisComponent from '../components/AI/SentimentAnalysisComponent'; // Add this line

const authorizedRoles = ['admin', 'teacher'];

const Dashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const history = history();

  if (!user || !authorizedRoles.includes(user.role)) {
    history.push('/');
    return null;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        AI-Powered Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Personalized Recommendations</Typography>
            <RecommendationList />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Chatbot</Typography>
            <Chatbot />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h6">Sentiment Analysis</Typography>
            <SentimentAnalysisComponent /> {/* Add this line */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
