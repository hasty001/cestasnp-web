import React, { useContext, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import * as Constants from './Constants';
import { dateTimeToStr, getArticleStateIcon } from '../helpers/helpers';
import { AuthContext } from './AuthContext';
import { fetchJson } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import { A } from './reusable/Navigate';
import ArticlePreviewBox from './reusable/ArticlePreviewBox';
import ArticleDiffBox from './reusable/ArticleDiffBox';
import UserLabel from './reusable/UserLabel';

const ArticleHistory = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [article, setArticle] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diff, setDiff] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson(`/api/articles/article/${props.match.params.articleId}`)
      .then(value => {
        if (!value || value.length == 0) {
          throw "No article.";
        }

        setArticle(value[0]);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError('Článok sme nenašli :(');

        console.error("Article loading error: ", e);
      });
  };

  useEffect(() => { fetchData(); }, [props.match.params.articleId]);

  const getPreviewLink = (version) => <a className="article-history-link" href="#" onClick={() => setPreview(version)}>náhled</a>;
  const getDiffLink = (version) => <a className="article-diff-link" href="#" onClick={() => setDiff(version)}>rozdiel</a>;
  const getEditLink = (version = "") => <A className="article-edit-link" href={`/pred/articles/article/${props.match.params.articleId}/upravit#${version}`}>použiť pre úpravy</A>;
  const getStateIcon = (version) => <span className="article-state-icon">{getArticleStateIcon(version)}</span>

  const history = [article];
  if (article && article.history) {
    article.history.forEach(h => history.push(h));
  }

  history.sort((a, b) => new Date(b.modified || 0) - new Date(a.modified || 0));

  return (
    <PageWithLoader pageId="Article" loading={loading} error={error}>
      {!!article && (
        <>
          <DocumentTitle title={`História úprav článku - ${article.title}${Constants.WebTitleSuffix}`} />
          {!!article.errorMsg && <div className="errorMsg">{article.errorMsg}</div>}
          {!!article.successMsg && <div className="successMsg">{article.successMsg}</div>}
          
          <h2>História úprav článku - <A href={`/pred/articles/article/${props.match.params.articleId}`}>{article.title}</A></h2>
      
              {history.filter(h => h.modified).map(h => 
                <div key={h._id} className="article-history-item">
                {h._id == article._id ? "> " : ""}{dateTimeToStr(h.modified)} 
                {` `}{h.state == -1 ? "navrhol úpravy" : "upravil"}{` `}<UserLabel uid={h.modified_by} name={h.modified_by_name}/>{` `}{getStateIcon(h.state)}{' Poznámka: '}{h.note} 
                {` `}{getPreviewLink(h)}
                {` `}{getEditLink(h._id)}
                {` `}{getDiffLink(h)}
                </div>)}
              {history.filter(h => !h.modified || history.length == 1).map(h => 
                <div key={"h" + h._id} className="article-history-item">
                {(h._id == article._id && !h.modified) ? "> " : ""}{dateTimeToStr(h.created)} 
                {` `}{h.state == -1 ? "navrhol pridať" : "pridal"}{` `}<UserLabel uid={h.created_by} name={h.created_by_name}/>{` `}{getStateIcon(h.state)} 
                {` `}{getPreviewLink(h)}
                {` `}{getEditLink(h._id)}
                {` `}{getDiffLink(h)}
                </div>)}

          <ArticlePreviewBox show={preview != null} 
            title={preview ? preview.title : ""} 
            intro={preview ? preview.introtext : ""}
            text={preview ? preview.fulltext : ""} 
            state={preview ? preview.state : ""} 
            tags={preview ? preview.tags : []} 
            gps={preview && preview.lat && preview.lon ? preview.lat + ", " + preview.lon : ""} 
            created={preview ? preview.created : 0}
            author={preview ? preview.author || preview.created_by : ""}
            authorName={preview ? preview.author_name || preview.created_by_name : ""}
            authorText={preview ? preview.author_text : ""}
            onHide={() => setPreview(null)}/>

          <ArticleDiffBox show={diff != null} 
            oldArticle={article}
            newArticle={diff}
            onHide={() => setDiff(null)}/>
        </>
      )}
    </PageWithLoader>
  );
}

export default ArticleHistory;
