(function(list){
	// open debug mode
	window.__debug = true;
	var jsbase,base,cssbase;
	  var scripts = document.getElementsByTagName('SCRIPT');
	  for(var i=0,len=scripts.length;i<len;i++){
	    var src = scripts[i].src;
	    if(src){
	      var idx = src.lastIndexOf("/admin-all.js");
	      if(idx>=0){
	        base = src.substring(0, idx);
	        base = base.substring(0, base.lastIndexOf('/')) + '/';
	        cssbase = base + 'css/';
	        jsbase = base + 'js/'
	        break;
	      }
	    }
	  }
	  if(!base)
	    throw 'base path not found.';
	    
	  XWB_BASE = base;
	
  var s = [];
           
  for(var i=0,len=list.length;i<len;i++){
    // mark some debug info
    if(window.__debug && window.onscriptloadcallback) s.push('<script type="text/javascript">if(window.onscriptloadcallback) onscriptloadcallback("'+list[i]+'");</script>');
    s.push('<script charset="utf-8" type="text/javascript" src="'+jsbase+list[i]+'"></script>');
  }
  document.write(s.join(''));
})([
'base/xwbapp.js',
'mod/xwbrequestapi.js',
'base/jqext.js',
'admin/template.js',
'base/selectionholder.js',
'base/actionmgr.js',
'base/validation.js',
'base/shortlink.js',
'ui/base.js',
'ui/contextmgr.js',
'ui/layer.js',
'ui/dlg.js',
'mod/validators.js',
'admin/mgr.js',
'admin/xwb-admin.js',
'admin/adminux.js'
]);