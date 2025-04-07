import React from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, CardMedia, alpha } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DevicesIcon from '@mui/icons-material/Devices';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import SchoolIcon from '@mui/icons-material/School';

const features = [
  {
    title: "AI Personalization",
    description: "Courses adapt to your learning style and pace with our AI-driven recommendation engine",
    icon: <AutoAwesomeIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  },
  {
    title: "Interactive Modules",
    description: "Engage with content through quizzes, assignments, and interactive exercises",
    icon: <DevicesIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  },
  {
    title: "Real-time Collaboration",
    description: "Learn together with peers through live discussions and collaborative projects",
    icon: <GroupsIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  },
  {
    title: "Live Sessions",
    description: "Join instructor-led sessions with direct Q&A and participation",
    icon: <LiveTvIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  },
  {
    title: "Progress Analytics",
    description: "Track your learning journey with detailed performance insights",
    icon: <InsightsIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  },
  {
    title: "Verified Certification",
    description: "Earn credentials to showcase your newly acquired skills",
    icon: <SchoolIcon fontSize="large" sx={{ color: '#3f51b5' }} />
  }
];

const FeaturesSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#ffffff' }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" component="p" sx={{ color: '#3f51b5', fontWeight: 500 }}>
            PLATFORM FEATURES
          </Typography>
          <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, my: 2 }}>
            Everything You Need to Excel
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
            Our platform combines cutting-edge technology with proven learning methods to deliver an exceptional experience.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                },
                borderRadius: 2
              }}>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2
                }}>
                  <Box sx={{ 
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: alpha('#3f51b5', 0.1)
                  }}>
                    {feature.icon}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;