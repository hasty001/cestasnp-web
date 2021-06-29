import React, { useEffect, useState } from 'react';
import * as Constants from './Constants';
import loadScript from 'load-script';
import PageWithLoader from './reusable/PageWithLoader';

const cx = process.env.SEARCH || '117643e9e51a56509';

const Search = (noPage, query) => {
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);

    loadScript(`https://cse.google.com/cse.js?cx=${cx}`, {}, 
      () => {
        setSearch(<div className="gcse-search" data-linktarget="_self" data-enablehistory={true}></div>);
        setLoading(false);

        setTimeout(() => { try { document.getElementsByName("search")[0].focus() } catch {} }, 50);
      });
  }, []);

  return (
    <PageWithLoader pageId={"Search" + noPage ? "NoPage" : ""} pageTitle={!noPage ? `Hľadanie${Constants.WebTitleSuffix}` : ''} 
      title={!noPage ? "Hľadanie" : ""} loading={loading}>
      <div>{search}</div>
    </PageWithLoader>
  );
};

export default Search;
