<template>
    <div v-if="canAccess">
        <VitePwaManifest />
        <MissionDailyModal />
        <NuxtLayout>
            <NuxtPage />
            <PreLoad :class="{ 'show': showPreload }"></PreLoad>
            <ContactBar v-if="!isMobile" />
            <ContactBarMobile v-if="isMobile" />
            <MerchantAuthReg v-if="countryStore.ready" />
            <ForgotPassword v-if="countryStore.ready && !config.public?.FORGOT_PASSWORD_PAGE" />
            <IosModal />
            <CommunityModal />
            <MobileSideBar></MobileSideBar>
            <LeaderboardModal :show="mainStore.leaderboardModal" @close="mainStore.leaderboardModal = false"></LeaderboardModal>
            <AnnouncementModal></AnnouncementModal>
            <SuccessRegisterModal />
            <OrientationCheck></OrientationCheck>
            <SportVersionModal :show="gamesStore.showVersionModal" @close="gamesStore.showVersionModal = false" />
            <RedeemCodeModal />
        </NuxtLayout>
    </div>
    <div v-else="!canAccess">
        <NoAccess />
    </div>
</template>

<script setup>
import { registerSW } from 'virtual:pwa-register'
// import { getJSON } from '~/assets/js/cache'

const canAccess = ref(true)
onBeforeMount(async () => {
    try {
        await $fetch('https://common-public.s3.ap-southeast-1.amazonaws.com/s3_status.json')
    }
    catch (err) {
        canAccess.value = false
    }
})

onBeforeMount(() => {
    const updateSW = registerSW({
        onNeedRefresh() {
            updateSW()
        },
        onOfflineReady() { },
    })
})

const { $api, $toast, $pub, $setMeta, ssrContext, $trackEvent } = useNuxtApp()
const { isMobile, isIos } = useDevice();
const localePath = useLocalePath()

const config = useRuntimeConfig()
const userStore = useUserStore()
const gamesStore = useGamesStore()
const mainStore = useMainStore()
const showPreload = ref(false);
const triggerRegister = async (e) => {
    mainStore.loginModal = false;
    mainStore.regModal = true;
}
provide('triggerRegister', triggerRegister)

const triggerForgot = (e) => {
    mainStore.loginModal = false;
    mainStore.forgotPasswordModal = true;
}
provide('triggerForgot', triggerForgot)

const triggerLogin = (e) => {
    mainStore.regModal = false;
    mainStore.loginModal = true;
}
provide('triggerLogin', triggerLogin)

const router = useRouter()
watch(() => mainStore.regModal, () => {
    if (mainStore.regModal) {
        let qNewReg = { ...route.query };
        qNewReg['signup'] = 1;
        delete qNewReg.login;
        if (config.public?.REGISTER_PAGE) {
            router.push({ path: localePath('/register') })
        } else {
            router.replace({ query: qNewReg });
        }
    }
}, {
    immediate: false
})

watch(() => mainStore.loginModal, () => {
    if (mainStore.loginModal) {
        let qNewLog = { ...route.query };
        qNewLog['login'] = 1;
        delete qNewLog.signup;
        if (config.public?.LOGIN_PAGE) {
            router.push({ path: localePath('/login') })
        } else {
            router.replace({ query: qNewLog });
        }
    }
}, {
    immediate: false
})

const authModal = computed(() => {
    return (mainStore.loginModal && !config.public?.LOGIN_PAGE) || (mainStore.regModal && !config.public?.REGISTER_PAGE)
})

watch(() => authModal.value, () => {
    if (config.public.ENV != 'production' && config.public.MERCHANT == 'jolibet') {
        if (authModal) {
            let qNew = { ...route.query };
            if (mainStore.socialMediaLogin) return
            delete qNew.login;
            delete qNew.signup;
            router.replace({ query: qNew });
        }
    } else {
        if (authModal) {
            let qNew = { ...route.query };
            delete qNew.login;
            delete qNew.signup;
            router.replace({ query: qNew });
        }
    }
}, {
    immediate: false
})

//handle affiliate
onMounted(async () => {
    let affiliateCode = null
    if (Array.isArray(config.public.PRESET_REFERRAL_CODE)) {
        // find matching domain
        const matchedDomain = config.public.PRESET_REFERRAL_CODE.find(c => window.location.origin.indexOf(c.domain) > -1)
        if (matchedDomain) {
            affiliateCode = matchedDomain.code
        }
    }
    // if no matching domain, read from query
    if (!affiliateCode) {
        affiliateCode = route.query.aff || route.query.ref
    }
    if (affiliateCode) {
        const res = $api('user/update-click', {
            aff_code: affiliateCode
        })
        window.localStorage.setItem("aff", affiliateCode)
        if (!userStore.loggedIn && route.query.m) {
            //m=1, pop up modal
            triggerRegister()
        }
    } else {
        if (!userStore.loggedIn && route.query.signup) {
            //signup=1, pop up modal
            triggerRegister()
        }

        if (!userStore.loggedIn && route.query.login) {
            //login=1, pop up modal
            triggerLogin()
        }
    }
})

/* No light or dark theme */
/* onBeforeMount(() => {
  // theme
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}) */

const route = useRoute()
//watch query social
watch(() => route.query.signup, (value) => {
    if (config.public.ENV != 'production' && config.public.MERCHANT == 'jolibet' && !userStore.loggedIn && value) {
        triggerRegister()
    }
})
const { t, locale, locales } = useI18n()

// dashboard
const dashboardStore = useDashboardStore()

watch(() => mainStore.noScrollCount, () => {
    if (mainStore.noScrollCount > 0) {
        if (config.public.MERCHANT == 'dis88' && dashboardStore.data.currency == 'AUD') {
            if (!mainStore.regModal) {
                contactStore.forceHideChat()
            }
        } else {
            contactStore.forceHideChat()
        }
    } else {
        contactStore.setLiveChatDisplay()
    }
})

// get menu list
const menuStore = useMenuStore()
onMounted(async () => {
    const menuList = await getJSON(config.public.MENU_LIST_URL, 'menu')
    if (menuList.status) {
        menuStore.setMenu(menuList.data)
    }
})

// get contact list
const contactStore = useContactStore()
onMounted(async () => {
    const contactList = await getJSON(config.public.CONTACT_LIST_URL, 'contact')
    if (contactList.status) {
        contactStore.setContact(contactList.data)
    }
})

// get country list
const countryStore = useCountryStore()
onMounted(async () => {
    countryStore.getCountries()
})

// get provider list
const providerStore = useProviderStore()
const getProviders = async () => {
    providerStore.getProviders()
}

onMounted(async () => {
    getProviders()
})

watch(() => mainStore.country, () => {
    getProviders()
})

// get banner json
const bannerStore = useBannerStore()
onMounted(async () => {
    const bannerList = await getJSON(config.public.BANNER_URL, 'banner')
    if (bannerList.status) {
        bannerStore.setBanners(bannerList.data)
    } else {
        bannerStore.setBanners(null)
    }
})

onMounted(() => {
    if (config.public.PRELOAD == true) {
        showPreload.value = true
        setTimeout(() => {
            showPreload.value = false
        }, 2000)
    }
    dashboardStore.init(true)

})

//dashboard (different data with or without login)
const getDashboardRestrict = computed(() => {
    if (dashboardStore.data && dashboardStore.data && dashboardStore.data.restrict) {
        return true;
    }
    return false
})

watch(() => getDashboardRestrict.value, () => {
    getProviders()
    gamesStore.getGames(config.public.GAME_CATEGORY_LIST[0]);
})

watch(() => userStore.loggedIn, () => {
    dashboardStore.init()
    // $api('wallet/restore-balance')
})

watch(() => locale.value, () => {
    dashboardStore.init(true)
})

onMounted(async () => {
    if (userStore.loggedIn) {
        await $api('wallet/restore-balance')
    }
})

watch(() => locale.value, () => {
    const [lang, country] = locale.value.split("-")
    if (lang && country) {
        mainStore.lang = lang
        mainStore.country = country
    } else {
        const [defLang, defCountry] = config.public.DEFAULT_LOCALE.split('-')
        mainStore.lang = defLang;
        mainStore.country = defCountry
    }
}, {
    immediate: true
})

let root = null
let sizeTimer = null;
const syncHeight = () => {
    if (sizeTimer) {
        clearTimeout(sizeTimer);
        sizeTimer = null;
    }
    sizeTimer = setTimeout(() => {
        root.style.setProperty('--window-height', `${window.innerHeight - 1}px`);
        clearTimeout(sizeTimer);
        sizeTimer = null;
    }, 400)
}
onMounted(() => {
    root = document.documentElement;
    window.addEventListener('resize', syncHeight);
    syncHeight()
})

// appsflyer page tracking
watch(() => route.path, (newPath) => {
    if (window.AF) {
        AF('pba', 'event', { eventType: 'EVENT', eventValue: { 'page_url': newPath }, eventName: 'view_content' });
    }
})

// check if is from webview
const isApp = useCookie('isApp')
const appSource = useCookie('app_source')

if ('app' in route.query) {
    isApp.value = 1
    if ('source' in route.query && (route.query.source.indexOf('mobileapp') > -1)) {
        appSource.value = route.query.source
    }
}

const prevUrl = useCookie('prevUrl')
onMounted(() => {
    if (route.query.ref_source) {
        prevUrl.value = route.query.ref_source
    }
    else if (window.document.referrer) {
        prevUrl.value = window.document.referrer.replace('sw.js', '')
    }
})

// Local Notification
watch(() => userStore.loggedIn, async () => {
    if (!userStore.loggedIn) {
        return false;
    }

    navigator.serviceWorker.register('/swnoti.js');

    const perm = await Notification.requestPermission();
    if (perm === 'granted' && userStore.loggedIn) {
        const res = await $api('notice/notice-list', {
            'notification': 1
        })
        if (!res.status) {
            $toast(res.status, res.msg)
            return
        }

        if (res.data.item.length > 0) {
            navigator.serviceWorker.ready.then((registration) => {
                res.data.item.forEach((noti, i) => {
                    registration.showNotification(noti.title, {
                        // body: noti.message,
                        icon: `/${config.public.MERCHANT}/pwa-192x192.png`,
                        data: { ...noti, localePath: localePath('/notifications') },
                    })
                })
            });
        }
    }
})

//hotjar tracking code
onMounted(() => {
    if (config.public.ENV == 'production' && config.public.MERCHANT == 'peso88') {
        let hjid = {
            'tl-ph': 'l8vwt7ofan',
            'en-ph': 'l8vw7t0bvg'
        }
        let script = document.createElement('script')
        let inline = document.createTextNode(`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${hjid[locale.value]}");`);
        script.appendChild(inline)
        document.head.appendChild(script)
    }

    if (config.public.ENV == 'production' && config.public.MERCHANT == 'pesobet') {
        let hjid = {
            'tl-ph': 'l7v8k8ckev',
            'en-ph': 'l7v7ei6x8o'
        }
        let script = document.createElement('script')
        let inline = document.createTextNode(`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${hjid[locale.value]}");`);
        script.appendChild(inline)
        document.head.appendChild(script)
    }
})

//SEO
onServerPrefetch(async () => {
    await $setMeta()
})

onMounted(async () => {
    $setMeta()
})

watch(() => route.path, (newPath) => {
    $setMeta()
})

watch(() => mainStore.lang, () => {
    $setMeta()
})

watch(() => mainStore.noScrollCount, () => {
    $setMeta()
})

// Set clickid from URL to cookie
onMounted(() => {
    let clickid = route.query.cid || route.query.click_id || route.query.clickid || route.query['click-id']
    if (clickid) {
        const clickidCookie = useCookie('clickid')
        clickidCookie.value = clickid
    }
})

// Set vcid from URL to cookie
onMounted(() => {
    let vcid = route.query.vcid
    if (vcid) {
        const vcidCookie = useCookie('vcid')
        vcidCookie.value = vcid
    }
})

// Set bcid from URL to cookie
onMounted(() => {
    let bcid = route.query.bcid
    if (bcid) {
        const bcidCookie = useCookie('bcid')
        bcidCookie.value = bcid
    }
})

onMounted(() => {
    if (isIos) {
        // Prevent pinch-to-zoom on mobile devices
        document.addEventListener('gesturestart', function (e) {
            e.preventDefault();
        });

        // Prevent pinch-to-zoom on iOS Safari
        document.addEventListener('touchmove', function (e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
})

onMounted(() => {
    $trackEvent('pageView')
})

onMounted(async () => {
    const getGeneralData = ref('');
    if (config.public.ENV == 'production') {
        getGeneralData.value = await getJSON(`${config.public.PUBLIC_FE_BUCKET}backend/production/general.json`, 'general')
    } else {
        getGeneralData.value = await getJSON(`${config.public.PUBLIC_FE_BUCKET}backend/staging/general.json`, 'general')
    }
    if (getGeneralData.value) {
        mainStore.generalData = getGeneralData.value;
    }
})

//one signal 
const oneSignalStore = useOneSignal()
onMounted(async () => {
    if (config.public.ENV != 'production' && config.public.MERCHANT == 'jolibet' && userStore.loggedIn) {
        await oneSignalStore.loadOneSignal()
    }
})
</script>