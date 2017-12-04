function initMap() {
    var myLatlng1 = new google.maps.LatLng(-32.9521398,-60.76837),
        latlng,
        markers = [];
    //google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
    var galgus = [
      {
        "desc": "<h5>Roberto Gomez</h5><p>descripcion de usuario</p>", 
        "lat": -32.9265509,
        "long":-60.6638688, 
        "icon":"car-small.png",
      },
      {
        "desc": "<h5>Katia Perryl</h5><p>descripcion de usuario</p>",
        "lat":-32.9327095,
        "long":-60.6626998,
        "icon":"bike-small.png"
      },
      {
        "desc": "<h5>Francisco Perez</h5><p>desripcion de usuario</p>",
        "lat":-32.9329536,
        "long":-60.6612964,
        "icon":"scooter-small.png"
      }
    ];
    
    


    var mapOptions = {
      zoom: 16,
      maxZoom: 16,
      center: myLatlng1,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var infowindow = new google.maps.InfoWindow();
    var markers = [],
        i = 0;
    for (i; i < galgus.length; i++) {
      marker = new google.maps.Marker({
        map: map,
        icon: '/img/' + galgus[i].icon,
        title: 'ver más'+i,
        position: new google.maps.LatLng(galgus[i].lat, galgus[i].long)
      });

      // process multiple info windows
      (function(marker, i) {
          // add click event
          google.maps.event.addListener(marker, 'click', function() {

            if (infowindow) {
                infowindow.close();
            }
            $('#infowindow').css('visibility','visible');
            $('#infowindow').empty();
            $('#infowindow').append(galgus[i].descripcion);      
          });
      })(marker, i);
    }
    

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            latlng = [position.coords.latitude, position.coords.longitude];

            
              var Locater = new google.maps.Geocoder();

              var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              map.setCenter(initialLocation);
              
              markers.push(new google.maps.Marker({
                position: map.getCenter(),
                icon: '/img/box-icon-small.png',
                map: map
              }));
              
              Locater.geocode({'latLng': initialLocation}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                  var _r = results[0];
                  $('#dir-source').val(_r.formatted_address);
                }
              });
            
            

        });
    }
    
    
    // Search Box
    function initAutocomplete() {
      // Create the search box and link it to the UI element.
      var dirSource = document.getElementById('dir-source'),
          dirDestination = document.getElementById('dir-destination');

     // var searchBox = new google.maps.places.SearchBox(input);
      //map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
      var autoSource = new google.maps.places.Autocomplete(dirSource);
      var autoDest = new google.maps.places.Autocomplete(dirDestination);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      
      // [START region_getplaces]
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }
       

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        //markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
          var icon = {
            url: "img/box-icon-small.png",
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });
      // [END region_getplaces]
    }

    initAutocomplete();
}