import { defineStore } from 'pinia'
// import { getJSON } from '~/assets/js/cache'
// import getDomainCountry from "@/assets/js/getDomainCountry"

export const useCountryStore = defineStore('country', {
    state: () => {
        return {
            data: {},
            ready: false
        }
    },
    actions: {
        async getCountries() {
            const config = useRuntimeConfig()
            const env = config.public.ENV == 'production' ? 'production' : 'staging'
            const url =`${config.public.PUBLIC_FE_BUCKET}backend/${env}/json/countrylist.json.gz`
            const res = await getJSON(url, `country_list`)
            if (res.status) {
                if (['jw8'].includes(config.public.MERCHANT) && config.public.ENV == 'production') {
                    try {
                        let domainCountry = getDomainCountry(config, window.location.host)
                        if (domainCountry == 'my') {
                            domainCountry = domainCountry.toUpperCase()
                            res.data = res.data.filter(l => l.abr == 'MY')
                        }
                        else {
                            res.data = res.data.filter(l => l.abr != 'MY')
                        }
                    }
                    catch(err) {
                        console.log(err)
                    }
                }
                this.setCountries(res.data)
            }
        },
        setCountries(payload) {
            this.data = payload
            this.ready = true
        }
    }
})