import React, { useState, useCallback } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import MyAccountInfo from './MyAccountInfo';
import MyAccountPois from './MyAccountPois';

const MyAccount = () => {
  const [selectedTab, setSelectedTab] = useState(1);
  const onSelectedTabChanged = useCallback(
    id => {
      setSelectedTab(id);
    },
    [setSelectedTab]
  );
  console.log(selectedTab);

  return (
    <Tabs activeKey={selectedTab} onSelect={onSelectedTabChanged}>
      <Tab eventKey={0} title="Info">
        <MyAccountInfo onTabChange={onSelectedTabChanged} />
      </Tab>
      <Tab eventKey={1} title="Cesta">
        Tab 3 content
      </Tab>
      <Tab eventKey={2} title="Body záujmu">
        <MyAccountPois />
      </Tab>
    </Tabs>
  );
};

export default MyAccount;
