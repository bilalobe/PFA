import React, { useState } from 'react';
import { TextField, Button, CircularProgress, Box, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

interface VectorSearchProps {
  onResults: (results: any[]) => void;
}

export default function VectorSearchBox({ onResults }: VectorSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { currentUser } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    if (!currentUser) return;
    
    setLoading(true);
    
    try {
      const searchCoursesByVector = httpsCallable(functions, 'searchCoursesByVector');
      
      // Build filters
      const filters: Record<string, any> = {};
      if (difficulty) filters.difficulty = difficulty;
      if (selectedTags.length > 0) filters.tags = selectedTags;
      
      const result = await searchCoursesByVector({ 
        query,
        filters,
        limit: 20
      });
      
      onResults(result.data as any[]);
    } catch (error) {
      console.error('Search error:', error);
      // Show error notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSearch} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search courses by concept, topic, or question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mr: 1 }}
          InputProps={{
            endAdornment: loading ? <CircularProgress size={20} /> : null,
          }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading || !query.trim()}
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={difficulty || ''}
            onChange={(e) => setDifficulty(e.target.value as string)}
            label="Difficulty"
          >
            <MenuItem value=""><em>Any</em></MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>
        
        {/* You can add more filters here like tags, duration, etc. */}
      </Box>
    </Box>
  );
}