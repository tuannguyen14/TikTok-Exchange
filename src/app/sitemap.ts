// app/sitemap.ts
import { MetadataRoute } from 'next'

const languages = ['vi', 'en']
const pages = [
  'tiktok-exchange-followers-likes',
  'get-tiktok-followers-likes',
  'campaigns',
  'profile',
  'auth',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tikgrow.io'

  const routes = languages.flatMap((lang) =>
    pages.map((page) => ({
      url: `${baseUrl}/${lang}/${page}`,
      lastModified: new Date(),
      // optional: changefreq, priority
    }))
  )

  return routes
}
