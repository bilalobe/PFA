import Formik, { Form, FieldArray } from 'formik';
import * as Yup from 'yup';


const validationSchema = Yup.object().shape({
  questions: Yup.array().of(
    Yup.object().shape({
      question: Yup.string().required('Required'),
      answer: Yup.string().required('Required'),
    })
  ),
});


function AddQuestionsForm({ onSubmit, onNext, onError }) {
  return (
    <Formik
      initialValues={{ questions: [] }}
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
      {({ isSubmitting }) => (
        <Form>
          {/* Your form fields here */}
            <FieldArray name="questions">
                {({ push, remove }) => (
                <div>
                    {values.questions.map((_, index) => (
                    <div key={index}>
                        <TextField
                        name={`questions.${index}.question`}
                        label="Question"
                        variant="outlined"
                        color="primary"
                        fullWidth
                        />
                        <TextField
                        name={`questions.${index}.answer`}
                        label="Answer"
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        />
                        <button type="button" onClick={() => remove(index)}>
                        Remove
                        </button>
                    </div>
                    ))}
                    <button
                    type="button"
                    onClick={() => push({ question: '', answer: '' })}
                    >
                    Add Question
                    </button>
                </div>
                )}
            </FieldArray>

          <button type="submit" disabled={isSubmitting}>
            Next
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default AddQuestionsForm;