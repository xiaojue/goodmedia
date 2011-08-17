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
	
	//判断使用路径
	var ishost=(W.location.href.match('idongmi.com')),
		uri=(ishost) ?'http://x.idongmi.com/static/GM/' : 'http://172.16.2.215/gm/';
	
	//根目录
	GM.host = uri;
	
	//额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	GM.apps.require=function(appname,callback){
		var appuri = GM.host + 'bulid/apps/'+appname+'/'+appname+'-min.js';
		$(function(){
			$.getScript(appuri,function(){
				if(callback) callback(GM.apps[appname]['exports'])
			});
		});
	}
	
	//加载widget的方法
	GM.widget.usemap={};
	
	GM.widget.use=function(widget,callback){
		if(GM.widget.usemap.hasOwnProperty(widget)){
			if(callback) callback(GM.widget);
			return;
		} 
		var widgeturi = GM.host + 'bulid/widget/'+widget+'/'+widget+'-min.js';
		$(function(){
			$.getScript(widgeturi,function(){
				GM.widget.usemap[widget]=widgeturi;
				if(callback) callback(GM.widget);
			});
		});
	}
	
	W.GM=GM;
})(window,document,jQuery);
