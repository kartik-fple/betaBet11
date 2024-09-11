import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
    state: () => {
        return {
            noScrollCount: 0,
            loginModal: false,
            regModal: false,
            forgotPasswordModal: false,
            leaderboardModal: false,
            missionDailyModal: false,
            missionDailyModalPop: false,
            announcementModal: false,
            regSettings: null,
            userFavourite: [],
            sidebar: false,
            loadingGame: false,
            lang: '',
            country: '',
            appBannerDisplay: false,
            iosModal: false,
            redeemCodeModal: false,
            seoFooterRefreshKey: 1,
            successRegisterModal: false,
            successRegisterData: null,
            showRedeemBanner: false,
            socialMediaLogin: false,
            showFreeCredit: true,
            showFreeCreditModal: true,
            generalData:'',
            promoNotEligibleModal: false,
            promoNotEligibleMsg: [],
            communityModal: false,
        }

    },
    actions: {
        async setRegSettings() {
            const { $api } = useNuxtApp()
            const res = await $api('user/get-quick-register-setting', {})
            if(res.status) {
                this.regSettings = res.data
            }
        }
    }
})
