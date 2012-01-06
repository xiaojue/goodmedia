/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110805
 * @fileoverview google map api 接口实现地理定位
 */
(function(W, G) {

	var map = function(cg) {

		if (!cg) return;

		var _cg = {
			q: '',
			markerhtml: '',
			name: '',
			target: '',
			width: 210,
			height: 270,
			drag: false,
			bar: true,
			revise: false,
			center: null,
			siteNo: null,
			type: null,
      reload:true,
      loaded:function(){

      },
      key:""
		};

		$.extend(_cg, cg);

		for (var i in _cg) {
			this[i] = _cg[i];
		}

	};

	var centerflg = true,
	Ka = 'Ja',
	//纬度
	La = 'Ka',
	//经度
	citycenter = {
		'北京': [39.904214, 116.40741300000002],
		'上海': [31.230393, 121.473704],
		'广州': [23.129163, 113.26443500000005],
		'深圳': [22.543099, 114.05786799999998],
		'南京': [32.060255, 118.796877],
		'杭州': [30.274089, 120.15506900000003],
		'成都': [30.658601, 104.06485599999996],
		'天津': [39.084158, 117.20098299999995],
		'西安': [34.264987, 108.94426900000008],
		'重庆': [29.56301, 106.551557],
		'昆明': [25.037721, 102.72220199999992],
		'武汉': [30.593087, 114.30535699999996],
		'郑州': [34.746985, 113.62489900000003],
		'长沙': [28.228209, 112.93881399999998],
		'福州': [26.074508, 119.29649399999994],
		'石家庄': [38.042307, 114.51486],
		'济南': [36.665282, 116.99491699999999],
		'沈阳': [41.80572, 123.43146999999999],
		'珠海': [22.270715, 113.57672600000001],
		'大连': [38.914024, 121.61467700000003],
		'青岛': [36.06722, 120.38250399999993],
		'长春': [43.817084, 125.32354199999997],
		'无锡': [31.566145, 120.30302699999993],
		'常州': [31.810077, 119.97445399999992],
		'温州': [27.994267, 120.69936699999994],
		'太原': [37.870662, 112.55061899999998],
		'佛山': [23.021548, 113.12141599999995],
		'东莞': [23.020536, 113.75176499999998],
		'哈尔滨': [45.80377499999999, 126.53496700000005],
		'呼和浩特': [40.84231, 111.74884700000007],
		'兰州': [36.061255, 103.83437700000002],
		'宁波': [29.868336, 121.54399000000001],
		'苏州': [31.298886, 120.58531600000003],
		'厦门': [24.479836, 118.08942000000002],
		'烟台': [37.463819, 121.44792600000005]
	};

	map.prototype = {
		__putoutKL: function() {
			var that = this;
			var cityAry = ['北京', '上海', '广州', '深圳', '南京', '杭州', '成都', '天津', '西安', '重庆', '昆明', '武汉', '郑州', '长沙', '福州', '石家庄', '济南', '沈阳', '珠海', '大连', '青岛', '长春', '无锡', '常州', '温州', '太原', '佛山', '东莞', '哈尔滨', '呼和浩特', '兰州', '宁波', '苏州', '厦门', '烟台'];
			//只能10个10个读
			for (var i = 0; i < cityAry.length; i++) { (function(i) {
					that._searchQ(cityAry[i], function(results) {
						if (results) {
							console.log(cityAry[i] + ':' + results[Ka] + ',' + results[La]);
						}
					});
				})(i);
			}
		},
		//加载css
		_loadcss: function() {
			var host = GM.widget.host,
			place = '-min';
			if (GM.debug) place = '';
			$.loadcss(host + 'map/map' + place + '.css');
		},
		//模糊搜索返回经纬度
		_searchQ: function(q, callback) {
			if (google) {
				var Gmap = google.maps,
				geocoder = new Gmap.Geocoder();
				if (citycenter.hasOwnProperty(q)) {
					if (callback) {
						var obj = {};
						obj[Ka] = citycenter[q][0];
						obj[La] = citycenter[q][1];
						obj.lat = function() {
							return obj[Ka];
						};
						obj.lng = function() {
							return obj[La];
						};
						callback(obj);
						return;
					}
				}
				geocoder.geocode({
					'address': q
				},
				function(results, status) {
					if (status == Gmap.GeocoderStatus.OK) {
						var location = results[0].geometry.location;
						if (callback) callback(location);
					} else {
						if (callback) callback(null);
					}
				});
			}
		},
		//绘制地图的主函数
		drawmap: function(target, center, name, siteNo) {
			//center 为一个数组，而非object
			if (google) {
				var that = this,
				T, Circle, errortime = 0,
				markersArray = [],
				Gmap = google.maps,
				Gevent = Gmap.event,
				infowindow = new Gmap.InfoWindow(),
				latlng = new Gmap.LatLng(center[0], center[1]),
				//首次加载定义的中心点
				myOptions = {
					zoom: 15,
					center: latlng,
					mapTypeId: Gmap.MapTypeId.ROADMAP
				};

				var map = new Gmap.Map(target, myOptions); //载入地图
        Gevent.addListener(map,'tilesloaded',that.loaded);
				var marker = new Gmap.Marker({
					title: name,
					position: latlng,
					map: map,
					draggable: function() {
						if (that.drag || that.type == "search") return true;
						return false;
					} ()
				});

				var _fn = {
					//设置坐标值
					setlatlng: function(m, c) {
						var center = m.getPosition();
            $('#J_Coord').html('lat:<input style="width:50px;" type="text" id="J_Pa" value="'+center.lat()+'"><br/>lng:<input style="width:50px;" type="text" id="J_Oa" value="'+center.lng()+'">');
					},
					//删除标记和圆圈
					deleteMarkers: function(ary, cle) {
						if (ary) {
							for (i in ary) {
								ary[i].setMap(null);
							}
							ary.length = 0;
						}
						if (cle) cle.setMap(null);
					},
					infoshow: function(info, msg, position) {
						clearTimeout(T);
						info.setContent(msg);
						if (position) info.setPosition(position);
						info.open(map);
						T = setTimeout(function() {
							info.close();
						},
						3000);
					},
					//显示地图浮出层
					infowindowShow: function(info, l) {
						_fn.infoshow(info, '在此3公里范围找到了' + l + '家健身会馆,拖动此标志可继续查找', marker.getPosition());
					},
					//给周边场馆增加坐标和事件
					addrimmarkers: function(ary, map, info, markAry) {
						var infotemp = '<div class="info-window" style="height:90px;">' + '<p><a href="/s/{siteno}" target="_blank" class="green">{name}</a></p>' + '<p class="coaches">入驻教练：{coaches}</p>' + '<p>会所电话：{tel}</p>' + '<p class="map_more"><a href="/s/{siteno}" target="_blank">会所详细介绍&gt;&gt;</a></p>' + '</div>';
            var key=(G.widget.map.key==='undefined')? "undefined" : G.widget.map.key; 
            var iconmap={
              'undefined':'http://s1.ifiter.com/static/images/map/124.png',
              '莱美':'http://s1.ifiter.com/static/images/map/sm1.png',
              'NTC':'http://s1.ifiter.com/static/images/map/sm2.png',
              'zumba':'http://s1.ifiter.com/static/images/map/sm3.png',
              '乒乓球':'http://s1.ifiter.com/static/images/map/sm4.png',
              '街舞':'http://s1.ifiter.com/static/images/map/sm5.png',
              '力量训练':'http://s1.ifiter.com/static/images/map/sm6.png',
              '跆拳道':'http://s1.ifiter.com/static/images/map/sm7.png',
              '游泳':'http://s1.ifiter.com/static/images/map/sm8.png',
              '瑜伽':'http://s1.ifiter.com/static/images/map/sm9.png',
              '羽毛球':'http://s1.ifiter.com/static/images/map/sm10.png'
            };
						//清空暂存动作
						_fn.infoopen = {};
						for (var i = 0; i < ary.length; i++) { (function(i) {
								var result = ary[i],
								resultlat = result['lat'],
								resultlng = result['lng'],
								resultname = result['name'];
								function addMarker(name, lat, lng) {
									var newlatlng = new Gmap.LatLng(lat, lng),
									newmarker = new Gmap.Marker({
										title: name,
										position: newlatlng,
										map: map,
										icon:iconmap[key] 
									});

									markAry.push(newmarker);

									var msg = $.substitute(infotemp, result);

									//给找到的场馆marker对象绑定点击事件
									Gevent.addListener(newmarker, 'click', function() {
										var current = i + 1,
										max = 10,
										page = Math.ceil(current / max);
										_fn.infoshow(info, msg, newlatlng);
										_fn.flip(page, $('#J_MAP_RightBar li'), i); //指定哪个打开
									});
									//暂存这个动作
									_fn.infoopen[i] = function() {
										_fn.infoshow(info, msg, newlatlng);
									};
								}

								result['coaches'] = function() {
									var tempary = result['coaches'],
									returnstr = "";
									if (tempary.length === 0) return '暂无教练信息';
									for (var i = 0; i < tempary.length; i++) {
										var tempobj = tempary[i];
										returnstr += '<a href="/uc/' + result["siteno"] + '/' + tempobj["cid"] + '" target="_blank" class="green">' + tempobj["cname"] + '</a>';
									}
									return returnstr;
								} ();

								//如果场馆坐标为0.0 就是数据库没有
								if (resultlat == "0.0" && resultlng == "0.0") {
									that._searchQ(result['cityZone'], function(location) {
										if (location) {
											addMarker(resultname, location.lat(), location.lng());
										}
									});
								} else {
									addMarker(resultname, resultlat, resultlng);
								}

							})(i);

							//给相关infowindow 绑定关闭延迟事件
							$('.info-window').die();
							$('.info-window').live('mouseover', function() {
								clearTimeout(T);
							});
							$('.info-window').live('mouseout', function() {
								T = setTimeout(function() {
									info.close();
								},
								3000);
							});
						}
					},
					//缓存每个场馆最新的info动作 {index:fun}
					infoopen: {},
					//生成左侧列表
					createRightlist: function(data) {
            var errorhandle = "this.parentNode.removeChild(this);";
            var key=(G.widget.map.key==='undefined')? "" :G.widget.map.key;
            var classmap={
              'undefined':'',
              '莱美':'sm1',
              'NTC':'sm2',
              'zumba':'sm3',
              '乒乓球':'sm4',
              '街舞':'sm5',
              '力量训练':'sm6',
              '跆拳道':'sm7',
              '游泳':'sm8',
              '瑜伽':'sm9',
              '羽毛球':'sm10'
            };
						var returnstr = '<ul class="maplist '+classmap[key]+'">';
						for (var i = 0; i < data.length; i++) {
							var obj = data[i],
							temp = '<li data-index="' + i + '">' + '<p class="map_title"><a href="javascript:void(0)">{name}</a></p>' + '<p><span>会馆特色：</span>{feature}</p>' + '<p><span>特色项目：</span>{items}</p>' + '<p><span>会所电话：</span>{tel}</p>' + '<p><span>所在城市：</span>{cityZone}</p>' + '<p class="map_pic"><a href="/s/{siteno}" target="_blank"><img src="{logo}" width="120" height="120" title="{name}" alt="{name}" onerror="' + errorhandle + '"></a></p>' + '<p class="map_more"><a href="/s/{siteno}" target="_blank">会所详细介绍&gt;&gt;</a></p>' + '</li>';
							for (var j in data[i]) {
								if (data[i][j] === "") data[i][j] = '暂无';
							}
							temp = $.substitute(temp, data[i]);
							returnstr += temp;
						}
						return returnstr += '</ul>';
					},
					//生成分页分页
					paglist: function(data) {
						if (data.length < 10) return '';
						var returnstr = "<div id='J_Paglist' data-current='1'>",
						max = 10,
						page = 0;
						if (data.length > 10) returnstr += '<b id="J_PagBack">上一页</b>';
						for (var i = 0; i < data.length; i++) {
							if (i % max === 0) {
								page++;
								returnstr += '<span data-num="' + page + '">[' + page + ']</span>';
							}
						}
						if (data.length > 10) returnstr += '<b id="J_PagNext">下一页</b>';
						return returnstr += '</div><input type="hidden" value="' + page + '" id="J_PagLength">';
					},
					//翻到第几页
					flip: function(current, lis, guide) {
						var max = 10;
						lis.hide();
						lis.each(function(i, node) {
							var index = i + 1;
							if (index <= current * max && index > (current - 1) * max) {
								$(node).show();
							}
						});
						//保存当前指针到节点
						$('#J_Paglist').attr('data-current', current);
						//折叠
						if (!guide) guide = (current - 2) * max + max; //不存在指定打开哪一个，找到当前页的第一个
						_fn.Rightfold(guide);
						//打开对应的map info
						if (_fn.infoopen[guide]) _fn.infoopen[guide]();
						//根据当前状态判断是否显示上下页
						var l = $('#J_PagLength').val();
						if (current == 1) $('#J_PagBack').hide();
						else $('#J_PagBack').show();

						if (current == l) $('#J_PagNext').hide();
						else $('#J_PagNext').show();

						//给当前的span增加current样式
						var currentSpan = $('#J_Paglist>span').eq(current - 1),
						text = currentSpan.text();
						$('#J_Paglist>span').each(function() {
							$(this).removeClass('current');
							var num = $(this).text().match(/\d/g)[0];
							$(this).text('[' + num + ']');
						});
						currentSpan.addClass('current');
						currentSpan.text(text.replace(/\[|\]/g, ''));
					},
					//右侧列表折叠切换
					Rightfold: function(guide) {
						//全部隐藏,并且去掉当前的样式
						$('.maplist li>p').find('a').removeClass('active');
						$('.maplist li>p').not('.map_title').hide();
						//第N个打开
						$('.maplist li:eq(' + guide + ')>p').show().find('a').addClass('active');
						//绑定事件
						$('.map_title').die();
						$('.map_title').live('click', function() {
							$('.maplist li>p').not('.map_title').hide();
							$('.maplist li>p.map_title a').removeClass('active');
							$(this).siblings('p').show();
							$(this).parent().find('.map_title a').addClass('active');
							//触发暂存动作，调用map infowindow
							var index = $(this).closest('li').attr('data-index');
							_fn.infoopen[index]();
						});

					},
					//map和圈点击的handle
					clickseach: function(e) {
						var lat = e['latLng'].lat(),
						lng = e['latLng'].lng(),
						darwin = new Gmap.LatLng(lat, lng);
						marker.setPosition(darwin);
						_fn.postPostion(marker);
					},
					postPostionSuccess: function(data, lat, lng) {
						var darwin = new Gmap.LatLng(lat, lng); //设置新的地图中心点
						map.setCenter(darwin);
						map.setZoom(13);
						try {
							eval('var data=' + $.trim(data));
						} catch(e) {
							console.log(e);
						}

						//_fn.infowindowShow(infowindow,dataAry.length);
						if (data['r'] !== 0) return; //数据有错
						var dataAry = data['s']['result'];

						_fn.deleteMarkers(markersArray, Circle);

						//画一个3000半径的圆
						Circle = new Gmap.Circle({
							strokeColor: "#0552A5",
							fillOpacity: 0.1,
							fillColor: "#0764C1",
							map: map,
							strokeWeight: 1,
							radius: 3200,
							center: marker.getPosition()
						});
						//给范围圈绑定点击事件
						Gevent.addListener(Circle, 'click', _fn.clickseach);

						_fn.addrimmarkers(dataAry, map, infowindow, markersArray);
						_fn.pagallfire(dataAry);

						if (dataAry.length === 0) $('#J_MAP_RightBar').html('附近没有找到相应的场馆');
						//给中心点绑定点击事件
						/*
									Gevent.addListener(marker,'click', function () {
										_fn.infowindowShow(infowindow,dataAry.length);
									});
									*/

					},
					tosearch: function() {
						var q = $.trim($('#J_SearchMapText').val());
						if (q === "" || q==="请输入关键字") {
							alert('请输入搜索地址，比如:北京市 朝阳区');
							return;
						}
						that._searchQ(q, function(location) {
							if (location) {
								var darwin = new Gmap.LatLng(location.lat(), location.lng());
								map.setCenter(darwin);
								marker.setPosition(darwin);
								_fn.postPostion(marker);
							} else {
								//alert('地址解析有误,尝试换一下地名搜索');
								//如果地址google解析有问题，再传本站接口进行一次查询，再找不到，再提示错误 - 未找到相关地址
								//我回传2个参数 城市名_关键字
								_fn.getourcoord({
									city: that.q,
									q: q
								},
								function(data) {
									if (data && data['r'] === 0) {
										var dataAry = data['s']['result'];
										if (dataAry.length === 0) {
											alert('对不起，没有找到你想搜索的地名或场馆');
											return;
										}
										_fn.deleteMarkers(markersArray, Circle);
										_fn.addrimmarkers(dataAry, map, infowindow, markersArray);
										_fn.pagallfire(dataAry);
										var darwin = new Gmap.LatLng(dataAry[0]['lat'], dataAry[0]['lng'], true); //设置新的地图中心点
										map.setCenter(darwin);
										map.setZoom(11);
									} else {
										alert('系统错误');
									}
								});
							}
						});
					},
					//分页事件以及增加相关场馆标记
					pagallfire: function(dataAry) {
						//右侧栏目和分页
						var Rightlist = _fn.createRightlist(dataAry),
						pag = _fn.paglist(dataAry);
						$('#J_MAP_RightBar').html(Rightlist + pag);

						var dieary = ['#J_Paglist span', '#J_PagBack', '#J_PagNext', "#J_SearchSub", "#J_SearchMapText", "#J_ShareSina"];

						$.each(dieary, function(index, val) {
							$(val).die();
						});
						//给分页绑定事件
						$('#J_Paglist span').live('click', function() {
							var current = parseInt($(this).attr('data-num'), 10);
							_fn.flip(current, $('#J_MAP_RightBar li'));
						});

						$('#J_PagBack').live('click', function() {
							var current = parseInt($('#J_Paglist').attr('data-current'), 10);
							_fn.flip(current - 1, $('#J_MAP_RightBar li'));
							$('#J_Paglist').attr('data-current', current - 1);
						});

						$('#J_PagNext').live('click', function() {
							var current = parseInt($('#J_Paglist').attr('data-current'), 10);
							_fn.flip(current + 1, $('#J_MAP_RightBar li'));
							$('#J_Paglist').attr('data-current', current + 1);
						});

						//先分出第一页
						if (dataAry.length !== 0) _fn.flip(1, $('#J_MAP_RightBar li'));

						//给搜索绑定事件
						$('#J_SearchSub').live('click', _fn.tosearch);
						$('#J_SearchMapText').live('keydown', function(e) {
							if (e.keyCode == 13) _fn.tosearch();
            }).live('focus',function(){
                  var val=$(this).val();
                  if(val==="请输入关键字") $(this).val("");
                }).live('blur',function(){
                    var val=$(this).val();
                    if(val==="") $(this).val("请输入关键字");
                  });
						//分享到新浪微博
						$('#J_ShareSina').live('click', function() {
							var tsina = "http://v.t.sina.com.cn/share/share.php?title={T}&url={U}",
							href = $.substitute(tsina, {
								T: '哈哈，我终于在我身边半径3公里的地区找到了适合我的健身场馆，真是不看不知道啊。你也可以来试试哦。（来自：动米网）',
								U: encodeURIComponent(window.location.href)
							});
							$(this).attr('href', href);
						});
					},
					//获取自己数据库的模糊查询信息
					getourcoord: function(data, callback) {
            var key=(G.widget.map.key==='undefined')? "" :'/'+G.widget.map.key; 
            if(key=="/undefined") key="";
            var coordurl = '/api/mi.jsp?v=geokey/' + encodeURI(data.q)+key,
						c = 0,
						mc = 3,
						t = 1000;
						$.ajax({
							type: 'GET',
							url: coordurl,
							success: function(result) {
								try {
									eval('var r=' + $.trim(result));
								} catch(e) {
									//console.log(e);
									alert(e);
									var r = null;
								}
								if (callback) callback(r);
							},
							error: function() {
								if (c == mc) {
									alert('网络延迟请重新查询');
									c = 0;
									return;
								}
								setTimeout(function() {
									_fn.getourcoord(data, callback);
									c++;
								},
								t);
							}
						});
					},
					//坐标10次连续错误，说明网络确实不行……
					postPostionError: function() {
						errortime++;
						if (errortime == 3) {
							alert('连续请求失败,建议重新刷新页面');
							return;
						}
						setTimeout(function() {
							_fn.postPostion(marker);
						},
						1000);
					},
					//发送当前坐标到搜索api，返回周边场馆
					postPostion: function(m) {
						var coord = m.getPosition();
            var key=(G.widget.map.key==='undefined')? "" :'/'+G.widget.map.key; 
            if(key=="/undefined") key="";
						action = '/api/mi.jsp?v=geo/' + coord.lng() + '/' + coord.lat()+key;

						$.ajax({
							url: action,
							type: 'GET',
							success: function(data) {
								_fn.postPostionSuccess(data, coord.lat(), coord.lng());
								that._sharehash(coord.lat(), coord.lng());
								marker.setPosition(new Gmap.LatLng(coord.lat(), coord.lng(), true));
							},
							error: _fn.postPostionError
						});
					}
				};

				//如果存在markerhtml初始值直接初始化infowindow
				if (that.markerhtml !== "") {
					infowindow.setContent(that.markerhtml);
					infowindow.open(map, marker);
					Gevent.addListener(marker, 'click', function() {
						infowindow.open(map, marker);
					});
				}
				//可拖拽模式，是在修改时被触发，在editbox里显示经纬度
				if (that.drag) {
					_fn.setlatlng(marker, center);
					Gevent.addListener(marker, 'dragend', function() {
						_fn.setlatlng(marker, center);
					});
				}
				//搜索模式
				if (that.type == "search") {
					_fn.postPostion(marker); //初始化就发送
					//结束拖拽也发送
					Gevent.addListener(marker, 'dragend', function() {
						_fn.postPostion(marker);
					});

					//拖拽的时候关闭覆层，清除延迟
					Gevent.addListener(marker, 'drag', function(e) {
						infowindow.close();
						clearTimeout(T);
						Circle.setCenter(e.latLng);
					});

					//点击地图的时候也进行查找
					Gevent.addListener(map, 'click', _fn.clickseach);
				}

				//构建bar
				if (that.bar) that._bulidbar(that.target);
			}
      return map;
		},
		//构建下部导航
		_bulidbar: function(target) {
			var revise = '',
			that = this,
			bar;
			if (that.revise) revise = '<li><a href="javascript:void(0);" class="J_EditMap">修订坐标</a></li>';
			bar = '<ul class="map_bar">' + '<li><a href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>' + '<li><a href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>' + revise + '</ul>';
			$('#' + target).after(bar);
		},
		//初始化失败的时候导航的error handle
		_errorClick: function() {
			var BigMap = '<div class="emersion error">' + '<div class="msg">对不起,没有可以查看的地图信息</div>' + '<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>' + '</div>';
			G.tools.overlay.fire(BigMap);
		},
		//set wrap
		_setwrap: function(target) {
			var that = this;
			target.style.cssText += 'width:' + that.width + 'px;height:' + that.height + 'px;border:1px solid #CCC;';
		},
		//init error handler
		_Initerror: function(target) {
			target.parentNode.removeChild(target);
		},
		//为了便于分享,实时更改hash值,来标记坐标
		_sharehash: function(lat, lng) {
			var that = this;
			W.location.hash = 'lat=' + lat + '&lng=' + lng;
		},
		//初始化地图
		init: function() {

			var that = this,
			target = document.getElementById(that.target),
			hashval = W.location.hash.slice(1),
      map,Gmap = google.maps,Gevent = Gmap.event,
			Initlatlng = $.analyse(hashval);

			//加载相关css
			that._loadcss();
			//经度 lng，纬度 lat
			//如果hash里存在经纬度，则根据url里的经纬来初始化
			if (Initlatlng['lat'] && Initlatlng['lng']) {
				that.center = [Initlatlng['lat'], Initlatlng['lng']]; //这是反的……
			}
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if (!that.center) {
				//没有坐标的时候，用内置反查询搜索q的位置，如果q还没有搜到，则不显示
				that._searchQ(that.q, function(location) {
					if (location) {
						that.center = [location.lat(), location.lng()];
						map = that.drawmap(target, that.center, that.name, that.siteNo);
					} else {
						that._Initerror(target);
					}
				});
			} else if (that.center) {
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				if (centerflg && ! Initlatlng['lat'] && ! Initlatlng['lng']) {
					that.center = [that.center[1], that.center[0]];
					centerflg = false;
				}
				map = that.drawmap(target, that.center, that.name, that.siteNo);
			}

			//设置容器高宽
			that._setwrap(target);
			//that.__putoutKL();
			//查看全图-生成全局overlay对象
			$.overlay();

			//卸载绑定的live事件
			var events = ['.J_LookBigMap', '.J_LookWay', '.J_OverlayClose', '.J_EditMap', '#J_SqSub', '#J_Esub'];

			$.each(events, function(key, val) {
				$(val).die();
			});

			//绑定bar的事件
			$('.J_LookBigMap').live('click', function() {
				if (that.coord || that.center) {
					that._BigMapaction(false);
				} else {
					that._errorClick();
				}
			});

			//查看大图 ，监听参数
			if (/jsmap\=lookmap/.test(W.location.href) && that.reload) {
			  G.tools.overlay.opacity(0.5);
        var Loading = '<div class="emersion bigmap" style="width:500px;">' + '<div style="width:500px;height:500px;text-align:center;font-size:14px;line-height:500px;">地图加载中...</div>' + '<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>' + '</div>';
			  G.tools.overlay.fire(Loading);
        Gevent.addListener(map,'tilesloaded',function(){
					if (that.coord || that.center) {
						that._BigMapaction(true);
					} else {
						that._errorClick();
					}
        });
			}

			//查询路线
			$('.J_LookWay').live('click', function() {
				if (that.coord || that.center) {
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
				var diget = $(this).attr('data-diget'),
				map = new G.widget.map({
					q: $('#J_Sq').val(),
					markerhtml: '拽我，拽我，确定准确的位置~',
					target: 'J_Map_' + diget,
					width: 600,
					height: 500,
					bar: false,
					drag: true,
					name: that.name,
					siteNo: that.siteNo
				}).init();
			});

			//修改坐标
			$('.J_EditMap').live('click', function() {
				if (that.coord || that.center) {
					that._editaction();
				} else {
					that._errorClick();
				}
			});

			//重新设置保存动作
			$('#J_Esub').live('click', function() {
				that._revise();
			});
		},
		//查看大图的浮层
		_BigMapaction: function(show) {
			var diget = new Date().valueOf(),
			that = this,
			BigMap = '<div class="emersion bigmap">' + '<div id="J_Map_' + diget + '" style="height:500px;"></div>' + '<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>' + '</div>';
			G.tools.overlay.opacity(0.5);
      G.tools.overlay.fire(BigMap,function(){
       var map = new G.widget.map({
				q: that.q,
				markerhtml: that.markerhtml,
				target: 'J_Map_' + diget,
				width: 500,
				height: 500,
				bar: false,
				name: that.name,
        reload:false,
				center: that.center,
				siteNo: that.siteNo
			  }).init();
      },show);
     
		},
		//查询路线浮层
		_lookway: function() {
			var that = this;
			var Way = '<div class="emersion lookway">' + '<form action="http://ditu.google.cn/maps" method="get" target="_blank">' + '<div class="lookway_title">请输入出发所在地</div>' + '<div class="lookway_content">' + '<span>出发地</span>' + '<input type="text" name="saddr" class="profile_box1">' + '</div>' + '<div><input type="submit" value="确认" class="space_button"></div>' + '<input value="' + that.q + ',' + that.name + '" type="hidden" name="daddr"/>' + '</form>' + '<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>' + '</div>';
			G.tools.overlay.opacity(0.5);
			G.tools.overlay.fire(Way);
		},
		//触发修改动作的大浮层
		_editaction: function() {
			var diget = new Date().valueOf(),
			that = this,
			BigMap = '<div class="emersion edit">' + '<div id="J_Map_' + diget + '" style="height:500px;""></div>' + '<a href="javascript:void(0);" class="J_OverlayClose mapclose">&times</a>' + '<div class="editbox">' + '搜索:<br><input type="text" id="J_Sq"/><br/>' + '操作:<br><input type="button" data-diget="' + diget + '" id="J_SqSub" value="搜索"/> <input type="button" id="J_Esub" value="保存坐标"/><br/>' + '坐标:<br><span id="J_Coord"></span>' + '</div>' + '</div>';
			G.tools.overlay.opacity(0);
			G.tools.overlay.fire(BigMap);
			var map = new G.widget.map({
				q: that.q,
				markerhtml: '拽我，拽我，确定准确的位置~',
				target: 'J_Map_' + diget,
				width: 600,
				height: 500,
				bar: false,
				drag: true,
				name: that.name,
				center: that.center,
				siteNo: that.siteNo
			}).init();
		},
		//确认修改新场馆
		_revise: function() {
			var that = this;
			if (confirm('确定保存当前标记位置为新场馆位置么？')) {
				$.ajax({
					url: '/gestion/map.jsp',
					data: {
						siteno: that.siteNo,
						latitude: $('#J_Oa').val(),
						longitude: $('#J_Pa').val(),
						act: 'update'
					},
					success: function(str) {
						var result = $.trim(str);
						if (result == 1) {
							alert('保存成功');
							window.location.href = '/gestion/map.jsp?siteno=' + that.siteNo;
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
	if (G && G.widget) G.widget.map = map;

})(window, GM);

