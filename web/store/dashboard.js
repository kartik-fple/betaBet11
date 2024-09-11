import { defineStore } from 'pinia'

export const useDashboardStore = defineStore('dashboard', {
    state: () => {
        return {
            data: null,
            ready: false,
            getting: false,
            previousDataIsLoggedIn: false,
            previousApiTimeStamp: null,
            maintenanceData: {},
            callNumber: 0 // can be watched to track data change
        }
    },
    actions: {
        async init(force) {
            if (this.getting) return
            const userStore = useUserStore();
            if (!force && this.previousDataIsLoggedIn == userStore.loggedIn && this.previousApiTimeStamp) {
                const milisecondsDifferenceFromLastCall = Date.now() - this.previousApiTimeStamp
                if (milisecondsDifferenceFromLastCall < 30000) { // previous api call is within 30 seconds, return
                    this.callNumber++
                    return {
                        status: true,
                        data: this.data
                    }
                }
            }
            const { $api, $toLocaleTime, $fdl } = useNuxtApp()
            this.getting = true
            const res = await $api('user/dashboardv2', {
                page_name: 'home'
            })
            this.getting = false

            if(!res.status) {
                return res
            }

            if (userStore.loggedIn) {
                this.previousDataIsLoggedIn = true
                userStore.setNeedPin(res.data.trading_setting.setting == '1')
                if (res.data.trading_setting.setting == '1') {
                    userStore.setIsActivePin(res.data.trading_setting.setup == '1')
                }   
                userStore.setUserWallet(res.data.wallet?.[0])
            } else {
                this.previousDataIsLoggedIn = false
                userStore.setNeedPin(false)
                userStore.setIsActivePin(false)
                userStore.setUserWallet(null)
            }
            this.data = res.data
            this.ready = true
            this.previousApiTimeStamp = Date.now()
            if (Array.isArray(res.data.provider_maintenance)) {
                let providersUnderMaintenance = {}
                res.data.provider_maintenance.forEach(p => {
                    providersUnderMaintenance[p.provider_id] = {
                        start_date: $fdl($toLocaleTime(p.start_time)),
                        end_date: $fdl($toLocaleTime(p.end_time))
                    }
                })
                this.maintenanceData = providersUnderMaintenance
            }
            this.callNumber++
            return res
        }
    },
    getters: {
        countryLanguages(state) {
            if (!state.ready || !state.data) {
                return null
            }
            let items = {}
            Object.keys(state.data.user_language).forEach((i) => {
                Object.keys(state.data.user_language[i]).forEach((j) => {
                    let list = Object.keys(state.data.user_language[i][j]).map(k => k)
                    items[j.toLowerCase()] = list.map(l => ({
                        code: `${l}-${j.toLowerCase()}`,
                        countryCode: j.toLowerCase(),
                        name: state.data.user_language[i][j][l]
                    }))
                })
            })
            return items
        },
        hasLanguageSelection() {
            if (!this.countryLanguages) {
                return false
            }
            const langs = Object.values(this.countryLanguages)
            if (langs.length > 1) {
                return true
            }
            else if (langs.length == 1) {
                return langs[0].length > 1
            }
        }
    }
})