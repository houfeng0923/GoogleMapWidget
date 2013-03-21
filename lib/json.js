var contextPath = 'http://192.168.1.100:8080/GJZPlanSystem/';
var ServletName = 'GetLayerFeatures'; 
if(location.protocol.indexOf('http:')==0){
	contextPath = '/GJZPlanSystem/';
}

var Data = {};

Data.maptypeTemplate = '<li><a href="#"><span maptypeid="{maptypeid}">{maptypename}</span><button class="btn-arrow">打开</button></a></li>';


Data.getMapTypeList = function(){
	return Data.maptypeList;
}
//数组，过滤key，过滤key的值 
Data.getMapTypeDescAndLayerInfo = function(maptypeid){
	var obj = Data.maptypeDesc[maptypeid];
	var returnValue = {};
	if(obj){
		returnValue.desc = obj.desc;
	}else{
		returnValue.desc = '';
	}
	//todo  layerinfo
	var lyrObj = Data.maptypeLayerInfo[maptypeid];
	returnValue.lyrObj = lyrObj;
	return returnValue;
}

//temp data

Data.maptypeList = [
	{'maptypeid':'basic','maptypename':'甘井子区域图'},
	{'maptypeid':'gnqh','maptypename':'功能区划图'},
	{'maptypeid':'axdw','maptypename':'岸线定位图'},
	{'maptypeid':'dlgh','maptypename':'道路规划图'},
	{'maptypeid':'dljs','maptypename':'道路建设项目图'},
	{'maptypeid':'dianlgh','maptypename':'电力规划图'},
	{'maptypeid':'psgh','maptypename':'排水规划图'},
	{'maptypeid':'grfq','maptypename':'供热分区图'},
	{'maptypeid':'stbh','maptypename':'生态保护图'},
	{'maptypeid':'lyld','maptypename':'林园绿地图'},
	{'maptypeid':'dlll','maptypename':'道路绿廊图'},
	{'maptypeid':'hlll','maptypename':'河流绿廊图'},
	{'maptypeid':'kszl','maptypename':'矿山治理图'},
	{'maptypeid':'swqbj','maptypename':'商务区布局图'},
	{'maptypeid':'syj','maptypename':'商业街示意图'},
	{'maptypeid':'wlfx','maptypename':'物流分销总装加工布局图'},
	{'maptypeid':'sxgc','maptypename':'"三新工程"规划图'}
];
 




















