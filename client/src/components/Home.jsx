import React, { Component } from 'react';

import { NavItem } from 'react-bootstrap';
import history from '../helpers/history';
import ActiveLight from './ActiveLight';

import Loader from './reusable/Loader';

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
              <NavItem
                className="no-decoration"
                onClick={() => {
                  history.push(`/na/ceste/light`);
                }}
              >
                <h3 className="no-decoration">LIVE</h3>
              </NavItem>     
              
              <ActiveLight/>
            </div>

            {this.state.articles.map((article, i) => {
              const introtext = () => {
                return { __html: article.introtext };
              };
              return (
                <div id={`home${i + 1}`} key={i}>
                  <div className="article-div">
                    <NavItem
                      className="no-decoration"
                      onClick={() => {
                        history.push(
                          `/pred/articles/article/${article.sql_article_id}`
                        );
                      }}
                    >
                      <h2 className="no-decoration">{article.title}</h2>
                    </NavItem>
                    <div
                      className={`home${i + 1}`}
                      dangerouslySetInnerHTML={introtext()}
                    />
                    <NavItem
                      onClick={() => {
                        history.push(
                          `/pred/articles/article/${article.sql_article_id}`
                        );
                      }}
                    >
                      Čítaj viac...
                    </NavItem>
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
