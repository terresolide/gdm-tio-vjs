/**
 * Reactive rotated image overlay
 * build from geojson @see exemples/root.json
 * on click return TIO values for the point (if exists)
 * @var string directory the tiles directory path
 */

require('leaflet-imageoverlay-rotated')
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})
import moment from 'moment'


import ZarrTileSystem  from './zarr-tile-system.js'
import TileSystem  from './tile-system.js'

export default L.ImageOverlay.Rotated.extend({
  // includes: L.Mixin.Events,
  max: null,
  type: 'tio',
  dates: [],
  keys: [],
  images: [],
  radar: null,
  searching: false,
  legend: null,
  _marker: null,
  _polygon: null,
  _root: null,
  _image: null,
  _map: null,
  _ready: false,
  _index: -1,
  _tileSystem: null,
  options: {
    opacity: 0.7
  },
  getIndex ()
  {
    if (this._index >= 0) {
      return this._index
    } else {
      return false
    }
  },
  initialize (root)
  {
    this._root = root
    var _this = this
    this._load(this._root)
  },
  _load(root) {
      // console.log('load = ' + root)
      // this.parent = parent
      this._root = root
      fetch(root)
      .then(resp => resp.json())
      .then(json => {
        this.initView(json)
        
      })
  },
  onAdd (map) {
    
    L.ImageOverlay.Rotated.prototype.onAdd.call(this, map);
    // ZarrTileSystem.loadAll(0, 0)
    this._marker = L.marker([0,0])
   
    this._marker.addTo(map)
    this._polygon.addTo(map)
    var _this = this
    this._marker.on('click', function (e) {
      _this.searchData(e)
    })
    this._polygon.on('click', function (e) {
      _this.searchData(e)
    })
    // this._map.fitBounds(this._polygon.getBounds())
  },
  onRemove (map) {
    this._polygon.off('click')
    this._polygon.remove()
    this._marker.off('click')
    this._marker.remove()
    this.fire('TIO:RESET')
    L.ImageOverlay.Rotated.prototype.onRemove.call(this, map);
  },
  isLoaded () {
    return this._ready
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  async searchData (e)
  {
    var _this = this
    this._marker.setLatLng(e.latlng)
    this.fire('TIO:RESET')
    this.fire('TIO:SEARCHING',{searching:true})
    await this.sleep(0);
    
    this._tileSystem.searchData('ew', e.latlng.lat, e.latlng.lng)
    .then (resp => {
      _this.fire('TIO:SEARCHING', {searching:false})
      if (resp && resp.values && resp.values[3] !== null) {
        resp.latlng = e.latlng
        _this.fire('TIO:DATA', resp)
      } 
    })
    this._tileSystem.searchData('ns', e.latlng.lat, e.latlng.lng)
    .then(resp => {
      _this.fire('TIO:SEARCHING', {searching:false})
      if (resp && resp.values && resp.values[3] !== null) {
        resp.latlng = e.latlng
        _this.fire('TIO:DATA', resp)
      }
    })

  },
  initView (geojson)
  {
    this.max = Math.max(geojson.properties.percentile_90_ew, geojson.properties.percentile_90_ns)
    this.dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
    
    this.images = geojson.properties.images
    this.legend = this.images[0].legend
    this._polygon = L.geoJSON(
        geojson,
       {style() {return {weight: 1, fillOpacity: 0.05, color:'blue'}}}
    )
    // add parent initialize
    L.ImageOverlay.Rotated.prototype.initialize.call(
        this,
        this.images[0].png,
        [geojson.properties.pointTL[1], geojson.properties.pointTL[0]], 
        [geojson.properties.pointTR[1], geojson.properties.pointTR[0]],
        [geojson.properties.pointBL[1], geojson.properties.pointBL[0]],
        {opacity: 0.5}
    )
    this._ready = true
    var _this = this
    if (geojson.properties.keys) {
      this.keys = geojson.properties.keys
      this._tileSystem = TileSystem
      // lazy load
      // import('./tile-system.js').then(ts => {
      //   _this._tileSystem = ts.default
      //   _this._tileSystem.initialize(geojson)
      //   _this.fire('TIO:READY')
      // })
    }  else {
      this.keys = []
      this.radar = {
        "az": geojson.properties.Az_angle,
        "rg": geojson.properties.Rg_angle
      }
      this._tileSystem = ZarrTileSystem

      // lazy load
      // import('./zarr-tile-system.js').then(ts => {
      //   _this._tileSystem = ts.default
      //   _this._tileSystem.initialize(geojson)
      // })
      
    }
    this._tileSystem.initialize(geojson)
    this.fire('TIO:READY')
  }
})
