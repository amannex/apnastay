import React from 'react';
import type { Metadata } from 'next';
import JournalPage from '../../views/JournalPage';
import { fetchBlogPosts } from '../../services/wordpressCms';

export const metadata: Metadata = {
  title: 'ApnaStay Journal | Indian Rental Laws & Urban Living Guides',
  description: 'Read expert guides on Indian rental agreement laws, security deposit refund rules, acoustic soundproofing, and moving into Indian Tier-2 tech hubs.'
};

export default async function Page() {
  const posts = await fetchBlogPosts();
  return <JournalPage initialPosts={posts} />;
}
