import React from 'react';
import { Box, Typography, Card, CardContent, Avatar, Grid, styled } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { Testimonial } from '../../interfaces/types';
import Rating from '../UI/Rating';

interface TestimonialProps {
  testimonials: Testimonial[];
  onTestimonialClick: (id: number) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
  marginBottom: 16,
  boxShadow: theme.shadows[3],
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  height: '100%',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-5px)',
  },
}));

const Testimonials: React.FC<TestimonialProps> = ({ testimonials, onTestimonialClick }) => {
  return (
    <Box sx={{ padding: 4, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        What Our Students Say
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {testimonials.map((testimonial) => (
          <Grid item xs={12} sm={6} md={4} key={testimonial.id}>
            <StyledCard onClick={() => onTestimonialClick(testimonial.id)}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ marginRight: 2 }} src={testimonial.avatarUrl}>
                  {!testimonial.avatarUrl && <PersonIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6" gutterBottom>{testimonial.name}</Typography>
                  {testimonial.rating && (
                    <Rating value={testimonial.rating} readOnly size="small" />
                  )}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <Typography variant="body2" color="textSecondary">
                  {testimonial.text}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Testimonials;
