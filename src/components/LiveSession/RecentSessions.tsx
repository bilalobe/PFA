import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Chip } from '@mui/material';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { LiveSession } from '../../interfaces/types';

const RecentSessions: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [pastSessions, setPastSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastSessions = async () => {
      try {
        const q = query(
          collection(db, 'liveSessions'),
          where('courseId', '==', courseId),
          where('status', '==', 'ended'),
          orderBy('endTime', 'desc'),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const sessions = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as LiveSession[];
        
        setPastSessions(sessions);
      } catch (error) {
        console.error('Error fetching past sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPastSessions();
  }, [courseId]);

  return (
    <Box>
      <Typography variant="h6">Recent Live Sessions</Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : pastSessions.length === 0 ? (
        <Typography variant="body2">No past sessions available</Typography>
      ) : (
        <List>
          {pastSessions.map(session => (
            <ListItem key={session.id} divider>
              <ListItemText 
                primary={session.title}
                secondary={`${session.endTime.toDate().toLocaleDateString()}`}
              />
              {session.materials && (
                <Button variant="outlined" size="small">
                  View Materials
                </Button>
              )}
              {session.recordingUrl && (
                <Button variant="contained" size="small" sx={{ ml: 1 }}>
                  Watch Recording
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecentSessions;