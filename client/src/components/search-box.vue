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
            @focus="startedTyping"
            @blur="stoppedTyping"
            @input="requestSuggestionRefresh" />

        <div
            class="search-droplist"
            v-if="isTyping && searchTerm.length >= 3">
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
            previousSearchTerm: "",
            isTyping: false,
            typingTimeout: 0,
        }
    },
    methods: {
        uniqueSearchKey(item) {
            return item.table + (item.column ? '.' + item.column : '');
        },
        requestSuggestionRefresh() {
            if (this.searchTerm === this.previousSearchTerm)
                return;

            this.previousSearchTerm = this.searchTerm;
            this.$emit('update-suggestions', this.searchTerm);
        },
        stoppedTyping() {
            function f() {
                this.isTyping = false;
                this.typingTimeout = 0;
            }

            this.typingTimeout = setTimeout(f.bind(this), 250);
        },
        startedTyping() {
            if (this.typingTimeout) {
                clearInterval(this.typingTimeout);
                this.typingTimeout = 0;
            }

            this.isTyping = true;
            this.requestSuggestionRefresh()
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