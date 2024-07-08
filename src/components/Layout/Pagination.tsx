import { Button, Typography, Box } from '@mui/material';
import { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  pageNumbers: (number | string)[];
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, paginate, pageNumbers }) => {
  return (
    <Box display="flex" justifyContent="center" mt={4}>
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
            key={index}
            onClick={() => paginate(number as number)}
            variant={number === currentPage ? 'contained' : 'outlined'}
            color="primary"
            sx={{ mx: 1 }}
            aria-label={`go to page ${number}`}
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
    </Box>
  );
};

export default Pagination;