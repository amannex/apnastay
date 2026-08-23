'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { BlogPost } from '../types';
import { ArrowLeft, Clock, Calendar, Share2, Link2, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostPage({ post, relatedPosts }: BlogPostPageProps) {
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTitle = encodeURIComponent(post.title);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';

  // Extract headings for Table of Contents
  const headings = useMemo(() => {
    const list: { id: string; text: string }[] = [];
    const rawContent = post.content || '';
    const regex = /<h3[^>]*>(.*?)<\/h3>/g;
    let match;
    while ((match = regex.exec(rawContent)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, ''); // strip inline tags
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      list.push({ id, text });
    }
    return list;
  }, [post.content]);

  // Track active heading position on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleActiveHighlight = () => {
      const scrollPosition = window.scrollY + 160; // 160px offset from viewport top
      let currentActive = headings[0]?.id || '';

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPosition >= top) {
            currentActive = headings[i].id;
          }
        }
      }
      setActiveId(currentActive);
    };

    window.addEventListener('scroll', handleActiveHighlight);
    // Trigger once on layout stable
    setTimeout(handleActiveHighlight, 100);

    return () => window.removeEventListener('scroll', handleActiveHighlight);
  }, [headings]);

  // Inject ID attributes into original content headings for anchor scroll alignment
  const contentWithIds = useMemo(() => {
    let content = post.content || '';
    headings.forEach(heading => {
      const escapedText = heading.text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(`(<h3[^>]*>)(${escapedText})(<\/h3>)`, 'i');
      content = content.replace(searchRegex, `<h3 id="${heading.id}" class="scroll-mt-28 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] mt-12 mb-5 tracking-tight">$2</h3>`);
    });
    return content;
  }, [post.content, headings]);

  // Split content for inline CTA placement (split at the second h3 or first h3)
  const { firstHalf, secondHalf } = useMemo(() => {
    let fHalf = contentWithIds;
    let sHalf = '';

    const h3Indices: number[] = [];
    let idx = 0;
    while ((idx = contentWithIds.indexOf('<h3', idx)) !== -1) {
      h3Indices.push(idx);
      idx += 3;
    }

    if (h3Indices.length >= 2) {
      const splitIndex = h3Indices[1];
      fHalf = contentWithIds.slice(0, splitIndex);
      sHalf = contentWithIds.slice(splitIndex);
    } else if (h3Indices.length === 1) {
      const splitIndex = h3Indices[0];
      fHalf = contentWithIds.slice(0, splitIndex);
      sHalf = contentWithIds.slice(splitIndex);
    }

    return { firstHalf: fHalf, secondHalf: sHalf };
  }, [contentWithIds]);

  return (
    <main className="min-h-screen bg-white pt-24 pb-20 relative">
      {/* READING TIMELINE ON THE HEADER */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#E1224D] z-[100] transition-all duration-75 origin-left"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB AND BACK ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-[#EDEDED] mb-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
            <Link href="/" className="hover:text-[#E1224D] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CCCCCC]" />
            <Link href="/journal" className="hover:text-[#E1224D] transition-colors">Journal</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CCCCCC]" />
            <span className="text-[#1A1A1A] truncate max-w-[200px] sm:max-w-none">{post.title}</span>
          </div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] hover:text-[#E1224D] transition-colors bg-white px-3 py-2 rounded-xl border border-[#EDEDED] shadow-sm w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Journal
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ARTICLE CONTENT */}
          <article className="lg:col-span-8 overflow-hidden bg-transparent p-0">
            
            {/* BADGE & DATE */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-[11px] font-bold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-xs text-[#6B7280]">•</span>
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                {post.date}
              </span>
              <span className="text-xs text-[#6B7280]">•</span>
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                {post.readTime}
              </span>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1A1A1A] mb-6 leading-tight">
              {post.title}
            </h1>

            {/* AUTHOR IN HEADER */}
            <div className="flex items-center gap-3 py-4 border-y border-[#FAFAFA] mb-8 bg-[#FAFAFA]/50 p-4 rounded-2xl">
              <img
                src={typeof post.author === 'object' ? post.author.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={typeof post.author === 'object' ? post.author.name : 'Author'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <p className="text-xs font-bold text-[#1A1A1A]">
                  {typeof post.author === 'object' ? post.author.name : post.author}
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  {typeof post.author === 'object' ? post.author.role : 'ApnaStay Contributor'}
                </p>
              </div>
            </div>

            {/* FEATURED IMAGE */}
            {post.image && (
              <div className="relative rounded-2xl overflow-hidden mb-8 max-h-[420px] shadow-sm">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* BODY TEXT - FIRST HALF */}
            <div 
              className="prose prose-rose max-w-none text-[#333333] text-[15px] sm:text-[17px] leading-[1.8] space-y-6 prose-p:mb-6 prose-blockquote:border-l-4 prose-blockquote:border-l-[#E1224D] prose-blockquote:bg-rose-50/20 prose-blockquote:py-4 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-600 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:mb-2 prose-li:text-[15px] prose-li:sm:text-[16px]"
              dangerouslySetInnerHTML={{ __html: firstHalf }}
            />

            {/* INLINE CTA BANNER */}
            <div className="my-10 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl border border-[#FFE4EA] p-6 sm:p-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[#E1224D] text-[10px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                ApnaStay Certified
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2">
                100% Zero Brokerage. Verified Renting.
              </h4>
              <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mb-4 max-w-2xl">
                No third party brokers. Self-tour with ephemeral encrypted NFC digital keys and PAN/Aadhaar e-sign agreements directly with verified homeowners in under 15 minutes.
              </p>
              <Link 
                href="/why-apnastay" 
                className="inline-flex items-center gap-1 text-xs font-bold text-[#E1224D] hover:underline"
              >
                Learn about our 25-point audit
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* BODY TEXT - SECOND HALF */}
            {secondHalf && (
              <div 
                className="prose prose-rose max-w-none text-[#333333] text-[15px] sm:text-[17px] leading-[1.8] space-y-6 prose-p:mb-6 prose-blockquote:border-l-4 prose-blockquote:border-l-[#E1224D] prose-blockquote:bg-rose-50/20 prose-blockquote:py-4 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-600 prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-li:mb-2 prose-li:text-[15px] prose-li:sm:text-[16px]"
                dangerouslySetInnerHTML={{ __html: secondHalf }}
              />
            )}

            {/* SHARE FOOTER */}
            <div className="mt-8 pt-8 border-t border-[#EDEDED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#E1224D]" />
                Share this post
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-xl bg-[#FAFAFA] hover:bg-[#E1224D] hover:text-white text-[#6B7280] flex items-center justify-center transition-colors relative"
                  title="Copy link"
                >
                  <Link2 className="w-4 h-4" />
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#FAFAFA] hover:bg-[#1DA1F2] hover:text-white text-[#6B7280] flex items-center justify-center transition-colors"
                  title="Share on Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#FAFAFA] hover:bg-[#1877F2] hover:text-white text-[#6B7280] flex items-center justify-center transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-[#FAFAFA] hover:bg-[#0A66C2] hover:text-white text-[#6B7280] flex items-center justify-center transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* AUTHOR BRIEF BOX */}
            <div className="mt-12 bg-white rounded-3xl border border-[#EDEDED] p-6 sm:p-8 shadow-sm">
              <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-4 pb-2 border-b border-[#FAFAFA]">
                About the Author
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={typeof post.author === 'object' ? post.author.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={typeof post.author === 'object' ? post.author.name : 'Author'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-rose-50 shadow-sm"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#1A1A1A]">
                    {typeof post.author === 'object' ? post.author.name : post.author}
                  </h4>
                  <p className="text-xs text-[#E1224D] font-semibold mb-1">
                    {typeof post.author === 'object' ? post.author.role : 'Contributor'}
                  </p>
                  <p className="text-xs text-[#6B7280] leading-relaxed max-w-xl">
                    Covers housing economics, regulatory compliance, property verification standards, and urban migration patterns in India's emerging Tier-2 smart cities.
                  </p>
                </div>
              </div>
            </div>

          </article>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-8 sticky top-28 self-start">
            
            {/* DYNAMIC TABLE OF CONTENTS (INTERACTIVE VIEWPORT OBSERVER) */}
            {headings.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-4 pb-2 border-b border-[#FAFAFA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E1224D]" />
                  Table of Contents
                </h3>
                <nav className="space-y-3">
                  {headings.map((heading) => {
                    const isActive = heading.id === activeId;
                    return (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-xs font-semibold leading-relaxed transition-all duration-300 pl-3 border-l-2 ${
                          isActive 
                            ? 'text-[#E1224D] border-[#E1224D] translate-x-1.5 font-bold' 
                            : 'text-[#6B7280] border-[#EDEDED] hover:text-[#1A1A1A] hover:border-[#CCCCCC]'
                        }`}
                      >
                        {heading.text}
                      </a>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* RELATED POSTS / READ NEXT */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#EDEDED] shadow-sm p-6">
                <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider mb-4 pb-2 border-b border-[#FAFAFA] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#E1224D]" />
                  Read Next
                </h3>
                <div className="space-y-4">
                  {relatedPosts.map((rPost) => (
                    <Link
                      key={rPost.id}
                      href={`/journal/${rPost.slug}`}
                      className="group block"
                    >
                      <div className="flex gap-3">
                        {rPost.image && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#FAFAFA]">
                            <img
                              src={rPost.image}
                              alt={rPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-[#E1224D] uppercase tracking-wide">
                            {rPost.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-2 mt-0.5 leading-snug">
                            {rPost.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </aside>
          
        </div>

      </div>
    </main>
  );
}
