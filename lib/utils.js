function WaitingBar(parentNode){
	this.parentNode = Y.Node.one(parentNode);
	var wbar = this.parentNode.one('.waitingBar');
	if(!wbar){
		wbar = Y.Node.create("<div class='waitingBar'><img src='skins/images/waitingbar.gif'></div>");
	}
	this.html = wbar;	
	this.parentNode.prepend(this.html); 
}
WaitingBar.prototype.show = function(){
	this.html.setStyle('display',''); 
}
WaitingBar.prototype.hide = function(isRemove){
	if(isRemove==undefined) isRemove = true;
	this.html.setStyle('display','');
	this.html.remove();	
}

 