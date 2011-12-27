/* bind */
function $A(iterable)
{
	if (!iterable) return [];
	var results = [];
	for (var i = 0, length = iterable.length; i < length; i++)
		results.push(iterable[i]);
	return results;
}

Function.prototype.bindAsEventListener = function()
{
	var __method = this, args = $A(arguments), object = args.shift();
	return function(event) {
		return __method.apply(object, [event || window.event].concat(args));
	}
}

var coverflow = function(el, options) {
	this.el = el;
	this.imageData = options.imageData;
	this.imageSize = options.imageSize;
	this.imageLength = options.imageLength;
	this.imageBox = [];
	this.imageBoxPos = [];

	this.beforeTouch = options.beforeTouch;
	this.afterTouch = options.afterTouch;
	this.afterEffect = options.afterEffect;

	this.imageCnt = this.imageLength - 1;

	this.maxVal = this.imageSize;
	this.minVal = this.maxVal * -1;
	this.maxValHalf = this.maxVal/2;
	this.minValHalf = this.minVal/2;
	this.zRatio = 1.2;
	this.rotateRatio = 0.5;

	this.cur = 0;
	this.curPrev = 0;

	this.startX = 0;
	this.moveX = 0;
	this.wrapX = 0;
	this.time = 0;
	this.movePrev = 0;

	this.init();
};

coverflow.prototype = {
	init : function() {
		log("init");
		this.wrap = document.createElement('div');
		this.wrap.className = "wrap";
		for(var i=0,cnt=this.imageLength;i<cnt;++i) {
			var box = document.createElement('div');
			box.className = "item";
			var image = new Image();
			image.src = this.imageData[i]["src"];
			box.appendChild(image);

			this.imageBox.push(box);
			this.imageBoxPos.push((i-this.cur)*this.imageSize);
			this.setTransform(this.imageBox[i], i, 0);
			this.wrap.insertBefore(box, this.wrap.firstChild);
		}

		this.el.appendChild(this.wrap);
		this.addEvent();
		this.afterEffect(this.cur);
	},
	setTransform : function(el, idx, x) {
		log("setTransform");
		x += this.imageBoxPos[idx];

		el.className = (x == 0) ? "item center" : "item";
		var transform = "translateX("+this.imageBoxPos[idx]+"px) ";
		if(this.minVal < x && x < this.maxVal) {
			if(x == 0) {
				transform += "translateZ(0) rotateY(0deg)";
			}
			else if(this.minVal<x && x<this.minValHalf) {
				transform += "translateZ("+(x*this.zRatio)+"px) rotateY("+((this.minVal-x)*this.rotateRatio)+"deg)";
			}
			else if(this.minValHalf<=x && x<0) {
				transform += "translateZ("+(x*this.zRatio)+"px) rotateY("+(x*this.rotateRatio)+"deg)";
			}
			else if(this.maxValHalf>=x && x>0) {
				transform += "translateZ(-"+(x*this.zRatio)+"px) rotateY("+(x*this.rotateRatio)+"deg)";
			}
			else if(this.maxVal>x && x>this.maxValHalf) {
				transform += " translateZ(-"+(x*this.zRatio)+"px) rotateY("+((this.maxVal-x)*this.rotateRatio)+"deg)";
			}
		}
		else {
			transform += " translateZ("+(this.maxVal*this.zRatio*(-1))+"px)";
		}
		el.style.webkitTransform = transform;
	},
	start : function(e) {
		log("start");

		e.preventDefault();
		var x = this.getX(e);

		this.startX = x;
		this.wrap.style.webkitTransitionDuration = "0s";
		for(var i=0,cnt=this.imageBox.length;i<cnt;++i) {
			this.imageBox[i].style.webkitTransitionDuration = "0s";
		}
	},
	move : function(e) {
		log("move");

		if(this.startX == 0) return;
		e.preventDefault();

		this.lastX = this.moveX;
		this.lastMoveTime = new Date();

		var x = this.getX(e);
		this.moveX = x - this.startX;
		this.wrap.style.webkitTransform = "translateX("+(this.wrapX+this.moveX)+"px)";
		for(var i=0,cnt=this.imageBox.length;i<cnt;++i) {
			this.setTransform(this.imageBox[i], i, this.wrapX+this.moveX);
		}
	},
	end : function(e) {
		log("end");

		if(this.startX == 0) return;
		if(this.moveX == 0) {
			this.moveX = (this.movePrev>0) ? this.maxVal : this.minVal;
		}
		else {
			var delta = this.moveX - this.lastX;
			var dt = (new Date()) - this.lastMoveTime + 1;
			this.moveX += (delta * 100 / dt);
		}

		this.wrap.style.webkitTransitionDuration = "0.5s";
		this.cur = Math.round((this.wrapX+this.moveX)/this.imageSize)* -1;
		if(this.cur < 0) {
			this.cur = 0;
		}
		else if(this.cur > this.imageCnt) {
			this.cur = this.imageCnt;
		}
		this.wrapX =this.cur*this.imageSize* -1;
		this.wrap.style.webkitTransform = "translateX("+(this.wrapX)+"px)";

		for(var i=0,cnt=this.imageBox.length;i<cnt;++i) {
			this.imageBox[i].style.webkitTransitionDuration = "0.5s";
			this.setTransform(this.imageBox[i], i, this.wrapX);
		}

		this.movePrev = this.moveX;
		this.startX = this.moveX= 0;

	},
	after : function(e) {
		log("after");

		if(this.curPrev != this.cur) {
			this.afterEffect(this.cur);
			this.curPrev = this.cur;
		}
	},
	addEvent : function() {
		log("addEvent");

		this.el.addEventListener("touchstart", this.start.bindAsEventListener(this), false)
		window.addEventListener("touchmove",this.move.bindAsEventListener(this),false);
		window.addEventListener("touchend",this.end.bindAsEventListener(this),false);
		this.wrap.addEventListener("webkitTransitionEnd",this.after.bindAsEventListener(this),false);
	},
	getX : function(e) {
		log("getX");

		return e.touches[0].pageX
	}
};

function chnageTitle(elId, data) {
	$("#" + elId).html("<p class='title'>" + data + "</p>");
}

function log(msg) {
	return;
	$("#log").prepend("<div>" + msg + "</div>");
}