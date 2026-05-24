import React, { useEffect, useId, useState } from 'react';
import { ArrowUpRight, Menu, Shield, X } from 'lucide-react';
import './CardNav.css';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel?: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo?: string | React.ReactNode;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonLabel?: string;
  buttonHref?: string;
  theme?: 'light' | 'dark';
}

export const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  buttonLabel = 'View Dashboard',
  buttonHref = '#/dashboard',
  theme = 'light',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const closeOnHashChange = () => setIsExpanded(false);

    window.addEventListener('hashchange', closeOnHashChange);
    return () => window.removeEventListener('hashchange', closeOnHashChange);
  }, []);

  const closeMenu = () => setIsExpanded(false);
  const toggleMenu = () => setIsExpanded((value) => !value);

  const resolvedMenuColor = menuColor ?? (theme === 'light' ? '#111111' : '#ffffff');
  const resolvedButtonBg = buttonBgColor ?? (theme === 'light' ? '#111111' : '#ffffff');
  const resolvedButtonText = buttonTextColor ?? (theme === 'light' ? '#ffffff' : '#111111');

  const renderLogo = () => {
    if (typeof logo === 'string') {
      return <img src={logo} alt={logoAlt} className="card-nav-logo-image" />;
    }

    if (logo) {
      return <div onClick={() => setIsExpanded(false)}>{logo}</div>;
    }

    return (
      <a href="#/" className="card-nav-brand" aria-label="SENTINEL home" onClick={() => setIsExpanded(false)}>
        <span className="card-nav-brand-badge">
          <Shield size={18} strokeWidth={2.2} />
        </span>
        <span className="card-nav-brand-copy">
          <span className="card-nav-brand-title">SENTINEL</span>
          <span className="card-nav-brand-subtitle">Safety Intelligence</span>
        </span>
      </a>
    );
  };

  return (
    <>
      {isExpanded ? <button type="button" className="card-nav-backdrop" aria-label="Close navigation" onClick={closeMenu} /> : null}
      <div className={`card-nav-container ${className}`.trim()}>
      <nav
        className={`card-nav ${isExpanded ? 'open' : ''} ${theme === 'dark' ? 'card-nav-dark' : 'card-nav-light'}`}
        style={{ backgroundColor: baseColor }}
        aria-label="Primary navigation"
      >
        <div className="card-nav-top">
          <button
            type="button"
            className={`hamburger-menu ${isExpanded ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            style={{ color: resolvedMenuColor }}
          >
            {isExpanded ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
          </button>

          <div className="logo-container">{renderLogo()}</div>

          <a
            href={buttonHref}
            className="card-nav-cta-button"
            style={{ backgroundColor: resolvedButtonBg, color: resolvedButtonText }}
            onClick={closeMenu}
          >
            {buttonLabel}
          </a>
        </div>

        {isExpanded ? (
          <div
            id={contentId}
            className="card-nav-content"
            aria-hidden={!isExpanded}
          >
            {items.slice(0, 3).map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="nav-card"
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
              >
                <div className="nav-card-label">{item.label}</div>
                <div className="nav-card-links">
                  {item.links.map((link, linkIdx) => (
                    <a
                      key={`${link.label}-${linkIdx}`}
                      className="nav-card-link"
                      href={link.href}
                      aria-label={link.ariaLabel ?? link.label}
                      onClick={closeMenu}
                    >
                      <ArrowUpRight className="nav-card-link-icon" aria-hidden="true" size={16} />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </nav>
      </div>
    </>
  );
};

export default CardNav;
