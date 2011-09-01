/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W,doc,$,G){
	
	var bubble=function(config){
		var _config={
			width:200,
			height:200,
			cls:'',
			postion:'bottom', //left right top bottom {left:,top:} 上下左右或者自己定义屏幕位置
			target:'#xxx'
		}
		
		$.extend(_config,config);
		
		function createWarp(){
			
		};
		
		function getpostion(){
			
		};
		
		function setpostion(){
			
		};
		
		function hideWarp(){
			
		};
		
		function showWarp(){
			
		};
		
		return {
			init:function(){
				
			},
			destroy:function(){
				
			},
			show:showWarp,
			hide:hideWarp
		}
		
	}();
	
	$.extend({
		bubble:bubble
	});
	
})(window,document,jQuery,GM);
