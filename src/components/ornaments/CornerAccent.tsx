/**
 * CornerAccent — Decorative L-shaped gold corner ornament.
 * Position absolutely on cards: top-left, top-right, bottom-left, bottom-right.
 *
 * Usage:
 * <div className="absolute top-0 left-0 w-6 h-6">
 *   <CornerAccent />
 * </div>
 */
export default function CornerAccent() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-gold drop-shadow-sm"
    >
      {/* L-shaped arabesque curve with decorative end */}
      <path
        d="M2 2 
            Q2 0 4 0 
            L20 0 
            Q22 0 22 2 
            L22 4 
            Q22 6 20 6 
            L6 6 
            Q2 6 2 2 
            Z"
        fill="currentColor"
      />
      {/* Small diamond accent at inner corner */}
      <path
        d="M6 6 L6 8 L4 6 L6 4 Z"
        fill="currentColor"
        opacity="0.8"
      />
    </svg>
  );
}
