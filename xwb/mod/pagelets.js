/*!
 * X weibo JavaScript Library v1.2
 * http://x.weibo.com/
 * 
 * Copyright 2011 SINA Inc.
 */
 
/*
 * 页面初始化文件，该文件存放页面所有的Pagelet类或派生类实例。
 */

(function(X, $){
    var getCfg = X.getCfg,
        Req = X.request,
        Util = X.util,
        Box = X.ui.MsgBox,
        Pagelet = X.ax.Pagelet;
		        
    /**
     * @namespace
     * 存放所有继承{@link Xwb.ax.Pagelet}类
     */
    Util.ns('Xwb.mod.pagelet', {});
    

    
    /**
     * @class Xwb.mod.pagelet.WeiboList
     * 微博列表块基类
     * @extends Xwb.ax.Pagelet
     */
    var WBPipe = X.mod.pagelet.WeiboList = Util.create(Pagelet, {
        
        // 页块的UI类
        ui : {cls:X.mod.WeiboList},
        
        // 回调返回html作为页面内容
        onViewReady : function(cfg){
        	
            var d = cfg.data;
            if(d){
                // 微博数据对象
                var ls = d.list;
                if(ls){
                    var gls = X.cfg.wbList;
                    if(!gls)
                        X.cfg.wbList = gls = {};
                    // 添加到全局微博数据缓存
                    for(var id in ls){
                        if(!gls[id])
                            gls[id] = ls[id];
                    }
                }
                
                // 监听全局微博计数返回事件
                X.on('api.getCounts', Util.getBind(this, 'onUpdateCounter'));
            }
        },

        onUpdateCounter : function(e){
            if(e.isOk()){
                var wbs = this.getUI().jq('#xwb_weibo_list_ct>li'),
                    wbsData = X.cfg.wbList,
                    cntData = e.getData();
                var jq, wid, wbd, cntd;
                var self = this;
                wbs.each(function(){
                    jq   = $(this);
                    wid  = Util.parseKnV(jq.attr('rel')).w;
                    cntd = cntData[wid];
                    // 自身微博
                    if(cntd)
                        self.renderWeiboCounter(jq, cntd);
                    
                    // 内容转发区内的微博
                    wbd  = wbsData[wid];
                    var rt = wbd.rt;
                    if(rt && (cntd = cntData[rt.id])){
                        jq = jq.find('.forward');
                        self.renderInnerWeiboCounter(jq, cntd);
                    }
                });
            }
        },
        
        // 自身微博数据更新
        renderWeiboCounter : function(jq, cntd){
            // 存在评论
            if(cntd[0])
                jq.find('#cm').text('评论(' + cntd[0] + ')');
            // 存在转发
            if(cntd[1])
                jq.find('#fw').text('转发(' + cntd[1] + ')');
        },
        
        // 内容转发区内的微博数据更新
        renderInnerWeiboCounter : function(jq, cntd){
            // 存在评论
            if(cntd[0])
                jq.find('#lk_cm').text('原文评论(' + cntd[0] + ')');
            // 存在转发
            if(cntd[1])
                jq.find('#lk_fw').text('原文转发(' + cntd[1] + ')');
        }
    });

    //设置皮肤
    X.use('pipeMgr').reg('common.userSkin',function(){
        return  new Pagelet({
            ui : {
            	actionMgr:true
            	,uploaded : false
            	,skinSelectedCS : 'current'
            	,colorSelectInit : false
            	,colorSelectId : 'csArea'
				,isIE : $.browser.msie    
				,ieStyleId : 'customStyle'
            	,colorInput    : 'colorshow'
            	,colorHiddenId : 'colorSelector'
				,initIscustom  : false  //初始化时就是自定义皮肤
				,isClickCustom : false
            	,customLinkId : 'custom_css'
				,address : 'http://'+window.location.hostname+Req.basePath 				
            	,backCur : 'cur' 
            	,searchCssFile : ['skin_define/skin.css' , 'setting.getSkin' , 'skin_set.css' , 'base.css']
            	,parseRel : Xwb.ax.ActionMgr.parseRel
		    	,onViewReady : function(){
		    		this.back_form = this.jq('#xwb_back_form');
		    		this.jqForm = this.back_form[0];
		    		this.back_file = this.jq('#xwb_back_file');
		    		this.pwImg = this.jq('#previewImg');
		    		this.delImg = this.jq('#closeImg'); 
		    		var self = this;
		    		this.switcher = '';
		    		this.custom = this.jq('#switcherItem #custom').hasClass('current');//是否自定义皮肤
					this.initIscustom = this.custom; //
		    		this.back_file.change(function(){self.change(this.value)});
		    		this.isSelectSkin(true);
		    		var switcher = X.use('Switcher', {
		    			items: $('#switcherItem>span'),		
		    			contents: $('#switcherCom>div'),		
		    			selectedCS: 'current',		    			
		    			onselect:function(item){
							if(!self.initIscustom&&item.id == 'custom'&&!self.isClickCustom){
								self.isClickCustom = true;							
							}
							if(item.id == 'custom'){
								self.custom = true;
							}else{
								self.custom = false;
							}					
							self.switchBackColor(self.custom?'set':'select');
		    			}

		    		});
		    		//初始化选择color
		    		this.backInit();
		    		
		    		//初始化图片
		    		this.delImg.click(Util.bind( this.closeUploadImg, this ));
		    		
					if(this.initIscustom){
					//初始化设置模板图
						setTimeout(function(){					
							self.initCustomStyle();
						},10);
					}		    		
		    	}
				
				,initCustomStyle : function(){					
					var v = this.setPhotoColor();
					//IE要再设置全部样式
					v[0].push('html');
					v[1].push(this.getBackAttr());						
					this.setPageStyle(v[0],v[1],'cover');
						//self.directGetFiveBox();
				}
		    	
		    	//删除上传图片
		    	,closeUploadImg : function(){
		    		var rel = this.pwImg.attr('rel');
		    		if(rel){
		    			this.pwImg.attr({'rel':'','src':Req.basePath+'img/upload_pic.png'});
		    			this.delImg.cssDisplay(false);
		    			this.getBackPhoto(false,'');
		    		}
		    	}
		    	
		    	//背景是否平铺
		    	,photoBackTile : function(isReturn){
					var tiled = this.jq('#bg-repeat').attr('checked')?"repeat":"no-repeat";
					if(isReturn) return ['html',{'backgroundRepeat':tiled}];
					this.setClassByName('html','backgroundRepeat',tiled);
					//Util.getClassByName('html')['backgroundRepeat'] = tiled;
		    	}
		    	//背景是否固定
		    	,photoBackStrong : function(isReturn){
		    		var fixed = this.jq('#bg-fixed').attr('checked')?"fixed":"";
		    		if(isReturn) return ['html',{'backgroundAttachment':fixed}];
					this.setClassByName('html','backgroundAttachment',fixed);
					//Util.getClassByName('html' )['backgroundAttachment'] = fixed;
		    	}
		    	//设置背景图片位置（左，中，右）
		    	,photoBackPlace : function(isReturn){
		    		var v = this.jq('#align a.cur').attr('rel');
		    		if(!v){
		    			if(isReturn) return ['',''];
		    			else return;
		    		}
		    		var align = this.parseRel(this.jq('#align a.cur').attr('rel'))['w'];
					align = align == '1'?'left top':(align == '2' ? 'center top' : 'right top');
					if(isReturn) return ['html',{'backgroundPosition':align}];
					this.setClassByName('html','backgroundPosition',align);
		    	}
		    	
		    	//设置背景图片
		    	,getBackPhoto : function(isReturn,url){
		    		if(isReturn) return ['html',{'backgroundImage':"url("+url+")"}];
					this.setClassByName('html','backgroundImage',"url("+url+")");
		    	}
		    	//上传图片	
		    	,change:function(fileVal){
					if(fileVal && !this.checkImg(fileVal)){
						Box.alert('','只支持 jpg、png的图片。');
						this.back_form[0].reset();
						return;
					}
					this.getUploader().upload();
				}
				
				,checkImg : function(fileName){
					var pieces = fileName.split('.');
					return pieces.length && $.inArray(pieces.pop().toLowerCase(), ['jpg','png']) !== -1;
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
					var e = Req.parseProtocol(ret);
					this.back_form[0].reset();
					if(typeof e != 'object'){
					    Box.alert('提示', "上传失败!");	
					    return;
					}					
					if (e.isOk()&&e.getRaw().raw.rst !== false) {
						this.pwImg.attr({'src':e.raw.raw.rst.url,'rel':'u:1'});
						this.delImg.cssDisplay(true);
						//设置背景图片
						var sname = [];
						var svalue = [];
						var v = this.getBackPhoto(true,e.raw.raw.rst.url);
						if(!this.uploaded){
							!this.jq('#align a.cur').attr('rel') && this.jq('#align a').eq(0).addClass('cur');//选择居左
							var val = this.photoBackTile(true);							
							var val1 = $.extend(val[1],this.photoBackPlace(true)[1]); 
						}
						$.extend(v[1],val1);
						sname.push('html');
						svalue.push(v[1]);		
						
						this.setCssByObject(sname,svalue);
						this.uploaded = true;
					}else {
						var errStr="";
						switch( e.raw.raw.errno ){
							case 3040010: errStr="上传图片失败";break;
							case 3040012: errStr="上传背景图片的大小不能超过2M，请重新选择";break;
							case 610003:
							case 3040013: errStr="上传图片类型不符合要求";break;
							default : errStr="上传图片失败";break;
						}
						Box.alert('提示', errStr);	
					}
				}
				//上传图片结束	
				
				//选择皮肤后加载新css
				,changeCss : function(skin, id){
			        var self = this;
			        var has = false;
					function updStyle(url,obj){
					    if(!url){				        	
							url = self.address+'css/default/'+skin+'/skin.css';
						}else{
							url = self.address+url;
						}
						//加载css.php文件，需要2秒之后才会返回响应内容
						var fileref = self.createCss(url ,'');								
						if(self.isIE) {
							var cn = document.styleSheets.length;
							var ti = setInterval(function() {
								try {
									if (document.styleSheets.length > cn) {
										clearInterval(ti);
										$(obj).remove();
										Util.getClassByName('html')['backgroundImage'] = "url()";
									}
								} catch (e){}
							}, 10);
						}else{
							var fi = setInterval(function() {
							  try {
								  fileref.sheet.cssRules; // 这句是关键，在css加载完成的时候，style元素就会有这么个对象。
								  clearInterval(fi);
								  $(obj).remove();
								  Util.getClassByName('html')['backgroundImage'] = "url()"
								} catch (e){}
							  }, 10);
						}
						$('head').append(fileref);		
							//setTimeout(function(){Util.getClassByName('html')['backgroundImage'] = "url()";},200);
			        }
					
			        //$('#'+this.customLinkId).remove();	
			        $('link[rel=stylesheet]').each(function(){
			            if(this.href.indexOf('/skin.css') !== -1 &&  this.id != self.customLinkId){
			            	has = true;
			                // 保存最初skin，方便恢复
			                if(!self.usedSkin)
			                    self.usedSkin = this.href.match(/\/css\/(.*)\/skin.css/i)[1];			                    
			                if(this.href.indexOf('/css/default/'+skin+'/skin.css')>0){//判断是否修改的css文件跟原来的一样，如果一样就先删除原来的再加入新的。
			                	var url = this.href;
			                }else{								
								updStyle('/css/default/'+skin+'/skin.css',this);

			                }
			            }
			        });
			        if(!has){					
			        	var self = this;
			        	if (this.isIE && $.browser.version == 6) {
							self.cacheCss = self.getTempStyle();
			        		setTimeout(updStyle, 100);
			        	} else {
			        		updStyle();
			        	}
			        }
			        this.switcher = id;
			    }
			    
			    ,createCss : function(url,id){
			    	//if(id == this.customLinkId && $('#'+this.customLinkId).length) return;
    			    var fileref=document.createElement("link"); 
		            fileref.setAttribute("rel", "stylesheet"); 
		            fileref.setAttribute("type", "text/css"); 
		            fileref.setAttribute("href", url);
		            fileref.setAttribute("id", id);
		            return fileref;
			    }
			    
			    //修改选择的皮肤样式(设置点击点)
			    ,decorateSelected : function(currentEl){
			        if(!this.jqPreSel)
			            this.jqPreSel = this.jq('#switcherCom .'+this.skinSelectedCS);
			        this.jqPreSel.removeClass(this.skinSelectedCS);
			        this.jqPreSel.find('.bg-icon').removeClass('bg-icon');
			        this.jqPreSel = $(currentEl);
			        this.jqPreSel.addClass(this.skinSelectedCS);
			        this.jqPreSel.find('span').addClass('bg-icon');
			    }
			    
			    //判断是否是选择皮肤
			    ,isSelectSkin : function(init){
		    		if(!this.jqPreSel)
		            	this.jqPreSel = this.jq('#switcherCom .'+this.skinSelectedCS);
            	    if(init){
	            		this.orgBackColor = $('html').css('backgroundColor');
	            		this.orgBackBg = $('body').css('backgroundImage');
            	    }
			    }
			    
			    //点击switcher切换底色
			    ,switchBackColor : function(type){
			    	if(type == 'select'){//选择皮肤
		    			if(!this.jqPreSel)
		            		this.jqPreSel = this.jq('#switcherCom .'+this.skinSelectedCS);
		            	if(this.jqPreSel.length){//已经选择过了

							this.cacheCss = this.getTempStyle();
		            		var rel = this.parseRel(this.jqPreSel.attr('rel'));
							this.changeCss(rel['sk'],rel['id']);
		            	}
			    	}else{//自定义皮肤
						var url = 'css/default/skin_define/skin.css.php';
			    		this.loadLink(this.address+url,this.customLinkId);
			    	}
			    }
						    
			    ,loadLink : function(url,id){
					var self = this;
					var callBack = function(){
						// 判断是否存在选择的皮肤文件，有则删除
					　　$('link[rel=stylesheet]').each(function(){
				　　	    if(this.href.indexOf('/skin.css') !== -1 && this.id != self.customLinkId){
				　　	    	$(this).remove();
				　　	    }
					　　});
						if(self.cacheCss){						
							self.addStyle('',self.cacheCss,'cathe');
							self.cacheCss = '';
						}
						return;
/* 						var v = self.setCustomClass();
						self.setPageStyle(v[0],v[1]);	 */					
					}
					if(!this.initIscustom && $('head #defaultStyle').length == 0){	
						var url = 'css/default/skin_define/skin.css.php';				
						$.get(this.address+url,{},function(d){
							callBack();
							var head = document.getElementsByTagName("head")[0];
							var rulee = document.createElement("style");
							rulee.setAttribute("type", "text/css");
							rulee.setAttribute("id", 'defaultStyle');
							head.appendChild(rulee);	
							if (rulee.styleSheet) {//ie		
								rulee.styleSheet.cssText = d;
							}else{
								rulee.innerHTML = d;
							}
							
						});
					}else{
						callBack();
					}
			    }
			    
				,getTempStyle : function(){					
					var rule = document.getElementById(this.ieStyleId);
					if(rule) {
						return rule.styleSheet ? rule.styleSheet.cssText : rule.innerHTML; 
					}
					return '';
				}
			    
			    //切换后如果是自定义设置其它样式
			    ,setCustomClass : function(){
		    		var cname = [];
		    		var svalue = [];
		    		var bg = '';
					var imgRel = this.pwImg.attr('rel');
					if(imgRel){
						bg = (this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'';
					}		    		
			    	var v = this.photoBackTile(true);
			    	cname.push('html');
			    	var v2 = this.photoBackStrong(true);
			    	v = $.extend(v[1],v2[1]);
			    	v = $.extend(v,this.photoBackPlace(true)[1]);			    	
			    	v = $.extend(v,{'backgroundImage':"url("+bg+")"});			    	
			    	v && svalue.push(v);
			    	
			    	//if(fg){
		    			cname.push('.wrap-in');
		    			svalue.push({'backgroundImage':''});
		    			cname.push('#wrap');
		    			svalue.push({'backgroundImage':''});
	    			//}
		    		var a = this.jq('#color-area a');
		    		for(var i=0,j=a.length;i<j;i++){
		    				var v = this.getChangeClass(i,'#'+a.eq(i).attr('key'));
			    			cname = $.merge(cname, v[0]);
			    			svalue = $.merge(svalue, v[1]);
		    		}
	    			return [cname,svalue];
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
					var imgRel = this.pwImg.attr('rel');
					if(imgRel){
						data.bg = (this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'';
					}else{
						data.bg = '';
					}
					data.tiled = this.jq('#bg-repeat').attr('checked')?1:0;
					data.fixed = this.jq('#bg-fixed').attr('checked')?1:0;
					var align = this.jq('#align a.cur');
					data.align = align.length?this.parseRel(align.attr('rel'))['w']:2;
					var colorid = this.jq('#scheme-select div.cur');
					data.colorid = colorid.length?(this.parseRel(colorid.attr('rel'))['t']):'';
					return data;
				}

				,isChangeColor : false
				
				//显示配色器 
				,showColorSelect : function(title){
					var self = this;
					var isChange = false;
					this.isChangeColor = false;
					if(!this.colorSelectInit){
						this.colorSelectInit = true;
						$('#'+this.colorHiddenId).ColorPicker({
							appendTo : '#'+self.colorSelectId, 
							inputId:self.colorInput,
							//tpl:X.ax.Tpl.tpls.colorpicker,
							color: self.curColor,
//							changeEventType: 1,//改变事件（不定义表示拖动和点击都可以，1表示拖动才改变，2表示点击才改变）
							cpBodyWidth: '212px',
							onShow: function (colpkr) {
								var d = $('#' +$('#'+self.colorHiddenId).data('colorpickerId'));
								var v = d.data('colorpicker');
								v.set(self.curColor);
								$('#'+self.colorSelectId +'#cltitle').html(title);
								$(colpkr).show();
								$('#'+self.colorSelectId).css({'position':'relative','z-index':10005,'left':$('#skin_setcolorArea').offset().left-200+'px','top':35+'px'}).fadeIn(500);
								return false;
							},
							onHide: function (colpkr) {
								$('#'+self.colorSelectId).hide();
								return false;
							},
							onChange: function (hsb, hex, rgb) {
								self.setSelectBox(hex,isChange);
								self.isChangeColor = true;
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
					if(this.isChangeColor){//真正修改后
						this.jq('#scheme-select div.'+this.backCur).removeClass(this.backCur);
						if(this.selectColorObj){
							var d = this.getChangeClass(this.selectColorType,'#'+hex);
							var d2 = this.getPhotoColor(this.selectColorType,'#'+hex);
							var sn =$.merge(d[0], d2[0]);
							var cl =$.merge(d[1], d2[1]);
							sn.push('html');						
							cl.push(this.getBackAttr());	
								//this.setPageStyle(sname,attr);								
							this.setPageStyle(sn,cl,'add');
							
						}
					}
				}
				
				//设置六个color盒选中状态
				,setBackColor : function(pid,obj){
		    		var obj = $(obj);
		    		if(obj.hasClass(this.backCur)) return;
					var ca = this.jq('#'+pid+' .'+this.backCur);
//					if(ca.length){
						ca.removeClass(this.backCur);
						obj.addClass(this.backCur);
//					}
				}
				
				,reload : function() {
			    	var reg = /skinset[^A-Za-z0-9\/]{1}1/g;
			    	window.location = String(window.location.href).replace(reg, '');
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
					this.setSlideBtn(ul.css('margin-left').replace('px',''));
		    	}
				
				,getBackPhotoInfo : function(){
					var bg = '';
					var imgRel = this.pwImg.attr('rel');
					if(imgRel){
						bg = (this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'';
					}
					return bg;
				}
		    	
		    	//即时设置color
		    	,setPageStyle : function(s,c,type){
		    		this.mergeMatch(s,c);
					this.addStyle(s,c,type||'cover');
		    	}
				
				,setCssByObject : function(n,v,type){
					this.addStyle(n,v,type||'change');				
				}
				
				
				,setClassByName : function(name,key,value,type){
					var arr = [];
					var o = {};
					o[key] = value;					
					if(key == 'backgroundPosition' || key == 'backgroundRepeat' || key == 'backgroundAttachment'){//设置这个都要把背景加上
						var bg = this.getBackPhotoInfo();
						if(bg){
							o['backgroundImage'] = "url("+bg+")";
						}else{
							return;
						}
					}
					arr.push(o);
					//if(key == 'backgroundImage') type = 'add';
					this.addStyle([name],arr,type||'change');
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
				
				,setPhotoColor : function(){
					//直接取五个color盒					
					var a = this.jq('#color-area a');
					var sname = [],attr = [],psname = [],pattr = [];
					 for(var i=0,j=a.length;i<j;i++){
    					var color = '#'+a.eq(i).attr('key');
    					var d1 = this.getChangeClass(i,color);
    					
    					var d2 = this.getPhotoColor(i,color);
    					
    					sname = $.merge(sname, d1[0]);
    					attr = $.merge(attr, d1[1]);
    					
    					psname = $.merge(psname, d2[0]);
    					pattr = $.merge(pattr, d2[1]);    					
    				}
    				sname = $.merge(sname, psname);
    				attr = $.merge(attr, pattr);
					
					//背景图片
					var bg = this.getBackPhotoInfo();
					if(bg){
						sname.push('html');
						attr.push({'backgroundImage':"url("+bg+")"})
					}
					
    				return [sname,attr];
					
				}
				
		    	
		    	//设置页面缩略图片样式
		    	,getPhotoColor : function(type,color){
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
		    	
		    	//判断是否不可动
		    	,isDisable : function(obj){
		    		return $(obj).hasClass(this.disableClsl)||$(obj).hasClass(this.disableClsr);
		    	}
		    	
		    	//选择皮肤滑动效果
		    	,backSlide : function(way,obj){
    				var ul = this.jq('#scheme-select');
    				var px = Number(ul.css('margin-left').replace('px',''));
    				this.ulPx = px;
    				if(way == 'prev'){
    					this.minus = this.slidePx;
    				}else{
    					this.minus = -this.slidePx;
    				}
    				this.setSlideBtn(this.minus+px);
					this.setBackSlide(ul,way);
    			}    			
    			,setBackSlide : function(obj,way){
    				var num = 30;
    				if(way == 'prev'){
    					this.minus -= num;
    					this.ulPx += num;
    				}else{
    					this.minus += num;
    					this.ulPx -= num;
    				}
					obj.css('margin-left',this.ulPx+'px');
    				if(this.minus !=0 ){
    					var self = this;
    					setTimeout(function(){self.setBackSlide.call(self,obj,way);},1);
    				}else{
    					this.sliding = false;
    				}
    			}
    			
    			//设置左右按钮是否可点击
    			,setSlideBtn : function(px){
    				var prev = this.jq('#prev');
    				var next = this.jq('#next');
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
    			
    			//设置五个color盒
    			,sixBoxColor : function(colors){
    				var cls = colors.split('-');
    				var a = this.jq('#color-area a');
    				
    				var sname = [],attr = [],psname = [],pattr = [];
    				
    				for(var i=0,j=a.length;i<j;i++){
    					a.eq(i).attr('key',cls[i].replace('#',''));
    					a.eq(i).find('span').css('backgroundColor', cls[i]);
    					var d1 = this.getChangeClass(i,cls[i]);
    					
    					var d2 = this.getPhotoColor(i,cls[i]);
    					
    					sname = $.merge(sname, d1[0]);
    					attr = $.merge(attr, d1[1]);
    					
    					psname = $.merge(psname, d2[0]);
    					pattr = $.merge(pattr, d2[1]);    					
    				}
    				sname = $.merge(sname, psname);
    				attr = $.merge(attr, pattr);
					
					sname.push('html');						
					attr.push(this.getBackAttr());							
    				this.setPageStyle(sname,attr);
    			}
    			
    			,getChangeClass : function(type,color){
    				var sname = [],attr = [];
    				    switch(type){
    						case 0:/*主链接色*/
								var str = 'a, .feed-list .feed-filter a, .user-preview .user-total-box a, .user-preview .user-total-box a:hover, .gotop:hover';
								this.splitByChar(sname,attr,str,{'color':color});
								if(X.getCfg('remind') == '0'){
									var str ='.menu .menu-custom, .menu .menu-over';
									this.splitByChar(sname,attr,str,{'background':color});
								}
	    					break;
	    					case 1:/*辅助连接色*/
								var str = '.sub-link, .feed-list .feed-info p a, .feed-list .feed-info span a, .feed-list .forward p span a, .gotop:link, .gotop:visited, .ft-con a, .icon-reply, .icon-del';
								this.splitByChar(sname,attr,str,{'color':color});
								
								//处理背景色时要调整两栏-右边栏用户菜单
								var str = '#home .home-current, #atme .atme-current, #comments .comment-current, #favs .favs-current, #systemnotice .systemnotice-current, #messages .messages-current, .nav-block .cur, .nav-block .cur:hover, .nav .defined-link a:hover, .nav .user-link a:hover, .tab-s4 a:hover, .tab-s4 .current, .tab-s4 .current:visited, .menu li, .menu .menu-bg, .menu .menu-bg .l-bg, .menu .menu-bg .r-bg';
								this.splitByChar(sname,attr,str,{'backgroundColor':color});
	    					break;
	    					case 2:/*主背景色*/	    						
	    						var str = 'html';								
								this.splitByChar(sname,attr,str,{'backgroundColor':color});
								
								var str = '.sub-menu a:hover, .sub-menu a.current';
								this.splitByChar(sname,attr,str,{'color':color});
								
	    						sname.push('.event-classify a:hover');
								attr.push({'color':color});
								var str = '.event-classify a.curr, .event-classify a.curr:hover';
								this.splitByChar(sname,attr,str,{'color':color});
								
	    						sname.push('.nav-block .cur');
	    						sname.push('.nav-block .cur:hover');
	    						attr.push({'color':color});
	    						attr.push({'color':color});
	    					break;
	    					case 3:/*标题字体色*/
								var str = '.user-sidebar .hd h3, .user-list-s1 .hd h3, .user-tag .tag-tit h3, .top10 .hd h3, .user-tag .hd h3, .user-preview .user-intro strong, .feed-list .feed-tit h3, .title-box h3, .column-title h3, .account-login h3, .recom-box .hd h3, .att-topic .hd h3, .events-title h3, .recent-event .hd h3, .tit-hd h3, .tit-s1 h3, .tab-s2 span a, .tab-s2 span a:visited, .tab-s3 span a, .tab-s3 span a:visited';
								this.splitByChar(sname,attr,str,{'color':color});
	    					break;
	    					case 4:/*主文字色*/
	    						sname.push('body');
	    						attr.push({'color':color});
	    					break;
    					}

    					return [sname,attr]
    			}
				
				
				//IE分隔样式中的,
				,splitByChar : function(key,value,splitChar,val,ch){
 					//if(this.isIE){ 
/* 					if(false){
						ch = ch || ', ';
						var v = splitChar.split(ch);
						var len = v.length;
						for(var i=0;i<len;i++){
							key.push(v[i]);
							value.push(val);
						}
					}else{ */
						key.push(splitChar);
						value.push(val);
					//} 					
				}
    			
				//返回自定义左则设置信息
				,getBackAttr : function(){
					var re = {};
					var imgRel = this.pwImg.attr('rel');
					if(imgRel){
						re['background-image'] = 'url('+((this.parseRel(imgRel)['u'])?this.pwImg.attr('src'):'')+')';
					}else{
						re['background-image'] = 'url("")';
					}					
					re['background-repeat'] = this.jq('#bg-repeat').attr('checked')?"repeat":"no-repeat";								
					re['background-attachment'] = this.jq('#bg-fixed').attr('checked')?"fixed":"scroll";					
					var align = '';
					var v = this.jq('#align a.cur').attr('rel');
					if(v){
						align = this.parseRel(v)['w'];
						re['background-position'] = align == '1'?'left top':(align == '2' ? 'center top' : 'right top');
					}	
					return re;				
				}
				
    			
    			//设置右边栏color
    			,directSetRightBg : function(cls){
    				$('#container')[0].className = cls[1];
    				var d = this.getPhotoColor(3,cls[0]);
    				this.setPageStyle(d[0],d[1]);
    			}
    			
    			//设置右栏背景色
    			,setRightBackColor : function(color){
    				var d = this.getChangeClass(this.selectColorType,'#'+hex);
					var d2 = this.getPhotoColor(this.selectColorType,'#'+hex);
					var sn =$.merge(d[0], d2[0]);
					var cl =$.merge(d[1], d2[1]);
					this.setPageStyle(sn,cl);
    			}
				
				
				,onactiontrig : function(e){
		            switch(e.data.e){
		            	case "save" :  //保存设置
		            		var data = {};
		            		if(this.custom){
		            			data = this.getCustomData();
		            		}else{
		            			if(this.switcher == ''){
		            				Box.alert('','请选择皮肤');
		            				return;
		            			}
		            			data = {'skin_id':this.switcher};
		            		}
		            		var self = this;
	            			Req.saveSkin(data,function(e){
	            				if(e.isOk()){
					                self.display(false);
					                self.reload();
					            }else Box.alert('', e.getMsg());
	            			});
		            	break;
		            	
		            	case "cancel" :   //恢复样式
			                this.reload();
			            break;
		            	
			            case 'cs' :
			            	this.custom = false;
			                this.changeCss(e.get('sk'), e.get('id'));
			                this.decorateSelected(e.src);
			            break;
		            	
		            	case "bgLevel" ://设置checkbox背景平铺
		            		this.photoBackTile(false);
		            	    e.preventDefault(false);
		            	break;
		            	
		            	case "bgStrong" ://设置checkbox背景固定
		            		this.photoBackStrong(false);
		            		e.preventDefault(false);
		            	break;
		            	
		            	case "bgPlace" ://是否背景位置
		            		if($(e.src).hasClass('cur')) return;
		            		this.jq('#align .cur').removeClass('cur');
		            		e.src.className = 'cur';
		            		this.photoBackPlace(false);
		            	break;
		            	
		            	case "cls" :
		            		this.selectColorObj = e.src;
		            		this.selectColorType = Number(e.get('t'));
		            		this.setBackColor('color-area',e.src);
		            		this.curColor = $(e.src).attr('key');
		            		this.showColorSelect($(e.src).attr('title'));
		            	break;
		            	
		            	case "clbs" :
		            		this.setBackColor('scheme-select',e.src);
		            		this.sixBoxColor(e.get('w'));
//		            		this.setPageStyle(e.src);
		            	break;
						
						case "slide" : //上一页
							  if(this.sliding || this.isDisable(e.src)) return ;
							  this.sliding = true;
							  var type = e.get('t');
    						  this.backSlide(type,e.src);
						break;
		            	
		            }
				}
				
				,addStyle : function(n,v,type) {	
					var id = this.ieStyleId;
					var doc = document;
					var rule = doc.getElementById(id);
					if(!this.initIscustom){//处理从默认皮肤跳转到自定义皮肤
						$('#'+this.customLinkId).remove();
					}
					if(rule == null){//第一次加入
						var head = document.getElementsByTagName("head")[0];
						var rule = document.createElement("style");
						rule.setAttribute("type", "text/css");
						rule.setAttribute("id", id);
						head.appendChild(rule);		
						if (rule.styleSheet) {    //ie						
							if(type && type == 'create'){
								rule.styleSheet.cssText = v; //添加新的内部样式		
							}else{						
								var s = this.cssObjToString(n,v);
								rule.styleSheet.cssText = s; //添加新的内部样式		
							}	
						}else {//火狐支持直接innerHTML添加样式表字串
							if(type && type == 'create'){
								rule.innerHTML = v;
							}else{							
								var s = this.cssObjToString(n,v);
								rule.innerHTML = s; //添加新的内部样式	
							}
						}	
					}else{
						if (rule.styleSheet) {//ie						
							if(type === 'add'){//只是增加
								var s = this.cssObjToString(n,v);
								rule.styleSheet.cssText += s;
							}else if(type === 'cover'){//覆盖							
								var s = this.cssObjToString(n,v);
								rule.styleSheet.cssText = s;
							}else if(type === 'cathe'){//缓存
								rule.styleSheet.cssText = v;
							}else{//修改
								var sheet = rule.styleSheet;
								var rules = sheet.rules;
								var len = n.length;
								for(var i=0;i<len;i++){
									var num = this.isMatchCss(rules,n[i]);
									if(num>-1){//已存在
										this.setRulesAttr(rules[num].style,v[i]);
									}else{// 不存在
										sheet.addRule(n[i],this.objectToString(v[i],false));
									}
								}
							}
						}else{ //firefox
							if(type === 'add'){//只是增加
								var s = this.cssObjToString(n,v);
								rule.innerHTML += s;
							}else if(type === 'cover'){//覆盖							
								var s = this.cssObjToString(n,v);
								rule.innerHTML = s;
							}else if(type === 'cathe'){//缓存
								rule.innerHTML = v;
							}else{//修改
								var sheet = rule.sheet.cssRules;
								var len = sheet.length;
								for(var i=0;i<len;i++){
									var num = this.isMatchCss(sheet,n[i]);
									if(num>-1){//已存在
										this.setRulesAttr(sheet[num].style,v[i]);
									}else{// 不存在
									    var v = this.objectToString(v[i],false);
										v && rule.sheet.insertRule(n[i],this.objectToString(v[i],false));
									}
								}
							}
						
						} 
					}
				}
	
				,setRulesAttr : function(obj,val){
					for(var v in val){
						obj[v] = val[v];
					}
				}
				
				,isMatchName : function(cn){
					var len = n.length;
					cn = cn.toLowerCase();
					for(var i=0;i<len;i++){
						if(cn == n[i]) return true;
					}
					return false;
				}
				
				,isMatchCss : function(rules,cn){
					for(var i=0,len=rules.length;i<len;i++){
						if(cn == rules[i].selectorText.toLowerCase()) return i;
					}
					return -1;
				}
				
				,cssObjToString : function(n,v){
					var str = [];
					for(var i=0,j=n.length;i<j;i++){		
						var c = this.objectToString(v[i]);
						str.push(n[i]+'{'+ c +'}');
					}
					return str.join('');
				}
				
				,objectToString : function(obj,isChange){
					var c = '';
					for(var k in obj){
						var _k = !isChange?this.getCssKey(k):k;
						c += _k+':'+obj[k]+';'
					}
					return c.slice(0,-1);
				}
				
				,getCssKey :function(str){
					switch(str){
					    case 'backgroundRepeat' : return 'background-repeat';

						case 'backgroundAttachment' : return 'background-attachment';

						case 'backgroundImage' :return 'background-image';

						case 'backgroundPosition' : return 'background-position';

						case 'backgroundColor' : return 'background-color';
						
						default : return str;
					}
				} 
        
		
		
		}});
    });

    //
    //
    //
    X.use('pipeMgr')
        // 导航栏
        .reg('common.siteNav', {
            onViewReady : function(){
                var ui = this.getUI();
                // 缓存上一个未读数
                var preUnread = [];
                // 缓存提示结点
                var jqNodes;
                
                // 监听未读数
                X.on('api.unread', function(e){
                    if(e.isOk()){
                        if(!ui.jqNewWb){
                            ui.jqExtra('referMe', 'myCmt', 'myMsg', 'myNotice');
                            jqNodes = {1:ui.jqReferMe, 2: ui.jqMyCmt, 4:ui.jqMyMsg, 5:ui.jqMyNotice};
                        }
                        var unread = e.getData().unread;
                        // 只更新需要更新的结点
                        for(var i=0;i<unread.length;i++){
                            if(preUnread[i] !== unread[i]){
                                var nd = jqNodes[i];
                                if(nd){
                                    nd.cssDisplay(unread[i]);
                                    if(unread[i])
                                        nd.find('#t').text(unread[i]);
                                }
                            }
                        }
                        preUnread = unread;
                    }
                });
            }
        })
        // 用户介绍区
        .reg('common.userPreview',{
            onViewReady : function(){
                var self = this;
                // 微博更新时，监听计数变化
                X.on('api.update', function(e){
					if(e.isOk()){
						var countMarker = self.getUI().jq('#xwb_user_total_wb');
						countMarker.text(parseInt(countMarker.text())+1);
					}
                 })
                 .on('api.destroy', function(e){
					if(e.isOk()){
						var countMarker = self.getUI().jq('#xwb_user_total_wb');
						countMarker.text(parseInt(countMarker.text())-1);   
					}					
                 });
            }
        })
        // 微博框发布
        .reg('input', {
            ui : X.mod.PostBase,
            onViewReady : function(){
                // 调用PostBase.initEx作额外初始化
                this.getUI().initEx();
            }
        })
        
        // 通用微博列表模块
        .reg('wblist', WBPipe)
        
        // 个人微博列表
        .reg('weibo.weiboList', function(){
            return new WBPipe({
                // 指定该pagelet的ui类配置
                ui : {cls:X.mod.WeiboList, syncList:true}
            });
        })
        // 我|TA的微博列表
        .reg('weibo.userTimelineList', function(){
            // 如果是“我的微博，实时同步微博列表”
            var syncList = getCfg('page')=='index.profile';
            return new WBPipe({
                // 指定该pagelet的ui类配置
                ui : {cls:X.mod.WeiboList, syncList:syncList}
            });
        })
        // 用户搜索模块
        .reg('common.searchMod', function(){
            return new Pagelet({
                onViewReady : function(){
                    // 光标聚焦
                    var iptEl = document.getElementById('k');
                    if(iptEl)
                        Util.focusEnd(iptEl);
    			    
    			    // 绑定提交事件
                    $('#searchForm').bind('submit', function(){
                        var k = $.trim($('#k').val());
                        if(!k){
                            $('#searchTip').cssDisplay(true);
                            $('#k').focus();
                            return false;
                        }
                    });
                    
        			$('#searchBtn').click(function(){
        			    // 不多于15汉字长度
                        var k = X.util.byteCut($.trim($('#k').val()), 30);
                        if(k){
                            $('#searchForm').submit();
                        }else {
                            $('#searchTip').cssDisplay(true);
                            $('#k').focus();
                        }
                        return false;
                    });
                    var ui=this.getUI();
                   	X.on('subrefresh',function(d){
                    	if( ui.jq('.search-field').attr('rel').split(':')[1] == d.subject )
                    	{
                    		var rel= ui.jq('.search-field span:last a').attr('rel');
                    		if(rel=='e:delSubject' || rel== 'e:addSubject')
                    		{
                    			if(d.type == 'add'){
                    				ui.jq('.search-field span:last').replaceWith('<span>已关注(<a href="javascript:;" rel="e:delSubject">取消关注</a>)</span>');
                    			} else {
                    				ui.jq('.search-field span:last').replaceWith('<span class="icon-follow"><a href="javascript:;" rel="e:addSubject">关注该话题</a></span>');
                    			}
                    		}
                    	}
                    });
                }
            });
        })
        
        // 搜索综合列表
        .reg('user.fameList', function(){
            return new Pagelet({
                onViewReady : function(){
                    this.getUI().jq().highlight($('#k').val());
                }
            });
        })
        // 搜索用户列表
        .reg('user.userSearchList',function(){
            return new Pagelet({
            	ui:{
            		actionMgr:true,
            		onactiontrig : function(e){

                           switch(e.data.e){
                               case 'allTag' :
                                e.lock(1)
                               	Req.postReq(Req.apiUrl('action','getTags'),{uid:e.get('u')},function(r){
                               		if(r.isOk()){
                               			var arr=r.getData(),dom= $(e.src);
                               			$(arr).each(function(){
                               				var key;
                               				for(var tmp in this) { key = this[tmp];}
                               				if( key == $('#k').val()) return;
                               				dom.after('<a href="'+ Req.mkUrl('search','user&',{ut:'tags',k:key}) +'">'+ key +'</a>');
                               			});
                               			dom.remove();
                               		} else {
                               			
                               		}
                               		e.lock(0);
                               	});
                              default :
                               	e.stopPropagation(false);
                           }
            		}
            	},
                 onViewReady : function(cfg){
                 	var key = $('#k').val(),
                 		ui = this.getUI();
                 	switch (cfg.data.type){
                 		case 'tags' : ui.jq('li p.tag').highlight(key); break;
                 		case 'sintro' : ui.jq('li div.u-info').highlight(key).highlight(key); break;
                 		case 'nick' : ui.jq('li a.u-name').highlight(key).highlight(key); break;
                 	}
                    
                 }
            });
        })
        //综合搜索用户列表
        .reg('user.userSearchPreview',function(){
            return new Pagelet({
                 onViewReady : function(){
                    this.getUI().jq().highlight($('#k').val());
                 }
            });
        })
        // 搜索微博列表
        .reg('weibo.weiboOnly', function(){
            return new WBPipe({
                onViewReady : function(){
                    WBPipe.prototype.onViewReady.apply(this, arguments);
                    this.getUI()
                        .jq('#xwb_weibo_list_ct')
                        .highlight($('#k').val());
                }
            });
        })
        // 我的关注
        .reg('user.followersList', function(){
             return  new Pagelet({
                   ui : {
                       cls:X.mod.HoverList,
                       itemSelector:'ul li',
        			   onMouseOver: function() {
        			        $(this).find('#removeFans,#sendMsg').removeClass('hidden');
        			   },
        			   onMouseOut: function() {
        			    	$(this).find('#removeFans,#sendMsg').addClass('hidden');
        			   },
                       actionMgr:true,
                       onactiontrig : function(e){
                           switch(e.data.e){
                               case 'ufl' :
                                   var uid = e.get('u'), name = e.get('n');
                                   Box.confirm('提示', '确定要取消关注' + name + '?', function (btnId) {
                                       if (btnId === 'ok') {
                                           e.lock(1);
                                           X.request.unfollow(uid, '', function (ret) {
                                               if (ret.isOk()) {
                                                   // e.jq()用法参见文档
                                                   var jqEl = e.jq('u');
                                                   jqEl.slideUp(500, function () {
                                                       e.lock(0);
                                                       jqEl.remove();
                                                   });
                                               } else {
                                                    e.lock(0);
                                                    Box.tipWarn(ret.getMsg());
                                               }
                                           });
                                       }
                                   });
                               break;
                               default :
                               e.stopPropagation(false);
                           }
                       }
                   }
             });
        })
        // 具体微博页面
        .reg('weibo.detail', function(){
            return new WBPipe({
                onViewReady : function(v){
                    WBPipe.prototype.onViewReady.apply(this, arguments);
                    var jq = this.getUI().jq('#xwb_cmt_list');
                    var wbId = jq.attr('wbid');
                    var wbUid = X.cfg.wbList[wbId].u.id;
                    var area = this.getUI().jq('#topCmtBox');
                    var cmtArea = X.use('MBlogCmtArea', {
                        view : jq[0],
                        wbId : wbId,
                        wbUid : wbUid,
                        topCmtBox : area[0],
        				faceSize: 50
                    });
                    cmtArea.display(true).load();
                }
            });
        })
        // 我的私信
        .reg('common.message', function(){
            return new Pagelet({
                onViewReady : function(v){
                    // mouseover 显示 删除
                    this.jq('#messageList li').hover(function(e){
                        $(this).find('#del').cssDisplay(true);
                    }, function(e){
                        $(this).find('#del').cssDisplay(false);
                    });
                    
                    // 发送私信后刷新页面
                    X.on('api.sendDirectMessage', function(e){
                        if(e.isOk())
                            location.reload();
                    });
                }
            });
        })
        
        // 我的评论页，MyCmt类在mycomments.js中
        // 此时X.mod.MyCmt还未加载，所以放到一个函数中返回，
        // 当调用的时候就加载好了
        .reg('weibo.comments', function(){
            return new Pagelet( { ui:{ cls:X.mod.MyCmt } } );
        })
        
        // 我的粉丝列表
        .reg('user.fansList', function(){
            return new Pagelet({
                ui:{ 
                    cls:X.mod.HoverList,
                    itemSelector:'ul li',
    				onMouseOver: function() {
    					$(this).find('#removeFans,#sendMsg').removeClass('hidden');
    				},
    				onMouseOut: function() {
    					$(this).find('#removeFans,#sendMsg').addClass('hidden');
    				}
    			}
            });
        })
        // 名人堂批量关注
        .reg('user.outputCelebUserBlock', function(){
            return new Pagelet({
                ui : {
                    selectedCS:'current',
                    actionMgr : true,
                    onactiontrig : function(e){
                        switch(e.data.e){
                            // 选择关注
                            case 'ck' :
                                var jqIcon = e.jq('u').find('#pic');
                                if(jqIcon.hasClass(this.selectedCS))
                                    jqIcon.removeClass(this.selectedCS);
                                else jqIcon.addClass(this.selectedCS);
                            break;
                            // 全选
                            case 'sa':
                                var checked = e.src.checked;
                                var cs = this.selectedCS;
                                this.jq('#pic').each(function(){
                                    $(this).checkClass(cs, checked);
                                });
                                // 让checkbox可选
                                e.preventDefault(false);
                            break;
                            // 关注已选
                            case 'submit' : 
                                var ids = [];
                                var cs = this.selectedCS;
                                var rel;
                                this.jq('#pic').each(function(){
                                    if($(this).hasClass(cs)){
                                        rel = X.ax.ActionMgr.wrapRel(this);
                                        ids.push(rel.get('u'));
                                    }
                                });
                                if(!ids.length){
                                    Box.tipWarn('请选择您要关注的人。');
                                }else {
                                    Req.follow(ids.join(','), 0, function(r){
                                        if (r.isOk()) {
                                            $(e.src).replaceWith('<span class="followed-btn">已关注</span>');
                                        } else {
                                            Box.tipWarn(r.getMsg());
                                        }
                                        e.lock(0);
                                    });
                                }                       
                            break;
                        }
                    }
                }
            });
        })
        // 首次登录时“我的”页面推荐用户批量关注
        .reg('user.hotUser', function(){
            return new Pagelet({
                onViewReady:function(){
                    var self = this,
                        rel,
                        lock;
                        
                    this.jq('#followall-btn').click(function(){
                        // 只关注一次
                        if(lock)
                            return false;
                        
                        var ids = [], 
                            uid;
                        self.jq('li').each(function(){
                            rel = X.ax.ActionMgr.wrapRel(this);
                            uid = rel.get('u');
                            if(uid)
                                ids.push(uid);
                        });
                        if(ids.length){
                            lock = true;
                            Req.follow(ids.join(','), 0, function(r){
                                lock = r.isOk();
                                if(lock){
                                    self.jq('a[name=follow]')
                                        .replaceWith('<span class="followed-btn">已关注</span>');
                                }
                            });
                        }
                        return false;
                    });
                }
            });
        })
        // 换肤
//        .reg('common.userSkin', function(){
//            return new Pagelet({
//                ui : {
//                    cls:X.mod.Skin,
//                    tab:{ 
//                        selectedCS:'current', 
//                        items: $('#tabItems>span'), 
//                        contents:$('#tabPanels>div')
//                    }
//                }
//            });
//        })
        // 用户组TAB切换
        .reg('category_user', function(){
            return new Pagelet({
                onViewReady:function(){
                    // tab切换
                    X.use('Switcher', {
                		items : this.jq('div.tab-s4>a'),
                		contents : this.jq('div.column-body'),
                		selectedCS: 'current'
                	});
                }
            });
        })
        
        // 热门评论与转发切换页
        .reg('component/component_1.run', function(){
            return new Pagelet({
                onViewReady : function(){
                    var ui = this.getUI();
            		X.on('pipe.end', function(){
                        X.use('Switcher', {
                			items : ui.jq('div.tab-s2>span'),
                			contents : ui.jq('div.hot-mblog-body'),
                			selectedCS: 'current'
                		});
            		});
                }
            });
        })
        
        // 热门评论
        .reg('component/component_common.hotWB_getComment', function(){
            return new WBPipe({
                // 重写该方法，更新其它计数区域
                renderWeiboCounter : function(jq, cntd){
                    WBPipe.prototype.renderWeiboCounter.apply(this, arguments);
                    if(cntd[0]){
                        var count = cntd[0];
                        if(count>=100000) {
                           var n = count / 10000 >> 0;
                           if (n > 0) {
                              var m = (count % 10000) / 10000 >> 0;
                              m = m > 0 ? "." + m : "";
                              count = "" + n + m + "万"
                           }
                        }
                        jq.find('#hotNum').text(count);
                    }
                }
            });        
        })
        
        // 热门转发
        .reg('component/component_common.hotWB_getRepost', function(){
            return new WBPipe({
                // 重写该方法，更新其它计数区域
                renderWeiboCounter : function(jq, cntd){
                    WBPipe.prototype.renderWeiboCounter.apply(this, arguments);
                    if(cntd[1]){
                        var count = cntd[1];
                        if(count>=100000) {
                           var n = count / 10000 >> 0;
                           if (n > 0) {
                              var m = (count % 100000) / 10000 >> 0;
                              m = m > 0 ? "." + m : "";
                              count = "" + n + m + "万"
                           }
                        }
                        jq.find('#hotNum').text(count);
                    }
                }
            });        
        })
        // 同城微博
        .reg('component/component_8.run', function(){
			return new WBPipe({
			    onViewReady : function(cfg){
			        WBPipe.prototype.onViewReady.apply(this, arguments);
			        
			        // 选择城市浮层
			        // 定制页需要这两个参数
			        var route  = cfg.data.currRoute;
			        var pageId = cfg.data.page_id;
			        var layer = X.use('Layer', {
        					closeable: true,
        					contextable: true,
        					view: this.jq('#win_city')[0],
        					onViewReady: function() {
        						Req.getProvinces(Util.bind(this.onDataLoaded, this));
        						var self = this;
        						// 选择城市后关闭
        						this.jq('#citys').click(function(e){
        						    if(e.target.tagName == 'A')
        						        self.close();
        						});
        					},
        
        					//省份加载完成后
        					onDataLoaded: function(e) {
        						if (e.isOk()){
        							this.provinces = e.getData().provinces;
        							var self = this;
        							this.jq('#sel-area').change(function() {
        								self.changeProvince(this.value);
        							});
        						}
        					},
        
        					changeProvince: function(id) {
        						if (this.provinces){
        							var self = this;
        							$.each(this.provinces, function(i, row) {
        								if (row.id == id){
        									var htmls = [];
        									$.each(row.citys, function(k, ct) {
        										var ctKey,ctName;
        										for (var k in ct ){
        											ctKey = k;
        											ctName = ct[k];
        										}
        										var url = Req.mkUrl(route, '', Util.queryString({page_id:pageId, province:id, city: ctKey + '#city'}));
        										htmls.push('<a href="' + url + '">' + ctName + '</a>');
        									});
        									self.jq('#citys').html(htmls.join(''));
        									return false;
        								}
        							});
        						}
        					}
        		    });
        		    this.jq('#cityBtn').click(function() {
        		        layer.display(true);
        				return false;
        		    });
			    }
			});
        })
        //快速添加话题
       .reg('common.subjectFollowed',function(){
       	    return new Pagelet({
                onViewReady : function(){
                    var ui = this.getUI();
                   	var liHover = function (t){
	    				$(t).hover(function(){
	    					$(this).attr('class','li-hover');
							$(this).append('<div class="li-bg" id="BG"></div>');
	    					$(this).find('span').removeClass('hidden');
	    				},function(){
	    					$(this).removeClass('li-hover');
	    					$(this).find('span').addClass('hidden');
							$(this).find("#BG").remove();
	    				});
	    			}
                    X.on('subrefresh',function(){
                    	Req.postReq(Req.apiUrl('action','getAllSubject'),{},function(r){
	    					if(r.isOk()){
	    						$('#subjectCount ul li').remove();
                                var data = r.getData();
                                
	    						for(var i=0, l=data.length; i < l; i++) {
                                    var subject = data[i].subject;
                                    var href = Req.mkUrl('search', 'weibo', {k: subject});
	    							$(' <li rel="subject:' + subject + '"><a href="' + href +'" target="_blank">' +  subject + '</a> <span class="close hidden" rel="e:deleteSubject" title="删除">x</span> </li>').appendTo($('#subjectCount ul'));
                                }
                                
				    			$('#subjectCount ul li').each(function(){
				    				liHover(this);
				    			});
				    			$('#subjectCount').prev('div.hd').find('h3 span').html('('+ r.getData().length +')');
	    					} else {
	    						Box.alert('提示',r.getError());
	    					}
	    				});
                    });
            		X.on('pipe.end', function(){
			    			$('#subjectCount ul li').each(function(){
			    				liHover(this);
			    			});
			    			X.use('action').reg('deleteSubject',function(e){
			    				var self=$(e.src);
			    				e.lock(1);
			    				Req.postReq(Req.apiUrl('action','deleteSubject'),{text:e.get('subject')},function(r){
			    					if(r.isOk()){
			    						X.fire('subrefresh',{'subject':e.get('subject'),type:'del'});
			    					} else {
			    						Box.alert('提示',r.getError());
			    					}
			    					e.lock(0);
			    				});
			    			});
			    			var addBox=null;
			    			$('#addSubject').click(function(){
			    				if(!addBox){
				    				addBox=X.use('addFollow',{
				    				  appendTo:$('#subjectCount').parent()
				    				});
				    			} else {
				    				addBox.display(true);
				    			}
			    			});
            		});
                }
            });
       })
       //活动详细页面
       .reg('event.eventinfo',function(){
       	    return new Pagelet({
                ui : {
                    actionMgr : true,
                    onactiontrig : function(e){
                    	//分享微博框
                    	var sendWeiBo = function(e,m1) {
                    			var box = X.use('postBox');
							    var text = m1 || e.get('m');
							    box.display(true)
							       .reset()
							       .selectionHolder.setText(text||'');
							    if(text)
							        box.checkText();
                    	};
                    	var ActObj=e;
                    	switch(e.get('e')){
                    		case 'join':
                    			if(e.get('other') == '1' ){
	                    			Req.eventJoin({eid:e.get('eid')},function(r){
	                    				if(r.isOk()){
	                    					Box.tipOk('参加成功！',function(){
	                    						sendWeiBo(ActObj);
	                    					});
	                    					$(e.src).replaceWith('<a class="has-join-btn" href="#">已参加</a>');
	                    				} else {
	                    					Box.tipWarn(r.getError());
	                    				}
	                    			});
                    			} else {
                    				//填写活动参与者的详细信息
                    				X.use('Box',{
                    					contentHtml:'evevtApplicants',
                    					actionMgr : true,
                    					cs:'win-apply win-fixed',
                    					closeable:true,
                    					title:'报名申请',
                    					appendTo:document.body,
                    					mask:true,
                    					autoCenter:true,
                    					onViewReady:function(){
                    						var self=this;
                    						this.jq('#contact,#note').keydown(function(){
                    							self.jq('.tips').removeClass('hidden');
                    							self.jq('.warn').addClass('hidden');
                    						})
                    					},
                    					onactiontrig : function(e){
                    						switch(e.data.e){
                    							case 'sd':
                    								if(this.jq('#contact').val() == ''){
                    									this.jq('.tips').addClass('hidden');
                    									this.jq('.warn').removeClass('hidden').html('请输入联系方式！');
                    									return;
                    								}
													if($.trim(this.jq('#note').val()) == ''){
													    this.jq('.tips').addClass('hidden');
                    									this.jq('.warn').removeClass('hidden').html('请填写备注');
                    									return;
													}
                    								if( Util.calWbText(this.jq('#note').val(),100) < 0 ){
                    									this.jq('.tips').addClass('hidden');
                    									this.jq('.warn').removeClass('hidden').html('备注长度超过100！');
                    									return;
                    								}
                    								var self=this;
                    								Req.eventJoin({ eid:ActObj.get('eid'),other:'2',
                    												contact:this.jq('#contact').val(),
                    												note:this.jq('#note').val()
                    											  },function(r){
									                    				if(r.isOk()){
									                    					Box.tipOk('参加成功！',function(){
									                    						sendWeiBo(ActObj);
									                    						self.close();
									                    					});
									                    					$(ActObj.src).replaceWith('<a class="join-btn-disabled" href="#">我要参加</a>');
									                    				} else {
									                    					Box.tipWarn(r.getError());
									                    				}
									                    			 }
									                    			);
                    								break;
                    						}
                    					}
                    				}).display(true);
                    			}
                    			break;
                    		case 'sd' :
                    			sendWeiBo(ActObj,ActObj.get('m1'));
                    			break;
                    		default :
                    				e.stopPropagation(false);
                    	}
                    }
                }
       	    });
       })
       //活动评论区域
       .reg('event.eventinput',function(){
			return new Pagelet({
				ui:{
                	actionMgr : true,
                	exceedCS:'out140',
                    onactiontrig : function(e){
                    	switch(e.data.e){
				            // 点击发送
				            case 'sd' :
				                this.send(e.get('eid'),e.get('a'),e);
				            break;
				            case 'ic':
				                 X.use('emotion')
				                  .setSelectionHolder( this.selectionHolder , this.checkText, this)
				                  .showAt(e.src);
				            break;
                    	}
                    },
                    onViewReady:function(){
                    	this.jqExtra('inputor', 'warn');
                    	var self=this;
                    	this.jqInputor.bind('keyup', function(e){
				             self.checkText();
				        })
                    	this.selectionHolder = X.use('SelectionHolder', {elem:this.jqInputor[0]})
                        this.checkText();
                    },
                    send: function(eid,doAction,e){
                    	e.lock(1);
                    	if(this.checkText()){
	                    	Req.postReq(Req.apiUrl('action','update'),{'extra_params[event_id]':eid,doAction:doAction,text:this.jqInputor.val()},function(r){
	                    		if(r.isOk()){
	                    			Box.tipOk('发布成功',function(){
	                    				window.location.reload();
	                    			})
	                    		} else {
	                    			Box.tipWarn(r.getMsg());
	                    		}
	                    		e.lock(0);
	                    	})
                    	} else {
                    		e.lock(0);
                    		this.jqInputor.focus();
                    	}
                    },
                    checkText:function(){
                    	var ipt = this.jqInputor, val = $.trim( ipt.val() );
				        var left = Util.calWbText(val);
				        if (left >= 0)
				            this.jqWarn.html('还可以输入'+left+'个字').removeClass(this.exceedCS);
				        else
				            this.jqWarn.html('已超出'+Math.abs(left)+'个字').addClass(this.exceedCS);
				 
				        return left>=0 && val;
                    }
                }
			});
       });
})(Xwb, $);