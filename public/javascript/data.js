

var debug=1; //0 - disabled; 1 - enabled (print to console)


//Site data
var username="";
var username_sha256b64="";
var user_password="";
var stage=0;
var padlock=0;
var padlockString="";
var friend="";
var recipients=[];
var createFlag=0;
var contacts={};
var contact_keys={};
var running_convo=false;
//RSA key (stored in javascript runtime)
var rsa;
var signing_rsa;

//Custom configuration variables
var key_size=2048;//2048,3072,4096

//Experimental cookie system
var REALcookie="";
var conversation_ID;
var conversation;
var conversation_index;
