<template>
    <div>
        <div v-if="!searchResults || !searchResults.length" style="padding-top: 2ex; font-style: italic">
            Sorry, no content was found for your search.
        </div>
        <ul class="primary" v-if="searchResults">
            <li v-for="item in searchResults" 
                class="secondary"
                :key="item"
                @click="$emit('item-selected', item.id)">

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
        searchResults: {
            type: [Object],
            required: true
        }
    },
}
</script>

<style scoped>

ul {
    margin-left: auto;
    margin-right: auto;
    
    padding: 1px;
}

li {
    list-style-type: none;
    margin: 1ex;
    border-radius: 3pt;
}

</style>
