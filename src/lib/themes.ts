export interface Theme {
  slug: string;
  name: string;
  description: string;
}

export const THEMES: Theme[] = [
  {
    slug: "glass-premium",
    name: "Glass Premium",
    description: "Warm earthy terracotta — nuansa hangat khas nusantara",
  },
  {
    slug: "classic-gold",
    name: "Classic Gold",
    description: "Elegan emerald & emas — mewah dan berwibawa",
  },
  {
    slug: "modern-sage",
    name: "Modern Sage",
    description: "Sage green minimalis — segar dan modern",
  },
];

export function getTheme(slug?: string | null): Theme {
  return THEMES.find((t) => t.slug === slug) ?? THEMES[0]!;
}
