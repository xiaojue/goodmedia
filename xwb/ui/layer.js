(function(X, $){

var Util = X.util;
var undefined;
var T = X.ax.Tpl;
var doc = document;
var Base = X.ui.Base;
var ui = X.ui;
// 记录弹出浮层zIndex
var currentZ = 10001;
var jqWin = $(window);

var PopupKBMonitor = {
	
	layers : [],
	
	hash : {},
	
	keyListeners : 0,
	
	add : function(layer){
		var cid = layer.cacheId;
		if(!this.hash[cid]){
			this.layers.push(layer);
			if(layer.keyEvent){
				if(this.keyListeners === 0){
					if(__debug) console.log('bind key listener');
					$(doc).bind('keydown', this.getEvtHandler());
				}
				this.keyListeners++;
			}
			this.hash[cid] = true;
	  }
	},
	
	remove : function(layer){
		var cid = layer.cacheId;
		if(this.hash[cid]){
			var ly = this.layers;
			if(ly[ly.length - 1] === layer)
				ly.pop();
		  else Util.arrayRemove(ly, layer);
			
			this.keyListeners--;
			if(this.keyListeners===0){
				if(__debug) console.log('remove key listener');
				$(doc).unbind('keydown', this.getEvtHandler());
			}
			delete this.hash[cid];
	  }
	},
	
	getEvtHandler : function(){
		  var kh = this._onDocKeydown;
		  if( !kh )
		  	kh = this._onDocKeydown = Util.bind( this.onDocKeydown, this );
		  return kh;
	},
	
	onDocKeydown : function(e){
			var top = this.layers[this.layers.length-1];
			if(top && top.keyEvent)
				return top.onKeydown(e);
	}
};

/**
 * @class Xwb.ui.Layer
 * 浮层基类。<br/>
 * 所有浮层不用设置zIndex值，均由库自行管理。
 * 如有需要，可通过{@link #setCurrentZ}均始化zIndex值。
 * @extends Xwb.ui.Base
 */

var Layer = ui.Layer = Util.create(Base, {
    
    /**@cfg {Boolean} autoCenter 当显示或显示后窗口resize时，是否自动居中*/
    
    /**@cfg {Boolean} hidden 默认隐藏*/
    hidden : true,
    
    onViewReady : $.noop,
    
    /**
     * @cfg {Boolean} frameMask 显示时是否应用IFRAME层作遮罩层，IE6时默认为true，其它浏览器默认false
     */
    frameMask : Util.ie6,
    
/**
 * 手动更新窗口zindex，默认是自动更新。
 * 当同时显示多个窗口时,调用该方法可使窗口置顶。
 * 适用于position:absolute, fixed面板。
 * @see Xwb.ui.Layer#setCurrentZ
 */
    trackZIndex : function(){
      if(this.z !== currentZ){
         currentZ += 3;

        if(this.mask)
            $(this.mask).css('z-index', currentZ - 1);
        
        if(this.frameMask)
            $(this.getFrameMask()).css('z-index', currentZ - 2);
        
        this.jq().css('z-index', currentZ);
        this.z = currentZ;
      }
    },
    
    /**
     * @cfg {Boolean} keyEvent 是否开启键盘监听，默认true，将处理ESC键。
     */
    keyEvent : true,
    
    /**
     * 如果监听浮层按键事件，可重写本方法。默认处理是监听ESC键，当ESC按下时关闭浮层。
     * @param {DOMEvent} event
     */
    onKeydown : function(e){
    	// esc
    	if(e.keyCode === 27 && !this.cancelEscKeyEvent){
    		this.close();
    		return false;
    	}
    },
    
    // override
    beforeShow : function(){
        if(this.mask)
            this._applyMask(true);
        var pos = this.jq().css('position');
        if( pos === 'absolute' || pos === 'fixed' )
            this.trackZIndex();
        PopupKBMonitor.add(this);
        
        if(this.autoCenter)
            this.center();
    },
    
    
    // override
    afterHide : function(){
        if(this.mask)
            this._applyMask(false);
        PopupKBMonitor.remove(this);
    },
	
	getFrameMask : function(){
	    if(this.frameMaskEl)
	        return this.frameMaskEl;
	    // 因为iframe层比较特殊，较少变动，所以直接写在这里而不必JS HTML模板里。
	    this.frameMaskEl = T.forNode('<iframe class="shade-div shade-iframe" frameborder="0"></iframe>');
	    return this.frameMaskEl;
	},
	
    /**
     * @cfg {Boolean} mask 显示时是否应用遮罩层，默认false
     */
    _applyMask : function(b){
      var mask = this.mask;
      if(!mask || mask === true)
        mask = this.mask = T.forNode(T.get('Mask'));
      
      var wh = jqWin.height();
      if(b){
        $(mask)
            .height( wh )
            .appendTo(doc.body);
        if(this.frameMask)
            $(this.getFrameMask()).height(wh).appendTo(doc.body);
        // window resize event handler
        jqWin.bind('resize', Util.getBind(this, 'onMaskWinResize'));
      }else {
        $(mask).remove();
        if(this.frameMask)
            $(this.getFrameMask()).remove();
        jqWin.unbind('resize', Util.getBind(this, 'onMaskWinResize'));
      }
    },
    
    onMaskWinResize : function(){
      var mask = this.mask, wh = jqWin.height();
      if(mask)
        $(mask).height( wh );
        
        if(this.frameMask)
            $(this.getFrameMask()).height(wh);
      
      if(this.autoCenter)
            this.center();
    }
});
/**
 * @param {Number} zIndex
 * @method setCurrentZ
 * @static
 */
Layer.setCurrentZ = function(z){
    currentZ = z;
};

X.reg('Layer', Layer);

/**
 * @class Xwb.ui.Switcher
 * @constructor
 * @param {Object} config
 */

/**
 * @cfg {DOMCollection|jQuery} items tab items
 */

/**
 * @cfg {DOMCollection|jQuery} contents tab contents
 */

/**
 * @cfg {Boolean} autoRecover 当鼠标离开时是否自动复原
 */

/**
 * @cfg {Boolean} delaySelect 在{@link #trigMode}为hover情况下鼠标划过时延迟选择，单位ms，默认不延迟
 */

/**
 * @cfg {Boolean} delayHide
 */

/**
 * @cfg {String} trigMode click，hover，默认click，点击时才触发选择，如果设为hover时，鼠标移上就会触发。
 */

/**
 * @cfg {String} clickEvent 如果触发选择的方式为'click'，设置选择触发事件，默认为mousedown，可以改为'click'事件。
 */

/**
 * @cfg {Function} onselect 选择项时触发。onselect(selectedItem)，仍可以通过 switcher.selectedItem访问上一个选择项。
 */
ui.Switcher = function(opt){
	opt && $.extend(this, opt);
	this.initUI();
};

X.reg('Switcher', ui.Switcher);

ui.Switcher.prototype = {
	trigMode : 'click',
	initUI : function(){
		if (this.items)
			this.add(this.items, this.contents);
	},
/**
 * @param {HTMLElement} item
 */
	select : function(item){

        var pre = this.selectedItem;
		
		if (this.autoRecover)
            this.clearTimer(1);
        
        //先显示当前项再隐藏先前的,使得过渡平滑,而不造成闪烁
        if(this.selectedCS){
            pre && $(pre).removeClass(this.selectedCS);
			$(item).addClass(this.selectedCS);
		}

		// select callback
		this.onselect && this.onselect(item);
		
        this.selectedItem = item;
		
		if (item.contentEl) {
            var cp = item.contentEl;
            // 把显示延迟至上一次界面更新之后,
			// 可保持用户操作流畅响应
			// 如果不需要这效果，可直接调用unselect(pre)
            setTimeout( function(){
                if (pre && pre.contentEl)
                    $(pre.contentEl).cssDisplay(false);
                $(cp).cssDisplay(true);
            }, 0 );
        }
	},

/**
 * @param {HTMLElement} item
 */	
	unselect : function(item){
        if(this.selectedCS)
            $(item).removeClass(this.selectedCS);
        
        if(item.contentEl)
            $(item.contentEl).cssDisplay(false);
		
		if(this.mouseoutTimer)
		    this.clearTimer(1);
	
        this.selectedItem = NULL;
	},
	
	// private , type=0, mouseover; 1, mouseout
	clearTimer : function(type){
		if (type !== 0) {
			if (this.mouseoutTimer) {
				clearTimeout(this.mouseoutTimer);
				this.mouseoutTimer = false;
				this.mouseoutTimerFn = false;
			}
		}else {
			if (this.mouseoverTimer) {
				clearTimeout(this.mouseoverTimer);
				this.mouseoverTimer = false;
				this.mouseoverTimerFn = false;
			}
		}
	},
/**
 * @param {HTMLElement|Array} item
 * @param {HTMLElement|Array} panel
 */
    add: function(item, panel){
		if(item.length){
		    if(panel){
			    for(var i=0,len=item.length;i<len;i++)
				    this.add(item[i], panel[i]);
		    }else for(var i=0,len=item.length;i<len;i++)
				    this.add(item[i]);
			return;
		}
		
		var jq = $(item);
        var switcher = this;
		
		// 在录入时已标记选择
        if(jq.hasClass(this.selectedCS)){
            if(this.selectedItem)
                this.unselect();
            this.selectedItem = item;
        }
        
		if(panel) 
		    item.contentEl = panel;
		
		// install hover event handler
        if (this.trigMode === 'hover' || this.autoRecover) {
			jq.hover(	// mouse over
			function(e){
				if (switcher.autoRecover && switcher.mouseoutTimer) {
					switcher.clearTimeout(1);
				}
				
				// trig mode
				if (switcher.trigMode === 'hover') {
					var pre = switcher.selectedItem;
					if (this !== pre) {
						if (switcher.delaySelect) {
							// 重置定时
							if (switcher.mouseoverTimer) 
								switcher.clearTimeout(0);
							switcher.mouseoverTimer = setTimeout(function(){
								switcher.select(item);
							}, switcher.delaySelect);
						}
						else 
							switcher.select(this);
					}
				}
				
				return !switcher.enableBubble;
			}, 
			// mouse out
			function(e){
			
				if (switcher.mouseoverTimer) 
					switcher.clearTimeout(0);
				
				if (switcher.trigMode === 'hover') {
					var pre = switcher.selectedItem;
					if (this !== pre && switcher.mouseoutTimerFn) {
						switcher.mouseoutTimerFn();
						switcher.mouseoutTimerFn = NULL;
					}
					
					var el = e.target;
					if (switcher.autoRecover && (el === this || Util.ancestorOf(this, el))) {
						if (!switcher.mouseoutTimer) {
							var nd = this;
							switcher.mouseoutTimerFn = function(){
								switcher.unselect(nd);
							};
							switcher.mouseoutTimer = setTimeout(switcher.mouseoutTimerFn, switcher.delayHide || 500);
						}
					}
				}
				return !switcher.enableBubble;
			});
		}
		
	   // install click event handler
	   if(this.trigMode === 'click'){
	   		jq.bind(this.clickEvent||'mousedown', function(){
				switcher.select(this);
				return false;
			});
	   }
    }
};

/**
 * @class Xwb.ui.Box
 * Box与Layer只是模板上的不同。<br/>
 * Box默认使用的模板是"Box"
 * @extends Xwb.ui.Layer
 */
ui.Box = X.reg('Box', Util.create(ui.Layer, {
    view : 'Box'
}));

/**
 * @class Xwb.ui.Tip
 * 提示类，提供超时处理。
 * @extends Xwb.ui.Box
 */

 
ui.Tip = X.reg('Tip', Util.create(ui.Box, {
    
    cs : 'win-fixed',
/**
 * @cfg {Boolean} autoHide defaults true
 */      
    autoHide : true,
/**
 * @cfg {Number} timeoutHide defaults to 1000 ms
 */    
    timeoutHide : 1000,
/**
 *  该属性是{@link setShowTimer}延迟显示时设置的超时时间，
 *  {@link setShowTimer}常用在mouseover时延迟提示的显示，mouseout时清除延迟以提高用户体验。
 */
    timeoutShow : 200,

/**
 * @cfg {Boolean} stayHover stay on mouseover and hide on mouseout, defaults to false
 */
 
    stayHover : false,
/**
 * @cfg {Number} offX 面板定位时往瞄点X方向的偏移增量，默认25
 */
    offX : 25,
    
/**
 * @cfg {Number} offX 面板定位时往瞄点Y方向的偏移增量，默认-10
 */
    offY : -10,
    
    // override
    innerViewReady : function(v){
        var jq = this.jq();
        if(this.stayHover){
            jq.hover(
                Util.bind(this.onMouseover, this),
                Util.bind(this.onMouseout, this)
            );
        }
    },
    
    onMouseover : function(){
        this.clearHideTimer();
    },
    
    onMouseout : function(){
        this.setHideTimer();
    },
    
/**
 * 清除超时隐藏
 */
    clearHideTimer : function(){
        if(this.hideTimerId){
            clearTimeout(this.hideTimerId);
            this.hideTimerId = false;
        }
    },
    
    beforeShow : function(){
        if( Layer.prototype.beforeShow.apply(this, arguments) === false )
            return false;
        
        if(this.autoHide)
            this.setHideTimer();
    },

/**
 *  设置或清除显示超时。
 *  该方法是#setHideTimer与clearHideTimer对应延迟显示方法，已集中在一个函数调用。
 *  常用在mouseover时延迟提示的显示，mouseout时清除延迟，
 *  可有效防止用户只是掠过鼠标但并非查看时取消显示提示以提高用户体验。
 * @param {Boolean} set
 */
    setShowTimer : function(b){
        if(b){
            this.showTimerId = setTimeout(Util.getBind(this, 'onTimerShow'), this.timeoutShow);
        }else if(this.showTimerId){
            clearTimeout(this.showTimerId);
            this.showTimerId = false;
        }
    },
    
/**
 * 开始超时隐藏,在指定时间内隐藏
 */
    setHideTimer : function(){
        this.clearHideTimer();
        this.hideTimerId = setTimeout(Util.getBind(this, 'onTimerHide'), this.timeoutHide);
    },
    
    onTimerHide : function(){
        this.display(false);
        this.clearHideTimer();
    },
    
    onTimerShow : function(){
        this.display(true);
        this.setShowTimer(false);
    }
}));

})(Xwb, $);