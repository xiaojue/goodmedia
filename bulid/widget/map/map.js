/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110805
 * @fileoverview google map api 接口实现地理定位
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
	
	var centerflg=true;
	
	map.prototype= {
		//加载css
		_loadcss:function(){
			var host=GM.widget.host,place='-min';
			if(GM.debug) place='';
			$.loadcss(host+'map/map'+place+'.css');
		},
		//模糊搜索返回经纬度
		_searchQ:function(q,callback){
			if(google) {
				var Gmap=google.maps,
					geocoder = new Gmap.Geocoder();
					geocoder.geocode({
					'address': q
					}, function(results, status) {
						if (status == Gmap.GeocoderStatus.OK) {
							var location=results[0].geometry.location;
							if(callback) callback(location);
						} else {
							if(callback) callback(null);
						}
					});
			}
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
						latlng = new Gmap.LatLng(center[0],center[1],true), //首次加载定义的中心点
						myOptions = {
							zoom:15,
							center: latlng,
							mapTypeId: Gmap.MapTypeId.ROADMAP
						};
						
						var map=new Gmap.Map(target,myOptions);//载入地图
						
						var marker = new Gmap.Marker({
							title:name,
							position:latlng,
							map: map,
							draggable: function() {
								if(that.drag || that.type=="search") return true;
								return false;
							}()
						});
						
						var _fn={
							//设置坐标值
							setlatlng:function(m,c){
								var center=m.getPosition();
								$('#J_Coord').html('lat:<span id="J_Pa">'+center['Pa']+'</span><br/>lng:<span id="J_Oa">'+center['Qa']+'</span>');
							},
							//取坐标
							//这里的pa和oa用反了……囧，程序都做完了才发现精度纬度是拧着的，后台已经按照这个走了
							//这里注释一下，切忌…… 这里Oa代表lat , Pa代表lng 搜索范围功能前台按照正常的来，后台会处理一下
							getPosition:function(m){
								var center=m.getPosition();
								return {
									lat:center['Qa'],
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
							infoshow:function(info,msg,position){
								clearTimeout(T);
								info.setContent(msg);
								if(position) info.setPosition(position)
								info.open(map);
								T=setTimeout( function() {
									info.close();
								},3000);
							},
							//显示地图浮出层
							infowindowShow:function(info,l){
								_fn.infoshow(info,'在此3公里范围找到了'+l+'家健身会馆,拖动此标志可继续查找',marker.getPosition());
							},
							//给周边场馆增加坐标和事件
							addrimmarkers:function(ary,map,info,markAry){
								var infotemp='<div class="info-window">'+
										 '<p><a href="/s/{siteno}" target="_blank" class="green">{name}</a></p>'+
										 '<p class="coaches">入驻教练：{coaches}</p>'+
										 '<p>热线电话：{tel}</p>'+
										 '<p class="map_more"><a href="/s/{siteno}" target="_blank">会所详细介绍&gt;&gt;</a></p>'
										 '</div>';
								//清空暂存动作
								_fn.infoopen={};
								for(var i=0;i<ary.length;i++) {
									(function(i) {
										var result=ary[i],
											resultlat=result['lat'],
											resultlng=result['lng'],
											resultname=result['name'];
											function addMarker(name,lat,lng){
												var	newlatlng = new Gmap.LatLng(lat,lng,true),
													newmarker = new Gmap.Marker({
													title:name,
													position:newlatlng,
													map: map,
													icon:'http://s1.ifiter.com/static/images/map/124.png'
												});
												
												markAry.push(newmarker);
												
												var msg=$.substitute(infotemp,result);
												
												//给找到的场馆marker对象绑定点击事件
												Gevent.addListener(newmarker,'click',function (){
													var	current=i+1,
														max=10,
														page=Math.ceil(current/max);
													_fn.infoshow(info,msg,newlatlng);
													_fn.flip(page,$('#J_MAP_RightBar li'),i); //指定哪个打开
												});
												//暂存这个动作
												_fn.infoopen[i]=function(){
													_fn.infoshow(info,msg,newlatlng)
												};
											};
											
											result['coaches']=function(){
												var tempary=result['coaches'],returnstr="";
													if(tempary.length==0) return '暂无教练信息';
													for(var i=0;i<tempary.length;i++){
														var tempobj=tempary[i];
														returnstr+='<a href="/uc/'+result["siteno"]+'/'+tempobj["cid"]+'" target="_blank" class="green">'+tempobj["cname"]+'</a>';
													}
													return returnstr;
											}();
											
											
											//如果场馆坐标为0.0 就是数据库没有
											if(resultlat=="0.0" && resultlng=="0.0"){
												that._searchQ(result['cityZone'],function(location){
													if(location){
														addMarker(resultname,location['Qa'],location['Pa']);
													}
												});
											}else{
												addMarker(resultname,resultlat,resultlng);
											}
										
									})(i);
									
									//给相关infowindow 绑定关闭延迟事件
									$('.info-window').die();
									$('.info-window').live('mouseover',function(){
										clearTimeout(T);
									});
									$('.info-window').live('mouseout',function(){
										T=setTimeout( function() {
											info.close();
										},3000);
									});
								}
							},
							//缓存每个场馆最新的info动作 {index:fun}
							infoopen:{},
							//生成左侧列表
							createRightlist:function(data){
								var errorhandle="this.parentNode.removeChild(this);",
									returnstr='<ul class="maplist">';
						        for(var i=0;i<data.length;i++){
						        	var obj=data[i],
						        		temp='<li data-index="'+i+'">'+
							                      '<p class="map_title"><a href="javascript:void(0)">{name}</a></p>'+
							                      '<p><span>会馆特色：</span>{feature}</p>'+
							                      '<p><span>特色项目：</span>{items}</p>'+
							                      '<p><span>热线电话：</span>{tel}</p>'+
							                      '<p><span>所在城市：</span>{cityZone}</p>'+
							                      '<p class="map_pic"><a href="/s/{siteno}" target="_blank"><img src="{logo}" width="120" height="120" title="{name}" alt="{name}" onerror="'+errorhandle+'"></a></p>'+
							                      '<p class="map_more"><a href="/s/{siteno}" target="_blank">会所详细介绍&gt;&gt;</a></p>'+
						                      '</li>';
						            for(var j in data[i]){
						            	if(data[i][j]=="") data[i][j]='暂无';
						            }
							        temp=$.substitute(temp,data[i]);
							        returnstr+=temp;
						        }
						        return returnstr+='</ul>';
							},
							//生成分页分页
							paglist:function(data){
								if(data.length<10) return '';
								var returnstr="<div id='J_Paglist' data-current='1'>",max=10,page=0;
								if(data.length>10) returnstr+='<b id="J_PagBack">上一页</b>';
								for(var i=0;i<data.length;i++){
									if(i%max==0){
										page++;
										returnstr+='<span data-num="'+page+'">['+page+']</span>';
									} 
								}
								if(data.length>10) returnstr+='<b id="J_PagNext">下一页</b>';
								return returnstr+='</div><input type="hidden" value="'+page+'" id="J_PagLength">';
							},
							//翻到第几页
							flip:function(current,lis,guide){
								var max=10;
								lis.hide();
								lis.each(function(index,node){
									var index=index+1;
										if(index <= current*max && index > (current-1)*max){
											$(node).show();
										}									
								});
								//保存当前指针到节点
								$('#J_Paglist').attr('data-current',current);
								//折叠
								if(!guide) guide=(current-2)*max+max; //不存在指定打开哪一个，找到当前页的第一个
								_fn.Rightfold(guide);
								//打开对应的map info
								_fn.infoopen[guide]();
								//根据当前状态判断是否显示上下页
								var l=$('#J_PagLength').val();
								if(current==1) $('#J_PagBack').hide();
								else $('#J_PagBack').show();
								
								if(current==l) $('#J_PagNext').hide();
								else $('#J_PagNext').show();
								
								//给当前的span增加current样式
								var currentSpan=$('#J_Paglist>span').eq(current-1),
									text=currentSpan.text();
								$('#J_Paglist>span').each(function(){
									$(this).removeClass('current');
									var num=$(this).text().match(/\d/g)[0];
									$(this).text('['+num+']');
								});
								currentSpan.addClass('current');
								currentSpan.text(text.replace(/\[|\]/g,''));
							},
							//右侧列表折叠切换
							Rightfold:function(guide){
								//全部隐藏,并且去掉当前的样式
								$('.maplist li>p').find('a').removeClass('active');
								$('.maplist li>p').not('.map_title').hide();
								//第N个打开
								$('.maplist li:eq('+guide+')>p').show().find('a').addClass('active');
								//绑定事件
								$('.map_title').die();
								$('.map_title').live('click',function(){
									$('.maplist li>p').not('.map_title').hide();
									$('.maplist li>p.map_title a').removeClass('active');
									$(this).siblings('p').show();
									$(this).parent().find('.map_title a').addClass('active');
									//触发暂存动作，调用map infowindow
									var index=$(this).closest('li').attr('data-index');
									_fn.infoopen[index]();
								});
								
							},
							//map和圈点击的handle
							clickseach:function(e){
								var lat=e['latLng']['Qa'],
									lng=e['latLng']['Pa'],
									darwin = new Gmap.LatLng(lng,lat);	
								marker.setPosition(darwin);
								_fn.postPostion(marker);
							},
							postPostionSuccess:function(data,lat,lng){
								var darwin = new Gmap.LatLng(lat,lng,true); //设置新的地图中心点
									map.setCenter(darwin);
									map.setZoom(13);
									try{
										eval('var data='+$.trim(data));
									}catch(e){
										console.log(e);
									}
									
									//_fn.infowindowShow(infowindow,dataAry.length);
									
									if(data['r']!=0) return; //数据有错
									
									var dataAry=data['s']['result'];
									
									_fn.deleteMarkers(markersArray,Circle);
									
									//画一个3000半径的圆
									Circle=new Gmap.Circle({
										strokeColor:"#0552A5",
										fillOpacity:0.1,
										fillColor:"#0764C1",
										map:map,
										strokeWeight:1,
										radius:3200,
										center:marker.getPosition()
									});
									//给范围圈绑定点击事件
									Gevent.addListener(Circle,'click',_fn.clickseach);
									
										
									_fn.addrimmarkers(dataAry,map,infowindow,markersArray);
									_fn.pagallfire(dataAry);
									
									if(dataAry.length==0) $('#J_MAP_RightBar').html('附近没有找到相应的场馆');
									//给中心点绑定点击事件
									/*
									Gevent.addListener(marker,'click', function () {
										_fn.infowindowShow(infowindow,dataAry.length);
									});
									*/
									
							},
							tosearch:function(){
								var q=$.trim($('#J_SearchMapText').val());
								if(q==""){
									alert('请输入搜索地址，比如:北京市 朝阳区');
									return;
								}
								that._searchQ(q,function(location){
									if(location){
										var darwin = new Gmap.LatLng(location['Pa'],location['Qa'],true);
										map.setCenter(darwin);
										marker.setPosition(darwin);
										_fn.postPostion(marker);
									}else{
										//alert('地址解析有误,尝试换一下地名搜索');
										//如果地址google解析有问题，再传本站接口进行一次查询，再找不到，再提示错误 - 未找到相关地址
										//我回传2个参数 城市名_关键字
										_fn.getourcoord({city:that.q,q:q},function(data){
											if(data && data['r']==0){
												var dataAry=data['s']['result'];
												if(dataAry.length==0){
													alert('对不起，没有找到你想搜索的地名或场馆');
													return;
												} 
												_fn.deleteMarkers(markersArray,Circle);
												_fn.addrimmarkers(dataAry,map,infowindow,markersArray);
												_fn.pagallfire(dataAry);
												var darwin = new Gmap.LatLng(dataAry[0]['lat'],dataAry[0]['lng'],true);//设置新的地图中心点
												map.setCenter(darwin);
												map.setZoom(11);
											}else{
												alert('系统错误');
											}
										});
									}
								});
							},
							//分页事件以及增加相关场馆标记
							pagallfire:function(dataAry){
									//右侧栏目和分页
									var Rightlist=_fn.createRightlist(dataAry),
										pag=_fn.paglist(dataAry);
										$('#J_MAP_RightBar').html(Rightlist+pag);
									
									var dieary=['#J_Paglist span','#J_PagBack','#J_PagNext',"#J_SearchSub","#J_SearchMapText","#J_ShareSina"];
									
									$.each(dieary,function(index,val){
										$(val).die();
									});
									//给分页绑定事件
									$('#J_Paglist span').live('click',function(){
										var current=parseInt($(this).attr('data-num'));
										_fn.flip(current,$('#J_MAP_RightBar li'));
									});
									
									$('#J_PagBack').live('click',function(){
										var current=parseInt($('#J_Paglist').attr('data-current'));
										_fn.flip(current-1,$('#J_MAP_RightBar li'));
										$('#J_Paglist').attr('data-current',current-1);
									});
									
									$('#J_PagNext').live('click',function(){
										var current=parseInt($('#J_Paglist').attr('data-current'));
										_fn.flip(current+1,$('#J_MAP_RightBar li'));
										$('#J_Paglist').attr('data-current',current+1);
									});
									
									
									//先分出第一页
									if(dataAry.length!=0) _fn.flip(1,$('#J_MAP_RightBar li'));
									
									//给搜索绑定事件
									$('#J_SearchSub').live('click',_fn.tosearch);
									$('#J_SearchMapText').live('keydown',function(e){
										if(e.keyCode==13) _fn.tosearch();
									});
									//分享到新浪微博
									$('#J_ShareSina').live('click',function(){
										var tsina="http://v.t.sina.com.cn/share/share.php?title={T}&url={U}",
											href=$.substitute(tsina,{
												T:'哈哈，我终于在我身边半径3公里的地区找到了适合我的健身场馆，真是不看不知道啊。你也可以来试试哦。（来自：动米网）',
												U:encodeURIComponent(window.location.href)
											});
										$(this).attr('href',href);
									});
							},
							//获取自己数据库的模糊查询信息
							getourcoord:function(data,callback){
								var coordurl='/api/mi.jsp?v=geokey/'+encodeURI(data.q),
									c=0,mc=3,t=1000;
								$.ajax({
									type:'GET',
									url:coordurl,
									success:function(result){
										try{
											eval('var r='+$.trim(result));
										}catch(e){
											console.log(e);
											var r=null;
										}
										if(callback) callback(r);
									},
									error:function(){
										if(c==mc){
											alert('网络延迟请重新查询');
											c=0;
											return;
										}
										setTimeout(function(){
											_fn.getourcoord(data,callback);
											c++;
										},t);
									}
								})
							},
							//坐标10次连续错误，说明网络确实不行……
							postPostionError:function(){
								errortime++;
								if(errortime==3) {
									alert('连续请求失败,建议重新刷新页面');
									return;
								}
								setTimeout(function(){
									_fn.postPostion(marker)
								},1000);
							},
							//发送当前坐标到搜索api，返回周边场馆
							postPostion:function(m){
								var coord=_fn.getPosition(m),
									action='/api/mi.jsp?v=geo/'+coord.lat+'/'+coord.lng;
									
								$.ajax({
									url:action,
									type:'GET',
									success:function(data){
										_fn.postPostionSuccess(data,coord.lng,coord.lat);
										that._sharehash(coord.lng,coord.lat);
									},
									error:_fn.postPostionError
								});
							}
						};
					
					//如果存在markerhtml初始值直接初始化infowindow
					if(that.markerhtml!="") {
						infowindow.setContent(that.markerhtml);
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
						Gevent.addListener(marker,'drag', function(e) {
							infowindow.close();
							clearTimeout(T);
							Circle.setCenter(e.latLng);
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
		//为了便于分享,实时更改hash值,来标记坐标
		_sharehash:function(lat,lng){
			var that=this;
			W.location.hash='lat='+lat+'&lng='+lng;
		},
		//初始化地图
		init: function() {
			
			var that=this,
				target=document.getElementById(that.target),
				hashval=W.location.hash.slice(1),
				Initlatlng=$.analyse(hashval);
				
			//加载相关css
			that._loadcss();
			//如果hash里存在经纬度，则根据url里的经纬来初始化
			if(Initlatlng['lat'] && Initlatlng['lng']){
				that.center=[Initlatlng['lat'],Initlatlng['lng']] //这是反的……
			}
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(!that.center) {
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				that._searchQ(that.q,function(location){
					if(location){
						that.center=[location['Pa'],location['Qa']];
						that.drawmap(target,that.center,that.name,that.siteNo);
					}else{
						that._Initerror(target);
					}
				});
			} else if(that.center) {
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				if(centerflg && !Initlatlng['lat'] && !Initlatlng['lng']){
					that.center=[that.center[1],that.center[0]]
					centerflg=false;
				}
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
			
			//查看大图 ，监听参数
			if(/jsmap\=lookmap/.test(W.location.href)){
				$(window).load(function(){
					if(that.coord || that.center) {
						that._BigMapaction();
					} else {
						that._errorClick();
					}
				})
			}
			
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
						latitude:$('#J_Oa').text(),
						longitude:$('#J_Pa').text(),
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