import Link from "next/link";
import "@/styles/store-pages.css";

/** Shared hero banner for About / Careers / Contact. `children` = optional CTA buttons. */
export default function PageHero({ crumb, pill, title, text, children }) {
  return (
    <header className="sp-hero">
      <div className="sp-hero-in">
        <nav aria-label="Breadcrumb" className="sp-crumb">
          <Link href="/">Home</Link> / <b>{crumb}</b>
        </nav>
        {pill && <span className="sp-pill">{pill}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        {children && <div className="sp-hero-cta">{children}</div>}
      </div>
    </header>
  );
}
