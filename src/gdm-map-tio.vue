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
  <div id="gdmMap"></div>
  <tio-graph :dates="dates" :pt-values="ptValues" :keys="keys"></tio-graph>
<!--  <div style="width:50%;margin-left:50%;height:600px;position:relative;" >
      <div style="ming-height:150px;">DIVERS INFOS
       <div>@todo</div>
      </div>
      <div id="graphEW" style="height:220px;" @mousemove="highlight($event, 'EW')">EW: {{loaded.EW}} %</div>
      <div id="graphNS" style="height:220px;" @mousemove="highlight($event, 'NS')">NS: {{loaded.NS}} %</div>
      <div id="graphMAGN" style="height:220px;" @mousemove="highlight($event, 'MAGN')">MAGN: {{loaded.MAGN}} %</div>
     
     
   
 
   </div>  
  </div>--> 
  <div>
    <input type="button" @click="load" value="charger" :disabled="!drawn"/>
    <div v-if="!done">{{loaded}}</div>
    <div v-else>Ready!</div>
  </div>
  </span>
</template>



<script>
var L = require("leaflet")
L.PixiOverlay = require('leaflet-pixi-overlay')
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
      file: {
          type: String,
          default: 'http://api.formater/exemples/tio/ew_displ.csv'
      }
      
  },
  data () {
		return {
  			pseudo: 'Truc',
  			map: null,
  			loaded: {},
  			ptValues: {},
  			// points: [],
  			col: 640,
  			row: 425,
  			deltaLat: null,
  			deltaLng: null,
  			marker: null,
//   			graphs: {
//   			  EW: null,
//   			  NS: null,
//   			  MAGN: null
//   			},
//   			colors: {
//   			  EW: '#F00',
//   			  NS: '#00F',
//   			  MAGN: '#FF4500'
//   			},
  			step: 1500,
  			keys: [],
  			count: 0,
  			dates: [],
//   			points: {
//           EW: null,
//           NS: null,
//           MAGN: null
//         },
        selectedType: null,
//   			files: {
//   			  EW:'https://api.poleterresolide.fr/tio/ew_displ.json',
//   			  NS: 'https://api.poleterresolide.fr/tio/ns_displ.json',
//   			  MAGN: 'https://api.poleterresolide.fr/tio/magn_displ.json'
//   			},
        files: {
          EW:'https://api.poleterresolide.fr/tio/ew_displ_div_4.json',
          NS: 'https://api.poleterresolide.fr/tio/ns_displ_div_4.json',
          MAGN: 'https://api.poleterresolide.fr/tio/magn_displ_div_4.json'
        },
//         quality: [],
//         values: [],
  			done: false,
  			drawn: true,
  			dones : [false, false, false],
  			determinant: null,
  			coordSystem: {
  			  origin: null,
  			  u: null,
  			  v: null
  			}
		}
  },
  watch: {
    dones (newvalues) {
      const reducer = (accumulator, currentValue) => accumulator && currentValue;
      this.done = newvalues.reduce(reducer)
      if (this.done) {
        console.log('TOUT EST LU')
      }
    }
  },
	
  created: function(){
      this.$i18n.locale = this.lang;
  },
  mounted: function () {
     // this.drawOld()
       // this.readFile(0)
      this.initMap()
      TileSystem.load('http://api.formater/exemples/tio/tiled/root.json')
      .then( geojson => L.geoJSON(geojson).addTo(this.map))
//       this.readJSON('EW')
//       this.readJSON('NS')
//       this.readJSON('MAGN')
     // this.readFile(1)
     // this.readFile(2)
     // this.testRead()
  },
  methods: {
    removeCircles () {
      if (this.map) {
        
        var _this = this
        this.map.eachLayer(function (layer) {
          if (layer instanceof L.Circle) {
            _this.map.removeLayer(layer);
          }
        })
      }
    },
    load () {
      this.drawn = false
      this.removeCircles()
      this.readJSON('EW')
      this.readJSON('NS')
      this.readJSON('MAGN')
    },
    changeFrame (lat, lng) {
      var line = (this.coordSystem.u.dLng * (lat - this.coordSystem.origin.lat) - this.coordSystem.u.dLat * (lng- this.coordSystem.origin.lng)) / this.determinant
      var col = (this.coordSystem.v.dLat * (lng- this.coordSystem.origin.lng) - this.coordSystem.v.dLng * (lat - this.coordSystem.origin.lat)) / this.determinant
      return {line: Math.round(line), col: Math.round(col)}
    },
    computeCoordSystem () {
        var lastLine = this.MAGN.length - 1
        var lastCol = this.MAGN[0].length - 1
       // L.marker( [this.MAGN[0][0][0], this.MAGN[0][0][1]]).addTo(this.map)
        this.coordSystem.origin = {lat: this.MAGN[0][0][0], lng: this.MAGN[0][0][1]}
        // column
        this.coordSystem.u = {
          dLat: (this.MAGN[0][lastCol][0] - this.MAGN[0][0][0]) / lastCol,
          dLng: (this.MAGN[0][lastCol][1] - this.MAGN[0][0][1]) / lastCol
        }
        // line
        this.coordSystem.v = {
          dLat: (this.MAGN[lastLine][0][0] - this.MAGN[0][0][0]) / lastLine,
          dLng: (this.MAGN[lastLine][0][1] - this.MAGN[0][0][1]) / lastLine

        }
        this.determinant = this.coordSystem.u.dLng * this.coordSystem.v.dLat - this.coordSystem.u.dLat * this.coordSystem.v.dLng
        // test 
        // line 12 colone 46
        var lat = this.coordSystem.origin.lat + 46 * this.coordSystem.u.dLat + 12 * this.coordSystem.v.dLat
        var lng = this.coordSystem.origin.lng + 46 * this.coordSystem.u.dLng + 12 * this.coordSystem.v.dLng
        L.marker([lat, lng]).addTo(this.map)
        L.circle([this.MAGN[12][46][0], this.MAGN[12][46][1]], {weight:1, radius: 5, color: 'red'}).addTo(this.map)
//         L.marker([this.MAGN[lastLine][0][0], this.MAGN[lastLine][0][1]]).addTo(this.map)
        
//         L.marker([this.MAGN[0][lastCol][0], this.MAGN[0][lastCol][1]]).addTo(this.map)
//         L.marker([this.MAGN[lastLine][lastCol][0], this.MAGN[lastLine][lastCol][1]]).addTo(this.map)
        console.log(this.coordSystem)
    },
    displayPoints (line, step) {
      // afficher les 4 points
      
      
      if (line >= this.MAGN.length) {
        this.drawn = true
        console.log('superieur')
        return
      }
      var _this = this
      for (var index=line; index < line + step && index < this.MAGN.length; index++) {
        this.MAGN[index].forEach(function (col, k) {
          if (col[3] !== null) {
	          L.circle([col[0], col[1]], {weight:1, radius: 5, height: col[3], line:index, col: k})
	          .on('click', function (e) {
	            _this.marker.setLatLng(e.target.getLatLng())
	            _this.drawGraphs(e.target.options.line, e.target.options.col)
	          })
	          .addTo(_this.map)
          }
        })
      }
      setTimeout(function () {
        _this.displayPoints(line + step, step)
      }, 0)
      
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: false}).setView([51.505, -0.09], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
      }).addTo(this.map);
      this.marker = L.marker([4, 50])
      this.marker.addTo(this.map)
      this.bboxLayer = L.polygon([], {color: 'red', weight: 1})
      this.bboxLayer.addTo(this.map)
      var _this = this
      this.bboxLayer.on('click', function (e) {
        if (!_this.done) {
          alert('En cours de lecture...')
        }
        // remove charts
//         ['EW', 'NS', 'MAGN'].forEach(function (key) {
//           console.log(key)
//           if (_this.graphs[key]) {
//             _this.graphs[key].destroy()
//             _this.graphs[key] = null
//           }
//         })
        var position = _this.changeFrame(e.latlng.lat, e.latlng.lng)
        console.log(position)
        // _this.marker.setLatLng(e.latlng)
        var latlng = [_this.MAGN[position.line][position.col][0], _this.MAGN[position.line][position.col][1]]
        _this.marker.setLatLng(latlng)
      })
      this.load()
    },
    drawGraphs (line, col) {
      this.ptValues = null
      
      var tab = this.MAGN
      if (!tab || !tab[line] || !tab[line][col]) {
        console.log('return')
        return false
      }
      this.ptValues = {
          EW: null,
          NS: null,
          MAGN: null
      }
      var values = {
          EW: this.EW[line][col],
          NS: this.NS[line][col],
          MAGN: this.MAGN[line][col]
      }
      console.log('set')
      this.ptValues = values
    },
    readJSON (key) {
      var _this = this
      var progressLoad = (e) => {
        _this.$set(_this.loaded, key, Math.round(100 * e.loaded /e.total))
      }
      this.$http.get(this.files[key], { downloadProgress: progressLoad})
      .then(function (response) {
        console.log(response.body.DDSS_ID)
        // EW_DISPLACEMENT_TIMESERIES
        // NS_DISPLACEMENT_TIMESERIES
        this.col = response.body.nb_columns
        this.row = response.body.nb_lines
        this.bbox = response.body.bbox
        console.log(response.body.dates)
        this.dates = response.body.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
//         this.poly = response.body.bbox_wkt
//         this.polyLayer =  L.geoJson(parse(response.body.bbox_wkt));
//         this.polyLayer.addTo(this.map)
//         console.log(this.poly)
         var latlngs = [
          [this.bbox.minlat, this.bbox.minlon],
          [this.bbox.minlat, this.bbox.maxlon],
          [this.bbox.maxlat, this.bbox.maxlon],
          [this.bbox.maxlat, this.bbox.minlon],
          [this.bbox.minlat, this.bbox.minlon]
        ]
        
        this.deltaLat = this.bbox.maxlat - this.bbox.minlat
        this.deltaLng = this.bbox.maxlon - this.bbox.minlon
       this.bboxLayer.setLatLngs(latlngs)
        var _this = this
       
        this.map.fitBounds(this.bboxLayer.getBounds())
        this.keys = response.body.keys
        switch (response.body.DDSS_ID) {
        case 'EW_DISPLACEMENT_TIMESERIES':
          this.EW = response.body.data
          this.marker.setLatLng([this.bbox.minlat,this.bbox.minlon])
          this.$set(this.dones, 0, true)
          break
        case 'NS_DISPLACEMENT_TIMESERIES':
          this.NS = response.body.data
          this.$set(this.dones, 1, true)
          break
        case 'Magn_DISPLACEMENT_TIMESERIES':
          this.MAGN = response.body.data
          var marker = null
          var _this = this
          this.computeCoordSystem()
          this.displayPoints(0, 3)
//           this.MAGN.forEach(function (line) {
//             line.forEach(function (col) {
//               if (col[3] !== null) {
//               L.marker([col[0], col[1]]).addTo(_this.map)
//               }
//             })
//           })
          this.$set(this.dones, 2, true)
          break
        }
//         if (response.body.DDSS_ID === 'EW_DISPLACEMENT_TIMESERIES') {
//           this.EW = response.body.data
//         }
        
        
      })
    },
    
    getPolygon () {
      var latlngs = []
      var indexes = [0, this.row - 1, this.points.length - 1, this.points.length - 1 - this.row]
      var _this = this
      indexes.forEach (function (index) {
        console.log(index)
        var point = _this.points[index][0]
        latlngs.push([point[1], point[0]])
      })
      latlngs.push(latlngs[0])
      console.log(latlngs)
      var poly = L.polygon(latlngs, {color: 'blue'}).addTo(this.map);
      var u = {
          x: (latlngs[1][0] - latlngs[0][0]) / this.row,
          y: (latlngs[1][1] - latlngs[0][1]) / this.col
      }
      var v = {
          x: (latlngs[3][0] - latlngs[0][0]) / this.row,
          y: (latlngs[3][1] - latlngs[0][1]) / this.col
      }
      console.log(u)
      console.log(v)
      var discr = v.y * u.x - v.x * u.y
      var marker = L.marker(latlngs[0]).addTo(this.map)
      poly.on('click', function (e) {
        var x = ((e.latlng.lat - latlngs[0][0]) * v.y - (e.latlng.lng - latlngs[0][1]) * v.x) / discr
        var y = ((e.latlng.lat - latlngs[0][0]) * u.y - (e.latlng.lng - latlngs[0][1]) * u.x) / discr
        console.log(x)
        console.log(y)
        var pos =  Math.ceil( -1 * y) * _this.col + Math.floor(x)
        console.log(pos)
         var point = _this.points[pos]
        // console.log(point)
        marker.setLatLng([point[0][1], point[0][0]])
      })
 
      this.map.fitBounds(poly.getBounds())
    }
  }
}

</script>

<style>
div[id="gdmMap"]{
 position:relative;
 width: calc(50% - 10px);
 float:left;
 max-width: 800px;
 margin:auto;
 min-height: 600px;
 z-index: 0;
}
</style>