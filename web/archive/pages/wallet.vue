<template>
    <div class="grid xl:grid-cols-5 gap-6">
        <div class="xl:col-span-3">
            <div class="text-lg font-bold uppercase ">{{ $t('wallet') }}</div>
            <div class="mt-5 grid md:grid-cols-2 gap-4 flex-wrap">
                <div class="bg-[#BEE3FF] rounded-md p-3 flex items-center gap-x-1 flex-wrap">
                    <div class="flex items-center">
                        <img src="~/assets/img/icons/withdrawal.png" class="w-[26px] hidden sm:block">
                        <div class="text-sm ml-1">{{ $t('withdrawal_balance') }}:</div>
                    </div>
                    <div class="font-bold">THB 0.00</div>
                </div>
                <div class="bg-[#F1D9FF] rounded-md p-3 flex items-center gap-x-1 flex-wrap">
                    <div class="flex items-center">
                        <img src="~/assets/img/icons/reward-center.png" class="w-[26px] hidden sm:block">
                        <div class="text-sm ml-1">{{ $t('promotion_balance') }}:</div>
                    </div>
                    <div class="font-bold">THB 0.00</div>
                </div>
            </div>
            <div class="flex flex-wrap gap-2 md:gap-4 items-center mt-4">
               <CountdownBtn :seconds="300" @click="refreshWallet" storageKey="walletRefresh" />
                <div class="text-xs font-bold text-primary">{{ $t('data_refresh_desc') }}</div>
            </div>
            <div class="mt-5 grid md:grid-cols-2 gap-4 text-sm">
                <div>
                    <Select v-model="selectedCategoryFilter" :options="categoriesOptions" selectClass="!py-3" />
                </div>
                <div class="o-input !py-3 !flex w-full items-center justify-between flex-wrap gap-x-2">
                    <span>{{ $t('weekly_turnover_total') }}:</span>
                    <span class="font-bold">0.00</span>
                </div>
            </div>
            <div class="mt-6">
                <div class="mb-4" v-for="c in categories" :key="c.slug">
                    <WalletCategory :data="c" :isSelected="expandedCategory==c.slug"  @select="(e) => expandedCategory = e.slug" />
                </div>
            </div>
            <div class="mt-4 flex items-center gap-x-2">
                 <img src="~/assets/img/icons/warning.png" class="w-4">
                 <span class="text-xs text-primary">: {{ $t('wallet_is_under_maintenance') }}</span>
            </div>
        </div>
        <div class="xl:col-span-2">
            <PromotionList />
        </div>
    </div>
</template>

<script setup>
const { t } = useI18n()

definePageMeta({
    layout: 'account'
})

const selectedCategoryFilter = ref('')
const categoriesOptions = [
    {
        text: t('all_categories'),
        value: ''
    }, {
        text:   t('sports'),
        value: 'sports'
    }, {
        text: t('live_casino'),
        value: 'live_casino'
    }, {
        text: t('slots'),
        value: 'slots'
    }, {
        text: t('card_games'),
        value: 'card_games'
    }, {
        text: t('fish_games'),
        value: 'fish_games'
    }, {
        text: t('esports'),
        value: 'esports'
    }, {
        text: t('lottery'),
        value: 'lottery'
    }, {
        text: t('cockfight'),
        value: 'cockfight'
    }
]

const expandedCategory = ref('sports')
const categories = [
    {
        slug: 'sports',
        maintenance: true
    }, {
        slug: 'live_casino',
        maintenance: false
    }, {
        slug: 'slots',
        maintenance: false
    }, {
        slug: 'card_games',
        maintenance: false
    }, {
        slug: 'fish_games',
        maintenance: false
    }, {
        slug: 'esports',
        maintenance: false
    }, {
        slug: 'lottery',
        maintenance: false
    }, {
        slug: 'cockfight',
        maintenance: false
    }
]

const refreshWallet = () => {
    console.log('asdasd')
}
</script>