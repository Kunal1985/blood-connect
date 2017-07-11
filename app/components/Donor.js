import React from 'react';
import { dojoRequire } from 'esri-loader';
import EsriLoader from 'esri-loader-react';
import { serverUrl, arcGisUrlOptions, customStyles } from '../utils/Constants';
import Modal from 'react-modal';
import DonorForm from './DonorForm';
import rp from 'request-promise';

class Donor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption: 'Donor',
      modalIsOpen: false,
      coOrdinates: {},
      currDonor: null,
      donorFound: false
    };
    this.createMap = this.createMap.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.render = this.render.bind(this);

    rp.get('https://api.ipify.org/?format=json')
      .then((res) => {
        this.state.currentIp = JSON.parse(res).ip;
      });

    if(props.params){
      rp(serverUrl + 'api/donors/' + props.params.id)
        .then((donorObj) => {
            this.setState({currDonor: JSON.parse(donorObj)});
            this.setState({donorFound: true});
        })
        .catch((err) => {
            console.log("Error", err);
        });  
    }
  }

  createMap(){
    let currObj = this;
    let currDonor = currObj.state.currDonor;
    let currCoOrdinates = currDonor ? [currDonor.longitude, currDonor.latitude] : [-80, 35];
    let socket = io.connect();  
    if(currObj.props.params){
      socket.on('donorAddedBroadcast', (data) => {
        console.log("Socket donorAddedBroadcast", data);
        window.location.reload();
      });
    }
    dojoRequire([
      'esri/Map',
      'esri/views/MapView',
      'esri/widgets/Search',
      'esri/symbols/SimpleMarkerSymbol',
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/tasks/Locator'],
      (Map, MapView, Search, SimpleMarkerSymbol, Point, Graphic, Locator) => {
      // Create a default marker symbol for drawing the point
      var defMarkerSymbol = new SimpleMarkerSymbol({
        style: "diamond",
        color: [0, 0, 255],
        outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 2
        }
      });

      // Create a locator task using the world geocoding service
      var locatorTask = new Locator({
          url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      });
        
      new MapView({
        container: "mapViewDiv",
        map: new Map({basemap: 'hybrid'}),
        zoom: 15,
        center: currCoOrdinates
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
        // Handle click event for the MapView
        view.on("click", function(event) {
          // Get the coordinates using 'event.mapPoint'
          locatorTask.locationToAddress(event.mapPoint).then(function(response) {
            currObj.state.currAddress = response.address.Match_addr;
            currObj.state.coOrdinates.latitude = event.mapPoint.latitude;
            currObj.state.coOrdinates.longitude = event.mapPoint.longitude;

            currObj.openModal();
          }).otherwise(function(err) {
            console.error("Error!", err);
          });
        });
        currObj.addMarker(currObj.state.currDonor, view, defMarkerSymbol, Point, Graphic);
      });
    });
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }
 
  closeModal() {
    this.setState({modalIsOpen: false});
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
    let currDonor = this.state.currDonor;
    let donorFound = this.state.donorFound;
    let currProps = this.props;
    return (
        <div className="container padding-20">
          { currDonor ? 
              donorFound ?
                <div className="row alert alert-success">
                    <div className="col col-sm-6">
                      <h3><strong>Welcome</strong> {currDonor.firstName}&nbsp;{currDonor.lastName} !</h3>
                      <p><strong>Blood Group:</strong> {currDonor.bloodGroup}</p>
                      <p><strong>Mailing Address:</strong> {currDonor.currAddress}</p>
                      <p><strong>Co-Ordinates:</strong> [{currDonor.longitude}, {currDonor.latitude}]</p>
                    </div>
                    <div className="col col-sm-6">
                      <h3>Contact Details</h3>
                      <p><strong>Contact Number:</strong> {currDonor.contactNumber}</p>
                      <p><strong>Email Address:</strong> {currDonor.emailAddress}</p>
                    </div>
                </div> : 
                <div className="row alert alert-danger">
                  No valid Donor for the accessed URL
                </div> : (currProps && currProps.id) ? 
                <div className="row alert alert-info">..Loading Donor</div> : ''
              
          }
          <EsriLoader options={arcGisUrlOptions} ready={this.createMap} />
          <div id="mapViewDiv" className='map-view'></div>
          
          <Modal
            isOpen={this.state.modalIsOpen}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Donor Form Modal"
          >
  
            <DonorForm state={this.state} closeModal={this.closeModal}/>
          </Modal>
        </div>
    );
  }
}

export default Donor;