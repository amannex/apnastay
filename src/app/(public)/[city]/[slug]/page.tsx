import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { resolveProperty, getAllPropertyStaticParams } from '@/features/properties/adapter';
import { PropertyDetailContainer, PropertyErrorView } from '@/features/properties/components/detail';
import { STATIC_PROPERTIES } from '@/data/staticProperties';

interface CityPropertyPageProps {
  params: Promise<{ city: string; slug: string }>;
}

export async function generateStaticParams() {
  const all = await getAllPropertyStaticParams();
  return all.map((p) => ({
    city: p.city,
    slug: p.slug,
  }));
}

function buildSeoTitle(property: import('@/features/properties/adapter').NormalizedProperty): string {
  const parts: string[] = [];

  if (property.specs?.bedrooms) {
    parts.push(`${property.specs.bedrooms} BHK`);
  }

  if (property.specs?.furnishing) {
    const f = property.specs.furnishing.toLowerCase();
    if (f.includes('fully')) parts.push('Fully Furnished');
    else if (f.includes('semi')) parts.push('Semi Furnished');
    else if (f.includes('unfurnish')) parts.push('Unfurnished');
  }

  parts.push(property.propertyTypeLabel || 'Apartment');

  const loc = property.location.displayLocation || (
    property.location.locality && property.location.city && !property.location.locality.toLowerCase().includes(property.location.city.toLowerCase())
      ? `${property.location.locality}, ${property.location.city}`
      : property.location.locality || property.location.city || 'India'
  );

  return `${parts.join(' ')} in ${loc} | ApnaStay`;
}

export async function generateMetadata({ params }: CityPropertyPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const property = await resolveProperty(slug, city);

  if (!property) {
    return {
      title: 'Property Not Found | ApnaStay',
      description: 'The requested rental property could not be found on ApnaStay.',
    };
  }

  const title = buildSeoTitle(property);
  const bedText = property.specs?.bedrooms ? `${property.specs.bedrooms} BHK ` : '';
  const description = `Rent ${bedText}${property.propertyTypeLabel.toLowerCase()} in ${property.location.displayLocation} for ${property.pricing.rentDisplay}/mo with ₹0 brokerage. Verified 25-point engineering audit, direct owner lease, and high-speed Wi-Fi.`;
  const canonicalUrl = `${siteConfig.url}/${property.location.city.toLowerCase()}/${property.slug}`;

  return {
    title,
    description,
    keywords: [
      `${property.location.city.toLowerCase()} rentals`,
      `${city.toLowerCase()} flats for rent`,
      'zero brokerage flat india',
      'apnastay property',
      property.propertyTypeLabel.toLowerCase(),
      property.location.locality ? `${property.location.locality.toLowerCase()} flats` : '',
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ApnaStay India',
      locale: 'en_IN',
      type: 'article',
      images: [
        {
          url: property.coverImage,
          width: 1200,
          height: 630,
          alt: `${property.title} in ${property.location.displayLocation}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.coverImage],
      creator: '@apnastayindia',
    },
  };
}

export default async function CityPropertyPage({ params }: CityPropertyPageProps) {
  const { city, slug } = await params;
  let property: import('@/features/properties/adapter').NormalizedProperty | null = null;

  try {
    property = await resolveProperty(slug, city);
  } catch (err) {
    console.error('[CityPropertyPage] Error resolving property:', err);
    return (
      <PropertyErrorView
        title="We couldn't load this property."
        message="Please try again."
        type="error"
      />
    );
  }

  // Not Found State
  if (!property) {
    return (
      <PropertyErrorView
        title="Property not found"
        message="This property may have been removed or is no longer available."
        type="not_found"
      />
    );
  }

  // Removed / Unlisted Property State (offers alternatives)
  if (property.status === 'removed' || property.status === 'unlisted') {
    const alternatives = STATIC_PROPERTIES.filter(
      (p) => p.city?.toLowerCase() === city.toLowerCase() && p.id !== property.id
    );

    return (
      <PropertyErrorView
        title="This property is no longer available."
        type="removed"
        city={city}
        alternatives={alternatives}
      />
    );
  }

  const propertyLd = {
    '@type': ['RealEstateListing', 'Accommodation'],
    name: property.title,
    description: property.description,
    url: `${siteConfig.url}/${property.location.city.toLowerCase()}/${property.slug}`,
    datePosted: '2026-07-01',
    image: property.images,
    offers: {
      '@type': 'Offer',
      price: property.pricing.monthlyRent,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: property.pricing.monthlyRent,
        priceCurrency: 'INR',
        unitText: 'MONTH',
      },
      businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
      availability: property.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      validFrom: property.availability.availableFrom || '2026-07-01',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.displayLocation,
      addressLocality: property.location.city,
      addressRegion: property.location.state || undefined,
      postalCode: property.location.pincode || undefined,
      addressCountry: 'IN',
    },
    ...(property.location.latitude && property.location.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: property.location.latitude,
            longitude: property.location.longitude,
          },
        }
      : {}),
    ...(property.specs?.bedrooms ? { numberOfRooms: property.specs.bedrooms } : {}),
    ...(property.specs?.bathrooms ? { numberOfBathroomsTotal: property.specs.bathrooms } : {}),
    ...(property.specs?.sqft
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.specs.sqft,
            unitCode: 'FTK',
          },
        }
      : {}),
    ...(property.amenities?.length > 0
      ? {
          amenityFeature: property.amenities.map((a) => ({
            '@type': 'LocationFeatureSpecification',
            name: a.name,
            value: true,
          })),
        }
      : {}),
  };

  const breadcrumbLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: `${siteConfig.url}/properties`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: property.location.city,
        item: `${siteConfig.url}/properties?city=${encodeURIComponent(property.location.city.toLowerCase())}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: property.title,
        item: `${siteConfig.url}/${property.location.city.toLowerCase()}/${property.slug}`,
      },
    ],
  };

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [propertyLd, breadcrumbLd],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <PropertyDetailContainer property={property} />
    </>
  );
}
