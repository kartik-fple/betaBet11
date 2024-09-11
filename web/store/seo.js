import { defineStore } from 'pinia'
// import getDomainCountry from '@/assets/js/getDomainCountry'

export const useSeoStore = defineStore('seo', {
    state: () => {
        return {
            data: {},
            domain: ''
        }
    },
    actions: {
        async setData(data) {
            this.data = data
        }
    }
})