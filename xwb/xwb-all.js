/*!
 * 列表方式加载便于开发模式下调试脚本。
 * 建议开发时以列表方式加载，
 * 待发布时再打包压缩列表中的脚本文件成单一文件。<br/>
 * 除/mod/外的都是JavaScript基本API部份，可独立使用。<br/>
 * /mod/下的JavaScript是与Xweibo实现有关的API。
 */
(function(list){
	// 是否打开调试模式
	__debug = true;
	var jsbase,base;
	  var scripts = document.getElementsByTagName('SCRIPT');
	  for(var i=0,len=scripts.length;i<len;i++){
	    var src = scripts[i].src;
	    if(src){
	      var idx = src.lastIndexOf("/xwb-all.js");
	      if(idx>=0){
	        base = src.substring(0, idx);
	        base = base.substring(0, base.lastIndexOf('/')) + '/';
	        jsbase = base + 'js/';
	        break;
	      }
	    }
	  }
	  if(!base)
	    throw 'base path not found.';
	
  var s = [];
           
  for(var i=0,len=list.length;i<len;i++){
    s.push('<script charset="utf-8" type="text/javascript" src="'+jsbase+list[i]+'"></script>');
  }
  document.write(s.join(''));
})([
'base/xwbapp.js',
'mod/xwbrequestapi.js',
'base/jqext.js',
'mod/template.js',
'base/eventable.js',
'base/selectionholder.js',
'base/actionmgr.js',
'base/validation.js',
'base/shortlink.js',
'ui/base.js',
'ui/contextmgr.js',
'ui/layer.js',
'ui/dlg.js',
'base/pipemgr.js',
'mod/ux.js',
'mod/actions.js',
'mod/validators.js',
'mod/ad.js',
'mod/pagelets.js',
'mod/ready.js'
]);