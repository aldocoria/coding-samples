var GALGU = GALGU || {};

GALGU.galguMap = {
    init: function () {
        this.markersArray = [];
        this.bindEvents();
        this.setDefaultValues();
        this.getCurrentPosition();
        this.autoComplete();

    },
    bindEvents : function () {
        var that = this;
        this.inputFocused = $('#dir-source'); // default value
        this.bindSteps();

        $(document).on('focus', 'input.directions', function () {
            that.inputFocused = $(this);
        });
       

        $('#distance-costs .tile-collapse .tile-inner').on('click', function () {
            if ($(this).parents('.tile-collapse').hasClass('active')) {
                $(this).find('.icon#more-less').text('expand_less');
            } else {
                $(this).find('.icon#more-less').text('expand_more');
            }
        });

        $('#accept-relax').on('click', function () {
            $('#radar-wrapper').show();
        });

        $('#cancel-search').on('click', function () {
            $('#radar-wrapper').hide();
        });

    },
    bindSteps : function () {
        var that = this,
            $wStepEl = $('.wizard-step'),
            currStep,
            idBtn;

        $wStepEl.on('click', function (e) {
            e.preventDefault();
            
            currStep = $(this).data('step');
            var idBtn =  $(this)[0].id;
            
            switch (idBtn) {
                case 'get-directions':
                    var src = $('#dir-source').val(), 
                        dst = $('#dir-destination').val();
                
                    if (that.validateDirections()) {
                        showHide(currStep, $(this));
                    } else {
                        that.showErrorMsg('<p class="error-msg">Por favor complete orígen y destino</p>');
                    }
                    break;
                case 'save-details':
                    showHide(currStep, $(this));
                    console.log('save-details');
                    break;
                case 'save-form':
                    that.sendNotifications();
                    console.log('save-form');
                    break;
                default: 
                    showHide(currStep, $(this));
                    break;
            }

            function showHide(currStep, elem) {
                $('#step-' + currStep).hide();
                if ($(elem).hasClass('next')) {
                    $('#step-' + parseInt(currStep + 1)).show();
                } else if ($(elem).hasClass('prev')) {
                    $('#step-' + parseInt(currStep - 1)).show();
                }    
            }
            
            
        });
    },
    setDefaultValues : function () {
        var that = this;
        this.rosarioLatLng = new google.maps.LatLng(-32.9521398,-60.76837); // Rosario's lat long
        this.latlng;
        
        // Map setup
        this.mapOptions = {
            zoom: 16,
            maxZoom: 18,
            center: that.rosarioLatLng,
            types: ['(cities)'],
            componentRestrictions: {country: "ar"}, // only cities from Argentina
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}] // no interests places
        };
        this.map = new google.maps.Map(document.getElementById('map'), this.mapOptions);
        this.directionsSetup();
        this.trafficSetup();
    },
    trafficSetup : function() {                 
        // Creating a Custom Control and appending it to the map
        var that = this,
            controlDiv = document.createElement('div'), 
            controlUI = document.createElement('div'), 
            trafficLayer = new google.maps.TrafficLayer();
                
        jQuery(controlDiv).addClass('gmap-control-container').addClass('gmnoprint');
        jQuery(controlUI).text('Traffic').addClass('gmap-control');
        jQuery(controlDiv).append(controlUI);               
                
        // Traffic Btn Click Event    
        google.maps.event.addDomListener(controlUI, 'click', function() {
            if (typeof trafficLayer.getMap() == 'undefined' || trafficLayer.getMap() === null) {
                jQuery(controlUI).addClass('gmap-control-active');
                trafficLayer.setMap(that.map);
            } else {
                trafficLayer.setMap(null);
                jQuery(controlUI).removeClass('gmap-control-active');
            }
        });                           
        that.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);                               
    }, 
    directionsSetup : function() {
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { 
                strokeColor: "#0cb09c", 
                strokeOpacity: 0.6,
                strokeWeight: 6
            } 
        }); 
        
        this.directionsDisplay.setPanel($('#directions-steps')[0]);                                         
    },
    getCurrentPosition : function () {
        var that = this,
            Locater,
            initialLocation;


        if (navigator.geolocation) {
            return (function () {
                navigator.geolocation.getCurrentPosition(function (position) {
                
                    Locater = new google.maps.Geocoder();
                    initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                   
                    Locater.geocode({'latLng': initialLocation}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var _r = results[0];
                            that.directionsCalculate(_r.formatted_address);
                            that.inputFocused.val(_r.formatted_address);
                            $('#directions-steps').hide();
                        }
                    });
                   
                });
            })();

        }
    },
    autoComplete : function () {
        var that = this;
       
        var dirSource = document.getElementById('dir-source'),
            dirDestination = document.getElementById('dir-destination'),
            autoSource = new google.maps.places.Autocomplete(dirSource),
            autoDest = new google.maps.places.Autocomplete(dirDestination);

        google.maps.event.addListener(autoSource, 'place_changed', function() {
            var src = $('#dir-source').val(),
                dst = $('#dir-destination').val();
            that.directionsCalculate(src, dst);
        });
        google.maps.event.addListener(autoDest, 'place_changed', function() {
            var src = $('#dir-source').val(),
                dst = $('#dir-destination').val();
            that.directionsCalculate(src, dst);
        });

        

    },
    directionsCalculate : function(source, destination) {
        var that = this,
            markerA = '/img/markerA.png',
            markerB = '/img/markerB.png',
            geocoder = new google.maps.Geocoder();
        console.log('directionsCalculate');
        this.directionsDisplay.setMap(that.map);
        
        if (source && destination) {
            var request = {
                origin: source,
                destination: destination,
                provideRouteAlternatives: true, 
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            };      
            
            that.directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    that.directionStatus = "OK";
                    that.directionsDisplay.setDirections(response);
                   
                    var _route = response.routes[0].legs[0]; 

                   
                    that.clearMarkers();
                    that.addMarker(_route.start_location, markerA, source);
                    that.addMarker(_route.end_location, markerB, destination);
                    
                    $('#distance-costs #distance').text(_route.distance.text);
                    $('#distance-costs #duration').text(_route.duration.text);
                    $('#distance-costs').show()
                }
            });
            
        } else if (source) {
            geocoder.geocode( { 'address': source}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    that.directionStatus = "NOT_COMPLETE";
                    that.map.setCenter(results[0].geometry.location);
                    that.clearMarkers();
                    that.addMarker(results[0].geometry.location, markerA, results[0].formatted_address);
                } 
            });
        }

        $('#directions-steps').hide();
        
    },
    sendNotifications : function () {
        var that = this;
        console.log('sending notifications...');
        that.showModal('¡Se han enviado notificaciones a los cadetes más cercanos!')
    },
    validateDirections : function () {
        var that = this,
            passed = false,
            source = $('#dir-source'),
            destination = $('#dir-destination');
        
        console.log(that.directionStatus);

        passed = (source.val() === '' || destination.val() === '' || that.directionStatus === "NOT_COMPLETE") ? false : true;

        return passed;
    },
    addMarker : function (location, icon, html) {
        var that = this,
            infoWindows = [],
            bounds = new google.maps.LatLngBounds(),
            marker = new google.maps.Marker({
                position: location,
                map: this.map,
                icon: icon,
                html: '<h7>' + html + '</h7>'
            });
        this.markersArray.push(marker);        
        
    },
    clearMarkers : function () {
        if (this.markersArray) {
            for (i in this.markersArray) {
                this.markersArray[i].setMap(null);
            }
        }
    },
    showErrorMsg : function (msg) {
        $("body").snackbar({
            alive: 2000,
            content: msg
        });
    },
    showModal : function (msg) {

    }
};

$(function (){
    GALGU.galguMap.init();
});