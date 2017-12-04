var GALGU = GALGU || {};

// const
var TRACKING_FREQUENCY = 30 * 1000; // interval between tracking calls

GALGU.Main = {
	init : function () {
		this.bindSideMenu();
        
       
        if (!navigator.geolocation) return;

        //navigator.geolocation.watchPosition(this.postTracking.bind(this));
	},
	bindSideMenu : function () {
		var sideMenu = document.getElementById('doc_menu');
		var mc = new Hammer(sideMenu);

		mc.on("swipeleft", function () {
			$('#doc_menu').click();
		});
        
	},
    
    /**
     * Posts tracking position to API only when needed, at most one every TRACKING_FREQUENCY ms...
     * TODO: replace manual f() caching with underscore/lodash throttle
     */
    postTracking : function (position) {
        if (!this._prevPosition) {
            this._prevPosition = {};
        }
        
        // don't go on if no position change
        if (this._prevPosition.lat === position.coords.latitude &&
            this._prevPosition.lng === position.coords.longitude) {
                return;
        }

        // ensure no more than one call every TRACKING_FREQUENCY ms
        if (Date.now() - this._prevPosition.time < TRACKING_FREQUENCY) {
            
            // clear previous timeout
            if (this._prevPosition.timeout) {clearTimeout(this._prevPosition.timeout); }
            this._prevPosition.timeout = setTimeout(
                this.postTracking.bind(this, position), 
                TRACKING_FREQUENCY - (Date.now() - this._prevPosition.time)
            );
            
            return;
        }
        
        // cache for next 
        this._prevPosition.lat = position.coords.latitude;
        this._prevPosition.lng = position.coords.longitude;
        this._prevPosition.time = Date.now();
        
        
        // post
        var self = this;
        $.ajax('/api/v1/user/me', {
            method : 'put',
            contentType : 'application/json',
            processData : false,
            data : JSON.stringify({
                lat : position.coords.latitude,
                lng : position.coords.longitude
            })
        }).fail(function(err) {
            console.log('error posting tracking data', err);
        });
    }
};

/* on document ready stuff */
$(function () {
	GALGU.Main.init();
});

$(window).on('load', function () {
	setTimeout(function () {
		$('.el-loading').addClass('el-loading-done');
	}, 1000);
});