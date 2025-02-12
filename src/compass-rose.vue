<i18n>
{
  "en": {
     "displacement": "Displacement",
     "symbol_west": "W",
     "mean_velocity": "Mean Velocity",
     "meter_day": "m/day",
     "units": "Units"
   },
   "fr": {
    "displacement": "Déplacement",
     "symbol_west": "O",
     "mean_velocity": "Vitesse moyenne",
     "meter_day": "m/jour",
     "units": "Unités"
   }
}
</i18n>
<template>
<div> 
 <svg class="compass-rose" xmlns="http://www.w3.org/2000/svg" :style="{width: 2 * width + 'px', height: (height + 20) + 'px'}" :width="size.width" :height="size.height" :viewBox="'0 0 ' + size.width + ' ' + size.height">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
    refX="10" refY="3.5" orient="auto">
      <polygon points="2.5 3.5, 0 0, 10 3.5, 0 7" :fill="color"/>
    </marker>
     <marker id="arrowhead2" markerWidth="10" markerHeight="7" 
    refX="10" refY="3.5" orient="auto">
      <polygon points="2.5 3.5, 0 0, 10 3.5, 0 7" :fill="color2"/>
    </marker>
    <marker id="arrowAz" markerWidth="10" markerHeight="7" 
    refX="10" refY="3.5" orient="auto">
      <polygon points="2.5 3.5, 0 0, 10 3.5, 0 7" fill="#000"/>
    </marker>
    <marker id="hyphen" viewBox="0 0 0 10" refX="0" refY="5"
        markerWidth="6" markerHeight="6">
        
      <line x1="0" y1="0" x2="0" y2="10" :stroke="color" />
    </marker>
  </defs>
 <!--  <g>
   <rect x="0" y="0" height="219" width="230" stroke="transparent"  fill="transparent"/>
<image xlink:href="./assets/img/compass-rose.png" x="0" y="0" height="219" width="230"/>
</g>-->
<g >
   <circle :cx="center.x" :cy="center.y" :r="radius - 2" stroke="#000" stroke-width="2" fill="transparent" />
   <line :x1="center.x" :y1="center.y - radius" :x2="center.x" :y2="center.y + radius" stroke="#000"/>
   <line :x1="center.x - radius" :y1="center.y" :x2="center.x + radius" :y2="center.y" stroke="#000"/>
   <text class="card" :x="center.x" :y="center.y - radius - 5" text-anchor="middle">N</text>
   <text class="card" :x="center.x" :y="center.y + radius + 18" text-anchor="middle">S</text>
   <text class="card" :x="center.x - radius - 3" :y="center.y + 6" text-anchor="end" 
   style="">{{$t('symbol_west')}}</text>
   <text class="card" :x="center.x + radius + 3" :y="center.y + 6" text-anchor="start">E</text>
   <text  :x="center.x" :y="center.y + radius + 50" text-anchor="middle">{{dateStr}}</text>
</g>
 <template v-if="geometry">
  <g :transform="transform">
   <line :x1="center.x" :y1="center.y" :x2="center.x" :y2="center.y - radius" stroke="#000" stroke-width="2" marker-end="url(#arrowAz)"/>
   <line :x1="center.x" :y1="center.y" :x2="center.x + radius" :y2="center.y" stroke="#000" stroke-width="2" marker-end="url(#arrowAz)"/>
   <text class="card" :x="center.x" :y="center.y - radius - 5" text-anchor="middle">Az</text>
    <text class="card" :x="center.x + radius + 3" :y="center.y + 6" text-anchor="start">Rg</text>
    
  </g>
 </template>
<g :transform="transform">
 
  <line v-if="point" :x1="center.x" :y1="center.y" :x2="point.x" :y2="point.y" :stroke="color" 
  stroke-width="2" marker-end="url(#arrowhead)" />
    <line v-if="ptDate" :x1="center.x" :y1="center.y" :x2="ptDate.x" :y2="ptDate.y" :stroke="color2" 
  stroke-width="2" marker-end="url(#arrowhead2)" />
</g>
<g>
 <text  class="title" :x="size.width * 0.5" :y="size.height * 0.25 - 30" text-anchor="start">
   {{$t('units')}}
   </text>
</g>
<g transform="translate(0 50)">
   <text :fill="color" :x="size.width * 0.65 + radius / 2" :y="size.height * 0.25 - 40"
   :color="color" text-anchor="middle">
   {{$t('mean_velocity')}} 
   </text>
    <text :fill="color" :x="size.width * 0.65 + radius / 2" :y="size.height * 0.25 - 10" text-anchor="middle">
    {{velocityRef}} {{$t('meter_day')}}
   </text>
  <line :x1="size.width * 0.65" :x2="size.width * 0.65 + radius" :y1="size.height * 0.25" :y2="size.height * 0.25" :stroke="color" 
  stroke-width="2" marker-end="url(#arrowhead)"/>
  
  
 </g>
 <g transform="translate(0 70)">
   <text :fill="color2" :x="size.width * 0.65 + radius / 2" :y="size.height * 0.55 - 40"
   :color="color" text-anchor="middle">
    {{$t('displacement')}} 
   </text>
    <text :fill="color2" :x="size.width * 0.65 + radius / 2" :y="size.height * 0.55 - 10" text-anchor="middle">
    {{magnRef}} m
   </text>
 
  
   <line :x1="size.width * 0.65" :x2="size.width * 0.65 + radius" :y1="size.height * 0.55" :y2="size.height * 0.55" :stroke="color2" 
  stroke-width="2" marker-end="url(#arrowhead2)"/>
 </g>
 </svg>
</div>
</template>
<script>
export default {
  name: 'CompassRose',
  props: {
    lang: {
      type: String,
      default: 'en'
    },
    width: {
      type: Number,
      default: 150
    },
    height: {
      type: Number,
      default: 150
    },
    maxVelocity: {
      type: Number,
      default: 6
    },
    maxComp: {
      type: Number,
      default: 6
    },
    ns: {
      type: Number,
      default: 3
    },
    ew: {
      type: Number,
      default: 3
    },
    geometry: {
      type: Object,
      default: null
    },
    dateStr: {
      type: String,
      default: null
    },
    dateNs: {
      type: Number,
      default: null
    },
    dateEw: {
      type: Number,
      default: null
    },
    color: {
      type: String,
      default: '#f00'
    },
    color2: {
      type: String,
      default: '#0f0'
    }
  },
  data () {
    return {
      size: {
        width: 500,
        height: 250
      },
      center: {
        x: 125,
        y: 125
      },
      radius: 100
    }
  },
  computed: {
    point () {
      if (!this.velocityRef) {
        return null
      }
      var direction = 1
      if (this.geometry) {
        var direction = -1
      }
      var x = (-1) * direction * this.ew * this.radius / this.velocityRef + this.center.x
      var y = direction * this.ns * this.radius / this.velocityRef + this.center.y
      return {x: x, y: y}
    },
    ptDate () {
      if (this.dateEw && this.dateNs) {
        var direction = 1
        if (this.geometry) {
          var direction = -1
        }
        var x =  (-1) * direction * this.dateEw * this.radius / this.magnRef + this.center.x
        
        var y = direction * this.dateNs * this.radius / this.magnRef + this.center.y
        return {x: x, y: y}
      } else {
        return null
      }
    },
    transform () {
       var t = 'rotate(200, '+ this.center.x + ',' + this.center.y + ') '
       return t
    },
    magnRef () {
      var exp = Math.floor(Math.log10(this.maxComp))
      var n = Math.round(this.maxComp / Math.pow(10, exp))
      return n * Math.pow(10, exp)
    },
    velocityRef () {
      if (!this.maxVelocity) {
        return null
      }
      var exp = Math.floor(Math.log10(this.maxVelocity))
      var n = Math.round(this.maxVelocity / Math.pow(10, exp))
      var res = n * Math.pow(10, exp)
      if (exp < 0) {
        return res.toFixed(- exp)
      } else {
        return res
      }
    }
  },
  created () {
    this.center.x = this.size.width / 4
    this.center.y = this.size.height / 2
    this.$i18n.locale = this.lang
  }
}
</script>
<style>
svg.compass-rose text {
 font-size: 28px;
}
svg.compass-rose text.card {
 font-family: century-gothic, sans-serif;
 font-weight:700;
 font-size:18px;
}
svg.compass-rose text.title {
  font-weight:700;
  font-size: 28px;
  text-transform: uppercase;
}

</style>
