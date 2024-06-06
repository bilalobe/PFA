import { useSelector, useDispatch } from 'react-redux';
import { wrapper } from '../store';
import { submitAnswer, calculateScore, resetQuiz, loadQuiz } from '../actions/quizActions';
import QuestionDisplay from '../../components/components/QuestionDisplay';
import AnswerChoices from '../../components/components/AnswerChoices';
import Timer from '../../components/components/Timer';
import ScoreDisplay from '../../components/components/ScoreDisplay';
import Button from '../../components/components/Button';
import Container from '../../components/components/Container';
import { RootState } from '../reducers'; // Import the type of your root state

interface Quiz {
  // Define the shape of your quiz object here
}

interface QuizPageProps {
  quiz: Quiz;
}

const QuizPage: React.FC<QuizPageProps> = ({ quiz }) => {
  const dispatch = useDispatch();
  const score = useSelector((state: RootState) => state.quiz.score);
  const answers = useSelector((state: RootState) => state.quiz.answers);

    const handleAnswer = (questionId, answer) => {
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

export const getServerSideProps = wrapper.getServerSideProps(async ({ store }) => {
    await store.dispatch(loadQuiz());
});

export default QuizPage;