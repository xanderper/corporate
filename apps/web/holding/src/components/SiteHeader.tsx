import { Navigation } from "@virex/ui";

export function SiteHeader() {
  return (
    <Navigation
      brand={{ name: "Virex", label: "Holding" }}
      navLinks={[
        { name: "Our Group", href: "/group" },
        { name: "About", href: "/about" },
      ]}
      darkHeroPaths={["/"]}
      darkBackground="ink"
      accent="ink"
    />
  );
}
