/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W, doc, $, G) {
	/**
   * @memberOf jQuery
   * @constructor
   * @description 气泡浮出层管理，可以指定上下左右4个方向进行弹出
   */
	var bubble = function(config) {
		var _config = {
			width: 0,
			height: 0,
			cls: '',
			postion: 'bottom',
			//left right top bottom 上下左右
			target: '',
			id: '#J_Bubble' + new Date().valueOf().toString().slice(3)
		}

		$.extend(_config, config);

		this.config = _config;
	};

	bubble.prototype = {
		/**
     * @name jQuery.bubble#init
     * @description 初始化bubble功能
     */
		init: function() {
			var that = this,
			cg = that.config;
			that.createWrap(cg.target);
		},
		/**
     * @name jQuery.bubble#remove
     * @description 删除这个bubble
     */
		remove: function() {
			var that = this,
			cg = that.config;
			$(cg.id).remove();
		},
		/**
     * @name jQuery.bubble#show
     * @description 显示 
     */
		show: function() {
			var that = this,
			cg = that.config;
			$(cg.id).show();
		},
		/**
     * @name jQuery.bubble#hide
     * @description 隐藏
     */
		hide: function() {
			var that = this,
			cg = that.config;
			$(cg.id).hide();
		},
		/**
     * @name jQuery.bubble#setcontent
     * @description 设置气泡层内部html
     * @param {string} html 需要设置的内容
     */
		setcontent: function(html) {
			var that = this,
			cg = that.config;
			$(cg.id).html(html);
		},
		postionsign: function(target) {
			var that = this,
			cg = that.config,
			postion = $(target).offset(),
			boxH = $(target).height(),
			boxW = $(target).width(),
			_ret = {
				bottom: {
					left: postion.left + (boxW - cg.width) / 2,
					top: postion.top + boxH
				},
				top: {
					left: postion.left + (boxW - cg.width) / 2,
					top: postion.top - cg.height
				},
				right: {
					left: postion.left + boxW,
					top: postion.top + (boxH - cg.height) / 2
				},
				left: {
					left: postion.left - cg.width,
					top: postion.top + (boxH - cg.height) / 2
				}
			};
			return _ret;
		},
		/**
     * @name jQuery.bubble#createWrap
     * @private
     * @designsor 内部私有方法，构造整个bubble结构
     */
		createWrap: function(target) {
			var that = this,
			cg = that.config;

			//根据位置进行创建wrap
			if (that.postionsign(target).hasOwnProperty(cg.postion)) {
				var wrap = $('<div>').height(cg.height).width(cg.width).addClass(cg.cls).offset({
					left: that.postionsign(target)[cg.postion].left,
					top: that.postionsign(target)[cg.postion].top
				}).css({
					'z-index': 1200,
					'position': 'absolute',
					'display': 'none'
				}).attr('id', cg.id.slice(1));

				$('body').prepend(wrap);
				var T;
				$(window).bind('scroll resize', function() {
					clearTimeout(T);
					setTimeout(function() {
						$(cg.id).offset({
							left: that.postionsign(target)[cg.postion].left,
							top: that.postionsign(target)[cg.postion].top
						});
					},
				  30);
				});

			} else {
				console.log('config.postion is error puts left,right,top or bottom');
			}
		}
	}

	$.extend({
		bubble: bubble
	});

})(window, document, jQuery, GM);

