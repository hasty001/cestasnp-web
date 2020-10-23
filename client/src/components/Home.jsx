import React, { Component } from 'react';
import ActiveLight from './ActiveLight';

import Loader from './reusable/Loader';
import { A } from './reusable/Navigate';

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
            <div className="active-travellers-box">            
              <A
                href={`/na/ceste/light`}
                className="no-decoration"
              >
                <h3 className="no-decoration">LIVE sledovanie</h3>
              </A>     
              
              <ActiveLight box />
            </div>

            {this.state.articles.map((article, i) => {
              const introtext = () => {
                return { __html: article.introtext };
              };
              return (
                <div id={`home${i + 1}`} key={i}>
                  <div className="article-div">
                    <A
                      className="no-decoration"
                      href={`/pred/articles/article/${article.sql_article_id}`}
                    >
                      <h2 className="no-decoration">{article.title}</h2>
                    </A>
                    <div
                      className={`home${i + 1}`}
                      dangerouslySetInnerHTML={introtext()}
                    />
                    <A href={`/pred/articles/article/${article.sql_article_id}`} >
                      Čítaj viac...
                    </A>
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
