import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import PageWithLoader from '../reusable/PageWithLoader';
import { fetchJson, fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import ArticleForm from './ArticleForm';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import { compareDesc } from 'date-fns';
import ArticleList from '../reusable/ArticleList';

const AddArticle = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [articles, setArticles] = useState([]);
  
  const authData = useContext(AuthContext);

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchPostJsonWithToken(authData.user, '/api/articles/my', { uid: authData.userDetails.uid })
      .then(articles => {

        const maxDate = article => {
          return article.modified ? article.modified : article.created;
        };

        articles.sort((a, b) => compareDesc(maxDate(a), maxDate(b)));

        setArticles(articles);
        setLoading(false);
        setError('');
      })
      .catch(e => {
        setLoading(false);
        setError(Texts.GenericError);

        console.error("Articles loading error: ", e);
      });
  };

  const updateArticles = (article) => {
    const list = articles.map(p => p);
    articles.forEach(p => { p.errorMsg = ''; p.successMsg = ''; });

    if (article) {
      const index = list.findIndex(p => article.sql_article_id === p.sql_article_id);
      if (index >= 0) {
        list.splice(index, 1, article);
      } else {
        list.splice(0, 0, article);
      } 
    }

    setArticles(list);
  }

  useEffect(() => { fetchData(); }, []);

  const toggleIsMy = (article) => {
    fetchPostJsonWithToken(authData.user, "/api/articles/toggleMy", { id: article.sql_article_id, uid: authData.userDetails.uid })
    .then(res => {
      authData.updateUserDetails(res);
    })
    .catch(error => { console.error(error); updateArticles(Object.assign({ errorMsg: Texts.GenericError }, article)) });
  };

  return (
    <PageWithLoader pageId="AddArticle" loading={!authData || !authData.authProviderMounted} 
      pageTitle={`Pridať článok${Constants.WebTitleSuffix}`}
      error={authData && authData.authProviderMounted && !authData.isAuth ? 'Pridať článok môže len prihlásený užívateľ.' : ''}>
      
      <ArticleForm uid={authData.userDetails.uid} role={authData.userDetails.articlesRole} user={authData.user} onUpdate={updateArticles}/>

      <PageWithLoader pageId="MyArticles" loading={loading} error={error} title="Moje články" className="thinRedWrap">
        <ArticleList my showLastChange articles={articles} userDetails={authData.userDetails} onMyRemove={toggleIsMy}/>
      </PageWithLoader>
    </PageWithLoader>
  )
}

export default AddArticle;