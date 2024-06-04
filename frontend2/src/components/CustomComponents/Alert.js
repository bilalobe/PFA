import { styled } from '@mui/material';

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
    // Add your custom styles here. For example:
    backgroundColor: severity === 'error' ? theme.palette.error.light : theme.palette.success.light,
    color: theme.palette.common.white,
    '& .MuiAlert-icon': {
        color: theme.palette.common.white,
    },
    alignItems: 'center',
}));


function CustomAlert({ type, title, message, onClose }) {
    return (
        <StyledAlert severity={type} onClose={onClose}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
        </StyledAlert>
    );
}

export default CustomAlert;