/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110915
 * @fileoverview x-dongmi登录 and 注册页面……唉。又和媳妇吵架了。
 */
(function(W,G,$){
    var login=function(){

			//私有方法	
			var _fn={
				 bulidFindPwd:function(){
					 
					 $('#J_FindPwd').live('click',function(){
							 $('#J_LoginForm,#J_FindPwdForm').toggle();
					 });

				 	 $('#J_BackLogin').live('click',function(){
							 $('#J_LoginForm,#J_FindPwdForm').toggle(); 
					 });

				 var findpwdhtml='<form id="J_FindPwdForm" style="display:none;">'+
					 	 '<div class="login_text"><span>昵 称：</span>'+
						 '<p><input id="J_FindName" data-v="empty:昵称不能为空" class="login_box J_FindPwdverify" type="text" name="username">'+
						 '<a id="J_BackLogin" href="javascript:void(0);">返回登录</a></p><div class="clear"></div>'+
						 '</div>'+
					 	 '<div class="login_text"><span>邮 箱：</span>'+
						 '<p><input id="J_FindEmail" data-v="empty:邮箱不能为空|email:请输入正确的邮箱地址" class="login_box J_FindPwdverify" name="email" type="text"></p><div class="clear"></div>'+
						 '</div>'+
					 	 '<div class="login_text"><span></span><input type="image" src="http://s1.ifiter.com/v2/static/images/rpassword.gif"/></div>'+
						 '</form>';
						
					 $('#J_LoginForm').after(findpwdhtml);
				 },
					bathcallbackhand:function(val,msg,ele){
						var parent=$(ele).parent();
							if(parent.next().hasClass('J_checked')){
								parent.next().show().html(msg);
							}else{
								parent.after('<p class="J_checked red" style="padding-left:50px;">'+msg+'</p>');
							}
					},
					focushand:function(node){
						var parent=node.parent();
						if(parent.next().hasClass('J_checked')) parent.next().hide();
					},
				 checkedLogin:function(){
						var loginV=new G.widget.verify({
								form:'#J_LoginForm',
								cls:'.Gverify',
								blur:true,
								success:function(data){
									var username=data['username'],
											pwd=data['pwd'];
								},
								batchcallback:_fn.bathcallbackhand,
								focusfn:_fn.focushand
							});	
						loginV.init();
				 },
				 checkedFindPwd:function(){
						var FindV=new G.widget.verify({
								form:'#J_FindPwdForm',
								cls:'.J_FindPwdverify',
								blur:true,
								success:function(data){
									var username=data['username'],
											email=data['email'];
								},
								batchcallback:_fn.bathcallbackhand,
								focusfn:_fn.focushand
							});
						FindV.init();
				 }
			}


			return {
				exports:{
					login_init:function(){
						G.widget.use('verify',function(widget){
							_fn.bulidFindPwd();
							_fn.checkedLogin();
							_fn.checkedFindPwd();
						});
					},
					register_init:function(){

					}
				}
			}
		}();

		if(G && G.apps) G.apps.login=login;

})(window,GM,jQuery)
