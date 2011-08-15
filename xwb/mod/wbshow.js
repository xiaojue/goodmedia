/*!
 * X weibo JavaScript Library v1.1
 * http://x.weibo.com/
 * 
 * Copyright 2010 SINA Inc.
 * Date: 2010/10/28 21:22:06
 */

/**
 *  后台组件设置-微博秀页面
 */
$(function(){
    var Box = Xwb.ui.MsgBox;
    // 返回form元素的查询字符串表示
    function formQuery(f) {
        var formData = "", elem = "", qid;
        var elements = f.elements;
        var length = elements.length;
        for (var s = 0; s < length; s++) {
            elem = elements[s];
            
            // 忽略输出的textarea元素
            if(elem.id === 'output')
                continue;

            if (elem.tagName === 'INPUT') {
                if (elem.type === 'radio' || elem.type === 'checkbox') {
                    if (!elem.checked) {
                        continue;
                    }
                }
            }
            
            qid = elem.name||elem.id;
            
            if(qid){
	            if (formData != "") {
	                formData += "&";
	            }
	            
	            formData += encodeURIComponent(elem.name||elem.id) + "=" + encodeURIComponent(elem.value);
            }
        }
        return formData;
    }

    var previewForm   = document.getElementById('styleForm');
    var iframe     = document.getElementById('export');
    var textarea   = document.getElementById('output');
    
    function buildUrl(){
        var qs = formQuery(previewForm);
        var url = gPreviewUrl;
        url += ( url.indexOf('?') !== -1 ? '&'+qs : '?'+qs ) + '&_=' + new Date().valueOf();
        // auto width
        var autoWidth = $('#chkAutoWidth').attr('checked');
        if(autoWidth)
            url = url.replace(/&width=(\d*)/, '&width=0');
        var width  = autoWidth?'100%':$.trim($('#iptAutoWidth').val());
        var height = $.trim($('#viewHeight').val());
        textarea.value = 
            '<iframe class="exp-main" id="export" name="export" frameborder="0" width="'+width+'" height="'+height+'" src="'+url+'"  scrolling="no"></iframe>';
        iframe.width = width;
        iframe.height = height;
        return url;     
    }
    // 
    //  重建预览
    //
    function buildReview(){
        iframe.src = buildUrl();
    }
    
    
    // switch skin panel
    
    var jqSkinPanel = $('#skinPanel').click(function(e){
        var jqLink = $(e.target).closest('a');
        if(jqLink.length){
            jqSkinPanel.find('.on').removeClass('on');
            var jqSpan = jqLink.find('span');
            jqLink.addClass('on');
            var type = parseInt(jqSpan.attr('className').match(/color0*([\d]+)\s*/i)[1]);
            $('#skinType').val(type);
            setTimeout(buildReview, 0);
            return false;
        }
    });
    
    $('#getCode').click(function(){
        var txt = $.trim($('#output').val());
        if(window.clipboardData) {
            if(clipboardData.setData("Text", txt) !== false) 
                Box.alert('提示',"代码已复制至粘贴版。"); 
        }else { 
            Box.alert('提示','您的浏览器禁止自动复制，请手动复制。'); 
            $('#output')[0].select();
        } 
        return false;
    });
    
    // 绑定事件
    var elems = previewForm.elements;
    
    for(var i=0,len=elems.length;i<len;i++){
        var elem = elems[i];
        if(elem.type.toLowerCase() == 'checkbox') { 
        	elem.onclick =  buildReview;
        	continue;
        }
        if(elem.name !== 'output')
            elem.onchange = buildReview;
    }
    
    new Xwb.ax.ValidationMgr({
        form:previewForm,
        onerror : function(elem, data){
            data.m && Box.alert('提示',data.m);
        },
        validators : {
            dimention : function(elem , v, data, next){
                switch(elem.name){
                    case 'width' :
                        var ret = true;
                        if(!$('#chkAutoWidth').attr('checked')){
                            if(!v){
                                data.m = '请输入有效宽度';
                                ret = false;
                            }else if(!/^\d+$/.test(v)){
                                data.m = '请输入数字';
                                ret = false;
                            }else {
                                v = parseInt(v);
                                if( v < 190 || v > 1024){
                                    ret = false;
                                    data.m = '宽度:190-1024px';
                                }
                            }
                        }
                        this.report(ret, data);
                        break;
                     case 'height' : 
                        var ret = true;
                        if(!v){
                            data.m = '请输入有效宽度';
                            ret = false;
                        }else if(!/^\d+$/.test(v)){
                            data.m = '请输入数字';
                            ret = false;
                        }else {
                            v = parseInt(v);
                            if( v < 75 || v > 800){
                                ret = false;
                                data.m = '高度:75-800px';
                            }
                        }
                        this.report(ret, data);
                        break;
                }
                next();
            }
        }
    });
    
    $('#chkAutoWidth').click(function(){
        var b = this.checked;
		if(b)
			$('#iptAutoWidth').addClass('input-disabled').attr('disabled',b).focus();
		else 
			$('#iptAutoWidth').removeClass('input-disabled').attr('disabled',b).focus();
        buildUrl();
    });
});