/* TODO
1 - Verify cookie on db/compact queries

*/

// Imports
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path'); 
var fs = require('fs'); 
var crypto = require('crypto');
var cron = require('node-cron');
const rateLimit = require("express-rate-limit");
var jwt = require('jsonwebtoken');
const { resolve } = require('path');
const { readdir } = require('fs').promises;

var keys = require('./Keys');


//Specify port
const port = 3000

var default_token_secret='wowza69'

//Create express app
var app = express(); 

//	Debug settings
const debug_mode=true;

//Initalize Server-side RSA (required for generating login cookies)
const NodeRSA = require('node-rsa');
const key = new NodeRSA();

//Set padding pkcs1
const options = {
  encryptionScheme: {
    scheme:'pkcs1'
  }
};

key.setOptions(options);

// Static Files
app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Serve html
app.get('', (req, res) => {
    res.sendFile(__dirname + '/public/html/title.html')
})

//	Print debugging message if enabled
function debug_print(msg){
	if (debug_mode){
		console.log(msg);
	}
}
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));


//	Normalize string for hashing
function strip_string(string){
	return string.toLowerCase().replace(/\s+/g, '').replace(/\./g, "");
}

function hashable_sha256_strip(string){
	var hash = crypto.createHash('sha256');
	var data = hash.update(strip_string(string), 'utf-8');
	return data.digest('base64url');
}
function hashable_sha256_strip_hex(string){
	var hash = crypto.createHash('sha256');
	var data = hash.update(strip_string(string), 'utf-8');
	return data.digest('hex');
}



function hashable_sha256(string){
	var hash = crypto.createHash('sha256');
	var data = hash.update(string, 'utf-8');
	return data.digest('base64url');
}


function write_file(fs_folder, fs_name, fs_content) {
	fs.writeFileSync(fs_folder + "/" + String(fs_name), fs_content, function(err) {
		if(err) console.log(err);
	});
}

function read_file(fs_folder, fs_name) {
	return fs.readFileSync(fs_folder + "/" + fs_name, {
		encoding: 'utf8',
		flag: 'r'
	});
}

function fileExists(fs_folder, fs_name) {
	if(fs.existsSync(fs_folder + '/' + fs_name)) {
		return true;
	} else {
		return false;
	}
}

async function* getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

//	Detect folders on server
var private_Folder = './private';
if(!fs.existsSync(private_Folder)) {
	fs.mkdirSync(private_Folder);
}

var user_Folder = './private/users';
if(!fs.existsSync(user_Folder)) {
	fs.mkdirSync(user_Folder);
}
var conversations_Folder = './private/conversations';
if(!fs.existsSync(conversations_Folder)) {
	fs.mkdirSync(conversations_Folder);
}


//	Authenticate a token and ensure it is for the user claiming it
function token_authenticate(token, user) {
	if(token == null || user == null) {
		return false;
	}
	try {
		var decoded = jwt.verify(token, default_token_secret);
		console.log(decoded);
		if(decoded.data.user == user && fileExists(user_Folder, user)) {
			return true;
		} else {
			console.log('nouser');
			return false;
		}
	} catch (err) {
		console.log('err');
		return false;
	}
}

//	Generate a login token using jsonwebtoken library
function generateToken(_user) {
	const data = {
		user: _user
	};
	const signature = default_token_secret;
	const expiration = '6h';

	return jwt.sign({
		data,
	}, signature, {
		expiresIn: expiration
	});
}


//Query database to determine if user exists, respond 0 for no 1 for yes.
app.post('/userExists', function(req, res) {
    var response = {};
	var username = hashable_sha256_strip(req.body.user);
	//Query server for existence of user
	if (fileExists(user_Folder,username)) {
		response.response = true;
        res.send(response);
	}else{
		response.response = false;
		res.send(response);
	}
});

//Request the public key of a user
app.post('/fetchPublic', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	//Query server for existence of user
	if (fileExists(user_Folder,username)) {
		response.response = JSON.parse(read_file(user_Folder,username)).pubKey;
        res.send(response);
	}else{
		response.invalid = true;
		res.send(response);
	}
});


//UPDATED
app.post('/fetchCookie', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var user_data=JSON.parse(read_file(user_Folder,username));
	try{
		key.importKey({
			n: Buffer.from(user_data.pubKey, 'hex'),
			e: 65537,
		}, 'components-public');
		var buffer = Buffer.from(user_data.secret);
		response.response = key.encrypt(buffer,'buffer', 'hex').toString('hex');
		res.send(response);
	}catch(error){
		response.response = false;
		res.send(response);
	}
});


//UPDATED 
app.post('/login', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var secret=req.body.secret;
	var user_data=JSON.parse(read_file(user_Folder,username));
	if (user_data.secret==secret){
		response.token=generateToken(username)
		res.send(response);
	}else{
		response.invalid = true;
		res.send(response);
	}
});

//UPDATED
app.post('/cheapCreate', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var key = req.body.key;
	var user={};
	//Create user's secret
	require('crypto').randomBytes(48, function(err, buffer) {
		user.secret=buffer.toString('hex');
		user.pubKey=key;
		user.meta={};
		user.connections={};
		if (fileExists(user_Folder,username)){
			response.response = 0;
			res.send(response);
		}else{
			write_file(user_Folder,username,JSON.stringify(user));
			response.response = 1;
			res.send(response);
		}
	});	
});


//Save user's contact/settings
app.post('/updateMeta', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var token = req.body.token;
	var meta = req.body.meta;
	if (token_authenticate(token,username)){
		var user_obj=JSON.parse(read_file(user_Folder,username));
		user_obj.meta=meta;
		write_file(user_Folder,username,JSON.stringify(user_obj));
		response.response=1;
		res.send(response);
	}else{
		response.response=0;
		res.send(response);
	}
	/*
	var obj = {response:0};
	var edituserSQL =  "CALL fetchCookie(?)";
	connection.query(edituserSQL, [req.body.user], function(ERROR,results,fields) {
		if (ERROR) { 
			console.log("SQL error"); 
		} else {
			console.log("Update meta, debug: "+results[0][0]);
			let result = JSON.parse(JSON.stringify(results[0][0]));
			var serverSide=result.cookie;
			if (serverSide===req.body.cookie){
				edituserSQL =  "CALL updateMeta(?,?)";
				connection.query(edituserSQL, [req.body.user,req.body.meta], function(ERROR,results,fields) {
					if (ERROR) { 
						console.log("SQL error"); 
					} else {
						obj.response=1;
						res.send(obj);
					}
				});
			}else{
				res.send(obj);
			}
		}
	});*/
});

//Fetch user's personalization data
app.post('/fetchMeta', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var token = req.body.token;
	if (token_authenticate(token,username)){
		var usb_obj=JSON.parse(read_file(user_Folder,username));
		response.response=usb_obj.meta;
		res.send(response);
	}else{
		response.response=0;
		res.send(response);
	}
	
	/*var obj = {response:0};
	var edituserSQL =  "CALL fetchCookie(?)";
	connection.query(edituserSQL, [req.body.user], function(ERROR,results,fields) {
		if (ERROR) { 
			console.log("SQL error"); 
		} else {
			result = JSON.parse(JSON.stringify(results[0][0]));
			var serverSide=result.cookie;
			if (serverSide===req.body.cookie){
				edituserSQL =  "CALL fetchMeta(?)";
				connection.query(edituserSQL, [req.body.user], function(ERROR,results,fields) {
					if (ERROR) { 
						console.log("SQL error"); 
					} else {
						result = JSON.parse(JSON.stringify(results[0][0]));
						obj.response=result.meta;
						res.send(obj);
					}
				});
			}else{
				res.send(obj);
			}
		}
	});*/
});


app.post('/postMessage', function(req, res){
	var response = {};
	var from = hashable_sha256_strip_hex(req.body.from);
	var to = hashable_sha256_strip_hex(req.body.to);
	var msg = req.body.msg;
	var token_user_hash=hashable_sha256_strip(req.body.from);
	var token = req.body.token;
	if (token_authenticate(token,token_user_hash)){
		//console.log('test1: '+parseInt(from,16));
		//console.log('test1: '+String(parseInt(from,16)+parseInt(to,16)));
		var to_user_obj=JSON.parse(read_file(user_Folder,hashable_sha256_strip(req.body.to)));
		if (to_user_obj.connections==null){
			to_user_obj.connections={};
		}
		if (to_user_obj.connections[req.body.from]==null){
			to_user_obj.connections[req.body.from]=true;
		}
		write_file(user_Folder,hashable_sha256_strip(req.body.to),JSON.stringify(to_user_obj));
		
		var msg_dir=hashable_sha256(String(parseInt(from,16)+parseInt(to,16)));
		var conversation = conversations_Folder+'/'+msg_dir;
		console.log('Conversation dir: '+conversation);
		if(!fs.existsSync(conversation)) {
			fs.mkdirSync(conversation);
		}
		var index_init={"head":0,"tail":-50,"state":0,"id":msg_dir};
		if (!fileExists(conversation,'conversation.indx')){
			var migration_init={};
			write_file(conversation,'conversation.indx',JSON.stringify(index_init));
		}
		var convo_index=JSON.parse(read_file(conversation,'conversation.indx'));
		write_file(conversation,convo_index.head,msg);
		convo_index.head++;
		if (convo_index.head>50){
			convo_index.head=0;
		}
		convo_index.tail++;
		if (convo_index.tail>50){
			convo_index.tail=0;
		}
		convo_index.state++;
		write_file(conversation,'conversation.indx',JSON.stringify(convo_index));
		response.response = true;
		res.send(response);
	}else{
		response.invalid = true;
		res.send(response);
	}
});

app.post('/fetch_connections', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var token=req.body.token;
	if (token_authenticate(token,username)){
		var usb_obj=JSON.parse(read_file(user_Folder,username));
		response.connections=usb_obj.connections;
		res.send(response);
	}else{
		response.invalid = true;
		res.send(response);
	}
});
/*
app.post('/c_connection', function(req, res){
	var response = {};
	var username = hashable_sha256_strip(req.body.user);
	var added = hashable_sha256_strip(req.body.user);
	var token=req.body.token;
	if (token_authenticate(token,username)){
		var usb_obj=JSON.parse(read_file(user_Folder,username));
		response.connections=usb_obj.connections;
		res.send(response);
	}else{
		response.invalid = true;
		res.send(response);
	}
});
*/
app.post('/fetch_conversation', function(req, res){
	var response = {};
	var members = hashable_sha256(String(req.body.members));
	console.log(String(req.body.members));
	var conversation = conversations_Folder+'/'+members;
	console.log('opening convo: '+conversation);
	(async () => {
	  for await (const f of getFiles(conversation)) {
		  console.log('processing msgdata: '+f);
		 response[f.split(/(\\|\/)/g).pop()]=fs.readFileSync(f,
            {encoding:'utf8', flag:'r'});
	  }
	})().then(function(a){
		sleep(1000).then(() => { // there is a much better way of doing this but i dont wanna rewrite it rn
		console.log('packed: '+response['0']);
		res.send(response);
		});
	}).catch(function(error){console.log('prematuresend');res.send(response);});
});

//UPDATED 
app.post('/fetch_conversation_index', function(req, res){
	var response = {};
	var id = req.body.id;
	console.log(id);
	if (fileExists(conversations_Folder+'/'+id,'conversation.indx')){
		var file_obj=JSON.parse(read_file(conversations_Folder+'/'+id,'conversation.indx'));
		response.index=file_obj;
		res.send(response);
	}else{
		response.invalid=true;
		res.send(response);
	}
	
	
});

//Launch server
app.listen(port, () => console.info(`Server running on port ${port}`))