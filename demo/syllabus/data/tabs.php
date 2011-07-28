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
		<link type="text/css" rel="stylesheet" href="http://s1.ifiter.com/static/css.css">
		<script src="../../../jquery/jquery-1.6.2.js" charset=”UTF-8″></script>
		<script src="../../../bulid/GM.js" type="text/javascript" charset=”UTF-8″></script>
	</head>
	<body style="background:none;">
		<div class="new_sschedule">
			
			<div class="new_title">
				第 29 周（2081-07-14--2081-07-20）教室AAＡ 课表
			</div>
			<table cellspacing="0" cellpadding="0" border="0" width="100%" class="club_table">
				<tbody>
					<tr class="new_date">
						<td>时间</td>
						<td>周一</td>
						<td>周二</td>
						<td>周三</td>
						<td>周四</td>
						<td>周五</td>
						<td>周六</td>
						<td>周日</td>
					</tr>
					<tr>
						<td>10-12点</td>
						<td class="J_NoCourse"></td>
						<td>性感拉丁</td>
						<td class="J_NoCourse"></td>
						<td class="J_NoCourse"></td>
						<td class="J_NoCourse"></td>
						<td class="J_NoCourse"></td>
						<td class="J_NoCourse"></td>
					</tr>
				</tbody>
			</table>
			
			<a href="#" id="J_CreateSyllabus">创建主课表</a>
		</div>

		<script>
			(function(){
				GM.apps.require('syllabus',function(exports){
					exports.CreateSyllabus();
				});
			})();
		</script>

	</body>
</html>



