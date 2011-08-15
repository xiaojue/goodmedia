/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

Xwb.use('pipeMgr')
// 个人基本资料
.reg('user.userInfoEdit', function(){
    var jq;
    return new Xwb.ax.Pagelet({
        onViewReady : function(){
            jq = this.jq();
            initProvinceData();
            Xwb.use('Validator', {
                form: $('#userinfoForm'),
                trigger : jq.find('#trig'),
                comForm : true,
                onsuccess : function( data , next){
                    var self = this;
                    Xwb.request.setProfile(data, function( e ){
                        if( e.isOk() ){
                            // apply iframe mask
                            Xwb.ui.MsgBox.getSysBox().frameMask = true;
                            Xwb.ui.MsgBox.success('', "个人设置保存成功！");
                        }else {
                            var msg = e.getMsg();
                            switch(e.getCode()){
                                case 1020104 :
                                    msg = '你输入的个人简介不能超过70个字。';
                                break;
                                
                                //权限超过限制
                                case 1040016 :
                                    msg = '抱歉，目前不允许修改个人资料，请联系网站管理员！';
                                break;
                                
                            }
                            
                            Xwb.ui.MsgBox.alert('', msg);
                        }
                        next();
                    });
                    // 非FORM提交返回false
                    return false;
                }
            });
            
            jq.find('#nick').focus();
        }
    });
    
    function initProvinceData(){
            var sel = jq.find('#province')[0], 
                selected = parseInt($(sel).attr('preval')),
                opts = sel.options;
            $.each(locationData.provinces, function(idx, v){
                var opt = document.createElement('OPTION');
                opt.text = v.name;
                opt.value = v.id;
                
                if(v.id == selected)
                    opt.selected = true;
                
                opt.setAttribute('rel', idx);
                opts[opts.length] = opt;
            });
            onProviceChange(sel);
            sel.onchange = function(){
                onProviceChange(this);
            };
    }
    
    //
    //  省市联动
    //
    function onProviceChange(sel) {
        var selCities = jq.find('#city').get(0);
        var pidx = sel.options[sel.selectedIndex].getAttribute('rel');
        
        if(pidx === null || pidx === undefined)
            return;
        
        var opts = selCities.options;
        var selected = $(selCities).attr('preval');
        
        for (var i = opts.length - 1; i >= 0; i--)
        selCities.removeChild(opts[i]);
        $.each(locationData.provinces[pidx].citys, function (idx, v) {
            for (var k in v) {
                var opt = document.createElement('OPTION');
                opt.text = v[k];
                opt.value = k;
                if(selected && selected == k){
                    $(selCities).attr('preval', '');
                    opt.selected = true;
                }
                opts[opts.length] = opt;
            }
        });
    }
})

// 编辑显示
.reg('user.displayEdit', {
	
    onViewReady : function(){
        var jq = this.jq();
        Xwb.use('Validator', {
            form:jq,
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
            }
        });
    }
})

// 提醒设置
.reg('user.noticeSetting', {
    onViewReady : function(){
        var jq = this.jq();
        Xwb.use('Validator', {
            form:jq.find('#noticeForm'),
            trigger : jq.find('#trig'),
            onsuccess : function(data, next){
                Xwb.request.updateNoticeProfile(data, function( e ){
                    if(e.isOk()){
                        Xwb.ui.MsgBox.success('', '提醒设置已保存。');
                    }else Xwb.ui.MsgBox.error('', e.getMsg());
                        
                    next();
                });
                
                return false;
            }
        });
    }
})
// 个性域名
.reg('user.settingDomain', {
        onViewReady : function(cfg){
            var ui = this.getUI();
            var jqDomain = ui.jq('#domain');
            
            if(jqDomain.length){
                var domain = cfg.data.domain;
                // 预览
                jqDomain.keyup(function(){
                    ui.jq('#domainPreview').text(domain+jqDomain.val());
                });
                
                var validator = Xwb.use('Validator', {
                    form:this.jq('#domainForm'),
                    trigger:this.jq('#domainTrig'),
                    comForm : true,
                    onsuccess:function(data, next){
                        
                    	Xwb.ui.MsgBox.confirm('提示','确认要使用这个域名吗？保存后将不能修改', function(rt){
                            if(rt=='ok'){
                            	Xwb.request.postReq(Xwb.request.apiUrl('action', 'applyDomain'), data, function(e){
		    					    if(e.isOk()){
		    					        ui.jq('#domainOk')
		    					          .cssDisplay(true)
		    					          .find('#domainUrl')
		    					          .attr('href', domain+jqDomain.val())
		    					          .text(domain+jqDomain.val());
		    					        ui.jq('#domainOk').find('#u_domain').val(domain+'i/'+jqDomain.val());
		    					        ui.jq('#domainSet').cssDisplay(false);
		    					    }else{
		    					        var errors = {
		    					            '400024':'您已设置域名，不能更改。',
		    					            '400023':'格式不正确',
		    					            '400022':'域名已被占用，请重新设置。'
		    					        };
		    					        validator.tipWarn(jqDomain, errors[e.getCode()] || e.getMsg());
		    					    }
		    					    next();
		    					});
                            } else {
                            	next();
                            }
                    	});
    					return false;
                    },
                    
                    validators:{
                        domain : function(elem, v, data, next){
                           if(v){
                                // 6至20位的英文或数字（必须包含英文字符）
                                var b = /^[a-zA-Z][0-9a-zA-Z]{5,19}$/.test(v) && /[a-z]+/i.test(v);
                                if(!b && !data.m)
                                    data.m = '6至20位的英文或数字（必须包含英文字符且不能以数字开头）';
                                this.report(b, data);
                           }else this.report(true,data);
                           
                           next();
                        }
                    }
                });
            }
            
            // 加入收藏夹
            this.jq('#addFavLink').click(function() {
                var jqUrl = ui.jq('#domainUrl');
            	if ( jqUrl.attr('href')  ) {
	            	var ctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL'; 
	            	if(document.all)
	            	    window.external.addFavorite(jqUrl.attr('href'), '我的主页 - '+document.title); 
	            	else if(window.sidebar)
	            	    window.sidebar.addPanel('我的主页 - '+document.title, $("#domainUrl").attr('href'), ""); 
	            	
	                else Xwb.ui.MsgBox.alert('提示', '您可以尝试通过快捷键' + ctrl + ' + D 加入到收藏夹~');
            	}
            	return false;
            });
            
            // 显示copyDIV
            this.jq('#showCopyDiv').click(function() {
                if ( $('#copyDiv').hasClass('hidden') ){ 
                	$('#copyDiv').removeClass('hidden');
                }else { 
                	$('#copyDiv').addClass('hidden');
                } 
            });
            
            // 邀请朋友关注
            this.jq('#copyToClipboard').click(function() {
                if (document.all){ 
                	window.clipboardData.setData('text', $('#u_domain').val());
                	Xwb.ui.MsgBox.success('提示', '链接复制成功！你可以利用快捷方式Ctrl+V键粘贴到UC、QQ或MSN等聊天工具中');
                }else { 
            	   Xwb.ui.MsgBox.alert('提示', '您的浏览器不支持脚本复制或你拒绝了浏览器安全确认，请尝试手动[Ctrl+C]复制。'); 
                } 
            });
        }
})
// 账号设置
.reg('user.accountSetting', {
    onViewReady : function(){
        this.jq('#unbind').click(function(){
            var href = this.href;
            Xwb.ui.MsgBox.confirm('取消绑定',"你确定要取消当前绑定关系吗？", function(rt){
                if(rt === 'ok')
                    location.href = href;
            });
            return false;
        });
    }
})

// 标签设置
.reg('user.userTagEdit', {
    onViewReady : function(){
        var maxTag = 10;
        var focusText = '选择最适合你的词语，多个请用空格分开';
        var jq = this.jq();
        
        function getTagCount(){
            return jq.find('#tagList li').length;
        }
        
        jq.find('#tagInputor').focusText(focusText, 'blur-txt', false, true);
        
        // 点击后空输入提示信息
        // 不并入验证器是因为避免由于失去焦点而输出该提示
        jq.find('#trig').click(function(){
            var v = $.trim(jq.find('#tagInputor').val());
            if(!v || v === focusText){
                jq.find('#tip').cssDisplay(true).text('请至少输入一个标签');
            }
        });
        
        var tagValidtor = Xwb.use('Validator', {
            form : jq.find('#tagForm'),
            trigger : jq.find('#trig'),
            comForm : true,
            onsuccess : function(data, next){
                // 其它分隔符统一换成','
                var tags = data.tags.replace(/,|;|\uFF0C|\uFF1B|\u3001|\s/,',');
                Xwb.request.createTags(data.tags, function( e ){
                    if( e.isOk() ){
                        Xwb.ui.MsgBox.tipOk("标签创建成功！");
                        setTimeout(function(){location.reload();}, 1000);
                    }else jq.find('#tip').cssDisplay(true).text(e.getMsg());
                        
                    next();
                });
                // 非FORM提交返回false
                return false;
            },
            
            validators : {
                checktag : function(elem, v, data, next){
                    var charReg = /^(,|;|\uFF0C|\uFF1B|\u3001|\s|\w|[\u4E00-\u9FA5\uFF00-\uFFFF])*$/,
                        pass = true, msg,
                        tags = v.split(/,|;|\uFF0C|\uFF1B|\u3001|\s/),
                        sz = getTagCount() + tags.length <= maxTag;
                    
                    // 非法字符检测
                    if(!charReg.test(v)){
                        pass = false;
                        msg  = '含有非法字符，请修改';
                    }else if(!sz){
                        pass = false;
                        msg = '您已添加'+maxTag+'个标签，达到标签上限';
                    }else {
                        for(var k=0,len=tags.length;k<len;k++){
                            var tlen = Xwb.util.byteLen(tags[k]);
                            if(tlen>14){
                                msg = '单个标签长度不多于7个汉字或14个字母';
                                pass = false;
                            }
                        }
                    }
                    
                    if(!pass)
                        data.m = msg;
                    this.report(pass, data);
                    next();
                }
            }
        });

        Xwb.use('ActionMgr')
           .bind( jq )
           // 直接添加新标签
           .reg('ct', function(e){
                if(!jq.find('#tabListPanel').cssDisplay())
                    jq.find('#tabListPanel').cssDisplay(true);

                var tag = e.get('t');
                if(getTagCount() == maxTag){
                    Xwb.ui.MsgBox.tipWarn('您已添加'+maxTag+'个标签，达到标签上限');
                    return;
                }
                jq.find('#tip').cssDisplay(false);
                e.lock(1);
                var el = e.src;
                Xwb.request.createTags(tag, function( ee ){
                    if( ee.isOk() ){
                        if(ee.getData().data.length){
                            $(el).remove();
                            $('<li><a class="a1" href="'+
                                Xwb.request.mkUrl('search', 'user&k='+encodeURIComponent(tag))+'&ut=tags">'
                                  +tag+'</a><a class="close-icon icon-bg" rel="e:dt,id:'+ee.getData().data[0].tagid+'" href="#"></a></li>')
                             .appendTo('#tagList');
                        }
                    }else Xwb.ui.MsgBox.alert(ee.getMsg());
                    e.lock(0);
                });
           })
           // 移除TAG
           .reg('dt', function(e){
                var id = e.get('id'), jqEl = $(e.src);
                e.lock(1);
                Xwb.request.delTag(id, function(ee){
                    if(ee.isOk()){
                        jqEl.parent().remove();
                        if(!getTagCount()){
                            jq.find('#tabListPanel').cssDisplay(false);
                        }
                    }else Xwb.ui.MsgBox.alert(ee.getMsg());
                    e.lock(0);
                });
           });
    }
});