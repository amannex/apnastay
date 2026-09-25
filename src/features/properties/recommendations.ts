// ============================================================================
// APNASTAY PROPERTY ENGINE — RECOMMENDATIONS & SIMILARITY SCORER (PHASE 10)
// Deterministic multi-factor similarity matching without fake properties or duplicates.
// Future-ready for personalized recommendations and AI matchmaker integration.
// ============================================================================

import { STATIC_PROPERTIES } from '@/data/staticProperties';
import { slugify, normalizeProperty } from './adapter';
import type { NormalizedProperty } from './adapter';

export interface SimilarityWeights {
  city: number;         // Priority 1: Same city (weight: 100)
  locality: number;     // Priority 2: Same locality/neighborhood (weight: 50)
  propertyType: number; // Priority 3: Same property type (weight: 40)
  price: number;        // Priority 4: Similar price range (weight: 30)
  bedrooms: number;     // Priority 5: Similar bedroom count (weight: 20)
  amenities: number;    // Priority 6: Overlapping key amenities (weight: 10)
}

export const DEFAULT_SIMILARITY_WEIGHTS: SimilarityWeights = {
  city: 100,
  locality: 50,
  propertyType: 40,
  price: 30,
  bedrooms: 20,
  amenities: 10
};

export interface RecommendationOptions {
  limit?: number;
  weights?: Partial<SimilarityWeights>;
  /** Future-ready hook: tenant preference filters */
  tenantPreferences?: {
    maxPrice?: number;
    preferredTypes?: string[];
    bachelorFriendlyOnly?: boolean;
  };
  /** Future-ready hook: AI Matchmaker vector / scores */
  aiScores?: Record<string, number>;
}

export interface ScoredProperty {
  property: any; // Raw or normalized
  score: number;
  matchReasons: string[];
}

/**
 * Calculates a multi-factor similarity score between a target property and candidate.
 */
export function calculateSimilarityScore(
  current: NormalizedProperty,
  candidate: any,
  weights: SimilarityWeights = DEFAULT_SIMILARITY_WEIGHTS
): ScoredProperty {
  let score = 0;
  const matchReasons: string[] = [];

  const currentCity = (current.location.city || '').toLowerCase().trim();
  const candCity = (candidate.city || candidate.location?.city || '').toLowerCase().trim();

  // 1. Same City (Highest Priority)
  if (currentCity && candCity && currentCity === candCity) {
    score += weights.city;
    matchReasons.push('Same City');
  }

  // 2. Same Locality / Neighborhood
  const currentLocality = (current.location.locality || current.location.displayLocation || '').toLowerCase();
  const candLocality = (candidate.neighborhood || candidate.location?.locality || candidate.location?.addressLine1 || '').toLowerCase();
  if (currentLocality && candLocality) {
    if (currentLocality.includes(candLocality) || candLocality.includes(currentLocality)) {
      score += weights.locality;
      matchReasons.push('Same Locality');
    }
  }

  // 3. Same Property Type
  const currentType = (current.propertyType || '').toLowerCase().replace(/[-_]/g, ' ');
  const candType = (candidate.propertyType || candidate.type || '').toLowerCase().replace(/[-_]/g, ' ');
  if (currentType && candType && currentType === candType) {
    score += weights.propertyType;
    matchReasons.push('Same Property Type');
  }

  // 4. Similar Price (within ±30% range)
  const currentRent = current.pricing.monthlyRent || 0;
  const candRent = Number(candidate.price ?? candidate.pricing?.monthlyRent ?? 0);
  if (currentRent > 0 && candRent > 0) {
    const diffRatio = Math.abs(candRent - currentRent) / currentRent;
    if (diffRatio <= 0.15) {
      score += weights.price;
      matchReasons.push('Very Similar Price (±15%)');
    } else if (diffRatio <= 0.30) {
      score += weights.price * 0.7;
      matchReasons.push('Similar Price (±30%)');
    } else if (diffRatio <= 0.50) {
      score += weights.price * 0.3;
    }
  }

  // 5. Similar Bedrooms
  const currentBedrooms = current.specs.bedrooms;
  const candBedrooms = candidate.specs?.bedrooms ?? candidate.bedrooms;
  if (typeof currentBedrooms === 'number' && typeof candBedrooms === 'number') {
    if (currentBedrooms === candBedrooms) {
      score += weights.bedrooms;
      matchReasons.push(`${candBedrooms} BHK Match`);
    } else if (Math.abs(currentBedrooms - candBedrooms) === 1) {
      score += weights.bedrooms * 0.5;
    }
  }

  // 6. Overlapping Key Amenities
  const currentAmenities = current.amenities.map((a) => a.name.toLowerCase());
  const rawCandAmenities = candidate.amenities || [];
  const candAmenityNames = rawCandAmenities.map((a: any) =>
    (typeof a === 'string' ? a : a.name || '').toLowerCase()
  );

  if (currentAmenities.length > 0 && candAmenityNames.length > 0) {
    const overlapCount = currentAmenities.filter((a) =>
      candAmenityNames.some((c: string) => c.includes(a) || a.includes(c))
    ).length;

    if (overlapCount > 0) {
      const overlapRatio = Math.min(1, overlapCount / 4);
      score += weights.amenities * overlapRatio;
    }
  }

  return {
    property: candidate,
    score,
    matchReasons
  };
}

/**
 * Returns prioritized, de-duplicated similar properties.
 * Guaranteed to exclude the current property and eliminate duplicates.
 */
export function getSimilarProperties(
  current: NormalizedProperty,
  pool: any[] = STATIC_PROPERTIES,
  options: RecommendationOptions = {}
): any[] {
  const limit = options.limit ?? 3;
  const weights = { ...DEFAULT_SIMILARITY_WEIGHTS, ...options.weights };

  const currentId = String(current.id).toLowerCase();
  const currentSlug = String(current.slug).toLowerCase();

  // Deduplication & self-exclusion map
  const seenIds = new Set<string>([currentId]);
  const seenSlugs = new Set<string>([currentSlug]);

  const scoredCandidates: ScoredProperty[] = [];

  for (const candidate of pool) {
    const candId = String(candidate.id || candidate.numericId || '').toLowerCase();
    const candSlug = slugify(candidate.title || candidate.slug || candId).toLowerCase();

    // 1. Exclude Current Property
    if (candId === currentId || candSlug === currentSlug) {
      continue;
    }

    // 2. Exclude Duplicates
    if (seenIds.has(candId) || seenSlugs.has(candSlug)) {
      continue;
    }

    const scored = calculateSimilarityScore(current, candidate, weights);

    // Only consider candidates with positive similarity relevance
    if (scored.score > 0) {
      scoredCandidates.push(scored);
      seenIds.add(candId);
      seenSlugs.add(candSlug);
    }
  }

  // Sort descending by similarity score
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Return top N recommendations
  return scoredCandidates.slice(0, limit).map((s) => s.property);
}
