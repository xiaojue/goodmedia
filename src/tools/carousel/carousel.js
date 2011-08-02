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
				}).append(WrapDiv);
				
				$(wrap).find(wrapitem).appendTo(WrapDiv);
				
				$(wrapitem).css('float','left');
				
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
						current:0
					};

					$.extend(_o,o);
					
					this.config=_o;
					
					_bulid(this.config);
				}
			}
		}();
		
		_carousel.prototype={
			forward:function(){
				
			},
			backward:function(){
				
			},
			to:function(guide){
				
			},
			stop:function(){
				
			},
			auto:function(){
				
			},
			before:function(){
				
			},
			after:function(){
				
			}
		};
		
		return new _carousel._init(cg);
	};
	
	$.extend({
		carousel:carousel
	});
	
})(window,document,jQuery,GM);
