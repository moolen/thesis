var BaseView = function(context){
	this.context = context;
};

BaseView.prototype.show = function(){
	console.log(this);
};

module.exports = BaseView;