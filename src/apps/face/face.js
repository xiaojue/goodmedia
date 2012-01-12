/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110831
 * @fileoverview 管理表情的类
 */
(function(W,G,$){
	
	var face = function(config){
		
		function sole(tag){
			return tag+new Date().valueOf().toString().slice(3);
		}
		
		var _config={
			cls:sole('.J_FaceM'),
			wrapid:sole('#J_FaceWrap'),
			ulid:sole('#J_FaceUl'),
			main:'',
			facebag:{
				root:'http://s1.ifiter.com/static/images/sina_ico/',
				format:'gif',
				data:{
					'威武':'vw_thumb',
					'给力':'geili_thumb',
					'神马':'horse2_thumb',
					'浮云':'fuyun_thumb',
					'呵呵':'smile',
					'嘻嘻':'tooth',
					'哈哈':'laugh',
					'爱你':'love',
					'晕':'dizzy',
					'泪':'sad',
					'馋嘴':'cz_thumb',
					'抓狂':'crazy',
					'哼':'hate',
					'抱抱':'bb_thumb',
					'可爱':'tz_thumb',
					'怒':'angry',
					'汗':'sweat',
					'困':'sleepy',
					'害羞':'shame_thumb',
					'睡觉':'sleep_thumb',
					'钱':'money_thumb',
					'偷笑':'hei_thumb',
					'酷':'cool_thumb',
					'衰':'cry',
					'吃惊':'cj_thumb',
					'闭嘴':'bz_thumb',
					'鄙视':'bs2_thumb',
					'挖鼻屎':'kbs_thumb',
					'花心':'hs_thumb',
					'鼓掌':'gz_thumb',
					'失望':'sw_thumb',
					'思考':'sk_thumb',
					'生病':'sb_thumb',
					'亲亲':'qq_thumb',
					'怒骂':'nm_thumb',
					'太开心':'mb_thumb',
					'懒得理你':'ldln_thumb',
					'右哼哼':'yhh_thumb',
					'左哼哼':'zhh_thumb',
					'嘘':'x_thumb',
					'委屈':'wq_thumb',
					'吐':'t_thumb',
					'可怜':'kl_thumb',
					'打哈气':'k_thumb',
					'顶':'d_thumb',
					'疑问':'yw_thumb',
					'握手':'ws_thumb',
					'耶':'ye_thumb',
					'good':'good_thumb',
					'弱':'sad_thumb',
					'不要':'no_thumb',
					'OK':'ok_thumb',
					'赞':'z2_thumb',
					'来':'come_thumb',
					'蛋糕':'cake',
					'心':'heart',
					'伤心':'unheart',
					'月亮':'moon',
					'下雨':'rain',
					'太阳':'sun'
				}
			},
			target:'',
			html:'<div class="popup1_rounded" id="{wrapid}">'+
				    '<div class="popup1_cont">'+
				        '<div class="face">'+
				        	'<ul id="{ulid}">'+
				        		//'<li><a class="'+_config.cls.slice(1)+'" href="javascript:void(0);" data-meaning="{meaning}"><img src="{src}"></a></li>'+
				        	'</ul>'+
				        	'<div class="clear"></div>'+
				        '</div>'+
				    '</div>'+
				    '<div class="clear"></div>'+
				    '<div><img src="http://s1.ifiter.com/static/images/popup1_bbg.png"></div>'+
				'</div>'		
    };
		
    $.extend(_config,config);
		
		this.config=_config;
	};
	
	face.prototype={
		drawface:function(str){
			var that=this,
				cg=that.config,
				data=cg.facebag.data,
				root=cg.facebag.root,
        format=cg.facebag.format,
		    ret=str.replace(/\[(.*?)\]/g,function($0,$1){
					if(data[$1]){
						return ' <img src="'+root+data[$1]+'.'+format+'" alt="'+$1+'" title="'+$1+'"> ';
					}else{
						return $0;
					} 
				});
			return ret;				
		},
    drawurl:function(str){
      var regUrl=/(htt(p|ps):\/\/[A-Za-z\.\d\/\?\&\=\#_]+)\b/gi;
       var Urls=str.replace(regUrl,function(s1,s2,s3,s4){
          var uri=s2;
          return '<a href="'+uri+'" target="_blank">'+uri+'</a>';
        });
       return Urls;
    },
		putsface:function(){
			var that=this,cg=that.config;
				
				var html=$.substitute(cg.html,{
					wrapid:cg.wrapid.slice(1),
					ulid:cg.ulid.slice(1)
				});
				
				var face=new $.bubble({
						width:323,
						height:209,
						target:cg.target,
						postion:"bottom"
					});
					face.init();
					
				var data=cg.facebag.data,
					root=cg.facebag.root,
					format=cg.facebag.format,
					lis="";
				for(var i in data){
          lis += '<li><a class="'+cg.cls.slice(1)+'" href="javascript:void(0);" data-meaning="'+i+'" style="background:url('+root+data[i]+'.'+format+') no-repeat 2px 1px;"></a></li>';
				}
				
				$(cg.target).live('click',function(e){
					e.stopPropagation();
					face.setcontent(html);
					face.show();
					$(cg.ulid).html(lis);
          face.fixlocation();
          $(that).trigger('face:click');
				});
				
				$('body').live('click',function(e){
            var l=$(e.target).parents(face.config.id).length;
            if( l=== 0){
						face.hide();
            $(that).trigger('face:click');
					}
				});
				
				$(cg.cls).live('click',function(){
					var mean=$(this).attr('data-meaning'),v=$(cg.main).val();
					face.hide();
					$(cg.main).val(v+'['+mean+']').focus();
          $(that).trigger('face:click');
				});
		},
		init:function(){
			var that=this,cg=that.config;
			that.putsface();
		}
	};
	
	//绑定到apps.face.exprots上
	if(G && G.apps) {
		G.apps.face={
			exports:{
				face:face
			}
    };
  }
	
})(window,GM,jQuery);
