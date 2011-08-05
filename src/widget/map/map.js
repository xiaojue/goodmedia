/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110805
 * google map api 接口实现地理定位
 */
(function(W,G){
	
	var map=function(cg){
		
		if(!cg) return;
				
		var _cg={
			key:'ABQIAAAAq1Xa--vGn1SHR7koD9Xm5BTH1Hm64R_rmx_EQUiffvQevaq2UBRrPuG81MSPhtwwqbqzLlB64UAGyw', //默认key
			q:'',
			markerhtml:'',
			target:'',
			width:400,
			height:400
		};
		
		$.extend(_cg,cg);
		
		this.digit=new Date().valueOf();
		this.apiuri='http://maps.google.com/maps/geo?q='+encodeURI(_cg.q)+
				   '&output=json&callback=GM.widget.map.callback'+this.digit+'&oe=utf8\&sensor=false&key='+_cg.key;
		this.q=_cg.q;
		this.markerhtml=_cg.markerhtml;
		this.target=_cg.target;
		this.width=_cg.width;
		this.height=_cg.height;
		
	};
	
	map.prototype={
		init:function(){
			var that=this;
			$.getScript(that.apiuri,that.drawmap);
			GM.widget.map['callback'+that.digit]=function(data){
				if(data.Status.code==200){
					console.log(data)
					/*placemark是一个数组，可能查出多个地址，以第一个地址为准*/
					var coord=data.Placemark[0].Point.coordinates,
						name=data.name,
						target=document.getElementById(that.target);
						
        				if(google){
	        				geocoder = new google.maps.Geocoder();
						    var latlng = new google.maps.LatLng(coord[1],coord[0]); //首次加载定义的中心点
						    var myOptions = {
						        zoom:12,
						        center:latlng,
						        mapTypeId: google.maps.MapTypeId.ROADMAP
						      };
						    map=new google.maps.Map(target,myOptions);//载入地图
						    
						    var marker = new google.maps.Marker({
						    	 title:name,     
       							 position: latlng,         
      						 	 map: map
      						});
      						    
      						var infowindow = new google.maps.InfoWindow({
							    content:that.markerhtml
							});

						    google.maps.event.addListener(marker,'click', function () {
						    	infowindow.open(map,marker);
				            });
				            
	        				target.style.cssText+='width:'+that.width+'px;height:'+that.height+'px;' //设置高宽
					    }
					 
				}else{
					alert('地图初始化失败,搜索地区不存在');	
				}
			}
		}
	};
	
	if(G && G.widget) G.widget.map=map;
	
})(window,GM);