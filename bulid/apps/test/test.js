/**
 * @author fuqiang
 * @version 20110907
 * @fileoverview 测试各种体重腰围等等一堆东西的计算方法和校验等交互
 */
(function(G,$){
	var test=function(){
		
		return {
			exports:{
				init:function(){
					GM.widget.use('verify',function(widget){
						var BMI=new widget.verify({
							target:'#J_BMIBtn',
							cls:'.J_BMIverify',
							batchcallback:function(val,msg){
								alert(msg);
							},
							success:function(data){
								var weight=data['weight'],
									height=data['height'],
									Mheight=height/100,
									sex=$('#J_BMISex').val(),
									BMIIdealWeight=(sex==1)?(height-80)*0.7:(height-70)*0.6,
									BMIIndices=weight/Math.pow(Mheight,2);
								$('#J_BMIIdealWeight').val(BMIIdealWeight.toFixed(2));
								$('#J_BMIIndices').val(BMIIndices.toFixed(2));
							}
						});
						BMI.init();
						
						
						//貌似公式有问题，我自己一直是负值   fix:我自己太受了。。 ？
						var BFR=new widget.verify({
							target:'#J_BFRBtn',
							cls:'.J_BFRverify',
							batchcallback:function(val,msg){
								alert(msg);
							},
							success:function(data){
								var weight=data['weight'],
									waistline=data['waistline'], //cm
									sex=$('#J_BFRSex').val(),
									a=waistline*0.74,
									b=(sex==1)? weight*0.082+44.74 : weight*0.082+34.89,
									fat=a-b,
									BFRIndices=((fat/weight)*100).toFixed(2)+'%';
									
								$('#J_BFRIndices').val(BFRIndices);
							}
						});
						BFR.init();
						
						var BFR=new widget.verify({
							target:'#J_BMRBtn',
							cls:'.J_BMRverify',
							batchcallback:function(val,msg){
								alert(msg);
							},
							success:function(data){
								var weight=data['weight'],
									age=data['age'], //cm
									sex=$('#J_BMRSex').val();
									BFRIndices=(sex==1)?(weight*24)-(age*10):(weight*22)-(age*10);
									$('#J_BMREtabolize').val(BFRIndices);
							}
						});
						BFR.init();
						
						var BFR=new widget.verify({
							target:'#J_WomenBtn',
							cls:'.J_Womenverify',
							batchcallback:function(val,msg){
								alert(msg);
							},
							success:function(data){
								var height=data['height'],
									WomenWeight=(height-70)*0.6;
									$('#J_WomenWeight').val(WomenWeight);
							}
						});
						BFR.init();
					});
				}
			}
		}
	}();
	
	if(G && G.apps) G.apps.test=test;
	
})(GM,jQuery);
