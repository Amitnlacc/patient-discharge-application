import React from "react";

/* Flat illustration of a care team, drawn inline so it ships with no assets
   and picks up the brand red. */
export function AuthIllustration({ className = "" }) {
  const skin = "#f4b896", skin2 = "#b9784f", skin3 = "#e8a07c";
  const scrub = "#ee0000", scrubDark = "#b30000", scrubLight = "#ff4d4d";
  return (
    <svg viewBox="0 0 520 440" className={className} role="img" aria-label="Care team illustration">
      <path d="M70 250c-20-90 50-170 150-185 70-10 110 25 170 25 70 0 110 70 100 150-8 70-60 130-130 160-60 25-120 25-170 5-70-25-105-85-120-155z" fill="#ffe3e3" />
      <ellipse cx="170" cy="70" rx="46" ry="26" fill="#ffd0d0" transform="rotate(-18 170 70)" />
      <circle cx="120" cy="80" r="10" fill="#ffd0d0" />
      <path d="M92 150l34 12-26 16zM150 118l8 30-20-6z" fill="#f6c453" />
      {[[96, 236], [420, 206], [330, 92], [236, 56]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y - 9}q2 7 9 9-7 2-9 9-2-7-9-9 7-2 9-9z`} fill="#fff" />
      ))}
      <g fill={scrub}>
        <rect x="108" y="242" width="42" height="14" rx="3" />
        <rect x="122" y="228" width="14" height="42" rx="3" />
      </g>
      <g fill="#fff"><rect x="262" y="364" width="40" height="14" rx="3" /><rect x="275" y="351" width="14" height="40" rx="3" /></g>
      <g fill="#ffb3b3"><rect x="372" y="168" width="38" height="13" rx="3" /><rect x="384" y="156" width="13" height="38" rx="3" /></g>

      {/* left: woman with mask, thumbs up */}
      <path d="M104 400l6-120q2-30 34-40l62-4q34 4 36 40l6 124z" fill={scrub} />
      <path d="M148 244q30 22 58 0" fill="none" stroke={scrubDark} strokeWidth="5" />
      <path d="M104 296l-44-26-10 16 54 44z" fill={scrub} />
      <path d="M62 262l-12-34q-2-8 6-9l8 2 6 22z" fill={skin} />
      <path d="M44 252l-18-4q-6 0-4 8l16 12z" fill={skin} />
      <rect x="148" y="214" width="36" height="34" rx="10" fill={skin} />
      <ellipse cx="166" cy="190" rx="38" ry="44" fill={skin} />
      <path d="M126 196c-10-52 20-74 46-74s62 20 52 76l-10 14c4-30-8-52-40-52-30 0-36 22-36 52z" fill="#5a1236" />
      <rect x="138" y="196" width="56" height="34" rx="14" fill="#fff" />
      <path d="M142 204h48M142 214h48M142 224h48" stroke="#e5e7eb" strokeWidth="2" />
      <circle cx="152" cy="184" r="3.2" fill="#2b1b1b" /><circle cx="180" cy="184" r="3.2" fill="#2b1b1b" />

      {/* centre: doctor with stethoscope */}
      <path d="M214 410l2-186q4-34 44-40h62q40 6 44 40l2 190z" fill={scrub} />
      <path d="M262 184l30 38 30-38" fill="none" stroke={scrubDark} strokeWidth="6" strokeLinejoin="round" />
      <path d="M258 196c-30 30-24 66-6 72" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round" />
      <circle cx="330" cy="230" r="11" fill="#fff" stroke="#333" strokeWidth="5" />
      <path d="M322 212c0 12 4 12 8 18" fill="none" stroke="#333" strokeWidth="5" />
      <path d="M216 252l-40 70 28 16 40-52z" fill={scrub} />
      <path d="M368 252l40 70-28 16-40-52z" fill={scrub} />
      <path d="M176 322l-6 18 30 4 8-20zM408 322l6 18-30 4-8-20z" fill={skin3} />
      <rect x="276" y="150" width="34" height="40" rx="10" fill={skin} />
      <ellipse cx="293" cy="120" rx="40" ry="46" fill={skin} />
      <path d="M250 112c-8-48 22-68 50-68 34 0 58 24 46 62-4-18-14-30-30-34-10 14-34 22-66 40z" fill="#4b4b4f" />
      <circle cx="277" cy="118" r="3.4" fill="#2b1b1b" /><circle cx="308" cy="118" r="3.4" fill="#2b1b1b" />
      <path d="M278 142q16 12 32 0" fill="none" stroke="#a24a3a" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="268" cy="134" rx="8" ry="5" fill="#f0897a" opacity=".6" /><ellipse cx="318" cy="134" rx="8" ry="5" fill="#f0897a" opacity=".6" />

      {/* right: woman with clipboard */}
      <path d="M338 410l4-120q4-34 40-42l44-4q34 8 40 46l6 120z" fill={scrub} />
      <path d="M368 262l22 22 22-22" fill="none" stroke={scrubDark} strokeWidth="5" />
      <rect x="372" y="222" width="30" height="34" rx="10" fill={skin2} />
      <ellipse cx="388" cy="196" rx="36" ry="42" fill={skin2} />
      <path d="M350 188c-6-40 22-58 44-58 28 0 44 22 36 52-4-20-16-30-34-30-16 0-34 8-46 36z" fill="#f4d37a" />
      <circle cx="424" cy="146" r="16" fill="#f4d37a" /><circle cx="440" cy="162" r="9" fill="#f4d37a" />
      <g fill="none" stroke="#fff" strokeWidth="3.2"><circle cx="374" cy="194" r="10" /><circle cx="404" cy="194" r="10" /><path d="M384 194h10" /></g>
      <circle cx="374" cy="194" r="3" fill="#2b1b1b" /><circle cx="404" cy="194" r="3" fill="#2b1b1b" />
      <path d="M378 214q10 8 20 0" fill="none" stroke="#7a3a2a" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(10 330 300)">
        <rect x="300" y="236" width="86" height="116" rx="8" fill="#2d2d33" />
        <rect x="330" y="228" width="26" height="12" rx="3" fill="#e5e7eb" />
      </g>
      <path d="M342 318l60-22 14 24-60 24z" fill={scrubLight} />
      <path d="M348 322l-26 12-4-14 30-12z" fill={skin2} />
      <path d="M452 262l22 34-14 12-26-30z" fill={scrub} />
      <path d="M470 298l14 22-12 8-10-18z" fill={skin2} />
    </svg>
  );
}
