import React, { Component } from 'react'
import Loader from './Loader'

class Article extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '/api/articles/article/' + this.props.match.params.articleId,
      loading: true,
      article: []
    }
  }

  componentDidMount() {
    fetch(this.state.url)
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({
          article: data,
          loading: false
        })
      })
      // .then((data) => {
      //   fetch(url, {
      //     method:'POST',

      //   })
      // })
      .catch((err) => {
        console.log('error', err)
        this.setState({
          article: [{ title: '404', fulltext: 'Článok sme nenašli :(' }],
          loading: false
        })
      })
  }

  render() {
    let header = ''
    let introText = ''
    let fullText = ''
    if (this.state.article.length > 0) {
      header = this.state.article[0].title
      introText = () => { return { __html: this.state.article[0].introtext } }
      fullText = () => { return { __html: this.state.article[0].fulltext } }
    }
    return (
      <div className='screen-container'>
        {this.state.loading &&
          <Loader />}
        {!this.state.loading &&
          <div>
            <h2>{header}</h2>
            <div dangerouslySetInnerHTML={introText()} />
            <div dangerouslySetInnerHTML={fullText()} />
          </div>}
      </div>
    )
  }
}

export default Article
