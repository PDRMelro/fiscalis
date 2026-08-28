import type { MetadataRoute } from "next";

const BASE_URL = "https://www.fiscalis-engenharia.pt";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/obras",
        "/visitas",
        "/calendario",
        "/propostas",
        "/nc",
        "/relatorios",
        "/clientes",
        "/configuracoes",
        "/login",
        "/portal",
        "/api",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
