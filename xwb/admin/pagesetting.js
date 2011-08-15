var mkUrl = Xwb.util.getBind(Xwb.request,'mkUrl');
var _lock = 1;

$(function(){
	$('#left > div,#right > div').each(function(i){
			$(this).attr('flag',i);
	})
	$('#right > div[data],#left > div[data] ').each(function(){
		$(this).hover(function(){
			$(this).addClass('mouseover');
		},function(){
			$(this).removeClass('mouseover');
		})
		$(this).draggable({ 
			axis:'y',
			cursor:'move',
			cancel :'a',
			handle :'h4',
			helper : 'clone',
			stop:function(e,o){
				var sthis = o.helper,
				top = o.offset.top - sthis.parent().offset().top,
				all = sthis.parent().find('div[flag]:not([rel])'),
				length = all.length ,
				height = 29 , margin = 8 ,flag=true,insert,now;
				for(var i=0; i<length; i++){
					var thisTop= (i+1) * margin  + height * i + height / 2;
					if( $(all[i]).attr('flag') == $(this).attr('flag')){ now = i; continue;}
					if(flag && top <= thisTop){
							flag = false;
							insert = i;
					} 
				}
				if(flag){ insert = i; }
				sthis.parent().find('div[rel="tmp"]').remove();
				sthis.parent().find('div[rel="move"]').remove();
				$(this).css({ opacity:'',filter:'',height:'' });
				if( insert == now + 1 || insert == now) return;
				if( !$(all[insert]).attr('data') && insert != length) {return; }
				Xwb.gModified = false ;
				if( insert != length )  $(all[insert]).before(this);
				else $(all[length-1]).after(this);
			},
			drag:function(e,o){
				var sthis = o.helper,
				top = o.offset.top - sthis.parent().offset().top,
				all = sthis.parent().find('div[flag]:not([rel])'),
				length = all.length ,
				height =  29 , margin = 8 ,flag=true,insert,now;
				sthis.parent().find('div[rel="move"]').remove();
				for(var i=0; i<length; i++){
					var thisTop= (i+1) * margin  + height * i + height / 2;
					if( $(all[i]).attr('flag') == $(this).attr('flag')){ now = i; continue;}
					if(flag && top <= thisTop){
							flag = false;
							insert = i;
					} 
				}
				if(flag){ insert = i; }
				if( insert == now + 1 || insert == now) return;
				if( !$(all[insert]).attr('data') && all[insert] ) { return; }
				var move=$('<div rel="move"></div>').css({border:'1px dashed red',width:$(this).width()-2,height:27 });
				if( insert != all.length ) $(all[insert]).before(move);
				else $(all[length-1]).after(move);
			},
			start:function(e,o){
				$(this).before($('<div rel="tmp"></div>').css({border:'1px dashed #000',width:$(this).width()-2,height:27 }));
				$(this).css({ opacity:0,filter:'alpha(opacity=100)',height:'0' });
				o.helper.attr('rel','helper').css('width',$(this).width()-2).addClass('mousedown').removeClass('mouseover');
			}
		});
	});
	
	$( "div" ).disableSelection();
	
	//保存排序
	$('#saveSort').click(function(){
		var main=[],side=[];
		$('#left > div').each(function(){
			main.push($(this).attr('data'));
		});
		$('#right > div').each(function(){
			side.push($(this).attr('data'));
		});
		Xwb.request.postReq( mkUrl('mgr/page_manager','savesort','page_id='+pageID),
							{main:main.join(','),side:side.join(',')},
							function(r){
								if(r.isOk()){
									Xwb.gModified = true ;
									location.reload();
								} else {
									Xwb.ui.MsgBox.alert('提示',r.getMsg());
								}
							}
					)
	})
	
	});
			
	function openPop(url,title,component_id) {
		if ( _lock !== 1 ) return ;
		_lock = 0;
		window.popWin=Xwb.use('MgrDlg',{
			modeUrl:url,
			formMode:true,
			valcfg:{
				form:'AUTO',
				trigger: '#submitBtn'
			},
			dlgcfg:{
				onViewReady:function(View){
					var self=this;
					$(View).find('#pop_cancel').click(function(){
						self.close();
					});
				},
				destroyOnClose:true,
				actionMgr:false,
				title:title
				//,cs : 'win-fixed'
			},
			afterDisplay:function(){
				_lock = 1;
				// label radio 特殊处理
				labelfun(this.dlg.view);
			   if(component_id == 11){
					popWin.dlg.jq("#submitBtn").unbind('click');
					popWin.dlg.jq("#submitBtn").click(sp_submit);
				}
				if( component_id == 3 || component_id == 2 ){
					popWin.dlg.jq().attr('class','win-pop win-fixed add-sort');
					Recom.call(popWin.dlg);
				}
				if(component_id == 5 ){
					popWin.dlg.jq().attr('class','win-pop win-fixed add-sort');
					WeiboList.call(popWin.dlg);
				}
				var modeObj =  Xwb.util.dequery(this.modeUrl);
				if(modeObj.group_id){
					this.dlg.jq('#groupID').val(modeObj.group_id);
				}
				autoHeight(this);
			}
		});
	}
	//自适应高度
	function autoHeight(sthis){
		if(parseInt(sthis.dlg.jq('.form-box').height())> 384 ){
				sthis.dlg.jq('.form-box').height(384)
		} 
	}
	//component_id等于11特殊处理
	function sp_submit(){
		$.ajax({
			url:popWin.dlg.jq("form:eq(0)").get(0).action,
			data:{ 'data[component_id]':11,'data[title]':popWin.dlg.jq("[name='data[title]']").val(),'page_id':pageID },
			type:"post",
			success:function(e){
				if(e.errno==0){
					popWin.dlg.close();
					openPop(mkUrl('mgr/page_manager','editComponentView','page_id='+pageID+ '&id='+e.rst),'分类用户推荐设置',11);
					popWin.dlg.close=function(){
						window.location.reload();
					}
				}
			}
		})
		return false;
	}
	
	function newPop(url,title,width) {
		if ( _lock !== 1 ) return ;
		_lock = 0;
		window.newWin=Xwb.use('MgrDlg',{
			modeUrl:url,
			dlgcfg:{
				width:width,
				destroyOnClose:true,
				title:title,
				view:'Box',
				cs:'win-fixed add-links',
				onViewReady:function(view){
					$(view).find('#tabMain > ul').addClass('hidden');
					$(view).find('#tabHead > a').each(function(i){
						$(this).click(function(){
							$(view).find('#tabMain > ul').addClass('hidden');
							$(view).find('#tabHead > a').removeClass('current');
							$(view).find('#tabMain > ul:eq('+i+')').removeClass('hidden');
							$(this).addClass('current');
						});
					});
					$(view).find('#tabMain > ul > li').hover(function(){
						$(this).addClass('selected');
					},function(){
						$(this).removeClass('selected');
					})
					$(view).find('#tabHead > a:eq(0)').addClass('current');
					$(view).find('#tabMain > ul:eq(0)').removeClass('hidden');
					$(view).css({'marginLeft':'-346px'});
				}
			},
			actiontrig:function(e){
				switch (e.get('e')){
					case 'openPop':
						this.dlg.close();
						openPop(e.get('url'),e.get('title'),e.get('component_id'));
						break;
				}
			},
			afterDisplay : function(){
				_lock = 1;
			}
		})
	}
	// label radio 特殊处理
	function labelfun(s){
			$('input[type="radio"]',s).change(function(){
			if( ! this.checked ) return; 
			var self=this;
			if($(this).parent()[0].nodeName.toLowerCase() == "p"){
					$('input[type="radio"][name="'+this.name+'"]',s).each(function(){
						var tt=$(this).parent().find('input[type="text"]:eq(0)');
						if(self==this) tt.removeAttr('disabled');
						else tt.attr('disabled','disabled').val('');
					});
					$(this).parent().find('input[type="text"]:eq(0)').focus();
			}
		});
	}
	Xwb.use('action').reg('add',function(e){
		var _data=e.q;
		Xwb.use('MgrDlg',{
			dlgcfg:{
				title:'添加新类别',
				destroyOnClose:true,
				width:300
			},
			valcfg:{
				form:"#cateform"
			},
			ajaxcfg:{
				type:"post"
			},
			convertData:function(data){
				return { 'op':'add' , 'item_id':this.dlg.jq('#select').val(), 'item_name':this.dlg.jq('#content').val(),'group_id':_data[2].data['group_id'] }
			},
			url: mkUrl('mgr/page_manager','doComponent11Edit'),
			modeUrl: mkUrl('mgr/page_manager','component11EditView'),
			success:function(ret,dlg){
				if (ret.errno == '11013'){
					Xwb.ui.MsgBox.alert('提示','已存在该类！');
				} else {
					dlg.close();
					window.popWin.reload();
				}
			}
		});
	})
	.reg('edit',function(e){
		var _data=e.q;
		Xwb.use('MgrDlg',{
			dlgcfg:{
				title:'编辑新类别',
				destroyOnClose:true,
				width:300
			},
			valcfg:{
				form:"#cateform"
			},
			ajaxcfg:{
				type:"post"
			},
			convertData:function(data){
				return { 'op':'edit' , 'item_id':this.dlg.jq('#select').val(), 'item_name':this.dlg.jq('#content').val(),'id':_data[1].data.id,'group_id':_data[1].data['group_id'] }
			},
			url: mkUrl('mgr/page_manager','doComponent11Edit'),
			modeUrl: mkUrl('mgr/page_manager','component11EditView'),
			success:function(ret,dlg){
				if (ret.errno == '11013'){
					Xwb.ui.MsgBox.alert('提示','已存在该类！');
				} else {
					dlg.close();
					window.popWin.reload();
				}
			},
			afterDisplay:function(){
				this.dlg.jq('#content').val(_data[1].data.name);
				this.dlg.jq('#select option').each(function(){
					if(this.value == _data[1].data.item){
						this.selected=true;
					}
				})
			}
		});
	})
	.reg('del',function(e){
		var data=e.q;
		Xwb.ui.MsgBox.confirm('提示','确认要删除吗？',function(e){
			if(e === 'ok'){
				$.ajax({
					url: mkUrl('mgr/page_manager','doComponent11Edit'),
					data: {'id':data[1].data.id, 'op':'del','group_id':data[1].data['group_id']},
					type: 'post',
					dataType: 'json',
					cache: false,
					success: function(ret) {
						if (ret.errno == 0)
						{
							window.popWin.reload();
						}
					}
				})
			}
		})
	});
	//下面为浮层内部调用的js 请保留
	function preview(o) {
		$('#preview_loading').show();
		$('#img_form')[0].submit();
	}
					
	function uploadFinished(state, url) {
		$('#img_form').get(0).reset();
		$('#preview_loading').hide();
		if (state != '200') {
			alert(state);
			return;
		}

		$('#img_preview img').attr('src', url);
		$('#img_preview').show();
		$('#imgSrc').val(url);
	}
	
	function showSelectList() {
		$('[rel="add5"]').hide();
		$('[rel="sel5"]').show();
	}

	function newList(){
		$('[rel="add5"]').show();
		$('[rel="sel5"]').hide();
	}
	function txtBlur(){
		var sthis=$("#newListName");
		if($.trim(sthis.val())==""){
			sthis.val('输入微博列表名称');
			sthis.addClass("keyword-tips");
		} else {
			if( $.trim(sthis.val()) == "输入微博列表名称" ){ return false; }
			var flag=true;
			$("#listIdSelect option").each(function(){
				if($(this).html() == $.trim(sthis.val())){
					flag=false;
				}
			});
			
			if(!flag) {
				$('#newListNameErr').removeClass('hidden');
				return false;
			} 
		}
	}

 	function newListNameFocus(e){
		var sthis=$(e);
		sthis.removeClass("keyword-tips");
		$('#newListNameErr').addClass("hidden");
		if($.trim(sthis.val())=="输入微博列表名称"){
			sthis.val('');
		}
		popWin.selfChk=txtBlur;
	}
	
	//推荐用户分组
	function Recom(){
		var Util = Xwb.util,
			Box = Xwb.ui.MsgBox,
			self=this,
			Req=Xwb.request,
			flag = true,
			group_id = self.jq('select[name="param[group_id]"]').val();
		var mgr = new Xwb.ax.ActionMgr();
		mgr.bind(this.jq('#addTable'));
		mgr.reg('addUser',function(e){
				var trObj = $(e.src).parent().parent('tr'),nickname = trObj.find('#nickname'),remark=trObj.find('#remark');
				if(nickname.val()=='') return;
				nickname.unbind('focus');
				nickname.focus(function(){
					if( !flag ){
						trObj.find(".tips-error").cssDisplay(false);
						flag = true;
					}
				});
				if( group_id == '0') {
					trObj.find(".tips-error").cssDisplay(true).html('请选择数据来源');
					return ;
				}
				e.lock(1);
				Req.postReq(Req.mkUrl('mgr/user_recommend','addReUser')+"&json=1",{ group_id:group_id,nickname:nickname.val(),remark:remark.val()},
					function(r){
						if(r.isOk()){
							trObj.before(['<tr rel="u:'+r.getData().uid+'">',
											'<td><span class="user-pic"><img src="'+r.getData().profile_img+'"></span></td>',
											'<td><p class="text">'+nickname.val()+'</p></td>',
											'<td><p class="text">'+remark.val()+'</p></td>',
											'<td>',
											'	<a rel="e:Uedit" class="icon-edit">编辑</a>',
											'	<a rel="e:Udel" class="icon-del">删除</a>',
											'</td>',
											'</tr>'].join(''));
											nickname.val(''); 
											remark.val('');	
											autoHeight(window.popWin);
						} else {
							trObj.find(".tips-error").cssDisplay(true).html(r.getError());
							flag = false;
						}
						e.lock(0);
					});
		})
		.reg('submit',function(e){
			e.lock(1);
			var trObj = $(e.src).parent().parent('tr') ,remark=trObj.find('#remark');
			Req.postReq(Req.mkUrl('mgr/user_recommend','setUserRemark')+"&json=1",{group_id:group_id,uid:e.get('u'),remark:remark.val()},
				function(r){
					if(r.isOk()){
						trObj.find('td:eq(2)').html('<p class="text">'+ remark.val() +'</p>');
						$(e.src).next('a').replaceWith('<a href="javascript:;" rel="e:Udel" class="icon-del">删除</a>');
						$(e.src).replaceWith('<a href="javascript:;" rel="e:Uedit" class="icon-edit">编辑</a>');
					} else {
						Box.error('提示',r.getError());
					}
					e.lock(0);
				});
		})
		.reg('Uedit',function(e){
			var trObj = $(e.src).parent().parent('tr');
			trObj.find('p:eq(1)').replaceWith('<input value="'+trObj.find('p:eq(1)').html()+'" id="remark" type="text"  class="input-txt txt-s1"/>');
			$(e.src).next('a').replaceWith('<a href="javascript:;" rel="e:cal" class="icon-del">取消</a>');
			$(e.src).replaceWith('<a href="javascript:;" rel="e:submit" class="icon-confirm">确定</a>');
		})
		.reg('cal',function(e){
			var trObj = $(e.src).parent().parent('tr'),nickname = trObj.find('#nickname'),remark=trObj.find('#remark');
			trObj.find('td:eq(2)').html('<p class="text">'+ remark.val() +'</p>');
			$(e.src).prev('a').replaceWith('<a href="javascript:;" rel="e:Uedit" class="icon-edit">编辑</a>');
			$(e.src).replaceWith('<a href="javascript:;" rel="e:Udel" class="icon-del">删除</a>');
		})
		.reg('Udel',function(e){
			e.lock(1);
			Req.postReq(Req.mkUrl('mgr/user_recommend','delUserById')+"&json=1",{group_id:group_id,uid:e.get('u')},
				function(r){
					if(r.isOk()){
						$(e.src).parent().parent('tr').remove();
					} else {
						Box.error('提示',r.getError());
					}
					e.lock(0);
				});
		});
		//改变类别刷新浮层
		self.jq('select[name="param[group_id]"]').change(function(){
			if( this.value!="-1" || this.value!="") {
				var urlObj= Util.dequery(popWin.modeUrl);
				urlObj.group_id = this.value;
				for(var v in urlObj){
					if(urlObj[v] === 'undefined')
					delete urlObj[v];
				}
				popWin.modeUrl =  Xwb.request.basePath +'admin.php?' +  Util.queryString(urlObj);
				popWin.reload();
			}
		});
		//显示分组
		self.jq('#showArea').click(function(){
			self.jq('#addArea').cssDisplay(true);
			$(this).cssDisplay(false);	
		});
		self.jq('#calGroup').click(function(){
			self.jq('#addArea,#newListNameErr').cssDisplay(false);
			$('#showArea').cssDisplay(true);	
		});
		self.jq('#Groupname').focus(function(){
			if(! self.jq('#newListNameErr').hasClass('hidden'))
				self.jq('#newListNameErr').cssDisplay(false);
		})
		//添加分组
		self.jq('#addGroup').click(function(){
			var flag =  true,name = self.jq('#Groupname').val();
			self.jq('select[name="param[group_id]"] option ').each(function(){
				if( name == this.innerHTML) flag = false;
			});
			if( flag && name !="" ){
				Req.postReq(Req.mkUrl('mgr/user_recommend','addReSort')+"&json=1",{name:name},function(r){
					if(r.isOk()){
						var urlObj= Util.dequery(popWin.modeUrl);
						urlObj.group_id = r.getData().group_id;
						for(var v in urlObj){
							if(urlObj[v] === 'undefined')
							delete urlObj[v];
						}
						popWin.modeUrl =  Xwb.request.basePath +'admin.php?' +  Util.queryString(urlObj);
						popWin.reload();
					} else {
						//错误处理
						Box.error('提示',r.getMsg());
					}
				})
			}
			if( !flag ){
				//名称重复错误处理
				self.jq('#newListNameErr').cssDisplay(1);
			}
		});
	}
	
	//自定义微博列表
	function WeiboList(){
		var Util = Xwb.util,
			Box = Xwb.ui.MsgBox,
			self=this,
			Req=Xwb.request,
			flag = true,
			listId = self.jq('select[name="param[list_id]"]').val();
		var mgr = new Xwb.ax.ActionMgr();
		mgr.bind(this.jq('#addTable'));
		mgr.reg('addUser',function(e){
				
				var trObj = $(e.src).parent().parent('tr'),nickname = trObj.find('#nickname');
				if(nickname.val()=='') return;
				nickname.unbind('focus');
				nickname.focus(function(){
					if( !flag ){
						trObj.find(".tips-error").cssDisplay(false);
						flag = true;
					}
				});
				if( listId == '0') {
					trObj.find(".tips-error").cssDisplay(true).html('请选择数据来源');
					return ;
				}
				e.lock(1);
				Req.postReq(Req.mkUrl('mgr/site_list','addMember','json=1'),{ listId:listId,nickname:nickname.val()},
					function(r){
						if(r.isOk()){
							trObj.before(['<tr rel="u:'+r.getData().uid+'">',
											'<td><span class="user-pic"><img src="'+r.getData().profile_img+'"></span></td>',
											'<td><p class="text">'+nickname.val()+'</p></td>',
											'<td>',
											'	<a rel="e:Udel" class="icon-del">删除</a>',
											'</td>',
											'</tr>'].join(''));
											nickname.val(''); 
											autoHeight(window.popWin);
						} else {
							trObj.find(".tips-error").cssDisplay(true).html(r.getError());
							flag = false;
						}
						e.lock(0);
					});
		})
		.reg('Udel',function(e){
			e.lock(1);
			Req.postReq(Req.mkUrl('mgr/site_list','delMember','json=1'),{listId:listId,uids:e.get('u')},
				function(r){
					if(r.isOk()){
						$(e.src).parent().parent('tr').remove();
					} else {
						Box.error('提示',r.getError());
					}
					e.lock(0);
				});
		});
		//改变类别刷新浮层
		self.jq('select[name="param[list_id]"]').change(function(){
			if( this.value!="-1" || this.value!="") {
				var urlObj= Util.dequery(popWin.modeUrl);
				urlObj.listId = this.value;
				for(var v in urlObj){
					if(urlObj[v] === 'undefined')
					delete urlObj[v];
				}
				popWin.modeUrl = Xwb.request.basePath +'admin.php?' +  Util.queryString(urlObj);
				popWin.reload();
			}
		});
				//显示分组
		self.jq('#showArea').click(function(){
			self.jq('#addArea').cssDisplay(true);
			$('#show_div').cssDisplay(false);	
		});
		self.jq('#calGroup').click(function(){
			self.jq('#addArea,#newListNameErr').cssDisplay(false);
			$('#show_div').cssDisplay(true);	
		});
		self.jq('#Groupname').focus(function(){
			if( ! self.jq('#newListNameErr').hasClass('hidden'))
				self.jq('#newListNameErr').cssDisplay(false);
		})
		//添加分组
		self.jq('#addGroup').click(function(){
			var flag =  true,name = self.jq('#Groupname').val();
			self.jq('select[name="param[list_id]"] option ').each(function(){
				if( name == this.innerHTML) flag = false;
			});
			if( flag && name !="" ){
				Req.postReq(Req.mkUrl('mgr/site_list','addList','json=1'),{name:name},function(r){
					if(r.isOk()){
						var urlObj= Util.dequery(popWin.modeUrl);
						urlObj.listid = r.getData().listid;
						for(var v in urlObj){
							if(urlObj[v] === 'undefined')
							delete urlObj[v];
						}
						popWin.modeUrl =  Xwb.request.basePath +'admin.php?' + Util.queryString(urlObj);
						popWin.reload();
					} else {
						//错误处理
						Box.error('提示',r.getError());
					}
				})
			}
			if( !flag ){
				//名称重复错误处理
				self.jq('#newListNameErr').cssDisplay(true);
			}
		});
	}
	function addIcs(sthis){
		if($(sthis).prev('input').val() !='' ){
			$(sthis).prev('input').before('<p class="input-item"><input type="text"  class="input-txt form-el-w130" name="param[topics][]" value="'+ $(sthis).prev('input').val() +'" /> <a  class="icon-del" href="javascript:;" onclick="delIcs(this);">删除</a></p>');
			 $(sthis).prev('input').val('');
		}
	}
	function delIcs(sthis){
		$(sthis).prev('input').remove();
		$(sthis).next('br').remove();
		$(sthis).remove();
	}
