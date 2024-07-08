import React from 'react';
import { Box, Container, Typography, Link, styled } from '@mui/material';
import EggAltIcon from '@mui/icons-material/EggAlt'; // Updated import

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3, 0),
}));

interface CustomFooterProps {
  appName?: string;
  slogan?: string;
}

const CustomFooter: React.FC<CustomFooterProps> = ({ appName = 'MyApp', slogan = 'Enhancing Learning Experiences' }) => {
  return (
    <StyledBox>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <EggAltIcon style={{ width: '50px', marginRight: '10px' }} /> {/* Updated logo */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {appName}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          <Link color="inherit" href="/">
            {appName}
          </Link>{' '}
          . All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          {slogan}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Link href="/about" color="inherit" sx={{ m: 1 }} aria-label="About">
            About
          </Link>
          <Link href="/contact" color="inherit" sx={{ m: 1 }} aria-label="Contact">
            Contact
          </Link>
          {/* Add more links as needed */}
        </Box>
      </Container>
    </StyledBox>
  );
};

export default CustomFooter;