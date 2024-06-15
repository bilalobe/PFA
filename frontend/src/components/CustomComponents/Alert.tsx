import { AlertColor, styled } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import PropTypes from 'prop-types';

const StyledAlert = styled(Alert)(({ theme, severity }: { theme: any, severity: AlertColor }) => ({
    backgroundColor: severity === 'error' ? theme.palette.error.light : theme.palette.success.light,
    color: theme.palette.common.white,
    '& .MuiAlert-icon': {
        color: theme.palette.common.white,
    },
    alignItems: 'center',
}));

function CustomAlert({ type, title, message, onClose, icon, customStyles }: { type: "error" | "info" | "success" | "warning", title: string, message: string, onClose: () => void, icon: React.ReactNode, customStyles: object }) {
    return (
        <StyledAlert severity={type} onClose={onClose} icon={icon} sx={customStyles} theme={undefined}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {message}
        </StyledAlert>
    );
}

CustomAlert.propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func,
    icon: PropTypes.node,
    customStyles: PropTypes.object,
};

export default CustomAlert;