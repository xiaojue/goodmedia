/**
 * @author <a href="mailto:designsor@gmail.com" target="_blank">Fuqiang[designsor@gmail.com]</a>
 * @version 20110726
 * @fileoverview 滚动木马组件，支持上下左右，自动延迟滚动
 */
(function(W,doc,$,G){
	/**
	 * @memberOf jQuery
	 * @constructor
	 * @description 控制指定容器里的元素，上下左右滚动的组件
	 * @param {objcet} cg
	 * @property {string} wrap <p>#wrap外部包裹容器</p>
	 * @property {string} wrapitem <p>.wrapitem内部包裹元素</p>
	 * @property {string} [direction="left"] left|top方向
	 * @property {number} [current=0] 当前指定滚动到第几页
	 * @property {boolen} [auto=false] 是否自动滚动
	 * @property {number} [autointerval=3000] 自动滚动间隔 毫秒
	 */
	var carousel=function(cg){
		
    var ua=W.navigator.userAgent;
    var isWin = (W.navigator.platform === "Win32") || (W.navigator.platform === "Windows");

		var _carousel=function(){
			/**
			 * @private
			 * @function
			 * @param {object} cg 初始化carousel的参数
			 * @description 根据config构建需要的dom结构
			 */
			var _bulid=function(cg){
				var wrap=cg.wrap,wrapitem=cg.wrapitem;
				if(wrap==="" || wrapitem==="") return;
				
				var firstChild=$(wrapitem).eq(0),w,h,size=$(wrapitem).size();
				
				if(cg.direction=='left'){
					w=firstChild.outerWidth()*size;
					h=firstChild.outerHeight();
				}else if(cg.direction=='top'){
					w=firstChild.outerWidth();
					h=firstChild.outerHeight()*size;
				}else{
					return;
				}
				
				var WrapDiv=$('<div>').css({
					'height':h,
					'width':w,
					'position':'absolute'
				}).addClass('fixclear');
				
				$(wrap).css({
					'overflow':'hidden',
					'position':'relative',
					'width':firstChild.outerWidth(),
					'height':firstChild.outerHeight()
				}).prepend(WrapDiv);
				
				$(wrap).find(wrapitem).appendTo(WrapDiv);
				
				$(wrapitem).css('float','left');
				
				if($(wrap).find('.fixclear').length>1){
					$(wrap).find('.fixclear').last().remove();
				}
				
			};
			
			
			return {
				_init:function(o){
					var _o={
						wrap:'',
						wrapitem:'',
						direction:'left',
						before:function(){},
						after:function(){},
						current:0,
						endflg:true,
						auto:false,
						autointerval:3000
					};

					$.extend(_o,o);
					
					this.config=_o;
					this.T=null;
					
					_bulid(this.config);
					
					if(this.config.auto){
						this.auto();
						this.autoEvent();
					} 
				}
      };
		}();
		
		_carousel._init.prototype={
			/**
			 * @name jQuery.carousel#forward
			 * @function
			 * @description 向前翻一页
			 */
			forward:function(){
				var that=this,config=that.config,
					l=$(config.wrap).find(config.wrapitem).length;
				if(config.endflg){
					config.endflg=false;
					config.current++;
					if(config.current>l-1) config.current=0;
					that.to(config.current);
				}
			},
			/**
			 * @name jQuery.carousel#backward
			 * @function
			 * @description 向后翻一页
			 */
			backward:function(){
				var that=this,config=that.config,
					l=$(config.wrap).find(config.wrapitem).length;
				if(config.endflg){
					config.endflg=false;
					config.current--;
					if(config.current<0) config.current=l-1;
					that.to(config.current);
				}
			},
			/**
			 * @name jQuery.carousel#to
			 * @function
			 * @description 翻到第几页
			 * @param {number} guide 页数指针
			 */
			to:function(guide){
				var that=this,config=that.config,moveObj={},
					Realwrap=$(config.wrap).find('.fixclear'),
					l=$(config.wrap).find(config.wrapitem).length;
				
				if(guide>l-1 || guide<0) return;
				
				config.current=guide;
				
				if(config.direction==='left'){
          moveObj={'left':'-'+$(config.wrap).width()*guide};
				}else if(config.direction==='top'){
          moveObj={'top':'-'+$(config.wrap).height()*guide};
				}
				
				that.before(config.current);			
				Realwrap.animate(moveObj,500,function(){
					that.after(config.current);
					config.endflg=true;
				});
			},
			/**
			 * @private
			 * @name jQuery.carousel-auto
			 * @function
			 * @description 激活自动滚动 |配置项没激活的话，这里可以唤醒
			 */
			auto:function(){
				var that=this,config=that.config;
				//增加判断，xp系统不支持自动播放……
        /*
        if(isWin && (ua.indexOf("Windows NT 5.1") > -1 || ua.indexOf("Windows XP") > -1)){
        }
        */
        that.T=setInterval(function(){
					that.forward();
				},config.autointerval);
			},
			stopauto:function(){
				var that=this;
				//增加判断，xp系统不支持自动播放……
        /*
        if(isWin && (ua.indexOf("Windows NT 5.1") > -1 || ua.indexOf("Windows XP") > -1)){
        }
        */
				clearInterval(that.T);
			},
			/**
			 * @private
			 * @function
			 * @name jQuery.carousel-autoEvent
			 * @description 绑定自动滚动需要的事件
			 */
			autoEvent:function(){
				var that=this,config=that.config;
				$(config.wrap).live('mouseenter',function(){
					that.stopauto();
				}).live('mouseleave',function(){
					that.auto();
				});
			},
			/**
			 * @name jQuery.carousel#before
			 * @event
			 * @param {number} current 当前到第几页了
			 * @description 翻页之前触发
			 */
			before:function(current){
				var that=this,config=that.config;
				config.before(current);
			},
			/**
			 * @name jQuery.carousel#after
			 * @event
			 * @param {number} current 当前到第几页了
			 * @description 翻页之后触发
			 */
			after:function(current){
				var that=this,config=that.config;
				config.after(current);
			},
			getcurrent:function(){
				return this.current;
			}
		};
		
		return new _carousel._init(cg);
	};
	
	$.extend({
		carousel:carousel
	});
	
})(window,document,jQuery,GM);
