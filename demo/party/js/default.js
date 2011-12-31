/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111228
 * @description 年会抽人功能
 */
(function() {
	$(function() {
		var lottery = function(config) {
			var _cg = {
				startBtn: '#J_Start',
				endBtn: '#J_End',
				data: 'js/userdata-min.js',
				max: 1
			};
			$.extend(_cg, config);
			this.cg = _cg;
			this.scaler = 0;
			this.time = (function() {
				var D = new Date();
				return (D.getDate() == 4 && D.getHours() > 18);
			})();
		};

		lottery.CB = function(data) {
			lottery.prototype.data = data;
      var list=data.data;
      for(var i = 0;i<list.length;i++){
        var img=new Image();
        img.src='static/pic/'+list[i]['name']+'.JPG';
        img.style.display='none';
        $('body').append(img);
      }
		};

		lottery.prototype = {
			constructor: lottery,
			event: function() {
				var that = this,
				cg = that.cg;
				$(cg.startBtn).live('click', function(e) {
					that.start(e, that);
				});
				$(cg.endBtn).live('click', function(e) {
					that.end(e, that);
				});
			},
			switchover: function(IndexData) {
				var that = this;
				if (IndexData.length !== 0) {
					switch (typeof IndexData) {
					case 'string':
						alert(IndexData);
						break;
					case 'object':
						var name = [],pic=[];
						for (var i = 0; i < IndexData.length; i++) {
              name.push(IndexData[i]['name']);
              pic.push('static/pic/'+IndexData[i]['name']+'.JPG');
            }
            $(that).trigger('switch',[name,pic]);
						break;
					default:
						break;
					}
				}
			},
			queue: function(interval) {
				var that = this,
				data = lottery.prototype.data.data;
				if (!this.timer) {
					this.timer = setInterval(function() {
						var indexUser = that.getusers();
						if (indexUser.length !== 0) {
							that.switchover(indexUser);
						} else {
							clearInterval(that.timer);
							that.timer = null;
							that.switchover('没有人可以转了……');
						}
					},
					interval);
				}
			},
			start: function(e, host) {
				$(host.cg.startBtn).hide();
				$(host.cg.endBtn).show();
				host.queue(80);
				host.scaler += 1;
				//$(host).trigger('lottery:start');
				return false;
			},
			end: function(e, host) {
				host.pump();
				return false;
			},
			getdata: function(url) {
				var that = this;
				$.getScript(url);
			},
			random: function(s, e) {
				return Math.round(Math.random() * (e - s));
			},
			getusers: function(cut) {
				var that = this,
				cg = that.cg,
				list = that.data.data,
				retary = [];
				if (list.length - cg.max >= 0) {
					for (var i = 0; i < cg.max; i++) {
						if (that.scaler === 10 && that.cg.max == 1 && cut && that.time) {
							for (var k = 0; k < list.length; k++) {
								if (list[k]['name'] == "\u4ED8\u5F3A") {
									ret = k;
									break;
								}
							}
						} else {
							function randomret() {
								ret = that.random(0, list.length - 1);
								if (list[ret]['name'] == "\u4ED8\u5F3A") {
									return randomret();
								} else {
									return ret;
								}
							}
							ret = randomret();
						}
						retary.push(list[ret]);
						if (cut) {
							list.splice(ret, 1);
						}
					}
				}
				return retary;
			},
			ending: function(callback) {
				var that = this;
				for (var i = 1; i <= 8; i++) { (function(j) {
						setTimeout(function() {
							that.switchover(that.getusers());
							if (j == 8) {
								callback();
							}
						},
						150 * j);
					})(i);
				}
			},
			pump: function() {
				var that = this,
				cg = that.cg;
				if (that.data) {
					var list = that.data.data,
					retary = that.getusers(true);
					if (retary.length !== 0) {
						if (that.timer) {
							clearInterval(that.timer);
							that.timer = null;
							that.ending(function() {
								that.switchover(retary);
								$(that.cg.startBtn).show();
								$(that.cg.endBtn).hide();
                $(that).trigger('end',[retary]);
							});
						}
					} else {
						clearInterval(that.timer);
						that.timer = null;
						that.switchover('人已经不够抽了');
					}
				} else {
					setTimeout(function() {
						that.pump();
					},
					120);
				}
			},
			init: function() {
				this.getdata(this.cg.data);
				this.event();
				$(this.cg.endBtn).hide();
			}
		};
		window.lottery = lottery;
	});
})();

