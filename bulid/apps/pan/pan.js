/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111213
 * @description 转盘游戏部分的js
 */
(function(G) {
	var pan = function() {
		var initswf = function(SWFObject) {

			window.onRouletteStart = function() {
				setTimeout(function() {
					var JSO = document.getElementById('J_SO');
					JSO.turnTo(1);
				},
				1000);
				return - 1;
			};

			window.onRouletteStop = function() {
        var JSO = document.getElementById('J_SO');
				JSO.reset();
        return -1;
			};

			var so = new SWFObject(GM.apps.host + "pan/image/Roulette.swf", "J_SO", "487px", "487px", "9");
			so.addParam("wmode", "transparent");
			so.addParam("allowscriptaccess", "always");
			so.addVariable("config", GM.apps.host + "pan/image/roulette.xml");
			so.addVariable("onStart", "onRouletteStart");
			so.addVariable("onStop", "onRouletteStop");
			so.write("J_Flash");

		};
		return {
			exports: {
				init: function() {
					GM.widget.use('swfobject', function(widget) {
						initswf(GM.widget.SWFObject);
					});
				}
			}
		};
	} ();
	if (G && G.apps) G.apps.pan = pan;
})(GM);

