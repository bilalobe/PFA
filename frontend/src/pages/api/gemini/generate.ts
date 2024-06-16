import { NextApiRequest, NextApiResponse } from 'next';
import { TextGenerationPipeline, pipeline } from '@xenova/transformers';

let generator: TextGenerationPipeline | ((arg0: any, arg1: {
    max_length: number; // Adjust as needed
    do_sample: boolean; temperature: number; // Adjust for creativity
    top_k: number;
}) => any);
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};
(async () => {
  try {
    generator = await pipeline(
      'text-generation', 
      'facebook/bart-large-cnn'
    );
  } catch (error) {
    console.error("Error loading the model:", error); 
  }
})();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { text, type } = req.body; 

      if (!text) {
        return res.status(400).json({ message: 'Missing text input.' });
      }

      let output = await generator(text, {
        max_length: 200, // Adjust as needed
        do_sample: true,
        temperature: 0.9, 
        top_k: 60,
      });

      // Process output based on content type
      let content = output[0].generated_text;
      
    if (type === 'uppercase') {
      content = content.toUpperCase();
    } else if (type === 'lowercase') {
      content = content.toLowerCase();
    } else if (type === 'reverse') {
      content = content.split('').reverse().join('');
    }

      res.status(200).json({ content });

    } catch (error) {
      console.error('Error generating text:', error);
      res.status(500).json({ message: 'Error generating text.' });
    }
  } else {
    res.status(405).end(); 
  }
};