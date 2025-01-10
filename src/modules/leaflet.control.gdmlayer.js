/**
 * L control tiles with given default tiles
 */
 /* eslint no-undef: 0 */


 L.Control.Gdmlayer = L.Control.Layers.extend({
   options: {
     position: 'topleft',
   },
   bbox: null,
   tiles: {
     osm: {
       name: 'OSM',
       url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
       attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
     },
     osmFr: {
       name: 'OSM France',
       url: '//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
       attribution: 'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>'
     },
     opentopomap: {
       name: 'OSM Topo',
       url: '//{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
       attribution: 'Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, <a href="http://viewfinderpanoramas.org">SRTM</a> | Kartendarstellung: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
     },
     arcgisTopo: {
       name: 'ArcGIS',
       url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
       attribution: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>'
     }
   },
   initialize: function ( baseLayers, overlays, options) {
     
     L.Control.Layers.prototype.initialize.call(this, baseLayers, overlays, options)
     // Default tiles allready in control
     for (var key in this.tiles) {
       var layer = L.tileLayer(this.tiles[key].url, {attribution: this.tiles[key].attribution})
       this.tiles[key].layer = layer
       this.addBaseLayer(layer, this.tiles[key].name)
     }
   },
   addBboxLayer () {
     return
     this.bbox = L.layerGroup()
     this.bbox.addTo(this._map)
     this.addOverlay(this.bbox, 'bbox', true)
   },
   setBboxLayer (bboxLayer) {
     return
     if (this.bbox) {
        this.bbox.clearLayers()
     } else {
        this.addBboxLayer()
     }
     if (bboxLayer) {
        this.bbox.addLayer(bboxLayer)
     }
   },
   removeBboxLayer () {
     return
     if (this.bbox) {
       this.bbox.clearLayers()
     }
   },
   /**
    * Overwrite _addItem to insert title before group of images
    * (single image or serie image)
    */
   _addItem: function (obj) {
       var container =  this._overlaysList ;
      if (obj.layer.first) {
        if (typeof obj.layer.first === 'object') {
          title = obj.layer.first.title
          var div = document.createElement('div')
          div.className = 'leaflet-control-layers-separator'
          container.appendChild(div)
        } else {
          title = obj.layer.first
        }
        // insert the title if there is a first attribute (containing title)
        var div = document.createElement('b')
        div.innerHTML = title
        this._overlaysList.appendChild(div)
      }
      if (obj.layer.images) {
          var div = document.createElement('div')
          var has = this._map.hasLayer(obj.layer)
          var _this = this
          obj.layer.images.forEach(function (img, index) {
            var label = document.createElement('label'),
            checked = has && obj.layer.indexImage === index,
            input;
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;
         
            _this._layerControlInputs.push(input);
            input.layerId = L.Util.stamp(obj.layer);
            input.index = index
    
            L.DomEvent.on(input, 'click', _this._onInputClick, _this);
    
            var name = document.createElement('span');
            name.innerHTML = ' ' + img.title;
    
            // Helps from preventing layer control flicker when checkboxes are disabled
            // https://github.com/Leaflet/Leaflet/issues/2771
            var holder = document.createElement('div');
    
            label.appendChild(holder);
            holder.appendChild(input);
            holder.appendChild(name);
            div.appendChild(label)
           
            container.appendChild(div);
  
            _this._checkDisabledLayers();
          })
         
          return div;
      } else {
        L.Control.Layers.prototype._addItem.call(this, obj)
      }
      if (obj.layer.last ) {
         var div = document.createElement('div')
         if (obj.layer.last.classname) {
           div.classList.add(obj.layer.last.classname)
         }
         if (obj.layer.last.funct) {
           div.style.textAlign = 'center'
           var input = document.createElement('input')
           input.setAttribute('type', 'button')
           input.setAttribute('value', obj.layer.last.name)
           if (obj.layer.last.title) {
             input.setAttribute('title', obj.layer.last.title)
           }
           input.addEventListener('click', function (e) {
             obj.layer.last.funct(e)
             e.stopPropagation()
           }, {once: true, useCapture: true})
            div.appendChild(input)
         } else {
           div.innerHTML = '<b>' + obj.layer.last.name + '</b>'
         }
        this._overlaysList.appendChild(div)
      }
   /*   if (obj.layer.last) {
         var div = document.createElement('input',obj.layer.last.name)
        div.setAttribute('type', 'button')
        div.setAttribute('value', obj.layer.last.title)
        div.style.textAlign = 'center'
        var _this = this
        div.addEventListener('click', obj.layer.last.funct)
        var container =  this._overlaysList 
        container.appendChild(div)
      } */
   },
   /**
    * Overwrite _onInputClick to remove the other layers (serie or image)
    * when add a layer with type (serie or image)
    */
   _onInputClick: function (e) {
     // get 'layerId' clicked and  if it is an exclusive layer (with type property)
    
     var layerId = e.target.layerId
     var layer = this._getLayer(layerId).layer
     var isExclusive = layer.hasOwnProperty('type')
     var inputs = this._layerControlInputs,
         input, layer;
     var addedLayers = [],
         removedLayers = [];
     this._handlingClick = true;

     for (var i = inputs.length - 1; i >= 0; i--) {
       input = inputs[i];
       layer = this._getLayer(input.layerId).layer;
       // case TIO change image url of layer, has property index of the image
       var isIndex = e.target.hasOwnProperty('index') ? e.target.index === input.index : true
       if (input.checked && isIndex && (input.layerId === layerId || !isExclusive)) {
         addedLayers.push(layer);
         if (e.target.hasOwnProperty('index')) {
           layer.setUrl(layer.images[e.target.index].png)
           layer.legend = layer.images[e.target.index].legend
           layer.indexImage = e.target.index
//           layer.images.forEach(function (image, index) {
//             if (index === e.target.index) {
//                image.checked = true
//             } else {
//                image.checked = false
//             }
//           })
           layer.checked = true
         }
//       } else if (!input.checked) {
//         removedLayers.push(layer);
       } else if (!input.checked || (layer.type && isExclusive)) {
         input.checked = false
         layer.checked = false
         removedLayers.push(layer);
       }
     }

     // Bugfix issue 2318: Should remove all old layers before readding new ones
     for (i = 0; i < removedLayers.length; i++) {
       if (this._map.hasLayer(removedLayers[i])) {
         this._map.removeLayer(removedLayers[i]);
       }
     }
     for (i = 0; i < addedLayers.length; i++) {
       if (!this._map.hasLayer(addedLayers[i])) {
         this._map.addLayer(addedLayers[i]);
       }
     }

     this._handlingClick = false;

     this._refocusOnMap();
   },
   /**
    * Overwrite method _update from leaflet/src/core/Control.layers
    * to use the local _addItem when update
    */
   _update: function () {
     if (!this._container) { return this; }

     L.DomUtil.empty(this._baseLayersList);
     L.DomUtil.empty(this._overlaysList);

     this._layerControlInputs = [];
     var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;

     for (i = 0; i < this._layers.length; i++) {
       obj = this._layers[i];
       this._addItem(obj);
       overlaysPresent = overlaysPresent || obj.overlay;
       baseLayersPresent = baseLayersPresent || !obj.overlay;
       baseLayersCount += !obj.overlay ? 1 : 0;
     }

     // Hide base layers section if there's only one layer.
     if (this.options.hideSingleBase) {
       baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
       this._baseLayersList.style.display = baseLayersPresent ? '' : 'none';
     }

     this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none';

     return this;
   }
 })
 module.exports = L.Control.Gdmlayer
