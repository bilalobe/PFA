// frontend2/src/components/QuestionDisplay.tsx

import { FC } from 'react';

interface Question {
  id: number;
  text: string;
  answers: string[];
}

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div>
      <h2>{question.text}</h2>
      <ul>
        {question.answers.map((answer, index) => (
          <li key={index}>{answer}</li>
        ))}
      </ul>
    </div>
  );
};

export { QuestionDisplay };