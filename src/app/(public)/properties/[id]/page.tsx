import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { resolveProperty, getAllPropertyStaticParams } from '@/features/properties/adapter';
import { PropertyDetailContainer, PropertyErrorView } from '@/features/properties/components/detail';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const all = await getAllPropertyStaticParams();
  return all.map((p) => ({
    id: p.id,
  }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await resolveProperty(id);

  if (!property) {
    return {
      title: 'Property Not Found | ApnaStay',
      description: 'The requested rental property could not be found or is no longer available.',
    };
  }

  const title = `${property.title} - ${property.pricing.rentDisplay}/mo in ${property.location.displayLocation} | ApnaStay`;
  const description = `Rent ${property.propertyTypeLabel} in ${property.location.displayLocation} with zero brokerage. Physically verified with 100% verified ownership.`;
  const canonicalUrl = `${siteConfig.url}/properties/${property.id}`;

  return {
    title,
    description,
    keywords: [
      `${property.location.city.toLowerCase()} rentals`,
      'zero brokerage flat india',
      'apnastay verified residence',
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

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await resolveProperty(id);

  if (!property) {
    return (
      <PropertyErrorView
        title="Property Not Found"
        message={`We could not find any property matching ID "${id}". It may have been unlisted, rented, or removed.`}
        type="not_found"
      />
    );
  }

  if (property.status === 'removed' || property.status === 'unlisted') {
    return (
      <PropertyErrorView
        title="This property is no longer available."
        type="removed"
        city={property.location.city}
      />
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    url: `${siteConfig.url}/properties/${property.id}`,
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
