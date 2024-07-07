import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseDetail from './[courseId]';
import { useRouter } from 'next/router';
import { useFirestoreDocument } from '../../../hooks/useFirestore';
import useAuth from '../../../hooks/useAuth';
import { enrollmentApi } from '../../../utils/api'; 

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks/useFirestore', () => ({
  useFirestoreDocument: jest.fn(),
}));

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../utils/api', () => ({
  enrollmentApi: {
    fetchEnrollments: jest.fn(),
    enrollInCourse: jest.fn(),
    unenrollFromCourse: jest.fn(),
  },
}));

describe('CourseDetail', () => {
  const mockUseRouter = useRouter as jest.Mock;
  const mockUseFirestoreDocument = useFirestoreDocument as jest.Mock;
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ query: { courseId: 'course123' } });
    mockUseFirestoreDocument.mockReturnValue({
      docData: {
        id: 'course123',
        title: 'Test Course',
        instructorName: 'John Doe',
        description: 'This is a test course',
        category: 'Testing',
        duration: 5,
      },
      loading: false,
      error: null,
    });
    mockUseAuth.mockReturnValue({ user: { uid: 'user123' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders course details correctly', () => {
    render(<CourseDetail />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('By John Doe')).toBeInTheDocument();
    expect(screen.getByText('This is a test course')).toBeInTheDocument();
    expect(screen.getByText('Category: Testing')).toBeInTheDocument();
    expect(screen.getByText('Duration: 5 hours')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseFirestoreDocument.mockReturnValueOnce({ docData: null, loading: true, error: null });
    
    render(<CourseDetail />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert when there is an error', () => {
    mockUseFirestoreDocument.mockReturnValueOnce({ docData: null, loading: false, error: 'Error loading course' });
    
    render(<CourseDetail />);
    
    expect(screen.getByText('Failed to load course details.')).toBeInTheDocument();
  });

  it('shows enrollment button for logged in users not enrolled in the course', () => {
    mockUseFirestoreDocument.mockReturnValueOnce({
      docData: {
        id: 'course123',
        title: 'Test Course',
        instructorName: 'John Doe',
        description: 'This is a test course',
        category: 'Testing',
        duration: 5,
      },
      loading: false,
      error: null,
    });

    render(<CourseDetail />);
    
    const enrollButton = screen.getByText('Enroll');
    expect(enrollButton).toBeInTheDocument();
  });

  it('calls enroll API on enroll button click', async () => {
    mockUseFirestoreDocument.mockReturnValueOnce({
      docData: {
        id: 'course123',
        title: 'Test Course',
        instructorName: 'John Doe',
        description: 'This is a test course',
        category: 'Testing',
        duration: 5,
      },
      loading: false,
      error: null,
    });

    render(<CourseDetail />);
    
    const enrollButton = screen.getByText('Enroll');
    fireEvent.click(enrollButton);
    
    expect(enrollmentApi.enrollInCourse).toHaveBeenCalledWith('course123');
  });
});
