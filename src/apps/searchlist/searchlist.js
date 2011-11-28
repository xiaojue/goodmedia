/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111124
 * @fileoverview 场馆教练的搜索结果页ajax模块
 */
(function(G, $, W) {
	var searchlist = function(config) {
    var _config={
        url:"",
        city:"",
        zone:""
    };
    $.extend(_config,config);
		dshop.use('paging', function() {
			GM.widget.use('cityzone', function(widget) {
				var mycity = widget.cityzone();
				//这里进行一个浏览器端的内存缓存队列，每次只要请求过的地址，则数据json保存在队列中，下次请求就来源内存。
				var mypaging, searchDate = {},
				lock = false;
				function findout() {
					var city = $('#J_City').find('.all'),
					zone = $('#J_Zone').find('.all'),
					project = $('#J_Project').find('.all'),
					tag = $('#J_Area').find('.all'),
					base = '<div id="J_FindOut" class="subbtn"></div><p>您已选择：</p>';
					city = (city.length < 1) ? '': '<input type="checkbox" class="J_Citybtn" checked="checked" value="' + city.text() + '"><span>' + city.text() + '<a class="J_closeIcity" href="#"></a></span>';
					zone = (zone.length < 1) ? '': '<input type="checkbox" class="J_Zonebtn" checked="checked" value="' + zone.text() + '"><span>' + zone.text() + '<a class="J_closeIzone" href="#"></a></span>';
					project = (project.length < 1) ? '': '<input type="checkbox" class="J_Projectbtn" checked="checked" value="' + project.text() + '"><span>' + project.text() + '<a href="#" class="J_closeIproject"></a></span>';
					tag = (tag.length < 1) ? '': '<input type="checkbox" class="J_tagbtn" checked="checked" value="' + tag.text() + '"><span>' + tag.text() + '<a href="#" class="J_closeItag"></a></span>';
					$('#J_SearchBar').html(base + city + zone + tag + project);
					var s = GLOBALskey;
					if (s) {
						s = decodeURIComponent(s);
						if (s != $('.J_Projectbtn').val()) $('#J_SearchBar').append('<input type="checkbox" value="' + s + '" class="J_S" checked="checked"/><span>' + s + '<a class="J_closeIjs" href="#"></a></span>');
					}
					$('input[value="全部城市"],input[value="显示全部"],input[value="全部城区"],input[value="全部项目"],input[value="全部地标"]').next().remove().end().remove();
					$('li:contains("唐山"),li:contains("嘉兴"),li:contains("南宁")').hide();
					if ($('#J_SearchBar').html() == base) setTimeout(function() {
						$('#J_FindOut').removeClass('btnactive');
					},
					50);
				}

				function initproject(str) {
					if (str === '') {
						str = '全部项目';
					}
					$('#J_Project a').each(function() {
						if ($(this).text() == str) $(this).addClass('all');
					});
					updateRt(function(data) {
						mypaging = new dshop.mods.paging({
							count: data['Count'],
							prevfn: function(current, node) {
								updateRt(current);
							},
							nextfn: function(current, node) {
								updateRt(current);
							},
							sizeclick: function(current, node) {
								updateRt(current);
							},
							wrap: '#J_Page',
							clsname: 'page place',
							viewsize: 10
						});
						mypaging.init();
					});
				}

				function citybtn() {
					$(this).parent().prev().remove();
					$(this).parent().remove();
					$('.J_Zonebtn').next().remove();
					$('.J_Zonebtn').remove();
					$('#J_Zone').find('.all').removeClass('all');
					$('#J_Zone').closest('.sgoal_txt').hide();
					$('#J_Area').find('.all').removeClass('all');
					$('#J_Area').closest('.sgoal_txt').hide();
					$('#J_City').find('.all').removeClass('all');
					$('.J_AllZone').addClass('all');
					$('.J_AllArea').addClass('all');
					$('.J_AllCity').addClass('all');
					updateRt();
					return false;
				}
				function zonebtn() {
					$(this).parent().prev().remove();
					$(this).parent().remove();
					$('#J_Zone').find('.all').removeClass('all');
					$('#J_Zone').find('.all').removeClass('all');
					$('.J_AllZone').addClass('all');
					updateRt();
					return false;
				}
				function projectbtn() {
					$(this).parent().prev().remove();
					$(this).parent().remove();
					$('#J_Project').find('.all').removeClass('all');
					$('.J_AllProject').addClass('all');
					updateRt();
					return false;
				}
				function tagbtn() {
					$(this).parent().prev().remove();
					$(this).parent().remove();
					$('#J_Area').find('.all').removeClass('all');
					$('#J_Area').find('.all').removeClass('all');
					$('.J_AllArea').addClass('all');
					updateRt();
					return false;
				}
				function js() {
					$(this).parent('span').prev().remove();
					$(this).parent().remove();
					$('#J_Q').val('请输入关键字');
					window.GLOBALskey = null;
					updateRt();
					return false;
				}

				$('.J_Citybtn,.J_closeIcity').live('click', citybtn);
				$('.J_Zonebtn,.J_closeIzone').live('click', zonebtn);
				$('.J_Projectbtn,.J_closeIproject').live('click', projectbtn);
				$('.J_S,.J_closeIjs').live('click', js);
				$('.J_tagbtn,.J_closeItag').live('click', tagbtn);

				function createOverlay(id, fun) {
					var temp = "<div class='sharelay'><div class='content'><i class='J_Closelay'>&times;</i><div id='" + id + "'></div></div></div>";
					$('body').append(temp);
					if (fun) fun("#" + id);
				}

				function clickview(that, ele) {
					$('.sharelay').hide();
					$(ele).closest('.sharelay').css({
						top: $(that).offset().top + 20,
						left: $(that).offset().left
					}).show();
				}

				function closelay() {
					$(this).closest('.sharelay').hide();
				}

				$('body').click(function(e) {
					var target = e.target;
					if ($(target).closest('.sharelay').length === 0) $('.sharelay').hide();
				});

				$('.J_Closelay').live('click', closelay);

				createOverlay("J_ShareLay", function(wrap) {
					dshop.use('share', function() {
						var sharetoweibo = new dshop.mods.share(wrap);
						sharetoweibo.init();

						$('.J_ShareWeibo').live('click', function() {
							var title = $(this).closest('.club_list').find('.J_title');
							var pic = $(this).closest('.club_list').find('.tu').attr('src');
							if (/nologo/gi.test(pic)) pic = "";
							sharetoweibo.change({
								title: title.text(),
								url: 'http://' + window.location.host + title.attr('href'),
								pic: pic
							});
							clickview(this, "#J_ShareLay");
							return false;
						});
					},
					['loadcss', 'template']);
				});
				createOverlay("J_FirendLay", function(wrap) {
					var temp = "<p><input type='text' id='J_FirendUrl' style='border:1px solid #ABADB3;width:230px;line-height:20px;height:20px;color:#787878;'> <input type='button' value='复制' id='J_Copy'></p>";
					$(wrap).html(temp);
				});

				GM.widget.use('copy', function() {
					$('.J_ShareFirend').live('click', function() {
						clickview(this, "#J_FirendLay");
						var url = $(this).closest('.club_list').find('.J_title').attr('href');
						url = 'http://' + W.location.host + url;
						$('#J_FirendUrl').val(url);
						GM.widget.copy('#J_Copy', url, '#J_FirendUrl');
						return false;
					});
				});

				$('#J_Project a').live('click', function() {
					$('#J_Project a').removeClass('all');
					$(this).addClass('all');
					findout();
					$('.J_S').next().remove();
					$('.J_S').remove();
					$('#J_FindOut').addClass('btnactive');
					$('#J_Q').val('请输入关键字');
					window.GLOBALskey = null;
					updateRt();
				});

				function removeS() {
					if ($('.J_Projectbtn').length > 0) {
						$('.J_S').next().remove();
						$('.J_S').remove();
					}
				}


				mycity.putscity('#J_City', '#J_Zone', '#J_Area', _config['city'], _config['zone'] , 'all', function(e) {
					//第一个是城市点击回调	
					if (!$(e).hasClass('J_AllCity')) {
						$('#J_Zone').parent().show();
						$('#J_Area').parent().show();
					}
          $('#J_Area>li').each(function(){
              if($(this).index('#J_Area>li')>15){
                $(this).hide();
              }
          });
          
          if($('#J_Area>li').length>=15){
            $('#J_Area>li').eq(15).after('<li class="J_ShowAll show"><a href="#" class="green">显示全部</a></li>');
          }

					findout();
					removeS();
					$('#J_FindOut').addClass('btnactive');
					updateRt();
				},
				function(e) {
					//第2个是zone点击回调
					$('#J_FindOut').addClass('btnactive');
					$('#J_Area').find('.all').removeClass('all');
					$('#J_Area').find('.all').removeClass('all');
					$('.J_AllArea').addClass('all');
					findout();
					removeS();
					updateRt();
				},
				function(e) {
					$('#J_FindOut').addClass('btnactive');
					$('#J_Zone').find('.all').removeClass('all');
					$('#J_Zone').find('.all').removeClass('all');
					$('.J_AllZone').addClass('all');
					findout();
					removeS();
					updateRt();
				});

        $('.J_ShowAll>a').live('click',function(){
            $('#J_Area>li').show();
            $(this).remove();
            $('.J_AllArea').addClass('all');
            return false;
        });

				initproject(W.GLOBALskey);
				findout();
				function updateRt(active) {
					var s = $('.J_S').val(),
					is = $('.J_S').attr('checked'),
					city = $('.J_Citybtn').val() ? 'c=' + $('.J_Citybtn').val() : '',
					zone = $('.J_Zonebtn').val() ? '&z=' + $('.J_Zonebtn').val() : '',
					tag = $('.J_tagbtn').val() ? '&tag=' + $('.J_tagbtn').val() : '',
					project = $('.J_Projectbtn').val() ? '&s=' + $('.J_Projectbtn').val() : '';
					if (project === '' && s) {
						if (s == '全部项目') s = '';
						project = '&s=' + s;
					} else if (project !== "" && s) {
						if (s == '全部项目') s = '';
						project = project + ' ' + s;
					}
					if (project == ('&s=' + s) && ! is) {
						project = '';
					}
					if (project == '&s=全部项目') project = '';
					if (zone == '&z=全部城区') zone = '';
					if (tag == '&tag=全部地标') tag = '';
					if (city == 'c=全部城市') city = '';
					var page = 1;
					if (typeof active == 'string') page = active;
					var q = $('#J_Q').val();
					if (q !== "请输入关键字") project = "&s=" + q;
					var arg = '?' + city + zone + tag + project + '&pageNo=' + page + '&max=10';
					//arg=encodeURIComponent(arg);
					arg = encodeURI(arg);
					if (lock) return;
					lock = true;
					if (!searchDate.hasOwnProperty(arg)) {
						$.ajax({
							url: _config["url"] + arg,
							success: function(data) {
								lock = false;
                var trimdata=data.replace(/\r\n/g,"");
								var ret = eval('(' + trimdata + ')');
								searchDate[arg] = ret;
								$('#J_siteResult').html(searchDate[arg]['Ret']);
								if (mypaging) mypaging.rebuild(searchDate[arg]['Count'], page);
								if (typeof active == 'function') active(ret);
							},
							error: function() {
								alert('网络错误，请重新选择一下看看');
								lock = false;
							}
						});
					} else {
						$('#J_siteResult').html(searchDate[arg]['Ret']);
						if (mypaging) mypaging.rebuild(searchDate[arg]['Count'], page);
						lock = false;
					}
					//window.location.href='/search/index.jsp'+arg;
				}

			});
		},
		['template']);
	};

	if (G && G.apps) {
		G.apps.searchlist = {
			exports:{
        searchlist:searchlist
      }
		};
	}
})(GM, jQuery, window);

