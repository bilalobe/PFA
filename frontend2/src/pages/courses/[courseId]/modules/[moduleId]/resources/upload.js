import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { LinearProgress, Button } from '@mui/material';
import { saveResource } from '../../../actions/courseActions';

const validationSchema = Yup.object().shape({
  file: Yup.mixed().required('A file is required')
});

export default function ResourceUploadPage({ course, module }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    const formData = new FormData();
    formData.append('file', values.file);

    try {
      const response = await axios.post(`/api/courses/${course.id}/modules/${module.id}/resources`, formData, {
        onUploadProgress: (progressEvent) => {
          setSubmitting(progressEvent.loaded < progressEvent.total);
        }
      });

      dispatch(saveResource(response.data));
      router.push(`/courses/${course.id}/modules/${module.id}`);
    } catch (error) {
      setErrors({ submit: error.message });
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ file: null }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, setFieldValue }) => (
        <Form>
          <input
            id="file"
            name="file"
            type="file"
            onChange={(event) => {
              setFieldValue("file", event.currentTarget.files[0]);
            }}
          />
          {isSubmitting && <LinearProgress />}
          <Button type="submit" disabled={isSubmitting}>
            Upload
          </Button>
          {errors.submit && <div>{errors.submit}</div>}
        </Form>
      )}
    </Formik>
  );
}