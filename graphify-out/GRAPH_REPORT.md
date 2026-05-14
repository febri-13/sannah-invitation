# Graph Report - sannah-invitation  (2026-05-14)

## Corpus Check
- 32 files · ~7,769 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 110 nodes · 132 edges · 20 communities (14 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aabbc945`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 17 edges
2. `MEMORY.md - Project Akhirusannah (sannah-invitation)` - 12 edges
3. `createClient()` - 6 edges
4. `📋 Fitur yang Dibangun` - 5 edges
5. `🚀 Deployment` - 5 edges
6. `3. Database Schema (Supabase)` - 4 edges
7. `📱 Fitur UI Tambahan` - 4 edges
8. `getStats()` - 3 edges
9. `getTamu()` - 3 edges
10. `DashboardPage()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/tamu/route.ts → src/lib/supabase/admin.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/checkin/route.ts → src/lib/supabase/admin.ts
- `getStats()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/admin/dashboard/page.tsx → src/lib/supabase/admin.ts
- `getTamu()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/admin/dashboard/page.tsx → src/lib/supabase/admin.ts
- `UndanganPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/undangan/[token]/page.tsx → src/lib/supabase/admin.ts

## Communities (20 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (14): 👤 Akun Admin, 📝 Catatan Tambahan, code:env (NEXT_PUBLIC_SUPABASE_URL=https://djotfszjcnmjhcwhtxbe.supaba), CSV Upload, 🔒 File yang Di-ignore, 📱 Fitur UI Tambahan, ✅ Fitur yang Sudah Lengkap, 🔧 Konfigurasi Environment (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.23
Nodes (7): DELETE(), rsvpSchema, POST(), POST(), createAdminClient(), UndanganPage(), RSVPFormProps

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (6): tamuInputSchema, generateToken(), generateWhatsAppLink(), getBaseUrl(), GET(), POST()

### Community 3 - "Community 3"
Cohesion: 0.25
Nodes (7): POST(), CheckinInput, checkinSchema, LoginInput, loginSchema, RsvpInput, TamuInput

### Community 4 - "Community 4"
Cohesion: 0.25
Nodes (8): 1. Halaman & Routes, 2. API Routes, 3. Database Schema (Supabase), 4. UI Components, code:sql (- id: UUID (PK, auto-generated)), code:sql (- id: UUID (PK)), code:sql (- id: UUID (PK)), 📋 Fitur yang Dibangun

### Community 5 - "Community 5"
Cohesion: 0.39
Nodes (4): DashboardPage(), getStats(), getTamu(), createClient()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (6): code:bash (pnpm exec vercel --prod --yes), Deploy Command, 🚀 Deployment, Environment Variables (Vercel), GitHub Repository, Vercel Deployment

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (3): Tab, TamuData, TamuTableProps

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (4): code:bash (npm run dev), Deploy on Vercel, Getting Started, Learn More

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (3): amiri, metadata, nunito

## Knowledge Gaps
- **41 isolated node(s):** `eslintConfig`, `nextConfig`, `config`, `nunito`, `amiri` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Community 1` to `Community 2`, `Community 3`, `Community 5`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `MEMORY.md - Project Akhirusannah (sannah-invitation)` connect `Community 0` to `Community 4`, `Community 6`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `📋 Fitur yang Dibangun` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `config` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._