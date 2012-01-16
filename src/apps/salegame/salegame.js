/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111205
 * @fileoverview 好友买卖游戏app
 */
(function(W, G, $) {
	var salegame = function() {

		$.overlay();

		var tools = {
			firelay: function(content, changeContent, ele) {
				var html = (changeContent !== undefined) ? changeContent(content, ele) : content;
				GM.tools.overlay.fire(html);
			},
			closelay: function() {
				top.GM.tools.overlay.close();
			}
		};

		return {
			exports: {
				receptor: function(config) {
					/**
           * config={
           *  cls:{
           *   content:'',
           *   afterfire:fn,
           *   changeContent:fn,
           *   check:fn
           *  }
           * }
           */
					for (var i in config) { (function(i) {
							var cls = config[i];
							$(i).live('click', function() {
								var that = $(this);
								var args = {
									fire: function() {
										tools.firelay(cls['content'], cls['changeContent'], that);
									}
								};
								if (cls['check']) {
									cls['check'](args,that);
								} else {
									args.fire();
								}
								if (cls['afterfire']) cls['afterfire']();
								return false;
							});
						})(i);
					}
				},
				caller: function(type) {
					if (top == self) return;
					var types = {
						'close': tools.closelay,
						'reload': function() {
							top.location.reload();
						}
					};
					if (types[type]) types[type]();
				}
			}
		};
	} ();

	if (G && G.apps) G.apps.salegame = salegame;

})(window, GM, jQuery);

