const config = useRuntimeConfig()

export default defineEventHandler(async(event) => {
    const isIpv6 = (event) => {
        const headers = getHeaders(event)
        if (headers['cf-pseudo-ipv4']) {
            return true
        }
        return false
    }

    // if (isIpv6(event)) {
    //     event.node.res.statusCode = 503
    //     let html = `<div style="text-align:center;font-family: arial;color: #333; width:100%; height:100%; position: fixed; display: flex;flex-direction: column;align-content: center;justify-content: center;align-items: center;">
    //         <div>
    //             <div style="text-align:center;font-size: 40px;">503</div>
    //             <div style="text-align:center;font-size: 20px;margin-top: 9px;text-transform: capitalize;">Service Unavailable!</div>
    //         </div>
    //     </div>`
    //     event.node.res.end(html)
    //     return
    // }
})