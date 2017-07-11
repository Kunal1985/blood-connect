const serverUrl = "http://localhost:5000/";
const arcGisUrlOptions = {
    url: 'https://js.arcgis.com/4.3/'
}
const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

const bloodGroups = [
    { label: 'A+', value: 'A+' },
    { label: 'O+', value: 'O+' },
    { label: 'B+', value: 'B+' },
    { label: 'AB+', value: 'AB+' },
    { label: 'A-', value: 'A-' },
    { label: 'O-', value: 'O-' },
    { label: 'B-', value: 'B-' },
    { label: 'AB-', value: 'AB-' }
];

const emailRegex = '^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$';
const phoneRegex = '^[0-9]{3}-?[0-9]{6,12}$';

export { serverUrl, arcGisUrlOptions, customStyles, bloodGroups, emailRegex, phoneRegex };