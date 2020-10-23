import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Loader from './reusable/Loader';
import PaginationAdvanced from './PaginationAdvanced';
import ArticleFilter from './ArticleFilter';
import { A, navigate } from './reusable/Navigate';
import DocumentTitle from 'react-document-title';
import * as Constants from './Constants';

const articleCategories = [
  { tag: 'vsetky', text: 'Všetky' },
  // { tag: 'faqs', text: 'FAQs' },
  // { tag: 'novinky', text: 'Novinky' },
  { tag: 'ostatne', text: 'Ostatné' },
  { tag: 'vybavenie', text: 'Vybavenie' },
  { tag: 'odkazy', text: 'Odkazy' },
  { tag: 'mapy', text: 'Mapy' },
  { tag: 'dolezite_miesta', text: 'Dôležité miesta' },
  { tag: 'stravovanie', text: 'Stravovanie' },
  { tag: 'cestopisy', text: 'Cestopisy' },
  // { tag: 'spravy_z_terenu', text: 'Správy z terénu' },
  { tag: 'zaujimavosti', text: 'Zaujímavosti' },
  // { tag: 'akcie', text: 'Akcie' },
  { tag: 'obmedzenia', text: 'Obmedzenia' },
  // { tag: 'oznamy', text: 'Oznamy' },
  { tag: 'cesta-hrdinov-snp', text: 'Cesta hrdinov SNP' },
  { tag: 'akcie-snp', text: 'Akcie Cesta hrdinov SNP' },
  // { tag: 'akcie-ostatne', text: 'Ostatné akcie' },
  { tag: 'oblecenie', text: 'Oblečenie' },
  { tag: 'obuv', text: 'Obuv' },
  { tag: 'o-cestesnpsk', text: 'O CesteSNP.sk' },
  { tag: 'cela-trasa', text: 'Celá trasa' },
  { tag: 'vku', text: 'VKU' },
  { tag: 'shocart', text: 'Shocart' },
  { tag: 'gps', text: 'GPS' },
  { tag: 'batoh', text: 'Batoh' },
  {
    tag: 'dukla-cergov-sarisska-vrchovina',
    text: 'Dukla, Čergov, Šarišská vrchovina'
  },
  { tag: 'cierna-hora-volovske-vrchy', text: 'Čierna hora, Volovské vrchy' },
  { tag: 'nizke-tatry', text: 'Nízke Tatry' },
  { tag: 'velka-fatra-kremnicke-vrchy', text: 'Veľká Fatra, Kremnické vrchy' },
  {
    tag: 'strazovske-vrchy-biele-karpaty',
    text: 'Strážovske vrchy, Biele Karpatu'
  },
  { tag: 'male-karpaty', text: 'Malé Karpaty' },
  { tag: 'recepty', text: 'Recepty' },
  { tag: 'o-strave', text: 'O strave' },
  // { tag: 'nezaradene', text: 'Nezaradené' },
  // { tag: 'spravy-z-terenu', text: 'Správy z terénu' },
  { tag: 'live-sledovanie-clanky', text: 'Články o LIVE Sledovaní' },
  { tag: 'rozhovory', text: 'Rozhovory' }
];

const categoryTags = articleCategories.map(category => {
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
      filters: this.props.match.params.category
        ? this.props.match.params.category.split('+')
        : [],
      categories: articleCategories.map(category => {
        return category;
      })
    };
    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(newProps){
    const newActivePage = parseInt(newProps.match.params.page, 10) || 1;
    const newFilter =  newProps.match.params.category
      ? newProps.match.params.category.split('+')
      : [];

    if (this.state.activePage != newActivePage
      || this.state.filters.join("+") != newFilter.join("+") ) {
      this.setState({ activePage: newActivePage, filters: newFilter,
        categories: articleCategories.map(category => {
          return category;
        }), articles: [], loading: true
        }, this.fetchData);
    }
  }

  fetchData() {
    const { filters, categories } = this.state;

    if (filters.length === 0) {
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
      const filterIndeces = filters.map(filter => {
        return categoryTags.indexOf(filter);
      });
      // sort the indeces from higher to lower
      filterIndeces.sort((a, b) => {
        return b > a ? 1 : b < a ? -1 : 0;
      });
      // remove filtered categories
      filterIndeces.forEach(i => {
        categories.splice(i, 1);
      });
      // update state
      this.setState({
        categories
      });

      const filterUrl = filters.join('+');

      fetch(`/api/articles/category/${filterUrl}`)
        .then(resp => resp.json())
        .then(count => {
          const pages = Math.round(count / 8);
          this.setState({ totalArticles: pages });
        })
        .catch(err => {
          throw err;
        });
      const url = `/api/articles/category/${filterUrl}/${this.state.activePage}`;
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
    const filter = this.state.filters.join('+');
    if (this.state.filters.length === 0) {
      navigate(`/pred/articles/${eventKey}`);
    } else {
      navigate(`/pred/filteredarticles/${filter}/${eventKey}`);
    }
  }

  handleCategorySelect(e) {
    const { tag } = this.state.categories[e];
    const { filters } = this.state;
    
    if (tag === 'vsetky') {
      navigate('/pred/articles/1');
    } else {
      navigate(`/pred/filteredarticles/${filters.concat([tag]).join('+')}/1`);
    }
  }

  handleFilterClick(e) {
    const filter = e.target.value;
    const { filters } = this.state;

    if (filters.length > 1) {
      const newFilters = filters.map(f => f);
      newFilters.splice(filters.indexOf(filter), 1);
      navigate(`/pred/filteredarticles/${newFilters.join('+')}/1`);
    } else {
      navigate('/pred/articles/1');
    }
  }

  render() {
    return (
      <div id="Articles">
        <DocumentTitle title={`Články${Constants.WebTitleSuffix}`} />
        <div>
          <ArticleFilter
            articleCategories={this.state.categories}
            handleCategorySelect={this.handleCategorySelect}
          />
          <div style={{ display: 'inline-block' }}>
            {this.state.filters.map((filter, i) => {
              const filterIndex = categoryTags.indexOf(filter);
              const filterText = articleCategories[filterIndex].text;
              return (
                <Button
                  key={i}
                  type="button"
                  value={filter}
                  onClick={this.handleFilterClick}
                >
                  {filterText}
                </Button>
              );
            })}
          </div>
          {window.innerWidth > 768 && (
            <div style={{ width: '100%', minHeight: '34px' }}>
              <PaginationAdvanced
                totalArticles={this.state.totalArticles}
                activePage={this.state.activePage}
                handlePageSelect={this.handlePageSelect}
              />
            </div>
          )}
          {/* loading articles */}
          {this.state.loading && <Loader />}
          {/* in case we have articles */}
          {!this.state.loading &&
            this.state.articles.length > 0 &&
            this.state.articles.map((article, i) => {
              const introtext = () => {
                return { __html: article.introtext };
              };
              return (
                <div key={i} className="article-div">
                  <A
                    className="no-decoration"
                    href={`/pred/articles/article/${article.sql_article_id}`}
                  >
                    <h2 className="no-decoration">{article.title}</h2>
                  </A>
                  <div dangerouslySetInnerHTML={introtext()} />
                  <A href={`/pred/articles/article/${article.sql_article_id}`} >
                    Čítaj viac...
                  </A>
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
        <div style={{ width: '100%', minHeight: '34px' }}>
          <PaginationAdvanced
            totalArticles={this.state.totalArticles}
            activePage={this.state.activePage}
            handlePageSelect={this.handlePageSelect}
          />
        </div>
      </div>
    );
  }
}

export default Articles;
