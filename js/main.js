function App() {
    var appViewModel = {};
    var mapViewModel = {};

    // This view model is repsonsible for handling all map related stuff
    function MapViewModel() {
        var self = this;

        // Hardcoded Marker Data
        this.locationMarkers = [new google.maps.Marker({
            id: 1,
            position: { lat: 47.7970413, lng: 13.0445758 },
            title: 'St. Peter\'s Abbey'
        }),
        new google.maps.Marker({
            id: 2,
            position: { lat: 47.7978332, lng: 13.0468294 },
            title: 'Salzburg Cathedral'
        }),
        new google.maps.Marker({
            id: 3,
            position: { lat: 47.8054645, lng: 13.0416187 },
            title: 'Mirabell Palace and Gardens'
        }),
        new google.maps.Marker({
            id: 4,
            position: { lat: 47.7953434, lng: 13.0483319 },
            title: 'Salzburg Fortress'
        }),
        new google.maps.Marker({
            id: 5,
            position: { lat: 47.793788, lng: 13.0213806 },
            title: 'Stiegl-Brauwelt'
        }),
        new google.maps.Marker({
            id: 6,
            position: { lat: 47.7937062, lng: 13.0073258 },
            title: 'Red Bull Hangar-7'
        })];

        // global map object, so map can be used by multiple functions
        var map;

        // Info window, shown if marker is selected
        var largeInfowindow = new google.maps.InfoWindow();

        // sets the map, centers it to salzburg and displays all markers
        this.initMap = function () {
            // Constructor creates a new map - only center and zoom are required.
            map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 47.8062299, lng: 13.0326597 },
                zoom: 14,
                disableDefaultUI: true
            });

            // Create a marker per location
            self.locationMarkers.forEach(function (marker) {
                marker.setMap(map);

                // Create an onclick event to open the large infowindow at each marker.
                marker.addListener('click', function () {
                    self.populateInfoWindow(this);
                });
            });
        };

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        this.populateInfoWindow = function (marker) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (largeInfowindow.marker != marker) {
                // Clear the infowindow content to give the streetview time to load.
                largeInfowindow.setContent('<h2>Restaurant recommendations near ' + marker.title + '</h2>');
                largeInfowindow.marker = marker;
                // Make sure the marker property is cleared if the infowindow is closed.
                largeInfowindow.addListener('closeclick', function () {
                    largeInfowindow.marker = null;
                });

                // Open the infowindow on the correct marker.
                largeInfowindow.open(map, marker);

                // Load API information
                self.populateRestaurantInformation(marker.position.lat(), marker.position.lng());

                // start the animation
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () { marker.setAnimation(null); }, 750); // stop after one bounce
            }
        };

        // Feteches information about nearby restaurants using the FourSquare API
        this.populateRestaurantInformation = function (lat, lng) {
            const foursquare_client_id = 'K4X2LMMP4H1X20XFK51GMHQN4FMQ433RFOWMPEBH3INMRXEB';
            const foursquare_client_secret = 'PZOAFTSG4VXHXZ0LS312FWDZOV5H1COQMMLV111WNW0LMQDL';
            const categoryId = '4d4b7105d754a06374d81259'; // Restaurant: see https://developer.foursquare.com/docs/resources/categories

            var url = 'https://api.foursquare.com/v2/venues/search?v=20180323&radius=100&client_id=' + foursquare_client_id +
                '&client_secret=' + foursquare_client_secret + '&categoryId=' + categoryId + '&ll=' + lat + ',' + lng;

            $.ajax(url)
                .done(function (data) {
                    venueStr = '<p>';
                    data.response.venues.forEach(function (venue) {
                        console.log(venue);
                        venueStr += '<a href="http://foursquare.com/v/' + venue.id + '">' + venue.name + '</a> ' + ' -- ' + venue.location.formattedAddress.join(', ') + '<br>';
                    });
                    venueStr += '<br><br>Powered by Foursquare.'
                    largeInfowindow.setContent(largeInfowindow.getContent() + venueStr + '</p>');
                })
                .fail(function (data) {
                    console.log(data);
                    largeInfowindow.setContent(largeInfowindow.getContent() + '<p>Unable to load data from Foursquare.</p>');
                });
        };

        // Hides all markers from the map
        this.hideMarkers = function (markers) {
            markers.forEach(function (item) {
                item.setMap(null);
            });
        };

        // Shows the current filtered locations
        this.showMarkers = function (markers, locations) {
            var locationIds = [];
            locations.forEach(function (item) {
                locationIds.push(item.id);
            });

            markers.forEach(function (item) {
                if (locationIds.indexOf(item.id) > -1) {
                    item.setMap(map);
                }
            });
        };
    }

    function AppViewModel() {
        var self = this;

        // Create a observable array with id and title of the marker
        this.currentLocations = ko.observableArray([]);
        mapViewModel.locationMarkers.forEach(function (item) {
            self.currentLocations.push({
                id: item.id,
                title: item.title
            });
        });

        this.filterQuery = ko.observable('');

        // Filters based on the query string
        this.filterQuery.subscribe(function () {
            // Remove all current items
            self.currentLocations.removeAll();

            // Remove all markers from the map
            mapViewModel.hideMarkers(mapViewModel.locationMarkers);

            mapViewModel.locationMarkers.forEach(function (item) {
                var query = self.filterQuery().toLowerCase().trim();
                var title = item.title.toLowerCase();

                if (title.indexOf(query) != -1) {
                    self.currentLocations.push({
                        id: item.id,
                        title: item.title
                    });
                }
            });

            // Show current markers based on query
            mapViewModel.showMarkers(mapViewModel.locationMarkers, self.currentLocations());
        });

        this.isSidebarExpanded = ko.observable(true);

        // Marker is clicked in the list, show the info window
        this.highlight = function (data) {
            mapViewModel.populateInfoWindow(mapViewModel.locationMarkers[data.id - 1]); // id to index conversion
        };

        // Toggles wether the sidebar is shown or hidden
        this.toggleMenu = function (data) {
            this.isSidebarExpanded(!this.isSidebarExpanded());
        };
    }

    mapViewModel = new MapViewModel();
    mapViewModel.initMap();

    appViewModel = new AppViewModel();
    ko.applyBindings(appViewModel);
}

var googleSuccess = function () {
    new App();
};

var googleError = function () {
    alert("Error loading Google Maps API. Please try again later.")
};

