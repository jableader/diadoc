<template>
    <div class="search-box">
        <input 
            type="text"
            ref="searchBox"
            placeholder="Enter a search term"
            v-model="searchTerm"
            @keyup.enter="() => requestSearch()"
            @keyup.esc="$event.target.blur()"
            @keyup.down="highlighted++"
            @keyup.up="highlighted--"
            @keydown.tab.prevent="tabEvent"
            @focus="requestSuggestionRefresh"
            @blur="ev => setTimeout(() => $emit('blur'), 50)"
            @input="requestSuggestionRefresh" />

        <div class="search-droplist" v-if="suggestions.length > 0">
            <ul>
                <li v-for="(item, index) in suggestions" 
                    :key="uniqueSearchKey(item)"
                    :class="{ highlight: index == (highlighted % suggestions.length) }"
                    @click="requestSearch(item)">
                    {{ item }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
ul {
    margin-top: 0;
    
    padding: 1px;
    border: 1px solid gray;
    background-color: white;
    color: black;
}

li {
    list-style-type: none;
    padding-left: 10px;
    border-bottom: 1px solid gray;
}

li.highlight {
    background-color: lightgray;
}

input[type=text] {
    width: 100%;
    height: 2em;

    border-radius: 20px;
    padding-left: 10px;
    font-size: larger;
}

.search-box {
    overflow-y: visible;
}

</style>

<script>

export default {
    emits: ['blur'],
    props: {
        suggestions: {
            type: Array,
            required: true,
        },
        debounceMillis: {
            type: Number,
            default: 500
        }
    },
    data: function() {
        return {
            searchTerm: "",
            highlighted: -1,
        }
    },
    methods: {
        uniqueSearchKey(item) {
            return item.table + (item.column ? '.' + item.column : '');
        },
        requestSuggestionRefresh() {
            this.$emit('update-suggestions', this.searchTerm);
        },
        tabEvent() {
            if (this.highlighted < 0)
                return;

            this.searchTerm = this.suggestions[this.highlighted % this.suggestions.length] + ' ';
            this.requestSuggestionRefresh();
        },
        requestSearch(term) {
            if (term)
                this.searchTerm = term;
            else if (this.highlighted >= 0)
                this.searchTerm = this.suggestions[this.highlighted % this.suggestions.length];

            this.highlighted = -1;
            this.$emit('search-requested', this.searchTerm);
            this.$refs["searchBox"].blur()
        }
    }
}
</script>