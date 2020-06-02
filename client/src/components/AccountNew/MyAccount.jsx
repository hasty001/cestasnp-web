import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import MyAccountInfo from './MyAccountInfo';

const MyAccount = () => {
  return (
    <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
      <Tab eventKey={1} title="Info">
        <MyAccountInfo />
      </Tab>
      <Tab eventKey={2} title="Cesta">
        Tab 2 content
      </Tab>
      <Tab eventKey={3} title="Body záujmu">
        Tab 3 content
      </Tab>
    </Tabs>
  );
};

export default MyAccount;
