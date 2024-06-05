import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateUserProfile, uploadProfilePicture } from '../../actions/userActions';
import { Typography, Avatar, Card, CardContent, Box, Grid, CircularProgress, Alert, Button, TextField, LinearProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import EditIcon from '@mui/icons-material/Edit';

const validationSchema = Yup.object().shape({
  bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'),
});

function ProfileView({ profile, onEdit }) {
  return (
    <>
      <Typography variant="body1">{profile.bio}</Typography>
      <Button startIcon={<EditIcon />} onClick={onEdit}>
        Edit Bio
      </Button>
    </>
  );
}

function ProfileEditForm({ initialValues, onSubmit }) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field
            name="bio"
            as={TextField}
            label="Bio"
            fullWidth
            disabled={isSubmitting}
          />
          <ErrorMessage name="bio" component={Typography} color="error" />
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            Save
          </Button>
        </Form>
      )}
    </Formik>
  );
}

function ProfilePage() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [initialValues, setInitialValues] = useState({
    bio: profile?.bio || '',
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setInitialValues({
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const uploadProgress = await dispatch(uploadProfilePicture(file));
    setProgress(uploadProgress);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    await dispatch(updateUserProfile(values));
    setIsEditing(false);
    setSubmitting(false);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" component="div" gutterBottom>
        Profile
      </Typography>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={profile.profile_picture} alt="Profile Picture" sx={{ width: 64, height: 64, mb: 2 }} />
            <input type="file" onChange={handleUpload} />
            <LinearProgress variant="buffer" value={progress} valueBuffer={buffer} />
            <Typography variant="h5">{profile.user}</Typography>
            <Typography variant="body1">{profile.user_type}</Typography>
            {isEditing ? (
              <ProfileEditForm initialValues={initialValues} onSubmit={handleSubmit} />
            ) : (
              <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ProfilePage;