import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Loader from './reusable/Loader';
import PaginationAdvanced from './PaginationAdvanced';
import ArticleFilter from './ArticleFilter';
import { A, navigate } from './reusable/Navigate';
import DocumentTitle from 'react-document-title';
import * as Constants from './Constants';
import ButtonReadMore from './reusable/ButtonReadMore';
import { htmlClean, getArticleImage, getArticleCategoryText } from '../helpers/helpers';

const categoryTags = Constants.ArticleCategories.map(category => {
  return category.tag;
});

class Articles extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      activePage: parseInt(this.props.match.params.page, 10) || 1,
      totalArticles: 12,
      articles: [],
      filter: this.props.match.params.category,
      categories: Constants.ArticleCategories.map(category => {
        return category;
      })
    };
    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(newProps){
    const newActivePage = parseInt(newProps.match.params.page, 10) || 1;
    const newFilter =  newProps.match.params.category;

    if (this.state.activePage != newActivePage
      || this.state.filter != newFilter) {
      this.setState({ activePage: newActivePage, filter: newFilter,
        categories: Constants.ArticleCategories.map(category => {
          return category;
        }), articles: [], loading: true
        }, this.fetchData);
    }
  }

  fetchData() {
    const { filter, categories } = this.state;

    if (!filter) {
      fetch('/api/articles/')
        .then(resp => resp.json())
        .then(count => {
          const pages = Math.round(count / 8);
          this.setState({ totalArticles: pages });
        })
        .catch(err => {
          throw err;
        });

      const url = `/api/articles/${this.state.activePage}`;
      fetch(url)
        .then(resp => resp.json())
        .then(data => {
          this.setState({
            articles: data,
            loading: false
          });
        })
        .catch(err => {
          throw err;
        });
    } else {
      // get array of filter indeces
      const filterIndeces = [categoryTags.indexOf(filter)];
      // remove filtered categories
      filterIndeces.forEach(i => {
        categories.splice(i, 1);
      });
      // update state
      this.setState({
        categories
      });

      fetch(`/api/articles/category/${filter}`)
        .then(resp => resp.json())
        .then(count => {
          const pages = Math.round(count / 8);
          this.setState({ totalArticles: pages });
        })
        .catch(err => {
          throw err;
        });
      const url = `/api/articles/category/${filter}/${this.state.activePage}`;
      fetch(url)
        .then(resp => resp.json())
        .then(data => {
          this.setState({
            articles: data,
            loading: false
          });
        })
        .catch(err => {
          throw err;
        });
    }
  }

  handlePageSelect(eventKey) {
    if (!this.state.filter) {
      navigate(`/pred/articles/${eventKey}`);
    } else {
      navigate(`/pred/filteredarticles/${this.state.filter}/${eventKey}`);
    }
  }

  handleCategorySelect(e) {
    const { tag } = this.state.categories[e];
    
    if (tag === 'vsetky') {
      navigate('/pred/articles/1');
    } else {
      navigate(`/pred/filteredarticles/${tag}/1`);
    }
  }

  render() {
    const filterText = this.state.filter ? getArticleCategoryText(this.state.filter) : '';

    return (
      <div id="Articles">
        <DocumentTitle title={`Články${filterText ? `: ${filterText}` : ""}${Constants.WebTitleSuffix}`} />
        <div>
          <ArticleFilter
            articleCategories={this.state.categories}
            handleCategorySelect={this.handleCategorySelect}
            title={filterText || "Vyber si kategóriu"}
          />       
          <PaginationAdvanced className="top"
            totalArticles={this.state.totalArticles}
            activePage={this.state.activePage}
            handlePageSelect={this.handlePageSelect}
          />
          {/* loading articles */}
          {this.state.loading && <Loader />}
          {/* in case we have articles */}
          {!this.state.loading &&
            this.state.articles.length > 0 &&
            this.state.articles.map((article, i) => {
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
                    <ButtonReadMore href={`/pred/articles/article/${article.sql_article_id}`} />
                  </div>
                </div>
              );
            })}
          {/* in case of 0 articles found */}
          {!this.state.loading && this.state.articles.length === 0 && (
            <div className="no-article-div">
              <p>Bohužiaľ vo zvolenej kategórii nie je žiaden článok.</p>
            </div>
          )}
        </div>
        <PaginationAdvanced
          totalArticles={this.state.totalArticles}
          activePage={this.state.activePage}
          handlePageSelect={this.handlePageSelect}
        />
      </div>
    );
  }
}

export default Articles;
