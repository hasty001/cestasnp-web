import React, { Component } from 'react'
import Loader from './Loader'

class Articles extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      articles: []
    }
  }

  componentDidMount () {
    fetch('http://localhost:3000/api/articles')
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({
          articles: data,
          loading: false
        })
      })
  }

  render () {
    return (
      <div className='screen-container'>
        {this.state.loading &&
          <Loader />}
        {!this.state.loading &&
          <div>
            {this.state.articles.map((article, i) => {
              let introtext = () => { return {__html: article.introtext} }
              return (
                <div key={i}>
                  <h2>{article.title}</h2>
                  <div dangerouslySetInnerHTML={introtext()} />
                  <a href={'http://localhost:3000/pred/articles/' + article.sql_article_id}>Čítaj viac...</a>
                </div>
              )
            })}
          </div>}
      </div>
    )
  }
}

export default Articles
