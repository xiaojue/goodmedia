/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110915
 * @fileoverview x-dongmi登录 and 注册流程的校验部分 与ajax异步和bbs端登录同步的部分。
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
          logintoBss:function(data){
									var action='http://bbs.idongmi.com/bbs/logging.php?action=login&loginsubmit=yes&inajax=1',
											username=data['username'],
											pwd=data['password'],
											ret={
													password:pwd,
													loginfield:'username',
													questionid:0,
													referer:'',
													answer:'',
													formhash:'52c87683'
											};

											if(data['cookietime']) ret.cookietime=data['cookietime'];

											action+='&'+$.param(ret);
											
									$.ajax({
                      url:'/api/api_getURL2js.jsp?op=login&url='+encodeURIComponent(action),
											datatype:'xml',
                      type:'post',
                      data:{
                        username:data['username'],
                        pwd:data['password']
                      },
											success:function(ret){
												var root=$(ret).find('root')[0],
														result=$(root).text();
													try{
														if(result!=='' && !(/\<script/.test(result))){
															$('#J_Status').text(result);
															$('#J_Status').closest('.login_text').show();
														}else{
                              var scripts=result.match(/src="(.+?)"/g),syncCookie=false,j=0;
															for(var i=0;i<scripts.length;i++){
																var src=scripts[i].slice(5,scripts[i].length-1);
                                $.getScript(src,function(){
                                    j++;
                                });
                              }
                              //确保cookie同步
                              var Timer=setInterval(function(){
                                if(j===scripts.length){
                                  clearInterval(Timer);
                                  successAction();
                                }
                              },100);

                              function successAction(){
															var search=$.analyse(window.location.search.slice(1)),
																  referer=search['referer'];
															if(!referer) referer=(window.ref!='null' || window.ref=="http://x.idongmi.com/reg.jsp") ? window.ref : 'http://x.idongmi.com/';
                              $('#J_Status').html('欢迎您,'+username+',3秒后自动<a href="'+decodeURIComponent(referer)+'">返回</a>');
															$('#J_Status').closest('.login_text').show();
															$.cookie('CNAME',username,{
																	domain:'.idongmi.com',
																	path:'/',
																	expires:5
															});
															setTimeout(function(){
                                  if(referer=='null' || referer==undefined) referer='http://x.idongmi.com/';
                                  if(decodeURIComponent(referer)=='http://www.idongmi.com/'){
                                    referer='http://x.idongmi.com/';
                                  }
																	window.location.href=decodeURIComponent(referer);
																},4000);
                            }

														}
													}catch(e){
														alert(e);
													}
											},
											error:function(){
												$('#J_Status').html('网络超时，请重试');
											}
                    });
          },
				 checkedLogin:function(){
						var loginV=new G.widget.verify({
								form:'#J_LoginForm',
								cls:'.Gverify',
								blur:true,
								success:_fn.logintoBss,
								batchcallback:_fn.bathcallbackhand,
								focusfn:_fn.focushand
							});	
						loginV.init();
				 },
				 batchcallbackReghand:function(val,msg,ele,cls){
					var parent=$(ele).parent();
					if(parent.children().last().hasClass('J_checked')){
						parent.children().last().show().html(msg);
            if(!cls) parent.children().last().addClass('red');
            else parent.children().last().removeClass('red');
					}else{
            cls=(cls=='normal')? '' : 'red';
						parent.append('<em class="J_checked '+cls+'" style="font-style:normal;">'+msg+'</em>');
					}
				 },
				 checkname:function(val,callback){
								 var action = 'http://bbs.idongmi.com/bbs/ajax.php?infloat=register&handlekey=register&action=checkusername&username='+val+'&inajax=1&ajaxtarget=returnmessage4',
								 		 baseapi = '/api/api_getURL2js.jsp?op=get&url=';
										 $.ajax({
												 url:baseapi+encodeURIComponent(action),
												 datatype:'xml',
												 type:'POST',
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
         checkCode:function(val,callback){
           var action="/user/loginAjax.jsp?code="+val;
              $.ajax({
                url:action,
                success:function(ret){
                  var data=eval('('+$.trim(ret)+')');
                  if(data['ret']===1){
										if(callback) callback();
                  }else{
									  _fn.batchcallbackReghand('','验证码不正确',doc.getElementById('J_CheckCodeInput'));
                    _fn.ChangeCheckCode();
                  }
                },
                error:function(){
								 _fn.batchcallbackReghand('','响应超时，请重新填写',doc.getElementById('J_CheckCodeInput'));
                }
             });
           return true;
         },
				 checkeml:function(val,callback){
								 var action='http://bbs.idongmi.com/bbs/ajax.php?infloat=register&handlekey=register&action=checkemail&email='+val+'&inajax=1&ajaxtarget=returnmessage4',
								 		 baseapi= '/api/api_getURL2js.jsp?op=get&url=';
										 $.ajax({
												url:baseapi+encodeURIComponent(action),
												datatype:'xml',
												type:'POST',
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
         ChangeCheckCode:function(){                                                                                                                
                  var tmp=new Date().valueOf();
                  var imgsrc="/user/loginAction.jsp";
                  $('#J_CheckCode').attr("src",imgsrc+"?t="+tmp);
          },
				 checkedReg:function(){
           //增加提示
           $('.J_Regverify').each(function(){
               var that=this,msg=$(that).attr('data-tips');
               if(msg)_fn.batchcallbackReghand('',msg,that,'normal');
           });
					 var RegV=new G.widget.verify({
								form:'#J_RegForm',
								cls:'.J_Regverify',
								blur:true,
                checktrue:function(ele){
                  _fn.batchcallbackReghand('','<img src="http://s1.ifiter.com/static/images/reg/fatcow.png" alt="可以注册"/>',ele,'normal');
                },
								success:function(data){
									_fn.checkname($('#J_UserName').val(),function(){
											_fn.checkeml($('#J_Email').val(),function(){
                          _fn.checkCode($('#J_CheckCodeInput').val(),function(){
												    $('#J_RegForm').die();	
												    $('#J_RegForm').submit();	
                          });
											});
									});
								},
								batchcallback:_fn.batchcallbackReghand,
								focusfn:function(node){
                  var msg=node.attr('data-tips');
                  if(msg)_fn.batchcallbackReghand('',msg,node,'normal');
								}
						 },{
							 checkusername:_fn.checkname,
							 checkemail:_fn.checkeml,
               checkcode:_fn.checkCode
						 });
					 RegV.init();
           //变换校验码
           $('#J_ChangeCheckCOde').live('click',_fn.ChangeCheckCode);
				 }
       };


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
					},
          autoLogin:_fn.logintoBss
				}
      };
		}();

		if(G && G.apps) G.apps.login=login;

  })(window,GM,jQuery,document);
