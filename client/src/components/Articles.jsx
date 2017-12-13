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
      <div>
        {this.state.loading &&
          <div>
            <i className='fas fa-spinner fa-spin fa-2x' />
            <span className='sr-only'>Loading...</span>
          </div>}
        {!this.state.loading &&
          <div>
            {this.state.articles.map((article, i) => {
              return (
                <div key={i}>
                  <h2>{article.title}</h2>
                  {/* <div>{article.introtext}</div>
                  {article.fulltext} */}
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
