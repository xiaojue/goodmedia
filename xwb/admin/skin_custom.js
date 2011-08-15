(function(X, $){
$(function(){
var ui = X.ui;
var FALSE = false;
var TRUE  = true;
var Util  = X.util;
var Req = X.request;
var Box = X.ui.MsgBox;
var doc = document;
     ui.skin = {
    	actionMgr:true
    	,uploaded : false
    	,skinSelectedCS : 'current'
    	,colorSelectInit : false
    	,colorSelectId : 'csArea'
    	,colorInput    : 'colorshow'
    	,colorHiddenId : 'colorSelector'
    	,backCur : 'cur' 
    	,parseRel : Xwb.ax.ActionMgr.parseRel
    	,jq : function(q){
    		return this.view.find(q);
    	}
    	,onViewReady : function(){
    		    this.view = $('#skinSet');
    		    if(this.view.length == 0) return;
	    		this.back_form = this.jq('#xwb_back_form');
	    		this.jqForm = this.back_form[0];
	    		this.back_file = this.jq('#xwb_back_file');
	    		this.pwImg = this.jq('#previewImg');
	    		var self = this;

	    		this.custom = true;//是否自定义皮肤
	    		this.back_file.change(function(){self.change(this.value)});	    		
	    		
	    		//初始化选择color
	    		this.backInit();
	    }
	    
	    
    	//点击backLists
		,backPage : 1  //在第几页
    	,allBackPage : 2 //总共多少页 
    	,curSelect : 1  //选中的 
    	,disableClsl : 'arrow-l-s1-disabled' 
    	,disableClsr : 'arrow-r-s1-disabled'
    	,slidePx : 300
    	,minus : 0
    	,ulPx : 0
    	,ulId : 'scheme-select'
    	,sliding : false
    	,selectBox : ['#000','#808080','#f66','#90c','#e7f2fb','#fff','#f00','#f60','#fc0','#090']
		,backInit : function(){
			var ul = this.jq('#'+this.ulId);
			var li = ul.find('li');
			this.liNum = li.length;
			var v = ul.css('margin-left');
			this.setSlideBtn(v?v.replace('px',''):0);
			this.addAction();
    	}
    	
    	    			
		//设置左右按钮是否可点击
		,setSlideBtn : function(px){
			var prev = this.jq('#skin_backPrev');
			var next = this.jq('#skin_backNext');
			var slidePage = this.jq('#slidePage');
			var page = 1;
			var all = -(this.liNum-1)*this.slidePx;
			if(px == 0){
				prev.addClass(this.disableClsl);
				if(all<0) next.removeClass(this.disableClsr);
				else  next.addClass(this.disableClsr);
			}else{
				page = px/this.slidePx*(-1)+1;
				prev.removeClass(this.disableClsl);
				if(px == all) next.addClass(this.disableClsr);
				if(px>all) next.removeClass(this.disableClsr);
			}
			slidePage.html(page+'/'+this.liNum);
		}
		
		//上传图片	
    	,change:function(fileVal){
			if(fileVal && !this.checkImg(fileVal)){
				Box.alert('','只支持 jpg、png 的图片。');
				this.xwb_back_form[0].reset();
				return;
			}
			this.getUploader().upload();
		}
		
		,checkImg : function(fileName){
			var pieces = fileName.split('.');
			return pieces.length && $.inArray(pieces.pop().toLowerCase(), ['jpg', 'png']) !== -1;
	    }
		
					
    	,getUploader : function(){
	        if(!this.uploader)
	            this.uploader = X.use('Uploader', {
	                form:this.jqForm, 
	                action :this.back_form.attr('action'),
	                onload:Util.getBind(this, 'onUploadLoad')
	            });
	            
	        return this.uploader;
    	}
    	
    	,onUploadLoad: function(ret){
    		this.uploaded = true;
			var e = Req.parseProtocol(ret);
//					this.back_file.val('');
			this.back_form[0].reset();
			if (e.isOk()&&e.getRaw().raw.rst !== false) {
				this.pwImg.attr('src',e.raw.raw.rst.url);
//				//设置背景图片
//				this.getBackPhoto(e.raw.raw.rst.url);
			}else {
				var errStr="";
				switch( e.raw.raw.errno ){
					case 3040010: errStr="上传图片失败";break;
					case 3040012: errStr="上传图片大小超过限制";break;
					case 610003:
					case 3040013: errStr="上传图片类型不符合要求";break;
					default : errStr="上传图片失败";break;
				}
				Box.alert('提示', errStr);	
			}
		}
		//设置六个color盒选中状态
		,setBackColor : function(pid,obj){
    		var obj = $(obj);
    		if(obj.hasClass(this.backCur)) return;
			var ca = this.jq('#'+pid+' .'+this.backCur);
			ca.removeClass(this.backCur);
			obj.addClass(this.backCur);
		}
		
		,showColorSelect : function(title){
			var self = this;
			var isChange = false;
			if(!this.colorSelectInit){
				this.colorSelectInit = true;
				$('#'+this.colorHiddenId).ColorPicker({
					appendTo : '#'+self.colorSelectId, 
					inputId:self.colorInput,
					color: self.curColor,
//					changeEventType: 1,//改变事件（不定义表示拖动和点击都可以，1表示拖动才改变，2表示点击才改变）
					cpBodyWidth: '212px',
					onShow: function (colpkr) {
						var d = $('#' +$('#'+self.colorHiddenId).data('colorpickerId'));
						var v = d.data('colorpicker');
						v.set(self.curColor);
						$('#'+self.colorSelectId +'#cltitle').html(title);
						$(colpkr).show();
						$('#'+self.colorSelectId).css({'position':'relative','z-index':10005,'left':$('#skin_setcolorArea').offset().left+100+'px','top':-40+'px'}).fadeIn(500);
						return false;
					},
					onHide: function (colpkr) {
						$('#'+self.colorSelectId).hide();
						return false;
					},
					onChange: function (hsb, hex, rgb) {
						self.setSelectBox(hex,isChange);
					}
				});
			}
			$('#'+this.colorSelectId +' #cltitle').html(title);
			$('#'+this.colorHiddenId).click();
			isChange = true;
		}
		
		//即时设置color
		,setSelectBox : function(hex,isChange){
			if(this.selectColorObj){
				$(this.selectColorObj).find('span').css('backgroundColor', '#' + hex).parent().attr('key',hex);
				$('#'+this.colorSelectId).find('#cRealColor>span').css('backgroundColor', '#' + hex);
			}
			if(isChange){//真正修改后
				this.jq('#scheme-select div.'+this.backCur).removeClass(this.backCur);
				if(this.selectColorObj){
					var d2 = this.setPhotoColor(this.selectColorType,'#'+hex);
					this.setPageStyle(d2[0],d2[1]);
				}
			}
		}
		//即时设置color
    	,setPageStyle : function(s,c){
			if($.browser.msie) {//IE下样式是不能用, 串起来查询的。
    			this.splitArray(s,c);
    		}
    		this.mergeMatch(s,c);
    		Util.setClassAttr(s,c);
    	}
    	
		//将数组内的元素按规则拆分，如果碰到要拆分的标志就将其拆分并替换被拆分元素。
		,splitArray : function(k,v){
			var temp = [];
			var set = function(index,arr){
				var l = arr.length;
				k.splice(index,1,arr[0]);
		
				var tarr = [];
				for(var m = 1;m<l;m++){
					k.splice(index+m,0,arr[m]);
					v.splice(index+m,0,v[index]);
				}
			}
			for(var i=0;i<k.length;i++){
				var tv = k[i].split(', ');
				if(tv.length>1){
					set(i,tv);
					i +=tv.length-1;
				}
			}		
		}
		
		 //合并相同的项
    	,mergeMatch : function(key,val){
    		var k = '';
    		var get = function(start){
    			for(var m = start+1;m<key.length;m++){
    				if(key[start] == key[m]){
    					return m;
    				}
    			}
    			return '';
    		};
    		
    		var merge = function(s,r){
    			key.splice(r,1);
    			$.extend(val[s],val[r]);
    			val.splice(r,1);
    		}
    		for(var i=0;i<key.length;i++){
    			var re = get(i);
    			if(re){
    				merge(i,re);
    				i--;
    			}
    			if(i+1 == key.length) break;
    		}
    		
    		return [key,val];
    	}
    	
    	//设置页面缩略图片样式
		,setPhotoColor : function(type,color){
    		var sname = [], attr = [];
    		switch(type){
    			case 0://主链
					sname.push('.pb-main .pb-list .pb-con .c2');
					sname.push('.pb-aside .pb-block p');
					attr.push({'background':color});
    			break;
    			case 1://辅助
    				sname.push('.pb-main .pb-list .pb-con');
    				sname.push('.pb-aside .pb-more');
    				attr.push({'background':color});
    			break;
    			case 2://主背景
    				sname.push('.skin-set .skin-setcolor .preview-box');
    			break;
    			case 3://右栏标题
    				sname.push('.pb-aside .pb-user-info .ui1');
    				sname.push('.pb-aside .pb-block div');
    				attr.push({'background':color});
    			break;
    			case 4://主文字
	    			sname.push('.pb-main .pb-list .pb-con .c1');
	    			sname.push('.pb-aside .pb-user-info .ui2');
	    			attr.push({'background':color});
    			break;
    		}
    		attr.push({'background':color});
			return [sname,attr];
    	}
    	
    	//设置五个color盒
		,sixBoxColor : function(colors){
			var cls = colors.split('-');
			var a = this.jq('#color-area a');
			
			var sname = [],attr = [],psname = [],pattr = [];
			
			for(var i=0,j=a.length;i<j;i++){
				a.eq(i).attr('key',cls[i].replace('#',''));
				a.eq(i).find('span').css('backgroundColor', cls[i]);
				var d2 = this.setPhotoColor(i,cls[i]);
				psname = $.merge(psname, d2[0]);
				pattr = $.merge(pattr, d2[1]);    					
			}
			this.setPageStyle(psname,pattr);
		}
		
    	//设置右边栏color
		,directSetRightBg : function(cls){
			var d = this.setPhotoColor(3,cls[0]);
			this.setPageStyle(d[0],d[1]);
		}
		
		//保存获取数据
		,getCustomData : function(){
			var data = {};
			var coloras = this.jq('#color-area a');
			data.colors = [];
			for(var i=0,j=coloras.length;i<j;i++){
				data.colors.push(coloras.eq(i).attr('key'));
			}
			data.colors = data.colors.join(',');
			if(this.uploaded){
				data.bg = this.pwImg.attr('src');
			}else{
				var imgRel = this.pwImg.attr('rel');
				if(imgRel){
					data.bg = (this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'';
				}else{
					data.bg = '';
				}
			}
			data.tiled = this.jq('#bg-repeat').attr('checked')?1:0;
			data.fixed = this.jq('#bg-fixed').attr('checked')?1:0;
			var align = this.jq('#align a.cur');
			data.align = align.length?this.parseRel(align.attr('rel'))['w']:2;
			var colorid = this.jq('#scheme-select div.cur');
			data.colorid = colorid.length?(this.parseRel(colorid.attr('rel'))['t']):'';
			return data;
		}
		
		,getData : function(){
			var url = '';
			if(this.uploaded){
				url = 'bg:'+this.pwImg.attr('src');
			}else{
				var imgRel = this.pwImg.attr('rel');
				if(imgRel){
					url = 'bg:'+((this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'');
				}else{
					url = 'bg:';
				}
			}
			url +='$$tiled:'+(this.jq('#bg-repeat').attr('checked')?1:0);
			url +='$$fixed:'+(this.jq('#bg-fixed').attr('checked')?1:0);
			var align = this.jq('#align a.cur');
			url +='$$align:'+(align.length?this.parseRel(align.attr('rel'))['w']:2);
			var colorid = this.jq('#scheme-select div.cur');
			url +='$$colorid:'+(colorid.length?(this.parseRel(colorid.attr('rel'))['t']):'');
			var coloras = this.jq('#color-area a');
			var _colors = [];
			for(var i=0,j=coloras.length;i<j;i++){
				_colors.push(coloras.eq(i).attr('key'));
			}
			url +='$$colors:'+_colors.join(',');
			return url;
		}
		
		,addAction : function(){
			var self = this;
			Xwb.use('action').reg('save',function(e){//保存
        		var data = self.getCustomData();
    			Req.saveMgrSkin(data,function(e){
    				if(e.isOk()){
		                Box.tip('设置成功!','success');
		            }else Box.alert('', e.getMsg());
    			});
			}).reg('bgPlace',function(e){
				if($(e.src).hasClass('cur')) return;
            		self.jq('#align .cur').removeClass('cur');
            		e.src.className = 'cur';
			}).reg('cls',function(e){
			    self.selectColorObj = e.src;
        		self.selectColorType = Number(e.get('t'));
        		self.setBackColor('color-area',e.src);
        		self.curColor = $(e.src).attr('key');
        		self.showColorSelect($(e.src).attr('title'));
			}).reg('clsr',function(e){
//				self.selectColorObj = e.src;
//				X.use('Box',{
//					contentHtml:'colorBox',
//					actionMgr : true,
//					cs:'win-bg-box',
//					closeable:true,
//					appendTo:document.body,
//					mask:true,
//					autoCenter:true,
//					onViewReady:function(){
//						var self=this;
//						var key = Number($(e.src).attr('key').replace('bg',''));
//						var li = this.jq('li');
//						this.jq('li.cur').removeClass('cur');
//						li.eq(key-1).addClass('cur');
//					},
//					onactiontrig : function(r){
//						switch(r.data.e){
//							case 'getCls':
//								if($(r.src).hasClass('cur')) return;
//								$(r.src).parent().find('.cur').removeClass('cur');
//								$(r.src).addClass('cur')
//								break;
//							case 'comf' ://保存
//								var li = this.jq('li.cur');
//								var rel = li.attr('rel').replace('e:getCls,c:','').split(',w:');
//								$(e.src).attr('key',rel[1].replace('bg','')).find('span').css('backgroundColor', rel[0]);
//								self.directSetRightBg(rel);
//								//设置右栏背景色
//								this.close();
//								break;
//						}
//					}
//				}).display(true);
				
			}).reg('clbs',function(e){//点击背景选择
			    self.setBackColor('scheme-select',e.src);
	    		self.sixBoxColor(e.get('w'));
				
			}).reg('prv',function(e){//预览
				var d = self.getData();
				var urlp = encodeURIComponent(Util.queryString(d));
				window.open('index.php?m=index&preview='+d);
			}).reg('edit',function(e){});;
		}
	};

	ui.skin.onViewReady();
});
})(Xwb, $);