/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110727
 * 课程表应用的js功能部分
 * 使用reuqire加载然后用exports的方式暴露接口，init组织初始化
 */
(function(W,doc,$,G){
	
	var syllabus=function(){
		
		var htmlstr='<a class="t" href="javascript:void(0);">添加课程</a>',
			modifstr='<a class="blue" href="javascript:void(0);">编辑</a>'+
					 '<a class="red" href="javascript:void(0);">删除</a>';
		
		//初始化添加课程的功能
		var _initCoursehover=function(){
			
		};
		
		
		return {
			'init':function(){
				
			},
			'export':{
				
			}
		}
	}();
	
	if(G && G.apps) G.apps.syllabus=syllabus;
	
	G.apps.syllabus.init();
	
})(window,document,jQuery,GM);
