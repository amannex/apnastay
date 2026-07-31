export interface Owner {
  name: string;
  phone?: string;
  responseTime?: string;
  verified?: boolean;
  avatar?: string;
  role?: string;
  [key: string]: any;
}

export interface AmenityObject {
  name: string;
  icon: string;
  verified?: boolean;
  [key: string]: any;
}

export interface Property {
  id: string;
  title?: string;
  price?: number | string;
  location?: string;
  city?: string;
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  verified?: boolean;
  rating?: number;
  reviewsCount?: number;
  brokerage?: string;
  securityDeposit?: string;
  availableFrom?: string;
  acousticsDecibels?: number;
  wifiSpeedMbps?: number;
  metroDistanceMin?: number;
  naturalLightScore?: number;
  image?: string;
  images?: string[];
  amenities?: (string | AmenityObject)[];
  owner?: Owner;
  description?: string;
  [key: string]: any;
}

export interface City {
  id: string;
  name: string;
  state?: string;
  count?: string | number;
  listings?: string | number;
  image: string;
  tag?: string;
  tagline?: string;
  livabilityScore?: number;
  avgRent?: string;
  description?: string;
  [key: string]: any;
}

export interface BlogPostAuthor {
  name: string;
  role?: string;
  avatar?: string;
  [key: string]: any;
}

export interface BlogPost {
  id: string | number;
  title: string;
  excerpt: string;
  date: string;
  author: string | BlogPostAuthor;
  category: string;
  readTime: string;
  image?: string;
  imageUrl?: string;
  slug: string;
  content?: string;
  [key: string]: any;
}

export interface SearchFilterState {
  location: string;
  priceRange: string;
  bedrooms: string;
  propertyType: string;
  moveInDate?: string;
  verifiedOnly?: boolean;
  [key: string]: any;
}
