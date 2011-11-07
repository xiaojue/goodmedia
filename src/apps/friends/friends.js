/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111107
 * @fileoverview 站内短信的好友列表
 */
(function(W, $, G) {
	var friends = function(uid, main,ids ,width, height) {
		this.uid = uid;
		this.main = main;
    this.ids=ids;
		this.width = width || 315;
		this.height = height || 150;
		this.listId = '#J_Firends_' + now();
	};

	var Lock, T, timer;

	function now() {
		return new Date().valueOf();
	}

	friends.prototype = {
		_timeout: function() {
      var that=this;
			that.ready = true;
			$(that.listId).append('<li data-id="-1">好友列表获取失败，请刷新重试</li>');
			delete GM.apps.friends['_batchlist' + T];
		},
		_getlist: function() {
			T = now();
			var url = 'http://x.idongmi.com/api/followAjax.jsp',
			that = this;
			if (!Lock) {
				Lock = true;
        GM.apps.friends['_batchlist'+T]=function(data){
          that._batchlist(data);
        };
				$.getScript(url + '?uid=' + this.uid + '&callback=GM.apps.friends._batchlist' + T);
				timer = setTimeout(function() {
            that._timeout();
				},
				5000);
			}
		},
		_batchlist: function(data) {
			var that = this;
			Lock = false;
			clearTimeout(timer);
			//{
			// s:[{
			//  id:'xx',
			//  name:'xx'
			// },{
			//  id:'xx',
			//  name:'xx'
			// }]
			//}
			$.each(data.s, function(index, o) {
				$(that.listId).append('<li data-id="' + o.id + '">' + o.name + '</li>');
			});
			if (data.s.length === 0) {
				$(that.listId).append('<li data-id="-1">你暂时还没有好友</li>');
			}
			that.ready = true;
      var height=that.height;
      if($(that.listId).height()>=height) $(that.listId).height(height); 
			delete GM.apps.friends['_batchlist' + T];
		},
		hide: function() {
			$(this.listId).hide();
		},
		show: function() {
			$(this.listId).show();
		},
		_bulidlist: function(data) {
			var that = this,
			main = that.main,
			height = that.height,
			width = that.width,
			id = that.listId.slice(1);
      $(main).after('<ul id="' + id + '" style="z-index:50;background:#fff;color:#a4a4a4;line-height:20px;display:none;overflow-y:auto;width:' + width + 'px;position:absolute;left:0px;top:' + ($(main).height()+5) + 'px;border:#c5c5c5 solid 1px;"></ul>');
		},
		init: function() {
      var that=this;
			that._bulidlist();
      $(that.main).attr('autocomplete','off');
			$(that.listId).find('li').live('mouseover', function() {
				$(this).css({
					background: '#e6f8fe',
					color: '#3f9dfb'
				});
			}).live('mouseout', function() {
				$(this).css({
					background: '#fff',
					color: '#a4a4a4'
				});
      }).live('click',function(){
          var id=$(this).attr('data-id');
          if(id != -1){
            var name=$(this).text(),
                val=$(that.main).val().replace('请从好友列表中选择昵称','');
                if(val.split(',').length>=5){
                  alert('最多同时给五个人群发私信');
                  that.hide();
                  return;
                }
                var reg=new RegExp(name);
                if(!reg.test(val)){
                  if(val===''){
                    val=name;
                  }else{
                     val+=','+name;
                  }
                }
                $(that.main).val(val);
                var ids=$(that.ids).val();
                    idsarr=ids.split(',');
                    if(idsarr[0]==="") idsarr.shift();
                    idsarr.push(id);
                    $(that.ids).val(idsarr.join(','));
                that.hide();
          }
      });
      $(that.main).live('focus',function(){
        that.hide();
      });
    $(that.main).live('keydown',function(e){
        //阻止ctrl+v
        if(e.ctrlKey && e.keyCode==86){
          e.keyCode=0;
          e.returnValue=false;
          return false;
        }
        //修改对应的backspace和del按键
        if(e.keyCode==8 || e.keyCode==46){
          var myvalue=$(this).val(),
              arr=myvalue.split(','),
              str=arr.slice(0,arr.length-1).join(',');
              if(str==',') str='';
              $(this).val(str);

               var ids=$(that.ids).val(),
               idsarr=ids.split(',');
               idsarr.pop();
               $(that.ids).val(idsarr.join(','));
        }
          return false;
      });
			that._getlist();
      $(that.ids).val("");
		}
	};

	if (G && G.apps) {
		G.apps.friends = {
			exports: {
				friends: friends
			}
		};
	}
})(window, jQuery, GM);

