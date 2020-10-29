const cloudinary = require('cloudinary');
const express = require('express');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDIN_PUB,
  api_secret: process.env.CLOUDIN_SEC
});

router.post('/generateSignature', (req, res) => {
  const signature = cloudinary.utils.api_sign_request(
    req.body,
    process.env.CLOUDIN_SEC
  );
  res.json(signature);
});

module.exports = router;
