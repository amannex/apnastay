import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import {
  getCityHierarchy,
  getAllCityHierarchySlugs,
} from '@/data/locations';
import CityDetailPage from '@/views/CityDetailPage';

interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams?: Promise<{ locality?: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCityHierarchySlugs();
  return slugs.map((slug) => ({
    city: slug,
  }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityHierarchy(citySlug);

  if (!city) {
    return {
      title: 'City Discovery | ApnaStay',
      description:
        'Explore verified zero-brokerage rental homes across premier Indian cities.',
    };
  }

  const title = `${city.name} Rental Homes & Localities | Zero Brokerage Stays | ApnaStay`;
  const description = `Explore long-term rental homes, top localities, and direct owner connects in ${city.name}, ${city.country}. Bypassing traditional middlemen with 100% verified ₹0 brokerage on ApnaStay.`;
  const canonicalUrl = `${siteConfig.url}/${city.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: siteConfig.name,
    },
  };
}

export default async function Page({ params, searchParams }: CityPageProps) {
  const { city: citySlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const locality = resolvedSearchParams.locality;

  const city = getCityHierarchy(citySlug);

  if (!city) {
    notFound();
  }

  return <CityDetailPage city={city} initialLocalitySlug={locality} />;
}
