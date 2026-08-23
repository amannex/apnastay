import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBlogPostBySlug, fetchBlogPosts } from '../../../services/wordpressCms';
import BlogPostPage from '../../../views/BlogPostPage';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | ApnaStay Journal',
      description: 'The requested journal article could not be found.'
    };
  }

  return {
    title: `${post.title} | ApnaStay Journal`,
    description: post.excerpt || 'Read expert insights on ApnaStay Journal.'
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchBlogPosts();
  const relatedPosts = allPosts.filter(p => p.slug !== slug).slice(0, 3);

  return <BlogPostPage post={post} relatedPosts={relatedPosts} />;
}
