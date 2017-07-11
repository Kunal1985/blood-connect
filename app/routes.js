import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import Donor from './components/Donor';

export default (
  <Route component={App}>
    <Route path='/' component={Home} />
    <Route path='/donor/:id' component={Donor} />
  </Route>
);