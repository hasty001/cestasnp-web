import React, { useEffect } from 'react';
import Search from '../Search';
import PageWithLoader from './PageWithLoader';

const NotFound = ({ text }) => {

  const fix = (url) => {
    return url.replaceAll("/", " ").replaceAll("-", " ").trim();
  }

  useEffect(() => {
    window.location.hash = "gsc.q=" + fix(window.location.pathname);
  }, []);

  return (
    <PageWithLoader pageId="Search" title={404}>
      <p>{text || "Článok sme nenašli :(."} Zkus hľadanie:</p>
      <Search noPage/>
    </PageWithLoader>
  );
};

export default NotFound;
