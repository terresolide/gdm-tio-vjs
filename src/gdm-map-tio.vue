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
	  <div v-if="imgTio && searching" style="position:absolute;top:270px;left:45%;z-index:10;color:grey;" class="fa fa-spinner fa-spin fa-2x fa-fw"></div>
	  <div id="gdmMap" style="width:100%;min-height:500px;" :style="{height: height + 'px'}"></div>
  </div>
   <tio-graph v-if="imgTio" v-show="showGraph" :latlng="latlng" :img="imgTio" :dates="imgTio.dates" :radar="imgTio.radar" :ns-values="ptValues.ns" :ew-values="ptValues.ew" 
   :keys="imgTio.keys" :maximum="imgTio.max" :lang="lang" @close="showGraph=false"></tio-graph>
<!--   <div v-if="imgTio && images.length > 0">
     <div v-for="(image, index) in images">
     <i class="fa" style="vertical-align:top;":class="imgTio.checked && imgTio.index === index ?'fa-eye':'fa-eye-slash'" @click="toggleImageTio(index)"></i>   {{image.title}}
     </div>
   </div>  -->
  </span>
</template>



<script>

var L = require("leaflet")
const TioGraph = () => import('./tio-graph.vue')
import Zarr from './modules/leaflet.imageOverlay.rotated.zarr.js'
// require('./modules/leaflet.control.legend.js')
 L.Control.Legend = require('formater-commons-components-vjs/src/leaflet/leaflet.control.legend.js')
require('./modules/leaflet.control.opacity.js')
require('./modules/leaflet.control.gdmlayer.js')
L.ImageOverlay.Rotated.Zarr = Zarr

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
      root: {
          type: String,
          default: 'https://s3.unistra.fr/gdmsarcor/job_2024-10-30_12-22-03_519358_vluyli/root.json'
          // default: 'https://api.poleterresolide.fr/tio/546/tio/root3.json'
      }
  },
  data () {
		return {
  			map: null,
  			ptValues: {
  			  ns: [],
  			  ew: []
  			},
        latlng: {lat: null, lng: null},
  			searching: false,
  			showGraph: false,
  			height: 500,
  			imgTio: null,
  			controlLayer: null,
  			controlLegend: null,
  			controlOpacity: null,
  			images: [],
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
    toggleImageTio (index) {
      console.log(index)
      if (this.imgTio.checked && this.imgTio.index === index) {
        this.imgTio.checked = false
        this.imgTio.remove()
      } else {
        this.imgTio.index = index
        this.imgTio.setUrl(this.images[index].png)
        this.imgTio.legend = this.images[index].legend
        this.imgTio.checked = true
        this.imgTio.addTo(this.map)
      }
    },
    initMap () {
      var container = this.$el.querySelector('#gdmMap');
      this.map = L.map( container, {scrollWheelZoom: true}).setView([51.505, -0.09], 2);
       L.tileLayer('//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
       attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
     }).addTo(this.map);
      var _this = this
      this.controlLayer = new L.Control.Gdmlayer(null, null,{position: 'topleft'})
      this.controlLayer.tiles.arcgisTopo.layer.addTo(this.map)
      this.controlLayer.addTo(this.map)
      this.controlLegend = new L.Control.Legend(this.$i18n.locale, function (uuid) { return 'i' + uuid;})
      this.controlLegend.addTo(this.map)
      this.controlOpacity = new L.Control.Opacity(this.$i18n.locale)
      this.controlOpacity.addTo(this.map)
      // control.addTo(this.map)
      this.imgTio = new L.ImageOverlay.Rotated.Zarr(this.root)
      this.imgTio.type = 'TIO'
      this.imgTio.first = 'Time series'
        this.controlOpacity.setLayers([this.imgTio])
      this.imgTio.on('TIO:RESET', function (resp) {
        _this.ptValues = {ew: [], ns: []}
        _this.showGraph = false
      })
//       var marker = L.marker([0,0])
//       marker.addTo(this.map)
      this.imgTio.on('TIO:DATA', function (resp) {
//         console.log(resp)
//         marker.setLatLng([resp.values[0], resp.values[1]])
        if (resp.latlng) {
          _this.latlng = resp.latlng
        }
        _this.draw(resp.dimension, {values: resp.values})
      })
      this.imgTio.on('TIO:SEARCHING', function (data) {
        _this.searching = data.searching
      })
      this.imgTio.on('add', function (e) {
        var bounds = this._polygon.getBounds()
        _this.map.fitBounds(bounds)
        _this.controlLegend.addLegend(0, 0, this.legend)
        _this.controlOpacity.setVisible(true)
      })
      this.imgTio.on('remove', function (e) {
        _this.controlLegend.removeLegend(0)
        _this.controlOpacity.setVisible(false)
      })
      this.imgTio.on('TIO:READY', function (data) {
        _this.images = this.images
        _this.controlLayer.addOverlay(this, 'Inversion')
      })
      
      this.map.on('click',  function (e) {
        _this.imgTio.addTo(_this.map)
      })

    }
  }
}

</script>
<!--  <style src="formater-metadata-vjs/src/assets/css/fontello.css"></style> -->

<style src="formater-commons-components-vjs/src/assets/css/formater-icon.css"></style> 

<style>
div[id="gdmMap"]{
 position:relative;
 width: 100%;
 margin:auto;
 min-height: 600px;
 z-index: 0;
}
 div[id="gdmMap"] a.leaflet-control-layers-toggle{
   width: 30px;
   height: 30px;
   border-radius: 2px;
   line-height: 30px;
 }
  div[id="gdmMap"] .lfh-control-legend {
   cursor: pointer;
   background: white;
   display:none;
 }
 div[id="gdmMap"] .lfh-control-opacity {
  background:white;
  display:block;
 }
 div[id="gdmMap"] .lfh-control-opacity.hidden {
  display:none;
  
 }
 div[id="gdmMap"] .lfh-control-opacity.expand {
  padding:5px;
 }
 div[id="gdmMap"] .lfh-control-opacity a.icon-progress{
  /* background-image: url("/assets/images/progress2.png");*/
   background-size: cover;
   pointer-events:auto;
   cursor:pointer;
   display:block;
 }
 div[id="gdmMap"] .lfh-control-opacity.expand a.icon-progress{
   display:none;
 }
 div[id="gdmMap"] .lfh-control-opacity div{
   display:none;
 }
 div[id="gdmMap"] .lfh-control-opacity strong{
   display:block;
   text-align:right;
   cursor:pointer;
 }
 div[id="gdmMap"] .lfh-control-opacity input{
   pointer-events:auto;
 }
  div[id="gdmMap"] .lfh-control-opacity.expand div {
    display:block;
  }
  div[id="gdmMap"] .lfh-control-legend img{
    display:block;
    max-height:250px;
    max-width: 300px;
  }
   div[id="gdmMap"]  div.lfh-control-legend{
    display:block;
  }
    div[id="gdmMap"]  div.lfh-control-legend.hidden,
    div[id="gdmMap"]  div.lfh-control-legend.opacity{
    display:none;
  }
 
 div[id="gdmMap"].mtdt-small .lfh-control-legend img{
   max-width:120px;
   max-height:100px;
 }
 div[id="gdmMap"] .lfh-control-legend img{
    display: none;
  }
/*  div[id="gdmMap"] .lfh-control-legend a{
   display:block;
 } */
  div[id="gdmMap"] .lfh-control-legend.expand img{;
   display:block;
   margin-left:5px;
 }
   div[id="gdmMap"] .lfh-control-legend.expand img:first-child{
    margin-left:0px;
   }
  div[id="gdmMap"] .lfh-control-legend.expand a{
   display:none;
 
 }
 div[id="gdmMap"].mtdt-fullscreen{
   min-height:400px;
   width:100%;
   font-size: 16px;
 }
 div[id="gdmMap"] a.leaflet-control-layers-toggle{
  background-image: none;
  color: black;
  text-decoration: none;
  text-align:center;
 }
  div[id="gdmMap"] a.leaflet-control-layers-toggle::before{
   font-family:Formater;
   content: "\e806";
  }
  

    div[id="gdmMap"] .leaflet-control-layers-expanded {
          padding: 3px 5px;
   }
    div[id="gdmMap"] section.leaflet-control-layers-list input[type=radio],
     div[id="gdmMap"] section.leaflet-control-layers-list input[type=checkbox]{
     display:none;
 }
    div[id="gdmMap"] section.leaflet-control-layers-list  input[type=radio] + span:before {
     font-family: FontAwesome;
     content: "\f10c";
     opacity:0.8;
     cursor: pointer;
     
  }
  div[id="gdmMap"] section.leaflet-control-layers-list input[type=radio]:checked + span:before {
     content: "\f111";
     opacity:1;
     
  }
  div[id="gdmMap"] section.leaflet-control-layers-list  input[type=checkbox] + span:before {
     font-family: FontAwesome;
     content: "\f096";
     opacity:0.8;
     cursor: pointer;
  }
    
  div[id="gdmMap"] section.leaflet-control-layers-list input[type=checkbox]:checked + span:before {
     content: "\f046";
     opacity:1;
     
  }

 div[id="gdmMap"] .leaflet-control-layers-base label span{
   vertical-align: middle;
 }
</style>