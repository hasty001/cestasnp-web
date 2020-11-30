import React, { useEffect, useState } from 'react';
import ActiveLight from './ActiveLight';
import { fetchJson } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import { A } from './reusable/Navigate';

const Home = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    fetchJson('/api/articles/for/home')
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  }, []);

  const month = (new Date()).getMonth + 1;

  return (
    <div id="Home">
      <div className="active-travellers-box">            
        <A
          href={`/na/ceste/light`}
          className="no-decoration"
        >
          <h3 className="no-decoration">LIVE sledovanie</h3>
        </A>     
        
        <ActiveLight box />
      </div>

      <DivWithLoader className="home-articles" loading={loading}>
        Articles
      </DivWithLoader>

      <div className="home banner">
        { (month >= 5 && mont <= 10)
          ? <A href="/na/ceste">LIVE sledovanie</A>
          : <A href="/pred/pois">Dôležité miesta</A>}
      </div>
    </div>
  );
  /*return (
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
  }*/
}

export default Home;
