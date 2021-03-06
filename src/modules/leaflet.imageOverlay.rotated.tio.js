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

import TileSystem from './tile-system.js'


export default L.ImageOverlay.Rotated.extend({
  // includes: L.Mixin.Events,
  max: null,
  type: 'tio',
  dates: [],
  keys: [],
  images: [],
  searching: false,
  legend: null,
  _marker: null,
  _polygon: null,
  _root: null,
  _image: null,
  _map: null,
  _ready: false,
  _index: -1,
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
    TileSystem.load(this._root)
    .then( geojson => { _this.initView(geojson)} )
  },
  onAdd (map) {
    
    L.ImageOverlay.Rotated.prototype.onAdd.call(this, map);
    // TileSystem.loadAll(0, 0)
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
//  addTo (map)
//  {
//
//    this._map = map
//    if (this._image && this._map.hasLayer(this._image)) {
//      return
//    }
//    if (!this._image) {
//      return
//    }
//    console.log('add')
//    this._polygon.addTo(map)
//    this._map.fitBounds(this._polygon.getBounds())
//    this._image.addTo(map)
//    this._polygon.on('click', this.searchData)
//    
//  },
  searchData (e)
  {
    var _this = this
    this._marker.setLatLng(e.latlng)
    this.fire('TIO:RESET')
    this.fire('TIO:SEARCHING',{searching:true})
    TileSystem.searchData('ew', e.latlng.lat, e.latlng.lng)
    .then (resp => {
      _this.fire('TIO:SEARCHING', {searching:false})
      if (resp && resp.values && resp.values[3] !== null) {
        _this.fire('TIO:DATA', resp)
      } 
    })
    TileSystem.searchData('ns', e.latlng.lat, e.latlng.lng)
    .then(resp => {
      _this.fire('TIO:SEARCHING', {searching:false})
      if (resp && resp.values && resp.values[3] !== null) {
        _this.fire('TIO:DATA', resp)
      }
    })

  },
  initView (geojson)
  {
    this.max = Math.max(geojson.properties.percentile_90_ew, geojson.properties.percentile_90_ns)
    this.dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
    this.keys = geojson.properties.keys
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
    this.fire('TIO:READY')
  }
})
