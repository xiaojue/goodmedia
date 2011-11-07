/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview Goodmedia前端js库core文件，负责创建GM对象和构建命名空间 基于jquery1.6.2
 */
(function(W, doc, $) {
	/**
	 * @namespace
	 * @name GM
	 * @description 全局的GM对象
	 */

	/**
	 * @namespace
	 * @name jQuery
	 * @description 这里只对私自扩展的jQuery进行doc描述
	 */

	if (!W.GM) var GM = {};
	/**
	 * @namespace
	 * @description 与业务紧密相关的-挂件
	 */
	GM.widget = {};
	/**
	 * @namespace
	 * @description 与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	 */
	GM.tools = {};
	/**
	 * @namespace
	 * @description 独立项目或者应用
	 */
	GM.apps = {};
	/**
	 * @constant
	 * @description 根据href里德debug关键字确定是否为debug模式
	 */
	GM.debug = W.GMDEBUG.aver;
	/**
	 * @constant
	 * @description 获取当前js的根目录
	 */
	GM.host = function() {
		var scripts = doc.getElementsByTagName('script'),
		i,
		base;
		for (i = 0; i < scripts.length; i++) {
			var src = scripts[i].src,
			namereg = /(GM-min|GM).js/;
			if (namereg.test(src)) {
				base = src.slice(0, src.lastIndexOf('/') + 1);
			}
		}
		return base;
	} ();
	/**
	 * @static
	 * @description 转换到本地非压缩路径
	 * @function
	 * @param {string} uri
	 * @returns {string} 处理过的路径
	 */
	GM.locality = function(uri) {
		return uri.replace(/bulid/g, 'src').replace(/\-min/g, '');
	};
	/**
	 * @constant
	 * @description widget的根目录
	 */
	GM.widget.host = GM.host + 'widget/';
	/**
	 * @constant
	 * @description apps的根目录
	 */
	GM.apps.host = GM.host + 'apps/';

	//debug模式下处理路径
	if (GM.debug) {
		GM.host = W.GMDEBUG.host + 'bulid/';
		GM.widget.host = GM.locality(GM.host) + 'widget/';
		GM.apps.host = GM.locality(GM.host) + 'apps/';
	}
	/**
	 * @static
	 * @description 额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	 * @function
	 * @param {string} appname
	 * @param {function} callback
	 */

	GM.apps.map = {};

	GM.apps.require = function(appname, callback) {
		if (GM.apps.map.hasOwnProperty(appname)) {
			callback(GM.apps[appname]['exports']);
			return;
		}
		var appuri = GM.host + 'apps/' + appname + '/' + appname + '-min.js';
		if (GM.debug) appuri = GM.locality(appuri);
		$(function() {
			$.getScript(appuri, function() {
				if (callback) {
					GM.apps.map[appname] = {
						uri: appuri
					};
					callback(GM.apps[appname]['exports']);
				}
			});
		});
	};
	/**
	 * @static
	 * @description 把用过的widget储存，再次use则不再调用
	 * @private
	 */
	GM.widget.usemap = {};
	/**
	 * @static
	 * @description 加载widget的方法
	 * @function
	 * @param {String} widget
	 * @param {function} callback
	 */
	GM.widget.use = function(widget, callback) {
		if (GM.widget.usemap.hasOwnProperty(widget)) {
			callback(GM.widget);
			return;
		}

		var widgeturi = GM.host + 'widget/' + widget + '/' + widget + '-min.js';
		if (GM.debug) widgeturi = GM.locality(widgeturi);
		$(function() {
			$.getScript(widgeturi, function() {
				GM.widget.usemap[widget] = {
					uri: widgeturi
				};
				callback(GM.widget);
			});
		});
	};

	//debug 模式下开启debug.js并且初始化debug面板
	if (GM.debug) {
		GM.widget.use('debug', function(widget) {
			widget.debug.init();
		});
	}

	GM.apps.require('idongmi', function(exports) {
		exports.init();
	});

	$(function() {
		if ($('#J_MuenbarV2').length > 0) {
			GM.apps.require('cmsmuenbarv2', function(exports) {
				exports.init();
			});
		}
	});

	W.GM = GM;
})(window, document, jQuery);

