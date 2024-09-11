<template>
    <div>
        <div class="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6 md:bg-content-light md:py-4 md:px-6 md:rounded-md">
           <div class="md:col-span-3 order-2 md:order-1">
               <div class="text-sm md:text-base md:font-bold mb-4 ">{{ $t('your_referral_status') }}</div>
               <div class="bg-content-light md:bg-transparent p-4 md:p-0">
                    <div v-if="loading">
                        <div class="skeleton h-8 mb-3"></div>
                        <div class="skeleton h-8 mb-3"></div>
                        <div class="skeleton h-8 mb-3"></div>
                        <div class="skeleton h-8 mb-3"></div>
                        <div class="skeleton h-8"></div>
                    </div>
                    <div v-else>
                        <div v-for="r in referralStatuses" :key="r.slug" class="text-sm md:text-base border-b pt-3 pb-1 flex items-center justify-between invite-border-color">
                            <div>{{ $t(r.slug) }}</div>
                            <div>{{ r.value }}</div>
                        </div>
                    </div>
                </div>
           </div>
           <div class="md:col-span-2 order-1 md:order-2 bg-content-light md:bg-transparent p-4 md:p-0">
               <div class="text-sm md:text-base md:font-bold uppercase mt-0 mb-6 md:mb-4">{{ $t('invite_a_partner') }}</div>
               <div class="text-xs md:text-sm md:font-bold text-text-light">{{ $t('referral_code') }}</div>
               <div class="mt-3 border-b pt-3 pb-1 !flex items-center justify-between invite-border-color">
                   <div>{{ userStore.data?.member_id }}</div>
                  <CopyButton :copyText="userStore.data?.member_id" />
               </div>
               <div class="mt-5 text-xs md:text-sm md:font-bold text-text-light">{{ $t('referral_link') }}</div>
               <div class="mt-3 border-b pt-3 pb-1 !flex items-center justify-between invite-border-color">
                    <div v-if="!referralDomain" class="skeleton h-5 w-full"></div>
                    <div v-else class="truncate">{{ referralLink }}</div>
                    <CopyButton :copyText="referralLink" />
               </div>
               <div class="mt-6 flex items-center justify-between gap-6">
                    <div class="bg-white p-2 rounded-md">
                        <QRCode id="referralQR" :size="isMobile ? 112 : 96" :content="referralLink" ref="qrCode" />
                    </div>
                    <div class="flex flex-col gap-3">
                        <button @click="downloadQR" class="text-xs md:text-sm border rounded-[5px] px-8 md:px-6 py-2 invite-download-btn">{{ $t('download') }}</button>
                        <button v-if="isMobile" class="block bg-main uppercase px-8 py-2 mx-auto rounded-md merchant_text_color text-sm" style="width:148px" @click="showShareModal=true">
                            {{ $t('share') }}
                        </button>
                    </div>
               </div>
               <div v-if="!isMobile" style="max-width:240px">
                    <ShareButtonList :shareLink="referralLink" />
               </div>
           </div>
        </div>
        <div class="mt-8">
            <ReferralInfo v-if="!loading" />
        </div>
        <Modal v-if="isMobile" :show="showShareModal" @close="showShareModal=false">
            <div>
                <div class="flex justify-end">
                    <button @click="showShareModal=false"><img src="~/assets/img/icons/close.svg" width="18"></button>
                </div>
                <div class="mt-6">
                    <ShareButtonList :shareLink="referralLink" />
                </div>
            </div>
        </Modal>
    </div>
</template>

<script setup>
const {isMobile} = useDevice()
const {$getCurrency, $api, $toast, $fn} = useNuxtApp()
const currency = $getCurrency()

const userStore = useUserStore()

const referralDomain = ref()
const {locale} = useI18n()

onMounted(() => {
    referralDomain.value = `${window.location.origin}/${locale.value}/?ref=`
})
const referralLink = computed(() => {
    return `${referralDomain.value}${userStore.data?.member_id}`
})

const qrCode = ref()
const downloadQR = () => {
    qrCode.value.downloadQR()
}

const loading = ref(true)
const referralStatuses = ref([])
const refSummary = ref()
provide('refSummary', refSummary)
const refLeaderboard = ref()
provide('refLeaderboard', refLeaderboard)
const refReceivedBonus = ref()
provide('refReceivedBonus', refReceivedBonus)
const getReferralDashboard = async () => {
    loading.value = true
    const res = await $api('referral/get-referral-dashboard', {
        currency: currency,
    })
    loading.value = false
    if (!res.status) {
        $toast(false, res.msg)
        return
    }
    referralStatuses.value = []
    Object.keys(res.data.referral_status).forEach(k => {
        referralStatuses.value.push({
            slug: k,
            value: res.data.referral_status[k] ? $fn(res.data.referral_status[k], 0) : '0'
        })
    })
    refSummary.value = res.data.web_data
    refLeaderboard.value = res.data.leaderboard
    refReceivedBonus.value = res.data.receive_bonus
}
const props = defineProps({
    isShown: Boolean
})
const initBefore = ref(false)

watch(() => props.isShown, (shown) => {
    if (shown && !initBefore.value) {
        initBefore.value = true
        getReferralDashboard()
    }
})

onMounted(() => {
    if (props.isShown && !initBefore.value) {
        initBefore.value = true
        getReferralDashboard()
    }
})

const showShareModal = ref(false)

</script>