import React, { useState } from 'react';
import axios from 'axios';

function SentimentAnalysisComponent() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/analyze-sentiment/', { text });
      setResult(response.data);
      setError(null);
    } catch (err) {
      setError('Error analyzing sentiment');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze"
        />
        <button type="submit">Analyze Sentiment</button>
      </form>
      {result && (
        <div>
          <h3>Sentiment Analysis Result</h3>
          <p>Sentiment: {result.sentiment}</p>
          <p>Polarity: {result.polarity}</p>
          <p>Subjectivity: {result.subjectivity}</p>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default SentimentAnalysisComponent;
