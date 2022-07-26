const config = {};

config.db = {
    host: 'localhost',
    port: 3306,
    database:'mmpay_enduser',
    user: 'root',
    password: ''
	/* user: 'centos',
    password : '50TnecMySQ!', */
}

config.passportsession = {
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
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

//facebook
const Guid = require("guid");
const csrf_guid = Guid.raw();
const account_kit_api_version = 'v1.0';
const app_id = '710368086026332';
const app_secret = '09a012d0068babe138047993a6cf56c5';
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.0/me';
const token_exchange_base_url = 'https://graph.accountkit.com/v1.0/access_token';

config.facebook = {
    app_id : app_id,
    app_secret : app_secret,
    me_endpoint_base_url : me_endpoint_base_url,
    token_exchange_base_url : token_exchange_base_url,
    csrf_guid : csrf_guid
}
config.facebook_accountkit_data = {
    app_id : app_id,
    csrf : csrf_guid,
    version : account_kit_api_version
}


*/

module.exports = config;