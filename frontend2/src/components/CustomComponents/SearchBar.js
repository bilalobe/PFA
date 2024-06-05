import React from 'react';
import StyledButton from './StyledButton';
import StyledInput from './StyledInput';
import StyledSelect from './StyledSelect';

class SearchBar extends React.Component {
  state = {
    searchTerm: '',
    filter: '',
  };

  handleInputChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSelectChange = (event) => {
    this.setState({ filter: event.target.value });
  };

  handleSearch = () => {
    this.props.onSearch(this.state.searchTerm, this.state.filter);
  };

  render() {
    return (
        <div>
            <StyledInput
                value={this.state.searchTerm}
                onChange={this.handleInputChange}
                placeholder="Search..."
            />
            <StyledSelect value={this.state.filter} onChange={this.handleSelectChange}>
                <>
                    {this.props.filters.map((filter) => {
                        return (
                            <option key={filter} value={filter}>
                                {filter}
                            </option>
                        );
                    })}
                </>
                <option value="">Filter...</option>
            </StyledSelect>
            <StyledButton onClick={this.handleSearch}>Search</StyledButton>
        </div>
    );
  }
}

export default SearchBar;