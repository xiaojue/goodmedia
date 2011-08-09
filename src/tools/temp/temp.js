/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110808
 * 模板替换，操作模板字符串等方法集合
 */
(function(W,G,$){
	
	var temp=function(){
		
		return{
			//先写一个replace方法用着-copy for kissy~
			substitute:function(str,o,regexp){
	            return str.replace(regexp || /\\?\{([^{}]+)\}/g, function(match, name) {
	                if (match.charAt(0) === '\\') {
	                    return match.slice(1);
	                }
	                return (o[name] === undefined) ? '' : o[name];
	            });				
			}
		}
	}();
	
	//扩展到jquery对象上
	$.extend({
		substitute:temp.substitute
	});
	
})(window,GM,jQuery);
