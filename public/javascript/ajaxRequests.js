//Function to query server to check if user exists
function checkUser(){
	if (stage!=1){return;}
	//Query server
	var data = {};
	data.user = username;			
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/userExists',						
        success: function(data) {
				var response=data.response;
				if (debug){
					console.log('success');
					console.log(JSON.stringify(data));
					console.log('User exist response:'+response);
				}
				$('#advancedBtn').show();
				$('#continueBtn').show();
				$('#passwordDiv').show();
				if (!response){
					//New user
					createFlag=1;
					$('#server-stat').text("Account does not exist - A new account will be created");
				}else{
					//User exists
					createFlag=0;
					$('#server-stat').text("Account exists - Attempt to login");
				}
            },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
}


function validateUser(){
	$("#padlock").children().hide();
	$('#padlock').removeClass("padlockExpand");  
	$('#padlock').removeClass("padlockExpand-Set");  
	$('#padlock').addClass("padlockCollapse");  
	$('#spacer-2').removeClass("grow-spacer-2"); 
	$('#spacer-2').addClass("grow-spacer-3"); 
	setTimeout(function(){
		$('#padlock').removeClass("padlockCollapse"); 
		$('#padlock').addClass("padlockExpand"); 
		
		
	}, 1000);
	setTimeout(function(){
		$('#padlock').children().show();
		$('#loadingMessageSub').text("This may take a moment");
		if (createFlag){
			$('#loadingMessage').text("Submitting public key");
		}else{
			$('#loadingMessage').text("Validating against server");
		}
		$('#padlock').addClass("padlockExpand-Set"); 

	}, 1700);
	
	setTimeout(function(){
	if (createFlag){
		//Create a user
		response = createUser(username,rsa.n.toString(16));
	}else{
		//Request cookie
		
		var data = {};
		data.user = username;	
		$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/fetchCookie',						
		success: function(data) {
			response=data.response;
			try{
				var returnv=rsa.decrypt(response);
				REALcookie=returnv;
				if (returnv===null){
					failedLogin();
				}else{			
					data = {};
					data.user = username;
					data.secret = REALcookie;						
					$.ajax({
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json',
					url: '/login',						
					success: function(data) {
						console.log('SETTING COOKIE');
						localStorage.setItem("token", data.token);
						successfullLogin();
						
						},
					error: function() {
							  //Could not reach server - if you are using a custom endpoint please make sure it is correct
							  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
							  //Display some error message
					},
				});
				}
			}catch(e){
				alert(e);
				failedLogin();
			}
            },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
	}
	}, 1800);
}


function createUser(user,pubKey,){
	
	var data = {};
	data.user = user;	
	data.key=pubKey;
	//data.cookie=cookie;
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/cheapCreate',						
        success: function(data) {
				var response=parseInt(data.response);
				if (debug){
					console.log('success');
					console.log(JSON.stringify(data));
					console.log('User create response:'+response);
				}
				if (!response){
					//Failure: User prob already exists
					alert("Server Failure: Does this username already exist?");
					failedLogin();
				}else{
							var data = {};
		data.user = username;	
		$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/fetchCookie',						
		success: function(data) {
			response=data.response;
			try{
				var returnv=rsa.decrypt(response);
				REALcookie=returnv;
				if (returnv===null){
					failedLogin();
				}else{			
					data = {};
					data.user = username;
					data.secret = REALcookie;						
					$.ajax({
					type: 'POST',
					data: JSON.stringify(data),
					contentType: 'application/json',
					url: '/login',						
					success: function(data) {
						console.log('SETTING COOKIE');
						localStorage.setItem("token", data.token);
						successfullLogin();
						
						},
					error: function() {
							  //Could not reach server - if you are using a custom endpoint please make sure it is correct
							  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
							  //Display some error message
					},
				});
				}
			}catch(e){
				alert(e);
				failedLogin();
			}
            },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
	}
            },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
}



function addContact(){
	var data = {};
		data.user = $("#addContactInput").val();	
		$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/fetchPublic',						
		success: function(data) {
		response=data.response;
		if (response!=0){
			console.log("Add contact key: "+response);
			var newContact={
				'username': $("#addContactInput").val(),
				'key':response
			};
			contact_keys[ $("#addContactInput").val()]=response;
			contacts[$("#addContactInput").val()]=newContact;
			//add the UI
			$("#contactWindow").append('<div id="contactUser'+$("#addContactInput").val()+'" class="contactBox"><div class="title-card-3">'+$("#addContactInput").val()+'</div><button id="" class="button-4 " type="button" onclick="messageContact(\''+$("#addContactInput").val()+'\')">Message</button> <button id="removeContactButton" class="button-4 red" type="button" onclick="removeContact()">Remove</button> </div>');

			//Save changes to preferences
			savePreference();
		}else{
			alert("User not found");
		}


        },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
}


function loadPreference(){
	var data = {};
	data.user = username;	
	data.token=localStorage.getItem("token");
	//data.meta=rsa.encrypt(JSON.stringify(contacts));
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/fetchMeta',						
		success: function(data) {
		response=data.response;
		if (!(response===0)){
			var hybrid_total=response.split("<-|BEGIN AES|->");
			var hybrid_rsa=rsa.decrypt(hybrid_total[0]);
			let hybrid_tmp=hybrid_rsa.split(',');
			let hybrid_aes= new Uint8Array(16);
			for (let p1=0;p1<hybrid_aes.length;p1++){
				hybrid_aes[p1]=parseInt(hybrid_tmp[p1]);
			}

		// When ready to decrypt the hex string, convert it back to bytes
		var encryptedBytes = aesjs.utils.hex.toBytes(hybrid_total[1]);

		// The counter mode of operation maintains internal state, so to
		// decrypt a new instance must be instantiated.
		var aesCtr = new aesjs.ModeOfOperation.ctr(hybrid_aes, new aesjs.Counter(5));
		var decryptedBytes = aesCtr.decrypt(encryptedBytes);
		// Convert our bytes back into text
		var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
		contacts=JSON.parse(decryptedText);
		$("#contactWindow").empty();
		$("#contactWindow").append('<div id="contactTitle" class="contactTitle ">Contacts</div><div id="addContactWindow" class="addContactWindow"><div class="title-card-3">Add a contact</div><input id="addContactInput" class="title-card-3"></input><button id="addContactButton" class="button-4" type="button" onclick="addContact()">Connect</button></div>');
		for (i in contacts){
			$("#contactWindow").append('<div id="contactUser'+contacts[i].username+'" class="contactBox"><div class="title-card-3">'+contacts[i].username+'</div><button id="" class="button-4 " type="button" onclick="messageContact(\''+contacts[i].username+'\')">Message</button> <button id="removeContactButton" class="button-4 red" type="button" onclick="removeContact()">Remove</button> </div>');
			contact_keys[contacts[i].username]=contacts[i].key;
		}
		}else{
			alert("Contact/Preference load failure!");
		}
        },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
}



function savePreference(){

	//Wrap up preferences into JSON, encrypt with AES, then with RSA and post to server

	var array = new Uint8Array(16);
	window.crypto.getRandomValues(array);
	// Convert text to bytes
	var textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(contacts));
	// The counter is optional, and if omitted will begin at 1
	var aesCtr = new aesjs.ModeOfOperation.ctr(array, new aesjs.Counter(5));
	var encryptedBytes = aesCtr.encrypt(textBytes);
	// To print or store the binary data, you may convert it to hex
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	let final_meta=rsa.encrypt(array.toString())+"<-|BEGIN AES|->"+encryptedHex;
	console.log(contacts);
	var data = {};
	data.user = username;	
	data.token=localStorage.getItem("token");
	data.meta=final_meta;
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
		url: '/updateMeta',						
		success: function(data) {
		response=data.response;
		if (response!=0){
		}else{
			alert("Contact/Preference save failure!");
		}
        },
		error: function() {
                  //Could not reach server - if you are using a custom endpoint please make sure it is correct
				  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
				  //Display some error message
        },
    });
}


//Post a new message
function sendMessage(){
	//GET Text
	var data = {};
	data.token=localStorage.getItem("token");
	
	
	var newMsg={};
	newMsg.msg=$('#textAreaSend').val();
	newMsg.from=username;
	newMsg.to=friend;
	newMsg.timestamp=new Date();
	console.log('composing message: \n'+newMsg);
	$('#textAreaSend').val('');
	var array = new Uint8Array(16);
	
	window.crypto.getRandomValues(array);
	console.log(array.toString());
	// Convert text to bytes
	var textBytes = aesjs.utils.utf8.toBytes(JSON.stringify(newMsg));
	// The counter is optional, and if omitted will begin at 1
	var aesCtr = new aesjs.ModeOfOperation.ctr(array, new aesjs.Counter(5));
	var encryptedBytes = aesCtr.encrypt(textBytes);
	// To print or store the binary data, you may convert it to hex
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	//let final_meta=rsa.encrypt(array.toString())+"<-|BEGIN AES|->"+encryptedHex;
	
	var keychain={};
	for (r in recipients){
		var new_r=recipients[r]
		signing_rsa.setPublic(contact_keys[recipients[r]],"10001");
		keychain[sha256_64(strip_string(new_r))]=hexToBase64(signing_rsa.encrypt(array.toString()));
	}
	var new_r=username;
	keychain[sha256_64(strip_string(new_r))]=hexToBase64(rsa.encrypt(array.toString()));
	var msg_complete={};
	msg_complete.payload=hexToBase64(encryptedHex);
	msg_complete.keychain=JSON.stringify(keychain);
	data.msg=JSON.stringify(msg_complete);
	data.to=friend;
	data.from=username;
	
	//post to server
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/postMessage',						
        success: function(data) {
				var response=parseInt(data.response);
				if (debug){
					console.log('success');
				}
				if (!response){
				}else{
					//User exists

				}
            },
		error: function() {
			alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
        },
    });
}

function loadConnections(){
	//GET Text
	var data = {};
	data.token=localStorage.getItem("token");
	data.user=username;
	//post to server
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/fetch_connections',						
        success: function(data) {
				for (person in data.connections){
					if (contacts[person]==null){
						add_contact_lookup(person);
					}
				}
				setTimeout(function(){savePreference();  }, 1000);
            },
		error: function() {
			alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
        },
    });
}

async function add_contact_lookup(person){
	var data_in = {};
	data_in.user = person;
	console.log("new con to add:" +data_in.user);
							$.ajax({
							type: 'POST',
							data: JSON.stringify(data_in),
							contentType: 'application/json',
							url: '/fetchPublic',						
							success: function(data_2) {
							response=data_2.response;
							if (response!=0){
								console.log("Add contact key: "+response);
								var newContact={
									'username': data_in.user,
									'key':response
								};
								console.log('adding user to contacts: '+data_in.user);
								contact_keys[data_in.user]=response;
								contacts[data_in.user]=newContact;
								//add the UI
								$("#contactWindow").append('<div id="contactUser'+data_in.user+'" class="contactBox"><div class="title-card-3">'+data_in.user+'</div><button id="" class="button-4 " type="button" onclick="messageContact(\''+data_in.user+'\')">Message</button> <button id="removeContactButton" class="button-4 red" type="button" onclick="removeContact()">Remove</button> </div>');

								//Save changes to preferences
								
							}else{
								alert("User not found");
							}
							},
							error: function() {
									  //Could not reach server - if you are using a custom endpoint please make sure it is correct
									  alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
									  //Display some error message
							},
						});
}

function loadConversation(members){
	//GET Text
	var data = {};
	data.members = members;	
	//post to server
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/fetch_conversation',						
        success: function(data) {
			if (!running_convo){
				setTimeout(function(){ loadConversation_index() }, 1000);
				running_convo=true;
			}
				load_conversation_page(data);
            },
		error: function() {
			alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
        },
    });
}

function loadConversation_index(){
	//GET Text
	var data = {};
	data.id = conversation_ID;	
	//post to server
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data),
		contentType: 'application/json',
        url: '/fetch_conversation_index',						
        success: function(data) {
			try{
			console.log(data);
			if (data.index.state>conversation_index.state){
				loadConversation(parseInt(sha256(friend),16)+parseInt(sha256(username),16));
				
			}
			}catch(error){}
			setTimeout(function(){ loadConversation_index() }, 1000);
            },
		error: function() {
			//alert("Could not reach server - if you are using a custom endpoint please make sure it is correct");
			setTimeout(function(){ loadConversation_index() }, 1000);
        },
    });
}

function loadConversation_range(members){
	
	
	
}

//Get a conversation
function recieveConversation(){
	
	
	
}