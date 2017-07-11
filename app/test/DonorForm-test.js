import React from 'react';
import DonorForm from '../components/DonorForm';
const { renderIntoDocument } = require('react-addons-test-utils');

describe('Component: Donor rendered', () => {
  it('outputs what it should (using DOM rendering)', () => {
    const component = renderIntoDocument(
      <DonorForm />
    );
    console.log(component)
    expect(tree).toMatchSnapshot();
  });
});