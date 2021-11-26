<i18n>
{
   "en":{
       "wyn": 		"What is my name ?",
       "nobody" :	"Nobody",
       "mynameis":	"My name is"
   },
   "fr":{
       "wyn": 		"Quel est mon nom ?",
       "nobody" :	"Personne",
       "mynameis":	"Mon nom est"
   }
}
</i18n>

<template>
  <span class="gdm-map-tio">
  <div style="position:relative;">
  <!--    <div @click="download">DOWNLOAD</div> -->
	  <div v-if="searching" style="position:absolute;top:270px;left:45%;z-index:10;color:grey;" class="fa fa-spinner fa-spin fa-2x fa-fw"></div>
	  <div id="gdmMap" style="width:100%;min-height:500px;" :style="{height: height + 'px'}"></div>
  </div>
   <tio-graph v-if="imgTio" v-show="showGraph" :dates="imgTio.dates" :ns-values="ptValues.ns" :ew-values="ptValues.ew" 
   :keys="imgTio.keys" :maximum="imgTio.max" :lang="lang" @close="showGraph=false"></tio-graph>
 
  
<!--  <div style="width:50%;margin-left:50%;height:600px;position:relative;" >
      <div style="ming-height:150px;">DIVERS INFOS
       <div>@todo</div>
      </div>
      <div id="graphEW" style="height:220px;" @mousemove="highlight($event, 'EW')">EW: {{loaded.EW}} %</div>
      <div id="graphNS" style="height:220px;" @mousemove="highlight($event, 'NS')">NS: {{loaded.NS}} %</div>
      <div id="graphMAGN" style="height:220px;" @mousemove="highlight($event, 'MAGN')">MAGN: {{loaded.MAGN}} %</div>
     
     
   
 
   </div>  
  </div>--> 
 
  </span>
</template>



<script>

var L = require("leaflet")
// require('leaflet-markers-canvas')
// require('leaflet-imageoverlay-rotated')
// L.canvasOverlay = require('./L.image.canvas.js')
// import * as PIXI from 'pixi.js'
// require('leaflet-pixi-overlay')
// var parse = require('wellknown')
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
import TioGraph from './tio-graph.vue'
import Tio from './modules/leaflet.imageOverlay.rotated.tio.js'
L.ImageOverlay.Rotated.Tio = Tio
// import TioGraph from './tio-graph.vue'
import TileSystem from './modules/tile-system.js'
import moment from 'moment'
export default {
  name: 'GdmMapTio',
  components: {
    TioGraph
  },
  props:{
      lang: {
          type: String,
          default: 'fr'
      },
      directory: {
          type: String,
          default: 'http://api.formater/exemples/tio/tiled'
      }
  },
  data () {
		return {
  			map: null,
  			ptValues: {
  			  ns: [],
  			  ew: [],
  			  magn: []
  			},
  			marker: null,
  			markersCanvas: null,
  			imageCanvas: null,
  		//	markersCanvasZ13: null,
  			bboxLayer: null,
  			polygon: null,
  			imageOverlay: null,
  			pixiOverlay: null,
  			keys: [],
  			dates: [],
  			searching: false,
  			iconRed: null,
  			iconBlue: null,
  			iconGrey: null,
  			arrowIcon: null,
  			showGraph: false,
  			height: 500,
  			max: null,
  			imgTio: null,
		}
  },
//   watch: {
//     dones (newvalues) {
//       const reducer = (accumulator, currentValue) => accumulator && currentValue;
//       this.done = newvalues.reduce(reducer)
//       if (this.done) {
//         console.log('TOUT EST LU')
//       }
//     }
//   },
	
  created: function(){
      this.$i18n.locale = this.lang;
  },
  mounted: function () {
      this.initMap()
     // this.initTiles()
      this.height = window.innerHeight
  },
  methods: {
//     download () {
//       this.markersCanvas.download()
//     },
    draw (type, data) {
      this.$set(this.ptValues, type, data.values)
      // this.marker.setLatLng([data.values[0], data.values[1]])
      this.showGraph = true
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: true}).setView([51.505, -0.09], 2);
//       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
//         // preferCanvas: true
//       },
       L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
       attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
       
     }).addTo(this.map);
//       this.arrowIcon = L.icon({
//         iconUrl: require('./assets/img/arrow.png'),
//         iconSize: [30, 30],
//         iconAnchor: [0, 30]
//       })
      // this.marker = L.marker([4, 50])
      
      var _this = this
      this.imgTio = new L.ImageOverlay.Rotated.Tio(this.directory)
      this.imgTio.on('TIO:DATA', function (resp) {
        console.log(resp)
        _this.draw(resp.dimension, {values: resp.values})
      })
//       this.marker.on('click', function (e) {
        
//         if (_this.ptValues.ew.length > 0 || _this.ptValues.ns.length > 0) {
//           _this.showGraph = true
//         }
//       })
      this.map.on('click',  function (e) {
        _this.imgTio.addTo(_this.map)
      //  _this.marker.addTo(_this.map)
        // _this.searchData(e)
      })
     
//       this.pixiOverlay = L.pixiOverlay(function(utils) {
//         // your drawing code here
//       }, new PIXI.Container());
//       this.iconRed = L.icon({
//         iconUrl: require('./assets/img/pointRed.png'),
//         iconSize: [1, 1],
//         iconAnchor: [0, 0],
//       })
//       this.iconGrey = L.icon({
//         iconUrl: require('./assets/img/pointGrey.png'),
//         iconSize: [1, 1],
//         iconAnchor: [0, 0],
//       })
//       this.iconBlue = L.icon({
//         iconUrl: require('./assets/img/pointBlue.png'),
//         iconSize: [1, 1],
//         iconAnchor: [0, 0],
//       })
//       this.markersCanvasZ13 = new L.MarkersCanvas()
//       if (this.map.getZoom() > 13) {
//         this.markersCanvas13.addTo(this.map)
//       }
//        this.markersCanvas = L.canvasOverlay()
//        this.markersCanvas.addTo(this.map)
//      var _this = this
//       this.map.on('zoomend', function (e) {
//          if (this.getZoom() < 15) {
//           _this.markersCanvasZ13.remove()
//          } else {
//            _this.markersCanvasZ13.addTo(this.map)
//          }
//       })
     
      // this.marker.setIcon(this.iconPoint)
    },
    initTiles () {
      var _this = this
      TileSystem.load(this.directory, this)
      .then( geojson => { _this.initializeView(geojson)})
       // L.rectangle(poly.getBounds(), {color: 'green', weight: 1, opacity:0.1}).addTo(this.map)
 
    },
//     addMarkers(data) {
//      // var _this = this
//       this.markersCanvas.addMarkers(data, 0)
//       return
//       var markers = []
//       data.forEach(function (pos) {
//         var marker = L.marker(pos.pt, {icon: _this.iconBlue})
// //         if (pos.value > 0.5) {
// //           var marker = L.marker(pos.pt, {icon: _this.iconRed, opacity: Math.max(1, pos.value / 5)})
// //         } else if (pos.value < 0.5) {
// //           var marker = L.marker(pos.pt, {icon: _this.iconBlue, opacity: Math.max(1, pos.value / (-5))})
// //         } else {
// //           var marker = L.marker(pos.pt, {icon: _this.iconGrey})
// //         }
//         markers.push(marker)
//       })
//     //  this.markersCanvas.addMarkers(markers)
// //       data[1].forEach(function (pos) {
// //         var marker = L.marker(pos.pt, {icon: _this.iconBlue})
// //         markers.push(marker)
// //       })
// //       this.markersCanvasZ13.addMarkers(markers)
//     },
    searchData (e) {
      var _this = this
      this.ptValues = {ew: [], ns: []}
      this.showGraph = false
      this.searching = true
      this.$forceUpdate()
      
      TileSystem.searchData('ew', e.latlng.lat, e.latlng.lng)
      .then(resp => {
        _this.searching = false
        console.log(resp)
         if (resp && resp.values && resp.values[3] !== null) {
           _this.draw('ew', resp)
        } else {
          this.marker.setLatLng(e.latlng)
        }
      })
      TileSystem.searchData('ns', e.latlng.lat, e.latlng.lng)
      .then(resp => {
        _this.searching = false
        if (resp && resp.values && resp.values[3] !== null) {
           _this.draw('ns', resp)
        } else {
          this.marker.setLatLng(e.latlng)
        }
      })
//       TileSystem.searchData('magn', e.latlng.lat, e.latlng.lng)
//       .then(resp => {
//         _this.searching = false
//         if (resp) {
//           _this.draw('magn', resp)
//         }
//       })
    },
    initializeView (geojson) {
      var _this = this
//       var bbox = geojson.properties.bbox
//       var latlngs = [
//          [bbox.minlat, bbox.minlon],
//          [bbox.minlat, bbox.maxlon],
//          [bbox.maxlat, bbox.maxlon],
//          [bbox.maxlat, bbox.minlon],
//          [bbox.minlat, bbox.minlon]
//       ]
     
      
        this.max = Math.max(geojson.properties.percentile_90_ew, geojson.properties.percentile_90_ns)
        this.dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
        this.keys = geojson.properties.keys
//         var latlngs = [
//           geojson.properties.pointTL,
//           geojson.properties.pointTR,
//           geojson.properties.pointBR,
//           geojson.properties.pointBL
//         ]
//         this.polygon = L.polygon(latlngs)
//         this.polygon.addTo(this.map)
      this.polygon = L.geoJSON(
          geojson, 
          {style() {return {weight: 1, fillOpacity: 0.05}}})
      .addTo(this.map)
     // .on('click', function (e) { _this.searchData(e)})
//        this.markersCanvas = L.canvasOverlay(this.polygon.getBounds(), geojson.properties)
//         this.markersCanvas.addTo(this.map)
       this.imageOverlay = L.imageOverlay.rotated(
           this.directory + '/' + geojson.properties.images[0].src,
           [geojson.properties.pointTL[1], geojson.properties.pointTL[0]], 
           [geojson.properties.pointTR[1], geojson.properties.pointTR[0]],
           [geojson.properties.pointBL[1], geojson.properties.pointBL[0]],
           {opacity: 0.5})
       this.imageOverlay.addTo(this.map)
       this.map.fitBounds(this.polygon.getBounds())
//        if (geojson.properties.images && geojson.properties.images.length > 0) {
//          // add image layer
//          var img = geojson.properties.images[0]
// //          this.imageOverlay = L.imageOverlay(this.directory + '/' + img.src, this.polygon.getBounds())
// //          this.imageOverlay.addTo(this.map)
//        }
    },
    reset () {
      // remove bbox layer et polygon
      // reset tiles
      // reset graphs
    }
  }
}

</script>

<style>
div[id="gdmMap"]{
 position:relative;
 width: 100%;
 margin:auto;
 min-height: 600px;
 z-index: 0;
}
</style>