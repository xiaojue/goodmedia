/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111205
 * @description 好友买卖游戏app
 */
(function(W, G, $) {
	var salegame = function() {

    $.overlay();

		var tools = {
			firelay: function(content) {
        GM.tools.overlay.fire(content);
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
           *   afterfire:fn
           *  }
           * }
           */
          for (var i in config) { (function(i) {
							var cls = config[i];
							$(i).live('click', function() {
                  tools.firelay(cls['content'],cls['fired']);
                  if (cls['afterfire']) cls['afterfire']();
                  return false;
              });
						})(i);
					}
				},
				caller: function(type) {
          if(top==self) return;
          var types={
            'close':tools.closelay,
            'reload':function(){
              top.location.reload();
            }
          };
          if(types[type]) types[type]();
        }
			}
		};
	} ();

	if (G && G.apps) G.apps.salegame = salegame;

})(window, GM, jQuery);

