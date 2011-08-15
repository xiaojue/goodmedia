(function(){
    var X = Xwb;

    
    window.MicroAdmin = {
        
        add : function(trig, type){
            var tr = $(trig).closest('tr');
            var hd = tr.find('input');
			var allInput = $('.add-table input[id=_holder]') , flag =true;
			  allInput.each(function(){
				if(this.value === hd.val()){
					tr.find('.tips-error').text('主持人或嘉宾已存在').cssDisplay(true);
					flag = false;
					hd.focus(function(){
						tr.find('.tips-error').cssDisplay(false);
					});
					return false;
				}
			  });
			  if(!flag) return ;
            var newHd = $([
            '<table><tr>',
            	'<td><span class="user-pic"><img src="'+gUsrImgUrl+'" /></span></td>',
                '<td onclick="MicroAdmin.edit(this)"><p title="点击编辑" class="text" class="hidden"></p><input type="text" class="input-txt txt-s1" id="_holder" onblur="MicroAdmin.valdate(this);" vrel="username"><input type="hidden" name="'+type+'[]" id="master" /><span class="tips-error hidden" id="masterTip">该用户不存在</span></td>',
                '<td><a class="icon-edit" href="#" onclick="MicroAdmin.edit(this);return false;">编辑</a> <a class="icon-del" href="#" onclick="MicroAdmin.del(this);return false;">删除</a></td>',
            '</tr></table>'
            ].join(''))
              .find('tr')
              .detach()
              .insertBefore(tr)
              .find('#_holder');
            if(!hd.val())
                newHd.focus();
            else {
                newHd.val(hd.val());
                this.valdate(newHd[0]);
            }
            hd.val('');
            tr.find('.tips-error').cssDisplay(false);
        },
        
        valdate : function(elem){
            this.validator.validateElement(elem);
        },
        
        del : function(trig){
            $(trig).closest('tr').remove();
        },
        
        edit : function(trig){
            var tr = $(trig).closest('tr');
            var input = tr.find('#_holder');
            if(!input.cssDisplay()){
                tr.find('p').cssDisplay(false);
                input.val(tr.find('p').text()).cssDisplay(true);
            }
            setTimeout(function(){ input.focus(); },0);
        },
        
        endEdit : function(trig){
            var tr = $(trig).closest('tr');
            var val = tr.find('#_holder').cssDisplay(false).val();
            tr.find('p').text(val).cssDisplay(true);
        },
        
        checkInput : function(trig, callback){
            var tr = $(trig).closest('tr');
            var input = tr.find('#_holder');
            var u = $.trim(input.val());
            var self = this;
			var allInput = $('.add-table input[id=_holder]') , flag =true;
			  allInput.each(function(){
				if(this !== input[0] && this.value === input.val()){
					tr.find('.tips-error').text('主持人或嘉宾已存在').cssDisplay(true);
					callback && callback(false);
					flag = false;
					return false;
				}
			  });
			  if(!flag) return ;
            if(u){

                    input.attr('disabled', true);
                    X.request.postReq(gReqUserUrl, {names:u}, function(r){
                        if(r.isOk()){
                            tr.find('.user-pic img').attr('src', r.getData().profile_image_url);
                            tr.find('.tips-error').cssDisplay(false);
                            tr.find('input[type=hidden]').val(r.getData().id);
                            MicroAdmin.endEdit(trig);
                            callback && callback(true);
                        }else {
                            var msg = {
                                '1050000':'该用户不存在'
                            };
                            tr.find('.tips-error').text(msg[r.getCode()] || r.getMsg()).cssDisplay(true);
                            tr.find('input[type=hidden]').val('');
                            callback && callback(false);
                        }
                        input.attr('disabled', false);
                        tr.closest('table').find('#addCol .tips-error').cssDisplay(false);
                    });
            }else { 
                $(input).closest('.user-item').find('input[type=hidden]').val('');
                tr.find('.tips-error').cssDisplay(false);
                MicroAdmin.endEdit(trig);
                callback && callback(true);
            }
        },
        
        upload : function(trig){
            var uploadMgr = $(trig).data('mgr');
            var form = $(trig).closest('form');
            if(!uploadMgr){
                uploadMgr = X.use('Uploader', {
                    form:form, 
                    onload : function(r){
                        if(r.isOk()){
                            $('#'+trig.id+'Img').val(r.getData().filepath);
                            form.find('img').attr('src',r.getData().pic);
                            form.find('.form-tips').text('');
                            form.find('.tips-error').cssDisplay(false);
                        }else {
                            form.find('.tips-error').text(r.getMsg()).cssDisplay(true);
                        }
                    },
                    
                    beforeUpload : function(jqForm){
                        var fn = jqForm.find('input[type=file]').val();
                        if( !fn ) return false;
                        if( !this.checkImg(fn) ){
                            jqForm[0].reset();
                            jqForm.find('.tips-error').text('只支持 jpg、png、gif格式的图片。').cssDisplay(true);
                            return false;
                        }
                        jqForm.find('.tips-error').cssDisplay(false);
                        jqForm.find('.form-tips').text('上传中...');
                    },
                    
                    checkImg : function(fileName){
                		var pieces = fileName.split('.');
                		return pieces.length && $.inArray(pieces.pop().toLowerCase(), ['jpg', 'png', 'gif','jpeg']) !== -1;
                    }
                });
                $(trig).data('mgr', uploadMgr);
            }
            
            if(uploadMgr.isLoading())
                uploadMgr.abort();
            uploadMgr.upload();
        }
    };
})();
