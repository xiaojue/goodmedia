<?php
	function post($name){
		return @$_POST[$name];
	}

	function get($name){
		return @$_GET[$name];
	}
?>

<?php
	$name=get('tab');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>tabs</title>
		<meta content="text/html; charset=utf-8" http-equiv="content-type">
		<script src="../../../jquery/jquery-1.6.2.js" charset=”UTF-8″></script>
		<script src="../../../bulid/GM.js" type="text/javascript" charset=”UTF-8″></script>
		<link type="text/css" rel="stylesheet" href="http://s1.ifiter.com/static/css.css">
	</head>
	<body class="club_body">
	<!--
	<a href="tabs_iframe.php?tab=timetable">课表管理</a>
	<a href="tabs_iframe.php?tab=room">教室管理</a>
	<a href="tabs_iframe.php?tab=item">健身项目管理</a>
	-->
	<div class="count">
	<div class="Shed_cont">
		<ul class="info_tag">
	      <li class="activeTag"><a href="tabs.php?tab=timetable">课表管理</a></li>
	      <li><a href="tabs.php?tab=roo">教室管理</a> </li>
	      <li><a href="tabs.php?tab=item">健身项目管理</a></li>
		</ul>
		<div style="height:4px;overflow:hidden;"><img src="http://s1.ifiter.com/static/images/coach_top.gif" style="vertical-align:top;"></div>
	<div class="Shed_content">
	<div class="schedule_browse">
		<div class="browse_txt">
	<?php if($name=="timetable"){ ?>
		<div class="browse_left">
			<a href="#"><img src="http://s1.ifiter.com/static/images/schedule_left.gif"></a>
		</div>
		<div class="browse_cont">
			<div class="browse_title">
				<span>
					<select name="" class="pro_select2">
						<option>更改教室</option>
					</select>
				</span>
					第52周（00.00--00.00）  阳光操房
			</div>
			<table cellspacing="1" cellpadding="0" border="0" width="100%" class="club_table1">
				<tbody>
					<tr class="row">
					    <td width="44px;">时间</td>
					    <td width="65px;">周一</td>
					    <td width="65px;">周二</td>
					    <td width="65px;">周三</td>
					    <td width="65px;">周四</td>
					    <td width="65px;">周五</td>
					    <td width="65px;">周六</td>
					    <td width="65px;">周日</td>
				  	</tr>
					<tr>
						<td class="green">
							<span>13:00</span>
							<span>13:00</span>
						</td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_YetCourse" data-seton="1" data-section="10:00-12:00" data-day="2011-08-25" data-roomid="84" data-courseid="20243" data-itemid="49" data-itemtype="减肥塑形" data-coachid="0">性感拉丁</td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
					</tr>
					<tr>
						<td class="green">
							<span>13:00</span>
							<span>13:00</span>
						</td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_YetCourse" data-seton="1" data-section="10:00-12:00" data-day="2011-08-25" data-roomid="84" data-courseid="20243" data-itemid="49" data-itemtype="减肥塑形" data-coachid="0">性感拉丁</td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
						<td class="J_NoCourse" data-seton="1" data-section="12:00-14:00" data-day="2011-08-22" data-roomid="84"></td>
					</tr>
				</tbody>
			</table>
			
		</div>
		<div class="browse_right">
			<a href="#"><img src="http://s1.ifiter.com/static/images/schedule_right.gif"></a>
		</div>
		<input type="hidden" value="" id="J_NowWeek"/>
		<input type="hidden" value="" id="J_NowScope"/>

		<form id="J_CreateNewSyllabus" action="" name="" style="display:none;">
		<input type="hidden" value="" id="J_setNo"/>
		<input type="hidden" value="1" id="J_isMainRoom"/>
		<input type="hidden" value="" id="J_RoomName"/>
		<input type="hidden" value="" id="J_EnName"/>
		</form>
		<div style="clear:both;"></div>
		<div class="add_schedule">
			<a class="green" href="#">上一篇课表：第18周（04.18--04.25）</a>
			<input type="button" id="J_CreateSyllabus" class="add_button" value="添加主课表">
		</div>
		<div class="add_schedule"><input type="button" id="J_addOtherTable" class="add_button" value="添加副课表" name=""></div>
		<script>
			(function(){
				GM.apps.require('syllabus',function(exports){
					exports.CreateSyllabus();
				});
			})();
		</script>
	<?php }; ?>

	<?php if($name=="room"){ ?>
		
	<?php }?>

	<?php if($name=="item"){ ?>
	
	<?php }?>
	</div>
	</div>
	</div>
	</div>
	</div>
	<script>
		//iframe自适应函数
		var iframeAutoFit=function(){
			try{
				if(window!=parent){
					var a = parent.document.getElementsByTagName("IFRAME");
					for(var i=0; i<a.length; i++){
						if(a[i].contentWindow==window){
							var h1=0, h2=0, d=document, dd=d.documentElement;
							a[i].parentNode.style.height = a[i].offsetHeight +"px";
							a[i].style.height = "10px";
							if(dd && dd.scrollHeight)
							h1=dd.scrollHeight;
							if(d.body)
							h2=d.body.scrollHeight;
							var h=Math.max(h1, h2);
							if(document.all){h += 4;}
							if(window.opera){h += 1;}
							a[i].style.height =h +"px";
							//iframe h
							a[i].parentNode.style.height = h+"px";
						}
					}
				}
			}
			catch (ex){}
		};
		$(window).load(iframeAutoFit);

	 var yetroomlist={84:'3333',92:'9',101:'3333'};var coursehash={'强身健体':{23:'性感拉丁    ',24:'低冲击有氧操   ',25:'踏板操   ',26:'街舞    ',27:'激情桑巴   ',28:'芭蕾   ',29:'钢管舞  ',30:'健美操   ',31:'有氧搏击  ',32:'有氧拉丁  ',33:'太极',34:'REAL K/韩式跆拳道',35:'现代舞   ',36:'肚皮舞  ',37:'民族舞 ',38:'流行舞   ',39:'草裙舞  ',40:'爵士舞    ',41:'排舞    ',42:'莎莎   ',43:'恰恰    ',44:'Zumba   ',45:'游泳   ',46:'动感单车',121:'321321',122:'3213'},'减肥塑形':{47:'高温瑜伽',48:'心灵瑜伽',49:'三维瑜伽',50:'哈达瑜伽',51:'流瑜伽',52:'阴瑜伽',53:'阿斯汤加  ',54:'热瑜伽  ',55:'香薰瑜伽',56:'减腹操   ',57:'平衡操  ',58:'腹背训练  ',59:'普拉提    ',60:'哑铃踏板    ',61:'健身球    ',62:'慢跑  ',63:'动感单车'},'力量训练':{64:'哑铃操 ',65:'固定器械：哑铃、杠铃',66:'组合器械'}};
        var instructorhash={};
	</script>
	</body>
</html>



