/**
 *  @class Xwb.ax.SelectionHolder
 *  本类主要解决IE下文本输入框内文本选择，替换和插入等问题。<br/>
 *　例如发布微博框在IE６下，先在文本框内选择一段文字，再从表情选择框内选择一个表情插入到文本框，
 *  通常在这种情况下表情不能很好的直接插在文字选择处，而是追加到文本尾部。
 *  利用本类可忽略其中的兼容处理，直接调用类方法即可解决问题。<br/>
 *  对于使用该类实例封装后的输入框元素，会在元素的jQuery缓存xwb_selholder键保存指向该实例的引用。
 * @constructor
 * @param {Object} config
 */
 /**@cfg {HTMLElement} elem 关联的文件框*/
 
(function(X, Util, $){

    X.ax.SelectionHolder = function(opt){
        $.extend(this, opt);
        if(!Util.hasSelectionSupport())
            this.initEvent(this.elem);
    };
    
    X.ax.SelectionHolder.prototype = {
        
        pos : -1,
        
        length : 0,
        
        initEvent : function(){
            var self = this;
            var fn = function(){
                try{
                    self.saveSpot();
                }catch(e){}
            };
            $(this.elem)
              .mouseup(fn)
              .keyup(fn)
              .data('xwb_selholder', this);
        },
        /**
         *  保存输入框当前选择状态和光标位置等信息，
         *  这个一般情况下不会用到，除非你不能确定是否由外部其它途径更新了输入框状态。
         */
        saveSpot : function(){
            var elem = this.elem;
            this.pos    = Util.getCursorPos(elem);
            this.length = Util.getSelectionText(elem).length;
        },
        /**
         *  往输入框当前光标处插入一段文本
         *  @param {String} text
         */
        insertText : function(text){
            var elem = this.elem, 
                val  = elem.value;
            if(Util.hasSelectionSupport()){
                Util.replaceSelection(elem, text);
            }else {
                // append
                if(this.pos === -1){
                    elem.value = val + text;
                    Util.focusEnd(elem);
                }else {
                    elem.value = Util.stringReplace(val, text, this.pos, this.pos+this.length);
                    Util.setCursor(elem, this.pos+text.length);  
                }
            }
            this.saveSpot();
        },
        
        /**
         *设置选择框文本
         * @param {String} text
         */
        setText : function(text){
            this.elem.value = text;
            try{
                this.focusEnd();
            }catch(e){}
        },
        /**清除选择框状态信息*/
        clearSpot : function(){
            this.length = 0;
            this.pos = -1;
        },
        /**将光标定位至文本框末尾*/
        focusEnd : function(){
            Util.focusEnd(this.elem);
            this.saveSpot();
        },
        /**将光标定位至文本框开始位置*/
        focusStart : function(){
            Util.setCursor(this.elem, 0);
            this.saveSpot();
        },
        replaceString : function(text,from,to){
    		this.elem.value = Util.stringReplace(this.elem.value,text,from,to);
			Util.setCursor(this.elem , from + text.length );
			this.saveSpot();
        }
    };

    X.reg('SelectionHolder', X.ax.SelectionHolder);

})(Xwb, Xwb.util, $);