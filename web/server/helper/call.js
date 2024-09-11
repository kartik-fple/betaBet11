import {decode,encode,randomNumber} from './utils'
import { notifySlack } from "../helper/utils"
import {aes_encrypt} from '../helper/aes'
const config = useRuntimeConfig()
const call = async ({method, path, event, encryptParam}) => {

    /* construct headers */
    const headers = getHeaders(event)
    const protocol = (headers['HTTP_X_FORWARDED_PROTO'] || headers['REQUEST_SCHEME'] == 'https' || headers['SERVER_PROTOCOL'] == 'https') ? 'https': 'http'
    let fetchOptions = {
        method,
        // [method != 'GET' ? 'body' : 'query']: await readBody(event),
        headers: {
            'merchantOpLink': config.MERCHANT_OP_LINK,
            'merchantCode': config.MERCHANT_CODE,
            'Authorization': `Basic ${config.API_AUTHORIZATION_KEY}`,
            'ip-web': JSON.stringify({
                'HTTP_CF_CONNECTING_IP': headers['cf-connecting-ip'] || headers['x-forwarded-for'] || headers['x-forwarded'] || '',
                'HTTP_CF_IPCOUNTRY': headers['cf-ipcountry'],
                'HTTP_CLIENT_IP': headers['cf-connecting-ip'] || headers['x-forwarded-for'] || headers['x-forwarded'] || '',
                'HTTP_FORWARDED':  headers['forwarded'] || '',
                'HTTP_X_FORWARDED': headers['x-forwarded'] || '',
                'HTTP_FORWARDED_FOR': headers['cf-connecting-ip'] || headers['x-forwarded-for'] || headers['x-forwarded'] || '',
                'HTTP_X_FORWARDED_FOR': headers['cf-connecting-ip'] || headers['x-forwarded-for'] || headers['x-forwarded'] || '',
                'REMOTE_ADDR': headers['cf-connecting-ip'] || headers['x-forwarded-for'] || headers['x-forwarded'] || '',
                'WEB_URL': headers['HTTP_REFERER'],
                'protocol': protocol,
            }),
            // 'HTTP_USER_AGENT': headers['user-agent'] || '',
            'User-Agent': headers['user-agent'],
            'domainUrl': headers['domain'],
            'device': headers['device'],
            'fullpath': headers['referer']
        }
    }

    //get ga_client
    const ga = getCookie(event, '_ga') || ''
    fetchOptions.headers.gaClient = ga

    //get fb_client
    const fb = getCookie(event, '_fbp') || ''
    fetchOptions.headers.fbClient = fb

    //get fbid_client
    const fbc = getCookie(event, '_fbc') || ''
    fetchOptions.headers.fbIdClient = fbc

    //get tiktok_client
    const tiktok = getCookie(event, '_ttp') || ''
    fetchOptions.headers.tiktokClient = tiktok

    //get fbpixel
    const fbpixel = getCookie(event, 'fb_dynamic_pixel') || ''
    if (fbpixel) {
        fetchOptions.headers._fbp = fbpixel
    }

    // appsflyer
    const afUserId = getCookie(event, 'afUserId') || ''
    if (afUserId) {
        fetchOptions.headers.afUserId = afUserId
    }

    // _mswin1
    let _mswin1 = getCookie(event, '_mswin1') || ''
    if (!_mswin1) {
        const subdomain_index = '1'
        const creation_time = Date.now()
        const random_number = randomNumber(10)
        _mswin1 = `fb.${subdomain_index}.${creation_time}.${random_number}`
        setCookie(event, '_mswin1', _mswin1)
    }
    fetchOptions.headers.webClient = _mswin1

    // reg_btn_ deposit_btn_
    const reg_btn_num = getCookie(event, 'click_register_id') || ''
    if (reg_btn_num) {
        fetchOptions.headers.clickRegisterId = reg_btn_num
    }

    const deposit_btn_num = getCookie(event, 'click_deposit_id') || ''
    if (deposit_btn_num) {
        fetchOptions.headers.clickDepositId = deposit_btn_num
    }

    // clickid
    const clickid = getCookie(event, 'clickid') || ''
    if (clickid) {
        fetchOptions.headers.urlClickID = clickid
    }

    // vcid
    const vcidCookie = getCookie(event, 'vcid') || ''
    if (vcidCookie) {
        fetchOptions.headers.voluumClickID = vcidCookie
    }

    // bcid
    const bcidCookie = getCookie(event, 'bcid') || ''
    if (bcidCookie) {
        fetchOptions.headers.binomClickID = bcidCookie
    }

    /* construct request params since it's required for the API */
    // const locale = getCookie(event, 'i18n_redirected') || config.public.DEFAULT_LOCALE
    // const [lang] = locale.split('-')
    // body.language = lang
    // body.langCountry = locale
    const reqContentType = getHeader(event, 'content-type')
    let body = {}
    if (reqContentType?.includes("form")) {
        body = new FormData()
        const formData = await readMultipartFormData(event);
        formData.forEach(f => {
            if (f.name == 'receipt_file') {
                const blob = new Blob([f.data], { type: f.type })
                body.append(f.name, blob, f.filename)
            }
            else {
                body.append(f.name, f.data)
            }
        })
    }
    else {
        body = await readBody(event) || {}
    }

    if (Array.isArray(encryptParam)) {
        let hasEncrypt = false
        encryptParam.forEach(p => {
            if (body[p]) {
                body[p] = aes_encrypt(body[p])
                if (!hasEncrypt) hasEncrypt = true
            }
        })
        if (hasEncrypt) {
            body['has_encrypt'] = 1
        }
    }

    //prevUrl
    const prevUrl = getCookie(event, 'prevUrl')
    if (prevUrl) {
        body.prevUrl = prevUrl
    }

    // jaya11 app source
    const appSource = getCookie(event, 'app_source')
    if (appSource) {
        fetchOptions.headers['app_source'] = appSource
        body.app_source = appSource
    }

    // if user is logged in, add in uid and token in to final query string
    const storedUserCookie = getCookie(event, 'user')
    let user = null
    if (storedUserCookie) {
        try {
            user = JSON.parse(decode(storedUserCookie))
        }
        catch(err) {}
    }

    body.merchant_id = config.MERCHANT_ID
    if (user && user.uid && user.token) {
        body.uid = user.uid
        body.token = user.token
    }
    const queryStrings = new URLSearchParams(body).toString()
    let reqUrl = `${config.API_DOMAIN}${path}?${queryStrings}`
    if (reqContentType?.includes("form")) {
        reqUrl = `${config.API_DOMAIN}${path}`
        body.append('uid', user.uid)
        body.append('token', user.token)
        fetchOptions.body = body
    }

    if (body.force_user_agent) {
        fetchOptions.headers['User-Agent'] = body.force_user_agent
    }

   /*  const cookies = getCookie(event, 'Cookie_1')
    const cookies = parseCookies(event)
    console.log(cookies)
    const body = await readBody(event)
    const query = getQuery(event) 
    const headers = getHeaders(event)
    */
    try {
        const res = await $fetch(reqUrl, fetchOptions)
        if (config.public.ENV != 'production') {
            delete fetchOptions.headers['Authorization']
            delete fetchOptions.headers['ip-web']
            delete fetchOptions.headers['merchantCode']
            delete fetchOptions.headers['merchantOpLink']

            const [pathModule, pathAction] = path.split('/')
            res._debug = {
                url: config.API_DOMAIN,
                be: {
                    con: pathModule,
                    act: pathAction,
                },
                headers: fetchOptions.headers,
                body: body
            }
        }
        return res
    }
    catch(err) {
        const params = {...body}
        Object.keys(params).forEach((key) => {
            if (key.indexOf('password') > -1) {
                params[key] = 'xxx'
            }
        })
        const pagePath = getHeader(event, 'page') || ''
        if (!err.response && err.message) {
            notifySlack(`SERVER ERROR\nProject: ${config.public.TITLE}\nENV: ${config.public.ENV}\nURL: ${config.API_DOMAIN}${path}\nHeaders: \n${JSON.stringify(fetchOptions.headers)}\nParams:\n${JSON.stringify(params)}\nPage: ${pagePath}\nMessage: ${err.message}`, true)
            return {
                status: false
            }
        }

        if (fetchOptions.headers['User-Agent']?.indexOf('google.com') < -1) {
            notifySlack(`API ERROR\nProject: ${config.public.TITLE}\nENV: ${config.public.ENV}\nURL: ${config.API_DOMAIN}${path}\nHeaders: \n${JSON.stringify(fetchOptions.headers)}\nParams:\n${JSON.stringify(params)}\nPage: ${pagePath}\nCode: ${err.response.status}`, true)
        }
        if (config.public.ENV != 'production') {
            return {
                status: false,
                _debug: {
                    url: `${config.API_DOMAIN}${path}`,
                    headers: fetchOptions.headers,
                    body: body
                }
            }
        }
        return {
            status: false
        }
    }
}

const _get = (path, event, encryptParam) => {
    return call({
        method: 'GET',
        path,
        event,
        encryptParam
    })
}
const _post = (path, event, encryptParam) => {
    return call({
        method: 'POST',
        path,
        event,
        encryptParam
    })
}
const _put = (path, event, encryptParam) => {
    return call({
        method: 'PUT',
        path,
        event,
        encryptParam
    })
}
const _delete = (path, event, encryptParam) => {
    return call({
        method: 'DELETE',
        path,
        event,
        encryptParam
    })
}

export {
    _get,
    _post,
    _put,
    _delete
}
