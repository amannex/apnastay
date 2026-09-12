# ApnaStay Property Engine — Developer Architecture & Integration Guide

This document is the technical manual for developers maintaining and extending the ApnaStay Property Listing Engine, Owner Dashboard, and WordPress REST API services.

---

## 1. Domain Architecture & Entity Hierarchy

The ApnaStay property model uses a multi-tier tree structure capable of representing single-family residential listings, multi-flat towers, student hostels, and high-density co-living communities:

```
                      +-----------------------------+
                      |        Property (Root)      |
                      | - id, title, type, structure|
                      | - location, photos, pricing |
                      | - rules, status, completeness|
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               | (1:N for multi_unit / rooms_beds)         | (Optional direct media)
               v                                           v
      +-----------------+                         +-----------------+
      |  PropertyUnit   |                         |  PropertyPhoto  |
      | - id, nameOrNo  |                         | - id, url, order|
      | - unitType, rent|                         | - isCover, cat  |
      | - status, cap   |                         +-----------------+
      +--------+--------+
               |
               | (1:N for individual_bed)
               v
      +-----------------+
      |   PropertyBed   |
      | - id, label     |
      | - pricing, status|
      +-----------------+
```

### Relational Hierarchy Rules
1. **Property (Root)**: Represents the physical building, house, or shared space. Must have a valid `ownerId`, `propertyType`, and `rentalStructure`.
2. **Units (1:N)**: Represent individual rentable flats, rooms, or suites within a building.
   - For `entire_property` and `individual_unit`, units are optional (0 units allowed; listing-level pricing applies).
   - For `multiple_units` and `individual_room`, units are required before publishing.
3. **Beds (1:N)**: Represent individual rentable bed spots within a unit or room.
   - Used when `rentalStructure === 'individual_bed'`.
   - Each bed belongs strictly to a single unit, which in turn belongs strictly to a single property.

---

## 2. Supported Property Types & Matrix

The engine supports 10 distinct property types configured in [`templates.ts`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/templates.ts):

| Property Type | Category | Default Structure | Allowed Structures | Unit Terminology |
|---|---|---|---|---|
| `house` | Independent | `entire_property` | `entire_property` | Portion |
| `apartment` | Multi-family | `individual_unit` | `individual_unit`, `entire_property`, `multiple_units` | Flat / Apartment |
| `villa` | Luxury/Holiday | `entire_property` | `entire_property` | Villa |
| `pg` | Shared Living | `individual_bed` | `individual_bed`, `individual_room` | Room |
| `hostel` | Dormitory | `individual_bed` | `individual_bed`, `individual_room` | Room / Dorm |
| `coliving` | Modern Shared | `individual_room` | `individual_room`, `individual_bed` | Studio / Room |
| `building` | Commercial/Res | `multiple_units` | `multiple_units` | Unit / Suite |
| `independent_floor` | Builder Floor | `entire_property` | `entire_property`, `multiple_units` | Floor |
| `room` | Private Room | `individual_room` | `individual_room` | Private Room |
| `commercial` | Commercial | `multiple_units` | `multiple_units`, `individual_unit`, `entire_property` | Unit / Shop / Office |
| `other` | Custom / Flexible| `entire_property` | All structures | Space / Unit |

### Structural Invariant
- If an owner attempts to assign an incompatible `rentalStructure` (e.g., `individual_bed` to an independent `house`), backend validation rejects the payload with HTTP 400 `INVALID_RENTAL_STRUCTURE`.

---

## 3. Listing Lifecycle State Machine

Listing statuses follow a strict, non-bypassable state machine enforced by [`backend.ts`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/backend.ts) and the WordPress REST controller:

```
       [Create / Init]
              |
              v
         +---------+           Publish (>60% complete)
         |  draft  | ------------------------------------+
         +----+----+                                     |
              |                                          |
              | Archive                                  v
              |                                   +-------------+
              |           Unpublish               |  published  |
              |   +-----------------------------+ +------+------+
              |   |                                      |
              v   v                   Publish            |
         +------------+ <--------------------------------+
         | unpublished|
         +-----+------+
               |
               | Archive
               v
         +------------+        Restore
         |  archived  | ----------------------> (unpublished)
         +------------+
```

### Lifecycle Transition Rules
1. **Draft (`draft`)**:
   - Allows incremental, incomplete auto-saving across any wizard step.
   - Completely hidden from tenant search and public catalog queries.
   - Can transition directly to `published` (if completeness >= 60% and units validated) or `archived`.
2. **Published (`published`)**:
   - Visible to all tenants in city search and listing details.
   - Updates `publishedAt` timestamp upon initial publish.
   - Can transition to `unpublished` or `archived`.
3. **Unpublished (`unpublished`)**:
   - Temporarily taken off the market (e.g. maintenance, full occupancy).
   - Preserves all pricing, unit structures, and media intact.
   - Can transition back to `published` or to `archived`.
4. **Archived (`archived`)**:
   - Soft-deleted state. All historical records, units, and photos are preserved for legal and audit compliance.
   - Direct updates, pricing changes, or unit mutations on archived properties are blocked (`INVALID_STATUS_TRANSITION`).
   - Must be explicitly restored via `restoreProperty` (returns to `unpublished` status).

---

## 4. Pricing Ownership Model

Pricing can exist at up to three levels, determined by the `rentalStructure`:

1. **Property-Level Pricing (`property.pricing`)**:
   - Used when `rentalStructure === 'entire_property'` or `'individual_unit'`.
   - Includes `monthlyRent`, `securityDeposit`, `maintenance`, `lockInMonths`, `noticePeriodDays`, `foodIncluded`.
   - In multi-unit properties, `property.pricing.monthlyRent` serves as the public "Starting From" price anchor.
2. **Unit-Level Pricing (`unit.pricing`)**:
   - Used when `rentalStructure === 'multiple_units'` or `'individual_room'`.
   - Overrides or specifies the distinct monthly rent and deposit for Flat 101 vs Flat 201.
3. **Bed-Level Pricing (`bed.pricing`)**:
   - Used when `rentalStructure === 'individual_bed'`.
   - Allows individual pricing per bed spot (e.g. Bed A Window at ₹8,500 vs Bed B at ₹7,500).

---

## 5. Unit & Bed Relationships & Availability

Unit availability is derived reactively:
- **Zero Bed Units**: `unit.status` directly determines availability (`available`, `occupied`, `under_maintenance`, `reserved`).
- **Bed-Based Units**:
  - All beds available -> Unit availability: `available`
  - All beds occupied -> Unit availability: `occupied`
  - Some beds occupied, some available -> Unit availability: `partially_occupied`
  - Any bed under maintenance while others vacant -> Unit availability: `maintenance`

---

## 6. WordPress REST API Specification

All property operations interface with the WordPress core plugin via namespace `/wp-json/apnastay/v1`.

### Authentication & Authorization
- Requests require WordPress cookie authentication or JWT bearer token.
- Mutating endpoints verify `current_user_can('manage_apnastay_properties')` or owner capability.
- **IDOR Defense**: All routes enforce `post_author === get_current_user_id()`. Administrators bypass this ownership check.

### Key REST Endpoints

| Method | Endpoint | Description | Capability Required |
|---|---|---|---|
| `GET` | `/wp-json/apnastay/v1/owner/properties` | Fetch portfolio for current owner | Authenticated Owner |
| `POST` | `/wp-json/apnastay/v1/owner/properties` | Create new property draft | Authenticated Owner |
| `GET` | `/wp-json/apnastay/v1/owner/properties/{id}` | Get full property with units/beds/photos | Owner / Admin |
| `PUT` | `/wp-json/apnastay/v1/owner/properties/{id}` | Update property details / auto-save | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/publish` | Validate completeness and publish | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/unpublish` | Take property offline | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/archive` | Soft-archive property | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/restore` | Restore archived property | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/photos` | Upload and associate image attachment | Owner / Admin |
| `DELETE` | `/wp-json/apnastay/v1/owner/properties/{id}/photos/{photoId}` | Disassociate/delete photo | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/units` | Add unit to property | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/units/bulk` | Bulk generate units | Owner / Admin |
| `POST` | `/wp-json/apnastay/v1/owner/properties/{id}/units/{uId}/beds` | Add bed to unit | Owner / Admin |

---

## 7. Environment Configuration

Defined in [`.env.example`](file:///Users/amansaifi/Documents/apnastay/.env.example):

| Variable | Purpose | Development Default | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Frontend canonical URL | `http://localhost:3000` | `https://apnastay.in` |
| `NEXT_PUBLIC_WP_API_URL` | WordPress REST API base | `http://localhost:8888/wp-json` | `https://cms.apnastay.in/wp-json` |
| `NEXT_PUBLIC_APNASTAY_API_URL` | Custom ApnaStay v1 API base | `http://localhost:8888/wp-json/apnastay/v1` | `https://cms.apnastay.in/wp-json/apnastay/v1` |
| `NEXT_PUBLIC_WP_ADMIN_URL` | WP Admin redirect target | `http://localhost:8888/wp-admin/` | `https://cms.apnastay.in/wp-admin/` |
| `WP_WEBHOOK_SECRET` | ISR on-demand revalidation | Dev secret | 64-char crypto string |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional Maps API key | None (Uses free Leaflet / OSM) | Production Key |

---

## 8. Common Troubleshooting & FAQs

### Q: Why does an owner see "Access Denied: You do not have permission"?
- Cause: IDOR guard triggered. The authenticated user's ID does not match the property's `ownerId`.
- Fix: Ensure the user is logged into the account that authored the listing.

### Q: Why does publishing fail with HTTP 422?
- Cause: `LISTING_INCOMPLETE`. The listing is missing one of the mandatory publish criteria:
  1. Valid title (minimum 5 characters).
  2. Location city, state, and address.
  3. At least one uploaded photo.
  4. Monthly rent > ₹0.
  5. Multi-unit listings: at least 1 unit configured.

### Q: How are photo memory leaks avoided in the browser?
- All client-side `URL.createObjectURL` references are tracked in a `Set<string>` ref in [`StepPhotos.tsx`](file:///Users/amansaifi/Documents/apnastay/src/features/properties/components/wizard/StepPhotos.tsx).
- When photos finish uploading, or when the user deletes an image or unmounts the component, `URL.revokeObjectURL` is executed immediately.
