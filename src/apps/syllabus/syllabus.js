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
	
	
	var syllabus=function(){
		
		
		
		
		var _initTab=function(tabName){
			var tabHash={
				//课表管理
				'timetablemanage':function(){
					
				},
				//教室管理
				'classroommanage':function(){
					
				},
				//健身项目管理
				'itemmmanage':function(){
					
				},
				//教练管理
				'instructormanage':function(){
					
				}
			}
			
			tabHash[tabName]();
		};
		
		//初始化添加课程的功能
		var _initCoursehover=function(){
			var htmlstr='<a class="t" href="javascript:void(0);">添加课程</a>',
			modifstr='<a class="blue" href="javascript:void(0);">编辑</a>'+
					 '<a class="red" href="javascript:void(0);">删除</a>';
		};
		
		
		
		
		return {
			'exports':{
				_initTab:function(tabmark){
					
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.syllabus=syllabus;
	
})(window,document,jQuery,GM,window.top);
