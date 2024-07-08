import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';

function DropdownMenu({ buttonLabel, menuItems, color = 'primary', variant = 'contained' }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (callback) => {
    handleClose();
    if (callback) {
      callback();
    }
  };

  return (
    <>
      <Button color={color} variant={variant} aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        {buttonLabel}
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleMenuItemClick(item.callback)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

DropdownMenu.propTypes = {
  buttonLabel: PropTypes.string.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      callback: PropTypes.func,
    })
  ).isRequired,
  color: PropTypes.oneOf(['default', 'inherit', 'primary', 'secondary']),
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
};

export default DropdownMenu;