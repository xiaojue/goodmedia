(function(X, $){
     var getCfg = X.getCfg,
        Req = X.request,
        Util = X.util,
        Box = X.ui.MsgBox,
        Pagelet = X.ax.Pagelet;
        
        X.use('pipeMgr').reg('event.eventForm',{
        	onViewReady:function(){
			        		//日历选择框
			        $('#start_date,#end_date').attr('readonly', 'true')
			        .datepick({ 
			            onSelect: function (dates) { 
			
			                if (this.id == 'start_date') { 
			                    $('#end_date').datepick('option', 'minDate', dates[0] || null); 
			                } 
			                else { 
			                    $('#start_date').datepick('option', 'maxDate', dates[0] || null); 
			                } 
			            },
			            
			            minDate : new Date(),
			            dateFormat :'yyyy-mm-dd'
			        });
			        
			        $('#s1,#s2').click(function(){
			            if (this.id == 's1') {
			                $('#cost')
			                  .val('')
			                  .addClass('style-disabled').attr('disabled',true);
			                $('#costTip').cssDisplay(false);
			            } else {
			                $('#cost').removeClass('style-disabled').attr('disabled',false).focus();
			            }
			        });
			        
			        $('#s1[checked],#s2[checked]').click();
			        
			        
			        //封面上传
			        var 
			            $uploading = $('#uploading'),
			            
			            //图片加载中
			            $loading = $('#pic_loading'),
			            
			            $coverImg = $('#cover_img'),
			            
			            $imgPath = $('#event_pic'),
			            
			            islock = 0,
			        
			            uploader = X.use('Uploader', {
			            
			                form:$('#uploadImg')[0], 
			            
			                action : Req.mkUrl('event', 'upload'),
			                
			                onload : function(ret) {
			
			                    var rst = ret.raw.rst;
			                    
			                    ret=ret.raw;
			                    
			                    if (ret.errno === 0) {
			                        $coverImg.cssDisplay(0);
			                        $loading.cssDisplay(1);
			                        $coverImg.attr('src', rst.filepath);
			                        $coverImg.bind('load', function(){
			                            $loading.cssDisplay(0);
			                            $coverImg.cssDisplay(1);
			                        })
			                        $imgPath.val(rst.pic);
			                    } else {
			                        Box.tipWarn(ret.err);
			                        $coverImg.cssDisplay(1);
			                    }
			                    
			                    $uploading.cssDisplay(0);
			                }
			           });
			
			        $('#upload_pic').change(function(){
			            $uploading.cssDisplay(1);
			            $coverImg.cssDisplay(0);
			            
			            uploader.upload();
			        })
			        
			        
			        var eventFrm = $('#eventfrm');
			        
			        //活动费用检测器
			
			/**
			 * 返日期的格式化字符串所表示的日期对象.
			 * @param {String} str 日期的格式化字符串,如2009/02/15
			 * @param {String} 格式, mm/dd/yy或dd/mm/yy或yy/mm/dd,中间分隔符不限定
			 * @return {Date} 格式化字符串所表示的日期对象
			 * @see CC#dateFormat
			 */
			       function dateParse(str, fmt){
			        if(!fmt){
			          return new Date(str);
			        }
			        var arr = [0,0,0];
			        var sep = fmt.charAt(2);
			        var ss = fmt.split(sep);
			        var tar = str.split(sep);
			        var cc = '';
			        for(var i=0,len=ss.length;i<len;i++){
			          if(ss[i]=='mm')
			            arr[0] = tar[i];
			          else if(ss[i]=='dd')
			            arr[1]=tar[i];
			          else arr[2]=tar[i];
			        }
			        return new Date(arr.join('/'));
			       }
			   
			        X.use('Validator', {
			            form : eventFrm,
			            elements : eventFrm.find('select,input,radio,textarea').get(),
			            trigger : '#create',
			            comForm : true,
			            onsuccess: function (data, next) {
			                if (!islock) {
			                                            
			                    if (!uploader.isLoading()) {
			                        //锁定，防止重复提交
			                        islock = 1;
			                    
			                        Req.eventSave(data, function(e){
			                            var data = e.getData();
			                            
			                            if (e.isOk()) {
			                                window.location.href = data.url;
			                            } else {
			                                Box.tipWarn('保存失败', function(){
			                                    islock = 0;
			                                });
			                            }
			                            
			                        });
			                    } else {
			                        Box.tipWarn('封面上传中，请稍候...', function(){
			                            islock = 0;
			                        });
			                    }
			                }
			                
			                next();
			                
			                return false;
			            },
			            
			            validators : {
			                'cost' : function(elem, v, data, next){
			                    if(elem.checked){
			                        var 
			                            //错误提示
			                            $tip = $('#costTip'),
			                            //费用值
			                            $cost = $('#cost'),
			                            //验证结果
			                            msg = true;
			                        
			                        $tip.cssDisplay(0);
			                            var cost = $cost.val();
			                            
			                            if (!cost || isNaN(cost) || cost < 0){
			                                msg = '请填写正确的费用数';
			                            }else if(cost>10000)
			                                msg = '费用不能超过10000元';
			                            
			                            if(msg !== true){
			                                $tip.text(msg)
			                                    .cssDisplay(1);
			                            }
			                        this.report(msg === true, data);
			                    }else {
			                        // 不选中时不检测
			                        this.report(true, data);
			                    }
			                    next();
			                },
			                
			                // 日期检查
			                'chkdate' : function(elem, v, data, next){
			                    var result = true;
			                    var start = dateParse(v, 'yy-mm-dd');
			                    start = new Date(
			                        (start.getMonth()+1) +'/' + 
			                        start.getDate() +'/' +
			                        start.getFullYear()+' '+
			                        $('#start_h').val()+':'+
			                        $('#start_m').val()
			                    );
			                    var end   = dateParse($('#end_date').val(), 'yy-mm-dd');
			                    end = new Date(
			                        (end.getMonth()+1) +'/' + 
			                        end.getDate() +'/' +
			                        end.getFullYear()+' '+
			                        $('#end_h').val()+':'+
			                        $('#end_m').val()
			                    );
			                    if(start > end){
			                        data.m = '开始时间不能晚于结束时间';
			                        result = false;
			                    }
			                    this.report(result, data);
			                    next();
			                }
			            }
			        });
        	}
        })
        
})(Xwb,$);