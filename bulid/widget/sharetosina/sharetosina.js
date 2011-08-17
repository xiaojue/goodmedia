/**
 * @author fuqiang
 * @date 20110804
 * 内部似有方法，分享消息到新浪微博
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