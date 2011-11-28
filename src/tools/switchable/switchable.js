/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110906
 * @fileoverview switchable组件，哥实在扛不住挨个页面写一堆了……,没什么好介绍的，直接看cg参数
 */
(function(W,G,$){
  /**
   * @memberOf jQuery
   * @description  switchable组件，哥实在扛不住挨个页面写一堆了……,没什么好介绍的，直接看cg参数
   */
	var switchable=function(cg){
		
		function _switch(cg){
			var _cg={
				shownu:0, //默认第一个显示
				targets:null, //elements
				wraps:null, //elements
				action:'click',
				switchafter:function(){}
      };
			
			$.extend(_cg,cg);
			
			this.config=_cg;
		}
		
		_switch.prototype={
      /**
       * @name jQuery.switchable#init
       * @description 初始化switch，参数均在config里设置
       */
			init:function(){
				var that=this,cg=that.config;
				$(cg.wraps).hide();
				$(cg.wraps).eq(cg.shownu).show();
				$(cg.targets).live(cg.action,function(){
					var ele=$(this),
						index=ele.index(cg.targets),
						wrap=$(cg.wraps).eq(index);
						$(cg.wraps).hide();
						wrap.show();
						cg.shownu=index;
						cg.switchafter(index,ele,wrap);
				});
			}
    };
		
		return new _switch(cg).init();
		
	};
	
	$.extend({
		switchable:switchable
  });
	
})(window,GM,jQuery);
