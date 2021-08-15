<template>
    <div>
        <ul class="primary">
            <li v-for="item in searchResults" 
                :key="item"
                @click="resultSelected(item)">

                <search-result :item="item"/>
            </li>
        </ul>
    </div>
</template>

<script>
import SearchResult from './results-item.vue'

export default {
    components: {
        SearchResult
    },
    props: {
        selectedItem: {
            type: [Object, null],
            required: true
        },
        searchResults: {
            type: [Object],
            required: true
        }
    },
    methods: {
        resultSelected(result) {
            this.$emit('item-selected', result);
        }
    }
}
</script>

<style scoped>

ul {
    margin-left: auto;
    margin-right: auto;
    
    padding: 1px;
    max-width: 500px;
}

li {
    list-style-type: none;
    border: 1px solid gray;
}

</style>
