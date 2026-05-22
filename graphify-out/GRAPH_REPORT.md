# Graph Report - .  (2026-05-22)

## Corpus Check
- 100 files · ~86,633 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 465 nodes · 565 edges · 73 communities (36 shown, 37 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.82)
- Token cost: 6,500 input · 2,800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Dashboard & Tamu|Admin Dashboard & Tamu]]
- [[_COMMUNITY_Dashboard Charts & Analytics|Dashboard Charts & Analytics]]
- [[_COMMUNITY_Auth Middleware & Proxy|Auth Middleware & Proxy]]
- [[_COMMUNITY_Mock Admin Dashboard UI|Mock Admin Dashboard UI]]
- [[_COMMUNITY_Chart Components|Chart Components]]
- [[_COMMUNITY_Invitation Page & RSVP|Invitation Page & RSVP]]
- [[_COMMUNITY_Mock Browser Window UI|Mock Browser Window UI]]
- [[_COMMUNITY_Glassmorphism Design System|Glassmorphism Design System]]
- [[_COMMUNITY_Design Canvas UI|Design Canvas UI]]
- [[_COMMUNITY_Tamu Management|Tamu Management]]
- [[_COMMUNITY_Events & Settings|Events & Settings]]
- [[_COMMUNITY_Konten Undangan Editor|Konten Undangan Editor]]
- [[_COMMUNITY_Supabase Migrations - Schema|Supabase Migrations - Schema]]
- [[_COMMUNITY_Supabase Migrations - Pengaturan|Supabase Migrations - Pengaturan]]
- [[_COMMUNITY_WA Template & QR Scan|WA Template & QR Scan]]
- [[_COMMUNITY_Supabase Client Setup|Supabase Client Setup]]
- [[_COMMUNITY_Seed Scripts|Seed Scripts]]
- [[_COMMUNITY_Debug Scripts - Pengaturan|Debug Scripts - Pengaturan]]
- [[_COMMUNITY_Debug Scripts - State Check|Debug Scripts - State Check]]
- [[_COMMUNITY_Project Config (ESLint, Next)|Project Config (ESLint, Next)]]
- [[_COMMUNITY_Undangan Demo Page|Undangan Demo Page]]
- [[_COMMUNITY_API Routes - Tamu|API Routes - Tamu]]
- [[_COMMUNITY_API Routes - RSVP & Checkin|API Routes - RSVP & Checkin]]
- [[_COMMUNITY_API Routes - Admin|API Routes - Admin]]
- [[_COMMUNITY_API Routes - Konten Undangan|API Routes - Konten Undangan]]
- [[_COMMUNITY_Lib Utilities & Types|Lib Utilities & Types]]
- [[_COMMUNITY_Invitation Theme System|Invitation Theme System]]
- [[_COMMUNITY_Event Cookie|Event Cookie]]
- [[_COMMUNITY_API Routes - Events & Logo|API Routes - Events & Logo]]
- [[_COMMUNITY_Supabase Migrations - Sekolah|Supabase Migrations - Sekolah]]
- [[_COMMUNITY_Supabase Migrations - Events|Supabase Migrations - Events]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 34 edges
2. `AdminDashboard (glassmorphism)` - 14 edges
3. `createClient()` - 11 edges
4. `Project AKhirusannah memory/changelog` - 9 edges
5. `DashboardPage()` - 6 edges
6. `Database` - 5 edges
7. `KontenUndangan` - 5 edges
8. `Admin Dashboard HTML wrapper` - 5 edges
9. `ChromeTabBar` - 4 edges
10. `AdminLogin` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Admin Dashboard HTML wrapper` --calls--> `ChromeToolbar`  [INFERRED]
  docs/Admin Dashboard.html → docs/browser-window.jsx
- `Multi-school seed script` --references--> `WA template system (pengaturan table)`  [EXTRACTED]
  scripts/create-schools-and-admins.mjs → docs/MEMORY.md
- `Multi-school seed script` --references--> `Supabase client pattern (browser/server/admin)`  [EXTRACTED]
  scripts/create-schools-and-admins.mjs → docs/MEMORY.md
- `Single admin creation script` --references--> `Supabase client pattern (browser/server/admin)`  [EXTRACTED]
  scripts/create-admin.mjs → docs/MEMORY.md
- `Admin Dashboard HTML wrapper` --calls--> `ChromeTabBar`  [INFERRED]
  docs/Admin Dashboard.html → docs/browser-window.jsx

## Hyperedges (group relationships)
- **** — api_tamu_route, api_rsvp_route, api_checkin_route, api_generate_wa_route, undangan_token_page [INFERRED]
- **** — api_admin_settings_route, api_generate_wa_route, concept_rsvp_attendance [INFERRED]
- **** — api_admin_konten_undangan_route, api_admin_upload_logo_route, api_admin_events_route, api_admin_settings_route [INFERRED]

## Communities (73 total, 37 thin omitted)

### Community 0 - "Admin Dashboard & Tamu"
Cohesion: 0.07
Nodes (43): POST(), DashboardPage(), defaultAttendanceStats, defaultGenderStats, defaultStats, getAttendanceStats(), getGenderStats(), getStats() (+35 more)

### Community 1 - "Dashboard Charts & Analytics"
Cohesion: 0.07
Nodes (39): /api/admin/konten-undangan, /api/admin/events, /api/admin/upload-logo, /api/checkin, /api/tamu, /api/admin/konten-undangan, /api/admin/settings, Active event scoping via cookie (+31 more)

### Community 2 - "Auth Middleware & Proxy"
Cohesion: 0.06
Nodes (27): Checkin, CompositeTypes, Constants, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Pengaturan (+19 more)

### Community 3 - "Mock Admin Dashboard UI"
Cohesion: 0.07
Nodes (20): ActivityCard, AdminDashboard (glassmorphism), BgOrbs (background orbs), DonutChart (SVG), EventBanner, QuickActions, Sidebar (admin nav), StatsRow (+12 more)

### Community 4 - "Chart Components"
Cohesion: 0.08
Nodes (11): DashboardClientProps, EventBanner(), icons, useCountdownText(), CircleData, computeSegments(), DonutChart(), DonutSegment (+3 more)

### Community 5 - "Invitation Page & RSVP"
Cohesion: 0.12
Nodes (28): api_admin_events_route, api_admin_konten_undangan_route, api_admin_settings_route, api_admin_upload_logo_route, api_checkin_route, api_generate_wa_route, api_rsvp_route, api_signup_route (+20 more)

### Community 6 - "Mock Browser Window UI"
Cohesion: 0.09
Nodes (23): Blue glassmorphism design system, events table (multi-event support), konten_undangan table (1-per-event), Premium Glassmorphism (warm earthy), RSVP dual-selection (ortu + anak), Supabase client pattern (browser/server/admin), Theme template system (glass, gold, sage), WA template system (pengaturan table) (+15 more)

### Community 8 - "Design Canvas UI"
Cohesion: 0.16
Nodes (6): DC, DCCtx, dcFlatten(), DCSection(), DesignCanvas(), s

### Community 9 - "Tamu Management"
Cohesion: 0.36
Nodes (14): TamuData, createAdminClient, get_user_sekolah_id, 20250514070000_initial_schema, 20250514080000_add_columns, 20250514090000_fix_schema, 20250514100000_add_kehadiran_ortu_anak, 20250514110000_add_pengaturan_table (+6 more)

### Community 10 - "Events & Settings"
Cohesion: 0.23
Nodes (12): Middleware protects /admin/* and /scan/*, Supabase Auth, Table: checkin, Table: events, Table: konten_undangan, Table: rsvp, Table: sekolah, Table: tamu (+4 more)

### Community 11 - "Konten Undangan Editor"
Cohesion: 0.2
Nodes (6): AgendaItem, DEFAULT_AGENDA, ICON_OPTIONS, KontenData, Theme, THEMES

### Community 12 - "Supabase Migrations - Schema"
Cohesion: 0.24
Nodes (5): Tab, TamuData, TamuTableProps, generateWhatsAppLink(), getBaseUrl()

### Community 13 - "Supabase Migrations - Pengaturan"
Cohesion: 0.29
Nodes (5): amiri, cormorantGaramond, jetbrainsMono, metadata, plusJakarta

### Community 15 - "Supabase Client Setup"
Cohesion: 0.4
Nodes (5): Amiri, Cormorant Garamond, JetBrains Mono, Plus Jakarta Sans, RootLayout

### Community 18 - "Debug Scripts - State Check"
Cohesion: 0.83
Nodes (4): CornerAccent, Divider, HeaderArch, ornaments/index

### Community 19 - "Project Config (ESLint, Next)"
Cohesion: 0.67
Nodes (3): c, deletePengByKey(), ensurePeng()

### Community 20 - "Undangan Demo Page"
Cohesion: 0.67
Nodes (3): main(), parseArgs(), supabase

### Community 27 - "Invitation Theme System"
Cohesion: 0.67
Nodes (3): DELETE /api/tamu/{id}, TamuTable, generateWhatsAppLink

### Community 31 - "Supabase Migrations - Sekolah"
Cohesion: 0.67
Nodes (3): Admin Layout (wrapper), Scan Layout (wrapper), Matcher: /admin/:path* /scan/:path*

## Knowledge Gaps
- **113 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `c`, `all` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AdminDashboard (glassmorphism)` connect `Mock Admin Dashboard UI` to `Mock Browser Window UI`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Dashboard & Tamu` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Dashboard Charts & Analytics` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Auth Middleware & Proxy` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Mock Admin Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Chart Components` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._