import React from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import { Button } from '@mui/material';
import { saveResource } from '@/types/features/resource/resourceSlice';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = Yup.object().shape({
  file: Yup.mixed().required('A file is required').nullable(),
});

interface IFormInput {
  file: File | null;
}

export default function ResourceUploadPage({ course, module }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { control, handleSubmit, setError, formState: { errors } } = useForm<IFormInput>({
    resolver: yupResolver(schema) as any,
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const formData = new FormData();
    if (data.file) {
      formData.append('file', data.file);
    }

    try {
      const response = await axios.post(`/api/courses/${course.id}/modules/${module.id}/resources`, formData);
      dispatch(saveResource(response.data));
      router.push(`/courses/${course.id}/modules/${module.id}`);
    } catch (error: any) {
      setError('file', { type: 'manual', message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="file"
        control={control}
        defaultValue={null}
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <input
            type="file"
            id="file"
            name={name}
            onBlur={onBlur}
            ref={ref}
            onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
          />
        )}
      />
      {errors.file && <p>{errors.file.message}</p>}
      <Button type="submit">Upload</Button>
    </form>
  );
}
