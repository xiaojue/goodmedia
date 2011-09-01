/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110831
 * @fileoverview 管理表情的类
 */
(function(W,G,$){
	
	var face = function(config){
		var _config={
			facebag:{
				
			}
		}
		
		$.extend(_config,config);
		
		this.config=_config;
	};
	
	face.prototype={
		drawface:function(){
			
		},
		putsface:function(){
			
		},
		getcursor:function(){
			
		}
	};
	
	//绑定到apps.face.exprots上
	if(G && G.apps) {
		G.apps.face={
			exports:{
				init:face
			}
		}
	}
	
})(window,GM,jQuery);
