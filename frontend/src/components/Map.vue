<template>

  <div class="map-wrap" ref="mapContainer">
    
    <div class="map"  id="map" >
      <v-btn style="z-index:999" @click="getBuildingsFromOSM">
        buildings
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted } from 'vue';
import {useStore} from "vuex";
import { HTTP } from '../utils/http-common';
import {MapboxLayer} from '@deck.gl/mapbox';
import { PolygonLayer } from "@deck.gl/layers";
import {BuildingFilter} from "../deckglFilter/building-filter"
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const store = useStore();

const mapContainer = shallowRef(null);
let vectorSource = "ne-source";
var vectorId = "ne-layer";

// Build the tile URL
var vectorServer = "http://localhost:7800/";
var vectorSourceLayer = "public.building";
var treeSourceLayer = "public.tree";

// The data table has a lot of columns, we retrieve just three
var vectorProps = "?properties=name,type,pop_est"
let spatialfilter =""
var vectorUrl = vectorServer + vectorSourceLayer + ","+ treeSourceLayer + "/{z}/{x}/{y}.pbf?filter=" + spatialfilter;


onMounted(() => {
  

    
    store.state.map.map = new Map({
        container: mapContainer.value,
        style: store.state.map.style,
        center: [store.state.map.center.lng, store.state.map.center.lat],
        zoom: store.state.map.zoom,
        minZoom: store.state.map.minZoom,
        maxZoom: store.state.map.maxZoom,
        maxPitch: store.state.map.maxPitch,
    });
    store.state.map.map.on('load', function(){
     
     
      var Draw = new MapboxDraw();
      store.state.map.map.addControl(Draw, 'top-right');
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
            getFillColor: (d) => [250, 166, 82],
            getLineColor: [0, 0, 0, 255],
            wireframe: false,
            pickable: true,
            extensions: [new BuildingFilter()],
            elevationScale: 1,
  
          })
          //store.state.map.map.addLayer(buildingLayer);
        })

        store.state.map.map.addSource(vectorSource, {
          "type": "vector",
          "tiles": [vectorUrl],
          "minzoom": 0,
          "maxzoom": 22
        });
        var vectorLayerFill = {
          "id": vectorId,
          "source": vectorSource,
          "source-layer": vectorSourceLayer,
          "type": "fill-extrusion",
          "paint":  {
            "fill-extrusion-color": "#c4844f",
            "fill-extrusion-opacity": 1,
            "fill-extrusion-height":["get", "estimatedheight"],
          }
        };
        store.state.map.map.addLayer(vectorLayerFill);
        var treeLayer = {
          "id": "treess",
          "source": vectorSource,
          "source-layer": "public.tree",
          "type": "circle",
          "paint":  {
            'circle-radius': 3,
            'circle-color': '#00ff00'
          }
        };
        
        
       // store.state.map.map.addLayer(treeLayer);
        store.state.map.map.on('sourcedata', function(e) {
          
          if (e.sourceId === vectorSource ) {
              const features = store.state.map.map.querySourceFeatures(vectorSource, { sourceLayer: "public.tree" });
              if( features.length){
              }
          }
        });
         
       
        
        var highlighted = {
          "id": "highlighted",
          "source": vectorSource,
          "source-layer": vectorSourceLayer,
          "type": "fill",
          "paint":  {
            "fill-color": "red",
            "fill-opacity": 0.9,
            "fill-outline-color": "black"
          },
          "filter": ["in", "id", ""]
        };
      //store.state.map.map.addLayer(highlighted); 
    })

    store.state.map.map.on('draw.create', function(e){

      let phead = ""
      var userPolygon = e.features[0];

      /// create wkt to be served in intersect filter in pg_tileserv
      let coords = userPolygon.geometry.coordinates[0]
      // Create WKT of the polygon
      phead = `POLYGON((`;
      let ptail =  `))`;
      let pbody = "";
      let cur_xy = "";
      coords.forEach( function(item, index){
      //console.log(item, index);
      //lonlat.push([...item]); //OK
      cur_xy = item[0].toFixed(4) +" "+ item[1].toFixed(4);
      pbody += cur_xy + ","; 
      }, pbody);
      
      console.log("*WKT*", phead+pbody+cur_xy+ptail);
      spatialfilter = "intersects(geom,"+ phead+pbody+cur_xy+ptail +")"
      console.log(spatialfilter, "spatialfilter")
      console.log(vectorUrl, "vectorUrl before")
      vectorUrl = vectorServer + vectorSourceLayer + "/{z}/{x}/{y}.pbf?filter=" + spatialfilter
      //vectorUrl = vectorUrl + spatialfilter
      console.log(vectorUrl, "vectorUrl")
      store.state.map.map.getSource('ne-source').setTiles([vectorUrl]);
      spatialfilter = ""
      ///////////////////

      // generate bounding box from polygon the user drew
      var polygonBoundingBox = turf.bbox(userPolygon);
      console.log(polygonBoundingBox)
      
      
      var southWest = [polygonBoundingBox[0], polygonBoundingBox[1]];
      var northEast = [polygonBoundingBox[2], polygonBoundingBox[3]];

      var northEastPointPixel = store.state.map.map.project(northEast);
      var southWestPointPixel = store.state.map.map.project(southWest);
      var features = store.state.map.map.queryRenderedFeatures([southWestPointPixel, northEastPointPixel], { layers: [vectorId] });
      var filter = features.reduce(function(memo, feature) {

          //if (! (undefined === turf.intersect(feature, userPolygon))) {
            if(turf.booleanIntersects(feature, userPolygon))  {
              // only add the property, if the feature intersects with the polygon drawn by the user

            memo.push(feature.properties.id);
          } 
              return memo;
      }, ['in', 'id']);
      //store.state.map.map.setFilter("highlighted", filter);

       
   
    }); 



 
    
})
  
onUnmounted(() => {
    store.state.map.map?.remove();
})
const getBuildingsFromOSM = () => {
  console.log("gi")
  HTTP
  .get('/')
  .then(response=>{
    console.log(response)
  })
  
}

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

</style>