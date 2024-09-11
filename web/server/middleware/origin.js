import ip from 'ip'

export default defineEventHandler((event) => {
    const config = useRuntimeConfig()
    const {pathname, origin, host, hostname} = getRequestURL(event)
    const method = getMethod(event)
    if (method == 'GET' && pathname == '/origin.txt') {
        setResponseHeaders(event, {
            'Content-Type': 'text/plain'
        })
        const headers = getHeaders(event)
        let needIndex = true
        config.public.NO_INDEX_DOMAIN.forEach(d => {
          if (origin.indexOf(d) > -1) {
            needIndex = false
          }
        })
        return `origin:${origin}\nhost:${host}\nhostname:${hostname}\nnoIndexDomains:${config.public.NO_INDEX_DOMAIN}\nneedIndex:${needIndex}\nUser-Agent:${headers['user-agent']}\ncf_country:${headers['cf-ipcountry']}\nip:${ip.address()}`
    }
})