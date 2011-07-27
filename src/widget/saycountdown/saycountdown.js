/**
 * @author fuqiang
 * @dete 20110725
 * 为GM对象添加widget空间下的countdown组件
 */
(function(W,G){
	
	var countdown=function(cg){
		
		var fn={
			init:function(){
				return new fn._bind(cg);	
			},
			//绑定事件，创建构造器
			_bind:function(cg){
				var _cg={
					main:'',
					wrap:'',
					errorCls:'',
					holdTarget:'',
					holdAction:function(){},
					max:140 //默认最多140字
				}
				
				$.extend(_cg,cg);
				
				for(var i in _cg){
					this[i]=_cg[i];
				}
				
				if(this.main=="" || this.wrap=="") return;
				
				var that=this,
					main=$(that.main),
					wrap=$(that.wrap),
					holdTarget=$(that.holdTarget),
					error=that.errorCls,
					max=that.max;
					
				var	holdfn=function(){
					var l=parseInt(main.val().length),putout;
					
					if(l <= max || l == 0){
						wrap.removeClass(error);
						putout='你还可以输入<font>'+(max-l)+'</font>字';
					}else{
						wrap.addClass(error);
						putout='已超出<font>'+(l-max)+'</font>字';
					}
					
					holdTarget.unbind('click');
					
					holdTarget.bind('click',function(){
						if(l<=max && l>0) that.holdAction();
					});
					
					wrap.html(putout);
				};
					
				holdfn();
				main.keyup(holdfn);
			}
		};
		
		return fn;
	};
	
	if(G && G.widget) G.widget.countdown=countdown;
	
})(window,GM);