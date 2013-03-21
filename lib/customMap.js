//var startC =  428;	
//var startR =  195;	
//var startZoom =  9;	
var startC = 1; 
var startR = 1; 
var startZoom = 0; 

var startColumnCount = 1;
var startRowsCount = 1;

var BaseImagePath = "maptiles/";     //地图根目录 
 
var RegistedMapTypes = null;
var MapTypeConfig = { 
    tileSize: new google.maps.Size(256, 256),
    isPng: false,
    maxZoom:startZoom+4,
    minZoom:startZoom,
	defaultZoom:startZoom+1
    //radius: 111
	//projection：在这里设置无效。在生成的MapType对象中设置才有效。？
    //name: '混合图',//option
    //alt: '切换到混合图',
    // credit: 'MyGoogle'
};

function initMapTypes(Y){
	RegistedMapTypes = {};
	var mapList = Data.getMapTypeList();
	if(mapList){
		Y.each(mapList,function(o,i){
			var maptypeid = o.maptypeid;
			RegistedMapTypes[maptypeid] = Y.merge(MapTypeConfig,{
				getTileUrl: function(coord, zoom) { 
				 	var normalizedCoord = getNormalizedCoord(coord, zoom); 
					if (!normalizedCoord)   return null; 
					var xy = normalizedCoord; 
//					var xy = getTileCoord(normalizedCoord,zoom);  
//					if(xy.x<0||xy.y<0) return ''; 
		            return BaseImagePath + maptypeid+ "/" + (zoom-this.minZoom+1) + "/" +(xy.x )+'/'+ (zoom-this.minZoom+1)+'_'+( xy.x) + "_" + (xy.y )+ '.png';
			    }
			});  
		});
	}
	 
}

 
function getNormalizedCoord(coord, zoom) {
    var y = coord.y;
    var x = coord.x; 
    // tile range in one direction range is dependent on zoom level
    // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
    var tileRange = 1 << zoom;
 
    // don't repeat across y-axis (vertically)
    if (y < 0 || y >= tileRange) {
      return null;
    }
 	
	//不重复x axis
	var maxColumn = Math.pow(2,zoom);  
	if(x<0||x>=maxColumn) return null;//过滤重复图片
    // repeat across x-axis
	/*
    if (x < 0 || x >= tileRange) {
      x = (x % tileRange + tileRange) % tileRange;
    }
 	*/
    return {
      x: x,
      y: y
    };
} 

 

// 数据callback
function addEncodedGeometry(returnobj,geoType){
	if(!returnobj) alert('无数据返回');
	Y.each(returnobj,function(points,name){
		name = name=='null'?'':name;
		if(points&&points.length>0){
			for(var i=0;i<points.length;i++){
				var pointStr = points[i]; 
				var path = decodeCoordinates(pointStr);
				addGeometry(path,geoType,name);
			}
		} 
	});
}

function addNoEncodedGeometry(returnobj,geoType){
	if(!returnobj) alert('无数据返回');  
	Y.each(returnobj,function(points,name){
		if(points&&points.length>0){
			for(var i=0;i<points.length;i++){
				var pStr = points[i];
				var path = [];
				var unitPointstrArray = pStr.split(';');
				for(var k=0;k<unitPointstrArray.length;k++){
					var unitPointStr = unitPointstrArray[k];
					var pointArr = unitPointStr.split(',');
					var lat = pointArr[0];
					var lng = pointArr[1];
					path.push({
						lat:lat,
						lng:lng
					});
				}
				addGeometry(path,geoType,name);
			}
		}
	});
}

function addGeometry(path,geoType,name){
	if(geoType=='1'){ 
		mapwidget.addMarker({position:path[0],title:name});
	}else if(geoType=='2'){ 
		mapwidget.addPolyline({ path:path,title:name});
	}else {// if(geoType=='3'){
		mapwidget.addPolygon({ path:path,title:name});					
	}
}

 