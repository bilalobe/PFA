import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

function CustomModalDialog({ open, title, children, onClose, onConfirm, confirmText, cancelText }: {
  open: boolean,
  title: string,
  children: React.ReactNode,
  onClose: () => void,
  onConfirm: () => void,
  confirmText: string,
  cancelText: string
}) {
  return (
    <Dialog open={open} onClose={onClose} disableBackdropClick disableEscapeKeyDown>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {typeof children === 'string' ? <DialogContentText>{children}</DialogContentText> : children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CustomModalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  disableBackdropClick: PropTypes.bool,
};

CustomModalDialog.defaultProps = {
  title: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
};

export default CustomModalDialog;