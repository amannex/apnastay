'use client';

import React, { useState, useEffect } from 'react';
import { fetchBlogPosts } from '../../services/wordpressCms';
import { BookOpen, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchBlogPosts().then((data) => {
      if (active) {
        setPosts(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="blog" className="py-24 bg-[#FAFAFA] border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#E1224D] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              ApnaStay Journal & Urban Living Guide
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              The ApnaStay Journal
            </h2>
            <p className="text-[#6B7280] text-base mt-2">
              Perspectives on zero-brokerage rentals, smart-lock security, and living peacefully in India's Tier-2 hubs.
            </p>
          </div>

          <div className="text-xs font-semibold text-[#6B7280]">
            <span>Curated by ApnaStay India Economists & Engineers</span>
          </div>
        </div>

        {/* ARTICLES GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-96 border animate-pulse p-6" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-3xl border border-[#EDEDED] shadow-sm hover:shadow-apple-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-[#FAFAFA]">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#E1224D] text-[11px] font-bold shadow-sm">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-[#6B7280] font-medium mb-2">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <Link href={`/journal/${post.slug}`}>
                      <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#E1224D] transition-colors line-clamp-2 cursor-pointer hover:underline decoration-wavy decoration-1 decoration-[#E1224D]/30">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* FOOTER / AUTHOR */}
                <div className="px-6 pb-6 pt-4 border-t border-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A]">{post.author.name}</p>
                      <p className="text-[10px] text-[#6B7280]">{post.author.role}</p>
                    </div>
                  </div>

                  <Link
                    href={`/journal/${post.slug}`}
                    className="w-8 h-8 rounded-full bg-[#FAFAFA] group-hover:bg-[#E1224D] group-hover:text-white text-[#1A1A1A] flex items-center justify-center transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
