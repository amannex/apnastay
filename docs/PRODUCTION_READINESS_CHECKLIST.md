# ApnaStay Property Listing & Owner Dashboard — Production Readiness Checklist & Deployment Plan

## 1. Production Readiness Checklist

### Frontend Audit
- [x] **Environment Variables**: Managed via `.env.production` / Vercel with single-source-of-truth in [`site.ts`](file:///Users/amansaifi/Documents/apnastay/src/config/site.ts).
- [x] **API Base URLs**: Dynamic resolution between development (`http://localhost:8888`) and production (`https://cms.apnastay.in`).
- [x] **Authentication Handling**: Cookie-based server-side session checks in [`(owner)/layout.tsx`](file:///Users/amansaifi/Documents/apnastay/src/app/(owner)/layout.tsx) preventing client-side flash of unauthenticated screens.
- [x] **Protected Routes**: `/owner/*` routes redirect unauthenticated visitors to `/login?redirect=/owner`.
- [x] **Error Boundaries**: Multi-tier error boundaries installed:
  - Global dashboard route boundary: [`src/app/(owner)/error.tsx`](file:///Users/amansaifi/Documents/apnastay/src/app/(owner)/error.tsx)
  - Granular component boundary: [`PropertyErrorBoundary.tsx`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/components/PropertyErrorBoundary.tsx)
- [x] **Loading States**: Skeletons and spinners in `OwnerPropertiesView` and `AddPropertyWizard` preventing jumpy layouts.
- [x] **Responsive Layouts**: Tested on mobile (375px), tablet (768px), and desktop (1280px+). Responsive navigation stepper and sticky bottom action bars.
- [x] **Image Handling**: Client-side preview memory leak prevention via `URL.revokeObjectURL()`, 10MB file size ceiling, supported format validation (JPG, PNG, WebP, GIF, HEIC).
- [x] **Production Build**: Zero build errors (`npm run build` succeeds cleanly with static and dynamic SSG/SSR optimization).
- [x] **Console Warnings**: Clean compilation with zero unhandled promise rejections.
- [x] **Accessibility**: WCAG AA contrast, `role="tablist"` stepper, `role="alert" aria-live="polite"` error notifications, `focus-visible:ring-2 focus-visible:ring-[#FF385C]` rings.

### Backend & WordPress Audit
- [x] **REST Endpoint Permissions**: All `/wp-json/apnastay/v1/owner/*` routes require authenticated owner capability (`manage_apnastay_properties`).
- [x] **Owner Capability & IDOR Checks**: Strict author isolation: `post_author === get_current_user_id()`. Non-owners receive HTTP 403 `NOT_PROPERTY_OWNER`.
- [x] **Custom Post Types**:
  - `apnastay_property`: Primary listing entity.
  - `apnastay_unit`: Subordinate unit/room entity linked via `post_parent`.
  - `apnastay_bed`: Granular bed inventory entity linked to unit ID.
- [x] **Metadata Storage**: Structured JSON meta for `_apnastay_location`, `_apnastay_pricing`, `_apnastay_rules`, `_apnastay_amenities`.
- [x] **Media Upload Handling**: Direct association with WordPress Media Library via `wp_handle_upload` and `wp_insert_attachment`.
- [x] **Visibility & Privacy**:
  - Public queries (`/properties`) strictly filter by `post_status = 'publish'`.
  - `draft`, `unpublished`, and `archived` listings are 100% invisible to tenant search.
- [x] **Database Indexes**: Recommended MySQL indexes on `wp_posts(post_author, post_type, post_status)` and `wp_postmeta(post_id, meta_key)`.

### Data Integrity Audit
- [x] **Property-Owner Relationships**: Verified on every mutation; cross-owner tampering is rejected.
- [x] **Property-Unit Relationships**: Unit operations verify `unit.propertyId === property.id`.
- [x] **Unit-Bed Relationships**: Bed operations verify `bed.unitId === unit.id`.
- [x] **No Orphaned Data**: Units and beds are cleanly cascaded during soft-archive and restoration.
- [x] **Status Consistency**: Unified 4-state lifecycle (`draft`, `published`, `unpublished`, `archived`) with no conflicting intermediate states.

### Deployment Safety
- [x] **Database Backup Strategy**: Nightly automated MySQL snapshot + pre-deployment snapshot.
- [x] **Rollback Plan**: Instant rollback runbook (detailed below).
- [x] **Logging & Telemetry**: Normalizer outputs structured error telemetry with codes.

---

## 2. Required Code & Configuration Fixes (Completed)

1. **Error Boundary Integration**: Added Next.js client-side boundary [`src/app/(owner)/error.tsx`](file:///Users/amansaifi/Documents/apnastay/src/app/(owner)/error.tsx) and component boundary [`PropertyErrorBoundary.tsx`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/components/PropertyErrorBoundary.tsx).
2. **Production API Security Guard**: Configured `api.ts` to surface true 401/403 errors directly to the user in production without masking them via simulation.
3. **Memory Leak Fix**: In [`StepPhotos.tsx`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/components/wizard/StepPhotos.tsx), added `blobUrlsRef` tracking to ensure all created blob URLs are revoked on upload completion or unmount.

---

## 3. Data Migration Notes

If migrating from legacy listing tables or previous property schemas:
1. **Property Post Type**: Legacy `property` CPT records should be mapped to `apnastay_property`.
2. **Pricing Normalization**: Ensure `monthly_rent` is stored in meta key `_apnastay_pricing` as `{ "monthlyRent": <number> }`.
3. **Location Normalization**: Ensure city, locality, pincode, and coordinates are consolidated into `_apnastay_location`.
4. **Unit Parent Linkage**: Multi-unit properties should have `apnastay_unit` records with `post_parent` pointing to the root `apnastay_property` ID.

---

## 4. Deployment Notes

### Environment Variable Checklist
Ensure the following are set in the production deployment environment (e.g., Vercel, AWS ECS, or Docker):
```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://apnastay.in
NEXT_PUBLIC_WP_API_URL=https://cms.apnastay.in/wp-json
NEXT_PUBLIC_APNASTAY_API_URL=https://cms.apnastay.in/wp-json/apnastay/v1
NEXT_PUBLIC_WP_ADMIN_URL=https://cms.apnastay.in/wp-admin/
WP_WEBHOOK_SECRET=<generated_high_entropy_secret>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<optional_maps_key>
```

### Build & Deploy Sequence
```bash
# 1. Install locked dependencies
npm ci

# 2. Verify static typing
npx tsc --noEmit

# 3. Build optimized production assets
npm run build

# 4. Start production server
npm run start
```

---

## 5. Rollback Considerations

In the event of an unforeseen production incident:
1. **Frontend Fast Rollback**: Vercel/CDN deployment instant rollback to previous successful immutable deployment hash. Zero downtime (< 10 seconds).
2. **WordPress Core Rollback**: If the custom plugin causes issues, disable the plugin or revert to previous tag via git/Composer on the WP server.
3. **Data Protection**: Since all deletions are soft-archives (`status = 'archived'`), no property data is physically destroyed.
4. **Cache Invalidation**: Trigger ISR purge via POST to `/api/revalidate-blog` or Next.js tag revalidation.

---

## 6. Controlled Rollout Plan (10 Stages)

To guarantee stability, do not release to 100% of owners at once. Follow this controlled progression:

| Stage | Action | Success Criteria |
|---|---|---|
| **1. Local Dev** | Run all test suites (`tsx`) & verify Next.js build | 100% passing tests (55/55 Phase 15 + regressions) |
| **2. Staging Deploy** | Deploy to `staging.apnastay.in` connected to Staging WP CMS | Clean deployment, zero 500 errors |
| **3. Test Accounts** | Create 3 test owner accounts (Residential, PG Host, Commercial) | Owners authenticate cleanly with session cookies |
| **4. Structural Verification**| Create sample properties of all 10 types & 3 rental structures | Units, beds, and pricing persist correctly |
| **5. WP Integration** | Verify WordPress Admin shows post types, meta, & photos | Media attached correctly in WP Media Library |
| **6. Public Visibility** | Publish 1 test property; verify public `/properties` listing | Displays on public site with correct starting price |
| **7. Privacy Check** | Create 1 draft and 1 unpublished listing; check `/properties` | Drafts and unpublished listings NEVER appear publicly |
| **8. Beta Cohort** | Release to 10–20 verified early-adopter property owners | Monitor real owner creation flows & photo uploads |
| **9. Error Monitoring** | Monitor error logs, Sentry/Datadog alerts, and user feedback for 48 hrs | Error rate < 0.1%, zero critical exceptions |
| **10. General Availability** | Enable listing creation for 100% of owners across India | Full production availability |

---

## 7. Final Implementation Summary

The ApnaStay property engine is now fully validated, resilient against edge-case errors, and ready for production staging and controlled rollout.
