(function(){

/**
 * @class Xwb.ax.ElementValidationContext
 * 这是个接口类，接口方法为{@link Xwb.ax.ElememtValidatorChain}类所用，
 * 可以提供满足验证单个元素所需的所有数据。<br/>
 * Xwb已有一个该接口的实现类{@link Xwb.ax.ValidationMgr}，通常情况下无需关注此接口，
 * 开发中更不会直接应用本接口。
 * 该接口主要的作用有：
 * <ul>
 * <li>提供验证元素的验证器</li>
 * <li>验证成功或失败报告入口</li>
 * <li>提供验证成功或失败的处理入口</li>
 * <li>提供当前使用的表单验证管理器</li>
 * </ul>
 * @constructor
 * @param {Xwb.ax.ElementValidationContext}
 * @param {HTMLElement} element
 */

/**
 * 获得第i个验证器,无对应下标值返回空
 * @param {Number} index
 * @param {HtmlElement} element
 * @method nextValidatorData
 */

/**
 * 验证器报告验证结果
 * @param {Boolean} result
 * @param {Object} data
 * @param {HtmlElement} element
 * @param {Xwb.ax.ElememtValidatorChain} elementChain
 * @method report
 */

/**
 * 根据名称返回验证方法
 * @param {String} name
 * @method getValidator
 */

/**
 * callback，每个验证器验证失败后都触发一次
 * @param {HtmlElement} element
 * @param {Object} data
 * @param {Xwb.ax.ElememtValidatorChain} chain
 * @method onerror
 */

/**
 * callback，在验证元素过程中成功后只会触发一次
 * @param {HtmlElement} element
 * @param {Xwb.ax.ElememtValidatorChain} chain
 * @method onpass
 */

/**
 * 返回表单验证管理器
 * @param {Xwb.ax.ValidationMgr} mgr
 * @method getMgr
 */

var X = Xwb;
var Util = X.util;

// getElememtExtraValidator ( elemName ) {}
// report(elem ,elem.value)
function ElememtValidatorChain(context, elem){
    this.elem = elem;
    this.context = context;
    this.nextChain = Util.bind(this._doNextChain, this);
}

/**
 * @class Xwb.ax.ElememtValidatorChain
 * 本类利用接口{@link Xwb.ax.ElementValidationContext}提供的方法与数据验证单个元素。<br/>
 * 同一类实例不允许在验证未结束时开始新的验证，否则抛出"Concurrent validation exception"异常。<br/>
 * 一般情况下，不必直接实例化该类对单个元素进行验证。但若要实例化，可通过以下方法： 
* <pre><code>
 // context
 var mgr = new Xwb.ax.ValidationMgr({
    form : '#myform'
 });

 var chain = new Xwb.ax.ElememtValidatorChain(mgr, '#userName');
 chain.validate();
 
 或者
 
 mgr.validateElement('#userName');
 
 </code></pre>

 */
ElememtValidatorChain.prototype = {
    /**
     * @property error
     * 错误次数，可在callback调用时检测当前验证后的错误次数
     * @type Number
     */
     
    // error : 0,
    
    /**
     * @property validating
     * 是否验证中
     * @type Boolean
     */
 
    /**
     * 验证元素
     * @param {Boolean} callback 验证结束后回调，
     * callback调用时this指向当前{@link Xwb.ax.ElememtValidatorChain}实例
     */
    validate : function(callback){
        // 禁止同时验证
        if(this.validating)
            throw 'Concurrent validation exception.';

        this.setValue(this._getRawValue( this.elem ));

        this._finalChain = callback;
        this.idx = -1;
        this.error = 0;
        this.msgs = [];

        this._doNextChain();
    },
    
    // private
    _getRawValue : function(elem){
        var v = elem.value;
        // 对字符串值做trim处理
        if( typeof v === 'string' )
            v = $.trim(v);
        return v;
    },
    

/**
 * 验证过程中，可以通过该方法获得元素最新值。<br/>
 * 不建议直接通过element.value获得元素值，因为该值可能并不是真正意义上的元素值。
 * @return {Object}
 */
    getValue : function(){
        return this.value;
    },
    
/**
 * 验证过程中，可通过该方法设置元素值
 * @param {Object} value 元素值
 */
    setValue : function(v){
        this.value = v;
    },

/**
 * 获得验证过程中出现的所有错误
 * @return {Array}
 */
    getErrors : function(){
        return this.msgs;
    },

/**
 * 追加错误提示
 * @param {String} message
 */
    addError : function(msg){
        this.msgs.push(msg);
    },

    /**
     * 对验证元素执行预处理
     */
    doPrehandling : function(){
        var ctx = this.context;
        var idx = 0;
        var cmd; // cmd[name, data]
        
        while( (cmd = ctx.nextValidatorData(idx++, this.elem)) && cmd.isPreCmd){
            if(typeof cmd[0] === 'string'){
                var vd = ctx.getValidator(cmd[0]);
                if(!vd)
                    throw 'ValidationException:Undefined validator \''+cmd[0]+'\' in element '+this.elem.name;
                vd.call(this, this.elem, cmd[1]);
            }else cmd[0].call(this, this.elem, cmd[1]);
        }
    },
    
    // private
    _doNextChain : function(){
        this.idx++;
        var vds = this.context.nextValidatorData(this.idx, this.elem);
        if(vds){
            // 跳过预处理
            if(vds.isPreCmd) {
                this.nextChain();
            }else{
                 // 单个验证器
                 if (typeof vds === 'function'){
                     // 寄存数据
                     vds[1] = {};
                     vds.call(this, this.elem, this.getValue(), vds[1] , this.nextChain);    
                 }else {
                    // 验证器标识字符串
                    // 结构为[sid, data]
                    // 验证器回调参数为 this.validator(elem, value, data, next)
                    if(typeof vds[0] === 'string'){
                        var vd = this.context.getValidator(vds[0]);
                        if(!vd)
                            throw 'ValidationException:Undefined validator ['+vds[0]+'] in element '+this.elem.name;
                        vd.call(this, this.elem, this.getValue(), vds[1], this.nextChain);
                    }else vds[0].call(this, this.elem, this.getValue(), vds[1], this.nextChain);
                 }
            }
        }else {
            if(!this.error){
                if(__debug) console.log('onpass', this.elem, this);
                this.context.onpass(this.elem, this);
            }
            // 结束
            this._finalChain &&  this._finalChain();
            this._finalChain = null;
        }
    },
    
    /**
     * 验证器调用该方法汇报验证情况
     * @param {Boolean} result 成功传递true，否则传递false
     * @param {Object} 元素rel数据
     */
    report : function(result, data){
        if(!result)
            this.error++;

        var elem = this.elem;
        
        // 传递给context
        this.context.report(result, data, elem, this);
        
        if(!result){
            if(__debug) console.log('onerror', elem, data);
            this.context.onerror(elem, data, this);
        }
    }
};


var validators;

X.ax.ValidationMgr = function(cfg){
    $.extend(this, cfg);
    this.init();
};

/**
 * @class Xwb.ax.ValidationMgr
 * @extends Xwb.ax.ElementValidationContext
 * 表单验证类，对表单中所有需要验证的元素执行验证处理。<br/>
 * 本类提供与具体应用无关的方式验证常用的表单数据的有效性。<br/>
 * 支持元素同步与异步验证。<br/>
 * <b>建议每个表单都用form元素提交。</b><br/>
 * 如果表单无input提交按钮，可隐藏一个type=submit的input按钮，方便用户按回车后提交表单。<br/>
 * 验证表单通常需要两个步骤：
 * <ul>
 * <li>在元素html模板上创建验证该元素所需的属性。其中<b>vrel</b>是必须属性，引入该元素的验证器</li>
 * <li>在JavaScript文件中利用本类初始化表单</li>
 * </ul>
 * 当所有验证通过后，回调{@link #onsuccess}方法，可以在方法内返回false值取消表单的提交行为。<br/>
 * 什么是验证器？<br/>
 * 验证器其实就是一个回调函数，除了库提供一套通用的验证器外，也可自行注册验证器。<br/>
 * 每个验证器都应用一个标识，通过{@link #reg}方法注册验证器。<br/>
 * 验证器标识字符串被HTML模板的表单元素<b>vrel</b>属性引用，指明验证该元素所需的验证器。<br/>
 * 如果在vrel属性里的验证器标识加下划线，那么此时的验证器就是一个预处理器，
 * 在表单验证管理器初始化后就会执行，而且只会执行一次。<br/>
 * 验证器rel属性数据格式是什么？<br/>
 * rel属性最终被解析为JavaScript对象，它是一个键值对，格式为<br/>
 * identifier=key:value,key:value,...|identifier=key:value,key:value,...|...<br/>
 * value数据需用\转义':'，','字符，如\,表示单个','。<br/>
 * 如果rel数据有HTML保留字符，请先用&xx;转义，比如双引号。
 * 属性内容由验证器自己定义。<br/>
 * 例：
 * <pre><code>
 html:
 &lt;input name=&quot;nick&quot; vrel=&quot;_f|sinan|ne=m:Name can not be empty&quot; warntip=&quot;#nickTip&quot; /&gt;
 上面包含元素验证的几个信息：
 vrel -> 指明所用到的验证器有f, sina, ne，其中f是在验证管理器载入时就执行的。
 warntip -> 指明元素验证失败时提示信息所在的HTML元素
 -----
 JavaScript初始例如：
 
 Xwb.use('Validator', {
     // 当前表单form元素
     form:jq.find('#showForm'),
     // 触发提交按钮
     trigger : jq.find('#trig'),
     onsuccess : function(data, next){
         Xwb.request.updateShowProfile(data, function( e ){
             if(e.isOk()){
                 Xwb.ui.MsgBox.success('', '显示设置已保存。');
             }else Xwb.ui.MsgBox.error('', e.getMsg());
                 
             next();
         });
         // 非FORM提交返回false
         return false;
     },
     // 如果已有的验证器满足不了需求，
     // 也可以通过validators属性定义当前验证管理器中其它的验证器
     validators : {
        checkusername : function(elem, v, data, next){
            // ...
        },
        //...
     }
 });
 </code></pre>
 * 验证应用例子参见/mod/mysetting.js,验证器注册例子参见/mod/validators.js。<br/>
 */


/**
 * @cfg {Boolean} useCache 是否缓存rel值
 */

/**
 * @cfg {jQuery} form html form元素
 */
/**
 * @cfg {jQuery} trigger 如果触发提交的按钮不是input按钮，可以指定其它按钮元素，input按钮则不用指定
 */
X.ax.ValidationMgr.prototype = {
    
    // implemention
    nextValidatorData : function(idx, elem){
        var vds = this._getBindingValidators(elem);
        return vds && vds[idx];
    },
    
    // implemention
    getValidator : function( name ){
        // 先自身查找，再全局查找。
        var selfVds = this.validators;
        var fnd;
        if(selfVds)
            fnd = selfVds[name];
        
        // 全局
        if(!fnd && validators)
            fnd = validators[name];
        return fnd;
    },
    
    // implemention    
    report : function(result, data, elem, chain){
        if(!result) {
            // 只有在表单验证时计算，单个元素验证忽略
            if(chain.multival){
                // 全局累计error
                this.error++;
                if( this.error === 1 && // 首次出错
                    this.autoFocus){
                    try{elem.focus();}catch(e){}
                }
            }
        }
    },
    
    // implemention
    getMgr : function(){ return this; },
    
    /** @cfg {Boolean} trigOnSubmit 是否提交时触发验证，默认true*/
    trigOnSubmit : true,
    
    onfinal   : $.noop,
    
    /**
     * @cfg {Boolean} autoFocus 验证失败时是否聚焦到元素上，默认true
     */
    autoFocus : true,
    
    init : function(){
        if(!validators)
            validators = {};
        
        this.nextChain = Util.getBind( this, '_doNextChain' );
        
        this.form = $(this.form)[0];
        
        var self = this;
        
        // 执行预处理
        
        $.each(this._getElements(), function(){
            var chain = new ElememtValidatorChain(self, this);
            chain.doPrehandling();
        });
        
        var trigFn = function(){
                self.validate();
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
     * 验证单个元素
     * @param {HtmlElement} element
     */
    validateElement : function(elem){
        if(!this.isGlobalVal){
            this._validateElem(elem);
        }
    },
    
    /**
     * 执行表单验证。通常不用手动调用本方法验证表单，而是由用户触发验证。
     */
    validate : function(){
        // 防止重复提交
        if (!this.isGlobalVal) {
            // 寄存所有需要验证的元素
            this.elems = this._getElements();
            // 当前验证的元素下标
            this.currElIdx = -1;
            // 全局错误次数
            this.error = 0;
            // 是否验证中
            this.isGlobalVal = true;
            // 存放元素值
            this.data = {};
            // 预定义参数
            if( this.param )
               $.extend( this.data, this.param );
            
            // 当前验证周期ID
            this.uniqueId = Util.uniqueId();
        
            if(this.decorateTrigger && this.trigger)
                Util.disable(this.trigger, true);
            this._doNextChain();
        }
        return false;
    },
    /**
     * 注册表单元素验证器。<br/>
     * 验证器调用格式：<br/>
     * validator(element, value, data, next);<br/>
     * element:当前验证元素<br/>
     * value:当前验证元素值<br/>
     * data:当前验证器rel数据<br/>
     * next:验证结束后的调用函数 ，传递下一个验证<br/>
     * 注意：验证元素值前除了空检测外其它情况都应该认为空值是可以<b>通过</b>的。
     * @param {String} name 验证器名称 
     * @param {Function} validator 验证方法
     * <pre><code>
        例：
        // 检查是否有效的日期格式
        reg('dt', function(elem, v, data, next){
            // 注意：验证元素值前除了空检测验证器外
            // 其它情况都应该认为空值是可以通过的
            // 所以这里忽略空检查
            if(v){
                // 设置默认的提示
                if(!data.m)
                    data.m = '不是有效的日期格式';
                var d = Date.parse(v);
                // 报告验证结果
                this.report(!isNaN(d), data);
            }else this.report(true, data);
            next();
        });
     </code></pre>
     */
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
    
    /**
     * @cfg {Function} onsuccess 验证结束后回调方法，调用为 onsuccess(formData, finalChain)，
     * formData为表单元素经过验证处理后的数据；finalChain为onsuccess必须回调的方法，以正常结束表单的验证。
     * 如果是异步提交，可以在该方法内提交表单。<br/>
     * 方法返回false可取消浏览器默认的表单提交。
     */
    onsuccess : function(data, finalChain){
        finalChain();
    },

    _getElements : function(){
        return  this.elements || this.form.elements;
    },

    // @private
    _doNextChain : function(){
        // collect pre data here
        // 部份可能无需验证
        var len = this.elems.length;
        
        if(this.currElIdx >= 0 && this.currElIdx < len && !this.error)
            this._collectValue(this.elems[this.currElIdx]);
        
        this.currElIdx++;
        if(this.currElIdx === len){
            if(!this.error){
                if(__debug) console.log('onsuccess', this.data);
                // 返回非false进行表单form提交
                // 返回false表示忽略FORM进行自定义提交（或ajax或其它）...
                // form submit后 nextChain不再生效，进行页面提交
                if( this.onsuccess(this.data, this.nextChain) !== false )
                    this.form.submit();
            // 所有结束并失败后
            } else this._finalChain();
        }else if(this.currElIdx > len){
            // 成功callback调用后的chain
            this._finalChain();
        }else {
            var el = this.elems[this.currElIdx];
            if(el.disabled)
                this._doNextChain();
            else this._validateElem(el, this.nextChain, true);
        }
    },
    
    _validateElem : function(el, callback, multival){
        if($(el).attr('vrel')){
            var chain = new ElememtValidatorChain(this, el);
            // 是否独立验证或者来自FORM验证
            // 如果来自FORM验证，添加引用currentChain到chain
            if(multival){
                chain.multival = true;
                this.currentChain = chain;
            }
            chain.validate(callback);
        }else { callback && callback(); }
    },

    _finalChain : function(){
        this.onfinal();
        this.isGlobalVal = false;
        
        if(this.data)
            delete this.data;
        delete this.currentChain;
        
        if(this.decorateTrigger && this.trigger)
            Util.disable(this.trigger, false);
    },
    
    // 验证通过无错情况下收集表单元素数据
    // @private
    _collectValue : function(elem){
        // 优先应用元素自身的chain.getValue()
        if(this.currentChain && this.currentChain.elem===elem){
            this.data[elem.name] = this.currentChain.getValue();
        }else {
            if (elem.tagName === 'INPUT'){
               if( elem.type === 'radio' || elem.type === 'checkbox' ){
                    if(!elem.checked)
                        return;
               }else if(elem.type === 'submit'){
                    return;
               }
            }
            
            this.data[elem.name] = elem.value;
        }
    },
    
    
    // 从元素中读出相关的验证信息。
    _getBindingValidators : function(elem){
        var cmds,
            jq = $(elem);

        if( this.useCache ){
            if( jq.data('xwb_vd_cmds') ){
                cmds = jq.data('xwb_vd_cmds');
            }else {
                cmds = this.parseCmd(jq.attr('vrel'));
                this._mergeExtraValidators(cmds, elem);
                jq.data('xwb_vd_cmds', cmds);
            }
        }
        else {
            cmds = this.parseCmd(jq.attr('vrel'));
            jq.data('xwb_vd_cmds', cmds);
            this._mergeExtraValidators(cmds, elem);
        }
        return cmds;
    },
    
    // 如已定义元素额外的验证器，合并验证器。
    _mergeExtraValidators : function(cmds, elem){
        // 额外来自Manager针对该元素的验证器
        // 加入到当前集合中
        var extra = this.extraValidators;
        if( extra && extra[elem.name||elem.id] )
            $.merge(cmds, extra[elem.name||elem.id]);
    },
    
    /**
     * 返回一个指令数组，可为指令字符串或数组。预处理保存在返回数组的preCmds属性
     * 为数组时，第一个为指令字符串，第二个为指令数据map结构。
     * 格式为 cmd=k:v,k2:v2|cmd2=k:v,k2:v2 ...
     * 返回数据格式为 [ [name, attr], [name, attr], ...]
     * @private
     */
    parseCmd : function(strRel){
        
        if(!strRel)
            return [];

        var cmds = [], arr = Util.split(strRel, '|'), kd;
        for(var i=0,len=arr.length;i<len;i++){
            // 无属性数据
            if( arr[i].indexOf('=') === -1 ){
                kd = [arr[i],{}];
            }
            // 含属性数据
            else {
                kd = Util.split(arr[i], '=');
                kd[1] = Util.parseKnV(kd[1]);
            }
            // 识别为预处理指令
            if(kd[0].charAt(0) === '_'){
                kd.isPreCmd = true;
                kd[0] = kd[0].substr(1);
            }
            
            cmds[cmds.length] = kd;
        }            
        return cmds;
    },
    
//
//  验证失败与成功处理
//
    errTipName : 'warntip',
    tipTextNode : '#tle',
    // 1 单个提醒, 0 连续提醒
    warnType : 1,
    // html, text, default html
    tipTextType:'',
    
    
    comForm : false, //普通的form,如果是普通的form就要加以下的样式
    focusCss : 'style-focus', //获得焦点时的样式
    disableCss : 'style-disabled', //禁用的样式
    errCss : 'style-wrong', // 出错的样式
    
    
    okTip   : 'oktip',
    
    // implemention
    onerror : function(elem, data, chain){
        // 是否更新并显示错误提示
        var needed = true;
        chain.addError(data.m);
        var tipId = $(elem).attr(this.errTipName);
        if(tipId){
            var jqTip = this.getWarnTip(elem, tipId);
           if(this.isGlobalVal && chain.error == 1){
                // 可能存在多个验证器共用一个提示元素的情况
                // 必须加以区别
                // 上一个全局验证期，表明当前的状态是否有效
                var previd = jqTip.data('vrel_previd');
                // 当前tip错误次数,如果为０则提示值为当前元素提示。
                var times =  jqTip.data('vrel_errors') || 0;
                if(this.uniqueId != previd){
                    // 验证刚开始，当前tips寄存数据为无效，重置
                    jqTip.data('vrel_previd', this.uniqueId);
                    jqTip.data('vrel_errors',0);
                    times = 0;
                }else {
                    // 首次出错才更新提示
                    needed = times == 0;
                }
                // 增加当前tip错误计数
                jqTip.data('vrel_errors', ++times);
           }
        }
           // 当前未占用提示或提示为自身时，可使用提示元素
        if(needed){
             var msgs = chain.getErrors();
             if(this.warnType === 1){
                     if(msgs.length == 1){
                         msgs = msgs[0];
                     }
             }else {
                 msgs = msgs.join('，');
             }
             this.tipWarn(elem, msgs);
        }
    },
    
    // private，查找提示元素的方法
    getWarnTip : function(elem, tipSelector){
        var rs = $(elem).find(tipSelector);
        if(!rs.length)
            rs = $(tipSelector);
        return rs;
    },
    
    // implemention
    onpass : function(elem, chain){
        var tipId = $(elem).attr(this.errTipName);
        var needed = true;
        if(tipId){
            var jqTip = this.getWarnTip(elem, tipId);
            // 可能存在多个验证器共用一个提示元素的情况
            // 必须加以区别
            if(this.isGlobalVal){
                // 上一个全局验证期，表明当前的状态是否有效
                var previd = jqTip.data('vrel_previd');
                // 当前tip错误次数,如果为０则提示值为当前元素提示。
                var times =  jqTip.data('vrel_errors') || 0;
                if(this.uniqueId != previd){
                    // 验证刚开始，当前tips寄存数据为无效，重置
                    jqTip.data('vrel_previd', this.uniqueId);
                    jqTip.data('vrel_errors',0);
                    times = 0;
                }else {
                    // 无错才隐藏
                    needed = times==0;
                }
            }
        }
        if(needed)
            this.tipPass(elem);
    },
    
    /**
     * 显示元素错误提示，可重写自定义错误提示
     * @param {jQuery} element
     * @param {String} message
     */
    tipWarn : function(elem, msg){
        var tipId = $(elem).attr(this.errTipName);
        if(tipId){
            var jqTip = this.getWarnTip(elem, tipId);
            var jqTxt = jqTip.cssDisplay(true)
                       .find(this.tipTextNode);
            if(!jqTxt.length)
                    jqTxt = jqTip;
            
            this.tipTextType==='text'?jqTxt.text(msg):jqTxt.html(msg);
            return jqTip;
        }
        
        // 出错了，就隐藏oktip
        var okTip = $(elem).attr(this.okTip);
        // 用visiblity是CSS要求占位
        if (okTip){
        	$(okTip).css('visibility', 'hidden');
        }
    },
    /**
     * 显示元素验证通过后提示，可重写自定义成功提示
     * @param {jQuery} element
     */
 
    tipPass : function(elem){
        var tipId = $(elem).attr(this.errTipName);
        if(tipId)
            $(tipId).cssDisplay(false);
    	var okTip = $(elem).attr(this.okTip);
    	if (okTip)
    		$(okTip).css('visibility', '');
    }
};

X.reg('Validator', X.ax.ValidationMgr);

})();