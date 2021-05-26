import Vue from 'vue'
import VueResource from 'vue-resource';
Vue.use(VueResource)
function later(delay) {
    return new Promise(function(resolve) {
        return setTimeout(resolve, delay);
    });
}
export default {
  root: null,
  lines: 0,
  columns: 0,
  tileLines: 0,
  tileCols: 0,
  tile: {
    lines: 100,
    columns: 100
  },
  tabs: ['ns', 'ew'],
  tiles: {},
  determinant: null,
  coordSystem: {
    origin: null,
    u: null,
    v: null
  },
  parent: null,
  active: null,
  images: [],
  initialize (data) {
    this.computeCoordSystem(data)
    this.loadAll(0, 0)
  },
  initializeTile (tile, key, data) {
    if (!this.tiles[tile]) {
      this.tiles[tile] = {}
    }
    if (!this.tiles[tile][key]) {
      this.tiles[tile][key] = data.data 
    }
   // this.searchValidPoints(tile, key)
    if (!this.tiles[tile].loaded && this.tiles[tile].ns && this.tiles[tile].ew ) {
      this.tiles[tile].loaded = true
      this.searchValidPoints(tile, 'ns')
    }
  },
  searchValidPoints (tile, key) {
    var points = []
    // var points13 = []
    this.tiles[tile][key].forEach(function (line, index0) {
      line.forEach(function (col, index) {
        if (col[3] !== null) {
         // if ((index0 + index) % 3 === 0) {
            points.push({pt:[col[0], col[1]], value:col[3]})
        //  } 
//          else {
//            points13.push({pt:[col[0], col[1]], value:col[66]})
//          }
        }
      })
    })
    if (this.parent && this.images.length === 0) {
      this.parent.addMarkers(points)
    }
  },
  load (dir, parent) {
    this.parent = parent
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
  loadAll (tileLine, tileColumn) {
    if (tileLine > this.tileLines) {
      return
    }
    var _this = this
    var tile = tileLine.toString().padStart(3, '0') + '_' + tileColumn.toString().padStart(3, '0')
    this.loadTile('ns', tile)
    .then(
        resp => {return _this.loadTile('ew', tile)}

       
//    ).then(
//        // end draw
//        resp => new Promise(resolve => { // <== create a promise here
//          setTimeout(function() {
//            _this.loadTile('magn', tile).then(resp => {resolve()})
//          }, 10)})
    ).then(
        resp => {
          var _tile = tile
          while (_this.tiles[_tile] && _this.tiles[_tile].loaded) {
             
            if (tileColumn < _this.tileCols) {
              tileColumn++
            } else {
              tileLine++
              tileColumn = 0
            }
            _tile = tileLine.toString().padStart(3, '0') + '_' + tileColumn.toString().padStart(3, '0')
          }
         
         // var next = function () {
            _this.loadAll(tileLine, tileColumn )
//          }
//          setTimeout(next, 0)
        }
    )
    
    // next step
    
    
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
           // _this.tiles[tile].loaded = true
           if (successCallback) {
            successCallback()
           }
        })
    })
  },
  changeFrame (lat, lng) {
    var line = (this.coordSystem.u.dLng * (lat - this.coordSystem.origin.lat) - this.coordSystem.u.dLat * (lng- this.coordSystem.origin.lng)) / this.determinant
    var col = (this.coordSystem.v.dLat * (lng- this.coordSystem.origin.lng) - this.coordSystem.v.dLng * (lat - this.coordSystem.origin.lat)) / this.determinant
    if (line > this.lines) {
      return false
    }
    if (col > this.columns ) {
      return false
    }
    var tile = {
      line: Math.floor(Math.round(line) / this.tile.lines) + '',
      col: Math.floor(Math.round(col) / this.tile.columns) + ''
    }
    tile = tile.line.padStart(3, '0') + '_' + tile.col.padStart(3, '0')
    
    return {tile: tile, line: Math.round(line) % this.tile.lines, col: Math.round(col) % this.tile.columns}
  },
  searchData (type, lat, lng) {
    var pos = this.changeFrame(lat, lng)
    var _this = this
      
    return  this.loadTile(type, pos.tile).then(
      resp => {return {values: this.tiles[pos.tile][type][pos.line][pos.col]}}
    )
  },
  computeCoordSystem (data) {
      this.lines = data.properties.nb_lines
      this.columns = data.properties.nb_columns
      if (data.properties.tile) {
        this.tile.lines = data.properties.tile.nb_lines
        this.tile.columns = data.properties.tile.nb_columns
      }
      if (data.properties.images) {
        this.images = data.properties.images
      }
      this.tileLines = Math.floor(this.lines / this.tile.lines)
      this.tileCols = Math.floor(this.columns / this.tile.columns)
      var lastLine = data.properties.nb_lines - 1
      var lastCol = data.properties.nb_columns - 1
      var pointTL = data.properties.pointTL
      var pointTR = data.properties.pointTR
      var pointBL = data.properties.pointBL
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
  }
}