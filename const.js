const InterestingShowCount = 8;
const InterestingPrevMonths = 7;
const MinRating = 20;
const CommentRating = 1;
const ImageRating = 5;
const TextRatingPerChar = 1/50;

const Minute = 60 * 1000;
const Hour = Minute * 60;
const Day = Hour * 14;

const HomeArticlesCount = 2;
const PageSize = 8;
const NearPoisWarningDistance = 500; //m

const NearMaxLatDistance = 1/20; // in °
const NearMaxLonDistance = 1/16; // in °

const NearMaxDistance = 5000; // in m

const ArticlesRelatedByTagsCount = 5;
const ArticlesFilterTagsAllowed = ['rozhovory'];
const ArticlesFilterTagsNotAllowed = ['akcie',
  'spravy-z-terenu',
  'spravy_z_terenu',
  'oznamy',
  'akcie-ostatne',
  'nezaradene'];
const ArticlesFilterBy = { $and: [{ state: { $gt: 0 } }, {
  $or: [
  { tags: {$in: ArticlesFilterTagsAllowed}},
  { tags: {
    $nin: ArticlesFilterTagsNotAllowed
  }
}]}]};

const FilterNoResult = { _id: null };
const FilterPoiNotDeleted = { deleted: null };
const FilterNotDeleted = { deleted: { $ne: true }};

const EscapeImgFormat = 'c_limit,w_1200,h_1200,f_auto';
const EscapeImageKitFormat = 'tr=w-1200,h-1200,c-at_max';

const ProjectionMessageWithImage = { lon: 1, lat: 1, text: 1, pub_date: 1, user_id: 1, 'img.secure_url' : 1, 'img.url': 1, 'img.width' : 1, 'img.height' : 1 };
const ProjectionCommentSecure = { ip: 0, email: 0 };

const UsersTable = "users";
const DetailsTable = "traveler_details";
const FindBuddiesTable = "traveler_find_buddies";
const ArticlesTable = "articles";
const ArticlesHistoryTable = "articles_history";
const PoisTable = "pois";
const PoisHistoryTable = "pois_history";
const MessagesTable = "traveler_messages";
const CommentsTable = "traveler_comments";
const ArticleCommentsTable = "article_comments";
const FindBuddiesCommentsTable = "find_buddies_comments";

const DetailNamesTable = "traveler_detail_names";

module.exports = {
  Minute, Hour, Day,
  InterestingShowCount, InterestingPrevMonths, MinRating, CommentRating, ImageRating, TextRatingPerChar, 
  ArticlesRelatedByTagsCount, ArticlesFilterTagsAllowed, ArticlesFilterTagsNotAllowed,
  ArticlesFilterBy, FilterNoResult, FilterPoiNotDeleted, FilterNotDeleted, 
  EscapeImgFormat, EscapeImageKitFormat, ProjectionMessageWithImage, ProjectionCommentSecure,
  HomeArticlesCount, PageSize, NearPoisWarningDistance,
  NearMaxLatDistance, NearMaxLonDistance, NearMaxDistance,
  UsersTable, DetailsTable, ArticlesTable, ArticlesHistoryTable, PoisTable, PoisHistoryTable,
  MessagesTable, CommentsTable, ArticleCommentsTable,
  DetailNamesTable, FindBuddiesTable, FindBuddiesCommentsTable
};