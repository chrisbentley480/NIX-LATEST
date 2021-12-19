
//Scrap/misc javascript functions



function workerPadlock(){
	// figure out way to offload javascript to webworker to stop UI from being blocked??
}

//Function for padlock buttons
function buttonEvent(id){
	$("#"+id).css('opacity', '0');
	$("#"+id).prop("disabled",true);
	var frag="";
	padlockString+=$("#"+id).html()+id.toString('base64')+rgb2hex($("#"+id).css('background-color')).toString('base64');
	if (debug){
		console.log("PADLOCKSTRING: " +padlockString);
	}
	padlock++;
	if (padlock>=4){
	$("#padlockSubmission").show();
	}
	
}

//Function to set focus to contact
function messageContact(newFriend){
	recipients=[];
	friend=newFriend;
	recipients.push(newFriend);
	$("#messageWindow").removeClass("hidden"); 
	$("#messageTitle").text(friend);
	$("#contactWindow").children().removeClass("active");
	$("#contactUser"+friend).addClass("active");

	//Load/decrypt messages here?
	console.log('b2'+friend+'\t'+username);
	console.log('b3'+sha256(friend)+'\t'+parseInt(sha256(friend),16));
	console.log('b1'+(parseInt(sha256(friend),16)+parseInt(sha256(username),16)));
	loadConversation(parseInt(sha256(friend),16)+parseInt(sha256(username),16));
}
function add_msg_sent(content,timestamp){
	$('#messageText').append('<div class="msgSend"> '+content+'</div>');
	$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
}
function add_msg_recieve(from,content,timestamp){
	$('#messageText').append('<div class="msgRecieve"> '+content+'</div>');
	$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
}

function load_conversation_page(convo){
	$('#messageText').empty();
	var convo_index=JSON.parse(convo["conversation.indx"]);
	conversation_index=convo_index;
	conversation_ID=convo_index.id;
	var convo_start=0;
	var convo_toload=convo_index.state;
	if (convo_toload>50){
		convo_toload=50;;
	}
	if (convo_index.state>50){
		convo_start=convo_index.tail;
	}
	for (var i=0;i<convo_toload;i++){
		//load each message
		//console.log('to parse: '+convo[String(convo_start)]);
		var message_object=JSON.parse(convo[String(convo_start)]);
		//console.log('keychain obj: '+message_object.keychain);
		//console.log('trying to find key: '+username_sha256b64);
		var my_key_raw=JSON.parse(message_object.keychain)[String(username_sha256b64)];
		//console.log('key raw: '+my_key_raw);
		var my_key_hex=base64ToHex(my_key_raw);
		//console.log('key hex: '+my_key_hex);
		var payload_key=rsa.decrypt(my_key_hex);
		//console.log('key payload: '+payload_key);
		let hybrid_tmp=payload_key.split(',');
		//console.log('payload split: '+hybrid_tmp);
		let hybrid_aes= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes.length;p1++){
				hybrid_aes[p1]=parseInt(hybrid_tmp[p1]);
				//console.log(hybrid_aes);
			}
		var encryptedBytes = aesjs.utils.hex.toBytes(base64ToHex(message_object.payload));
		var aesCtr = new aesjs.ModeOfOperation.ctr(hybrid_aes, new aesjs.Counter(5));
		var decryptedBytes = aesCtr.decrypt(encryptedBytes);
		var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		
		var payload_object=JSON.parse(decryptedText);
		//console.log(payload_object.msg);
		//console.log(payload_object.to);
		//console.log(payload_object.from);
		//console.log(payload_object.timestamp);
		//alert(payload_object.msg+'\t'+payload_object.timestamp);
		if (payload_object.from==username){
			add_msg_sent(payload_object.msg,payload_object.timestamp);
		}else{
			add_msg_recieve(payload_object.from,payload_object.msg,payload_object.timestamp);
		}
		
		convo_start++;
		if (convo_start>50){
			convo_start=0;
		}
	}
	
	
}

function removeContact(){
	//make dialog confirming
	
	//Cycle through contacts to find contact - remove - call savePreference();
	

	savePreference();
	//alert("are you sure?")
	//alert("Do you want to remove messages from the server?");
	
	
}

//	Normalize string for hashing
function strip_string(string){
	return string.toLowerCase().replace(/\s+/g, '').replace(/\./g, "");
}


window.onload = function(e) {
	/*
	if (localStorage.getItem("token")!=null){
		$("#login").children().hide(); 
	$("#login").addClass("collapse");
	$('#spacer').addClass("collapse");  
	setTimeout(function(){
		$('#title').removeClass("titleCollapse"); 
		$('#title').addClass("titleExpand");  
	}, 500);
		successfullLogin();
	}*/
}