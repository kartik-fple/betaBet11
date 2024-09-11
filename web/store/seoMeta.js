import { defineStore } from 'pinia'

// import { getJSON } from '~/assets/js/cache'
// import getDomainCountry from '@/assets/js/getDomainCountry'

export const useSeoMetaStore = defineStore('seoMeta', {
    state: () => {
        return {
            metaLoading: true,
            metaData: [],
            metaContent: {},

            footerLoading: true,
            footerData: [],
            footerContent: '',
            footerContentType: '',
        }
    },
    actions: {
        async initSeoMeta(config, $getData, cacheKey, resData, resFetching) {
            if (process.server) {
                const res = await $getData(config.public.SEO_JSON, cacheKey)
                resFetching.value = false
                if (!res) {
                    return
                }
                resData.value = res

                if (config.public.SEO_JSON_EXTRA) {
                    const res2 = await $getData(config.public.SEO_JSON_EXTRA, `${cacheKey}_extra`)
                    if (res2) {
                        resData.value.push(...res2)
                    }
                }
            } else {
                const res = await getJSON(config.public.SEO_JSON, cacheKey)
                resFetching.value = false
                if (!res.status) {
                    return
                }
                resData.value = res.data

                if (config.public.SEO_JSON_EXTRA) {
                    const res2 = await getJSON(config.public.SEO_JSON_EXTRA, `${cacheKey}_extra`)
                    if (res2.status) {
                        resData.value.push(...res2.data)
                    }
                }
            }

            this.metaData = resData.value
        },
        setSeoMeta(config, route, mainStore, $i18n, domain, language, title, titleFallback) {
            const { t, locale, locales } = $i18n

            let metaExtract = {};
            let metaExtract2 = {};

            metaExtract = this.metaData.filter(meta => meta.language == language && meta.url == title)?.[0] || {};
            if (Object.keys(metaExtract).length !== 0) {
                this.metaContent = metaExtract
            } else if (titleFallback != title) {
                metaExtract2 = this.metaData.filter(meta => meta.language == language && meta.url == titleFallback)?.[0] || {};
                if (Object.keys(metaExtract2).length !== 0) {
                    this.metaContent = metaExtract2
                }
            }

            if (Object.keys(metaExtract).length === 0 && Object.keys(metaExtract2).length === 0) {
                this.metaContent = {}
            }

            let metaObject = {
                bodyAttrs: {
                    class: computed(() => { return `${mainStore.noScrollCount > 0 ? 'no-scroll' : ''} ${mainStore.lang}` })
                },
                htmlAttrs: {
                    lang: mainStore.lang
                },
                title: null,
                link: [],
                meta: []
            }

            try {
                const linkPath = title == 'home' ? '' : `/${title}`

                let metas = []
                let [lang, country] = locale.value.split('-')
                if (!lang) lang = 'en'

                let mainDomain = domain
                if (typeof config.public.MAIN_DOMAIN == 'string' && config.public.MAIN_DOMAIN != '') {
                    mainDomain = config.public.MAIN_DOMAIN
                }
                else if (typeof config.public.MAIN_DOMAIN == 'object' && config.public.MAIN_DOMAIN[country]) {
                    mainDomain = config.public.MAIN_DOMAIN[country]
                }
                
                // alternate 
                let alternateDomain = domain
                if (typeof config.public.ALTERNATE_URL_DOMAIN == 'string' && config.public.ALTERNATE_URL_DOMAIN != '') {
                    alternateDomain = config.public.ALTERNATE_URL_DOMAIN
                }

                let links = [{
                    rel: 'alternate',
                    href: `${alternateDomain}/${config.public.DEFAULT_LOCALE}${linkPath}`,
                    // href: `${domain}/${locale.value}${linkPath}`, // <== default-lang.global.js already auto redirect to locale based on country
                    hreflang: 'x-default'
                }, {
                    rel: 'canonical',
                    href: `${mainDomain}/${locale.value}${linkPath}`
                }]

                // cb gcwinthai1.com wanna add trailing slash. ONLY THIS DOMAIN
                if (domain.indexOf('gc99thai1.com') > -1 && linkPath.slice(-1) != '/') {
                    links[1] = {
                        rel: 'canonical',
                        href: `${mainDomain}/${locale.value}${linkPath}/`
                    }
                }

                /*  Find the country that current domain belongs to
                    by default the country is set based on locale.value, e.g. en-th means country is th.
                    However, the seo meta should be based on domain, and each domain belongs to a country.
                    e.g. if current url is 22winph1.com/en-th/, then we need to set country as ph instead of th
                    because 22winph1.com is for philippines
                */

                let domainCountry = country
                let domainLang = lang
                let isLocaleValid = false
                if (config.public.LOCALES_DOMAIN) {
                    // find if current domain belong to a country
                    const matchedDomainCountry = getDomainCountry(config, domain)
                    if (matchedDomainCountry) {
                        domainCountry = matchedDomainCountry
                        /* check if {lang}-{domainCountry} is valid.
                            e.g. if lang = tl, and domainCountry = th
                            "tl-th" is not valid, revert to valid lang based on the domainCountry e.g. 'en-th'
                        */
                        let domainLocale = `${lang}-${domainCountry}`
                        let validLocales = {}
                        locales.value.forEach(l => {
                            if (!validLocales[l.countryCode]) {
                                validLocales[l.countryCode] = [l.code]
                            }
                            else {
                                validLocales[l.countryCode].push(l.code)
                            }
                            if (l.code == domainLocale) {
                                isLocaleValid = true
                            }
                        })

                        if (!isLocaleValid && validLocales[domainCountry] && validLocales[domainCountry].length > 0) { // domainLocale is not valid
                            const [validLocaleLang] = validLocales[domainCountry][0].split('-')
                            domainLang = validLocaleLang
                        }
                    }
                }

                // alternate links
                locales.value.forEach(l => {
                    if ((route.meta?.currencySensitive && l.countryCode == domainCountry) || !route.meta?.currencySensitive) {
                        if (typeof config.public.MAIN_DOMAIN == 'object' && config.public.MAIN_DOMAIN[l.countryCode]) {
                            alternateDomain = config.public.MAIN_DOMAIN[l.countryCode]
                        } else if (typeof config.public.ALTERNATE_URL_DOMAIN == 'string' && config.public.ALTERNATE_URL_DOMAIN != '') {
                            alternateDomain = config.public.ALTERNATE_URL_DOMAIN 
                        }
                        links.push({
                            rel: 'alternate',
                            href: `${alternateDomain}/${l.code}${linkPath}`,
                            hreflang: l.code
                        })
                    }
                })

                // title, description, keywords
                if (this.metaContent) {
                    metaObject.title = this.metaContent.title
                    metas = [{
                        name: 'title',
                        content: this.metaContent.title
                    }, {
                        name: 'description',
                        content: this.metaContent.description
                    }, {
                        name: 'keywords',
                        content: this.metaContent.keyword
                    }, {
                        name: 'og:title',
                        content: this.metaContent.title
                    }, {
                        name: 'og:description',
                        content: this.metaContent.description
                    }, {
                        name: 'og:keywords',
                        content: this.metaContent.keyword
                    },{
                        name: 'twitter:title',
                        content: this.metaContent.title
                    }, {
                        name: 'twitter:description',
                        content: this.metaContent.description
                    }]
                }

                if (!metaObject.title) {
                    const defaultTitle = `${config.public.TITLE} | ${titleFallback ? t(titleFallback.replace(/-/g, '_')) : ''}`
                    metaObject.title = defaultTitle
                    metas = [{
                        name: 'title',
                        content: defaultTitle
                    }, {
                        name: 'og:title',
                        content: defaultTitle
                    }, {
                        name: 'twitter:title',
                        content: defaultTitle
                    }]
                }

                 // get host
                 let host = mainDomain
                 try {
                     let domainInfo = new URL(mainDomain)
                     if (domainInfo && domainInfo.host) {
                         host = domainInfo.host.replace('www.', '')
                     }
                 }
                 catch(err) {}

                metas.push({
                    name: 'og:url',
                    content: `${mainDomain}/${locale.value}${linkPath}`
                }, {
                    name: 'og:type',
                    content: 'website'
                }, {
                    name: 'twitter:card',
                    content: 'summary_large_image'
                }, {
                    name: 'twitter:domain',
                    content: host
                }, {
                    name: 'twitter:url',
                    content: `${mainDomain}/${locale.value}${linkPath}`
                }, {
                    name: 'og:image',
                    property: 'og:image',
                    content: config.public.SHARE_PREVIEW_IMG?.[locale.value] ? `${domain}/${config.public.MERCHANT}/img/share_preview/${lang}.jpg` : `${domain}/${config.public.MERCHANT}/pwa-512x512.png`
                }, {
                    name: 'og:image_secure_url',
                    property: 'og:image_secure_url',
                    content: config.public.SHARE_PREVIEW_IMG?.[locale.value] ? `${domain}/${config.public.MERCHANT}/img/share_preview/${lang}.jpg` : `${domain}/${config.public.MERCHANT}/pwa-512x512.png`
                }, {
                    name: 'twitter:image',
                    property: 'twitter:image',
                    content: config.public.SHARE_PREVIEW_IMG?.[locale.value] ? `${domain}/${config.public.MERCHANT}/img/share_preview/${lang}.jpg` : `${domain}/${config.public.MERCHANT}/pwa-512x512.png`
                })

                let needIndex = domainCountry == country
                config.public.NO_INDEX_DOMAIN.forEach(d => {
                    if (domain.indexOf(d) > -1) {
                        needIndex = false
                    }
                })
                if (config.public.ENV != 'production') {
                    needIndex = false
                }

                metas.push({
                    name: 'robots',
                    content: needIndex ? 'index,follow' : 'noindex,nofollow'
                }, {
                    name: 'googlebot',
                    content: needIndex ? 'index,follow' : 'noindex,nofollow'
                })
                metaObject.link = links
                metaObject.meta = metas
            } catch (err) {
                console.log(err)
            }
            finally {
                this.metaLoading = false;
                return metaObject
            }
        },
        async initSeoMetaFooter(config, $getData, cacheKey, resData, resFetching) {
            if (process.server) {
                const res = await $getData(config.public.FOOTER_URL, cacheKey)
                resFetching.value = false
                if (!res) {
                    return
                }
                resData.value = res

                if (config.public.FOOTER_URL_EXTRA) {
                    const res2 = await $getData(config.public.FOOTER_URL_EXTRA, `${cacheKey}_extra`)
                    if (res2) {
                        resData.value.push(...res2)
                    }
                }
            } else {
                const res = await getJSON(config.public.FOOTER_URL, cacheKey)
                resFetching.value = false
                if (!res.status) {
                    return
                }
                resData.value = res.data

                if (config.public.FOOTER_URL_EXTRA) {
                    const res2 = await getJSON(config.public.FOOTER_URL_EXTRA, `${cacheKey}_extra`)
                    if (res2.status) {
                        resData.value.push(...res2.data)
                    }
                }
            }

            this.footerData = resData.value
        },
        setSeoMetaFooter(language, title, titleFallback, useH1Fallback) {
            let footExtract = '';
            let footExtract2 = '';
            let footExtractType = '';
            
            footExtract = this.footerData.filter(footer => footer.language == language && footer.title == title)?.[0]?.content || '';
            footExtractType = this.footerData.filter(footer => footer.language == language && footer.title == title)?.[0]?.display_type || '';
            if (footExtract) {
                this.footerContent = footExtract;
                this.footerContentType = footExtractType || '';
            }
            else if (useH1Fallback) {
                const matchedTitle = this.metaData.find(meta => meta.language == language && meta.url == title);
                if (matchedTitle && matchedTitle.title) {
                    footExtract = `<h1>${matchedTitle.title}</h1>`
                    this.footerContent = `<h1>${matchedTitle.title}</h1>`
                    this.footerContentType = footExtractType || '';
                }
            }
            if ((titleFallback != title) && !footExtract) {
                footExtract2 = this.footerData.filter(footer => footer.language == language && footer.title == titleFallback)?.[0]?.content || '';
                if (footExtract2) {
                    this.footerContent = footExtract2
                    this.footerContentType = footExtractType || '';
                }
            }

            if (footExtract == '' && footExtract2 == '') {
                this.footerContent = ''
                this.footerContentType = '';
            }

            this.footerLoading = false;
        }
    }
})