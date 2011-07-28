//全局通用php函数 
<?php
	function post($name){
		return @$_POST[$name];
	}

	function get($name){
		return @$_GET[$name];
	}
?>