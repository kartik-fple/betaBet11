import { defineStore } from 'pinia'

export const usePromotionStore = defineStore('promotion', {
    state: () => {
        return {
            data: null,
            loaded: false,
            mypromo: null,
            myloaded: false,
            getting: false,
        }
    },
    actions: {
        reset() {
            this.data = null
            this.loaded = false
            this.mypromo = null
            this.myloaded = false
        },
        setPromotion(payload) {
            this.data = payload
        },
        async getList(force) {
            if (this.loaded && !force) {
                return
            }
            if (this.getting) {
                return
            }
            this.getting = true;
            const {$api, $getCurrency} = useNuxtApp()
            const res = await $api('promotion/get-promotion-content-list', {
                currency: $getCurrency()
            })
            this.getting = false;
            if (res.status) {
                this.data = res.data
                this.loaded = true
            }
        },
        async getMyPromo(force, payload) {
            if (this.myloaded && !force) return
            const {$api} = useNuxtApp()
            const res = await $api('promotion/get-promotion-center-list', payload)
            if (res.status) {
                this.mypromo = res.data
                this.myloaded = true
            }
        }
    }
})
