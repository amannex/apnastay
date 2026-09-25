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

export async function generateMetadata({ params }: CityPropertyPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const property = await resolveProperty(slug, city);

  if (!property) {
    return {
      title: 'Property Not Found | ApnaStay',
      description: 'The requested rental property could not be found.',
    };
  }

  const title = `${property.title} - ${property.pricing.rentDisplay}/mo in ${property.location.displayLocation} | ApnaStay`;
  const description = `Rent ${property.propertyTypeLabel} in ${property.location.displayLocation} with zero brokerage. Verified, physically audited, and direct owner lease.`;
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
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ApnaStay India',
      type: 'article',
      images: [
        {
          url: property.coverImage,
          width: 1200,
          height: 630,
          alt: property.title,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${siteConfig.url}/${property.location.city.toLowerCase()}/${property.slug}`,
    datePosted: '2026-07-01',
    offers: {
      '@type': 'Offer',
      price: property.pricing.monthlyRent,
      priceCurrency: 'INR',
      availability: property.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      validFrom: property.availability.availableFrom || '2026-07-01',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.displayLocation,
      addressLocality: property.location.city,
      addressRegion: property.location.state || undefined,
      addressCountry: 'IN',
    },
    image: property.images,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailContainer property={property} />
    </>
  );
}
