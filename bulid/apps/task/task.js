/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110807
 * 动米网任务浮出层管理
 */
(function(W,G){

		//基本结构1 baidu hi bjsolaC
		var tempOne=function(html){
			var str='<div class="task_top"></div>'+
					'<div class="mid">'+
						'<table border="0" cellpadding="0" cellspacing="0" width="620px">'+
							'<tbody>'+
        						'<tr>'+
            					'<td class="midTask_l">&nbsp;</td>'+
            					'<td class="midTask_c">'+
            						html+
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
							'<div class="ico"><img src="http://s1.ifiter.com/static/images/nTask/ico.gif"/></div>'+
							'<div style="height:5px;overflow:hidden;"><img src="http://s1.ifiter.com/static/images/nTask/task_tbg.gif" style="vertical-align:top;"/></div>'+
							'<div class="task_text">'+
								right+
							'</div>'+
							'<div style="height:5px;overflow:hidden;"><img src="http://s1.ifiter.com/static/images/nTask/task_bbg.gif" style="vertical-align:top;"/></div>'+
						'</div>'+
						'<div class="clear"></div>'+
					'</div>'+
					'<div class="task_but">'+
						foot+
					'</div>';
					
			return tempOne(html);
		};
		
		
		var bulidbuttery=function(step){
			var buttery='<div class="tip tcolor" id="J_Buttery">'+
				            '<b class="b1"></b><b class="b2"></b><b class="b3"></b><b class="b4"></b>'+ 
				            '<div class="tip_cont">'+  
				                '<p><span><a href="javascript:void(0);" id="J_ButteryClose">&times</a></span>完成<a href="javascript:void(0);" id="J_FireStep1" data-step="'+step+'">新手任务</a></p>'+
				                '<p>轻松获得大米<a href="http://x.idongmi.com/user/dami.jsp">（积分）</a></p>'+
				            '</div>'+
				            '<b class="b5"></b><b class="b6"></b><b class="b7"></b><b class="b8"></b>'+     
				        '</div>';
				        
			$('#J_IndexMuen').prepend(buttery);
		}
		
		var task=function(){
			return {
				exports:{
					fire:function(todo,parameter){
						//如果有TaskConfig这个全局对象并且不存在flg cookie的话，则初始化任务功能
						this.parameter=parameter;
						
						var GMTask=$.cookie(this.parameter['uid']),
							
							ishashTips=/^NoTips$/.test(W.location.search.slice(1));
							
						if(!GMTask && (!ishashTips || todo=="step3finish")){ //如果不存在cookie，并且没有notips或者有notips但是是第三步的时候
							if($.cookie(this.parameter['uid']+'over')==1) return; //如果第三步也点了确定
							this.bulidTask(todo);
						}
							this.bindEvent();
						
					},
					bulidTask:function(todo,parameter){
						var that=this;
						var todolist={
							'welcome':function(){
								var str="<div class='task_txt'><div class='task_text1'>"+
										"<div class='title'>嗨，{username}你好，欢迎加入动米网。</div>"+
										"<p>动米网是一个汇聚了天南海北的健身爱好者的交流社区，动米网不光能汇聚健身好友，还有很多专业的，好玩的功能。<br>"+
										"让{coachname}带你一起来了解一下我们吧！<br>"+
										"完成下面的三个任务，就能获得积分呦~~ ^_^</p>"+
										"</div></div>"+
										"<div class='task_but'>"+
										'<input type="checkbox" id="J_GMTask">以后不在弹出'+
										'<span><a class="blue J_OverlayClose" href="#">谢谢，自己玩...</a></span>'+
										'<input type="button" class="task_button" style="cursor:pointer;" value="完成" id="J_Todo1">'+
										'</div>';
										
								return tempOne(str);
							},
							'step1':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
								         '<p>不知道我称呼您为先生呢？还是女士？</p>'+
								         '<p>您平时喜欢什么健身项目？在家健身还是去健身场所</p>'+
								         '<p>您和朋友一起去散步？还是找私人健身教练指定一套健身方案？</p>'+
								         '<p>第一个任务：<span class="blue">完善您的健身信息</span></p>'+
								         '<p>别忘了告诉我您性别</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="{todourl}" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">做任务</a>';
										 
								return tempTwo(left,right,foot);
							},
							'step1finish':function(){
								if($.cookie(that.parameter['uid']+'task1')==1){
									return todolist['step2']();
								}
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>您已完成第一个任务<span class="yellow">(已获得了{rice}大米)</span></p>',
								         //'<p class="green">并且获得我们为您准备的{food}食物</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="#" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;" id="J_Todo2">下一个任务</a>';
								$.cookie(that.parameter['uid']+'task1',1,{expires:365});
								return tempTwo(left,right,foot);
							},
							'step2':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
								         '<p>你有私人教练吗？你有一套属于自己的健身方案吗？</p>'+
										 '<p>快来申请，一个属于你自己的健身方案吧。</p>'+
										 '<p>第二个任务：<span class="blue">申请健身方案</span></p>'+
										 '<p>健身方案的申请可以发给我们的教练团哦，看看教练团会给你什么建议吧^_^</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="{todourl}" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">做任务</a>';
									 
								return tempTwo(left,right,foot);
							},
							'step2finish':function(){
								if($.cookie(that.parameter['uid']+'task2')==1){
									return todolist['step3']();
								}
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>您已完成第二个任务<span class="yellow">已获得了{rice}大米</span></p>',
								         //'<p class="green">距离兑换{food}食物还差{gap}大米</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="#" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;" id="J_Todo3">下一个任务</a>';
								$.cookie(that.parameter['uid']+'task2',1,{expires:365});
								return tempTwo(left,right,foot);
							},
							'step3':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>最后一个任务最简单！</p>'+
										 '<p>绑定你的新浪微博账号吧，让动米网和新浪同时分享你的日记、健身方案、照片……</p>'+
										 '<p>第三个任务：<span class="blue">绑定你得新浪微博账号</span></p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="{todourl}" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">做任务</a>';
								
								return tempTwo(left,right,foot);
							},
							'step3finish':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>动米网的三个你以全部完成！</p>'+
								         '<p class="yellow">本共累计获得了{rice}分。</p>',
								         //'<p class="green">并且获得我们为您准备的{gift}礼物</p>',
									foot='<a href="#" class="blue J_OverlayClose J_FinishTask">谢谢，自己玩...</a>'+
										 '<a class="task_button J_OverlayClose J_FinishTask" href="javascript:void(0)" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">完成</a>';
								return tempTwo(left,right,foot);
							}
						};
						
						$.overlay();
						
						var lay=todolist[todo]();
						
						lay=$.substitute(lay,this.parameter);
						
						GM.tools.overlay.fire(lay);
						
					},
					bindEvent:function(){
						var that=this;
						//写入cookie，1年不再弹出
						$('#J_GMTask').live('click',function(){
							if($(this).attr('checked')){
								$.cookie(that.parameter['uid'],1,{expires:30});
							}else{
								$.cookie(that.parameter['uid'],null);
							}
						});
						
						//谢谢自己玩的关闭按钮
						$('.J_OverlayClose').live('click',function(){
							GM.tools.overlay.close();
						});
						
						//欢迎页面的完成动作
						$('#J_Todo1').live('click',function(){
							that.bulidTask('step1',that.parameter);
						});
						
						$('#J_Todo2').live('click',function(){
							that.bulidTask('step2',that.parameter);
						});
						
						$('#J_Todo3').live('click',function(){
							that.bulidTask('step3',that.parameter);
						});
						
						//小覆层
						$('#J_ButteryClose').live('click',function(){
							$('#J_Buttery').hide();
						});
						
						$('#J_FireStep1').live('click',function(){
							var funname=$(this).attr('data-step');
							that.bulidTask(funname,that.parameter);
						});
						
						//完成
						$('.J_FinishTask').live('click',function(){
							$.cookie(that.parameter['uid'],1,{expires:365});
							$.cookie(that.parameter['uid']+'over',1,{expires:365});
						});
						
					},
					bulidbuttery:function(step){
						if($.cookie(this.parameter['uid'])==1) return;
						bulidbuttery(step);
					}
				}
			}
		}();
		
		if(G && G.apps) G.apps.task=task;
	
})(window,GM);