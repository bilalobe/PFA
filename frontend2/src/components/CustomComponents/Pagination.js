import { Box, Button, Typography } from '@mui/material';

const CustomPagination = ({ currentPage, totalPages, paginate }) => {

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
            key={index}
            onClick={() => paginate(number)}
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

export default CustomPagination;

export const getServerSideProps = async (context) => {
    // Fetch data and calculate totalPages based on your data
    const totalPages = 10;
    const currentPage = context.query.page || 1;

    return {
        props: {
            currentPage,
            totalPages,
        },
    };
};