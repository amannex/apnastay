import React from 'react';
import ExploreCities from './ExploreCities';

interface CitiesCarouselProps {
  onCityClick?: (city: string) => void;
  selectedCity?: string;
}

export default function CitiesCarousel({ onCityClick, selectedCity }: CitiesCarouselProps) {
  return <ExploreCities selectedCity={selectedCity} onSelectCity={onCityClick} />;
}
