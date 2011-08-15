Xwb.reg('contextMgr', function(){
    
    var X = Xwb;
    var Util = X.util;
    var doc  = document;
    
    var contextMgr = {
    
    	context : function(comp){
    
    		if(comp.contexted)
    			this.release(comp);
    
    		var q = this.q;
    		if(!q)
    			this.q = q = [];
    
    	    if(!q.length)
    	        $(doc).mousedown(this._getDocEvtHandler());
    	  
    	    q[q.length] = comp;
    	  
    	    this._setCompEvtHandler(comp, true);
    	    comp.contexted = true;
    	    if(__debug) console.log('contexted', comp);
    	},
    	
    	release : function(comp, e){
    		comp.contexted = false;
    		if( comp.onContextRelease(e) !== false ) {
        		this._setCompEvtHandler(comp, false);
        		Util.arrayRemove(this.q, comp);
    			if(!this.q.length)
    			    $(doc).unbind('mousedown', this._getDocEvtHandler());
    		} else comp.contexted = true;
    		
    		if(__debug) console.log('release context', comp);
    	},
    /*!
     * 释放所有已上下文绑定的控件，释放对于传递事件event由控件自身或控件子结点发出控件无效。
     * @param {DOMEvent} [event] 如果释放由DOM事件引发，传递该事件，如果事件由控件发出，包括子结点，则取消释放该控件。
     */
    	releaseAll : function(e){
    		var q = this.q;
    		if (q) {
    			var len = q.length;
    			if(e)
    			    var src = e.target;
    			for (var s = len - 1; s >= 0; s--) {
    				if(!src || !q[s].ancestorOf(src))
    				    this.release(q[s], e);
    			}
    		}
    	},
    	
    	_setCompEvtHandler : function(comp, set){
    		set ? comp.domEvent('mousedown', this._compEvtStopHandler)
    		    : comp.unDomEvent('mousedown', this._compEvtHandler);
    	},
    	
    	_getDocEvtHandler : function(){
    		 var hd = this.docEvtHd;
    		 if(!hd)
    		 	hd = this.docEvtHd = Util.bind(this._docHandler, this);
    		 return hd;
    	},
    
    	_releaseFollower : function(curr, e){
    		var q = this.q;
    		if(q){
    			var last = q.length - 1;
    			// not the last one itself
    			if(last !== -1 && q[last] !== curr){
    				var len = last;
    				for(;last>=0;last--){
    					if(q[last] === curr)
    						break;
    				  this.release(q[last], e);
    				}
    		  }
    		}
    	},
    	
    	// component mouse down handler & stop event
    	// scope : component	
    	_compEvtStopHandler : function(e){
    		if(e.target.nodeName == 'SELECT' || e.target.nodeName == 'INPUT')
    			return true; 
    	    contextMgr._releaseFollower(this, e);
            return false;
        },
        
    	// component mouse down handler
    	// scope : component
    	_compEvtHandler : function(e){
    		// cancel 后来者
    		contextMgr._releaseFollower(this, e);
    	},
    	
    	// document mouse down handler
    	_docHandler : function(e){
    		this.releaseAll(e);
    	}
    };
    
    X.ax.contextMgr = contextMgr;
    X.reg('contextMgr', contextMgr, true);
    
    return contextMgr;
});