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
					}
					
					$(function(){
						//头部搜索部分
            if($.browser.msie && $.browser.version==6){
            var chlids=$('#J_Search').parent().children(),
                clone=chlids.clone();
                $('#J_Search').parent().after($('<div class="search" style="filter:none;">').append(clone));
                chlids.remove();
                
            }
						var txt=$('#J_Q'),msg="请输入关键字";
							if(window.GLOBALskey) txt.val(GLOBALskey);
							else
							txt.val(msg);
							txt.focus(function(){
								var val=$.trim(txt.val());
								if(val==msg) $(this).val("");
							});
							txt.blur(function(){
								var val=$.trim(txt.val());
								if(val=="") $(this).val(msg);
							});
							$('#J_Search').submit(function(){
								var val=$.trim(txt.val());
								if(val=="" || val=="请输入关键字"){
									alert('请输入搜索条件');
									return false;
								}
							});

						//公告首尾相接
						$('.J_Roll').css('position','absolute').parent().css({'overflow':'hidden','width':300,'position':'relative'});
						$('.J_Roll').wrap('<div style="position:relative;width:'+1000*1000+'px;height:29px;"></div>');
						
						var width=$('.J_Roll').width(),
							innerWidth=$('.J_Roll>span:first').width(),
							parentWidth=300,
							clone=$('.J_Roll>span:first').clone(),timer,nowleft=0;
							
							$('.J_Roll').append(clone);
							
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
							var left=parseInt($(node).css('left')); //0
							if(left<=end){
								parentWidth=0;
								if(callback) callback();
								return;
							};
							nowleft=left-1;
							$(node).css('left',nowleft);
							timer=setTimeout(function(){
								moveleft(node,speed,end,callback);
							},speed);
						};
						
						function run(left){
							if(left) parentWidth=left;
							$('.J_Roll').css('left',parentWidth);
							moveleft('.J_Roll',30,-width,function(){
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
						
						
					});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.idongmi=idongmi;
	
})(GM,jQuery,window);
