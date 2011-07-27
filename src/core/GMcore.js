/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110726
 * 基于jquery1.6.2
 * Goodmedia前端js库core文件，负责创建GM对象和构建命名空间
 */
(function(W,doc,$){
	if(!window.GM) var GM={};
	
	//与业务紧密相关的-挂件
	GM.widget={};
	//与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	GM.tools={};
	//独立项目或者应用
	GM.apps={};
	
	//额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	GM.apps.require=function(appname,callback){
		var ishost=(W.location.href.match('dev.ifiter')),
		uri=(ishost) ?'http://dev.ifiter.com/static/GM/' : 'http://goodmedia01-pc/gm/'
		var appuri= uri + 'bulid/apps/'+appname+'/'+appname+'.js';
		$(function(){
			$.getScript(appuri,function(){
				if(callback) callback(GM.apps[appname]['exports'])
			});
		});
	}
	
	W.GM=GM;
})(window,document,jQuery);
