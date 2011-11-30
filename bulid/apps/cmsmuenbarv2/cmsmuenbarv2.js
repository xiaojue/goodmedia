/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110926
 * @fileoverview cms 欢迎导航 根据cookie判断 新版
 */
(function(W,$,G){
	/**
	 * @memberOf GM.apps
	 * @description cms欢迎导航根据cookie判断来初始化登录头
	 */
	var cmsmuenbarv2=function(){
		
		return {
			/**
			 * @namespace
			 * @memberOf GM.apps.cmsmuenbar
			 */
			exports:{
				/**
				 * @memberOf GM.apps.cmsmuenbar.exports
				 * @static
				 * @function
				 * @description cms欢迎导航根据cookie判断来初始化登录头第二版
				 */
				
				init:function(){
					var user=$.cookie('ATsport'),idmrole=$.cookie('IDMROLE'),myhtml,bar='',indextext='我的首页';
					if(user){
						if(idmrole===0){
							bar =//'<li><a class="white" href="http://x.idongmi.com/plan/index.jsp" target="_blank">健身方案</a></li>'+
										//'<li><a class="white" href="http://x.idongmi.com/diary/index.jsp" target="_blank">日记</a></li>'+
										//'<li><a class="white" href="http://x.idongmi.com/photo/index.jsp" target="_blank">照片墙</a></li>'+
							'<li><a class="white" href="http://x.idongmi.com/user/edit.jsp" target="_blank">个人资料</a></li>';
						}else if(idmrole==1){
							bar=//'<li><a class="white" href="http://x.idongmi.com/course/index.jsp" target="_blank">课 表</a></li>'+
							//'<li><a class="white" href="http://x.idongmi.com/photo/index.jsp" target="_blank">照片墙</a></li>'+
							'<li><a class="white" href="http://x.idongmi.com/user/edit.jsp" target="_blank">个人资料</a></li>';
						}else if(idmrole==2){
							bar=//'<li><a class="white" href="http://x.idongmi.com/course/index.jsp" target="_blank">课 表</a></li>'+
							//'<li><a class="white" href="http://x.idongmi.com/photo/index.jsp" target="_blank">照片墙</a></li>'+
							'<li><a class="white" href="http://x.idongmi.com/user/edit_site.jsp" target="_blank">场馆资料</a></li>';
						}
						myhtml='<li><a class="white" href="http://x.idongmi.com/" target="_blank">'+indextext+'</a></li>'+
										bar+
										'<li><a class="white none" href="http://bbs.idongmi.com/bbs/logging.php?action=logout&formhash=a9886807&referer=http://www.idongmi.com">退出</a></li>';

						$('#J_MuenbarV2').html(myhtml);
					}else{
						myhtml='<li><a href="http://x.idongmi.com/user/reg.jsp" target="_blank">注册</a></li>'+
									 '<li><a class="none" href="http://x.idongmi.com/user/login.jsp">登录</a></li>'+
										'<li><a href="http://bbs.idongmi.com/bbs/xwb.php?m=xwbAuth.login&referer=http://x.idongmi.com/" class="sina_accounts none index_bg" target="_blank"></a></li>';
						$('#J_MuenbarV2').html(myhtml);
					}
				}
			}
    };
	}();
	
	if(G && G.apps) G.apps.cmsmuenbarv2=cmsmuenbarv2;
		
})(window,jQuery,GM);
