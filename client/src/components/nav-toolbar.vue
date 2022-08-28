<template>
    <div class="toolbar">
        <div class="tooltip" v-if="tooltip">{{ tooltip }}</div>
        <div class="toolbar-components">
            <button 
                @mouseenter="ev => showTooltip(ev, 'Recenter the image on screen')" 
                @mouseleave="hideTooltip"
                @click="$emit('recenter')">
                    Recenter
            </button>
            <span
                @mouseenter="ev => showTooltip(ev, 'Adjust speed of transitions')" 
                @mouseleave="hideTooltip">
                    <img src="/top-speed-svgrepo-com.svg" />

            </span>
        </div>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            tooltip: ''
        }
    },
    methods: {
        showTooltip(ev, tooltip) {
            console.log(ev);
            this.tooltip = tooltip;
        },
        hideTooltip(ev) {
            this.tooltip = '';
        }
    }
}
</script>


<style scoped>

    .toolbar {
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .toolbar-components {
        text-align: left;
    }

</style>
