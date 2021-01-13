const InterestingShowCount = 8;
const InterestingPrevMonths = 7;
const MinRating = 20;
const CommentRating = 1;
const ImageRating = 5;
const TextRatingPerChar = 1/50;

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

module.exports = {
  InterestingShowCount, InterestingPrevMonths, MinRating, CommentRating, ImageRating, TextRatingPerChar, ArticlesFilterBy
};