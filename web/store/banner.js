import { defineStore } from 'pinia'

export const useBannerStore = defineStore('banner', {
    state: () => {
        return {
            data: {},
            ready: false,
        }
    },
    actions: {
        setBanners(payload) {
            const { $i18n, $toLocaleTime } = useNuxtApp()
            let banners = {}
            if (payload) {
                const nowTimeStamp = new Date().getTime()
                $i18n.localeCodes.value.forEach(langCode => {
                    if (!payload[langCode]) return
                    banners[langCode] = {}
                    for (let page in payload[langCode]) {
                        banners[langCode][page] = []
                        // only use banners that are still active
                        payload[langCode][page].forEach(b => {
                            let bannerStartTimeStamp = $toLocaleTime(b.start_date).getTime()
                            let bannerEndTimeStamp = $toLocaleTime(b.end_date).getTime()
                            if (bannerStartTimeStamp <= nowTimeStamp && nowTimeStamp < bannerEndTimeStamp) {
                                banners[langCode][page].push(b)
                            }
                        })
                    }
                })
            }
            this.data = banners
            this.ready = true
        }
    }
})