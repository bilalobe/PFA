import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { ChartOptions, Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';

// Register the chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardAnalytics: React.FC = () => {
  const [registrationChartData, setRegistrationChartData] = useState({
    labels: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    datasets: [
      {
        label: 'Registrations',
        data: [0, 0, 0, 0], // Adjusted initialization to match 'number[]'
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });
  const [enrollmentChartData, setEnrollmentChartData] = useState({
    labels: ['Course 1', 'Course 2', 'Course 3', 'Course 4'],
    datasets: [
      {
        label: 'Enrollments',
        data: [0, 0, 0, 0], // Adjusted initialization to match 'number[]'
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  });
  const [quizPerformanceData, setQuizPerformanceData] = useState({
    labels: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'],
    datasets: [
      {
        label: 'Quiz Scores',
        data: [0, 0, 0, 0], // Adjusted initialization to match 'number[]'
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });
  const [forumActivityData, setForumActivityData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Posts',
        data: [0, 0, 0, 0], // Adjusted initialization to match 'number[]'
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  });

  const dataByTimeRange: { [key: string]: { [key: string]: number[] } } = {
    week: {
      registration: [5, 10, 15, 20],
      enrollment: [50, 40, 60, 70],
      quiz: [80, 85, 90, 95],
      forum: [5, 10, 15, 20],
    },
    month: {
      registration: [30, 45, 60, 75],
      enrollment: [200, 150, 300, 250],
      quiz: [85, 90, 78, 88],
      forum: [10, 15, 8, 12],
    },
    year: {
      registration: [300, 450, 600, 750],
      enrollment: [2000, 1500, 3000, 2500],
      quiz: [850, 900, 780, 880],
      forum: [100, 150, 80, 120],
    },
  };

  const [timeRange, setTimeRange] = useState('week');

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    const data = dataByTimeRange[range];
    setRegistrationChartData({
      ...registrationChartData,
      datasets: [
        {
          ...registrationChartData.datasets[0],
          data: data.registration,
        },
      ],
    });
    setEnrollmentChartData({
      ...enrollmentChartData,
      datasets: [
        {
          ...enrollmentChartData.datasets[0],
          data: data.enrollment,
        },
      ],
    });
    setQuizPerformanceData({
      ...quizPerformanceData,
      datasets: [
        {
          ...quizPerformanceData.datasets[0],
          data: data.quiz,
        },
      ],
    });
    setForumActivityData({
      ...forumActivityData,
      datasets: [
        {
          ...forumActivityData.datasets[0],
          data: data.forum,
        },
      ],
    });
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const TimeRangeSelector = ({ onSelect }: { onSelect: (range: string) => void }) => (
    <div>
      <Button onClick={() => onSelect('week')}>Last Week</Button>
      <Button onClick={() => onSelect('month')}>Last Month</Button>
      <Button onClick={() => onSelect('year')}>Last Year</Button>
    </div>
  );

  return (
    <Box>
      <TimeRangeSelector onSelect={handleTimeRangeChange} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Registrations Over Time
              </Typography>
              <Line data={registrationChartData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Course Enrollments
              </Typography>
              <Bar data={enrollmentChartData} options={chartOptions as ChartOptions<'bar'>} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Performance
              </Typography>
              <Bar data={quizPerformanceData} options={chartOptions as ChartOptions<'bar'>} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Forum Activity
              </Typography>
              <Line data={forumActivityData} options={chartOptions} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;
