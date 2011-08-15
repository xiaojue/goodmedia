/*!
 *  我的评论页交互
 */
(function(X, $){
    
    var 
        ui   = X.ui,
        Util = X.util, 
        Base = ui.Base,
        Req  = X.request,
        MB   = ui.MsgBox;

    X.mod.MyCmt = X.reg('MyCmt', Util.create(Base, {
        
        actionMgr : true,
        
        afterNofocus : true, //评论后不再聚焦
        
        innerViewReady : function(v){
            Base.prototype.innerViewReady.call(this,v);
            this.jqExtra('cmtCt');
            var self = this;
            this.jqCmtCt.find('li').each(function(){
                $(this).hover(self.onItemMouseover, self.onItemMouseout);
            });
        },
        
        onItemMouseover : function(){
            var jqDel = $(this).data('dlEl');
            if(!jqDel){
                jqDel = $(this).find('a[rel=e:dl]');
                $(this).data('dlEl', jqDel);
            }
            jqDel.cssDisplay(true);
        },
        
        onItemMouseout  : function(){
            var jqDel = $(this).data('dlEl');
            if(!jqDel){
                jqDel = $(this).find('a[rel=e:dl]');
                $(this).data('dlEl', jqDel);
            }
            jqDel.cssDisplay(false);        
        },
        
        onactiontrig : function(e){
            switch(e.data.e){
                // 全选
                case 'sa':
                    var checked = e.src.checked;
                    this.selectAll(checked);
                    e.preventDefault(false);
                break;
                
                // 删除所有
                case 'da':
                    this.delSelected();
                break;
                
                // 回复
                case 'rp':
                    var el = e.jq('c', '#cmtBoxCt');
                    var cid = e.get('c'), 
                        wid = e.get('w'),
                        nick = e.get('n');
                    this.getCmtBox().jq().insertAfter(el);
                    this.reply(wid, cid, nick);
                break;
                
                // 删除单条评论
                case 'dl':
                    this.delCmt(e);
                break;
            }
        },
        
        // interface, cmtBox接口
        afterSend : function(e){
            this.jqCmtCt.prepend( $(this.createCmtUI(e.getData().comment)) ).cssDisplay(true);
            this.cmtBox.display(false);
        },
        
        // interface, cmtBox接口
        postWeibo : $.noop,
        
        selectAll : function(b){
            this.jq('li label input:checkbox[rel=cdl],input:checkbox[rel=e:sa]').each(function(){
                    if(!this.disabled)
                        this.checked = b;
            });
        },
        
        delSelected : function(){
            var sels = [], 
                stopEl = this.jqCmtCt[0];
            this.jqCmtCt.find('li label input:checkbox[rel=cdl]').each(function(){
                if(this.checked)
                    sels.push(X.ax.ActionMgr.getRel(this,'c',stopEl));
            });
            
            if(sels.length){
                MB.confirm('', '确定删除所有选择评论？', Util.bind(function(id){
                    if(id=='ok'){
                        Req.delComment(sels.join(','), function(){
                            location.reload();
                        });
                    }
                }, this));
            }
        },
        
        getCmtBox : function(){
            if(!this.cmtBox){
                this.cmtBox = X.use('CmtBox', {
                   pCt  : this,
                   view : 'MBCmtBox'
                });
                this.cmtBox.getView();
            }
            return this.cmtBox;
        },
        
        reply : function(wbId, cmtId, nick){
            var box = this.getCmtBox();
            box.wbId = wbId;
            box.selectionHolder.setText('');
            box.jqInputor.css('height','');
            box.display(true)
               .reply(cmtId, nick);
        },
        
        delCmt : function(e){
            var cmtId = e.get('c'), 
                anchorEl = e.src, 
                itemElem = e.getEl('c');
            MB.anchorConfirm(anchorEl, '确定要删除该回复吗？', function(id){
                if(id=='ok'){
                        e.lock(1);
                        Req.delComment(cmtId, function(ret){
                            if(ret.isOk()){
                                if(itemElem){
            						$(itemElem).slideUp(500, function() {
            						    e.lock(0);
            							$(itemElem).remove();
            						});
                                }
                                else location.reload();
                            }else {
                                MB.tipError(ret.getMsg());
                                e.lock(0);
                            }
                        });
                }
            });
        },
        
        createCmtUI : function(cmt){
            MB.tipOk('回复成功！');
        }
    }));
})(Xwb, $);

