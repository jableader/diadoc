<template>
    <div class="toolbar">
        <div class="tooltip secondary secondary-border leftdock" v-if="tooltip">{{ tooltip }}</div>
        <div>
            <div class="toolbar-components primary leftdock">
                <button 
                    @mouseenter="tooltip='Recenter the graph on screen'" 
                    @mouseleave="tooltip=''"
                    @click="$emit('recenter')">
                        Rescale
                </button>
                <span class="transitionSpeed"
                    @mouseenter="tooltip='Adjust speed of transitions'" 
                    @mouseleave="tooltip=''">
                        <img src="/top-speed-svgrepo-com.svg" />
                        <input type="number" 
                            min="0"
                            max="10"
                            step="0.5"
                            :value="transitionSpeed" 
                            @input="ev => $emit('update-transition-speed', parseFloat(ev.target.value))" 
                            />
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>

    .toolbar {
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .toolbar-components {
        display: inline-block;
        width: auto;
        text-align: left;
    }

    .toolbar-components > * {
        display: inline-block;
        max-height: 32pt;
        vertical-align: middle;
        margin-left: 0.5em;
        margin-right: 0.5em;
        margin-top: 0.5ex;
    }

    .transitionSpeed > * {
        vertical-align: middle;
        max-width: 3em;
    }

    .tooltip {
        padding: 0.5ex 0.5em;
    }

    .leftdock {
        border-top-right-radius: 5pt;
        border-bottom-right-radius: 5pt;
    }

    .toolbar > div {
        text-align: left;
    }

    .toolbar-components button {
        border-radius: 5pt;
        padding: 4pt;
        margin-top: 2pt;
        margin-bottom: 2pt;
    }

</style>

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
}
</script>
