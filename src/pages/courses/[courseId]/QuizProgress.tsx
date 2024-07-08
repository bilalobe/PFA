import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

function QuizProgress() {
    const router = useRouter();
    const { courseId } = router.query;

    useEffect(() => {
        const quizAttemptId = "your_quiz_attempt_id_here"; // Replace with actual logic to obtain quiz attempt ID
        const socket = new WebSocket(`ws://<your_server>/ws/quiz_progress/${quizAttemptId}/`);

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            const message = data['message'];
            // Update UI with the new progress
            console.log(message);
        };

        socket.onclose = function(e) {
            console.error('Quiz progress socket closed unexpectedly');
        };

        return () => {
            socket.close();
        };
    }, [courseId]); // Re-run effect if courseId changes

    return (
        <div>
            {/* Your quiz progress UI here */}
        </div>
    );
}

export default QuizProgress;