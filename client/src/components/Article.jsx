import React, { Component } from 'react'
import Loader from './Loader'

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
    let header = ''
    let text = ''
    if (this.state.article.length > 0) {
      header = this.state.article[0].title
      text = () => { return { __html: this.state.article[0].fulltext } }
    }
    return (
      <div className='screen-container'>
        {this.state.loading &&
          <Loader />}
        {!this.state.loading &&
          <div>
            <h2>{header}</h2>
            <div dangerouslySetInnerHTML={text()} />
          </div>}
      </div>
    )
  }
}

export default Article
