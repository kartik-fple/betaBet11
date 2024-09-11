<template>
    <div>Error</div>
</template>

<script setup>
const localePath = useLocalePath()
navigateTo(localePath('/'), { redirectCode: 301 })
</script>