/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110807
 * 动米网任务浮出层管理
 */
(function(W,G){

	//如果有TaskConfig这个全局对象并且不存在flg cookie的话，则初始化任务功能

	var GMTask=G.cookie('GMTask');
	
	if(!GMTask) G.cookie('GMTask',0,{expires:365}); //一年过期  0 弹，1不弹

	if(W.TaskConfig && GMTask==0){
		
		$('J_GMTask').live('click',function(){
			G.cookie('GMTask',1,{expires:365});
		});
		
		var task=function(config){
			
		}
		
		if(G && G.apps) G.apps.task=task;
	}
})(window,GM);
