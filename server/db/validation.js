const Validation = function() {};

Validation.prototype = {
  checkCommentOldTraveller: function(comment) {
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
    } else {
      return false;
    }
  },

  checkCommentNewTraveller: function(comment) {
    if (
      typeof comment.date === 'string' &&
      typeof comment.lang === 'string' &&
      typeof comment.comment === 'string' &&
      typeof comment.name === 'string' &&
      typeof comment.ip === 'string' &&
      typeof comment.travellerDetails.id === 'string' &&
      typeof comment.travellerDetails.name === 'string'
    ) {
      return true;
    } else {
      return false;
    }
  }
};

module.exports = Validation;
