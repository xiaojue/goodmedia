/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110805
 * google map api 接口实现地理定位
 */
(function(W,G) {

	var map= function(cg) {

		if(!cg) return;

		var _cg= {
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

		for(var i in _cg) {
			this[i]=_cg[i];
		}

	};
	
	
	map.prototype= {
		//加载css
		_loadcss:function(){
			var host=GM.widget.host,place='-min';
			if(GM.debug) place='';
			$.loadcss(host+'map/map'+place+'.css');
		},
		//绘制地图的主函数
		drawmap:function(target,center,name,siteNo){
			if(google) {
					var that=this,
						T,
						Circle,
						errortime=0,
						markersArray=[],
						Gmap=google.maps,
						Gevent=Gmap.event,
						infowindow=new Gmap.InfoWindow(),
						latlng = new Gmap.LatLng(center[1],center[0]), //首次加载定义的中心点
						myOptions = {
							zoom:15,
							center:latlng,
							mapTypeId: Gmap.MapTypeId.ROADMAP
						},
						map=new Gmap.Map(target,myOptions),	//载入地图
						marker = new Gmap.Marker({
							title:name,
							position: latlng,
							map: map,
							draggable: function() {
								if(that.drag || that.type=="search") return true;
								return false;
							}()
						}),
						_fn={
							//设置坐标值
							setlatlng:function(m,c){
								var center=m.getPosition();
								$('#J_Coord').html('lat:<span id="J_Pa">'+c['Pa']+'</span><br/>lng:<span id="J_Oa">'+c['Oa']+'</span>');
							},
							//取坐标
							//这里的pa和oa用反了……囧，程序都做完了才发现精度纬度是拧着的，后台已经按照这个走了
							//这里注释一下，切忌…… 这里Oa代表lat , Pa代表lng 搜索范围功能前台按照正常的来，后台会处理一下
							getPosition:function(m){
								var center=m.getPosition();
								return {
									lat:center['Oa'],
									lng:center['Pa']
								}
							},
							//删除标记和圆圈
							deleteMarkers:function(ary,cle){
								if (ary) {
									for (i in ary) {
										ary[i].setMap(null);
									}
									ary.length = 0;
								}
								if(cle) cle.setMap(null);
							},
							//清空右侧列表
							clearRightBar:function(){
								
							},
							infoshow:function(info,msg){
								clearTimeout(T);
								info.setContent(msg)
								info.open(map,marker);
								T=setTimeout( function() {
									info.close();
								},5000);
							},
							//显示地图浮出层
							infowindowShow:function(info,l){
								_fn.infoshow(info,'在此3公里范围找到了'+l+'家健身会馆,拖动此标志可继续查找');
							},
							//给周边场馆增加坐标和事件
							addrimmarkers:function(ary,map,info,markAry){
								for(var i=0;i<ary.length;i++) {
									(function(i) {
										var result=ary[i],
											resultlat=result['lat'],
											resultlng=result['lng'],
											resultname=result['name'],
											newlatlng = new Gmap.LatLng(resultlat,resultlng),
											marker = new Gmap.Marker({
												title:resultname,
												position:newlatlng,
												map: map,
												icon:'http://s1.ifiter.com/static/images/map/124.png'
											});
											
										markAry.push(marker);
										//给找到的场馆marker对象绑定点击事件
										Gevent.addListener(marker,'click',function (){
											_fn.infoshow(info,resultname);
										});
										
									})(i);
								}
							},
							//map和圈点击的handle
							clickseach:function(e){
								var lat=e['latLng']['Oa'],
									lng=e['latLng']['Pa'],
									darwin = new Gmap.LatLng(lat,lng);	
								marker.setPosition(darwin);
								_fn.postPostion(marker);
							},
							postPostionSuccess:function(data,lat,lng){
								var darwin = new Gmap.LatLng(lat,lng); //设置新的地图中心点
									map.setCenter(darwin);
									map.setZoom(13);
									try{
										eval('var data='+$.trim(data));
									}catch(e){
										console.log(e);
									}
									var dataAry=data['s']['result'];
									
									_fn.infowindowShow(infowindow,dataAry.length);
									
									if(data['r']!=0) return; //数据有错
									
									if(dataAry.length==0) {}//右侧列表增加什么也没搜索到的提示

									_fn.clearRightBar();
									_fn.deleteMarkers(markersArray,Circle);
									_fn.addrimmarkers(dataAry,map,infowindow,markersArray);
									
									//画一个3000半径的圆
									Circle=new Gmap.Circle({
										strokeColor:"#FF0000",
										fillOpacity:0.0,
										map:map,
										strokeWeight:1,
										radius:3500,
										center:marker.getPosition()
									});
									
									//给中心点绑定点击事件
									Gevent.addListener(marker,'click', function () {
										_fn.infowindowShow(infowindow,dataAry.length);
									});
									
									//给范围圈绑定点击事件
									Gevent.addListener(Circle,'click',_fn.clickseach);
									
							},
							//坐标10次连续错误，说明网络确实不行……
							postPostionError:function(){
								errortime++;
								if(errortime==10) {
									alert('连续请求失败,建议重新刷新页面');
									return;
								}
								setTimeout(function(){
									_fn.postPostion(marker)
								},200);
							},
							//发送当前坐标到搜索api，返回周边场馆
							postPostion:function(m){
								var coord=_fn.getPosition(m),
									lat=coord.lat,
									lng=coord.lng,
									action='/api/mi.jsp?v=geo/'+lng+'/'+lat;
								
								$.ajax({
									url:action,
									type:'GET',
									success:function(data){
										_fn.postPostionSuccess(data,lat,lng)
									},
									error:_fn.postPostionError
								});
							}
						};
						
					//如果存在markerhtml初始值直接初始化infowindow
					if(that.markerhtml!="") {
						infowindow.setContent(markerhtml);
						infowindow.open(map,marker);
						Gevent.addListener(marker,'click', function () {
							infowindow.open(map,marker);
						});
					}
					//可拖拽模式，是在修改时被触发，在editbox里显示经纬度
					if(that.drag) {
						_fn.setlatlng(marker,center);
						Gevent.addListener(marker,'dragend', function () {
							_fn.setlatlng(marker,center);
						});
					}
					//搜索模式
					if(that.type=="search") {
						_fn.postPostion(marker); //初始化就发送
						
						//结束拖拽也发送
						Gevent.addListener(marker,'dragend', function() {
							_fn.postPostion(marker);
						});
						
						//拖拽的时候关闭覆层，清除延迟
						Gevent.addListener(marker,'drag', function() {
							infowindow.close();
							clearTimeout(T);
						});
						
						//点击地图的时候也进行查找
						Gevent.addListener(map,'click',_fn.clickseach);
					}

					//构建bar
					if(that.bar) that._bulidbar(that.target);
				}
		},
		//构建下部导航
		_bulidbar:function(target){
			var revise='',that=this,bar;
			if(that.revise) revise='<li><a href="javascript:void(0);" class="J_EditMap">修订坐标</a></li>';
			bar='<ul class="map_bar">'+
				'<li><a href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>'+
				'<li><a href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>'+
					revise+
				'</ul>';
			$('#'+target).after(bar);
		},
		//初始化失败的时候导航的error handle
		_errorClick:function(){
			var BigMap='<div class="emersion error">'+
				'<div class="msg">对不起,没有可以查看的地图信息</div>'+
				'<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>'+
				'</div>';
			G.tools.overlay.fire(BigMap);
		},
		//set wrap
		_setwrap:function(target){
			var that=this;
			target.style.cssText+='width:'+that.width+'px;height:'+that.height+'px;border:1px solid #CCC;';
		},
		//init error handler
		_Initerror:function(target){
			target.parentNode.removeChild(target);
		},
		//初始化地图
		init: function() {
			
			var that=this,
				target=document.getElementById(that.target);
				
			//加载相关css
			that._loadcss();

			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(!that.center) {
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				if(google) {
					var Gmap=google.maps,
						geocoder = new Gmap.Geocoder();
						geocoder.geocode({
						'address': that.q
						}, function(results, status) {
							if (status == Gmap.GeocoderStatus.OK) {
								var location=results[0].geometry.location;
								that.center=[location['Pa'],location['Oa']];
								that.drawmap(target,that.center,that.name,that.siteNo);
							} else {
								that._Initerror(target);
							}
						});
				}
			} else if(that.center) {
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				that.drawmap(target,that.center,that.name,that.siteNo);
			}

			//设置容器高宽
			that._setwrap(target);

			//查看全图-生成全局overlay对象
			$.overlay();

			//卸载绑定的live事件
			var events=['.J_LookBigMap','.J_LookWay','.J_OverlayClose','.J_EditMap','#J_SqSub','#J_Esub'];

			$.each(events, function(key,val) {
				$(val).die();
			});
			
			//绑定bar的事件
			$('.J_LookBigMap').live('click', function() {
				if(that.coord || that.center) {
					that._BigMapaction();
				} else {
					that._errorClick();
				}
			});
			//查询路线
			$('.J_LookWay').live('click', function() {
				if(that.coord || that.center) {
					that._lookway();
				} else {
					that._errorClick();
				}
			});
			
			//关闭覆层，注销map
			$('.J_OverlayClose').live('click', function() {
				G.tools.overlay.close();
			});
			
			//搜索之后的更新动作
			$('#J_SqSub').live('click', function() {
				var diget=$(this).attr('data-diget'),
					map=new G.widget.map({
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
			$('.J_EditMap').live('click', function() {
				if(that.coord || that.center) {
					that._editaction();
				} else {
					that._errorClick();
				}
			});
			
			//重新设置保存动作
			$('#J_Esub').live('click',function(){
				that._revise();
			});
		},
		//查看大图的浮层
		_BigMapaction:function(){
			var diget=new Date().valueOf(),
				that=this,
				BigMap='<div class="emersion bigmap">'+
				'<div id="J_Map_'+diget+'" style="height:500px;"></div>'+
				'<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>'+
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
		},
		//查询路线浮层
		_lookway:function(){
			var that=this;
			var Way='<div class="emersion lookway">'+
					'<form action="http://ditu.google.cn/maps" method="get" target="_blank">'+
					'<div class="lookway_title">请输入出发所在地</div>'+
					'<div class="lookway_content">'+
						'<span>出发地</span>'+
						'<input type="text" name="saddr" class="profile_box1">'+
					'</div>'+
					'<div><input type="submit" value="确认" class="space_button"></div>'+
					'<input value="'+that.q+','+that.name+'" type="hidden" name="daddr"/>'+
					'</form>'+
					'<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>'+
					'</div>';
				G.tools.overlay.opacity(0.5);
				G.tools.overlay.fire(Way);
		},
		//触发修改动作的大浮层
		_editaction:function(){
			var diget=new Date().valueOf(),
				that=this,
				BigMap='<div class="emersion edit">'+
				'<div id="J_Map_'+diget+'" style="height:500px;""></div>'+
				'<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>'+
				'<div class="editbox">'+
				'搜索:<br><input type="text" id="J_Sq"/><br/>'+
				'操作:<br><input type="button" data-diget="'+diget+'" id="J_SqSub" value="搜索"/> <input type="button" id="J_Esub" value="保存坐标"/><br/>'+
				'坐标:<br><span id="J_Coord"></span>'+
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
		},
		//确认修改新场馆
		_revise:function(){
			var that=this;
			if(confirm('确定保存当前标记位置为新场馆位置么？')) {
				$.ajax({
					url:'/gestion/map.jsp',
					data: {
						siteno:that.siteNo,
						latitude:$('#J_Pa').text(),
						longitude:$('#J_Oa').text(),
						act:'update'
					},
					success: function(str) {
						var result=$.trim(str);
						if(result==1) {
							alert('保存成功');
							window.location.href='/gestion/map.jsp?siteno='+that.siteNo;
						} else {
							alert('操作失败');
						}
					},
					error: function() {
						alert('相应超时，重新保存');
					}
				});
			}
		}
	};

	if(G && G.widget) G.widget.map=map;

})(window,GM);