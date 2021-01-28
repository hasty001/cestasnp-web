import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getArticleState, htmlSanitize } from '../../helpers/helpers';
import * as Constants from '../Constants';
import ImageBox from './ImageBox';

const ArticlePreviewBox = ({ title, intro, text, show, onHide, children, state, tags, gps }) => {
  
  const [preview, setPreview] = useState(null);

  window.__setPreview = setPreview;

  const getOptionLabel = (v) => {
    const index = Constants.ArticleCategories.findIndex(o => o.tag == v);

    return index >= 0 ? Constants.ArticleCategories[index].text : v;
  };

  return (
  <Modal
    id="ArticlePreviewBox"
    show={show}
    onHide={onHide}
    dialogClassName="article-preview-box"

  >
    <Modal.Header closeButton>
      <Modal.Title>Náhled článku</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div id="Article">
        {(!!state || (state === 0)) && (<div>Stav: {getArticleState(state)}</div>)}
        {!!tags && (<div>Zaradenie: {(tags || []).map(v => getOptionLabel(v)).join(", ")}</div>)}
        {!!gps && (<div>GPS: {gps}</div>)}

        <h2>{title}</h2>
        
        <div dangerouslySetInnerHTML={{ __html: htmlSanitize(intro) }} />
        <div dangerouslySetInnerHTML={{ __html: htmlSanitize(text) }} />
        {children}
        <ImageBox show={!!preview} url={preview} onHide={() => setPreview(null)} />
      </div>
    </Modal.Body>
    <Modal.Footer>{` `}</Modal.Footer>
  </Modal>);
}

export default ArticlePreviewBox;
