/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110831
 * @fileoverview 动米网全网各种统计代码…… 不使用框架，原生实现
 */
(function(w,undefined){
	/**
	 * @namespace
	 * @description 统计用命名空间
	 */
	var statis={
		/**
		 * @function
		 * @static
		 * @description 初始化统计
		 */
		init:function(){
			var host=this,
				tool=host.tool,
				tempval=host.createTemp(),
				IDMUV=tool.cookie('IDMUV');
			
			if(!IDMUV) tool.cookie('IDMUV',tempval,{domain:'.idongmi.com',expires:365,path:'/'}); //种入cookie
		},
		/**
		 * @function
		 * @static
		 * @description 生成cookie值
		 * @returns {string} cookies value
		 */
		createTemp:function(){
			var t=new Date().valueOf().toString().slice(3),
				dictionary="A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0".split(','),
				temps=4,
				thick="";
			for(var i=0;i<temps;i++){
				thick += dictionary[Math.floor(Math.random()*36)] //允许重复
			}
			return t+thick; //时间戳截取前3位+随即4个字母or数字
		},
		/**
		 * @namespace
		 * @description 简单工具集
		 */
		tool:{
			/**
			 * @memberOf statis.tool
			 * @static
			 * @description cookie
			 */
			cookie:function (key, value, options) {
				    if (arguments.length > 1 && String(value) !== "[object Object]") {
				        options = jQuery.extend({}, options);
				
				        if (value === null || value === undefined) {
				            options.expires = -1;
				        }
				
				        if (typeof options.expires === 'number') {
				            var days = options.expires, t = options.expires = new Date();
				            t.setDate(t.getDate() + days);
				        }
				
				        value = String(value);
				
				        return (document.cookie = [
				            encodeURIComponent(key), '=',
				            options.raw ? value : encodeURIComponent(value),
				            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				            options.path ? '; path=' + options.path : '',
				            options.domain ? '; domain=' + options.domain : '',
				            options.secure ? '; secure' : ''
				        ].join(''));
				    }
				
				    options = value || {};
				    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
				    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
			}
		}
	};
	
	statis.init();
	
})(window);
