import { TextBlob } from 'textblob';

export default async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      const analysis = new TextBlob(text);
      const sentiment = analysis.sentiment.polarity;
      res.status(200).json({ sentiment });
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      res.status(500).json({ message: 'Sentiment analysis failed.' });
    }
  } else {
    res.status(405).end(); 
  }
};