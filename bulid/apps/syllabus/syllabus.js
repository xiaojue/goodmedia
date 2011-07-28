/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110727
 * 课程表应用的js功能部分
 * 使用reuqire加载然后用exports的方式暴露接口，init组织初始化,
 * 这个文件是在iframe中被调用的，回引用window.parent的jQuery对象和GM对象，实现通讯。
 * 主要功能为3个大部分:
 * 1,数据的通讯，主要是浮出层和iframe之间的数据交流。
 * 2,四个不同tab的各种交互功能
 * 3，四个不同tab的通用功能
 */
(function(W,doc,$,G,top){
	
	//top这里为顶级页面的window对象
	
	if(top){
		var parent$=top.jQuery,
			parentGM=top.GM;
	}else{
		return;
	}
	
	var ST;
	
	var syllabus=function(){
		
		//初始化添加课程的功能
		var _initCoursehover=function(){
			var htmlstr='<a class="t" href="javascript:void(0);">添加课程</a>',
			modifstr='<a class="blue" href="javascript:void(0);">编辑</a>'+
					 '<a class="red" href="javascript:void(0);">删除</a>';
		};
		
		return {
			'exports':{
				//创建主课表
				CreateSyllabus:function(){
					
					parent$.overlay({
						content:'创建主课表<a href="javascript:void(0);" class="J_OverlayClose">关闭</a><div id="J_Calendar"></div>'
					});
					
					$('#J_CreateSyllabus').live('click',function(){
						
						parentGM.tools.overlay.fire();
						
						top.WdatePicker({
							eCont:'J_Calendar',
							firstDayOfWeek:1,
							onpicked:function(dp){
								findtable();
							}
						});
						
						var CalendarWindow=parent$('#J_Calendar iframe')[0].contentWindow;
						
						function addheighlight(table){
							var tds=table.getElementsByTagName('td');
							for(var i=0;i<tds.length;i++){
								if(tds[i].className=="Wselday"){
								 var lighttds=tds[i].parentNode.getElementsByTagName('td');
								 for(var j=0;j<lighttds.length;j++){
								 	lighttds[j].style.cssText="color:#000;";
								 }
								 break;
								}	
							}
						};
						
						
						function findtable(){
							var tables=CalendarWindow.document.getElementsByTagName('table');
							if(tables.length==0){
								setTimeout(findtable,500);
							}else{
								for(var i=0;i<tables.length;i++){
									if(tables[i].className=="WdayTable"){
										addheighlight(tables[i]);
										break;
									}
								}
							}
						};
						
						ST=setInterval(findtable,300);
						
					});
					
					//防止iframe切换后ie下不能执行已经释放的代码错误- 函数指针找不到，需要重新绑定live函数
					parent$('.J_OverlayClose').die('click');
					
					parent$('.J_OverlayClose').live('click',function(){
						parentGM.tools.overlay.close();
						clearInterval(ST);
					});
					
					
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.syllabus=syllabus;
	
})(window,document,jQuery,GM,window.top);
