import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STATIC_PROPERTIES } from '../../../data/staticProperties';
import PropertyDetailPage from '../../../views/PropertyDetailPage';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return STATIC_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = STATIC_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    return {
      title: 'Property Not Found | OwnStay',
      description: 'The requested rental property could not be found.',
    };
  }

  const titleText = property.title || 'Verified Residence';
  const priceNum = Number(property.price || 16500);
  const neighborhoodText = property.neighborhood || property.location || 'Indore';
  const cityText = property.city || 'Indore';
  const roomTypeText = property.roomType || property.type || '1BHK Residence';
  const imageSrc = property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  const title = `${titleText} - ₹${priceNum.toLocaleString()}/mo in ${neighborhoodText}`;
  const description = `Rent ${roomTypeText} in ${neighborhoodText}, ${cityText} with zero brokerage. Verified NFC smart-lock self-tour, high-speed fiber Wi-Fi, and ₹0 commission.`;
  const canonicalUrl = `https://ownstay-eight.vercel.app/properties/${property.id}`;

  return {
    title,
    description,
    keywords: [
      `${cityText.toLowerCase()} rentals`,
      `${neighborhoodText.toLowerCase()} apartments`,
      'zero brokerage flat india',
      'ownstay property',
      roomTypeText.toLowerCase(),
    ],
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'OwnStay India',
      type: 'article',
      images: [
        {
          url: imageSrc,
          width: 1200,
          height: 630,
          alt: titleText,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageSrc],
      creator: '@ownstayindia',
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = STATIC_PROPERTIES.find((p) => p.id === id);

  if (!property) {
    notFound();
  }

  const titleText = property.title || 'Verified Residence';
  const priceNum = Number(property.price || 16500);
  const neighborhoodText = property.neighborhood || property.location || 'Indore';
  const cityText = property.city || 'Indore';
  const imageSrc = property.images?.[0] || property.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: titleText,
    description: `Zero-brokerage rental residence located in ${neighborhoodText}, ${cityText}.`,
    url: `https://ownstay-eight.vercel.app/properties/${property.id}`,
    datePosted: '2026-07-01',
    offers: {
      '@type': 'Offer',
      price: priceNum,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validFrom: '2026-07-01',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: neighborhoodText,
      addressLocality: cityText,
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: property.rating || 4.9,
      reviewCount: property.reviewsCount || 20,
    },
    image: property.images || [imageSrc],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetailPage property={property} />
    </>
  );
}
