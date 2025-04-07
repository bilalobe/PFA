import React, { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';

interface RatingProps {
  value: number;
  onChange?: (newValue: number) => void;
  readOnly?: boolean;
  precision?: 0.5 | 1;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  max?: number;
  label?: string;
}

const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  readOnly = false,
  precision = 1,
  size = 'medium',
  showValue = false,
  max = 5,
  label
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const getIconSize = () => {
    switch (size) {
      case 'small': return { width: 16, height: 16 };
      case 'large': return { width: 32, height: 32 };
      default: return { width: 24, height: 24 };
    }
  };
  
  const getColor = (index: number) => {
    const threshold = hoverValue !== null ? hoverValue : value;
    
    if (index + 1 <= threshold) {
      return 'primary.main';
    }
    
    if (precision === 0.5 && index + 0.5 <= threshold) {
      return 'primary.main';
    }
    
    return 'grey.400';
  };
  
  const getIcon = (index: number) => {
    const threshold = hoverValue !== null ? hoverValue : value;
    
    if (index + 1 <= threshold) {
      return <StarIcon sx={{ color: getColor(index), ...getIconSize() }} />;
    }
    
    if (precision === 0.5 && index + 0.5 <= threshold) {
      return <StarHalfIcon sx={{ color: getColor(index), ...getIconSize() }} />;
    }
    
    return <StarBorderIcon sx={{ color: getColor(index), ...getIconSize() }} />;
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readOnly) return;
    
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - left) / width;
    
    if (precision === 0.5) {
      setHoverValue(index + (percent >= 0.5 ? 1 : 0.5));
    } else {
      setHoverValue(index + 1);
    }
  };
  
  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    
    if (precision === 0.5 && value === index + 0.5) {
      onChange(index + 1);
    } else if (value === index + 1) {
      onChange(index);
    } else {
      onChange(hoverValue || index + 1);
    }
  };
  
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {label && <Typography variant="body2" color="text.secondary">{label}</Typography>}
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseLeave={() => !readOnly && setHoverValue(null)}
      >
        {Array.from({ length: max }, (_, index) => (
          <Box
            key={index}
            onClick={() => handleClick(index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            sx={{
              cursor: readOnly ? 'default' : 'pointer',
              display: 'inline-flex',
            }}
            role={readOnly ? undefined : 'button'}
            aria-label={`${index + 1} stars`}
          >
            {getIcon(index)}
          </Box>
        ))}
        {showValue && (
          <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
            {value} / {max}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default Rating;