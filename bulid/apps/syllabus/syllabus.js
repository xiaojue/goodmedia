/**
 * @author fuqiang [designsor@gmail.com]
 * @date 20110727
 * 课程表应用的js功能部分
 * 使用reuqire加载然后用exports的方式暴露接口，init组织初始化,
 * 这个文件是在iframe中被调用的，回引用window.parent的jQuery对象和GM对象，实现通讯。
 * 主要功能为3个大部分:
 * 1,数据的通讯，主要是浮出层和iframe之间的数据交流。
 * 2,四个不同tab的各种交互功能
 * 3，四个不同tab的通用功能
 */
(function(W,doc,$,G,top){
	
	//top这里为顶级页面的window对象
	
	if(top){
		var parent$=top.jQuery,
			parentGM=top.GM;
	}else{
		return;
	}
	
	var ST;
	
	var syllabus=function(){
		
		
		//生成512宽浮出层
		var table512w=function(name,main){
			var Str='<div class="top"></div>'+
						'<div class="mid">'+
						'<table cellspacing="0" cellpadding="0" border="0" width="512px"><tbody><tr>'+
						'<td class="mid_l">&nbsp;</td>'+
						'<td class="mid_c">'+
						'<div class="J_main">'+
						'<div class="tab_title"><img src="http://s2.ifiter.com/static/images/tab_ico.gif" class="J_OverlayClose" style="cursor:pointer;" alt="关闭" title="关闭"><span>'+name+'</span></div>'+
						main+
						'</div>'+
						'</td>'+
						'<td class="mid_r">&nbsp;</td>'+
						'</tr></tbody></table>'+
						'</div>'+
						'<div class="bottom"></div>';
			return Str;
		};
		
		var getTime=function(time){
			$.ajax({
				url:'/course/courseAjax.jsp?op=getweek&date='+time,
				success:function(str){
					eval('var timeary='+$.trim(str));
					parent$('#J_Week').val(timeary[0]);
					parent$('#J_Scope').val(timeary[1]);
					$('#J_Selectday').val(time);
					$('#J_Selectyear').val(timeary[2]);
					$('#J_Selectweek').val(timeary[0]);
				},
				error:function(){
					alert('请求超时,请重新选择时间');
				}
			});
		};
		
		//左右滚动
		var scrollitem=function(data,left,right,temp){
			
		};
		
		//错误提示
		var warnstr=function(str,type){
			
		};
		//构造tag
		var bulidlist=function(data,tag){
			var returnlist='';
			for(var i in data){
				returnlist+='<'+tag+' value="'+data[i]+'">'+data[i]+'</'+tag+'>';
			}
			return returnlist;
		};
		
		//构建ul列表
		var bulidul=function(obj,name,maxli){
            var returnlist='',data=obj[name],j=0;
            if(name=="") data=obj;
			for(var i in data){
                if(j%maxli==0) returnlist+='<ul>';
                returnlist+='<li data-value="'+i+'">'+data[i]+'</li>';
                if(j%maxli==maxli-1 || i==data.length-1) returnlist+='</ul>'; 
                j++; 
			}
			return returnlist;
		};
		
		//模拟数组数据
		/*
		var yetroomlist={
			1:'教室一',
			2:'教室二',
			3:'教室三'
		};
		var coursehash={
			'强身健体':{
				1:'低冲击有氧操',
				2:'性感拉丁',
				3:'低冲击有氧操',
				4:'性感拉丁',
				5:'低冲击有氧操',
				6:'性感拉丁',
				7:'低冲击有氧操',
				8:'性感拉丁',
				9:'低冲击有氧操'	
			},
			'减肥塑型':{
				1:'低冲击有氧操',
				2:'性感拉丁',
				3:'低冲击有氧操',
				5:'低冲击有氧操',
				7:'低冲击有氧操',
				8:'性感拉丁',
				9:'低冲击有氧操'	
			},
			'力量训练':{
				1:'低冲击有氧操',
				2:'性感拉丁',
				3:'低冲击有氧操',
				4:'性感拉丁',
				5:'低冲击有氧操',
				6:'性感拉丁'
			}
		};
		
		var instructorhash={
			1:'教练一',
			2:'教练二',
			3:'教练一',
			4:'教练二',
			5:'教练一'
		};
		*/
		
		var dataday=null,
			roomid=null,
			courseid=null;		
		
		return {
			'exports':{
				//创建主课表
				CreateSyllabus:function(){
					
					parent$.overlay();
					
					$('#J_CreateSyllabus').live('click',function(){
						
						var yetroom=bulidlist(W.yetroomlist,'option');
						
						var CreateStr='<div id="J_Calendar" class="poput_left pop_color2"></div>'+
									'<div class="poput_right">'+
									'<div class="Kb_txt">'+
									'<div class="Kb_text"><label for="J_Week"><span>课表周期</span><input type="text" size="8" id="J_Week" disabled="disabled"></label></div>'+
									'<div class="Kb_text"><label for="J_Scope"><span>课表日期</span><input type="text" size="22" id="J_Scope" disabled="disabled"></label></div>'+
									'</div>'+
									'<div class="Kb1"><label for="J_ChooseYetRoom"><input type="radio" name="room" id="J_ChooseYetRoom"><span>选择已有的教室</span></label><select name="" class="pro_select2" id="J_YetRoom"><option value="0">已有教室列表</option>'+yetroom+'</select><div class="clear"></div></div>'+
									'<div class="Kb1"><label for="J_ChooseNewRoom"><input type="radio" name="room" id="J_ChooseNewRoom"><span>输入新建的教室</span></label><input type="text" id="J_NewRoom" class="pro_select2"><div class="clear"></div></div>'+
									'<div class="Kb2" id="J_ErrorMsg" style="visibility:hidden;">最多8个汉字，可输入中文、英文、数字</div>'+
									'<div class="table_but"><input type="button" class="space_button" id="J_Submit" value="确认"><input type="button" class="J_OverlayClose space_button" value="取消"></div>'+
									'</div><div class="clear"></div>';
						
						CreateStr=table512w('创建主课表',CreateStr);
						
						parentGM.tools.overlay.reset(512,285);
						parentGM.tools.overlay.fire(CreateStr);
						
						
						top.WdatePicker({
							eCont:'J_Calendar',
							firstDayOfWeek:1,
							dateFmt:'yyyy-MM-dd',
							onpicked:function(dp){
								findtable();
								var datestr=dp.cal.getDateStr();
								//后台返回我多少周，区间，我进行填充。
								getTime(datestr);
							}
						});
						
						var CalendarWindow=parent$('#J_Calendar iframe')[0].contentWindow;
						
						//设置初始项
						var nowtime=new Date(),
							y=nowtime.getFullYear(),
							m=nowtime.getMonth(),
							d=nowtime.getDate(),
							m=(m.length>1)? '0'+m : m,
							d=(d.length>1)? '0'+d : d,
							timestr=y+'-'+m+'-'+d;
						getTime(timestr);
						
						function addheighlight(table){
							var tds=table.getElementsByTagName('td');
							for(var i=0;i<tds.length;i++){
								if(tds[i].className=="Wselday"){
								 var lighttds=tds[i].parentNode.getElementsByTagName('td');
								 for(var j=0;j<lighttds.length;j++){
								 	lighttds[j].style.cssText="color:#000;";
								 }
								 break;
								}	
							}
						};
						
						
						function findtable(){
							var tables=CalendarWindow.document.getElementsByTagName('table');
							if(tables.length==0){
								setTimeout(findtable,500);
							}else{
								for(var i=0;i<tables.length;i++){
									if(tables[i].className=="WdayTable"){
										addheighlight(tables[i]);
										break;
									}
								}
							}
						};
						
						ST=setInterval(findtable,300);
						
						//radio功能和充填select
						parent$('#J_ChooseYetRoom').attr('checked','checked');
						parent$('#J_YetRoom').attr('disabled',false);
						parent$('#J_NewRoom').attr('disabled',true).val('');
						
					});
					
					//添加副课表
					$('#J_addOtherTable').live('click',function(){
						
						var yetroom=bulidlist(W.yetroomlist,'option');
						
						var OtherTable='<div class="popup_text"><label for="J_ChooseYetRoom"><input type="radio" name="room" id="J_ChooseYetRoom"><span>选择已有的教室</span></label><select name="" class="pro_select2" id="J_YetRoom"><option value="0">已有教室列表</option>'+yetroom+'</select><div class="clear"></div></div>'+
									   '<div class="popup_text"><label for="J_ChooseNewRoom"><input type="radio" name="room" id="J_ChooseNewRoom"><span>输入新建的教室</span></label><input type="text" id="J_NewRoom" class="pro_select2"><div class="clear"></div></div>'+
									   '<div class="popup_text1" id="J_ErrorMsgOther" style="visibility:hidden;">最多8个汉字，可输入中文、英文、数字</div>'+
									   '<div class="popup_but"><input type="button" class="space_button" id="J_SubmitOtherTable" value="确认"><input type="button" class="space_button J_OverlayClose" value="取消"></div>'+
									   '<div class="clear"></div>';
						
						OtherTable=table512w('创建副课表',OtherTable);
						
						parentGM.tools.overlay.reset(512,250);
						parentGM.tools.overlay.fire(OtherTable);
						
						//radio功能和充填select
						parent$('#J_ChooseYetRoom').attr('checked','checked');
						parent$('#J_YetRoom').attr('disabled',false);
						parent$('#J_NewRoom').attr('disabled',true).val('');
					});
					
					parent$('#J_SubmitOtherTable').live('click',function(){
						if(parent$('#J_ChooseYetRoom').attr('checked')){
							$('#J_OtherRoomName').val(parent$('#J_YetRoom').val());
							if(parent$('#J_YetRoom').val()==0){
								alert('请选择教室');
								return;
							}
						}else{
							$('#J_OtherRoomName').val(parent$('#J_NewRoom').val());
							if($.trim(parent$('#J_NewRoom').val()).length > 8){
								parent$('#J_ErrorMsgOther').css('visibility','visible');
								return;
							}else if($.trim(parent$('#J_NewRoom').val()).length==0){
								alert('请填写教室');
								return;
							}else{
								parent$('#J_ErrorMsgOther').css('visibility','hidden');
							}
						}
						
						//攒值-给hidden input放入父页面的值
						$('#J_CreateOtherSyllabus').submit();
						parentGM.tools.overlay.close();
					});
					
					//防止iframe切换后ie下不能执行已经释放的代码错误- 函数指针找不到，需要重新绑定live函数
					var dieAry=['.J_OverlayClose',
					'#J_ChooseYetRoom',
					'#J_ChooseNewRoom',
					'#J_Submit',
					'.J_NoCourse',
					'#J_CourseCommit',
					'.J_addCourse',
					'.J_Redact',
					'#J_AddinOneItem',
					'#J_OneItemSub',
					'#J_CourseCommit',
					'#J_Itemwrap li',
					'#J_Instructorwrap li',
					'.J_CourseType',
					'.J_NoCourse',
					'.add',
					'.J_YetCourse',
					'.J_Operation',
					'#J_CourseEdit',
					'.J_RmoveUp'];
					
					$.each(dieAry,function(index,el){
						parent$(el).die();
					});
					
					parent$('.J_OverlayClose').live('click',function(){
						parentGM.tools.overlay.close();
						clearInterval(ST);
						$('.add').removeClass('add').addClass('J_NoCourse').children().remove();
						$('.J_Operation').removeClass('J_Operation').addClass('J_YetCourse').find('.operation').remove();
						$('.add').live('mouseleave',function(){
							$(this).html('');
							$(this).removeClass('add');
							$(this).addClass('J_NoCourse');
						});
						$('.J_Operation').live('mouseleave',function(){
							$(this).find('.operation').remove();
							$(this).addClass('J_YetCourse');
						});
					});
					
					parent$('#J_ChooseYetRoom').live('click',function(){
						parent$('#J_YetRoom').attr('disabled',false);
						parent$('#J_NewRoom').attr('disabled',true).val('');
						parent$('#J_ErrorMsg').css('visibility','hidden');
					});
					
					parent$('#J_ChooseNewRoom').live('click',function(){
						parent$('#J_YetRoom').attr('disabled',true);
						parent$('#J_YetRoom').attr('disabled',true).val('0');
						parent$('#J_NewRoom').attr('disabled',false);
					});
					
					parent$('#J_Submit').live('click',function(){
						//校验-校验完了提交
						if(parent$('#J_ChooseYetRoom').attr('checked')){
							$('#J_RoomName').val(parent$('#J_YetRoom').val());
							if(parent$('#J_YetRoom').val()==0){
								alert('请选择教室');
								return;
							}
						}else{
							$('#J_RoomName').val(parent$('#J_NewRoom').val());
							if($.trim(parent$('#J_NewRoom').val()).length > 8){
								parent$('#J_ErrorMsg').css('visibility','visible');
								return;
							}else if($.trim(parent$('#J_NewRoom').val()).length==0){
								alert('请填写教室');
								return;
							}else{
								parent$('#J_ErrorMsg').css('visibility','hidden');
							}
						}
						//攒值-给hidden input放入父页面的值
						$('#J_CreateNewSyllabus').submit();
						parentGM.tools.overlay.close();
						clearInterval(ST);
					});
					
					function course(name,that){
						
						$('.add').die('mouseleave');
						$('.J_Operation').die('mouseleave');
						
						var courseary=function(){
							var ary=[];
							for(var i in W.coursehash){
								ary.push(i);
							}
							return ary;
						}();
						
						var items=bulidul(W.coursehash,courseary[0],6),
							instructor=bulidul(W.instructorhash,'',6);
							type=function(){
								var str='';
								for(var i=0;i<courseary.length;i++){
									str+='<div class="course_list"><input type="radio" value="'+courseary[i]+'" name="type" class="J_CourseType">'+courseary[i]+'</div>';
								}
								return str;
							}();
						
						var btn=function(){
							var str;
							if(name=="编辑课程"){
						    str='<div class="tab_but"><input type="button" class="space_button" value="编辑" id="J_CourseEdit"></div>';
		                   }else if(name=="添加课程"){
		                    str='<div class="tab_but"><input type="button" class="space_button" value="保存" id="J_CourseCommit"></div>';
		                   }
		                   return str;
						}();
						
						var addCoursestr='<div class="course_area">'+
		                    '<div class="course_left">'+
		                        '<div class="cour_title">课程类型</div>'+
		                        type+
		                    '</div>'+
		                    '<div class="course_right">'+
		                        '<div class="cour_title">课程项目</div>'+
		                        '<div class="cour_txt">'+
		                           // '<a href="#"><img class="cour_img1" src="http://x.idongmi.com/static/images/schedule_left.gif"></a>'+
		                            '<div class="cour_text" id="J_Itemwrap">'+
		                                items+
		                            '</div>'+
		                          //  '<a href="#"><img class="cour_img2" src="http://x.idongmi.com/static/images/schedule_right.gif"></a>'+
		                            '<div class="clear"></div>'+
		                        '</div>'+
		                        '<div class="cour_but"><input type="text" class="cour_input" value="添加特色项目" id="J_AddinOneItem"><input type="button" class="cour_btn" id="J_OneItemSub"></div>'+
		                    '</div>'+
		                    '<div class="clear"></div>'+
		                '</div>'+
		                
		                '<div class="course_area">'+
		                    '<div class="course_left"></div>'+
		                    '<div class="course_right">'+
		                        '<div class="cour_title">任课教练</div>'+
		                        '<div class="cour_txt">'+
		                        //    '<a href="#"><img class="cour_img1" src="http://x.idongmi.com/static/images/schedule_left.gif"></a>'+
		                            '<div class="cour_text" id="J_Instructorwrap">'+
		                                instructor+
		                            '</div>'+
		                        //    '<a href="#"><img class="cour_img2" src="http://x.idongmi.com/static/images/schedule_right.gif"></a>'+
		                            '<div class="clear"></div>'+
		                        '</div>'+
		                        '<div class="cour_but" style="visibility:hidden;"><input type="text" class="cour_input" value="添加任课教练" id="J_AddinOneStructor"><input type="button" class="cour_btn" id="J_OneStructorSub"></div>'+
		                    '</div>'+
		                    '<div class="clear"></div>'+
		                '</div>'+
		                
		                '<div class="course_area none">'+
		                   '<div class="cour_date"><span class="green">课时设置</span><span>'+
		                   '<select id="J_StartHour" class="cour_box1">'+
		                   		'<option value="10">10</option>'+
		                   		'<option value="11">11</option>'+
		                   		'<option value="12">12</option>'+
		                   		'<option value="13">13</option>'+
		                   		'<option value="14">14</option>'+
		                   		'<option value="15">15</option>'+
		                   		'<option value="16">16</option>'+
		                   		'<option value="17">17</option>'+
		                   		'<option value="18">18</option>'+
		                   		'<option value="19">19</option>'+
		                   		'<option value="20">20</option>'+
		                   	'</select>时<input type="text" class="cour_box2" id="J_StartMinute">分</span><span>'+
		                   	'<select id="J_EndHour" class="cour_box1">'+
		                   	'<option value="10">10</option>'+
		                   		'<option value="11">11</option>'+
		                   		'<option value="12">12</option>'+
		                   		'<option value="13">13</option>'+
		                   		'<option value="14">14</option>'+
		                   		'<option value="15">15</option>'+
		                   		'<option value="16">16</option>'+
		                   		'<option value="17">17</option>'+
		                   		'<option value="18">18</option>'+
		                   		'<option value="19">19</option>'+
		                   		'<option value="20">20</option>'+
		                   		'<option value="21">21</option>'+
		                   		'<option value="22">22</option>'+
		                   	'</select>时<input type="text" class="cour_box2" id="J_EndMinute">分</span></div>'+
		                   btn+
		                '</div>';
		                
						addCoursestr=table512w(name,addCoursestr);
						
						parentGM.tools.overlay.reset(512,530);
						parentGM.tools.overlay.fire(addCoursestr);
						
						var day=$(that).parent().parent().attr('data-day'),
							section=$(that).parent().parent().attr('data-section');
							
						if(name=="编辑课程"){
							courseid=$(that).parent().parent().attr('data-courseid');
						}
						
						dataday=$(that).parent().parent().attr('data-day');
						roomid=$(that).parent().parent().attr('data-roomid'); //"12:00-13:08"
						
						var temptime=section.split('-');
							tempSh=temptime[0].split(':')[0],
							tempSm=temptime[0].split(':')[1],
							tempEh=temptime[1].split(':')[0],
							tempEm=temptime[1].split(':')[1];
						
							parent$('#J_StartHour').val(tempSh);
							parent$('#J_StartMinute').val(tempSm);
							parent$('#J_EndHour').val(tempEh);
							parent$('#J_EndMinute').val(tempEm);
						
						
						
						//提交的时候增加校验 前后区间 || 时间00-60 必须00 2位 必须前面的小于后面的
						
						parent$('.J_CourseType').each(function(index,item){
							if(index==0) item.checked='checked';
						});
					}
					
					
					/*给表格增加添加||编辑课程的滑动功能*/
					$('.J_addCourse').live('click',function(){
						course('添加课程',this);	
					});
					$('.J_Redact').live('click',function(){
						course('编辑课程',this);
					});
					
					//ajax提交教练和项目
					/*
					parent$('#J_AddinOneStructor').live('focus',function(){
						if($(this).val()=='添加任课教练') $(this).val('');
					}).live('blur',function(){
						if($(this).val()=='') $(this).val('添加任课教练');
					});
					*/
					
					parent$('#J_AddinOneItem').live('focus',function(){
						if($(this).val()=='添加特色项目') $(this).val('');
					}).live('blur',function(){
						if($(this).val()=='') $(this).val('添加特色项目');
					});
					
					/*
					parent$('#J_OneStructorSub').live('click',function(){
						if(parent$('#J_AddinOneStructor').val()=='添加任课教练' || parent$('#J_AddinOneStructor').val()=="") alert('请填写任课教练');
					});
					*/
					
					parent$('#J_OneItemSub').live('click',function(){
						if(parent$('#J_AddinOneItem').val()=='添加特色项目' || parent$('#J_AddinOneItem').val()==""){
							alert('请填写特色项目');
							return;
						} 
						var itemname=parent$('#J_AddinOneItem').val(),setNo=$('input[name="siteno"]').val();
						$.ajax({
							url:'/course/fitItemAjax.jsp?op=addfit&ftype=1&siteno='+setNo+'&name='+itemname,
							success:function(str){
								var result=parseInt($.trim(str));
								if(result==0){
									alert('添加失败');
								}else{
									alert('添加项目成功');
									var lastul=parent$('#J_Itemwrap>ul:last');
									if(lastul.children('li').length==6){
										lastul.after('<ul><li>'+itemname+'</li></ul>');
									}else{
										lastul.append('<li>'+itemname+'</li>');
									}
									
									
									var type;
									parent$('.J_CourseType').each(function(index,item){
										if(item.checked) type=item.value;
									});
									W.coursehash[type][999]=itemname;
								}
							},
							error:function(){
								alert('相应超时，请重新添加');
							}
						});
					});
					
					
					function update(type){
						//校验+赋值动作
						var itemisChecked=false,itemvalue;
						
						parent$('#J_Itemwrap li').each(function(){
							if($(this).hasClass('checked')){
								itemisChecked=true;
								itemvalue=$(this).attr('data-value');
							}
						});
						
						if(!itemisChecked){
							alert('请选择一个健身项目');
							return;
						}
						
						var instructor=false,instructorvalue;
						
						parent$('#J_Instructorwrap li').each(function(){
							if($(this).hasClass('checked')){
								itemisChecked=true;
								instructorvalue=$(this).attr('data-value');
							}
						});
						
						if(!instructor){
							instructorvalue="";
							instructorid="";
						}
						
						var sh=parseInt(parent$('#J_StartHour').val()),
							sm=parseInt(parent$('#J_StartMinute').val()),
							eh=parseInt(parent$('#J_EndHour').val()),
							em=parseInt(parent$('#J_EndMinute').val());
							
						if($.trim(sm)=="" || $.trim(em)==""){
							alert('请填写完全时间信息');
							return;
						}
						
						if(isNaN(sm) || isNaN(em)){
							alert('请输入正确的分钟数');
							return;
						}
						
						if(sm>60 || sm<0 || em>60 || sm<0){
							alert('分钟数必须在00-60之间');
							return;
						}
						
						sm=(sm.length>1)? sm : '0'+sm;
						em=(em.length>1)? em : '0'+em;
						
						if(sh>eh){
							alert('开始时间不能大于结束时间');
							return;
						}
						
						if(sh==eh && sm<em){
							alert('开始时间不能大于结束时间');
							return;
						}
						
						var stime=sh+':'+sm+':00',etime=eh+':'+em+':00';
						
						if(type==1){
							$('#J_instructorID').val(instructorvalue);		
							$('#J_itemID').val(itemvalue);
							$('#J_Stime').val(stime);
							$('#J_Etime').val(etime);
							$('#J_Day').val(dataday);
							$('#J_RoomID').val(roomid);
						}else if(type==2){
							$('#J_editinstructorID').val(instructorvalue);		
							$('#J_edititemID').val(itemvalue);
							$('#J_editStime').val(stime);
							$('#J_editEtime').val(etime);
							$('#J_editDay').val(dataday);
							$('#J_editRoomID').val(roomid);
							$('#J_editCourseID').val(courseid);
						}
						
						
						if(confirm('确定要操作课表么?')){
							//iframe里的一个表单进行直接提交
							if(type==1){
								$('#J_AddCourseCommit').submit();
							}else if(type==2){
								$('#J_EditCourse').submit();
							}
							parentGM.tools.overlay.close(); //关闭浮出层
						}
					}
					
					
					//保存一个新课表
					parent$('#J_CourseCommit').live('click',function(){
						update(1);
					});
					
					parent$('#J_CourseEdit').live('click',function(){
						update(2);
					});
					
					$('.J_RemoveUp').live('click',function(){
						var id=$(this).parent().parent().attr('data-courseid');
						$('#J_removeCourseID').val(id);
						if(confirm('确定要删除课表么?')){
							$('#J_RemoveCourse').submit();
						}
					});
					
					parent$('#J_Itemwrap li').live('click',function(){
						parent$('#J_Itemwrap li').removeClass('checked');
						$(this).addClass('checked');
					});
					
					parent$('#J_Instructorwrap li').live('click',function(){
						parent$('#J_Instructorwrap li').removeClass('checked');
						$(this).addClass('checked');
					});
					
					
					//选择项目类型，切换对应ul列表
					parent$('.J_CourseType').live('click',function(){
						var type=$(this).val();
						parent$('#J_Itemwrap').html(bulidul(W.coursehash,type,6));
					});
					
					
					$('.J_NoCourse').live('mouseenter',function(){
						$(this).html('<span><a href="javascript:void(0);" class="J_addCourse">添加课程</a></span>');
						$(this).removeClass('J_NoCourse').addClass('add');
					});
					
					$('.add').live('mouseleave',function(){
						$(this).html('');
						$(this).removeClass('add');
						$(this).addClass('J_NoCourse');
					});
					
					$('.J_YetCourse').live('mouseenter',function(){
						var modifstr='<span class="operation"><a class="blue J_Redact" href="javascript:void(0);">编辑</a>'+
									 '<a class="red J_RemoveUp" href="javascript:void(0);">删除</a></span>';
						$(this).append(modifstr);
						$(this).removeClass('J_YetCourse').addClass('J_Operation');
					});
					
					$('.J_Operation').live('mouseleave',function(){
						$(this).addClass('J_YetCourse').removeClass('J_Operation').find('.operation').remove();
					});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.syllabus=syllabus;
	
})(window,document,jQuery,GM,window.top);