/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111213
 * @description 转盘游戏部分的js
 */
(function(G) {
	var pan = function() {

		var prizes = {
			0: 1,
			0: 2,
			0: 8,
			0: 4,
			0: 6,
			60: 7,
			20: 5,
			10: 9,
			5: 3
		};

		$.overlay();

		var roll;

		var laywrap = function(content, login) {
			var islogin = '';
			if (login) {
				var L = "'http://x.idongmi.com/user/login.jsp'";
				var Z = "'http://x.idongmi.com/user/reg.jsp'";
				islogin = '<div class="poput_but"><input type="button" onclick="window.location.href=' + L + '" value="登 陆,领取奖品" class="lottery lottery_box3"><input type="button" onclick="window.location.href=' + Z + '" value="注册" class="lottery lottery_box1">' + '</div>';
			}
			return '<div class="popup">' + '<a href="#" class="J_close close lottery"></a>' + '<div class="popup_main ks_clear">' + content + '</div>' + islogin + '</div>';
		};

		var lotterySuccess = function(m,msg) {
      var html = '<div class="popup_l popLottery1" style="width:125px;"><img src="http://s1.ifiter.com/lottery/static/images/popup_img.jpg"></div>' + '<div class="popup_r" style="width:200px;">' + '<div class="popup_title">中奖了！</div>' + '<div class="popup_title1">您获得了<span>' + m + '</span>大米！</div>' + '<div class="share_title"> “分享到微博”可再得<span class="red">20大米</span></div>' + '<div class="share">' + '<a href="http://service.weibo.com/share/share.php?title='+msg+'&url=http%3A%2F%2Fx.idongmi.com%2Fgame%2Flotto%2Findex.jsp&appkey=3175811782&ralateUid=2263058335&searchPic=false" target="_blank"><span class="share_ico1 lottery"></span><span>新浪微博</span></a><a href="http://t.sohu.com/third/post.jsp?&url=http%3A%2F%2Fx.idongmi.com%2Fgame%2Flotto%2Findex.jsp&title='+msg+'&content=utf-8&pic=" target="_blank"><span class="share_ico2 lottery"></span><span>搜狐微博</span></a>' + '<div class="clear"></div>' + '</div>' + '<div class="share">' + '<a href="http://share.v.t.qq.com/index.php?c=share&a=index&title='+msg+'&url=http%3A%2F%2Fx.idongmi.com%2Fgame%2Flotto%2Findex.jsp&site=x.idongmi.com&pic=" target="_blank"><span class="share_ico3 lottery"></span><span>腾讯微博</span></a><a href="http://t.163.com/article/user/checkLogin.do?link=http://news.163.com/&source='+msg+'&info=http%3A%2F%2Fx.idongmi.com%2Fgame%2Flotto%2Findex.jsp&'+new Date().valueOf()+'" target="_blank"><span class="share_ico4 lottery"></span><span>网易微博</span></a>' + '<div class="clear"></div>' + '</div>' + '</div>' + '<div class="clear"></div>';
			return html;
		};

		var dami = '"http://x.idongmi.com/user/dami.jsp"';

		var lotteryError = '<div class="popup_l" style="width:80px;"><img src="http://s1.ifiter.com/lottery/static/images/popup_img1.jpg"></div>' + '<div class="popup_r" style="width:250px;padding-top:20px;">' + '<div class="popup_title2">米袋扁了，大米不够了......</div>' + '<div class="poput_but1">' + '<input type="button" value="知道了" class="lottery lottery_box1 J_close">' + '<input onclick="window.location.href=' + dami + '" type="button" value="回社区  捡大米" class="lottery lottery_box3">' + '</div>' + '</div>' + '<div class="clear"></div>';

		var updateroll = function(data, ret) {
			var html = '<ul>';
			for (var i = 0; i < data.length; i++) {
				html += '<li><a target="_blank" href="http://x.idongmi.com/u/' + data[i]['uid'] + '">' + data[i]['name'] + '</a>' + data[i]['msg'] + '</li>';
			}
			if (data.length === 0) {
				html += "<li>暂时还没有中奖的人，快来抽奖吧！</li>";
			}
			html += '</ul>';

			if (!ret) $('#J_Roll').html(html);
			if (ret) return html;
		};

		var updateuser = function() {
			$.ajax({
				url: '/game/lotto/lottoAjax.jsp?act=getDM',
				success: function(data) {
					var ret = eval("(" + data + ")");
					if (ret.p != - 1) {
						$('#J_dm').text(ret.p);
						var time = Math.floor(parseInt(ret.p, 10) / 20);
						$('#J_time').text(time);
					}
				}
			});
		};

		var initswf = function(SWFObject) {
			window.onRouletteStart = function() {
				var JSO = document.getElementById('J_SO'),
				html;
				setTimeout(function() {
					$.ajax({
						url: '/game/lotto/lottoAjax.jsp?act=play',
						success: function(data) {
							var ret = eval("(" + data + ")");
							ret = ret.ret;
							JSO.turnTo(prizes[ret.p]);
							setTimeout(function() {
								var isLogin = ret.isLogin;
								if (isLogin === 0 && ret.p != - 1) {
									//登录了
                  html = laywrap(lotterySuccess(ret.p,encodeURIComponent('我在参加“动米网--魔法大转盘”活动，不幸抽中了'+ret.p+'大米！')), false);
									GM.tools.overlay.fire(html);
								} else if (isLogin === 1 && ret.p !== - 1) {
									//没登陆     
                  html = laywrap(lotterySuccess(ret.p,encodeURIComponent('我在参加“动米网--魔法大转盘”活动，不幸抽中了'+ret.p+'大米！')), true);
									GM.tools.overlay.fire(html);
								} else if (isLogin === 0 && ret.p == - 1) {
									//登录了，没大米了
									html = laywrap(lotteryError);
									GM.tools.overlay.fire(html);
								}
								updateuser();
							},
							1800);
						},
						error: function() {
							alert('相应超时，请重新抽一次');
							JSO.reset();
						}
					});
				},
				1000);
				return - 1;
			};

			window.onRouletteStop = function() {
				//var JSO = document.getElementById('J_SO');
				//JSO.reset();
				$.ajax({
					url: '/game/lotto/lottoAjax.jsp?act=getPList',
					success: function(data) {
						var ret = eval("(" + data + ")");
						var html = updateroll(ret.ret, true);
						updateroll(ret.ret);
						//if (roll) roll.update(html);
					}
				});
				return - 1;
			};

			var so = new SWFObject(GM.apps.host + "pan/image/Roulette.swf", "J_SO", "487px", "487px", "9");
			so.addParam("wmode", "transparent");
			so.addParam("allowscriptaccess", "always");
			so.addVariable("config", GM.apps.host + "pan/image/roulette.xml");
			so.addVariable("onStart", "onRouletteStart");
			so.addVariable("onStop", "onRouletteStop");
			so.write("J_Flash");
		};

		var initcommit = function() {
			GM.widget.use('roll', function(widget) {

				$.ajax({
					url: '/game/lotto/lottoAjax.jsp?act=getPList',
					success: function(data) {
						var ret = eval("(" + data + ")");
						updateroll(ret.ret);
						/*
            roll = new GM.widget.roll("#J_Roll", {
							height: 240,
							width: 460,
							towards: 'down'
						});
						roll.init();
            */
					},
					error: function() {
						$('#J_Roll').html("<ul><li>网络超时，请尝试刷新重新获取中奖名单列表</li></ul>");
					}
				});
			});
		};

		//事件绑定
		$('.J_close').live('click', function() {
			var JSO = document.getElementById('J_SO');
			GM.tools.overlay.close();
			JSO.reset();
			return false;
		});
    //分享微博
    $('.share a').live('click',function(){
      $.ajax({
        url:'/game/lotto/lottoAjax.jsp?act=syncwb'
      });
    });
    
    //大奖最终名单
    var biglottoy='<div class="popup">'+
			'<a href="#" class="close lottery J_close"></a>'+
			'<div class="list_main ks_clear">'+
				'<div class="list_title">中奖名单</div>'+
				'<ul>'+
					'<li><strong>特等奖 iPhone4 （1名）</strong><br>'+
					'用户名：我勒个去<br>'+
					'邮   箱：cao******@sina.com</li>'+
					'<li><strong>一等奖现金1888元（1名）</strong><br>'+
					'用户名：我勒个去<br>'+
					'邮   箱：cao******@sina.com</li>'+
					'<li><strong>二等奖价值888元健身卡（1名）</strong><br>'+
					'用户名：我勒个去<br>'+
					'邮   箱：cao******@sina.com</li>'+
					'<li><strong>无线鼠标（1名）</strong><br>'+
					'用户名：我勒个去<br>'+
					'邮   箱：cao******@sina.com</li>'+
				'</ul>'+
				'<div class="list_but">'+
					'<input type="button" value="关闭" class="lottery lottery_box1 J_close">'+
				'</div>'+
			'</div>'+
      '</div>';

    //揭晓的时候ID增加上即可 
    $('#J_Lastlottoy').live('click',function(){
        GM.tools.overlay.fire(biglottoy);
        return false;
    });

		return {
			exports: {
				init: function() {
					GM.widget.use('swfobject', function(widget) {
						initswf(GM.widget.SWFObject);
						initcommit();
					});
				}
			}
		};
	} ();
	if (G && G.apps) G.apps.pan = pan;
})(GM);

