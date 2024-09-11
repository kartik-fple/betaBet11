import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
    state: () => {
        return {
            data: null,
            ready: false
        }
    },
    actions: {
        setMenu(payload) {
            this.data = payload
            this.ready = true
        }
    }
})