(function($) {


function extend(obj, ext) {
	if (ext) {

		for (i in ext)
		{
			obj[i] = ext[i];
		}
	}

	return obj;
}

function Box(cfg) {
	//标题
	this.title = cfg.title

	//内容
	this.contentHtml = cfg.contentHtml;

	//要追加到的父元素节点
	this.parentNode = cfg.appendTo;

	this._inited = false;
	
	this.html = '';

	this.mask = true;

	this._mask = null;

	extend(this, cfg);
}

Box.prototype = {
	//初始化界面
	initUI: function() {
		if (!this._inited)
		{		
			this.html =  [
        '<div class="win-pop win-tips win-fixed">',
            '<div class="win-t"><div></div></div>',
            '<div class="win-con">',
                '<div class="win-con-in">',
                	 '<h4 class="win-tit x-bg"><span id="xwb_title">' + this.title+ '</span></h4>',
                    '<div class="win-box" id="xwb_dlg_ct">',
                        this.contentHtml,
                    '</div>',
                '</div>',
                '<div class="win-con-bg"></div>',
            '</div>',
            '<div class="win-b"><div></div></div>',
			'<a href="#" class="icon-close-btn" id="xwb_cls" title="关闭" rel="close"></a>',
        '</div>'].join('');

			if (!this.parentNode)
			{
				this.parentNode = document.body;
			}

			this.view = $(this.html).appendTo(this.parentNode);

			if (this.mask)
			{
				this._mask = $('<div class="mask"></div>').appendTo('body');
			}

			var self = this;

			this.view.click(function(e){
				self.eventHandler(e);
			});

			$.isFunction(this.innerViewReady) && this.innerViewReady.call(this);
			$.isFunction(this.onViewReady) && this.onViewReady.call(this);

			this._inited = true;
		}

		return this;
	},

	eventHandler: function(e) {
		var rel = $(e.target).attr('rel');

		switch (rel)
		{
			case 'close':
				this.hide();
				e.preventDefault();
			break;
		
		}

		if ($.isFunction(this.onclick))
		{
			if (this.onclick(e, rel) === true)
			{
				e.preventDefault();
			}
		}
	},

	$: function(selector) {
		return selector ? this.view.find(selector): this.view;
	},

	show: function() {

		if (this._inited)
		{
			this.view.show();
		} else {
			this.initUI();
			this.view.show();
		}

		this.mask && this._mask.show();

		this.$('#content').focus();
		
		return this;
	},

	hide: function() {
		if (this._inited)
		{
			this.view.hide();
			this.mask && this._mask.hide();
		}

		return this;
	}
}

var cateBox = function(cfg) {
	this.mode = 'add';

	this.complete = null;

	this.isOk = true;

	extend(this, cfg);
}

cateBox.prototype = new Box({
		title: '编辑用户推荐类别',
		
		contentHtml: [
			'<form action="" name="cateform" method="post" name="add-newlink">',
			'	<div class="float-info">',
			'		<label>',
			'			</label><p>类别名称：</p>',
			'			<input type="text" name="link-text" id="content" class="input-box pop-w9" vrel="ne=m:不能为空" warntip="#textErr" value=""><span id="textErr" class="hidden a-error">验证错误提示</span>',
			'	</div>',
			'	<div class="float-info">',
			'		<p>类别所用的用户列表：</p>',
			'		<select name="matic-yes" id="select" class="matic-slect-w">',
			'		</select>',
			'	</div>',
			'	<div class="float-button">',
			'		<span class="float-button-y"><input type="submit" name="确定" id="enter" value="确定" rel="ok"></span>',
			'		<span class="float-button-n"><input type="button" name="取消" value="取消" rel="cancle"></span>',
			'	</div>',
			'</form>' ].join(''),

		updateTitle: function(title) {
			this.$('#titleBar').html('<a class="clos" href="#" id="close" rel="close"></a>' + title + '');

			return this;
		},

		innerViewReady: function() {
			var self = this;

			var valid = new Validator({
				form: this.view.find('form'),
				trigger: this.view.find('#enter'),
				onsuccess: function(data, next) {
					var ret;

					if ($.isFunction(self.complete))
					{
						 ret = self.complete(self.mode, {
							text: self.content(),
							select: self.select()
						});

						
					}

//					this.report(ret, data);

					self.hide();
					next();

					return false;
				}
			});

		},

		onclick: function(e, type) {
			switch (type)
			{
			case 'cancle':
				this.hide();
				return true;
			break;

			case 'ok':
				/*
				$.isFunction(this.complete) && this.complete(this.mode, {
					text: this.content(),
					select: this.select()
				});
				this.hide();
				*/
				return true;
			break;
			}
		},

		content: function(val) {
			var $content = this.$('#content');

			return val === undefined ? $content.val(): $content.val(val);
		},

		select: function(val) {
			var $select = this.$('#select');
			return val === undefined ? $select.val(): $select.val(val);
		},

		setOptions: function(opts) {
			var htmls = [];
			
			$.each(opts, function(i, o) {
				htmls.push(['<option value=', o.val, '>', o.text, '</option>'].join(''));
			});

			this.$('#select').html(htmls.join(''));

			return this;
		},
		
		reset: function() {
			this.updateTitle('添加用户推荐类别');
			this.mode = 'add';
			this.content('');

			return this;
		},
		
		edit: function(content, selectid) {
			this.show();

			this.mode = 'edit';
			this.updateTitle('编辑用户推荐类别');
			this.content(content);
			this.select(selectid);
		}
	});

var ui = {};

ui.cateBox = cateBox;

window.Box = Box;
window.ui = ui;

function domUp(el, selector, end){
        end = end || doc.body;
        var isStr = typeof selector === 'string';
        while(el){
            if(isStr){
                if($(el).is(selector))
                    return el; 
            }else if(selector(el)){
                return el;
            }
            el = el.parentNode;
            if(el === end)
                return null;
        }
        return el;
}

/**
 * 测试长度，1个中文算两个
 */
function byteLen(text){
	var len = text.length;
	var matcher = text.match(/[^\x00-\xff]/g);
	if(matcher)
		len += matcher.length;
	return len;
};
    
if(window.__debug){

/**
 * @class console
 * 系统控制台,如果存在firebug,利用firebug输出调试信息,否则忽略.
 * 在firbug中可直接进行对某个对象进行监视,
 * 无console时就为空调用,可重写自定输出.
 * @singleton
 */
if(!window.console)
      window.console = {};

function extendIf(des, src) {
      if(!des)
        des = {};

      if(src)
        for(var i in src){
          if(des[i] === undefined)
            des[i] = src[i];
        }

      return des;
}
        
extendIf(console,{
      /**
       * %o表示参数为一个对象
       * console.log('This an string "%s",this is an object , link %o','a string', CC);
       *@param {arguments} 类似C语言中printf语法
       *@method
       */
    debug : $.noop,

/**
 * @method trace
 */
    trace : $.noop,
/**
 * @method log
 */
    log : $.noop,
/**
 * @method warn
 */
    warn : $.noop,
/**
 * @method error
 */
    error : $.noop,

/**
 * @method group
 */
    group:$.noop,
/**
 * @method groupEnd
 */
    groupEnd:$.noop
});

}else window.__debug = false;

(function(){
    
    var doc = $(document),
    
    //位于上方的元素
    onEl = null,

    //拖动中的元素
    dragEl = null,

    //拖动开始时鼠标位置
    IXY,

    //当前鼠标位置
    PXY,

    //鼠标离初始位置偏移量
    DXY = [0,0],

    //开始时拖动元素位置
    IEXY,

    //是否拖动中
    ing = false,
    
    //拖放事件是否已绑定,避免重复绑定
    binded = false,

    // temp DOMEvent on move
    V,
    
    Scope,
    DragHd,
    DropHd = false,
    Finder;
    
    function noselect(e){ return false; }


    function mousedown(e){
        
        if(ing)
            return;
        
        var trig = e.target;
        var elem = Finder.isDragTrigger(trig, Scope);
        if(!elem)
            return;
            
        dragEl = Finder.findSource(trig, Scope, elem);
        
        if(!dragEl)
            return;

        dragEl = dragEl;
         
        if(__debug) console.group("拖放"+dragEl);
        if(__debug) console.log('beforedrag');

          if(DragHd.beforedrag){
            if(DragHd.beforedrag(dragEl, e) === false){
              dragEl = false;
              DragHd = false;
              return;
            }
          }
          
          e.stopPropagation();
          e.preventDefault();
          
          var off = $(dragEl).offset();
          IEXY = [off.left,off.top];
          IXY = PXY = [e.pageX, e.pageY];
          
          if(!binded){
            // bind dom events
            binded = true;
            // chec drop monitor
        
            // 加速处理
            if(!DragHd.drag)
              DragHd.drag = false;
        
               doc.bind("mouseup", mouseup)
                  .bind("mousemove", mousemove)
                  .bind("selectstart", noselect)
                  .bind('mouseover', mouseover)
                  .bind('mouseout', mouseout);
          }
    }
    
    function mouseout(e){
        V = e;
        if(onEl!== null){
            if(__debug) console.log('离开:',onEl);
            DropHd.sbout && DropHd.sbout(onEl, dragEl, V);
            onEl = null;
        }
    }
    
    function mouseover(e){
        var el = Finder.findTarget(e.target, Scope);
        if(!el)
            return;
            
        V = e;
        
        if(el !== dragEl){
             //首次进入,检测
            if(onEl !== null){
                if(__debug) console.log('离开:',onEl);
                DropHd.sbout && DropHd.sbout(onEl, dragEl, V);
            }
            onEl = el;
            if(!onEl.disabled){
                if(__debug) console.log('进入:',onEl);
                DropHd.sbover && DropHd.sbover(onEl, dragEl, V);
                // 可能已重新检测onEl
            }else {
                onEl = null;
            }
        }else{
          if(onEl!== null){
            if(__debug) console.log('离开:',onEl);
            DropHd.sbout && DropHd.sbout(onEl, dragEl, V);
            onEl = null;
          }
        }
    }
    
    function mousemove(e){
        PXY[0] = e.pageX;
        PXY[1] = e.pageY;
        DXY[0] = PXY[0] - IXY[0];
        DXY[1] = PXY[1] - IXY[1];
        
      if(!ing){
        if(__debug) console.log('dragstart       mouse x,y is ', PXY,'dxy:',DXY);
        if(DragHd.dragstart){
        	if(DragHd.dragstart(dragEl, e) === false){
        		ing = -1;
        		return;
        	}
        }
        ing = true;
      }
      
      DragHd.drag && DragHd.drag(e);
      
      //源内移动
      if(onEl && DropHd.sbmove)
        DropHd.sbmove(onEl, e);

      return false;
    }
    
    function mouseup(e){
      if(dragEl){
        if(binded){
          //doc.ondragstart = null;
          //清空全局监听器
          doc.unbind('mouseup', arguments.callee)
             .unbind('mousemove', mousemove)
             .unbind('selectstart', noselect)
             .unbind('mouseover', mouseover)
             .unbind('mouseout', mouseout);
          
          if(ing && ing !== -1){
             if(__debug) console.log('dragend         mouse delta x,y is ',DXY, ',mouse event:',e);
            //如果在拖动过程中松开鼠标
            if(onEl !== null){
              DropHd.sbdrop && DropHd.sbdrop(onEl, dragEl, e);
              if(__debug) console.log(dragEl, '丢在', onEl,'上面');
            }

            DragHd.dragend && DragHd.dragend(dragEl, e);
          }
          
          onEl = null;
          binded = false;
          ing = false;
        }
        
        if(__debug) console.log('afterdrag');
        DragHd.afterdrag && DragHd.afterdrag(dragEl, e);
        
        dragEl = null;
        DropHd = DragHd = Finder = false;
        V = null;
        if(__debug) console.groupEnd();
      }
    }
    

window.DDMgr = {
    bind : function(scopeEl, finder, dragHandle, dropHandle){
        $(scopeEl).bind('mousedown',  function(e){
            Scope = scopeEl;
            Finder = finder;
            DragHd = dragHandle;
            DropHd = dropHandle;
            mousedown(e);
        });
    },
    getSource : function(){
        return dragEl;
    },
    getTarget : function(){
        return onEl;
    },
    isDragging : function(){
        return ing;
    },
    getIXY : function(){
        return IXY;
    },
    getDXY : function(){
        return DXY;
    },
    getIEXY : function(){
        return IEXY;
    }
};

})();

var DDMgr = window.DDMgr;

(window.OrderRowZoom = function(tbl, cfg){
    if( cfg )
        $.extend(this, cfg);

    this.drag = this.drag;
    this.tbl = tbl;
    var self = this;
    $(this.saveBtn).click(function(){
        self.save();
        return false;
    });
    $(this.modifyBtn).click(function(){
        self.modify();
        return false;
    });
    
}).prototype = {
    // 拖动TR时TR样式
    dragsourceCS : 'drag-source',
    dragzoomCS   : 'drag-zoom',
    hoverCS : 'drag-target',
    isDragTrigger : function(trig, scope){
        var trEl = domUp(trig, 'tr', scope);
        if($(trEl).attr('rel'))
            return trEl;
    },
    
    findSource : function(trig, Scope, elem){
        return elem;
    },
    
    findTarget : function(trig, scope){
        var trEl = domUp(trig, 'tr', scope);
        trEl = trEl && trEl.getAttribute('rel') != null && trEl;
        
        if(!trEl && this.targetIndicator){
            if($.contains(this.targetIndicator[0], trig))
                return this.jqTarget[0];
        }
        
        if(trEl)
            if($.contains(scope, trEl))
                return trEl;
    },
    
    beforedrag : function(source){
        $(source).addClass(this.dragsourceCS);
    },
    
    dragstart : function(source){
        var jqSource = this.jqSource = $(source);
        var jqIdt = this.applySourceIndicator(true);
        var dm = this.jqSource.offset();
        dm.width  = jqSource.width();
        dm.height = jqSource.height();
        jqIdt.css(dm);
        jqIdt.cssDisplay(true);
    },
    
    sbover : function(target, src, e){
        var jq = this.jqTarget  = $(target);
        this.targetH   = jq.height();
        this.targetOff = jq.offset();
        this.targetIndicatorPos = false;
        
        this.applyTargetIndicator(true)
            .css('width', jq.width())
            .cssDisplay(true);
        this.setTargetIndicatorTimer(false);
        
        jq.addClass(this.hoverCS);       
    },
    
    sbout : function(target){
       this.setTargetIndicatorTimer(true);
       this.jqTarget.removeClass(this.hoverCS);
    },
    
    sbmove : function(target, e){
        var jq = this.jqTarget;
        var pos = this.getCursorSide(e.pageY);
        if(this.targetIndicatorPos !== pos){
            var idt = this.targetIndicator;
            var dm = this.targetOff;
            var top = dm.top - Math.floor(idt.height()/2)-1;
            
            if($.browser.msie)
                top += 3;
            
            var left = dm.left;
            // 上
            if(pos === 1){
                
            }else { // 下
                top += this.targetH;
            }
            idt.css('left', left).css('top', top);
        }
    },
    
    getCursorSide:function(pageY){
        var h = this.targetH;
        var dy = pageY - this.targetOff.top;
        if(h/2 - dy >= 0)
            return 1;
        return -1;
    },
    
    // somebody dropped
    sbdrop : function(target, source, e){
        var side = this.getCursorSide(e.pageY);
        var jq = $(source);
        jq.hide();
        if(side === 1)
            jq.insertBefore(target);
        else jq.insertAfter(target);
        jq.css('background-color', '#F7F7F7');
        jq.fadeIn(400, function(){
            jq.css('background-color', '').css('display','');
        });
        $(target).removeClass(this.hoverCS);
    },
    
    dragend : function(source){
        this.applySourceIndicator(false);
        this.applyTargetIndicator(false);
    },
    
    afterdrag : function(source){
        $(source).removeClass(this.dragsourceCS);
    },
    
    setTargetIndicatorTimer : function(b){
        if(b){
            if(this._idtimer)
                clearTimeout(this._idtimer);
            var idt = this.targetIndicator;
            this._idtimer = setTimeout(function(){
                idt.cssDisplay(false);
            }, 200);
        }else if(this._idtimer){
            clearTimeout(this._idtimer);
            this._idtimer = false;
        }
    },
    
    applySourceIndicator : function(apply){
        var idt = this.sourceIndicator;
        if(!idt){
            idt = this.sourceIndicator = $('<div class="range-bg hidden"></div>');
            idt.appendTo(document.body);
        }
        if(!apply)
            idt.cssDisplay(false);
        return idt;
    },
    
    applyTargetIndicator : function(apply){
        var idt = this.targetIndicator;
        if(!idt){
            idt = this.targetIndicator = $('<div class="range-inser hidden"><div class="range-l"></div><div class="range-r"></div><div class="range-m"></div></div>');
            idt.appendTo(document.body);
        }
        if(!apply)
           idt.cssDisplay(false);
        return idt;
    },

    modify : function(){
        $(this.modifyBtn).cssDisplay(false);
        $(this.saveBtn).cssDisplay(true);
        DDMgr.bind(this.tbl, this, this, this);
        $(this.tbl).addClass(this.dragzoomCS);
    },
    
    save : function(){
        var ids = [];
        $(this.tbl).find('tr[rel]').each(function(){
            ids[ids.length] = $(this).attr('rel');
        });
        var data = this.param || {};
        data[this.paramName||'ids'] = ids;
        
        $.ajax({
            type:'POST',
            url:this.url,
            data : data,
            dataType:'json',
            success : function(ret){
                location.reload();
            }
        });
    }
};


function bind(fn, scope){
    return function() {
        return fn.apply(scope, arguments);
    };
}

var disabledCS = 'general-btn-disabled';

function disable(el , disabled, cs){
  disabled ? $(el).addClass(cs||disabledCS) : $(el).removeClass(cs||disabledCS);
}

/**
* 利用'hidden'CSS类进行隐藏或显示元素
*/
$.fn.cssDisplay = function(b){
    if( b === undefined ){
        return this.hasClass('hidden');
    }else{
        if(b)
            this.removeClass('hidden');
        else this.addClass('hidden');
    }
    return this;
};


function split(str, splitChar, escChar){
    var c, arr = [], tmp = [];
    if(!escChar)
        escChar = '\\';

    for(var i=0,len=str.length;i<len;i++){
        c = str.charAt(i);
        if(c === splitChar){
            arr.push(tmp.join(''));
            tmp.length = 0;
            continue;
        }
        else if(c === escChar && str.charAt(i+1) === splitChar){
            c = splitChar;
            i++;
        }
        tmp[tmp.length] = c;
    }
    if(tmp.length)
        arr.push(tmp.join(''));
    return arr;
}

function parseKnV(strRel){
    var map = {}, kv, kvs = split(strRel, ',');
    try {
        for( var i=0,len=kvs.length;i<len;i++){
            // if not contains ':'
            // set k = true
            if(kvs[i].indexOf(':') === -1){
                map[kvs[i]] = true;
            }else {
                // split : to k and v
                kv = split(kvs[i], ':');
                // escape value
                map[kv[0]] = kv[1];
            }
        }
    }catch(e) { 
        if(__debug) console.trace();
        throw 'Syntax Error:rel字符串格式出错。' + strRel; 
    }

        return map;
}

var validators;
window.Validator = function(cfg){
    $.extend(this, cfg);
    this.init();
};


//
// validator(element, nextChain, strData, next)
//
function ElemValidatorGroupChain(mgr){
    this.mgr = mgr;
    this.nextChain = bind(this.doNextChain, this);
}

var emptyObj = {};

ElemValidatorGroupChain.prototype = {

/**
 * 可重复调用
 */
    doChain : function(elem, validators, whenStop){
        var v = elem.value;
        if( typeof v === 'string')
            v = $.trim(v);
        this.elVal = v;
        this.tmpData = {};
        this.elem = elem;
        this.validators = validators;
        this.finalChain = whenStop;
        this.idx = -1;
        this.error = 0;
        this.doNextChain();
    },

    doNextChain : function(){
        this.idx++;
        if(this.idx >= this.validators.length){
          if(!this.error){
            if(__debug) console.log('onpass', this.elem);
            this.mgr.onpass(this.elem, this.elVal);
          }
          this.finalChain &&  this.finalChain();
        } else {
            var vds = this.validators[this.idx];
            // 跳过预处理
            if(vds.isPreCmd) {
                this.nextChain();
            }else{
                 if (typeof vds === 'function')
                     vds.call(this.mgr, this.elem, this.elVal, emptyObj , this.nextChain);    
                 else vds[0].call(this.mgr, this.elem, this.elVal, vds[1], this.nextChain);         
            }
        }
    }
};

Validator.prototype = {
    
    useCache  : true,
    
    autoFocus : true,
    
    tipName : 'warntip',
    
    tipTextNode : '#tle',
    
    decorateTrigger : true,
    
    // 1 单个提醒, 0 连续提醒
    warnType : 1,
    
    // private
    
    onerror   : function(elem, data){
        var tipId = $(elem).attr(this.tipName);
        if(tipId && data.m){
           var msgs = this.elValiChain.tmpData.errors;
           if(!msgs)
                msgs = this.elValiChain.tmpData.errors = [];
           msgs.push(data.m);
           var jqTip = $(tipId);
           var jqTxt = jqTip.cssDisplay(true)
                       .find(this.tipTextNode);
           if(!jqTxt.length)
                jqTxt = jqTip;
           if(this.warnType === 1){
                if(msgs.length == 1){
                    jqTxt.text(msgs[0]);
                }
           }else jqTxt.text(msgs.join('，'));
        }
    },
    
    onpass : function(elem, data){
        var tipId = $(elem).attr(this.tipName);
        if(tipId)
            $(tipId).cssDisplay(false);
    },
    
    onfinal   : $.noop,
    trigOnSubmit : true,
    
    reg : function(cmd, validator) {
        if(!validators)
            validators = {};
        if($.isArray(cmd)){
            for(var i=0,len=cmd.length;i<len;i++){
                this.reg.apply(this, cmd[i]);
            }
        }else validators[cmd] = validator;
        return this;
    },
    
    add : function(eleName, validator){
        var extrav = this.extraValidators;
        if(!extrav)
            extrav = this.extraValidators = {};
            
        var links = extrav[eleName];
        if(!links)
            links = extrav[eleName] = [validator];
        else links.push(validator);
    },
    
    init : function(){
        if(!validators)
            validators = {};
        
        // add self validators    
        
        
        
        this.nextChain = bind( this.doNextChain, this );
        this.elValiChain = new ElemValidatorGroupChain(this);
        
        this.form = $(this.form).get(0);
        // 执行预处理
        var elems = this.form.elements;
        var self = this;
        $.each(elems, function(){
            var vals = self.getEleValidators(this, false, this.useCache);
            for(var i=0,len=vals.length;i<len;i++){
                if( vals[i].isPreCmd )
                    vals[i][0].call(self, this, vals[i][1]);
            }
        });
        var self = this;
        
        var trigFn = function(){
                self.validate();
                // 由程序控制提交
                return false;
        };
        
        if( this.trigOnSubmit )
            this.form.onsubmit = trigFn;
        
        if( this.trigger ){
            this.trigger = $(this.trigger)[0];
            $(this.trigger).click(function(){
                return trigFn();
            });
        }
    },
/**
 * 可单独对某元素进行验证
 */
    validElement : function(el, cmds, next){
        if(!this.isGlobalVal){
            this.error = 0;
            this.validElement0(el, cmds, next);
        }
    },

    validElement0 : function(el, cmds, next){
        var vds = this.getEleValidators(el, cmds);
        if(vds.length) 
            this.elValiChain.doChain(el, vds, next);
        else next && next();
    },
    
/**
 *
 */    
    validate : function(){
        // 防止重复提交
        if (!this.isGlobalVal) {
            this.elems = this.form.elements;
            this.currElIdx = -1;
            this.error = 0;
            this.isGlobalVal = true;
            this.data = {};
            if( this.param )
               $.extend( this.data, this.param );
            
            if(this.decorateTrigger && this.trigger)
                disable(this.trigger, true);
            this.doNextChain();
        }
        return false;
    },
    
    // @private
    finalChain : function(result){
        this.onfinal();
        this.isGlobalVal = false;
        if(this.data)
            delete this.data;

        if(this.decorateTrigger && this.trigger)
            disable(this.trigger, false);
    },
    
    /**
     * 返回一个指令数组，可为指令字符串或数组。预处理保存在返回数组的preCmds属性
     * 为数组时，第一个为指令字符串，第二个为指令数据map结构。
     * 格式为 cmd=k:v,k2:v2|cmd2=k:v,k2:v2 ...
     * @private
     */ 
    parseCmd : function(strRel){
        var cmds = [], arr = split(strRel, '|'), kd;
        for(var i=0,len=arr.length;i<len;i++){
            if( arr[i].indexOf('=') === -1 ){
                kd = [arr[i],{}];
            }
            else {
                kd = split(arr[i], '=');
                kd[1] = parseKnV(kd[1]);
            }
            if(kd[0].charAt(0) === '_'){
                kd.isPreCmd = true;
                kd[0] = kd[0].substr(1);
            }
            cmds[cmds.length] = kd;
        }
        return cmds;
    },
    
    // 转换后返回数组格式 [ [ function_validator, object_validator_data ] , ...]
    // @private
    getEleValidators : function(elem, rel){
        var cmds, useCache = false;
        if( !rel ){
            rel = $(elem).attr('vrel');
            useCache = this.useCache;
        }
        if(rel){
            var jq = $(elem);
            if( useCache ){
                if( jq.data('xwb_vd_cmds') )
                    cmds = jq.data('xwb_vd_cmds');
                else {
                    cmds = this.parseCmd(rel);
                    jq.data('xwb_vd_cmds', cmds);
                }
            }
            else {
                cmds = this.parseCmd(rel);
            }

            // name => function
            // 先查找自身validator
            // 再查找全局validator
            var 
                // global share validators
                vds = validators, 
                // self validators
                selfVds = this.validators,
                cmd;
            for( var i=0,len=cmds.length;i<len;i++ ){
                    var k = cmds[i][0];
                    if( typeof k === 'string' ){
                        cmd = (selfVds && selfVds[k]) || vds[k];
                        if ( !cmd ){
                            if(__debug) console.trace();
                            throw 'Undefine cmd :'+k+',in element '+elem.name;
                        }
                        cmds[i][0] = cmd;
                    }
            }
        }else cmds = [];
        var extra = this.extraValidators;
        if( extra && extra[elem.name] )
            $.merge(cmds, extra[elem.name]);
        return cmds;
    },

/**
 * @param {Boolean} result
 * @param {Object}  elementValidationData
 */
    report : function(result, data){
        if(!result) {
            // 全局累计error
            this.error++;
            // 元素累计error
            this.elValiChain.error++;
            if(__debug) console.log('onerror', this.elValiChain.elem, data);
            this.onerror( this.elValiChain.elem, data );
            if(this.error === 1 && this.isGlobalVal && this.autoFocus)
                this.elValiChain.elem.focus();
        }
    },

    setValue : function(v){
        this.elValiChain.elVal = v;
    },
    
/**@cfg */
    onsuccess : function(data, finalChain){
        if(__debug) console.log(data);
        finalChain();
    },
    
    // @private
    doNextChain : function(){
        // collect pre data here
        // 部份可能无需验证
        var len = this.elems.length;
        
        if(this.currElIdx >= 0 && this.currElIdx < len && !this.error)
            this.collectValue(this.elems[this.currElIdx]);
        
        this.currElIdx++;
        if(this.currElIdx === len){
            
            if(!this.error){
                // 返回非false进行表单form提交
                // 返回false表示忽略FORM进行自定义提交（或ajax或其它）...
                if( this.onsuccess(this.data, this.nextChain) !== false )
                    this.form.submit();
            // 所有结束并失败后
            } else this.finalChain();
        }else if(this.currElIdx > len){
            // 成功callback调用后的chain
            this.finalChain();
        }else {
            var el = this.elems[this.currElIdx];
            if(el.disabled)
                this.doNextChain();
            else if (el.tagName === 'INPUT' && ( el.type === 'radio' || el.type === 'checkbox' )) {
                    if (!el.checked) 
                        this.doNextChain();
                    else this.validElement0(el, false, this.nextChain);
            }
            else this.validElement0(el, false, this.nextChain);
        }
    },
    
    // 验证通过无错情况下收集表单元素数据
    // @private
    collectValue : function(elem){
        if (elem.tagName === 'INPUT' && ( elem.type === 'radio' || elem.type === 'checkbox' )){
           if(elem.checked)
                this.data[elem.name] = elem.value;
        }
        else this.data[elem.name] = elem.value;
    }
};

Validator.prototype

/**
 * 空检测
 * <pre>
 ne=w:在这里输入名称,m:请输入昵称
 * </pre>
 */
.reg('ne', function(elem, v, data, next){
    
    var em = v === '';
    if( !em && data.w )
        em = v == data.w;
    if(em && !data.m && data.m !== 0)
        data.m = '该项不能为空';
    this.report(!em, data);

    next();
})

// 失去焦点时检测
// 用法:rel="_f"
.reg('f', function(elem, data){
    var mgm = this;
    $(elem).blur(function(){
        mgm.validElement(this);
    });
})

//between
.reg('bt', function(elem, v, data, next) {
//	console.log(v);
	var min = parseInt(data.min),
		max = parseInt(data.max),
		v = parseInt(v),
		err = 0;

	if (v < min)
	{
		err = 1;
	}

	if (!err && (v > max))
	{
		err = 2
	}

	this.report(!err, data);

	next();
})

// size 长度限制
// sz=min:3,max:10 （可二选一或同时使用)
.reg('sz', function(elem, v, data, next){
	var min = data.min ? data.min*2: null,
		max = data.max ? data.max*2: null,
		len = v ? byteLen(v): 0,
		err = 0;

	if (min && (len < min))
	{
		err = 1;
	}

	if (max && (len > max))
	{
		err = 2;
	}

	this.report(!err, data);

	next();
})

// is int

.reg('int', function(elem, v, data, next) {
	var result = v && /^\d+$/.test(v);

	this.report(result, data);

	next();
})

// 检查密码格式，只检查是否数字、字母、半角 “.” “-” “?” 和下划线组成
.reg('pw', function(elem, v, data, next){
    var reg = /^[a-zA-Z-0-9\.\-_\?]+$/;
    if(!data.m && data.m !== 0)
        data.m = '允许数字、字母、半角 “.” “-” “?” 和下划线组成';
    this.report(reg.test(v), data);
    next();
})

// normal words
// 支持中英文、数字、"_"或减号
.reg('nw', function(elem, v, data, next){
    if(!data.m)
        data.m = '支持中英文、数字、"_"或减号';
    this.report(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(v), data);
    next();
})

// 检查是否有效的日期格式
.reg('dt', function(elem, v, data, next){
    if(!data.m && data.m !== 0)
        data.m = '不是有效的日期格式';
    var d = Date.parse(v);

    // 可以在这扩展max,min等
    this.report(!isNaN(d), data);
    next();
});


window.byteLen = byteLen;


/**
 * 是否包含a元素.
 */
function ancestorOf(v, a, depth){
  a = a.view || a;
  if (v.contains && !$.browser.webkit) {
     return v.contains(a);
  }else if (v.compareDocumentPosition) {
     return !!(v.compareDocumentPosition(a) & 16);
  }

  if(depth === undefined)
    depth = 65535;
  var p = a.parentNode, bd = document.body;
  while(p!= bd && depth>0 && p !== null){
    if(p == v)
      return true;
    p = p.parentNode;
    depth--;
  }
  return false;
}
window.Switcher = function(opt){
	opt && $.extend(this, opt);
	this.initUI();
};

Switcher.prototype = {
	trigMode : 'click',
	initUI : function(){
		if (this.items)
			this.add(this.items, this.contents);
	},
/**
 * 
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
 * 
 * @param {HTMLElement} item
 */	
	unselect : function(item){
        if(this.selectedCS)
            $(item).removeClass(this.selectedCS);
        
        if(item.contentEl)
            $(item.contentEl).cssDisplay(false);
		
		if(this.mouseoutTimer)
		    this.clearTimer(1);
	
        this.selectedItem = null;
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
 * 
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
						switcher.mouseoutTimerFn = null;
					}
					
					var el = e.target;
					if (switcher.autoRecover && (el === this || ancestorOf(this, el))) {
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
			});
	   }
    }
};

})(jQuery);