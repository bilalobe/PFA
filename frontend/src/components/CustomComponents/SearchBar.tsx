import { TextField, Button, Select, MenuItem, Box, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/system';
import React, { ChangeEvent, FC, FormEvent } from 'react';

interface SearchBarProps {
  filters: string[];
  onSearch: (searchTerm: string, filter: string) => void;
}

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1] as string[],
}));

const SearchBar: FC<SearchBarProps> = ({ filters, onSearch }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState(filters[0]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectChange = (event: ChangeEvent<{ value: unknown }>) => {
    setFilter(event.target.value as string);
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm, filter);
  };

  return (
    <form onSubmit={handleSearch}>
      <StyledBox display="flex" gap={2} alignItems="center">
        <TextField
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search..."
          variant="outlined"
        />
        <FormControl variant="outlined">
          <InputLabel id="filter-label">Filter</InputLabel>
          <Select labelId="filter-label" value={filter} onChange={handleSelectChange} label="Filter">
            {filters.map((filter) => (
              <MenuItem key={filter} value={filter}>
                {filter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit">
          Search
        </Button>
      </StyledBox>
    </form>
  );
};

export default SearchBar;