<template>
    <div class="rounded-md overflow-hidden">
        <button class="relative grid grid-cols-3 gap-4 bg-primary-light px-4 py-3 md:pl-10 w-full text-sm md:text-base" @click="clickHandler">
            <div class="text-left" :class="isSelected ? 'text-primary font-bold' : ''">{{ $t(data.slug) }}</div>
            <div class="text-right" :class="isSelected ? 'text-primary font-bold' : ''">THB 10,000.00</div>
            <div class="text-right">
                <svg class="inline w-5 md:w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g transform="translate(-0.001 -0.001)">
                        <path d="M54.667,44.848a9.818,9.818,0,1,0,9.818,9.818A9.818,9.818,0,0,0,54.667,44.848Zm0-2.182a12,12,0,1,1-12,12A12,12,0,0,1,54.667,42.667Z" transform="translate(-42.666 -42.666)" fill="#111"/>
                        <path d="M305.212,303.03h4.364v2.182H298.667V303.03h6.545Z" transform="translate(-292.122 -292.12)" fill="#111"/>
                    </g>
                </svg>
            </div>
            <img v-if="data.maintenance" src="~/assets/img/icons/warning.png" class="w-4 absolute left-3 top-1/2 -translate-y-1/2">
        </button>
        <div class="collapse-container" :class="{expand: isSelected}">
            <div class="min-h-0">
                <div class="grid grid-cols-3 px-4 py-3 md:pl-10 gap-4 text-xs md:text-sm">
                    <div class="flex items-center gap-x-2">
                        <div class="skeleton w-8 h-8"></div> 
                        <div class="font-bold">CMD</div>
                    </div>
                    <div class="text-right">THB 0.00</div>
                    <div class="text-right">
                        <span class="text-[10px] md:text-sm">{{ $t('weekly_turnover') }}</span> 
                        <span class="ml-2">0.00</span>
                    </div>
                </div>
            </div>
       </div>
    </div>
</template>

<script setup>
const props = defineProps({
    data: Object,
    isSelected: Boolean
})

const emit = defineEmits(['select'])
const clickHandler = () => {
    emit('select', props.data)
}
</script>

<style scoped>
.collapse-container {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows 0.3s;
    min-height: 0;
}

.collapse-container.expand {
    grid-template-rows: 1fr;
}
</style>