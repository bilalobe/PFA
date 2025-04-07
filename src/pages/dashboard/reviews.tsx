import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack,
  Rating,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Search as SearchIcon,
  Flag as FlagIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, orderBy, limit, startAfter, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Review, Course } from '../../interfaces/types';
import parse from 'html-react-parser';
import { format } from 'date-fns';

// Interface for review with course details
interface ReviewWithCourse extends Review {
  courseName?: string;
}

// Tab panel component for different review statuses
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DashboardReviews = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // States
  const [reviews, setReviews] = useState<ReviewWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [reviewToView, setReviewToView] = useState<Review | null>(null);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  
  // Filtering and pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterCourse, setFilterCourse] = useState<string>("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("dateCreated_desc");
  const [tabValue, setTabValue] = useState(0);

  // Tab states for different review categories
  const [pendingReviews, setPendingReviews] = useState<ReviewWithCourse[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<ReviewWithCourse[]>([]);
  const [reportedReviews, setReportedReviews] = useState<ReviewWithCourse[]>([]);

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    reportedReviews: 0,
    averageRating: 0
  });

  // Fetch courses for the filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('title'));
        const querySnapshot = await getDocs(q);
        
        const fetchedCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
        });
        
        setCourses(fetchedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses for filtering.");
      }
    };

    fetchCourses();
  }, []);

  // Fetch reviews with filtering
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let reviewsQuery = collection(db, 'reviews');
      let constraints = [];
      
      // Apply filters
      if (filterCourse) {
        constraints.push(where('courseId', '==', filterCourse));
      }
      
      if (filterRating !== null) {
        constraints.push(where('rating', '==', filterRating));
      }
      
      // Apply sorting
      const [sortField, sortDirection] = sortBy.split('_');
      
      let q;
      if (constraints.length > 0) {
        q = query(
          reviewsQuery,
          ...constraints,
          orderBy(sortField, sortDirection === 'desc' ? 'desc' : 'asc')
        );
      } else {
        q = query(
          reviewsQuery,
          orderBy(sortField, sortDirection === 'desc' ? 'desc' : 'asc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      let fetchedReviews: ReviewWithCourse[] = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });

      // Search by content if needed
      if (searchQuery) {
        fetchedReviews = fetchedReviews.filter(review => 
          review.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.userDisplayName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Add course names to reviews
      const reviewsWithCourses = await Promise.all(
        fetchedReviews.map(async (review) => {
          try {
            const courseDoc = await getDocs(query(collection(db, 'courses'), where('id', '==', review.courseId)));
            let courseName = "Unknown Course";
            courseDoc.forEach((doc) => {
              courseName = doc.data().title || "Unknown Course";
            });
            return { ...review, courseName };
          } catch (err) {
            return { ...review, courseName: "Unknown Course" };
          }
        })
      );

      // Set all reviews and filtered categories
      setReviews(reviewsWithCourses);
      
      // Separate reviews by status
      const pending = reviewsWithCourses.filter(r => r.approved === false);
      const approved = reviewsWithCourses.filter(r => r.approved === true && !r.reported);
      const reported = reviewsWithCourses.filter(r => r.reported === true);
      
      setPendingReviews(pending);
      setApprovedReviews(approved);
      setReportedReviews(reported);

      // Calculate statistics
      const totalReviews = reviewsWithCourses.length;
      const totalRating = reviewsWithCourses.reduce((sum, review) => sum + review.rating, 0);
      
      setStats({
        totalReviews,
        pendingReviews: pending.length,
        reportedReviews: reported.length,
        averageRating: totalReviews > 0 ? totalRating / totalReviews : 0
      });
      
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchReviews();
  }, [filterCourse, filterRating, sortBy, searchQuery]);

  // Admin authorization check
  useEffect(() => {
    if (user && user.user_type !== 'admin' && user.user_type !== 'teacher' && user.user_type !== 'supervisor') {
      router.push('/');
    }
  }, [user, router]);

  // Dialog handlers
  const handleDeleteReview = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteDialog(true);
  };

  const handleEditReview = (review: Review) => {
    setReviewToEdit(review);
    setShowEditDialog(true);
  };

  const handleViewReview = (review: Review) => {
    setReviewToView(review);
    setShowViewDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (reviewToDelete) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewToDelete.id));
        setReviews(reviews.filter(r => r.id !== reviewToDelete.id));
        setShowDeleteDialog(false);
        fetchReviews(); // Refresh data after delete
      } catch (err) {
        console.error("Error deleting review:", err);
        setError("Failed to delete review.");
      }
    }
  };

  // Approve or reject reviews
  const handleApproveReview = async (review: Review) => {
    try {
      const reviewRef = doc(db, 'reviews', review.id);
      await updateDoc(reviewRef, {
        approved: true,
        dateUpdated: Timestamp.now()
      });
      fetchReviews(); // Refresh data
    } catch (err) {
      console.error("Error approving review:", err);
      setError("Failed to approve review.");
    }
  };

  const handleRejectReview = async (review: Review) => {
    try {
      const reviewRef = doc(db, 'reviews', review.id);
      await updateDoc(reviewRef, {
        approved: false,
        dateUpdated: Timestamp.now()
      });
      fetchReviews(); // Refresh data
    } catch (err) {
      console.error("Error rejecting review:", err);
      setError("Failed to reject review.");
    }
  };

  // Handle reported reviews
  const handleResolveReport = async (review: Review) => {
    try {
      const reviewRef = doc(db, 'reviews', review.id);
      await updateDoc(reviewRef, {
        reported: false,
        dateUpdated: Timestamp.now()
      });
      fetchReviews(); // Refresh data
    } catch (err) {
      console.error("Error resolving report:", err);
      setError("Failed to resolve report.");
    }
  };

  // Handle review edit submission
  const handleReviewEditSubmit = async () => {
    if (reviewToEdit) {
      try {
        const reviewRef = doc(db, 'reviews', reviewToEdit.id);
        await updateDoc(reviewRef, {
          title: reviewToEdit.title,
          content: reviewToEdit.content,
          rating: reviewToEdit.rating,
          dateUpdated: Timestamp.now()
        });
        setShowEditDialog(false);
        fetchReviews(); // Refresh data after edit
      } catch (err) {
        console.error("Error updating review:", err);
        setError("Failed to update review.");
      }
    }
  };

  // Handle review edit field changes
  const handleReviewEditChange = (field: string, value: string | number) => {
    if (reviewToEdit) {
      setReviewToEdit({
        ...reviewToEdit,
        [field]: value
      });
    }
  };

  // Pagination handlers
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Tab change handler
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 100px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display reviews table for a specific tab
  const renderReviewsTable = (reviewsList: ReviewWithCourse[]) => {
    // Apply pagination to the current tab's data
    const paginatedReviews = reviewsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return (
      <>
        <TableContainer component={Paper}>
          <Table aria-label="reviews table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      {review.dateCreated ? format(review.dateCreated.toDate(), 'MMM dd, yyyy') : 'Unknown'}
                    </TableCell>
                    <TableCell>{review.courseName || "Unknown Course"}</TableCell>
                    <TableCell>{review.userDisplayName || "Anonymous"}</TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" precision={0.5} />
                    </TableCell>
                    <TableCell>{review.title || "No title"}</TableCell>
                    <TableCell>
                      {review.reported ? (
                        <Chip label="Reported" color="error" size="small" />
                      ) : review.approved ? (
                        <Chip label="Approved" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewReview(review)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {!review.approved && (
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApproveReview(review)}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {review.approved && (
                          <Tooltip title="Reject">
                            <IconButton size="small" color="warning" onClick={() => handleRejectReview(review)}>
                              <VisibilityOffIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {review.reported && (
                          <Tooltip title="Resolve Report">
                            <IconButton size="small" color="info" onClick={() => handleResolveReport(review)}>
                              <FlagIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleEditReview(review)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteReview(review)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No reviews found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={reviewsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Review Management
      </Typography>
      
      {/* Dashboard Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reviews
              </Typography>
              <Typography variant="h5" component="div">
                {stats.totalReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Reviews
              </Typography>
              <Typography variant="h5" component="div" color="warning.main">
                {stats.pendingReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Reported Reviews
              </Typography>
              <Typography variant="h5" component="div" color="error.main">
                {stats.reportedReviews}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" component="div" sx={{ mr: 1 }}>
                  {stats.averageRating.toFixed(1)}
                </Typography>
                <Rating value={stats.averageRating} readOnly precision={0.1} size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search reviews"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Filter by Course"
              variant="outlined"
              fullWidth
              size="small"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <MenuItem value="">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Filter by Rating"
              variant="outlined"
              fullWidth
              size="small"
              value={filterRating !== null ? filterRating : ''}
              onChange={(e) => setFilterRating(e.target.value === '' ? null : Number(e.target.value))}
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value={5}>5 Stars</MenuItem>
              <MenuItem value={4}>4 Stars</MenuItem>
              <MenuItem value={3}>3 Stars</MenuItem>
              <MenuItem value={2}>2 Stars</MenuItem>
              <MenuItem value={1}>1 Star</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Sort By"
              variant="outlined"
              fullWidth
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="dateCreated_desc">Newest First</MenuItem>
              <MenuItem value="dateCreated_asc">Oldest First</MenuItem>
              <MenuItem value="rating_desc">Highest Rating</MenuItem>
              <MenuItem value="rating_asc">Lowest Rating</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={1}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => {
                setFilterCourse("");
                setFilterRating(null);
                setSearchQuery("");
                setSortBy("dateCreated_desc");
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Tabs for different review statuses */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="review status tabs">
          <Tab label={`All Reviews (${reviews.length})`} />
          <Tab label={`Pending (${pendingReviews.length})`} />
          <Tab label={`Approved (${approvedReviews.length})`} />
          <Tab label={`Reported (${reportedReviews.length})`} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {renderReviewsTable(reviews)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderReviewsTable(pendingReviews)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {renderReviewsTable(approvedReviews)}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        {renderReviewsTable(reportedReviews)}
      </TabPanel>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Review Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Edit Review</DialogTitle>
        <DialogContent>
          {reviewToEdit ? (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Review Title"
                variant="outlined"
                fullWidth
                margin="normal"
                value={reviewToEdit.title || ''}
                onChange={(e) => handleReviewEditChange('title', e.target.value)}
              />
              
              <Box sx={{ my: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  name="review-rating"
                  value={reviewToEdit.rating}
                  precision={0.5}
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      handleReviewEditChange('rating', newValue);
                    }
                  }}
                />
              </Box>
              
              <TextField
                label="Review Content"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                margin="normal"
                value={reviewToEdit.content || ''}
                onChange={(e) => handleReviewEditChange('content', e.target.value)}
              />
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleReviewEditSubmit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Review Dialog */}
      <Dialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {reviewToView?.title || "Review Details"}
        </DialogTitle>
        <DialogContent>
          {reviewToView && (
            <>
              <Box sx={{ mb: 2 }}>
                <Rating value={reviewToView.rating} readOnly precision={0.5} />
                <Typography variant="subtitle2" color="textSecondary">
                  By {reviewToView.userDisplayName || "Anonymous"} • 
                  {reviewToView.dateCreated && 
                    format(reviewToView.dateCreated.toDate(), ' MMMM dd, yyyy')}
                </Typography>
              </Box>
              
              <Typography variant="body1" component="div">
                {reviewToView.content && parse(reviewToView.content)}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  Status: {' '}
                  {reviewToView.reported ? (
                    <Chip label="Reported" color="error" size="small" />
                  ) : reviewToView.approved ? (
                    <Chip label="Approved" color="success" size="small" />
                  ) : (
                    <Chip label="Pending" color="warning" size="small" />
                  )}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          
          {reviewToView && !reviewToView.approved && (
            <Button 
              onClick={() => {
                handleApproveReview(reviewToView);
                setShowViewDialog(false);
              }}
              color="success"
            >
              Approve
            </Button>
          )}
          
          {reviewToView && reviewToView.reported && (
            <Button 
              onClick={() => {
                handleResolveReport(reviewToView);
                setShowViewDialog(false);
              }}
              color="info"
            >
              Resolve Report
            </Button>
          )}
          
          <Button 
            onClick={() => {
              if (reviewToView) {
                handleDeleteReview(reviewToView);
                setShowViewDialog(false);
              }
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardReviews;