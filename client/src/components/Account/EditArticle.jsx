import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import PageWithLoader from '../reusable/PageWithLoader';
import { fetchJson, fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import ArticleForm from './ArticleForm';
import * as Texts from '../Texts';
import * as Constants from '../Constants';

const EditArticle = (props) => {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [article, setArticle] = useState(null);
  
  const authData = useContext(AuthContext);

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

  return (
    <PageWithLoader pageId="AddArticle" loading={!authData || !authData.authProviderMounted} 
      pageTitle={`Upraviť článok${Constants.WebTitleSuffix}`}
      loading={loading}
      error={error || (authData && authData.authProviderMounted && !authData.isAuth ? 'Upraviť článok môže len prihlásený užívateľ.' : '')}>
      
      <ArticleForm uid={authData.userDetails.uid} role={authData.userDetails.articlesRole} user={authData.user} edit article={article}/>
    </PageWithLoader>
  )
}

export default EditArticle;