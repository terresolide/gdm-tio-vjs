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
  <div style="position:relative;width: calc(50% - 10px);">
  <div v-if="searching" style="position:absolute;top:270px;left:45%;z-index:10;color:grey;" class="fa fa-spinner fa-spin fa-2x fa-fw"></div>
  <div id="gdmMap"></div>
  </div>
  <tio-graph :dates="dates" :ns-values="ptValues.ns" :ew-values="ptValues.ew" :magn-values="ptValues.magn" :keys="keys"></tio-graph>
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
L.markersCanvas = require('leaflet-markers-canvas')
// L.PixiOverlay = require('leaflet-pixi-overlay')
// var parse = require('wellknown')
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
import TioGraph from './tio-graph.vue'
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
  			bboxLayer: null,
  			polygon: null,
  			keys: [],
  			dates: [],
  			searching: false
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
  },
  methods: {
    draw (type, data) {
      this.$set(this.ptValues, type, data.values)
      this.marker.setLatLng([data.values[0], data.values[1]])
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: false}).setView([51.505, -0.09], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        preferCanvas: true
      }).addTo(this.map);
      this.marker = L.marker([4, 50])
      this.marker.addTo(this.map)
    },
    initTiles () {
      var _this = this
      TileSystem.load(this.directory)
      .then( geojson => {
        var bbox = geojson.properties.bbox
        var latlngs = [
           [bbox.minlat, bbox.minlon],
           [bbox.minlat, bbox.maxlon],
           [bbox.maxlat, bbox.maxlon],
           [bbox.maxlat, bbox.minlon],
           [bbox.minlat, bbox.minlon]
        ]
        _this.bboxLayer = L.polygon(latlngs, {color: 'red', weight:1})
        .addTo(this.map)
        _this.polygon = L.geoJSON(
            geojson, 
            {style() {return {weight: 1}}})
        .addTo(this.map)
        .on('click', function (e) {
          _this.ptValues = {ew: [], ns: [], magn: []}
          _this.searching = true
          _this.$forceUpdate()
          TileSystem.searchData('ew', e.latlng.lat, e.latlng.lng)
          .then(resp => {
            console.log('ew=', resp)
            _this.searching = false
            if (resp) {
              _this.draw('ew', resp)
            }
          })
          TileSystem.searchData('ns', e.latlng.lat, e.latlng.lng)
          .then(resp => {
            console.log('ns=', resp)
            _this.searching = false
            if (resp) {
              _this.draw('ns', resp)
            }
          })
          TileSystem.searchData('magn', e.latlng.lat, e.latlng.lng)
          .then(resp => {
            console.log('magn=', resp)
            _this.searching = false
            if (resp) {
              _this.draw('magn', resp)
            }
          })
        })
       // L.rectangle(poly.getBounds(), {color: 'green', weight: 1, opacity:0.1}).addTo(this.map)
        this.map.fitBounds(_this.polygon.getBounds())
        
        this.dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
        this.keys = geojson.properties.keys
      })
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
 float:left;
 max-width: 800px;
 margin:auto;
 min-height: 600px;
 z-index: 0;
}
</style>