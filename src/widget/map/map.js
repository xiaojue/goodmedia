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
			siteNo:null,
			type:null
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
					var bar='<ul style="margin: 5px 0pt;width:210px;padding:0px;">'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:14px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>'+
							'<li style="float: left; display: block; margin: 0pt 10px;line-height:14px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>'+
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
					 	 		if(that.drag || that.type=="search") return true;
					 	 		return false;
					 		 }()
						});
					
					if(that.markerhtml!=""){
						var infowindow = new google.maps.InfoWindow({
					    	content:that.markerhtml
						});
						
						infowindow.open(map,marker);
						
					    google.maps.event.addListener(marker,'click', function () {
					    	infowindow.open(map,marker);
			            });
					}
					
					if(that.drag){
						
						function setlatlng(){
							var center=marker.getPosition();
							$('#J_Coord').html('lat:<span id="J_Pa">'+center['Pa']+'</span><br/>lng:<span id="J_Oa">'+center['Oa']+'</span>');
						}
						
						google.maps.event.addListener(marker,'dragend', function () {
							setlatlng();
			      });
			            
			      setlatlng();
			            
					}
					
					if(that.type=="search"){
						
						var errortime=0,markersArray=[],surname; //10次错误之后再给提示

						function getPosition(){
							var center=marker.getPosition();
							//这里的pa和oa用反了……囧，程序都做完了才发现精度纬度是拧着的，后台已经按照这个走了
							//这里注释一下，切忌…… 这里Oa代表lat , Pa代表lng 搜索范围功能前台按照正常的来，后台会处理一下
							return {
								lat:center['Oa'],
								lng:center['Pa']
							}
						};
						
						function postPostion(){
							var coord=getPosition(),
									lat=coord.lat,
									lng=coord.lng,
									action='/api/mi.jsp?v=geo/'+lng+'/'+lat;
						
							//清除已经有的maker，并且清空右侧列表的信息
							function clearRightBar(){
							
							}
							
							function deleteMarkers() {
  							if (markersArray) {
   							 for (i in markersArray) {
     							 markersArray[i].setMap(null);
   							 }
   							 markersArray.length = 0;
  							}
								if(surname) surname.setMap(null);
							}

							$.ajax({
								url:action,
								type:'GET',
								success:function(data){
									//这里规定data格式
									//{
									//	result:[
									//		{
									//			lat:'',
									//			lng:'',
									//			name:''
									//		},
									//		{},{}
									//	]
									//}
									//没有则返回空数组 r:0 
									try{
										eval('var data='+$.trim(data));
									}catch(e){
										console.log(e);
									}
									if(data['r']!=0) return; //数据有错

									var dataAry=data['s']['result'];
									if(dataAry.length==0){
										//右侧列表增加什么也没搜索到的提示
										return; //没数据就啥也不执行了
									}

									deleteMarkers();
									clearRightBar();
									
									var darwin = new google.maps.LatLng(lat,lng); //设置新的地图中心点
  										map.setCenter(darwin);
											map.setZoom(13);

								
									var infowindow = new google.maps.InfoWindow({
											content:'在此3公里范围找到了'+dataAry.length+'家健身会馆,拖动此标志可继续查找'
									});

									var infoflg=true;
									
									function infowindowShow(){
										infoflg=false;
										infowindow.open(map,marker);
										setTimeout(function(){
											infowindow.close();
											infoflg=true;
										},5000);
									}
									
									infowindowShow();
									
									
					   		 	google.maps.event.addListener(marker,'click', function () {
											if(infoflg)
											infowindowShow();
			           	});

									for(var i=0;i<dataAry.length;i++){
										(function(i){
											var resultlat=dataAry[i]['lat'],
													resultlng=dataAry[i]['lng'],
													resultname=dataAry[i]['name'];
											var newlatlng = new google.maps.LatLng(resultlat,resultlng);
											
											var marker = new google.maps.Marker({
				    						title:resultname,     
						 						position:newlatlng,         
					 						 	map: map,
												icon:'http://x.idongmi.com/static/images/map/124.png'
											});
											

										google.maps.event.addListener(marker,'click', function () {
												var infowindow = new google.maps.InfoWindow({
													content:resultname
												});
											infowindow.open(map,marker);
											setTimeout(function(){
													infowindow.close();
											},3000)
			           		});
										markersArray.push(marker);
										})(i);
									}

									
									surname=new google.maps.Circle({
											strokeColor:"#FF0000",
											fillOpacity:0.0,
											map:map,
											strokeWeight:1,
											radius:3000,
											center:marker.getPosition()
									});
									//结束循环添加坐标
									//应该增加右侧增加相关列表的函数
								},
								error:function(){
									errortime++;
									if(errortime==10){
										alert('连续请求失败,建议重新刷新页面');
										return;
									}
									setTimeout(postPostion,200);
								}
							});
						}

						var dragflg=true,T;

						postPostion(); //初始化就发送
						google.maps.event.addListener(marker,'dragend',function(){
								if(dragflg) T=setTimeout(postPostion,300);	
						});

						google.maps.event.addListener(marker,'drag',function(){
								clearTimeout(T);	
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
				G.tools.overlay.fire(BigMap);
			};
			
			
			
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(!that.center){
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				if(google){
    				geocoder = new google.maps.Geocoder();
    				geocoder.geocode( { 'address': that.q}, function(results, status) {
				      if (status == google.maps.GeocoderStatus.OK) {
				      	var location=results[0].geometry.location;
				        that.center=[location['Pa'],location['Oa']];
				        drawmap(target,that.center,that.name,that.siteNo);
				      } else {
				        error(target);
				      }
				    });
    			}
			}else if(that.center){
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				drawmap(target,that.center,that.name,that.siteNo);
			}
			
			//设置高宽
			setwrap(target);
			
			//查看全图
			$.overlay();
			
			//卸载绑定的live事件
			var events=['.J_LookBigMap','.J_LookWay','.J_OverlayClose','.J_EditMap','#J_SqSub','#J_Esub'];
			
			$.each(events,function(key,val){
				$(val).die();
			});
			
			//绑定bar的事件
			$('.J_LookBigMap').live('click',function(){
				if(that.coord || that.center){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:500px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'" style="height:500px;"></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
						'</div>';
					G.tools.overlay.opacity(0.5);
					G.tools.overlay.fire(BigMap);
					var map=new G.widget.map({
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
					G.tools.overlay.opacity(0.5);	
					G.tools.overlay.fire(Way);
				}else{
					errorClick();
				}
			});
			
			//关闭覆层，注销map
			$('.J_OverlayClose').live('click',function(){
				G.tools.overlay.close();
			});
			
			//搜索更新
			$('#J_SqSub').live('click',function(){
				var diget=$(this).attr('data-diget');
				var map=new G.widget.map({
					q:$('#J_Sq').val(),
					markerhtml:'拽我，拽我，确定准确的位置~',
					target:'J_Map_'+diget,
					width:600,
					height:500,
					bar:false,
					drag:true,
					name:that.name,
					siteNo:that.siteNo
				}).init();
			});
			
			//修改坐标
			$('.J_EditMap').live('click',function(){
				if(that.coord || that.center){
					var diget=new Date().valueOf(),
						BigMap='<div style="position:relative;width:600px;height:500px;border:#ccc solid 2px;">'+
						'<div id="J_Map_'+diget+'" style="height:500px;""></div>'+
							'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
							'<div style="background:#fff;width:150px;height:140px;padding:10px;position:absolute;left:-180px;top:150px;border:#ccc solid 1px;">'+
								'搜索:<br><input type="text" id="J_Sq"/><br/>'+
								'操作:<br><input type="button" data-diget="'+diget+'" id="J_SqSub" value="搜索"/> <input type="button" id="J_Esub" value="保存坐标"/><br/>'+
								'坐标:<br><span id="J_Coord" style="color:red;"></span>'+
							'</div>'+
						'</div>';
					G.tools.overlay.opacity(0);
					G.tools.overlay.fire(BigMap);
					var map=new G.widget.map({
						q:that.q,
						markerhtml:'拽我，拽我，确定准确的位置~',
						target:'J_Map_'+diget,
						width:600,
						height:500,
						bar:false,
						drag:true,
						name:that.name,
						center:that.center,
						siteNo:that.siteNo
					}).init();
				}else{
					errorClick();
				}
			});
			
			$('#J_Esub').live('click',function(){
				if(confirm('确定保存当前标记位置为新场馆位置么？')){
					$.ajax({
						url:'/gestion/map.jsp',
						data:{
							siteno:that.siteNo,
							latitude:$('#J_Pa').text(),
							longitude:$('#J_Oa').text(),
							act:'update'
						},
						success:function(str){
							var result=$.trim(str);
							if(result==1){
								alert('保存成功');
								window.location.href='/gestion/map.jsp?siteno='+that.siteNo;
							}else{
								alert('操作失败');
							}
						},
						error:function(){
							alert('相应超时，重新保存');
						}
					});
				}
			});
			
		}
	};
	
	if(G && G.widget) G.widget.map=map;
	
})(window,GM);
