//parent children 
 
YUI().add('toolbar',function(Y){  
	Y.Toolbar = Y.Base.create("toolbar", Y.Widget, [Y.WidgetParent], {
 
	    CONTENT_TEMPLATE : "<ul></ul>",
	 
	    NESTED_TEMPLATE : '<li class="{nestedOptionClassName}"><em class="{labelClassName}">{label}</em></li>',
		
	    bindUI: function() {
	        
	    },
	     
	    renderUI: function () { 
	 
	        var tokens = {
	            labelClassName : this.getClassName("label"),
	            nestedOptionClassName : this.getClassName("option"),
	            label : this.get("label")
	        },
	        liHtml = Y.substitute(this.NESTED_TEMPLATE, tokens),
	        li = Y.Node.create(liHtml),
	
	        boundingBox = this.get("boundingBox"),
	        parent = boundingBox.get("parentNode");
	
	        li.appendChild(boundingBox);
	        parent.appendChild(li); 
	    }
	}, { 
	    ATTRS : {
	        defaultChildType: {  
	            value: "Tool"
	        },
	        label : {
	            validator: Y.Lang.isString
	        }
	    }
	});


	 
	Y.Tool = Y.Base.create("tool", Y.Widget, [Y.WidgetChild], {

		    CONTENT_TEMPLATE : "<em></em>",
		    BOUNDING_TEMPLATE : "<li></li>",
		 
		    renderUI: function () {
			        this.get("contentBox").setContent(this.get("label"));
		    }
		 
		}, {
		    ATTRS : {
		        label : {
		            validator: Y.Lang.isString
		        },
		        tabIndex: {
		    		value: -1
		        }        
		    }
	});
},'3.3.0',{requires:['get','widget','substitute', 'widget-parent','widget-child','dump','event-custom']});

















