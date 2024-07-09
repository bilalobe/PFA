import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';

// ... (Add any other imports you need for styling, validation, or form libraries)

const ForumCreate: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;  // Assuming forums are related to courses (if not, adjust as needed)
  const { user } = useAuth();
  const { addDocument } = useFirestore('forums'); 

  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    //  You can add more validation here before submitting
    // ...

    setIsLoading(true);
    setError(null);

    try {
      const newForum = {
        ...formData,
        courseId: courseId, // Make sure to include the course ID
        createdAt: new Date(), // Or you can use a server timestamp
        createdBy: user.uid // Associate with the logged-in teacher
      };
      const forumRef: void | { id: string } = await addDocument(newForum);

      // After a successful forum creation
      router.push(`/forums/${forumRef.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create forum.');
    } finally {
      setIsLoading(false);
    }
  };

  //  Handle  Authorization:  Teachers  Only!
  useEffect(() => {
    if (user && user.userType !== 'teacher') {
      router.push('/');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create New Forum
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="Forum Title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : "Create Forum"}
        </Button>
      </form>
    </Box>
  );
};

export default ForumCreate;
