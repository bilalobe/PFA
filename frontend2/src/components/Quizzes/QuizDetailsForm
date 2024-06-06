import { Formik, Form, TextField, Rating } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  difficulty: Yup.number().required('Required') 
    .min(0, 'Must be greater than or equal to 0')
    .max(5, 'Must be less than or equal to 5')
    .integer('Must be an integer')
});

function QuizDetailsForm({ onSubmit, onNext, onError }) {
    return (
        <Formik
          initialValues={{ title: '', description: '', difficulty: 0 }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values);
              onNext();
            } catch (error) {
              onError(error.message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, handleChange }) => (
            <Form>
              <TextField
                id="title"
                name="title"
                label="Title"
                value={values.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
                color="primary"
                fullWidth
              />
      
              <TextField
                id="description"
                name="description"
                label="Description"
                value={values.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                variant="outlined"
                color="secondary"
                fullWidth
                multiline
              />
      
              <label htmlFor="difficulty">Difficulty</label>
              <Rating
                name="difficulty"
                value={values.difficulty}
                onChange={handleChange}
                precision={0.5}
              />
      
              <button type="submit" disabled={isSubmitting}>
                Next
              </button>
            </Form>
          )}
        </Formik>
      );
}

export default QuizDetailsForm;