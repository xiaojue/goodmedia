/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20111101
 * @fileoverview 全站私信模块，包含页头提醒机制
 */
(function(W, G, $) {
	var sms = function() {

		var name, content, pid, GlobalT , T , timer = 5000, pushed , isInit , islock;
    var loadedcss=false;

		function now() {
			return new Date().valueOf();
		}

		var _sms = function(cg) {
			var _cg = {
				pushurl: 'http://x.idongmi.com/pm/indexAction.jsp?flag=send',
				pullurl: 'http://x.idongmi.com/pm/indexAction.jsp?flag=receive&callback=GM.widget.sms.pullback',
        close:'#J_SMSclose',
        template:function(o){
          return '<div class="inform_cont pletter_cont" style="position:relative;width:450px;height:240px;min-height:240px;background:#fff;">'+
          		'<div class="pletter_list">'+
          			'<div class="post">收件人：</div>'+
          			'<div class="pletter_content"><input id="J_SMSName" type="text" class="pletter_box1" readonly="readyonly" value=""></div>'+
          			'<div class="clear"></div>'+
          		'</div>'+
          		'<div class="pletter_list">'+
          			'<div class="post">内 容：</div>'+
          			'<div class="pletter_content">'+
          				'<div class="pletter_prompt" id="J_SizeWrap"></div>'+
          				'<textarea id="J_SMSContent" class="pletter_box2"></textarea>'+
          				'<div class="pletter_insert">'+
                  '<a href="javascript:void(0);" id="J_SMSFace"><span class="ico1"></span>表情</a>'+
          				'</div>'+
          			'</div>'+
          			'<div class="clear"></div>'+
          		'</div>'+
          		'<div class="pletter_but">'+
          			'<input type="button" value="发 信" id="J_SMSPost">'+
          		'</div>'+
              '<div style="position:absolute;width:15px;text-align:center;height:15px;line-height:15px;cursor:pointer;right:-5px;top:-5px;background:#000;color:#fff;font-size:18px;overflow:hidden;" title="关闭" id="'+o.close.slice(1)+'">&times</div>'+
              '</div>';
        }
      };
      if(cg) $.extend(_cg, cg);
			this.cg = _cg;
      this.overlay=$.overlay({
        content:_cg.template(_cg)
        });
		};

		_sms.prototype = {
			timeout: function() {
        islock=false;
				alert('相应超时,请重试');
			},
			push: function(data) {
        var that = this, cg = that.cg,data=$.param(data);
				T = now();
				pushed = false;
				that['pushcallback'+T] = that.pushback;
				$.getScript(cg.pushurl+'&'+data+'&callback=GM.widget.sms.pushcallback'+ T);
				GlobalT = setTimeout(function() {
					if (!pushed) {
            delete that['pushcallback'+T];
						that.timeout();
					}
				},
				timer);
			},
			pull: function(data) {
        var that=this,cg =that.cg;
				$.getScript(cg.pullurl);
			},
			setName: function(val) {
				name = val;
			},
			setContent: function(val) {
				content = val;
			},
			setPid: function(val) {
				pid = val;
			},
			pushback: function(data) {
        var that=this;
        clearTimeout(GlobalT);
				pushed = true;
        islock=false;
        /*
        {
          s:1|0,
          msg:'msg',
        }
        */
        if(data.s==1){
          alert('发送成功'); 
          that.overlay.close();
        }else{
          that.pusherror(data.msg);
        }
        delete that['pushcallback'+T];
			},
      pusherror:function(msg){
        alert(msg)
      },
			pullback: function(data) {
        var that=this;
        /*
         * {
         *  s:1|0,
         *  feedcount:0,
         *  somecount:someelse
         * }
         */
        if(data.s==1){
          that.updatebox(data);
        }
        //出错不理会，不做任何处理,成功则做消息提醒的update
			},
      updatebox:function(data){
        //更新气泡操作
        $(function(){
          if($('#J_Notice').length!=0 && $('#J_SMSNUM').length==0){
            $('#J_Notice').after('<div class="notice_txt"><a href="/pm/index.jsp">消息（<span id="J_SMSNUM"></span>）</a></div>');
          }
          var count=data['feedcount']+data['smscount'];
          $('#J_SMSNUM').text(count);
        });
      },
      startpull:function(){
        var that=this;
        that.pull()
        setInterval(function(){
            that.pull()
        },30*1000);
      },
      bindTarget:function(cg){
        var that=this;
        var _cg={
          smstarget:'.J_SMS',
          dataPid:'data-pid',
          dataName:'data-name'
        }
        $.extend(_cg,cg);
        $(_cg.smstarget).live('click',function(){
            if(!loadedcss){
              var host=GM.widget.host,place='-min';
              if(GM.debug) place='';
              $.loadcss(host+'sms/sms'+place+'.css');
              loadedcss=true;
            };
          var id=$(this).attr(_cg.dataPid),pname=$(this).attr(_cg.dataName);
          that.setPid(id);
          that.setName(pname);
          that.overlay.fire();

          $('#J_SMSName').val(name);

          if(!isInit){
            isInit=true;
            GM.widget.use('saycountdown',function(widget){
              var  mysay=new GM.widget.saycountdown({
                main:'#J_SMSContent',
                wrap:'#J_SizeWrap',
                errorCls:'blue',
                holdTarget:'#J_SMSPost',
                holdAction:function(){
                  var Contentval=$.trim($('#J_SMSContent').val()),
                      Nameval=$.trim($('#J_SMSName').val());
                  
                  that.setContent(Contentval);
  
                  if(Contentval=="" || Nameval==""){
                    alert('私信内容和收信人不能为空');
                    return;
                  }
    
                  //其他校验 暂时没有想到
                  if(!islock){
                     islock=true;
                     that.push({
                      pid:pid,
                      content:content
                    });   
                  }
                  
                }
              });
               mysay.init();
             });

            GM.apps.require('face',function(exports){  
              var SMSface=new exports.face({
                    target:'#J_SMSFace',
                    main:'#J_SMSContent'
                  });
                SMSface.init();
            });
          }
          return false;
        });

        $(that.cg.close).live('click',function(){
            that.overlay.close();  
        });
      },
      init:function(config){
        var that=this;
        that.startpull(); //初始化直接开始轮训消息通道
        that.bindTarget(config);
      }
		}

		return _sms;
	} ();

	if (G && G.widget) {
		G.widget.sms = new sms();
	}

})(window, GM, jQuery);

