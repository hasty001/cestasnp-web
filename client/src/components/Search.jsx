import React, { useEffect, useState } from 'react';
import * as Constants from './Constants';
import loadScript from 'load-script';
import PageWithLoader from './reusable/PageWithLoader';

const cx = process.env.SEARCH || '117643e9e51a56509';

const Search = () => {
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);

    loadScript(`https://cse.google.com/cse.js?cx=${cx}`, {}, 
      () => {
        setSearch(<div className="gcse-search" data-linktarget="_self" data-enablehistory={true}></div>);
        setLoading(false);
      });
  }, []);

  return (
    <PageWithLoader pageId="Search" pageTitle={`Hľadanie${Constants.WebTitleSuffix}`} loading={loading}>
      <div>{search}</div>
    </PageWithLoader>
  );
};

export default Search;
