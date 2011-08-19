/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110819
 * debug模式下增加debug工具
 * 应该包含统计，效率，测试等扩展面板
 */
(function(W,G,$){
	 var debug=function(){
	 		
		 var debugHtml='<div id="J_GMDebug" style="z-index:1500;position:absolute;right:0px;top:0px;background:#fff;border:#ccc solid 1px;">'+
		 								'<h3>debugbar</h3>'+
										'<h4>js</h4>'+
										'<p style="line-height:20px;">{js}</p>'+
										'<h4>css</h4>'+
										'<p style="line-height:20px;">{css}</p>'+
										'<p><a class="J_DebugClose" href="javascript:void(0);">关闭</a></p>'+
		 						'</div>';


		 		return{
					init:function(){
						var that=this;
						$(function(){
								var temp=that.reset(debugHtml),T;
								$('body').append(temp);
								
								$('.J_DebugClose').live('click',function(){
									$('#J_GMDebug').hide();
									clearInterval(T);
								});
								
								T=setInterval(function(){that.resetdebug()},800);
						});
					},
					get:function(tag){
						var returnval="",tags=document.getElementsByTagName(tag);
							for(var i=0;i<tags.length;i++){
								var tag=tags[i],
									src=tag.src || tag.href;
								if(src) returnval += '<a href="'+src+'" style="width:300px;display:inline-block;overflow:hidden;height:20px;background:#eee;">'+src+'</a><br/>';
							}
						return returnval;
					},
					reset:function(temp){
						var that=this;
						return $.substitute(temp,{
											js:that.get('script'),
											css:that.get('link')
									});	
					},
					resetdebug:function(){
						var that=this,str=that.reset(debugHtml);
						$('#J_GMDebug').html(str);
					}
				}
		}();
	
	 if(G && G.widget) G.widget.debug=debug;
		
})(window,GM,jQuery);
