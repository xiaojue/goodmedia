/*!
 * X weibo JavaScript Library v1.3
 * http://x.weibo.com/
 * 
 * Copyright 2011 SINA Inc.
 */

// 用户注册成功后显示的页面，引导用户关注
(function(X, $){
    // 当前选择tab
    var current;
    var jq;
    X.use('pipeMgr')
     .reg('user.guide', {
        ui : {
            actionMgr:true,
            onactiontrig:function(e){
                    var trig = e.src;
                    switch(e.data.e){
                        // 选择关注
                        case 'ck' :
                        	var aTrig = jq.find('#cate_menu .current');
                            this.checkCheckion(aTrig.data('panel'));
                            // 让checkbox可选
                            e.preventDefault(false);
                        break;
                        // 全选
                        case 'sa':
                           var checked = trig.checked;
                           var aTrig = jq.find('#cate_menu .current');
                            var item = aTrig.data('panel'),input=[];
                            $(item).each(function(){
                            	if( $(this).find('.addfollow-btn').length ){
                            		input.push($(this).find('input')[0]);
                            	}
                            })
                            $(input).attr('checked',checked);
                           jq.find('.select-user .all span').text(checked?input.length:0);
                           // 让checkbox可选
                           e.preventDefault(false);
                        break;
                        // tab选择
                        case 'tab':
                            if(current != trig){
                                if(current){
                                  var panel =  
                                    $(current)
                                    .removeClass('current')
                                    .data('panel');
                                  if(panel)
                                    panel.cssDisplay(false);
                                }
                                current = trig;
                            }
                            
                            var jqTrig = $(trig),
                                self = this,
                                a = jqTrig.attr('tagName') == 'A' ? jqTrig:  jqTrig.find('a');

                            
                            jqTrig.addClass('current');
                            if(!jqTrig.data('loaded')){
                                e.lock(1);
                                Xwb.request.q(a.attr('href'), {}, function(r){
                                    if(r.isOk()){
                                        var html = r.getData();
                                        var jqPanel = $(html);
                                        //jqPanel.insertBefore(jq.find('.user-list-narrow .select-user'));
										jq.find('div.user-list-wrap').append(jqPanel);
                                        jqTrig.data('panel', jqPanel)
                                              .data('loaded', true);
                                        self.checkCheckion(jqPanel);
                                        var item = jqPanel,input=[];
                                        $(item).each(function(){
                                        	if( $(this).find('.addfollow-btn').length ){
                                        		input.push($(this).find('input')[0]);
                                        	}
                                        })
                                        $(input).attr('checked',true);
                                        jq.find('.select-user .all span').text(input.length);
                                    }
                                    e.lock(0);
                                });
                            }else {
                                jqPanel = jqTrig.data('panel');
                                jqPanel.cssDisplay(true);
                                self.checkCheckion(jqPanel);
                                var item = jqPanel,input=[];
                                $(item).each(function(){
                                	if( $(this).find('.addfollow-btn').length ){
                                		input.push($(this).find('input')[0]);
                                	}
                                })
                                $(input).attr('checked',true);
                                jq.find('.select-user .all span').text(input.length);
                            }
                            jq.find('.select-user .all input').attr('checked',true);
                        break;
                        // 关注他们，开始微博
                        case 'submit':
                            var ids = [],rel,
                            	aTrig = jq.find('#cate_menu .current'),
                            	cks = aTrig.data('panel').find('input[type=checkbox]');
                            cks.each(function(){
                                rel = X.ax.ActionMgr.wrapRel(this);
                                ids.push(rel.get('u'));
                            });
                            e.lock(1);
                            if(!ids.length){
                                location.href = e.src.href;
                            }else {
                                X.request.follow(ids.join(','), 0, function(r){
                                    location.href = e.src.href;
                                    e.lock(0);
                                });
                            }
                        break;
                        // 留给上层处理
                        default:
                            e.stopPropagation(false);
                        break;
                    }
            },
            onViewReady : function(){
                jq = this.jq();
                // 手动触发action，加载第一页
                this.actionMgr.doAct(this.jq('#cate_menu .current')[0], this.getView());
            },
            
            checkCheckion : function(jqPanel){
                // 是否已全选
                var count = 0;
                var cks = jqPanel.find('input[type=checkbox]');
                cks.each(function(){
                        if(this.checked)
                            count++;
                });
                jq.find('.select-user .all span').text(count);
            }
        }
     });
})(Xwb, $);