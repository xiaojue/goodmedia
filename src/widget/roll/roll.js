/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111207
 * @fileoverview 通用走马灯
 */
(function(W, G, $) {
	var roll = function(wrap, config) {
		this.wrap = wrap;
		this.scrollWrap = '#J_ScrollWrap' + new Date().valueOf();
		this.T = null;
		this.firstclone = null;
		this.lastclone = null;
		var _config = {
			towards: 'up',
			//4个prototype方向
			height: 300,
			width: 300,
			speed: 200,
			auto: true
		};
		$.extend(_config, config);
		this.config = _config;
	};

	roll.prototype = {
		_roll: function(towards) {
			var that = this,
			wrap = $(that.wrap),
			scrollWrap = $(that.scrollWrap),
			firstclone = that.firstclone,
			lastclone = that.lastclone,
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
			firsttop = firstclone.position().top,
			lasttop = lastclone.position().top,
			firstleft = firstclone.position().left,
			lastleft = lastclone.position().left;
			var count = {
				up: function() {
					top--;
					firsttop--;
					lasttop--;
					wrap.css('top', top);
					that.firstclone.css('top', firsttop);
					that.lastclone.css('top', lasttop);
				},
				down: function() {
					top++;
					firsttop++;
					lasttop++;
					wrap.css('top', top);
					that.firstclone.css('top', firsttop);
					that.lastclone.css('top', lasttop);
				},
				left: function() {
					left--;
					firstleft--;
					lastleft--;
					wrap.css('left', left);
					that.firstclone.css('left', firstleft);
					that.lastclone.css('left', lastleft);
				},
				right: function() {
					left++;
					firstleft++;
					lastleft++;
					wrap.css('left', left);
					that.firstclone.css('left', firstleft);
					that.lastclone.css('left', lastleft);
				}
			};

			var endtoend = function() {
				count[towards](); //一直滚，把当前的滚完，偏移设置回0
				var verticalhandle = function() {
					if (Math.abs(top) >= wrap.height()) {
						wrap.css('top', 0);
						if (towards === "up" || towards === "down") {
							that.firstclone.css('top', - wrap.height());
							that.lastclone.css('top', wrap.height());
						}
					}
				};
				var transversehandle = function() {
					if (Math.abs(left) >= wrap.width()) {
						wrap.css('left', 0);
						if (towards === "left" || towards === "right") {
							that.firstclone.css('left', - wrap.width());
							that.lastclone.css('left', wrap.width());
						}
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
			};
			var handle = {
				up: function() {
					if (Math.abs(top) <= wrap.height() - scrollWrap.height()) {
						count[towards]();
					} else {
						endtoend();
					}
				},
				down: function() {
					if (Math.abs(top) < scrollWrap.height()) {
						count[towards]();
					} else {
						endtoend();
					}
				},
				left: function() {
					if (Math.abs(left) <= wrap.width() - scrollWrap.width()) {
						count[towards]();
					} else {
						endtoend();
					}
				},
				right: function() {
					if (Math.abs(left) < scrollWrap.width()) {
						count[towards]();
					} else {
						endtoend();
					}
				}
			};

			handle[towards]();

		},
		reset: function() {
			var that = this,
			wrap = $(that.wrap),
			towards = that.config.towards;
			if (towards == 'up' || towards == 'down') {
				that.firstclone.css('top', - wrap.height());
				that.lastclone.css('top', wrap.height());
			} else if (towards == "left" || towards == "right") {
				that.firstclone.css('left', - wrap.width());
				that.lastclone.css('left', wrap.width());
			}

			wrap.css({
				'left': 0,
				'top': 0
			});
			that.stop();
			that.run();
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

			if (ruler['transverse'] && ruler['vertical']) {
				if (that.config.auto) {
					that.T = setInterval(function() {
						that._roll(towards);
					},
					that.config.speed);
				}
			} else {
				that.firstclone.remove();
				that.lastclone.remove();
			}
		},
		stop: function() {
			var that = this;
			clearInterval(that.T);
		},
		createClone: function() {
			var that = this,
			wrap = $(that.wrap),
			cg = that.config;
			that.firstclone = wrap.clone();
			that.lastclone = wrap.clone();
			that.firstclone.attr('id', 'J_' + new Date().valueOf());
			that.lastclone.attr('id', 'J_' + new Date().valueOf());
			wrap.parent().prepend(that.firstclone);
			wrap.parent().append(that.lastclone);
			var transverse = function() {
				that.firstclone.css({
					left: - wrap.width(),
					top: 0
				});
				that.lastclone.css({
					left: wrap.width(),
					top: 0
				});
			},
			vertical = function() {
				that.firstclone.css({
					left: 0,
					top: - wrap.height()
				});
				that.lastclone.css({
					left: 0,
					top: wrap.height()
				});
			};
			switch (cg.towards) {
			case "up":
				vertical();
				break;
			case "down":
				vertical();
				break;
			case "left":
				transverse();
				break;
			case "right":
				transverse();
				break;
			default:
				break;
			}
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
			that.createClone();
			that.run();
		},
		update: function(html) {
			var that = this;
			that.firstclone.remove();
			that.lastclone.remove();
			$(that.wrap).html(html);
			that.createClone();
			that.reset();
		}
	};

	if (G && G.widget) G.widget.roll = roll;

})(window, GM, jQuery);

