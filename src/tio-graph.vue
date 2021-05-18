<template>
<div>
 <div style="width:50%;margin-left:50%;height:600px;position:relative;" >
      <div style="ming-height:150px;">--DIVERS INFOS---
       <div>@todo</div>
      </div>
      <div id="graphEW" style="height:220px;" @mousemove="highlight($event, 'EW')"></div>
      <div id="graphNS" style="height:220px;" @mousemove="highlight($event, 'NS')">N</div>
      <div id="graphMAGN" style="height:220px;" @mousemove="highlight($event, 'MAGN')">M</div>
      <div>-- the end --</div>
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
  props: {
    dates: {
      type: Array,
      default: () => []
    },
    ptValues: {
      type: Object,
      default: () => {}
    },
    keys: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      quality: {},
      graphs: {},
      colors:{
        EW: '#F00',
        NS: '#00F',
        MAGN: '#FF4500'
      }
    }
  },
  watch: {
    ptValues (newvalues) {
      console.log('newvalues')
      this.draw(newvalues)
    }
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
    draw (values) {
      console.log(values)
      // remove old graphs
      this.drawOne('EW', values.EW)
      this.drawOne('NS', values.NS)
      this.drawOne('MAGN', values.MAGN)
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
    },
    drawOne (type, tab) {
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
      var index = this.keys.findIndex(tb => tb === 'quality')
      var quality = tab[index]
      this.quality[type] = quality
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
          formatter (e) {
            if (!this.point) {
              return false
            }
            var values = []
            for (var key in _this.graphs) {
              var chart = _this.graphs[key];
               if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + key + ': ' + pt.open + ' &pm; ' + _this.quality[key] + '</div>')
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