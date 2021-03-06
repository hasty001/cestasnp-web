const express = require('express');
const DB = require('../db/db');
const { checkToken } = require('../util/checkUtils');
const sanitize = require('mongo-sanitize');
const { addDays, format, startOfToday } = require('date-fns');
const { escape, escapeImg, escapeDate } = require('../util/escapeUtils');
const { ObjectId } = require('mongodb');
const _const = require('../../const');
const { formatAsDate } = require('../util/momentUtils');

const db = new DB();

const router = express.Router();

const getChanges = (dbRef, uid, from, to, my, items, sort, page, count) => {
  const s_uid = sanitize(uid);

  return Promise.all([db.getUserNames(dbRef, null), 
    s_uid ? db.findBy(dbRef, _const.UsersTable, { uid: s_uid }).then(u => u && u.length > 0 ? u[0] : null) : Promise.resolve(null),
    db.findBy(dbRef, _const.DetailsTable, {}, { projection: { user_id: 1, articleID: 1, sql_id: 1, meno: 1, url_name: 1 }}),
    db.findBy(dbRef, _const.FindBuddiesTable, {}, { projection: { user_id: 1 }})])
  .then(([users, user, details, findBuddies]) => {
    const s_from = formatAsDate(from || new Date(0));
    const s_to = formatAsDate(addDays(to || startOfToday(), 1));
    const s_page = sanitize(page) || 0;
    const s_count = sanitize(count) || 20;
    const s_items = items ? items.split(',') : null;

    const check = (changedProp, myItems, authorProps, userProp) => {
      const fromFilter = {};
      fromFilter[changedProp] = { $gte: s_from };

      const toFilter = {};
      toFilter[changedProp] = { $lt: s_to };

      const myFilter = {};
      if (my) {
        const authorFilters = authorProps.map(p => { const f = {}; f[p] = s_uid; return f; });

        const userFilter = {};
        userFilter[userProp] = s_uid;

        const inMyItems = myItems ? { _id: { $in: myItems } } : { _id: null };
        const inMyItemsOld = myItems ? { sql_article_id: { $in: myItems } } : { _id: null };

        myFilter["$or"] = [...authorFilters, userFilter, inMyItems, inMyItemsOld];
      }

      return { $and: [fromFilter, toFilter, myFilter]};
    }

    const getUserName = (user) => {
      const index = users.findIndex(u => u.uid == user);
      return index >= 0 ? users[index].name : "";
    }

    const getDetailUrlName = (item, isMsg = false) => {
      const index = details.findIndex(u => (isMsg && u.user_id == item.user_id) || 
        (item.travellerDetails && u._id.toString() == item.travellerDetails.id) || (item.article_sql_id && u.articleID == item.article_sql_id));
      return index >= 0 ? (details[index].url_name || details[index].user_id) : "";
    }

    const getDetailName = (item, isMsg = false) => {
      const index = details.findIndex(u => (isMsg && u.user_id == item.user_id) ||
        (item.travellerDetails && u._id.toString() == item.travellerDetails.id) || (item.article_sql_id && u.articleID == item.article_sql_id));
      return index >= 0 ? details[index].meno : "";
    }

    const getFindBuddiesUserId = (id) => {
      const index = findBuddies.findIndex(u => 
        id && u._id.toString() == id);
      return index >= 0 ? findBuddies[index].user_id : "";
    }

    const getFindBuddiesUserName = (id) => {
      const index = findBuddies.findIndex(u => 
        id && u._id.toString() == id);
      return index >= 0 ? getUserName(findBuddies[index].user_id) : "";
    }

    const getProp = (item, propName) => {
      if (propName && propName.indexOf('.') > 0) {
        const parts = propName.split('.', 2);
        return (item[parts[0]] || {})[parts[1]] 
      } else {
        return item[propName];
      }
    } 

    const ignoreProps = {'text': 0, 'itinerary': 0, 'img_url': 0,
      'introtext': 0, 'fulltext': 0, 'attribs': 0, 'metakey': 0, 'metadesc': 0,
      'comment': 0, 'img': 0};

    const dbPromise = (table, myItems, authorProps, change, changedProp, userProp, 
        getName = () => {}, noteProp = '', getUrl = () => {}, getItemUserName = () => {}, proj = null) => db.findBy(dbRef, table, 
      { $or: [ check(changedProp, myItems, authorProps, userProp) ] }, { projection: proj || ignoreProps }).then(data => data.map(item => {
        return { table, change, date: getProp(item, changedProp), user: item[userProp] || item[userProp + "_user_sql_id"], 
          userName: getUserName(item[userProp] || item[userProp + "_user_sql_id"]) || getItemUserName(item), 
          note: noteProp ? item[noteProp] : null, name: getName(item), url: getUrl(item), item };
      }));

    const concat = (array) => array.reduce((a, v) => a.concat(v), []);

    const myPois = user ? (user.poisMy || []).map(p => new ObjectId(p)) : null;
    const getPoiUrl = (item) => `/pred/pois/${item.poiId || item._id}`;
    const promisePois = (!s_items || s_items.indexOf('pois') >= 0) ? Promise.all([
      dbPromise(_const.PoisTable, myPois, ['user_id'], 'created', 'created', 'user_id', item => item['name'], '', getPoiUrl),
      dbPromise(_const.PoisTable, myPois, ['user_id'], 'modified', 'modified', 'modified_by', item => item['name'], 'modified_note', getPoiUrl),
      dbPromise(_const.PoisTable, myPois, ['user_id'], 'deleted', 'deleted', 'deleted_by', item => item['name'], 'deleted_note', getPoiUrl),
      dbPromise(_const.PoisHistoryTable, myPois, ['user_id'], 'modified', 'modified', 'modified_by', item => item['name'], 'modified_note', getPoiUrl),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const myArticles = user ? user.articlesMy : null;
    const getArticleUrl = (item) => `/pred/articles/article/${item.sql_article_id}`;
    const promiseArtcles = (!s_items || s_items.indexOf('articles') >= 0) ? Promise.all([
      dbPromise(_const.ArticlesTable, myArticles, ['created_by', 'author'], 'created', 'created', 'created_by', item => item['title'], '', getArticleUrl),
      dbPromise(_const.ArticlesTable, myArticles, ['created_by', 'author'], 'modified', 'modified', 'modified_by', item => item['title'], 'note', getArticleUrl),
      dbPromise(_const.ArticlesHistoryTable, myArticles, ['created_by', 'author'], 'modified', 'modified', 'modified_by', item => item['title'], 'note', getArticleUrl),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getDetailUrl = (item) => `/na/${item.url_name || item.user_id}`;
    const promiseDetails = (!s_items || s_items.indexOf('details') >= 0) ? Promise.all([
      dbPromise(_const.DetailsTable, null, ['user_id'], 'created', 'created', 'user_id', item => item['meno'], '', getDetailUrl),
      dbPromise(_const.DetailsTable, null, ['user_id'], 'modified', 'lastUpdated', 'user_id', item => item['meno'], '', getDetailUrl),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getUserDetailUrl = (item) => `/pred/hladampartakov/${item.user_id}`;
    const promiseFindBuddies = (!s_items || s_items.indexOf('buddies') >= 0) ? Promise.all([
      dbPromise(_const.FindBuddiesTable, null, ['user_id'], 'created', 'created', 'user_id', item => getUserName(item.user_id), '', getUserDetailUrl),
      dbPromise(_const.FindBuddiesTable, null, ['user_id'], 'modified', 'lastUpdated', 'user_id', item => getUserName(item.user_id), '', getUserDetailUrl),
      dbPromise(_const.FindBuddiesTable, null, ['user_id'], 'deleted', 'del_date', 'user_id', item => getUserName(item.user_id), '', getUserDetailUrl),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getFindBuddiesCommentUrl = (item) => `/pred/hladampartakov/${getFindBuddiesUserId(item.findBuddiesId)}#${item._id}`;
    const promiseFindBuddiesComments = (!s_items || s_items.indexOf('answers') >= 0) ? Promise.all([
      dbPromise(_const.FindBuddiesCommentsTable, null, ['uid'], 'created', 'date', 'uid', item =>getFindBuddiesUserName(item.findBuddiesId), '', getFindBuddiesCommentUrl, item => item.name),
      dbPromise(_const.FindBuddiesCommentsTable, null, ['uid'], 'deleted', 'del_date', 'del_by', item => getFindBuddiesUserName(item.findBuddiesId), '', getFindBuddiesCommentUrl, item => item.name),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getMessageUrl = (item) => `/na/${getDetailUrlName(item, true)}#${item._id}`;
    const promiseMessages = (!s_items || s_items.indexOf('messages') >= 0) ? Promise.all([
      dbPromise(_const.MessagesTable, null, ['user_id'], 'created', 'pub_date', 'user_id', item => getDetailName(item, true), '', getMessageUrl),
      dbPromise(_const.MessagesTable, null, ['user_id'], 'deleted', 'del_date', 'user_id', item => getDetailName(item, true), '', getMessageUrl),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getCommentUrl = (item) => `/na/${getDetailUrlName(item)}#${item._id}`;
    const promiseComments = (!s_items || s_items.indexOf('comments') >= 0) ? Promise.all([
      dbPromise(_const.CommentsTable, null, ['uid'], 'created', 'date', 'uid', item => item.travellerDetails.name, '', getCommentUrl, item => item.name),
      dbPromise(_const.CommentsTable, null, ['uid'], 'deleted', 'del_date', 'del_by', item => item.travellerDetails.name, '', getCommentUrl, item => item.name),
      dbPromise(_const.ArticleCommentsTable, null, ['uid'], 'created', 'date', 'uid', item => getDetailName(item), '', getCommentUrl, item => item.name),
      dbPromise(_const.ArticleCommentsTable, null, ['uid'], 'deleted', 'del_date', 'del_by', item => getDetailName(item), '', getCommentUrl, item => item.name),
    ]).then(d => concat(d)) : Promise.resolve([]);

    const getDate = (date) => {
      try { 
        if (!date)
          return 0;
        const d = new Date(date);
        return isNaN(d) ? 0 : d;
      } catch {
        return "";
      }
    }

    return Promise.all([promisePois, promiseArtcles, promiseDetails, promiseFindBuddies, promiseFindBuddiesComments, 
      promiseMessages, promiseComments]).then(results => {
      const items = concat(results);
      const count = items.length;

      items.sort((a, b) => getDate(b.date) - getDate(a.date));

      return { count, items: items.slice(s_page * s_count, ((s_page + 1) * s_count)) };
    });
  });
}

const getTableAsText = (table) => {
  switch (table) {
    case _const.PoisTable:
    case _const.PoisHistoryTable:
      return "Dôležité miesto";
    case _const.ArticlesTable:
    case _const.ArticlesHistoryTable:
      return "Článok";
    case _const.DetailsTable:
      return "Cesta";
    case _const.MessagesTable:
      return "Zpráva";
    case _const.CommentsTable:
    case _const.ArticleCommentsTable:
      return "Komentár";
    case _const.UsersTable:
      return "Hľadanie parťákov";  
    default:
      return table;
  }
}

const getChangeText = (change, item) => {
  switch (change) {
    case "created":
      return item.state == -1 ? "navrhol pridať" : "pridal";
    case "modified":
      return item.state == -1 ? "navrhol úpravy" : "upravil";
    case "deleted":
      return "zmazal";
    default:
      return table;
  }
}

router.get('/feed', (req, res) => {

  getChanges(req.app.locals.db, null, addDays(startOfToday(), -7), null, false, req.query.items || 'pois,articles,details', null, 0, 20)
  .then(data => {
    const items = data.items.map(item => `<item>
    <title>${escape(`${getTableAsText(item.table)} - ${item.name}`)}</title>
    <description>${escape((`${getChangeText(item.change, item.item)} ${item.userName} ${item.note ? `Poznámka: ${item.note}`: ""}`).trim())}</description>
    <pubDate>${escapeDate(item.date)}</pubDate>
    <link>https://cestasnp.sk${escape(item.url)}</link>
  </item>`).join("\n  ");

    res.contentType("application/xml").send(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">

<channel>
  <title>CestaSNP.sk</title>
  <link>https://cestasnp.sk</link>
  <description>CestaSNP.sk je internetový portál výhradne venovaný turistickej trase Cesta hrdinov SNP, ktorá vedie naprieč celým Slovenskom v dĺžke 770 km. Poskytujeme podporu a interaktívne služby turistom, zameriavame sa na spravodajstvo o Ceste a staráme sa o propagáciu tejto trasy medzi turistami a vôbec celou verejnosťou.</description>
  ${items}
</channel>

</rss>`);
  })
  .catch(error => {
    console.error(error);
    res.status(500).send(error.toString());
  });
});

router.post('/', (req, res) => {
  const {
    uid,
    from,
    to,
    my,
    items,
    sort,
    page,
    count
  } = req.body;

  checkToken(req, res, uid, () => getChanges(req.app.locals.db, uid, from, to, my, items, sort, page, count));
});

module.exports = router;
