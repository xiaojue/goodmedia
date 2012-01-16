/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111209
 * @fileoverview 返回顶部
 */
(function(W, G, $) {
	var backtop = function(target, config) {
		var _config = {
			effect: 'slow',
			fixwindow: true,
			right: 10,
			bottom: 10
		};
		$.extend(_config, config);

		var T;

		if (_config.fixwindow) {
			$(target).hide();
			$(window).bind('scroll resize', function() {
				function fixicon() {
					var scrolltop = $(window).scrollTop(),
					screenH = $(window).height(),
					screenW = $(window).width(),
					h = $(target).height(),
					w = $(target).width();
					if (scrolltop >= screenH) {
						if ($.browser.msie && $.browser.version <= 6) {
							$(target).css({
								'position': 'absolute',
								'left': screenW - _config.right - w,
								'top': scrolltop - _config.bottom - h + screenH
							});
						} else {
							$(target).css({
								'position': 'fixed',
								'right': _config.right,
								'bottom': _config.bottom
							});
						}
						$(target).fadeIn(_config.effect);
					} else {
						$(target).fadeOut();
					}
				}
				if (T) clearTimeout(T);
				T = setTimeout(fixicon, 100);
			});
		}

		$(target).live('click', function() {
			$(target).hide();
			$(window).scrollTop(0);
		});

	};
	if (G && G.widget) G.widget.backtop = backtop;
})(window, GM, jQuery);

