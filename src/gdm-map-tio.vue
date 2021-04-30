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
  <div style="width:50%;margin-left:50%;height:600px;position:relative;" >
      <div style="ming-height:150px;">DIVERS INFOS
         <div v-if="points.EW && points.EW[0]" style="font-size:0.9rem;">
		      {{ dateHighchart(points.EW[0].x)}}
		     </div>
		     <div v-for="graph, key in points" v-if="graph && graph[0]">
		      <div >
		          <span :style="{color: graph[0].color}"> &#9632;</span>
		          {{key}} 
        </div>
      </div>
      <div id="graphEW" style="height:220px;" @mousemove="highlight($event, 'EW')">EW: {{loaded.EW}} %</div>
      <div id="graphNS" style="height:220px;" @mousemove="highlight($event, 'NS')">NS: {{loaded.NS}} %</div>
      <div id="graphMAGN" style="height:220px;" @mousemove="highlight($event, 'MAGN')">MAGN: {{loaded.MAGN}} %</div>
     
     
    <!--    var str = '';
               if (_this.points['EW'] && _this.points['EW'][0]) {
                 str += moment.unix(_this.points['EW'][0].x / 1000).format('ll')
               }
               for(var key in _this.points) {
                 _this.points[key].forEach(function (pt) {
                   if (pt.series.name.indexOf('Linear Regression Indicator') >= 0) {
                     str += '<br /><span style="color:' + pt.color + ';">&#9679; </span><em>' + pt.series.name + ':' + Math.round(pt.y * 100) / 100 + '</em>'
                   } else if (pt.hasOwnProperty('open')) {
                     str += '<br/><span style="color:' + pt.color + ';">&#9632; </span><b> ' + pt.series.name + '</b> = ' + Math.round(pt.open * 100) / 100 + ' &pm; + EPS';
                   }
                 })
               }
               -->
 
   </div>
  </div>
  <div>
    <input type="button" @click="load" value="charger"/>
    <div v-if="!done">{{loaded}}</div>
    <div v-else>Ready!</div>
  </div>
  </span>
</template>



<script>
var L = require("leaflet")
// var lineReader = require('line-reader')
import * as Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
// import HighchartsReact from 'highcharts-react-official'
 import HighchartsMore from 'highcharts/highcharts-more'
 import Stock from 'highcharts/modules/stock'
 import Data from 'highcharts/modules/data'
 import Accessibility from 'highcharts/modules/accessibility'
// import Highstock from 'highcharts/highstock'
 import  Indicators from 'highcharts/indicators/indicators'
 import  Regression from 'highcharts/indicators/regressions'
 import jStat from 'jStat'

if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts)
    HighchartsMore(Highcharts) // init module
    Stock(Highcharts)
    Data(Highcharts)
   Accessibility(Highcharts)
   // Highstock(Highcharts)
   Indicators(Highcharts)
   Regression(Highcharts)
}
Highcharts.Point.prototype.highlight = function (event) {
  event = this.series.chart.pointer.normalize(event);
  this.onMouseOver(); // Show the hover marker
//   this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

Highcharts.Pointer.prototype.reset = function () {
  return undefined;
};

// function syncExtremes (e) {
//   console.log(e)
//   var thisChart = this.chart;

//   if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
//     Highcharts.each(Highcharts.charts, function(chart) {
//       console.log(chart)
//       if (chart !== thisChart) {
//         if (chart.xAxis[0].setExtremes) { // It is null while updating
//           chart.xAxis[0].setExtremes(
//             e.min,
//             e.max,
//             undefined,
//             false, {
//               trigger: 'syncExtremes'
//             }
//           );
//         }
//       }
//     });
//   }
// }
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Highcharts.Point.prototype.highlight = function(event) {
//   event = this.series.chart.pointer.normalize(event);
//   console.log(event)
// //   this.onMouseOver(); // Show the hover marker
// //   this.series.chart.tooltip.refresh(this); // Show the tooltip
// //   this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
// };
// import markerIconPng from "leaflet/dist/images/marker-icon.png"
// var errorbar from 'highcharts/indicators/indicators'
// indicators(Highcharts)

import moment from 'moment'
// import reader from './file-reader.js'
export default {
  name: 'GdmMapTio',
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
  			// points: [],
  			col: 640,
  			row: 425,
  			deltaLat: null,
  			deltaLng: null,
  			marker: null,
  			graphs: {
  			  EW: null,
  			  NS: null,
  			  MAGN: null
  			},
  			colors: {
  			  EW: '#F00',
  			  NS: '#00F',
  			  MAGN: '#FF4500'
  			},
  			step: 1500,
  			keys: [],
  			count: 0,
  			dates: [],
  			points: {
          EW: null,
          NS: null,
          MAGN: null
        },
        selectedType: null,
//   			files: {
//   			  EW:'https://api.poleterresolide.fr/tio/ew_displ.json',
//   			  NS: 'https://api.poleterresolide.fr/tio/ns_displ.json',
//   			  MAGN: 'https://api.poleterresolide.fr/tio/magn_displ.json'
//   			},
        files: {
          EW:'http://api.formater/exemples/tio/ew_displ_div_4.json',
          NS: 'http://api.formater/exemples/tio/ns_displ_div_4.json',
          MAGN: 'http://api.formater/exemples/tio/magn_displ_div_4.json'
        },
  			done: false,
  			dones : [false, false, false]
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
//       this.readJSON('EW')
//       this.readJSON('NS')
//       this.readJSON('MAGN')
     // this.readFile(1)
     // this.readFile(2)
     // this.testRead()
  },
  methods: {
    load () {
      this.readJSON('EW')
      this.readJSON('NS')
      this.readJSON('MAGN')
    },
    dateHighchart (time) {
      return moment.unix(time / 1000).format('ll')
    },
    highlight (e, type) {
      if (!this.graphs[type]) {
        return
      }
        // console.log(e)
        var chart,
          point,
          i,
          event;
        var _this = this
        console.log(e)
//         ['EW', 'NS', 'MAGN'].forEach(function (key) {
//           chart = _this.graphs[key]
//           console.log(chart)
//           if (chart) {
//             event = chart.pointer.normalize(e);
//             // Get the hovered point
//             point = chart.series[0].searchPoint(event, true);

//             if (point) {
//               point.highlight(e);
//             }
//           }
//         })
        
        var points = {}
        this.selectedType = type
        event = this.graphs[type].pointer.normalize(e);
         var point = this.graphs[type].series[0].searchPoint(event, true);
         if (!point) {
           return
         }
         console.log(point.x)
         console.log(point)
         points[type]= [point]
         // if (points[type][0]) {
           point.highlight(e);
           this.graphs[type].xAxis[0].addPlotLine({
             color: '#999999',
             value:  point.x,
             width: 1,
             id: 'highlight'
           })

//         console.log(moment.unix(point.x / 1000).format('ll'))
        for (var key in this.graphs) {
          var chart = this.graphs[key];
          if (chart && typeof chart !== 'undefined' && key !== type) {
            points[key] = []
	          // Find coordinates within the chart
	         // event = chart.pointer.normalize(e);
           
//             console.log(event)
	          // Get the hovered point
// 	          for (var j=0; j < chart.series.length; j++) {
// 	            var point = chart.series[j].searchPoint(event, true);
// 	            if (point) {
// 	              points[key].push(point)
// 	            }
// 	          }
              var pt = chart.series[0].points.find(el => el.x === point.x )
               Highcharts.each(chart.series[0].points, function(pt) {
				          if (pt.x === point.x) {
				            points[key].push(pt)
				          }
				       });
//               if (pt) {
//                 points[key].push(pt)
//               }
// 	            if (point) {
// 	              points.push(point)
// 	            }
// 	          }
// 	          var lines = chart.xAxis[0].plotLineOrBands
// 	          console.log(lines)
   
 	          chart.xAxis[0].removePlotLine('highlight')
 	          chart.xAxis[0].addPlotLine({
             color: '#999999',
             value:  point.x,
             width: 1,
             id: 'highlight'
           })
	          if (points[key][0]) {
	            points[key][0].highlight(e);
	            chart.xAxis[0].addPlotLine({
	              color: '#999999',
	              value:  points[key][0].x,
	              width: 1,
	              id: 'highlight'
	            })
	          }
          }
        }
        if (Object.keys(points).length > 0) {
          this.points = points
          console.log(this.points)
        } else {
          this.points = null
        }
      
    },
    unselect (e) {
      for (let i = 0; i < Highcharts.charts.length; ++i) {
        let chart = Highcharts.charts[i];
        let event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
        let point;
        for (let j = 0; j < chart.series.length && !point; ++j) {
          point = chart.series[j].searchPoint(event, true);
        }
        if (!point) return;
       
        if (e.type === "mousemove") {
           point.onMouseOver();
          chart.xAxis[0].drawCrosshair(event, point); // Show the crosshair
        } else {
          point.onMouseOut();
          
          chart.xAxis[0].hideCrosshair();
        }
        chart.tooltip.hide(point);
      }
    },
    updateExtremes ({ min, max }) {
      Highcharts.charts.forEach(function (chart) {
        console.log(chart)
        // machin pour recharger 
        if (chart && chart.xAxis) {
          chart.xAxis[0].setExtremes(min, max)
        }
      })
    },
    syncExtremes (e, type) {
      if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        for (var tp in this.graphs) {
           var chart = this.graphs[tp]
            if (tp !== type) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    )
                }
            }
         }
      }
    },
    formatter (args) {
      
    },
    draw (type, row, col) {
       var tab = this[type]
       if (!tab || !tab[row] || !tab[row][col]) {
         return false
       }
       tab = tab[row][col]
       var index = this.keys.findIndex(tb => tb === 'quality')
       var quality = tab[index]
       if (tab[index] === 0) {
         console.log('Aucune valeur')
         return
       }
       tab = tab.slice(this.keys.length)
       
       var data = []
     
       var min = null
       var max = null
       var delta = []
       var plotlines = []
       // fill data
       this.dates.forEach (function (date, n) {
         if (!isNaN(tab[n]) && tab[n] !== null) {
             data.push([
               date, 
               tab[n],
               tab[n] + quality,
               tab[n] - quality,
               tab[n]
            ])
            if (min === null || min > tab[n]) {
              min = tab[n]
            } 
            if (max === null || max < tab[n]) {
              max = tab[n]
            } 
            plotlines.push({
              color: '#ccd6eb',
              value: date,
              width: 1,
              id: n
            })
         }
       })
       if (data.length === 0) {
         return
       }
       var _this = this
      // var chartIndex = Object.keys(this.graphs).findIndex(key => key === type)
       quality = Math.round(quality * 100) / 100
       var color = this.colors[type]
       var lightColor = this.$shadeColor(color, 0.4)
       this.graphs[type] = Highcharts.chart('graph' + type, {
         chart: {
           zoomType: 'x'
         },
         title: 'Test',
         

         height: '32%',
         credits: {
           enabled:false
         },
         legend: {
           enabled: false
         },
         exporting: {
           enabled: false
         },
         tooltip: {
           enabled: true,
           formatter: function (e) {
//              console.log(chartIndex)
//              console.log(e.chart.index)
//               if (e.chart.index !== chartIndex) {
//                 return false
//               }
              console.log(_this.selectedType)
              console.log(type)
              if (type !== _this.selectedType) {
                return false
              }
              if (!_this.points) {
                return false
              }
               var str = '';
               if (_this.points['EW'] && _this.points['EW'][0]) {
                 str += moment.unix(_this.points['EW'][0].x / 1000).format('ll')
               }
//                for(var key in _this.points) {
// 	               _this.points[key].forEach(function (pt) {
// 	                 if (pt.series.name.indexOf('Linear Regression Indicator') >= 0) {
// 	                   str += '<br /><span style="color:' + pt.color + ';">&#9679; </span><em>' + pt.series.name + ':' + Math.round(pt.y * 100) / 100 + '</em>'
// 	                 } else if (pt.hasOwnProperty('open')) {
// 	                   str += '<br/><span style="color:' + pt.color + ';">&#9632; </span><b> ' + pt.series.name + '</b> = ' + Math.round(pt.open * 100) / 100 + ' &pm; + EPS';
// 	                 }
// 	               })
//                }
               
               var result = this.points.reduce(function (s, point) {
                   return moment.unix(point.x / 1000).format('ll') + 
                      '<br/>' + point.series.name + ': ' +
                      Math.round(point.y * 100) / 100 + ' &pm; '  + quality;
               }, '<b>' + this.x + '</b>');
               return result
              //return str
          },
           shared: true
         },
         plotOptions: {
//            boxplot: {
//                centerInCategory: true,
//                boxDashStyle: 'transparent',
//                fillColor: 'none',
//                lineWidth: 1,
//                medianColor: color,
//                medianDashStyle: 'solid',
//                medianWidth: 1,
//                medianLength: '100%',
//                stemColor: color,
//                stemDashStyle: 'solid',
//                stemWidth: 1,
//                whiskerColor: color,
//                whiskerWidth: 1
//            }
       },
//        tooltip: {
//          shared: true
//        },
         xAxis: {
            type: 'datetime',
            lineColor:'#666',
            events: {
              setExtremes (e) {
                _this.syncExtremes(e, type)
              },
              afterSetExtremes (e) {
                _this.updateExtremes(e)
              }
            },
            gridLineWidth: 0,
            plotLines: plotlines,
          },
          yAxis: {
              title: {
                  text: type
              },
              min: min,
              max: max
          },
          series: [{
              name: type,
              color: color,
              type: 'ohlc',
              id: type,
              data:data,
              lineWidth: 1
//               states: {
//                   hover: {
//                       lineWidthPlus: 2
//                   }
//               },
              
          }
//           , {
//             type: 'linearRegression',
//             color: color,
//             linkedTo: type,
//             lineWidth: 1,
//             zIndex: -1,
//             params: {
//               period: 4
//             }          
//          }
          ]
       })
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
        ['EW', 'NS', 'MAGN'].forEach(function (key) {
          console.log(key)
          if (_this.graphs[key]) {
            _this.graphs[key].destroy()
            _this.graphs[key] = null
          }
        })
        var x = Math.floor(_this.col * (e.latlng.lng - _this.bbox.minlon) / _this.deltaLng)
        var y = _this.row - Math.ceil(_this.row * (e.latlng.lat - _this.bbox.minlat) / (_this.deltaLat))
        var tab = null
        if (_this.EW && _this.EW[y] && _this.EW[y][x]) {
          tab = _this.EW[y][x]
          _this.marker.setLatLng([tab[0], tab[1]])
        }
        console.log('y=', y)
        console.log('x=', x)
        for(var key in _this.colors) {
          _this.draw(key, y, x)
        }
      })
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
          this.$set(this.dones, 2, true)
          break
        }
        if (response.body.DDSS_ID === 'EW_DISPLACEMENT_TIMESERIES') {
          this.EW = response.body.data
        }
        
        
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