<i18n>
{ 
  "fr":  {
     "height": "Hauteur",
     "plot_point": "Données du point sélectionné",
     "MEAN_VELOCITY": "VITESSE MOYENNE",
     "QUALITY": "QUALITÉ"
  },
  "en": {
     "height": "Height",
     "plot_point": "Data of the selected point",
     "MEAN_VELOCITY": "MEAN VELOCITY",
     "QUALITY": "QUALITY"
  }
}
</i18n>
<template>
 <div v-show="hasValues" class="graph-container" >
     <div class="graph-infos">
	      <div class="graph-header">
	      <div class="fa fa-close" @click="$emit('close')"></div>
	       <h4 style="text-transformation:uppercase;">{{$t('plot_point').toUpperCase()}}</h4>
	       
	      </div>
          <div class="tio-element" v-if="position.lat" >
          <label>POSITION</label>
          <div><label>Lat:</label> {{Math.round(position.lat * 1000) / 1000}}°</div>
          <div><label>Lng:</label> {{Math.round(position.lng * 1000) / 1000}}°</div>
          <div><label>{{$t('height')}}:</label> {{position.height.toLocaleString()}} m</div>
          </div>
          <div class="tio-element" >
          <label>{{$t('MEAN_VELOCITY')}}</label>
          <div><label>NS:</label> {{point.ns}}</div>
          <div><label>EW:</label> {{point.ew}}</div>
          <div><label>MAGN:</label> {{point.magn}}</div>
          </div>
          <div class="tio-element" style="">
          <label>{{$t('QUALITY')}}</label>
          <div><label>NS:</label> {{quality.ns}}</div>
          <div><label>EW:</label> {{quality.ew}}</div>
          <div><label>MAGN:</label> {{quality.magn}}</div>
          </div>
          <div style="display:inline-block;">
            <compass-rose :lang="lang" :width="100" :height="100" :max="0.005" :ns="point.ns" :ew="point.ew"></compass-rose>
          </div>
      </div>
      <div id="graph_ew" :style="{height:height + 'px'}" @mousemove="highlight($event, 'ew')"></div>
      <div id="graph_ns" :style="{height:height + 'px'}" @mousemove="highlight($event, 'ns')"></div>
      <div id="graph_magn" :style="{height:height + 'px'}" @mousemove="highlight($event, 'magn')"></div>
</div>
</template>
<script>
import * as Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
// import HighchartsReact from 'highcharts-react-official'
 import HighchartsMore from 'highcharts/highcharts-more'
 import Stock from 'highcharts/modules/stock'
 import Data from 'highcharts/modules/data'
 import Accessibility from 'highcharts/modules/accessibility'
 import CompassRose from './compass-rose.vue'
// import Highstock from 'highcharts/highstock'
// import  Indicators from 'highcharts/indicators/indicators'
//  import  Regression from 'highcharts/indicators/regressions'
 import jStat from 'jStat'
 import moment from 'moment'
 function regression(arrWeight, arrHeight) {
   let r, sy, sx, b, a, meanX, meanY;
   r = jStat.corrcoeff(arrHeight, arrWeight);
   sy = jStat.stdev(arrWeight);
   sx = jStat.stdev(arrHeight);
   meanY = jStat(arrWeight).mean();
   meanX = jStat(arrHeight).mean();
   b = r * (sy / sx);
   a = meanY - meanX * b;
   //Set up a line
   let y1, y2, x1, x2;
   x1 = jStat.min(arrHeight);
   x2 = jStat.max(arrHeight);
   y1 = a + b * x1;
   y2 = a + b * x2;
   return {
     line: [
       [x1, y1],
       [x2, y2]
     ],
     r
   };
}
if (typeof Highcharts === 'object') {
    HighchartsExporting(Highcharts)
    HighchartsMore(Highcharts) // init module
    Stock(Highcharts)
    Data(Highcharts)
   Accessibility(Highcharts)
   // Highstock(Highcharts)
   // for regression
//    Indicators(Highcharts)
//    Regression(Highcharts)
}
Highcharts.Pointer.prototype.reset = function () {
  return undefined;
};
export default {
  name: 'tioGraph',
  components: {
    CompassRose
  },
  props: {
    dates: {
      type: Array,
      default: () => []
    },
    nsValues: {
      type: Array,
      default: () => []
    },
    ewValues: {
      type: Array,
      default: () => []
    },
    magnValues: {
      type: Array,
      default: () => []
    },
    keys: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 180
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
  data () {
    return {
      quality: {},
      graphs: {},
      position: {lat: null, lng: null},
      point: {ns: 0, ew: 0},
      hasValues: false,
      colors:{
        ew: '#F00',
        ns: '#00F',
        magn: '#006400'
      }
    }
  },
  watch: {
//     ptValues (newvalues) {
//       console.log('newvalues')
//       this.draw(newvalues)
//     }
    nsValues (newvalues) {
      console.log('ns change')
      this.draw('ns', newvalues)
    },
    ewValues (newvalues) {
      console.log('ew change')
      this.draw('ew', newvalues)
    },
    magnValues (newvalues) {
      console.log('magn change')
      this.draw('magn', newvalues)
    }
  },
  created () {
    this.$i18n.locale = this.lang
  },
  methods: {
    highlight (e, type) {
//    if (!this.graphs[type]) {
//      this.tooltip = false
//      return
//    }
     // console.log(e)
      var chart,
        point,
        i,
        event;
      var _this = this
      if (!this.graphs[type]) {
        return false
      }
      event = this.graphs[type].pointer.normalize(e);
      var point = this.graphs[type].series[0].searchPoint(event, true);
      if (!point) {
        return
      }        
      for (var key in this.graphs) {
        var chart = this.graphs[key];
        if (chart && typeof chart !== 'undefined') {
          chart.xAxis[0].removePlotLine('highlight')
          chart.xAxis[0].addPlotLine({
           color: '#999999',
           value:  point.x,
           width: 1,
           id: 'highlight'
         })
        }
      }    
    },
//     draw (type, values) {
//       console.log(values)
//       // remove old graphs
//       this.drawOne(type, values)
//       this.drawOne('ns', values.ns)
//       this.drawOne('magn', values.magn)
//       ['EW', 'NS', 'MAGN'].forEach(function (key) {
//         console.log(key)
//         console.log(_this.graphs)
// //         if (_this.graphs[key]) {
// //           _this.graphs[key].destroy()
// //           _this.graphs[key] = null
// //         }
//       })
     
//       ['EW', 'NS', 'MAGN'].forEach(function (key) {
//         if (values[key]) {
//          _this.drawOne(key, values[key])
//         }
//       })
 //   },
    draw (type, tab) {

      // remove graph if exists
      if (this.graphs[type]) {
        this.graphs[type].destroy()
        this.graphs[type] = null
      }
//       var tab = this[type]
//       if (!tab || !tab[row] || !tab[row][col]) {
//         return false
//       }
//       tab = tab[row][col]
      this.position.lat = tab[0]
      this.position.lng = tab[1]
      this.position.height = tab[2]
      var index = this.keys.findIndex(tb => tb === 'velocity')
      this.point[type] = tab[index]
      index = this.keys.findIndex(tb => tb === 'quality')
      var quality = Math.round(tab[index] * 100) / 100
      this.quality[type] = quality
      if (tab[index] === 0) {
        console.log('Aucune valeur')
        this.hasValues = false
        return
      }
      this.hasValues = true
      tab = tab.slice(this.keys.length)
      console.log(tab)
      var data = []
    
      var min = null
      var max = null
      var delta = []
      var plotlines = []
      var regData = []
      var dates = []
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
           dates.push(date)
           regData.push(tab[n])
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
      var reg = regression(regData, dates)
      if (data.length === 0) {
        return
      }
      var _this = this
     // var chartIndex = Object.keys(this.graphs).findIndex(key => key === type)
      quality = Math.round(quality * 100) / 100
      var color = this.colors[type]
      var lightColor = this.$shadeColor(color, 0.4)
      this.graphs[type] = Highcharts.chart('graph_' + type, {
        chart: {
          zoomType: 'x'
        },
        title: 'Test',
        height: _this.height + 'px',
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
          formatter (e) {
            if (!this.point) {
              return false
            }
            var values = []
            for (var key in _this.graphs) {
              var chart = _this.graphs[key];
               if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + key.toUpperCase() + ': ' + pt.open + ' &pm; ' + _this.quality[key] + '</div>')
               }
               if (key !== type) {
                 chart.tooltip.hide();
               }
            }
            var s = '<b>' + moment.unix(this.point.x/ 1000).format('ll') + '</b><br />'
            return s + values.join('<br />')
          },
          shared: false
        },
        plotOptions: {},
        xAxis: {
           type: 'datetime',
           lineColor:'#666',
           events: {
//              setExtremes (e) {
//                _this.syncExtremes(e, type)
//              },
//              afterSetExtremes (e) {
//                _this.updateExtremes(e)
//              }
           },
           gridLineWidth: 0,
           plotLines: plotlines,
         },
         yAxis: {
             title: {
                 text: type.toUpperCase()
             },
             min: min,
             max: max,
             plotLines: [{
               value: 0,
               color: 'lightgrey',
               width: 2
             }]
         },
         series: [{
             name: type,
             color: color,
             type: 'ohlc',
             id: type,
             zIndex:10,
             data:data,
             lineWidth: 1
         }, {
           name: 'regression',
           color: color,
           data: reg.line,
           lineWidth: 1,
          // zIndex: -1,
           enableMouseTracking: false
         }   
      ]})
   },
  }
}
</script>
<style>
.graph-container {
    width:50%;
    margin-left:50%;
    min-height:600px;
    position:relative;
    border: 1px solid #ccc;
    border-radius: 0 0 5px 5px;
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
}
.graph-container .tio-element {
  font-color: darkgrey;
  font-size: 12px;
  display:inline-block;
  vertical-align:top;
  padding:0 10px;
}
.graph-container .tio-element  > div {
  margin-left:10px;
}
.graph-container .graph-infos {
   margin:0px;
   padding:0;
   font-size:0.9rem;
}
.graph-container .graph-header {
  background: #f3F3F3;
  position:relative;
  margin: 0 0 10px 0;
}
.graph-container .graph-infos label {
  font-weight:700;
}

.graph-container .graph-header h4 {
  margin:0;
  padding: 5px 10px 5px 5px;
}
.graph-container .graph-header .fa.fa-close {
  display:block;
  float:right;
  margin: 3px 5px;
  padding: 2px;
  border: 1px dotted #f3F3F3;
  cursor: pointer;
}
.graph-container .graph-header .fa.fa-close:hover {
  border-color: #333;
}
</style>