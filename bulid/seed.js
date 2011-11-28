/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110915
 * @fileoverview 动米网种子文件，负责加载和初始化整个js库
 */
(function(W, $, doc) {
  /**
   * @description 增加防套嵌代码
   */
  (function(){
  try{
    var topHost=W.top.location.hostname,
    Host=W.location.hostname;
    if(W.self!=W.top && topHost != Host && doc.referrer.search(/http:\/\/[^\/]+\.idongmi\.com/i) !== 0){
      W.top.localtion.href = W.self.location.href;
    }
  }catch(e){
    if (doc.referrer.search(/http:\/\/[^\/]+\.idongmi\.com/i) !== 0) {
       W.top.location.href = W.location.href;
    }    
  }
  })();
	/** 
    * @static
    * @description debug的信息，host保存调试机器项目路径
    */
	W.GMDEBUG = {
		host: 'http://localhost/gm/',
		aver: W.location.href.match('debug')
	};
	var basehost, debughost = W.GMDEBUG.host + 'src/',
	version = '20110915',
	loadtype = 'normal',
	scripts = $('script'),
	onlinejs = 'GM-min.js',
	debuglist = ['core/GMcore.js', 'tools/overlay/overlay.js', 'tools/carousel/carousel.js', 'tools/bubble/bubble.js', 'tools/switchable/switchable.js', 'tools/temp/temp.js', 'tools/cookie/cookie.js', 'tools/loadcss/loadcss.js', 'widget/ie6fix/ie6fix.js', 'widget/console/console.js', 'widget/detercopy/detercopy.js'],
	putjs = function(type) {
		var fn = {
			debug: function() {
				$.each(debuglist, function(i, path) {
					doc.write('<script charset="utf-8" type="text/javascript" src="' + debughost + path + '"></script>');
				});
			},
			normal: function() {
				doc.write('<script charset="utf-8" type="text/javascript" src="' + basehost + onlinejs + '?t=' + version + '.js"></script>');
			}
		};
		if (type) fn[type]();
	};

	scripts.each(function(i, script) {
		var src = $(script).attr('src');
		if (src) {
			var index = src.lastIndexOf('seed-min.js');
			if (index != - 1) {
				basehost = src.slice(0, index);
				return false;
			}
		}
	});

	if (!basehost) throw 'base path not found';

	if (W.GMDEBUG.aver) loadtype = 'debug';

	putjs(loadtype);

})(window, jQuery, document);

	

