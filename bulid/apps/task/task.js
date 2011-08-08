/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110807
 * 动米网任务浮出层管理
 */
(function(W,G){

		//基本结构1
		var tempOne=function(html){
			var str='<div class="task_top"></div>'+
					'<div class="mid">'+
						'<table border="0" cellpadding="0" cellspacing="0" width="620px">'+
							'<tbody>'+
        						'<tr>'+
            					'<td class="midTask_l">&nbsp;</td>'+
            					'<td class="midTask_c">'+
            						+html
            					'</td>'+
            					'<td class="midTask_r">&nbsp;</td>'+
            					'</tr>'+
    						'</tbody>'+
						'</table>'+
					'</div>'+
				'<div class="task_bottom"></div>';
				
			return str;
		};
		
		//基本结构2
		var tempTwo=function(left,right,foot){
			var html='<div class="task_txt">'+
						'<div class="task_left">'+
						left+
						'</div>'+
						'<div class="task_right">'+
							'<div class="ico"><img src="static/images/nTask/ico.gif"></div>'+
							'<div><img src="static/images/nTask/task_tbg.gif"></div>'+
							'<div class="task_text">'+
								right+
							'</div>'+
							'<div><img src="static/images/nTask/task_bbg.gif"></div>'+
						'</div>'+
						'<div class="clear"></div>'+
					'</div>'+
					'<div class="task_but">'+
						foot+
					'</div>';
					
			return tempOne(html);
		};
		
        /*
         <img src="static/images/pic_img1.jpg"><span>美女教练名字</span></div>
             
         <div class="green">亲爱的XXXX</div>
         <p>不知道我称呼您为先生呢？还是女士？</p>
         <p>您平时喜欢什么健身项目？在家健身还是去健身场所</p>
         <p>您和朋友一起去散步？还是找私人健身教练指定一套健身方案？</p>
         <p>第一个任务：<span class="blue">完善您的健身信息</span>（有意外的惊喜）</p>
         <p>别忘了告诉我您性别</p>
        
        <a href="#" class="blue">谢谢，自己玩...</a><input name="1" value="做任务" class="task_button" type="button">
		*/
				
		var task=function(){
			return {
				exports:{
					fire:function(todo,parameter){
						//如果有TaskConfig这个全局对象并且不存在flg cookie的话，则初始化任务功能

						var GMTask=G.cookie('GMTask');
						
						if(!GMTask) G.cookie('GMTask',0,{expires:365}); //一年过期  0 弹，1不弹
					
						if(W.TaskConfig && GMTask==0){
							
							this.bulidTask(todo,parameter);
							
							this.bindEvent();
						}
					},
					bulidTask:function(todo,parameter){
						var todolist={
							'welcome':function(){
								var name=parameter.username,
									url='#';
								
								tempOne()
							},
							'step1':function(){
								
							},
							'step1finish':function(){
								
							},
							'step2':function(){
								
							},
							'step2finish':function(){
								
							},
							'step3':function(){
								
							},
							'step3finish':function(){
								
							}
						};
						
						$.overlay();
						GM.tools.overlay.reset(620,256);
						var lay=todolist[todo]();
						GM.tools.overlay.fire(lay);
					},
					bindEvent:function(){
						
						$('J_GMTask').live('click',function(){
							G.cookie('GMTask',1,{expires:365});
						});
						
						
						
					},
				}
			}
		}
		
		if(G && G.apps) G.apps.task=task;
	
})(window,GM);
