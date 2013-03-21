 
	YUI().add('KBox', function (Y) { 
		Y.get = Y.one; 
		Y.KBox = function(){
			this.init.apply(this,arguments);
		};
		Y.KBox.overlays = [];
		Y.KBox.prototype = {
			init:function(opt){
				var that = this;
				that.buildParam(opt);
				that.overlay = new Y.Overlay({
					contentBox: "kContent",
					height:that.height,
					width:that.width,
					zIndex:1000,
					visible:false,
					shim:(Y.UA.ie>0)?!that.anim:true,
					centered:true,
					headerContent: that.head,
					bodyContent: that.body,
					footerContent:that.foot
				});
				Y.KBox.overlays.push(that.overlay);
				that.bringToTop();
				that.overlay._posNode.on('mousedown',function(e){
					var widget = Y.Widget.getByNode(e.target);
					if (widget && widget instanceof Y.Overlay) {
						that.bringToTop();
					}
					Y.KBox._xy = widget._posNode.getXY();
				});
				that.overlay._posNode.on('mouseup',function(e){
					var widget = Y.Widget.getByNode(e.target);
					if (widget && widget instanceof Y.Overlay) {
						var _xy =  widget._posNode.getXY();
						if(_xy[0] != Y.KBox._xy[0] || _xy[1] != Y.KBox._xy[1]){
							that.afterDrag(widget);
						}
					}
				});
				if(that.anim){
					var AP = function(cfg){
						AP.superclass.constructor.apply(this, arguments);
					};
					AP.NS = 'fx';
					AP.NAME = 'animPlugin';
					AP.ATTRS = {
						duration:{
							value:0.2
						},
						animVisible:{
							valueFn:function(){
								var host = this.get("host");
								var boundingBox = host.get("boundingBox");
								var anim = new Y.Anim({
									node: boundingBox,
									to: { opacity: 1 },
									duration: this.get("duration")
								});
								if (!host.get("visible")) {
									boundingBox.setStyle("opacity", 0);
								}
								anim.on("destroy", function() {
									if (Y.UA.ie) {
										this.get("node").setStyle("opacity", 1);
									} else {
										this.get("node").setStyle("opacity", "");
									}
								});
								return anim;
							}
						},
						animHidden : {
							valueFn : function() {
								return new Y.Anim({
									node: this.get("host").get("boundingBox"),
									to: { opacity: 0 },
									duration: this.get("duration")
								});
							}
						}
					};
					Y.extend(AP,Y.Plugin.Base,{
						initializer : function(config) {
							this._bindAnimVisible();
							this._bindAnimHidden();
							this.after("animVisibleChange", this._bindAnimVisible);
							this.after("animHiddenChange", this._bindAnimHidden);
							this.doBefore("_uiSetVisible", this._uiAnimSetVisible);
						},
						destructor : function() {
							this.get("animVisible").destroy();
							this.get("animHidden").destroy();
						},
						_uiAnimSetVisible : function(val) {
							if (this.get("host").get("rendered")) {
								if (val) {
									this.get("animHidden").stop();
									this.get("animVisible").run();
								} else {
									this.get("animVisible").stop();
									this.get("animHidden").run();
								}
								return new Y.Do.Prevent("AnimPlugin prevented default show/hide");
							}
						},
						_uiSetVisible : function(val) {
							var host = this.get("host");
							var hiddenClass = host.getClassName("hidden");
							if (!val) {
								host.get("boundingBox").addClass(hiddenClass);
							} else {
								host.get("boundingBox").removeClass(hiddenClass);
							}
						},
						/* Sets up call to invoke original visibility handling when the animVisible animation is started */
						_bindAnimVisible : function() {
							var animVisible = this.get("animVisible");
							// Setup original visibility handling (for show) before starting to animate
							animVisible.on("start", Y.bind(function() {
								this._uiSetVisible(true);
							}, this));
						},
						/* Sets up call to invoke original visibility handling when the animHidden animation is complete */
						_bindAnimHidden : function() {
							var animHidden = this.get("animHidden");

							// Setup original visibility handling (for hide) after completing animation
							animHidden.after("end", Y.bind(function() {
								this._uiSetVisible(false);
							}, this));
						}
					});//extend over
					that.overlay.plug(AP,{duration:Number(that.duration)});
				}
				return this;
			},
			bringToTop:function(){
				var that = this;
				if(Y.KBox.overlays.length == 1)return;
				var topIndex = 0;
				for(var i = 0;i<Y.KBox.overlays.length;i++){
					var t = Number(Y.KBox.overlays[i].get('zIndex'));
					if(t > topIndex)topIndex = t;
				}
				that.overlay.set('zIndex',topIndex+1);
				return this;
			},
			render:function(opt){
				var that = this;
				that.parseParam(opt);
				that.overlay.render("#overlay-align");
				if(that.shownImmediately)that.overlay.set('visible',true);
				if(that.fixed){
					if(/6/i.test(Y.UA.ie)){
						that.overlay._posNode.setStyle('position','absolute');
					}else{
						var __x = that.overlay.get('x');
						var __y = that.overlay.get('y');
						var _R = that.overlay._posNode.get('region');
						if(that.height == 'auto'){
							__y -= Number(_R.height/2);
						}
						if(that.width == 'auto'){
							if(Y.UA.ie < 7 && Y.UA.ie > 0 ){//hack for ie6 when width was auto
								//that.overlay._posNode.query('div.yui-widget-bd').setStyle('width','100%');
								that.overlay.set('width',that.overlay._posNode.query('div.yui-widget-bd').get('region').width);
							}
							if(Y.UA.ie >= 7  ){//hack for ie7 when width was auto
								that.overlay._posNode.query('div.yui-widget-bd').setStyle('width','100%');
								that.overlay.set('width',that.overlay._posNode.query('div.yui-widget-bd').get('region').width);
							}
							__x -= Number(that.overlay._posNode.get('region').width/2);
						}
						that.overlay.move([__x,__y]); 
						__y -= Y.get('docscrollY').get('scrollTop');
						__x -= Y.get('docscrollX').get('scrollLeft');
						that.overlay.move([__x,__y]);
						that.overlay._posNode.setStyle('position','fixed');
					}
				}
				if(that.x)that.overlay.set('x',Number(that.x));
				if(that.y)that.overlay.set('x',Number(that.y));
				if(that.draggable){
					that.overlay.headerNode.setStyle('cursor','move');
					if(!that.overlay._posNode.dd){
						that.overlay._posNode.plug(Y.Plugin.Drag);
						that.overlay._posNode.dd.addHandle('.yui-widget-hd');
					}
				}
				setTimeout(function(){
					if(that.overlay._posNode.getStyle('opacity') == 1 && that.overlay._posNode.getStyle('visibility') != 'hidden'){
						that.onload(that);
						Y.log('onload()');
						return;
					}
					setTimeout(arguments.callee,25);
				},0);
				if(that.modal){
					that.addMask();
				}
				return this;
			},
			removeArray:function(v,a){
				for(var i=0,m=a.length;i<m;i++){
					if(a[i]==v){
						a.splice(i,1);
						break;
					}
				}
			},
			close:function(){
				var that = this;
				that.beforeUnload(that);
				that.overlay.hide();
				setTimeout(function(){
					if(that.overlay._posNode.getStyle('opacity') == 0 || that.overlay._posNode.getStyle('visibility') == 'hidden'){
						window.box.removeArray(that.overlay,Y.KBox.overlays);
						that.overlay._posNode.remove();
						that.removeMask();
						that = null;
						Y.log('close()');
						return;
					}
					setTimeout(arguments.callee,25);
				},0);
				return this;
			},
			hide:function(){
				var that = this;
				that.overlay.hide();
				setTimeout(function(){
					if(that.overlay._posNode.getStyle('opacity') == 0 || that.overlay._posNode.getStyle('visibility') == 'hidden'){
						that.afterHide(that);
						return;
					}
					setTimeout(arguments.callee,25);
				},0);
				return this;
			},
			show:function(){
				var that = this;
				that.overlay.show();
				setTimeout(function(){
					if(that.overlay._posNode.getStyle('opacity') == 1 && that.overlay._posNode.getStyle('visibility') != 'hidden'){
						that.afterShow(that);
						return;
					}
					setTimeout(arguments.callee,25);
				},0);
				return this;
			},
			buildParam:function(o){
				var o = o || {};
				this.head = (typeof o.head == 'undefined'||o.head == null)?'':o.head;
				this.body= (typeof o.body== 'undefined'||o.body == null)?'':o.body;
				this.foot= (typeof o.foot== 'undefined'|| o.foot ==null)?'':o.foot;
				this.anim = (typeof o.anim == 'undefined'||o.anim == null)?true:o.anim;
				this.draggable = (typeof o.draggable == 'undefined'||o.draggable == null)?true:o.draggable;
				this.fixed= (typeof o.fixed == 'undefined'||o.fixed == null)?true:o.fixed;
				this.shownImmediately = (typeof o.shownImmediately == 'undefined'||o.shownImmediately == null)?true:o.shownImmediately;
				this.modal= (typeof o.modal == 'undefined'||o.modal == null)?false:o.modal;
				this.x= (typeof o.x == 'undefined'||o.x == null)?false:o.x;
				this.y= (typeof o.y == 'undefined'||o.y == null)?false:o.y;
				this.width = (typeof o.width == 'undefined'||o.width == null)?'300px':o.width;
				this.height = (typeof o.height == 'undefined'||o.height == null)?'200px':o.height;
				this.clickToFront= (typeof o.clickToFront == 'undefined'||o.clickToFront == null)?'':o.clickToFront;
				this.behaviours = (typeof o.behaviours == 'undefined'||o.behaviours == null)?'':o.behaviours;
				this.afterDrop= (typeof o.afterDrop == 'undefined'||o.afterDrop == null)?new Function:o.afterDrop;
				this.afterHide = (typeof o.afterHide == 'undefined'||o.afterHide == null)?new Function:o.afterHide;
				this.afterDrag= (typeof o.afterDrag == 'undefined'||o.afterDrag == null)?new Function:o.afterDrag;
				this.afterShow = (typeof o.afterShow== 'undefined'|| o.afterShow == null)?new Function:o.afterShow;
				this.beforeUnload = (typeof o.beforeUnload== 'undefined'||o.beforeUnload == null)?new Function:o.beforeUnload;
				this.afterUnload = (typeof o.afterUnload== 'undefined'||o.afterUnload == null)?new Function:o.afterUnload;
				this.onload = (typeof o.onload== 'undefined'||o.onload == null)?new Function:o.onload;//load ok后的回调,参数为layout._posNode
				this.duration = (typeof o.duration == 'undefined'||o.duration == null)?0.3:o.duration;
				return this;
			},
			parseParam:function(opt){
				var opt = opt || {};
				for(var i in opt){
					this[i] = opt[i];
				}
				return this;
			},
			addMask:function(){
				var that = this;
				if(Y.one('#t-shade-tmp'))return this;
				var node = Y.Node.create('<div id="t-shade-tmp" style=" height: 20000px; z-index: 999;background-color:#000;left:0;position:absolute;top:0;width:100%;"></div>');
				node.setStyle('opacity','0.7');
				Y.one("html").setStyle('overflow','hidden');
				Y.one('body').append(node);
				node.setStyle('display','block');
				return this;
			},
			removeMask:function(){
				var that = this;
				if(Y.KBox.overlays.length == 0 && Y.one('#t-shade-tmp')){
					Y.one('#t-shade-tmp').remove();
					Y.one("html").setStyle('overflow','');
				}
				return this;
			}
		};
		Y.KBox.alert = function(msg,callback,opt){
			if(typeof msg == 'undefined'||msg==null)var msg = '';
			if(typeof callback == 'undefined'||callback == null)var callback = new Function;
			if(typeof opt == 'undefined'||opt == null)var opt = {};
			var title = (typeof opt.title == 'undefined'||opt.title == null)?'提示':opt.title;
			var closeable = (typeof opt.closeable == 'undefined'||opt.closeable == null)?true:opt.closeable;
			var closeText = (typeof opt.closeText == 'undefined'||opt.closeText == null)?'[x]':opt.closeText;
			var btnText = (typeof opt.btnText == 'undefined'||opt.btnText == null)?'ok':opt.btnText;
			var closestr = closeable?'<a class="close closebtn">'+closeText+'</a>':'';
			var headstr = '<span class="title">'+title+'</span>'+closestr;
			opt.head = headstr;
			opt.body = msg;
			opt.foot = '<div><button class="okbtn">'+btnText+'</div>';
			opt.onload = function(box){
				var node = box.overlay._posNode;
				node.one('.okbtn').on('click',function(e){
					e.halt();
					callback(box);
					box.close();
				});
				node.one('.closebtn').setStyle('cursor','pointer');
				node.one('.closebtn').on('click',function(e){
					e.halt();
					box.close();
				});
			};
			var box = new Y.KBox(opt);
			window.box = box;
			return box.render();
		};
	}, '1.0.00',{requires: ['node','event','dump','overlay','dd-plugin','anim','plugin']});
