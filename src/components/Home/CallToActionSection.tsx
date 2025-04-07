import React from 'react';
import { Box, Button, Container, Typography, Paper, Grid } from '@mui/material';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CallToActionSection = () => {
  return (
    <Box sx={{ py: 10, bgcolor: '#f0f4ff' }}>
      <Container>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: 4, 
            overflow: 'hidden',
            background: 'linear-gradient(to right, #3f51b5, #6573c3)',
            position: 'relative'
          }}
        >
          <Box sx={{ p: { xs: 4, md: 8 }, color: 'white', position: 'relative', zIndex: 2 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                  Start Your Learning Journey Today
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                  Join thousands of students already experiencing personalized learning that adapts to their unique needs.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    component={Link}
                    href="/auth/register" 
                    sx={{ 
                      bgcolor: 'white', 
                      color: '#3f51b5',
                      px: 4, 
                      py: 1.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  >
                    Create Free Account
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large" 
                    component={Link}
                    href="/courses" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      borderColor: 'white', 
                      color: 'white',
                      px: 4, 
                      py: 1.5,
                      '&:hover': { borderColor: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.1)' },
                      borderRadius: 2
                    }}
                  >
                    Explore Courses
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                {/* Add a decorative element or illustration here */}
              </Grid>
            </Grid>
          </Box>
          
          {/* Background pattern/decoration */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '40%',
              opacity: 0.1,
              background: 'url(/images/pattern.svg) no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center left',
              zIndex: 1
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default CallToActionSection;