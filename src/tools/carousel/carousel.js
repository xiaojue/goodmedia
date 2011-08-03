/**
 * @author fuqiang
 * @date 20110726
 * 气泡功能，自定义划过气泡，提供一些对外的接口和方法
 */
(function(W,doc,$,G){
	
	var carousel=function(cg){
		
		var _carousel=function(){
			
			
			var _bulid=function(cg){
				var wrap=cg.wrap,wrapitem=cg.wrapitem;
				if(wrap=="" || wrapitem=="") return;
				
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
					/* HTML Structure
					 * <div id="wrapCls">
					 * 	<div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 		<div class="Wrapitem"></div>
					 * 	</div>
					 * </div>
					 */			
					var _o={
						wrap:'',
						wrapitem:'',
						direction:'left',
						before:function(){},
						after:function(){},
						current:0,
						endflg:true
					};

					$.extend(_o,o);
					
					this.config=_o;
					
					_bulid(this.config);
				}
			}
		}();
		
		_carousel._init.prototype={
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
			to:function(guide){
				var that=this,config=that.config,moveObj={},
					Realwrap=$(config.wrap).find('.fixclear'),
					l=$(config.wrap).find(config.wrapitem).length;
				
				if(guide>l || guide<0) return;
				
				if(config.direction=='left'){
					moveObj={'left':'-'+$(config.wrap).width()*guide}
				}else if(config.direction=='top'){
					moveObj={'top':'-'+$(config.wrap).height()*guide}
				}
				that.before(guide);			
				Realwrap.animate(moveObj,500,function(){
					that.after(guide);
					config.endflg=true;
				});
			},
			stop:function(){
				var that=this,config=that.config;
				
			},
			auto:function(){
				var that=this,config=that.config;
				
			},
			before:function(current){
				var that=this,config=that.config;
				config.before(current);
			},
			after:function(current){
				var that=this,config=that.config;
				config.after(current);
			}
		};
		
		return new _carousel._init(cg);
	};
	
	$.extend({
		carousel:carousel
	});
	
})(window,document,jQuery,GM);
