/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110907
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
			 * 12
			 */
			exports:{
				/**
				 * @memberOf GM.apps.cmsmuenbar.exports
				 * @static
				 * @function
				 * @description cms欢迎导航根据cookie判断来初始化登录头
				 */
				
				init:function(){
					var user=$.cookie('ATsport'),myhtml;
					if(user){
						myhtml='<li><a href="http://x.idongmi.com/" target="_blank">我的首页</a></li>'+
										'<li><a href="http://x.idongmi.com/user/edit.jsp" target="_blank">个人资料</a></li>'+
										'<li><a href="http://bbs.idongmi.com/bbs/logging.php?action=logout&formhash=a9886807&referer=http://www.idongmi.com">退出</a></li>';

						$('#J_MuenbarV2').html(myhtml);
					}else{
						myhtml='<li><a href="http://bbs.idongmi.com/bbs/register.php" target="_blank">注册</a></li>'+
										'<li><a href="http://bbs.idongmi.com/bbs/logging.php?action=login&referer=http://x.idongmi.com/user/index.jsp" target="_blank">登录</a></li>'+
										'<li><a href="http://bbs.idongmi.com/bbs/xwb.php?m=xwbAuth.login&referer=http://x.idongmi.com/" class="sina_accounts none index_bg" target="_blank"></a></li>';
						$('#J_MuenbarV2').html(myhtml);
					}
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.cmsmuenbarv2=cmsmuenbarv2;
		
})(window,jQuery,GM);
