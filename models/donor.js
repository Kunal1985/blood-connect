var mongoose = require('mongoose');

var donorSchema = new mongoose.Schema({
  currentIp: String, 
  firstName: String,  
  lastName: String,  
  contactNumber: String,  
  currAddress: String, 
  bloodGroup: String, 
  emailAddress: { type: String, unique: true, index: true},  
  latitude: Number,
  longitude: Number  
});

module.exports = mongoose.model('Donor', donorSchema);