/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111101
 * @fileoverview 全站私信模块，包含页头提醒机制
 */
(function(W, G, $) {
	var sms = function() {

		var name, content, pid, GlobalT, T, timer = 5000,
		pushed, isInit, islock;
		var loadedcss = false;

		function now() {
			return new Date().valueOf();
		}

		var _sms = function(cg) {
			var _cg = {
				pushurl: 'http://x.idongmi.com/pm/indexAction.jsp?flag=send',
				pullurl: 'http://x.idongmi.com/pm/indexAction.jsp?flag=receive&callback=GM.widget.sms.pullback',
				close: '#J_SMSclose',
				template: function(o) {
					return '<div class="inform_cont pletter_cont" style="position:relative;width:510px;height:240px;min-height:240px;background:#fff;">' + '<div class="pletter_list">' + '<div class="post">收件人：</div>' + '<div class="pletter_content"><input id="J_SMSName" type="text" class="pletter_box1" readonly="readyonly" value=""></div>' + '<div class="clear"></div>' + '</div>' + '<div class="pletter_list">' + '<div class="post">内 容：</div>' + '<div class="pletter_content">' + '<div class="pletter_prompt" id="J_SizeWrap"></div>' + '<textarea id="J_SMSContent" class="pletter_box2"></textarea>' + '<div class="pletter_insert">' + '<a href="#face" id="J_SMSFace"><span class="ico1"></span>表情</a>' + '</div>' + '</div>' + '<div class="clear"></div>' + '</div>' + '<div class="pletter_but">' + '<input type="button" value="发 信" id="J_SMSPost">' + '</div>' + '<div style="position:absolute;width:15px;text-align:center;height:15px;line-height:15px;cursor:pointer;right:-5px;top:-5px;background:#000;color:#fff;font-size:18px;overflow:hidden;" title="关闭" id="' + o.close.slice(1) + '">&times</div>' + '</div>';
				}
			};
			if (cg) $.extend(_cg, cg);
			this.cg = _cg;
      this.template=_cg.template(_cg);
      this.overlay = $.overlay();
		};

		_sms.prototype = {
			timeout: function() {
				islock = false;
				alert('响应超时,请重试');
			},
			push: function(data) {
				var that = this,
				cg = that.cg,
				param = $.param(data);
				T = now();
				pushed = false;
				that['pushcallback' + T] = that.pushback;
				$.getScript(cg.pushurl + '&' + param + '&callback=GM.widget.sms.pushcallback' + T);
				GlobalT = setTimeout(function() {
					if (!pushed) {
						delete that['pushcallback' + T];
						that.timeout();
					}
				},
				timer);
			},
			pull: function(data) {
				var that = this,
				cg = that.cg;
				$.getScript(cg.pullurl);
			},
			setName: function(val) {
				name = val;
			},
			setContent: function(val) {
				content = val;
			},
			setPid: function(val) {
				pid = val;
			},
			pushback: function(data) {
				var that = this;
				clearTimeout(GlobalT);
				pushed = true;
				islock = false;
				/*
        {
          s:1|0,
          msg:'msg',
        }
        */
				if (data.s == 1) {
					alert('发送成功');
					that.overlay.close();
				} else {
					that.pusherror(data.msg);
				}
				delete that['pushcallback' + T];
			},
			pusherror: function(msg) {
				alert(msg);
			},
			pullback: function(data) {
				var that = this;
				/*
         * {
         *  s:1|0,
         *  feedcount:0,
         *  somecount:someelse
         * }
         */
				if (data.s == 1) {
					that.updatebox(data);
				}
				//出错不理会，不做任何处理,成功则做消息提醒的update
			},
			updatebox: function(data) {
        var that=this;
				//更新气泡操作
				$(function() {
					if ($('#J_Notice').length !== 0 && $('#J_SMSNotice').length === 0) {
            $('body').append('<div id="J_SMSNotice" class="notice_txt"><a style="display:block;" href="/pm/index.jsp" id="J_T"><span id="J_SMSN"></span>条新评论</a><a href="/pm/sms.jsp" id="J_S" style="display:block;"><span id="J_SMST"></span>条新消息</a></div>');
					}
					var count = data['feedcount'] + data['smscount'];
					if (count === 0) $('.notice_txt').hide();
					else $('.notice_txt').show();
					if (data['feedcount'] === 0){
            $('#J_SMSN').addClass('gray').removeClass('red');
          }else{
            $('#J_SMSN').addClass('red').removeClass('gray');
          }
					if (data['smscount'] === 0){
            $('#J_SMST').addClass('gray').removeClass('red');
          } else{
            $('#J_SMST').addClass('red').removeClass('gray');
          }
					$('#J_SMSN').text(data['feedcount']);
					$('#J_SMST').text(data['smscount']);
          that.boxfix('top');
				});
			},
			startpull: function() {
				var that = this;
				that.pull();
				setInterval(function() {
					that.pull();
				},
				30 * 1000);
			},
			bindTarget: function(cg) {
				var that = this;
				var _cg = {
					smstarget: '.J_SMS',
					dataPid: 'data-pid',
					dataName: 'data-name'
				};
				$.extend(_cg, cg);
				$(_cg.smstarget).live('click', function() {
					if (!loadedcss) {
						var host = GM.widget.host,
						place = '-min';
						if (GM.debug) place = '';
						$.loadcss(host + 'sms/sms' + place + '.css');
						loadedcss = true;
					}
					var id = $(this).attr(_cg.dataPid),
					pname = $(this).attr(_cg.dataName);
					that.setPid(id);
					that.setName(pname);
          if(!isInit){
          that.overlay.fire(that.template);
          }else{
          that.overlay.fire();
          }

					$('#J_SMSName').val(name);

					if (!isInit) {
						isInit = true;
						GM.widget.use('saycountdown', function(widget) {
							var mysay = new GM.widget.saycountdown({
								main: '#J_SMSContent',
								wrap: '#J_SizeWrap',
								errorCls: 'blue',
								max: 300,
								holdTarget: '#J_SMSPost',
								holdAction: function() {
									var Contentval = $.trim($('#J_SMSContent').val()),
									Nameval = $.trim($('#J_SMSName').val());

									that.setContent(Contentval);

									if (Contentval === "" || Nameval === "") {
										alert('私信内容和收信人不能为空');
										return;
									}

									//其他校验 暂时没有想到
									if (!islock) {
										islock = true;
										that.push({
											pid: pid,
											content: content
										});
									}
								}
							});
							mysay.init();
						});

						GM.apps.require('face', function(exports) {
							var SMSface = new exports.face({
								target: '#J_SMSFace',
								main: '#J_SMSContent'
							});
							SMSface.init();
						});
						//清除上一次消息
					}
					$('#J_SMSContent').val("");
					return false;
				});

				$(that.cg.close).live('click', function() {
					that.overlay.close();
				});
			},
      addSmsIcon:function(){
        var hooks='div.friends>ul>li',
        temp=function(pid,name){
          return '<div class="user_messages"><a class="J_SMS" data-pid="'+pid+'" data-name="'+name+'" href="javascript:void(0);"></a></div>';
        };
        $(hooks).bind('mouseenter',function(){
            var pid=$(this).attr('data-pid'),
                name=$(this).attr('data-name');
                if(!pid || !name) return;
                if($(this).find('.J_SMS').length===0){
                  $(this).append(temp(pid,name));
                }else{
                  $(this).find('.J_SMS').show();
                }
          }).bind('mouseleave',function(){
              $(this).find('.J_SMS').hide(); 
        });
      },
      boxfix:function(type){
        var O=$('#J_Notice').offset();
        if(type=='top'){
        $('#J_SMSNotice').css({
            position:'absolute',
            left:O.left,
            top:O.top+20
        });
        }else{
        $('#J_SMSNotice').css({
            position:'absolute',
            left:O.left,
            top:$(window).scrollTop()
        });
        }
      },
			init: function(config) {
				var that = this;
				that.startpull(); //初始化直接开始轮训消息通道
				that.bindTarget(config);
        that.addSmsIcon();
        //增加滚动
        $(window).bind('scroll resize',function(){
            var t=$(window).scrollTop();
            if(t===0){
              that.boxfix('top');
            }else{
              that.boxfix();
            }
        });
			}
		};

		return _sms;
	} ();

	if (G && G.widget) {
		G.widget.sms = new sms();
	}

})(window, GM, jQuery);
