var GALGU = GALGU || {};

GALGU.Splash = {
    init : function () {
		this.splashElem = $('#splash-screen');
        this.hideSplashScreen();
        this.bindButtons();
    },
    hideSplashScreen : function () {
		var that = this;
        
		setTimeout(function () {
			that.splashElem.hide();
		}, 4000);
	},
    bindButtons : function () {
        var that = this,
			btns = $('.main .buttons-wrapper .btn');

		btns.on('click', function (e) {
			e.preventDefault();
			setTimeout(function () {
                document.location.href = e.target;
            }, 500);
		});
    }
};

$(function () {
   GALGU.Splash.init(); 
});