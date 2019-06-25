var express = require('express');
var router = express.Router();
const axios = require('axios')
const https = require('https')

//Axios instance (so that it doesn't reject self-signed certificates)
//Can remove later when a non-self-signed cert is used
const instance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false
	})
})

/* GET home page. */
router.get('/', function(req, res, next) {
	instance({
	//axios({
		method: 'post',
		url: 'https://localhost:3000/oauth/token',
		data: {
			code: req.query.code,
			redirect_uri: 'http://localhost:4000/callback',
			client_id: 'abc123',
			client_secret: 'ssh-secret',
			grant_type: 'authorization_code'
		}
	})
	.then(result => {
		console.log(result.data)
		res.render('callback', {code: req.query.code, token: result.data.access_token})
	})
});

module.exports = router;
