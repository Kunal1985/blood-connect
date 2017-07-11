import React from 'react';
import Recipient from './Recipient';
import Donor from './Donor';
class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {selectedOption: 'Recipient'};
    this.handleOptionChange = this.handleOptionChange.bind(this);
  }

  handleOptionChange(event) {
    this.setState({
      selectedOption: event.target.value
    });
  }

  getClassName(currState){
    if(this.state.selectedOption === currState){
      return 'btn btn-primary';
    } else{
      return 'btn btn-info';
    }
  }

  render() {
    return (
      <div className='container'>
        <h3 className='text-center'>I am a</h3>
        <div className='row text-center'>
          <label className="radio-inline">
              <input type="button" value="Recipient" onClick={this.handleOptionChange}  className={this.getClassName('Recipient')}/>
          </label>
          <label className="radio-inline">
              <input type="button" value="Donor" onClick={this.handleOptionChange}  className={this.getClassName('Donor')}/>
          </label>
        </div>

        { this.state.selectedOption === 'Recipient' ? <Recipient />: <Donor /> }
      </div>
    );
  }
}

export default Home;