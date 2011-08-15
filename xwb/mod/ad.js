/*!
 * 广告
 */
(function(X, $){
    
    // 通用关闭处理
    function bindCommonClsTrig(cfg){
        var adId = cfg.flag, page = cfg.page;
        $('#ad_'+adId)
          .find('#xwb_ad_cls')
          .mousedown(function(){
            $('#ad_'+adId).cssDisplay(false);
            $.cookie('ad_'+page+'_'+adId+'_hide', '1', {expires:1});
            return false;
          });
    }
    
    var winResizeBinded;
    // left , right
    function gblLeftRightHandler(cfg){
        if(!winResizeBinded){
            // 广告竖幅离container间距
            var MARGIN = 20,
                jqCt = $('#container'),
                jqBoxLeft  = $('#ad_global_left'),
                jqBoxRight = $('#ad_global_right');   
         
            function ajustAdPos(){
                var left = jqCt.offset().left;
                jqBoxLeft.length && jqBoxLeft.css('left', left - jqBoxLeft.width() - MARGIN);
                jqBoxRight.length && jqBoxRight.css('left', left + jqCt.width() + MARGIN);
            }
            
            $(window).resize(ajustAdPos);
            winResizeBinded = true;
            
            // 页面加载后调整
            setTimeout(function(){
                jqBoxLeft.css('visibility','hidden').removeClass('hidden');
                jqBoxRight.css('visibility','hidden').removeClass('hidden');
                ajustAdPos();
                jqBoxLeft.css('visibility', '');
                jqBoxRight.css('visibility','');
            }, 20);
        }
    }
    
    X.mod.AdMgm.reg(function(ad){
        bindCommonClsTrig(ad);
    });
    
    X.mod.AdMgm.handlers = 
    $.extend(X.mod.AdMgm.handlers, {
        global_left : gblLeftRightHandler,
        global_right: gblLeftRightHandler
    });
})(Xwb, $);