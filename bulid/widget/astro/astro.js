/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111019
 * @fileoverview 星座和日期匹配函数
 */
(function(W, G) {
	var astro = function(month, day) {
		var xingzuo = 0;
		switch (month) {
		case 1:
			if (day > 20) {
				xingzuo = 11;
			} else {
				xingzuo = 10;
			}
			break;
		case 2:
			if (day > 18) {
				xingzuo = 12;
			} else {
				xingzuo = 11;
			}
			break;
		case 3:
			if (day > 20) {
				xingzuo = 1;
			} else {
				xingzuo = 12;
			}
			break;
		case 4:
			if (day > 20) {
				xingzuo = 2;
			} else {
				xingzuo = 1;
			}
			break;
		case 5:
			if (day > 20) {
				xingzuo = 3;
			} else {
				xingzuo = 2;
			}
			break;
		case 6:
			if (day > 21) {
				xingzuo = 4;
			} else {
				xingzuo = 3;
			}
			break;
		case 7:
			if (day > 22) {
				xingzuo = 5;
			} else {
				xingzuo = 4;
			}
			break;
		case 8:
			if (day > 22) {
				xingzuo = 6;
			} else {
				xingzuo = 5;
			}
			break;
		case 9:
			if (day > 22) {
				xingzuo = 7;
			} else {
				xingzuo = 6;
			}
			break;
		case 10:
			if (day > 23) {
				xingzuo = 8;
			} else {
				xingzuo = 7;
			}
			break;
		case 11:
			if (day > 21) {
				xingzuo = 9;
			} else {
				xingzuo = 8;
			}
			break;
		case 12:
			if (day > 21) {
				xingzuo = 10;
			} else {
				xingzuo = 9;
			}
			break;
    }
		$('#astro').val(xingzuo);
	}

  if(G && G.widget) G.widget.astro=astro;

})(window, GM);

