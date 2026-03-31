import { MetadataRoute } from "next";

const BASE_URL = "https://kaigo-custharass-ai.vercel.app";

const keywordSlugs = [
  "kaigo-customer-harassment-taisaku",
  "kaigo-riyousha-kazoku-monku",
  "kaigo-staff-harassment-kiroku",
  "kaigo-service-kyohi-taishou",
  "kaigo-homon-custharass",
  "kaigo-verbal-abuse-taio",
  "kaigo-custharass-jirei",
  "kaigo-mental-health-staff",
  "kaigo-complaint-manual",
  "kaigo-custharass-horitsu",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BASE_URL;
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tool`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/kasuhara-guide`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/legal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const keywordPages: MetadataRoute.Sitemap = keywordSlugs.map((slug) => ({
    url: `${base}/keywords/${slug}`,
    lastModified: new Date("2026-03-31"),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...keywordPages];
}
