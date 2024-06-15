const ForumThread: React.FC<{ forumId: string }> = ({ forumId }) => {
    useEffect(() => {
      const socket = io('http://your-backend-domain:8000');
  
      socket.on('connect', () => {
        socket.emit('join_thread', { threadId: forumId });
      });
  
      socket.on('new_post', (data) => {
        // Update your component's state with the new post data
        // ...
      });
  
      return () => {
        socket.emit('leave_thread', { threadId: forumId });
        socket.disconnect();
      };
    }, [forumId]);
  
    return (
      <div>
        {/* Render your forum thread including posts */}
      </div>
    );
  };
  