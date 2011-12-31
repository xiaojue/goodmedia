/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111227
 * @description 年会脚本
 */
(function() {
	$(function() {
		var pagelist = ['demo.html', 'demo1.html', 'demo2.html', 'demo3.html'],
		musiclist = ['', 'nanfang.mp3', 'nanfang.mp3', 'nanfang.mp3'],
		//0是占位
		codemap = {
			48: '0',
			49: 1,
			50: 2,
			51: 3,
			52: 4,
			53: 5,
			54: 6,
			55: 7,
			56: 8,
			57: 9
		};

		//jplay安装
		$("#jpId").jPlayer({
			swfPath: "jplay"
		});

		var targetpage = (function() {
			var href = window.location.href,
			finis = href.lastIndexOf('/');
			return href.slice(finis + 1);
		})();

		function matchpage(page, list, cb) {
			var i = 0,
			l = list.length;
			for (; i < l; i++) {
				if (list[i] === page) {
					cb(i);
					break;
				}
			}
		}

		function topage(list, index) {
			if (index === - 1) {
				index = list.length - 1;
			} else if (index === list.length) {
				index = 0;
			}
			targetpage = list[index];
			window.location.href = list[index];
		}

		$(window).keydown(function(e) {
			var keycode = e.keyCode,
			ctr = e.ctrlKey,
			alt = e.altKey,
			nu = codemap[keycode];
			if (ctr) {
				switch (keycode) {
				case 37:
					matchpage(targetpage, pagelist, function(index) {
						topage(pagelist, index - 1);
					});
					break;
				case 39:
					matchpage(targetpage, pagelist, function(index) {
						topage(pagelist, index + 1);
					});
					break;
				default:
					break;
				}
			} else if (alt && nu) {
				if (nu == '0') {
					$('#jpId').jPlayer('stop');
				} else if (musiclist[nu]) {
					$('#jpId').jPlayer('setMedia', {
						mp3: musiclist[nu]
					}).jPlayer("play");
				}
			}
		});
		//分页
		var paging = function(id, prev, next, range, len) {
			this.startIndex = 0;
			this.range = range;
			this.wrap = $(id);
			this.prev = $(prev);
			this.next = $(next);
			this.max = len;
		};
		paging.prototype = {
			constructor: paging,
			event: function() {
				var that = this;
				that.prev.live('click', function(e) {
					e.preventDefault();
					if (that.startIndex === 0) return;
					that.startIndex -= that.range;
					that.createIndexRange(that.startIndex);
				});
				that.next.live('click', function(e) {
					e.preventDefault();
					that.startIndex += that.range;
					that.createIndexRange(that.startIndex);
				});
        $('.J_Put').live('click',function(){
            var val=$(this).val();
            $(that).trigger('mypagelist:click',[val]);
        });
			},
			createIndexRange: function(start) {
				var that = this,
				end = start + that.range,
				strs = '';
				for (var i = start; i <= end; i++) {
          var val=i.toString(),len=that.max-val.length;
          for(var j=0;j<len;j++){
             val='0'+val; 
          }
					strs += '<input type="button" value="' + val + '" class="J_Put">';
				}
				that.wrap.html(strs);
			},
			init: function() {
				this.event();
				this.createIndexRange(this.startIndex);
			}
		};
		var mypagelist = new paging('#J_pagelist', '#J_Prev', '#J_Next', 50, 4);
		mypagelist.init();
    $(mypagelist).bind('mypagelist:click',function(object,val){
        $('#J_PutIn').val(val);
    });
	});
})();

