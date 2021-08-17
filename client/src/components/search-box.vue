<template>
    <div class="search-box">
        <input 
            type="text"
            ref="searchBox"
            placeholder="Enter a search term"
            v-model="searchTerm"
            @focus="startedTyping"
            @blur="stoppedTyping"
            @keyup="onSearchboxKeyup" />

        <div
            class="search-droplist"
            v-if="isTyping">
            <ul>
                <li v-for="item in suggestions" 
                    :key="uniqueSearchKey(item)" 
                    @click="suggestionSelected(item)">
                    {{ item }}
                </li>
            </ul>
        </div>
    </div>
</template>

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

            previousSearchTerm: "",
            lastSuggestionUpdate: 0,
            updateTimeout: 0,

            isTyping: false,
            typingTimeout: 0,
        }
    },
    methods: {
        uniqueSearchKey(item) {
            return item.table + (item.column ? '.' + item.column : '');
        },
        onSearchboxKeyup(ev) {
            if (ev.keyCode == 13 && this.suggestions.length > 0) // Enter key
                this.suggestionSelected(this.suggestions[0]);
            else
                this.requestSuggestionRefresh();
        },
        requestSuggestionRefresh() {
            const search = (function() {
                if (this.searchTerm === this.previousSearchTerm)
                    return;

                this.lastSuggestionUpdate = Date.now();
                this.previousSearchTerm = this.searchTerm;
                this.$emit('update-suggestions', this.searchTerm);
            }).bind(this);

            var now = Date.now();
            var millisSinceLastUpdate = now - this.lastSuggestionUpdate;
            if (millisSinceLastUpdate > this.debounceMillis) {
                search();
            } else if (!this.updateTimeout) {
                this.updateTimeout = setTimeout(function() {
                    this.updateTimeout = 0;
                    search();
                }, this.debounceMillis - millisSinceLastUpdate);
            }
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
        },
        suggestionSelected(item) {
            this.searchTerm = item;
            this.$emit('item-selected', item);
            this.stoppedTyping();
        }
    }
}
</script>

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