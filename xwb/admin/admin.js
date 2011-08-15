
//获取 id 为 eId 的HTML 元素
function $id(eId) {
	return document.getElementById(eId);
}

//获取 name 为 eName的HTML元素
function $name(eName) {
	return document.getElementsByName(eName);
}

 /*
  * 对多选框做 全选或取消全选 的操作,依赖jquery
  * 
  * @param eName checkbox的元素名称
  * @param isCheck true:选择 false:取消选择 
  * 
  * @example:
  *   <input name="albumID[]" type="checkbox" value="1" />
  * 
  *   <input name="albumIDCheckBtn" onclick="checkAll('albumID[]', this.checked)" type="checkbox"  /> 
  */
function checkAll(eName, isCheck) {
	var chk = typeof(isCheck) == 'boolean' ? isCheck : isCheck.checked;
	jQuery($name(eName)).attr('checked', chk);
}

//检查EMAIL
function isEmail(str) {
  var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
  var flag = reg.test(str);
  return flag;
}

//检查是否字母
function isAlpha(str) {
  var reg = /^[A-z]+$/;
  var flag = reg.test(str);
  return flag;
}

//检查是否字母或数字
function isAlphaNumeric(str) {
  var reg = /^[0123456789A-z]+$/;
  var flag = reg.test(str);
  return flag;
}

//检查是否字母或数字或中划线下划线
function isAlphaDash(str) {
  var reg = /^[-_0123456789A-z]+$/;
  var flag = reg.test(str);
  return flag;
}

//检查是否数值
function isNumeric(str) {
  var reg = /^-?[0-9]+\.?[0-9]*$/;
  var flag = reg.test(str);
  return flag;
}

//检查是否整值
function isInt(str) {
  var reg = /^-?[0-9]+$/;
  var flag = reg.test(str);
  return flag;
}

//检查有没有选择单选项的其中一个
function isRadioChecked(rName) {
	var rdos = $name(rName);
	for (var r = 0; r < rdos.length; r++) {
		if (rdos[r].checked) {
			return true;
		}
	}
	
	return false;
}

//检查下拉框有没有被选
function isSelected(sName) {
	var ss = $name(sName);

	if (ss[0] && ss[0].selectedIndex > 0) {

		return true;
	}
	
	return false;
}

/**
 * 检查是否为ID格式
 * 1349 或 1,2,3 或 1-10
 */ 
function isID(str) {
	var reg1 = /^[0-9]+$/;
	var reg2 = /^([0-9]+,?)+[0-9]+$/;
	var reg3 = /^[0-9]+-[0-9]+$/;

	return ((isInt(str) && str > 0) || reg1.test(str) || reg2.test(str) || reg3.test(str));
}


/**
 * 检查元素是否在数组中
 * 返回true or false
 */
function in_array(ele, arr) {
	for (var arr_i = 0; arr_i < arr.length; arr_i++) {
		if (ele == arr[arr_i]) {
			return true;
		}
	}
	
	return false;
}

//检查日期格式
function isDate(str) {
  var reg = /^([0-9]{4}|[0-9]{2})-[0-9]{1,2}-[0-9]{1,2}$/;
  var reg1 = /^([0-9]{4}|[0-9]{2})(-|\/)[0-9]{1,2}(-|\/)[0-9]{1,2}$/;
  var reg2 = /^[0-9]{1,2}(-|\/)[0-9]{1,2}$/;
  var reg3 = /^[0-9]{4}(-|\/)[0-9]{1,2}$/;
  
  return (reg.test(str) || reg1.test(str) || reg2.test(str) || reg3.test(str));   
}


function isFdate(str, fm) {
	arrformat = fm.split(',');
	var reg;
	var regz;
	for (i = 0; i < arrformat.length; i++) {
		if (arrformat[i] == 'yyyy') {
			reg = /^[0-9]{4}$/;
			regz = /^[0-9]{4}年$/;
		} else if (arrformat[i] == 'yyyy-mm') {
			reg = /^[0-9]{4}-([0]?[1-9]{1}|10|11|12)$/;
			regz = /^[0-9]{4}年([0]?[1-9]{1}|10|11|12)月$/;
		} else if (arrformat[i] == 'yyyy-mm-dd') {
			reg = /^[0-9]{4}-([0]?[1-9]{1}|10|11|12)-([0]?[1-9]{1}|(1[0-9]{1})|(2[0-9]{1})|30|31)$/;
			regz = /^[0-9]{4}年([0]?[1-9]{1}|10|11|12)月([0]?[1-9]{1}|(1[0-9]{1})|(2[0-9]{1})|30|31)日$/;
		} else if (arrformat[i] == 'mm-dd') {
			reg = /^([0]?[1-9]{1}|10|11|12)-([0]?[1-9]{1}|(1[0-9]{1})|(2[0-9]{1})|30|31)$/;
			regz = /^([0]?[1-9]{1}|10|11|12)月([0]?[1-9]{1}|(1[0-9]{1})|(2[0-9]{1})|30|31)日$/;
		}
		
		if (reg.test(str)) {
			return true;
		}
		if (regz.test(str)) {
			return true;
		}
	}
	
	return false;
}
/**
 * 测试年份必须大于1970年
 */
function chkYear(str) {
	var reg = /^\d{4}/;
	if ((result = str.match(reg)) && result[1] < 1970) {
		return false;
	}
	return true;
}

/**
 * 是否少于当前日期
 */
function isLessNow(str) {
	var reg = /^(\d{2,4})([\-\/]([01]?\d))?([\-\/]([0-3]?\d))?$/;
	if (!(result = str.match(reg))) {
		return false;
	}
	d = new Date();
	d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	if (result[1].length < 4) {
		if (new Number(result[1]) > (d.getFullYear() % 100) && new Number(result[1]) >= 70) {
			result[1] = "19" + result[1];
		} else {
			year = new String(d.getFullYear ());
			result[1] = year.substr(0,2) + new String(result[1]);
		}
	}
	if (result[1] && result[3] && result[5]) {
		date = new Date(result[1] , result[3] - 1 , result[5]);
		if (date > d) {
			return false;
		}
	} else if (result[1] && result[3]) {
		if (result[1] > d.getFullYear()) {
			return false;
		} else if (result[1] == d.getFullYear() && result[3] > d.getMonth() + 1) {
			return false;
		}
	} else if (result[1] > d.getFullYear()) {
		return false;
	}
	return true;
}

/**
 * 检查是否大于当前日期
 */
function isMoreThanNow(str) {
	var reg = /^(\d{2,4})([\-\/]([01]?\d))?([\-\/]([0-3]?\d))?$/;
	if (!(result = str.match(reg))) {
		return false;
	}
	d = new Date();
	d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	// 补全年份
	if (result[1].length < 4) {
		if (new Number(result[1]) > (d.getFullYear() % 100) && new Number(result[1]) >= 70) {
			result[1] = "19" + result[1];
		} else {
			year = new String(d.getFullYear ());
			result[1] = year.substr(0,2) + new String(result[1]);
		}
	}
	if (result[1] && result[3] && result[5]) {
		date = new Date(result[1] , result[3] - 1 , result[5]);
		if (date < d) {
			return false;
		}
	} else if (result[1] && result[3]) {
		if (result[1] < d.getFullYear()) {
			return false;
		} else if (result[1] == d.getFullYear() && result[3] > d.getMonth() + 1) {
			return false;
		}
	} else if (result[1] < d.getFullYear()) {
		return false;
	}
	return true;
}

/**
 * 功能: 验证表单中,用户输入内容是否适合
 * form 表单对象
 * showmode 显示方式：'alert'、'div'(默认)
 * 		alert: 使用alert函数提示
 * 		div:   显示在"元素名_msg"的DIV或TD
 */
function checkForm(form, showmode, act) {
	//第一个有提示信息的元素
	this.firstMsgElement = null;
	
	//提示信息的左边距
	this.msgBoxLeft = null;
	
	if (!showmode) {
		showmode = 'div';
	}
	
	if (act) {
		form.action = act;
	}
	if (form.tagName.toLowerCase() == 'form') {
		var eles = form.elements;
	} else {
		var eles = [form];
	}
	//frm的检查标记,默认true
	var succeed = true;
	
	var alert_msg = '';
	
	this.showError = function (ele, msg) {
		if (!msg || msg == '') {
			return ;
		}
		//设置第一个有提示信息的元素
		if (this.firstMsgElement == null && ele.type != 'hidden') {
			this.firstMsgElement = ele;
		}
		
		var idDiv = ele.name + '_msg';
		var msgp = $id(idDiv);
		
		// 尝试使用控件ID构建信息显示框ID
		if (!msgp) {
			msgp = $id(ele.id + '_msg');
			}
		
		if (!msgp) {
			msgp = document.createElement('div');
			msgp.className = 'reg_info';
			msgp.id = idDiv;
			msgp.style.zIndex = 9999;
			
			var posele = $name(ele.name);
			posele = posele[posele.length-1];
			
			document.body.appendChild(msgp);
			
			if (posele.type == 'hidden') {
				posele = $(posele).parent()[0];
			}
			
						
			var offset = getScreenOffset(posele);

			if (this.msgBoxLeft == null) {
				this.msgBoxLeft = offset.x + posele.clientWidth + 5;
			}
			msgp.style.position = 'absolute';
			msgp.style.left = this.msgBoxLeft + 'px';
			msgp.style.top = offset.y + 'px';
			
		}
		
		msgp.className = 'reg_info1';
		
		msgp.innerHTML = msg;
		msgp.style.display = '';
		
		if (msgp.style.position == 'absolute') {
			msgp.style.width = (msg.length + 2) + 'em';
		}
		
	}
	
	//隐藏信息
	this.hideError = function(ele) {
		var msgp = $id(ele.name + '_msg');
		if (!msgp) {
			msgp = $id(ele.id + '_msg');
			}
		
		if (msgp) {
			if (msgp.className == 'reg_info1') {
				msgp.className = '';
				msgp.innerHTML = '';
			} else if (msgp.className == 'reg_info'){
				msgp.style.display = 'none';
			}
		}
	}
try{
	CHECKELE:
	for (var i = 0; i < eles.length; i++) {
		var unitresult = true;
		var ele = eles[i];
		
		var break_for = false;
		
		//错误提示
		var errInfo = '';
		  
		//获取检查串
		if ($.browser.msie) {
			var valid_str = ele.valid;
		}else{
			var valid_str = ele.getAttribute('valid');
		}
		

		//没有设置则返回
		if(!valid_str) {
			continue;
		}
		
		var eleValue = ele.value;
		
		//分解属性
		var valids = valid_str.split('|');
		
		//处理单选和多选
		if ((ele.type == 'radio' || ele.type == 'checkbox') && in_array('required', valids)) {
			var result = isRadioChecked(ele.name);
			if (!result) {
				errInfo += '必须选择其中一个选项！';
				unitresult = false;
			}
		}
		
		//上传框
		if (ele.type == 'file') {
			for (vs = 0; vs < valids.length; vs++) {
				if (valids[vs].indexOf(':') > 0) {
					param = valids[vs].split(':');
					
					if (param[0] == 'type' && ele.value != ''){
						types = param[1].split(',');

						ftype = ele.value.split('.');
						result = in_array(ftype[ftype.length-1].toLowerCase(), types);
						if (!result) {
							errInfo += '只能上传指定的文件类型：' + types.join(',');
							unitresult = false;
						}
					}
					
				} else {
					if ('required' == valids[vs]) {
						var result = ele.value != '';
						if (!result) {
							errInfo += '请选择要上传的文件！';
							unitresult = false;
						}
					}
				}
			}
		}
		
		//下拉
		if (ele.type == 'select-one' || ele.type == 'select') {
			var result = isSelected(ele.name);
			if (!result) {
				errInfo += '必须选择其中一个选项！';
				unitresult = false;
			}
		}

		//检查text类型输入框
		if (ele.type == 'text' || ele.type == 'textarea' || ele.type == 'password' || ele.type == 'hidden') {
			for (var j = 0; j < valids.length; j++) {
				//元素值测试
				var result = true;
				switch (valids[j]) {
					case 'trim':
						ele.value = eleValue = jQuery.trim(eleValue);
						break;
					
					case 'required':
						result = (eleValue != '');
						if (!result) {
							errInfo += '请输入此项信息';
							unitresult = false;
						}
						break;
					
					case 'norequired':
						if (eleValue == '') {
							//result = true;
							//unitresult = true;
							break_for = true;
						}
						
						break;
						
					case 'alpha':
						var result = isAlpha(eleValue);
						
						if (!result) {
							errInfo += '只能输入英文！';
							unitresult = false;
						}
						
						break;
						
					case 'alpha_numeric':
						var result = isAlphaNumeric(eleValue);
						if (!result) {
							errInfo += '只能输入英文和数字！';
							unitresult = false;
						}
						break;
					
					case 'alpha_dash':
						var result = isAlphaDash(eleValue);
						if (!result) {
							errInfo += '只有输入英文、数字、_、- ！';
							unitresult = false;

						}
						break;
						
					case 'numeric':
						var result = isNumeric(eleValue);
						if (!result) {
							errInfo += '只能输入有效的数值！';
							unitresult = false;
						}
						break;
						
					case 'int':
						var result = isInt(eleValue);
						if (!result) {
							errInfo += '只允许输入整数！';
							unitresult = false;
						}
						break;
						
					case 'email':
						var result = isEmail(eleValue);
						if (!result){
							errInfo += 'email格式不正确！';
							unitresult = false;
						}
						break;
						
					case 'date':
						var result = isDate(eleValue);
						if (!result) {
							errInfo += '日期格式不正确;';
							unitresult = false;
						}
						if (!chkYear(eleValue)) {
							errInfo += "年份不能少于1970";
							unitresult = false;
							}
						
						// 只有完整的日期格式(年、月、日写全)才执行测试
						if (in_array("less_now", valids) && eleValue.match(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) && !isLessNow(eleValue)) {
							errInfo += "不能大于当前日期";
							unitresult = false;
						}
						// 只有完整的日期格式(年、月、日写全)才执行测试
						if (in_array("more_than_now", valids) && eleValue.match(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) && !isMoreThanNow(eleValue)) {
							errInfo += "不能少于当前日期";
							unitresult = false;
						}
						break;
					case 'time':
						if (eleValue != '') {
							if (!(rs = eleValue.match(/^(\d{2}):(\d{2})(:(\d{2}))?$/))) {
								errInfo += "时间格式不正确"
								unitresult = false;
							} else {
								if (parseInt(rs[1]) > 23) {
									errInfo += "时间格式不正确,＂小时＂不能超23";
									unitresult = false;
								}
								if (parseInt(rs[2]) > 59) {
									errInfo += "时间格式不正确,＂分钟＂不能超59";
									unitresult = false;
								}
								if (rs[4] && parseInt(rs[4]) > 59) {
									errInfo += "时间格式不正确,＂秒＂不能超59";
									unitresult = false;
								}
							}
						}
						break;
					case 'ID':
						if (eleValue) {
							result = isID(eleValue);
							if (!result) {
								errInfo += '不符合ID格式！';
								unitresult = false;
							}
						}
						break;
						
					case 'nospace':
						result = eleValue.indexOf(' ') == -1;
						if (!result) {
							errInfo += '不能含有空格！';
							unitresult = false;
						}
						break;
					
					default:
						if (valids[j].indexOf(':') > 0) {
							var part = valids[j].split(':'); 
							switch (part[0]) {
								case 'min_length':
									var result = (eleValue.length >= part[1]);
									if (!result) { 
										errInfo += ('最少要输入' + part[1] + '个字符！');
										unitresult = false;
									}
									break;
									
								case 'max_length':
									var result = (eleValue.length <= part[1]);
									if (!result) {
										errInfo += ('最多只能输入' + part[1] + '个字符！');
										unitresult = false;
									}
									break;
									
								case 'length':
									var result = (eleValue.length == part[1]);
									if (!result) {
										errInfo += ('必须输入' + part[1] + '个字符！');
										unitresult = false;
									}
									break;
									
								case 'fdate':
									if (eleValue == '') {
										break_for = true;
									} else {
										var result = isFdate(eleValue, part[1]);
										if (!result) {
											errInfo += '日期格式不正确。';
											unitresult = false;
										}
										if (!chkYear(eleValue)) {
											errInfo += "年份不能少于1970";
											unitresult = false;
										}
										// 只有完整的日期格式(年、月、日写全)才执行测试
										if (in_array("less_now", valids) && eleValue.match(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) && !isLessNow(eleValue)) {
											errInfo += "不能大于当前日期";
											unitresult = false;
										}
										// 只有完整的日期格式(年、月、日写全)才执行测试
										if (in_array("more_than_now", valids) && eleValue.match(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) && !isMoreThanNow(eleValue)) {
											errInfo += "不能少于当前日期";
											unitresult = false;
										}
									}
									break;
									
								case 'type':
									if (ele.value != ''){
										types = part[1].split(',');
				
										ftype = ele.value.split('.');
										result = in_array(ftype[ftype.length-1].toLowerCase(), types);
										if (!result) {
											errInfo += '只能选定文件的类型：' + types.join(',');
											unitresult = false;
										}
									}
									
									break;
							}
						}
						
				}
						//alert(unitresult);
				//unitresult = unitresult && result;
				
				if (break_for) {
					break;
				}
			}

			//succeed = succeed && unitresult;

			if (showmode == 'alert' && !unitresult) {
				if ($.browser.msie) {
					var msg_title = ele.msg_title;
				}else{
					var msg_title = ele.getAttribute('msg_title');
				}
				if (msg_title) {
					errInfo = msg_title + errInfo;
				}
			}

			
		}
		
		if (unitresult == false){
			succeed = false;
		}
		//显示提示信息到DIV 或 放到alert_msg
		SHOWMSG:
		if (showmode == 'div') {
			if (!unitresult) {
				this.showError(ele, errInfo);
			} else {
				this.hideError(ele);
			}
		} else if(!unitresult) {
			alert_msg += errInfo + "\n";
		}
	}
	
	
	if (showmode == 'alert' && alert_msg != '') {
		alert(alert_msg);
	}

	//将焦点放到第一个有提示信息的元素
	if (this.firstMsgElement != null && form.tagName.toLowerCase() == 'form') {
		this.firstMsgElement.focus();
	}
} catch(e) {
	alert(e);
	return false;
}
	return succeed;;
}

/**
 * 返回元素在页面中的offset
 * 返回: {x,y}
 */
function getScreenOffset(htmlObj){ 
   var  rd  =  {x:0,y:0} 
   do{ 
       rd.x  +=  htmlObj.offsetLeft          
       rd.y  +=  htmlObj.offsetTop 
       htmlObj  =  htmlObj.offsetParent
   }  while(htmlObj) 
   return  rd 
}

/**
 * 转向一个删除链接
 * url: 链接地址
 * msg: 提示信息(可选)
 */
function delConfirm(url, msg) {
	if (!msg) {
		msg = '确定要删除这条记录吗？';
	}
	Xwb.ui.MsgBox.confirm('提示',msg,function(id){
		if(id == 'ok'){
			window.location.href = url;
		}
	})
}





function isIE6() {
	return navigator.appVersion.match(/MSIE [0-6]\./);
}






function tigMsgConfirm(msg)
{
	var width, height, bodywidth, bodyheight, top, left;
	var offset = 0;
	var selects = $('select');
	bodywidth = document.documentElement.clientWidth;
	bodyheight = document.documentElement.clientHeight;
	$("#trans").css('display', 'block');
	$("#trans").css('width', document.body.scrollWidth + "px");
	$("#trans").css('height', document.body.scrollHeight + "px");
	$("#trans").css('backgroundColor', "");
	if (msg != '') {
		msg = msg.replace(/\n/g, '<br/>');
		$('#contentDiv').html(msg);
	}
	$('#tigMsg').css('display', 'block');
	height = $id('tigMsg').clientHeight;
	width = $id('tigMsg').clientWidth;
	top = Math.floor(bodyheight / 2) - Math.floor(height / 2) + document.documentElement.scrollTop;
	if (top < 0)
	{
		top = 60;
	}
	left = Math.floor(bodywidth / 2) - Math.floor(width / 2);
	$('#tigMsg').css('left', left+'px');
	$('#tigMsg').css('top', top+'px');
	if (isIE6()) {
		if (selects.length > 0) {
			for (var n = 0; n < selects.length; n++) {
				selects[n].disabled= 'disabled';
			}
		}
		var layer = document.createElement('IFRAME');
		if ($.browser.msie) {
			layer.id = 'ifdiv';
			layer.frameborder = 0;
		}else{
			layer.setAttribute('id', 'ifdiv');
			layer.setAttribute('frameborder', 0);
		}
		layer.style.zIndex = 100001;
		layer.style.border = 0;
		layer.style.position = 'absolute';
		layer.style.display = 'block';
		layer.style.width = width + 10 + 'px';
		layer.style.height = height + 'px';
		layer.style.visibility = '';
		layer.style.left =  left + 'px';
		layer.style.top = top + 'px';
		layer.style.backgroundColor = '#000';
		document.body.appendChild(layer);
	}
}

function closeTigMsg()
{
	$("#trans").css('display', 'none');
	$("#trans").css('width', 0);
	$("#trans").css('height', 0);
	$('#tigMsg').css('display', 'none');
	if (isIE6()) {
		$('#ifdiv').remove();
		var selects = $('select');
		if (selects.length > 0) {
			for (var n = 0; n < selects.length; n++) {
				selects[n].disabled= '';
			}
		}
	}
}

function defaultChecked(check_name)
{
	var url = window.location.href;
	var para_str = url.substring(url.indexOf("?")+1);
	var para_arr = para_str.split("&");
	var para_name;
	var para_value = "";
	var i,j;
	for(i=0;i<para_arr.length;i++){
		var para_name = para_arr[i].substring(0,para_arr[i].indexOf("="));
		if (para_name == "selected"){
			para_value = para_arr[i].substring(para_arr[i].indexOf("=")+1);
			break;
		}
	}

	if (para_value != ""){
		var id_arr = para_value.split(",");
		var name = $name(check_name);
		for(j=0;j<name.length;j++){
			if (in_array(name[j].value, id_arr)){
				name[j].checked = true;
			}
		}
	}
}

function toggleDiv(source,id)
{
	if (source.checked){
		$(id).hide();
	}else{
		$(id).show();
	}
}
function buildModulePath(module, action, querystring) {
		var base = typeof BASE_PATH == 'undefined' ? '': BASE_PATH;
		var file = typeof W_BASE_FILENAME == 'undefined' ? '': W_BASE_FILENAME;
		var get_var_mame = typeof R_VAR_NAME == 'undefined' ? 'm': R_VAR_NAME;
		var mode = ROUTE_MODE || 0;
		
		if (mode == 2 || mode == 3) {
			var uri = base + module;
			
			if (action) {
				if (action.indexOf('.') > -1) {
					uri += '/';
				}
				else {
					uri += '.';
				}
				uri += action;
			}
			
			if (querystring) {
				if (uri.indexOf('?') == -1) {
					uri += '?';
				}
				uri += querystring;
			}
			
			return uri;
		} else {
			var params = '?' + get_var_mame + '=' + module;
			if (action) {
				params += '.' + action;
			}
			
			if (querystring) {
				params += '&' + querystring;
			}
			
			return base + file + params; 
		}
	}

function isElement(o) {
	return !!(o && o.nodeType == 1);
}
function isNumber(o) {
	return Object.prototype.toString.call(o) == '[object Number]';
}
function isString(o) {
	return Object.prototype.toString.call(o) == '[object String]';
}

var mIndex = 0, sIndex = 0;

var admin = {
	index: {
		$selectedSubMenu : null,
		$selectedMainMenu : null,
		$selectedSubMenuContainer: null,
		$mainmenu_container: null,
		$submenu_container: null,
		$mainmenu: null,
		$submenu: null,
		
		/**
		 * select main menu
		 * @param n HTMLElement|int|'default'
		 *
		 */
		selectMainMenu: function(n, m) {
			with (admin.index) {
				if (!$mainmenu) {
					return;
				}
				if ($selectedMainMenu) {
					$selectedMainMenu.removeClass('current');
				}

				n = isNumber(n) || isElement(n) ? n : 'default';
				if (n == 'default') {
					$selectedMainMenu = $mainmenu.filter('.default');
					mIndex = $mainmenu.index($selectedMainMenu);
				} else {
					if (isElement(n))
					{
						$selectedMainMenu = $(n);
						mIndex = $mainmenu.index($selectedMainMenu);
					} else {
						$selectedMainMenu = $mainmenu.eq(n);
						mIndex = n;
					}
				}

				if (mIndex == -1)
				{
					mIndex = 0;
				}

				if (!$selectedMainMenu.length && !($selectedMainMenu = $mainmenu.eq(0)).length) {
					$selectedMainMenu  = null;
					return;
				}

				$selectedMainMenu.addClass('current').trigger('blur');
				// show selected sub-menu container
				$selectedSubMenuContainer = $submenu_container.eq($mainmenu.index($selectedMainMenu));
				selectSubMenu(m);
				$submenu_container.hide();
				$selectedSubMenuContainer.show();
			}
		},

		/**
		 * select sub menu
		 * @param n HTMLElement|int|'.default'
		 *
		 */
		selectSubMenu: function(n, jump) {
			jump = jump == undefined? true : false;
			with (admin.index) {
				if (!$submenu_container) {
					return;
				}
				if ($selectedSubMenu && $selectedSubMenu.length) {
					$selectedSubMenu.parent('li').removeClass('current');
				}
				if (!$selectedSubMenuContainer.length && !($selectedSubMenuContainer = $submenu_container.eq(0)).length) {
					$selectedSubMenuContainer = null;
					return;
				}

				$submenu = $selectedSubMenuContainer.find('a');
				n = isNumber(n) || isElement(n) || isString(n) ? n : '.default';
				if (n == '.default') {
					$selectedSubMenu = $submenu.filter('.default');
				}else if(isString(n) && n.indexOf('#') === 0) {
					$selectedSubMenu = $(n);
				} else {
					$selectedSubMenu = isElement(n) ? $(n) : $submenu.eq(n);
				}

				sIndex = $submenu.index($selectedSubMenu);
				(sIndex == -1) && (sIndex = 0);

				if (!$selectedSubMenu.length && !($selectedSubMenu = $submenu.eq(0)).length) {
					$selectedSubMenu = null;
					return false;
				}
				$selectedSubMenu.parent('li').addClass('current').trigger('blur');
				if (jump) {
					var router = isElement(n) ? '&router='+$(n).attr('router') : '';
					$('#mainframe').attr('src', $selectedSubMenu.attr('href') + router );
				}

				var hash = [mIndex,sIndex].join(',');
				window.location.hash = hash
			}
		},

		init: function() {
			with (admin.index) {
				// init main menu
				$mainmenu_container = $('#header ul li');
				$submenu_container = $('#side-menu > .menu-group ');
				$mainmenu = $mainmenu_container;

				// attach event to container
				$mainmenu_container.click(function(e) {
						selectMainMenu(this);
						return false;
				});
				$submenu_container.click(function(e) {
					if (e.target.tagName.toLowerCase() == 'a') {
						console.log(e.target);
						selectSubMenu(e.target);
						return false;
					}
				})

				var n = [], hash = window.location.hash;
				if (hash.length>1)
				{
					n = hash.substr(1).split(',', 2);
					selectMainMenu(parseInt(n[0]), parseInt(n[1]));
				} else {
					selectMainMenu();
				}
			}
		}
	}
}

$.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};


//如：1.1.0
function compareVersion(ver1, ver2) {
	var arr1 = ver1.split('.');
	var arr2 = ver2.split('.');
	
	var maxLen = arr1.length == arr2.length ? arr1.length: Math.max(arr1.length, arr2.length);

	for (var i = 0; i < maxLen ; i++ )
	{
		var part1 = arr1[i],part2 = arr2[i];

		if (!part1 && part2)
		{
			return 1;
		} else if (!part1 && !part2)
		{
			continue;
		} else if (part1 && !part2)
		{
			return -1;
		}

		part1 = parseInt(part1);
		part2 = parseInt(part2);

		if (part1 === part2)
		{
			continue;
		}

		return part1 - part2;
	}

	return 0;
}

//检测新版本
// 下次再说：当日不再出现
// 叉叉： 登录会再出现
// 点击升级链接：当日不再出现

var update_cookie = 'noUpdate';

function checkNewVer(url, currVer) {
	if ($.cookie(update_cookie))
	{
		return;
	}

	$.getJSON(url + '&jsonp=?',
	function (r) {

		if (!(r && r.downurl && r.ver))
		{
			return;
		}

		if (compareVersion(r.ver, currVer) > 0)
		{
			var html = [
				'<div class="update-tips fixed-update" id="xwb_update_tips">',
				'<h4><a class="clos" id="ud_close" href="javascript:;"></a>提示</h4>',
				'<div class="add-float-content">',
				r.text,
				'<a id="up_yes" class="update-link" href="'+r.downurl+'" target="_blank">立即升级</a><a href="javascript:;" id="up_no">以后再说</a>',
				'</div></div>'
			].join('');

			var $tips = $(html);

			$tips.find('#ud_close').click(function(e) { //关闭
				$.cookie(update_cookie, 1);
				$tips.hide();
			});
			
			$tips.find('#up_no').click(function(e) { //取消
				$.cookie(update_cookie, 1, {expires:1});
				$tips.hide();
			});

			$tips.find('#up_yes').click(function(e) {
				$.cookie(update_cookie, 1, {expires:1});
				$tips.hide();
			});

			$tips.appendTo('body');
		}

	});
}

	

