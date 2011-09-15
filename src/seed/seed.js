/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110915
 * @fileoverview 动米网种子文件
 */
(function(W,$,doc){
	 W.debughost='http://172.16.2.215/gm/src/';
	 var basehost,
	 		 scripts=$('script');
			 onlinejs='GM-min.js',
			 debuglist=[
			 	'core/GMcore.js',
				'tooloverlay/overlay.js',
				'tools/carousel/carousel.js',
				'tools/bubble/bubble.js',
				'tools/switchable/switchable.js',
				'tools/temp/temp.js',
				'tools/cookie/cookie.js',
				'tools/loadcss/loadcss.js',
				'widget/ie6fix/ie6fix.js',
				'widget/console/console.js',
				'widget/detercopy/detercopy.js'
			 ];

		scripts.each(function(i,script){
				var src=script.attr('src');
				if(src){
					var index=src.lastIndexOf('seed-min.js'),
							debug=src.lastIndexOf('?debug');
					if(index){
						basehost=src.slice(0,index);
							if(debug) putjs('debug');
							else putjs('normal');
						return false;
					}
				}
			});

		if(!base) throw 'base path not found';

})(window,jQuery,document);
