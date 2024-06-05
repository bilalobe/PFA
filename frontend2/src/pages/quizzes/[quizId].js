import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer, calculateScore, resetQuiz } from '../actions/quizActions';
import QuestionDisplay from '../components/QuestionDisplay';
import AnswerChoices from '../components/AnswerChoices';
import Timer from '../components/Timer';
import ScoreDisplay from '../components/ScoreDisplay';
import Button from '../components/Button';
import Container from '../components/Container';

function QuizPage() {
    const dispatch = useDispatch();
    const quiz = useSelector((state) => state.quiz.quiz);
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
                    <QuestionDisplay question={quiz.question} />
                    <AnswerChoices choices={quiz.choices} onAnswer={handleAnswer} />
                    <Timer onTimeUp={handleSubmit} />
                    <Button onClick={handleSubmit}>Submit</Button>
                </>
            )}
            <ScoreDisplay score={score} />
            <Button onClick={handleReset}>Reset Quiz</Button>
        </Container>
    );
}

export default QuizPage;