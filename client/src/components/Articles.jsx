import React, { Component } from 'react'

class Articles extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      articles: []
    }
  }

  componentDidMount () {
    fetch('https://cestasnp-web.herokuapp.com/api/articles')
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
          <div>
            <i className='fas fa-spinner fa-spin fa-2x' />
            <span className='sr-only'>Loading...</span>
          </div>}
        {!this.state.loading &&
          <div>
            {this.state.articles.map((article, i) => {
              let introtext = () => { return {__html: article.introtext} }
              return (
                <div key={i}>
                  <h2>{article.title}</h2>
                  <div dangerouslySetInnerHTML={introtext()} />
                  <a href={'https://cestasnp-web.herokuapp.com/pred/articles/' + article.sql_article_id}>Čítaj viac...</a>
                  {console.log(article)}
                </div>
              )
            })}
          </div>}
      </div>
    )
  }
}

export default Articles
