import React from 'react';
import { Helmet } from 'react-helmet';

const Meta = ({ title, metadesc, img, url, }) => (
    <Helmet>
        <meta property='og:title' content={title}/>
        <meta property='og:description' content={metadesc || 'Toto je starší článok z portálu CestaSNP.sk'}/>
        <meta property='og:image' content={img}/>
        <meta property='og:url' content={`https://cestasnp.sk/${url}`}/>
    </Helmet>
)
  
export default Meta

