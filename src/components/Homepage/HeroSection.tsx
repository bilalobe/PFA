import React from 'react';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => (
  <Box sx={{ backgroundColor: '#f5f8ff', py: 12 }}>
    <Container maxWidth="lg">
      <Grid container spacing={6} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Personalized Learning <span style={{ color: '#3f51b5' }}>Tailored to You</span>
          </Typography>
          
          <Typography variant="h5" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400 }}>
            Discover AI-powered courses that adapt to your learning style, schedule, and goals. Join thousands of students mastering new skills with PFA.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              href="/auth/register" 
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              component={Link} 
              href="/courses" 
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
            >
              Browse Courses
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Trusted by:</Typography>
            {/* Add logos of trusted organizations/schools here */}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', height: { xs: '300px', md: '450px' }, width: '100%' }}>
            <Image 
              src="/images/hero-illustration.webp" 
              alt="Students learning on PFA platform" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default HeroSection;