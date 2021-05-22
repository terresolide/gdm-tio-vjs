<i18n>
{
  "en": {
     "symbol_west": "W"
   },
   "fr": {
     "symbol_west": "O"
   }
}
</i18n>
<template>
<div> 
 <svg class="compass-rose" xmlns="http://www.w3.org/2000/svg" :style="{width: width + 'px', height: height + 'px'}" :width="size.width" :height="size.height" :viewBox="'0 0 ' + size.width + ' ' + size.height">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" 
    refX="2.5" refY="3.5" orient="auto">
      <polygon points="2.5 3.5, 0 0, 10 3.5, 0 7" :fill="color"/>
    </marker>
  </defs>
 <!--  <g>
   <rect x="0" y="0" height="219" width="230" stroke="transparent"  fill="transparent"/>
<image xlink:href="./assets/img/compass-rose.png" x="0" y="0" height="219" width="230"/>
</g>-->
<g>
   <circle :cx="center.x" :cy="center.y" :r="radius - 2" stroke="#000" stroke-width="2" fill="transparent" />
   <line :x1="center.x" :y1="center.y - radius" :x2="center.x" :y2="center.y + radius" stroke="#000"/>
   <line :x1="center.x - radius" :y1="center.y" :x2="center.x + radius" :y2="center.y" stroke="#000"/>
   <text :x="center.x" :y="center.y - radius - 5" text-anchor="middle">N</text>
   <text :x="center.x" :y="center.y + radius + 18" text-anchor="middle">S</text>
   <text :x="center.x - radius - 3" :y="center.y + 6" text-anchor="end" 
   style="">{{$t('symbol_west')}}</text>
   <text :x="center.x + radius + 3" :y="center.y + 6" text-anchor="start">E</text>
</g>
<g>
  <line :x1="center.x" :y1="center.y" :x2="point.x" :y2="point.y" :stroke="color" 
  stroke-width="2" marker-end="url(#arrowhead)" />
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
    max: {
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
    color: {
      type: String,
      default: '#f00'
    }
  },
  data () {
    return {
      size: {
        width: 250,
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
      console.log(this.ew)
      console.log('ns =', this.ns)
      var x = (-1) * this.ew * this.radius / this.max + this.center.x
      var y = this.ns * this.radius / this.max + this.center.y
      return {x: x, y: y}
    }
  },
  created () {
    this.center.x = this.size.width / 2
    this.center.y = this.size.height / 2
    this.$i18n.locale = this.lang
  }
}
</script>
<style>
svg.compass-rose text {
 font-family: century-gothic, sans-serif;
 font-weight:700;
 font-size:18px;
}
</style>