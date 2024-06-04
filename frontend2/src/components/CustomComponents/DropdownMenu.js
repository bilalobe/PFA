import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Menu, MenuItem } from '@mui/material';

function DropdownMenu({ buttonLabel, menuItems }) {
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
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        {buttonLabel}
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {menuItems.map((item) => (
          <MenuItem key={item.label} onClick={() => handleMenuItemClick(item.callback)}>
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
      label: PropTypes.string.isRequired,
      callback: PropTypes.func,
    })
  ).isRequired,
};

DropdownMenu.defaultProps = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      callback: () => {},
    })
  ),
};

export default DropdownMenu;