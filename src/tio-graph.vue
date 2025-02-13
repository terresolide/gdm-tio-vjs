<i18n>
{ 
  "fr":  {
     "by_date": "By date",
     "height": "Hauteur",
     "plot_point": "Données du point sélectionné",
     "QUALITY": "QUALITÉ",
     "mean_velocity": "Vitesse moyenne"
  },
  "en": {
     "by_date": "Par date",
     "height": "Height",
     "plot_point": "Data of the selected point",
     "QUALITY": "QUALITY",
     "mean_velocity": "Mean velocity"
  }
}
</i18n>
<template>
 <div v-show="hasValues" class="graph-container" :style="{height: windowHeight + 'px'}">
      <div class="graph-header" style="height:30px;">
        <div class="fa fa-close" @click="$emit('close')"></div>
        <h4  @mousedown="movestart">{{$t('plot_point').toUpperCase()}}</h4>
      </div>
	    <div class="graph-infos"  style="overflow:auto;" :style="{height: (windowHeight - 30) + 'px'}">
	      <div style="display:flex;justify-content: space-between;cursor:move;" @mousedown="movestart" >
          <div class="tio-element" v-if="position.lat" >
          <label>POSITION</label>
          <div><label>Lat:</label> {{Math.round(position.lat * 1000) / 1000}}°</div>
          <div><label>Lng:</label> {{Math.round(position.lng * 1000) / 1000}}°</div>
          <div v-if="position.height"><label>{{$t('height')}}:</label> {{position.height.toLocaleString()}} m</div>
          </div>
          <div class="tio-element"  v-if="point.ns && point.ew && point.magn">
          <label>{{$t('mean_velocity').toUpperCase()}}</label>
          <div><label>NS:</label> {{point.ns.toLocaleString()}}</div>
          <div><label>EW:</label> {{point.ew.toLocaleString()}}</div>
          <div><label>MAGN:</label> {{point.magn.toLocaleString()}}</div>
          </div>
          <div class="tio-element" style="" v-if="quality.ns && quality.ew">
          <label>{{$t('QUALITY')}}</label>
          <div><label>NS:</label> {{quality.ns}}</div>
          <div><label>EW:</label> {{quality.ew}}</div>
          <div><label>MAGN:</label> {{quality.magn}}</div>
          </div>
          <div >
            <compass-rose :lang="lang" :width="100" :height="100"  :radar="img.radar" :max-velocity="point.magn" :max-comp="maxComp" :ns="point.ns" :ew="point.ew" :color="compassColors.mean"
            :color2="compassColors.date" :date-ns="pointDate.ns" :date-ew="pointDate.ew" :date-str="pointDate.date"></compass-rose>
          </div>
         <!--    <div class="tio-element" style="">
          <div :style="{color: compassColors.mean}"><label >&rarr;</label> {{$t('mean_velocity')}}</div>
          <div :style="{color:compassColors.date}"><label >&rarr;</label> {{ pointDate.date || $t('by_date')}}</div>
          </div> -->
          
        </div>
        <div id="graph_ns" :style="{height:height + 'px'}" @mousemove="highlight($event, 'ns')">
           <div class="my-spinner">
              <span class="fa fa-spinner fa-spin fa-2x fa-fw"></span>
           </div>
        </div>
        <div id="graph_ew" :style="{height:height + 'px'}" @mousemove="highlight($event, 'ew')">
            <div class="my-spinner">
              <span class="fa fa-spinner fa-spin fa-2x fa-fw"></span>
           </div>
        </div>
        <div id="graph_magn" :style="{height:height + 'px'}" @mousemove="highlight($event, 'magn')">
          <div class="my-spinner">
              <span class="fa fa-spinner fa-spin fa-2x fa-fw"></span>
           </div>
        </div>
     </div>
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
// function velocity(data) {
//   let div = []
//   for (var i=0; i < data.length - 1; i++) {
//     var v = (data[i+1][1] - data[i][1])  * 1000 * 3600 * 24 / (data[i+1][0] - data[i][0])
//     div.push(v)
//   }
//   return jStat.sum(div) / div.length
// }
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
    img: {
      type: Object,
      default: null
    },
    nsValues: {
      type: Array,
      default: () => []
    },
    ewValues: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 180
    },
    latlng: {
       type: Object,
       default: () => {return {lat: null, lng: null}}
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
      point: {ns: 0, ew: 0, magn: null},
      pointDate: {ns: null, ew: null, magn: null, date: null},
      hasValues: false,
      windowHeight: 700,
      windowResizeListener: null,
      compassColors: {
        mean: '#ff4500',
        date: '#b600b1'
      },
      magnValues: [],
      colors:{
        ns: 'blue',
        ew: '#f00',
        magn: '#006400'
      },
      mousemoveListener: null,
      mouseupListener: null,
      selected: false,
      delta: {x: 0, y:0},
      pos: {x:0, y:0},
      maxComp: null,
      maxVelocity: null
    }
  },
  watch: {
//     ptValues (newvalues) {
//       console.log('newvalues')
//       this.draw(newvalues)
//     }
    nsValues (newvalues) {
      this.pointDateInit()
      
      this.draw('ns', newvalues)
    },
    ewValues (newvalues) {
      this.pointDateInit()
      this.draw('ew', newvalues)
    },
    magnValues (newvalues) {
      this.pointDateInit()
      this.draw('magn', newvalues)
    },
    latlng (newvalues) {
      if (newvalues.lat && newvalues.lng) {
        this.position = newvalues
      }
    }
  },
  created () {
    this.position = this.latlng
    this.$i18n.locale = this.lang
    moment.locale(this.lang)
    this.windowResizeListener = this.initSize.bind(this)
    window.addEventListener('resize', this.windowResizeListener)
      this.mousemoveListener = this.move.bind(this)
    document.addEventListener('mousemove', this.mousemoveListener)
    this.mouseupListener = this.moveEnd.bind(this)
    document.addEventListener('mouseup', this.mouseupListener)
  },
  mounted () {
    this.initSize()
    
  },
  destroyed () {
    window.removeEventListener('resize', this.windowResizeListener)
    this.windowResizeListener = null
    document.removeEventListener('mousemove', this.mousemoveListener)
    this.mousemoveListener = null
    document.removeEventListener('mouseup', this.mouseupListener)
    this.mouseupListener = null
  },
  methods: {
    initSize () {
      this.windowHeight = Math.min(window.innerHeight * 0.95, 700)
      this.initPosition()
    },
    initPosition () {
      var left = (window.innerWidth - 700) / 2;
      var top = (window.innerHeight - this.windowHeight ) / 2;
      this.$el.style.left = left + 'px';
      this.$el.style.top = top + 'px';
      this.pos.x = left
      this.pos.y = this.$el.offsetTop
    },
    movestart (evt) {
      this.selected = true
      this.delta = {
          x: this.pos.x - this.$el.offsetLeft,
          y: this.pos.y - this.$el.offsetTop
      }
    },
    move (evt) {
      this.pos.x = evt.clientX
      this.pos.y = evt.clientY
      if (this.selected) {
        this.$el.style.left = (this.pos.x - this.delta.x) + 'px'
        this.$el.style.top = (this.pos.y - this.delta.y) + 'px'
      }
    },
    moveEnd () {
      this.selected = false
    },
    pointDateInit () {
      this.pointDate = {ns: null, ew: null, magn: null, date: null}
    },
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
      this.pointDate.date = moment.unix(point.x / 1000).format('ll')
      this.pointDate[type] = point.open || point.y
  
      for (var key in this.graphs) {
        var chart = this.graphs[key];
        if (chart && typeof chart !== 'undefined') {
          var pt = chart.series[0].points.find(el => el.x === point.x )
          if (pt !== undefined) {
           this.pointDate[key] = pt.open || pt.y
          }
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
    addSpinner (type) {
       var spinner = document.createElement('div')
       spinner.setAttribute('class', 'my-spinner')
       var content = document.createElement('span')
       content.setAttribute('class', 'fa fa-spinner fa-spin fa-2x fa-fw')
       spinner.appendChild(content)
       this.$el.querySelector('#graph_' + type).appendChild(spinner)
       
    },
    title (type) {
      if (!this.img.radar) {
        return type.toUpperCase()
      }
      switch(type) {
        case 'ns':
          return 'Az'
        case 'ew':
          return 'Rg'
        default:
          return 'Magn'
      }
    }, 
    drawZarr (type, tab) {
          // check if it's last data composante
      var comp2 = null
      // case type = ns or ew and the others is ok
      if (type === 'ns' && this.ewValues && this.ewValues.length > 1) {
        comp2 = this.ewValues
      }
      if (type === 'ew' && this.nsValues && this.nsValues.length > 1) {
        comp2 = this.nsValues
      }
      // remove graph if exists
      if (this.graphs[type]) {
        this.graphs[type].destroy()
        this.graphs[type] = null
        this.addSpinner(type)
      }
      var _this = this
      var data = []
      var min = null
      var max = null
      // var delta = []
      var plotlines = []
      var regData = []
      var dates = []
      this.img.dates.forEach (function (date, n) {
        if (comp2) {
          if (tab[n] !== null) {
            _this.magnValues[n] = Math.round(Math.sqrt(tab[n] * tab[n] + comp2[n] * comp2[n]) * 1000) / 1000
            if (_this.maxComp < _this.magnValues[n] && _this.magnValues[n] != Infinity) {
              _this.maxComp = _this.magnValues[n]
            }
          } else {
            _this.magnValues[n] = null
          }
        }
        
        if (!isNaN(tab[n]) && tab[n] !== null && tab[n] != Infinity) {
            data.push([
              date, 
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
      if (data.length === 0) {
        return
      }
      var reg = regression(regData, dates)

      var velo = (data[data.length -1][1] - data[0][1]) * 1000 * 3600 * 24 / ((data[data.length -1][0] - data[0][0]))
      this.point[type] = velo
      var color = this.colors[type]
      var lightColor = this.$shadeColor(color, 0.4)
      this.graphs[type] = Highcharts.chart('graph_' + type, {
        chart: {
          zoomType: 'x'
        },
        title: 'Test',
        width: '680px',
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
            for (var key in _this.colors) {
              var chart = _this.graphs[key];
              if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 if (pt !== undefined) {
                   _this.pointDate[key] = pt.open || pt.y
                   values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + _this.title(key) + ': ' + (Math.round(pt.y * 1000) / 1000) + '</div>')
                 }
               }
               if (key !== type && chart) {
                 chart.tooltip.hide();
               }
            }
            _this.pointDate.date = moment.unix(this.point.x/ 1000).format('ll')
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
             afterSetExtremes (e) {
               var xMin = e.min
               var xMax = e.max
               for(var key in _this.graphs) {
                 if (key !== type && _this.graphs[key]) {
                   _this.graphs[key].xAxis[0].setExtremes(xMin, xMax, true, false)
                 }
               }
             }
           },
           gridLineWidth: 0,
           plotLines: plotlines,
         },
         yAxis: {
             title: {
                 text: _this.title(type)
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
             type: 'line',
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
      if (comp2) {
        this.draw('magn', this.magnValues)
      }
    },
    draw (type, tab) {
      if (this.img.radar) {
         this.drawZarr(type, tab)
         return
      }
      // check if it's last data composante
      var comp2 = null
      // case type = ns or ew and the others is ok
      if (type === 'ns' && this.ewValues.length > 5) {
        comp2 = this.ewValues
      }
      if (type === 'ew' && this.nsValues.length > 5) {
        comp2 = this.nsValues
      }
      // remove graph if exists
      if (this.graphs[type]) {
        this.graphs[type].destroy()
        this.graphs[type] = null
        this.addSpinner(type)
      }
      this.position.lat = tab[0]
      this.position.lng = tab[1]
      this.position.height = tab[2]
      if (comp2) {
        this.magnValues[0] = tab[0]
        this.magnValues[1] = tab[1]
        this.magnValues[2] = tab[2]
      }
      var index = this.img.keys.findIndex(tb => tb === 'velocity')
      this.point[type] = tab[index]
      if (comp2) {
        this.magnValues[index] = Math.round(Math.sqrt(tab[index] * tab[index] + comp2[index] * comp2[index]) * 10000) / 10000
      }
      index = this.img.keys.findIndex(tb => tb === 'quality')
      var quality = Math.round(tab[index] * 100) / 100
      if (comp2) {
        this.magnValues[index] = Math.sqrt(tab[index] * tab[index] + comp2[index] * comp2[index])
      }
      this.quality[type] = quality
      if (!tab[index] || tab[index] === 0) {
        console.log('Aucune valeur')
        this.hasValues = false
        return
      }
      this.hasValues = true
      var begin = this.img.keys.length
      tab = tab.slice(this.img.keys.length)
      var data = []
      var min = null
      var max = null
      // var delta = []
      var plotlines = []
      var regData = []
      var dates = []
     
      // fill data
      var _this = this
     // this.maxComp = 0
      if (type !== 'magn') {
        // initialize the max in vector composant
        this.maxComp = null
      }
      this.img.dates.forEach (function (date, n) {
        if (comp2) {
          if (tab[n] !== null) {
            _this.magnValues[begin + n] = Math.round(Math.sqrt(tab[n] * tab[n] + comp2[begin + n] * comp2[begin + n]) * 1000) / 1000
            if (_this.maxComp < _this.magnValues[begin + n]) {
              _this.maxComp = _this.magnValues[begin + n]
            }
          } else {
            _this.magnValues[begin + n] = null
          }
        }
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
      if (data.length === 0) {
        return
      }
      var reg = regression(regData, dates)
      // var _this = this
     // var chartIndex = Object.keys(this.graphs).findIndex(key => key === type)
      quality = Math.round(quality * 100) / 100
      var color = this.colors[type]
      var lightColor = this.$shadeColor(color, 0.4)
      this.graphs[type] = Highcharts.chart('graph_' + type, {
        chart: {
          zoomType: 'x'
        },
        title: 'Test',
        width: '680px',
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
            for (var key in _this.colors) {
              var chart = _this.graphs[key];
              if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 if (pt !== undefined) {
                   _this.pointDate[key] = pt.open
                   values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + key.toUpperCase() + ': ' + pt.open + ' &pm; ' + _this.quality[key] + '</div>')
                 }
               }
               if (key !== type && chart) {
                 chart.tooltip.hide();
               }
            }
            _this.pointDate.date = moment.unix(this.point.x/ 1000).format('ll')
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
             afterSetExtremes (e) {
               var xMin = e.min
               var xMax = e.max
               for(var key in _this.graphs) {
                 if (key !== type && _this.graphs[key]) {
                   _this.graphs[key].xAxis[0].setExtremes(xMin, xMax, true, false)
                 }
               }
             }
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
      if (comp2) {
        this.draw('magn', this.magnValues)
      }
   },
  }
}
</script>
<style>
.graph-container {
    width:700px;
    height:auto;
    max-height:95%;
    position:fixed;
    top: calc(50% - 300px);
    left:calc(50% - 350px);
    border: 2px solid #888;
    border-radius: 0 0 5px 5px;
    background: white;
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
    z-index:11;
}
.my-spinner {
  display:block;
  text-align: center;
  vertical-align: middle;
  color: grey;
  height:100%;
  line-height: 150px;
}
.my-spinner > span {
  vertical-align: middle;
}
.graph-container .tio-element {
  font-color: darkgrey;
  font-size: 12px;
  /* display:inline-block;*/
  margin-top:20px;
  vertical-align:top;
  padding:0 5px;
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
  margin: 0;
}
.graph-container .graph-infos label {
  font-weight:700;
}

.graph-container .graph-header h4 {
  margin:0;
  padding: 5px 10px 5px 5px;
  cursor: move;
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