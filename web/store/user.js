import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
    state: () => {
        return {
            loggedIn: false,
            data: null,
            wallet: null,
            verifyEmailModal: false,
            verifyPhoneModal: false,
            needPin: false,
            isActivePin: false
        }
    },
    actions: {
        setNeedPin(payload) {
            this.needPin = payload
        },
        setIsActivePin(payload) {
            this.isActivePin = payload
        },
        setUser(payload) {
            this.loggedIn = true
            this.data = payload
        },
        setUserWallet(payload) {
            this.wallet = payload
        },
        async getBal() {
            const { $api } = useNuxtApp()
            const res = await $api('user/get-bal', {})
            if (!res.status) {
                return res
            }

            //update wallet
            this.wallet = res.data?.[0]
            return res
        },
        async login(params) {
            const { $api } = useNuxtApp()
            const res = await $api('index/auth', params)
            if (res.status) {
                const mainStore = useMainStore()
                // check if user's country is same as current locale
                const [lang, country] = res.data.default_lang.split('-')
                if (country != mainStore.country) { // different country, use user's country
                    const router = useRouter()
                    const switchLocalePath = useSwitchLocalePath()
                    await router.replace(switchLocalePath(res.data.default_lang))
                }
                this.loggedIn = true
                this.data = res.data

                const promoStore = usePromotionStore()
                promoStore.reset()

                const oneSignalStore = useOneSignal()
                const config = useRuntimeConfig()
                if (config.public.ENV != 'production' && config.public.MERCHANT == 'jolibet') {
                    await oneSignalStore.loadOneSignal()
                } 
            }
            return res
        },
        async logout(redirectUrl) {
            const { $api } = useNuxtApp()
            const res = await $api('index/logout', {})
            if (res.status) {
                this.loggedIn = false
                this.data = null
                
                const promoStore = usePromotionStore()
                promoStore.reset()
                if (redirectUrl) {
                    navigateTo(redirectUrl)
                }
            }
        }
    }
})