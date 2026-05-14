/**
 * HeaderArch — Islamic arch/mihrab silhouette for header decoration.
 * Place behind Bismillah text for cultural depth.
 */
export default function HeaderArch() {
  return (
    <svg
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-64 h-auto opacity-15 text-gold"
      aria-hidden="true"
    >
      {/* Main arch shape */}
      <path
        d="M10 120
           L10 40
           Q150 -20 290 40
           L290 120
           Z"
        fill="currentColor"
      />
      {/* Inner arch outline */}
      <path
        d="M40 120
           L40 60
           Q150 20 260 60
           L260 120
           Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.5"
      />
      {/* Decorative dome top */}
      <ellipse cx="150" cy="20" rx="30" ry="15" fill="currentColor" opacity="0.3" />
      {/* Small crescent at apex */}
      <path
        d="M150 5 Q155 0 160 5 Q155 10 150 5"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
