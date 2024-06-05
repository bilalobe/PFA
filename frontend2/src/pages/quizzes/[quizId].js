// pages/quiz.js
import { useSelector, useDispatch } from 'react-redux';
import { wrapper } from '../store';
import { submitAnswer, calculateScore, resetQuiz, loadQuiz } from '../actions/quizActions';
import QuestionDisplay from '../components/QuestionDisplay';
import AnswerChoices from '../components/AnswerChoices';
import Timer from '../components/Timer';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Container from '../components/Container';

function QuizPage({ quiz }) {
    const dispatch = useDispatch();
    const score = useSelector((state) => state.quiz.score);
    const answers = useSelector((state) => state.quiz.answers);

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