import { useRef, useState } from "react";

const ITEMS = [
  {
    title: "Social Media Marketing",
    copy: "Strategy, content and community management built to grow reach and engagement across every feed.",
    img: "/assets/project/project1.jpg",
  },
  {
    title: "Performance Marketing",
    copy: "Google and Meta Ads with sharp targeting, tight budgets and creative tuned to convert.",
    img: "/assets/project/project2.jpg",
  },
  {
    title: "Website Development",
    copy: "Custom, responsive sites: design-led, commerce-ready and built to last.",
    img: "/assets/project/project3.jpg",
  },
  {
    title: "Search Engine Optimization",
    copy: "Technical audits, local SEO, link building and content that moves you up the rankings.",
    img: "/assets/project/project4.jpg",
  },
  {
    title: "Branding & Content Planning",
    copy: "Brand identity, voice and content calendars that keep every channel on-message.",
    img: "/assets/project/project5.jpg",
  },
  {
    title: "E-Commerce Listings",
    copy: "Product pages, platform integrations and listing optimization across marketplaces and quickcommerce.",
    img: "/assets/project/project6.jpg",
  },
];

export default function FeaturedWork() {
  const [active, setActive] = useState(null);
  const rootRef = useRef(null);
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card) return;
    const rect = root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.transform = `translate(${x}px, ${y}px)`;
  };

  const item = active !== null ? ITEMS[active] : null;

  return (
    <section
      className="featured-work"
      ref={rootRef}
      onMouseMove={handleMove}
    >
      <div className="featured-titles">
        <div className="featured-title-wrapper featured-title-heading">
          <h1 className="featured-title">Services</h1>
        </div>

        {ITEMS.map((it, i) => (
          <div
            key={it.title}
            className="featured-title-wrapper"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <h1 className="featured-title">{it.title}</h1>
          </div>
        ))}
      </div>

      <div
        ref={cardRef}
        className={`featured-card${item ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        {item && (
          <>
            <div className="featured-card-img">
              <img src={item.img} alt="" />
            </div>
            <p className="featured-card-copy">{item.copy}</p>
          </>
        )}
      </div>
    </section>
  );
}
