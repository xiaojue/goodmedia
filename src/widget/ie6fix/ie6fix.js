/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110826
 * @fileoverview 主要负责修复ie6的一些bug，去你妈的IE6 -_-||
 */
(function(W,G,$,doc){
	
	//修复png24不透明
	var fixpng24=function() {
		$('img').each(function(){
			var imgName = this.src.toUpperCase();
            if (imgName.substring(imgName.length - 3, imgName.length) == "PNG") {
            	var $img=$('<span>').css({
					width: this.offsetWidth,
	                height: this.offsetHeight,
	                display:'inline-block',
	                overflow:'hidden',
	                cursor:(this.parentElement.href) ? 'hand' : ''
				}).attr({
					'title':this.alt || this.title || '',
					'class':this.className
				});						
	            $img[0].style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+this.src+'", sizingMethod="scale")';                        
	            $(this).replaceWith($img);
            }
		});	          
    };
    
    $.extend({
		fixpng24:fixpng24
	});
	
	if($.browser.msie && $.browser.version==6){
		$(function(){
			$.fixpng24(); //修复ie6 png24
			doc.execCommand("BackgroundImageCache", false, true); //修复ie6 不缓存背景图
			//一天提醒一次
			if(!$.cookie('ie6tips') || $.cookie('ie6tips')!=1){
				G.apps.require('ie6tips',function(exports){
					exports.init();
				});
			}
		});
	};
       
})(window,GM,jQuery,document);
