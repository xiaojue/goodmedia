/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110808
 * @fileoverview 模板替换，操作模板字符串等方法集合$.substitute,$.analyse
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
			},
			//传入xx=oo&aa=bb，返回相应object
			analyse:function(str){
				var str=$.trim(str);
				if(str=="" || !str) return {};
				var tempary=str.split('&'),i,returnobj={};
					for(i=0;i<tempary.length;i++){
						var data=tempary[i].split('='),val='';
						if(data.length>2){
							for(var i=1;i<data.length;i++){
								val+=data[i]+'=';
							}
							val=val.slice(0,val.length-1);
						}else{
							val=data[1];
						}
						returnobj[data[0]]=val;
					}
				return returnobj;
			}
		}
	}();
	
	//扩展到jquery对象上
	$.extend({
		substitute:temp.substitute,
		analyse:temp.analyse
	});
	
})(window,GM,jQuery);
