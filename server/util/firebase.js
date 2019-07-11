
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(`{
  "type": "service_account",
  "project_id": "cestasnp-sk",
  "private_key_id": "${process.env.FIREBASE_PRIVATE_KEY_ID}",
  "private_key": "-----BEGIN PRIVATE KEY-----${process.env.FIREBASE_PRIVATE_KEY}-----END PRIVATE KEY-----",
  "client_email": "${process.env.FIREBASE_CLIENT_EMAIL}",
  "client_id": "${process.env.FIREBASE_CLIENT_ID}",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "${process.env.FIREBASE_CLIENT_CERT_URL}"
}`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cestasnp-sk.firebaseio.com"
});

module.exports = {
  admin
}