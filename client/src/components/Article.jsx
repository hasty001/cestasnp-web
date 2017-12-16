import React, { Component } from 'react'

class Article extends Component {
  constructor (props) {
    super(props)
    this.state = {
      url: 'http://localhost:3000/api/articles/article/' + this.props.match.params.articleId,
      loading: true,
      article: []
    }
  }

  componentDidMount () {
    fetch(this.state.url)
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({
          article: data,
          loading: false
        })
      })
      .catch((err) => {
        console.log('error', err)
        this.setState({
          article: [{ title: '404', fulltext: 'Článok sme nenašli :(' }],
          loading: false
        })
      })
  }

  render () {
    console.log('state', this.state)
    console.log(this.props.match.params)
    let header = ''
    let text = ''
    if (this.state.article.length > 0) {
      header = this.state.article[0].title
      text = () => { return { __html: this.state.article[0].fulltext } }
    }
    return (
      <div>
        {this.state.loading &&
          <div>
            <i className='fas fa-spinner fa-spin fa-2x' />
            <span className='sr-only'>Loading...</span>
          </div>}
        {!this.state.loading &&
          <div>
            <h2>{header}</h2>
            <div dangerouslySetInnerHTML={text()} />
            {console.log('article', this.state.article)}
          </div>}
      </div>
    )
  }
}

export default Article
