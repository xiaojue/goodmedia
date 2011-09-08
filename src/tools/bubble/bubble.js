/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W,doc,$,G){
	
	var bubble=function(config){
		var _config={
			width:0,
			height:0,
			cls:'',
			postion:'bottom', //left right top bottom 上下左右
			target:'',
			id:'#J_Bubble'+new Date().valueOf().toString().slice(3)
		}
		
		$.extend(_config,config);
		
		this.config=_config;
	};
	
	
	bubble.prototype={
		init:function(){
			var that=this,cg=that.config;
			that.createWrap(cg.target);
		},
		remove:function(){
			var that=this,cg=that.config;
			$(cg.id).remove();
		},
		show:function(){
			var that=this,cg=that.config;
			$(cg.id).show();
		},
		hide:function(){
			var that=this,cg=that.config;
			$(cg.id).hide();
		},
		setcontent:function(html){
			var that=this,cg=that.config;
			$(cg.id).html(html);
		},
		createWrap:function(target){
			var cg=this.config,
				postion=$(target).offset(),
				boxH=$(target).height(),
				boxW=$(target).width(),
				postionsign={
				bottom:{
					left:postion.left-(cg.width/2),
					top:postion.top+boxH
				},
				top:{
					left:postion.left-(cg.width/2),
					top:postion.top-cg.height
				},
				right:{
					left:postion.left+boxW,
					top:postion.top-(cg.width/2)
				},
				left:{
					left:postion.left-cg.width,
					top:postion.top-(cg.width/2)
				}
			};
			
			//根据位置进行创建wrap
			if(postionsign.hasOwnProperty(cg.postion)){
				var wrap=$('<div>')
					.height(cg.height)
					.width(cg.width)
					.addClass(cg.cls)
					.offset({
					left:postionsign[cg.postion].left,
					top:postionsign[cg.postion].top
					})
					.css({
						'z-index':50,
						'position':'absolute',
						'display':'none'
					})
					.attr('id',cg.id.slice(1));
				$('body').prepend(wrap);
			}else{
				console.log('config.postion is error puts left,right,top or bottom');
			}
		}
	}
	
	$.extend({
		bubble:bubble
	});
	
})(window,document,jQuery,GM);
