const InterestingShowCount = 8;
const InterestingPrevMonths = 7;
const MinRating = 20;
const CommentRating = 1;
const ImageRating = 5;
const TextRatingPerChar = 1/50;

const HomeArticlesCount = 2;
const PageSize = 8;
const NearPoisWarningDistance = 500; //m

const ArticlesFilterBy = { $and: [{ state: { $gt: 0 } }, {
  $or: [
  { tags: {$in: ['rozhovory']}},
  { tags: {
    $nin: [
      'akcie',
      'spravy-z-terenu',
      'spravy_z_terenu',
      'oznamy',
      'akcie-ostatne',
      'nezaradene'
    ]
  }
}]}]};

const UsersTable = "users";
const DetailsTable = "traveler_details";
const ArticlesTable = "articles";
const ArticlesHistoryTable = "articles_history";
const PoisTable = "pois";
const PoisHistoryTable = "pois_history";
const MessagesTable = "traveler_messages";
const CommentsTable = "traveler_comments";
const ArticleCommentsTable = "article_comments";

module.exports = {
  InterestingShowCount, InterestingPrevMonths, MinRating, CommentRating, ImageRating, TextRatingPerChar, 
  ArticlesFilterBy, HomeArticlesCount, PageSize, NearPoisWarningDistance, 
  UsersTable, DetailsTable, ArticlesTable, ArticlesHistoryTable, PoisTable, PoisHistoryTable,
  MessagesTable, CommentsTable, ArticleCommentsTable
};