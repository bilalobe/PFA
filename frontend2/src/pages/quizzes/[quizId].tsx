import { useSelector, useDispatch } from 'react-redux';
import { wrapper } from '../store';
import { submitAnswer, calculateScore, resetQuiz, loadQuiz } from '../actions/quizActions';
import QuestionDisplay from '../../components/components/QuestionDisplay';
import AnswerChoices from '../../components/components/AnswerChoices';
import Timer from '../../components/components/Timer';
import ScoreDisplay from '../../components/CustomComponents/ScoreDisplay';
import Button from '../../components/components/Button';
import Container from '../../components/components/Container';
import { RootState } from '../reducers'; // Import the type of your root state

interface Quiz {
    question: string;
    choices: string[];
    correctAnswer: string;
    trivia: string;
}

interface QuizPageProps {
  quiz: Quiz;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz }) => {
  const dispatch = useDispatch();
  const score = useSelector((state: RootState) => state.quiz.score);
  const answers = useSelector((state: RootState) => state.quiz.answers);

    const handleAnswer = (questionId: any, answer: any) => {
        dispatch(submitAnswer(questionId, answer));
    };

    const handleSubmit = () => {
        dispatch(calculateScore(answers));
    };

    const handleReset = () => {
        dispatch(resetQuiz());
    };

    return (
        <Container>
            {quiz && (
                <>
                    {score !== null && <ScoreDisplay score={score} />}
                    <QuestionDisplay question={quiz.question} />
                    <AnswerChoices choices={quiz.choices} onAnswer={handleAnswer} />
                    <Timer initialSeconds={60} onTimeUp={handleSubmit} />
                    <Button onClick={handleSubmit}>Submit</Button>
                    <Button onClick={handleReset}>Reset</Button>
                </>
            )}
        </Container>
    );
}

export const getServerSideProps = wrapper.getServerSideProps(async ({ store }: { store: any }) => {
    await store.dispatch(loadQuiz());
});

export default QuizPage;