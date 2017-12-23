import React, { Component } from 'react'
import Loader from './Loader'
import PaginationAdvanced from './PaginationAdvanced'
import ArticleFilter from './ArticleFilter'

const articleCategories = [
  { tag: 'vsetky', text: 'Všetky' },
  { tag: 'faqs', text: 'FAQs' },
  { tag: 'novinky', text: 'Novinky' },
  { tag: 'ostatne', text: 'Ostatné' },
  { tag: 'vybavenie', text: 'Vybavenie' },
  { tag: 'odkazy', text: 'Odkazy' },
  { tag: 'mapy', text: 'Mapy' },
  { tag: 'dolezite_miesta', text: 'Dôležité miesta' },
  { tag: 'stravovanie', text: 'Stravovanie' },
  { tag: 'cestopisy', text: 'Cestopisy' },
  { tag: 'spravy_z_terenu', text: 'Správy z terénu' },
  { tag: 'zaujimavosti', text: 'Zaujímavosti' },
  { tag: 'akcie', text: 'Akcie' },
  { tag: 'obmedzenia', text: 'Obmedzenia' },
  { tag: 'oznamy', text: 'Oznamy' },
  { tag: 'cesta-hrdinov-snp', text: 'Cesta hrdinov SNP' },
  { tag: 'akcie-snp', text: 'Akcie Cesta hrdinov SNP' },
  { tag: 'akcie-ostatne', text: 'Ostatné akcie' },
  { tag: 'oblecenie', text: 'Oblečenie' },
  { tag: 'obuv', text: 'Obuv' },
  { tag: 'o-cestesnpsk', text: 'O CesteSNP.sk' },
  { tag: 'cela-trasa', text: 'Celá trasa' },
  { tag: 'vku', text: 'VKU' },
  { tag: 'shocart', text: 'Shocart' },
  { tag: 'gps', text: 'GPS' },
  { tag: 'batoh', text: 'Batoh' },
  { tag: 'dukla-cergov-sarisska-vrchovina', text: 'Dukla, Čergov, Šarišská vrchovina' },
  { tag: 'cierna-hora-volovske-vrchy', text: 'Čierna hora, Volovské vrchy' },
  { tag: 'nizke-tatry', text: 'Nízke Tatry' },
  { tag: 'velka-fatra-kremnicke-vrchy', text: 'Veľká Fatra, Kremnické vrchy' },
  { tag: 'strazovske-vrchy-biele-karpaty', text: 'Strážovske vrchy, Biele Karpatu' },
  { tag: 'male-karpaty', text: 'Malé Karpaty' },
  { tag: 'recepty', text: 'Recepty' },
  { tag: 'o-strave', text: 'Stravovanie' },
  { tag: 'nezaradene', text: 'Nezaradené' },
  { tag: 'spravy-z-terenu', text: 'Správy z terénu' },
  { tag: 'live-sledovanie-clanky', text: 'Články o LIVE Sledovaní' },
  { tag: 'rozhovory', text: 'Rozhovory' }
]

class Articles extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      activePage: parseInt(this.props.match.params.page) || 1,
      totalArticles: 12,
      articles: [],
      activeFilter: articleCategories.findIndex(category => (category.tag === this.props.match.params.category)) || 0,
      filter: this.props.match.params.category || ''
    }
    this.handlePageSelect = this.handlePageSelect.bind(this)
    this.handleCategorySelect = this.handleCategorySelect.bind(this)
  }

  componentDidMount () {
    if (this.state.filter === '') {
      fetch('/api/articles/')
        .then((resp) => resp.json())
        .then((count) => {
          let pages = Math.round(count / 8)
          this.setState({ totalArticles: pages })
        })
        .catch((err) => {
          console.log('error: ', err)
        })

      let url = '/api/articles/' + this.props.match.params.page
      fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
          this.setState({
            articles: data,
            loading: false
          })
        })
        .catch((err) => {
          console.log('error: ', err)
        })
    } else {
      fetch('/api/articles/category/' + this.state.filter)
        .then((resp) => resp.json())
        .then((count) => {
          let pages = Math.round(count / 8)
          this.setState({ totalArticles: pages })
        })
        .catch((err) => {
          console.log('error: ', err)
        })

      let url = '/api/articles/category/' + this.state.filter + '/' + this.props.match.params.page
      fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
          this.setState({
            articles: data,
            loading: false
          })
        })
        .catch((err) => {
          console.log('error: ', err)
        })
    }
  }

  handlePageSelect (eventKey) {
    if (this.state.filter === '') {
      location.assign('/pred/articles/' + eventKey)
    } else {
      location.assign('/pred/filteredarticles/' + this.state.filter + '/' + eventKey)
    }
  }

  handleCategorySelect (e) {
    if (articleCategories[e].tag === 'vsetky') {
      location.assign('/pred/articles/1')
    } else {
      console.log('e', e)
      this.setState({
        filter: articleCategories[e].tag,
        activeFilter: e,
        loading: true
      })
      location.assign('/pred/filteredarticles/' + articleCategories[e].tag + '/1')
    }
  }

  render () {
    return (
      <div className='screen-container'>
        {this.state.loading &&
          <div>
            <ArticleFilter
              articleCategories={articleCategories}
              activeFilter={this.state.activeFilter}
              handleCategorySelect={this.handleCategorySelect} />
            <Loader />
          </div>}
        {!this.state.loading &&
          <div>
            <ArticleFilter
              articleCategories={articleCategories}
              activeFilter={this.state.activeFilter}
              handleCategorySelect={this.handleCategorySelect} />
            {this.state.articles.map((article, i) => {
              console.log(article)
              let introtext = () => { return {__html: article.introtext} }
              return (
                <div key={i}>
                  <h2>{article.title}</h2>
                  <div dangerouslySetInnerHTML={introtext()} />
                  <a href={'/pred/articles/article/' + article.sql_article_id}>Čítaj viac...</a>
                </div>
              )
            })}
            <PaginationAdvanced
              totalArticles={this.state.totalArticles}
              activePage={this.state.activePage}
              handlePageSelect={this.handlePageSelect} />
          </div>}
      </div>
    )
  }
}

export default Articles
