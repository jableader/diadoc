<template>
  <div class="top-level">
    <div class="graph-container" :style="{ 'right': selectedReferenceId ? '50%' : '0' }">
      <dbgraph 
        ref="graph"
        :reference="reference"
        :selected-reference="selectedReferenceId"
        @reference-requested="showReference"
        />
    </div>

    <div class="search-container primary">
        <div class="search-prompt">
          Diadocs &nbsp;&nbsp;&nbsp;
        </div>

        <div style="width: 60%;max-width: 600px;display: inline-block">
          <search-box :suggestions="searchSuggestions" 
                      @update-suggestions="updateSearchSuggestions"
                      @search-requested="search" />
        </div>
    </div>

    <div class="search-results primary" v-if="searchResults">
      <span>Search Results</span>
      <button @click="searchResults=null">X</button>
      <results-panel 
          :searchResults="searchResults"
          :selectedId="selectedReferenceId" 
          @item-selected="showReference"/>
    </div>

    <div class="reference-panel" v-if="selectedReferenceId">
      <reference-panel
        :source-id="selectedReferenceId"
        :referenceMetaData="reference"
        @close="selectedReferenceId=null" 
        @reference-requested="showReference"/>
    </div>
  </div>
</template>

<script>
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
    ReferencePanel
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
        .then(r => this.searchResults = r);
    },
    showReference(id) {
      this.searchResults = null;
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

.graph-container {
  position: absolute;
  top: 8ex;
  bottom: 0;
  left: 0;
  right: 0;

  z-index: 10;
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
  position: absolute;
  overflow-y: scroll;
  overflow-x: hidden;
  top: 8ex;
  width: 30ex;
  max-height: 90%;
  z-index: 20;
  padding: 1ex 5px 2px 5px;

  text-align: left;
}

.search-results > button {
  position: absolute;
  right: 5px;
}

.reference-panel {
  position: absolute;
  z-index: 20;

  right: 0px;
  top: 8ex;
  bottom: 0;
  width: 50%;

  padding: 1ex 1em 5px 5px;

  overflow-y: scroll;

  text-align: left;

  border-bottom-left-radius: 20px;
  border-left: solid medium #625ad8;
  background-color: white;
}

</style>
