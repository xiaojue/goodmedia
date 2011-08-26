/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110804
 * @fileoverview 分享消息到新浪微博使用内置xweibo的接口
 * 
 */
(function(W,G){
	
	var sharetosina=function(data){
		
		if(!data) return;
		
		var url="/course/courseAction.jsp";
		
		$.ajax({
			url:url,
			data:data,
			success:function(result){
				if($.trim(result)==1){
					alert('分享成功！');
				}else{
					alert('网络超时,请重试');
				}	
			},
			error:function(){
				alert('网络超时,请重试');
			},
			timeout:5000
		})
	}
	
	if(G && G.widget) G.widget.sharetosina=sharetosina;
	
})(window,GM);