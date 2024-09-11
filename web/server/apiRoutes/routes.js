import {_get, _post, _put, _delete} from '../helper/call'
import {decode, encode, notifySlack} from '../helper/utils'

const newPaymentMerchants = ['jolibet']
const routes = {
    index:{
        async auth(event) {
            const res = await _post('index/auth', event, ['password'])
            if (res.status) {
                setCookie(event, 'user', encode(JSON.stringify(res.data)), {
                    httpOnly: true,
                })
                delete res.data.token
            }
            return res
        },
        async logout(event) {
            try {
                await _post('index/logout', event)
                deleteCookie(event, 'user')
            }
            catch(err) {
            }
            finally {
                return {
                    status: true
                }
            }
        }
    },
    slack: {
        async 'notify'(event) {
            const config = useRuntimeConfig()
            const body = await readBody(event) || {}
            notifySlack(`SERVER ERROR\nProject: ${config.public.TITLE}\nENV: ${config.public.ENV}\nUID:${body.uid}\n*MODULE: ${body.module}*\nMessage: ${body.message}`, true)
            return {
                status: true
            }
        }
    },
    register: {
        'new-confirm'(event) {
            return _post('register/new-confirm', event, ['confirm_new_password', 'new_password'])
        },
        'verify'(event) {
            return _post('register/verify', event, ['new_password', 'confirm_new_password'])
        },
        'get-regsier-setting'(event) {
            return _post('register/get-register-setting-multi', event)
        },
        'confirm'(event) {
            return _post('register/confirm', event, ['new_password', 'confirm_new_password'])
        },
        'check-user-bank'(event) {
            return _post('register/check-user-bank-acc', event)
        }
    },
    user: {
        'block-announcement'(event) {
            return _post('user/block-announcement', event)
        },
        'verify-otp'(event) {
            return _post('user/verify-otp', event)
        },
        'get-bet-history'(event) {
            return _post('user/get-bet-history', event)
        },
        'get-bet-provider'(event) {
            return _post('user/get-bet-provider', event)
        },
        'get-bet-history-asian-template'(event) {
            return _post('user/get-bet-history-asian-template', event)
        },
        'id-info'(event) {
            return _post('user/id-info', event)
        },
        'upload-id'(event) {
            return _post('user/upload-id', event)
        },
        'get-quick-register-setting'(event) {
            return _post('user/get-quick-register-setting', event)
        },
        'get-bank-list'(event) {
            return _post('user/get-bank-list', event)  
        },
        'get-country-list'(event){
            return _post('user/get-country-list', event)
        },
        'request-register-tac'(event) {
            return _post('user/request-register-tac', event)
        },
        'get-bal'(event) {
            return _post('user/get-bal', event)
        },
        'get-overall-balance'(event) {
            return _post('user/get-overall-balance', event)
        },
        'add-multiple-bank'(event) {
            return _post('user/add-multiple-bank', event)
        },
        'add-crypto-withdraw-address'(event) {
            return _post('user/add-crypto-withdraw-address', event)
        },
        'get-user-bank-detail-new'(event) {
            return _post('user/get-user-bank-detail-new', event)
        },
        'get-user-bank-list'(event) {
            return _post('user/get-user-bank-list', event)
        },
        'update-user-password'(event) {
            return _post('user/update-user-password', event, ['current_password', 'new_password', 'confirm_new_password'])
        },
        'update-user-detail'(event){
            return _post('user/update-user-detail', event)
        },
        'update-user-details'(event){
            return _post('user/update-user-details', event)
        },
        'update-birthday'(event) {
            return _post('user/update-birthday', event)
        },
        'dashboardv2'(event) {
            return _post('user/dashboardv2', event)
        },
        'request-forget-tac'(event) {
            return _post('user/request-forget-tac', event)
        },
        'verify-forget-tac'(event) {
            return _post('user/verify-forget-tac', event)
        },
        'email-request'(event) {
            return _post('user/email-request', event)
        },
        'new-mobile-request'(event) {
            return _post('user/new-mobile-request', event)
        },
        'verify-user-contact'(event) {
            return _post('user/verify-user-contact', event)
        },
        'reset-login-password'(event) {
            return _post('user/reset-login-password', event, ['new_password', 'confirm_new_password'])
        },
        'get-member-turnover-list'(event) {
            return _post('user/get-member-turnover-list', event)
        },
        'referral-list'(event) {
            return _post('user/referral-list-new', event)
        },
        'get-history'(event) {
            return _post('user/get-history', event)
        },
        'update-click'(event) {
            return _post('user/update-click', event)
        },
        'update-fullname'(event) {
            return _post('user/update-fullname', event)
        },
        'crm-one-signal'(event) {
            return _post('user/crm-one-signal', event)
        },
        async 'update-signal-token' (event) {
            try {
                const config = useRuntimeConfig()
                if (!config.CRM_MERCHANT || !config.CRM_AUTH_KEY || !config.CRM_PROMO) {
                    return {
                        status: false
                    }
                }
                const headers = getHeaders(event)
                const protocol = (headers['HTTP_X_FORWARDED_PROTO'] || headers['REQUEST_SCHEME'] == 'https' || headers['SERVER_PROTOCOL'] == 'https') ? 'https': 'http'
                const ipWeb = JSON.stringify({
                    'HTTP_CF_CONNECTING_IP': headers['cf-connecting-ip'] || '',
                    'HTTP_CF_IPCOUNTRY': headers['cf-ipcountry'],
                    'HTTP_CLIENT_IP': headers['client-ip'] || '',
                    'HTTP_FORWARDED':  headers['forwarded'] || '',
                    'HTTP_X_FORWARDED': headers['x-forwarded'] || '',
                    'HTTP_FORWARDED_FOR': headers['forwarded-for'] || '',
                    'HTTP_X_FORWARDED_FOR': headers['x-forwarded-for'] || '',
                    'REMOTE_ADDR':  headers['x-forwarded-for'] || '',
                    'WEB_URL': headers['HTTP_REFERER'],
                    'protocol': protocol,
                })
                const userAgent = headers['user-agent']
                const storedUserCookie = getCookie(event, 'user')
                let uid = null
                const body = await readBody(event) || {}
                if (storedUserCookie) {
                    let user = JSON.parse(decode(storedUserCookie))
                    if (user && user.uid) {
                        uid = user.uid
                    } 
                }
                if (!uid) {
                    return {
                        status: false
                    }
                }
                const param = {
                    uid: uid,
                    member_token: body.oneSignalId
                }
                // return config
                const res = await $fetch(`${config.CRM_ONE_SIGNAL}member/update_device_token`, {
                    method: 'POST',
                    headers: {
                        merchant: config.CRM_MERCHANT,
                        Authorization: `Bearer ${config.CRM_AUTH_KEY}`
                    },
                    body: param
                })
                return {
                    msg: res.message,
                    status: true
                }
            }
            catch(err) {
                if (err.response) {
                    return {
                        status: false,
                        msg: err.response._data.message
                    }
                }
                return {
                    status: false
                }
            }
        },
        session(event) {
            const storedUserCookie = getCookie(event, 'user')
            let user = null
            if (storedUserCookie) {
                try {
                    user = JSON.parse(decode(storedUserCookie))
                }
                catch(err) {}
            }
            if (user && user.uid && user.token) {
                return {
                    status: true,
                    data: user
                }
            }
            return {
                status: false
            }
        }
    },
    deposit: {
        'get-merchant-bank-list'(event) {
            const config = useRuntimeConfig()
            if (newPaymentMerchants.indexOf(config.public.MERCHANT) > -1) {
                return _post('deposit/get-merchant-bank-list-v3', event)
            }
            return _post('deposit/get-merchant-bank-listv2', event)
        },
        'add-deposit'(event) {
            const config = useRuntimeConfig()
            if (newPaymentMerchants.indexOf(config.public.MERCHANT) > -1) {
                return _post('deposit/add-deposit-new-v2', event)
            }
            return _post('deposit/add-deposit-new', event)
        },
        'get-deposit-history'(event) {
            return _post('deposit/get-deposit-history', event)
        },
        'get-express-doposit-log'(event) {
            return _post('deposit/insert-express-deposit-log', event)
        }
    },
    withdraw: {
        'add-trading'(event) {
            return _post('withdraw/add-trading', event, ['pre_trading_password', 'login_password', 'trading_password', 'confirm_trading_password'])
        },
        'get-withdraw-bank-list'(event) {
            return _post('withdraw/get-withdraw-bank-list', event)
        },
        'do-multiple-withdraw'(event) {
            return _post('withdraw/do-multiple-withdraw', event, ['trading_password'])
        },
        'withdraw-history'(event) {
            return _post('withdraw/withdraw-history', event)
        }
    },
    referral: {
        'get-referral-dashboard'(event) {
            return _post('referral/get-referral-dashboard-new', event)
        },
        'referral-commission'(event) {
            return _post('referral/referral-commission', event)
        },
        'direct-member-info'(event) {
            return _post('referral/direct-member-info-new', event)
        },
        'referral-statistics'(event) {
            return _post('referral/referral-statistics', event)
        },
        'referral-statistics-new'(event) {
            return _post('referral/referral-statistics-new', event)
        },
        'achievement-reward-record'(event) {
            return _post('diary/get-validdirectref-history', event)
        },
        'get-referral-list'(event) {
            return _post('referral/get-referral-list', event)
        }
        
    },
    wallet: {
        'restore-balance'(event) {
            return _post('wallet/restore-balance', event)
        }
    },
    promotion: {
        'promotion-verification'(event) {
            return _post('promotion/promotion-verification', event)
        },
        'get-promotion-center-list'(event) {
            return _post('promotion/get-promotion-center-list', event)
        },
        'get-rebate-claim-history'(event) {
            return _post('promotion/get-rebate-claim-history', event)
        },
        'claim-rebate'(event) {
            return _post('promotion/claim-rebate', event)
        },
        'pending-rebate'(event) {
            return _post('promotion/pending-rebate', event)
        },
        'claim-pending-rebate'(event) {
            return _post('promotion/claim-pending-rebate', event)
        },
        'get-promotion-content-list'(event) {
            return _post('promotion/get-promotion-content-list', event)
        },
        'apply-promotion'(event) {
            return _post('promotion/apply-promotion', event)
        },
        async 'apply-promotion-crm'(event) {
            try {
                const config = useRuntimeConfig()
                if (!config.CRM_MERCHANT || !config.CRM_AUTH_KEY || !config.CRM_PROMO) {
                    return {
                        status: false
                    }
                }
                const headers = getHeaders(event)
                const protocol = (headers['HTTP_X_FORWARDED_PROTO'] || headers['REQUEST_SCHEME'] == 'https' || headers['SERVER_PROTOCOL'] == 'https') ? 'https': 'http'
                const ipWeb = JSON.stringify({
                    'HTTP_CF_CONNECTING_IP': headers['cf-connecting-ip'] || '',
                    'HTTP_CF_IPCOUNTRY': headers['cf-ipcountry'],
                    'HTTP_CLIENT_IP': headers['client-ip'] || '',
                    'HTTP_FORWARDED':  headers['forwarded'] || '',
                    'HTTP_X_FORWARDED': headers['x-forwarded'] || '',
                    'HTTP_FORWARDED_FOR': headers['forwarded-for'] || '',
                    'HTTP_X_FORWARDED_FOR': headers['x-forwarded-for'] || '',
                    'REMOTE_ADDR':  headers['x-forwarded-for'] || '',
                    'WEB_URL': headers['HTTP_REFERER'],
                    'protocol': protocol,
                })
                const userAgent = headers['user-agent']
                const storedUserCookie = getCookie(event, 'user')
                let uid = null
                const body = await readBody(event) || {}
                if (storedUserCookie) {
                    let user = JSON.parse(decode(storedUserCookie))
                    if (user && user.uid) {
                        uid = user.uid
                    } 
                }
                if (!uid) {
                    return {
                        status: false
                    }
                }
                const param = {
                    ip_web: ipWeb,
                    user_agent: userAgent,
                    uid: uid,
                    bonus_id: body.promotion_id
                }
                const res = await $fetch(`${config.CRM_PROMO}claim-bonus`, {
                    method: 'POST',
                    headers: {
                        merchant: config.CRM_MERCHANT,
                        Authorization: `Bearer ${config.CRM_AUTH_KEY}`
                    },
                    body: param
                })
                return {
                    msg: res.message,
                    status: true
                }
            }
            catch(err) {
                if (err.response) {
                    return {
                        status: false,
                        msg: err.response._data.message
                    }
                }
                return {
                    status: false
                }
            }
        },
        'get-promotion-history'(event) {
            return _post('promotion/get-promotion-history', event)
        },
        'get-rebate-history'(event) {
            return _post('promotion/get-rebate-history', event)
        }
    },
    game: {
        'login-game'(event) {
            return _post('game/via-gamecode', event)
        },
        'auto-transfer'(event) {
            return _post('game/auto-transfer', event)
        },
        'get-pt-player'(event) {
            return _post('game/get-pt-player-detail', event)
        },
        'change-app-password'(event) {
            return _post('mobile/mobile-app-change-password', event, ['password'])
        },
    },
    provider: {
        'provider-list'(event) {
            return _post('user/get-provider', event)
        }
    },
    vip: {
        'get-vip-ratio'(event) {
            return _post('vip/get-vip-ratio', event)
        },
        'manual-upgrade'(event) {
            return _post('vip/manual-upgrade', event)
        },
        'claim-bonus'(event) {
            return _post('vip/claim-bonus', event)
        },
        'get-vip-history'(event) {
            return _post('vip/get-vip-history', event)
        },
        'get-member-vip-details'(event) {
            return _post('vip/get-member-vip-details', event)
        },
        'general-vip-details'(event) {
            return _post('vip/get-general-vip-details', event)
        }
    },
    general: {
        'get-sts-token'(event) {
            return _post('general/get-sts-token', event)
        },
        'get-sts-token-new'(event) {
            return _post('general/get-sts-token-new', event)
        }
    },
    angpow: {
        'get-angpow-display'(event) {
            return _post('angpow/get-angpow-display', event)
        },
        'get-angpow-detail'(event) {
            return _post('angpow/get-angpow-reward-detail', event)
        },
        'angpow-claim'(event) {
            return _post('angpow/claim-angpow', event)
        },
        'angpow-reward-history'(event) {
            return _post('angpow/get-angpow-reward-history', event)
        },
    },
    'lucky-wheel': {
        'get-lucky-wheel'(event) {
            return _post('event/get-lucky-wheel', event)
        },
        'play-lucky-wheel'(event) {
            return _post('event/lucky-wheel-spin', event)
        },
        'get-lucky-wheel-banner'(event) {
            return _post('event/get-lucky-wheel-banner', event)
        },
    },
    diary: {
        'claim-user-diary-mission'(event) {
            return _post('diary/claim-user-diary-mission', event)
        },
        'get-user-diary-mission'(event) {
            return _post('diary/get-user-diary-mission-new', event)
        },
        'user-check-in'(event) {
            return _post('diary/add-user-check-in', event)
        },
        'get-reward-redemption-history'(event) {
            return _post('diary/get-reward-redemption-history', event)
        },
        'setup-diary-mission'(event) {
            return _post('diary/setup-diary-mission', event)
        },
    },
    notice: {
        'notice-details'(event) {
            return _post('notice/notice-details', event)
        },
        'update-unread'(event) {
            return _post('notice/update-unread', event)
        },
        'notice-list'(event) {
            return _post('notice/notice-list', event)
        },
        async 'crm'(event) {
            try {
                const config = useRuntimeConfig()
                if (!config.CRM_MERCHANT || !config.CRM_AUTH_KEY || !config.CRM_NOTI) {
                    return {
                        status: false
                    }
                }
                
                const storedUserCookie = getCookie(event, 'user')
                let uid = null
                const body = await readBody(event) || {}
                if (storedUserCookie) {
                    let user = JSON.parse(decode(storedUserCookie))
                    if (user && user.uid) {
                        uid = user.uid
                    } 
                }
                if (!uid) {
                    return {
                        status: false
                    }
                }
                const param = {
                    uid: uid,
                    notice_id: body.noticeId
                }
                const res = await $fetch(config.CRM_NOTI, {
                    method: 'POST',
                    headers: {
                        merchant: config.CRM_MERCHANT,
                        Authorization: `Bearer ${config.CRM_AUTH_KEY}`
                    },
                    body: param
                })
                return {
                    msg: res.message,
                    status: true
                }
            }
            catch(err) {
                if (err.response) {
                    return {
                        status: false,
                        msg: err.response._data.message
                    }
                }
                return {
                    status: false
                }
            }
        }
    },
    leaderboard: {
        'get-leaderboard-detail'(event) {
            return _post('tournament/get-tournament-ranking', event)
        },
        'get-tournament-provider-category' (event) {
            return _post('tournament/get-tournament-provider-category', event)
        }
    },
    mobile: {
        'mobile-login' (event) {
            return _post('mobile/get-mobile-login-detail', event)
        },
        'app-download-button' (event) {
            return _post('mobile/app-download-button', event)
        }
    },
    setting: {
        'get-setting' (event) {
            return _post('index/get-settings', event)
        },
    },
    seo: {
        'get-seo-script' (event) {
            return _post('get-seo-script', event)
        }
    },
    blog: {
        'get-blog-content-details' (event) {
            return _post('blog/get-blog-content-details', event)
        },
        'get-blog-category-details' (event) {
            return _post('blog/get-blog-category-details', event)
        }
    },
    predictor: {
        'get-user-predict-history' (event) {
            return _post('predictor/get-predictor-user-history', event)
        },
        'get-match-list' (event) {
            return _post('predictor/get-predictor-match-list', event)
        },
        'get-leaderboard-data' (event){
            return _post('predictor/get-predictor-leaderboard', event)
        },
        'add-predict-user' (event) {
            return _post('predictor/add-predictor-user', event)
        } 
    }
}

export default routes
