import routes from '../../apiRoutes/routes'

const config = useRuntimeConfig()
// create a whitelist for accepting request
let domains = []
if (config.DOMAINS) {
	domains = config.DOMAINS.split(',')
}
const protocols = ['http', 'https']
const subdomains = ['', 'www.']

if (config.SUBDOMAINS) {
    (config.SUBDOMAINS.split(',')).forEach(s => {
		subdomains.push(`${s}.`, `www.${s}.`)
	})
}
let whitelist = []

for (let d in domains) {
    for (let p in protocols) {
        for (let s in subdomains) {
			whitelist.push(`${protocols[p]}://${subdomains[s]}${domains[d]}`)
        }
    }
}

const isWhitelist = (event) => {
    if (!event.node.req.headers.origin) return true
    return whitelist.indexOf(event.node.req.headers.origin) > -1
}

export default defineEventHandler(async (event) => {
    // check if origin is whitelisted
    if (!isWhitelist(event)) {
        event.node.res.statusCode = 403
        event.node.res.end('Not allowed by CORS')
        return
    }
    
    // check if it's a valid route
    if (routes[event.context.params.scope] && typeof routes[event.context.params.scope][event.context.params.action] == 'function') {
        try {
            const r = await routes[event.context.params.scope][event.context.params.action](event)
            appendHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
            return r
        }
        catch(err) {
            console.log(err)
            return {
                success: false,
                status: false,
                message: 'Server Error',
                data: {}
            }
        }
    }
    else {
        event.node.res.statusCode = 404
        event.node.res.end('Not Found')
        return
    }
})  