
//yui load
Y = YUI({
    combine: false,
	groups:{
		myCustom:{
			   base: 'lib/custom/',
            modules: { 
                'mapwidget': { 
                    path: 'mapwidget/mapwidget.js',
                    requires: ['widget','substitute', 'widget-stdmod','dump'],
                    skinnable: true
                },
   				'KBox':{
   					path:'kbox/kbox.js',
   					requires:['node','event','dump','overlay','dd-plugin','anim','plugin'],
   					skinnable:true
   				}
            }
		}
	}
	//, modules: {  'KBox':{ fullpath:'lib/custom/kbox/kbox.js', requires:['node','event','dump','overlay','dd-plugin','anim','plugin'] } }
}).use('node','event','event-delegate','substitute','mapwidget','KBox','transition','dump','get',function(Y){
	//全局变量区
	window.mapwidget = null;//定义全局mapwidget对象 
	//初始化
	Y.on('domready',function(){  
		initMapTypes(Y);    
		initMapWidget();  
		addFeatures();
	}) ;
	  
	 
});
 
 

//初始化地图控件
function initMapWidget() {   
	 window.mapwidget = new Y.MapWidget({
		boundingBox:'#mapContainer', 
		bodyContent:Y.one('#map'), 
		width:'100%',
		height:'100%',
		defaultCenter:{
			lat:38.9515656143285,lng:121.522006790115
		},
		customZone:{
			startLat:38.72673510697981,
			endLat:39.17639612167719,
			startLng:121.23290178540148,
			endLng:121.81111179482852
		},
		mapTypes:RegistedMapTypes
	}); 
	mapwidget.render(); 
	mapwidget.setMapType('lyld');  
	
	 
}

function addFeatures () {
	mapwidget.addMarker({position:[39.17639612167719, 121.23290178540148],title:'sdfsfs'}); ///
	mapwidget.addPolyline({
		path:[
		{lat:38.72673510697981,lng:121.23290178540148},
		{lat:39.17639612167719,lng:121.81111179482852}
		],
		title:'line'
	}); 
	mapwidget.addPolygon({
		path:[
			{lat:38.72673510697981,lng:121.23290178540148},
			{lat:39.17639612167719,lng:121.23290178540148},
			{lat:39.17639612167719,lng:121.61111179482852} 
		] 
	});
}
 


