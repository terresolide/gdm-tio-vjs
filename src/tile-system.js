import Vue from 'vue'
import VueResource from 'vue-resource';
Vue.use(VueResource)
export default {
  root: null,
  lines: 0,
  columns: 0,
  tabs: ['ns', 'ew', 'magn'],
  tiles: {},
  determinant: null,
  coordSystem: {
    origin: null,
    u: null,
    v: null
  },
  active: null,
  initialize (data) {
    this.computeCoordSystem(data)
  },
  initializeTile (tile, key, data) {
    if (!this.tiles[tile]) {
      this.tiles[tile] = {}
    }
    if (!this.tiles[tile][key]) {
      this.tiles[tile][key] = data.data
    }
    if (this.tiles[tile].ns && this.tiles[tile].ew && this.tiles[tile].magn) {
      this.tiles[tile].loaded = true
    }
  },
  load (dir) {
    this.dir = dir + '/'
    var _dir = this.dir
    return new Promise((successCallback, failureCallback) => {
      Vue.http.get(_dir + 'root.json')
      .then(resp => {
         this.initialize(resp.body)
         successCallback(resp.body)},
         resp => failureCallback(resp))
    })
  },
  loadTile (type, tile) {
    var _this = this
    return new Promise((successCallback, failureCallback) => {
      if (_this.tiles[tile] && _this.tiles[tile].loaded) {
        if (successCallback) {
          successCallback()
        }
        return true
      }
      Vue.http.get(_this.dir + type + '_displ_' +  tile + '.json')
        .then(resp => {
           _this.initializeTile(tile, type, resp.body)
           _this.tiles[tile].loaded = true
           if (successCallback) {
            successCallback()
           }
          })
          // return Vue.http.get(_this.dir + 'ew_displ_' +  tile + '.json')})
//        .then(resp1 => { 
//           _this.initializeTile(tile, 'ew', resp1.body)
//           return Vue.http.get(_this.dir + 'magn_displ_' +  tile + '.json')})
//        .then(resp2 => {
//          _this.initializeTile(tile, 'magn', resp2.body)
//          _this.tiles[tile].loaded = true
//          if (successCallback) {
//            successCallback()
//          }
//          
//         })
    })

    
  },
  changeFrame (lat, lng) {
    var line = (this.coordSystem.u.dLng * (lat - this.coordSystem.origin.lat) - this.coordSystem.u.dLat * (lng- this.coordSystem.origin.lng)) / this.determinant
    var col = (this.coordSystem.v.dLat * (lng- this.coordSystem.origin.lng) - this.coordSystem.v.dLng * (lat - this.coordSystem.origin.lat)) / this.determinant
    console.log('line = ', line)
    console.log('col = ', col)
    if (line > this.lines) {
      return false
    }
    if (col > this.columns ) {
      return false
    }
    var tile = {
      line: Math.floor(Math.round(line) / 100) + '',
      col: Math.floor(Math.round(col) / 100) + ''
    }
    tile = tile.line.padStart(3, '0') + '_' + tile.col.padStart(3, '0')
    
    return {tile: tile, line: Math.round(line) % 100, col: Math.round(col) % 100}
  },
  searchData (type, lat, lng) {
    var pos = this.changeFrame(lat, lng)
    
    var _this = this
//    return new Promise((successCallback, failureCallback) => {
//      if (!pos) {
//        if (successCallback) {
//           successCallback(false)
//        }
//        return false
//      }
//      if (_this.tiles[pos.tile] && _this.tiles[pos.tile].loaded) {
//        console.log(_this.tiles[pos.tile])
//        if (successCallback) {
//          successCallback( {
//            'ew': _this.tiles[pos.tile]['ew'][pos.line][pos.col],
//            'ns': _this.tiles[pos.tile]['ns'][pos.line][pos.col],
//            'magn': _this.tiles[pos.tile]['magn'][pos.line][pos.col]
//           })
//        }
 //     } else {
//        var callback = function () {
//          return _this.searchData(lat, lng, successCallback, failureCallback)
//        }
      
      return  this.loadTile(type, pos.tile).then(
             resp => {return {
               values: this.tiles[pos.tile][type][pos.line][pos.col],
//               'ns': this.tiles[pos.tile]['ns'][pos.line][pos.col],
//               'magn': this.tiles[pos.tile]['magn'][pos.line][pos.col]
              }}
        )
//      }
//    }).then(resp => {
//      console.log('last step')
//      if (_this.tiles[pos.tile] && _this.tiles[pos.tile].loaded) {
//        if (successCallback) {
//        successCallback( {
//          'ew': _this.tiles[pos.tile]['ew'][pos.line][pos.col],
//          'ns': _this.tiles[pos.tile]['ns'][pos.line][pos.col],
//          'magn': _this.tiles[pos.tile]['magn'][pos.line][pos.col]
//         })
//        }
//        return {
//            'ew': _this.tiles[pos.tile]['ew'][pos.line][pos.col],
//            'ns': _this.tiles[pos.tile]['ns'][pos.line][pos.col],
//            'magn': _this.tiles[pos.tile]['magn'][pos.line][pos.col]
//           }
//       }
//      return false
//    })
  },
  computeCoordSystem (data) {
      this.lines = data.properties.nb_lines
      this.columns = data.properties.nb_columns
      var lastLine = data.properties.nb_lines - 1
      var lastCol = data.properties.nb_columns - 1
      var pointTL = data.properties.pointTL
      var pointTR = data.properties.pointTR
      var pointBL = data.properties.pointBL
     // L.marker( [this.MAGN[0][0][0], this.MAGN[0][0][1]]).addTo(this.map)
      this.coordSystem.origin = {lat: pointTL[0], lng: pointTL[1]}
      // column
      this.coordSystem.u = {
        dLat: (pointTR[0] - pointTL[0]) / lastCol,
        dLng: (pointTR[1] - pointTL[1]) / lastCol
      }
      // line
      this.coordSystem.v = {
        dLat: (pointBL[0] - pointTL[0]) / lastLine,
        dLng: (pointBL[1] - pointTL[1]) / lastLine

      }
      this.determinant = this.coordSystem.u.dLng * this.coordSystem.v.dLat - this.coordSystem.u.dLat * this.coordSystem.v.dLng
      // test 
      // line 12 colone 46
//      var lat = this.coordSystem.origin.lat + 46 * this.coordSystem.u.dLat + 12 * this.coordSystem.v.dLat
//      var lng = this.coordSystem.origin.lng + 46 * this.coordSystem.u.dLng + 12 * this.coordSystem.v.dLng
//      L.marker([lat, lng]).addTo(this.map)
//      L.circle([this.MAGN[12][46][0], this.MAGN[12][46][1]], {weight:1, radius: 5, color: 'red'}).addTo(this.map)
//       L.marker([this.MAGN[lastLine][0][0], this.MAGN[lastLine][0][1]]).addTo(this.map)
      
//       L.marker([this.MAGN[0][lastCol][0], this.MAGN[0][lastCol][1]]).addTo(this.map)
//       L.marker([this.MAGN[lastLine][lastCol][0], this.MAGN[lastLine][lastCol][1]]).addTo(this.map)
      console.log(this.coordSystem)
  }
}