/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20120111
 * @fileoverview iframe自适应高
 */
(function(W,G,$) {
	//iframe auto height
	function iframeAutoFit() {
		try {
			if (self !== top) {
				var a = parent.document.getElementsByTagName("IFRAME");
				for (var i = 0; i < a.length; i++) {
					if (a[i].contentWindow == window) {
						var h1 = 0,
						h2 = 0,
						d = document,
						dd = d.documentElement;
						a[i].parentNode.style.height = a[i].offsetHeight + "px";
						a[i].style.height = "10px";
						if (dd && dd.scrollHeight) h1 = dd.scrollHeight;
						if (d.body) h2 = d.body.scrollHeight;
						var h = Math.max(h1, h2);
						if (document.all) {
							h += 4;
						}
						if (window.opera) {
							h += 1;
						}
						a[i].style.height = h + "px";
						//iframe h
						a[i].parentNode.style.height = h + "px";
					}
				}
      }
    }
    catch(ex) {}
	}
  
  if(G && G.widget){
    G.widget.frameauto=iframeAutoFit;
  }
  
})(window,GM,jQuery);

