<template>
    <div class="toolbar">
        <div class="tooltip" v-if="tooltip">{{ tooltip }}</div>
        <div class="toolbar-components">
            <button 
                @mouseenter="ev => showTooltip(ev, 'Recenter the graph on screen')" 
                @mouseleave="hideTooltip"
                @click="$emit('recenter')">
                    Recenter
            </button>
            <span class="transitionSpeed"
                @mouseenter="ev => showTooltip(ev, 'Adjust speed of transitions')" 
                @mouseleave="hideTooltip">
                    <img src="/top-speed-svgrepo-com.svg" />
                    <input type="number" :value="transitionSpeed" @input="ev => $emit('update-transition-speed', parseInt(ev.target.value))" />
            </span>
        </div>
    </div>
</template>

<script>
export default {
    emits: ['update-transition-speed', 'recenter'],
    props: {
        transitionSpeed: { 
            type: Number,
            required: true
        }
    },
    data: function() {
        return {
            tooltip: '',
        }
    },
    methods: {
        showTooltip(ev, tooltip) {
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
        vertical-align: center;
        height: 32px;
    }

    .toolbar-components > * {
        display: inline-block;
        max-height: 32px;
        vertical-align: middle;
        margin-right: 1em;
    }

    .transitionSpeed > * {
        vertical-align: middle;
        max-width: 4em;
    }

</style>
