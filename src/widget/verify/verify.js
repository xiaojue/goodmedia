/**
 * @author fuqiang[designsor@gmail.com]
 * @version 20110905
 * @fileoverview 哥实在扛不住了，所以哥决定写一个校验组件 -_-||
 */
(function($,W,G){
	
	var verify=function(config,rule){
		
		var _config={
			form:null,
			target:null, //form和target只能写一个
			cls:null,
			success:null,
			batchcallback:null,
			attrname:'data-v' //data-v functionname:msg:arg.arg|functionname:msg:arg.arg
		}
		
		var _rule={
			empty:function(val){
				if(val=="") return false;
				return true;
			},
			num:function(val){
				if(isNaN(val)) return false;
				return true;
			},
			l:function(val,min,max){
				if(val.length<min || val.length>max) return false;
				return true;
			},
			n:function(val,min,max){
				if(val<min || val>max) return false;
				return true;
			},
			phone:function(val){
				return (/^(?:13\d|15\d|18\d)-?\d{5}(\d{3}|\*{3})$/).test(val)
			},
			email:function(val){
				return (/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/).test(val);
			}
		}
		
		$.extend(_config,config);
		$.extend(_rule,rule);
		
		this.rule=_rule;
		this.config=_config;
		this.data={};
	}
	
	verify.prototype={
		init:function(){
			var that=this,cg=that.config;
			
			if(!cg.cls) return; //cls 钩子必须写
			
			if((!cg.form && !cg.target) || (cg.form && cg.target)) return; //只能存在一个..
			
			if(cg.form){
				that._form(cg.form)
			}else if(cg.target){
				that._target(cg.target)
			}
		},
		_form:function(form){
			var that=this,cg=that.config;
			$(form).live('submit',function(){
				var flg=that._batch(cg.cls);
				if(flg && cg.success) cg.success(that.data);
				return false;
			});
		},
		_target:function(btn){
			var that=this,cg=that.config;
			$(btn).live('click',function(){
				var flg=that._batch(cg.cls);
				if(flg && cg.success) cg.success(that.data);
				return false;
			});
		},
		_translate:function(str){
			
			//str=functionname,msg,arg.arg|functionname,msg,arg.arg
			
			var fnary=str.split('|'),returnobj={};
			
			for(var i=0;i<fnary.length;i++){
				var thisfnary=fnary[i].split(':'),
					name=thisfnary[0],
					msg=thisfnary[1],
					argary=(thisfnary[2]) ? thisfnary[2].split('.') : [];
				returnobj[name]={
					msg:msg,
					arg:argary
				};
			}
			
			return returnobj;
			
		},
		_batch:function(cls){
			var that=this,cg=that.config,flg=true,j=0;
			
			$(cls).each(function(index,node){
				var val=$.trim($(this).val()),
					vstr=$(this).attr(cg.attrname),
					rulevalobj=that._translate(vstr);
					j++; //用做data标示，有name用name，没name用j
					/*
					rulevalobj={
						rule:msg
					}
					*/
				for(var i in rulevalobj){
					rulevalobj[i]['arg'].splice(0,0,val);
					var examine=that.rule[i].apply(this,rulevalobj[i]['arg']);
					if(!examine){
						if(cg.batchcallback) cg.batchcallback(val,rulevalobj[i]['msg']);
						flg=false;
						break;
					}
				}
				if(!flg){
					return false;
				}else{
					if($(this).attr('name')){
						that.data[$(this).attr('name')]=val;
					}else{
						that.data[j]=val;
					}
					
				} 
			});
			return flg;
		}
	}
	
	
	if(G && G.widget) G.widget.verify=verify;
	
})(jQuery,window,GM);
