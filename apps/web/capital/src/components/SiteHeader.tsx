import { Navigation } from "@virex/ui";

export const NAV_LINKS = [
  { name: "About", href: "/about" },
  { name: "Investment Strategy", href: "/strategy" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Insights", href: "/insights" },
];

export function SiteHeader() {
  return (
    <Navigation
      brand={{ name: "Virex", label: "Capital" }}
      navLinks={NAV_LINKS}
      darkHeroPaths={["/"]}
      darkBackground="transparent"
      accent="forest"
    />
  );
}
