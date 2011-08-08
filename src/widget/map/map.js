/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110805
 * google map api 接口实现地理定位
 */
(function(W,G){
	
	var map=function(cg){
		
		if(!cg) return;
				
		var _cg={
			//key:'ABQIAAAAq1Xa--vGn1SHR7koD9Xm5BTH1Hm64R_rmx_EQUiffvQevaq2UBRrPuG81MSPhtwwqbqzLlB64UAGyw', //designsor.com key
			key:'ABQIAAAAq1Xa--vGn1SHR7koD9Xm5BQNvc6u1vQ7de4GkWxOLW3P1U0WbBQpubl7hCBhdn-d3hc_xlYSkNpRdg', //x.idongmi.com key
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
			siteNo:''
		};
		
		$.extend(_cg,cg);
		
		this.digit=new Date().valueOf();
		this.apiuri='http://maps.google.com/maps/geo?q='+encodeURI(_cg.q)+
				   '&output=json&callback=GM.widget.map.callback'+this.digit+'&oe=utf8\&sensor=false&key='+_cg.key;
		this.q=_cg.q;
		this.drag=_cg.drag;
		this.revise=_cg.revise;
		this.siteNo=_cg.siteNo;
		this.name=_cg.name;
		this.center=_cg.center;
		this.markerhtml=_cg.markerhtml;
		this.target=_cg.target;
		this.width=_cg.width;
		this.height=_cg.height;
		this.bar=_cg.bar;
		
	};
	
	map.prototype={
		init:function(){
			var that=this;
			
			//不给坐标的情况下，给关键字q，自己搜索绘制
			if(that.center==null){
				$.getScript(that.apiuri,that.drawmap);
				var time=5000,timeout=true; //10秒的timeout值
				//处理jsonp超时请求
				setTimeout(function(){
					if(timeout){
						GM.widget.map['callback'+that.digit]=function(){};
						error(that.target);
					}
				},time);
			}else if(that.center!=null){
				//给了坐标，直接根据坐标绘制地图，name为场馆名字
				drawmap(document.getElementById(that.target),that.center,that.name,that.siteNo);
			}
			
			
			//set wrap
			function setwrap(target){
				var target=document.getElementById(target);
				target.style.cssText+='width:'+that.width+'px;height:'+that.height+'px;';
			};
			
			//error handler
			function error(target){
				var target=document.getElementById(target);
				//target.style.cssText+='background:#ccc;text-align:center;font-size:12px;display:table-cell;vertical-align:middle;overflow:hidden;';
				target.innerHTML='<img src="http://s1.ifiter.com/static/images/maperror.gif" width="210" height="270" alt="加载失败"/>';
			};
			
			
			//bulid bar
			function bulidbar(target){
				var revise='';
				if(that.revise) revise='<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_EditMap">修订坐标</a></li>';
				var bar='<ul style="margin: 5px 0pt;width:240px;padding:0px;">'+
						'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookBigMap">查看全图</a></li>'+
						'<li style="float: left; display: block; margin: 0pt 10px;line-height:12px;font-size:12px;"><a style="color:#4077C7;" href="javascript:void(0);" class="J_LookWay">公交/驾车</a></li>'+
						revise+
						'</ul>';
				$('#'+target).after(bar);
			};
			
			//绘制地图
			function drawmap(target,center,name,siteNo){
				if(google){
    				geocoder = new google.maps.Geocoder();
				    var latlng = new google.maps.LatLng(center[0],center[1]); //首次加载定义的中心点
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
			    }
			};
			
			//取得经纬度坐标的回调函数
			GM.widget.map['callback'+that.digit]=function(data){
				timeout=false;
				var target=document.getElementById(that.target);
				if(data.Status.code==200){
					that.coord=data.Placemark[0].Point.coordinates;
					/*placemark是一个数组，可能查出多个地址，以第一个地址为准*/
					var coord=that.coord;
						drawmap(target,[coord[1],coord[0]],that.name,that.siteNo);
				}else{
					error(that.target);
				}
			};
			//设置高宽
			setwrap(that.target);
			//创建下部bar
			
			if(that.bar){
				bulidbar(that.target);
				//查看全图
				$.overlay();
				
				function errorClick(){
					var BigMap='<div style="position:relative;width:200px;height:200px;border:#ccc solid 2px;background:#fff;">'+
							'<div style="margin-top:80px;font-size:14px;color:red;text-align:center;">对不起,没有可以查看的地图信息</div>'+
								'<a href="javascript:void(0);" class="J_OverlayClose" style="position:absolute;right:-10px;top:-10px;display:block;width:15px;height:15px;background:#000;color:#fff;line-height:15px;text-align:center;">&times</a>'+
							'</div>';
					GM.tools.overlay.reset(200,200);
					GM.tools.overlay.fire(BigMap);
				}
				//绑定bar的事件
				$('.J_LookBigMap').live('click',function(){
					if(that.coord){
						var diget=new Date().valueOf(),
							BigMap='<div style="position:relative;width:500px;width:500px;border:#ccc solid 2px;">'+
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
				
				//查询路线
				$('.J_LookWay').live('click',function(){
					if(that.coord){
						var Way='<div style="position:relative;width:300px;height:100px;border:#ccc solid 2px;background:#fff;">'+
							'<form action="http://ditu.google.cn/maps" method="get" target="_blank" style="padding: 10px; text-align: center;">'+
								'<div style="color:#78A000; font-size: 14px; font-weight: bold;">请输入出发所在地</div>'+
								'<div style="margin: 10px 0pt;">'+
								'<span style="margin-right: 10px;font-size:12px;">出发地</span>'+
								'<input type="text" name="saddr" value="" class="profile_box1">'+
								'</div>'+
								'<div><input type="submit" value="确认" class="space_button"></div>'+
								'<input value="'+that.q+'" type="hidden" name="daddr"/>'+
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
							BigMap='<div style="position:relative;width:500px;width:500px;border:#ccc solid 2px;">'+
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
							drag:true,
							bar:false,
							name:that.name,
							center:that.center,
							siteNo:that.siteNo
						}).init();
					}else{
						errorClick();
					}
				});
			};
			
		}
	};
	
	if(G && G.widget) G.widget.map=map;
	
})(window,GM);