"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link'
import StarRating from './StarRating'

interface RateProps {
  translations: {
    rate: {
      title: string;
      thankYou: string;
      error: string;
    };
  };
}

export default function Rate({ translations }: RateProps) {
  const [overallRating, setOverallRating] = useState<number>(5.0)
  const [message, setMessage] = useState('');

  const handleRatingChange = (rating: number) => {
    setOverallRating(rating);
    // Here you would typically send the rating to your backend
    // For this example, we'll just set a thank you message
    setMessage(translations.rate.thankYou);
  };

  return (
    <section className="section pt-7">
      <div className="container">
        <div className="content text-center"> 
          <h2 className="mb-4">{translations.rate.title}</h2>
          <StarRating 
            rating={overallRating} 
            onRatingChange={handleRatingChange} 
          />
          {message && <p className="mt-4">{message}</p>}
        </div>
      </div>
    </section>
  )
}