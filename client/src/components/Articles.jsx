import React, { Component, useEffect, useState } from 'react';
import Loader from './reusable/Loader';
import PaginationAdvanced from './PaginationAdvanced';
import ArticleFilter from './ArticleFilter';
import { A, navigate } from './reusable/Navigate';
import DocumentTitle from 'react-document-title';
import * as Constants from './Constants';
import * as Texts from './Texts';
import ButtonReadMore from './reusable/ButtonReadMore';
import { htmlClean, getArticleImage, getArticleCategoryText } from '../helpers/helpers';
import { fetchJson } from '../helpers/fetchUtils';

const Articles = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activePage, setActivePage] = useState(parseInt(props.match.params.page || 1));
  const [pages, setPages] = useState(12);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState(props.match.params.category);

  useEffect(() => { fetchData(); }, [activePage, filter]);

  useEffect(() => { setActivePage(parseInt(props.match.params.page || 1)) }, [props.match.params.page]);
  useEffect(() => { setFilter(props.match.params.category) }, [props.match.params.category]);

  const fetchData = () => {
    setLoading(true);

    fetchJson(filter ? `/api/articles/category/${filter}` : '/api/articles/')
    .then(count => {
      setPages(Math.ceil(count / Constants.ArticlesPageSize));
    })
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    });

    fetchJson(filter ? `/api/articles/category/${filter}/${activePage}` : `/api/articles/${activePage}`)
    .then(data => setArticles(data))
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  const handlePageSelect = (eventKey) => {
    if (!filter) {
      navigate(`/pred/articles/${eventKey}`);
    } else {
      navigate(`/pred/filteredarticles/${filter}/${eventKey}`);
    }
  }

  const handleCategorySelect = (e) => {
    const { tag } = Constants.ArticleCategories[e];
    
    if (tag === 'vsetky') {
      navigate('/pred/articles/1');
    } else {
      navigate(`/pred/filteredarticles/${tag}/1`);
    }
  }

  const filterText = filter ? getArticleCategoryText(filter) : '';

  return (
    <div id="Articles">
      <DocumentTitle title={`Články${filterText ? `: ${filterText}` : ""}${Constants.WebTitleSuffix}`} />
      <div>
        <ArticleFilter
          articleCategories={Constants.ArticleCategories}
          handleCategorySelect={handleCategorySelect}
          title={filterText || "Vyber si kategóriu"}
        />       
        <PaginationAdvanced className="top"
          pages={pages}
          activePage={activePage}
          handlePageSelect={handlePageSelect}
        />
        {!!loading && <Loader />}
        {!loading && error && <div class="errorMsg">{error}</div>}
        {!loading &&
          articles.length > 0 &&
          articles.map((article, i) => {
            const imgUrl = getArticleImage(article.introtext);

            return (
              <div key={i} className="article-div">
                {!!imgUrl && <div className="article-image before" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                    
                <A
                  className="no-decoration"
                  href={`/pred/articles/article/${article.sql_article_id}`}
                >
                  <h2 className="no-decoration">{article.title}</h2>
                </A>
                
                {!!imgUrl && <div className="article-image" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                
                <div className="article-text-col">
                  <div className="article-text" dangerouslySetInnerHTML={{ __html: htmlClean(article.introtext) }}></div>
                  <ButtonReadMore className={!!imgUrl ? "next-to-image" : ""} href={`/pred/articles/article/${article.sql_article_id}`} />
                </div>
              </div>
            );
          })}
        {/* in case of 0 articles found */}
        {!loading && articles.length === 0 && (
          <div className="no-article-div">
            <p>Bohužiaľ vo zvolenej kategórii nie je žiaden článok.</p>
          </div>
        )}
      </div>
      <PaginationAdvanced
        pages={pages}
        activePage={activePage}
        handlePageSelect={handlePageSelect}
      />
    </div>
  );
}

export default Articles;
