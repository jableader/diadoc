<template>
    <div class="markdown-editor">
        <Markdown :source="content" />
    </div>
</template>

<script>
import data from '@/data.js'
import Markdown from 'vue3-markdown-it';

export default {
    components: {
        Markdown,
    },
    props: {
        sourceId: {
            type: [Object],
            required: true
        }
    },
    watch: {
        sourceId() {
            data.fetchReference(this.sourceId)
                .then(t => this.content = t)
                .catch(m => console.log(m));
        }
    },
    data() {
        return {
            content: "Loading..."
        }
    },
    mounted() {
        data.fetchReference(this.sourceId)
                .then(t => this.content = t)
                .catch(m => console.log(m));
    }
}
</script>

<style scoped>

div {
    text-align: left;
    padding-left: 1.2em;
}

</style>