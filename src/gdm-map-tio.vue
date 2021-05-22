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
	  <div v-if="searching" style="position:absolute;top:270px;left:45%;z-index:10;color:grey;" class="fa fa-spinner fa-spin fa-2x fa-fw"></div>
	  <div id="gdmMap" style="width:100%;min-height:500px;" :style="{height: height + 'px'}"></div>
  </div>
   <tio-graph v-show="showGraph" :dates="dates" :ns-values="ptValues.ns" :ew-values="ptValues.ew" 
  :magn-values="ptValues.magn" :keys="keys" @close="showGraph=false"></tio-graph>
 
  
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
require('leaflet-markers-canvas')
// L.PixiOverlay = require('leaflet-pixi-overlay')
// var parse = require('wellknown')
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
 const TioGraph = () => import('./tio-graph.vue')
// import TioGraph from './tio-graph.vue'
import TileSystem from './tile-system.js'
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
  		//	markersCanvasZ13: null,
  			bboxLayer: null,
  			polygon: null,
  			keys: [],
  			dates: [],
  			searching: false,
  			iconRed: null,
  			iconBlue: null,
  			iconGrey: null,
  			arrowIcon: null,
  			showGraph: false,
  			height: 500
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
      this.initTiles()
      this.height = window.innerHeight
  },
  methods: {
    draw (type, data) {
      this.$set(this.ptValues, type, data.values)
      this.marker.setLatLng([data.values[0], data.values[1]])
      this.showGraph = true
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: true}).setView([51.505, -0.09], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        preferCanvas: true
      }).addTo(this.map);
      this.arrowIcon = L.icon({
        iconUrl: require('./assets/img/arrow.png'),
        iconSize: [30, 30],
        iconAnchor: [0, 30]
      })
      this.marker = L.marker([4, 50])
      this.marker.addTo(this.map)
      this.marker.on('click', function (e) {
          _this.showGraph = true
      })
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
      this.iconBlue = L.icon({
        iconUrl: require('./assets/img/pointBlue.png'),
        iconSize: [1, 1],
        iconAnchor: [0, 0],
      })
//       this.markersCanvasZ13 = new L.MarkersCanvas()
//       if (this.map.getZoom() > 13) {
//         this.markersCanvas13.addTo(this.map)
//       }
      this.markersCanvas = new L.MarkersCanvas({opacity: 0.1})
      this.markersCanvas.addTo(this.map)
      var _this = this
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
    addMarkers(data) {
      var _this = this
      var markers = []
      data.forEach(function (pos) {
        var marker = L.marker(pos.pt, {icon: _this.iconBlue})
//         if (pos.value > 0.5) {
//           var marker = L.marker(pos.pt, {icon: _this.iconRed, opacity: Math.max(1, pos.value / 5)})
//         } else if (pos.value < 0.5) {
//           var marker = L.marker(pos.pt, {icon: _this.iconBlue, opacity: Math.max(1, pos.value / (-5))})
//         } else {
//           var marker = L.marker(pos.pt, {icon: _this.iconGrey})
//         }
        markers.push(marker)
      })
      this.markersCanvas.addMarkers(markers)
//       data[1].forEach(function (pos) {
//         var marker = L.marker(pos.pt, {icon: _this.iconBlue})
//         markers.push(marker)
//       })
//       this.markersCanvasZ13.addMarkers(markers)
    },
    searchData (e) {
      var _this = this
      this.ptValues = {ew: [], ns: [], magn: []}
      this.searching = true
      this.$forceUpdate()
      TileSystem.searchData('ew', e.latlng.lat, e.latlng.lng)
      .then(resp => {
        _this.searching = false
        if (resp) {
          _this.draw('ew', resp)
        }
      })
      TileSystem.searchData('ns', e.latlng.lat, e.latlng.lng)
      .then(resp => {
        _this.searching = false
        if (resp) {
          _this.draw('ns', resp)
        }
      })
      TileSystem.searchData('magn', e.latlng.lat, e.latlng.lng)
      .then(resp => {
        _this.searching = false
        if (resp) {
          _this.draw('magn', resp)
        }
      })
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
//       this.bboxLayer = L.polygon(latlngs, {color: 'red', weight:1})
//       .addTo(this.map)
      
        
        this.dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
        this.keys = geojson.properties.keys
      this.polygon = L.geoJSON(
          geojson, 
          {style() {return {weight: 1, fillOpacity: 0.05}}})
      .addTo(this.map)
      .on('click', function (e) { _this.searchData(e)})
       this.map.fitBounds(this.polygon.getBounds())
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