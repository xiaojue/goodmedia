(function(a,c){var b=function(e){if(!e){return}var d="/course/courseAction.jsp";$.ajax({url:d,data:e,success:function(f){if($.trim(f)==1){alert("分享成功！")}else{alert("网络超时,请重试")}},error:function(){alert("网络超时,请重试")},timeout:5000})};if(c&&c.widget){c.widget.sharetosina=b}})(window,GM);