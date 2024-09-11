<template>
    <div :class="containerClass">
        <ClientOnly>
            <div class="o-input-wrapper right cursor-pointer" @click="toggle" ref="select"
                :class="{open: open}">
                <div class="mobile-big o-input right input-light-content">
                    <div v-if="displayDate" class="text-ellipsis overflow-hidden whitespace-nowrap">{{displayDate}}</div>
                    <div v-else>&nbsp;</div>
                </div>
                <div class="o-icon right !right-6">
                    <svg class="w-[17px] md:w-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 27.429">
                        <path id="calendar-regular" d="M8.143,3.429h7.714V1.286a1.286,1.286,0,1,1,2.571,0V3.429h2.143A3.43,3.43,0,0,1,24,6.857V24a3.432,3.432,0,0,1-3.429,3.429H3.429A3.43,3.43,0,0,1,0,24V6.857A3.428,3.428,0,0,1,3.429,3.429H5.571V1.286a1.286,1.286,0,0,1,2.571,0ZM2.571,24a.858.858,0,0,0,.857.857H20.571A.86.86,0,0,0,21.429,24V10.286H2.571Z" fill="#2a2a2a"/>
                    </svg>

                </div>
            </div>
            <OptionsWrapper :open="open" :el="select" :width="252" @close="open=false" :wrapperClass="dropdownClass">
                <div v-if="isMobile && label" class="o-dp-label-container">{{label}}</div>
                <!-- <button v-if="isMobile" class="o-dp-close" @click="open=false">&times;</button> -->
                <div class="o-dp-options-container content-scrollbar">
                    <div class="o-dp-body">
                        <div class="o-dp-page" v-show="page == 'date'">
                            <div class="o-dp-date-header">
                                <div>
                                    <button class="op-dp-date-btn" @click="toPage('month')">{{$t(`month_${renderedMonth}_short`)}}</button>
                                    <button class="op-dp-date-btn" @click="toPage('year')">{{renderedYear}}</button>
                                </div>
                                <div class="op-dp-nav-group">
                                    <button class="op-dp-nav-btn" @click="navigateMonth(-1)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                                        </svg>
                                    </button>
                                    <button class="op-dp-nav-btn" @click="navigateMonth(1)">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="o-dp-slide-container" style="height: 252px" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
                                <template v-if="isMobile">
                                    <div class="o-dp-slide text-center" v-for="(s, i) in slides" :key="(i)" :style="slidePosition(i)">
                                        <DatePickerCalendar :year="renderedYear" :month="renderedMonth + s.monthChange" v-model="localModelValue" :selectingType="selectingType" @close="handleClose" :disabledDates="disabledDates" />
                                    </div>
                                </template>
                                <DatePickerCalendar v-else :year="renderedYear" :month="renderedMonth" v-model="localModelValue" :selectingType="selectingType" @close="handleClose" :disabledDates="disabledDates" />
                            </div>
                        </div>
                        <div class="o-dp-page" v-show="page == 'month'">
                            <div class="o-dp-month">
                                <button class="o-dp-month-cell" v-for="month in 12" :key="month" @click="selectMonth(month - 1)" :class="{selected: renderedMonth == month - 1}" >{{$t(`month_${month - 1}_short`)}}</button>
                            </div>
                        </div>
                        <div class="o-dp-page" v-show="page == 'year'">
                            <div class="o-dp-year" ref="yearOptions">
                                <button class="o-dp-year-cell" v-for="year in yearSelectionRange" :key="year" @click="selectYear(year)" :class="{selected: renderedYear == year}">{{ year }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </OptionsWrapper>
        </ClientOnly>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: [Object],
    label: String,
    default: Boolean,
    disabledDates: Function,
    containerClass: String,
    dropdownClass: String,
})

const emit = defineEmits(['update:modelValue'])
const localModelValue = reactive({
    from: null,
    to: null
})

onMounted(() => {
    if (typeof props.modelValue == 'object' && props.modelValue.from && props.modelValue.to) {
        localModelValue.from = props.modelValue.from
        localModelValue.to = props.modelValue.to
        renderedMonth.value = props.modelValue.to.getMonth()
        renderedYear.value = props.modelValue.to.getFullYear()
    }
    else {
        let seven_days_ago = new Date()
        seven_days_ago.setHours(-144, 0, 0, 0)
        localModelValue.from = seven_days_ago

        let today = new Date()
        today.setHours(0, 0, 0, 0)
        localModelValue.to = today
        renderedMonth.value = today.getMonth()
        renderedYear.value = today.getFullYear()
        
    }
})

const selectingType = ref('from')

const handleClose = () => {
    if (selectingType.value == 'from') {
        selectingType.value = 'to'
        return
    }
    selectingType.value = 'from'
    open.value = false
}

/* onMounted(() => {
    if (props.modelValue) {
        localModelValue.value = props.modelValue
        renderedMonth.value = props.modelValue.getMonth()
        renderedYear.value = props.modelValue.getFullYear()
    }
    else if (props.default) {
        let today = new Date()
        today.setHours(0, 0, 0, 0)
        localModelValue.value = today
        renderedMonth.value = today.getMonth()
        renderedYear.value = today.getFullYear()
        emit('update:modelValue', localModelValue.value)
    }
}) */
/* watch(localModelValue, (newValue) => {
    emit('update:modelValue', newValue)
})
watch(() => props.modelValue, () => {
    localModelValue.value = props.modelValue
}) */
const page = ref('date')
const yearOptions = ref()
const toPage = (targetPage) => {
    page.value = targetPage
    if (targetPage == 'year') {
        nextTick(() => {
            const targetYear = yearOptions.value.querySelector('.o-dp-year-cell.selected')
            targetYear.scrollIntoView()
        })
    }
}

const renderedMonth = ref(0)
const renderedYear = ref(2023)

const navigateMonth = (monthChange) => {
    let newMonth = renderedMonth.value + monthChange
    let newCalendarDate = new Date(renderedYear.value, newMonth)
    renderedMonth.value = newCalendarDate.getMonth()
    renderedYear.value = newCalendarDate.getFullYear()
}

const selectMonth = (targetMonth) => {
    renderedMonth.value = targetMonth
    toPage('date')
}

const selectYear = (targetYear) => {
    renderedYear.value = targetYear
    toPage('month')
}

const yearSelectionRange = computed(() => {
    let minYear = renderedYear.value - 20
    let maxYear = renderedYear.value + 20
    let yearRange = []
    for (let i = minYear; i <= maxYear; i++) {
        yearRange.push(i)
    }
    return yearRange
})

const displayDate = computed(() => {
    let dateObject = props.modelValue
    try {
        if (typeof date == 'string' || typeof date == 'number') {
            dateObject = new Date(date)
        }
        if (!dateObject || isNaN(dateObject.getTime())) {
            return ''
        }

        let month = dateObject.getMonth() + 1;
        if (month < 10) month = `0${month}`;

        let dayDate = dateObject.getDate();
        if (dayDate < 10) dayDate = `0${dayDate}`;

    
        return `${dateObject.getFullYear()}-${month}-${dayDate}`;
        }
        catch(err) {
            console.log(err)
            return ''
        }
})

const select = ref()
const open = ref(false)
const isMobile = ref(false)
const toggle = (e) => {
    open.value = !open.value
    if (open.value) {
        isMobile.value = window.innerWidth < 768
    }
}
watch(open, (v) => {
    if (!v) { // when dropdown is closed
        selectingType.value = 'from'
        toPage('date')
        if (props.modelValue) {
            renderedMonth.value = props.modelValue.getMonth()
            renderedYear.value = props.modelValue.getFullYear()
        }
    }
})

/* sliding calendars on mobile */
// total only 3 slides, each containing a calendar
// the current calendar will be in the middle slide
// when sliding, move to the corresponding calendar via css transform: translate
// after finish sliding, move back to middle slide with no transition and change the its rendered month based on sliding direction
// this creates an endless slides illusion
const slides = ref([
   {
    monthChange: -1,
   }, {
    monthChange: 0
   }, {
    monthChange: 1
   }
])

let currentSlideIndex = ref(1)
let originalSlideIndex = 1
let sliding = false
let startX = 0
let slideDistance = 175
const slidePosition = (index) => {
    const diff = index - currentSlideIndex.value;
    // skewY
  /*   let skew = Math.abs(diff) * this.settings.maxDegree;
    if (skew > this.settings.maxDegree) skew = this.settings.maxDegree;
    // else if (skew < -this.settings.maxDegree) skew = -this.settings.maxDegree */
    // translateX
    let tX = -50 + diff * (100);
    // scale
    /* let scale = (1 - Math.abs(diff)) * this.settings.maxScale;
    if (scale > this.settings.maxScale) scale = this.settings.maxScale;
    else if (scale < 1) scale = 1; */
    let nextI = Math.round(currentSlideIndex.value);
    return {
        left: `50%`,
        top: "50%",
        transform: `translate(${tX}%, -50%)`,
        transition: sliding ? "none" : disableSlide ? "all 0.3s" : "none",
        zIndex: nextI >= index ? 2 : 1,
        opacity: nextI == index ? 1 : 0.2,
    };
}

let disableSlide = false
const handleTouchStart = (e) => {
    if (sliding || disableSlide) return
    // slideDistance = window.innerWidth / 2
    sliding = true
    disableSlide = true
    startX = e.touches[0].clientX
    originalSlideIndex = currentSlideIndex.value
}

const handleTouchMove = (e) => {
    if (!sliding) return;
    window.getSelection().removeAllRanges();
    let xPos = e.touches[0].clientX;
    let dist = startX - xPos;
    if (dist > slideDistance) dist = slideDistance
    else if (dist < -slideDistance) dist = -slideDistance
    let newSlide = originalSlideIndex + dist / slideDistance
    if (newSlide < 0) newSlide = 0
    else if (newSlide > slides.value.length - 1) newSlide = slides.value.length - 1
    currentSlideIndex.value = newSlide
}

const handleTouchEnd = (e) => {
    sliding = false;
    currentSlideIndex.value = Math.round(currentSlideIndex.value);
    const change = currentSlideIndex.value - originalSlideIndex
    setTimeout(() => {
        disableSlide = false
        currentSlideIndex.value = 1
        if (change != 0) {
            navigateMonth(change)
        }
    }, 310)
}
</script>

<style scoped>
.o-dp-label-container {
    /* display: flex;
    align-items: center;
    justify-content: space-between; */
    padding: 0.625rem 1rem;
}

/* .o-dp-close {
    line-height: 1;
    font-size: 1.5rem;
    padding-left: 0.75rem;
    border: none;
    background-color: transparent;
    font-size: 30px;
    line-height: 0.65;
    padding-right: 0;
} */

.o-dp-body {
    border-radius: var(--o-border-radius);
}

.o-dp-page {
    animation: grow 0.15s;
}

.o-dp-date-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.op-dp-date-btn {
    background-color: transparent;
    border: 1px solid transparent;
    outline: none;
    cursor: pointer;
    padding: 0.375em 0.75em;
    font-size: 0.875em;
    min-width: 70px;
    font-weight: 600;
    color: var(--o-primary);
}

.op-dp-nav-group {
    display: none;
}

@media screen and (min-width:768px) {
    .op-dp-nav-group {
        display: flex;
    } 
}

.op-dp-nav-btn {
    background-color: transparent;
    border: 1px solid transparent;
    outline: none;
    cursor: pointer;
    padding: 0.375em 0.75em;
}

.op-dp-date-btn:hover ,.op-dp-nav-btn:hover {
    color: var(--o-primary)
}

.o-dp-month, .o-dp-year {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    height: 250px;
}

.o-dp-year {
    overflow: auto;
}

.o-dp-month-cell, .o-dp-year-cell {
    background-color: transparent;
    border: none;
    width: calc(100% / 3);
    font-size: 0.875em;
    padding: 0.375em;
    height: calc(100% / 4);
}

.o-dp-month-cell:hover, .o-dp-year-cell:hover {
    color: var(--o-primary);
}

.o-dp-month-cell.selected, .o-dp-year-cell.selected { 
    color: var(--o-date-selected-text);
    background-color: var(--o-date-selected-bg);
}

@keyframes grow {
    0% {
        opacity: 0;
        transform: scale(0.8);

    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.o-dp-slide-container {
    overflow: hidden;
    position: relative;
}

.o-dp-slide {
    position: absolute;
    width: 100%;
}
</style>