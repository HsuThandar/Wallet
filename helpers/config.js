const config = {};
config.domainname = 'mmPay';
config.db = {
    host: 'localhost',
    port: 3306,
    database:'mmpay_enduser',
	user: 'root',
    password : '', 
    /* user: 'mmpayEnduser',
    password : 'nE45jj*&wd', */
}

config.passportsession = {
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
}

config.api = {
    callback_link : 1,
    Funds_amount_for_business_acc : 10000,
    commission_fee: 10 // 10%
}



//https://console.cloud.google.com
//project name  = admin panel
/*
config.googleAuth = {
    clientID: '92119749174-refn86qg4q2q9auukqv7c970gof632aa.apps.googleusercontent.com',
    clientSecret: "xtvDU9NIdj0oTjrsz5iRt-5P",
    callbackURL: "http://localhost:1000/google/callback",
    accessType: 'offline',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
}
*/
//facebook
const Guid = require("guid");
const csrf_guid = Guid.raw();
const account_kit_api_version = 'v1.0';
const app_id = '668542890306089';
const app_secret = '03a69f78a5c78e2b0a930b29d0e19292';
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.0/me';
const token_exchange_base_url = 'https://graph.accountkit.com/v1.0/access_token';

config.facebook = {
    app_id : app_id,
    app_secret : app_secret,
    // me_endpoint_base_url : me_endpoint_base_url,
    // token_exchange_base_url : token_exchange_base_url,
    // csrf_guid : csrf_guid
}
config.facebook_accountkit_data = {
    app_id : app_id,
    csrf : csrf_guid,
    version : account_kit_api_version
}

config.google_oauth_client = {
    GOOGLE_CLIENT_ID : '92119749174-d1nas4hf9p8ri2bot2dr1uou912n7qsp.apps.googleusercontent.com',
    GOOGLE_CLIENT_SECRET : 'YU7l7QU5xmYDxFI_6EWbyH_d'
}

config.google_reCAPTCHA = {
    site_key : '6LexpsQUAAAAACEr40tEPDAqFc43iHoIMnDhXPI6',
    secret_key : '6LexpsQUAAAAAOP58Z6zOQgg9yhtgwn3zUIXS9ZJ'
}

module.exports = config;