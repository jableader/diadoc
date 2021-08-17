<template>
    <div>
        <h1> {{ item.table }} {{ item.column ? (' - ' + item.column) : ''}} </h1>
        <h2>{{ path }}</h2>
        <h3 v-if="item.captions">
            {{ item.captions.join(", " )}}
        </h3>
    </div>
</template>

<script>
import data from '@/data.js'

export default {
    props: {
        'item': {
            type: Object,
            required: true
        }
    },
    data: function() {
        return {
            path: data.friendlyId(this.item)
        }
    }
}
</script>


<style scoped>
    div {
        padding-left: 1em;   
        padding-right: 1em;
        padding-top: 1ex;
        border-radius: 5px;
    }

    h1, h2 {
        text-align: left;
        margin: 2px;
        font-weight: normal;
    }

    h1 {
        font-size: large;
        font-weight: bold;
    }

    h2 {
        font-size: small;
        font-weight: normal;
    }

    h3 {
        font-size: smaller;
        font-style: italic;
    }
</style>
