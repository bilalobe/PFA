import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchUsers, filterUsers, sortUsers } from '../actions/userActions';
import { CircularProgress, FormControl, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import CustomPagination from '../CustomComponents/Pagination.js';
import UserList from '../src/components/CustomComponents/components/UserList';
import CustomSort from '../CustomComponents/CustomSort';

function UsersPage() {
    const dispatch = useDispatch();
    const users = useSelector((state) => state.users.all);
    const loading = useSelector((state) => state.users.loading);
    const error = useSelector((state) => state.users.error);
    const sort = useSelector((state) => state.users.sort);
    const [role, setRole] = useState('all');
    const [onlyAdmins, setOnlyAdmins] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
        return <CircularProgress />;
    }

    return (
        <div>
            <CustomSort value={sort} onChange={handleSortChange} />
            <UserList users={users} />
            <CustomPagination 
                currentPage={currentPage} 
                itemsPerPage={itemsPerPage} 
                totalItems={users.length} 
                onPageChange={setCurrentPage} 
            />
            <FormControl>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                </Select>
            </FormControl>
            <FormControlLabel
                control={<Switch checked={onlyAdmins} onChange={(e) => setOnlyAdmins(e.target.checked)} />}
                label="Show only admins"
            />
        </div>
    );
}

export default UsersPage;