(function(X, $){

var ui = X.ui;
var FALSE = false;
var TRUE  = true;
var Util  = X.util;
var doc = document;

/**
 * @class Xwb.ui.MgrDlg
 * 本类是Xwb后台浮层管理类，可控制浮层显示、验证、提交等复杂动作。
 * @param {Object} config  该配置信息将被完全地复制到当前实例中，并会覆盖相同属性名的默认值。
 * */

/**
 * @cfg {Object} dlgcfg
 * 对本控件显示模块的配置{@link #dlg}
**/

/**
 * @cfg {Object} valcfg
 * 对本控件验证模块的配置{@link #valObj}
**/

/**
 * @cfg {String} modeHtml
 * 显示的内容模版,该属性直接赋值显示实例的contentHtml属性
**/

/**
 * @cfg {String} modeUrl
 * 显示的内容模版,该属性直接赋值显示实例的contentHtml属性,配置该属性可以动态的请求内容模版
**/

/**
 * @cfg {String} url
 * 显示框的提交地址 异步模式和表单模式都适用
**/

/**
 * @cfg {Function} convertData
 * 数据转换,如果ajax请求有特殊的数据处理要求我们可以用这个函数来处理，
 * 函数参数data:验证器提供的表单键值对，我们需返回用于ajax的数据
**/

/**
 * @cfg {Object} ajaxcfg
 * 异步模式下异步提交数据的特殊配置
 **/

/**
 * @cfg {Function} success
 * 异步模式下验证通过jQuery的回调函数 函数参数 rst:jQuery回调函数参数，dlg:本控件的{@link #dlg}实例。  
 * 函数如果返回值不为false 显示控件会关闭
 * */

/**
 * @cfg {Function} actiontrig
 * 本控件默认开启 rel 事件监听，
 * 该函数可处理rel事件，
 * 函数的参数e:是 {@link Xwb.ax.ActionEvent} 实例
 * */

/**
 * @cfg {Function} afterDisplay 
 * 控件所有初始化完成后调用的函数
 * */

/**
 * @cfg {Boolean} formMode 
 * 设置控件运行模式，true为表单提交模式 默认是异步提交模式
 * */

/**
 * @cfg {Function} selfChk 
 * 在表单特殊的验证要求,当验证器通过以后运行。返回false终止提交过程
 * */
 
 /**
 * @property dlg
 * 控件的 Xwb.ui.Dialog 实例 用于显示
 * @type Xwb.ui.Dialog
 */
 /**
 * @property valObj
 * 本控件的 Xwb.ax.ValidationMgr 实例 用于验证
 * @type Xwb.ax.ValidationMgr
 */


ui.MgrDlg=X.reg('MgrDlg',Util.create());

ui.MgrDlg.prototype={
		// dlg:NULL,//Dlg对象
		
		// valObj:NULL,//验证器对象
		
		init:function(config){
			$.extend(this,config);
			//构建Dlg并附加没有的必要参数
			var self=this;
			this.dlg=X.use('Dlg',$.extend({},{
                mask : FALSE,
                appendTo:doc.body,
                cs: 'win-pub win-fixed',
                actionMgr:true,
                closeable:true,
                mask:true,
                onactiontrig:function(e){
                	switch (e.get('e')){
                	 case 'cal':this.close();break;
                	}
                	self.actiontrig && self.actiontrig(e); 
                }
			},this.dlgcfg));
			//在验证器上附加formSuccess函数
			$.extend(this.valcfg,{onsuccess:Util.bind(this.formSuccess,this)});
			this.dlg && this.loadDlg();
		},
		
		afterDisplay:$.noop,
		
		//更具配置加载Dlg
		loadDlg:function(){
			var self=this;
			if(this.modeHtml){
				this.dlg.contentHtml=this.modeHtml;
				this.loaded();
			}
			else if(this.modeUrl){
				$.get(this.modeUrl,function(txt){
					self.dlg.contentHtml= typeof txt =='string' ? txt : txt.rst;
					self.loaded();
				});
				return;
			}
		},
		//加载完成之后
		loaded:function(){
			if( this.DlgIsLoad ) { this.dlg.jq('#xwb_dlg_ct').html(this.dlg.contentHtml); this.dlg.onViewReady(this.dlg.view); }
			this.dlg.display(true);
			this.dlgcfg && this.dlgcfg.width && this.dlg.jq().css('width',this.dlgcfg.width + 'px');
			//自动检测表单
			if( this.valcfg && this.valcfg.form == 'AUTO'){
				this.valcfg.form= "#" + this.dlg.jq("form").attr('id');
			}
			//加载验证器
			 this.valcfg && ( this.valObj=X.use('Validator',this.valcfg) );
			 if(this.formMode && this.formMode ===TRUE){
			 	this.url && (this.valObj.form.action=this.url);
			 } else {
			 	if( !this.url && this.valcfg ) this.url = this.valObj.form.action;
			 }
			this.afterDisplay  && this.afterDisplay();
		},
/**
 * 用于动态内容模版的时候重新请求模版内容
 **/
		reload:function(){
			this.modeUrl && ( this.modeUrl = this.modeUrl+"&"+ Math.random() );
			this.loadDlg();
			this.DlgIsLoad=true;
		},
		//转换表单字段
		convertData:function(data){
			return data;
		},
		
		//提交返回
		success:$.noop,
		
		//验证成功
		formSuccess:function(data , next){
			var self=this;
			if(this.selfChk && this.selfChk(data) == FALSE) { next(); return FALSE; }
			if(this.formMode && this.formMode ===TRUE){
				next();
				return true;
			}
			else{
				var ajaxobj=$.extend({
					url:this.url,
					data:this.convertData(data),
					success:function(ret){
						if(self.success(ret,self.dlg) !== FALSE){
							self.dlg.close();
						}
						next();//表单成功返回解锁表单
					}
				},this.ajaxcfg);
				
				$.ajax(ajaxobj);
			}
			return false;
		}
};

})(Xwb, $);