/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120109
 * @fileoverview 老板的评论功能修改，继承后重改几个方法，增加了校验码，HTML重构，评论开关，匿名回复等功能,自动增加自适应高功能
 */
(function(W, $, G) {

	if (G && G.apps) {
		G.apps.commentV2 = {
			exports: {
				getComment: function(callback) {
					G.apps.require('comment', function(exports) {

						function sole(tag) {
							return tag + new Date().valueOf().toString().slice(3);
						}

						var commentV2 = function(config) {
							this.supperClass = exports.comment_init;
							exports.comment_init.call(this, config);
							this.codeid = sole('#J_CodeId');
              this.codeImgId = sole('#J_CodeImgId');
						};

						//混合父类原型到子类,此处为覆盖操作
						$.extend(commentV2.prototype, exports.comment_init.prototype);

						$.extend(commentV2.prototype, {
							constructor: commentV2,
							setNewCode: function() {
                var that=this;
                $(that.codeImgId).attr('src',that.getNewCode());
							},
							getNewCode: function() {
								var T = new Date().valueOf();
								return 'http://x.idongmi.com/api/reply/replyAuth.jsp?t=' + T;
							},
							checkcommit: function(host) {
								var that = host,
								cg = host.config;
								var val = $.trim($(cg.textid).val()),
								code = $.trim($(that.codeid).val());
								if (val === "") {
									alert('评论不能为空');
									return;
								}
								if (code === "") {
									alert('校验码不能为空');
									return;
								}
								if (cg.deadlock) {
									cg.deadlock = false;
									that.commit();
								}
							},
							initCode: function() {
								var that = this,
								cg = that.config;
                $(cg.mib).append('<label>验证码: <input type="text" id="' + that.codeid.slice(1) + '" maxlength="4" style="border:#D0D0D0 solid 1px;height:20px;width:50px;"> <img src="' + that.getNewCode() + '" width="65" height="24" alt="校验码" title="点击更换验证码" style="cursor:pointer;" id="'+that.codeImgId.slice(1)+'"></label>');
                $(that.codeImgId).live('click',function(){
                    that.setNewCode();
                });
							},
							postsuccess: function(data, callback, that) {
								var cg = that.config;
								cg.deadlock = true;
								var result = $.trim(data);
								if (callback && result > 0) callback(result);
								else if (result == - 1) alert('您评论的有点快，去健身休息一下吧！');
                else if (result == -98) alert('您的发言需要审核过后才能显示');
                else if(result == -99) alert('校验码不正确');
								else alert('提交失败,请重新尝试');
                that.setNewCode();
                $(that.codeid).val('');
							},
							postdatalist: function(txt) {
								var that = this,
								cg = that.config,
								syncwb = function() {
									if ($(cg.syncwb).attr('checked')) return 1;
									else return 0;
								},
								code = $.trim($(that.codeid).val());
								return {
									cid: cg.cid,
									//增加校验码一项
									code: code,
									oid: cg.oid,
									columnid: cg.columnid,
									showuid: cg.showuid,
									puid: cg.pids.join(),
									type: cg.type,
									act: 'add',
                  content: txt,
									pid: cg.pid,
									syncwb: syncwb(),
									reload: 1,
                  shareurl:cg.shareurl
								};
							}
						});

						G.widget.use('frameauto', function(widget) {
							if (callback) callback(commentV2, widget.frameauto);
						});
					});
				}
			}
		};
	}

})(window, jQuery, GM);

