/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110807
 * @fileoverview
 * <p>直接引用jquery 开源cookie插件
 * <a href="https://github.com/carhartl/jquery-cookie" target="_blank">jquery-cookie</a></p>
 */
(function(W,G,$){
	/**
	 * @memberOf jQuery
	 * @class
	 * @description 存取改cookie值
	 * @param {string} key cookie的键值
	 * @param {string} value 设置cookie的新值
	 * @param {objcet} options
	 * @property {boolen} [raw=false] 是否encodeURIComponent
	 * @property {number} [expires=-1] 过期时间，天为单位
	 * @property {string} [path=""] cookie路径
	 * @property {string} [domain=""] domain设置
	 * @property {boolen} [secure="secure"] 默认是secure的
	 * @example
	 *  <h3>使用方法</h3>
	 *	<p>Create session cookie:<br>
	 *	$.cookie('the_cookie', 'the_value');<br>
	 *	Create expiring cookie, 7 days from then:<br>
	 *	$.cookie('the_cookie', 'the_value', { expires: 7 });<br>
	 *	Create expiring cookie, valid across entire page:<br>
	 *	$.cookie('the_cookie', 'the_value', { expires: 7, path: '/' });<br>
	 *	Read cookie:<br>
	 *	$.cookie('the_cookie'); // => 'the_value'<br>
	 *	$.cookie('not_existing'); // => null<br>
	 *	Delete cookie by passing null as value:<br>
	 *	$.cookie('the_cookie', null);</p> 
	 */
	var cookie = function (key, value, options) {
	    // key and at least value given, set cookie...
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
	
	    // key and possibly options given, get cookie...
	    options = value || {};
	    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
	    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
	};
	
	$.extend({
		cookie:cookie
	});
	
})(window,GM,jQuery);
