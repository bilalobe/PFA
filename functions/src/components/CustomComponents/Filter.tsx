import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function Filter({ value, onChange }) {
    return (
        <FormControl variant="outlined" style={{ minWidth: 120 }}>
            <InputLabel id="filter-label">Role</InputLabel>
            <Select
                labelId="filter-label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                label="Role"
            >
                <MenuItem value="">
                    <em>All</em>
                </MenuItem>
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="teacher">Teacher</MenuItem>
                <MenuItem value="crew">Crew</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Filter;