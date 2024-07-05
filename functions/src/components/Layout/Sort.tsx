import React, { ChangeEvent } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';

interface SortProps {
    value: {
        field: string;
        direction: string;
    };
    onChange: (value: { field: string; direction: string }) => void;
}

function Sort({ value, onChange }: SortProps) {
    const handleFieldChange = (e: ChangeEvent<{ name?: string; value: unknown }>) => {
        onChange({ ...value, field: e.target.value as string });
    };

    const handleDirectionChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange({ ...value, direction: e.target.checked ? 'desc' : 'asc' });
    };

    return (
        <div>
            <FormControl variant="outlined" style={{ marginRight: '1rem' }}>
                <InputLabel>Field</InputLabel>
                <Select value={value.field} onChange={handleFieldChange} label="Field">
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="type">Type</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    {/* Add more options if needed */}
                </Select>
            </FormControl>
            <FormControlLabel
                control={
                    <Switch
                        checked={value.direction === 'desc'}
                        onChange={handleDirectionChange}
                        color="primary"
                    />
                }
                label="Descending"
            />
        </div>
    );
}

export default Sort;