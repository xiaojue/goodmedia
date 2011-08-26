/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview Goodmedia前端js库core文件，负责创建GM对象和构建命名空间 基于jquery1.6.2
 */
(function(W,doc,$){
	/**
	 * @namespace GM
	 */
	if(!W.GM) var GM={};
	
	//与业务紧密相关的-挂件
	GM.widget={};
	//与业务无关的比如overlay组件,最后扩展到jquery上，使用jquery的扩展机制进行最后的封装
	GM.tools={};
	//独立项目或者应用
	GM.apps={};
	
	//是否是debug模式
	GM.debug=function(){
		var isdebug=(W.location.href.match('debug'));
		return isdebug;
	}();

	//判断使用路径
	//先找到当前的路径
	GM.host=function(){
		var scripts=doc.getElementsByTagName('script'),i,base;
		for(i=0;i<scripts.length;i++){
			var src=scripts[i].src,
					namereg=/(GM-min|GM).js/;
			if(namereg.test(src)){
				base=src.slice(0,src.lastIndexOf('/')+1);
			}
		}
		return base;
	}();
	
	//转换到本地非压缩路径
	GM.locality=function(uri){
		return uri.replace('bulid','src').replace('-min','');
	}
	
	GM.widget.host=GM.host + 'widget/';
	GM.apps.host=GM.host + 'apps/';
	
	if(GM.debug){
		GM.host='http://172.16.2.215/gm/bulid/';
		GM.widget.host=GM.locality(GM.host) + 'widget/';
		GM.apps.host=GM.locality(GM.host) + 'apps/';
	}
	
	//额外加载项目文件 - 项目文件目前依赖关系依靠ant维护
	GM.apps.require=function(appname,callback){
		var appuri = GM.host + 'apps/'+appname+'/'+appname+'-min.js';
		if(GM.debug) appuri=GM.locality(appuri);
		$(function(){
			$.getScript(appuri,function(){
				if(callback) callback(GM.apps[appname]['exports']);
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
		var widgeturi = GM.host + 'widget/'+widget+'/'+widget+'-min.js';
		if(GM.debug) widgeturi=GM.locality(widgeturi);
		$(function(){
			$.getScript(widgeturi,function(){
				GM.widget.usemap[widget]=widgeturi;
				if(callback) callback(GM.widget);
			});
		});
	}
	
	//debug 模式下开启debug.js并且初始化debug面板
	if(GM.debug){
		GM.widget.use('debug',function(widget){
				widget.debug.init();
		});
	} 
	
	W.GM=GM;
})(window,document,jQuery);
