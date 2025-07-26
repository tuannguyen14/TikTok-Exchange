// app/sitemap.ts - Sitemap nâng cao với dynamic content
import { MetadataRoute } from 'next'

const languages = ['vi', 'en']
const baseUrl = 'https://yourwebsite.com'

// Static pages với metadata riêng
const staticPagesConfig = {
    '': {
        priority: 1.0,
        changeFrequency: 'daily' as const,
        lastModified: new Date('2024-01-01')
    },
    'tiktok-exchange-followers-likes': {
        priority: 0.9,
        changeFrequency: 'weekly' as const,
        lastModified: new Date('2024-01-15')
    },
    'get-tiktok-followers-likes': {
        priority: 0.9,
        changeFrequency: 'weekly' as const,
        lastModified: new Date('2024-01-15')
    },
    'campaigns': {
        priority: 0.8,
        changeFrequency: 'daily' as const,
        lastModified: new Date()
    },
    'campaigns/new': {
        priority: 0.7,
        changeFrequency: 'monthly' as const,
        lastModified: new Date('2024-01-01')
    },
    'profile': {
        priority: 0.8,
        changeFrequency: 'weekly' as const,
        lastModified: new Date()
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = []

    // 1. Thêm static pages
    for (const [page, config] of Object.entries(staticPagesConfig)) {
        for (const lang of languages) {
            const url = page === ''
                ? `${baseUrl}/${lang}`
                : `${baseUrl}/${lang}/${page}`

            sitemap.push({
                url,
                lastModified: config.lastModified,
                changeFrequency: config.changeFrequency,
                priority: config.priority,
                alternates: {
                    languages: createAlternateLinks(page, lang)
                }
            })
        }
    }

    // 3. Thêm paginated pages
    const campaignsPerPage = 10
    const totalCampaigns = 50 // Giả sử có 50 campaigns
    const totalPages = Math.ceil(totalCampaigns / campaignsPerPage)

    for (let page = 1; page <= totalPages; page++) {
        for (const lang of languages) {
            sitemap.push({
                url: `${baseUrl}/${lang}/campaigns?page=${page}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: page === 1 ? 0.8 : 0.5,
                alternates: {
                    languages: createAlternateLinks(`campaigns?page=${page}`, lang)
                }
            })
        }
    }

    return sitemap
}

// Helper function tạo alternate language links
function createAlternateLinks(path: string, currentLang: string): Record<string, string> {
    const alternates: Record<string, string> = {}

    languages.forEach(lang => {
        if (lang !== currentLang) {
            const url = path === ''
                ? `${baseUrl}/${lang}`
                : `${baseUrl}/${lang}/${path}`
            alternates[lang] = url
        }
    })

    return alternates
}

// app/sitemap-[segment].xml/route.ts - Tạo sitemap chunks cho large sites
export async function GET(
    request: Request,
    { params }: { params: { segment: string } }
) {
    const segment = params.segment

    let sitemap: MetadataRoute.Sitemap = []

    switch (segment) {
        case 'static':
            sitemap = await generateStaticSitemap()
            break
        default:
            return new Response('Not found', { status: 404 })
    }

    const xml = generateSitemapXML(sitemap)

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
        },
    })
}

async function generateStaticSitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemap: MetadataRoute.Sitemap = []

    for (const [page, config] of Object.entries(staticPagesConfig)) {
        for (const lang of languages) {
            const url = page === ''
                ? `${baseUrl}/${lang}`
                : `${baseUrl}/${lang}/${page}`

            sitemap.push({
                url,
                lastModified: config.lastModified,
                changeFrequency: config.changeFrequency,
                priority: config.priority
            })
        }
    }

    return sitemap
}


function generateSitemapXML(sitemap: MetadataRoute.Sitemap): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap.map(item => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified?.toString()}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
    ${item.alternates?.languages ? Object.entries(item.alternates.languages).map(([lang, url]) =>
        `<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`
    ).join('') : ''}
  </url>`).join('')}
</urlset>`
}