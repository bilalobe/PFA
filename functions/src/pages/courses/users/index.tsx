import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState } from '../types'; // Import RootState type
import { fetchUsers, filterUsers, sortUsers } from '../actions/userActions';
import { Box, CircularProgress, FormControl, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import CustomPagination from '@/components/CustomComponents/Pagination.js';
import UserList from '@/components/Users/UserList';
import CustomSort from '@/components/CustomComponents/Sort';
import Alert from '@/components/CustomComponents/Alert';

function UsersPage() {
    const dispatch = useDispatch();
    const users = useSelector((state: RootState) => state.users.all);
    const loading = useSelector((state: RootState) => state.users.loading); // Provide RootState type for state parameter
    const error = useSelector((state: RootState) => state.users.error); // Provide RootState type for state parameter
    const sort = useSelector((state: RootState) => state.users.sort); // Provide RootState type for state parameter
    const [role, setRole] = useState('all');
    const [onlyAdmins, setOnlyAdmins] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        dispatch(filterUsers(search, filter, role, onlyAdmins));
    }, [dispatch, search, filter, role, onlyAdmins]);

    const handleSortChange = (newSort) => {
        dispatch(sortUsers(newSort));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!users.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="info">No users found</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4 }}>
            <CustomSort value={sort} onChange={handleSortChange} />
            <UserList users={users} />
            <CustomPagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={users.length}
                onPageChange={setCurrentPage}
            />
            <FormControl sx={{ marginTop: 2 }}>
                <InputLabel id="role-select-label">Role</InputLabel>
                <Select
                    labelId="role-select-label"
                    value={role}
                    onChange={(e) => {
                        setRole(e.target.value);
                        setCurrentPage(1); // Reset pagination when changing the role filter
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
                            setCurrentPage(1); // Reset pagination when changing the admin filter
                        }}
                    />
                }
                label="Show only admins"
                sx={{ marginTop: 2 }}
            />
        </Box>
    );
}
export default UsersPage;