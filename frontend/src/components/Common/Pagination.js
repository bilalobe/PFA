import React from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';

const Pagination = ({ currentPage, totalPages, paginate }) => {
  const [inputValue, setInputValue] = React.useState(currentPage);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handlePageJump = () => {
    const pageNumber = Number(inputValue);
    if (pageNumber > 0 && pageNumber <= totalPages) {
      paginate(pageNumber);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      pageNumbers.push(i);
    } else if (
      i === currentPage - 3 ||
      i === currentPage + 3
    ) {
      pageNumbers.push('...');
    }
  }

  return (
    <Box display="flex" justifyContent="center" mt={4} aria-label="pagination navigation">
      <Button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outlined"
        color="primary"
        sx={{ mx: 1 }}
        aria-label="previous page"
      >
        Previous
      </Button>
      {pageNumbers.map((number, index) =>
        number === '...' ? (
          <Typography key={index} variant="h6" sx={{ mx: 1 }} aria-hidden="true">
            {number}
          </Typography>
        ) : (
          <Button
            key={number}
            onClick={() => paginate(number)}
            variant={currentPage === number ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mx: 1 }}
            aria-label={`page ${number}`}
          >
            {number}
          </Button>
        )
      )}
      <Button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outlined"
        color="primary"
        sx={{ mx: 1 }}
        aria-label="next page"
      >
        Next
      </Button>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        variant="outlined"
        margin="normal"
        size="small"
        sx={{ width: 60, mx: 1 }}
        inputProps={{ 
          'aria-label': 'page number input', 
          type: 'number', 
          min: 1, 
          max: totalPages 
        }}
      />
      <Button
        onClick={handlePageJump}
        variant="outlined"
        color="primary"
        sx={{ mx: 1 }}
        aria-label="jump to page button"
      >
        Go
      </Button>
    </Box>
  );
};

export default Pagination;
