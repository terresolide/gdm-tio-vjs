/**
 * 
 */

 L.Control.Opacity = L.Control.extend({
    options: {
        position: 'topright',
    },
    _value: 0.5,
    _layers: [],
    _bbox: null,
    _lang: 'en',
    _hidden: true,
    _translate: {
      'en': {
        'opacity': 'Opacity'
      },
      'fr': {
        'opacity': 'Opacité'
      }
    },
    initialize: function(lang, value){
        this.setLang(lang)
        if (value) {
          this._value = value
        }
    },
    getValue() {
      return this._value
    },
    setLang (lang) {
      this._lang = (['en', 'fr'].indexOf(lang) >=0 ? lang : 'en')
    },
    setLayers (layers) {
      this._layers = layers
      
    },
    setVisible (visible) {
      if (visible) {
        this._container.classList.remove('hidden')
      } else {
        this._container.classList.add('hidden')
      }
    },
    setBbox (bbox) {
      this._bbox = bbox
      this._container.classList.remove('hidden')
    },
    onAdd : function(map){
        
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control lfh-control-opacity hidden');
        L.DomEvent.disableScrollPropagation(container)
        L.DomEvent.disableClickPropagation(container)
        var a = L.DomUtil.create('a', 'icon-progress')
        a.setAttribute('title', this._translate[this._lang]['opacity'])
        container.appendChild(a)
        var div = L.DomUtil.create('div')
        var label = L.DomUtil.create('strong')
        label.textContent = this._translate[this._lang]['opacity']
        div.appendChild(label)
       
        var input = L.DomUtil.create('input');
        input.setAttribute('type', 'range');
        input.setAttribute('name', 'opacity');
        input.setAttribute('min', 0);
        input.setAttribute('max', 1);
        input.setAttribute('step', 0.1);
        input.setAttribute('value', this._value);
        div.appendChild(input)
        container.appendChild(div);
        var _this = this
        L.DomEvent.on(input,'change', function (e) {
          _this._layers.forEach(function (layer) {
            layer.setOpacity(e.target.value)
          })
          if (_this._bbox) {
            _this._bbox.setStyle(function (feature) {
              return {fillOpacity: e.target.value}
            })
          }
          L.DomEvent.stopPropagation(e)
          L.DomEvent.preventDefault(e);
          return false
        })
         L.DomEvent.on(label, 'click', function (e) {
           _this._container.classList.remove('expand')
        })
        L.DomEvent.on(a, 'click', function (e) {
          _this._container.classList.add('expand')
        })
        return container;
    },
   
})

module.exports = L.Control.Legend