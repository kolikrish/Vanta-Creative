import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-cta">
        <h2 className="footer-heading">
          Grow with us.<br />
          Start your journey today.
        </h2>
        <div className="footer-actions">
          <a href="/contact" className="btn-get-started">
            Get Started <span>&gt;</span>
          </a>
          <a href="/about" className="btn-learn-more">
            Learn More
          </a>
        </div>
      </div>

      <div className="footer-inner">
        <div className="footer-left">
          <p className="footer-brand">Vanta Creative</p>
          <a href="mailto:contact@vantacreative.com" className="footer-email">
            contact@vantacreative.com
          </a>
        </div>
        
        <div className="footer-right">
          <div className="footer-col">
            <h4 className="footer-col-title">Menu</h4>
            <nav className="footer-nav">
              <a href="/solutions">Solutions</a>
              <a href="/features">Features</a>
              <a href="/ai-power">AI Power</a>
              <a href="/pricing">Pricing</a>
            </nav>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-col-title">Socials</h4>
            <nav className="footer-nav">
              <a href="https://instagram.com/marketingbyvantacreative" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://linkedin.com/company/marketingbyvantacreative" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://x.com/vantacreative" target="_blank" rel="noreferrer">X</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
