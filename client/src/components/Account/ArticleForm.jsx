import React, { useEffect, useState } from 'react';
import FormWithLoader from '../reusable/FormWithLoader';
import { parseGPSPos } from '../../helpers/GPSPosParser';
import { fetchJson, fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import FormLatLon from '../reusable/FormLatLon';
import FormText from '../reusable/FormText';
import FormSelect from '../reusable/FormSelect';
import FormTextArea from '../reusable/FormTextArea';
import FormImage from '../reusable/FormImage';
import { useStateEx } from '../../helpers/reactUtils';
import FormCheckBox from '../reusable/FormCheckBox';
import FormMultiSelect from '../reusable/FormMultiSelect';
import ArticlePreviewBox from '../reusable/ArticlePreviewBox';
import { A } from '../reusable/Navigate';
import ArticleDiffBox from '../reusable/ArticleDiffBox';
import FormItem from '../reusable/FormItem';
import CloudinaryWidget from '../reusable/CloudinaryWidget';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const ArticleForm = (props) => {

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorMsgFirst, setErrorMsgFirst] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [warningMsgFirst, setWarningMsgFirst] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [preview, setPreview] = useState(false);
  const [diff, setDiff] = useState(null);
  const [imageId, setImageId] = useState(Date.now());

  const clearMsg = () => {
    setErrorMsg('');
    setErrorMsgFirst('');
    setWarningMsg('');
    setWarningMsgFirst('');
    setSuccessMsg('');
  }
  
  const [gps, setGps] = useStateEx({ latlon: '', accuracy: 0 }, clearMsg);
  const [gpsEdit, setGpsEdit] = useStateEx(false, clearMsg);
  const [state, setState] = useStateEx(props.role != "admin" ? -1 : 0, clearMsg);
  const [articleId, setArticleId] = useStateEx('', clearMsg);
  const [tags, setTags] = useStateEx([], clearMsg);
  const [title, setTitle] = useStateEx('', clearMsg);
  const [intro, setIntro] = useStateEx('', clearMsg);
  const [text, setText] = useStateEx('', clearMsg);

  const [images, setImages] = useStateEx([], clearMsg);
  const [imagesAdded, setImagesAdded] = useStateEx([], clearMsg);
  const [links, setLinks] = useStateEx([], clearMsg);

  const [note, setNote] = useStateEx('', clearMsg);

  useEffect(() => {
    const list = [];
    const linksList = [];

    const imgTagRegEx = /<img.*?src="([^"].*?)"[^>]*?\/>/g;
    const linkRegEx = /href="([^"].*?)"/g;

    const imgTags = [...(intro + text).matchAll(imgTagRegEx)];
    if (imgTags) {
      imgTags.forEach(imgTag => {
        list.push({ html: imgTag[0], src: imgTag.length > 1 ? imgTag[1] : null });
      });
    }

    const linkTags = [...(intro + text).matchAll(linkRegEx)];
    if (linkTags) {
      linkTags.forEach(linkTag => {
        linksList.push({ href: linkTag.length > 1 ? linkTag[1] : null });
      });
    }

    setImages(list);
    setLinks(linksList);
  }, [intro, text])

  useEffect(() => {
    setImageId(Date.now());

    if (!props.edit) {
      setLoading(true);

      fetchJson('/api/articles/lastId')
      .then(id => {
        setArticleId((id + 1).toString());
        setLoading(false);
      })
      .catch(e => {
        console.error('Last Article Id error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
    }
  }, []);

  useEffect(() => {
    if (props.article && props.edit) {
      const hashId = (window.location.hash || "").replace("#", "");
      const index = hashId && props.article && props.article.history ? 
        props.article.history.findIndex(a => a._id == hashId) : -1;
      const p = index >= 0 ? props.article.history[index] : props.article;

      setGps({ latlon: p.lat && p.lon ? `${p.lat}, ${p.lon}` : '', accuracy: p.accuracy });
      setState(props.role != "admin" ? -1 : p.state);
      setTags(p.tags);
      setTitle(p.title);
      setIntro(p.introtext);
      setText(p.fulltext);

      const latest = props.article.history && props.article.history.length > 0 ? 
        props.article.history[0] : props.article;
      if (p.modified < latest.modified) {
        setWarningMsgFirst((<>Existuje novšia verzia článku - <a href={`#${latest._id}`}>použiť pre úpravy</a>.</>));
      }
    }
  }, [props.role, props.article, props.edit, window.location.hash]);

  const addArticle = () => {
    if (!props.edit && (!articleId || articleId.trim().length === 0)) {
      setErrorMsg('Vyplň ID.');
      return;
    }

    if ((!title || title.trim().length === 0) 
      || (!intro || intro.trim().length === 0)) {
      setErrorMsg('Vyplň názov i úvod.');
      return;
    }

    if (!tags || tags.length === 0) {
      setErrorMsg('Zaradenie nemôže ostať prázdne.');
      return;
    }

    if (props.edit && (!note || note.trim().length === 0)) {
      setErrorMsg('Poznámka nemôže ostať prázdna.');
      return;
    }

    const latlon = parseGPSPos(gps.latlon);

    if (
      gps.latlon &&
      gps.latlon.trim().length > 0 &&      
      !latlon
    ) {
      setErrorMsg('GPS súradnice majú nesprávny formát.');
      return;
    }
     
    const confirmed = !!warningMsg;
    setLoading(true);
    clearMsg();

    const data = {};
    data.lat =  latlon ? latlon[0].toFixed(6) : null;
    data.lon =  latlon ? latlon[1].toFixed(6) : null; 
    data.accuracy = gps.accuracy;
    data.state = state;
    data.tags = tags;
    data.title = title;
    data.introtext = intro;
    data.fulltext = text;
    if (props.edit) {
      data.sql_article_id = props.article.sql_article_id;
      data.uid = props.uid;
      data.note = note;
    } else {
      data.sql_article_id = articleId;
      data.created_by = props.uid;
    }

    data.confirmed = confirmed;

    fetchPostJsonWithToken(props.user, props.edit ? '/api/articles/update' : '/api/articles/add', data)
      .then(msgRes => {
        setLoading(false);
        
        if (msgRes.confirm) {
          setWarningMsg(msgRes.confirm); 
          return; 
        }
         
        if (!props.edit) {
          setGpsEdit(false);
          setGps({ latlon: '', accuracy: 0 });
          setState(props.role != "admin" ? -1 : 0);
          setTags([]);
          setTitle('');
          setIntro('');
          setText('');
          setImages([]);
          setArticleId((msgRes.sql_article_id + 1).toString());
        }
        setNote('');

        msgRes.successMsg = props.edit ? 'Článok úspešne upravený!': 
          'Článok úspešne pridaný!';
        setSuccessMsg(msgRes.successMsg);

        if (props.onUpdate) {
          props.onUpdate(msgRes);
        }
      })
      .catch(e => {
        console.error('Add Article error: ', e);

        setLoading(false);
        setErrorMsg(Texts.GenericError);
      });
  }

  const fixArticle = (text) => {
    const curlyRegEx = /{.*?}/g;
    const latRegEx = /lat=.*?([0-9]+\.[0-9]+)/;
    const lonRegEx = /lon=.*?([0-9]+\.[0-9]+)/;
    const indexLinkRegEx = /<a href="(index\.php|undefined\/|http:\/\/www.cestasnp.sk\/?)"[^<]*?<img[^>]*?>[^<]*?<\/a>/g;
    const smeLinkRegEx = /<p[^<]*?<a href="http:\/\/vybrali.sme.sk(.|\n|\r)*?<\/p>/g;
    const iframeRegEx = /<iframe(.|\n|\r)*?<\/iframe>?/g;
    const poiLinkRegEx = /href="(index\.php\/(dolezite-miesta|vybavenie|zaujimavosti|mapy|cestopisy|component\/content\/article\/79-spravy-z-terenu)\/.*?([0-9]+).*?)"/g;

    var result = text;

    // fix images crop
    result = result.replaceAll('/c_fill', '/c_limit');

    result = result.replaceAll(curlyRegEx, ''); // remove {...}
    result = result.replaceAll(indexLinkRegEx, ''); // remove index links
    result = result.replaceAll(smeLinkRegEx, ''); // remove sme links

    // fix article poi links
    const poiLink = [...result.matchAll(poiLinkRegEx)];
    if (poiLink) {
      poiLink.forEach(c => {
        if (c.length > 3) {
          result = result.replaceAll(c[1], `/pred/articles/article/${c[3]}`);
        }
      });
    }

    // remove iframes
    const iframe = result.match(iframeRegEx);
    if (iframe) {
      iframe.forEach(c => {
        if (c.indexOf("embedded.freemap.sk/") >= 0) {
          // get lat lon
          var lat = c.match(latRegEx);
          lat = lat && lat.length > 1 ? lat[1] : null;
          var lon = c.match(lonRegEx);
          lon = lon && lon.length > 1 ? lon[1] : null;
        }
        if (lat && lon) {
          setGps({ latlon: lat + ", " + lon, accuracy: 0 });
        }
        result = result.replaceAll(c, '');
      });
    }

    // no justify and weird styles
    result = result.replaceAll('id="introtext_img"', '');
    result = result.replaceAll('id="article_img"', '');
    result = result.replaceAll(' border="0" alt=', ' alt=');
    result = result.replaceAll('align="justify"', '');
    result = result.replaceAll('text-align: justify;', '');
    result = result.replaceAll('text-align: justify', '');
    result = result.replaceAll('font-size: 14px;', '');
    result = result.replaceAll('font-size: 14px', '');
    result = result.replaceAll('text-decoration: underline;', '');
    result = result.replaceAll('text-decoration: underline', '');
    result = result.replaceAll('color: #800000', 'font-weight: 700');
    result = result.replaceAll('color: #993300', 'font-weight: 700');
    result = result.replaceAll('font-weight: 400;', '');
    result = result.replaceAll(' style=""', '');
    result = result.replaceAll(' alt=""', '');
    result = result.replaceAll(' title=""', '');
    result = result.replaceAll(/<span style="font-weight: 700;"><strong>(.*?)<\/strong><\/span>/g, '<strong>$1</strong>');
    result = result.replaceAll(/<strong><span style="font-weight: 700;">(.*?)<\/span><\/strong>/g, '<strong>$1</strong>');
    

    return result;
  };

  const addImage = (image) => {
    const newImages = imagesAdded.map(i => i);
    newImages.push({ 
      html: `<img class="left" src="${image.secure_url}" />`, src: image.secure_url, added: true });

    setImagesAdded(newImages);
    setImageId(Date.now());
  }

  const imageAlign = (image, align) => {
    var newHtml = image.html.replace(/class="[^"]*"/, `class="${align}"`)
      .replaceAll(/(width|height|style)="[^"]*"/g, '');
    if (newHtml.indexOf(" class=") < 0) {
      newHtml = newHtml.replace("<img", `<img class="${align}"`);
    }

    if (image.added) {
      image.html = newHtml;

      setImagesAdded(imagesAdded.map(i => i));
    } else {
      setText((text || '').replace(image.html, newHtml));
      setIntro((intro || '').replace(image.html, newHtml));
    }
  }

  const allImages = images.concat(imagesAdded.filter(t => images.findIndex(i => i.src == t.src) < 0));
  
  return (
    <FormWithLoader formId="add-article" 
      title={props.edit ? (<>Upraviť článok - <A href={`/pred/articles/article/${props.article ? props.article.sql_article_id : ''}`}>{props.article ? props.article.title : ""}</A></>) 
        : "Pridať článok" }
      submitText={props.edit ? "Upraviť" : (warningMsg ? "Naozaj pridať" : "Pridať")}
      onSubmit={addArticle} loading={loading} errorMsg={errorMsg} errorMsgFirst={errorMsgFirst} successMsg={successMsg}>

      {!!warningMsgFirst && (
        <div className="warningMsg">
          {!!warningMsgFirst && warningMsgFirst}          
        </div>
      )}

      {!props.edit && <FormText value={[articleId, setArticleId]} valueName="articleId" valueLabel="ID" itemClassName="form"/>}

      <FormSelect value={[state, setState]} valueName="state" valueLabel="Stav" 
        options={[{ value: -1, label: "na schválenie" }, { value: 0, label: "skrytý" }, { value: 1, label: "publikovaný" }]
          .filter(i => i.value == -1 || props.role == "admin")} itemClassName="form">
      </FormSelect>

      <FormText value={[title, setTitle]} valueName="title" valueLabel="Názov" itemClassName="form"/>

      <FormMultiSelect value={[tags, setTags]} valueName="tags" valueLabel="Zaradenie" 
        options={ Constants.ArticleCategories.slice(1).map(cat => { return { value: cat.tag, label: cat.text }; }) } itemClassName="form">
      </FormMultiSelect>

      {!!props.edit && <a className="action" href="#" onClick={() => setIntro(fixArticle(intro))}>vyčistiť</a>}
      <FormTextArea value={[intro, setIntro]} valueName="intro" valueLabel="Úvod" itemClassName="form"/>
      {!!props.edit && <a className="action" href="#" onClick={() => setText(fixArticle(text))}>vyčistiť</a>}
      <FormTextArea value={[text, setText]} valueName="text" valueLabel="Text" itemClassName="form"/>
      
      <FormItem valueName="images" valueLabel="Obrázky" useEdit 
        valueClass="image-list" value={allImages.map((image, i) => <img key={i} src={image.src}/>)}>
        <>
          {allImages.map((image, i) => (
            <div key={i} className="article-img-item">
              <CopyToClipboard text={image.html}>
                <button className="action" title="Kopírovať"><i className="far fa-copy" /></button>
              </CopyToClipboard>
              <img src={image.src}/>

              <span className="buttons">
                <button className="" title="Vľavo" onClick={() => imageAlign(image, 'left')}><i className="fas fa-align-left" /></button>
                <button className="" title="Na stred" onClick={() => imageAlign(image, 'center')}><i className="fas fa-align-center" /></button>
                <button className="" title="Vpravo" onClick={() => imageAlign(image, 'right')}><i className="fas fa-align-right" /></button>
              </span>

              {image.html.replace('https://res.cloudinary.com/cestasnp-sk/image/upload', '...')}
            </div>))}
          <CloudinaryWidget uid={props.uid} imageId={imageId} 
            updateImageDetails={i => addImage(i)} 
            btnTxt="Pridať" type={Constants.ImageType.Clanky} />
        </>
      </FormItem>

      <FormItem valueName="links" valueLabel="Odkazy" useEdit 
        valueClass="link-list" value={links.length}>
        {!!links && links.map((link, i) => <div key={i} className="article-link-item"><a href={link.href}>{link.href}</a></div>)}
      </FormItem>

      <FormLatLon value={[gps, setGps]} edit={[gpsEdit, setGpsEdit]} onError={setErrorMsg} itemClassName="form"/>

      {!!props.edit && <FormText value={[note, setNote]} valueName="note" valueLabel="Poznámka" itemClassName="form"/>}
    
      {!!warningMsg && (
        <div className="warningMsg">
          {!!warningMsg.text && warningMsg.text}          
        </div>
      )}

      <ArticlePreviewBox show={preview} title={title} intro={intro} text={text} onHide={() => setPreview(false)}/>
      <ArticleDiffBox show={diff != null} 
        oldArticle={props.article}
        newArticle={diff}
        onHide={() => setDiff(null)}/>

      <button className="snpBtnWhite" onClick={() => setPreview(true)}>
        Náhled článku
      </button>
      {!!props.edit && (<button className="snpBtnWhite" onClick={() => setDiff({ state: parseInt(state), tags, 
          gps: gps && gps.latlon ? parseGPSPos(gps.latlon).map(f => f.toFixed(6)).join(", ") : null, title, introtext: intro, fulltext: text })}>
          Rozdiel
        </button>)}
    </FormWithLoader>
  )
}
export default ArticleForm;