var slide = {};

$(function () {
	//이미지들 폭 맞춤
	resizeImgWidth();

	//슬라이드 넘김 처리
	$(".slide_prev, .slide_next").click(function (event) {
		var slideAction = "next";

		//slideAction 클래스가 있다면 prev
		if ($(event.currentTarget).hasClass("slide_prev")) {
			slideAction = "prev";
		}

		var slideID = $(event.currentTarget).parents("[slide_id]").attr("slide_id");

		var objLoader = $("#el_" + slideID + " .slide_loader");
		var objImg = $("#el_" + slideID + " .slide_img");
		var objLike = $("#el_" + slideID + " .slide_link");

		var objSlide = $("#slide_" + slideID + "_data");
		var idx = objSlide.attr("idx");
		var length = objSlide.attr("length");

		if (slideAction == "next") {
			idx = parseInt(idx) + 1;
		} else {
			idx = parseInt(idx) - 1;
		}

		//슬라이드의 길이를 넘어갔다면 다시 첫번째로 순환
		if (idx > length) {
			idx = 1;
		}
		else if (idx < 1) {
			idx = length;
		}

		var page_width = $(".page").width();
		var slide_width = parseInt(page_width) * 0.8;

		var objChangeImg = objSlide.find("div[img_no='" + idx + "']");
		var imgUrl = objChangeImg.attr("img_url");

		var img_size = {width:"", height:""};
		var img_width = parseInt(objChangeImg.attr("img_width"));
		var img_height = parseInt(objChangeImg.attr("img_height"));

		//가로가 길거나 같으면
		if (img_width >= img_height) {
			//이미지의 넓이가 preview 영역보다 넓다면
			if (img_width > slide_width) {
				img_size["width"] = "100%";
			}
		}
		//세로가 긴형
		else {
			img_size["height"] = "99%";
		}

		objImg.hide();
		objLoader.show();
		objImg.width(img_size["width"]);
		objImg.height(img_size["height"]);

		objImg.attr("src", imgUrl);
		objLike.attr("href", imgUrl);

		$("#slide_" + slideID + "_data").attr("idx", idx);

		//기존 불끄기
		$("#el_" + slideID + " .slide_paging img[src$='on.png']").attr("src", "/img/landing/paging_off.png");
		//새로운놈 불키기
		$("#el_" + slideID + " .slide_paging img:eq(" + (parseInt(idx)-1) + ")").attr("src", "/img/landing/paging_on.png");
	});

	//슬라이드 swipe
	$(".el_slide").live("swipeleft", function () {
		$(this).find(".slide_next").trigger("click");
	});

	$(".el_slide").live("swiperight", function () {
		$(this).find(".slide_prev").trigger("click");
	});

	$(".slide_next").trigger("click");

	$(".slide_img").load(function (event) {
		var slideID = $(event.currentTarget).parents("[slide_id]").attr("slide_id");

		var objLoader = $("#el_" + slideID + " .slide_loader");
		var objImg = $("#el_" + slideID + " .slide_img");

		objLoader.hide();
		objImg.fadeIn("fast");
	});

	//마지막 아이콘의 right 마진 없애기
	$(".el_sns .sns_icon:last").css("margin-right", "0");

	var userAgent = navigator.userAgent;
	var re = new RegExp("iPhone","ig");
	var isiPhone = re.test(userAgent);

	isiPhone = true;
	if (isiPhone) {
		$.each($(".slide2_holder"), function (i, obj) {
			var id = $(obj).attr("id");

			var imgData = eval(id + "_imgList");
			var img_length = $(obj).attr("img_length");

			//$(obj).css({"width" : "290px", "height" : "210px"});

			var html = "<div id='" + id + "_title' class='slide_coverflow_title'></div>";
			$(obj).after(html);

			var cv = new coverflow(obj, {
				"imageData" : imgData,
				"imageSize" : 240,
				"imageLength" : img_length,
				"afterEffect" : function(idx) {
					if ($(obj).attr("titleshow") == "1") {
						chnageTitle(id + "_title", imgData[idx].title);
					}
				}
			});
		});
	} else {
		$.each($(".slide2_holder"), function (i, obj) {
			var id = $(obj).attr("id");
			var imgData = eval(id + "_imgList");
			var titleshow = ($(obj).attr("titleshow") == "1");

			$(obj).XSlide({
				showImgCnt : 3,
				basicBoxSize : [160, 120],
				centerBoxSize : [240, 180],
				marginCenterImg : -135,
				imgList : imgData,
				titleShow : titleshow
			});
		});
	}

});

//이미지들 폭 맞춤
function resizeImgWidth() {
	var page_width = $(".page").width();

	//페이지 넓이 최대 320px에 고정
	if (page_width > 320) {
		$(".page").wrap("<div class='page_wrap' style='width:320px; margin:0 auto;'></div>");
		$(".page_wrap")
			.css("background-color", $("body").css("background-color"))
			.css("background-image", $("body").css("background-image"));

		switch (skin) {
			case "a_1" :
				$("body").css("background-color", "#1D3D6D");
				break;
			case "a_2" :
				$("body").css("background-color", "#893701");
				break;
			case "a_3" :
				$("body").css("background-color", "#3D3D3D");
				break;
			case "b_1" :
				$("body").css("background-image", "url('/img/landing/b_1_body_bg.png')");
				break;
			case "b_2" :
				$("body").css("background-image", "url('/img/landing/b_2_body_bg.png')");
				break;
			case "b_3" :
				$("body").css("background-image", "url('/img/landing/b_3_body_bg.png')");
				break;
		}
		//$("body").css({"background-image" : "url('/img/landing/margin_bg.png')"});
		$("#footer").css({"width" : "320px", "margin-left" : "auto", "margin-right" : "auto"});
		page_width = 320;
	}

	//지도 이미지 처리
	$.each($(".el_map"), function (key, obj) {
		var objLink = $(this).find("a");
		var lat, lng, zoom;
		lat = objLink.attr("lat");
		lng = objLink.attr("lng");
		zoom = objLink.attr("zoom");

		var width, height;
		width = $(this).width();
		height = window.document.body.clientHeight;

		if (height == 356) height = 386;
		else if (height == 208) height = 248;

		var mapImgUrl = "http://maps.google.com/maps/api/staticmap?";
		mapImgUrl += "language=ja&center=" + lat + "," + lng + "&zoom=" + zoom + "&sensor=false&markers=" + lat + "," + lng;
		mapImgUrl += "&size=" + width + "x" + height;

		objLink.html("<img src='" + mapImgUrl + "'>");
	});

	var slide_width = parseInt(page_width) * 0.8;
	var slide_height = slide_width;

	$(".img_width_100").removeClass("img_width_100");

	$(".slide_container").width(slide_width);
	$(".slide_container").height(slide_height);

	$.each($(".el_sub_img1 img"), function (key, obj) {
		var img_width = $(obj).attr("img_width");
		if (img_width >= page_width) {
			$(obj).addClass("img_width_100");
		}
	});

	//img2 처리
	var t_img2_size = $(".t_img2-1").width();
	$(".t_img2-1, .t_img2-2").css({width : t_img2_size + "px", height : t_img2_size + "px"});

	//이미지 사이즈 처리
	$.each($(".t_img2-1 img, .t_img2-2 img"), function (i, d) {
		var img_width = $(d).attr("img_width");
		var img_height = $(d).attr("img_height");

		var attr = getImgSizeAttr(img_width, img_height, t_img2_size, t_img2_size);

		if (attr == "width") {
			$(d).css({"width" : "100%", "height" : ""});
		}
		else if (attr == "height") {
			$(d).css({"width" : "auto", "height" : "100%"});
		}
		else {
			$(d).css({"width" : "auto", "height" : "auto"});
		}
	});

	//img3 처리
	var t_img3_size = $(".t_img3-1").width();
	$(".t_img3-1, .t_img3-2, .t_img3-3").css({width : t_img3_size + "px", height : t_img3_size + "px"});

	//이미지 사이즈 처리
	$.each($(".t_img3-1 img, .t_img3-2 img, .t_img3-3 img"), function (i, d) {
		var img_width = $(d).attr("img_width");
		var img_height = $(d).attr("img_height");

		var attr = getImgSizeAttr(img_width, img_height, t_img3_size, t_img3_size);

		if (attr == "width") {
			$(d).css({"width" : "100%", "height" : "auto"});
		}
		else if (attr == "height") {
			$(d).css({"width" : "auto", "height" : "100%"});
		}
		else {
			$(d).css({"width" : "auto", "height" : "auto"});
		}
	});

	//img4 처리
	var t_img4_size = $(".t_img4-1").width();
	$(".t_img4-1, .t_img4-2, .t_img4-3, .t_img4-4").css({width : t_img4_size, height : t_img4_size});

	//이미지 사이즈 처리
	$.each($(".t_img4-1 img, .t_img4-2 img, .t_img4-3 img, .t_img4-4 img"), function (i, d) {
		var img_width = $(d).attr("img_width");
		var img_height = $(d).attr("img_height");

		var attr = getImgSizeAttr(img_width, img_height, t_img4_size, t_img4_size);

		if (attr == "width") {
			$(d).css({"width" : "100%", "height" : "auto"});
		}
		else if (attr == "height") {
			$(d).css({"width" : "auto", "height" : "100%"});
		}
		else {
			$(d).css({"width" : "auto", "height" : "auto"});
		}
	});
}

function getImgSizeAttr(width, height, limitWidth, limitHeiht) {
	//가로가 길거나 같으면
	if (width >= height) {
		//이미지의 넓이가 preview 영역보다 넓다면
		if (width > limitWidth) {
			return "width";
		}
		else {
			return "";
		}
	}
	//세로가 긴형
	else {
		return "height";
	}
}