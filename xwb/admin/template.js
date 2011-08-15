/**
 * 模板HTML可任意改，但ID和模板名称不能更改
 */
Xwb.ax.Tpl.reg({
    Box : [
        '<div class="win-pop {.cs}">',
            '<div class="win-t"><div></div></div>',
            '<div class="win-con">',
                '<div class="win-con-in">',
                    '[?.title?{BoxTitlebar}?]',
                    '<div class="win-box" id="xwb_dlg_ct">',
                        '{.contentHtml}',
                    '</div>',
                '</div>',
                '<div class="win-con-bg"></div>',
            '</div>',
            '<div class="win-b"><div></div></div>',
            '[?.closeable?<a href="#" class="icon-close-btn icon-bg" id="xwb_cls" title="关闭"></a>?]',
            '{.boxOutterHtml}',
        '</div>'
     ].join(''),
     
     DialogContent : '{.dlgContentHtml}<div class="btn-area" id="xwb_dlg_btns">{.buttonHtml}</div>',
          
     BoxTitlebar : '<h4 class="win-tit x-bg"><span id="xwb_title">{.title}</span></h4>',
     
     Mask : '<div class="mask"></div>',
     
  

     
     MsgDlgContent : '<div class="tips-c"><div class="icon-alert all-bg" id="xwb_msgdlg_icon"></div><p id="xwb_msgdlg_ct"></p></div>',
     
     Button : '<a href="#" class="general-btn {.cs}" id="xwb_btn_{.id}"><span>{.title}</span></a>',

	EmotionHotList: '<div class="hot-e-list" id="hotEm">{.hotList}</div>',
     
     EmotionBoxContent : [
        '<div class="win-tab bottom-line" id="cate">',
		 '	{.category} ',
        '</div>',
        '<div class="emotion-box" id="box">',
			'{EmotionHotList}',
            '<div class="e-list" id="flist0">',
				'{.faces}',
            '</div>',
        '</div>'
     ].join(''),
     ArrowBoxBottom  : '<div class="arrow all-bg"></div>',
     EmotionIcon       : '<a href="javascript:;" title="{.title}" rel="e:em"><img src="{.src}"></a>',
     Loading : '<div id="xweibo_loading" class="loading"></div>',
    
	PreviewBox: [
		'<div class="preview-img"></div>'
	].join(''),
	
    
    UploadImgBtn : '<a href="#" rel="e:dlp" class="icon-close-btn icon-bg" title="删除"></a>',
   
    AnchorTipContent : '<div class="tips-c"><div class="icon-correct"></div><p id="xwb_title"></p></div>',
    
    AnchorDlgContent : '<div class="tips-c"><div class="icon-correct"></div><p id="xwb_title"></p></div>',

    colorBox : ['<ul>',
                '<li class="cur" rel="e:getCls,c:#000,w:bg1"><span style="background:#000"></span></li>',
					'<li rel="e:getCls,c:#808080,w:bg2"><span style="background:#808080"></span></li>',
					'<li rel="e:getCls,c:#f66,w:bg3"><span style="background:#f66"></span></li>',
					'<li rel="e:getCls,c:#90c,w:bg4"><span style="background:#90c"></span></li>',
					'<li rel="e:getCls,c:#e7f2fb,w:bg5"><span style="background:#e7f2fb"></span></li>',
					'<li rel="e:getCls,c:#fff,w:bg6"><span style="background:#fff"></span></li>',
					'<li rel="e:getCls,c:#f00,w:bg7"><span style="background:#f00"></span></li>',
					'<li rel="e:getCls,c:#f60,w:bg8"><span style="background:#f60"></span></li>',
					'<li rel="e:getCls,c:#fc0,w:bg9"><span style="background:#fc0"></span></li>',
					'<li rel="e:getCls,c:#090,w:bg10"><span style="background:#090"></span></li>',
				'</ul>',
				'<div class="btn-area">',
					'<a href="#" class="general-btn" rel="e:comf"><span>确定</span></a>',
				'</div>'].join('')
});



