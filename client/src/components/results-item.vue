<template>
    <div>
        <h3 class="subtitle">{{ item.id.path }}</h3>
        <h1>{{ item.caption }}</h1>
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
        padding-bottom: 0.5ex;
        border-radius: 5px;
    }

    h1, h2 {
        text-align: left;
        font-weight: normal;
    }

    h1 {
        font-size: large;
        font-weight: bold;
        margin-top: 0.5ex;
    }

    h2 {
        font-size: small;
        font-weight: normal;
    }

    h3 {
      font-size: x-small;
      font-weight: normal;
      padding: 0;
      margin: 0;
    }
</style>
