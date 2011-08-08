/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110805
 * google map api 接口实现地理定位
 */
(function(W,G){
	
	var map=function(cg){
		
		if(!cg) return;
				
		var _cg={
			q:'',
			markerhtml:'',
			name:'',
			target:'',
			width:210,
			height:270,
			drag:false,
			bar:true,
			revise:false,
			center:null,
			siteNo:null
		};
		
		$.extend(_cg,cg);
		
		for(var i in _cg){
			this[i]=_cg[i];
		}
		
	};
	
	map.prototype={
		init:function(){
			
			var that=this,target=document.getElementById(that.target);
			
			//set wrap
			function setwrap(target){
				target.style.cssText+='width:'+that.width+'px;height:'+that.height+'px;border:1px solid #CCC;';
			};
			
			//error handler
			function error(target){
				target.parentNode.removeChild(target);
			};
			
			
			//bulid bar
			function bulidbar(target){
				if(that.bar){
					var revise='';
					if(that.revise) revise='<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_EditMap">修订坐标</a></li>';
					var bar='<ul style="margin: 5px 0pt;width:240px;padding:0px;">'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>'+
							revise+
							'</ul>';
					$('#'+target).after(bar);
				}
			};
			
			//得到了坐标-绘制地图的函数
			function drawmap(target,center,name,siteNo){
				if(google){
    				geocoder = new google.maps.Geocoder();
				    var latlng = new google.maps.LatLng(center[1],center[0]); //首次加载定义的中心点
				    var myOptions = {
				        zoom:15,
				        center:latlng,
				        mapTypeId: google.maps.MapTypeId.ROADMAP
				      };
				      
				    var map=new google.maps.Map(target,myOptions);//载入地图
				    
				    var marker = new google.maps.Marker({
				    	 title:name,     
						 position: latlng,         
					 	 map: map,
					 	 draggable:function(){
					 	 	if(that.drag) return true;
					 	 	return false;
					 	 }()
					});
					
					if(that.markerhtml!=""){
						var infowindow = new google.maps.InfoWindow({
					    content:that.markerhtml
						});

					    google.maps.event.addListener(marker,'click', function () {
					    	infowindow.open(map,marker);
			            });
					}
					
					if(that.drag){
						google.maps.event.addListener(marker,'dragend', function () {
							var center=marker.getPosition();
							if(confirm('指定这里为新的场馆坐标么?')){
								GM.tools.overlay.close();
								$.ajax({
									url:'xxx.jsp',
									data:{
										siteNo:siteNo,
										lat:center['Na'],
										lng:center['Oa']
									},
									success:function(){
										alert('本次修改已经提交');
									},
									error:function(){
										alert('服务响应超时，请重试');
									},
									timeout:5000
								});
							}
			            });
					}
					//构建bar
					bulidbar(that.target);
			    }
			};
			
			function errorClick(){
				var BigMap='<div style="position:relative;width:200px;height:200px;border:#ccc solid 2px;background:#fff;">'+
						'<div style="margin-top:80px;font-size:12px;color:red;text-align:center;">对不起,没有可以查看的地图信息</div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
				GM.tools.overlay.reset(200,200);
				GM.tools.overlay.fire(BigMap);
			};
			
			
			
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(that.center==null){
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				if(google){
    				geocoder = new google.maps.Geocoder();
    				geocoder.geocode( { 'address': that.q}, function(results, status) {
				      if (status == google.maps.GeocoderStatus.OK) {
				        that.center=[results[0].geometry.location['Oa'],results[0].geometry.location['Na']];
				        drawmap(target,that.center,that.name,that.siteNo);
				      } else {
				        error(target);
				      }
				    });
    			}
			}else if(that.center!=null){
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				drawmap(target,that.center,that.name,that.siteNo);
			}
			
			//设置高宽
			setwrap(target);
			
			//查看全图
			$.overlay();
			
			
			//绑定bar的事件
			$('.J_LookBigMap').live('click',function(){
				if(that.coord || that.center){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:500px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'" style="height:500px;"></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
					GM.tools.overlay.reset(500,500);
					GM.tools.overlay.fire(BigMap);
					var map=new GM.widget.map({
						q:that.q,
						markerhtml:that.markerhtml,
						target:'J_Map_'+diget,
						width:500,
						height:500,
						bar:false,
						name:that.name,
						center:that.center,
						siteNo:that.siteNo
					}).init();
				}else{
					errorClick();
				}
			});
			
			//查询路线
			$('.J_LookWay').live('click',function(){
				if(that.coord || that.center){
					var Way='<div style="position:relative;width:300px;height:100px;border:#ccc solid 2px;background:#fff;">'+
						'<form action="http://ditu.google.cn/maps" method="get" target="_blank" style="padding: 10px; text-align: center;">'+
							'<div style="color:#78A000; font-size: 14px; font-weight: bold;">请输入出发所在地</div>'+
							'<div style="margin: 10px 0pt;">'+
							'<span style="margin-right: 10px;font-size:12px;">出发地</span>'+
							'<input type="text" name="saddr" value="" class="profile_box1">'+
							'</div>'+
							'<div><input type="submit" value="确认" class="space_button"></div>'+
							'<input value="'+that.q+','+that.name+'" type="hidden" name="daddr"/>'+
						'</form>'+
						'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
						
					GM.tools.overlay.reset(300,100);
					GM.tools.overlay.fire(Way);
				}else{
					errorClick();
				}
			});
			
			//关闭覆层，注销map
			$('.J_OverlayClose').live('click',function(){
				GM.tools.overlay.close();
			});
			
			//修改坐标
			$('.J_EditMap').live('click',function(){
				if(that.coord){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:500px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'"></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
					GM.tools.overlay.reset(500,500);
					GM.tools.overlay.fire(BigMap);
					var map=new GM.widget.map({
						q:that.q,
						markerhtml:that.markerhtml,
						target:'J_Map_'+diget,
						width:500,
						height:500,
						bar:false,
						name:that.name,
						center:that.center,
						siteNo:that.siteNo
					}).init();
				}else{
					errorClick();
				}
			});
			
		}
	};
	
	if(G && G.widget) G.widget.map=map;
	
})(window,GM);