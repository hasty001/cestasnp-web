const InterestingShowCount = 8;
const InterestingPrevMonths = 7;
const MinRating = 20;
const CommentRating = 1;
const ImageRating = 5;
const TextRatingPerChar = 1/50;

const HomeArticlesCount = 2;
const PageSize = 8;
const NearPoisWarningDistance = 500; //m

const NearMaxLatDistance = 1/20; // in °
const NearMaxLonDistance = 1/16; // in °

const NearMaxDistance = 5000; // in m

const ArticlesRelatedByTagsCount = 5;
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

const FilterNoResult = { _id: null };
const FilterPoiNotDeleted = { deleted: null };
const FilterNotDeleted = { deleted: { $ne: true }};

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
  ArticlesRelatedByTagsCount, ArticlesFilterBy, FilterNoResult, FilterPoiNotDeleted, FilterNotDeleted, 
  HomeArticlesCount, PageSize, NearPoisWarningDistance,
  NearMaxLatDistance, NearMaxLonDistance, NearMaxDistance,
  UsersTable, DetailsTable, ArticlesTable, ArticlesHistoryTable, PoisTable, PoisHistoryTable,
  MessagesTable, CommentsTable, ArticleCommentsTable
};