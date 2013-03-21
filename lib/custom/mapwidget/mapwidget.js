//todo需要详细学习widget及widgt的htmlparse等
//记录下widget加载css的配置方式
YUI({
	modules: {  
			'KBox':{
				fullpath:'lib/custom/kbox.js',
				requires:['node','event','dump','overlay','dd-plugin','anim','plugin']
			}
        }
     }).add('mapwidget',function(Y){
	Node = Y.Node;
	Lang = Y.Lang;
	G = google.maps;
	Y.MapWidget = Y.Base.create("mapwidget", Y.Widget, [Y.WidgetStdMod],{  
		
		renderUI:function(){   
			this._renderHeaderBorder();
			this._renderLeftBorder(); 
			this._renderToolbar();
			this._renderBodyMap();  
			this._renderFooter(); 
			//test
			//this.get('boundingBox').setStyle('border','2px solid yellow');//class：yui3-widget yui3-mapwidget
			//this.get('contentBox').setStyle('border','2px solid green');	//class:yui3-mapwidget-content 。。。
			//this.getStdModNode('body').setStyle('border','2px solid red')  //class:yui3-widget-bd 
			//alert(this.get('headerContent'));//设置setStdModContent('header',)
		},
		bindUI:function(){
			//this.after('heightChange',function(e){ });
			var me = this;
			Y.after('resize',function(e){ 
				var h = me.get('boundingBox').getStyle('height'); 
				me.set('height',h);
				me.refreshSize();
			},Y.config.win);
		}, 
		syncUI:function(){
			
		},
		/*renderUI*/
		//top修饰样式
		_renderHeaderBorder:function(){
			var filterWrapper = Node.create('<div class="dsh"></div>');
			var filterdiv = '<div class="h1 {opacityClass}"></div>'; 
			for(var i=1;i<6;i++){
				var div = Node.create(Y.substitute(filterdiv,{
					opacityClass:'o'+i
				}));   
			 filterWrapper.appendChild(div);				
			} 
			this.get('boundingBox').appendChild(filterWrapper); 
			
		}, 
		//left修饰样式
		_renderLeftBorder:function(){ 
			var filterWrapper = Node.create('<div class="dsw"></div>');
			var filterdiv = '<div class="w1 {opacityClass}"></div>'; 
			for(var i=5;i>0;i--){
				var div = Node.create(Y.substitute(filterdiv,{
					opacityClass:'o'+i
				}));  
				div.setStyles({
					'position':'absolute',
					'width':i+'px',
					'float':'left'
				}); 
			 filterWrapper.appendChild(div);				
			} 
			this.get('boundingBox').appendChild(filterWrapper);
		},
		_renderToolbar:function(){
			//地图工具箱|放大|缩小|量距|测面积|全屏|分析
			var toolbarNode = Node.create('<div id="maptoolbar"></div>');
		 		
//			this._addForwardViewCmd(toolbarNode);
//			this._addBackViewCmd(toolbarNode);
//			this._addClearOverlyrCmd(toolbarNode);
//			this._addFullMapCmd(toolbarNode);
//			this._addIdentifyTool(toolbarNode);
			this._addMeasureAreaTool(toolbarNode);
			this._addMeasureDistanceTool(toolbarNode);
//			this._addPanTool(toolbarNode);
//			this._addZoomOutTool(toolbarNode);
//			this._addZoomInTool(toolbarNode);
			this._addSearchControl(toolbarNode); 
			this.setStdModContent('header',toolbarNode); 
		},
		_renderBodyMap:function(){   
			//var mapNode =  Y.one('#map'); 
			//this.setStdModContent('body',mapNode);
		 	var mapNode = this.get('bodyContent');
			var mapdiv = Node.getDOMNode(mapNode);
			 
			if (!G.Map) return;
			 
			this.mapTypeIds = [];
		    var myOptions = {
				zoom: 1,
				disableDoubleClickZoom:true,
				center: this.get('defaultCenter'),
				scaleControl: true, 
				scaleControlOptions: {
				  position: G.ControlPosition.BOTTOM_LEFT
				},
				/*
				mapTypeId: G.MapTypeId.ROADMAP,
				mapTypeControlOptions:{
					mapTypeIds:[
						G.MapTypeId.ROADMAP, G.MapTypeId.TERRAIN
					],
					style:G.MapTypeControlStyle.DEFAULT
			  	},
				*/ 
				mapTypeControl:false,
				mapTypeControlOptions: {mapTypeIds: this.mapTypeIds},
				panControl:false
		    }
			//定义maps相关属性（同时使用了ATTRS， 需要用get('map')获取 ） 
		    var map = new G.Map(mapdiv, myOptions);
			this.map = map; 
			var registedMapTypes = this.get('mapTypes');
			if(registedMapTypes){  
				this._addMapType(registedMapTypes);
			}
			this._createCreditControl(); 
			Y.on('unload',function(){  
				GUnload();
			},Y.config.win);  
			//去掉 使用条款 链接
			setTimeout(function(){
				var a = mapNode.getElementsByTagName('a');
				a.each(function(h){
					Y.Node.getDOMNode(h).href = '';
					//if(h.get('text')=='使用条款') h.set('text',''); 
					//h.remove(); 
					//var temp = Y.Node.create('<span>'); h.prepend(temp); temp.unwrap();
				});
			},1000);
			//切换地图类型事件
			var me = this;
            G.event.addListener(this.map, 'maptypeid_changed', function(){
				me.removeAllOverLayer(); 
			});
			//地图显示范围设定
			var bounds = this.getCustomBounds();
			G.event.addListener(this.map,'dragend',function(){
				if (bounds.contains(me.map.getCenter())) return; 
			    var c = me.map.getCenter(),  
			    x = c.lng(),  
			    y = c.lat(),  
			    maxX = bounds.getNorthEast().lng(),  
			    maxY = bounds.getNorthEast().lat(),  
			    minX = bounds.getSouthWest().lng(),  
			    minY = bounds.getSouthWest().lat();  
			    if (x < minX) x = minX;  
			    if (x > maxX) x = maxX;  
			    if (y < minY) y = minY;  
			    if (y > maxY) y = maxY;  
			    me.map.setCenter(new G.LatLng(y, x)); 
			});
		},
		_renderFooter:function(){
			//var footerPanel =  Node.create('<div>sdfds</div>');  
			//this.setStdModContent('footer',footerPanel);
		},
		/*end renderUI*/
		
		/*map function*/
		//resize
		refreshSize:function(){
			G.event.trigger(this.map, 'resize');			
		},
		/*
		 * 外部调用添加MapType方法，会将添加的MapType同时添加进属性 ‘mapTypes’
		 */
		addMapType:function(typeObj){
			var registedMapTypes = this.get('mapTypes');
			//检测是否存在，是：从集合中删除。
			var me = this;
			Y.each(typeObj,function(v,k){
				if(registedMapTypes[k]) {
					delete typeObj[k];
				}
			});
			this._addMapType(typeObj);
		},
		/*
		 * 内部调用，初始化添加MapType，单个或多个；
		 */
		_addMapType:function(typeObj){
			var addMapTypes  = typeObj; 
			//重投影 
			var customZone = this.get('customZone');
			var start_lat = customZone.startLat;
			var end_lat = customZone.endLat;
			var start_lng = customZone.startLng;
			var end_lng = customZone.endLng;
			var offset_x = end_lng-start_lng;
			var offset_y = end_lat-start_lat; 
			Y.each(addMapTypes,function(v,k){ 
				var tilesize_x = v.tileSize.width;
				var tilesize_y = v.tileSize.height;
				var maptype = new G.ImageMapType(v);
				maptype.projection = {//直接设置才生效
					fromLatLngToPoint:function(latlng,point){
						var x = (latlng.lng()-start_lng)*tilesize_x/offset_x;
						var y = (end_lat-latlng.lat())*tilesize_y/offset_y; 
						return new G.Point(x,y);
					},
					fromPointToLatLng:function(point,nowrap){
						var lat = end_lat-(point.y*offset_y/tilesize_y);
						var lng = start_lng+(point.x*offset_x/tilesize_x);
						return new G.LatLng(lat,lng);
					}
				};  
				this.map.mapTypes.set(k, maptype); 
				this.mapTypeIds.push(k);
			},this);
			
		},
		_createCreditControl:function(text){ 
			//设置版权信息栏
	        var creditNode = Y.Node.create('<div>');  
			creditNode.setStyles({
				'color':'#000',
				'fontSize':'12px',
				'fontFamily':'Arial, sans-serif',
				'margin':'0 2px 2px 0',
				'whitespace':'nowrap'
			}); 
			 //添加版权栏
            this.map.controls[G.ControlPosition.BOTTOM_RIGHT].push(Y.Node.getDOMNode(creditNode));
			this.creditNode = creditNode;
			this.setCreditContent(text);
		},
		setCreditContent:function(text){ 
			if(text) this.creditNode.set('innerHTML',text);
		},
		setMapType:function(type){  
			if(Y.Array.indexOf(this.mapTypeIds,type)>=0){
				this.map.setMapTypeId(type);
				var registedMapTypes = this.get('mapTypes');
				var defaultZoom = registedMapTypes[type].defaultZoom;
				if(defaultZoom) this.map.setZoom(defaultZoom); 
				this.map.setCenter(this.get('defaultCenter'));
				//版权信息 
				var text = registedMapTypes[type].credit; 
				this.setCreditContent(text);
			}else{
				alert('未注册该图层');
			}
		},
		getMapTypeId:function(){
			return this.map.getMapTypeId();
		},
		//获取自定义区域的LatLngBounds
		getCustomBounds:function(){
			var customZone = this.get('customZone');
			var sw = new G.LatLng(customZone.startLat,customZone.startLng);
			var ne = new G.LatLng(customZone.endLat,customZone.endLng);
			return new G.LatLngBounds(sw,ne);
		},
		/**
		 * 显示信息框
		 * @param {Object} content
		 * @param {Object} loc {overlayerObj,loc}
		 */
		showInfoWindow:function(content,loc){
			this._createInfoWindow();
			if(Lang.isString(content)){
				content =  Node.getDOMNode(Node.create('<div>'+content+'</div>'));
			}else{
				content = Node.getDOMNode(content);
			} 
			this.infoWindow.setContent(content);
			if(loc.overlayerObj) this.infoWindow.open(this.map,loc.overlayerObj);
			else if(loc.coord){
				this.infoWindow.open(this.map);
				this.infoWindow.setPosition(loc.coord); 
			}
		},
		_createInfoWindow:function(){
			if(!this.infoWindow){
				var infoWindow = new G.InfoWindow(); 
				this.infoWindow = infoWindow;
			}
			return this.infoWindow;
		},
		_closeInfoWindow:function(){
			if(this.infoWindow){ 
				this.infoWindow.close();
			}
		},
		/**
		 * 添加marker(icon)并返回;
		 * @param {Object} config
		 * position:{ lat:38.92, lng:121.57 },//或者 []
			icon:'images/map/beachflag.png',
			iconSize:[20,32],
			iconAnchor:[0,32],
			shadow:'images/map/beachflag_shadow.png',
			shadowSize:[37,32],
			shadowAnchor:[0,32], 
			title:'',
			zIndex:2
		 * @param {boolean} [draggable] 
		 */
		addMarker:function(config,draggable){ 
			if(!this.markerContainer){
				this.markerContainer = {};
			}
			var position ;
			if(config.position.constructor == Array){ 
				position = new G.LatLng(config.position[0],config.position[1]);
			}else{
				position = new G.LatLng(config.position.lat,config.position.lng);
			}
			if(config.icon){
				var icon = new G.MarkerImage(config.icon);
				if(config.iconSize) icon.size = new G.Size(config.iconSize[0],config.iconSize[1]);
				if(config.iconAnchor) icon.anchor = new G.Point(config.iconAnchor[0],config.iconAnchor[1]);
				config.icon = icon;
			}else{ //defalut icon
				var icon = new G.MarkerImage("mapfiles/markers/custom/marker_large_red.png");
				icon.size = new G.Size(20,34); icon.anchor = new G.Point(10,34);
				config.icon = icon;
			}
			if(config.shadow){
				var shadow = new G.MarkerImage(config.shadow);
				if(config.shadowSize) shadow.size = new G.Size(config.shadowSize[0],config.shadowSize[1]);
				if(config.shadowAnchor) shadow.anchor = new G.Point(config.shadowAnchor[0],config.shadowAnchor[1]);
				config.shadow = shadow;
			}else{// default shadow
				var shadow = new G.MarkerImage("mapfiles/markers/custom/shadow.png");
				shadow.size = new G.Size(37,34); shadow.anchor = new G.Point(10,34);
				config.shadow = shadow;
			}
			var size = config.icon.size;
			var gOptions = Y.mix(config,{
				map:this.map,
		        draggable:draggable,
				shape:{
					coords:[0,0,size.width,size.height],
					type:'rect'
				},
		        //animation: google.maps.Animation.DROP,
				position:position
				},true) ; 
			var id = Y.guid('marker_');
			var marker = new G.Marker(gOptions); 
			marker.name = config.title;
			this.registeOverLayerEvent(config.title,marker);
			marker.id = id;
			this.markerContainer[id] = marker;
			return marker; 
		},
		removeMarker:function(marker){
			if(marker instanceof G.Marker){
				 marker.setMap(null);
				 if(marker.id) delete this.markerContainer[marker.id];
			}
		},
		/**
		 * 添加线段
		 * @param {Object} cfg
		 * path:array[{lat,lng}],
		 * ?color
		 * ?opacity
		 * ?weight,
		 * ?title,
		 * ?@param editable {boolean} todo：如果true，增加可编辑的marker点
		 * 
		 */
		addPolyline:function(cfg,editable){
			if(!this.polylineContainer){
				this.polylineContainer = {};
			}
			var path = []; 
			Y.each(cfg.path,function(p){ 
				path.push(new G.LatLng(p.lat,p.lng));
			});   
			var id = Y.guid('polyline_'); 
			var polyline = new G.Polyline({
				map: this.map, 
				path:path,
				strokeColor: cfg.color||'#ff0000', 
				strokeOpacity: cfg.opacity||0.3, 
				strokeWeight: cfg.weight||4
			});
			polyline.name = cfg.title;
			this.registeOverLayerEvent(cfg.title,polyline); 
			polyline.id = id; 
			this.polylineContainer[id] = polyline;
			//dragend event todo
			return polyline;
		},
		removePolyline:function(polyline){
			if(polyline.constructor == G.Polyline){
				 polyline.setMap(null);
				 if(polyline.id) delete this.polylineContainer[polyline.id];
			}
		},
		/**
		 * 添加多边形
		 * @param {Object} cfg
		 * path:array[{lat,lng}],
		 * ?strokeColor
		 * ?opacity
		 * ?weight
		 * ?fillColor
		 * ?title,
		 * ?@param editable {boolean} todo：如果true，增加可编辑的marker点
		 * 
		 */
		addPolygon:function(cfg,editable){
			if(!this.polygonContainer){
				this.polygonContainer = {};
			}
			var path = []; 
			Y.each(cfg.path,function(p){
				path.push(new G.LatLng(p.lat,p.lng));
			});   
			var id = Y.guid('polygon_'); 
			var polygon = new G.Polygon({
				map: this.map, 
				path:path,
				strokeColor: cfg.strokeColor||'#ff0000', 
				strokeOpacity: cfg.opacity||0.8, 
				strokeWeight: cfg.weight||1,
				fillColor: cfg.fillColor||'#00ff00'
			});
			polygon.name = cfg.title;
			this.registeOverLayerEvent(cfg.title,polygon); 
			polygon.id = id;
			this.polygonContainer[id] = polygon;
			//dragend event todo
			return polygon;
		},
		removePolygon:function(polygon){
			if(polygon.constructor == G.Polygon){
				 polygon.setMap(null);
				 if(polygon.id) delete this.polygonContainer[polygon.id];
			}
		},
		/**
		 * 移除所有点线面叠加对象
		 */
		removeAllOverLayer:function(){
			Y.each(this.markerContainer,function(marker,id,container){
				marker.setMap(null);
				delete container[id];
			});
			Y.each(this.polylineContainer,function(line,id,container){
				line.setMap(null);
				delete container[id];
			});
			Y.each(this.polygonContainer,function(polygon,id,container){
				polygon.setMap(null);
				delete container[id];
			}); 
			this.markerContainer = null;
			this.polylineContainer = null;
			this.polygonContainer = null;
			this._closeInfoWindow();
		},
		registeOverLayerEvent:function(title,overlayerObj){ 
			var title = title||'';
			var me = this; 
			var isMarker = false;
			var isPolyline = false;
			if (overlayerObj instanceof G.Marker) {
				isMarker = true;
			}
			if (overlayerObj instanceof G.Polyline) {
				isPolyline = true;
			}
			//点线面点击打开信息窗口
			G.event.addListener(overlayerObj, 'click', function(){
				if(isMarker){
					me.showInfoWindow(title,{overlayerObj:overlayerObj});
					return;
				}
				var center = overlayerObj.getCenterLatLng(); 
				var info = title;
				if(isPolyline){ 
					info+='<br>长度:'+overlayerObj.getLength().toFixed(2)+'米';
				} else {
					info+='<br>面积:'+overlayerObj.getArea().toFixed(2)+'平方公里';
				}
				me.showInfoWindow(info,{coord:center});
			});
			if(overlayerObj instanceof G.Polygon){
				G.event.addListener(overlayerObj, 'mouseover', function(){
					overlayerObj.setOptions({fillOpacity:0.9});
				});
				G.event.addListener(overlayerObj, 'mouseout', function(){
					overlayerObj.setOptions({fillOpacity:0.3});
				});
			}
			if(overlayerObj instanceof G.Polyline){
				G.event.addListener(overlayerObj, 'mouseover', function(){
					overlayerObj.setOptions({strokeOpacity:0.9});
				});
				G.event.addListener(overlayerObj, 'mouseout', function(){
					overlayerObj.setOptions({strokeOpacity:0.3});
				});
			}
		},
		_getSearchResult:function(keyname){  
			var resultGeometries = [];
			if(this.markerContainer){
				Y.each(this.markerContainer,function(value,key){
					if(value.name&&value.name.indexOf(keyname)>-1){
						resultGeometries.push(value);
					}
				});
			}else if(this.polylineContainer){
				Y.each(this.polylineContainer,function(value,key){
					if(value.name&&value.name.indexOf(keyname)>-1){
						resultGeometries.push(value);
					}
				});
			}else if(this.polygonContainer){ 
				Y.each(this.polygonContainer,function(value,key){ 
					if(value.name&&value.name.indexOf(keyname)>-1){
						resultGeometries.push(value);
					}
				});
			}
			Y.each(resultGeometries,function(geo,i){
				G.event.trigger(geo, 'click');
			});
			return resultGeometries;
		}, 
		/*end map function*/
		/*tool functions*/
		//属性 this.currentTool\this.tools=['zoomin','zoomout',....]
		_addZoomInTool:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/zoomin.png'; 
			var toolImgOver = 'assets/tools/zoomin3.png';
			var toolImgClicked = 'assets/tools/zoominX.png';
			var overImg = new Image(); overImg.src = toolImgOver;
			var clickImg = new Image(); clickImg.src = toolImgClicked;
			
			
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			imgNode.on('mouseover',function(e){ 
				this.setAttribute('src',overImg.src);				
			}); 
			imgNode.on('mouseout',function(e){ 
				this.setAttribute('src',toolImg);				
			});  
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>放大</div>'));
			
			container.append(toolContainer);
		},
		_addZoomOutTool:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/zoomout.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>缩小</div>'));
			
			container.append(toolContainer);
		},
		_addPanTool:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/pan.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>平移</div>'));
			
			container.append(toolContainer);
		},
		_addMeasureDistanceTool:function(container){ 
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 
			var toolImg = 'assets/tools/measure.png'; 
			var toolImgOver = 'assets/tools/measure3.png';
			if(Y.UA.ie){
				toolImg = 'assets/tools/measure.gif'; 
			    toolImgOver = 'assets/tools/measure3.gif';
			}
			var overImg = new Image(); overImg.src = toolImgOver;

			//var toolImgClicked = 'assets/tools/measureX.png';
			//var clickImg = new Image(); clickImg.src = toolImgClicked;
			
			
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			imgNode.setAttribute('title','点击左键增加测量点，双击左键结束测量。');
			imgNode.on('mouseover',function(e){ 
				this.setAttribute('src',overImg.src);				
			}); 
			imgNode.on('mouseout',function(e){ 
				this.setAttribute('src',toolImg);				
			});  
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>测距</div>'));
			
			container.append(toolContainer);
			
			var mapwidget = this;
			imgNode.on('click',function(e){ 
				var startFlag = false;
				var moveFlag = false;
				var measureLatlng = [];
				mapwidget.currTool = 'measure'; 
				var polyOptions = {
				  clickable:false,
			      strokeColor: 'red',
			      strokeOpacity: 0.6,
			      strokeWeight: 3
			    }
			    var measurePolyline = new G.Polyline(polyOptions);
			    measurePolyline.setMap(mapwidget.map);  
				 
				var clickListener = G.event.addListener(mapwidget.map, 'click', function(e){
					if(!startFlag){
						startFlag = true;
						measureLatlng = [];
					}
					moveFlag = false;
					measureLatlng.push(e.latLng);
					measurePolyline.setPath(measureLatlng);
					//measurePolyline.getPath().push(e.latLng); 
				});
				var moveListener = G.event.addListener(mapwidget.map,'mousemove',function(e){
					if(!startFlag) return;
					//var pro = mapwidget.map.getProjection();
					//var point = pro.fromLatLngToPoint(e.latLng);  					
					if(!moveFlag){
						measureLatlng.push(e.latLng);
						moveFlag = true;
					}else{
						measureLatlng.pop();
						measureLatlng.push(e.latLng);
					}
					measurePolyline.setPath(measureLatlng);
				}); 
				G.event.addListener(mapwidget.map, 'dblclick', function(e){
					startFlag = false;
					if(mapwidget.currTool == 'measure'){
						G.event.removeListener(clickListener);
						G.event.clearListeners(mapwidget.map,'dblclick');
					}
					if(moveFlag){
						measureLatlng.pop();
						measurePolyline.setPath(measureLatlng);
					}
					Y.later(500,null,function(){
						var length = measurePolyline.getLength();
						alert('当前测量距离为:'+length+'米'); 
						measurePolyline.setMap(null);
						measurePolyline = null; 
					}); 
				});
			});
			
		},
		_addMeasureAreaTool:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 
			var toolImg = 'assets/tools/measure.png'; 
			var toolImgOver = 'assets/tools/measure3.png';
			if(Y.UA.ie){
				toolImg = 'assets/tools/measure.gif'; 
			    toolImgOver = 'assets/tools/measure3.gif';
			}
			var overImg = new Image(); overImg.src = toolImgOver;

			//var toolImgClicked = 'assets/tools/measureX.png';
			//var clickImg = new Image(); clickImg.src = toolImgClicked;
			
			
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			imgNode.setAttribute('title','点击左键增加测量点，双击左键结束测量。');
			imgNode.on('mouseover',function(e){ 
				this.setAttribute('src',overImg.src);				
			}); 
			imgNode.on('mouseout',function(e){ 
				this.setAttribute('src',toolImg);				
			});  
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>测面</div>'));
			
			container.append(toolContainer);
			
			var mapwidget = this;
			imgNode.on('click',function(e){ 
				var startFlag = false;
				var moveFlag = false;
				var measureLatlng = [];
				mapwidget.currTool = 'measure'; 
				var polyOptions = {
				  clickable:false,
			      strokeColor: 'red',
			      strokeOpacity: 0.6,
			      strokeWeight: 1,  
				  fillColor:'#00ff00'
			    }
			    var measurePolygon = new G.Polygon(polyOptions);
			    measurePolygon.setMap(mapwidget.map);  
				 
				var clickListener = G.event.addListener(mapwidget.map, 'click', function(e){
					if(!startFlag){
						startFlag = true;
						measureLatlng = [];
					}
					moveFlag = false;
					measureLatlng.push(e.latLng);
					measurePolygon.setPath(measureLatlng); 
				});
				var moveListener = G.event.addListener(mapwidget.map,'mousemove',function(e){
					if(!startFlag) return;   					
					if(!moveFlag){
						measureLatlng.push(e.latLng);
						moveFlag = true;
					}else{
						measureLatlng.pop();
						measureLatlng.push(e.latLng);
					}
					measurePolygon.setPath(measureLatlng);
				}); 
				G.event.addListener(mapwidget.map, 'dblclick', function(e){
					startFlag = false;
					if(mapwidget.currTool == 'measure'){
						G.event.removeListener(clickListener);
						G.event.clearListeners(mapwidget.map,'dblclick'); 
					}
					if(moveFlag){
						measureLatlng.pop();
						measurePolygon.setPath(measureLatlng);
					}
					Y.later(500,null,function(){
						var area = measurePolygon.getArea();
						alert('当前测量面积为:'+area.toFixed(4)+'平方公里'); 
						measurePolygon.setMap(null);
						measurePolygon = null; 
					});
				});
			});
			
		},
		_addFullMapCmd:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/full.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>全图</div>'));
			
			container.append(toolContainer);
		},
		_addBackViewCmd:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/back.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>前视图</div>'));
			
			container.append(toolContainer);
		},
		_addForwardViewCmd:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/forward.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>后视图</div>'));
			
			container.append(toolContainer);
		},
		_addClearOverlyrCmd:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/clear.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>清除</div>'));
			
			container.append(toolContainer);
		},
		 _addIdentifyTool:function(container){
			var toolContainer = Y.Node.create('<div class="tool-outer">'); 

			var toolImg = 'assets/tools/identify.png'; 
			var imgNode = Y.Node.create('<img src="'+toolImg+'">');
			toolContainer.append(imgNode);
			
			toolContainer.append(Y.Node.create('<div>信息</div>'));
			
			container.append(toolContainer);
		},
		_addSearchControl:function(container){
			var mapwidget = this;
			var toolContainer = Y.Node.create('<div class="tool-outer">');
			var input = Y.Node.create('<input type="text">'); 
			input.setStyles({
				backgroundColor:'#ccc',border:'none',height:'18px',width:'100px'
			});
			toolContainer.append(input);
			var btn = Y.Node.create('<input type="button" value="查询">');
			btn.on('click',function(e){
				var v = input.get('value');
				if(v){
					mapwidget._getSearchResult(v);
				}
			});
			toolContainer.append(btn);
			container.append(toolContainer); 
		},
		/*end tool functions*/
		/*events*/ 
		/*end events*/
		empty:function(){}
	},{
		ATTRS:{  
			map:{
				readOnly:true,
				getter:function(){
					return this.map;
				}
			},
			defaultCenter:{
				setter:function(v){
					return new G.LatLng(v.lat,v.lng);
				}
			},
			customZone:{
				setter:function(obj){
					return obj;
					//startLat,endLat,startLng,endLng
				}
			},
			mapTypes:{
				setter:function(obj){
					return obj;//hashMap key-string;value-{}
				}
			}
			//end
		}
	});
	
	
}, '3.3.0' ,{requires:['get','widget','substitute', 'widget-stdmod','dump','event-custom']});
