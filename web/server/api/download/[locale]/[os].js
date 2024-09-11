import { _post } from '../../../helper/call'

export default defineEventHandler(async (event) => {
    const { host } = getRequestURL(event)

    const config = useRuntimeConfig()

    const notFound = () => {
        event.node.res.statusCode = 404
        event.node.res.end('Not Found')
    }

    const localeFound = (localeParam) => {
        return config.LOCALES.findIndex(e => String(e.code).toUpperCase() == String(localeParam).toUpperCase()) > -1
    }

    const osFound = (osParam) => {
        return ['IOS','ANDROID'].findIndex(e => String(e).toUpperCase() == String(osParam).toUpperCase()) > -1
    }

    const androidURL = (localeParam) => {
        if (host.includes('jayabajibd6.online')) return 'https://jaya11d-public.s3.ap-southeast-1.amazonaws.com/App/Jaya11bd6.apk'
        if (host.includes('jayabajibd7.online')) return 'https://jaya11c-public.s3.ap-southeast-1.amazonaws.com/App/Jaya11bd7.apk'
        if (host.includes('jaya11bd8.online')) return 'https://jaya11b-public.s3.ap-southeast-1.amazonaws.com/App/BestAviatorGame.apk'
        if (host.includes('jaya11bd6.online')) return 'https://jaya11b-public.s3.ap-southeast-1.amazonaws.com/App/BestAviatorGame.apk'
        if (host.includes('jaya11bd7.online')) return 'https://jaya11b-public.s3.ap-southeast-1.amazonaws.com/App/BestAviatorGame.apk'
        if (config.public.DOWNLOAD_URL_ANDROID && config.public.DOWNLOAD_URL_ANDROID[localeParam.split('-')[1]]) {
            return config.public.DOWNLOAD_URL_ANDROID[localeParam.split('-')[1]];
        }
        return "";
    }
    
    const iosURL = (localeParam) => {
        // if (config.public.MERCHANT == 'jw8' && localeParam.split('-')[1] == 'th') return 'https://yry6r0r.xyz/xsdp.app'
        // if (config.public.MERCHANT == 'jw8' && localeParam.split('-')[1] == 'th') return 'https://xrl44yd.biokplm.cn/api/go/dy4l4rx'
        if (config.public.DOWNLOAD_URL_IOS && config.public.DOWNLOAD_URL_IOS[localeParam.split('-')[1]]) {
            return config.public.DOWNLOAD_URL_IOS[localeParam.split('-')[1]];
        }
        return "";
    }

    const apiCall = async (ev) => {
        try {
            let event_send = {...ev}
            event_send.node.req.method = 'POST'
            
            // event_send.node.req.headers['domain'] = 'localhost:3000'
            // event_send.node.req.headers['device'] = 'desktop'
            // event_send.node.req.headers['referer'] = 'http://localhost:3000/api/download/en-th/android'

            event_send.node.req['body'] = {
                language: String(event.context.params.locale).split('-')[0],
                langCountry: event.context.params.locale,
                merchant_id: config.MERCHANT_ID
            }

            const r = await _post('mobile/app-download-button', event_send)
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

    if (
        (event.context.params.locale && localeFound(event.context.params.locale)) 
        && 
        (event.context.params.os && osFound(event.context.params.os))
    ) {
        if (String(event.context.params.os).toUpperCase() == 'ANDROID' && androidURL(event.context.params.locale)) {
            await apiCall(event)
            event.node.res.statusCode = 301;
            event.node.res.setHeader('Location', androidURL(event.context.params.locale));
            event.node.res.end('Android App Downloaded');
        } else if (String(event.context.params.os).toUpperCase() == 'IOS' && iosURL(event.context.params.locale)) {
            await apiCall(event)
            event.node.res.statusCode = 301;
            event.node.res.setHeader('Location', iosURL(event.context.params.locale));
            event.node.res.end('IOS App Downloaded');
        } else {
            notFound()
        }
    } else {
        notFound()
    }
})