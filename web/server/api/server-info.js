export default defineEventHandler(async (event) => {
    const params = getQuery(event)
    if (params?.debug && params['debug'] == '13579') {
        let headers = getHeaders(event)
        delete headers['x-server-addr']
        event.node.res.end(JSON.stringify(headers, undefined, 4));
    } else {
        event.node.res.statusCode = 403
        event.node.res.end('Forbidden.')
    }
})