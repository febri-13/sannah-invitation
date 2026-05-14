import { ReactNode } from "react";

interface DividerProps {
  className?: string;
  children?: ReactNode;
}

/**
 * Horizontal decorative divider with gold lines and optional centered ornament.
 * Use between sections for visual separation with Islamic aesthetic.
 */
export default function Divider({ className = "", children }: DividerProps) {
  return (
    <div className={`flex items-center justify-center my-6 ${className}`}>
      <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
      {children && (
        <span className="mx-3 text-gold text-lg opacity-80">{children}</span>
      )}
      <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}
