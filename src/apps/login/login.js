/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110915
 * @fileoverview x-dongmi登录 and 注册页面……唉。又和媳妇吵架了。
 */
(function(W,G,$,doc){
    var login=function(){

			//私有方法	
			var _fn={
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
									var action='http://bbs.idongmi.com/bbs/logging.php?action=login&loginsubmit=yes&inajax=1',
											username=data['username'],
											pwd=data['password'],
											data={
													password:pwd,
													loginfield:'username',
													questionid:0,
													referer:'',
													answer:'',
													formhash:'52c87683'
											};

											if(data['cookietime']) data.cookietime=data['cookietime'];

											action+='&'+$.param(data);
											
									$.ajax({
											url:'/api/api_getURL2js.jsp?op=login&username='+username+'&pwd='+data['password']+'&url='+encodeURIComponent(action),
											datatype:'xml',
											success:function(ret){
												var root=$(ret).find('root')[0],
														result=$(root).text();
													try{
														if(result!='' && !(/\<script/.test(result))){
															$('#J_Status').text(result);
															$('#J_Status').closest('.login_text').show();
														}else{
															var scripts=result.match(/src="(.+?)"/g);
															for(var i=0;i<scripts.length;i++){
																var src=scripts[i].slice(5,scripts[i].length-1);
																$.getScript(src);
															};
															var search=$.analyse(window.location.search.slice(1)),
																  referer=search['referer'];
															if(!referer) referer=(window.ref!='null' || window.ref=="http://x.idongmi.com/reg.jsp") ? window.ref : 'http://x.idongmi.com/';
															$('#J_Status').html('欢迎您,'+username+',2秒后自动<a href="'+decodeURIComponent(referer)+'">返回</a>')
															$('#J_Status').closest('.login_text').show();
															$.cookie('CNAME',username,{
																	domain:'.idongmi.com',
																	path:'/',
																	expires:5
															});
															setTimeout(function(){
																	window.location.href=decodeURIComponent(referer);
																},2000);
														}
													}catch(e){
														alert(e);
													}
											},
											error:function(){
												$('#J_Status').html('网络超时，请重试');
											}
										})
								},
								batchcallback:_fn.bathcallbackhand,
								focusfn:_fn.focushand
							});	
						loginV.init();
				 },
				 batchcallbackReghand:function(val,msg,ele){
					var parent=$(ele).parent();
					if(parent.children().last().hasClass('J_checked')){
						parent.children().last().show().html(msg);
					}else{
						parent.append('<em class="J_checked red" style="font-style:normal;">'+msg+'</em>');
					}
				 },
				 checkname:function(val,callback){
								 var action = 'http://bbs.idongmi.com/bbs/ajax.php?infloat=register&handlekey=register&action=checkusername&username='+val+'&inajax=1&ajaxtarget=returnmessage4',
								 		 baseapi = '/api/api_getURL2js.jsp?op=get&url=';
										 $.ajax({
												 url:baseapi+encodeURIComponent(action),
												 datatype:'xml',
												 type:'get',
												 success:function(ret){
													 var root=$(ret).find('root')[0],
														   result=$(root).text();
															 if(/'1', '用户名已经被他人使用'/.test(result)){
																	_fn.batchcallbackReghand('','用户名已经被他人使用',doc.getElementById('J_UserName'));
															 }else{
																 if(callback) callback();
															 }
												 },
												 error:function(){
													 _fn.batchcallbackReghand('','响应超时，请重新填写',doc.getElementById('J_UserName'));
												 }
											 });
										 return true; //都返回true，因为是异步，在success中判断异步处理;
				 },
				 checkeml:function(val,callback){
								 var action='http://bbs.idongmi.com/bbs/ajax.php?infloat=register&handlekey=register&action=checkemail&email='+val+'&inajax=1&ajaxtarget=returnmessage4',
								 		 baseapi= '/api/api_getURL2js.jsp?op=get&url=';
										 $.ajax({
												url:baseapi+encodeURIComponent(action),
												datatype:'xml',
												type:'get',
												success:function(ret){
													var root=$(ret).find('root')[0],
														result=$(root).text();
														if(/'1', '该 Email 地址已经被注册'/.test(result)){
															_fn.batchcallbackReghand('','该 Email 地址已经被注册',doc.getElementById('J_Email'));
														}else{
															if(callback) callback();
														}
												},
												error:function(){
													 _fn.batchcallbackReghand('','响应超时，请重新填写',doc.getElementById('J_Email'));
												}
											});
									return true;
				 },
				 checkedReg:function(){
					 var RegV=new G.widget.verify({
								form:'#J_RegForm',
								cls:'.J_Regverify',
								blur:true,
								success:function(data){
									_fn.checkname($('#J_UserName').val(),function(){
											_fn.checkeml($('#J_Email').val(),function(){
												$('#J_RegForm').die();	
												$('#J_RegForm').submit();	
											});
									});
								},
								batchcallback:_fn.batchcallbackReghand,
								focusfn:function(node){
									if(node.parent().children().last().hasClass('J_checked')) node.parent().children().last().hide();
								}
						 },{
							 checkusername:_fn.checkname,
							 checkemail:_fn.checkeml
						 });
					 RegV.init();
				 }
			}


			return {
				exports:{
					login_init:function(){
						G.widget.use('verify',function(widget){
							_fn.checkedLogin();
							if($.cookie('CNAME')) $('#J_Name').val($.cookie('CNAME'));
						});
					},
					register_init:function(){
						G.widget.use('verify',function(widget){
							_fn.checkedReg();
						});
					}
				}
			}
		}();

		if(G && G.apps) G.apps.login=login;

})(window,GM,jQuery,document)
