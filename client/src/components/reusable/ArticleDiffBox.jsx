import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { getArticleState, htmlSanitize } from '../../helpers/helpers';
import * as Constants from '../Constants';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

const ArticleDiffBox = ({ oldArticle, newArticle, show, onHide }) => {
  
  const getOptionLabel = (v) => {
    const index = Constants.ArticleCategories.findIndex(o => o.tag == v);

    return index >= 0 ? Constants.ArticleCategories[index].text : v;
  };

  const getArticleCode = (article) => {
    const result = [];
    if (article.state || (article.state === 0)) {
      result.push(`Stav: ${getArticleState(article.state)}`);
    }
    if (article.tags) {
      result.push(`Zaradenie: ${(article.tags || []).map(v => getOptionLabel(v)).join(", ")}`);
    }
    if (article.gps) {
      result.push(`GPS: ${article.gps}`);
    }
    result.push("");
    result.push(`Názov: ${article.title}`);
    result.push("");
    result.push("Úvod:");
    result.push(article.introtext);
    result.push("Text:");
    result.push(article.fulltext);

    return result.join("\n");
  }

  const oldCode = oldArticle ? getArticleCode(oldArticle) : "";
  const newCode = newArticle ? getArticleCode(newArticle) : "";

  return (
    <Modal
      id="ArticleDiffBox"
      show={show}
      onHide={onHide}
      dialogClassName="article-diff-box"
    >
      <Modal.Header closeButton>
        <Modal.Title>Rozdiel</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ReactDiffViewer oldValue={oldCode} newValue={newCode} splitView={true} compareMethod={DiffMethod.WORDS} />
      </Modal.Body>
      <Modal.Footer>{` `}</Modal.Footer>
    </Modal>);
}

export default ArticleDiffBox;
