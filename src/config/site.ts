// ============================================================================
// APNASTAY ENTERPRISE CONFIGURATION LAYER (Single Source of Truth)
// Follows 12-Factor App methodology: Environment-driven with safe fallbacks
// ============================================================================

const isProd = process.env.NODE_ENV === 'production';

/**
 * Resolves canonical site URL dynamically based on environment tier.
 * Priority: Explicit ENV > Vercel Deployment URL > Production Domain > Localhost
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, '');
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim() !== '') {
    return `https://${vercelUrl.trim().replace(/\/+$/, '')}`;
  }

  if (isProd) {
    return 'https://apnastay.in';
  }

  return 'http://localhost:3000';
}

/**
 * Resolves WordPress REST API base URL.
 */
function resolveWpApiUrl(): string {
  if (process.env.NEXT_PUBLIC_WP_API_URL && process.env.NEXT_PUBLIC_WP_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_WP_API_URL.trim().replace(/\/+$/, '');
  }

  if (isProd) {
    return 'https://cms.apnastay.in/wp-json';
  }

  return 'http://localhost:8888/wp-json';
}

const siteUrl = resolveSiteUrl();
const wpApiUrl = resolveWpApiUrl();

export const siteConfig = {
  name: 'ApnaStay',
  tagline: "India's Zero-Brokerage Rental Platform",
  domain: 'apnastay.in',
  env: process.env.NODE_ENV || 'development',
  isProduction: isProd,

  /**
   * Canonical Frontend URL (Root domain, Vercel preview, or localhost)
   */
  url: siteUrl,

  /**
   * API endpoints connecting Next.js to the Headless WordPress CMS
   */
  api: {
    wp: wpApiUrl,
    apnastay:
      (process.env.NEXT_PUBLIC_APNASTAY_API_URL && process.env.NEXT_PUBLIC_APNASTAY_API_URL.trim() !== '')
        ? process.env.NEXT_PUBLIC_APNASTAY_API_URL.trim().replace(/\/+$/, '')
        : `${wpApiUrl}/apnastay/v1`,
    wpAdmin:
      (process.env.NEXT_PUBLIC_WP_ADMIN_URL && process.env.NEXT_PUBLIC_WP_ADMIN_URL.trim() !== '')
        ? process.env.NEXT_PUBLIC_WP_ADMIN_URL.trim()
        : (isProd ? 'https://cms.apnastay.in/wp-admin/' : 'http://localhost:8888/wp-admin/'),
  },

  /**
   * Social & Support Links
   */
  links: {
    supportEmail: 'support@apnastay.in',
    twitter: 'https://twitter.com/apnastayindia',
    linkedin: 'https://www.linkedin.com/company/apnastayindia',
    instagram: 'https://www.instagram.com/apnastayindia',
  },
} as const;

export type SiteConfig = typeof siteConfig;
