/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111207
 * @description 通用走马灯
 */
(function(W, G, $) {
	var roll = function(wrap, config) {
		this.wrap = wrap;
		this.scrollWrap = '#J_ScrollWrap' + new Date().valueOf();
		this.T = null;
		this.clone = null;
		var _config = {
			towards: 'up',
			//4个prototype方向
			height: 300,
			width: 300,
			speed: 200,
			auto: true,
			endtype: 'endtoend' // endtoend 首位相接
		};
		$.extend(_config, config);
		this.config = _config;
	};

	roll.prototype = {
		_roll: function(towards) {
			var that = this,
			wrap = $(that.wrap),
			scrollWrap = $(that.scrollWrap),
      clone = that.clone,
			transverse = function() {
				return {
					left: wrap.position().left
				};
			},
			vertical = function() {
				return {
					top: wrap.position().top
				};
			},
			top = wrap.position().top,
			left = wrap.position().left,
      clonetop=clone.position().top,
      cloneleft=clone.position().left;
			var count = {
				up: function() {
					top--;
          clonetop--;
					wrap.css('top', top);
					that.clone.css('top', clonetop);
				},
				down: function() {
					top++;
          clonetop++;
					wrap.css('top', top);
				  that.clone.css('top', clonetop);
				},
				left: function() {
					left--;
          cloneleft--;
					wrap.css('left', left);
					that.clone.css('left', cloneleft);
				},
				right: function() {
					left++;
          cloneleft++;
					wrap.css('left', left);
					that.clone.css('left', cloneleft);
				}
			};

			var endhandle = {
				endtoend: function() {
					count[towards](); //一直滚，把当前的滚完，偏移设置回0
					var verticalhandle = function() {
            if (Math.abs(top) >= wrap.height() || Math.abs(clonetop) >= wrap.height()) {
							wrap.css('top', 0);
							if (towards === "up") that.clone.css('top', wrap.height());
							if (towards === "down") that.clone.css('top', - wrap.height());
						}
					};
					var transversehandle = function() {
            if (Math.abs(left) >= wrap.width() || Math.abs(cloneleft) >= wrap.width()) {
							wrap.css('left', 0);
							if (towards === "left") that.clone.css('left', wrap.width());
							if (towards === "right") that.clone.css('left', - wrap.width());
						}
					};

					switch (towards) {
					case "up":
						verticalhandle();
						break;
					case "down":
						verticalhandle();
						break;
					case "left":
						transversehandle();
						break;
					case "right":
						transversehandle();
						break;
					default:
						break;
					}
				}
			};
			var handle = {
				up: function() {
					if (Math.abs(top) <= wrap.height() - scrollWrap.height()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
				},
				down: function() {
					if (Math.abs(top) < scrollWrap.height()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
				},
				left: function() {
					if (Math.abs(left) <= wrap.width() - scrollWrap.width()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
				},
				right: function() {
					if (Math.abs(left) < scrollWrap.width()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
				}
			};

			handle[towards]();

		},
		changeTowards: function(towards) {
			this.config.towards = towards;
			this.stop();
			this.run();
		},
		changespeed: function(speed) {
			this.config.speed = speed;
			this.stop();
			this.run();
		},
		auto: function(auto) {
			this.config.auto = auto;
			this.stop();
			this.run();
		},
		run: function() {
			var that = this,
			wrap = $(that.wrap),
			cg = that.config,
			towards = cg.towards,
			scrollWrap = $(that.scrollWrap);

			var ruler = {
				transverse: (towards === "left" || towards === "right") ? (scrollWrap.width() < wrap.width()) : true,
				vertical: (towards === "up" || towards === "down") ? (scrollWrap.height() < wrap.height()) : true
			};

			if (ruler['transverse'] && ruler['vertical'] && that.config.auto) {
				that.T = setInterval(function() {
					that._roll(towards);
				},
				that.config.speed);
			}
		},
		stop: function() {
			var that = this;
			clearInterval(that.T);
		},
		init: function() {
			var that = this,
			cg = that.config,
			wrap = $(that.wrap);
			wrap.wrap("<div id='" + that.scrollWrap.slice(1) + "'></div>").css({
				position: 'absolute',
				top: 0,
				left: 0
			});
			$(that.scrollWrap).css({
				width: cg.width,
				height: cg.height,
				overflow: 'hidden',
				position: 'relative'
			});
			//如果是endtoend的话，提前建立clone节点
			if (that.config.endtype === "endtoend") {
				that.clone = wrap.clone();
				that.clone.attr('id', 'J_' + new Date().valueOf());
				switch (cg.towards) {
				case "up":
					wrap.parent().append(that.clone);
					that.clone.css({
						left:
						0,
						top: wrap.height()
					});
					break;
				case "down":
					wrap.parent().prepend(that.clone);
					that.clone.css({
						left:
						0,
						top: - wrap.height()
					});
					break;
				case "left":
					wrap.parent().append(that.clone);
					that.clone.css({
						top:
						0,
						left: wrap.width()
					});
					break;
				case "right":
					wrap.parent().prepend(that.clone);
					that.clone.css({
						top:
						0,
						left: - wrap.width()
					});
					break;
				default:
					break;
				}
			}
			that.run();
		}
	};

	if (G && G.widget) G.widget.roll = roll;

})(window, GM, jQuery);

