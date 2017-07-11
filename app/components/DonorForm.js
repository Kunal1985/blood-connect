import React from 'react';
import { serverUrl, arcGisUrlOptions, customStyles, bloodGroups, emailRegex, phoneRegex } from '../utils/Constants';
import { Form, Text, Select, Textarea, Checkbox, Radio, RadioGroup, NestedForm, FormError } from 'react-form';
import rp from 'request-promise';

class DonorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.state;
    this.closeModal = props.closeModal;
    this.renderResponse = this.renderResponse.bind(this);
  }

  renderResponse(obj){
      console.log(obj);
      this.setState(obj);
  }

  render() {
    let currObj = this;
    let socket = io.connect();
    return (
        <div className='padding-20'>
            <div className="alert alert-info">
                <strong>Your Address:</strong> {this.state.currAddress}<br />
                <strong>Your Co-Ordinates:</strong> [{this.state.coOrdinates.longitude}, {this.state.coOrdinates.latitude}]
            </div>
            { this.state.success ? 
                <div className="alert alert-success">
                    {this.state.success.message}<br/>
                    You can view/update your details @<br />
                    <a href={window.location.origin + "/donor/" + this.state.success.donorAdded._id}>
                        {window.location.origin + "/donor/" + this.state.success.donorAdded._id}
                    </a>
                </div> 
                : this.state.error ? <div className="alert alert-danger width-500" dangerouslySetInnerHTML={{__html: this.state.error}} /> 
                : ''
                }

            <Form
                defaultValues = {currObj.state.currDonor ? currObj.state.currDonor: {}}
                onSubmit={(values) => {
                    values.currAddress = this.state.currAddress;
                    values.latitude = this.state.coOrdinates.latitude;
                    values.longitude = this.state.coOrdinates.longitude;
                    values.currentIp = this.state.currentIp;
                    let options = {
                        method: 'POST',
                        uri: serverUrl + 'api/donors',
                        body: values,
                        json: true
                    };
                    rp(options)
                        .then(function (body) {
                            currObj.renderResponse({success: body, error: null});
                            socket.emit("donorAdded", body);
                        })
                        .catch(function (err) {
                            currObj.renderResponse({success: null, error: err.message});
                        });
                }}
                validate={(values) => {
                    return {
                        firstName: !values.firstName ? 'First Name is required' : undefined,
                        lastName: !values.lastName ? 'Last Name is required' : undefined,
                        contactNumber: !values.contactNumber ? 'Contact Number is required' : !values.contactNumber.match(phoneRegex) ? 'Please enter a valid Contact Number': undefined,
                        emailAddress: !values.emailAddress ? 'Email Address is required' : !values.emailAddress.match(emailRegex) ? 'Please enter a valid Email Address': undefined,
                        bloodGroup: !values.bloodGroup ? 'Blood Group is required' : undefined
                    }
                }}
            >
                {({submitForm}) => {
                    return (
                        <form onSubmit={submitForm}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <Text field='emailAddress' placeholder='Email Address' className="form-control" readOnly={!!currObj.state.currDonor}/>
                            </div>
                            <div className="form-group">
                                <label>First Name</label>
                                <Text field='firstName' placeholder='First Name' className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <Text field='lastName' placeholder='Last Name' className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Contact Number</label>
                                <Text field='contactNumber' placeholder='Contact Number' className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <Select field='bloodGroup' options={bloodGroups} className="form-control" />
                            </div>
                            <div className="text-center">
                                <button className="btn btn-primary" type='submit'>
                                    {currObj.state.currDonor ? 'Save': 'Register'}
                                </button>
                                <button onClick={this.closeModal} className="btn btn-danger">Close</button>
                            </div>
                        </form>
                    )
                }}
            </Form>
        </div>
    );
  }
}

export default DonorForm;