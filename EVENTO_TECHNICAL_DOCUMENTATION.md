# Evento Platform - Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Code Structure](#code-structure)
4. [Database Schema](#database-schema)
5. [Data Flow & Working Procedure](#data-flow--working-procedure)
6. [API Reference](#api-reference)
7. [Installation Guide](#installation-guide)
8. [Development Guide](#development-guide)

---

## Overview

Evento is a dynamic event template platform that allows administrators to create customizable event templates (weddings, birthdays, corporate events) and users to create personalized event microsites from those templates.

### Key Features

- **Dynamic Template System**: Admins create templates with configurable sections, color schemes, and font pairs
- **Multiple Preview Profiles**: Each template can have multiple sample data profiles (e.g., "Classic Romance", "Modern Minimalist")
- **Section-Based Architecture**: Templates are composed of reusable sections (Hero, Countdown, Venue, Gallery, RSVP, etc.)
- **User Microsites**: Users create their own event sites by selecting a template and customizing the content
- **RSVP Management**: Built-in guest management with attendance tracking
- **Wishes/Guestbook**: Guests can leave messages for the event hosts
- **Mobile-First Design**: Responsive UI optimized for mobile devices

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS v3, shadcn/ui |
| State Management | TanStack Query (React Query), Zustand |
| Forms | React Hook Form + Zod validation |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| Notifications | SweetAlert2 |
| Icons | Lucide React |

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   Landing Page   │  │    Dashboard     │  │   Public Pages   │          │
│  │   /              │  │   /dashboard/*   │  │   /e/[slug]      │          │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘          │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │      API Client         │                              │
│                    │   (lib/api.ts)          │                              │
│                    └────────────┬────────────┘                              │
│                                 │                                           │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │ HTTP/REST
┌─────────────────────────────────┼───────────────────────────────────────────┐
│                              SERVER LAYER                                    │
├─────────────────────────────────┼───────────────────────────────────────────┤
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │    Express Server       │                              │
│                    │    (Port 5000)          │                              │
│                    └────────────┬────────────┘                              │
│                                 │                                           │
│           ┌─────────────────────┼─────────────────────┐                     │
│           │                     │                     │                     │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐            │
│  │  Auth Routes    │  │ Template Routes │  │ Microsite Routes│            │
│  │  /api/auth/*    │  │ /api/templates/*│  │ /api/microsites/*│           │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                     │                     │                     │
│           └─────────────────────┼─────────────────────┘                     │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │    Controllers          │                              │
│                    └────────────┬────────────┘                              │
│                                 │                                           │
└─────────────────────────────────┼───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────┼───────────────────────────────────────────┤
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │    Mongoose Models      │                              │
│                    └────────────┬────────────┘                              │
│                                 │                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Template │ │ Template │ │ Template │ │Microsite │ │Microsite │         │
│  │          │ │ Version  │ │ Section  │ │          │ │ Section  │         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘         │
│       │            │            │            │            │                │
│       └────────────┴────────────┴────────────┴────────────┘                │
│                                 │                                           │
│                    ┌────────────▼────────────┐                              │
│                    │       MongoDB           │                              │
│                    │    (Port 27017)         │                              │
│                    └─────────────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND COMPONENTS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Pages (App Router)                                                          │
│  ├── / (Landing)                                                             │
│  ├── /login                                                                  │
│  ├── /register                                                               │
│  ├── /dashboard                                                              │
│  │   ├── /templates (Browse & Use Templates)                                │
│  │   ├── /sites (My Sites)                                                  │
│  │   │   └── /[id]/edit (Site Editor)                                       │
│  │   ├── /admin                                                              │
│  │   │   └── /templates (Manage Templates)                                  │
│  │   │       ├── /new (Create Template)                                     │
│  │   │       └── /[id]/edit (Edit Template)                                 │
│  │   └── /settings                                                          │
│  └── /e/[slug] (Public Event Page)                                          │
│                                                                              │
│  Shared Components                                                           │
│  ├── EventSectionRenderer (Renders all section types)                       │
│  ├── DashboardLayout (Sidebar + Header)                                     │
│  └── UI Components (shadcn/ui)                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Code Structure

### Project Directory Structure

```
devin/
├── backend/                          # Express.js Backend
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.ts     # Authentication (login, register)
│   │   │   ├── templateController.ts # Template CRUD operations
│   │   │   ├── micrositeController.ts# Microsite CRUD + public endpoints
│   │   │   └── index.ts              # Controller exports
│   │   │
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── User.ts               # User model
│   │   │   ├── Template.ts           # Template master model
│   │   │   ├── TemplateVersion.ts    # Version with design options
│   │   │   ├── TemplateSection.ts    # Section definitions
│   │   │   ├── Microsite.ts          # User's event site
│   │   │   ├── MicrositeSection.ts   # User's section content
│   │   │   ├── Guest.ts              # RSVP guests
│   │   │   └── index.ts              # Model exports
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── authRoutes.ts         # /api/auth/*
│   │   │   ├── templateRoutes.ts     # /api/templates/*
│   │   │   ├── micrositeRoutes.ts    # /api/microsites/*
│   │   │   └── index.ts              # Route aggregation
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   └── index.ts              # Auth middleware (JWT verification)
│   │   │
│   │   └── index.ts                  # Server entry point
│   │
│   ├── scripts/
│   │   └── create-demo-templates.js  # Script to create sample templates
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── evento/                       # Next.js Frontend
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── login/page.tsx    # Login page
│       │   │   ├── register/page.tsx # Register page
│       │   │   ├── dashboard/        # Protected dashboard routes
│       │   │   │   ├── layout.tsx    # Dashboard layout with sidebar
│       │   │   │   ├── page.tsx      # Dashboard home
│       │   │   │   ├── templates/    # Template browsing
│       │   │   │   │   ├── page.tsx  # Template list with profile selection
│       │   │   │   │   └── [id]/preview/page.tsx  # Template preview
│       │   │   │   ├── sites/        # User's microsites
│       │   │   │   │   ├── page.tsx  # Site list
│       │   │   │   │   └── [id]/edit/page.tsx  # Site editor
│       │   │   │   ├── admin/        # Admin pages
│       │   │   │   │   └── templates/
│       │   │   │   │       ├── page.tsx      # Template management
│       │   │   │   │       ├── new/page.tsx  # Create template
│       │   │   │   │       └── [id]/edit/page.tsx  # Edit template
│       │   │   │   └── settings/page.tsx
│       │   │   └── e/[slug]/page.tsx # Public event page
│       │   │
│       │   ├── components/           # Shared components
│       │   │   └── EventSectionRenderer.tsx  # Universal section renderer
│       │   │
│       │   ├── lib/                  # Utilities
│       │   │   └── api.ts            # API client (axios)
│       │   │
│       │   └── types/                # TypeScript types
│       │       └── index.ts          # All type definitions
│       │
│       ├── package.json
│       └── tailwind.config.ts
│
└── EVENTO_TECHNICAL_DOCUMENTATION.md # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `backend/src/controllers/micrositeController.ts` | Handles microsite creation with profile selection, RSVP submissions, wishes |
| `backend/src/controllers/templateController.ts` | Template CRUD, version management, section management |
| `backend/src/models/TemplateSection.ts` | Defines section schema with `sampleDataSets` for multiple profiles |
| `backend/src/models/TemplateVersion.ts` | Stores `sampleProfiles` array for profile selection UI |
| `frontend/evento/src/components/EventSectionRenderer.tsx` | Single component that renders ALL section types (hero, countdown, venue, gallery, etc.) |
| `frontend/evento/src/app/dashboard/templates/page.tsx` | Template browsing with profile selection modal |
| `frontend/evento/src/app/e/[slug]/page.tsx` | Public event page that uses EventSectionRenderer |
| `backend/scripts/create-demo-templates.js` | Creates sample Wedding and Birthday templates with profiles |

---

## Database Schema

### Schema Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA RELATIONSHIPS                        │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │      USER       │
                              │─────────────────│
                              │ _id             │
                              │ name            │
                              │ email           │
                              │ password        │
                              └────────┬────────┘
                                       │
                                       │ createdBy (1:N)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TEMPLATE SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐│
│  │    TEMPLATE     │ 1     N │ TEMPLATE_VERSION│ 1     N │TEMPLATE_SECTION ││
│  │─────────────────│────────▶│─────────────────│────────▶│─────────────────││
│  │ _id             │         │ _id             │         │ _id             ││
│  │ slug            │         │ templateId (FK) │         │ versionId (FK)  ││
│  │ name            │         │ version         │         │ sectionId       ││
│  │ description     │         │ colorSchemes[]  │         │ type            ││
│  │ category        │         │ fontPairs[]     │         │ name            ││
│  │ thumbnail       │         │ sampleProfiles[]│         │ order           ││
│  │ currentVersion  │         │ defaultColor    │         │ fields[]        ││
│  │ isActive        │         │ defaultFont     │         │ sampleValues{}  ││
│  │ isPremium       │         │ changelog       │         │ sampleDataSets[]││
│  │ usageCount      │         └─────────────────┘         │ isRequired      ││
│  │ createdBy (FK)  │                                     │ canDisable      ││
│  └─────────────────┘                                     └─────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ templateId (1:N)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MICROSITE SYSTEM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐         ┌─────────────────┐                            │
│  │    MICROSITE    │ 1     N │MICROSITE_SECTION│                            │
│  │─────────────────│────────▶│─────────────────│                            │
│  │ _id             │         │ _id             │                            │
│  │ slug            │         │ micrositeId(FK) │                            │
│  │ title           │         │ sectionId       │                            │
│  │ templateId (FK) │         │ type            │                            │
│  │ userId (FK)     │         │ order           │                            │
│  │ status          │         │ enabled         │                            │
│  │ colorScheme     │         │ values{}        │◀── User's actual content   │
│  │ fontPair        │         └─────────────────┘                            │
│  │ customDomain    │                                                        │
│  │ settings{}      │                                                        │
│  └────────┬────────┘                                                        │
│           │                                                                  │
│           │ micrositeId (1:N)                                               │
│           ▼                                                                  │
│  ┌─────────────────┐                                                        │
│  │      GUEST      │                                                        │
│  │─────────────────│                                                        │
│  │ _id             │                                                        │
│  │ micrositeId(FK) │                                                        │
│  │ name            │                                                        │
│  │ email           │                                                        │
│  │ attendance      │                                                        │
│  │ partySize       │                                                        │
│  │ dietaryNotes    │                                                        │
│  │ message (wish)  │                                                        │
│  │ isWish          │                                                        │
│  └─────────────────┘                                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Collection Details

#### 1. TEMPLATE Collection

**Purpose**: Master blueprint created by admin. Contains metadata about the template.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `slug` | String | Yes | URL-friendly unique identifier (e.g., "elegant-wedding-abc123") |
| `name` | String | Yes | Display name (e.g., "Elegant Wedding Invitation") |
| `description` | String | No | Template description for users |
| `category` | String | Yes | Category for filtering (Wedding, Birthday, Corporate, Party, Other) |
| `thumbnail` | String | No | URL to template preview image |
| `currentVersion` | Number | Yes | Current active version number (default: 1) |
| `isActive` | Boolean | Yes | Whether template is published and visible to users |
| `isPremium` | Boolean | Yes | Whether template requires premium subscription |
| `usageCount` | Number | Yes | Number of microsites created from this template |
| `createdBy` | ObjectId | Yes | Reference to User who created the template |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `slug` (unique), `category`, `isActive`, `name` (text search)

---

#### 2. TEMPLATE_VERSION Collection

**Purpose**: Stores design options (color schemes, fonts) and sample profiles for each template version. Allows template evolution while preserving old versions.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `templateId` | ObjectId | Yes | Reference to parent Template |
| `version` | Number | Yes | Version number (1, 2, 3...) |
| `colorSchemes` | Array | No | Available color schemes for this template |
| `colorSchemes[].id` | String | Yes | Unique identifier for the color scheme |
| `colorSchemes[].name` | String | Yes | Display name (e.g., "Rose Gold") |
| `colorSchemes[].primary` | String | Yes | Primary color hex code |
| `colorSchemes[].secondary` | String | Yes | Secondary color hex code |
| `colorSchemes[].accent` | String | No | Accent color hex code |
| `colorSchemes[].background` | String | No | Background color hex code |
| `colorSchemes[].text` | String | No | Text color hex code |
| `fontPairs` | Array | No | Available font combinations |
| `fontPairs[].id` | String | Yes | Unique identifier |
| `fontPairs[].name` | String | Yes | Display name (e.g., "Classic Serif") |
| `fontPairs[].heading` | String | Yes | Heading font family |
| `fontPairs[].body` | String | Yes | Body font family |
| `sampleProfiles` | Array | No | **Preview profiles for profile selection UI** |
| `sampleProfiles[].id` | String | Yes | Profile identifier (e.g., "classic", "modern") |
| `sampleProfiles[].name` | String | Yes | Display name (e.g., "Classic Romance") |
| `sampleProfiles[].description` | String | No | Profile description shown in selection modal |
| `defaultColorScheme` | String | No | Default color scheme ID |
| `defaultFontPair` | String | No | Default font pair ID |
| `changelog` | String | No | Description of changes in this version |
| `createdAt` | Date | Auto | Creation timestamp |

**Indexes**: `templateId`, `{ templateId, version }` (compound unique)

---

#### 3. TEMPLATE_SECTION Collection

**Purpose**: Defines individual sections within a template version. Each section has fields, sample data, and can have multiple sample data sets for different profiles.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `versionId` | ObjectId | Yes | Reference to parent TemplateVersion |
| `sectionId` | String | Yes | Unique section identifier (e.g., "sec_abc123") |
| `type` | String | Yes | Section type (hero, countdown, event_details, venue, gallery, story, rsvp, wishes, footer) |
| `name` | String | Yes | Display name (e.g., "Wedding Hero") |
| `description` | String | No | Section description |
| `order` | Number | Yes | Display order (0, 1, 2...) |
| `isRequired` | Boolean | Yes | Whether section cannot be disabled |
| `canDisable` | Boolean | Yes | Whether user can toggle section on/off |
| `fields` | Array | No | Field definitions for this section |
| `fields[].fieldId` | String | Yes | Unique field identifier |
| `fields[].key` | String | Yes | Field key used in values object |
| `fields[].label` | String | Yes | Display label |
| `fields[].type` | String | Yes | Field type (text, textarea, date, time, image, images, url) |
| `fields[].placeholder` | String | No | Input placeholder text |
| `fields[].validation` | Object | No | Validation rules (required, min, max, etc.) |
| `sampleValues` | Object | No | Default sample data for preview (legacy/fallback) |
| `sampleDataSets` | Array | No | **Multiple sample data sets for different profiles** |
| `sampleDataSets[].profileId` | String | Yes | Matches `sampleProfiles[].id` in TemplateVersion |
| `sampleDataSets[].values` | Object | Yes | Sample values for this profile |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `versionId`, `{ versionId, order }` (compound)

**Section Types Explained**:

| Type | Purpose | Key Fields |
|------|---------|------------|
| `hero` | Main banner with names, date, background image | groomName, brideName, weddingDate, heroImage, tagline (wedding) OR celebrantName, age, partyDate, heroImage (birthday) |
| `countdown` | Countdown timer to event | title, targetDate |
| `event_details` | Event schedule and details | ceremonyTime, ceremonyVenue, receptionTime, receptionVenue, dressCode |
| `venue` | Location information with map | venueName, address, venueImage, mapUrl, directions |
| `gallery` | Photo gallery with lightbox | title, images[] |
| `story` | Couple's story or event description | title, story, coupleImage |
| `rsvp` | RSVP form | title, deadline, maxGuests |
| `wishes` | Guestbook/wishes section | title |
| `footer` | Footer with contact info | message, email, phone, socialLinks |

---

#### 4. MICROSITE Collection

**Purpose**: User's personalized event site created from a template. Stores user's design choices and settings.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `slug` | String | Yes | URL-friendly unique identifier for public URL (/e/[slug]) |
| `title` | String | Yes | Site title (e.g., "John & Jane's Wedding") |
| `templateId` | ObjectId | Yes | Reference to source Template |
| `userId` | ObjectId | Yes | Reference to User who owns this site |
| `status` | String | Yes | Site status: "draft" or "published" |
| `colorScheme` | String | No | Selected color scheme ID |
| `fontPair` | String | No | Selected font pair ID |
| `customDomain` | String | No | Custom domain if configured |
| `settings` | Object | No | Additional settings (SEO, analytics, etc.) |
| `settings.seoTitle` | String | No | Custom SEO title |
| `settings.seoDescription` | String | No | Custom SEO description |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `slug` (unique), `userId`, `templateId`, `status`

---

#### 5. MICROSITE_SECTION Collection

**Purpose**: User's actual content for each section. Copied from template's sample data when microsite is created, then customized by user.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `micrositeId` | ObjectId | Yes | Reference to parent Microsite |
| `sectionId` | String | Yes | Matches template section's sectionId |
| `type` | String | Yes | Section type (copied from template) |
| `order` | Number | Yes | Display order |
| `enabled` | Boolean | Yes | Whether section is visible on public page |
| `values` | Object | Yes | **User's actual content** (names, dates, images, etc.) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `micrositeId`, `{ micrositeId, order }` (compound)

**Example `values` object for hero section**:
```json
{
  "groomName": "John",
  "brideName": "Jane",
  "tagline": "Two Hearts, One Love",
  "weddingDate": "2026-06-15",
  "heroImage": "https://images.unsplash.com/photo-..."
}
```

---

#### 6. GUEST Collection

**Purpose**: Stores RSVP responses and wishes/guestbook messages for a microsite.

| Column | Type | Required | Purpose |
|--------|------|----------|---------|
| `_id` | ObjectId | Auto | Primary key |
| `micrositeId` | ObjectId | Yes | Reference to parent Microsite |
| `name` | String | Yes | Guest's name |
| `email` | String | No | Guest's email (for RSVP) |
| `attendance` | String | No | RSVP status: "attending", "not_attending", "maybe" |
| `partySize` | Number | No | Number of guests in party |
| `dietaryNotes` | String | No | Dietary restrictions or notes |
| `message` | String | No | Wish/guestbook message |
| `isWish` | Boolean | Yes | true = wish/guestbook entry, false = RSVP response |
| `createdAt` | Date | Auto | Submission timestamp |

**Indexes**: `micrositeId`, `{ micrositeId, isWish }` (compound)

---

### Profile Selection Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROFILE SELECTION DATA FLOW                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. TEMPLATE CREATION (Admin)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ TemplateVersion.sampleProfiles = [                                      │
   │   { id: "classic", name: "Classic Romance", description: "..." },       │
   │   { id: "modern", name: "Modern Minimalist", description: "..." },      │
   │   { id: "rustic", name: "Rustic Charm", description: "..." }            │
   │ ]                                                                        │
   └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ TemplateSection.sampleDataSets = [                                      │
   │   { profileId: "classic", values: { groomName: "James", ... } },        │
   │   { profileId: "modern", values: { groomName: "Alex", ... } },          │
   │   { profileId: "rustic", values: { groomName: "William", ... } }        │
   │ ]                                                                        │
   └─────────────────────────────────────────────────────────────────────────┘

2. USER SELECTS TEMPLATE
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ Frontend fetches template details:                                       │
   │ GET /api/templates/:id                                                   │
   │                                                                          │
   │ Response includes:                                                       │
   │ - template.version.sampleProfiles (for dropdown)                        │
   │ - template.sections[].sampleDataSets (for data copying)                 │
   └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
3. PROFILE SELECTION MODAL
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ User sees modal with:                                                    │
   │ - Site Title input                                                       │
   │ - Profile selector (if sampleProfiles exist):                           │
   │   ○ Classic Romance - Traditional elegant wedding...                    │
   │   ● Modern Minimalist - Clean, contemporary... [SELECTED]               │
   │   ○ Rustic Charm - Outdoor garden wedding...                            │
   │                                                                          │
   │ User clicks "Create Site" with profileId: "modern"                      │
   └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
4. MICROSITE CREATION (Backend)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │ POST /api/microsites                                                     │
   │ Body: { templateId, title, profileId: "modern" }                        │
   │                                                                          │
   │ For each TemplateSection:                                                │
   │   1. Find matching sampleDataSet where profileId === "modern"           │
   │   2. Copy values to new MicrositeSection                                │
   │   3. If no match, fall back to sampleValues                             │
   │                                                                          │
   │ Result: MicrositeSection.values = { groomName: "Alex", ... }            │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow & Working Procedure

### Flow 1: Admin Creates Template

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ADMIN CREATES TEMPLATE                                                        │
└──────────────────────────────────────────────────────────────────────────────┘

1. Admin navigates to /dashboard/admin/templates/new
   │
   ▼
2. Admin fills template form:
   - Name: "Elegant Wedding Invitation"
   - Category: "Wedding"
   - Description: "A stunning wedding template..."
   - Thumbnail URL
   │
   ▼
3. Admin adds sections:
   - Hero (with fields: groomName, brideName, weddingDate, heroImage, tagline)
   - Countdown (with fields: title, targetDate)
   - Venue (with fields: venueName, address, mapUrl)
   - Gallery (with fields: title, images)
   - RSVP (with fields: title, deadline)
   │
   ▼
4. Admin configures design options:
   - Color Schemes: Rose Gold, Navy Blue, Forest Green
   - Font Pairs: Classic Serif, Modern Sans, Elegant Script
   │
   ▼
5. Admin adds sample profiles (optional):
   - Classic Romance: { groomName: "James", brideName: "Elizabeth", ... }
   - Modern Minimalist: { groomName: "Alex", brideName: "Jordan", ... }
   │
   ▼
6. Admin clicks "Save" → POST /api/templates
   │
   ▼
7. Backend creates:
   - Template document
   - TemplateVersion document (with colorSchemes, fontPairs, sampleProfiles)
   - TemplateSection documents (with fields, sampleValues, sampleDataSets)
   │
   ▼
8. Admin clicks "Publish" → PUT /api/templates/:id/publish
   - Sets template.isActive = true
```

### Flow 2: User Creates Microsite from Template

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USER CREATES MICROSITE                                                        │
└──────────────────────────────────────────────────────────────────────────────┘

1. User navigates to /dashboard/templates
   │
   ▼
2. User browses published templates (isActive: true)
   - GET /api/templates/published
   │
   ▼
3. User clicks "Use Template" on desired template
   │
   ▼
4. Frontend fetches template details:
   - GET /api/templates/:id
   - Receives: template, version (with sampleProfiles), sections
   │
   ▼
5. Profile Selection Modal appears:
   ┌────────────────────────────────────┐
   │ Create Your Site                   │
   │                                    │
   │ Site Title: [My Wedding Site    ]  │
   │                                    │
   │ Choose a Style:                    │
   │ ○ Classic Romance                  │
   │ ● Modern Minimalist [SELECTED]    │
   │ ○ Rustic Charm                     │
   │                                    │
   │ [Cancel]  [+ Create Site]          │
   └────────────────────────────────────┘
   │
   ▼
6. User selects profile and clicks "Create Site"
   - POST /api/microsites
   - Body: { templateId, title: "My Wedding Site", profileId: "modern" }
   │
   ▼
7. Backend creates microsite:
   a. Create Microsite document (status: "draft")
   b. For each TemplateSection:
      - Find sampleDataSet matching profileId
      - Create MicrositeSection with copied values
   c. Increment template.usageCount
   │
   ▼
8. User redirected to /dashboard/sites/:id/edit
```

### Flow 3: User Edits and Publishes Microsite

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ USER EDITS AND PUBLISHES MICROSITE                                           │
└──────────────────────────────────────────────────────────────────────────────┘

1. User on /dashboard/sites/:id/edit
   - GET /api/microsites/:id (with sections)
   │
   ▼
2. Site Editor displays:
   ┌────────────────────────────────────────────────────────────────┐
   │ My Wedding Site                              [Preview] [Publish]│
   │ draft                                                          │
   ├────────────────────────────────────────────────────────────────┤
   │ [Content] [Design] [Settings]                                  │
   │                                                                │
   │ Site Title: [My Wedding Site                               ]   │
   │                                                                │
   │ Sections:                                                      │
   │ ┌─────────────────────────────────────────────────────────┐   │
   │ │ ⋮⋮ Wedding Hero                              [Toggle ON] │   │
   │ │    Hero                                           ∨      │   │
   │ │    ─────────────────────────────────────────────────    │   │
   │ │    Groom Name: [John                              ]     │   │
   │ │    Bride Name: [Jane                              ]     │   │
   │ │    Tagline:    [Two Hearts, One Love              ]     │   │
   │ │    Date:       [2026-06-15                        ]     │   │
   │ │    Hero Image: [https://...                       ]     │   │
   │ └─────────────────────────────────────────────────────────┘   │
   │                                                                │
   │ ┌─────────────────────────────────────────────────────────┐   │
   │ │ ⋮⋮ Countdown                                 [Toggle ON] │   │
   │ │    ...                                                   │   │
   │ └─────────────────────────────────────────────────────────┘   │
   └────────────────────────────────────────────────────────────────┘
   │
   ▼
3. User edits content:
   - Changes names, dates, uploads images
   - Toggles sections on/off
   - Reorders sections (drag & drop)
   │
   ▼
4. User clicks "Update" → PUT /api/microsites/:id
   - Updates microsite and section values
   │
   ▼
5. User clicks "Publish" → PUT /api/microsites/:id/publish
   - Sets microsite.status = "published"
   │
   ▼
6. Site is now live at /e/[slug]
```

### Flow 4: Guest Views Public Page and RSVPs

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ GUEST VIEWS PUBLIC PAGE                                                       │
└──────────────────────────────────────────────────────────────────────────────┘

1. Guest visits /e/my-wedding-site-abc123
   │
   ▼
2. Frontend fetches public data:
   - GET /api/microsites/public/:slug
   - Returns: microsite, sections (enabled only), colorScheme, fontPair
   │
   ▼
3. EventSectionRenderer renders each section:
   - Hero with background image, names, date
   - Countdown timer
   - Venue with map link
   - Gallery with lightbox
   - RSVP form
   - Wishes section
   │
   ▼
4. Guest fills RSVP form:
   - Name, Email, Attendance, Party Size, Dietary Notes
   │
   ▼
5. Guest submits RSVP:
   - POST /api/microsites/:id/rsvp
   - Creates Guest document (isWish: false)
   │
   ▼
6. Guest leaves a wish:
   - POST /api/microsites/:id/wishes
   - Creates Guest document (isWish: true)
```

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Template Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/templates` | List all templates (admin) | Yes |
| GET | `/api/templates/published` | List published templates | Yes |
| GET | `/api/templates/:id` | Get template with version and sections | Yes |
| POST | `/api/templates` | Create new template | Yes |
| PUT | `/api/templates/:id` | Update template | Yes |
| DELETE | `/api/templates/:id` | Delete template | Yes |
| PUT | `/api/templates/:id/publish` | Publish template | Yes |
| PUT | `/api/templates/:id/unpublish` | Unpublish template | Yes |
| POST | `/api/templates/:id/duplicate` | Duplicate template | Yes |
| POST | `/api/templates/:id/sections` | Add section to template | Yes |
| PUT | `/api/templates/:id/sections/:sectionId` | Update section | Yes |
| DELETE | `/api/templates/:id/sections/:sectionId` | Delete section | Yes |

### Microsite Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/microsites` | List user's microsites | Yes |
| GET | `/api/microsites/:id` | Get microsite with sections | Yes |
| POST | `/api/microsites` | Create microsite from template | Yes |
| PUT | `/api/microsites/:id` | Update microsite | Yes |
| DELETE | `/api/microsites/:id` | Delete microsite | Yes |
| PUT | `/api/microsites/:id/publish` | Publish microsite | Yes |
| PUT | `/api/microsites/:id/unpublish` | Unpublish microsite | Yes |
| GET | `/api/microsites/public/:slug` | Get public microsite data | No |
| POST | `/api/microsites/:id/rsvp` | Submit RSVP | No |
| POST | `/api/microsites/:id/wishes` | Submit wish | No |
| GET | `/api/microsites/:id/guests` | Get guest list | Yes |

### Request/Response Examples

#### Create Microsite with Profile Selection

**Request:**
```http
POST /api/microsites
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "templateId": "694a8a4ec760d31d2ce8e0ef",
  "title": "John & Jane's Wedding",
  "profileId": "modern"
}
```

**Response:**
```json
{
  "microsite": {
    "_id": "694a8c1e8d3a74f06cc4c73c",
    "slug": "john-janes-wedding-d7fbfc53",
    "title": "John & Jane's Wedding",
    "templateId": "694a8a4ec760d31d2ce8e0ef",
    "userId": "6941536907d1ff55f5d4566a",
    "status": "draft",
    "createdAt": "2025-12-23T12:30:00.000Z"
  },
  "sections": [
    {
      "_id": "694a8c1e8d3a74f06cc4c73d",
      "micrositeId": "694a8c1e8d3a74f06cc4c73c",
      "sectionId": "sec_abc123",
      "type": "hero",
      "order": 0,
      "enabled": true,
      "values": {
        "groomName": "Alex",
        "brideName": "Jordan",
        "tagline": "Forever Starts Now",
        "weddingDate": "2026-08-20",
        "heroImage": "https://images.unsplash.com/photo-..."
      }
    }
  ]
}
```

---

## Installation Guide

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB 6.0+ (local or Docker)
- npm or yarn package manager
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/Shrishail20/devin.git
cd devin
```

### Step 2: Setup MongoDB

**Option A: Using Docker (Recommended)**
```bash
docker run -d --name evento-mongo -p 27017:27017 mongo:6.0
```

**Option B: Local MongoDB Installation**
- Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
- Start MongoDB service

### Step 3: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/evento
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
EOF

# Build TypeScript
npm run build

# Create demo templates (optional but recommended)
node scripts/create-demo-templates.js

# Start development server
npm run dev
```

Backend will be running at http://localhost:5000

### Step 4: Setup Frontend

```bash
cd ../frontend/evento

# Install dependencies
npm install

# Create environment file (optional - defaults work for local dev)
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

Frontend will be running at http://localhost:3000

### Step 5: Create Demo User

The demo templates script creates a demo user automatically:
- **Email**: demo@evento.com
- **Password**: demo123456

Or register a new user at http://localhost:3000/register

### Step 6: Verify Installation

1. Open http://localhost:3000 in your browser
2. Click "Login" and use demo credentials
3. Navigate to "Templates" - you should see Wedding and Birthday templates
4. Click "Use Template" on a template with "0 uses" to test profile selection

---

## Development Guide

### Running in Development Mode

**Terminal 1 - MongoDB (if using Docker):**
```bash
docker start evento-mongo
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend/evento
npm run dev
```

### Project Scripts

**Backend:**
| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `ts-node-dev src/index.ts` | Start dev server with hot reload |
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/index.js` | Start production server |

**Frontend:**
| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev` | Start dev server with hot reload |
| `npm run build` | `next build` | Build for production |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `next lint` | Run ESLint |

### Adding a New Section Type

1. **Define section type in backend** (`backend/src/models/TemplateSection.ts`):
   - Add type to enum if using strict typing

2. **Add renderer in frontend** (`frontend/evento/src/components/EventSectionRenderer.tsx`):
   ```tsx
   case 'new_section_type':
     const field1 = getValue('field1', '')
     const field2 = getValue('field2', '')
     
     return (
       <div className="...">
         {/* Section JSX */}
       </div>
     )
   ```

3. **Update demo templates script** (`backend/scripts/create-demo-templates.js`):
   - Add section definition with fields and sample values

### Environment Variables

**Backend (.env):**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `NODE_ENV` | No | development | Environment mode |

**Frontend (.env.local):**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | http://localhost:5000/api | Backend API URL |

### Troubleshooting

**Issue: MongoDB connection failed**
```
Solution: Ensure MongoDB is running
- Docker: docker start evento-mongo
- Local: sudo systemctl start mongod
```

**Issue: Port already in use**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Issue: Templates not showing profile selector**
```
Solution: Only templates created with sampleProfiles will show the selector.
Run: node scripts/create-demo-templates.js
Then use templates with "0 uses" count.
```

**Issue: Hero image not displaying**
```
Solution: Check field names in template section.
The renderer checks: heroImage, backgroundImage
Ensure one of these fields has a valid image URL.
```

---

## Appendix

### Color Scheme Example

```json
{
  "id": "rose-gold",
  "name": "Rose Gold",
  "primary": "#B76E79",
  "secondary": "#E8C4C4",
  "accent": "#D4A574",
  "background": "#FFF9F5",
  "text": "#2D2D2D",
  "textMuted": "#6B6B6B"
}
```

### Font Pair Example

```json
{
  "id": "classic-serif",
  "name": "Classic Serif",
  "heading": "Playfair Display",
  "body": "Lora",
  "headingWeight": 700,
  "bodyWeight": 400
}
```

### Sample Profile Example

```json
{
  "id": "classic",
  "name": "Classic Romance",
  "description": "Traditional elegant wedding with roses and soft colors"
}
```

### Sample Data Set Example

```json
{
  "profileId": "classic",
  "values": {
    "groomName": "James",
    "brideName": "Elizabeth",
    "tagline": "Two Hearts, One Love",
    "weddingDate": "2026-06-15",
    "heroImage": "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&q=90"
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: December 23, 2025  
**Author**: Devin (AI Software Engineer)  
**Repository**: https://github.com/Shrishail20/devin  
**PR**: https://github.com/Shrishail20/devin/pull/2
