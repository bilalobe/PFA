import React, { useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListItemSecondaryAction
} from '@mui/material'; 
import { useFirestore } from '../../hooks/useFirestore'; 
import { useFirestoreCollectionData } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router'; 
import { ModerationReport, User } from '../../interfaces/types';

const DashboardForums = () => {
  const { user } = useAuth(); 
  const router = useRouter();
  const { updateDocument } = useFirestore('moderation'); 

  const [reports, setReports] = useState<ModerationReport[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [actionDialogOpen, setActionDialogOpen] = useState(false); 
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('delete'); // Default action

  // Fetch moderation reports 
  const { data: reportsData, loading: reportsLoading, error: reportsError }  = 
      useFirestoreCollectionData<ModerationReport>(
        'moderation', 
        (collectionRef: firebase.firestore.Query<ModerationReport>) => {
          return collectionRef
            .where('actionTaken', '==', 'none')
            .orderBy('createdAt', 'desc');
        }
      );
  // ... (Get the corresponding post using postApi or useFirestore) 

  useEffect(() => {
    if (reportsData) {
      setReports(reportsData); 
    }
  }, [reportsData]);

  const handleOpenActionDialog = (report: ModerationReport) => {
    setSelectedReport(report); 
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedReport(null); 
  };

  const handleTakeAction = async (
    action: string | null, 
    selectedReport: ModerationReport | null, 
    reports: ModerationReport[], 
    setReports: React.Dispatch<React.SetStateAction<ModerationReport[]>>, 
    handleCloseActionDialog: () => void, 
    setError: React.Dispatch<React.SetStateAction<string | null>>, 
    user: User | null
  ) => {
    if (!selectedReport || !user) return;

    try {
        await updateDocument('moderation', {
          id: selectedReport.id,
          actionTaken: action,
          actionTakenBy: user.uid,
          actionTakenAt: new Date()
        });
        console.error('Error updating document:', error);
      
      setReports(reports.filter(report => report.id !== selectedReport.id)); // Fix: Ensure report has id
      handleCloseActionDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  // Authorization: Only allow admins and teachers
  useEffect(() => {
    if (user && user.user_type !== 'admin' && user.user_type !== 'teacher') {
      router.push('/');
    }
  }, [user, router]);

  if (reportsLoading) {
    return <CircularProgress />; 
  }

  if (reportsError) {
    return <Alert severity="error">{reportsError || 'Error loading reports'}</Alert>;
  }

  return (
    <div>
      {/* Main Content  */}
      <Typography variant="h4" gutterBottom>
        Forum Moderation
      </Typography>

      {/* Reports List */}
      <List>
        {reports.length === 0 ? (
          <ListItem>
            <ListItemText primary="No reports found." />
          </ListItem>
        ) : (
          reports.map((report) => (
            <ListItem key={report.id}>
              <ListItemIcon>
                {/* Icon based on report type (e.g., flag, warning) */}
              </ListItemIcon>
              <ListItemText 
                primary={report.reason} 
                secondary={`Post by: ${report.reportedBy}`} 
              />
              <ListItemSecondaryAction>
                <Button variant="contained" color="primary" onClick={() => handleOpenActionDialog(report)}>
                  Take Action
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>

      {/* Action Dialog  */}
      {selectedReport && ( // Only show if a report is selected
        <Dialog open={actionDialogOpen} onClose={handleCloseActionDialog}>
          <DialogTitle>Moderation Action</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Reason: {selectedReport.reason}
            </DialogContentText>
            <FormControl fullWidth>
              <InputLabel id="action-select-label">Action</InputLabel>
              <Select
                labelId="action-select-label"
                id="action-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as string)}
              >
                <MenuItem value="delete">Delete Post</MenuItem>
                <MenuItem value="warn">Warn User</MenuItem>
                <MenuItem value="ban">Ban User</MenuItem>
                {/* Add more actions as needed */}
              </Select>
            </FormControl>
            {/* Add a text field for additional notes if needed */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseActionDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleTakeAction(selectedAction, selectedReport, reports, setReports, handleCloseActionDialog, setError, user)} color="secondary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )} 
    </div>
  );
};

export default DashboardForums;
