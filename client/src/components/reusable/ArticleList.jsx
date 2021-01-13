import React, { useState } from 'react';
import ArticleItem from './ArticleItem';

const ArticleList = (props) => {

  const isMy = (article) => {
    const userDetails = props.userDetails;

    return userDetails && (
        (userDetails.articlesMy && userDetails.articlesMy.indexOf(article.sql_article_id) >= 0)
        || (article.created_by == userDetails.uid && !(userDetails.articlesNotMy && userDetails.articlesNotMy.indexOf(article.sql_article_id) >= 0)));
  };

  return (
    <>
      {!!props.articles && props.articles.filter(article => (!props.my || isMy(article)))
        .map(article => <ArticleItem key={article.sql_article_id} value={article} showLastChange={props.showLastChange || false} my={props.my}
          onMyRemove={props.onMyRemove} />)}   
    </>
  )
}

export default ArticleList;