/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110807
 * 直接引用jquery 开源cookie插件
 * https://github.com/carhartl/jquery-cookie
 *
 *	 使用方法
 *	Create session cookie:
 *	
 *	GM.cookie('the_cookie', 'the_value');
 *	
 *	Create expiring cookie, 7 days from then:
 *	
 *	GM.cookie('the_cookie', 'the_value', { expires: 7 });
 *	
 *	Create expiring cookie, valid across entire page:
 *	
 *	GM.cookie('the_cookie', 'the_value', { expires: 7, path: '/' });
 *	
 *	Read cookie:
 *	
 *	GM.cookie('the_cookie'); // => 'the_value'
 *	GM.cookie('not_existing'); // => null
 *	
 *	Delete cookie by passing null as value:
 *	
 *	GM.cookie('the_cookie', null);
 */
(function(W,G,$){
	
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
