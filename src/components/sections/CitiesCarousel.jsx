import React from 'react';
import ExploreCities from './ExploreCities';

export default function CitiesCarousel({ onCityClick }) {
  return <ExploreCities selectedCity="all" onSelectCity={onCityClick} />;
}
