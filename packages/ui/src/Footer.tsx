import Link from "next/link";
import React, { FC, ReactNode, CSSProperties, useMemo } from "react";

export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export type FooterWidth =
  | "50/50"
  | "60/40"
  | "40/60"
  | "70/30"
  | "30/70"
  | "20/80"
  | "80/20";

export interface FooterProps {
  brand: {
    line1: string;
    line2: string;
  };
  subtitle: string | ReactNode;
  columns: FooterSection[][];
  copyrightEntity: string;
  bottomText?: ReactNode;
  extraNote?: ReactNode;
  gridCols?: number;
  sectionDivider?: boolean;
  columnWidth?: FooterWidth;
}

/**
 * Helper to render a section's links.
 */
const FooterLinks: FC<{ links: FooterLink[] }> = ({ links }) => (
  <ul className="space-y-4 text-sm font-medium">
    {links.map(({ name, href, external }, idx) => (
      <li key={href + idx}>
        {external ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-virex-sage hover:text-virex-white transition-colors"
          >
            {name}
          </a>
        ) : (
          <Link
            href={href}
            className="text-virex-sage hover:text-virex-white transition-colors"
          >
            {name}
          </Link>
        )}
      </li>
    ))}
  </ul>
);

/**
 * Helper to render a column of sections (single grid col, which may have multiple sub-sections)
 */
const FooterColumn: FC<{
  col: FooterSection[];
  sectionDivider?: boolean;
}> = ({ col, sectionDivider }) => {
  return (
    <div className={`flex flex-col ${sectionDivider ? '' : 'gap-12'}`}>
      {col.map((section, secIdx) => {
        const showDivider = !!sectionDivider && secIdx > 0;
        const dividerStyles: CSSProperties | undefined = showDivider
          ? {
              marginTop: "28px",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "16px",
            }
          : undefined;
        return (
          <div key={section.title + secIdx} style={dividerStyles}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-virex-sage mb-6">
              {section.title}
            </p>
            <FooterLinks links={section.links} />
          </div>
        );
      })}
    </div>
  );
};

// Helper to determine if subtitle is a primitive (string/number)
function isPrimitive(val: any): val is string | number {
  return (
    typeof val === "string" ||
    typeof val === "number"
  );
}

// Helper to return Tailwind width classes for lg and xl based on columnWidth prop
function getColumnWidths(columnWidth?: FooterWidth) {
  // Default to 50/50
  switch (columnWidth) {
    case "60/40":
      return {
        brand: "lg:w-3/5 xl:w-3/5",
        columns: "lg:w-2/5 xl:w-2/5",
      };
    case "40/60":
      return {
        brand: "lg:w-2/5 xl:w-2/5",
        columns: "lg:w-3/5 xl:w-3/5",
      };
    case "70/30":
      return {
        brand: "lg:w-7/12 xl:w-7/12",
        columns: "lg:w-5/12 xl:w-5/12",
      };
    case "30/70":
      return {
        brand: "lg:w-5/12 xl:w-5/12",
        columns: "lg:w-7/12 xl:w-7/12",
      };
    case "20/80":
      return {
        brand: "lg:w-1/5 xl:w-1/5",
        columns: "lg:w-4/5 xl:w-4/5",
      };
    case "80/20":
      return {
        brand: "lg:w-4/5 xl:w-4/5",
        columns: "lg:w-1/5 xl:w-1/5",
      };
    case "50/50":
    default:
      return {
        brand: "lg:w-1/2 xl:w-1/2",
        columns: "lg:w-1/2 xl:w-1/2",
      };
  }
}

export const Footer: FC<FooterProps> = ({
  brand,
  subtitle,
  columns,
  copyrightEntity,
  bottomText = "The Netherlands",
  extraNote,
  gridCols,
  sectionDivider = false,
  columnWidth = "50/50",
}) => {
  // Memoize column count logic for performance
  const colCount = useMemo(() => gridCols || columns.length, [gridCols, columns.length]);
  const gridClass = useMemo(() => {
    if (colCount === 1) return "sm:grid-cols-1 md:grid-cols-1";
    if (colCount === 2) return "sm:grid-cols-2 md:grid-cols-2";
    if (colCount === 4) return "sm:grid-cols-2 md:grid-cols-4";
    return "sm:grid-cols-2 md:grid-cols-3";
  }, [colCount]);

  const widths = getColumnWidths(columnWidth);

  return (
    <footer className="bg-virex-forest text-virex-warmwhite py-24 mt-32 border-t border-virex-stone/10">
      <div className="container max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-12 justify-between">
          {/* Brand */}
          <div className={`${widths.brand} flex flex-col shrink-0`}>
            <div className="flex flex-col font-normal leading-[1.05] mb-6">
              <span className="text-3xl tracking-tight">{brand.line1}</span>
              <span className="text-3xl tracking-tight text-virex-sage">{brand.line2}</span>
            </div>
            {isPrimitive(subtitle) ? (
              <p className="text-virex-sage text-sm max-w-xs font-normal leading-relaxed">
                {subtitle}
              </p>
            ) : (
              <div className="text-virex-sage text-sm max-w-xs font-normal leading-relaxed">
                {subtitle}
              </div>
            )}
          </div>

          {/* Dynamic Columns */}
          <div className={`${widths.columns} grid grid-cols-1 ${gridClass} gap-12 sm:gap-8`}>
            {columns.map((col, colIdx) => (
              <FooterColumn
                key={colIdx}
                col={col}
                sectionDivider={sectionDivider}
              />
            ))}
          </div>
        </div>

        {extraNote && (
          <div className="mt-24 text-xs text-virex-sage font-medium max-w-3xl leading-relaxed">
            {extraNote}
          </div>
        )}

        <div className={`${extraNote ? 'mt-8' : 'mt-24'} pt-8 border-t border-virex-white/10 flex flex-col md:flex-row justify-between items-start md:items-center text-xs text-virex-sage font-medium`}>
          <p>© {new Date().getFullYear()} {copyrightEntity}. All rights reserved.</p>
          <div className="mt-2 md:mt-0">{bottomText}</div>
        </div>
      </div>
    </footer>
  );
}