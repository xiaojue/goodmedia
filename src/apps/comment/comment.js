/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110831
 * @fileoverview 动米网评论模块
 */
(function(W,$,G){
	
	var comment=function(config){
		var _config={
			hasFace:1, //是否含有表情模块，默认有
			islogin:0, //默认没登录
			Nowuid:null //当前用户的的uid，默认为null 就是没有-谁的也删不了
		};
		
		$.extend(_config,config);
		
		this.config=_config;
	}
	
	comment.prototype={
		/**
		 * @function
		 * @description 创建评论静态模板部分
		 */
		drawComment:function(){
			
		},
		/**
		 * @function
		 * @description 创建评论部分
		 */
		createComment:function(){
			
		},
		/**
		 * @function
		 * @description 创建分页
		 */
		createPag:function(){
			
		},
		/**
		 * @function
		 * @description 全清，包括事件，HTML结构等，等待初始化
		 */
		clearall:function(){
			
		},
		/**
		 * @function
		 * @description 初始化整个评论的动态部分 或者重新初始化
		 */
		trends_init:function(){
			
		},
		/**
		 * @function
		 * @description 给所有的操作一次性绑定委派动作，此方法可重复调用，初始化时会删除所有之前的事件
		 */
		controlAction:function(){
			
		},
		/**
		 * @function
		 * @description 检验和处理提交的评论信息
		 */
		verify:function(){
			
		},
		/**
		 * @function
		 * @description 回复功能
		 */
		reply:function(){
			
		},
		/**
		 * @function
		 * @description 删除功能
		 */
		deleteReply:function(){
			
		},
		/**
		 * @function
		 * @description 提交功能
		 */
		commit:function(){
			
		},
		/**
		 * @function
		 * @description 分享功能
		 */
		share:function(){
			
		}
	}
	
	if(G && G.apps){
		G.apps.comment={
			exports:{
				init:comment
			}
		}
	}
	
})(window,jQuery,GM);
