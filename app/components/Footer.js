import React from 'react';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <footer>
          <div className='row padding-20'>
            <div className='col-sm-5 text-left'>
              Blood Connect
            </div>
            <div className='col-sm-7 text-right'>
              &#169; Kunal Kishor Ugale
            </div>
          </div>
      </footer>
    );
  }
}

export default Footer;