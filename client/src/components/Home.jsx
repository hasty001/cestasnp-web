import React, { Component } from 'react';
import Loader from '../components/reusable/Loader';

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articles: [],
      loading: true
    };
  }

  componentDidMount() {
    fetch('/api/articles/for/home')
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

  render() {
    return (
      <div id="Home">
        {this.state.loading && <Loader />}
        {!this.state.loading && (
          <div>
            {this.state.articles.map((article, i) => {
              let introtext = () => {
                return { __html: article.introtext };
              };
              return (
                <div id={'home' + (i + 1)} key={i}>
                  <div className="article-div">
                    <a
                      className="no-decoration"
                      href={'/pred/articles/article/' + article.sql_article_id}
                    >
                      <h2 className="no-decoration">{article.title}</h2>
                    </a>
                    <div className={'home' + (i + 1)} dangerouslySetInnerHTML={introtext()} />
                    <a href={'/pred/articles/article/' + article.sql_article_id}>Čítaj viac...</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default Home;
