export default defineEventHandler((event) => {
    const config = useRuntimeConfig()
    const {pathname, origin} = getRequestURL(event)
    const method = getMethod(event)
    if (method == 'GET' && pathname == '/robots.txt') {
        setResponseHeaders(event, {
            'Content-Type': 'text/plain'
        })
        if (config.public.ENV == 'production') {
            let needIndex = true
            config.public.NO_INDEX_DOMAIN.forEach(d => {
              if (origin.indexOf(d) > -1) {
                needIndex = false
              }
            })
            if (!needIndex) {
              return 'User-agent: *\nDisallow: /'
            }
            const disallowPages = ['deposit', 'withdrawal', 'promo-center', 'notifications', 'bet-history', 'mission-diary', 'referral-user', 'profile/*', 'statement', 'account', 'language']
            let disallowText = ''
            disallowPages.forEach(p => {
              disallowText += `\nDisallow: /${p}`
            })
            let txtDomain = config.ROBOTS_TXT_DOMAIN || origin
            return `User-agent: *${disallowText}\n\nSitemap: ${txtDomain}/sitemap.xml`
        }
        return 'User-agent: *\nDisallow: /'
    }
})