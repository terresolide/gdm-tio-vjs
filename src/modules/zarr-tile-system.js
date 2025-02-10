/**
 * Manage TIO tiles
 */
import Vue from 'vue'
import VueResource from 'vue-resource';
import {Buffer} from 'buffer'; // <-
import {Blosc} from 'numcodecs'

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
  nb_dates: 0,
  tileLines: 0,
  tileCols: 0,
  tileDates: 0, // <-
  tile: {
    lines: 0,
    columns: 0,
    nb_dates: 0, // <-
  },
  url: {
    ew: null,
    ns: null
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
  xsize: 0, // <-
  ysize: 0, // <-
  zsize: 0, // <-
  zsize_block: 0, // <-
  ysize_block: 0, // <-
  xsize_block: 0, // <-
  item_size: 4, // <-
  block_size: 0, // <-
  nb_block_xsize: 0, // <-
  nb_block_ysize: 0, // <-
  nb_block_zsize: 0, // <-
  /**
   * Initialize coordinates system
   * with geojson
   * @see
  */
  initialize (data) {
    this.extractTileUrl(data)
    this.computeCoordSystem(data)
    // this.loadAll(0, 0)
  },
  extractTileUrl (data) { // <-
    console.log(data)
    this.url.ew = data.properties.ew
    this.url.ns = data.properties.ns
  },
  // initializeTile (tile, key, data) {
  //   if (!this.tiles[tile]) {
  //     this.tiles[tile] = {}
  //   }
  //   if (!this.tiles[tile][key]) {
  //     this.tiles[tile][key] = data.data
  //   }
  //  // this.searchValidPoints(tile, key)
  //   if (!this.tiles[tile].loaded && this.tiles[tile].ns && this.tiles[tile].ew ) {
  //     this.tiles[tile].loaded = true
  //     this.searchValidPoints(tile, 'ns')
  //   }
  // },
//   searchValidPoints (tile, key) {
//     var points = []
//     // var points13 = []
//     this.tiles[tile][key].forEach(function (line, index0) {
//       line.forEach(function (col, index) {
//         if (col[3] !== null) {
//          // if ((index0 + index) % 3 === 0) {
//             points.push({pt:[col[0], col[1]], value: col[3]})
//         //  }
// //          else {
// //            points13.push({pt:[col[0], col[1]], value:col[66]})
// //          }
//         }
//       })
//     })
//     if (this.parent && this.images.length === 0) {
//       this.parent.addMarkers(points)
//     }
//   },
  load (root, parent) {
    console.log('load = ' + root)
    this.parent = parent
    this._root = root
    var part = root.split('/')
    part.pop()
    var dir = part.join('/')
    this.dir = dir + '/'
    var _dir = this.dir
    return new Promise((successCallback, failureCallback) => {
      Vue.http.get(root)
      .then(resp => {
         this.initialize(resp.body)
         successCallback(resp.body)},
         resp => failureCallback(resp))
    })
  },
  loadAll () { // <-
    for (let i_xblock=0; i_xblock<nb_block_xsize; i_xblock++) {
      for (let i_yblock=0; i_yblock<nb_block_ysize; i_yblock++) {
        this.loadTile(i_xblock, i_yblock)
      }
    }
  },
  allocateTile() { // <-
    let data = [];
    for (let y = 0; y < this.ysize_block; y++) {
      let slice = [];
      for (let x = 0; x < this.xsize_block; x++) {
        let row = [];
        for (let z = 0; z < this.zsize; z++) {
          row.push(0.0);
        }
        slice.push(row);
      }
      data.push(slice);
    }
    console.log(data)
    return data;
  },
  async loadZarrData(url) { // <-
    // retourne le arrayBuffer du bloc Zarr lu depuis le S3
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur de téléchargement du fichier Zarr');
    }
    return response.arrayBuffer();
  },
  async uncompressBlock(block) { // <-
  // decompresse le bloc avec Blosc (npm install numcodecs) et retourne un arrayBuffer
    const compressed = Buffer.from(block);
    // Paramètres de décompression (à lire dans root.json ou a laisser comme ça en dur : c'est le défaut et je ne compte pas le changer)
    const codec = Blosc.fromConfig({ clevel: 5, cname: 'lz4', shuffle: Blosc.SHUFFLE, blocksize: 0 });
    const uncompressed = await codec.decode(compressed);
    return uncompressed.buffer;
  },
  parseBlock(arrayBuffer, direction, i_xblock, i_yblock, i_zblock) { // <-
    // lit le bloc reçu puis décompressé (en ZYX) et l'écrit dans le bon ordre (YXZ) dans tiles
    const tile_index = i_yblock + '.' + i_xblock
    const tile_data = this.tiles[tile_index][direction]

    const view = new DataView(arrayBuffer);
   
    const z_offset = i_zblock * this.zsize_block;
    const y_offset = i_yblock * this.ysize_block;
    const x_offset = i_xblock * this.xsize_block;

    let width = 0;
    if (i_xblock == (this.nb_block_xsize-1)) {
      width = this.xsize - x_offset;
    } else {
      width = this.xsize_block;
    }
    let height = 0;
    if (i_yblock == (this.nb_block_ysize-1)) {
      height = this.ysize - y_offset;
    } else {
      height = this.ysize_block;
    }
    let depth = 0;
    if (i_zblock == (this.nb_block_zsize-1)) {
      depth = this.zsize - z_offset;
    } else {
      depth = this.zsize_block;
    }
   
    // load block in tile_data (YXZ order)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          const offset = (z*this.ysize_block*this.xsize_block+y*this.xsize_block+x)*this.item_size;
          // le true est pour lire en little endian (big endian par defaut)
          // -> a noter que l'info de l'endianness est dans le root.json ('<f4' < pour little endian, f pour float et 4 pour item_size), mais OSEF de le mettre en dur parce que ça ne risque pas de changer ...
          tile_data[y][x][z+z_offset] = view.getFloat32(offset, true);
        }
      }
    }
  },
  sleep(ms) { // <-
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  loadTile (i_xblock, i_yblock) { // <-
    const tile_index = i_yblock + '.' + i_xblock
    var self = this
    return new Promise((successCallback, failureCallback) => {
      // if (tile === false) {
      //   if (failureCallback) {
      //     failureCallback()
      //   }
      //   return false
      // }
      if (self.tiles[tile_index] && self.tiles[tile_index].loaded) {
        if (successCallback) {
          successCallback()
        }
        return true
      }
      console.log('ici')
      console.log('et encore là')
      console.log(self.url.ew )
      if (!self.url.ew || !self.url.ns) {
        console.log('là')
        if (failureCallback) {
          failureCallback('MISSING INFORMATION')
        }
        return false
      }
      console.log(i_xblock)

      console.log('666 2 ---',self.xsize )
      console.log(i_yblock)
      
      console.log('666 2 ---',self.nb_block_ysize )
      // <--
      if (i_xblock >= self.nb_block_xsize || i_yblock >= self.nb_block_ysize || i_xblock < 0 || i_yblock < 0) {
        console.log('out of bounds')
        // out of bounds
        if (failureCallback) {
          failureCallback('OUT OF BOUNDS')
        }
        return false
        
      }
      console.log('777 2 ---',self.url.ew )
      console.log('--- idi ---')
      if (!self.tiles[tile_index]) {
        // first try to load -> init
         self.tiles[tile_index] = {}
      } else {
        // else check if it is already loaded
        if (self.tiles[tile_index].loaded) {
          console.log('déjà chargé')
          return;
        }
      }
      console.log('par là')
      let directions = [];
      directions[0] = 'ns';
      directions[1] = 'ew';
      const dl_promises = [2*self.nb_block_zsize];
      const decomp_promises = [2*self.nb_block_zsize];
      // itere sur ['ns', 'ew']
      for (let dir_index in directions) {
          const direction = directions[dir_index]
          console.log(direction)
          // alloue le tableau 3D pour la tuile courante (mis à zéro)
          self.tiles[tile_index][direction] = self.allocateTile()

          // requête tous les blocs en Z de la tuile courante
          for (let i_zblock=0; i_zblock<self.nb_block_zsize; i_zblock++) {
              const cube_index = i_zblock + '.' + i_yblock + '.' + i_xblock
              console.log(self.url[direction])
              const block_url = self.url[direction].baseurl + '/' + cube_index;
              
              console.log('block', cube_index, direction, '->', block_url);
              const _dir = direction
              dl_promises[dir_index*self.nb_block_zsize + i_zblock] = self.loadZarrData(block_url).then(
                  compressed_block => {
                      // decompresse le bloc téléchargé
                      decomp_promises[dir_index*self.nb_block_zsize + i_zblock] = self.uncompressBlock(compressed_block).then(
                          block => {
                              // remplit le tableau 3D de floats en YXZ dans tiles[tile_index][direction]
                              self.parseBlock(block, direction, i_xblock, i_yblock, i_zblock);
                              // retourne une promesse pour la synchro
                              return self.sleep(0)
                          }
                      )
                      return _dir + i_zblock;
                  }
              )
          }
      }
      Promise.all(dl_promises).then(
          block_addr => {
              // console.log(block_addr)
              // console.log("dl of tile",tile_index, "completed");
              Promise.all(decomp_promises).then(
                  sleep_proms => {
                      Promise.all(sleep_proms).then(
                          truc => {
                              // finalement enregistre que la tuile est bien chargée
                              self.tiles[tile_index].loaded = true
                              if (successCallback) {
                                successCallback()
                              }
                              return true
                          }
                      )
                  }
              )
          }
      )
    })
  },
  changeFrame (lat, lng) { // <-
    var line = (this.coordSystem.u.dLng * (lat - this.coordSystem.origin.lat) - this.coordSystem.u.dLat * (lng- this.coordSystem.origin.lng)) / this.determinant
    var col = (this.coordSystem.v.dLat * (lng- this.coordSystem.origin.lng) - this.coordSystem.v.dLng * (lat - this.coordSystem.origin.lat)) / this.determinant
    
    if (line > this.lines || line < 0) {
      return {tile: false}
    }
    if (col > this.columns || col < 0 ) {
      return {tile: false}
    }
    var tile = {
      line: Math.floor(Math.round(line) / this.tile.lines) + '',
      col: Math.floor(Math.round(col) / this.tile.columns) + ''
    }
    
   
    return {tile: tile, line: Math.round(line) % this.tile.lines, col: Math.round(col) % this.tile.columns}
  },
  searchData (type, lat, lng) { // <-
    var pos = this.changeFrame(lat, lng)
    var _this = this
     
    return  this.loadTile(pos.tile.col, pos.tile.line).then(
      resp => {
        var tile = pos.tile.line + '.' + pos.tile.col
        return {dimension: type, values: this.tiles[tile][type][pos.line][pos.col]}
      },
      resp => {return false}
    )
  },
  computeCoordSystem (data) { // <-
      this.lines = this.ysize = data.properties.nb_lines
      this.columns = this.xsize = data.properties.nb_columns
      this.nb_dates = this.zsize = data.properties.nb_dates
      if (data.properties.tile) {
        this.tile.lines = this.ysize_block = data.properties.tile.nb_lines
        this.tile.columns = this.xsize_block = data.properties.tile.nb_columns
        this.tile.nb_dates = this.zsize_block = data.properties.tile.nb_dates
        // this.item_size = data.properties.ew.zarr_infos.dtype.slice(-1)
        this.block_size = this.tile.lines * this.tile.columns * this.tile.nb_dates * this.item_size
      }
      if (data.properties.images) {
        this.images = data.properties.images
      }
      this.tileLines = Math.floor(this.lines / this.tile.lines)
      this.tileCols = Math.floor(this.columns / this.tile.columns)
      this.tileDates = Math.floor(this.nb_dates / this.tile.nb_dates)
      this.nb_block_ysize = Math.ceil(this.ysize / this.ysize_block)
      this.nb_block_xsize = Math.ceil(this.xsize / this.xsize_block)
      this.nb_block_zsize = Math.ceil(this.zsize / this.zsize_block)
      var lastLine = data.properties.nb_lines - 1
      var lastCol = data.properties.nb_columns - 1
      var pointTL = data.properties.pointTL
      var pointTR = data.properties.pointTR
      var pointBL = data.properties.pointBL
      this.coordSystem.origin = {lat: pointTL[1], lng: pointTL[0]}
      // column
      this.coordSystem.u = {
        dLat: (pointTR[1] - pointTL[1]) / lastCol,
        dLng: (pointTR[0] - pointTL[0]) / lastCol
      }
      // line
      this.coordSystem.v = {
        dLat: (pointBL[1] - pointTL[1]) / lastLine,
        dLng: (pointBL[0] - pointTL[0]) / lastLine

      }
      this.determinant = this.coordSystem.u.dLng * this.coordSystem.v.dLat - this.coordSystem.u.dLat * this.coordSystem.v.dLng
  }
}



