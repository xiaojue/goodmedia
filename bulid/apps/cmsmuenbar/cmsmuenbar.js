/**
 * @author fuqiang
 * @date 20110817
 * cms 欢迎导航 根据cookie判断
 */
(function(W,$,G){
	
	var cmsmuenbar=function(){
		
		return {
			exports:{
				init:function(){
					var user=$.cookie('ATsport'),myhtml;
					if(user){
						myhtml='<div class="members_login2">'+
						              '<span><a href="http://www.idongmi.com/"><img src="http://s2.ifiter.com/static/images/head_index.gif"></a></span>'+
						               '<a target="_blank" href="http://x.idongmi.com/user/index.jsp">我的首页</a>'+
						               '<a target="_blank" href="http://bbs.idongmi.com/bbs/pm.php?filter=privatepm">消息(<font id="pmnew">0</font>)</a>'+
						               '<a href="http://x.idongmi.com/user/edit.jsp">账号设置</a><a href="http://bbs.idongmi.com/bbs/logging.php?action=logout&formhash=a9886807&referer=http://www.idongmi.com">退出</a>'+
						           '</div>';
						$('#J_Muenbar').html(myhtml);
						 //取消息
						var pmurl = "http://bbs.idongmi.com/java/bg_pm.php";
						$.getScript(pmurl);
					}else{
						myhtml='<a href="http://bbs.idongmi.com/bbs/register.php" target="_blank">立即注册</a>'+
						   '<a href="http://bbs.idongmi.com/bbs/logging.php?action=login&referer=http://x.idongmi.com/user/index.jsp">马上登录</a>';
						$('#J_Muenbar').html(myhtml);
					}
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.cmsmuenbar=cmsmuenbar;
		
})(window,jQuery,GM);
