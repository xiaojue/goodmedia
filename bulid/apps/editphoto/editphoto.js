/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110727
 * 照片墙编辑照片部分的交互应用
 */
(function(W,doc,$,G){
	
	var editphoto=function(){
		
				
		
		return {
			exports:{
				init:function(){
					
					$.overlay();
					
					$('.editor_box').blur(function(){
						var overlaystr='<div class="popup1_rounded">'+
									    '<div class="popup1_cont">'+
									        '<div class="close"><img src="http://x.idongmi.com/static/images/tab_ico.gif" class="J_OverlayClose"></div>'+
									        '<div class="text"><img src="http://x.idongmi.com/static/images/loading.gif" alt="loading"></div>'+
									        //'<div class="text">相片名称修改成功</div>'+
									        '<div class="pop_but">'+
									        	'<input type="button" class="space_button" value="确认" class="J_OverlayClose">'+
									        '</div>'+
									    '</div>'+
									    '<div class="clear"></div>'+
									    '<div><img src="http://x.idongmi.com/static/images/popup1_bbg.png"></div>'+
									'</div>';
						GM.tools.overlay.reset(323,219);
						GM.tools.overlay.fire(overlaystr);
						var setobj={};
						$(this).parent('from').children('input[type="text"],input[type="hidden"],select').each(function(){
						});
						
						$.ajax({
							url:'xxx.jsp',
							data:{},
							success:function(){
								
							},
							error:function(){
								
							}
						})
					});
										
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.editphoto=editphoto;
	
})(window,document,jQuery,GM);
