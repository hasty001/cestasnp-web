// TODO - lot of reapeating code refactor when possible
const { MongoClient } = require('mongodb');
const sanitize = require('mongo-sanitize');
const moment = require('moment-timezone');
const { ObjectId } = require('mongodb');
const Validation = require('./validation');
const { getNearGuideposts, findNearestGuideposts, findNearestPoint, sortNear } = require('../util/gpsUtils');
const { format, differenceInDays } = require('date-fns');
const _const = require('../../const');
const { sanitizeUserId } = require('../util/checkUtils');
const { momentDateTime, formatAsDate } = require('../util/momentUtils');

const securityCheck = new Validation();

// eslint-disable-next-line func-names
const DB = function() {
  this.url = process.env.MONGODB_ATLAS_URI;
};

const dbCollection = (db, collection) => db.db('cestasnp').collection(collection);

const dbConnect = (promise) => MongoClient.connect(
  process.env.MONGODB_ATLAS_URI,
  { useNewUrlParser: true }).then(db => promise(db).finally(() => db.close()));

DB.prototype = {
  all(db, collection) {
    return dbCollection(db, collection)
      .find()
      .toArray();
  },

  newestSorted(db, collection, sortBy = {}, filterBy = {}, limit = 1, options = {}) {
    return dbCollection(db, collection)
      .find(filterBy, options)
      .sort(sortBy)
      .limit(limit)
      .toArray();
  },

  nextSorted(db, collection, sortBy = {}, next = 0, filterBy = {}, options = {}, pageSize = _const.PageSize) {
    let page = next - 1;
    page = page < 0 ? 0 : page;

    return dbCollection(db, collection)
      .find(filterBy, options)
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * page)
      .toArray();
  },

  findOne(db, collection, findBy = {}, options = {}) {
    return dbCollection(db, collection)
      .findOne(findBy, options);
  },

  findBy(db, collection, findBy = {}) {
    return dbCollection(db, collection)
      .find(findBy)
      .toArray();
  },
  
  findBy(db, collection, findBy = {}, options = {}, sortBy = {}) {
    return dbCollection(db, collection)
      .find(findBy, options)
      .sort(sortBy)
      .toArray();
  },

  countCollection(db, collection, findBy = {}) {
    return dbCollection(db, collection)
      .countDocuments(findBy);
  },

  addArticle(article, collection) {
    return dbConnect(db => dbCollection(db, collection).insertOne(article));
  },

  increaseArticleCount(articleId) {
    return dbConnect(db => dbCollection(db, _const.ArticlesTable)
      .findOneAndUpdate({ _id: new ObjectId(sanitize(articleId)) }, { $inc: { article_views: 1 } }, { returnOriginal: false })
      .then(res => res && res.value ? res.value.article_views : 0));
  },

  // traveller related
  getTravellerDetails(db, travellerId) {
    return this.findBy(db, _const.DetailsTable, { user_id: sanitizeUserId(travellerId) });
  },

  getTravellerArticle(db, travellerId) {
    return this.findBy(db, _const.ArticlesTable, { created_by_user_sql_id: sanitizeUserId(travellerId) });
  },

  getTravellerMessages(db, travellerId) {
    return this.findBy(db, _const.MessagesTable,
      { $and: [ { user_id: sanitizeUserId(travellerId) }, _const.FilterNotDeleted] });
  },

  findUserName(uid, users) {
    if (!uid) {
      return null;
    }

    const sUid = sanitizeUserId(uid);

    const index = users.findIndex(u => u.uid == sUid || u.sql_user_id == sUid);
    return index >= 0 ? users[index].name : null;
  },

  getUids(list, selectProps) {
    return list.reduce((res, item) => res.concat(selectProps.filter(prop => prop(item)).map(prop => prop(item))), []);
  },

  /**
   * Returns list of users with name or journey name for specified uids.
   */
  getUserNames(db, uids) {
    const sUids = uids ? uids.map(u => sanitizeUserId(u)) : null;

    const getUsers = this.findBy(db, _const.UsersTable, 
      sUids ? { $or: [ { uid : { $in: sUids } }, { sql_user_id : { $in: sUids } } ] } : {}, { projection: { uid: 1, sql_user_id: 1, name: 1 } });

    
    const getDetails = this.findBy(db, _const.DetailsTable,
      sUids ? { user_id : { $in: sUids } } : {}, { projection: { user_id: 1, meno: 1 } });

    return Promise.all([getUsers, getDetails]).then(([users, details]) => {                
      users.forEach(u => {
        if (!u.uid) {
          u.uid = u.sql_user_id;
        }

        const cesta = details.find(t => t.user_id === u.uid);
        if (cesta) {
          u.cesta = cesta.meno;
        }
      });

      return Promise.resolve(users);
    });
  },

  getTravellerComments(db, articleId, travellerId, findBuddiesId = null, after = null) {
    const sArticleId = sanitize(articleId);
    const sTravellerId = sanitize(travellerId);
    const sFindBuddiesId = sanitize(findBuddiesId);
    const filterAfter = after ? { date: { $gt: sanitize(after) } } : {};
   
    const getDocs = findBuddiesId ? this.findBy(db, _const.FindBuddiesCommentsTable,
      { $and: [ { findBuddiesId: sFindBuddiesId }, _const.FilterNotDeleted, filterAfter] })
      : (sArticleId === 0 || sArticleId === '') ?
        this.findBy(db, _const.CommentsTable,
          { $and: [ { 'travellerDetails.id': sTravellerId }, _const.FilterNotDeleted, filterAfter] })
        : this.findBy(db, _const.ArticleCommentsTable,
          { $and: [ { article_sql_id: sArticleId }, _const.FilterNotDeleted, filterAfter] });

    return getDocs.then((docs) => {
      const uids = this.getUids(docs, [d => d.uid]);

      return this.getUserNames(db, uids)
        .then(users => {
          docs.forEach(d => {
            if (d.uid) {
              const user = users.find(u => u.uid === d.uid);
              
              if (user) {
                const n = user.cesta || user.name;
                
                if (d.username) {
                  d.username = n;
                }
                d.name = n;
              }
            }
          });
          
          return Promise.resolve(docs);
        });
    });
  },

  getTravellersMessages(db, travellerIds) {
    if (!Array.isArray(travellerIds)) {
      return Promise.reject('Traveller IDs not an array');
    }

    let typeCheck = 0;
    const sTravellerIds = travellerIds.map(id => {
      if (typeof id !== 'number' && typeof id !== 'string') typeCheck += 1;
      return sanitize(id);
    });

    if (typeCheck !== 0) {
      return Promise.reject('Traveller IDs not numbers');
    }

    return this.findBy(db, _const.MessagesTable,
      { $and: [ { user_id: { $in: sTravellerIds } }, _const.FilterNotDeleted] })
      .then(docs => {
        docs.sort((a, b) => {
          return new Date(b.pub_date) - new Date(a.pub_date);
        });

        return Promise.resolve(docs);
      });
  },

  getTravellerLastMessage(db, travellerId) {
    const sTravellerId = sanitize(travellerId);

    return this.newestSorted(db, _const.MessagesTable, { pub_date: -1 }, 
      { $and: [ { user_id: sTravellerId }, _const.FilterNotDeleted] })
      .then(docs => {
        if (docs && docs.length > 0) {
          return Promise.resolve(docs[0]);
        } else if (docs && docs.length === 0) {
          return Promise.resolve({
            message: `No messages found for ${sTravellerId}`,
            pub_date: 0,
            user_id: sTravellerId
          });
        }});
  },

  getInterestingFinishedTravellers(db, date, maxCount = _const.InterestingShowCount) {
    const now = formatAsDate(date || Date.now());
    const start = formatAsDate(new Date(date || Date.now()) - _const.InterestingPrevMonths * 31 * _const.Day);
              
    return this.findBy(db, _const.DetailsTable, { 
      $and: [{ finishedTracking: true}, 
        { $or: [{start_date: { $lte: now }}, {end_date: { $lte: now }}]},
        { $or: [{start_date: { $gte: start }}, {end_date: { $gte: start }}]}] })
      .then(finished => {

        const finishedIds = finished.map(t => t.articleID ? t.articleID : t._id.toString() );
        const finishedUserIds = finished.map(t => t.user_id );

        const listCommentsOld = this.findBy(db, _const.ArticleCommentsTable, 
          { $and: [{ article_sql_id: { $in: finishedIds } }, _const.FilterNotDeleted] }, { projection: { article_sql_id: 1 } });
        const listCommentsNew = this.findBy(db, _const.CommentsTable, 
          { $and: [{ 'travellerDetails.id': { $in: finishedIds } }, _const.FilterNotDeleted] }, { projection: { travellerDetails: 1 } });
        const listMessages = this.findBy(db, _const.MessagesTable, 
          { $and: [{ user_id: { $in: finishedUserIds } }, _const.FilterNotDeleted] }, { projection: _const.ProjectionMessageWithImage }, { pub_date: 1 });

        return Promise.all([listCommentsOld, listCommentsNew, listMessages])
        .then(([oldComments, newComments, msgs]) => {

          finished.forEach(f => {
            f.rating = 0;
          });

          oldComments.forEach(c => { 
            const found = finished.find(f => f.articleID === c.article_sql_id);
            if (found) {
              found.rating += _const.CommentRating;
            }
          });

          newComments.forEach(c => { 
            const found = finished.find(f => f._id.toString() === c.travellerDetails.id);
            if (found) {
              found.rating += _const.CommentRating;
            }
          });

          msgs.forEach(m => { 
            const found = finished.find(f => f.user_id === m.user_id);
            const hasImg = (m.img && m.img != 'None');
            if (found) {
              found.rating += (hasImg ? _const.ImageRating : 0)
                + m.text.length * _const.TextRatingPerChar;
              if (hasImg && !found.lastImg && m.pub_date >= start) {
                found.lastImg = m.img;
                found.lastImgMsgId = m._id;
              }
            }
          });

          // sort by rating desc and throw out with small rating
          finished.sort((a, b) => b.rating - a.rating);
          var best = finished.filter(f => f.rating > _const.MinRating);
          best = best.slice(0, Math.max(2, best.length / 2));
          
          // sort by start date asc
          best.sort((a, b) => a.start_date > b.start_date ? 1 : (a.start_date == b.start_date ? 0 : -1));
        
          // take first three
          return Promise.resolve(best.slice(0, maxCount));
        });
      });
  },

  getActiveTravellersWithLastMessage(db, date, maxCount) {
    return this.findBy(db, _const.DetailsTable, { finishedTracking: false })
      .then(activeTravellers => {
        var activeTravellersIds = activeTravellers.map(({user_id}) => user_id);
          
        if (activeTravellersIds.length === 0) {
          return this.getInterestingFinishedTravellers(db, date, maxCount || _const.InterestingShowCount);          
        } else {
          return Promise.all(activeTravellersIds.map(t =>
              this.newestSorted(db, _const.MessagesTable, { pub_date: -1 }, { $and: [{ user_id: t }, _const.FilterNotDeleted] }, 
                2, { projection: _const.ProjectionMessageWithImage })))
            .then(lastMessages => {
              lastMessages.reduce((r, m) => r.concat(m), []).map(msg => {
                  var i = activeTravellersIds.indexOf(msg.user_id);

                  if (i >= 0 && !activeTravellers[i].lastMessage) {
                    activeTravellers[i].lastMessage = msg;
                  }
                  if (msg.img && msg.img != 'None' && i >= 0 && !activeTravellers[i].lastImg) {
                    activeTravellers[i].lastImg = msg.img;
                    activeTravellers[i].lastImgMsgId = msg._id;
                  }
                });
                
              const now = formatAsDate(date || Date.now());
              if (!activeTravellers.find(t => t.start_date <= now) && activeTravellers.length < (maxCount || _const.InterestingShowCount)) {
                // no active only few planning, add some interesting

                return this.getInterestingFinishedTravellers(db, date, (maxCount || _const.InterestingShowCount) - activeTravellers.length)
                  .then(travellers => Promise.resolve(activeTravellers.concat(travellers)));
              }

              return Promise.resolve(activeTravellers);
            });
        }
  })},


  addCommentOldTraveller(comment) {
    return dbConnect(db =>
      this.newestSorted(db, _const.ArticleCommentsTable, { sql_comment_id: -1 })
        .then(array => {
          // TODO - spread and add key
          // eslint-disable-next-line no-param-reassign
          comment.sql_comment_id = array[0].sql_comment_id + 1;
        })
        .then(() => {
          if (securityCheck.checkCommentOldTraveller(comment)) {
            // save comment with new comment id
            return dbCollection(db, _const.ArticleCommentsTable)
              .insertOne(comment)
              .then(commentRes => {
                comment._id = commentRes.insertedId;
                
                return Promise.resolve(comment);
              });
          } else {
            return Promise.reject('Malicious comment');
          }
        }));          
  },

  addCommentNewTraveller(comment, findBuddies = false) {
    return dbConnect(db => {
      if (securityCheck.checkCommentNewTraveller(comment, findBuddies)) {
        // save comment with new comment id
        return dbCollection(db, findBuddies ? _const.FindBuddiesCommentsTable : _const.CommentsTable)
          .insertOne(comment)
          .then(commentRes => {
            comment._id = commentRes.insertedId;

            return Promise.resolve(comment);
          });
      } else {
        return Promise.reject('Malicious comment');
      }
    });
  },

  deleteComment(id, uid, articleId, findBuddiesId = null) {
    return dbConnect(db =>
      dbCollection(db, findBuddiesId ? _const.FindBuddiesTable : _const.DetailsTable)
        .findOne({ _id: findBuddiesId ? new ObjectId(findBuddiesId) : { $ne: null }, user_id : uid })
        .then((details) =>
        {          
          const sDetails = { _id: (details && details._id && details._id.toString()) ? details._id.toString() : "-1", 
            articleID: (details && details.articleID) ? details.articleID : -1 };

          const update = {
            $set: {
              deleted: true,
              del_date: momentDateTime(),
              del_by: uid,
            }
          };

          const options = { returnOriginal: false };
          const deleteComment = findBuddiesId ?
            dbCollection(db, _const.FindBuddiesCommentsTable)
            .findOneAndUpdate({ $and: [ { _id : new ObjectId(id) }, { $or: [ { findBuddiesId: sDetails._id }, { uid: uid } ] } ] },
              update, options)
            : (articleId === 0 || articleId === '') ?
              dbCollection(db, _const.CommentsTable)
                .findOneAndUpdate({ $and: [ { _id : new ObjectId(id) }, { $or: [ { 'travellerDetails.id': sDetails._id }, { uid: uid } ] } ] },
                  update, options)
              : dbCollection(db, _const.ArticleCommentsTable)
                .findOneAndUpdate({ $and: [ { _id : new ObjectId(id) }, { $or: [ { article_sql_id: sDetails.articleID }, { uid: uid } ] } ] },
                  update, options);

          return deleteComment.then(res => {
            if (res.value) {
              return Promise.resolve(res.value);
            } else {
              return Promise.reject('Komentár nebol nájdený.');
            }
          });
        }));
  },

  finishTracking(userId, completed, endDate) {
    return dbConnect(db =>
      dbCollection(db, _const.DetailsTable)
        .findOneAndUpdate(
          { user_id: userId }, {
            $set: {
              finishedTracking: true,
              end_date: endDate,
              completed
            }
          }));
  },

  createUser({ email, name, uid }) {
    return dbConnect(db => {
      const userRecord = {
        uid: sanitize(uid),
        sql_user_id: '',
        name: sanitize(name),
        email: sanitize(email),
        usertype: 'Fan',
        registerDate: momentDateTime(),
        lastvisitDate: momentDateTime(),
        sendEmail: 'NOT IN USE',
        gid: 'NOT IN USE',
        block: 'NOT IN USE',
        password: 'NOT IN USE',
        username: 'NOT IN USE',
        activation: 'NOT IN USE',
        params: 'NOT IN USE'
      };

      return dbCollection(db, _const.UsersTable)
        .insertOne(userRecord)
        .then(() => Promise.resolve({
            userDetails: userRecord,
            travellerDetails: {},
            travellerMessages: []
          }));      
      });
  },

  createTraveller({ meno, text, start_date, uid, start_miesto, number, email }) {
    return dbConnect(db => {
      const travellerRecord = {
        sql_id: '',
        meno: sanitize(meno), // nazov skupiny
        text: sanitize(text), // popis skupiny
        start_date: sanitize(start_date),
        end_date: '',
        completed: '',
        user_id: sanitize(uid),
        start_miesto: sanitize(start_miesto),
        number: sanitize(number), // pocet ucastnikov
        email: sanitize(email), // 0 / 1 moznost kontaktovat po skonceni s dotaznikom
        articleID: 0,
        finishedTracking: false,
        created: momentDateTime(),
        lastUpdated: momentDateTime()
      };

      return dbCollection(db, _const.DetailsTable)
        .insertOne(travellerRecord)
        .then(() => Promise.resolve(travellerRecord));
      }
    );
  },

  viewTraveller({ uid, date }) {
    return dbConnect(db =>
      dbCollection(db, _const.DetailsTable)
        .findOneAndUpdate({ user_id: sanitizeUserId(uid) }, { $set: { lastViewed: sanitize(date) } }, { returnOriginal: false }
          )).then(res => res.value ? Promise.resolve(res.value) : Promise.reject("Cesta nebola nájdená."));
  },

  updateTraveller({
      meno,
      text,
      start_date,
      uid,
      start_miesto,
      end_date,
      number,
      completed,
      email,
      finishedTracking
    }) {
    return dbConnect(db =>
      dbCollection(db, _const.DetailsTable)
        .findOneAndUpdate({ user_id: sanitizeUserId(uid) }, {
            $set: {
              meno: sanitize(meno), // nazov skupiny
              text: sanitize(text), // popis skupiny
              start_date: sanitize(start_date),
              end_date: sanitize(end_date),
              completed: sanitize(completed),
              user_id: sanitizeUserId(uid),
              start_miesto: sanitize(start_miesto),
              number: sanitize(number), // pocet ucastnikov
              email: sanitize(email), // 0 / 1 moznost kontaktovat po skonceni s dotaznikom
              finishedTracking: sanitize(finishedTracking),
              lastUpdated: momentDateTime()
            }
          }, { returnOriginal: false }
        )).then(res => res.value ? Promise.resolve(res.value) : Promise.reject("Cesta nebola nájdená."));
  },

  listFindBuddies(db) {
    return this.findBy(db, _const.FindBuddiesTable, {
      enabled: true,
      deleted: { $ne: true },
      start_date: { $gte: formatAsDate(new Date()) }
    }, {}, { start_date: 1 }).then(buddies => {
      return this.getUserNames(db, buddies.map(b => b.user_id))
        .then(users => {
          buddies.forEach(b => {
            b.name = this.findUserName(b.user_id, users); 
          });

          return buddies;
        })
    });
  },

  getFindBuddies(db, user_id, owner) {
    return Promise.all([
      this.findOne(db, _const.FindBuddiesTable, {
        enabled: owner ? { $in: [null, false, true] } : true,
        deleted: { $ne: true },
        user_id: user_id,
      }, {}),
      this.findOne(db, _const.UsersTable, { uid: user_id })])
      .then(([buddy, user]) => {
        if (buddy) {
          buddy.name = user.name;
          if (owner || buddy.showEmail) {
            buddy.email = user.email;
          }
        }

        return buddy;
      });
  },

  updateFindBuddies({
    enabled, showEmail, showComments,
    text,
    start_date,
    uid,
    start_miesto, end_miesto
  }) {
    const data = {
      enabled: sanitize(enabled),
      showEmail: sanitize(showEmail),
      showComments: sanitize(showComments),
      text: sanitize(text),
      start_date: sanitize(start_date),
      start_miesto: sanitize(start_miesto),
      end_miesto: sanitize(end_miesto) 
    };

  return dbConnect(db =>
    dbCollection(db, _const.FindBuddiesTable)
      .findOne({ user_id: uid, deleted: { $ne: true } }).then(existing => {
        if (existing) {
          data.lastUpdated = momentDateTime();
          return dbCollection(db, _const.FindBuddiesTable).findOneAndUpdate({ _id: existing._id }, {
              $set: data
            }, { returnOriginal: false })
            .then(res => res.value ? Promise.resolve(res.value) : Promise.reject("Inzerát nebol nájdený."));
        } else {
          data.created = momentDateTime();
          data.user_id = uid;
          return dbCollection(db, _const.FindBuddiesTable).insertOne(data)
            .then(res => {
              data._id = res.insertedId.toString();

              return Promise.resolve(data);
            });
        }
      })); 
  },

  deleteFindBuddies(uid) {
    return dbConnect(db =>
      dbCollection(db, _const.FindBuddiesTable)
        .findOneAndUpdate({ user_id: uid, deleted: { $ne: true } }, {
            $set: {
              deleted: true,
              del_date: momentDateTime()
            }
          }, { returnOriginal: false }
        )).then(res => res.value ? Promise.resolve(res.value) : Promise.reject("Inzerát nebol nájdený."));
  },

  sendMessage(message) {
    return dbConnect(db => {
      message.pub_date = momentDateTime();
      message.pub_date_milseconds = moment().valueOf();

      return dbCollection(db, _const.MessagesTable)
        .insertOne(securityCheck.sanitizeTravellerMessage(message))
        .then(msgRes => {
          message._id = msgRes.insertedId;

          return dbCollection(db, _const.DetailsTable)
            .findOneAndUpdate({ user_id: message.user_id }, {
                $set: {
                  finishedTracking: false,
                  end_date: ''
                }
              })
            .then(() => {
              console.log(`${message.user_id} reactivated`);
              return Promise.resolve(message);
            });
        });
    });
  },

  deleteMessage(id, uid) {
    return dbConnect(db =>
      dbCollection(db, _const.MessagesTable)
        .findOneAndUpdate({ $and: [{_id: new ObjectId(id) }, { user_id: uid }] }, { $set: {
          deleted: true,
          del_date: momentDateTime()
        }}, { returnOriginal: false })
        .then(res => {
          if (res.value) {
            return Promise.resolve(res.value);
          } else {
            return Promise.reject('Správa nebola nájdená.');
          }
        }));
  },
  
  setPoisItinerary(pois) {
    return dbConnect(db => 
      Promise.all(pois.map(item => 
        dbCollection(db, _const.PoisTable)
          .findOneAndUpdate({ _id: new ObjectId(item.poi._id) }, 
            { $set: { 
              'itinerary.near': item.near ? item.near.id : null,
              'itinerary.after': item.after ? item.after.id : null } },
            { returnOriginal: false })
      )).then(r => Promise.resolve(r.map(i => i.value)))
    );
  },

  addPoi(poi) {
    const sUid = sanitize(poi.user_id);

    return dbConnect(db => 
      dbCollection(db, _const.UsersTable)
        .findOne({ uid: sUid }).then(user => {
        poi.created = momentDateTime();

        if (!(poi.accuracy || poi.img_url || (user && user.articlesRole == 'admin'))) {
          return Promise.reject('Data is not valid.');
        }

        return dbCollection(db, _const.PoisTable)
          .insertOne(securityCheck.sanitizePoi(poi))
          .then(poiRes => {
            poi._id = poiRes.insertedId;

            return this.fillPoiInfo(db, poi._id, poi).then(poi => {
              return Promise.resolve(poi);
            });
          });
      })
    )
  },

  updatePoi({uid, id, note, ...poi}) {
    return dbConnect(db => {
      poi.modified_by = uid;
      poi.modified = momentDateTime();
      poi.modified_note = note;

      return dbCollection(db, _const.PoisTable)
        .findOne({ _id: new ObjectId(id) })
        .then(current => {
          if (!current) {
            return Promise.reject('Dôležité miesto nebolo nájdené.');
          }
          delete current._id;
          current.poiId = id;

          poi.user_id = current.user_id;
          poi.created = current.created;

          return dbCollection(db, _const.PoisHistoryTable)
            .insertOne(current).then(resInsert => {
              poi.historyId = resInsert.insertedId.toString();

              return dbCollection(db, _const.PoisTable)
                .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: securityCheck.sanitizePoi(poi) },
                  { returnOriginal: false })
                .then(res => {
                  if (res.value) {
                    return this.fillPoiInfo(db, res.value._id, res.value);
                  } else {
                    return Promise.reject('Dôležité miesto nebolo nájdené.');
                  }
                });
            });
        });
      });
  },

  getPois(db) {
    return this.findBy(db, _const.PoisTable)
      .then(pois => {
        const uids = this.getUids(pois, [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

        return this.getUserNames(db, uids).then(users => {
          pois.forEach(poi => {
            poi.created_by_name = this.findUserName(poi.user_id, users);
            poi.modified_by_name = this.findUserName(poi.modified_by, users);
            poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
          });

          return Promise.resolve(pois);
        });
      });
  },

  getPoisMy(db, uid) {
    const s_uid = sanitize(uid);

    return this.findBy(db, _const.UsersTable, { uid: s_uid })
    .then(user => { 
      const poisNotMy = (user[0].poisNotMy || []).map(v => new ObjectId(v));
      const poisMy = (user[0].poisMy || []).map(v => new ObjectId(v));

      return this.findBy(db, _const.PoisTable,
        { $and: [ 
          { _id: { $nin: poisNotMy} },
          { $or: [{ _id: { $in: poisMy } }, { user_id: s_uid }] }
        ] })
        .then(pois => {
          const uids = this.getUids(pois, [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

          return this.getUserNames(db, uids).then(users => {
            pois.forEach(poi => {
              poi.created_by_name = this.findUserName(poi.user_id, users);
              poi.modified_by_name = this.findUserName(poi.modified_by, users);
              poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
            });

            return Promise.resolve(pois);
          });
        });
      });
  },

  deletePoi(uid, id, note) {
    const sUid = sanitize(uid);

    return dbConnect(db => 
      dbCollection(db, _const.UsersTable)
        .findOne({ uid: sUid }).then(user =>
        dbCollection(db, _const.PoisTable)
          .findOneAndUpdate({ $and: [{ _id: new ObjectId(sanitize(id)) }, 
            user.articlesRole != "admin" ? { user_id: sUid } : {}] },
            { $set: { deleted: momentDateTime(), deleted_by: sUid, deleted_note: sanitize(note) } }, 
            { returnOriginal: false })
          .then(res => {
            if (res.value) {
              return this.fillPoiInfo(db, res.value._id, res.value);
            } else {
              return Promise.reject('Dôležité miesto nebolo nájdené.');
            }
        })));
  },

  togglePoiMy(uid, id) {
    const sId = sanitize(id);
    const sUid = sanitize(uid);

    return dbConnect(db => 
      dbCollection(db, _const.PoisTable)
      .findOne({ _id: new ObjectId(sId) }).then(poi => {
        if (!poi) {
          return Promise.reject('Dôležité miesto nebolo nájdené.');            
        }

        return dbCollection(db, _const.UsersTable)
        .findOne({ uid: sUid }).then(userDetails => {
          if (!userDetails) {
            return Promise.reject('Neexistujúci užívateľ.');
          }

          const isMy = 
            (userDetails.poisMy && userDetails.poisMy.indexOf(id) >= 0)
            || (poi.user_id == userDetails.uid && !(userDetails.poisNotMy && userDetails.poisNotMy.indexOf(id) >= 0));

          if (isMy) {
            userDetails.poisMy = (userDetails.poisMy || []).filter(t => t != id);
            userDetails.poisNotMy = userDetails.poisNotMy || [];

            if (poi.user_id == userDetails.uid && userDetails.poisNotMy.indexOf(id) < 0) {
              userDetails.poisNotMy.push(sId);
            }
          } else {
            userDetails.poisNotMy = (userDetails.poisNotMy || []).filter(t => t != id);
            userDetails.poisMy = userDetails.poisMy || [];

            if (poi.user_id != userDetails.uid && userDetails.poisMy.indexOf(id) < 0) {
              userDetails.poisMy.push(sId);
            }
          }

          return dbCollection(db, _const.UsersTable)
            .findOneAndUpdate({ uid: sUid },
            { $set: { 
              poisMy: userDetails.poisMy, 
              poisNotMy: userDetails.poisNotMy } }, 
            { returnOriginal: false })
          .then(res => {
            if (res.value) {
              return Promise.resolve(res.value);
            } else {
              return Promise.reject('Neexistujúci užívateľ.');
            }
          });
        });
     }));
  },

  getNearPoisCoordsFilter(coordinates) {
    return (!coordinates || (coordinates.length < 2)) ? _const.FilterNoResult : this.getNearPoisFilter(coordinates[1], coordinates[0]);
  },

  getNearPoisFilter(lat, lon) {
    if (!lat || !lon) {
      return _const.FilterNoResult;
    }

    const flat = parseFloat(lat);
    const flon = parseFloat(lon);

    return { $and: [_const.FilterPoiNotDeleted, 
      { $or: [{ 'coordinates.1': { $gt: flat - _const.NearMaxLatDistance } }, 
        { 'coordinates.1': { $gt: (flat - _const.NearMaxLatDistance).toFixed(6) } }]},
      { $or: [{ 'coordinates.1': { $lt: flat + _const.NearMaxLatDistance } }, 
        { 'coordinates.1': { $lt: (flat + _const.NearMaxLatDistance).toFixed(6) } }]},
      { $or: [{ 'coordinates.0': { $gt: flon - _const.NearMaxLonDistance } }, 
        { 'coordinates.0': { $gt: (flon - _const.NearMaxLonDistance).toFixed(6) } }]},
      { $or: [{ 'coordinates.0': { $lt: flon + _const.NearMaxLonDistance } }, 
        { 'coordinates.0': { $lt: (flon + _const.NearMaxLonDistance).toFixed(6) } }]},
    ] };
  },

  getNearArticlesCoordsFilter(coordinates) {
    return (!coordinates || (coordinates.length < 2)) ? _const.FilterNoResult : this.getNearArticlesFilter(coordinates[1], coordinates[0]);
  },

  getNearArticlesFilter(lat, lon) {
    if (!lat || !lon) {
      return _const.FilterNoResult;
    }

    const flat = parseFloat(lat);
    const flon = parseFloat(lon);

    return { $and: [_const.ArticlesFilterBy, 
      { $or: [{ lat: { $gt: flat - _const.NearMaxLatDistance } }, 
        { lat: { $gt: (flat - _const.NearMaxLatDistance).toFixed(6) } }] },
      { $or: [{ lat: { $lt: flat + _const.NearMaxLatDistance } }, 
        { lat: { $lt: (flat + _const.NearMaxLatDistance).toFixed(6) } }] },
      { $or: [{ lon: { $gt: flon - _const.NearMaxLonDistance } }, 
        { lon: { $gt: (flon - _const.NearMaxLonDistance).toFixed(6) } }] },
      { $or: [{ lon: { $lt: flon + _const.NearMaxLonDistance } }, 
        { lon: { $lt: (flon + _const.NearMaxLonDistance).toFixed(6) } }] },
    ] };
  },

  articleToPoi(a) {
    return { category: "clanok", id: `clanok${a.sql_article_id}`, 
      name: a.title, 
      text: a.introtext, 
      coordinates: (a.lat && a.lon) ? [a.lon, a.lat] : null, 
      url: `/pred/articles/article/${a.sql_article_id}` };
  },

  guidepostToPoi(g) {
    return { category: "razcestnik", id: `razcestnik${g.id}`, main: g.main, 
      name: `${g.name} ${g.ele ? ` ${g.ele}\u00A0m` : ''}`.trim(),
      coordinates: (g.lat && g.lon) ? [g.lon, g.lat] : null,
      url: `/pred/itinerar#razcestnik${g.id}` } 
  },

  fillPoiInfo(db, poiId, poiValue) {
    return Promise.all([
      poiValue,
      this.findBy(db, _const.PoisHistoryTable, { poiId: poiId.toString() } ,[], { modified: -1 }),
    ]).then(([poi, history]) => {
      if (!poi) {
        return Promise.reject('Dôležité miesto nebolo nájdené.');
      }

      const uids = this.getUids([poi].concat(history || []), [p => p.user_id, p => p.modified_by, p => p.deleted_by]);

      return Promise.all([
        this.findBy(db, _const.PoisTable, this.getNearPoisCoordsFilter(poi.coordinates)), 
        this.findBy(db, _const.ArticlesTable, this.getNearArticlesCoordsFilter(poi.coordinates), { projection: { fultext: 0 } }), 
        this.getUserNames(db, uids)]).then(([nearPois, nearArticles, users]) => {
        [poi].concat(history || []).forEach(poi => {
          poi.created_by_name = this.findUserName(poi.user_id, users);
          poi.modified_by_name = this.findUserName(poi.modified_by, users);
          poi.deleted_by_name = this.findUserName(poi.deleted_by, users);
        });

        poi.near = (nearPois || []).concat((nearArticles || []).map(a => this.articleToPoi(a)));
        sortNear(poi, poi.near, _const.NearMaxDistance);

        poi.history = history || [];

        poi.history.forEach(h => {
          if (h.itinerary && (h.itinerary.near || h.itinerary.after)) {
            h.guideposts = getNearGuideposts(h.itinerary.near || h.itinerary.after, h.coordinates).guideposts;
          }
        });

        if (poi.itinerary && (poi.itinerary.near || poi.itinerary.after)) {
          poi.guideposts = getNearGuideposts(poi.itinerary.near || poi.itinerary.after, poi.coordinates).guideposts;
        } else {
          poi.guideposts = findNearestGuideposts(findNearestPoint(poi.coordinates).coordinates).guideposts;
        }

        return Promise.resolve(poi);
      });
    });
  },

  getPoi(db, poiId) { 
    const sPoiId = sanitize(poiId);

    return this.fillPoiInfo(db, sPoiId, 
      dbCollection(db, _const.PoisTable).findOne({ _id: new ObjectId(sPoiId) }));
  },

  toggleArticleMy(uid, id) {
    const sId = sanitize(id);
    const sUid = sanitize(uid);

    return dbConnect(db => 
      dbCollection(db, _const.ArticlesTable).findOne({ sql_article_id: sId })
      .then(article => {
        if (!article) {
          return Promise.reject('Článok nebol nájdený.');            
        }

        return dbCollection(db, _const.UsersTable).findOne({ uid: sUid })
        .then(userDetails => {
          if (!userDetails) {
            return Promise.reject('Neexistujúci užívateľ.');
          }

          const isMy = 
            (userDetails.articlesMy && userDetails.articlesMy.indexOf(id) >= 0)
            || ((article.created_by == userDetails.uid || article.author == userDetails.uid) && !(userDetails.articlesNotMy && userDetails.articlesNotMy.indexOf(id) >= 0));

          if (isMy) {
            userDetails.articlesMy = (userDetails.articlesMy || []).filter(t => t != id);
            userDetails.articlesNotMy = userDetails.articlesNotMy || [];

            if ((article.created_by == userDetails.uid || article.author == userDetails.uid) && userDetails.articlesNotMy.indexOf(id) < 0) {
              userDetails.articlesNotMy.push(sId);
            }
          } else {
            userDetails.articlesNotMy = (userDetails.articlesNotMy || []).filter(t => t != id);
            userDetails.articlesMy = userDetails.articlesMy || [];

            if (article.created_by != userDetails.uid && article.author != userDetails.uid 
              && userDetails.articlesMy.indexOf(id) < 0) {
              userDetails.articlesMy.push(sId);
            }
          }

          return dbCollection(db, _const.UsersTable).findOneAndUpdate({ uid: sUid },
            { $set: { 
              articlesMy: userDetails.articlesMy, 
              articlesNotMy: userDetails.articlesNotMy } }, 
            { returnOriginal: false })
          .then(res => {
            if (res.value) {
              return Promise.resolve(res.value);
            } else {
              return Promise.reject('Neexistujúci užívateľ.');
            }
          });
        });
      }));
  },
  
  filterSimilarTags(article, similar, limit) {
    const result = similar.filter(a => article.sql_article_id != a.sql_article_id);
    const now = new Date();

    const tags = article.tags;
    result.sort((a, b) => {
      const as = a.tags.reduce((s, c) => s + (tags.indexOf(c) >= 0 ? 1 : 0), 0);
      const bs = b.tags.reduce((s, c) => s + (tags.indexOf(c) >= 0 ? 1 : 0), 0);

      return (as == bs) ? 
        (b.article_views / Math.max(1, Math.abs(differenceInDays(b.created, now))) 
          - a.article_views / Math.max(1, Math.abs(differenceInDays(b.created, now)))) 
        : (bs - as);
    });

    return result.slice(0, limit);
  },

  fillArticleInfo(db, sql_article_id, articleValue) {
    return Promise.all([
      articleValue,
      this.findBy(db, _const.ArticlesHistoryTable, { sql_article_id: sql_article_id }, {}, { modified: -1 }),
    ]).then(([article, history]) => {
      if (!article) {
        return Promise.reject('Článok nebol nájdený.');
      }

      const uids = this.getUids([article].concat(history || []), [p => p.created_by, 
        p => p.created_by_user_sql_id, p => p.modified_by, p => p.modified_by_user_sql_id, p => p.author]);

      return Promise.all([
        this.findBy(db, _const.PoisTable, this.getNearPoisFilter(article.lat, article.lon)), 
        this.findBy(db, _const.ArticlesTable, this.getNearArticlesFilter(article.lat, article.lon), { projection: { fultext: 0 } }), 
        this.findBy(db, _const.ArticlesTable, { $and: [_const.ArticlesFilterBy, { tags: { $in: article.tags } }] },
          { projection: { fultext: 0 } }),
        this.getUserNames(db, uids)
      ]).then(([nearPois, nearArticles, similarArticles, users]) => {
        [article].concat(history || []).forEach(a => {
          if (!a.created_by) {
             a.created_by = a.created_by_user_sql_id; 
          }

          if (!a.modified_by) {
            a.modified_by = a.modified_by_user_sql_id; 
          }

          a.created_by_name = this.findUserName(a.created_by || a.created_by_user_sql_id, users); 
          a.modified_by_name = this.findUserName(a.modified_by || a.modified_by_user_sql_id, users);
          a.author_name = this.findUserName(a.author, users);
        });

        article.related = (nearPois || []).concat(((nearArticles || [])
          .concat(this.filterSimilarTags(article, similarArticles || [], _const.ArticlesRelatedByTagsCount))).map(a => this.articleToPoi(a)));  
        sortNear(this.articleToPoi(article), article.related, _const.NearMaxDistance);

        article.history = history || [];

        return Promise.resolve(article);
      });
    });
  },

  getArticlesMy(db, uid) {
    const s_uid = sanitize(uid);

    return this.findBy(db, _const.UsersTable, { uid: s_uid })
    .then(user => this.findBy(db, _const.ArticlesTable,
        { $and: [ 
          { sql_article_id: { $nin: (user[0].articlesNotMy || []) } },
          { $or: [{ sql_article_id: { $in: (user[0].articlesMy || []) } }, { created_by: s_uid }, { author: s_uid }] },
        ]})
      .then(articles => {
        const uids = this.getUids(articles, [p => p.created_by, 
          p => p.created_by_user_sql_id, p => p.modified_by, p => p.modified_by_user_sql_id, p => p.author]);

        return this.getUserNames(db, uids).then(users => {
          articles.forEach(a => {
            if (!a.created_by) {
              a.created_by = a.created_by_user_sql_id; 
            }
  
            if (!a.modified_by) {
              a.modified_by = a.modified_by_user_sql_id; 
            }

            a.created_by_name = this.findUserName(a.created_by || a.created_by_user_sql_id, users) 
            a.modified_by_name = this.findUserName(a.modified_by || a.modified_by_user_sql_id, users);
            a.author_name = this.findUserName(a.author, users);
          });

          return Promise.resolve(articles);
        });
      }));
  },

  addArticle(article) {
    return dbConnect(db => {
      article.created = momentDateTime(); 
      article.sql_article_id = sanitize(parseInt(article.sql_article_id));

      return dbCollection(db, _const.UsersTable)
        .findOne({ uid: article.created_by }).then(user => {

          if (user.articlesRole != "admin") {
            article.state = -1;
          }

          return this.findBy(db, _const.ArticlesTable, { sql_article_id: article.sql_article_id }).then( duplicate => {

            if (duplicate && duplicate.length > 0) {
              return Promise.reject(`Článok s ID ${article.sql_article_id} už existuje.`);
            }

            return dbCollection(db, _const.ArticlesTable)
              .insertOne(securityCheck.sanitizeArticle(article))
              .then((articleRes) => {
                article._id = articleRes.insertedId;

                return this.fillArticleInfo(db, article.sql_article_id, article).then(article => {
                  return Promise.resolve(article);
                });
              });
        });
      });
    });
  },

  updateArticle({uid, sql_article_id, note, ...article}) {
    return dbConnect(db => {
      const s_id = sanitize(parseInt(sql_article_id));
      const s_uid = sanitize(uid);
      article.modified_by = s_uid;
      article.modified = momentDateTime();
      article.note = sanitize(note);
      article.sql_article_id = s_id;

      return dbCollection(db, _const.UsersTable)
        .findOne({ uid: s_uid }).then(user => {

        if (user.articlesRole != "admin") {
          article.state = -1;
        }

        const forReview = (article.state == -1);

        return dbCollection(db,_const.ArticlesTable)
          .findOne({ sql_article_id: s_id }).then(current => {
            if (!current) {
              return Promise.reject('Článok nebol nájdený.');
            }
            
            if (!forReview) {
              delete current._id;
            }

            article.created_by = current.created_by || current.created_by_user_sql_id;
            article.created = current.created;

            return dbCollection(db, _const.ArticlesHistoryTable)
              .insertOne(forReview ? securityCheck.sanitizeArticle(article) : current).then(resInsert => {
                if (forReview) {
                  return this.fillArticleInfo(db, s_id, current).then(r =>
                    Object.assign({ reviewId: resInsert.insertedId.toString() }, r));
                } 
                
                article.historyId = resInsert.insertedId.toString();

                return dbCollection(db, _const.ArticlesTable)
                  .findOneAndUpdate({ sql_article_id: s_id }, { $set: securityCheck.sanitizeArticle(article) },
                    { returnOriginal: false })
                  .then(res => {
                    if (res.value) {
                      return this.fillArticleInfo(db, res.value.sql_article_id, res.value);
                    } else {
                      return Promise.reject('Článok nebol nájdený.');
                    }
                  });
              });
          });
        });
    });
  },
};

module.exports = DB;
