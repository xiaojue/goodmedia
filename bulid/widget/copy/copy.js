/**
 * @author fuqiang
 * @version 20110902
 * @fileoverview 复制文本到剪切板，不支持的非IE则做焦点移上手动复制
 */
(function(W,$,G){
  /**
   * @name GM.widget.copy
   * @class
   * @description 复制到剪切板的功能
   * @param {Element} btn 触发的按钮
   * @param {String} txt 复制的文本
   * @param {Element} target 需要显示复制文本的区域
   */
	var copy=function(btn,txt,target){
		var _copy=function(txt){
			   if($.browser.msie) {   
	            	clipboardData.setData('Text',txt);   
	            	alert ("该地址已复制到剪切板！");   
	        	} else {
	        		if(target){
	        			$(target).show().val(txt).focus().select().click(function(){
	        				$(this).select();
	        			});
	        			if($('#J_CopyFuck').length==0){
	        				$(target).after('<div class="red" id="J_CopyFuck">非IE浏览器请手动CTRL+C复制地址</div>');
	        			}
	        		}else{
		            	prompt("非IE内核浏览器，请复制以下地址：",txt); //去你妈的非IE内核...  
	        		}   
	        	}  
		};
		$(btn).live('click',function(){
			_copy(txt);
		});
	}
	
	if(G && G.widget) G.widget.copy=copy;
	
})(window,jQuery,GM);
