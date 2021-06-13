import React, { useContext, useEffect, useState } from 'react';
import * as Texts from './Texts';
import * as Constants from './Constants';
import { fetchJson, fetchPostJson } from '../helpers/fetchUtils';
import PageWithLoader from './reusable/PageWithLoader';
import { dateTimeToStr, fixImageUrl, htmlClean, htmlSimpleSanitize, sortByDate } from '../helpers/helpers';
import { Howl } from 'howler';
import HTMLFlipBook from 'react-pageflip';

const Book = (props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [traveller, setTraveller] = useState();
  const [pages, setPages] = useState([]);
  const [opacity, setOpacity] = useState(0);

  const travellerId = props.match.params.traveller;

  const sortMessages = (msgs, order) => sortByDate(msgs, a => a.date || a.pub_date, order);

  const maxLineLength = 32;
  const maxLines = 17;
  const maxLinesWithImage = 10;
  const maxLinesWithImagePortrait = 6;

  const splitPages = (text, firstMaxLines, maxLines) => {
    const result = [];
    var lines = [];

    var part = '';
    var lastSpace = -1;

    for (var i = 0; i < text.length; i++) {
      if (text[i] == ' ' || text[i] == '\n') {
        lastSpace = part.length;
      }

      part += text[i];
      if (part.length > maxLineLength  || text[i] == '\n') {
        if (lastSpace >= 0) {
          lines.push(part.substr(0, lastSpace));
          if (lines.length == 1 && lines[0].trim() == "") {
            lines.pop(); // ignore empty line on page start
          }

          part = part.substr(lastSpace + 1);
          lastSpace = -1;
        } else {
          lines.push(part.substr(0, part.length - 1));
          lastSpace = -1;
          part = part.substr(part.length - 1, 1);
        }

        if (lines.length == (result.length == 0 ? firstMaxLines : maxLines)) {
          result.push(lines.join("<br/>"));
          lines = [];
        }
      }
    }

    if (part.length > 0 && part.trim().length > 0) {
      lines.push(part);
    }

    if (lines.length > 0) {
      result.push(lines.join("<br/>"));
    }

    return result;
  }

  const fetchData = () => {
    setLoading(true);
    setError('');

    fetchJson(`/api/traveller/details/${travellerId}`)
    .then((data) => {
      if (data.length == 0) {
        setError("Momentálne nie je na ceste ani cestu neplánuje.");
        return [[], []];
      }

      setTraveller(data[0]);
      const commentData = {
        articleId: data[0].articleID,
        travellerId: data[0]._id
      };

      return Promise.all([
        fetchJson(`/api/traveller/messages/${travellerId}`), 
        fetchPostJson('/api/traveller/comments', commentData)]);
    })
    .then(([msgData, comments]) => {
      const msgs = msgData.map(m => m).concat(comments.map(c => Object.assign({ isComment: true }, c)));

      sortMessages(msgs, true); 
      setOpacity(0);

      const newPages = [];

      var i = 0;
      while (i < msgs.length) {
        const m = msgs[i];
        var img = "";
        const imgSrc = fixImageUrl(m.img, "c_limit,f_auto,w_300,h_300");
        var portrait = false;

        if (imgSrc) {
          portrait = m.img.width && m.img.height && m.img.width <= m.img.height;
          img = `<img class="${portrait ? "portrait" : ""}" src="${imgSrc}"/>`;
        }

        var text = "";
        do {
          const msg = msgs[i];
          text += dateTimeToStr(msg.pub_date || msg.date) + (msg.isComment ? (" " + msg.name) : "") 
            + "\n" + htmlClean(msg.text || msg.comment) + "\n\n";
          i++;
        } while (i < msgs.length && msgs[i].isComment);

        const splits = splitPages(text, img ? (portrait ? maxLinesWithImagePortrait : maxLinesWithImage) : maxLines, maxLines);

        splits.forEach((s, i) => {
          const page = <div className="content" dangerouslySetInnerHTML={{ __html: (i == 0 ? img : "") + s }}/>

          newPages.push(page);
        });
      }
  
      setPages(newPages);

      setTimeout(() => setOpacity(1), 1000);
    })
    .catch(err => {
      console.error(err);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
  }, [props.match.params.traveller]);

  var sound = null;

  const stateChanged = (e) => {
    if (e.data == 'flipping') {
      if (!sound) {    
        sound = new Howl({
          src: ['/media/pageflip.wav'],
          volume: 0.1,
          sprite: {
            flip: [400, 1200]
          },
        });
      }

      sound.stop();
      if (e.object.pages.currentPageIndex > 0) {
        sound.play('flip');
      }
    }
  };

  return (
    <PageWithLoader pageId="Book" pageTitle={traveller ? (traveller.meno + Constants.WebTitleSuffix) : null}
      loading={loading} error={error}>

      <HTMLFlipBook className="book" width={400} height={600} showCover={true} style={{opacity: opacity}} onChangeState={stateChanged}>
          <div className="book-page cover" data-density="hard">
            <div className="title">{traveller ? traveller.meno : ""}</div>
          </div>
          <div className="book-page cover-back" data-density="hard"/>

          <div className="book-page page">
            <div className="intro"
                dangerouslySetInnerHTML={{ __html: htmlSimpleSanitize(traveller ? traveller.text : "") }} />
          </div>
          <div className="book-page page"/>

          {pages.map((p, i) => <div key={i} className="my-page page">{p}</div>)}

          <div className="book-page page">
            <div className="intro">koniec</div>
          </div>
          <div className="book-page page"/>

          <div className="my-page cover-back" data-density="hard"/>
      </HTMLFlipBook>
    </PageWithLoader>
  );
}

export default Book;
