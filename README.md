🏗️ 1. Technical Architecture
Framework: Next.js 16 (utilizing App Router and Turbopack for lightning-fast HMR).

Database: Neon (PostgreSQL) via the @neondatabase/serverless driver for low-latency edge data fetching.

Editor Engine: TipTap (Headless Framework) with custom extensions for Underline, CodeBlocks, and Placeholders.

Styling: Tailwind CSS + Typography Plugin (prose-invert) for professional dark-mode typesetting.

Security: Middleware-based password gate with 10-minute sliding session cookies.

🚀 2. Core Functionality & Features
A. The "Pro Dark" Editor
Reactive Toolbar: High-contrast buttons that glow blue when a style (Bold, Italic, <u>Underline</u>, Heading 2, Bullet List, or Code) is active at the cursor position.

Drafting Mode: An "infinite canvas" feel with prose-invert and forced white text (prose-strong:text-white) for maximum readability in dark mode.

Intelligent Placeholders: Context-aware prompts that disappear the moment you start writing.

B. The Dual-State Entry System
Drafts (Editable): Entries saved with a status: 'draft'. Clicking these from the sidebar re-populates the editor for continued writing.

Archive (Read-Only): Once "Committed," an entry’s status flips to published. These are rendered as static, immutable HTML to prevent accidental history modification.

The Transition Logic: Moving a draft to the archive updates the existing database row rather than creating a duplicate, keeping your ID history clean.

C. Data Safety & Synchronization
3-Minute Cloud Heartbeat: An automated background process that syncs your active editor content to the database every 180 seconds.

Sync Indicator: A pulsing blue dot and "Syncing..." status in the header to provide visual confirmation of data safety.

Local Resilience: The app checks for the latest draft on mount, ensuring you never lose work if you accidentally close a tab.

D. Navigation & Organization
Segmented Sidebar:

Drafts Section: Shows pending entries with a ✎ icon and a HH:MM AM/PM timestamp.

Archive Section: Shows committed entries with a ◈ icon and a Date - Time format.

Time-Sensitive Sorting: Both sections utilize a DESC (Descending) sort order, placing the most recent thoughts at the top.

New Entry Protocol: A dedicated sidebar button that clears the editor state and resets the workspace for a fresh start.

🎨 3. UI/UX Design Standards
Dark Mode Palette: Base background of #050505 with high-elevation cards at #0a0a0a.

Notion-Inspired Layout: A fixed navigation sidebar on the left and a centered, scrollable "infinite" canvas on the right.

Monospace Utility: Use of Geist Mono for timestamps and system labels to provide a technical, "logbook" feel.

Branding: Custom-designed Feather Pen SVG icon and a unique metadata title (Journal.).

🔒 4. Security Model
Password Gateway: A server-side environment variable (JOURNAL_PASSWORD) validates all access.

Sliding Session: Every interaction resets the 10-minute cookie timer, ensuring the app stays open while you are active but locks automatically when you walk away.

Path Protection: Middleware prevents unauthenticated users from even viewing the static assets or internal actions of the journal.

🛠️ 5. Maintenance & Scalability
Server Actions: All database interactions are handled via use server actions, keeping your API keys and SQL queries hidden from the browser.

Path Revalidation: revalidatePath('/') ensures that as soon as you save or publish, the sidebar reflects the changes without a manual page refresh.
