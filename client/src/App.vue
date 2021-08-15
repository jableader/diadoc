<template>
  <div>
    <div class="graph-container" :style="{ width: selectedReference ? '50%' : '100%'}">
      <dbgraph 
        ref="graph"
        :reference="reference"
        :selected-reference="selectedReference"
        @reference-requested="search"
        />
    </div>

    <div class="search-container" >
        <div style="display: inline-block; vertical-align: top; margin-top: 1em">
          Search the graph: &nbsp;&nbsp;&nbsp;
        </div>

        <div style="width: 60%;max-width: 600px;display: inline-block">
          <search-box :suggestions="searchSuggestions" 
                      @update-suggestions="updateSearchSuggestions"
                      @item-selected="search" />
        </div>
    </div>

    <div class="reference-documentation" v-if="selectedReference">
      <button @click="selectedReference=null">Close</button>
      <br />
      <reference-documentation :source="selectedReference" />
    </div>
  </div>
</template>

<script>
import Dbgraph from './components/dbgraph.vue';
import ReferenceDocumentation from './components/reference-documentation.vue'
import SearchBox from './components/search-box.vue'
import data from './data';

export default {
  name: 'App',
  components: {
    Dbgraph,
    SearchBox,
    ReferenceDocumentation,
  },
  data (){
    return {
      searchTerm: {},
      searchSuggestions: data.search("a"),
      reference: data.referenceMetaData,
      selectedReference: null
    }
  },
  methods: {
    search(item) {
      this.selectedReference = item;
    },
    updateSearchSuggestions(text) {
      this.searchSuggestions = data.search(text);
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

.graph-container {
  position: absolute;
  top: 8ex;
  bottom: 0;
  width: 100%;
  margin: 0 auto;

  display: flex;
  flex-direction: row;

  z-index: 10;
}

.search-container {
  position: absolute;
  padding-left: 1em;
  padding-top: 1ex;
  padding-bottom: 1ex;
  margin: 0 0;
  z-index: 20;

  text-align: left;

  width: 100%;
  height: 5ex;
  background-color: lightgray;
  border-bottom: 1px gray;
}

.reference-documentation {
  position: absolute;
  right: 0px;
  top: 8ex;
  width: 50%;
  height: 100%;
  background-color: peachpuff;
  z-index: 20;
}

</style>
