import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import logo from '../../assets/logo.png'; // Adjust the path to your logo

function Footer() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
          <img src={logo} alt="logo" style={{ width: '50px', marginRight: '10px' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MyApp
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          <Link color="inherit" href="/">
            MyApp
          </Link>{' '}
          . All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
          Enhancing Learning Experiences
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          <Link color="inherit" href="/privacy" sx={{ mx: 2 }}>
            Privacy Policy
          </Link>
          <Link color="inherit" href="/terms" sx={{ mx: 2 }}>
            Terms of Service
          </Link>
          <Link color="inherit" href="/contact" sx={{ mx: 2 }}>
            Contact Us
          </Link>
          <Link color="inherit" href="/about" sx={{ mx: 2 }}>
            About Us
          </Link>
          <Link color="inherit" href="/blog" sx={{ mx: 2 }}>
            Blog
          </Link>
          <Link color="inherit" href="https://www.facebook.com" target="_blank" sx={{ mx: 2 }}>
            Facebook
          </Link>
          <Link color="inherit" href="https://www.twitter.com" target="_blank" sx={{ mx: 2 }}>
            Twitter
          </Link>
          <Link color="inherit" href="https://www.instagram.com" target="_blank" sx={{ mx: 2 }}>
            Instagram
          </Link>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" align="center" display="block">
            Contact us at: 
            <Link href="mailto:info@myapp.com" color="inherit"> info@myapp.com</Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
