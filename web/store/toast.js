import { defineStore } from 'pinia'

const maxItems = 1

export const useToastStore = defineStore('toast', {
    state: () => {
        return {
            items: []
        }
    },
    actions: {
        new(payload) {
            if (!payload.message) return
            if (this.items.length == maxItems) {
                this.items.splice(0, 1)
            }
            const duration = typeof payload.duration == 'number' ? payload.duration : 3000
            payload.duration = duration
            this.items.push({
                id: payload.id,
                message: payload.message,
                status: payload.status,
                duration: payload.duration
            })
            setTimeout(() => {
                this.remove(payload.id)
            }, duration)
        },
        remove(id) {
            this.items = this.items.filter(item => item.id != id)
        }
    }
})