<template>
    <div class="toolbar">
        <button @click="$emit('recenter')">Recenter</button>
    </div>
</template>

<script>
export default {}
</script>


<style scoped>
    .toolbar {
        position: absolute;
        bottom: 0;
        left: 0;
    }

    button {
        min-width: 24px;
        min-height: 24px;
    }

</style>
