/**
* ┏━━━━━┓ 
* ┃◤      ◥┃
* ┃   bug    ┃
* ┃   stop   ┃
* ┃   here   ┃
* ┃          ┃
* ┃  巴  千  ┃
* ┃  格  行  ┃
* ┃  不  代  ┃
* ┃  沾  码  ┃
* ┃  身  过  ┃
* ┃          ┃
* ┃◣      ◢┃ 
* ┗━━━━━┛ 
* 
* @description Kael-Qrcode 基于canvas灵活可配置的二维码生成库
* @version 1.0
* @author litten
* @dependencies 依赖于同文件夹下qrcode.js；已将两份资源打包成build/kaelQrcode.min.js
* @lastUpdate 2014-08-10 0:11 
*/

var KaelQrcode = function(){

	var basicConfig = {};
	var config = {};
	var qrcode, canvas, ctx;

	var Tool = {
		//RGB颜色转换为16进制
		colorHex: function(color){
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			var that = color;
			if(/^(rgb|RGB)/.test(that)){
				var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
				var strHex = "#";
				for(var i=0; i<aColor.length; i++){
					var hex = Number(aColor[i]).toString(16);
					if(hex === "0"){
						hex += hex;	
					}
					strHex += hex;
				}
				if(strHex.length !== 7){
					strHex = that;	
				}
				return strHex;
			}else if(reg.test(that)){
				var aNum = that.replace(/#/,"").split("");
				if(aNum.length === 6){
					return that;	
				}else if(aNum.length === 3){
					var numHex = "#";
					for(var i=0; i<aNum.length; i+=1){
						numHex += (aNum[i]+aNum[i]);
					}
					return numHex;
				}
			}else{
				return that;	
			}
		},
		//16进制颜色转为RGB格式
		colorRgb: function(color){
			var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
			var sColor = color.toLowerCase();
			if(sColor && reg.test(sColor)){
				if(sColor.length === 4){
					var sColorNew = "#";
					for(var i=1; i<4; i+=1){
						sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));	
					}
					sColor = sColorNew;
				}
				//处理六位的颜色值
				var sColorChange = [];
				for(var i=1; i<7; i+=2){
					sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));	
				}
				return "RGB(" + sColorChange.join(",") + ")";
			}else{
				return sColor;	
			}
		},
		//颜色增量变化，支持rgb，16进制和linear
		changeRGB : function(curcolor, num){
			function addRGB(val){
				var valFormat = (val.match(/\([^\)]+\)/g))[0];
				valFormat = valFormat.substr(1, valFormat.length-2);
				var arr = valFormat.split(",");
				for(var i=0,len=arr.length;i<len;i++){
					arr[i] = parseInt(arr[i]) + num;
					if(arr[i] < 0){
						arr[i] = 0;
					}
				}
				return "rgb("+arr.join(",")+")";
			}
			if(typeof(curcolor) == "object"){
				var linear  = ctx.createLinearGradient(0,0, 0, config.width);
				for(var em in curcolor){
					var val = curcolor[em];
					val = addRGB(val);
					linear.addColorStop(em, val);
				}
				return linear;
			}else if(typeof(curcolor) == "string"){
				if(curcolor.indexOf("#") < 0){
					return addRGB(curcolor);
				}else{
					return addRGB(Tool.colorRgb(curcolor));
				}
			}
		}
	}
	
	//画布初始化
	var canvasInit = function(){
		canvas = document.createElement('canvas');
		canvas.width = config.width;
		canvas.height = config.height;
		ctx	= canvas.getContext('2d');
	}
	//二维码数据初始化
	var qrcodeInit = function(){
		qrcode	= new QRCode(config.typeNumber, config.correctLevel);
		qrcode.addData(config.text);
		qrcode.make();
	}
	//检测色块边缘
	var edgeTest = function(row, col){
		var len = qrcode.getModuleCount();
		var obj = {
			"l": false,
			"r": false,
			"t": false,
			"b": false,
			"row": row,
			"col": col
		};

		if(col != 0 && qrcode.isDark(row, col-1)){
			obj["l"] = true;
		}
		if(col != len-1 && qrcode.isDark(row, col+1)){
			obj["r"] = true;
		}
		if(row != 0 && qrcode.isDark(row-1, col)){
			obj["t"] = true;
		}
		if(row != len-1 && qrcode.isDark(row+1, col)){
			obj["b"] = true;
		}
		if(row == 8 && col == 6){
			console.log(obj);
		}
		return obj;
	}


	//画图片
	var drawImg = function(){
		var img = new Image();
		img.src = config.img.src;
      	var imgSize = config.width/5;
      	var imgPos = config.width/10*4;
      	var imgPosFix = config.width/120;

      	//图片border
        ctx.strokeStyle = config.img.border || '#fff';  
        ctx.lineWidth   = config.width/40;  
        ctx.globalAlpha   = 1;  
        ctx.lineCap = "round";  
        ctx.lineJoin = "round";  
  
        ctx.beginPath();  
        ctx.moveTo(imgPos-imgPosFix, imgPos-imgPosFix);  
        ctx.lineTo(imgPos+imgSize+imgPosFix, imgPos-imgPosFix);  
        ctx.lineTo(imgPos+imgSize+imgPosFix, imgPos+imgSize+imgPosFix);  
        ctx.lineTo(imgPos-imgPosFix, imgPos+imgSize+imgPosFix);  
        ctx.lineTo(imgPos-imgPosFix, imgPos-imgPosFix);  
        ctx.stroke();  
        ctx.closePath();

      	img.onload = function(){
	        ctx.drawImage(img,imgPos,imgPos,imgSize,imgSize);
	        ctx.beginPath(); 
	    }
	}
	//画单点
	var drawPoint = function(edgeResult, isShadow){
		var shadowColor = Tool.changeRGB(basicConfig.color, -20);
 		var pointShadowColor = Tool.changeRGB(basicConfig.pointColor, -20);

		if((edgeResult["l"] || edgeResult["r"] || edgeResult["t"] || edgeResult["b"])){
			if(isShadow){
				ctx.fillStyle = shadowColor;
			}else{
				ctx.strokeStyle = config.color; 
        		ctx.fillStyle = config.color;
			}
        	
        }else{
        	if(isShadow){
				ctx.fillStyle = pointShadowColor;
			}else{
				ctx.strokeStyle = config.pointColor; 
        		ctx.fillStyle = config.pointColor;
			}
        	
        }
	}
	//画背景
	var drawBg = function(){
		ctx.fillStyle = config.background;
		ctx.fillRect(0, 0, config.width, config.height); 
	}

	//画二维码
	var drawCode = function(type, opt, isShadow){
		var row = opt.row;
		var col = opt.col;
		var tileW = opt.tileW;
		var tileH = opt.tileH;
		var w = opt.w;
		var h = opt.h;
 		
 		var shadowColor = Tool.changeRGB(basicConfig.color, -20);
 		var pointShadowColor = Tool.changeRGB(basicConfig.pointColor, -20);

		if(type == "round"){
			//圆角
			var isDark = qrcode.isDark(row, col);
			if(isDark){

				var edgeResult = edgeTest(row, col);

				var imgSize = config.width/5;
		      	var imgPos = config.width/10*4;
		      	//图片border
		      	if(isShadow){
		      		ctx.fillStyle = shadowColor;
		        	ctx.strokeStyle = shadowColor; 
		      	}else{
		      		///////////////todo：确认有没有视觉偏差
			        var w = (col+1)*tileW - col*tileW;
					var h = (row+1)*tileW - row*tileW;

		      		//单点设定颜色
					if(config.pointColor){
						drawPoint(edgeResult, isShadow);
					}else{
						ctx.fillStyle = config.color;
	        			ctx.strokeStyle = config.color; 
					}
		      	}
		        ctx.lineWidth   = 2;  
		        ctx.globalAlpha   = 1;  
		        ctx.lineCap = "round";  
		        ctx.lineJoin = "round";  
		        ctx.beginPath();  

		        

		        var posX = Math.round(col*tileW);
		        var posY = Math.round(row*tileH);
		        var r = w/2;

				
				//console.log(edgeResult);

				if(!edgeResult["l"] && !edgeResult["t"]){
					//左上角圆角
					ctx.moveTo(posX+r, posY);
				}else{
					ctx.moveTo(posX, posY);
				}

				if(!edgeResult["r"] && !edgeResult["t"]){
					//右上角圆角
					ctx.arcTo(posX+w, posY, posX+w, posY+h, r);
				}else{
					ctx.lineTo(posX + w, posY); 
				}

				if(!edgeResult["r"] && !edgeResult["b"]){
					//右下角圆角
					ctx.arcTo(posX+w, posY+h, posX, posY+h, r);
				}else{
					ctx.lineTo(posX + w, posY + h);
				}

				if(!edgeResult["l"] && !edgeResult["b"]){
					//左下角圆角
					ctx.arcTo(posX, posY+h, posX, posY, r);
				}else{
					ctx.lineTo(posX, posY + h);  
				}

				if(!edgeResult["l"] && !edgeResult["t"]){
					//左上角圆角
					ctx.arcTo(posX, posY, posX+w, posY, r);
				}else{
					ctx.lineTo(posX, posY);
				}
				
				
				
		        ctx.stroke();  
		        
		        ctx.fill();
		        ctx.closePath();
			}
		}else{
			//基本类型
			//单点设定颜色
			var isDark = qrcode.isDark(row, col);
			if(isDark){
				
				
				if(config.pointColor){
					drawPoint(edgeTest(row, col), isShadow);
				}else{
					if(isShadow){
						ctx.fillStyle = shadowColor;
					}else{
						ctx.fillStyle = config.color;
					}
				}
				ctx.fillRect(Math.round(col*tileW),Math.round(row*tileH), w, h); 
			}
		}
		
	}

	//生成二维码
	var createCanvas = function(){

		var tileW	= config.width  / qrcode.getModuleCount();
		var tileH	= config.height / qrcode.getModuleCount();
		
		drawBg();

		//绘制阴影
		if(config.shadow){
			for( var row = 0; row < qrcode.getModuleCount(); row++ ){
				for( var col = 0; col < qrcode.getModuleCount(); col++ ){
					var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
					var h = (Math.ceil((row+1)*tileW) - Math.floor(row*tileW));
					var shadowW = config.width/150;
					drawCode(config.type, {
						row: row,
						col: col,
						tileW: tileW,
						tileH: tileH,
						w: w+shadowW,
						h: h+shadowW
					}, true);
				}
			}
		}
		//基本
		for( var row = 0; row < qrcode.getModuleCount(); row++ ){
			for( var col = 0; col < qrcode.getModuleCount(); col++ ){
				var w = (Math.ceil((col+1)*tileW) - Math.floor(col*tileW));
				var h = (Math.ceil((row+1)*tileW) - Math.floor(row*tileW));
				drawCode(config.type, {
					row: row,
					col: col,
					tileW: tileW,
					tileH: tileH,
					w: w,
					h: h
				});
				 
			}
		}

		//绘制图片
		if(config.img){
			drawImg();
		}
		
		return canvas;
		
	}	

	var init = function(dom, options){
		basicConfig = options;

		if( typeof options === 'string' ){
			config = options = { text: options };
		}else{
			config.text = options.text || "litten";
		}

		config.width = options.size || 150;
		config.height = options.size || 150;
		config.shadow = options.shadow || false;

		canvasInit();

		config.typeNumber = options.typeNumber || -1;
		config.correctLevel = QRErrorCorrectLevel.H;
		config.pointColor = options.pointColor || null;

		config.type = options.type || "base";
		

		//图片
		if(typeof(options.img) == "string"){
			config.img = {
				src: options.img
			}
		}else{
			config.img = options.img
		}
		//背景
		if(options.background){
			var type = typeof(options.background);
			if(type == "string"){
				config.background = options.background;
			}else if(type == "object"){
				var linear  = ctx.createLinearGradient(0,0, 0, config.width);
				for(var em in options.background){
					linear.addColorStop(parseInt(em), options.background[em]);
				}
				config.background = linear;
			}else{
				config.background = "#fff";
			}
		}else{
			config.background = "#fff";
		}
		//前景色
		if(options.color){
			var type = typeof(options.color);
			if(type == "string"){
				config.color = options.color;
			}else if(type == "object"){
				var linear  = ctx.createLinearGradient(0,0, 0, config.width);
				for(var em in options.color){
					linear.addColorStop(em, options.color[em]);
				}
				config.color = linear;
			}else{
				config.color = "#000";
			}
		}else{
			config.color = "#000";
		}

		
		qrcodeInit();
		dom.appendChild(createCanvas());
	}

	return {
		init: init,
		config: config
	}
}