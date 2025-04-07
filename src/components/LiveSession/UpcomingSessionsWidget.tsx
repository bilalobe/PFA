import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Chip, CircularProgress } from '@mui/material';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import { LiveSession } from '../../interfaces/types';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { CalendarMonth, AccessTime } from '@mui/icons-material';

const UpcomingSessionsWidget = () => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      if (!user) return;
      
      try {
        // Get user's enrolled courses
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userId', '==', user.uid)
        );
        
        const enrollmentDocs = await getDocs(enrollmentsQuery);
        const courseIds = enrollmentDocs.docs.map(doc => doc.data().courseId);
        
        if (courseIds.length === 0) {
          setLoading(false);
          return;
        }
        
        // Get upcoming live sessions for these courses
        const now = new Date();
        const sessionsQuery = query(
          collection(db, 'liveSessions'),
          where('courseId', 'in', courseIds),
          where('scheduledStartTime', '>', now),
          where('status', 'in', ['scheduled', 'live']),
          orderBy('scheduledStartTime', 'asc'),
          limit(3)
        );
        
        const sessionDocs = await getDocs(sessionsQuery);
        const upcomingSessions = sessionDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LiveSession[];
        
        setSessions(upcomingSessions);
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingSessions();
  }, [user]);

  const handleViewSession = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={24} />
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Upcoming Live Sessions</Typography>
          <Typography color="text.secondary">No upcoming sessions scheduled</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Upcoming Live Sessions</Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessions.map(session => (
            <Card key={session.id} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{session.title}</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, color: 'text.secondary' }}>
                  <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {format(session.scheduledStartTime.toDate(), 'MMM dd, yyyy')}
                  </Typography>
                  <Box sx={{ mx: 1 }}>•</Box>
                  <AccessTime fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    {format(session.scheduledStartTime.toDate(), 'h:mm a')}
                  </Typography>
                </Box>
                
                {session.status === 'live' ? (
                  <Chip color="success" size="small" label="Live Now" sx={{ mb: 1 }} />
                ) : (
                  <Chip color="primary" size="small" label="Upcoming" sx={{ mb: 1 }} />
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => handleViewSession(session.courseId)}
                  >
                    {session.status === 'live' ? 'Join Now' : 'View Details'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default UpcomingSessionsWidget;