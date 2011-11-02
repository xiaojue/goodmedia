/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110831
 * @fileoverview 动米网评论模块
 */
(function(W,$,G){
  /**
   * @memberOf GM.apps
   * @class
   */
	var comment=function(config){
		
		function sole(tag){
			return tag+new Date().valueOf().toString().slice(3);
		};

		var _config={
			islogin:false, //默认没登录
			showcount:true,
			Nowuid:0, //当前用户的的uid，默认为0 就是没有-谁的也删不了
			ulid:sole('#J_UL'),
			pagid:sole('#J_PAG'),
			syncwb:sole('#J_Syncwb'),
			textid:sole('#J_Text'),
			subbtn:sole('#J_Subbtn'),
			delbtn:sole('.J_Delbtn'),
			countid:sole('#J_Count'),
			countdownid:sole('#J_Countdown'),
			namecls:sole('.J_GName'),
			reply:sole('.J_Reply'),
			txt:sole('.J_Txt'),
			pag:sole('.J_Pag'),
			pagfowd:sole('#J_Fowd'),
			pagback:sole('#J_Back'),
			pco:sole('#J_Pco'),
			pagwrap:sole('#J_Pagwrap'),
			faceid:sole('#J_Face'),
			deadlock:true,
			current:1,
			count:null,
			region:3,
      pids:[],
      showuid:''
		};
		
		$.extend(_config,config);
		
		this.config=_config;
	}
	
	comment.prototype={
		/**
		 * @function
		 * @description 创建评论静态模板部分
		 */
		drawComment:function(){
			var that=this,cg=that.config;
			var CommentTemp='<div class="pcomment_sina pcmment_color">'+
	  				'<b class="b1"></b><b class="b2"></b><b class="b3"></b><b class="b4"></b>'+ 
	  				'<div class="pc_content">'+
	  					'<div class="pcomment_ico"><img src="http://s1.ifiter.com/static/images/comment/ico.gif"></div>'+
	  					'<div class="new_position">'+
	  						'<a href="javascript:void(0)" id="'+cg.faceid.slice(1)+'"><img src="http://s1.ifiter.com/static/images/comment/ico1.gif"></a>'+
	  						'<textarea class="lf" id="'+cg.textid.slice(1)+'"></textarea>'+
	  						'<a class="btn_normal" id="'+cg.subbtn.slice(1)+'" href="javascript:void(0);">评论</a>'+
	  						'<div class="clear"></div>'+
	  					'</div>'+
	  					'<div class="MIB_txtbl">'+
	  						'<span id="'+cg.countdownid.slice(1)+'"></span>'+
	  						//'<input type="checkbox" id="'+cg.syncwb.slice(1)+'">'+
	  						//'<label for="'+cg.syncwb.slice(1)+'">同时转发到我的微博</label>'+
	  						'<div class="clear"></div>'+
	  					'</div>'+
	  					'<ul class="PL_list" id="'+cg.ulid.slice(1)+'">'+
	  					'</ul>'+
	  				'</div>'+
	  				'<b class="b5"></b><b class="b6"></b><b class="b7"></b><b class="b8"></b>'+ 
	  			'</div>';
	  		
	  		return CommentTemp;	
		},
		/**
		 *  
		 */
		createBar:function(uid){
			var that=this,cg=that.config,
				barhtml="";
			if(cg.islogin){
				if(cg.Nowuid==uid) barhtml+='<a class="del Mi '+cg.delbtn.slice(1)+'" href="javascript:void(0);">删除</a>';
				barhtml+='<a class="reply Mi '+cg.reply.slice(1)+'" href="javascript:void(0);">回复</a>';
			}
			return barhtml;
		},
		/**
		 * @function
		 * @description 创建评论部分
		 */
		createComment:function(data){
			var that=this,cg=that.config,
				litemp='<li data-rid="{rid}">'+
	  					'<div class="picborder_l"><a href="http://x.idongmi.com/u/{uid}"><img src="{userpic}"></a></div>'+
	  					'<div class="txtinfo"><a href="http://x.idongmi.com/u/{uid}" data-uid="{uid}">{name}</a>:<span class="'+cg.txt.slice(1)+'"> {content}</span> ({date})</div>'+
	  					'<div class="MIB_operate">{bar}</div>'+
	  					'<div class="clear"></div>'+
	  				'</li>',
	  			ulstr="";
	  		if(data.length==0) return '<li style="text-align:center;">暂时还没有人评论过,快来抢沙发吧</li>';
	  		for(var i=0;i<data.length;i++){
	  			data[i]['bar']=that.createBar(data[i]['uid']);
	  			data[i]['content']=that.drawingName(data[i]['content']);
	  			ulstr+=cg.myface.drawface($.substitute(litemp,data[i]));
	  		}
	  		return ulstr;
		},
		/**
		 * @function
		 * @description 创建回复总数条目
		 */
		createCount:function(count){
			var that=this,cg=that.config,
				count='<div class="pcomment_text" id="'+cg.pco.slice(1)+'"><span class="blue">评论(<span id="'+cg.countid.slice(1)+'">'+count+'</span>)</span></div>';
				if(cg.showcount) return count;
				else return '';
		},
		/**
		 * @function
		 * @description 创建分页
		 */
		createPag:function(count,max,region){
			var that=this,cg=that.config,page=Math.ceil(count/max);
			
			if(count<=max) return ''; //不用分页，返回空
				
			var	pag='<div class="pcomment_page" id="'+cg.pagwrap.slice(1)+'"><div class="fanye">';
				
			if(count>max && cg.current!=1) pag+='<a class="a1" id="'+cg.pagback.slice(1)+'" href="javascript:void(0);">上一页</a>';
			
			var i=(cg.current-1==0)?1:cg.current-1,
				region=parseInt(cg.current)+parseInt(region-1);
			
			if(i!=1) pag+='<span class="mor">...</span>';
			
			for(;i<=region;i++){
				if(i>page) break;
				if(i==cg.current){
					pag+='<span>'+i+'</span>';
				}else{
					pag+='<a href="javascript:void(0);" class="'+cg.pag.slice(1)+'">'+i+'</a>';
				}
			}
			if(i<=page) pag+='<span class="mor">...</span>';
  					
  			if(count>max && cg.current!=page) pag += '<a class="a1" id="'+cg.pagfowd.slice(1)+'" href="javascript:void(0);">下一页</a>';
  			
  			return pag+='</div></div>';	
		},
		/**
		 * @function
		 * @description 初始化整个评论的动态部分 或者重新初始化
		 */
		trends_init:function(n){
			var that=this,cg=that.config;
			
			that.getdata(n,function(result){
				var CountTxt=that.createCount(result['cunt']),
					PagTxt=that.createPag(result['cunt'],result['max'],cg.region),
					ulstr=that.createComment(result['actList']);
					
				cg.count=result['cunt'];
				
				//更新总条数
				$(cg.pco).replaceWith(CountTxt);
				//更新分页
				$(cg.pagwrap).replaceWith(PagTxt);
				//插入评论
				$(cg.ulid).html(ulstr);
				//渲染名字
				that.getDmName(cg.namecls);
			});
		},
		/**
		 * @function
		 * @description 删除功能
		 */
		deleteReply:function(node,callback){
			var that=this,cg=that.config,
				rid=node.closest('li').attr('data-rid');
			$.ajax({
				url:'/api/reply/replyAjax.jsp',
				type:'GET',
				data:{type:cg.type,act:'del',rid:rid,reload:1},
				success:function(data){
					cg.deadlock=true;
					if($.trim(data)>0 && callback) callback(node);
					else 
					alert('删除失败,请重试');
				},
				error:function(){
					cg.deadlock=true;
					alert('删除失败,请重试');
				}
			});
		},
		/**
		 * 
		 */
		insertcommit:function(sertobj){
			var that=this,cg=that.config,N=new Date().valueOf().toString().slice(6),
				litemp='<li data-rid="{rid}" class="J_New'+N+'">'+
	  					'<div class="picborder_l"><a href="http://x.idongmi.com/u/{uid}"><img src="{userpic}"></a></div>'+
	  					'<div class="txtinfo"><a href="http://x.idongmi.com/u/{uid}">{name}</a>:<span class="'+cg.txt.slice(1)+'"> {content}</span> ({date})</div>'+
	  					'<div class="MIB_operate">{bar}</div>'+
	  					'<div class="clear"></div>'+
	  				'</li>';
	  		
	  		cg.current=1;		
	  		that.trends_init(1); //插入之前先恢复到第一页		 
	  				
	  		sertobj['bar']=that.createBar(sertobj['uid']);
	  		sertobj['content']=that.drawingName(sertobj['content']);
	  		litemp=cg.myface.drawface($.substitute(litemp,sertobj));
	  		$(cg.ulid).prepend(litemp);
	  		that.getDmName('.J_New'+N+' '+cg.namecls);
		},
		/**
		 * @function
		 * @description 提交功能
		 */
		commit:function(){
			var that=this,cg=that.config,
				txt=$.trim($(cg.textid).val()),
				date=new Date();
				
			function correct(num){
				return (num.toString().length>1)? num : '0'+num.toString();
			}
			var	t=correct(date.getMonth()+1)+'月'+correct(date.getDate())+'日 '+correct(date.getHours())+':'+correct(date.getMinutes());
				
			that.postdata(txt,function(rid){
				that.insertcommit({
					userpic:cg.pic,
					content:txt,
					uid:cg.Nowuid,
					name:cg.name,
					date:t,
					rid:rid
				});
				//清空评论框
				$(cg.textid).val('');
				that.updatecount(1);
			});
		},
		/**
		 * 
		 */
		_loadcss:function(){
			var host=GM.apps.host,place='-min';
			if(GM.debug) place='';
			$.loadcss(host+'comment/comment'+place+'.css');
		},
		/**
		 * 
		 */
		getdata:function(current,callback){
			var that=this,cg=that.config;
			$.ajax({
				url:'/api/reply/replyList.jsp',
				type:'GET',
				data:{pageNo:current,pid:cg.pid,type:cg.type,reload:1},
				success:function(data){
					cg.deadlock=true;
					var result=$.trim(data);
					try{
            var result=eval('('+data+')');
						if(callback) callback(result);
					}catch(e){
					console.log(e)
					}
				},
				error:function(){
					cg.deadlock=true;
					alert('访问超时');
				}
			})
		},
		postdata:function(txt,callback){
			var that=this,cg=that.config,
				syncwb=function(){
					if($(cg.syncwb).attr('checked'))
					return 1;
					else return 0;
				}
			$.ajax({
				url:'/api/reply/replyAjax.jsp',
				type:'GET',
        data:{showuid:cg.showuid,puid:cg.pids.join(),type:cg.type,act:'add',content:txt,pid:cg.pid,syncwb:syncwb(),reload:1},
				success:function(data){
					cg.deadlock=true;
					var result=$.trim(data);
					if(callback && result>0) callback(result);
					else if(result==-1)
					alert('您评论的有点快，去健身休息一下吧！');
					else
					alert('提交失败,请重新尝试');
				},
				error:function(){
					cg.deadlock=true;
					alert('添加失败,请重新尝试');	
				}
			})
		},
		/**
		 * 
		 */
		updatecount:function(n){
			var that=this,cg=that.config,	
				s=parseInt($(cg.countid).text());
			$(cg.countid).text(s+n);
		},
		/**
		 * 
		 */
		fixnone:function(node){
			var uls=node.closest('ul');
			if(uls.children('li').length==1){
				node.closest('li').html('<span style="text-align:center;">本页已经全部被删没啦,刷新页面查看更多或点击其他页</span>');
			}else{
				node.closest('li').remove();
			}
		},
		/**
		 * @function
		 * @description 渲染@人民函数
		 */
		drawingName:function(str){
			var that=this,cg=that.config;
			var reg=/(@)(.*?)(\||\.|\,|\s|$)/g, 
			    str=str.replace(reg,function($0,$1,$2){
                     var txt=$2;
                     if(txt=="" || txt.length<=0 || txt.length>15) return $0; //小于2大于15为空的不渲染
                     return '<a class="'+cg.namecls.slice(1)+'" href="/u/'+txt+'" data-name="'+txt+'" target="_blank">'+$0+'</a>';
				});
			return str;
		},
		/**
		 * @function
		 * @description 渲染@人民，检查是否真实
		 */
		getDmName:function(selector){
			var that=this,cg=that.config,names=[];
			
			$(selector).each(function(){
				names.push($(this).attr('data-name'));
			});
			
			if(names.length==0) return;
			
			$.ajax({
				url:'/api/reply/replyAjax.jsp',
				data:{act:'guids',type:cg.type,pid:1,unames:names.join(' ')},
				type:'GET',
				success:function(result){
					cg.deadlock=true;
					var result=$.trim(result),
						uids=result.split(',');
					for(var i=0;i<uids.length;i++){
						if(uids[i]==0){
							$(selector).eq(i).attr({
								'href':'javascript:void(0)',
								'target':'',
								'title':'此用户不存在'
							}).addClass('Noname');
						}else{
              $(selector).eq(i).attr({'href':'/u/'+uids[i],'data-uid':uids[i]});
						}
					}	
				},
				error:function(){
					cg.deadlock=true;
					$(selector).each(function(){
						$(this).attr({
								'href':'javascript:void(0)',
								'target':'',
								'title':'此用户没找到'
							}).addClass('Noname');
					});
				}
			})
		},
		/**
		 * 
		 */
		Eventaction:function(){
			var that=this,cg=that.config,T;
			//提交评论
			G.widget.use('saycountdown',function(widget){
				var mysay=widget.saycountdown({
							max:140,
							main:cg.textid,
							wrap:cg.countdownid,
							holdTarget:cg.subbtn,
							errorCls:'red',
							holdAction:function(){
								var val=$.trim($(cg.textid).val());
								if(val == ""){
									alert('评论不能为空');
									return;
								}
								if(cg.deadlock){
									cg.deadlock=false;
									that.commit();
								}
							}
						}).init();
				
				//回复功能
				$(cg.reply).live('click',function(){
					var	info=$(this).closest('li').children('.txtinfo'),
						name=info.find('a:first').text();
						$(cg.textid).val('@'+name).focus();
						//更新一次计数
						mysay.update();
            //把当前这一条的所有@用户id取到，并保存,以备评论时传递给后台
            var pids=[];
            info.find('a').each(function(){
                var uid=$(this).attr('data-uid');
                if(uid && uid!=""){
                  pids.push(uid);
                };
            });
            cg.pids=pids; 
				});
			});
			
			$(cg.textid).live('keyup',function(e){
				var that=this;
				T=setTimeout(function(){
					var h=$(that).height(),
						n=$(that).val().match(/\n/g),
						l=n ? (n.length+1)*20 : 24;
						$(that).height(l);
				},50);
			});
			
			$(cg.textid).live('keydown',function(){
				clearTimeout(T);
			})
				
			//删除评论
			$(cg.delbtn).live('click',function(){
				if(cg.deadlock){
					if(confirm('确认删除此评论么?')){
						cg.deadlock=false;
						that.deleteReply($(this),function(node){
							that.updatecount(-1);
							that.fixnone(node);
						});
					}
				}
			});
			
			//分页任务 
			$(cg.pag).live('click',function(){
				var n = $(this).text();
				if(cg.deadlock){
					cg.deadlock=false;
					cg.current=parseInt(n);
					that.trends_init(n);
				}
			});
			
			$(cg.pagfowd).live('click',function(){
				if(cg.deadlock){
					cg.deadlock=false;
					cg.current+=1;
					that.trends_init(cg.current);
				}
			});
			
			$(cg.pagback).live('click',function(){
				if(cg.deadlock){
					cg.deadlock=false;
					cg.current-=1;
					that.trends_init(cg.current);
				}
			})
			
			
		},
		/**
		 * 
		 */
		init:function(){
			var that=this,cg=that.config;
			that._loadcss();
			
			//先加载face包
			G.apps.require('face',function(exports){
				//开始正确渲染评论组件
				that.getdata(1,function(result){
					var CommentWrap=that.drawComment(),
						CountTxt=that.createCount(result['cunt']),
						PagTxt=that.createPag(result['cunt'],result['max'],cg.region),
						endhtml=CountTxt+CommentWrap+PagTxt;
					cg.count=result['cunt'];
					$(cg.target).html(endhtml);
					//实例face包
					cg.myface=new exports.face({
						target:cg.faceid,
						main:cg.textid
					});
					cg.myface.init();
					//插入评论
					$(cg.ulid).html(that.createComment(result['actList']));
					//init的时候live一次 且仅live一次
					that.Eventaction();
					//渲染名字
					that.getDmName(cg.namecls);
				});
				
			});
		}
	}
	
	if(G && G.apps){
		G.apps.comment={
			exports:{
				comment_init:comment
			}
		}
	}
	
})(window,jQuery,GM);
