import React from 'react';
import { Box, Container, Typography, Stepper, Step, StepLabel, StepContent, Paper } from '@mui/material';

const steps = [
  {
    label: 'Create Account',
    description: 'Sign up in seconds with email or social login',
  },
  {
    label: 'Discover Your Learning Style',
    description: 'Take a quick assessment to personalize your experience',
  },
  {
    label: 'Choose Courses',
    description: 'Browse and select from our extensive course catalog',
  },
  {
    label: 'Learn Your Way',
    description: 'Study at your pace with personalized recommendations',
  },
];

const UserJourneySection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#fafafa' }}>
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" component="p" sx={{ color: '#3f51b5', fontWeight: 500 }}>
            HOW IT WORKS
          </Typography>
          <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, my: 2 }}>
            Get Started in Minutes
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: '800px', mx: 'auto' }}>
            Our streamlined onboarding process gets you learning quickly with a personalized experience from day one.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Stepper orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 40 } }}>
            {steps.map((step, index) => (
              <Step key={step.label} active={true}>
                <StepLabel>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1">{step.description}</Typography>
                  <Box sx={{ mb: 3, mt: 1 }}></Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
};

export default UserJourneySection;