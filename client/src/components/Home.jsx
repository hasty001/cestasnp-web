import React, { Component } from 'react';
import Loader from '../reusable_components/Loader';

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
            <p>
              Hej. Na CesteSNP.sk pracujeme dňom a nocou, teda pokiaľ nie sme akurát na horách, v
              práci, v knižnici, v divadle, u frajerky, či sa hráme s našimi deťmi...
            </p>
            <p>
              Sekcia <a href="/pred/articles/1">Pred Cestou</a> je prvá kde môžeš vidieť výsledky
              našej práce! Táto sekcia má hlavný cieľ zjednodušiť plánovanie tvojej Cesty hrdinov
              SNP. Pozri sa na to a daj nám vedieť ako ti to pomohlo s plánovaním. Ak chceš sledovať
              náš pokrok môžeš sem samozrejme pravidelne chodiť alebo sledovať naše novinky na{' '}
              <a target="_blank" href="https://www.facebook.com/CestaSNPsk-185536644838/">
                Facebooku
              </a>.
            </p>
            <p>
              Taktiež sa k nám môžeš pridať a pomocť s vývojom. Používame moderné technológie ako
              React, JavaScript ES6, Node.js a NoSQL databázu. To všetko beží na Heroku cloude a tak
              máš veľkú šancu sa naučiť čosi nové. Ak to ale už všetko poznáš, vôbec neváhaj sa
              ozvať a naopak naučiť nás ako postaviť CestaSNP.sk na nohy rýchlo a efektívne. Kontakt
              na nás:{' '}
              <a target="_blank" href="mailto:info@cestasnp.sk">
                info@cestasnp.sk
              </a>.
            </p>
            <p>
              CestuSNP.sk nájdeš na{' '}
              <a target="_blank" href="https://github.com/hasty001/cestasnp-web">
                Githube
              </a>.
            </p>

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
