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
		var _config = {
			towards: 'up',
			//4个prototype方向
			height: 300,
			width: 300,
			speed: 300,
			auto: true,
			endtype: 'endtoend' // endtoend 首位相接 | stop 到头后停止 | back 到头后反向滚
		};
		$.extend(_config, config);
		this.config = _config;
	};

	roll.prototype = {
		_roll: function(towards) {
			var that = this,
			wrap = $(that.wrap),
			scrollWrap = $(that.scrollWrap),
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
			clone;
			that.stop();

			var count = {
				up: function() {
					top--;
					wrap.css('top', top);
				},
				down: function() {
					top++;
					wrap.css('top', top);
				},
				left: function() {
					left--;
					wrap.css('left', left);
				},
				right: function() {
					left++;
					wrap.css('left', left);
				}
			};

			//如果是endtoend的话，提前建立clone节点
			if (that.config.endtype === "endtoend") {
				clone = wrap.clone();
				switch (towards) {
				case "up":
					wrap.next(clone);
					clone.css({
						left:
						0,
						top: wrap.height()
					});
					break;
				case "down":
					wrap.prev(clone);
					clone.css({
						left:
						0,
						top: - wrap.height()
					});
					break;
				case "left":
					wrap.next(clone);
					clone.css({
						top:
						0,
						left: wrap.width()
					});
					break;
				case "right":
					wrap.prev(clone);
					clone.css({
						top:
						0,
						left: - wrap.width()
					});
					break;
				default:
					break;
				}
			}

			var endhandle = {
				endtoend: function(towards) {
					count[towards](); //一直滚，把当前的滚完，偏移设置回0
					var verticalhandle = function() {
						if (Math.abs(top) >= wrap.height()) {
							wrap.css('top', 0);
							if (towards === "up") clone.css('top', wrap.height());
							if (towards === "down") clone.css('top', - wrap.height());
						}
					};
					var transversehandle = function() {
						if (Math.abs(left) >= wrap.width()) {
							wrap.css('left', 0);
							if (towards === "left") clone.css('left', wrap.width());
							if (towards === "right") clone.css('left', - wrap.width());
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
				},
				stop: function() {
					//清除定时器，停止滚动
					that.stop();
				},
				back: function(towards) {
					//反向滚动
					switch (towards) {
					case "up":
						count["down"]();
						that.config.towards = "down";
						break;
					case "down":
						count["up"]();
						that.config.towards = "up";
						break;
					case "left":
						count["right"]();
						that.config.towards = "right";
						break;
					case "right":
						count["left"]();
						that.config.towards = "left";
						break;
					default:
						break;
					}
				}
			};
			var handle = {
				up: function() {
					if (Math.abs(top) < wrap.height() - scrollWrap.height()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
					$.event.trigger('roll:up', [vertical()]);
				},
				down: function() {
					if (Math.abs(top) < wrap.height() - scrollWrap.height()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
					$.event.trigger('roll:down', [vertical()]);
				},
				left: function() {
					if (Math.abs(left) < wrap.width() - scrollWrap.width()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
					$.event.trigger('roll:left', [transverse()]);
				},
				right: function() {
					if (Math.abs(top) < wrap.width() - scrollWrap.width()) {
						count[towards]();
					} else {
						endhandle[that.config.endtype]();
					}
					$.event.trigger('roll:right', [transverse()]);
				}
			};

			handle[towards]();

		},
    chaneTowards:function(towards){
      this.config.towards=towards;
    },
    //加速
    upshift:function(){
      this.recoverspeed=this.config.speed;
      this.config.speed=this.config.speed/2;

    },
    //还原速度
    recoverspeed:function(){
      this.config.speed=this.recoverspeed;
    },
		run: function() {
			var that = this,
			wrap = $(that.wrap),
			cg = that.config,
      towards=cg.towards,
			scrollWrap = $(that.scrollWrap);

			var ruler = {
				transverse: (towards === "left" || towards === "right") ? (scrollWrap.width() < wrap.width()) : true,
				vertical: (towards === "up" || towards === "down") ? (scrollWrap.height() < wrap.height()) : true
			};

			if (ruler['transverse'] && ruler['vertical']) {
				that.T = setInterval(function() {
					that._roll(towards);
				},
				that.config.speed);
			}
		},
		stop: function() {
			clearInterval(that.T);
		},
		init: function() {
			var that = this,
			cg = that.config,
			wrap = that.wrap;
			$(warp).wrap("<div id='" + that.scrollWrap.slice(1) + "'></div>");
			$(that.scrollWrap).css({
				width: cg.width,
				height: cg.height,
				overflow: 'hidden',
				position: 'relative'
			});
			$(wrap).css({
				position: 'absolute',
				top: 0,
				left: 0
			});
			that.run();
		}
	};

	if (G && G.widget) G.widget.roll = roll;

})(window, GM, jQuery);

