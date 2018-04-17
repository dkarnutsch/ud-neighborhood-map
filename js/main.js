var App = {};
jQuery(document).ready(function () {
    function initMap() {
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 47.8062299, lng: 13.0326597 },
            zoom: 14
        });

        // Info window, shown if marker is selected
        var largeInfowindow = new google.maps.InfoWindow();

        // Create a marker per location
        App.locationMarkers.forEach(function (marker) {
            marker.setMap(map);

            // Create an onclick event to open the large infowindow at each marker.
            marker.addListener('click', function () {
                populateInfoWindow(this, largeInfowindow);
            });
        });

        // This function populates the infowindow when the marker is clicked. We'll only allow
        // one infowindow which will open at the marker that is clicked, and populate based
        // on that markers position.
        function populateInfoWindow(marker, infowindow) {
            // Check to make sure the infowindow is not already opened on this marker.
            if (infowindow.marker != marker) {
                // Clear the infowindow content to give the streetview time to load.
                infowindow.setContent(marker.title);
                infowindow.marker = marker;
                // Make sure the marker property is cleared if the infowindow is closed.
                infowindow.addListener('closeclick', function () {
                    infowindow.marker = null;
                });

                // Open the infowindow on the correct marker.
                infowindow.open(map, marker);
            }
        }
    };

    function AppViewModel() {
        var self = this;

        // Hardcoded Marker Data
        this.locationMarkers = [new google.maps.Marker({
            id: 1,
            position: { lat: 47.7970131, lng: 13.0418987 },
            title: 'St. Peter\'s Abbey',
            animation: google.maps.Animation.DROP
        }),
        new google.maps.Marker({
            id: 2,
            position: { lat: 47.7978184, lng: 13.04468 },
            title: 'Salzburg Cathedral',
            animation: google.maps.Animation.DROP
        }),
        new google.maps.Marker({
            id: 3,
            position: { lat: 47.8053133, lng: 13.0410201 },
            title: 'Mirabell Palace and Gardens',
            animation: google.maps.Animation.DROP
        }),
        new google.maps.Marker({
            id: 4,
            position: { lat: 47.7953466, lng: 13.0461903 },
            title: 'Salzburg Fortress',
            animation: google.maps.Animation.DROP
        }),
        new google.maps.Marker({
            id: 5,
            position: { lat: 47.7937736, lng: 13.0192383 },
            title: 'Stiegl-Brauwelt',
            animation: google.maps.Animation.DROP
        }),
        new google.maps.Marker({
            id: 6,
            position: { lat: 47.7937076, lng: 13.0051813 },
            title: 'Red Bull Hangar-7',
            animation: google.maps.Animation.DROP
        })];

        // Create a observable array with id and title of the marker
        this.currentLocations = ko.observableArray([]);;
        this.locationMarkers.forEach(function (item) {
            self.currentLocations.push({
                id: item.id,
                title: item.title
            });
        });

        this.filterQuery = ko.observable("");

        // Filters based on the query string
        this.filter = function () {
            // Remove all current items
            this.currentLocations.removeAll();

            this.locationMarkers.forEach(function (item) {
                var query = self.filterQuery().toLowerCase().trim();
                var title = item.title.toLowerCase();

                if (title.indexOf(query) != -1) {
                    self.currentLocations.push({
                        id: item.id,
                        title: item.title
                    });
                }
            });
        };

        this.highlight = function (data) {
            console.log("Hello World! " + data.title);
        };
    };

    App = new AppViewModel();
    ko.applyBindings(App);

    initMap();
});