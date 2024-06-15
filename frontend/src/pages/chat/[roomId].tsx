import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { submitAnswer } from '../../redux/actions/quizActions';
import { useRouter } from 'next/router';

interface SubmitAndReviewProps {
    quizId: string;
    selectedAnswers: any[]; // Replace 'any' with the actual type of the selected answers
}

const SubmitAndReview: React.FC<SubmitAndReviewProps> = ({ quizId, selectedAnswers }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [showResults, setShowResults] = useState(false);
    const score = useSelector((state: any) => state.quiz.score); // Replace 'any' with the actual type of the state
    const submitSuccess = useSelector((state: any) => state.quiz.submitSuccess); // Replace 'any' with the actual type of the state

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionError(null);
        try {
            const attemptData = await dispatch(submitAnswer({ attemptId: quizId, answers: selectedAnswers })).unwrap();
            // After successful submission, show the results
            setShowResults(true);
        } catch (error) {
            setSubmissionError((error as Error).message || 'An error occurred while submitting the quiz.');
        }
    };

    const isTyping = (event: React.FormEvent<HTMLInputElement>) => event.currentTarget.value.trim() !== '';

    return (
        <Box p={3}>
            <Typography variant="h4">Chat Room: {roomId}</Typography>

            {isLoading ? (
                <CircularProgress />
            ) : (
                <List ref={chatContainerRef}>
                    {messages.map((message, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={message.user} secondary={message.text} />
                        </ListItem>
                    ))}
                </List>
            )}

            <Typography variant="h6">Online Users</Typography>
            <List>
                {onlineUsers.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={user} />
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6">Typing Users</Typography>
            <List>
                {typingUsers.map((user, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={user} />
                    </ListItem>
                ))}
            </List>

            <form onSubmit={handleSendMessage}>
                <TextField value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." />
                <Button type="submit">Send</Button>
            </form>

            <form onSubmit={handleTypingIndicator}>
                <TextField placeholder="Type something to see typing indicator..." />
            </form>
        </Box>
    );
};

export default SubmitAndReview;
