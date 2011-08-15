(function(X, $){
/**
 * @class Xwb
 * */
/**
 * 页面状态是否改变 默认值为true 用户自己处理逻辑改变 gModified值 onbeforeunload函数中会检测并弹出提示
 * @protected gModified
 * @type Boolean
 * */
	var doc = document,
		ui = X.ui,
		Util = X.util;
    X.gModified = true;
    
	ui.Layer.setCurrentZ(10010);
	
	ui.Dialog.prototype.focusBtnCs = 'btn-s2';
	
	if( top != self && top.Xwb && top.Xwb.cfg) {
		Xwb.cfg = top.Xwb.cfg;
		Xwb.request.basePath = Xwb.cfg.basePath;
	}
	/*	
	ui.MsgBox.getConfirmBox = function(){
		var w= this.confirmBox;
		if(!w){
			w = this.confirmBox = X.use('Dlg', {
	                appendTo:doc.body,
	                dlgContentHtml : 'AnchorDlgContent',
					cs: 'win-confirm win-fixed',
					focusBtnCs: 'btn-s2',
	                mask : true,
					closeable: false,
	                //对话框默认按钮
	                buttons : [
	                  {title: '确&nbsp;定',     id :'ok'},
	                  {title: '取&nbsp;消',     id :'cancel'}
	                ],
	                
	                setContent : function(html){
	                    this.jq('#xwb_title').html(html);
	                },
	                
	                afterHide : function(){
	                    ui.Dialog.prototype.afterHide.call(this);
	                    // 复原callback
	                    this.onbuttonclick = ui.Dialog.prototype.onbuttonclick;
	                }
	            });
		}
		return w;
	}
	ui.MsgBox.confirm = function(title, msg, callback, def ){
		var w = this.getConfirmBox(),
			btns = w.buttons,
			buttons = 'ok|cancel';
        for(var i=0,len=btns.length;i<len;i++){
            w.jq('#xwb_btn_'+btns[i].id).cssDisplay(buttons.indexOf( btns[i].id ) >= 0);
        }
        w.defBtn = def || 'ok';
        msg   && w.setContent(msg);
        callback && (w.onbuttonclick = callback);
        w.display(true);
        return w;
	}
	*/
	//后台重定义 mkUrl 
	
	X.request.mkUrl = function(module, action, queryStr, entry){
        var params = ('admin.php'||'')+'?m=' + module;
        if (action)
            params += '.' + action;

        if (queryStr){
        	params += '&';
          typeof queryStr === 'string' ?  params +=  queryStr : params+=Util.queryString(queryStr);
        }
        return this.basePath + params;
    };
    
	 window.onbeforeunload=function (e){
        if (X.gModified === false) {
            return "页面一些操作没有保存";
        }
    }
    $(function(){
        Xwb.use('action').bind(document.body);
    })
    
})(Xwb, $);
