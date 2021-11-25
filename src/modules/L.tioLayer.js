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

import TileSystem from './modules/tile-system.js'


L.TioLayer = L.ImageOverlay.Rotated.extend({
  // includes: L.Mixin.Events,
  _marker: null,
  _polygon: null,
  _max: null,
  _dates: [],
  _keys: [],
  _directory: null,
  options: {
    opacity: 0.7
  },
  initialize (directory)
  {
    this._directory = directory
    var _this = this
    TileSystem.load(directory)
    .then( geojson => { _this.initView(geojson)} )
  },
  onAdd (map)
  {
    this._map = map
    this._polygon.addTo(map)
    this._map.fitBounds(this._polygon.getBounds())
    
  },
  initView (geojson)
  {
    this._max = Math.max(geojson.properties.percentile_90_ew, geojson.properties.percentile_90_ns)
    this._dates = geojson.properties.dates.map(dt => moment( dt, 'YYYYMMDD').valueOf())
    this._keys = geojson.properties.keys
    this._polygon = L.geoJSON(
        geojson,
       {style() {return {weight: 1, fillOpacity: 0.05}}}
    )
    // add parent initialize
    L.ImageOverlay.Rotated.prototype.initialize.call(
        this,
        this._directory + '/' + geojson.properties.images[0].src,
        [geojson.properties.pointTL[1], geojson.properties.pointTL[0]], 
        [geojson.properties.pointTR[1], geojson.properties.pointTR[0]],
        [geojson.properties.pointBL[1], geojson.properties.pointBL[0]],
        {opacity: 0.5}
    )
  }
});

L.tioLayer = function (bounds, options) {
  return new L.TioLayer(bounds, options);
};
module.exports = L.tioLayer