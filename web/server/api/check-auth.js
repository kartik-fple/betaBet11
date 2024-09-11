import { _post } from '../helper/call'

export default defineEventHandler(async (event) => {
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


    const apiCall = async (ev) => {
        try {
            let event_send = {...ev}

            event_send.node.req.method = 'POST'
            
            event_send.node.req.headers['Authorization'] = `Basic ${config.API_AUTHORIZATION_KEY}`
            event_send.node.req.headers['merchantCode'] = config.MERCHANT_CODE
            event_send.node.req.headers['merchantOpLink'] = config.MERCHANT_OP_LINK

            event_send.node.req['body'] = {
                token: 'AGFC@$D234dsaP#3CS'
            }

            const r = await _post('index/check-auth', event_send)

            return r
        } catch (err) {
            return {
                success: false,
                status: false,
                message: 'Server Error',
                data: {}
            }
        }
    }

    if (!isWhitelist(event)) {
        event.node.res.statusCode = 403
        event.node.res.end('Not allowed by CORS')
    }

    const res = await apiCall(event)

    event.node.res.end(JSON.stringify(res, undefined, 4));
})