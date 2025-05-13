import React, { useState, useEffect, memo } from 'react';
import { FaStar } from 'react-icons/fa';
import './RatingStars.css';

interface RatingStarsProps {
  initialRating?: number;
  editable?: boolean;
  onRatingChange?: (rating: number) => void;
}

const RatingStars = memo(({ 
  initialRating = 0, 
  editable = false, 
  onRatingChange 
}: RatingStarsProps) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  // Update local state when initialRating prop changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (value: number) => {
    if (!editable) return;
    
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="rating-stars">
      {[...Array(5)].map((_, index) => {
        const value = index + 1;
        
        return (
          <FaStar
            key={index}
            className={`star ${value <= (hover || rating) ? 'filled' : 'empty'}`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => editable && setHover(value)}
            onMouseLeave={() => editable && setHover(0)}
            size={24}
          />
        );
      })}
      {rating > 0 && <span className="rating-value">{rating.toFixed(1)}</span>}
    </div>
  );
});

// Display name for debugging
RatingStars.displayName = 'RatingStars';

export default RatingStars;
