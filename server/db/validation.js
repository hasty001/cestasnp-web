const sanitize = require('mongo-sanitize');
const { sanitizeUserId } = require('../util/checkUtils');

// eslint-disable-next-line func-names
const Validation = function() {};

Validation.prototype = {
  checkCommentOldTraveller(comment) {
    if (
      typeof comment.date === 'string' &&
      typeof comment.lang === 'string' &&
      typeof comment.sql_user_id === 'number' &&
      typeof comment.parent === 'number' &&
      typeof comment.path === 'number' &&
      typeof comment.level === 'number' &&
      typeof comment.object_group === 'string' &&
      typeof comment.object_params === 'string' &&
      typeof comment.email === 'string' &&
      typeof comment.homepage === 'string' &&
      typeof comment.title === 'string' &&
      typeof comment.isgood === 'number' &&
      typeof comment.ispoor === 'number' &&
      typeof comment.published === 'number' &&
      typeof comment.subscribe === 'number' &&
      typeof comment.source === 'string' &&
      typeof comment.source_id === 'number' &&
      typeof comment.checked_out === 'number' &&
      typeof comment.checked_out_time === 'string' &&
      typeof comment.editor === 'string' &&
      typeof comment.comment === 'string' &&
      typeof comment.name === 'string' &&
      typeof comment.username === 'string' &&
      typeof comment.ip === 'string' &&
      typeof comment.article_sql_id === 'number'
    ) {
      return true;
    }
    return false;
  },

  checkCommentNewTraveller(comment, findBuddies = false) {
    if (
      typeof comment.date === 'string' &&
      typeof comment.lang === 'string' &&
      typeof comment.comment === 'string' &&
      typeof comment.name === 'string' &&
      typeof comment.ip === 'string' &&
      ((!findBuddies &&
      typeof comment.travellerDetails.id === 'string' &&
      typeof comment.travellerDetails.name === 'string') || 
      (findBuddies && typeof comment.findBuddiesId === 'string'))
    ) {
      return true;
    }
    return false;
  },

  sanitizeTravellerMessage(msg) {
    const {
      lon,
      lat,
      accuracy,
      text,
      pub_date,
      user_id,
      img,
      pub_date_milseconds,
      details_id
    } = msg;
    return {
      lon: sanitize(lon),
      lat: sanitize(lat),
      accuracy: sanitize(accuracy),
      text: sanitize(text),
      pub_date: sanitize(pub_date),
      user_id: sanitizeUserId(user_id),
      img: sanitize(img),
      pub_date_milseconds: sanitize(pub_date_milseconds),
      details_id: sanitize(details_id)
    };
  },

  sanitizePoi(poi) {
    const {
      coordinates,
      accuracy,
      category,
      name,
      text,
      user_id,
      img_url,
      food,
      water,
      uncertain,
      created,
      itineraryNear,
      itineraryAfter,
      itineraryInfo,
      historyId,
      modified,
      modified_by,
      modified_note
    } = poi;
    return {
      coordinates: sanitize(coordinates),
      accuracy: sanitize(accuracy),
      category: sanitize(category),
      name: sanitize(name),
      text: sanitize(text),
      created: sanitize(created),
      user_id: sanitizeUserId(user_id),
      img_url: sanitize(img_url),
      food: sanitize(food),
      water: sanitize(water), 
      uncertain: sanitize(uncertain), 
      itinerary: (itineraryNear || itineraryAfter || itineraryInfo) ?
        { near: sanitize(itineraryNear), after: sanitize(itineraryAfter), info: sanitize(itineraryInfo) }
        : null,
      historyId: sanitize(historyId),
      modified: sanitize(modified),
      modified_by: sanitizeUserId(modified_by),
      modified_note: sanitize(modified_note)
    };
  },

  sanitizeArticle(article) {
    const {
      lat,
      lon,
      accuracy,
      state,
      tags,
      title,
      introtext,
      fulltext,
      sql_article_id,
      created,
      created_by,
      modified,
      modified_by,
      note,
      historyId,
      author,
      author_text
    } = article;
    return {
      lat: sanitize(lat),
      lon: sanitize(lon),
      accuracy: sanitize(accuracy),
      state: sanitize(parseInt(state)),
      tags: sanitize(tags),
      title: sanitize(title),
      introtext: sanitize(introtext),
      fulltext: sanitize(fulltext),

      sql_article_id: sanitize(parseInt(sql_article_id)),
      created: sanitize(created),
      created_by: sanitizeUserId(created_by),
      modified: sanitize(modified),
      modified_by: sanitizeUserId(modified_by),

      author: sanitizeUserId(author),
      author_text: sanitize(author_text),

      note: sanitize(note),
      historyId: sanitize(historyId)
    };
  }
};

module.exports = Validation;
