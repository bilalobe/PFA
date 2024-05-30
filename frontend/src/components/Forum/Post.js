import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material';
import axios from 'axios';

function Post({ post, user }) {
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState(null);

  const handleClickOpen = () => {
    setOpenReportDialog(true);
    setReportSuccess(false);
    setReportError(null);
  };

  const handleClose = () => {
    setOpenReportDialog(false);
    setSelectedReason('');
  };

  const handleReportPost = async () => {
    try {
      const response = await axios.post('/api/report_post/', {
        post: post.id,
        reason: selectedReason,
      });

      // Handle success
      setReportSuccess(true);
      setReportError(null);
    } catch (error) {
      // Handle error
      setReportSuccess(false);
      setReportError(error.response?.data?.detail || 'Failed to submit the report. Please try again.');
    }
  };

  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
    setReportError(null);  // Clear error message when user selects a reason
  };

  const isReportButtonDisabled = !selectedReason || user.role === 'instructor' || user.role === 'supervisor';

  return (
    <div>
      <p>{post.content}</p>

      <Button onClick={handleClickOpen} variant="outlined" color="error">Report</Button>

      <Dialog open={openReportDialog} onClose={handleClose}>
        <DialogTitle>Report Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please select a reason for reporting this post:
          </DialogContentText>
          <RadioGroup value={selectedReason} onChange={handleReasonChange}>
            <FormControlLabel value="spam" control={<Radio />} label="Spam" />
            <FormControlLabel value="offensive" control={<Radio />} label="Offensive Content" />
            <FormControlLabel value="irrelevant" control={<Radio />} label="Irrelevant" />
            <FormControlLabel value="other" control={<Radio />} label="Other" />
          </RadioGroup>
          {reportSuccess && (
            <Alert severity="success">
              Report submitted successfully.
            </Alert>
          )}
          {reportError && (
            <Alert severity="error">
              {reportError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {reportSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!reportSuccess && (
            <Button onClick={handleReportPost} variant="contained" color="error" disabled={isReportButtonDisabled}>
              Report
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Post;
