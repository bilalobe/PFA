import React from 'react';
import PropTypes from 'prop-types';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserListProps {
    users: User[];
}

function UserList({ users }: UserListProps) {
    return (
        <ul>
            {users.map((user) => (
                <li key={user.id}>
                    {user.name} - {user.email}
                </li>
            ))}
        </ul>
    );
}

UserList.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default UserList;