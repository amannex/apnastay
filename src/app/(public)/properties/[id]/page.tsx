import { siteConfig } from '@/config/site';
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { STATIC_PROPERTIES } from '@/data/staticProperties';
import { getPublicProperty } from '@/features/properties/api';
import PropertyDetailPage from '@/views/PropertyDetailPage';

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

async function resolveProperty(id: string) {
  const staticFound = STATIC_PROPERTIES.find((p) => p.id === id);
  if (staticFound) return staticFound;

  try {
    const rawId = id.replace(/^prop-/, '');
    const res = await getPublicProperty(id);
    const data = (res.success && res.data ? res.data : (await getPublicProperty(rawId)).data) as any;
    if (data) {
      const photoUrls = (data.photos || [])
        .map((p: any) => (typeof p === 'string' ? p : p.url))
        .filter(Boolean);

      const images =
        photoUrls.length > 0
          ? photoUrls
          : data.coverPhotoUrl
          ? [data.coverPhotoUrl]
          : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

      const city = data.location?.city || data.city || 'Jhansi';
      const locality = data.location?.locality || data.location?.addressLine1 || '';
      const neighborhood = locality ? `${locality}, ${city}` : city;
      const price = Number(data.pricing?.monthlyRent || data.rent || data.price || 7000);

      const rawAmenities = data.amenities || [];
      const amenities = rawAmenities.map((a: any) =>
        typeof a === 'string' ? { name: a.replace(/_/g, ' '), icon: 'ShieldCheck', verified: true } : a
      );

      return {
        id,
        title: data.title || 'Verified Property',
        description: data.description || 'Verified accommodation with zero brokerage.',
        neighborhood,
        city,
        price,
        rating: 4.95,
        reviewsCount: 15,
        images,
        amenities:
          amenities.length > 0
            ? amenities
            : [
                { name: 'Zero Brokerage', icon: 'ShieldCheck', verified: true },
                { name: 'Verified Amenities', icon: 'ShieldCheck', verified: true }
              ],
        roomType: data.propertyType ? data.propertyType.replace(/_/g, ' ').toUpperCase() : 'Apartment',
        type: data.propertyType || 'apartment',
        costBreakdown: {
          monthlyRent: price,
          maintenance: data.pricing?.maintenanceCharges || 0,
          brokerage: 0,
          securityDeposit: data.pricing?.securityDeposit || price * 2,
          totalMoveIn: price + (data.pricing?.securityDeposit || price * 2)
        },
        specs: {
          bedrooms: 1,
          bathrooms: 1,
          sqft: 650,
          floor: 'Ground Floor',
          furnishing: 'Standard'
        },
        owner: {
          name: 'Verified Partner',
          role: 'Verified ApnaStay Partner',
          responseTime: 'Under 10 mins',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        }
      } as any;
    }
  } catch (err) {
    // Ignore error and fall through
  }

  return null;
}

export async function generateStaticParams() {
  return STATIC_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await resolveProperty(id);

  if (!property) {
    return {
      title: 'Property Not Found | ApnaStay',
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
  const canonicalUrl = `${siteConfig.url}/properties/${property.id}`;

  return {
    title,
    description,
    keywords: [
      `${cityText.toLowerCase()} rentals`,
      `${neighborhoodText.toLowerCase()} apartments`,
      'zero brokerage flat india',
      'apnastay property',
      roomTypeText.toLowerCase(),
    ],
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'ApnaStay India',
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
      creator: '@apnastayindia',
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await resolveProperty(id);

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
    url: `${siteConfig.url}/properties/${property.id}`,
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
