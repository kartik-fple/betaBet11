import Limiter from "../helper/limiter"
// import { notifySlack } from "../helper/utils"

// const config = useRuntimeConfig()
let requestKeys = {}
let blockList = []
let clearBlockListTimer = null

const clearLimit = (key) => {
    clearTimeout(requestKeys[key].timer)
    requestKeys[key] = null
    delete requestKeys[key]
}

const blockIP = (ip, key) => {
    blockList.push(ip)
    if (!clearBlockListTimer) {
        clearBlockListTimer = setTimeout(() => {
            blockList = []
            clearTimeout(clearBlockListTimer)
            clearBlockListTimer = null
        }, 300000)
    }
    clearLimit(key)
    // notifySlack(`SPAM DETECTED\nProject: ${config.public.TITLE}\nENV: ${config.public.ENV}\nIP: ${ip}\nIP has been blocked`)
}

export default defineEventHandler(async(event) => {
    const {pathname} = getRequestURL(event)
    if (pathname == '/api/block-list') {
        return {
            blockList
        }
    }
    else if (pathname == '/api/block-remove') {
        const method = getMethod(event)
        const body = await readBody(event) || {}
        if (method == 'POST' && body.ip) {
            blockList = blockList.filter(ipEntry => ipEntry != body.ip)
            return {
                status: true
            }
        }
        else {
            return {
                status: false,
                message: "Must POST, body {ip:xxx}"
            }
        }
    }
    else if (pathname == '/api/block-clear') {
        const method = getMethod(event)
        if (method == 'POST') {
            blockList = []
            return {
                status: true
            }
        }
    }
    const headers = getRequestHeaders(event)
    let ip = '';
    if (typeof headers['cf-connecting-ip'] !== "undefined") {
        ip = headers['cf-connecting-ip'];
    } else if (typeof headers['x-forwarded-for'] !== "undefined") {
        ip = headers['x-forwarded-for'];
    } else {
        ip = event.node.req.socket.remoteAddress || ''
    }
    if (ip.indexOf('46.137.201.61') > -1) {
        return
    }
    if (blockList.indexOf(ip) > -1) {
        event.node.res.statusCode = 403
        event.node.res.end('Forbidden.')
        return
    }
    const key = `${pathname}-${ip}`;
    if (!requestKeys[key]) {
        requestKeys[key] = new Limiter({key: key, ip: ip, onClearLimit: clearLimit, onBlock: blockIP})
    }
    if (requestKeys[key].isBlocked()) {
        event.node.res.statusCode = 429
        event.node.res.end('Too many requests.')
        return
    }
})