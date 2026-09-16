import { useId } from 'react';

interface SharkPhotoMaskProps {
  photoX?: number;
  photoY?: number;
  photoScale?: number;
  breakout?: boolean;
}

/** Coordinates share one viewBox so the mask and foreground stay registered at every size. */
export default function SharkPhotoMask({
  photoX = 0,
  photoY = -109,
  photoScale = 1,
  breakout = true,
}: SharkPhotoMaskProps) {
  const id = useId().replace(/:/g, '');
  const logoMask = `${id}-logo`;
  const foregroundMask = `${id}-foreground`;
  const foregroundFade = `${id}-fade`;
  const logoTone = `${id}-tone`;
  const title = `${id}-title`;
  const photoTransform = `translate(${photoX} ${photoY}) scale(${photoScale})`;
  const photo = '/images/home-shark-transparent.png';

  return (
    <svg className="shark-photo-composition" viewBox="0 0 939 990" fill="none"
      role="img" aria-labelledby={title} preserveAspectRatio="xMidYMax meet">
      <title id={title}>Shark em uma composição fotográfica dentro da logo Shark Team</title>
      <defs>
        <linearGradient id={logoTone} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#77777d" />
          <stop offset="1" stopColor="#424247" />
        </linearGradient>
        {/* Original PNG: 1774 × 887. The 2:1 ratio is preserved; only its alpha defines the mask. */}
        <mask id={logoMask} maskUnits="userSpaceOnUse" x="0" y="0" width="939" height="990" style={{ maskType: 'alpha' }}>
          <image href="/images/85BBXwF.png" x="0" y="460" width="939" height="469.5" preserveAspectRatio="xMidYMid meet" />
        </mask>
        {/* The second photo reveals the head above the logo, fading only at the join. */}
        <linearGradient id={foregroundFade} gradientUnits="userSpaceOnUse" x1="0" y1="440" x2="0" y2="545">
          <stop offset="0" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={foregroundMask} maskUnits="userSpaceOnUse" x="0" y="0" width="939" height="990" style={{ maskType: 'alpha' }}>
          <rect width="939" height="545" fill={`url(#${foregroundFade})`} />
        </mask>
      </defs>

      <g mask={`url(#${logoMask})`} className="shark-photo-masked">
        {/* Neutral backing preserves the complete mark where the cutout itself is transparent. */}
        <rect width="939" height="990" fill={`url(#${logoTone})`} />
        <image href={photo} width="939" height="1676" transform={photoTransform} preserveAspectRatio="xMidYMid meet" />
      </g>
      {breakout && (
        <g mask={`url(#${foregroundMask})`} className="shark-photo-foreground">
          <image href={photo} width="939" height="1676" transform={photoTransform} preserveAspectRatio="xMidYMid meet" />
        </g>
      )}
    </svg>
  );
}
