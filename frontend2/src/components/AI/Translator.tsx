import React, { useState } from 'react';
import axios from 'axios';
import { Select, MenuItem, Button, FormControl, InputLabel, Typography } from '@mui/material';

function TranslationComponent({ originalText }) {
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/translate/', {
        text: originalText,
        target_language: targetLanguage
      });
      setTranslatedText(response.data.translation);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FormControl fullWidth>
        <InputLabel id="language-selector-label">Target Language</InputLabel>
        <Select
          labelId="language-selector-label"
          id="language-selector"
          value={targetLanguage}
          label="Target Language"
          onChange={handleLanguageChange}
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="es">Spanish</MenuItem>
          <MenuItem value="fr">French</MenuItem>
          {/* Add more languages as needed */}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={handleTranslate}
        disabled={isLoading}
      >
        {isLoading ? 'Translating...' : 'Translate'}
      </Button>
      {error && <Typography color="error">{error}</Typography>}
      {translatedText && (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          {translatedText}
        </Typography>
      )}
    </div>
  );
}

export default TranslationComponent;
