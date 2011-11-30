/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110907
 * @fileoverview 零散的idongmi的js代码回收，零散写入页面且已经被老代码通用的部分
 */
(function(G,$,W){
	
	var idongmi=function(){
		
		return {
			exports:{
				init:function(){
					//旧的切换div的函数
					W.selectTag=function(showContent,selfObj){
						// 操作标签
						var tag = document.getElementById("tags").getElementsByTagName("li");
						var taglength = tag.length;
						for(i=0; i<taglength; i++){
							tag[i].className = "";
						}
						selfObj.parentNode.className = "selectTag";
						// 操作内容
						for(i=0; j=document.getElementById("tagContent"+i); i++){
							j.style.display = "none";
						}
						document.getElementById(showContent).style.display = "block";
          };
					
					$(function(){
						//头部搜索部分
            if($.browser.msie && $.browser.version==6){
            var chlids=$('#J_Search').parent().children(),
                cls=$('#J_Search').parent().attr('class'),
                clone=chlids.clone();
                $('#J_Search').parent().after($('<div class="'+cls+'" style="filter:none;">').append(clone));
                chlids.remove();
            }
						var txt=$('#J_Q'),msg="请输入关键字";
							if(window.GLOBALskey) txt.val(GLOBALskey);
							else
							txt.val(msg);

              //插入只能提示层
            $('body').append('<div id="J_SearchKey" style="cursor:pointer;display:none;border:#999 solid 1px;background:#F5F5F5;width:'+$('#J_Q').width()+'px;"><div id="J_SiteWrap" style="height:22px;position:relative;"></div><div id="J_CoachWrap" style="height:22px;position:relative;"></div></div>');
              var selectIndex=0,maxSelect=1;
							txt.focus(function(){
								var val=$.trim(txt.val());
								if(val==msg) $(this).val("");
							}).blur(function(){
								var val=$.trim(txt.val());
								if(val==="") $(this).val(msg);
                setTimeout(function(){
                $('#J_SearchKey').hide();
              },500);
              }).attr('autocomplete','off').bind('keydown keyup focus',function(e){
                  var val=$(this).val();
                  if($.trim(val)!==''){
                    var offset=$(this).offset();
                    $('#J_SearchKey').css({
                      left:offset.left,
                      top:offset.top+$(this).outerHeight(),
                      position:'absolute'
                    }).show();
                  //上
                  if(e.which===38){
                    if(selectIndex>0) selectIndex=selectIndex-1;
                  //下
                  }else if(e.which===40){
                    if(selectIndex<maxSelect) selectIndex=selectIndex+1;
                  }
                  }else{
                    $('#J_SearchKey').hide();
                  }
                  if(val.length>8){
                     val = val.slice(0,8)+'...';
                  }
                  $('#J_SiteWrap').html('<a href="http://x.idongmi.com/search/index.jsp" target="_blank"><span style="color:red;position:absolute;left:5px;top:3px;">'+val+'</span><span style="position:absolute;right:1px;top:3px;">相关会所&gt;&gt;</span></a>');
                  $('#J_CoachWrap').html('<a href="http://x.idongmi.com/search/coach.jsp" target="_blank"><span style="color:red;position:absolute;left:5px;top:3px;">'+val+'</span><span style="position:absolute;right:1px;top:3px;">相关教练&gt;&gt;</span></a>');
                  $('#J_SearchKey>div').css('background','none').eq(selectIndex).css('background','#EAEAEA');
              });

            $('#J_SiteWrap,#J_CoachWrap').live('mouseenter',function(){
                $('#J_SiteWrap,#J_CoachWrap').css('background','none');
                $(this).css('background','#EAEAEA');
            });

          $('#J_SiteWrap').live('click',function(){
              var href=$(this).find('a').attr('href');
              $('#J_Search').attr('action',href);
              $('#J_Search').submit();
              return false;
            }).live('mouseenter',function(){
              selectIndex=0;
            });

          $('#J_CoachWrap').live('click',function(){
              var href=$(this).find('a').attr('href');
              $('#J_Search').attr('action',href);
              $('#J_Search').submit();
              return false;
           }).live('mouseenter',function(){
            selectIndex=1;
           });

							$('#J_Search').submit(function(){
								var val=$.trim(txt.val());
								if(val==="" || val=="请输入关键字"){
									alert('请输入搜索条件');
									return false;
								}
                var actionlist=['/search/index.jsp','/search/coach.jsp'];
                $(this).attr('action',actionlist[selectIndex]);
                return true;
							});
              

						//公告首尾相接
						$('.J_Roll').css('position','absolute').parent().css({'overflow':'hidden','width':181,'position':'relative'});
						$('.J_Roll').wrap('<div style="position:relative;width:'+1000*1000+'px;height:29px;"></div>');
						
						var width=$('.J_Roll').width(),
							innerWidth=$('.J_Roll>span:first').width(),
							parentWidth=181,
							cloneDOM=$('.J_Roll>span:first').clone(),timer,nowleft=0;
							
							$('.J_Roll').append(cloneDOM);
							
							if(innerWidth<=parentWidth){
								$('.J_Roll span').css({
									width:parentWidth,
									display:'inline-block',
									zoom:'1',
									'text-align':'left'
								});
							}
							
							parentWidth=0;
							
							width=$('.J_Roll>span:first').width();
							
						function moveleft(node,speed,end,callback){
							var left=parseInt($(node).css('left'),10); //0
							if(left<=end){
								parentWidth=0;
								if(callback) callback();
								return;
							}
							nowleft=left-1;
							$(node).css('left',nowleft);
							timer=setTimeout(function(){
								moveleft(node,speed,end,callback);
							},speed);
						}
						
						function run(left){
							if(left) parentWidth=left;
							$('.J_Roll').css('left',parentWidth);
							moveleft('.J_Roll',100,-width,function(){
									if(left) run(parentWidth);
									else
										run();
							});
						}
						
						function stop(){
							clearTimeout(timer);
						}
						run();
						
						$('.J_Roll').mouseover(function(){
							stop();
						});
						
						$('.J_Roll').mouseout(function(){
							run(nowleft);
						});
					  //私信消息初始化
            if($('#J_Notice').length!==0){
              G.widget.use('sms',function(widget){
                widget.sms.init();
              });
            }
					});
				}
			}
    };
	}();
	
	if(G && G.apps) G.apps.idongmi=idongmi;
	
})(GM,jQuery,window);
