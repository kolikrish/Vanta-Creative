import Clients from "../components/sections/Clients.jsx";
import BrandsShowcase from "../components/sections/BrandsShowcase.jsx";
import HandwriteText from "../components/fx/HandwriteText.jsx";
import BlurInText from "../components/fx/BlurInText.jsx";
import Footer from "../components/sections/Footer.jsx";

export default function BrandsPage() {
  return (
    <>
      <div className="brands-page">
        <section className="brands-page-hero">
          <div className="brands-page-hero-grid">
            <div className="brands-page-hero-left">
              {/* Hero title removed per request. */}
            </div>

            <div className="brands-page-hero-right">
              <BlurInText
                as="p"
                split="words"
                stagger={0.02}
                blur={10}
                className="brands-page-copy"
              >
                40+ partners across FMCG, hospitality, healthcare, fashion,
                education and real estate. Each one a long-running relationship,
                content, performance and storefront, end to end.
              </BlurInText>

              <p className="brands-page-copy brands-page-copy-mute">
                Scroll for the honeycomb.
              </p>
            </div>
          </div>

          <HandwriteText className="page-signature">Brands</HandwriteText>
        </section>

        <BrandsShowcase />
        <Clients
          eyebrow="[Full roster · 40+ brands]"
          heading="Every brand we've shipped with."
        />
      </div>
      <Footer />
    </>
  );
}
