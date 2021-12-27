
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
function add_msg_sent(content,timestamp,type){
	if (type==0){
		$('#messageText').append('<div class="msgSend"> '+escapeHtml(content)+'</div>');
		$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
	}
	if (type==1){
		$('#messageText').append('<div class="msgSend"><img style="max-width:100%;max-height:100%;"src='+escapeHtml(content)+'></img></div>');
		$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
	}
}
function add_msg_recieve(from,content,timestamp,type){
	if (type==0){
		$('#messageText').append('<div class="msgRecieve"> '+escapeHtml(content)+'</div>');
		$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
	}
	if (type==1){
		$('#messageText').append('<div class="msgRecieve"><img style="max-width:100%;max-height:100%;"src='+escapeHtml(content)+'></img></div>');
		$('#messageText').scrollTop($('#messageText')[0].scrollHeight);
	}
}


/*
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
}*/
function load_conversation_partial(convo,range){
	//$('#messageText').empty();
	console.log(JSON.stringify(convo));
	//console.log(convo["conversation.indx"]);
	var convo_index=JSON.parse(convo["conversation.indx"]);
	conversation_index=convo_index;
	conversation_ID=convo_index.id;
	
	var convo_keys=JSON.parse(convo["key.ring"]);
	var keyring_sig_origin=convo_keys.signed;
	var keyring_sig_proof=convo_keys.signature;
	var keyring_sig_hash=0;
	for (key in convo_keys){
		if (key!='signed'&&key!='signature'){
			//console.log('adding key '+convo_keys[key]+' hashed as '+sha256(convo_keys[key]));
			keyring_sig_hash+=parseInt(sha256(convo_keys[key]),16);
		}
	}
	keyring_sig_hash=sha256(String(keyring_sig_hash));
	
	console.log('sign debugger: '+keyring_sig_hash);
	console.log('proof hash: '+keyring_sig_proof);
	console.log('contact hash: '+contact_keys[keyring_sig_origin]);
	var contact_pub=contact_keys[keyring_sig_origin];
	console.log('originator: '+keyring_sig_origin);
	if (keyring_sig_origin==username){
		//console.log('we are originator');
		contact_pub=rsa.n.toString(16);
	}
	//console.log(contact_pub);
	//var keyring_sig_proof_mod=new_biggie.modPowInt(our_biggie,e_biggie);
	//signing_rsa.setPublic(contact_pub,'10001');
	//var keyring_sig_proof_mod=rsa.encrypt(keyring_sig_proof);
	
	//var to_en_2=parseBigInt(keyring_sig_proof,16);
	var to_en_3=parseBigInt(keyring_sig_proof,16);
	//console.log('before encode: '+to_en_2);
	//var my_e_2=rsa.e;
	//var my_n_2=rsa.n;
	//to_en_2=to_en_2.modPowInt(my_e_2,my_n_2);
	//keyring_sig_proof_mod=to_en_2.toString(16);
	signing_rsa.setPublic(contact_pub,'10001');
	keyring_sig_proof_mod=signing_rsa.doPublic(to_en_3).toString(16);
	//console.log('sig being decoded: '+to_en_2);
	
	//console.log('got this seperate: '+);
	console.log('got: '+keyring_sig_proof_mod);
	console.log('expected: '+keyring_sig_hash);
	if (keyring_sig_proof_mod!=keyring_sig_hash){
		alert('bad keyring sig');
		return;
	}
	
	conversation_names[conversation_ID]=convo_keys;

	var my_ring_lock=convo_keys[username];
	var convo_aes_master=rsa.decrypt(my_ring_lock);
	if (convo_key==null){
		let hybrid_tmp_1=convo_aes_master.split(',');
		let hybrid_aes_1= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes_1.length;p1++){
				hybrid_aes_1[p1]=parseInt(hybrid_tmp_1[p1]);
			}
		convo_key=hybrid_aes_1;
	}
	//console.log('convo key is: '+convo_key);
	//console.log('convo key is string: '+convo_key.toString());
	var convo_start=0;
	var convo_toload=convo_index.state;
	if (convo_toload>50){
		convo_toload=50;
	}
	if (convo_index.state>50){
		convo_start=convo_index.tail;
	}
	let hybrid_tmp=convo_aes_master.split(',');
		//console.log('payload split: '+hybrid_tmp);
		let hybrid_aes= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes.length;p1++){
				hybrid_aes[p1]=parseInt(hybrid_tmp[p1]);
				//console.log(hybrid_aes);
			}
	
	for (var i=0;i<convo_toload;i++){
		//load each message
		try{
			console.log('loading msg: '+convo_start)
		//var payload_key=rsa.decrypt(my_key_hex);
		//console.log('key payload: '+convo_aes_master);
		
		var message_object=JSON.parse(convo[String(convo_start)]);
		var encryptedBytes = aesjs.utils.hex.toBytes(base64ToHex(message_object.payload));
		var aesCtr = new aesjs.ModeOfOperation.ctr(hybrid_aes, new aesjs.Counter(5));
		var decryptedBytes = aesCtr.decrypt(encryptedBytes);
		var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		console.log('payload '+i+' with decrypted msg: '+decryptedText);
		var payload_object=JSON.parse(decryptedText);
		//console.log(payload_object.msg);
		//console.log(payload_object.to);
		//console.log(payload_object.from);
		//console.log(payload_object.timestamp);
		//alert(payload_object.msg+'\t'+payload_object.timestamp);
		var payload_type=0;
		if (payload_object.type==1){
			payload_type=1;
		}
		
		
		if (payload_object.from==username){
			add_msg_sent(payload_object.msg,payload_object.timestamp,payload_type);
		}else{
			add_msg_recieve(payload_object.from,payload_object.msg,payload_object.timestamp,payload_type);
		}
		
		}catch(e){
	
	}
	convo_start++;
		if (convo_start>50){
			convo_start=0;
	}
	}
	
	
}

function load_conversation_page(convo){
	$('#messageText').empty();
	//console.log(JSON.stringify(convo));
	//console.log(convo["conversation.indx"]);
	var convo_index=JSON.parse(convo["conversation.indx"]);
	conversation_index=convo_index;
	conversation_ID=convo_index.id;
	
	var convo_keys=JSON.parse(convo["key.ring"]);
	var keyring_sig_origin=convo_keys.signed;
	var keyring_sig_proof=convo_keys.signature;
	var keyring_sig_hash=0;
	for (key in convo_keys){
		if (key!='signed'&&key!='signature'){
			//console.log('adding key '+convo_keys[key]+' hashed as '+sha256(convo_keys[key]));
			keyring_sig_hash+=parseInt(sha256(convo_keys[key]),16);
		}
	}
	keyring_sig_hash=sha256(String(keyring_sig_hash));
	
	console.log('sign debugger: '+keyring_sig_hash);
	console.log('proof hash: '+keyring_sig_proof);
	console.log('contact hash: '+contact_keys[keyring_sig_origin]);
	var contact_pub=contact_keys[keyring_sig_origin];
	console.log('originator: '+keyring_sig_origin);
	if (keyring_sig_origin==username){
		//console.log('we are originator');
		contact_pub=rsa.n.toString(16);
	}
	//console.log(contact_pub);
	//var keyring_sig_proof_mod=new_biggie.modPowInt(our_biggie,e_biggie);
	//signing_rsa.setPublic(contact_pub,'10001');
	//var keyring_sig_proof_mod=rsa.encrypt(keyring_sig_proof);
	
	//var to_en_2=parseBigInt(keyring_sig_proof,16);
	var to_en_3=parseBigInt(keyring_sig_proof,16);
	//console.log('before encode: '+to_en_2);
	//var my_e_2=rsa.e;
	//var my_n_2=rsa.n;
	//to_en_2=to_en_2.modPowInt(my_e_2,my_n_2);
	//keyring_sig_proof_mod=to_en_2.toString(16);
	signing_rsa.setPublic(contact_pub,'10001');
	keyring_sig_proof_mod=signing_rsa.doPublic(to_en_3).toString(16);
	//console.log('sig being decoded: '+to_en_2);
	
	//console.log('got this seperate: '+);
	console.log('got: '+keyring_sig_proof_mod);
	console.log('expected: '+keyring_sig_hash);
	if (keyring_sig_proof_mod!=keyring_sig_hash){
		alert('bad keyring sig');
		return;
	}
	
	conversation_names[conversation_ID]=convo_keys;

	var my_ring_lock=convo_keys[username];
	var convo_aes_master=rsa.decrypt(my_ring_lock);
	if (convo_key==null){
		let hybrid_tmp_1=convo_aes_master.split(',');
		let hybrid_aes_1= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes_1.length;p1++){
				hybrid_aes_1[p1]=parseInt(hybrid_tmp_1[p1]);
			}
		convo_key=hybrid_aes_1;
	}
	//console.log('convo key is: '+convo_key);
	//console.log('convo key is string: '+convo_key.toString());
	var convo_start=0;
	var convo_toload=convo_index.state;
	if (convo_toload>50){
		convo_toload=50;;
	}
	if (convo_index.state>50){
		convo_start=convo_index.tail;
	}
	let hybrid_tmp=convo_aes_master.split(',');
		//console.log('payload split: '+hybrid_tmp);
		let hybrid_aes= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes.length;p1++){
				hybrid_aes[p1]=parseInt(hybrid_tmp[p1]);
				//console.log(hybrid_aes);
			}
	
	for (var i=0;i<convo_toload;i++){
		//load each message

		//var payload_key=rsa.decrypt(my_key_hex);
		//console.log('key payload: '+convo_aes_master);
		
		var message_object=JSON.parse(convo[String(convo_start)]);
		var encryptedBytes = aesjs.utils.hex.toBytes(base64ToHex(message_object.payload));
		var aesCtr = new aesjs.ModeOfOperation.ctr(hybrid_aes, new aesjs.Counter(5));
		var decryptedBytes = aesCtr.decrypt(encryptedBytes);
		var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		//console.log('payload '+i+' with decrypted msg: '+decryptedText);
		var payload_object=JSON.parse(decryptedText);
		//console.log(payload_object.msg);
		//console.log(payload_object.to);
		//console.log(payload_object.from);
		//console.log(payload_object.timestamp);
		//alert(payload_object.msg+'\t'+payload_object.timestamp);
		var payload_type=0;
		if (payload_object.type==1){
			payload_type=1;
		}
		
		
		if (payload_object.from==username){
			add_msg_sent(payload_object.msg,payload_object.timestamp,payload_type);
		}else{
			add_msg_recieve(payload_object.from,payload_object.msg,payload_object.timestamp,payload_type);
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
	setInterval(function(){ loadConversation_index() }, 1500);
	$('#hidden_input').on('change', function() {
        console.log($('#hidden_input').val());
		var file = $('#hidden_input').prop('files')[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			var data = event.target.result;
			sendMessage_img(data);
	  };
	    reader.readAsDataURL(file);
    });
	$('#textAreaSend').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $('#sendbutton').click();
    return false;  
  }
});   
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