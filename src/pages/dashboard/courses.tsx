import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form'; 
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore, FirestoreHook } from '../../hooks/useFirestore';
import { useFirestoreCollectionData } from '../../hooks/useFirestoreCollectionData';
import { useRouter } from 'next/router';
import { Course } from '../../interfaces/types';
import { DocumentData, DocumentReference, where } from '@firebase/firestore';

const courseValidationSchema = yup.object({
  title: yup.string().required('Course Title is required'),
  description: yup.string().required('Course Description is required'),
});


const CourseForm: React.FC<{ onSubmit: any; initialValues?: any }> = ({ onSubmit, initialValues }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(courseValidationSchema),
    defaultValues: initialValues || { title: '', description: '' }
  }); 

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Course Title"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message?.toString()}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Course Description"
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message?.toString()}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

// Component to display each course in the list
const CourseItem = ({ course, onEdit, onDelete }: {
  course: Course, onEdit: (arg0: any) => void, onDelete: (arg0: any) => void 
}) => {
  return (
    <ListItem key={course.id}>
      <ListItemText primary={course.title} secondary={course.description} />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="edit" onClick={() => onEdit(course)}>
          <Edit />
        </IconButton>
        <IconButton edge="end" aria-label="delete" onClick={() => onDelete(course.id)}>
          <Delete />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

// The Main Dashboard Courses Page Component
const DashboardCourses = () => {
  const router = useRouter(); 
  const { user } = useAuth();
  const userId = user?.uid ?? '';
  const [courses, setCourses] = useState<Course[]>([]);

  // State for creating a new course
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  // State for editing a course
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Data fetching for courses from Firestore
  const { data: coursesData, loading: coursesLoading, error: coursesError } =
    useFirestoreCollectionData<Course>(
      'courses',
      user?.uid ? where('createdBy', '==', user.uid) : undefined
    );

  interface FirestoreHook<T> {
    createDocument: (collection: string, data: T) => Promise<DocumentReference<DocumentData>>;
    updateDocument: (collection: string, data: T) => Promise<void>;
    deleteDocument: (collection: string, id: string) => Promise<void>;
  }
  
  const { createDocument, updateDocument, deleteDocument } = useFirestore('courses') as unknown as FirestoreHook<Course>;

  useEffect(() => {
    if (coursesData) {
      setCourses(coursesData);
    }
  }, [coursesData]);

  // Handle Creating a New Course
  const handleCreateCourseOpen = () => {
    setIsCreatingCourse(true);
  };

  const handleCreateCourseClose = () => {
    setIsCreatingCourse(false);
  };

  const handleCreateCourseSubmit = async (newCourseData: Course) => {
    try {
      const newCourseRef = await createDocument('courses', {
        ...newCourseData,
        instructor: user ? user.uid : null,
        createdAt: new Date(),
        modules: []
      });
  
      setCourses([...courses, { ...newCourseData, id: newCourseRef.id }]); // Update state to reflect new course
      setIsCreatingCourse(false);
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  // Handle Editing an Existing Course
  const handleEditCourseOpen = (course: Course) => {
    setCourseToEdit(course);
    setIsEditingCourse(true);
  };

  const handleEditCourseClose = () => {
    setIsEditingCourse(false);
  };

  const handleEditCourseSubmit = async (updatedCourseData: Course) => {
    try {
      await updateDocument('courses', updatedCourseData);
  
      setCourses((prevCourses) =>
        prevCourses.map((c) =>
          c.id === updatedCourseData.id ? { ...c, ...updatedCourseData } : c
        )
      );

      setIsEditingCourse(false);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  // Handle Deleting a Course
  const handleDeleteCourse = async (courseId: string) => {
    const [open, setOpen] = useState(false);
  
    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const confirmDelete = async () => {
      try {
        // Delete the course from Firestore
        await deleteDocument('courses', courseId);
  
        // Update the courses in the UI
        const updatedCourses = courses.filter(c => c.id !== courseId);
        setCourses(updatedCourses);
  
        // Close the dialog
        handleClose();
      } catch (error) {
        console.error('Error deleting course:', error);
        // Optionally, show an error message to the user
      }
    };
  
    return (
      <>
        <Button variant="outlined" color="secondary" onClick={handleClickOpen}>
          Delete Course
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  if (coursesLoading) {
    return <CircularProgress />;
  }

  if (coursesError) {
    //  Handle errors (display an error message to the user)
    return <Alert severity="error">Error loading courses</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>
      <Button variant="contained" color="primary" onClick={handleCreateCourseOpen}>
        Create New Course
      </Button>

      <List>
        {courses.map(course => (
          <CourseItem key={course.id} course={course} onEdit={handleEditCourseOpen} onDelete={handleDeleteCourse} />
        ))}
      </List>

      {/* Dialog for Creating a New Course */}
      <Dialog open={isCreatingCourse} onClose={handleCreateCourseClose}>
        <DialogTitle>Create Course</DialogTitle>
        <DialogContent>
          <CourseForm onSubmit={handleCreateCourseSubmit} />
        </DialogContent>
      </Dialog>

      {/* Dialog for Editing a Course */}
      <Dialog open={isEditingCourse} onClose={handleEditCourseClose}>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          {courseToEdit && <CourseForm onSubmit={handleEditCourseSubmit} initialValues={courseToEdit} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCourses;
