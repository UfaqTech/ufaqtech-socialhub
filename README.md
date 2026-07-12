# 🌐 UT-SocialHub (UfaqTech SocialHub)

UfaqTech SocialHub is a modern, responsive, and premium user-facing web directory designed to discover, explore, and share active community links—such as **WhatsApp groups, Telegram channels, and Discord servers**. Built with focus on structural optimization, an aesthetic glassmorphic layout, and a secure backend powered by Supabase.

---

## 🚀 Key Features

*   **Premium Floating Capsule Sidebar:** A detached, modern navigation UI featuring a sleek asymmetric squircle user avatar, smooth micro-interactions, dynamic multi-page tracking, and left-accent indicator states.
*   **Smart Link submission & Scraper:** An interactive submission flow that handles URL metadata fetching to automatically recognize platform types (WhatsApp, Telegram, etc.) with real-time field suggestions.
*   **Live Side-by-Side Card Preview:** Users can view an identical, responsive preview of their community listing card in real-time as they fill out the submission form.
*   **User Dashboard & Profile Analytics:** A clean center for regular users to track active link views, manage profile detail elements, and handle group visibilities natively using responsive toggle switches.
*   **Complete Technical SEO Pack:** Fully integrated with global Meta Tags, semantic structure setups, Structured Data (JSON-LD Schema Markup) for Google Rich Snippets, Open Graph cards for WhatsApp/Telegram previews, and automated sitemap rules.

---

## 🛠️ Tech Stack

*   **Frontend:** Semantic HTML5, Modern CSS3 (Custom properties, CSS Grid/Flexbox, `backdrop-filter` glassmorphism)
*   **Interactions:** Vanilla JavaScript (ES6+ asynchronous operations & state mutations)
*   **Backend-as-a-Service:** Supabase (Database Management & Secure Client-Side Authentication Providers)
*   **Icons & Assets:** FontAwesome v6 Solid/Brands suite

---

## 📁 Project Structure

```text
├── assets/
│   ├── css/
│   │   └── style.css            # Central global modern design architecture
│   ├── images/
│   │   └── logo.png             # Native fallback branded graphic identity assets
│   └── js/
│       ├── app.js               # Global shared layout operations 
│       ├── dashboard.js         # User state metrics & link control handling
│       └── supabase-config.js   # Supabase client core initialization setup
├── index.html                   # Main landing page & community exploration board
├── profile.html                 # Private user metrics and community list controller
├── submit.html                  # Live preview link entry point form portal
├── robots.txt                   # Search Engine crawler indexing rules configuration
└── sitemap.xml                  # Automated XML sitemap path definitions mapping