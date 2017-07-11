import React from 'react';
import { dojoRequire } from 'esri-loader';
import EsriLoader from 'esri-loader-react';
import rp from 'request-promise';
import { serverUrl, arcGisUrlOptions } from '../utils/Constants';

class Recepient extends React.Component {
    constructor(props) {
        super(props);
        this.state = {selectedOption: 'Recepient'};
        this.createMap = this.createMap.bind(this);
        this.addMarkers = this.addMarkers.bind(this);
        this.addMarker = this.addMarker.bind(this);
    }
    createMap(){
        let currObj = this;
        let socket = io.connect();
        dojoRequire([
            'esri/Map',
            'esri/views/MapView',
            'esri/widgets/Search',
            'esri/symbols/SimpleMarkerSymbol',
            'esri/geometry/Point',
            'esri/Graphic'],
            (Map, MapView, Search, SimpleMarkerSymbol, Point, Graphic) => {
            // Create a default marker symbol for drawing the point
            var defMarkerSymbol = new SimpleMarkerSymbol({
                style: "diamond",
                color: [255, 255, 0],
                outline: { // autocasts as new SimpleLineSymbol()
                color: [255, 255, 255],
                width: 2
                }
            });

            // Create a new marker symbol for drawing the point
            var newMarkerSymbol = new SimpleMarkerSymbol({
                style: "diamond",
                color: [255, 0, 0],
                outline: { // autocasts as new SimpleLineSymbol()
                color: [255, 255, 255],
                width: 2
                }
            });
            
            new MapView({
                container: "mapViewDiv",
                map: new Map({basemap: 'hybrid'}),
                zoom: 15,
                center: [-80, 35]
            }).then(function(view) {
                // Create Search Widget
                var searchWidget = new Search({
                    view: view
                });
                // Add the search widget to the very top right corner of the view
                view.ui.add(searchWidget, {
                    position: "top-right",
                    index: 0
                });
                currObj.addMarkers(view, defMarkerSymbol, Point, Graphic);

                socket.on('donorAddedBroadcast', (data) => {
                    console.log("Socket donorAddedBroadcast", data);
                    currObj.addMarker(data, view, newMarkerSymbol, Point, Graphic)
                });

                var popup = view.popup;
                popup.viewModel.on("trigger-action", function(event) {
                    if (event.action.id === "show-hidden-info") {
                        var attributes = popup.viewModel.selectedFeature.attributes;
                        let info = ["Contact Number:", attributes.contactNumber, "\nEmail Address:", attributes.emailAddress].join(" ");
                        // console.log(info);
                        alert(info);
                    }
                });
            });
        });
    }

    // Function to add all the Donors as Markers to the MapView
    addMarkers(view, defMarkerSymbol, Point, Graphic){
        rp(serverUrl + 'api/donors')
            .then((donors) => {
                let donorList = JSON.parse(donors);
                for(var i=0; i<donorList.length; i++){
                    let currDonor = donorList[i];
                    this.addMarker(currDonor, view, defMarkerSymbol, Point, Graphic);
                }
            })
            .catch((err) => {
                console.log("Error", err);
            });
    }


    // Function to add individual Donor as Marker to the MapView
    addMarker(currDonor, view, markerSymbol, Point, Graphic){
        // Create a point geometry
        var point = new Point({
            longitude: currDonor.longitude,
            latitude: currDonor.latitude
        });
        // Create an object for storing attributes related to the point
        var pointAtt = {
            fullName: [currDonor.firstName, currDonor.lastName].join(" "),
            bloodGroup: currDonor.bloodGroup,
            currAddress: currDonor.currAddress,
            contactNumber: currDonor.contactNumber,
            emailAddress: currDonor.emailAddress
        };

        // Create a point graphic, add the geometry and symbol to it
        var pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol,
            attributes: pointAtt,
            popupTemplate: {
                title: "{fullName}",
                content: `
                    <table>
                        <tr>
                            <th class="esri-popup-renderer__field-header">Blood Group</th>
                            <td class="esri-popup-renderer__field-data">{bloodGroup}</td>
                        </tr>
                        <tr>
                            <th class="esri-popup-renderer__field-header">Address</th>
                            <td class="esri-popup-renderer__field-data">{currAddress}</td>
                        </tr>
                        <tr>
                            <th class="esri-popup-renderer__field-header">Contact Number</th>
                            <td class="esri-popup-renderer__field-data">xxxxx-xxxxx</td>
                        </tr>
                        <tr>
                            <th class="esri-popup-renderer__field-header">Address</th>
                            <td class="esri-popup-renderer__field-data">xxx@xxx.xxx</td>
                        </tr>
                    </table>
                `,
                actions: [{
                    id: "show-hidden-info",
                    title: "Show Hidden Info"
                }]
            }
        });

        // Add Marker Point Graphic to the MapView
        view.graphics.add(pointGraphic);
    }

    render() {
        return (
            <div className="padding-20">
                <EsriLoader options={arcGisUrlOptions} ready={this.createMap} />
                <div id="mapViewDiv" className='map-view'></div>
            </div>
        );
    }
}

export default Recepient;