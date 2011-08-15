function popWindow(p) {
	var prefix = 'pop_';
	this.params = {
			'url' : '',
			'window' : '#' + prefix + 'window',
			'btnOk' : '#' + prefix + 'ok',
			'btnCancel' : '#' + prefix + 'cancel',
			'btnClose' : '#' + prefix + 'close',
			'form' : '#' + prefix + 'form',
			'title' : '#' + prefix + 'title',
			'mask' : '#' + prefix + 'mask', 
			'okHandle' : function(o, w){w.$form.trigger('submit');return false;},
			'cancelHandle' : function(o, w){
									w.close();
									return false;
								},
			'onsubmit' : function(o, w) {return true;},
			'preShow' : function($w, $form) {}
			};

	for (i in p) {
		this.params[i] = p[i];
	}
	this.$w = $(this.params.window);
	this.$mask = $(this.params.mask);
	this.$callback=p['callback']||$.noop;
	/**
	 * 设置窗口标题
	 */
	this.setTitle = function(text, title) {
		this.$title = $(title || this.params.title);
		this.$title.html(text); 
	}

	/**
	 * 设置表单提交事件
	 */
	this.bindOnSubmit = function(fn, form) {
		this.$form = $(form || this.params.form);
		this.$form.submit((function(w) {
								return function(){
											var f = fn || w.params.onsubmit;
											return f(this, w);
										}
							})(this));
	}
	
	/**
	 * 设置OK按钮事件
	 */
	this.bindOk = function(fn, ok) {
		this.$ok = $(ok === undefined ? this.params.btnOk : ok);

		this.$ok.click((function(w) {
								return function(){
											var f = fn || w.params.okHandle;
											return f(this, w);
										}
							})(this));
	}

	/**
	 * 设置cancel按钮事件
	 */
	this.bindCancel = function(fn, cancel) {
		this.$cancel = $(cancel === undefined ? this.params.btnCancel : cancel);
		this.$cancel.click((function(w) {
								return function(){
											var f = fn || w.params.cancelHandle;
											return f(this, w);
										}
							})(this));
	}

	this.bindClose = function(fn, close) {
		this.$close = $(close === undefined ? this.params.btnClose : close);
		this.$close.click((function (w){
								return function(){
											var f = fn || w.params.cancelHandle;
											return f(this, w);
										}
							})(this));

	}
	/**
	 * 打开窗口
	 */
	this.open = function(url) {
		url = url || this.params.url;
		$.get(url, (function(w) {
						return function(html) {
							w.$w.html(html);
							w.bindOnSubmit();
							w.bindOk();
							w.bindCancel();
							w.bindClose();
							//w.$w.show();
							w.$callback();
							w.$mask.removeClass('hidden');
							w.$w.removeClass('hidden');
						}
					})(this));
	}
	
	this.showExistsWindow = function() {
					this.bindOk();
					this.bindCancel();
					this.bindOnSubmit();
					this.bindClose();
					this.params.preShow(this, $(this.params.form));
					//this.$w.show();
					this.$w.removeClass('hidden');
					this.$mask.removeClass('hidden');
	}

	/**
	 * 关闭窗口
	 */
	this.close = function(){
		//this.$w.hide();
		this.$w.addClass('hidden');
		this.$mask.addClass('hidden');
	}
}

function confirmDel(url, msg) {
	msg = msg || '确认要删除吗?';
	var flag=true;
	if(window.onbeforeunload && Xwb && Xwb.gModified === false){
		if(confirm('你还没有提交当前设置是否离开?')){
			Xwb.gModified=true;
			flag=false;
		}else{
			return ;
		}
	}
	if (confirm(msg)) {
		window.location.href = url;
	}else if( window.onbeforeunload  ){
		Xwb.gModified=flag;
	}
}

function bindSelectAll(o, checkbox) {
	var $o = $(o);
	var $checkbox = $(checkbox);
	$o.click(function () {
				if (this.checked) {
					$checkbox.attr('checked', 'checked');
				} else {
					$checkbox.removeAttr('checked');
				}
				});

	$checkbox.click(function () {
				if (this.checked) {
					for (var i=0; i<$checkbox.length; i++) {
						if (!$checkbox.eq(i).attr('checked')) {
							return;
						}
					}
					$o.attr('checked', 'checked');
				} else {
					$o.removeAttr('checked');
				}
				})
}

function getSelectedValues(o, spliter) {
	var $o = $(o).filter(':checked');
	var spliter = spliter || ',';
	var values = [];
	$o.each(function() {
				values.push(this.value);
				})
	return values.join(spliter);
}

/**
 * 转向一个删除链接
 * url: 链接地址
 * msg: 提示信息(可选)
 */
function delConfirm(url, msg) {
	if (!msg) {
		msg = '确定要删除这条记录吗？';
	}
	Xwb.ui.MsgBox.confirm('提示',msg,function(id){
		if(id == 'ok'){
			window.location.href = url;
		}
	})
}


