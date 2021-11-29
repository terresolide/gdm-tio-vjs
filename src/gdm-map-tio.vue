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
	  <div v-if="imgTio && imgTio.searching" style="position:absolute;top:270px;left:45%;z-index:10;color:grey;" class="fa fa-spinner fa-spin fa-2x fa-fw"></div>
	  <div id="gdmMap" style="width:100%;min-height:500px;" :style="{height: height + 'px'}"></div>
  </div>
   <tio-graph v-if="imgTio" v-show="showGraph" :dates="imgTio.dates" :ns-values="ptValues.ns" :ew-values="ptValues.ew" 
   :keys="imgTio.keys" :maximum="imgTio.max" :lang="lang" @close="showGraph=false"></tio-graph>
  </span>
</template>



<script>

var L = require("leaflet")
const TioGraph = () => import('./tio-graph.vue')
import Tio from './modules/leaflet.imageOverlay.rotated.tio.js'
L.ImageOverlay.Rotated.Tio = Tio

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
  			  ew: []
  			},
  			searching: false,
  			showGraph: false,
  			height: 500,
  			imgTio: null,
		}
  },
  created: function(){
      this.$i18n.locale = this.lang;
  },
  mounted: function () {
      this.initMap()
     // this.initTiles()
      this.height = window.innerHeight
  },
  methods: {

    draw (type, data) {
      this.$set(this.ptValues, type, data.values)
      this.showGraph = true
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: true}).setView([51.505, -0.09], 2);
       L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
       attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
     }).addTo(this.map);
      var _this = this
      var control = L.control.layers([], [])
      control.addTo(this.map)
      this.imgTio = new L.ImageOverlay.Rotated.Tio(this.directory)
      this.imgTio.on('TIO:RESET', function (resp) {
        _this.ptValues = {ew: [], ns: []}
        _this.showGraph = false
      })
      this.imgTio.on('TIO:DATA', function (resp) {
        _this.draw(resp.dimension, {values: resp.values})
      })
      control.addOverlay(this.imgTio, 'TIO')
      this.map.on('click',  function (e) {
        _this.imgTio.addTo(_this.map)
      })

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