/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview
 * <p>阻止用户复制区域文本 | IE阻止全部复制，非IE阻止局部复制<br>
 * IE下如果不全部屏蔽功能，则可以通过ctrl+a或者从其他节点复制过来，造成影响。这里封装为IE下强制屏蔽复制，什么都不可以选，不可以复制。</p>
 */
(function(W,doc,G){
  /**
   * @name GM.widget.detercopy
   * @function
   * @description 阻止用户勾选与复制，ie非ie通用
   */
	var detercopy=function(selector){
		$(function(){
		
			if($(selector).length==0) return;
			
			if(document.attachEvent){
				
				var falseFn=function(){return false;};
				
				doc.body.attachEvent("onselectstart",falseFn);
				
				doc.body.attachEvent('oncontextmenu',falseFn);
				
				doc.body.attachEvent('oncopy',falseFn);
				
				doc.body.attachEvent('oncut',falseFn);
				
				$(document).keydown(function(){
					if(event.ctrlKey && event.keyCode==67){
						event.keyCode=0;
						event.returnValue=false;
					}
				});
				
				if(doc.selection){
					doc.selection.empty();
					doc.unselectable = "on";
   					doc.documentElement.style['userSelect'] = "none";
				}
				
			}else{
				$(selector).each(function(index,node){
					node.style.cssText+="-moz-user-select:none;-webkit-user-select:none;";
				});
			}
		});
	}
	
	if(G && G.widget){
		G.widget.detercopy=detercopy;
		/**
		 * 主动触发一次,禁止复制的钩子为J_NoCopy
		 */
		G.widget.detercopy('.J_NoCopy');
	} 
	
})(window,document,GM);
