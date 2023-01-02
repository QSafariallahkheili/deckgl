<template>
  <div class="map-wrap" ref="mapContainer">
   
    <div class="map"  id="map" >

      <v-row
        style="position:absolute; right: 20px; top:20px; z-index:999"
      >
        <v-btn 
          color="error"
          class="ml-2"
          @click="addThreejsShape"
        >
          Threejs
        </v-btn>
        <v-btn
          color="success"
          class="ml-2"
          @click="addDeckglShape"
        >
          Deckgl
        </v-btn>
      </v-row>

    </div>
  </div>
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted } from 'vue';
import {useStore} from "vuex";
import { HTTP } from '../utils/http-common';
import {TreeModel} from '../utils/TreeModel';
import {MapboxLayer} from '@deck.gl/mapbox';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import { PolygonLayer } from "@deck.gl/layers";
import {BuildingFilter} from "../deckglFilter/building-filter"




const store = useStore();

const mapContainer = shallowRef(null);

onMounted(() => {
    store.state.map.map = new Map({
        container: mapContainer.value,
        style: store.state.map.style,
        center: [store.state.map.center.lng, store.state.map.center.lat],
        zoom: store.state.map.zoom,
        minZoom: store.state.map.minZoom,
        maxZoom: store.state.map.maxZoom,
        maxPitch: store.state.map.maxPitch
    });
    store.state.map.map.on('load', function(){
     let buildingLayer 
      HTTP
      .post('/get-buildings-from-db', '0')
      .then(response=>{
        
        buildingLayer = new MapboxLayer({
          id: "osm-buildings",
          type: PolygonLayer,
          data: response.data.features,
          getPolygon: (d) => d.geometry.coordinates,
          stroked: true,
          filled: true,
          extruded: true,
          getElevation: (feature) => feature.properties.estimatedheight,
          getFillColor: (d) => [255,0,0,255],
          getLineColor: [0, 0, 0, 255],
          wireframe: false,
          pickable: true,
          extensions: [new BuildingFilter()],
          elevationScale: 1,
   
        })
        store.state.map.map.addLayer(buildingLayer);
        
              
      })
      
    
    }) })
  

// threejs layer
const addThreejsShape = ()=>{
  store.state.map.map.addLayer(TreeModel(13.746470, 51.068646, 100));
}


// deckgl layder
const addDeckglShape = ()=>{
  const myDeckLayer = new MapboxLayer({
    id: 'hexagon2D',
    type: ScenegraphLayer,
    data: [13.755453, 51.067814],
    pickable: true,
    scenegraph: 'https://raw.githubusercontent.com/QSafariallahkheili/ligfinder_refactor/master/GenericNewTree.glb',
    getPosition: [13.755453, 51.067814],
    getOrientation: d => [0, Math.random() * 180, 90],
    sizeScale: 50,
    _lighting: 'pbr'
                   
  });
  store.state.map.map.addLayer(myDeckLayer);
}









onUnmounted(() => {
    store.state.map.map?.remove();
})


</script>


<style scoped>

.map-wrap {
 position: relative;
  width: 100%;
  height:100vh;
}

.map {
  height: 100%;
  width: 100%;
  position:absolute;
  background-color: darkgray;
  margin: auto
}

.watermark {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 999;
}
</style>