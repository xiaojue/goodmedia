/**
 * @class Xwb.ax.Eventable
 * 事件处理模型的实现.
 * @constructor
 * @param {Object} config config object
 */
 
 
/**
 * 发送对象事件.<br>
 <pre><code>
  var e = new Eventable();
  e.on('selected', function(arg){
   //handling..
  });
  e.fire('selected', arg);
  </code></pre>
 * @method fire
 * @param {Object} eid 事件名称
 * @param {Object, Object, ...} args 传递的回调参数
 */


/**
 * 监听对象事件,如果回调函数返回false,取消后续的事件处理. <br>
 <pre><code>
   var self = {name:'cat'};
   var cfg = {message:'Good boy!'};
   var e = new Xwb.Eventable();
   e.on('selected', function(item, cfg){
    //显示an item
    alert(item.title);

    //显示Rock
    alert(this.name);

    //显示Good boy!
    alert(cfg.message);
   }, self, cfg);

   var item = {title:'an item'};
   e.fire('selected', item);
   </code></pre>
 * @param {Object} eid 事件名称
 * @param {Function} callback 事件回调函数
 * @param {Object} [ds] this范围对象
 * @param {Object} [objArgs] 传递参数,该参数将作为回调最后一个参数传递
 * @method on
 * @return this
 */

/**
 * 移除事件监听.
 * @param {Object} eid
 * @param {Function} callback
 * @method un
 * @return this
 */

/**
 * 发送一次后移除所有监听器,有些事件只通知一次的,此时可调用该方法发送事件
 * @param {Object} eid
 * @method fireOnce
 * @return this
 */

/**
 * 订阅当前对象所有事件
 * @param {Object} target 订阅者,订阅者也是可Eventable的对象
 * @method to
 * @return this
 */

    /*!
     * @cfg {Object} events 保存的事件列表,格式为
     <pre><code>
       events : {
         // names
         'eventName' : [ //Array, handler list
           // handler data
           {  
             // callback 简写
             cb : function(arguments){
               // ...
             },
             
             // <b>this</b> caller
             caller : object
           },
           ...
         ],
         ...
       }
     </code></pre>
     */

(function(X, $){

var R = X.util.arrayRemove;

var Eventable = X.ax.Eventable = (function(opt){
     if(opt)
      $.extend(this, opt);
     
     $.extend(this, Eventable.prototype);
});

Eventable.prototype = {

  fire : function(eid){
  
  	if(__debug) {console.log('发送:%o',arguments);}
  
  	if(this.events){
  		
  		var handlers = this.events[eid];
  		
  		if(handlers){
  			var fnArgs = $.makeArray(arguments),
  			    argLen, ret, i, len, oHand;
  			// remove eid the first argument
  			fnArgs.shift();
			argLen=fnArgs.length;
        
        handlers._evtLocked = true;
        
  			for(i=0,len=handlers.length;i<len;i++){
  				oHand = handlers[i];
  				
  				// 标记已删除
  				if( oHand.removed)
  				   continue;
  				// 如果注册处理中存在参数args,追加到当前参数列尾
  				if(oHand.args)
  				   fnArgs[argLen] = oHand.args;
  
  				// 如果注册处理中存在this,应用this调用处理函数
  				ret = (oHand.ds)?oHand.cb.apply(oHand.ds,fnArgs):oHand.cb.apply(this,fnArgs);
  				
  				//如果某个处理回调返回false,取消后续处理
  				if(ret === false)
  				   break;
  			}
  			
  			handlers._evtLocked = false;
  		}
  	}
  	//返回最后一个处理的函数执行结果
  	return ret;
  },
  
  on   :  function(eid,callback,ds,objArgs){
      if(!eid || !callback){
      	  if(__debug) console.trace();
          throw ('eid or callback can not be null');
      }

      
      if(!this.events)
        this.events = {};
      var hs = this.events[eid];
      if(!hs)
          hs = this.events[eid] = [];
      hs[hs.length] = {
          cb:callback,
          ds:ds,
          args:objArgs
      };
      return this;
  },
  
  un : function(eid,callback){
      if(!this.events)
        return this;
      
      if(callback === undefined){
        delete this.events[eid];
        return this;
      }
  
      var handlers = this.events[eid];
  
      if(handlers){
          // 产生迭代修改冲突，将复制新数组。
          if(handlers._evtLocked) {
             handlers = this.events[eid] = handlers.slice(0);
          }
          
          for(var i=0;i<handlers.length;i++){
              var oHand = handlers[i];
              if(oHand.cb == callback){
                  R(handlers, i);
                  // 标记删除
                  oHand.removed = true;
                  break;
              }
          }
      }
      return this;
  },
  
  fireOnce : function(eid){
    var r = this.fire.apply(this, arguments);
    this.un(eid);
    return r;
  }
};

})(Xwb, $);