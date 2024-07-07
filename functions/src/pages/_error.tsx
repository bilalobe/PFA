import { NextPage } from 'next';
import { ErrorProps } from 'next/error';
import { Container, Typography, Box } from '@mui/material';

// Example error component - adjust based on your UI/design preferences
const ErrorComponent = ({ statusCode }: { statusCode: number }) => {
  return (
    <Container>
      <Box textAlign="center" mt={5}>
        <Typography variant="h4" gutterBottom>
          {statusCode
            ? `An error ${statusCode} occurred on the server.`
            : 'An error occurred on the client.'}
        </Typography>
        <Typography variant="body1">
          Please try refreshing the page or going back to the previous page.
        </Typography>
      </Box>
    </Container>
  );
};

// Error page 
const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return <ErrorComponent statusCode={statusCode ?? 500} />;
};

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode: statusCode ?? 500 };
};

export default Error;