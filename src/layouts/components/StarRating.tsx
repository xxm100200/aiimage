import React from 'react';
import './StarRating.css';

interface StarRatingProps {
    rating: number; // 评分值，例如4.5
    onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
    const handleClick = (value: number) => {
        onRatingChange(value);
    };

    return (
        <div className="star-rating-wrapper">
            <div className="star-rating-main">
                {/* 背景层：显示空心星星 */}
                <div className="star-rating-background">
                    {[...Array(5)].map((_, index) => (
                        <span key={index} className="star">&#9733;</span>
                    ))}
                </div>
                
                {/* 前景层：显示填充的金色星星，根据评分调整宽度 */}
                <div className="star-rating-foreground" style={{ width: `${(rating / 5) * 100}%` }}>
                    {[...Array(5)].map((_, index) => (
                        <span key={index} className="star">&#9733;</span>
                    ))}
                </div>
                
                {/* 覆盖层：捕捉用户点击事件，实现半星和全星评分 */}
                <div className="star-rating-overlay">
                    {[...Array(10)].map((_, index) => (
                        <div
                            key={index}
                            className="star-overlay"
                            onClick={() => handleClick((index + 1) * 0.5)}
                        ></div>
                    ))}
                </div>
            </div>
            {/* 显示评分数值 */}
            <div className="rating-value">
                {rating.toFixed(1)}/5
            </div>
            {/* 显示评论数 */}
            <div className="rating-reviews">
                
            </div>
        </div>
    );
};

export default StarRating;