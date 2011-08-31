/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110807
 * @fileoverview 动米网任务浮出层管理
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
		/**
		 * @memberOf GM.apps
		 * @description 动米网任务浮出层管理
		 */
		var task=function(){
			return {
				/**
				 * @namespace
				 * @memberOf GM.apps.task
				 */
				exports:{
					/**
					 * @memberOf GM.apps.task.exports
					 * @function
					 * @description 触发浮出层弹出
					 * @public
					 * @param {string} todo 触发哪个任务
					 * @param {object} parameter 任务所需要的变量参数
					 */
					fire:function(todo,parameter){
						//如果有TaskConfig这个全局对象并且不存在flg cookie的话，则初始化任务功能
						this.parameter=parameter;
						
						var GMTask=$.cookie(this.parameter['uid']),
							
							ishashTips=/^NoTips$/.test(W.location.search.slice(1)),
							isopen=/^opendiv$/.test(W.location.hash.slice(1))
							
							if(isopen){
								if(toggle) toggle('div1');
							}
							
						if(!GMTask && (!ishashTips || todo=="step3finish")){ //如果不存在cookie，并且没有notips或者有notips但是是第三步的时候
							if($.cookie(this.parameter['uid']+'over')==1) return; //如果第三步也点了确定
							this.bulidTask(todo);
						}
							this.bindEvent();
						
					},
					/**
					 * @memberOf GM.apps.task.exports
					 * @function
					 * @description 构建任务DOM结构
					 * @private
					 * @param {string} todo 任务名
					 * @param {object} parameter 任务所需变量
					 */
					bulidTask:function(todo,parameter){
						var that=this;
						var todolist={
							'welcome':function(){
								var str="<div class='task_txt'><div class='task_text1'>"+
										"<div class='title'>嗨，{username}你好，欢迎加入动米网。</div>"+
										"<p>动米网是一个汇聚了天南海北的健身爱好者的交流社区，<br>动米网不光能汇聚健身好友，<br>还有很多专业、好玩的功能。<br>"+
										"让{coachname}带你一起来了解我们吧！<br>"+
										"</div></div>"+
										"<div class='task_but'>"+
										'<input type="checkbox" id="J_GMTask">以后不再弹出'+
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
								         '<p><span class="blue">完善健身信息</span>让有同样爱好的朋友能轻松找到你。</p>',
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
										 '<p>感谢你填写的健身信息，<span class="yellow">我们送你{rice}大米！</span></p>'+
										 '<p>大米是动米网的积分，随着动米网的成长，我们将提供大米换礼功能。</p>',
								         //'<p class="green">并且获得我们为您准备的{food}食物</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="#" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;" id="J_Todo2">下一个任务</a>';
								$.cookie(that.parameter['uid']+'task1',1,{
									expires:365,
									path:"/"
								});
								return tempTwo(left,right,foot);
							},
							'step2':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
								         '<p>你有私人教练吗？你有一套属于自己的健身方案吗？</p>'+
										 '<p>输入身高、体重及你的目标，就能立刻得到一个属于你自己的健身方案。</p>'+
										 '<p><span class="blue">申请健身方案</span>看看哪些动作可以帮你实现健身目标。</p>'+
										 '<p>也可以把你的健身申请发给动米网教练团，与教练一对一沟通。</p>',
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
										 '<p>恭喜你申请到一个属于自己的健身方案，<span class="yellow">并且获得了{rice}大米。</span></p>'+
										 '<p style="font-size:12px;color:#666;">请在按方案健身时穿合脚的运动鞋，柔软易吸汗的衣服。如方案中有需要进行躺、卧、跪等动作要求时，请准备一个瑜伽垫或不影响运动的防滑的薄垫子，以避免身体受损。</p>'+
										 '<p style="font-size:12px;color:#666;">友情提示：此方案仅供参考，请根据自身实际情况量力而行。动米网建议您去健身会所，让有资质的健身教练为您调整方案，以达到最佳健身效果。</p>',
								         //'<p class="green">距离兑换{food}食物还差{gap}大米</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="#" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;" id="J_Todo3">下一个任务</a>';
								$.cookie(that.parameter['uid']+'task2',1,{
									expires:365,
									path:"/"
								});
								return tempTwo(left,right,foot);
							},
							'step3':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>申请的健身方案自己练？没意思！</p>'+
										 '<p><span class="blue">绑定新浪微博</span>分享给好友，大家一起练吧！</p>',
									foot='<a href="#" class="blue J_OverlayClose">谢谢，自己玩...</a>'+
										 '<a class="task_button" href="{todourl}" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">做任务</a>';
								
								return tempTwo(left,right,foot);
							},
							'step3finish':function(){
								var left='<img src="{coachpic}"><span>{coachname}</span>',
									right='<div class="green">亲爱的{username}</div>'+
										 '<p>绑定新浪微博成功！<span class="yellow">你轻松带走了{rice}大米。</span></p>'+
								         '<p>来看看你一共得到了多少大米吧！也许你已经是“地主”喽~~~</p>',
								         //'<p class="green">并且获得我们为您准备的{gift}礼物</p>',
									foot='<a href="#" class="blue J_OverlayClose J_FinishTask">谢谢，自己玩...</a>'+
										 '<a class="task_button J_OverlayClose J_FinishTask" href="/user/dami.jsp" target="_self" style="display:inline-block;text-decoration:none;_display:inline;zoom:1;">完成</a>';
								return tempTwo(left,right,foot);
							}
						};
						
						$.overlay();
						
						var lay=todolist[todo]();
						
						lay=$.substitute(lay,this.parameter);
						
						GM.tools.overlay.fire(lay);
						
					},
					/**
					 * @memberOf GM.apps.task.exports
					 * @function
					 * @description 绑定所有任务里的事件
					 * @private
					 */
					bindEvent:function(){
						var that=this;
						//写入cookie，1年不再弹出
						$('#J_GMTask').live('click',function(){
							if($(this).attr('checked')){
								$.cookie(that.parameter['uid'],1,{expires:365,path:"/"});
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
							//cookie 保存完成状态
							$.cookie(that.parameter['uid'],1,{expires:365,path:"/"});
							$.cookie(that.parameter['uid']+'over',1,{expires:365,path:"/"});
							$('#J_Buttery').hide();
							//ajax 告诉服务器，已经全部完成
							$.get('/user/taskAjax.jsp');
						});
						
					},
					/**
					 * @memberOf GM.apps.task.exports
					 * @function
					 * @description 创建登录条下部的提示条
					 * @public
					 * @param {number} step 到底第几步任务
					 */
					bulidbuttery:function(step){
						if($.cookie(this.parameter['uid'])==1 || $.cookie(this.parameter['uid']+'over')==1) return;
						bulidbuttery(step);
					}
				}
			}
		}();
		
		if(G && G.apps) G.apps.task=task;
	
})(window,GM);