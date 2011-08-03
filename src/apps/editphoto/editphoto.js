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
					
					function getaction(){
						
						if($(this).val()==$(this).attr('data-old') || $(this).val()=="-1") return;
						
						var overlaystr='<div class="popup1_rounded">'+
									    '<div class="popup1_cont">'+
									        '<div class="close"><img src="http://x.idongmi.com/static/images/tab_ico.gif" class="J_OverlayClose"></div>'+
									        '<div class="text" id="J_MainText"><img src="http://x.idongmi.com/static/images/loading.gif" alt="loading"></div>'+
									        '<div class="pop_but">'+
									        	'<input type="button" class="space_button J_OverlayClose" value="确认">'+
									        '</div>'+
									    '</div>'+
									    '<div class="clear"></div>'+
									    '<div><img src="http://x.idongmi.com/static/images/popup1_bbg.png"></div>'+
									'</div>';
						GM.tools.overlay.reset(323,219);
						GM.tools.overlay.fire(overlaystr);
						var setobj={};
						
						$(this).parents('form').children('input,select').each(function(){
							var name=$(this).attr('name'),value=$(this).val();
							setobj[name]=value;
						});
						
						if($(this).attr('type')=='text'){
							setobj['pname']=$(this).val();
						}else if(this.tagName.toLowerCase()=='select'){
							setobj['movecolid']=$(this).val();
						}
						
						$.ajax({
							url:'/photo/photoAction.jsp',
							type:'POST',
							data:setobj,
							success:function(str){
								var str=$.trim(str);
								try{
									eval('var obj='+str);
									$('#J_MainText').text(obj.msg);
								}catch(e){
									$('#J_MainText').text('程序异常，稍后再试');
								}
								setTimeout(function(){
									GM.tools.overlay.close();
									if(obj.status==1){
										if(obj.op && obj.colid){
											window.location.href="/photo/index.jsp?op=editcol&colid="+obj.colid+"&reload=1";
											return;
										}else{
											if(window.location.href.match('reload=1')){
												window.location.reload();
											}else{
												window.location.href+='&reload=1'
											}
										}
									}
								},2000);
							},
							error:function(){
								$('#J_MainText').text('程序异常，稍后再试');
								setTimeout(function(){
									GM.tools.overlay.close();
								},2000);
							}
						});
					}
					
					var saveValue=function(){
						$(this).attr('data-old',$(this).val());
					};
					
					$('.editor_box1,.editor_box').focus(saveValue).blur(getaction).each(function(){
						$(this).keydown(function(e){
							if(e.keyCode==13){
								return false;
							}
						});
					});
					
					$('.editor_box2').change(getaction);
					
					$('.J_OverlayClose').live('click',function(){
						GM.tools.overlay.close();
					});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.editphoto=editphoto;
	
})(window,document,jQuery,GM);
