import { useId } from 'react';

const PHOTO = '/images/home-shark-transparent.png';

interface HeroArtworkProps {
  /** Source-image coordinates: a photographic detail fills every part of the logo. */
  logoPhotoCrop?: { x: number; y: number; width: number; height: number };
}

export default function HeroArtwork({
  logoPhotoCrop = { x: 80, y: 650, width: 500, height: 250 },
}: HeroArtworkProps) {
  const maskId = `hero-logo-${useId().replace(/:/g, '')}`;
  const toneId = `${maskId}-tone`;
  const outlineId = `${maskId}-outline`;
  const headId = `${maskId}-head`;
  const { x, y, width, height } = logoPhotoCrop;

  return (
    <div className="hero-artwork">
      {/* The unmodified 2:1 PNG supplies alpha only. No colored fill or watermark is rendered. */}
      <svg className="hero-artwork-logo-mask" viewBox="0 0 1774 887" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id={toneId} colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              <feFuncR type="linear" slope="0.65" intercept="0.48" />
              <feFuncG type="linear" slope="0.65" intercept="0.48" />
              <feFuncB type="linear" slope="0.65" intercept="0.48" />
            </feComponentTransfer>
          </filter>
          <filter id={outlineId}>
            <feMorphology in="SourceAlpha" operator="erode" radius="2" result="inside" />
            <feComposite in="SourceGraphic" in2="inside" operator="out" />
          </filter>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1774" height="887" style={{ maskType: 'alpha' }}>
            <image href="/images/85BBXwF.png" width="1774" height="887" />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`} className="hero-logo-photo-mask">
          <svg x="0" y="0" width="1774" height="887" viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="xMidYMid slice" filter={`url(#${toneId})`}>
            <image href={PHOTO} width="939" height="1035" />
          </svg>
        </g>
      </svg>

      {/* The reference frames the upper body; the original photo remains untouched. */}
      <svg className="hero-artwork-fighter" viewBox="0 150 939 885" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Shark em uma composição de pôster, com rosto e tronco em destaque">
        <image href={PHOTO} width="939" height="1035" />
      </svg>
      <svg className="hero-artwork-logo-mask hero-artwork-outline" viewBox="0 0 1774 887" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <image href="/images/85BBXwF.png" width="1774" height="887" filter={`url(#${outlineId})`} />
      </svg>
      {/* Restore only the head above the outline, using the same responsive photo coordinates. */}
      <svg className="hero-artwork-fighter hero-artwork-head" viewBox="0 150 939 885" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <clipPath id={headId} clipPathUnits="userSpaceOnUse">
            <path d="M300 150H850V650H595L470 555L330 490Z" />
          </clipPath>
        </defs>
        <image href={PHOTO} width="939" height="1035" clipPath={`url(#${headId})`} />
      </svg>
    </div>
  );
}
