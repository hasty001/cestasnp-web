import React, { Component } from 'react'
import Loader from './Loader'
import PaginationAdvanced from './PaginationAdvanced'

class Articles extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      activePage: parseInt(this.props.match.params.page) || 1,
      totalArticles: 12,
      articles: []
    }

    this.handlePageSelect = this.handlePageSelect.bind(this)
  }

  componentDidMount () {
    fetch('http://localhost:3000/api/articles/')
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data)
      })
      .catch((err) => {
        console.log(err)
      })
    let url = 'http://localhost:3000/api/articles/' + this.props.match.params.page
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({
          articles: data,
          loading: false
        })
      })
  }

  handlePageSelect (eventKey) {
    location.assign('http://localhost:3000/pred/articles/' + eventKey)
  }

  render () {
    return (
      <div className='screen-container'>
        {this.state.loading &&
          <Loader />}
        {!this.state.loading &&
          <div>
            <PaginationAdvanced
              totalArticles={this.state.totalArticles}
              activePage={this.state.activePage} 
              handlePageSelect={this.handlePageSelect} />
            {this.state.articles.map((article, i) => {
              let introtext = () => { return {__html: article.introtext} }
              return (
                <div key={i}>
                  <h2>{article.title}</h2>
                  <div dangerouslySetInnerHTML={introtext()} />
                  <a href={'http://localhost:3000/pred/articles/article/' + article.sql_article_id}>Čítaj viac...</a>
                </div>
              )
            })}
          </div>}
      </div>
    )
  }
}

export default Articles
