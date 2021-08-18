<template>
    <div>
        <h3>{{ item.id.path }}</h3>
        <h2>{{ item.snippet }}</h2>
    </div>
</template>

<script>

export default {
    props: {
        'item': {
            type: Object,
            required: true
        }
    },
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
