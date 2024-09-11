const config = useRuntimeConfig()
const env = config.public.ENV == 'production' ? 'production' : 'staging'
let currencies = []
let gotProviders = false

config.LOCALES.forEach(l => {
    let matchedCurrency = currencies.find(c => c.currency == l.currency)
    if (!matchedCurrency) {
        currencies.push({
            currency: l.currency,
            locales: [l.code],
            url: `${config.public.PUBLIC_FE_BUCKET}backend/${env}/game/${l.currency}/getProvider.json.gz`,
            providers: {}
        })
    }
    else {
        matchedCurrency.locales.push(l.code)
    }
})

export default defineEventHandler(async (event) => { // cannot use cachedEventHandler because getRequestURL will return localhost
    const {pathname, origin} = getRequestURL(event)
    const method = getMethod(event)
    if (method == 'GET' && (pathname == '/sitemap.xml' || pathname == '/sitemap2.xml' || pathname == '/sitemap3.xml')) {
        setResponseHeaders(event, {
            'Content-Type': 'application/xml' 
        })
      
        try {
            if (!gotProviders) {
                const providersApi = await Promise.all(currencies.map(c => $fetch(c.url, { parseResponse: JSON.parse })))
                providersApi.forEach((providerData, i) => {
                    currencies[i].providers = providerData
                })
                gotProviders = true
            }
        }
        catch(err) {
            console.log(err)
        }
        finally {
            const pages = ['', // home page
                '/promotions',
                '/lucky-spin',
                '/vip',
                '/angpow',
                '/terms-and-conditions',
                '/privacy-policy',
                '/responsible-gaming',
                '/disconnect-policy',
                '/faq',
                '/about-us',
                '/contact-us',
            ]
    
            const generateURLEntryXML = (locale, path) => {
                let xmlEntry = `\n  <url>\n    <loc>${origin}/${locale}${path}</loc>`
                xmlEntry += `\n    <changefreq>daily</changefreq>`
                xmlEntry += `\n    <priority>1.0</priority>\n  </url>`
                return xmlEntry
            }
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
            xml += generateURLEntryXML('', '')
            
            pages.forEach(p => {
                currencies.forEach(c => {
                    c.locales.forEach(l => {
                        xml += generateURLEntryXML(l, p)
                    })
                })
            })
            currencies.forEach(c => {
                c.locales.forEach(l => {
                    let providerCategories = Object.keys(c.providers)
                    providerCategories.forEach(category => {
                        if (category == 'others') return
                        xml += generateURLEntryXML(l, `/${category}`)
                        c.providers[category].forEach(p => {
                            xml += generateURLEntryXML(l, `/${category}/${p.providerName}`)
                        })
                    })
                })
            })
            xml += '\n</urlset>'
            return xml
        }
    }
})