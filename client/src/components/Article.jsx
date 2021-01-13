import React, { useContext, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import * as Constants from './Constants';
import { htmlSanitize } from '../helpers/helpers';
import { AuthContext } from './AuthContext';
import { fetchJson, fetchPostJsonWithToken } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import { A } from './reusable/Navigate';
import Map from './Map';

const Article = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [article, setArticle] = useState(null);

  const authData = useContext(AuthContext);

  const userDetails = authData ? authData.userDetails : null;
      
  const isMyArticle = 
    (authData && authData.isAuth && userDetails && article) ? 
      (userDetails.articlesMy && userDetails.articlesMy.indexOf(article.sql_article_id) >= 0)
        || (article.created_by == userDetails.uid && !(userDetails.articlesNotMy && userDetails.articlesNotMy.indexOf(article.sql_article_id) >= 0))
      : false;

  const toggleIsMy = () => {
    fetchPostJsonWithToken(authData.user, "/api/articles/toggleMy", { id: article.sql_article_id, uid: authData.userDetails.uid })
    .then(res => {
      authData.updateUserDetails(res);
    })
    .catch(error => { console.error(error); setArticle(Object.assign({ errorMsg: Texts.GenericError }, article)) });
  };

  const clearMsg = () => {
    if (article) {
      const newArticle = Object.assign({}, article);

      delete newArticle.successMsg;
      delete newArticle.errorMsg;

      setArticle(article);
    }
  };

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson(`/api/articles/article/${props.match.params.articleId}`)
      .then(value => {
        if (!value || value.length == 0) {
          throw "No article.";
        }

        updateArticleViews('/api/articles/increase_article_count', { id: value[0]._id });

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

  const updateArticleViews = (url, data) => {
    // Default options are marked with *
    return fetch(url, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      cache: 'no-cache', // *default, cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *omit
      headers: {
        'content-type': 'application/json'
      },
      method: 'PUT', // *GET, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *same-origin
      redirect: 'follow', // *manual, error
      referrer: 'no-referrer' // *client
    })
      .then(response => response.json()) // parses response to JSON
      .catch(e => {
        console.error("Update article view error: ", e);
      });
  };

  return (
    <PageWithLoader pageId="Article" loading={loading} error={error}>
      {!!article && (
        <>
          <DocumentTitle title={`${article.title}${Constants.WebTitleSuffix}`} />
          {!!article.errorMsg && <div className="errorMsg">{article.errorMsg}</div>}
          {!!article.successMsg && <div className="successMsg">{article.successMsg}</div>}
          
          <h2>{article.title}
            <span className="article-actions">
              {!!authData.isAuth && 
                (<A href={`/pred/articles/article/${props.match.params.articleId}/historia`}
                  className="article-history" title="história úprav článku"><i className="fas fa-info-circle"/></A>)}

              {!!authData.isAuth && 
                (<a href="#" onClick={e => { e.preventDefault(); toggleIsMy(); clearMsg(); }} 
                   className="article-my" title={isMyArticle ? "odobrať z mojich člankov" :"pridať do mojich člankov"}>
                   <span className={isMyArticle ? "" : "hidden"}><i className="fas fa-star" /></span>
                   <span className={isMyArticle ? "hidden" : ""}><i className="far fa-star" /></span>
                 </a>)}

              {!!authData.isAuth && 
                (<A href={`/pred/articles/article/${props.match.params.articleId}/upravit/${article.history && article.history.length > 0 && article.history[0].modified > article.modified ? `#${article.history[0]._id}` : ""}`}
                  className="article-edit" title="upraviť článok"><i className="fas fa-pencil-alt"/></A>)}
            </span>
          </h2>
          <div dangerouslySetInnerHTML={{ __html: htmlSanitize(article.introtext) }} />
          <div dangerouslySetInnerHTML={{ __html: htmlSanitize(article.fulltext) }} />
          
          {!!article.lat && !!article.lon && <Map use="map" marker={{ lat: article.lat, lon: article.lon }} view={{ lat: article.lat, lon: article.lon, zoom: 13 }}/>}
        </>
      )}
    </PageWithLoader>
  );
}

export default Article;
