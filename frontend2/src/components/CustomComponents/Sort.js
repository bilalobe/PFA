import React from 'react';

function Sort({ value, onChange }) {
    return (
        <div>
            <select value={value.field} onChange={(e) => onChange({ ...value, field: e.target.value })}>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="date">Date</option>
                {/* Add more options if needed */}
            </select>
            <label>
                <input
                    type="checkbox"
                    checked={value.direction === 'desc'}
                    onChange={(e) => onChange({ ...value, direction: e.target.checked ? 'desc' : 'asc' })}
                />
                Descending
            </label>
        </div>
    );
}

export default Sort;