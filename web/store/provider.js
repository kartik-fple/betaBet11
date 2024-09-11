import { defineStore } from 'pinia'
// import { getJSON } from '~/assets/js/cache'

export const useProviderStore = defineStore('provider', {
    state: () => {
        return {
            data: {},
            meta: {},
            ready: false
        }
    },
    actions: {
        async getProviders() {
            // json
            this.ready = false
            const config = useRuntimeConfig()
            const env = config.public.ENV == 'production' ? 'production' : 'staging'
            const { $getCurrency } = useNuxtApp()
            const currency = $getCurrency()
            const url =`${config.public.PUBLIC_FE_BUCKET}backend/${env}/game/${currency}/getProvider.json.gz`
            const res = await getJSON(url, `providers_${currency}`)
            if (res.status && res.data) {
                this.setProviders(res.data)

                if (config.public.GAME_CATEGORY_LIST.includes('egames') && this.data['egames']) {
                    const url2 =`${config.public.PUBLIC_FE_BUCKET}backend/${env}/game/${currency}/getMobileGameUrl.json.gz`
                    const res2 = await getJSON(url2, `egame_url_${currency}`)
                    if (res2.status) {
                        this.data['egames'].forEach(egame => {
                            egame['url'] = res2.data.find((f) => f.provider_id == egame.id)?.url || '';
                        })
                    }
                }
            }
        },
        setProviders(payload) {
            const dashboardStore = useDashboardStore()
            if (dashboardStore.data && dashboardStore.data.restrict) {
                const restrictedProviders = dashboardStore.data.restrict || ''
                const providersToRemove = restrictedProviders.split(',')
                for (let c in payload) {
                    payload[c] = payload[c].filter(p => providersToRemove.indexOf(p.id) < 0)
                }
            }
            
            this.data = payload

            const config = useRuntimeConfig()
            // if (config.public.ENV == 'production' && ['jw8'].includes(config.public.MERCHANT) && config.public.GAME_CATEGORY_LIST.includes('egames')) {
            //     this.data['egames'] = this.data['slot'].filter(p => p.mobile_status == '1');
            //     this.data['slot'] = this.data['slot'].filter(p => p.mobile_status == '0');
            // }
            
            Object.keys(payload).forEach(category => {
                this.meta[category] = {}
                payload[category].forEach(provider => {
                    this.meta[category][provider.providerName.toUpperCase()] = {
                        show_hot: provider.show_hot,
                        show_new: provider.show_new,
                        show_vpn: provider.show_vpn,
                    }
                })
            })
           /*  Object.keys(payload).forEach(category => {
                this.maintenanceData[category] = {}
                payload[category].forEach(provider => {
                    this.maintenanceData[category][provider.providerName] = {
                        game_maintenance: provider.game_maintenance,
                        maintenance_end: provider.maintenance_end,
                        maintenance_start: provider.maintenance_start,
                    }
                })
            }) */
            this.ready = true
        }
    }
})