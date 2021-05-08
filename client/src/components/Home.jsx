import React, { useContext, useEffect, useState } from 'react';
import ActiveLight from './ActiveLight';
import { fetchJson } from '../helpers/fetchUtils';
import DivWithLoader from './reusable/DivWithLoader';
import { A } from './reusable/Navigate';
import ButtonReadMore from './reusable/ButtonReadMore';
import { LocalSettingsContext } from './LocalSettingsContext';
import { htmlClean, getArticleImage } from '../helpers/helpers';
import Close from './reusable/Close';
import { useStateWithLocalStorage } from '../helpers/reactUtils';

const Home = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShortIntro, setShowShortIntro] = useStateWithLocalStorage('HomeShortIntroShow', true);

  useEffect(() => {
    setLoading(true);
    
    fetchJson('/api/articles/for/home?first=60')
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error(err);
      });
  }, []);

  const settingsData = useContext(LocalSettingsContext);

  const month = (new Date()).getMonth + 1;

  return (
    <div id="Home">
      {!!showShortIntro && <div className="home-intro-mobile">
        <Close onClose={() => setShowShortIntro(false)}/>
        <A href="/pred/articles/article/60">Cesta hrdinov SNP je 770 km dlhá pešia trasa na Slovensku a zážitok na celý život. <strong>Čítaj viac</strong>.</A>
      </div>}
      <div className="home-articles-and-box">
        <div className="active-travellers-box">            
          <A
            href={settingsData.activeLink.href}
            className="no-decoration"
          >
            <h3 className="no-decoration">LIVE sledovanie</h3>
          </A>     
          
          <ActiveLight box />
        </div>

        <DivWithLoader className="home-articles" loading={loading}>
          <div className="home-intro">
            <h1>Cesta hrdinov SNP</h1>
            <div className="home-intro-text">Najdlhšia pešia trasa na Slovensku je zážitok na celý život.
               <br/>Celková dĺžka je cca 770 km a v priemere sa  zvláda za 25 - 28 dní.</div>
            <ButtonReadMore white href="/pred/articles/article/60"/>
          </div>
        
          {articles && articles.map((article, i) => { 
            const imgUrl = getArticleImage(article.introtext);

            return (
                  <div id={`home${i + 1}`} key={i}>
                    <div className="article-div">
                      {!!imgUrl && <div className="article-image before" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                      
                      <A
                        className="no-decoration"
                        href={`/pred/articles/article/${article.sql_article_id}`}
                      >
                        <h2 className="no-decoration">{article.title}</h2>
                      </A>

                      {!!imgUrl && <div className="article-image" style={{ backgroundImage: `url("${imgUrl}")` }}/>}
                      <div className="article-text-col">
                        <div className="article-text" dangerouslySetInnerHTML={{ __html: htmlClean(article.introtext) }}></div>
                      </div>
                      <ButtonReadMore className={!!imgUrl ? "next-to-image" : ""} href={`/pred/articles/article/${article.sql_article_id}`} />
                    </div>
                  </div>);
              })}
        </DivWithLoader>
      </div>

      <div className="home banner">
        { (month >= 5 && mont <= 10)
          ? <A href={settingsData.activeLink.href}>LIVE sledovanie</A>
          : <A href="/pred/pois">Mapa</A>}
      </div>
    </div>
  );
}

export default Home;
