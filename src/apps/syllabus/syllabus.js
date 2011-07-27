/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110727
 * 课程表应用的js功能部分
 * 使用reuqire加载然后用exports的方式暴露接口，init组织初始化
 */
(function(W,doc,$,G){
	
	var syllabus=function(){
		
		
		
		return {
			'init':function(){
				
			},
			'export':{
				a:1
			}
		}
	}();
	
	if(G && G.apps) G.apps.syllabus=syllabus;
	
	G.apps.syllabus.init();
	
})(window,document,jQuery,GM);
