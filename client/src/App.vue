<template>
  <div class="top-level">
    <div class="search-container primary">
      <div class="search-prompt">
        Diadocs &nbsp;&nbsp;&nbsp;
      </div>

      <div style="width: 60%;max-width: 600px;display: inline-block">
        <search-box :suggestions="searchSuggestions" @update-suggestions="updateSearchSuggestions"
          @search-requested="search" @blur="searchSuggestions = []" />
      </div>
    </div>

    <div class="bottom-level">
      <splitpanes>
        <pane v-if="searchResults" max-size="50">
          <div class="search-results primary">
            <div style = "display: flex; justify-content:flex-end">
              <button @click="searchResults = null">X</button>
            </div>
            <span>Search Results</span>
            <results-panel :searchResults="searchResults" :selectedId="selectedReferenceId"
              @item-selected="showReference" />
          </div>
        </pane>

        <pane min-size="25">
          <dbgraph ref="graph" :reference="reference" :selected-reference="selectedReferenceId"
            @reference-requested="showReference" />
        </pane>

        <pane v-if="selectedReferenceId" min-size="25">
          <div class="reference-panel">
            <reference-panel :source-id="selectedReferenceId" :referenceMetaData="reference"
              @close="selectedReferenceId = null" @reference-requested="showReference" />
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script>
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import ReferencePanel from './components/reference-panel.vue'
import Dbgraph from './components/dbgraph.vue';
import ResultsPanel from './components/results-panel.vue';
import SearchBox from './components/search-box.vue'
import data from './data';

export default {
  name: 'App',
  components: {
    Dbgraph,
    SearchBox,
    ResultsPanel,
    ReferencePanel,
    Splitpanes, Pane
  },
  data (){
    return {
      searchSuggestions: [],
      searchResults: null,
      reference: null,
      selectedReferenceId: null,
    }
  },
  created() {
    data.fetchReferenceMetadata()
      .then(g => this.reference = g);
  },
  methods: {
    search(item) {
      data.searchResults(item)
        .then(r => {
          this.searchResults = r;
          this.searchSuggestions = [];
        });
    },
    showReference(id) {
      this.selectedReferenceId = id;
    },
    updateSearchSuggestions(text) {
      data.searchSuggestions(text)
        .then(r => this.searchSuggestions = r);
    },
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.top-level {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}

.search-container {
  position: absolute;
  width: 100%;
  height: 6ex;
  padding-left: 1em;
  padding-top: 1ex;
  padding-bottom: 1ex;
  margin: 0 0;
  z-index: 30;

  text-align: left;
}

.search-prompt {
  display: inline-block;
  vertical-align: top; 
  margin-top: 1em;

  font-weight: bold;
}

.search-results {
  overflow-y: scroll;
  height: 100%;
  padding: 1ex 5px 2px 5px;

  text-align: left;
}

.reference-panel {
  padding: 1ex 1em 5px 5px;
  overflow-y: scroll;
  text-align: left;
  background-color: white;
}

.bottom-level {
  position: absolute;
  top: 8ex;
  bottom: 0;
  left: 0;
  right: 0;
}

.splitpanes__splitter {
  background-color: #625ad8;
  border-left: solid medium #8882df;
  border-right: solid medium #8882df;
  width: 4pt
}

</style>
