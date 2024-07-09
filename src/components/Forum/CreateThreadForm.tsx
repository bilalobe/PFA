// components/Forum/CreateThreadForm.tsx
import { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

interface CreateThreadFormProps {
  forumId: string;
}

const CreateThreadForm: React.FC<CreateThreadFormProps> = ({ forumId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, `forums/${forumId}/threads`), {
        title: data.title,
        content: data.content,
        author: user?.uid,
        createdAt: new Date(),
      });
      reset();
      router.push(`/forums/${forumId}`);
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Create New Thread
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('title', { required: true })}
          label="Thread Title"
          fullWidth
          margin="normal"
        />
        <TextField
          {...register('content', { required: true })}
          label="Thread Content"
          multiline
          rows={4}
          fullWidth
          margin="normal"
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Create Thread'}
        </Button>
      </form>
    </Box>
  );
};

export default CreateThreadForm;
