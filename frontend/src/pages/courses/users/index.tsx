import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '../types';
import { fetchUsers, filterUsers, sortUsers } from '../actions/userActions';
import { Box, CircularProgress, FormControl, Select, MenuItem, FormControlLabel, Switch, InputLabel } from '@mui/material';
import CustomPagination from '@/components/CustomComponents/Pagination';
import UserList from '@/components/Users/UserList';
import CustomSort from '@/components/CustomComponents/Sort';
import Alert from '@/components/CustomComponents/Alert';
import axios from 'axios';

function UsersPage({ initialUsers, error: initialError }) {
    const dispatch = useDispatch();
    const { all: usersFromRedux, loading, error: reduxError, sort } = useSelector((state: RootState) => state.users);
    const [users, setUsers] = useState(initialUsers);
    const [role, setRole] = useState('all');
    const [onlyAdmins, setOnlyAdmins] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        dispatch(filterUsers(role, onlyAdmins));
    }, [dispatch, role, onlyAdmins]);

    const handleSortChange = (newSort) => {
        dispatch(sortUsers(newSort));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const errorToShow = reduxError || initialError;
    if (errorToShow) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Alert severity="error">{errorToShow}</Alert>
            </Box>
        );
    }

    if (!users.length) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Alert severity="info">No users found</Alert>
            </Box>
        );
    }

    return (
        <Box padding={4}>
            <CustomSort value={sort} onChange={handleSortChange} />
            <UserList users={users} />
            <CustomPagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={users.length}
                onPageChange={setCurrentPage}
            />
            <FormControl marginTop={2}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        setCurrentPage(1); // Reset pagination on role change
                    }}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                </Select>
            </FormControl>
            <FormControlLabel
                control={
                    <Switch
                        checked={onlyAdmins}
                        onChange={(e) => {
                            setOnlyAdmins(e.target.checked);
                            setCurrentPage(1); // Reset pagination on admin filter change
                        }}
                    />
                }
                label="Show only admins"
                marginTop={2}
            />
        </Box>
    );
}

export async function getServerSideProps() {
    try {
        const res = await axios.get('http://localhost:3000/api/users');
        return {
            props: {
                initialUsers: res.data.users,
            },
        };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return {
            props: {
                initialUsers: [],
                error: "Failed to load user data.",
            },
        };
    }
}

export default UsersPage;