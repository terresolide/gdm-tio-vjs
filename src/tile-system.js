import Vue from 'vue'
import VueResource from 'vue-resource';
Vue.use(VueResource)
export default {
  tiles: [],
  determinant: null,
  coordSystem: {
    origin: null,
    u: null,
    v: null
  },
  initialize (data) {
    this.computeCoordSystem(data)
    // read source
    // this.$http = http
  },
  load (source) {
    return new Promise((successCallback, failureCallback) => {
      Vue.http.get(source)
      .then(resp => {
         this.initialize(resp.body),
         successCallback(resp.body)},
         resp => failureCallback(resp))
    })
  },
  changeFrame (lat, lng) {
    var line = (this.coordSystem.u.dLng * (lat - this.coordSystem.origin.lat) - this.coordSystem.u.dLat * (lng- this.coordSystem.origin.lng)) / this.determinant
    var col = (this.coordSystem.v.dLat * (lng- this.coordSystem.origin.lng) - this.coordSystem.v.dLng * (lat - this.coordSystem.origin.lat)) / this.determinant
    return {line: Math.round(line), col: Math.round(col)}
  },
  computeCoordSystem (data) {
      var lastLine = data.properties.nb_lines - 1
      var lastCol = data.properties.nb_columns - 1
      var pointTL = data.properties.pointTL
      var pointTR = data.properties.pointTR
      var pointBL = data.properties.pointBL
     // L.marker( [this.MAGN[0][0][0], this.MAGN[0][0][1]]).addTo(this.map)
      this.coordSystem.origin = {lat: pointBL[0], lng: pointBL[1]}
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
      var lat = this.coordSystem.origin.lat + 46 * this.coordSystem.u.dLat + 12 * this.coordSystem.v.dLat
      var lng = this.coordSystem.origin.lng + 46 * this.coordSystem.u.dLng + 12 * this.coordSystem.v.dLng
//      L.marker([lat, lng]).addTo(this.map)
//      L.circle([this.MAGN[12][46][0], this.MAGN[12][46][1]], {weight:1, radius: 5, color: 'red'}).addTo(this.map)
//       L.marker([this.MAGN[lastLine][0][0], this.MAGN[lastLine][0][1]]).addTo(this.map)
      
//       L.marker([this.MAGN[0][lastCol][0], this.MAGN[0][lastCol][1]]).addTo(this.map)
//       L.marker([this.MAGN[lastLine][lastCol][0], this.MAGN[lastLine][lastCol][1]]).addTo(this.map)
      console.log(this.coordSystem)
  }
}