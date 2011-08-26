/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110819
 * @fileoverview
 * <p>全局的console对象，对其扩展之后，拥有自带调试的走自带，没有的，则返回空<br>
 * 避免调试代码污染  方便进行调试的开发模式</p>
 */
(function(W,G,$){
	
	if(!W.console){
		W.console={}
		var method=['log','debug','info','warn','exception','assert','dir','dirxml','trace','group','groupEnd','groupCollapsed','time','timeEnd','profile','profileEnd','count','clear','table','error','notifyFirebug','firebug','userObjects'];
			options=function(){
				var i,options={};
				for(i=0;i<method.length;i++){
					options[method[i]]==$.noop;
				}
			}();
			
		$.extend(W.console,options);
	};
	
})(window,GM,jQuery);
