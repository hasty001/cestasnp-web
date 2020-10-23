import React, { Component } from 'react';
import DocumentTitle from 'react-document-title';
import Loader from './reusable/Loader';
import Meta from './reusable/Meta';
import * as Constants from './Constants';

class Article extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: `/api/articles/article/${this.props.match.params.articleId}`,
      og_url: `/pred/articles/article/${this.props.match.params.articleId}`,
      loading: true,
      article: []
    };
    this.updateArticleViews = this.updateArticleViews.bind(this);
  }

  componentDidMount() {
    fetch(this.state.url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          article: data,
          loading: false
        });
        // increase article count
        this.updateArticleViews('/api/articles/increase_article_count', {
          id: data[0]._id
        })
          .then(() => {})
          .catch(err => {
            throw err;
          });
      })
      .catch(() => {
        this.setState({
          article: [{ title: '404', fulltext: 'Článok sme nenašli :(' }],
          loading: false
        });
      });
  }

  updateArticleViews = (url, data) => {
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
      .catch(err => {
        throw err;
      });
  };

  render() {
    let header = '';
    let introText = '';
    let fullText = '';
    if (this.state.article.length > 0) {
      header = this.state.article[0].title;
      introText = () => {
        return { __html: this.state.article[0].introtext };
      };
      fullText = () => {
        return { __html: this.state.article[0].fulltext };
      };
    }
    return (
      <div id="Article">
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <div>
            <Meta
              title={this.state.article[0].title}
              url={this.state.og_url}
              metadesc={
                this.state.article[0].ogdesc || this.state.article[0].metadesc
              }
              img={this.state.article[0].ogimg || ''}
            />
            <DocumentTitle title={`${this.state.article[0].title}${Constants.WebTitleSuffix}`} />
            <h2>{header}</h2>
            <div dangerouslySetInnerHTML={introText()} />
            <div dangerouslySetInnerHTML={fullText()} />
          </div>
        )}
      </div>
    );
  }
}

export default Article;
