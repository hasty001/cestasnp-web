const ImageKit = require("imagekit");
const express = require('express');

const router = express.Router();

router.get('/sign', (req, res) => {
  const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : `https://ik.imagekit.io/${process.env.IMAGEKIT_NAME}/`
  });
  
  const result = imagekit.getAuthenticationParameters();
  res.json(result);
});

module.exports = router;
