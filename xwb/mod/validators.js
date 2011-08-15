(function(X, $){
/**
 * @class Xwb.mod.Validators
 * 常用表单验证器集合
 */


Xwb.ax.ValidationMgr.prototype

/**
 * @event ft
 * 获得焦点时清空提示，失去焦点时出现提示效果
 * _ft|ft结合使用，_ft在表单初始化时绑定focus/blur事件。
 * ft在验证时假如元素值为默认提示字符串时，设置验证元素值为空。<br/>
 * _ft时调用jq.focusText方法创建效果
 * 当字段必须时，使用ne检测，
 * 当字段非必须时，使用ft检测
 * 用法可参见“意见反馈”对话框表单
* <pre><code>
    // 下面作用是，元素失焦时显示“邮箱地址”，聚焦时清空元素值。
    // 当显示“邮箱地址”时，并不影响元素实际“空”值。
    &lt;input type=&quot;text&quot; value=&quot;邮箱地址&quot; name=&quot;mail&quot; class=&quot;input-define&quot; warntip=&quot;#feedbackTip&quot; vrel=&quot;_ft|ft|mail&quot;&gt;
 </code></pre>
 */
.reg('ft', function(elem, v, data, next){
    // 初始化时
    if(arguments.length == 2){
        var text = elem.value||arguments[1].w;
        $(elem).data('vrel_ft_text', text).focusText(text);
    }else {
        // 验证时
        var text = $(elem).data('vrel_ft_text');
        // args:elem, v, data, next
        // 当条件满足时，重置为空值
        if(v == text)
            this.setValue('');
            
        this.report(true, data);
        next();
    }
})

/**
 * @event ne
 * 空检测，标记作为元素必须字段。
 * <pre>
   vrel="ne=w:在这里输入名称,m:请输入昵称"
 * </pre>
 * @param {String} [m] 出错提示文字
 */
.reg('ne', function(elem, v, data, next){
    
    var em = v === '';
    var text = $(elem).data('vrel_ft_text') || data.w;
    if( !em && text ){
        em = v == text;
        // 重置为空，防停留字干扰后来的验证器
        if(em)
            this.setValue('');
    }

    if(em && !data.m)
        data.m = '该项不能为空';

    if (elem.tagName === 'INPUT' && ( elem.type === 'radio' || elem.type === 'checkbox' )) 
        em = !elem.checked;
        
    this.report(!em, data);

    next();
})

/**
 * @event f
 * 失去焦点时验证元素
 * <pre>
    // 失去焦点时验证元素是否为空
    vrel="_f|ne"
 * </pre>
 */
.reg('f', function(elem, data){
    var chain = this;
    var tn = elem.tagName.toLowerCase();
    if(chain.context.comForm && (tn == 'input' || tn == 'textarea')){//设置焦点样式
    	var fc = chain.context.focusCss;
	    $(elem).blur(function(){
	    	$(this).removeClass(fc);
	    	if(!data.ch)//失去焦点检测
	        	chain.validate();
	    }).focus(function(){
	    	$(this).removeClass(chain.context.errCss);
	    	$(this).addClass(fc);
	    });
    }else{
	    $(elem).blur(function(){
	        chain.validate();
	    });
    }
})

/**
 * @event sz
 * 检测输入字符长度
 * 属性：
    <div class="mdetail-params">
    <ul>
    <li>max=number，允许最大字节长度</li>
    <li>min=number，允许最小字节长度</li>
    <li>ww, wide code缩写，将长度按宽字符计算，一个汉字两个字节长度</li>
    <li></li>
    </ul>
    </div>
    例：
    <pre>
        sz=max:6,min:4,m:最少两个汉字，最多三个汉字,ww
    </pre>
 * @param {Number} max 最大长度
 * @param {Number} min 最小长度
 * @param {Boolean} ww 取值1或0，指明长度单位是否按宽字符长度计算，宽字符单位为2，一个字两个字母
 */
.reg('sz', function(elem, v, data, next){
    // 允许空
   if(v){
       var len = data.ww ? Xwb.util.byteLen(v) : v.length,
           err, 
           max = data.max, 
           min = data.min;
       if(max !== undefined && parseInt(max) < len)
            err = true;
       if(min !== undefined && parseInt(min)>len)
            err = true;
       this.report(!err, data);
   }else this.report(true, data);
   
   next();
})
/**
 * @event dt
 * 检查是否有效的日期格式
 * <pre><code>
 * vrel="dt"
 * </code></pre>
 */

.reg('dt', function(elem, v, data, next){
    if(v){
        if(!data.m)
            data.m = '不是有效的日期格式';
        var d = Date.parse(v);
        // 可以在这扩展max,min等
        this.report(!isNaN(d), data);
    }else this.report(true, data);
    next();
})
/**
 * @event mail
 * 验证是否为邮箱格式
 * <pre><code>
 * vrel="mail"
 * </code></pre>
 */

.reg('mail', function(elem, v, data, next){
    if(v){
    	var result = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(v);
        if(!data.m && data.m !== 0)
            data.m = '请输入正确的邮箱格式';
    	this.report(result, data);
    }else this.report(true, data);
	next();
})
/**
 * @event int
 * 验证是否为数字格式
 * <pre><code>
 * vrel="int|sz=max:5,min:1"
 * </code></pre>
 */

.reg('int', function(elem, v, data, next) {
    if(v !== ''){
    	var result = v && /^\d+$/.test(v);
        if(!data.m && data.m !== 0)
            data.m = '该项为数字格式';
    	this.report(result, data);
    }else this.report(true, data);
	next();
})

/**
 * @event bt
 * 验证是值是否在某个整数范围内
 * <pre><code>
 * vrel="bt=max:1000,min:1"
 * </code></pre>
 * @param {Number} max 
 * @param {Number} min
 */

.reg('bt', function(elem, v, data, next) {
    if(v !== ''){
    	var min = parseInt(data.min),
    		max = parseInt(data.max),
    		v = parseInt(v),
    		err = 0;
    
    	if (v < min)
    		err = 1;
    
    	if (!err && (v > max))
    		err = 2
    
    	this.report(!err, data);
    }else this.report(true, data);
	next();
})
/**
 * @event sinan
 * 检查昵称是否为非法字符。非法字符指除中英文、数字、"_"或减号符号外的所有字符
 * <pre><code>
 * vrel="sinan"
 * </code></pre>
 */

.reg('sinan', function(elem, v, data, next){
    if(v){
        if(!data.m)
            data.m = '支持中英文、数字、"_"或减号';
        this.report(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(v), data);
    }else this.report(true, data);
    next();
});

})(Xwb, $);