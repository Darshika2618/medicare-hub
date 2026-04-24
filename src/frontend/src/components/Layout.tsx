import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  /** Optional header content to render inside the sticky header zone */
  header?: ReactNode;
  /** Remove default page padding (e.g. for full-bleed pages) */
  noPadding?: boolean;
}

/**
 * Main app shell layout.
 * - Sticky top header zone (bg-card, shadow)
 * - Scrollable content area with bottom-nav clearance
 * - Fixed bottom navigation bar
 */
export function Layout({ children, header, noPadding = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background max-w-lg mx-auto relative">
      {/* Sticky header */}
      {header && (
        <header className="sticky top-0 z-40 bg-card border-b border-border shadow-xs">
          <div className="px-4 py-3">{header}</div>
        </header>
      )}

      {/* Scrollable main content */}
      <main
        className={
          noPadding
            ? "flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]"
            : "flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] px-4 pt-4"
        }
      >
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
