export const testimonials = [
  {
    quote: "Vanta Creative treats our growth like their own. The creative output is relentless and the numbers keep moving in the right direction.",
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

export const navLinks = [
  { to: "/", label: "Home", num: "01" },
  { to: "/services", label: "Services", num: "02" },
  { to: "/work", label: "Work", num: "03" },
  { to: "/brands", label: "Brands", num: "04" },
  { to: "/about", label: "Studio", num: "05" },
  { to: "/contact", label: "Contact", num: "06" }
];
