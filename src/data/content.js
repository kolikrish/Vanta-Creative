// 6 services — mirrors the home page WhatWeDo puzzle, so /services reads
// with the same vocabulary as the home page. Each service also lists the
// platforms / tools we run it on, rendered as a logo grid on the
// Services page.
export const services = [
  {
    id: "01",
    title: "Branding & Content Planning",
    tagline: "Identity systems and editorial calendars with one unmistakable voice.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    copy: "Identity systems and editorial calendars that turn your voice into a steady publishing rhythm across every channel, even when no one is watching.",
    platforms: [
      { name: "Figma",         logo: "https://api.iconify.design/logos:figma.svg" },
      { name: "Illustrator",   logo: "https://api.iconify.design/logos:adobe-illustrator.svg" },
      { name: "Photoshop",     logo: "https://api.iconify.design/logos:adobe-photoshop.svg" },
      { name: "Canva",         logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Canva_logo.svg" },
      { name: "InDesign",      logo: "https://api.iconify.design/logos:adobe-indesign.svg" },
      { name: "Adobe XD",      logo: "https://api.iconify.design/logos:adobe-xd.svg" },
      { name: "After Effects", logo: "https://api.iconify.design/logos:adobe-after-effects.svg" },
      { name: "Sketch",        logo: "https://api.iconify.design/logos:sketch.svg" },
      { name: "Behance",       logo: "https://api.iconify.design/logos:behance.svg" },
      { name: "Dribbble",      logo: "https://api.iconify.design/logos:dribbble-icon.svg" },
      { name: "Lightroom",     logo: "https://api.iconify.design/logos:adobe-lightroom.svg" },
      { name: "Notion",        logo: "https://api.iconify.design/logos:notion-icon.svg" }
    ]
  },
  {
    id: "02",
    title: "Social & Performance",
    tagline: "Content, community and paid media run as one engine: daily presence, accountable growth.",
    image: "https://images.unsplash.com/photo-1535303311164-664fc9ec6532?auto=format&fit=crop&w=900&q=80",
    copy: "A daily social presence paired with paid media built around CAC, ROAS and the funnel, content, community and campaigns moving in the same direction. Always-on, accountable, engineered for compounding.",
    platforms: [
      { name: "Instagram", logo: "https://api.iconify.design/logos:instagram-icon.svg" },
      { name: "Facebook",  logo: "https://api.iconify.design/logos:facebook.svg" },
      { name: "X",         logo: "https://api.iconify.design/logos:x.svg" },
      { name: "LinkedIn",  logo: "https://api.iconify.design/logos:linkedin-icon.svg" },
      { name: "YouTube",   logo: "https://api.iconify.design/logos:youtube-icon.svg" },
      { name: "TikTok",    logo: "https://api.iconify.design/logos:tiktok-icon.svg" },
      { name: "Snapchat",  logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Snap_Inc._logo.svg" },
      { name: "WhatsApp",  logo: "https://api.iconify.design/logos:whatsapp-icon.svg" },
      { name: "Threads",   logo: "https://api.iconify.design/logos:threads-icon.svg" },
      { name: "Pinterest", logo: "https://api.iconify.design/logos:pinterest.svg" },
      { name: "Meta",      logo: "https://api.iconify.design/logos:meta-icon.svg" },
      { name: "Reddit",    logo: "https://api.iconify.design/logos:reddit-icon.svg" },
      { name: "Telegram",  logo: "https://api.iconify.design/logos:telegram.svg" },
      { name: "Discord",   logo: "https://api.iconify.design/logos:discord-icon.svg" },
      { name: "Twitch",    logo: "https://api.iconify.design/logos:twitch.svg" },
      { name: "Mastodon",  logo: "https://api.iconify.design/logos:mastodon-icon.svg" },
      { name: "Bluesky",   logo: "https://api.iconify.design/logos:bluesky.svg" }
    ]
  },
  {
    id: "03",
    title: "Website Development",
    tagline: "Fast, accessible, considered websites that scale with the business.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    copy: "Fast, accessible, considered websites, built to convert today and crafted to scale as your business grows. Design systems, headless stacks, performance budgets.",
    platforms: [
      { name: "Shopify",     logo: "https://api.iconify.design/logos:shopify.svg" },
      { name: "WordPress",   logo: "https://api.iconify.design/logos:wordpress-icon.svg" },
      { name: "Webflow",     logo: "https://api.iconify.design/logos:webflow.svg" },
      { name: "React",       logo: "https://api.iconify.design/logos:react.svg" },
      { name: "Next.js",     logo: "https://api.iconify.design/logos:nextjs-icon.svg" },
      { name: "Framer",      logo: "https://api.iconify.design/logos:framer.svg" },
      { name: "Wix",         logo: "https://api.iconify.design/logos:wix.svg" },
      { name: "Tailwind",    logo: "https://api.iconify.design/logos:tailwindcss-icon.svg" },
      { name: "HTML5",       logo: "https://api.iconify.design/logos:html-5.svg" },
      { name: "CSS3",        logo: "https://api.iconify.design/logos:css-3.svg" },
      { name: "JavaScript",  logo: "https://api.iconify.design/logos:javascript.svg" },
      { name: "TypeScript",  logo: "https://api.iconify.design/logos:typescript-icon.svg" },
      { name: "GitHub",      logo: "https://api.iconify.design/logos:github-icon.svg" },
      { name: "Vercel",      logo: "https://api.iconify.design/logos:vercel-icon.svg" },
      { name: "Squarespace", logo: "https://api.iconify.design/logos:squarespace.svg" },
      { name: "Astro",       logo: "https://api.iconify.design/logos:astro-icon.svg" },
      { name: "Vite",        logo: "https://api.iconify.design/logos:vite.svg" }
    ]
  },
  {
    id: "04",
    title: "E-Commerce Listings & Optimisation",
    tagline: "Catalogue, copy and storefront tuning that lifts discoverability and lifetime value.",
    image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=900&q=80",
    copy: "Catalogue copy, imagery, and storefront tuning that lifts discoverability, add-to-cart, and lifetime value across Amazon, Flipkart, Shopify and beyond.",
    platforms: [
      { name: "Amazon",    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_logo.svg" },
      { name: "Flipkart",  logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Flipkart_logo_(2026).svg" },
      { name: "Myntra",    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/65c5da9f878952603e370d03_Myntra-Logo_1.svg" },
      { name: "Shopify",   logo: "https://api.iconify.design/logos:shopify.svg" },
      { name: "Blinkit",   logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Blinkit-yellow-app-icon.svg" },
      { name: "Meesho",    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Meesho_logo.png" },
      { name: "Nykaa",     logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Nykaa_New_Logo.svg" },
      { name: "Swiggy",    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Swiggy_logo.png" },
      { name: "Zomato",    logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Zomato_Logo.svg" },
      { name: "Snapdeal",  logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Snapdeal_New_Logo.svg" },
      { name: "Mailchimp", logo: "https://api.iconify.design/logos:mailchimp.svg" },
      { name: "HubSpot",   logo: "https://api.iconify.design/logos:hubspot.svg" }
    ]
  },
  {
    id: "05",
    title: "SEO / SEM",
    tagline: "Organic and paid search working as one engine: long game and short.",
    image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=900&q=80",
    copy: "Organic visibility paired with paid search: the long game and the short game, working as one engine. Technical audits, topical authority and SERP-ready content.",
    platforms: [
      { name: "Google Ads",     logo: "https://api.iconify.design/logos:google-ads.svg" },
      { name: "Analytics",      logo: "https://api.iconify.design/logos:google-analytics.svg" },
      { name: "Search Console", logo: "https://api.iconify.design/logos:google-search-console.svg" },
      { name: "Google",         logo: "https://api.iconify.design/logos:google-icon.svg" },
      { name: "Bing",           logo: "https://api.iconify.design/logos:bing.svg" },
      { name: "SEMrush",        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Semrush_logo.svg" },
      { name: "Ahrefs",         logo: "https://svgl.app/library/ahrefs.svg" },
      { name: "Yoast",          logo: "https://api.iconify.design/simple-icons:yoast.svg?color=%23a4286a" },
      { name: "Tag Manager",    logo: "https://api.iconify.design/logos:google-tag-manager.svg" },
      { name: "Hotjar",         logo: "https://api.iconify.design/logos:hotjar.svg" },
      { name: "Mixpanel",       logo: "https://api.iconify.design/logos:mixpanel.svg" },
      { name: "HubSpot",        logo: "https://api.iconify.design/logos:hubspot.svg" },
      { name: "Mailchimp",      logo: "https://api.iconify.design/logos:mailchimp.svg" }
    ]
  },
  {
    id: "06",
    title: "Production Shoot",
    tagline: "On-location and studio shoots briefed to the channel, captured for performance.",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
    copy: "Studio and on-location shoots, products, lifestyle, brand films, briefed to the channel, captured for the brief, and edited so every frame earns its place.",
    platforms: [
      { name: "Premiere Pro",    logo: "https://api.iconify.design/logos:adobe-premiere.svg" },
      { name: "After Effects",   logo: "https://api.iconify.design/logos:adobe-after-effects.svg" },
      { name: "DaVinci Resolve", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/DaVinci_Resolve_17_logo.svg" },
      { name: "Lightroom",       logo: "https://api.iconify.design/logos:adobe-lightroom.svg" },
      { name: "Photoshop",       logo: "https://api.iconify.design/logos:adobe-photoshop.svg" },
      { name: "YouTube",         logo: "https://api.iconify.design/logos:youtube-icon.svg" },
      { name: "Vimeo",           logo: "https://api.iconify.design/logos:vimeo.svg" },
      { name: "Reels",           logo: "https://api.iconify.design/logos:instagram-icon.svg" },
      { name: "Movie Camera",    logo: "https://api.iconify.design/noto:movie-camera.svg" },
      { name: "Clapper Board",   logo: "https://api.iconify.design/noto:clapper-board.svg" },
      { name: "Film Reel",       logo: "https://api.iconify.design/noto:film-projector.svg" },
      { name: "Film Frames",     logo: "https://api.iconify.design/noto:film-frames.svg" },
      { name: "Camera",          logo: "https://api.iconify.design/noto:camera-with-flash.svg" },
      { name: "Studio Mic",      logo: "https://api.iconify.design/noto:studio-microphone.svg" },
      { name: "Television",      logo: "https://api.iconify.design/noto:television.svg" },
      { name: "Tape",            logo: "https://api.iconify.design/noto:videocassette.svg" }
    ]
  }
];

// Mirrors the categories shown in the home page Services.jsx coverflow.
export const carouselItems = [
  {
    id: "01",
    title: "Instagram Posts",
    tagline: "Single-frame creatives engineered to stop the scroll.",
    tags: ["single posts, typography, campaign design"],
    url: "https://www.marketingbycircle.com/instagramposts"
  },
  {
    id: "02",
    title: "Instagram Stories",
    tagline: "Vertical narratives that keep audiences swiping forward.",
    tags: ["stories, vertical format, creative curation"],
    url: "https://www.marketingbycircle.com/instgramstories"
  },
  {
    id: "03",
    title: "Curated Feeds",
    tagline: "Cohesive grids that read like a magazine cover.",
    tags: ["grid design, visual identity, feed curation"],
    url: "https://www.marketingbycircle.com/instagramfeed"
  },
  {
    id: "04",
    title: "Reels & Short Video",
    tagline: "Short-form video built for the algorithm.",
    tags: ["reels, motion, edit"],
    url: "https://www.marketingbycircle.com/reels"
  },
  {
    id: "05",
    title: "Brand Identity",
    tagline: "Identity systems with a voice you'll recognise anywhere.",
    tags: ["identity, logo, system"],
    url: "https://www.marketingbycircle.com/branding"
  },
  {
    id: "06",
    title: "Analytics Dashboards",
    tagline: "Reporting frames that make growth measurable at a glance.",
    stats: [
      { v: "20+", k: "Clients" },
      { v: "5+",  k: "Social Handles" }
    ],
    services: ["META Ads", "Google Ads", "Analytics"],
    tags: ["meta ads, google ads, analytics"],
    url: "https://www.marketingbycircle.com/analytics"
  }
];

export const archive = [
  { name: "Shift in Design", year: "2024", images: ["img1"] },
  { name: "Evelyn", year: "2021", images: ["img2"] },
  { name: "Echo", year: "2022", images: ["img3", "img4", "img5"] },
  { name: "Beyond Borders", year: "2024", images: ["img6", "img7", "img8", "img9"] },
  { name: "Artifact", year: "2020", images: ["img10", "img11", "img12"] },
  { name: "Legacy Showcase", year: "2021", images: ["img13", "img14", "img15"] },
  { name: "Waveform", year: "2019", images: ["img16", "img17", "img18", "img19"] },
  { name: "Axis", year: "2024", images: ["img20", "img21", "img22", "img23"] },
  { name: "Capsule", year: "2023", images: ["img24", "img25", "img26"] },
  { name: "Cobalt Collective", year: "2018", images: ["img27", "img28", "img29", "img30"] },
  { name: "Nightfall", year: "2021", images: ["img31", "img32", "img33"] },
  { name: "Sprout", year: "2017", images: ["img34", "img35"] }
];

export const testimonials = [
  {
    quote: "Circle treats our growth like their own. The creative output is relentless and the numbers keep moving in the right direction.",
    author: "Priya Bindal",
    role: "Head of Brand, Investitute"
  },
  {
    quote: "The only agency we have worked with that speaks brand and performance in the same sentence, without flinching.",
    author: "Marco de Vries",
    role: "Founder, Northbound"
  },
  {
    quote: "They shipped in three weeks what our previous team could not deliver in six months.",
    author: "Hana Okafor",
    role: "CMO, Halcyon Hotels"
  }
];

export const clients = [
  { name: "Park Avenue",           logo: "/logos/park-avenue.png" },
  { name: "Pro Brew Republic",     logo: "/logos/pro-brew-republic.jpeg" },
  { name: "Madmix",                logo: "/logos/madmix.png" },
  { name: "Park Avenue Beer Shampoo", logo: "/logos/park-avenue-beer-shampoo.png" },
  { name: "CamPure",               logo: "/logos/campure.jpg" },
  { name: "Tushar Enterprises",    logo: "/logos/tushar.png" },
  { name: "Zawaa",                 logo: "/logos/zawaa.jpg" },
  { name: "Adam's Ale",            logo: "/logos/adams-ale.jpg" },
  { name: "Currygram",             logo: "/logos/currygram.png" },
  { name: "Exprto",                logo: "/logos/exprto.webp" },
  { name: "Investitute",           logo: "/logos/investitute.jpg" },
  { name: "Eduvest Connect",       logo: "/logos/eduvest-connect.png" },
  { name: "SRF",                   logo: "/logos/srf.png" },
  { name: "Outrider",              logo: "/logos/outrider.webp" },
  { name: "Swastik Habitates",     logo: "/logos/swastik.png" },
  { name: "Niket Mangal Group",    logo: "/logos/nm-group.png" },
];

/* Brands shown on the home-page honeycomb — the 17 client logos
   the user supplied (extracted from Client Logos.zip on the
   desktop, copied to /public/logos/new-clients/). Ordered with
   the highest-profile / most-recognised names in the top two rows
   so a first-time visitor lands on flagship references first.
   Pattern fills 5+4+5+3 with the last orb slot left empty. */
export const homeClients = [
  // Row 1 (5 orbs) — flagship names.
  { name: "Park Avenue Beer Shampoo",     logo: "/logos/new-clients/park-avenue-beer-shampoo.png" },
  { name: "FICCI Flo",                    logo: "/logos/new-clients/ficci-flo.png" },
  { name: "Round Table India",            logo: "/logos/new-clients/round-table-india.png" },
  { name: "Indore Management Association",logo: "/logos/new-clients/indore-management-association.png" },
  { name: "Conscious Food",               logo: "/logos/new-clients/conscious-food.png" },
  // Row 2 (4 orbs) — rest of the top tier.
  { name: "Aggarwal Namkeen",             logo: "/logos/new-clients/aggarwal-namkeen.png" },
  { name: "CamPure",                      logo: "/logos/new-clients/campure.png" },
  { name: "Adam's Ale",                   logo: "/logos/new-clients/adams-ale.png" },
  { name: "Pro Brew Republic",            logo: "/logos/new-clients/pro-brew-republic.png" },
  // Row 3 (5 orbs) — strong regional / category brands.
  { name: "Madmix",                       logo: "/logos/new-clients/madmix.png" },
  { name: "Urban Theka",                  logo: "/logos/new-clients/urban-theka.png" },
  { name: "Vaayu",                        logo: "/logos/new-clients/vaayu.png" },
  { name: "Whites of London",             logo: "/logos/new-clients/whites-of-london.png" },
  { name: "Swastik Habitates",            logo: "/logos/new-clients/swastik-habitates.png" },
  // Row 4 (4 orbs) — niche / regional partners.
  { name: "Zawaa",                        logo: "/logos/new-clients/zawaa.png" },
  { name: "Cosmafood UAE",                logo: "/logos/new-clients/cosmafood-uae.png" },
  { name: "Shree Balaji Bhumi Solution",  logo: "/logos/new-clients/shree-balaji-bhumi.png" },
];

/* Featured case-study brands shown on /brands. Each one renders as a
   card with the logo + the scope of work + a stand-out metric, so the
   page reads as "what we shipped" instead of just a wall of logos. */
export const featuredBrands = [
  {
    name: "Zawaa Foods",
    logo: "/logos/new-clients/zawaa.png",
    industry: "FMCG / Food",
    scope: ["E-commerce", "Performance Ads", "Social Media"],
    stat: { v: "+95%", k: "Sales lift (1 yr)" },
    note: "Full-stack D2C growth program — sustained 95% YoY sales lift.",
    accent: "var(--c-pink)",
  },
  {
    name: "Bamboosa",
    logo: "/logos/fmcg/6.png",
    industry: "FMCG / Sustainability",
    scope: ["Amazon Ads", "Listings", "Performance Marketing"],
    stat: { v: "−74%", k: "TACoS reduction" },
    note: "Amazon listings + Ads overhaul cut TACoS by nearly three-quarters.",
    accent: "var(--c-yellow)",
  },
  {
    name: "Cosmafood",
    logo: "/logos/new-clients/cosmafood-uae.png",
    industry: "FMCG / Food",
    scope: ["Performance Ads", "Brand Strategy", "Social Media"],
    stat: { v: "8.65×", k: "Blended ROAS" },
    note: "Performance-led campaigns landing a blended 8.65× ROAS.",
    accent: "var(--c-mint)",
  },
  {
    name: "NM Group",
    logo: "/logos/real-estate/1.png",
    industry: "Real Estate",
    scope: ["Lead Gen", "Performance Ads", "Website"],
    stat: { v: "−60%", k: "Cost per lead" },
    note: "Targeted lead engine — cost per qualified lead down 60%.",
    accent: "var(--c-blue)",
  },
  {
    name: "Adam's Ale",
    logo: "/logos/new-clients/adams-ale.png",
    industry: "Hospitality",
    scope: ["Brand Identity", "Social Media", "Content"],
    stat: { v: "20M+", k: "Organic reach / mo" },
    note: "Content-first social play drove 20 M+ organic reach in a single month.",
    accent: "var(--c-red)",
  },
  {
    name: "Aggarwal Namkeen",
    logo: "/logos/new-clients/aggarwal-namkeen.png",
    industry: "FMCG / Snacks",
    scope: ["Social Media", "Content", "Community"],
    stat: { v: "1,500+", k: "Organic comments / post" },
    note: "Community-building post landed 1,500+ organic comments on a single drop.",
    accent: "var(--c-pink)",
  },
];

/* Headline numbers shown above the featured-brand grid on /brands.
   These summarise the agency's footprint across the full client list,
   not a single account. */
/* Roster-level metrics shown on /brands. Numbers + labels are the
   SAME canonical set used on the home Reveal stats and the About
   page so the figure shows consistently everywhere on the site. */
export const brandsStats = [
  { v: "40",  sup: "+", k: "Clients Onboard" },
  { v: "12",  sup: "+", k: "Industries Served" },
  { v: "800", sup: "+", k: "Performance Campaigns" },
  { v: "6",   sup: "+", k: "Years of Experience" },
];

/* What industries the brands span — drives the small pill row on the
   /brands page so visitors see the breadth at a glance. */
export const brandIndustries = [
  "FMCG", "Hospitality", "Healthcare", "Fashion",
  "Education", "Real Estate", "Home & Kitchen", "Personal Care",
  "Management", "Quick-commerce", "D2C",
];

export const navLinks = [
  { to: "/", label: "Home", num: "01" },
  { to: "/services", label: "Services", num: "02" },
  { to: "/work", label: "Work", num: "03" },
  { to: "/brands", label: "Brands", num: "04" },
  { to: "/about", label: "Studio", num: "05" },
  { to: "/contact", label: "Contact", num: "06" }
];
