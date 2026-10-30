import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap Architecture | Subham General Store',
  description: 'Explore the structural navigation grid of Subham General Store’s ecosystem, services, blueprints, and insights.',
};

export default function SitemapPage() {
  const sitemapData = [
    {
      title: "Core Ecosystem",
      links: [
        { name: "Home Dashboard", path: "/" },
        { name: "Company Profile", path: "/company" },
        { name: "Contact Desk", path: "/contact" },
        { name: "Careers & Talents", path: "/careers" }
      ]
    },
    {
      title: "Digital Formulations",
      links: [
        { name: "Branding & Creative Design", path: "/service" },
        { name: "High-Tier Web & App Engineering", path: "/service" },
        { name: "Omnichannel Digital Marketing", path: "/service" }
      ]
    },
    {
      title: "Compliance & Knowledge",
      links: [
        { name: "Strategic Agency Blog", path: "/blog" },
        { name: "Privacy & Data Regulations", path: "/privacy-policy" },
        { name: "Terms of Engagement", path: "/terms-conditions" }
      ]
    }
  ];

  return (
    <main className="position-relative overflow-hidden pt-100 pb-100" style={{ background: '#0b0f19', color: '#f3f4f6' }}>
      {/* Background Matrix Motion Effect */}
      <div className="position-absolute top-50 start-50 translate-middle rounded-circle" style={{ width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(75,239,198,0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="container position-relative z-index-1">
        {/* Navigation & Action Header */}
        <div className="mb-50 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <Link href="/" className="d-inline-flex align-items-center text-decoration-none transition-all" style={{ color: '#4befc6', fontWeight: '500', gap: '8px' }}>
            <span>&larr;</span> Return to Base
          </Link>
          <div className="px-16 py-8 rounded-pill text-xs tracking-wider border" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: '#9ca3af' }}>
            System Architecture Index
          </div>
        </div>

        {/* Title Grid */}
        <div className="mb-60">
          <h1 className="display-4 fw-bold text-white mb-15">
            Website <span style={{ background: 'linear-gradient(to right, #4befc6, #a3e635)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Architecture Matrix</span>
          </h1>
          <p className="fs-16 max-w-600" style={{ color: '#9ca3af' }}>
            A comprehensive hierarchical layout engineered for rapid algorithmic indexing and cross-platform human navigation.
          </p>
        </div>

        {/* Card Clusters Grid */}
        <div className="row g-4">
          {sitemapData.map((category, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="p-30 rounded-4 border h-100 transition-all sitemap-card" style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', borderColor: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(12px)' }}>
                <h3 className="h5 fw-bold mb-25 text-white d-flex align-items-center justify-content-between">
                  {category.title}
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#4befc6', borderRadius: '50%' }}></span>
                </h3>
                <ul className="list-none p-0 m-0">
                  {category.links.map((link, idx) => (
                    <li className="mb-15" key={idx}>
                      <Link href={link.path} className="d-flex align-items-center justify-content-between text-decoration-none py-4 transition-all sitemap-link" style={{ color: '#9ca3af', fontSize: '15px' }}>
                        <span>{link.name}</span>
                        <span className="arrow-icon" style={{ opacity: 0.3, transform: 'translateX(-5px)', transition: 'all 0.2s ease' }}>&rarr;</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Optional CSS Injection for Custom Animations */}
        <style dangerouslySetInnerHTML={{__html: `
          .sitemap-card:hover {
            border-color: rgba(163, 230, 53, 0.2) !important;
            background-color: rgba(17, 24, 39, 0.8) !important;
            box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
            transform: translateY(-2px);
          }
          .sitemap-link:hover {
            color: #ffffff !important;
          }
          .sitemap-link:hover .arrow-icon {
            opacity: 1 !important;
            transform: translateX(0) !important;
            color: #a3e635;
          }
        `}} />
      </div>
    </main>
  );
}
