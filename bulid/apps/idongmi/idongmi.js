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
						var txt=$('#J_Q'),msg="请输入关键字",
							s=$.analyse(W.location.search.slice(1))['s'];
							if(s) txt.val(decodeURIComponent(s));
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
					});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.idongmi=idongmi;
	
})(GM,jQuery,window);
