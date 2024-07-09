import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { UserForumPoints } from '../interfaces/types';

const LeaderboardPage = () => {
    const [leaderboardData, setLeaderboardData] = useState<UserForumPoints[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                // 1. Get the top 10 users with the most points
                const topUsersQuery = query(
                    collection(db, 'userForumPoints') as any,
                    orderBy('points', 'desc'),
                    limit(10)
                );
                const snapshot = await getDocs(topUsersQuery);

                // 2. Fetch user details
                const leaderboard = await Promise.all(
                    snapshot.docs.map(async (docSnapshot) => {
                        const pointsData = docSnapshot.data() as UserForumPoints;
                        const userDoc = await getDoc(doc(db, 'users', pointsData.user.id)); // Get the user document
                        if (userDoc.exists()) {
                            return {
                                ...pointsData,
                                user: userDoc.data() // Combine user data with the forum points data
                            };
                        } else {
                            console.error('User document not found for ID', pointsData.user);
                            return null;
                        }
                    })
                );

                // Filter out null results
                const filteredLeaderboard = leaderboard.filter(item => item !== null) as UserForumPoints[];

                // Update state with leaderboard data
                setLeaderboardData(filteredLeaderboard);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setError('An error occurred while fetching the leaderboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error">{error}</Alert>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Leaderboard
            </Typography>
            {/* ... You might want to add a description or other content here ... */}

            {/* Leaderboard List */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell align="right">Points</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaderboardData.map((leaderboardEntry, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell component="th" scope="row">
                                    {leaderboardEntry.user?.username}
                                </TableCell>
                                <TableCell align="right">{leaderboardEntry.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default LeaderboardPage;
