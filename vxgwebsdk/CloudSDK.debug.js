// CloudSDK.debug.js
// version: 3.0.18
// date-of-build: 200702
// copyright (c) VXG Inc


window.Log = function(elid){
	var self = this;
	self.mElementID = elid;
	self.el = document.getElementById(elid);
	if(self.el){
		self.el.innerHTML = '<div class="logger-line">Start</div>'; // cleanup
	}

	self.escape = function(msg){
		if(typeof(msg) === 'undefined'){
			return 'undefined';
		}
		if(typeof(msg) === 'object'){
			msg = JSON.stringify(msg);
		}
		var escaped = msg;
		var findReplace = [[/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/"/g, "&quot;"]]
		for(var item in findReplace)
			escaped = escaped.replace(findReplace[item][0], findReplace[item][1]);
		return escaped;
	}

	self.info = function(msg){
		console.log(msg);
		if(self.el){
			self.el.innerHTML += '<div class="logger-line info">' + self.escape(msg) + '</div>';
		}
	}
	
	self.error = function(msg){
		console.error(msg);
		if(self.el){
			self.el.innerHTML += '<div class="logger-line error">' + self.escape(msg) + '</div>';
		}
	}
	
	self.warn = function(msg){
		console.warn(msg);
		if(self.el){
			self.el.innerHTML += '<div class="logger-line warn">' + self.escape(msg) + '</div>';
		}
	}
}

window.CloudHelpers = window.CloudHelpers || {};


window.CloudHelpers.RequestWrap = function(){
    var self = this;
    var isRequestAnswersAllowed = 1;
    
    self.request = function(obj) {
	var p = CloudHelpers.promise();
	var xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;
	xhr.open(obj.type, obj.url, true);
	xhr.withCredentials = true;
	
	if(obj.contentType){
		xhr.setRequestHeader('Content-Type', obj.contentType);
	}
	if(obj.token){
		xhr.setRequestHeader('Authorization', "SkyVR " + obj.token);
	}
	xhr.onload = function() {
		var r = "";
		if(this.responseText != ""){
			try{
				r = JSON.parse(this.responseText);
			}catch(e){
				console.error(e);
				p.reject(CloudReturnCode.ERROR_WRONG_RESPONSE);
				return;
			}
		}
		var st = this.status;
		if (isRequestAnswersAllowed != 0) {
		    if(st >= 200 && st < 300){
			p.resolve(r);
		    }else{
			p.reject(r);
		    }
		}
		delete xhr;
	}
	xhr.onerror = function(){
		p.reject(xhr);
		delete xhr;
	}
	if(obj.data){
		xhr.send(obj.data);
	}else{
		xhr.send();
	}
	return p;
    }

    self.destroy = function(){
	this.isRequestAnswerAlowed = 0;
    }
}



// helper function for parsing urls
CloudHelpers.parseUri = function(str) {
	var result = {}
	result.source = str;
	var arr = str.split("/");
	// parse protocol
	result.protocol = arr[0];
	result.protocol = result.protocol.slice(0, result.protocol.length-1);
	result.protocol = result.protocol.toLowerCase();
	str = str.slice(result.protocol.length + 3);

	if (result.protocol == 'http') {
		result.port = 80;
	}

	if (result.protocol == 'https') {
		result.port = 443;
	}

	// parse user/password/host/port
	var end1_of_hp = str.indexOf("/");
	end1_of_hp = end1_of_hp != -1 ? end1_of_hp : str.length;
	var end2_of_hp = str.indexOf("?");
	end2_of_hp = end2_of_hp != -1 ? end2_of_hp : str.length;
	var end_of_hp = Math.min(end1_of_hp, end2_of_hp);
	var uphp = str.substring(0, end_of_hp);
	str = str.slice(end_of_hp); // host
	var uspass = "";
	while(uphp.indexOf("@") != -1){
		uspass += uphp.substring(0, uphp.indexOf("@") + 1);
		uphp = uphp.slice(uphp.indexOf("@") + 1);
	}
	if(uspass != ""){
		if(uspass.indexOf(":") != -1){
			var a = uspass.split(":");
			result.user = a[0];
			result.password = a[1];
			result.password = result.password.substring(0,result.password.length -1);
		}else{
			result.user = uspass;
		}
	}

	if(uphp.indexOf(":") != -1){
		var reg_port = new RegExp(".*:(\\d+)$", "g");
		var port = reg_port.exec(uphp);
		if(port && port.length > 1){
			result.port = parseInt(port[1],10);
			uphp = uphp.slice(0, uphp.length - port[1].length - 1);
		}
	}
	result.host = uphp;

	// parse path/query
	if(str.indexOf("?") != -1){
		result.query = str.substring(str.indexOf("?"), str.length);
		result.path = str.substring(0, str.indexOf("?"));
	}else{
		result.query = "";
		result.path = str;
	}
	if(!result.path || result.path == ""){
		result.path = "/";
	}
	return result;
}

// Helper object (for replace jquery)
CloudHelpers.promise = function(){
	var d = {};
	d.completed = false;
	d.failed = false;
	d.successed = false;
	d.done = function(callback){
		d.done_callback = callback;
		if(d.completed && typeof d.done_callback === "function" && d.successed){
			d.done_callback.apply(this, d.result_arguments);
		}
		return d;
	}
	
	d.fail = function(callback){
		d.fail_callback = callback;
		if(d.completed && typeof d.fail_callback === "function" && d.failed){
			d.fail_callback.apply(this,d.error_arguments);
		}
		return d;
	}
	
	d.resolve = function() {
		if(!d.completed){
			d.result_arguments = arguments; // [];
			if(typeof d.done_callback === "function"){
				d.done_callback.apply(this, d.result_arguments);
			}
		}
		d.successed = true;
		d.completed = true;
	}
	d.reject = function() {
		if(!d.completed){
			d.error_arguments = arguments;
			if(typeof d.fail_callback === "function"){
				d.fail_callback.apply(this, d.error_arguments);
			}
		}
		d.failed = true;
		d.completed = true;
	}
	return d;
};

CloudHelpers.waitPromises = function(arr_promise){
	var p = CloudHelpers.promise();
	var max_len = arr_promise.length;
	var result = [];
	function cmpl(r){
		result.push(r);
		if(result.length == max_len){
			p.resolve(result);
		}
	};
	for(var i in arr_promise){
		arr_promise[i].done(cmpl).fail(cmpl);
	}
	return p;
}

// Helper object (for replace jquery request)
CloudHelpers.request = function(obj){
	var p = CloudHelpers.promise();
	var xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;
	xhr.open(obj.type, obj.url, true);
	// Fix for CNVR-1134 CloudSDK Web: need processing cookies in sdk
	// But server can has some problems with sessions
	xhr.withCredentials = true;
	if(obj.contentType){
		xhr.setRequestHeader('Content-Type', obj.contentType);
	}
	if(obj.token){
		xhr.setRequestHeader('Authorization', "SkyVR " + obj.token);
	}
	xhr.onload = function() {
		var r = "";
		if(this.responseText != ""){
			try{
				r = JSON.parse(this.responseText);
			}catch(e){
				console.error(e);
				p.reject(CloudReturnCode.ERROR_WRONG_RESPONSE);
				return;
			}
		}
		var st = this.status;
		// console.log("Status: " + st);
		// console.log("responseText: " + this.responseText);
		if(st >= 200 && st < 300){
			p.resolve(r);
		}else{
			p.reject(r);
		}
		delete xhr;
	}
	xhr.onerror = function(){
		p.reject(xhr);
		delete xhr;
	}
	if(obj.data){
		xhr.send(obj.data);
	}else{
		xhr.send();
	}
	return p;
}

// Helper object (for replace jquery request)
CloudHelpers.request2 = function(obj){
	var p = CloudHelpers.promise();
	var xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;
	xhr.open(obj.type, obj.url, true);
	// Fix for CNVR-1134 CloudSDK Web: need processing cookies in sdk
	// But server can has some problems with sessions
	xhr.withCredentials = true;
	if(obj.contentType){
		xhr.setRequestHeader('Content-Type', obj.contentType);
	}
	if(obj.token){
		xhr.setRequestHeader('Authorization', "SkyVR " + obj.token);
	}
	if(obj.access_token){
		xhr.setRequestHeader('Authorization', "Acc " + obj.access_token);
	}
	if(obj.license_key){
		xhr.setRequestHeader('Authorization', "Lic " + obj.license_key);
	}

	xhr.onload = function() {
		var r = "";
		if(this.responseText != ""){
			try{
				r = JSON.parse(this.responseText);
			}catch(e){
				console.error(e);
				p.reject(CloudReturnCode.ERROR_WRONG_RESPONSE);
				return;
			}
		}
		var st = this.status;
		// console.log("Status: " + st);
		// console.log("responseText: " + this.responseText);
		if(st >= 200 && st < 300){
			p.resolve(r);
		}else{
			p.reject(r);
		}
		delete xhr;
	}
	xhr.onerror = function(){
		p.reject(xhr);
		delete xhr;
	}
	if(obj.data){
		xhr.send(obj.data);
	}else{
		xhr.send();
	}
	return p;
}

// Helper object (for replace jquery request)
CloudHelpers.requestJS = function(url, beforeEval){
	var p = CloudHelpers.promise();
	var xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;
	xhr.open("GET", url, true);
	// Fix for CNVR-1134 CloudSDK Web: need processing cookies in sdk
	// But server can has some problems with sessions
	// xhr.withCredentials = true;
	xhr.onload = function() {
		var r = "";
		if(this.responseText != ""){
			try{
				r = this.responseText;
			}catch(e){
				console.error(e);
				p.reject(CloudReturnCode.ERROR_WRONG_RESPONSE);
				return;
			}
		}
		var st = this.status;
		// console.log("Status: " + st);
		// console.log("responseText: " + this.responseText);
		if(st >= 200 && st < 300){
			if (beforeEval) {
				r = beforeEval(r);
			}
			eval(r);
			p.resolve(r);
		}else{
			p.reject(r);
		}
		delete xhr;
	}
	xhr.onerror = function(){
		p.reject(xhr);
		delete xhr;
	}
	xhr.send();
	return p;
}

CloudHelpers.handleError = function(err, p, callback){
	if(err.errorDetail && err.status == 404){
		p.reject(CloudReturnCode.ERROR_NOT_FOUND);
	}else if(err.errorDetail && err.status == 401){
		p.reject(CloudReturnCode.ERROR_NOT_AUTHORIZED);
	}else{
		if(callback){
			callback(err, p);
		}else{
			p.reject(err);
		}
	}
}

CloudHelpers.requestAsyncList = function(getData, request_data, p){
	var result = {
		meta: {
			limit: 1000,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	request_data.limit = result.meta.limit;
	request_data.offset = result.meta.offset;
		
	getData(request_data).fail(function(err){
		p.reject(err);
	}).done(function(r){
		result.meta.total_count = r.meta.total_count;
		// result.meta.expire = r.meta.expire;
		result.objects = result.objects.concat(r.objects);
		if(r.meta.offset + r.objects.length >= r.meta.total_count){
			p.resolve(result);
		}else{
			var p_all = [];
			for(var i = result.meta.limit; i < result.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				p_all.push(getData(request_data));
			}
			CloudHelpers.waitPromises(p_all).done(function(p_results){
				for (var i=0; i < p_results.length; i++) {
					result.objects = result.objects.concat(p_results[i].objects);
				}
				p.resolve(result);
			}).fail(function(err){
				p.reject(err);
			});
		}
	});
}

CloudHelpers.flashVersion = undefined;

CloudHelpers.getFlashVersion = function(){
  // ie
  try {
    try {
      // avoid fp6 minor version lookup issues
      // see: http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
      var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
      try { axo.AllowScriptAccess = 'always'; }
      catch(e) { return '6,0,0'; }
    } catch(e) {}
    return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
  // other browsers
  } catch(e) {
    try {
      if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin){
        return (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
      }
    } catch(e) {}
  }
  return '0,0,0';
}

CloudHelpers.supportFlash = function(){
	if(!CloudHelpers.flashVersion){
		CloudHelpers.flashVersion = CloudHelpers.getFlashVersion();
	}
	return CloudHelpers.flashVersion != "0,0,0";
}

CloudHelpers.useHls = function(){
	return CloudHelpers.isMobile() || !CloudHelpers.supportFlash() || CloudHelpers.containsPageParam("hls");
}

CloudHelpers.supportWebRTC = function(){
	/*var MediaStream =  $window.webkitMediaStream || $window.MediaStream;
	var IceCandidate = $window.mozRTCIceCandidate || $window.webkitRTCIceCandidate || $window.RTCIceCandidate;
	var SessionDescription = $window.mozRTCSessionDescription || $window.webkitRTCSessionDescription || $window.RTCSessionDescription;*/
	// var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection;
	return !!(window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.RTCPeerConnection);
}

CloudHelpers.mapToUrlQuery = function(params){
	if(!params) return "";
	var res = [];
	for(var i in params){
		res.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
	}
	return res.join("&");
}

// detect lang on page

CloudHelpers.lang = function(){
	return CloudHelpers.sLang || CloudHelpers.locale();
};

CloudHelpers.locale = function() {
	langs = ['en', 'ko', 'ru']
	CloudHelpers.sLang = 'en';
	if(CloudHelpers.containsPageParam('lang') && langs.indexOf(CloudHelpers.pageParams['lang']) >= -1){
		CloudHelpers.sLang = CloudHelpers.pageParams['lang'];
	} else if (navigator) {
		var navLang = 'en';
		navLang = navigator.language ? navigator.language.substring(0,2) : navLang;
		navLang = navigator.browserLanguage ? navigator.browserLanguage.substring(0,2) : navLang;
		navLang = navigator.systemLanguage ? navigator.systemLanguage.substring(0,2) : navLang;
		navLang = navigator.userLanguage ? navigator.userLanguage.substring(0,2) : navLang;
		if(langs.indexOf(navLang) >= -1){
			CloudHelpers.sLang = navLang;
		}else{
			console.warn("Unsupported lang " + navLang + ", will be used default lang: " + CloudHelpers.sLang)
		}
		
		CloudHelpers.sLang =  langs.indexOf(navLang) >= -1 ? navLang : CloudHelpers.sLang;
	} else {
		CloudHelpers.sLang = 'en';
	}
	return CloudHelpers.sLang;
};

// parse param of page
CloudHelpers.parsePageParams = function() {
	var loc = window.location.search.slice(1);
	var arr = loc.split("&");
	var result = {};
	var regex = new RegExp("(.*)=([^&#]*)");
	for(var i = 0; i < arr.length; i++){
		if(arr[i].trim() != ""){
			p = regex.exec(arr[i].trim());
			// console.log("results: " + JSON.stringify(p));
			if(p == null){
				result[decodeURIComponent(arr[i].trim().replace(/\+/g, " "))] = '';
			}else{
				result[decodeURIComponent(p[1].replace(/\+/g, " "))] = decodeURIComponent(p[2].replace(/\+/g, " "));
			};
		};
	};
	return result;
};
CloudHelpers.pageParams = CloudHelpers.parsePageParams();
CloudHelpers.containsPageParam = function(name){
	return (typeof CloudHelpers.pageParams[name] !== "undefined");
};

CloudHelpers.keepParams = ["lang", "url", "fcno", "vendor", "demo",
"messaging", "hls", "svcp_host", "backwardDeactivateAfter", "mobile",
"experimental_hls", "page_id", "preview", "customswf"
];

CloudHelpers.changeLocationState = function(newPageParams){
	var url = '';
	var params = [];
	for(var i in CloudHelpers.keepParams){
		var name = CloudHelpers.keepParams[i];
		if(CloudHelpers.containsPageParam(name))
			params.push(name + '=' + encodeURIComponent(CloudHelpers.pageParams[name]))
	}

	for(var p in newPageParams){
		params.push(encodeURIComponent(p) + "=" + encodeURIComponent(newPageParams[p]));
	}
	var new_url = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//" + window.location.host + window.location.pathname + '?' + params.join("&");
	try{
		if(window.history.pushState)
			window.history.pushState(newPageParams, document.title, new_url);
		else
			console.error("window.history.pushState - function not found");
	}catch(e){
		console.error("changeLocationState: Could not change location to " + new_url);
	}
	CloudHelpers.pagePwindow.btoa('Hello, world');arams = CloudHelpers.parsePageParams();
}

CloudHelpers.osname = function(){
	var os="unknown";
	if (navigator.appVersion.indexOf("Win")!=-1) os="win";
	if (navigator.appVersion.indexOf("Mac")!=-1) os="mac";
	if (navigator.appVersion.indexOf("X11")!=-1) os="unix";
	if (navigator.appVersion.indexOf("Linux")!=-1) os="linux";
	return os;
};

CloudHelpers.isSafari = function(){
	var chr = window.navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
	var sfri = window.navigator.userAgent.toLowerCase().indexOf("safari") > -1;
	return !chr && sfri;
}

CloudHelpers.isEdge = function(){
	return window.navigator.userAgent.indexOf("Edge") > -1;
}

CloudHelpers.isChrome = function(){
	var bIsChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	return bIsChrome;
}

CloudHelpers.isMobile = function() { 
	if(navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)
	){
		return true;
	};
	return false;
}

CloudHelpers.isIpV4 = function(ip){
	return (ip.match(/^([0-9]{1,3}\.){3}[0-9]{1,3}/)!=null);
}

CloudHelpers.parseUTCTime = function(str){
	str = str.replace(new RegExp('-', 'g'), ' ');
	str = str.replace(new RegExp('T', 'g'), ' ');
	str = str.replace(new RegExp(':', 'g'), ' ');
	var arr = str.split(' ');
	var d = new Date();
	d.setUTCFullYear(parseInt(arr[0],10));
	d.setUTCMonth(parseInt(arr[1],10)-1);
	d.setUTCDate(parseInt(arr[2],10));
	d.setUTCHours(parseInt(arr[3],10));
	d.setUTCMinutes(parseInt(arr[4],10));
	d.setUTCSeconds(parseInt(arr[5],10));
	var t = d.getTime(); 
	t = t - t % 1000;
	return t;
}

CloudHelpers.formatUTCTime = function(t){
	var d = new Date();
	d.setTime(t);
	var str = d.getUTCFullYear() + "-"
		+ ("00" + (d.getUTCMonth()+1)).slice(-2) + "-"
		+ ("00" + d.getUTCDate()).slice(-2) + "T"
		+ ("00" + d.getUTCHours()).slice(-2) + ":"
		+ ("00" + d.getUTCMinutes()).slice(-2) + ":"
		+ ("00" + d.getUTCSeconds()).slice(-2);
	return str;
};

CloudHelpers.ONE_SECOND = 1000;
CloudHelpers.ONE_MINUTE = 60*1000;
CloudHelpers.ONE_HOUR = 60*60*1000;

CloudHelpers.getCurrentTimeUTC = function(){
	return Date.now();
};

CloudHelpers.isLocalFile = function() {
	return window.location.protocol != "https:" && window.location.protocol != "http:";
}

CloudHelpers.combineURL = function(url, login, password){
	if(login == "") login = undefined;
	if(password == "") password = undefined;
	var a = CloudHelpers.parseUri(url);
	var result = a.protocol + "://";
	if(login || password){
		result += login;
		if(password){
			result += ":" + password;
		}
		result += "@";
	}
	result += a.host + (a.port != "" ? ":" + a.port : '') + a.path;
	return result;
}

CloudHelpers.validIpV4 = function(ip){
	var cur_a = ip.split(".");
	for(var i = 0; i < 4; i++){
		var t = parseInt(cur_a[i],10);
		if(t < 0 || t > 255){
			return false;
		}
	}
	return true;
}

CloudHelpers.convertIpV4ToInt = function(ip){
	var cur_a = ip.split(".");
	var result = 0;
	var k = 1;
	for(var i = 3; i >= 0; i--){
		result += parseInt(cur_a[i],10)*k;
		k = k*256;
	}
	return result;
}

CloudHelpers.isValidHostID = function(url){
	var a = CloudHelpers.parseUri(url);
	if(a.host == "localhost") return true;
	if(CloudHelpers.isIpV4(a.host)){
		if(!CloudHelpers.validIpV4(a.host)){
			console.error("Address " + a.host + " - invalid address");
			return false;
		}
	}
	return true;
}

CloudHelpers.isLocalUrlOrIP = function(url){
	var a = CloudHelpers.parseUri(url);
	if(a.host == "localhost") return true;
	if(CloudHelpers.isIpV4(a.host)){
		if(!CloudHelpers.validIpV4(a.host)){
			console.error("Address " + a.host + " - invalid address");
			return true;
		}

		var cur_a = CloudHelpers.convertIpV4ToInt(a.host);
		var local_addresses = [];
		local_addresses.push({'from': '127.0.0.0', 'to': '127.255.255.255', 'comment': 'localhost addresses'});
		for(var i in local_addresses){
			var range_from = CloudHelpers.convertIpV4ToInt(local_addresses[i].from);
			var range_to = CloudHelpers.convertIpV4ToInt(local_addresses[i].to);
			var comment = local_addresses[i].comment;
			if(cur_a >= range_from && cur_a <= range_to){
				console.error(comment);
				return true;
			}
		}
	}
	return false;
}

CloudHelpers.isPublicUrl = function(url){
	var a = CloudHelpers.parseUri(url);
	if(a.host == "localhost") return false;
	if(CloudHelpers.isIpV4(a.host)){
		if(!CloudHelpers.validIpV4(a.host)){
			console.error("Address " + a.host + " - invalid address");
			return false;
		}

		var cur_a = CloudHelpers.convertIpV4ToInt(a.host);
		var local_addresses = [];
		local_addresses.push({'from': '10.0.0.0', 'to': '10.255.255.255', 'comment': 'single class A network'});
		local_addresses.push({'from': '172.16.0.0', 'to': '172.31.255.255', 'comment': '16 contiguous class B network'});
		local_addresses.push({'from': '192.168.0.0', 'to': '192.168.255.255', 'comment': '256 contiguous class C network'});
		local_addresses.push({'from': '169.254.0.0', 'to': '169.254.255.255', 'comment': 'Link-local address also refered to as Automatic Private IP Addressing'});
		local_addresses.push({'from': '127.0.0.0', 'to': '127.255.255.255', 'comment': 'localhost addresses'});		
		for(var i in local_addresses){
			var range_from = CloudHelpers.convertIpV4ToInt(local_addresses[i].from);
			var range_to = CloudHelpers.convertIpV4ToInt(local_addresses[i].to);
			var comment = local_addresses[i].comment;
			if(cur_a >= range_from && cur_a <= range_to){
				console.error(comment);
				return false;
			}
		}
	}
	return true;
}
CloudHelpers.isFrame = function(){
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
}

CloudHelpers.isFireFox = function(){
	return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

CloudHelpers.isAndroid = function() { 
	if(navigator.userAgent.match(/Android/i)){
		return true;
	};
	return false;
}

CloudHelpers.isIOS = function() { 
	if(navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
	){
		return true;
	};
	return false;
}

CloudHelpers.isWindowsPhone = function() { 
	if(navigator.userAgent.match(/Windows Phone/i)){
		return true;
	};
	return false;
}

CloudHelpers.isBlackBerry = function() { 
	if(navigator.userAgent.match(/BlackBerry/i)){
		return true;
	};
	return false;
}

CloudHelpers.splitUserInfoFromURL = function(url){
	var a = CloudHelpers.parseUri(url);
	var result = a.protocol + "://" + a.host + (a.port ? ":" + a.port : '') + a.path;
	// console.log(a);
	var login = a.user;
	var password = a.password;
	return {url: result, login: login, password: password};
}

CloudHelpers.getAbsolutePosition = function(element){
	var r = { x: element.offsetLeft, y: element.offsetTop };
	if (element.offsetParent) {
	var tmp = CloudHelpers.getAbsolutePosition(element.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

CloudHelpers.cache = CloudHelpers.cache || {};
CloudHelpers.cache.timezones = CloudHelpers.cache.timezones || {};

// helper function
CloudHelpers.getOffsetTimezone = function(timezone) {
	if(!moment) {
		console.warn("Requrired moment.js library");
		return 0;
	}
	if(CloudHelpers.cache.timezones[timezone] == undefined){
		var n = new Date();
		if(timezone && timezone != ""){
			var offset = moment(n).tz(timezone).format("Z");
			var c = offset[0];
			if(c < '0' || c > '9'){
				offset = offset.substring(1);
			};
			var ts_sig = (c == '-') ? -1 : 1;
			var hs = offset.split(":");
			offset = ts_sig *(parseInt(hs[0],10)*60 + parseInt(hs[1],10));
			CloudHelpers.cache.timezones[timezone] = offset*60000;
		}else{
			CloudHelpers.cache.timezones[timezone] = 0;
		}
	}
	return CloudHelpers.cache.timezones[timezone];
}


// polyfill for ie11
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};


CloudHelpers.autoPlayAllowed = true;
CloudHelpers.checkAutoplay = function(ch_auto_callback){
	ch_auto_callback = ch_auto_callback || function() {};
	var d = new CloudHelpers.promise();
	d.done(function(){
		console.log("checkAutoplay: done")
		ch_auto_callback(CloudHelpers.autoPlayAllowed);
	})
	d.fail(function(){
		console.log("checkAutoplay: waiting")
		ch_auto_callback(CloudHelpers.autoPlayAllowed);
	})
	var _result = null;
	var tmp_video_el = document.createElement("div");
	tmp_video_el.innerHTML = "<video muted></video>";
	tmp_video_el = tmp_video_el.children[0];
	tmp_video_el.addEventListener('waiting', function() {
		console.log("checkAutoplay: waiting, ", _result)
		if (_result == null) {
			CloudHelpers.autoPlayAllowed = true;
			d.resolve(); // it's ok autoplay for Chrome
			tmp_video_el.remove();
		}
	}, false);
	
	var p = tmp_video_el.play();
	var s = '';
	if (window['Promise']) {
		s = window['Promise'].toString();
	}

	if (s.indexOf('function Promise()') !== -1
		|| s.indexOf('function ZoneAwarePromise()') !== -1) {

		p.catch(function(error) {
			// console.error("checkAutoplay, error:", error)
			// Check if it is the right error
			if(error.name == "NotAllowedError") {
				console.error("error.name:", "NotAllowedError")
				// CloudHelpers.autoPlayAllowed = false;
				_result = false;
				CloudHelpers.autoPlayAllowed = _result;
				d.reject();
			} else {
				d.reject();
				if (error.name != "AbortError"){
					console.error("checkAutoplay: happened something else");
					throw error; // happened something else
				}
			}
			tmp_video_el.remove();
		})
	} else {
		console.error("checkAutoplay could not work in your browser");
		d.reject();
		ch_auto_callback(CloudHelpers.autoPlayAllowed);
	}
}

if (typeof document !== 'undefined') {
	CloudHelpers.checkAutoplay(function(d){ console.log("checkautoplay: autoplay2 ", d); });
}

// http://jsbin.com/otecul/1/edit
CloudHelpers.humanFileSize = function(bytes) {
    var thresh = 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
};


CloudHelpers.base64_encode = function(str){
	return window.btoa(str);
}

CloudHelpers.base64_decode = function(b64){
	return window.atob(b64);
}

CloudHelpers.copy = function(obj){
	if (null == obj || "object" != typeof obj) {
		console.error("Expected object");
		return obj;
	}
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

CloudHelpers.unpackAccessToken = function(access_token) {
	var result = {
		host: 'web.skyvr.videoexpertsgroup.com'
	};
	var camid = 0;
	try {
		var obj = atob(access_token);
		obj = JSON.parse(obj);
		console.log("Token: ", obj);
		if (!obj.token) {
			console.error('Invalid access token format (missing "token")');
			return null;
		}

		if (!obj.access) {
			console.error('Invalid access token format (missing "access")');
			return null;
		}

		if (obj.token && obj.camid && obj.access && obj.token !== '' && obj.camid !== '' && obj.access !== ''){
			result.share_token = obj.token;
			result.camid = obj.camid;
			result.access = obj.access;
		}

		if (obj.api) {
			result.host = obj.api;
			// console.log('self.host: ', result.host);
		}

		if (obj.api_p) {
			result.api_port = obj.api_p;
			// console.log('self.api_port: ', result.api_port);
		}

		if (obj.api_security_port) {
			result.api_security_port = obj.api_security_port;
			// console.log('self.api_security_port: ', result.api_security_port);
		}

	} catch (err) {
		console.error('Invalid access token format');
		return null;
	}
	
	result.base_url = result.host;
	if (result.host == 'web.skyvr.videoexpertsgroup.com') {
		result.base_url = 'https://' + result.host;
	} else if (location.protocol === 'https:') {
		result.base_url = 'https://' + result.host;
		if (result.api_secutiry_port != null) {
			result.base_url += ':' + result.api_secutiry_port;
			result.port = result.api_secutiry_port;
		} else {
			result.port = 443;
		}
	} else if (location.protocol === 'http:' || location.protocol==="file:") {
		result.base_url = 'http://' + result.host;
		if (self.api_port != null) {
			result.base_url += ':' + result.api_port;
			result.port = result.api_port;
		} else {
			result.port = 80;
		}
	} else {
		console.error('Invalid protocol');
		return null;
	}

	return result;
}

CloudHelpers.createCallbacks = function() {
	return new function() {
		var mCallbacks = {};
		console.log(this);
		var self = this;
		self.executeCallbacks = function(evnt, args){
			function execCB(n, evnt_, args_){
				setTimeout(function(){
					mCallbacks[n](evnt_, args_);
				},1);
			}
			for(var n in mCallbacks){
				execCB(n, evnt, args);
			}
		}
		self.removeCallback = function(uniqname){
			delete mCallbacks[uniqname];
		}
		self.addCallback = function(uniqname, func){
			if(typeof(func) !== "function"){
				console.error("Second parameter expected function");
				return;
			}
			if(mCallbacks[uniqname]){
				console.warn(uniqname + " - already registered callback, will be removed before add");
				self.removeCallback(uniqname);
			}
			mCallbacks[uniqname] = func;
		}
	};
}

CloudHelpers.compareVersions = function(v1,v2) {
		v1 = v1 || "0.0.0";
		v2 = v2 || "0.0.0";
		var _v1 = v1.split(".");
		var _v2 = v2.split(".");
		if (_v1.length != 3 || _v2.length != 3) {
				console.error("[CloudHelpers.compareVersions] could not compare versions ", v1, v2);
				return
		}
		for (var i = 0; i < 3; i++) {
				_v1[i] = parseInt(_v1[i], 10);
				_v2[i] = parseInt(_v2[i], 10);
				if (_v1[i] != _v2[i]) {
						return _v2[i] - _v1[i];
				}
		}
		return 0;
}


// Cloud API Library.
// Network Layer Between FrontEnd And BackEnd.
// Part of CloudSDK

window.CloudAPI = function(cloud_token, svcp_url){
	var self = this;
	self.token = cloud_token.token;
	self.token_expire = cloud_token.expire;
	self.token_expireUTC = Date.parse(cloud_token.expire + "Z");
	self.host = svcp_url;
	self.token_type = cloud_token.type;
	self.requestWrap = new CloudHelpers.RequestWrap();

	self.isShareToken = function(){
		return self.token_type == 'share';
	}

	self.endpoints = {
		api: self.host + "api/v2/",
		cameras: self.host+"api/v2/cameras/",
		admin_cameras: self.host+"api/v2/admin/cameras/",
		camsess: self.host+"api/v2/camsess/",
		server: self.host+"api/v2/server/",
		account: self.host+"api/v2/account/",
		cmngrs: self.host+"api/v2/cmngrs/",
		storage: self.host+"api/v2/storage/",
		clips: self.host+"api/v2/storage/clips/",
		channels: self.host+"api/v3/channels/"
	};

	self.endpoints_v4 = {
		api: self.host + "api/v4/",
		live_watch: self.host + "api/v4/live/watch/",
	};

	self._getCloudToken = function(){
		return self.token;
	};

	self.updateApiToken = function(){
		return self.requestWrap.request({
			url: self.endpoints.account + 'token/api/',
			type: 'GET',
			token: self._getCloudToken()
		});
	}

	// get fresh token
	if(!self.isShareToken()){
		self.updateApiToken().done(function(new_token){
			console.warn("[CloudConnection] Cloud Token Api refreshed");
			self.token = new_token.token;
			self.token_expire = new_token.expire;
			self.token_expireUTC = Date.parse(new_token.expire + "Z");
			// start poling token thread 
			clearInterval(self.updateTokenInterval);
			self.updateTokenInterval = setInterval(function(){
				if(self.token_expireUTC - new Date().getTime() < 20*60000){ // less then 20 minutes
					self.updateApiToken().done(function(new_token){
						console.warn("[CloudConnection] Cloud Token api refreshed");
						self.token = new_token.token;
						self.token_expire = new_token.expire;
						self.token_expireUTC = Date.parse(new_token.expire + "Z");
					});
				}else{
					console.log("[CloudConnection] Cloud Token is live");
				}
			}, 5*60000); // every 5 minutes
		});
	}

	self.dispose = function(){
		delete self.requestWrap;
		self.token = null;
		clearInterval(self.updateTokenInterval);
	}
	
	self.createCamera = function(data){
		return self.requestWrap.request({
			url: self.endpoints.cameras + '?detail=detail',
			type: 'POST',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}

	self.camerasList = function(data){
		data = data || {};
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + "?" + query,
			type: 'GET',
			token: self._getCloudToken(),
			// data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.getCameraList = self.camerasList;
	
	self.deleteCamera = function(camid){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + '/',
			type: 'DELETE',
			token: self._getCloudToken()
		});
	}

	self.getCamera = function(camid, data){ // deprecated
		data = data || {};
		data['detail'] = 'detail';
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + '/?' + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	}

	self.getCamera2 = function(camid, data){ // new
		data = data || {};
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + '/?' + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	}
	
	self.cameraUsage = function(camid){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + '/usage/',
			type: 'GET',
			token: self._getCloudToken()
		});
	}
	
	self.updateCamera = function(camid, data){
		data = data || {};
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + '/?' + query,
			type: 'PUT',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.cameraLiveUrls = function(camid){
		var data = {};
		var r_url = self.endpoints.cameras + camid + '/live_urls/?media_urls=webrtc&';
		if(self.isShareToken()){
			data.token = self._getCloudToken();
			data.media_urls = 'webrtc';
			r_url = self.endpoints_v4.live_watch + '?';
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: r_url + query,
			type: 'GET',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
		});
	}

	self.cameraStreamUrls_webrtc = function(camid){
		var data = {};
		var r_url = self.endpoints.cameras + camid + '/stream_urls/?';
		data.proto = 'webrtc';

		if(self.isShareToken()){
			data.token = self._getCloudToken();
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: r_url + query,
			type: 'GET',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
		});
	}
	
	self.getServerTime = function(){
		var p = CloudHelpers.promise();
		
		self.requestWrap.request({
			url: self.endpoints.api + 'server/time/',
			type: 'GET'
		}).done(function(r){
			var current_utc = CloudHelpers.getCurrentTimeUTC();
			self.diffServerTime = Date.parse(r.utc + "Z") - current_utc;
			p.resolve(r);
		}).fail(function(err){
			p.reject(err);
		})
		return p;
	}
	
	self.getAccountInfo = function(){
		return self.requestWrap.request({
			url: self.endpoints.account,
			type: 'GET',
			token: self._getCloudToken()
		});
	}
	
	self.getAccountCapabilities = function(){
		return self.requestWrap.request({
			url: self.endpoints.account + "capabilities/",
			type: 'GET',
			token: self._getCloudToken()
		});
	}

	self.cameraMediaStreams = function(camid){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/media_streams/",
			type: 'GET',
			token: self._getCloudToken()
		});
	};

	self.updateCameraMediaStreams = function(camid, data){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/media_streams/",
			type: 'PUT',
			data: JSON.stringify(data),
			contentType: 'application/json',
			token: self._getCloudToken()
		});
	};

	self.cameraPreview = function(camid){
		var data = {};
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/preview/?" + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	};

	self.cameraUpdatePreview = function(camid){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/preview/update/",
			type: 'POST',
			token: self._getCloudToken()
		});
	};
	
	self.cameraSendPtz = function(camid, data){
		data = data || {};
		var get_params = {};
		if(self.isShareToken()){
			get_params.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(get_params);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/send_ptz/?" + query,
			type: 'POST',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.cameraPtzExecute = function(camid, data){
		data = data || {};
		var get_params = {};
		if(self.isShareToken()){
			get_params.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(get_params);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/ptz/execute/?" + query,
			type: 'POST',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.cameraPtz = function(camid){
		var data = {};
		if(self.isShareToken()){
			data.token = self._getCloudToken();	
		}
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/ptz/?" + query,
			type: 'GET',
			token: self._getCloudToken(),
		});
	}

	self.storageRecords = function(camid, startDT, endDt){
		var p = CloudHelpers.promise();
		var request_data = {
			camid: camid,
			limit: 1000,
			offset: 0,
			start: startDT
		};
		if(endDt)
			request_data.end = endDt;
		
		if(self.isShareToken()){
			request_data.token = self._getCloudToken();
		}
		
		function getData(req_data){
			var query = CloudHelpers.mapToUrlQuery(req_data);
			return self.requestWrap.request({
				url: self.endpoints.storage + "data/?" + query,
				type: 'GET',
				token: self._getCloudToken()
			});
		};
		
		CloudHelpers.requestAsyncList(getData, request_data, p);
		return p;
	};
	
	self.storageRecordsFirst = function(camid, startDT, nLimit){
		// console.log("storageRecordsFirst, nLimit: " + nLimit);

		var p = CloudHelpers.promise();
		var request_data = {
			camid: camid,
			limit: nLimit,
			offset: 0,
			start: startDT
		};
		request_data.limit = nLimit;
		if(self.isShareToken()){
			request_data.token = self._getCloudToken();
		}
			
		/*function getData(req_data){
			console.log("req_data: ", query);
			var query = CloudHelpers.mapToUrlQuery(req_data);
			console.log(query);
			return self.requestWrap.request({
				url: self.endpoints.storage + "data/?" + query,
				type: 'GET',
				token: self._getCloudToken()
			});
		};*/
		
		// CloudHelpers.requestAsyncList(getData, request_data_st, p);
		// return p;

		var query = CloudHelpers.mapToUrlQuery(request_data);
		return self.requestWrap.request({
			url: self.endpoints.storage + "data/?" + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	};
	
	self.storageTimeline = function(camid, start_dt, end_dt, slice){
		var request_data = {
			start: start_dt,
			end: end_dt,
			slices: slice
		};
		if(self.isShareToken()){
			request_data.token = self._getCloudToken();
		}

		var query = CloudHelpers.mapToUrlQuery(request_data);
		return self.requestWrap.request({
			url: self.endpoints.storage + "timeline/" + camid + "/?" + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	};
	
	self.storageActivity = function(camid, use_timezone){

		var request_data = {
			camid: camid
		};

		if(use_timezone){
			request_data.daysincamtz = '';
		}

		if(self.isShareToken()){
			request_data.token = self._getCloudToken();
		}

		var query = CloudHelpers.mapToUrlQuery(request_data);
		return self.requestWrap.request({
			url: self.endpoints.storage + "activity/?" + query,
			type: 'GET',
			token: self._getCloudToken()
		});
	};
	
	/* cameramanager */

	self.resetCameraManager = function(cmid, data){
		if(self.isShareToken()){
			data = data || {};
			return self.requestWrap.request({
				url: self.endpoints.cmngrs + cmid + "/reset/?token=" + self._getCloudToken(),
				type: 'POST',
				// token: self._getCloudToken(),
				data: JSON.stringify(data),
				contentType: 'application/json'
			});
		}else{
			data = data || {};
			return self.requestWrap.request({
				url: self.endpoints.cmngrs + cmid + "/reset/",
				type: 'POST',
				token: self._getCloudToken(),
				data: JSON.stringify(data),
				contentType: 'application/json'
			});
		}
	};
	
	self.updateCameraManager = function(cmid, data){
		data = data || {};
		return self.requestWrap.request({
			url: self.endpoints.cmngrs + cmid + "/",
			type: 'PUT',
			token: self._getCloudToken(),
			data: JSON.stringify(data),
			contentType: 'application/json'
		});
	};
	
	/* camsess */
	
	self.getCamsessList = function(data){
		var query = CloudHelpers.mapToUrlQuery(data);
		return self.requestWrap.request({
			url: self.endpoints.camsess + "?" + query,
			type: 'GET',
			token: self._getCloudToken(),
			// data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}

	self.getCamsess = function(id){
		return self.requestWrap.request({
			url: self.endpoints.camsess + id + "/?detail=detail",
			type: 'GET',
			token: self._getCloudToken(),
			// data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.getCamsessRecords = function(sessid){
		return self.requestWrap.request({
			url: self.endpoints.camsess + sessid + "/records/",
			type: 'GET',
			token: self._getCloudToken(),
			// data: JSON.stringify(data),
			contentType: 'application/json'
		});
	}
	
	self.deleteCamsess = function(sessid){
		return self.requestWrap.request({
			url: self.endpoints.camsess + sessid + "/",
			type: 'DELETE',
			token: self._getCloudToken(),
		});
	}

	// sharing
	self.creareCameraSharingToken = function(camid, share_name, acls){
		share_name = share_name || '';
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/sharings/",
			type: 'POST',
			data: JSON.stringify({camid: camid, name: share_name, access: acls}),
			contentType: 'application/json',
			token: self._getCloudToken(),
		});
	}

	self.updateCameraSharingToken = function(camid, shid, obj){
		obj = obj || {};
		obj.camid = camid;
		obj.shid = shid;
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/sharings/" + shid + "/",
			type: 'PUT',
			data: JSON.stringify(obj),
			contentType: 'application/json',
			token: self._getCloudToken(),
		});
	}

	self.getCameraSharingTokensList = function(camid){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/sharings/?detail=detail",
			type: 'GET',
			token: self._getCloudToken(),
		});
	}

	self.deleteCameraSharingToken = function(camid, sharing_token){
		return self.requestWrap.request({
			url: self.endpoints.cameras + camid + "/sharings/" + sharing_token + '/',
			type: 'DELETE',
			token: self._getCloudToken(),
		});
	}

	self.getChannels = function(){
		return self.requestWrap.request({
			url: self.endpoints.channels,
			type: 'GET',
			token: self._getCloudToken(),
		});
	}

    self.getCameraStreamingURLs = function(camid){
        return self.requestWrap.request({
            url: self.endpoints.cameras + camid + "/stream_urls/",
            type: 'GET',
            token: self._getCloudToken()
        });
    };

};

window.SkyVR = window.CloudAPI;

CloudAPI.config = {
	url: "",
	url_cameras: "",
	url_api: "",
	cameraID: "",
	user_name: "",
	vendor: ""
};

CloudAPI.setToCookie = function(name, value) {
	var date = new Date( new Date().getTime() + (7 * 24 * 60 * 60 * 1000) ); // cookie on week
	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + "; path=/; expires="+date.toUTCString();
}

CloudAPI.getFromCookie = function(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : '';
}

CloudAPI.removeFromCookie = function(name) {
	document.cookie = encodeURIComponent(name) + "=; path=/;";
}

CloudAPI.cache = {
	cameras: {},
	timezones: {}
};

CloudAPI.cache.cameraInfo = function(camid){
	if(camid)
		return CloudAPI.cache.cameras[camid];
	else if(CloudAPI.isCameraID())
		return CloudAPI.cache.cameras[CloudAPI.cameraID()];
};

// symlink
CloudAPI.cache.getCameraInfo = CloudAPI.cache.cameraInfo;

CloudAPI.cache.mergeObjects = function(obj1, obj2){
	// rewrite options
	for(var k in obj2){
		var t = typeof obj2[k];
		if(t == "boolean" || t == "string" || t == "number"){
			if(obj1[k] != obj2[k]){
				if(obj1[k]){
					console.log("Changed " + k);
					CloudAPI.events.trigger('CAMERA_INFO_CHANGED', {'name':k, 'new_value':obj2[k]});
				}
				obj1[k] = obj2[k];
			}
		}else if(Array.isArray(obj2[k])){
			obj1[k] = obj2[k];
		}else if(t == "object"){
			if(!obj1[k]) obj1[k] = {};
			obj1[k] = CloudAPI.cache.mergeObjects(obj1[k], obj2[k]);
		}
	}
	return obj1;
}

CloudAPI.cache.updateCameraInfo = function(cam){
	var camid = cam.id;
	if(!CloudAPI.cache.cameras[camid]){
		CloudAPI.cache.cameras[camid] = {};
	};
	CloudAPI.cache.cameras[camid] = CloudAPI.cache.mergeObjects(CloudAPI.cache.cameras[camid], cam);
}

CloudAPI.cache.setCameraInfo = function(cam){
	var camid = cam.id;
	if(CloudAPI.cache.cameras[camid] == undefined){
		CloudAPI.cache.cameras[camid] = {};
	};
	var changed_p2p_settings = cam['p2p_streaming'] && cam['p2p_streaming'] == true ? true : false; // need request
	
	var prev_cam = CloudAPI.cache.cameras[camid];
	CloudAPI.cache.cameras[camid] = CloudAPI.cache.mergeObjects(prev_cam, cam);

	// TODO clean rewrite options (exclude p2p and p2p_settings and video and audio struct)
	CloudAPI.cache.cameras[camid]['lastTimeUpdated'] = Date.now();
	// console.log("[CLOUDAPI] CloudAPI.cache.cameras[" + camid + "]: ", CloudAPI.cache.cameras[camid]);
	return changed_p2p_settings;
};
CloudAPI.cache.setP2PSettings = function(cameraID, p2p_settings){
	if(CloudAPI.cache.cameras[cameraID] == undefined){
		CloudAPI.cache.cameras[cameraID] = {};
	}
	/*for(var k in cam){
	var t = typeof cam[k];
	// console.log("Type: " + t);
	if(t == "boolean" || t == "string" || t == "number"){
		if(CloudAPI.cache.cameras[camid][k] != cam[k]){
			if(CloudAPI.cache.cameras[camid][k])
				console.log("Changed " + k);
			CloudAPI.cache.cameras[camid][k] = cam[k];
		}*/
	CloudAPI.cache.cameras[cameraID].p2p = p2p_settings;
	CloudAPI.cache.cameras[cameraID].p2p_settings = CloudAPI.cache.cameras[cameraID].p2p;
	// console.log("[CLOUDAPI] setP2PSettings. CloudAPI.cache.cameras[" + cameraID + "]: ", CloudAPI.cache.cameras[cameraID]);
};

CloudAPI.cache.setMemoryCard = function(cameraID, memory_card){
	if(CloudAPI.cache.cameras[cameraID] == undefined){
		CloudAPI.cache.cameras[cameraID] = {};
	}
	CloudAPI.cache.cameras[cameraID].memory_card = memory_card;
};

CloudAPI.cache.setPtzCaps = function(cameraID, ptz_caps){
	if(CloudAPI.cache.cameras[cameraID] == undefined){
		CloudAPI.cache.cameras[cameraID] = {};
	}
	CloudAPI.cache.cameras[cameraID].ptz = ptz_caps;
};

CloudAPI.cache.updateCameraAudio = function(cameraID, audio_struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]["audio"]){
		CloudAPI.cache.cameras[cameraID]["audio"] = {};
	}
	CloudAPI.cache.cameras[cameraID].audio = CloudAPI.cache.mergeObjects(CloudAPI.cache.cameras[cameraID].audio, audio_struct);
};
CloudAPI.cache.cameraAudio = function(cameraID){
	cameraID = cameraID || CloudAPI.cameraID();
	if(!CloudAPI.cache.cameras[cameraID]){
		return {};
	};
	return CloudAPI.cache.cameras[cameraID].audio;
};
CloudAPI.cache.updateCameraVideo = function(cameraID, video_struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]["video"]){
		CloudAPI.cache.cameras[cameraID]["video"] = {};
	}
	var video = CloudAPI.cache.cameras[cameraID]["video"];
	CloudAPI.cache.cameras[cameraID]["video"] = CloudAPI.cache.mergeObjects(video, video_struct);
};
CloudAPI.cache.cameraVideo = function(cameraID){
	cameraID = cameraID || CloudAPI.cameraID();
	if(!CloudAPI.cache.cameras[cameraID]){
		return {};
	};
	return CloudAPI.cache.cameras[cameraID].video;
}
CloudAPI.cache.cameraVideoStreamName = function(cameraID){
	cameraID = cameraID || CloudAPI.cameraID();
	if(!CloudAPI.cache.cameras[cameraID]){
		return {};
	};
	var video = CloudAPI.cache.cameras[cameraID].video;
	if(video.streams){
		for(var v in video.streams){
			return v;
		}
	}
	return;
};
CloudAPI.cache.cameraVideoStreams = function(cameraID){
	cameraID = cameraID || CloudAPI.cameraID();
	if(!CloudAPI.cache.cameras[cameraID]){
		return {};
	};
	var video = CloudAPI.cache.cameras[cameraID].video;
	if(video.streams){
		return video.streams;
	}
	return;
};
CloudAPI.cache.setLimits = function(cameraID, struct_limits){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	CloudAPI.cache.cameras[cameraID].limits = struct_limits;
};
CloudAPI.cache.updateCameraVideoStream = function(cameraID, vs_id, struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['video']){
		CloudAPI.cache.cameras[cameraID]['video'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['video']['streams']){
		CloudAPI.cache.cameras[cameraID]['video']['streams'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['video']['streams'][vs_id]){
		CloudAPI.cache.cameras[cameraID]['video']['streams'][vs_id] = {};
	};
	var prev = CloudAPI.cache.cameras[cameraID]['video']['streams'][vs_id];
	CloudAPI.cache.cameras[cameraID]['video']['streams'][vs_id] = CloudAPI.cache.mergeObjects(prev, struct);
}
CloudAPI.cache.setAudioStream = function(cameraID, as_id, struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['audio']){
		CloudAPI.cache.cameras[cameraID]['audio'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['audio']['streams']){
		CloudAPI.cache.cameras[cameraID]['audio']['streams'] = {};
	};
	CloudAPI.cache.cameras[cameraID]['audio']['streams'][as_id] = struct;
}
CloudAPI.cache.setMediaStreams = function(cameraID, media_streams_struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	CloudAPI.cache.cameras[cameraID]['media_streams'] = media_streams_struct;
};
CloudAPI.cache.updateEventProcessingEventsMotion = function(cameraID, struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']){
		CloudAPI.cache.cameras[cameraID]['event_processing'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']['events']){
		CloudAPI.cache.cameras[cameraID]['event_processing']['events'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']['events']['motion']){
		CloudAPI.cache.cameras[cameraID]['event_processing']['events']['motion'] = {};
	};
	var prev = CloudAPI.cache.cameras[cameraID]['event_processing']['events']['motion'];
	CloudAPI.cache.cameras[cameraID]['event_processing']['events']['motion'] = CloudAPI.cache.mergeObjects(prev, struct);
};
CloudAPI.cache.updateCameraEventProcessingEventsSound = function(cameraID, struct){
	if(!CloudAPI.cache.cameras[cameraID]){
		CloudAPI.cache.cameras[cameraID] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']){
		CloudAPI.cache.cameras[cameraID]['event_processing'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']['events']){
		CloudAPI.cache.cameras[cameraID]['event_processing']['events'] = {};
	};
	if(!CloudAPI.cache.cameras[cameraID]['event_processing']['events']['sound']){
		CloudAPI.cache.cameras[cameraID]['event_processing']['events']['sound'] = {};
	};
	var prev = CloudAPI.cache.cameras[cameraID]['event_processing']['events']['sound'];
	CloudAPI.cache.cameras[cameraID]['event_processing']['events']['sound'] = CloudAPI.cache.mergeObjects(prev, struct);
};

CloudAPI.generateNewLocation = function(page){
	var params = [];
	if(CloudHelpers.containsPageParam("lang"))
		params.push("lang=" +encodeURIComponent(CloudAPI.pageParams["lang"]));
	if(CloudHelpers.containsPageParam("vendor"))
		params.push("vendor=" +encodeURIComponent(CloudAPI.pageParams["vendor"]));
	if(CloudHelpers.containsPageParam("mobile"))
		params.push('mobile=' + encodeURIComponent(CloudAPI.pageParams['mobile']))
	params.push("p=" +encodeURIComponent(page));
	return "?" + params.join("&");
}

CloudAPI.setURL = function(url){
	if(CloudAPI.config.url != url){
		CloudAPI.config.url = url;
		CloudAPI.config.url_api = url+"api/v2/";
		CloudAPI.config.url_cameras = url+"api/v2/cameras/";
		CloudAPI.config.url_admin_cameras = url+"api/v2/admin/cameras/";
		CloudAPI.config.url_camsess = url+"api/v2/camsess/";
		CloudAPI.config.url_server = url+"api/v2/server/";
		CloudAPI.config.url_account = url+"api/v2/account/";
		CloudAPI.config.url_cmngrs = url+"api/v2/cmngrs/";
		CloudAPI.config.url_storage = url+"api/v2/storage/";
		CloudAPI.config.url_clips = url+"api/v2/storage/clips/";
		CloudAPI.config.anonToken = {
			token: '',
			type: 'anon',
			expire: '',
			expireTimeUTC: 0
		};
		// console.log(localStorage);
		if(localStorage.getItem('SkyVR_anonToken'))
			CloudAPI.config.anonToken = JSON.parse(localStorage.getItem('SkyVR_anonToken'));
		CloudAPI.config.apiToken = {
			token: '',
			type: 'api',
			expire: '',
			expireTimeUTC: 0
		};
		CloudAPI.config.shareToken = {};
		var old_token = CloudAPI.getFromStorage('SkyVR_apiToken');
		if(old_token){
			var apiToken = JSON.parse(old_token)
			if(apiToken.expireTimeUTC > Date.now()){
				CloudAPI.config.apiToken = apiToken;
			}
		}
		CloudAPI.setToStorage('CloudAPI_svcp_host', url);
	};
};


CloudAPI.isExpiredApiToken = function(){
	if(CloudAPI.config.apiToken.expireTimeUTC){
		if(CloudAPI.config.apiToken.expireTimeUTC > Date.now()){
			return false;
		}else{
			return true;
		}
	}else{
		return true;
	}
}

CloudAPI.applyApiToken = function(){
	$.ajaxSetup({
		crossDomain: true,
		cache: false,
		beforeSend: function(xhr,settings) {
			if(CloudAPI.config.apiToken && CloudAPI.config.apiToken.token) {
				xhr.setRequestHeader('Authorization', 'SkyVR ' + CloudAPI.config.apiToken.token);
			}
		}
	});
}
// $.support.cors = true;
/*
CloudAPI.updatePageProgressCaption = function(){
	
	var loading_translate = {
		'en' : 'Loading...',
		'ru' : 'Загрузка...',
		'ko' : '카메라 정보 가져오는 중...',
		'it' : 'Caricamento in corso...'
	}
	
	try{
		if(document.getElementById('progress-caption')){
			if(loading_translate[CloudAPI.lang()]){
				document.getElementById('progress-caption').innerHTML = loading_translate[CloudAPI.lang()];
			}else{
				document.getElementById('progress-caption').innerHTML = loading_translate["en"];
			}
		}
	}catch(e){
	}
}

CloudAPI.loadVendorScripts = function(vendor, path){
	if(vendor != ''){
		var js = document.createElement("script");
		js.type = "text/javascript";
		js.src = (path ? path : './') + 'vendor/' + vendor + "/cc.js";
		document.head.appendChild(js);
		
		js.onload = function(){
			CloudAPI.updatePageProgressCaption(); // TODO move to CloudUI
			if(CloudHelpers.containsPageParam("customswf")){
				cc.custom_videojs_swf = "swf/video-js-custom-vxg.swf";
			}

			if(CloudAPI.onLoadedVendorScript){
				CloudAPI.onLoadedVendorScript();
			}
		}

		js.onerror = function(){
			console.error("Not found vendor use default");
			CloudAPI.config.vendor = 'VXG';
			CloudAPI.loadVendorScripts(CloudAPI.config.vendor, path);
		}

		var cc_css = document.createElement("link");
		cc_css.rel = "stylesheet";
		cc_css.href = (path ? path : './') + "vendor/" + vendor + "/cc.min.css";
		document.head.appendChild(cc_css);
		
		var cc_css2 = document.createElement("link");
		cc_css2.rel = "stylesheet";
		cc_css2.href = (path ? path : './') + "vendor/" + vendor + "/pageloader.min.css";
		document.head.appendChild(cc_css2);
	}else{
		// Load default scripts
		console.log('Not found vendor');
		CloudAPI.loadVendorScripts('VXG', path);
	}
};

CloudAPI.url = function() {
	return CloudAPI.config.url;
};

CloudAPI.setCameraID = function(id){
	if(CloudAPI.config.cameraID != id && id){
		CloudAPI.config.cameraID = id;
		console.log("[CLOUDAPI] new cam id: " + id);
		if(!CloudAPI.cache.camera){
			CloudAPI.cameraInfo().done(function(cam){
				CloudAPI.cache.camera = cam;
			});
		}
	} else if (!id){
		CloudAPI.config.cameraID = undefined;
		CloudAPI.cache.camera = undefined;
	}
};
CloudAPI.cameraID = function(){
	return CloudAPI.config.cameraID;
};
CloudAPI.cameraManagerID = function(){
	return CloudAPI.cache.cameras[CloudAPI.config.cameraID]['cmngrid'];
};
CloudAPI.isCameraID = function(){
	if(CloudAPI.config.cameraID == undefined){
		console.error("[CLOUDAPI] cameraID is undefined");
		return false;
	};
	return true;
};
CloudAPI.isP2PStreaming_byId = function(camid){
	var cam = CloudAPI.cache.cameras[camid];
	if(cam && cam['p2p_streaming'] && cam.p2p_streaming == true){
		return true;
	}
	return false;
};
CloudAPI.isP2PStreaming = function(){
	if(CloudAPI.cache.cameraInfo() == undefined){
		console.error("[CLOUDAPI] cameraID is undefined");
		return false;
	};
	return CloudAPI.isP2PStreaming_byId(CloudAPI.cache.cameraInfo().id);
};

CloudAPI.hasMemoryCard_byId = function(camid){
	var cam = CloudAPI.cache.cameras[camid];
	if(cam && cam['memory_card'] && cam.memory_card.status != "none"){
		return true;
	}
	return false;
}

CloudAPI.hasMemoryCard = function(){
	if(CloudAPI.cache.cameraInfo() == undefined){
		console.error("[CLOUDAPI] cameraID is undefined");
		return false;
	};
	return CloudAPI.hasMemoryCard_byId(CloudAPI.cache.cameraInfo().id);
}

CloudAPI.convertUTCTimeToStr = function(t){
	var d = new Date();
	d.setTime(t);
	var monthesTrans = ["short_Jan", "short_Feb", "short_Mar",
		"short_Apr", "short_May", "short_June",
		"short_July", "short_Aug", "short_Sep",
		"short_Oct", "short_Nov", "short_Dec"
	];
	var str = d.getUTCDate() + CloudUI.tr(monthesTrans[d.getUTCMonth()]) + " " + d.getUTCFullYear() + " "
		+ ("00" + d.getUTCHours()).slice(-2) + ":" + ("00" + d.getUTCMinutes()).slice(-2) + ":" + ("00" + d.getUTCSeconds()).slice(-2);
	if(CloudAPI.lang() == 'ko'){
		str = ("00" + (d.getUTCMonth() + 1)).slice(-2) + '/' + ("00" + d.getUTCDate()).slice(-2) + "/" + d.getUTCFullYear() + " "
			+ ("00" + d.getUTCHours()).slice(-2) + ":" + ("00" + d.getUTCMinutes()).slice(-2) + ":" + ("00" + d.getUTCSeconds()).slice(-2);
	}
	return str;
};

CloudAPI.convertUTCTimeToSimpleStr = function(t){
	var d = new Date();
	d.setTime(t);
	var str = d.getUTCFullYear() + "-"
		+ ("00" + (d.getUTCMonth()+1)).slice(-2) + "-"
		+ ("00" + d.getUTCDate()).slice(-2) + " "
		+ ("00" + d.getUTCHours()).slice(-2) + ":"
		+ ("00" + d.getUTCMinutes()).slice(-2) + ":"
		+ ("00" + d.getUTCSeconds()).slice(-2);
	return str;
}

// helper function
CloudAPI.getOffsetTimezone = function() {
	var cam = CloudAPI.cache.cameraInfo();
	if(!cam) return 0;
	if(CloudAPI.cache.timezones[cam.timezone] == undefined){
		var n = new Date();
		if(cam.timezone && cam.timezone != ""){
			var cameraOffset = moment(n).tz(cam.timezone).format("Z");
			var c = cameraOffset[0];
			if(c < '0' || c > '9'){
				cameraOffset = cameraOffset.substring(1);
			};
			var ts_sig = (c == '-') ? -1 : 1;
			var hs = cameraOffset.split(":");
			cameraOffset = ts_sig *(parseInt(hs[0],10)*60 + parseInt(hs[1],10));
			CloudAPI.cache.timezones[cam.timezone] = cameraOffset*60000;
		}else{
			CloudAPI.cache.timezones[cam.timezone] = 0;
		}
	}
	return CloudAPI.cache.timezones[cam.timezone];
}
CloudAPI.getCurrentTimeUTC = function(){
	return Date.now();
};
CloudAPI.getCurrentTimeByCameraTimezone = function(){
	return Date.now() + CloudAPI.getOffsetTimezone();
};
*/

CloudAPI.enable401handler = function() {
	/*$.ajaxSetup({
		error : function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 401 && jqXHR.statusText == "UNAUTHORIZED") {
				
				var uri = CloudAPI.parseUri(CloudAPI.url);
				var uri2 = CloudAPI.parseUri(CloudAPI.config.url);
				if(uri.host == "" || uri.host == uri2.host){
					CloudAPI.disable401handler();

					if(application.apiToken) {
						application.apiToken.destroy();
					}
					application.cleanupHeader();
					try{ application.player.disposeVideo(); }catch(e) { console.error(e); }
					try{ application.timeline.dispose(); }catch(e) { console.error(e); }

					event.trigger(event.UNAUTHORIZED_REQUEST);
					// application.trigger('showSignIn');
					// window.location = "?";
				}
			}
		}
	});*/
};
CloudAPI.disable401handler = function() {
	$.ajaxSetup({
		error : function(jqXHR, textStatus, errorThrown) {
		}
	});
};
CloudAPI.printStack = function(){
	var err = new Error();
	console.error(err.stack);
};
// constants for pages
CloudAPI.PAGE_SIGNIN = "signin";

/*	CloudAPI.getUTC = function(camtimezone){
	var now = new Date();
	var now_utc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
	var d = new Date.now();
	var t = d.getTimezoneOffset();
};*/

CloudAPI.hasAccess = function(caminfo, rule){
	if(SkyUI.isDemo()) return true;
	if(!caminfo) return false;
	if(!caminfo['access']) return true;
	var bResult = false;
	for(var s in caminfo['access']){
		if(caminfo['access'][s] == rule)
			bResult = true;
	}
	return bResult;
}

CloudAPI.hasAccessSettings = function(caminfo){
	if(SkyUI.isDemo()) return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "all");
}

CloudAPI.hasAccessMotionDetection = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, 'all') || CloudAPI.hasAccess(caminfo, 'ptz');
};

CloudAPI.hasAccessClips = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "clipping") || CloudAPI.hasAccess(caminfo, "clipplay") || CloudAPI.hasAccess(caminfo, "watch") || CloudAPI.hasAccess(caminfo, "cplay") || CloudAPI.hasAccess(caminfo, "all");
}

CloudAPI.hasAccessLive = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "ptz") || CloudAPI.hasAccess(caminfo, "live") || CloudAPI.hasAccess(caminfo, "watch") || CloudAPI.hasAccess(caminfo, "all");
}

CloudAPI.hasAccessPlayback = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "clipping") || CloudAPI.hasAccess(caminfo, "play") || CloudAPI.hasAccess(caminfo, "watch") || CloudAPI.hasAccess(caminfo, "splay") || CloudAPI.hasAccess(caminfo, "all");
}

CloudAPI.hasAccessMakeClip = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "clipping") || CloudAPI.hasAccess(caminfo, "all");
}

CloudAPI.hasAccessBackAudio = function(caminfo){
	if(SkyUI.isDemo())return true;
	caminfo = caminfo || CloudAPI.cache.cameraInfo();
	return CloudAPI.hasAccess(caminfo, "all") || CloudAPI.hasAccess(caminfo, "backaudio");
}

CloudAPI.handleNothing = function(response){
	// nothing
};

CloudAPI.handleNothingError = function(xhr, ajaxOptions, thrownError){
	// nothing
};
CloudAPI.handleError = function(xhr, ajaxOptions, thrownError){
	console.error(thrownError);
};

CloudAPI.parseUri = function(str) {
	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	function parseUri(str) {
		var	o   = parseUri.options,
			m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
			uri = {},
			i   = 14;

		while (i--) uri[o.key[i]] = m[i] || "";

		uri[o.q.name] = {};
		uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
			if ($1) uri[o.q.name][$1] = $2;
		});

		return uri;
	};
	parseUri.options = {
		strictMode: false,
		key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
		q:   {
			name:   "queryKey",
			parser: /(?:^|&)([^&=]*)=?([^&]*)/g
		},
		parser: {
			strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
			loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
		}
	};
	return parseUri(str)
};

CloudAPI.logout = function(callback){
	$.ajax({
		url: CloudAPI.config.url_account + "logout/",
		type: 'POST',
		success: callback,
		error: CloudAPI.handleError
	});
};
CloudAPI.cameraVideoStream = function(vs_id){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.config.cameraID;
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/video/streams/" + vs_id + "/",
		type : "GET"
	}).done(function(response){
		CloudAPI.cache.updateCameraVideoStream(camid, vs_id, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraLimits = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.config.cameraID;
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/limits/",
		type : "GET"
	}).done(function(response){
		CloudAPI.cache.setLimits(CloudAPI.cameraID(), response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraEventProcessingEventsMotion = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.config.cameraID;
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/event_processing/events/motion/",
		type : "GET"
	}).done(function(response){
		CloudAPI.cache.updateEventProcessingEventsMotion(camid, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
}
CloudAPI.updateCameraEventProcessingEventsMotion = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/event_processing/events/motion/",
		type : 'PUT',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(){
		CloudAPI.cache.updateEventProcessingEventsMotion(camid, data);
		d.resolve();
	}).fail(function(){
		d.reject();
	});
	return d;
}

CloudAPI.cameraEventProcessingEventsSound = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.config.cameraID;
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/event_processing/events/sound/",
		type : "GET"
	}).done(function(response){
		CloudAPI.cache.updateCameraEventProcessingEventsSound(camid, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
}

/*
CloudAPI.cameraSendPtz = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/send_ptz/",
		type : 'POST',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(response){
		console.log(response);
		d.resolve();
	}).fail(function(){
		d.reject();
	});
	return d;
}

CloudAPI.cameraPtzExecute = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/ptz/execute/",
		type : 'POST',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(response){
		console.log(response);
		d.resolve();
	}).fail(function(){
		d.reject();
	});
	return d;
}

CloudAPI.cameraPtz = function(camid){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = camid || CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/ptz/",
		type : 'GET'
	}).done(function(r){
		CloudAPI.cache.setPtzCaps(camid, r);
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
}
*/

CloudAPI.updateCameraEventProcessingEventsSound = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/event_processing/events/sound/",
		type : 'PUT',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(){
		// console.log("");
		CloudAPI.cache.updateCameraEventProcessingEventsSound(camid, data);
		d.resolve();
	}).fail(function(){
		d.reject();
	});
	return d;
}

CloudAPI.updateCameraVideoStream = function(vs_id, data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url : CloudAPI.config.url_cameras + camid + "/video/streams/" + vs_id + "/",
		type : "PUT",
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(){
		console.log("[CLOUDAPI] [CLOUDAPI] Updated video/streams/" + vs_id + " in cache for " + camid);
		CloudAPI.cache.updateCameraVideoStream(camid, vs_id, data);
		d.resolve();
	}).fail(function(){
		d.reject();
	})
	return d;
};
// depreacted please use updateCameraVideoStream
CloudAPI.setVBRQuality = function(newValue, vs_id, cb_success, cb_error){
	if(!CloudAPI.isCameraID()) return;
	cb_success = (cb_success == undefined) ? CloudAPI.handleNothing : cb_success;
	cb_error = (cb_error == undefined) ? CloudAPI.handleError : cb_error;
	var data = {};
	data.vbr_quality = newValue;
	data.vbr = true;
	$.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.config.cameraID + "/video/streams/" + vs_id + "/",
		type: 'PUT',
		success: cb_success,
		error: cb_success,
		data:  JSON.stringify(data),
		contentType: 'application/json'
	});
};
CloudAPI.formatMemoryCard = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()){
		d.reject();
		return d;
	}
	var camid = CloudAPI.config.cameraID;
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/format_memory_card/",
		type: 'POST'
	}).done(function(response){
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraMemoryCard = function(camid){
	var d = $.Deferred();
	var camid = camid || CloudAPI.config.cameraID;
	if(!camid){
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/memory_card/",
		type: 'GET'
	}).done(function(response){
		CloudAPI.cache.setMemoryCard(camid, response)
		d.resolve(response);
	}).fail(function(){
		CloudAPI.cache.setMemoryCard(camid, { "status" : "none" });
		d.reject();
	});
	return d;
};

CloudAPI.cameraWifi = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()){
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.config.cameraID + "/wifi/",
		type: 'GET'
	}).done(function(response){
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraFirmwares = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()){
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.config.cameraID + "/firmwares/?limit=1000",
		type: 'GET',
		contentType: 'application/json'
	}).done(function(response){
		d.resolve(response.objects);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraFirmwaresUpgrade = function(version){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()){
		d.reject();
		return d;
	}
	console.log("[CLOUDAPI] upgrade firmware to version: " + version);
	var data = {};
	data.version = version;
	$.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.config.cameraID + "/firmwares/upgrade/",
		type: 'POST',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(){
		d.resolve();
	}).fail(function(jqXHR, textStatus){
		console.error("[CLOUDAPI] cameraFirmwaresUpgrade, " + textStatus, jqXHR);
		d.reject();
	});
	return d;
};

CloudAPI.accountInfo = function(){
	var d = $.Deferred();
	$.ajax({
		url: CloudAPI.config.url_account,
		type: 'GET',
		cache : false
	}).done(function(r){
		CloudAPI.cache.account = r;
		d.resolve(r);
	}).fail(function(r){
		console.log("Fail " + CloudAPI.config.url_account);
		console.error(r);
		d.reject(r);
	});
	return d;
}

CloudAPI.anonToken = function(){
	var d = $.Deferred();
	var now = Date.now();
	var min = CloudAPI.config.anonToken.expireTimeUTC - 10*60*1000; // 10 min
	var max = CloudAPI.config.anonToken.expireTimeUTC - 5*60*1000; // 5 min
	if(now > min && now < max){
		$.ajaxSetup({
			crossDomain: true,
			cache: false,
			headers:{
				'Authorization': 'SkyVR ' + CloudAPI.config.anonToken.token
			}
		});
		d.resolve(CloudAPI.config.anonToken);
	}else{
		$.ajax({
			url: CloudAPI.config.url_account + "token/anon/",
			type: 'GET'
		}).done(function(tk){
			CloudAPI.config.anonToken.token = tk.token;
			CloudAPI.config.anonToken.type = tk.type;
			CloudAPI.config.anonToken.expire = tk.expire;
			CloudAPI.config.anonToken.expireTimeUTC = Date.parse(tk.expire+'Z');
			CloudAPI.setToStorage('SkyVR_anonToken', JSON.stringify(CloudAPI.config.anonToken));
			$.ajaxSetup({
				crossDomain: true,
				cache: false,
				headers:{
					'Authorization': 'SkyVR ' + tk.token
				}
			});
			d.resolve(CloudAPI.config.anonToken);
		}).fail(function(){
			d.reject();
		});
	}
	return d;
};

CloudAPI.accountShare = function(data){
	var params = {};
	params.camid = CloudAPI.cameraID();
	return $.ajax({
		url: CloudAPI.config.url_account + 'share/',
		type: 'POST',
		data:  JSON.stringify(data),
		contentType: 'application/json',
		cache : false
	});
};
CloudAPI.capabilities = function(cb_success, cb_error){
	cb_success = (cb_success == undefined) ? CloudAPI.handleNothing : cb_success;
	cb_error = (cb_error == undefined) ? CloudAPI.handleError : cb_error;
	$.ajax({
		url: CloudAPI.config.url_api + "capabilities/",
		type: 'GET',
		success: cb_success,
		error: cb_error
	});
};

CloudAPI.cameraInfo = function(camid){
	var d = $.Deferred();
	camid = camid || CloudAPI.cameraID();
	if(camid == undefined){
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/",
		type: 'GET'
	}).done(function(response){
		
		if(CloudAPI.cache.cameras[response.id] && !CloudAPI.cache.cameras[response.id]["memory_card"]){
			console.log("cameraInfo cahce has not memory card info for camid=" + response.id);
			CloudAPI.cameraMemoryCard(response.id);
		}else if(!CloudAPI.cache.cameras[response.id]){
			console.log("cameraInfo has not in cache for camid=" + response.id);
			CloudAPI.cameraMemoryCard(response.id);	
		}
		
		
		// SET to cache
		if(CloudAPI.cache.setCameraInfo(response)){
			CloudAPI.cameraP2PSettings(camid).done(function(p2p_settings){
				d.resolve(CloudAPI.cache.cameras[camid]);
			}).fail(function() {
				d.resolve(CloudAPI.cache.cameras[camid]);
			});
		}else{
			d.resolve(CloudAPI.cache.cameras[camid]);
		}
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.updateCamera = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/",
		type: 'PUT',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(response){
		console.log("[CLOUDAPI] Updated camera in cache for " + CloudAPI.cameraID());
		data.id = CloudAPI.cameraID();
		CloudAPI.cache.updateCameraInfo(data);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.cameraMesaging = function(camid){
	var d = $.Deferred();
	camid = camid || CloudAPI.cameraID();
	if(camid == undefined){
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/raw_messaging/",
		type: 'GET'
	}).done(function(r){
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
};

CloudAPI.updateCameraAudio = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/audio/",
		type: 'PUT',
		data:  JSON.stringify(data),
		contentType: 'application/json'
	}).done(function(response){
		console.log("[CLOUDAPI] Updated audio in cache for " + camid);
		CloudAPI.cache.updateCameraAudio(camid, data);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};
CloudAPI.cameraAudio = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/audio/",
		type: 'GET'
	}).done(function(response){
		CloudAPI.cache.updateCameraAudio(camid, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};
CloudAPI.cameraVideo = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/video/",
		type: 'GET'
	}).done(function(response){
		CloudAPI.cache.updateCameraVideo(camid, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};
CloudAPI.updateCameraVideo = function(data){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/video/",
		type: 'PUT',
		contentType: 'application/json',
		data:  JSON.stringify(data)
	}).done(function(response){
		CloudAPI.cache.updateCameraVideo(camid, data);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

// TODO deprecated
CloudAPI.setCameraVideo = function(new_values, cb_success, cb_error){
	if(!CloudAPI.isCameraID()) return;
	cb_success = cb_success || CloudAPI.handleNothing;
	cb_error = cb_error || CloudAPI.handleError;
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/video/",
		type: 'PUT',
		success: cb_success,
		error: cb_error,
		contentType: 'application/json',
		data:  JSON.stringify(new_values)
	});
};
CloudAPI.cameraMediaStreams = function(){
	var d = $.Deferred();
	if(!CloudAPI.isCameraID()) {
		d.reject();
		return d;
	}
	var camid = CloudAPI.cameraID();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/media_streams/",
		type: 'GET'
	}).done(function(response){
		CloudAPI.cache.setMediaStreams(camid, response);
		d.resolve(response);
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.updateCameraMediaStreams = function(params, camid){
	var d = $.Deferred();
	camid = camid || CloudAPI.cameraID()
	if(!camid) {
		d.reject();
		return d;
	}
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/media_streams/",
		type: 'PUT',
		data:  JSON.stringify(params),
		contentType: 'application/json'
	}).done(function(r){
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
};

CloudAPI.cameraLiveUrls = function(camid){
	var d = $.Deferred();
	camid = camid || CloudAPI.cameraID();
	if(!camid){
		d.reject();
		return d;
	}

	$.ajax({
		url: CloudAPI.config.url_cameras + camid + "/live_urls/",
		type: 'GET'
	}).done(function(liveurls){
		d.resolve(liveurls);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
};

CloudAPI.cameraBackwardStart = function(){
	if(!CloudAPI.isCameraID()) return;
	var data = {};
	if(!CloudAPI.config.backwardURL) return;
	data.url = CloudAPI.config.backwardURL;
	if(CloudAPI.config.tmpBackwardURL == CloudAPI.config.backwardURL)
		CloudAPI.config.tmpBackwardURLCount++;
	else{
		CloudAPI.config.tmpBackwardURLCount = 1;
		CloudAPI.config.tmpBackwardURL = CloudAPI.config.backwardURL;
	}
	
	if(CloudAPI.isP2PStreaming()){
		console.log("[CLOUDAPI] Send (audio streaming) backward start: " + CloudAPI.config.backwardURL);
		$.ajax({
			url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/audio/backward/start/",
			type: 'POST',
			success: CloudAPI.handleNothing,
			data:  JSON.stringify(data),
			contentType: 'application/json'
		});
	}
};

CloudAPI.cameraBackwardStop = function(){
	if(!CloudAPI.isCameraID()) return;
	var data = {}
	if(!CloudAPI.config.backwardURL) return;
	data.url = CloudAPI.config.backwardURL;
	// CloudAPI.config.backwardURL = undefined;
	if(CloudAPI.config.tmpBackwardURL == CloudAPI.config.backwardURL){
		if(CloudAPI.config.tmpBackwardURLCount == 0)
			return;
		else
			CloudAPI.config.tmpBackwardURLCount--;
	}

	if(CloudAPI.isP2PStreaming()){
		console.log("[CLOUDAPI] Send (audio streaming) backward stop: " + CloudAPI.config.backwardURL);
		$.ajax({
			url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/audio/backward/stop/",
			type: 'POST',
			success: CloudAPI.handleNothing,
			data:  JSON.stringify(data),
			contentType: 'application/json'
		});
	}
};
CloudAPI.cameraSchedule = function(){
	if(!CloudAPI.isCameraID()) return;
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/schedule/",
		type: 'GET',
		cache : false
	});
};
CloudAPI.updateCameraSchedule = function(data){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/schedule/",
		type: 'PUT',
		data: JSON.stringify(data),
		cache : false,
		contentType: 'application/json'
	});
};
CloudAPI.hasAccessCameraPreview = function(camid){
	var caminfo = CloudAPI.cache.cameraInfo(camid);
	if(!caminfo) return false;
	return CloudAPI.hasAccess(caminfo, 'live') || CloudAPI.hasAccess(caminfo, 'all') || CloudAPI.hasAccess(caminfo, 'ptz');
};
CloudAPI.cameraPreview = function(cameraID, cb_success, cb_error){
	cb_success = (cb_success == undefined) ? CloudAPI.handleNothing : cb_success;
	cb_error = (cb_error == undefined) ? CloudAPI.handleError : cb_error;
	return $.ajax({
		url: CloudAPI.config.url_cameras + cameraID + "/preview/",
		type: 'GET',
		success: cb_success,
		error: cb_error
	});
};
CloudAPI.hasAccessCameraUpdatePreview = function(camid){
	var caminfo = CloudAPI.cache.cameraInfo(camid);
	if(!caminfo) return false;
	return CloudAPI.hasAccess(caminfo, 'live') || CloudAPI.hasAccess(caminfo, 'all') || CloudAPI.hasAccess(caminfo, 'ptz');
};
CloudAPI.cameraUpdatePreview = function(cameraID){
	return $.ajax({
		url: CloudAPI.config.url_cameras + cameraID + "/preview/update/",
		type: 'POST'
	});
};	
CloudAPI.storageDataFirstRecord = function(startDT){
	var d = $.Deferred();
	var request_data = {
		camid: CloudAPI.cameraID(),
		limit: 1,
		offset: 0
	};
	if(startDT){
		request_data.start = startDT;
	}
	$.ajax({
		url: CloudAPI.config.url_storage + "data/",
		data: request_data,
		cache : false,
		type: 'GET'
	}).done(function(data){
		if(data.objects.length > 0){
			d.resolve(data.objects[0]);
		}else{
			d.reject();
		}
	}).fail(function(){
		d.reject();
	})
	return d;
};
CloudAPI.storageEventsFirstRecord = function(){
	var d = $.Deferred();
	var request_data = {
		camid: CloudAPI.cameraID(),
		limit: 1,
		offset: 0
	};
	$.ajax({
		url: CloudAPI.config.url_storage + "events/",
		data: request_data,
		cache : false,
		type: 'GET'
	}).done(function(data){
		if(data.objects.length > 0){
			d.resolve(data.objects[0]);
		}else{
			d.reject();
		}
	}).fail(function(){
		d.reject();
	})
	return d;
};
CloudAPI.storageThumbnailsFirstRecord = function(){
	var d = $.Deferred();
	var request_data = {
		camid: CloudAPI.cameraID(),
		limit: 1,
		offset: 0
	};
	$.ajax({
		url: CloudAPI.config.url_storage + "thumbnails/",
		data: request_data,
		cache : false,
		type: 'GET'
	}).done(function(data){
		if(data.objects.length > 0){
			d.resolve(data.objects[0]);
		}else{
			d.reject();
		}
	}).fail(function(){
		d.reject();
	})
	return d;
};

CloudAPI.getAllData = function(url, req_data){
	// TODO
}


CloudAPI.storageThumbnails = function(startDT, endDt){
	var d = $.Deferred();
	var result = {
		meta: {
			limit: 1000,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	// TODO if not selected camera
	var request_data = {
		camid: CloudAPI.cameraID(),
		limit: result.meta.limit,
		offset: result.meta.offset,
		start: startDT
	};
	if(endDt)
		request_data.end = endDt;
	
	function getData(req_data){
		var req_d = $.Deferred();
		$.ajax({
			url: CloudAPI.config.url_storage + "thumbnails/",
			data: req_data,
			cache : false,
			async: true,
			type: 'GET'
		}).done(function(data){
			req_d.resolve(data);
		}).fail(function(){
			req_d.reject();
		});
		return req_d;
	};

	getData(request_data).fail(function(){
		d.reject();
	}).done(function(data){
		result.meta.total_count = data.meta.total_count;
		result.meta.expire = data.meta.expire;
		$.merge(result.objects,data.objects);
		if(data.meta.offset + data.objects.length >= data.meta.total_count){
			d.resolve(result);
		}else{
			var d_all = [];
			for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				d_all.push(getData(request_data));
			}
			// wait all response
			$.when.apply($, d_all).done(function(){
				for (var i=0; i < arguments.length; i++) {
					$.merge(result.objects,arguments[i].objects);
				}
				d.resolve(result);
			}).fail(function(){
				d.reject();
			});
		}
	});
	return d;
};

CloudAPI.storageTimeline = function(startDT, endDt){
	var d = $.Deferred();
	var result = {
		meta: {
			limit: 1000,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	// TODO if not selected camera
	var request_data = {
		slices: 1,
		camid: CloudAPI.cameraID(),
		limit: result.meta.limit,
		offset: result.meta.offset,
		start: startDT
	};
	if(endDt)
		request_data.end = endDt;
		
	function getData(req_data){
		var req_d = $.Deferred();
		$.ajax({
			url: CloudAPI.config.url_storage + "timeline/" + CloudAPI.cameraID() + "/",
			data: req_data,
			cache : false,
			async: true,
			type: 'GET'
		}).done(function(data){
			req_d.resolve(data);
		}).fail(function(){
			req_d.reject();
		});
		return req_d;
	};

	getData(request_data).fail(function(){
		d.reject();
	}).done(function(data){
		result.meta.total_count = data.meta.total_count;
		result.meta.expire = data.meta.expire;
		$.merge(result.objects,data.objects);
		if(data.meta.offset + data.objects.length >= data.meta.total_count){
			d.resolve(result);
		}else{
			var d_all = [];
			for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				d_all.push(getData(request_data));
			}
			// wait all response
			$.when.apply($, d_all).done(function(){
				for (var i=0; i < arguments.length; i++) {
					$.merge(result.objects,arguments[i].objects);
				}
				d.resolve(result);
			}).fail(function(){
				d.reject();
			});
		}
	});
	return d;
};

CloudAPI.storageEvents = function(startDT, endDt){
	var d = $.Deferred();
	var result = {
		meta: {
			limit: 1000,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	// TODO if not selected camera
	var request_data = {
		camid: CloudAPI.cameraID(),
		limit: result.meta.limit,
		offset: result.meta.offset,
		start: startDT
	};
	if(endDt)
		request_data.end = endDt;
	function getData(req_data){
		var req_d = $.Deferred();
		$.ajax({
			url: CloudAPI.config.url_storage + "events/",
			data: req_data,
			cache : false,
			async: true,
			type: 'GET'
		}).done(function(data){
			req_d.resolve(data);
		}).fail(function(){
			req_d.reject();
		});
		return req_d;
	};

	getData(request_data).fail(function(){
		d.reject();
	}).done(function(data){
		result.meta.total_count = data.meta.total_count;
		result.meta.expire = data.meta.expire;
		$.merge(result.objects,data.objects);
		if(data.meta.offset + data.objects.length >= data.meta.total_count){
			d.resolve(result);
		}else{
			var d_all = [];
			for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				d_all.push(getData(request_data));
			}
			// wait all response
			$.when.apply($, d_all).done(function(){
				for (var i=0; i < arguments.length; i++) {
					$.merge(result.objects,arguments[i].objects);
				}
				d.resolve(result);
			}).fail(function(){
				d.reject();
			});
		}
	});
	return d;
};

CloudAPI.cameraMotionDetectionDemo=function(){
	var data=JSON.parse('{"caps": {"columns": 23, "max_regions": 8, "region_shape": "rect", "rows": 15, "sensitivity": "region"}}');
	return data;
};

CloudAPI.cameraMotionDetection = function(){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/motion_detection/",
		type: 'GET'
	});
};
CloudAPI.cameraMotionDetectionRegionsDemo=function(){
	var data_regions=JSON.parse('{"meta": {"limit": 20, "next": null, "offset": 0, "previous": null, "total_count": 8}, "objects": [{"enabled": true, "id": 2686, "map": "ZmQwMDBjM2ZjMDAwN2Y4MDAwZmYwMDAxZmUwMDAzZmNlNjAw", "name": "motion1", "sensitivity": 5}, {"enabled": true, "id": 2687, "map": "ZjYwMDBmMGZmODAwMWZmMDAwM2ZlMDAwN2ZjMDAwZmY4MDAxZmZmMDAw", "name": "motion2", "sensitivity": 5}, {"enabled": true, "id": 2688, "map": "ZjQwMDBmM2ZlMDAwN2ZjMDAwZmY4MDAxZmYwMDAzZmUwMDA3ZmNmMjAw", "name": "motion3", "sensitivity": 5}, {"enabled": true, "id": 2689, "map": "ZWMwMDBjMWZlMDAwM2ZjMDAwN2Y4MDAwZmYwMDAxZmVmNzAw", "name": "motion4", "sensitivity": 5}, {"enabled": true, "id": 2690, "map": "ZTQwMDA2ZTAwMDAxYzAwMDAzODBmOTAw", "name": "motion5", "sensitivity": 5}, {"enabled": true, "id": 2691, "map": "MmIwMWZmMDAwM2ZlMDAwN2ZjMDAwZmY4MDAxZmYwMDAzZmUwMDA3ZmMwMDBmZjgwMDFmZjAwMDNmZTAwMDdmYzAwMGZmODAwMWZmMDAwM2ZlMDAwN2ZjMDAw", "name": "motion6", "sensitivity": 5}, {"enabled": true, "id": 2692, "map": "MTJmZjgwMDFmZjAwMDNmZTAwMDdmYzAwMGZmODAwMWZmMDAwM2ZlMGU4MDA=", "name": "motion7", "sensitivity": 5}, {"enabled": false, "id": 2693, "map": "", "name": "motion8", "sensitivity": 5}]}');
	return data_regions;
};
CloudAPI.cameraMotionDetectionRegions = function(){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/motion_detection/regions/",
		type: 'GET'
	});
};

CloudAPI.cameraP2PSettings = function(cameraID, cb_success, cb_error, cb_always){
	cameraID = cameraID || CloudAPI.cameraID();
	cb_success = (cb_success == undefined) ? CloudAPI.handleNothing : cb_success;
	cb_error = (cb_error == undefined) ? CloudAPI.handleError : cb_error;
	cb_always = (cb_always == undefined) ? CloudAPI.handleNothing : cb_always;
	return $.ajax({
		url: CloudAPI.config.url_cameras + cameraID + "/p2p_settings/",
		type: 'GET',
		success: function(response){
			CloudAPI.cache.setP2PSettings(cameraID, response);
			cb_success(response);
		},
		error: cb_error,
		complete: cb_always
	});
};
CloudAPI.cameraSetP2PSettings = function(data){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/p2p_settings/",
		type: 'PUT',
		data: JSON.stringify(data),
		cache : false,
		contentType: 'application/json'
	});
};
CloudAPI.cameraLog = function(){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/log/",
		type: 'GET'
	});
};
CloudAPI.cameraLogDownload = function(url){
	var d = $.Deferred();
	var xmlhttp = null;
	if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp=new XMLHttpRequest();
	}else{// code for IE6, IE5
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState == XMLHttpRequest.DONE){
			if(xmlhttp.status==200)
				d.resolve(xmlhttp.responseText);
			else
				d.reject();
		}
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	return d.promise();
};
CloudAPI.cameraLogUpdate = function(){
	return $.ajax({
		url: CloudAPI.config.url_cameras + CloudAPI.cameraID() + "/log/update/",
		type: 'POST'
	});
};
CloudAPI.cameraManagersList = function(cb_success, cb_error){
	cb_success = cb_success || CloudAPI.handleNothing
	cb_error = cb_error || CloudAPI.handleError;
	$.ajax({
		url: CloudAPI.config.url_cmngrs,
		type: 'GET',
		success: cb_success,
		error: cb_error
	});
}

CloudAPI.cameraManagerReset = function(cmnr_id){
	var params = {};
	return $.ajax({
		url: CloudAPI.config.url_cmngrs + cmnr_id + '/reset/',
		type: 'POST'
	});
}

CloudAPI.camerasList = function(params){
	params = params || {};
	var d = $.Deferred();
	var result = {
		meta: {
			limit: 20,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	var request_data = {
		limit: result.meta.limit,
		offset: result.meta.offset
	};
	for(var t in params){
		request_data[t] = params[t];
	}
	function getData(req_data){
		var req_d = $.Deferred();
		$.ajax({
			url: CloudAPI.config.url_cameras,
			data: req_data,
			cache : false,
			type: 'GET'
		}).done(function(data){
			req_d.resolve(data);
		}).fail(function(){
			req_d.reject();
		});
		return req_d;
	};

	function p2pUpdateAndResolve(result){
		var count = 0;
		var len = result.objects.length;
		if(count == len) d.resolve(result);
		for(var i = 0; i < len; i++){
			cam = result.objects[i];
			// SET to cache
			if(CloudAPI.cache.setCameraInfo(cam)){
				console.log("update p2p_settings: ", cam.id);
				CloudAPI.cameraP2PSettings(cam.id).done(function(p2p_settings){
					// update memory cardinfo
					CloudAPI.cameraMemoryCard(cam.id).done(function(){
						count = count + 1;
						if(count == len) d.resolve(result);
					}).fail(function(){
						count = count + 1;
						if(count == len) d.resolve(result);
					});
					// count = count + 1;
					// if(count == len) d.resolve(result);
				}).fail(function(){
					count = count + 1;
					if(count == len) d.resolve(result);
				});
			}else{
				// console.log("p2p_settings updated: ", i, len);
				count = count + 1;
				if(count == len) d.resolve(result);
			}
		}
	}
	getData(request_data).fail(function(){
		d.reject();
	}).done(function(data){
		result.meta.total_count = data.meta.total_count;
		$.merge(result.objects, data.objects);
		if(data.meta.offset + data.objects.length >= data.meta.total_count){
			p2pUpdateAndResolve(result)
		}else{
			var d_all = [];
			for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				d_all.push(getData(request_data));
			}
			// wait all response
			$.when.apply($, d_all).done(function(){
				for (var i=0; i < arguments.length; i++) {
					$.merge(result.objects,arguments[i].objects);
				}
				p2pUpdateAndResolve(result)
			}).fail(function(){
				d.reject();
			});
		}
	});
	return d;
}
CloudAPI.camerasListByCriterions = function(criterions, cb_success, cb_error){
	cb_success = cb_success || CloudAPI.handleNothing
	cb_error = cb_error || CloudAPI.handleError;
	
	$.ajax({
		url: CloudAPI.config.url_cameras,
		data: criterions,
		type: 'GET',
		success: cb_success,
		error: cb_error
	});
}

CloudAPI.cameraManagerInfo = function(cameraManagerID, cb_success, cb_error){
	cb_success = cb_success || CloudAPI.handleNothing
	cb_error = cb_error || CloudAPI.handleError;
	$.ajax({
		url: CloudAPI.config.url_cmngrs + cameraManagerID + "/",
		type: 'GET',
		success: cb_success,
		error: cb_error
	});
}
CloudAPI.cameraManagerSetTimezone = function(cameraManagerID, newTimeZone, cb_success, cb_error){
	cb_success = cb_success || CloudAPI.handleNothing
	cb_error = cb_error || CloudAPI.handleError;
	var obj = {};
	obj.timezone = newTimeZone;
	$.ajax({
		url: CloudAPI.config.url_cmngrs + cameraManagerID + "/",
		type: 'PUT',
		success: cb_success,
		error: cb_error,
		data:  JSON.stringify(obj),
		contentType: 'application/json'
	});
}

CloudAPI.storageClipList = function(){
	var d = $.Deferred();
	var result = {
		meta: {
			limit: 100,
			offset: 0,
			total_count: -1
		},
		objects: []
	};
	var request_data = {
		limit: result.meta.limit,
		offset: result.meta.offset,
		camid: CloudAPI.cameraID(),
		usecamtz: ''
	};
	
	function getData(req_data){
		var req_d = $.Deferred();
		$.ajax({
			url: CloudAPI.config.url_clips,
			data: req_data,
			cache : false,
			type: 'GET'
		}).done(function(data){
			req_d.resolve(data);
		}).fail(function(){
			req_d.reject();
		});
		return req_d;
	};

	getData(request_data).fail(function(){
		d.reject();
	}).done(function(data){
		result.meta.total_count = data.meta.total_count;
		result.meta.expire = data.meta.expire;
		$.merge(result.objects,data.objects);
		if(data.meta.offset + data.objects.length >= data.meta.total_count){
			d.resolve(result);
		}else{
			var d_all = [];
			for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
				request_data.offset = i;
				d_all.push(getData(request_data));
			}
			// wait all response
			$.when.apply($, d_all).done(function(){
				for (var i=0; i < arguments.length; i++) {
					$.merge(result.objects,arguments[i].objects);
				}
				d.resolve(result);
			}).fail(function(){
				d.reject();
			});
		}
	});
	return d;
};

// deprecated
CloudAPI.storageClipListAnon = function(token){
	var d = $.Deferred();
	CloudAPI.anonToken().done(function(tk){
		var result = {
			meta: {
				limit: 100,
				offset: 0,
				total_count: -1
			},
			objects: []
		};
		var request_data = {
			limit: result.meta.limit,
			offset: result.meta.offset,
			usecamtz: ''
		};
		if(token) request_data.token = token;
		function getData(req_data){
			var req_d = $.Deferred();
			$.ajax({
				url: CloudAPI.config.url_clips,
				data: req_data,
				cache : false,
				type: 'GET',
				headers: {
					'Authorization':'SkyVR ' + tk.token
				}
			}).done(function(data){
				req_d.resolve(data);
			}).fail(function(){
				req_d.reject();
			});
			return req_d;
		};
		
		getData(request_data).fail(function(){
			d.reject();
		}).done(function(data){
			result.meta.total_count = data.meta.total_count;
			result.meta.expire = data.meta.expire;
			$.merge(result.objects,data.objects);
			if(data.meta.offset + data.objects.length >= data.meta.total_count){
				d.resolve(result);
			}else{
				var d_all = [];
				for(var i = result.meta.limit; i < data.meta.total_count; i = i + result.meta.limit){
					request_data.offset = i;
					d_all.push(getData(request_data));
				}
				// wait all response
				$.when.apply($, d_all).done(function(){
					for (var i=0; i < arguments.length; i++) {
						$.merge(result.objects,arguments[i].objects);
					}
					d.resolve(result);
				}).fail(function(){
					d.reject();
				});
			}
		});
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.storageClipCreate = function(title, group, start, end, delete_at){
	var data = {};
	data.camid = CloudAPI.cameraID();
	data.title = title;
	data.group = group;
	data.start = start;
	data.end = end;
	data.delete_at = delete_at;
	return $.ajax({
		url: CloudAPI.config.url_clips,
		type: 'POST',
		data: JSON.stringify(data),
		cache : false,
		contentType: 'application/json'
	});
}
CloudAPI.storageClip = function(clipid){
	return $.ajax({
		url: CloudAPI.config.url_clips + clipid + "/",
		type: 'GET',
		cache : false
	});
};

CloudAPI.serverTime = function(){
	return $.ajax({
		url: CloudAPI.config.url_server + "time/",
		type: 'GET',
		cache : false
	});
};

CloudAPI.storageClipAnon = function(clipid, token){
	var d = $.Deferred();
	var params = {};
	if(token) params.token = token;
	CloudAPI.anonToken().done(function(tk){
		$.ajax({
			url: CloudAPI.config.url_clips + clipid + "/",
			type: 'GET',
			data: params,
			cache : false,
			headers: {
				'Authorization':'SkyVR ' + tk.token
			}
		}).done(function(data){
			d.resolve(data);
		}).fail(function(){
			d.reject();
		});
	}).fail(function(){
		d.reject();
	});
	return d;
};

CloudAPI.storageClipDelete = function(clipid){
	return $.ajax({
		url: CloudAPI.config.url_clips + clipid + "/",
		type: 'DELETE',
		cache : false
	});
};

CloudAPI.storageClipUpdate = function(clipid, data){
	return $.ajax({
		url: CloudAPI.config.url_clips + clipid + "/",
		data: JSON.stringify(data),
		type: 'PUT',
		cache : false,
		contentType: 'application/json'
	});
};

CloudAPI.cameraSettings = function(){
	var d = $.Deferred();
	var d_all = [];
	function anyway(d){
		var d2 = $.Deferred();
		d.always(function(){ d2.resolve();});
		return d2;
	}
	
	function mediaStreams(){
		var d2 = $.Deferred();
		CloudAPI.cameraMediaStreams().done(function(media_streams){
			console.log("MediaStreams: ", media_streams);
			var ms_arr = media_streams['mstreams_supported'];
			var current_ms = media_streams['live_ms_id'];
			if(ms_arr.length > 0 && current_ms != ''){
				var vs_id = '';
				for(var i = 0; i < ms_arr.length; i++){
					if(ms_arr[i]['id'] == current_ms){
						vs_id = ms_arr[i]['vs_id'];
						break;
					}
				}
				if(vs_id != ''){
					CloudAPI.cameraVideoStream(vs_id).done(function(){
						d2.resolve();
					}).fail(function(){
						d2.reject();
					});
				}else{
					d2.reject();
				}
			}else{
				d2.resolve();
			}
		}).fail(function(){
			d2.reject();
		});
		return d2;
	}

	d_all.push(anyway(mediaStreams()));

	if(!CloudAPI.cache.cameraInfo().url){
		d_all.push(anyway(CloudAPI.cameraVideo()));
		d_all.push(anyway(CloudAPI.cameraAudio()));
		d_all.push(anyway(CloudAPI.cameraLimits()));
		d_all.push(anyway(CloudAPI.cameraEventProcessingEventsMotion()));
		d_all.push(anyway(CloudAPI.cameraEventProcessingEventsSound()));
		d_all.push(anyway(CloudAPI.cameraMemoryCard()));
		// d_all.push(anyway(CloudAPI.cameraWifi()));
	}

	$.when.apply($, d_all).done(function(){
		d.resolve(CloudAPI.cache.cameraInfo());
	}).fail(function(){
		d.reject();
	});
	return d;
}

CloudAPI.createCamsess = function(data){
	data = data || {};
	return $.ajax({
		url: CloudAPI.config.url_camsess,
		data: JSON.stringify(data),
		type: 'POST',
		contentType: 'application/json',
		cache : false,
	});
}

CloudAPI.updateCamsess = function(id, data){
	data = data || {};
	return $.ajax({
		url: CloudAPI.config.url_camsess + id + '/',
		data: JSON.stringify(data),
		type: 'PUT',
		contentType: 'application/json',
		cache : false,
	});
}

CloudAPI.cameraCreate = function(data){
	var d = $.Deferred();
	data = data || {};
	$.ajax({
		url: CloudAPI.config.url_cameras,
		type: 'POST',
		data: JSON.stringify(data),
		cache : false,
		contentType: 'application/json'
	}).done(function(r){
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
}

CloudAPI.cameraDelete = function(camid){
	var d = $.Deferred();
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + '/',
		type: 'DELETE',
		cache : false
	}).done(function(r){
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
}

CloudAPI.cameraUpdate = function(camid, data){
	var d = $.Deferred();
	data = data || {};
	$.ajax({
		url: CloudAPI.config.url_cameras + camid + '/',
		type: 'PUT',
		data: JSON.stringify(data),
		cache : false,
		contentType: 'application/json'
	}).done(function(r){
		d.resolve(r);
	}).fail(function(r){
		d.reject(r);
	});
	return d;
}

CloudAPI.adminCameras = function(params){
	params = params || {};
	return $.ajax({
		url: CloudAPI.config.url_admin_cameras,
		data: params,
		type: 'GET',
		cache : false,
	});
}

CloudAPI.adminCameraInfo = function(camid){
	return $.ajax({
		url: CloudAPI.config.url_admin_cameras + camid + '/',
		type: 'GET',
		cache : false
	});
}

CloudAPI.updateAdminCamera = function(camid, params){
	params = params || {};
	return $.ajax({
		url: CloudAPI.config.url_admin_cameras + camid + '/',
		type: 'PUT',
		data: JSON.stringify(params),
		contentType: 'application/json',
		cache : false
	});
}

CloudAPI.store = {};
CloudAPI.store.volume = function(v){ if(v) CloudAPI.setToStorage('volume', v); return CloudAPI.getFromStorage('volume'); }
CloudAPI.store.prev_volume = function(v){ if(v) CloudAPI.setToStorage('prev_volume', v); return CloudAPI.getFromStorage('prev_volume'); }
CloudAPI.store.zoom = function(v){ if(v != undefined) CloudAPI.setToStorage('zoom', v); return CloudAPI.getFromStorage('zoom'); }
CloudAPI.store.zoom_left = function(v){ if(v != undefined) CloudAPI.setToStorage('zoom_left', v); return CloudAPI.getFromStorage('zoom_left'); }
CloudAPI.store.zoom_top = function(v){ if(v != undefined) CloudAPI.setToStorage('zoom_top', v); return CloudAPI.getFromStorage('zoom_top'); }
CloudAPI.store.user_profile = function(v){ if(v != undefined) CloudAPI.setToStorage('user_profile', v); return CloudAPI.getFromStorage('user_profile'); }
CloudAPI.store.svcp_host = function(v){ if(v != undefined) CloudAPI.setToStorage('svcp_host', v); return CloudAPI.getFromStorage('svcp_host'); }

CloudAPI.storageTemp = {};
CloudAPI.storageMode = 'local';

CloudAPI.detectStorageMode = function(){
	try{
		localStorage.setItem('detectStorageMode','yes');
	}catch(e){
		CloudAPI.storageMode = 'temp';
	}
}
CloudAPI.detectStorageMode();

CloudAPI.setToStorage = function(k,v){
	if(CloudAPI.storageMode == 'local'){
		localStorage.setItem(k,v);
	}else{
		CloudAPI.storageTemp[k] = v;
	}
}

CloudAPI.getFromStorage = function(k){
	if(CloudAPI.storageMode == 'local'){
		return localStorage.getItem(k);
	}else{
		return CloudAPI.storageTemp[k];
	}
}

CloudAPI.removeFromStorage = function(k){
	if(CloudAPI.storageMode == 'local'){
		localStorage.removeItem(k);
	}else{
		CloudAPI.storageTemp[k] = undefined;
	}
}

CloudAPI.loadApiTokenFromHref = function(){
	var prms = window.location.href.split("#");
	var token = prms[prms.length - 1];
	token = token.split("&");
	
	for(var i in token){
		var name = token[i].split("=")[0];
		var param = decodeURIComponent(token[i].split("=")[1]);
		if(name == "token"){
			CloudAPI.config.apiToken = CloudAPI.config.apiToken || {};
			CloudAPI.config.apiToken.token = param;
			CloudAPI.config.apiToken.type = "api";
		}else if(name == "expire"){
			CloudAPI.config.apiToken = CloudAPI.config.apiToken || {};
			CloudAPI.config.apiToken.expire = param;
			CloudAPI.config.apiToken.expireTimeUTC = Date.parse(param + "Z");
		}
	}
	console.log("Href token: ", CloudAPI.config.apiToken);
	CloudAPI.setToStorage('SkyVR_apiToken', JSON.stringify(CloudAPI.config.apiToken));
}

CloudAPI.cleanupApiToken = function(){
	CloudAPI.removeFromStorage('SkyVR_apiToken');
	CloudAPI.config.apiToken = null;
	$.ajaxSetup({
		crossDomain: true,
		cache: false,
		beforeSend: function(xhr,settings) {
			xhr.setRequestHeader('Authorization', '');
		}
	});
}

// set url

if(CloudHelpers.containsPageParam("svcp_host")){
	CloudAPI.setURL(CloudAPI.pageParams["svcp_host"]);
}else if(CloudAPI.getFromStorage('CloudAPI_svcp_host')){
	CloudAPI.setURL(CloudAPI.getFromStorage('CloudAPI_svcp_host'));
}else{
	CloudAPI.setURL((window.location.protocol=='file:'?'http':window.location.protocol) + "//" + window.location.host.toString() + "/");
}

/* events */
CloudAPI.events = {};
CloudAPI.events.listeners = {};
CloudAPI.events.names = ['CAMERA_INFO_CHANGED']; // todo define events name
CloudAPI.events.on = function(eventname, eventid, func){
	if(CloudAPI.events.names.indexOf(eventname) == -1){
		console.error("[CLOUDAPI] Could not find event with name " + eventname);
		return;
	}
	if(!CloudAPI.events.listeners[eventname]){
		CloudAPI.events.listeners[eventname] = {};
	}
	CloudAPI.events.listeners[eventname][eventid] = func;
}

CloudAPI.events.off = function(eventname, eventid){
	if(CloudAPI.events.names.indexOf(eventname) == -1){
		console.error("[CLOUDAPI] Could not find event with name " + eventname);
		return;
	}
	if(!CloudAPI.events.listeners[eventname]){
		console.error("[CLOUDAPI] Could not find event with name " + eventname);
		return;
	}
	if(!CloudAPI.events.listeners[eventname][eventid]){
		console.error("[CLOUDAPI] Could not find event with name " + eventname + " by id " + eventid);
		return;
	}
	delete CloudAPI.events.listeners[eventname][eventid];
}

CloudAPI.events.trigger = function(eventname, data){ // app, event - temporary variables
	if(CloudAPI.events.names.indexOf(eventname) == -1){
		console.error("[CLOUDAPI] Could not find event with name " + eventname);
		return;
	}
	if(CloudAPI.events.listeners[eventname]){
		var elist = CloudAPI.events.listeners[eventname];
		setTimeout(function(){
			for(var id in elist){
				try{elist[id](data);}catch(e){console.error("[CLOUDAPI] error on execute callback event (" + id + ")", e)};
			}
		},1);
	}
}

window.CloudReturnCode = {};

CloudReturnCode.OK = {
	name: 'OK',
	code: -5049,
	text: 'Success'
};

CloudReturnCode.OK_COMPLETIONPENDING = {
	name: 'OK_COMPLETIONPENDING',
	code: 1,
	text: 'Operation Pending'
};

CloudReturnCode.ERROR_NOT_CONFIGURED = {
	name: 'ERROR_NOT_CONFIGURED',
	code: -2,
	text: 'Object not configured'
};

CloudReturnCode.ERROR_NOT_IMPLEMENTED = {
	name: 'ERROR_NOT_IMPLEMENTED',
	code: -1,
	text: 'Function not implemented'
};

CloudReturnCode.ERROR_NO_MEMORY = {
	name: 'ERROR_NO_MEMORY',
	code: -12,
	text: 'Out of memory'
};
   
CloudReturnCode.ERROR_ACCESS_DENIED = {
	name: 'ERROR_ACCESS_DENIED',
	code: -13,
	text: 'Access denied'
};

CloudReturnCode.ERROR_BADARGUMENT = {
	name: 'ERROR_BADARGUMENT',
	code: -22,
	text: 'Invalid argument'
};

CloudReturnCode.ERROR_STREAM_UNREACHABLE = {
	name: 'ERROR_STREAM_UNREACHABLE',
	code: -5049,
	text: 'The stream specified is not reachable. Please check source URL or restart the stream'
};

CloudReturnCode.ERROR_EXPECTED_FILTER = {
	name: 'ERROR_EXPECTED_FILTER',
	code: -5050,
	text: 'Expected filter'
};

CloudReturnCode.ERROR_NO_CLOUD_CONNECTION = {
	name: 'ERROR_NO_CLOUD_CONNECTION',
	code: -5051,
	text: 'No cloud connection (has not conenction object or token is invalid)'
};

CloudReturnCode.ERROR_WRONG_RESPONSE = {
	name: 'ERROR_WRONG_RESPONSE',
	code: -5052,
	text: 'Response from cloud expected in json, but got something else'
}

CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED = {
	name: 'ERROR_SOURCE_NOT_CONFIGURED',
	code: -5053,
	text: 'Source not configured'
}

CloudReturnCode.ERROR_INVALID_SOURCE = {
	name: 'ERROR_INVALID_SOURCE',
	code: -5054,
	text: 'Invalid source'
}

CloudReturnCode.ERROR_RECORDS_NOT_FOUND = {
	name: 'ERROR_RECORDS_NOT_FOUND',
	code: -5055,
	text: 'Records are not found'
}

CloudReturnCode.ERROR_STREAM_UNREACHABLE_HLS = {
	name: 'ERROR_STREAM_UNREACHABLE_HLS',
	code: -5056,
	text: 'The stream specified is not reachable (HLS).'
};

CloudReturnCode.ERROR_NOT_FOUND_HLS_PLUGIN = {
	name: 'ERROR_NOT_FOUND_HLS_PLUGIN',
	code: -5057,
	text: 'HLS plugin not found.'
};

CloudReturnCode.ERROR_COULD_NOT_DECODE_STREAM_OR_COULD_NOT_SET_COOKIE_HLS = {
	name: 'ERROR_COULD_NOT_DECODE_STREAM_OR_COULD_NOT_SET_COOKIE_HLS',
	code: -5058,
	text: 'Could not decode stream or could not set cookie for streaming server (please allow cookie).'
};

CloudReturnCode.ERROR_WEBRTC_SERVER_ERROR = {
	name: 'ERROR_WEBRTC_SERVER_ERROR',
	code: -5059,
	text: 'Unable to connect to server. Please check that you added an exception for the certificate, and that the port is available.'
};

CloudReturnCode.ERROR_CAMERA_OFFLINE = {
	name: 'ERROR_CAMERA_OFFLINE',
	code: -5060,
	text: 'Video source is offline'
};

CloudReturnCode.PLAYER_NOT_SUPPORTED = {
	name: 'PLAYER_NOT_SUPPORTED',
	code: -5061,
	text: 'Player not supported'
};

CloudReturnCode.NOT_SUPPORTED_FORMAT = {
	name: 'NOT_SUPPORTED_FORMAT',
	code: -5062,
	text: 'Not supported format'
}

CloudReturnCode.ERROR_HLS_ENDED = {
	name: 'ERROR_HLS_ENDED',
	code: -5063,
	text: 'The stream is ended (HLS).'
};

CloudReturnCode.ERROR_INVALID_ACCESS_TOKEN_FORMAT = {
	name: 'ERROR_INVALID_ACCESS_TOKEN_FORMAT',
	code: -5064,
	text: 'Invalid access token format'
}

CloudReturnCode.ERROR_CHANNEL_NOT_FOUND = {
	name: 'ERROR_CHANNEL_NOT_FOUND',
	code: -5065,
	text: 'Channel is not found'
}

CloudReturnCode.ERROR_NETWORK_ERROR = {
	name: 'ERROR_NETWORK_ERROR',
	code: -5066,
	text: 'Network error'
}

CloudReturnCode.ERROR_ACCESS_TOKEN_REQUIRED = {
	name: 'ERROR_ACCESS_TOKEN_REQUIRED',
	code: -5067,
	text: 'Access token is required'
}

CloudReturnCode.ERROR_NOT_AUTHORIZED = {
	name: 'ERROR_NOT_AUTHORIZED',
	code: -5401,
	text: 'Failed authorization on cloud (wrong credentials)'
}

CloudReturnCode.ERROR_NOT_FOUND = {
	name: 'ERROR_NOT_FOUND',
	code: -5404,
	text: 'Not found object'
}



window.CloudCameraPrivacyFilter = {};

CloudCameraPrivacyFilter.PS_OWNER_NOT_PUBLIC = {
	name: 'PS_OWNER_NOT_PUBLIC',
	code: 0,
	text: 'My cameras which not public'
};

CloudCameraPrivacyFilter.PS_OWNER = {
	name: 'PS_OWNER',
	code: 1,
	text: 'Only my cameras'
};

CloudCameraPrivacyFilter.PS_PUBLIC_NOT_OWNERS = {
	name: 'PS_PUBLIC_NOT_OWNERS',
	code: 2,
	text: 'Public cameras exclude my'
};

CloudCameraPrivacyFilter.PS_PUBLIC = {
	name: 'PS_PUBLIC',
	code: 3,
	text: 'All public cameras'
};

CloudCameraPrivacyFilter.PS_OWNERS_PUBLIC = {
	name: 'PS_OWNERS_PUBLIC',
	code: 4,
	text: 'My public cameras'
};

CloudCameraPrivacyFilter.PS_ALL = {
	name: 'PS_ALL',
	code: 5,
	text: 'All cameras'
};

window.CloudCameraRecordingMode = {};

CloudCameraRecordingMode.CONTINUES = {
	name: 'CONTINUES',
	code: 0
};

CloudCameraRecordingMode.BY_EVENT = {
	name: 'BY_EVENT',
	code: 1
};

CloudCameraRecordingMode.NO_RECORDING = {
	name: 'NO_RECORDING',
	code: 2
};

window.CloudCameraStatus = {};

CloudCameraStatus.ACTIVE = {
	name: 'ACTIVE',
	code: 0
};

CloudCameraStatus.UNAUTHORIZED = {
	name: 'UNAUTHORIZED',
	code: 1
};

CloudCameraStatus.INACTIVE = {
	name: 'INACTIVE',
	code: 2
};

CloudCameraStatus.INACTIVE_BY_SCHEDULER = {
	name: 'INACTIVE_BY_SCHEDULER',
	code: 3
};

CloudCameraStatus.OFFLINE = {
	name: 'OFFLINE',
	code: 4
};

// construct
window.CloudTrialConnection = function(){
	var self = this;
	self.mAPI = null;
	self.AccountProviderUrl = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//cnvrclient2.videoexpertsgroup.com/";
	
	self.setAccpUrl = function(new_accp_url){
		self.AccountProviderUrl = new_accp_url; 
	};
	
	self.setSvcpUrlBase = function(new_svcp_url){
		self.ServiceProviderUrl = new_svcp_url; 
	};

	self.setApiConfig = function(api_host, api_port, api_secure_port){
		self.ApiHost = api_host; 
		self.ApiPort = api_port;
		self.ApiSecurePort = api_secure_port;
	};

	self.setCamConfig = function(cam_host, cam_port, cam_secure_port){
		self.CamHost = cam_host; 
		self.CamPort = cam_port;
		self.CamSecurePort = cam_secure_port;
	};
	
	// Open without redirects
	self.open = function(license_key){
		var p = CloudHelpers.promise();
		self.TrialKey = license_key;
		self.RequestData = {
			username: self.TrialKey,
			password: self.TrialKey,
			cloud_token:  true
		};
		self._asyncLogin(p);
		return p;
	}

	self.isOpened = function(){
		return self.mAPI != null;
	}
	self.close = function(){
		self.mAPI = null;
	}
	
	self._getAPI = function(){
		return self.mAPI;
	}
	
	self.getUserInfo = function(){
		var p = CloudHelpers.promise();
		if(!self.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		self.mAPI.getAccountInfo().done(function(accInfo){
			self.mAPI.getAccountCapabilities().done(function(caps){
				var info = new CloudUserInfo(self, accInfo, caps);
				p.resolve(info);
			}).fail(function(err){
				CloudHelpers.handleError(err, p);
			});
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getServerTimeDiff = function(){
		return self.mAPI.diffServerTime;
	}

	self._asyncLogin = function(p){
		CloudHelpers.request({
			url: self.AccountProviderUrl + "api/v1/account/login/",
			type: 'POST',
			data: JSON.stringify(self.RequestData),
			contentType: 'application/json'
		}).done(function(r){
			if(r.cloud_token && r.cloud_token.token){
				var scvp_host = CloudHelpers.parseUri(r.svcp_auth_app_url).host;
				scvp_host = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//" + scvp_host + "/";
				self.mAPI = new CloudAPI(r.cloud_token, self.ServiceProviderUrl || scvp_host);
				self.mAPI.getServerTime().done(function(){
					p.resolve();
				}).fail(function(err){
					p.reject(err);
				})
			}else{
				console.warn("Try again after 1 sec");
				setTimeout(function(){
					self._asyncLogin(p);
				},1000);
			}
		}).fail(function(err){
			console.error(err);
			p.reject(err);
		});
	}
}

// construct
window.CloudTokenConnection = function(options){
	var self = this;
	self.mAPI = null;
	self.options = options;
	// self.AccountProviderUrl = window.location.protocol + "//cnvrclient2.videoexpertsgroup.com/";
	self.ServiceProviderUrl = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//" + (self.options.cloud_domain ? self.options.cloud_domain : "web.skyvr.videoexpertsgroup.com")+"/";

	// Open without redirects
	self.open = function(token, expire, svcp_host){
		var cloud_token = {
			token: token,
			expire: expire,
			type: 'api'
		};
		if(svcp_host){
			self.ServiceProviderUrl = svcp_host;
		}
		var p = CloudHelpers.promise();
		self.mAPI = new CloudAPI(cloud_token, self.ServiceProviderUrl);
		self.mAPI.getServerTime().done(function(){
			p.resolve();
		}).fail(function(err){
			p.reject(err);
		});
		return p;
	}

	self.isOpened = function(){
		return self.mAPI != null;
	}
	self.close = function(){
		self.mAPI = null;
	}
	
	self._getAPI = function(){
		return self.mAPI;
	}
	
	self.getUserInfo = function(){
		var p = CloudHelpers.promise();
		if(!self.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		self.mAPI.getAccountInfo().done(function(accInfo){
			self.mAPI.getAccountCapabilities().done(function(caps){
				console.warn("caps:", caps)
				var info = new CloudUserInfo(self, accInfo, caps);
				p.resolve(info);
			}).fail(function(err){
				CloudHelpers.handleError(err, p);
			});
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getServerTimeDiff = function(){
		return self.mAPI.diffServerTime;
	}
}

// construct
window.CloudShareConnection = function(options){
	var self = this;
	self.options = options;
	self.mAPI = null;
	self.ServiceProviderUrl = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//" + (self.options.cloud_domain ? self.options.cloud_domain : "web.skyvr.videoexpertsgroup.com") + "/";

	// Open without redirects
	self.open = function(token){
		var cloud_token = {
			token: token,
			expire: "",
			type: "share"
		};
		var p = CloudHelpers.promise();
		self.mAPI = new CloudAPI(cloud_token, self.ServiceProviderUrl);
		
		self.mAPI.getServerTime().done(function(){
			p.resolve();
		}).fail(function(err){
			p.reject(err);
		});
		return p;
	}

	self.isOpened = function(){
		return self.mAPI != null;
	}
	self.close = function(){
		self.mAPI = null;
	}
	
	self._getAPI = function(){
		return self.mAPI;
	}
	
	self.getUserInfo = function(){
		var p = CloudHelpers.promise();
		if(!self.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		self.mAPI.getAccountInfo().done(function(accInfo){
			self.mAPI.getAccountCapabilities().done(function(caps){
				console.warn("caps:", caps)
				var info = new CloudUserInfo(self, accInfo, caps);
				p.resolve(info);
			}).fail(function(err){
				CloudHelpers.handleError(err, p);
			});
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getServerTimeDiff = function(){
		return self.mAPI.diffServerTime;
	}
}

// construct
window.CloudUserConnection = function(){
	var self = this;
	self.mAPI = null;
	self.AccountProviderUrl = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//cnvrclient2.videoexpertsgroup.com/";
	var mUsername, mPassword;
	// Open without redirects
	self.open = function(username,password){
		mUsername = username;
		mPassword = password;
		var p = CloudHelpers.promise();
		self.RequestData = {
			username: mUsername,
			password: mPassword,
			cloud_token:  true
		};
		self._asyncLogin(p);
		return p;
	}

	self.isOpened = function(){
		return self.mAPI != null;
	}
	self.close = function(){
		self.mAPI = null;
	}
	
	self._getAPI = function(){
		return self.mAPI;
	}
	
	self.getUserInfo = function(){
		var p = CloudHelpers.promise();
		if(!self.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		self.mAPI.getAccountInfo().done(function(accInfo){
			// console.warn("info:", accInfo)
			self.mAPI.getAccountCapabilities().done(function(caps){
				console.warn("caps:", caps)
				var info = new CloudUserInfo(self, accInfo, caps);
				p.resolve(info);
			}).fail(function(err){
				if(err.status == 500){
					var info = new CloudUserInfo(self, accInfo);
					p.resolve(info);
				}else{
					CloudHelpers.handleError(err, p);
				}
			});
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getServerTimeDiff = function(){
		return self.mAPI.diffServerTime;
	}

	self._asyncLogin = function(p){
		CloudHelpers.request({
			url: self.AccountProviderUrl + "api/v1/account/login/",
			type: 'POST',
			data: JSON.stringify(self.RequestData),
			contentType: 'application/json'
		}).done(function(r){
			if(r.cloud_token && r.cloud_token.token){
				var scvp_host = CloudHelpers.parseUri(r.svcp_auth_app_url).host;
				scvp_host = (window.location.protocol=='file:'?'http:':window.location.protocol) + "//" + scvp_host + "/";
				self.mAPI = new CloudAPI(r.cloud_token, scvp_host);
				self.mAPI.getServerTime().done(function(){
					p.resolve();
				}).fail(function(err){
					p.reject(err);
				})
			}else{
				console.warn("Try again after 1 sec");
				setTimeout(function(){
					self._asyncLogin(p);
				},1000);
			}
		}).fail(function(err){
			console.error(err);
			p.reject(err);
		});
	}
}

// construct
window.CloudUserInfo = function(conn, jsonUser, jsonCapabilities){
	var self = this;
	var mConn = conn;
	var mOrigJsonAccount;
	var mOrigJsonCapabilities;

	var mID, mEmail, mFirstName, mLastName, mPreferredName;
	var mHostedCamerasLimit, mTotalCamerasLimit;
	var mHostedCamerasCreated, mTotalCamerasCreated;
	
	function _parseJson(data_user, data_caps){
		mOrigJsonAccount = data_user;
		mOrigJsonCapabilities = data_caps;
		mID = data_user['id'];
		mEmail = data_user['email'];
		mFirstName = data_user['first_name'];
		mLastName = data_user['last_name'];
		mPreferredName = data_user['preferred_name'];
		if(data_caps){
			mTotalCamerasLimit = data_caps['cameras_creation']['limits']['total_cameras'];
			mHostedCamerasLimit = data_caps['cameras_creation']['limits']['hosted_cameras'];
			mTotalCamerasCreated = data_caps['cameras_creation']['created']['total_cameras'];
			mHostedCamerasCreated = data_caps['cameras_creation']['created']['hosted_cameras'];
		}else{
			mTotalCamerasLimit = 0;
			mHostedCamerasLimit = 0;
			mTotalCamerasCreated = 0;
			mHostedCamerasCreated = 0;
		}
	}
	var mUpdateData = {};
	
	_parseJson(jsonUser, jsonCapabilities);

	self._getConn = function(){
		return mConn;
	}
	
	self._origJsonAccount = function(){
		return mOrigJsonAccount;
	}
	
	self._origJsonCapabilities = function(){
		return mOrigJsonCapabilities;
	}
	
	self.getID = function(){
		return mID;
	}
	
	self.getEmail = function(){
		return mEmail;
	}
	
	self.getFirstName = function(){
		return mFirstName;
	}
	
	self.getLastName = function(){
		return mLastName;
	}
	
	self.getPreferredName = function(){
		return mPreferredName;
	}
	
	self.getCameraLimit = function(){
		return mTotalCamerasLimit;
	}

	self.getCameraCreated = function(){
		return mTotalCamerasCreated;
	}
	
	self.refresh = function(){
		var p = CloudHelpers.promise();
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().getAccountInfo().done(function(accInfo){
			mConn._getAPI().getAccountCapabilities().done(function(caps){
				_parseJson(accInfo,caps);
				p.resolve();
			}).fail(function(err){
				if(err.status == 500){
					_parseJson(accInfo);
				}else{
					CloudHelpers.handleError(err, p);
				}
			});
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
}

// construct
window.CloudCamera = function(conn, jsonData){
	var self = this;
	self.type = 'camera';
	var mConn = conn;
	var mOrigJson;
	var mID = jsonData.id;
	var mCameraManagerID = jsonData.cmngrid;
	var mURL, mURLLogin, mURLPassword;
	var mStatus, mTZ, mLatitude, mLongitude;
	var mDeleteAt, mName, mRecMode, mRecStatus;
	var mBrand, mGroupName, mFirmwareVersion;
	var mLed, mModel, mUUID, mSerialNumber;
	var mPublic;
	
	function _parseJsonData(data){
		mOrigJson = data;
		mURLLogin = data.login;
		mURLPassword = data.password;
		mURL = data.url;
		mName = data.name;
		mTZ = data.timezone;
		mStatus = data.status;
		mLatitude = data.latitude;
		mLongitude = data.longitude;
		mRecMode = data.rec_mode;
		mRecStatus = data.rec_status == 'on';
		mDeleteAt = data.delete_at;
		mBrand = data.brand;
		mGroupName = data.group_name;
		mFirmwareVersion = data.fw_version;
		mModel = data.model;
		mSerialNumber = data.serial_number;
		mUUID = data.uuid;
		mLed = data.led;
		mPublic = data.public ? data.public : false;
	}
	var mUpdateData = {};
	
	_parseJsonData(jsonData);

	self._getConn = function(){
		console.log("mConn = " + mConn)
		return mConn;
	}
	
	self._origJson = function(){
		return mOrigJson;
	}
	
	self.getID = function(){
		return mID;
	}
	self.getRecStatus = function(){
		console.warn("TODO");
	}
	self.hasPTZ = function(){
		console.warn("TODO");
	}
	self.getURL = function(){
		return mURL;
	}
	self.setURL = function(url){
		mURL = url;
		mUpdateData['url'] = url;
	}
    self.getURLLogin = function(){
		return mURLLogin;
	}
	
	self.setURLLogin = function(val){
		mURLLogin = val;
		mUpdateData['login'] = val;
	}
	
    self.getURLPassword = function(){
		return mURLPassword;
	}

    self.setURLPassword = function(val){
		mURLPassword = val;
		mUpdateData['password'] = val;
	}

	self.getDeleteAt = function(){
		return mDeleteAt;
	}

    self.getTimezone = function(){
		return mTZ;
	}

    self.setTimezone = function(timezone){
		mTZ = timezone;
		mUpdateData["timezone"] = timezone;
	}
	
	self.isPublic = function(){
		return mPublic;
	}
    self.setPublic = function(bValue){
		mPublic = bValue;
		mUpdateData["public"] = bValue;
	}
	
	self.getStatus = function(){
		var st = mStatus.toUpperCase();
		if(CloudCameraStatus[st]){
			return CloudHelpers.copy(CloudCameraStatus[st]);
		}else{
			console.error("Unknown camera status");
		}
		return null;
	}
	
	self.getName = function(){
		return mName;
	}

	self.setName = function(name){
		mName = name;
		mUpdateData["name"] = name;
	}
	
	self.getLatitude = function(){
		return mLatitude;
	}
	
	self.setLatitude = function(latitude){
		mLatitude = latitude;
		mUpdateData['latitude'] = latitude;
	}
	
	self.getLongitude = function(){
		return mLongitude;
	}
	
	self.setLongitude = function(longitude){
		mLongitude = longitude;
		mUpdateData['longitude'] = longitude;
	}
	
	self.isRecording = function(){
		return mRecStatus;
	}

	self.getCameraManagerID = function(){
		return mCameraManagerID;
	}

	self.getBrand = function(){
		return mBrand;
	}
	
	self.getGroupName = function(){
		return mGroupName;
	}
	
	self.getFirmwareVersion = function(){
		return mFirmwareVersion;
	}
	
	self.getModel = function(){
		return mModel;
	}
	
	self.getUUID = function(){
		return mUUID;
	}

	self.getLed = function(){
		return mLed;
	}

	self.setRecordingMode = function(mode){
		if(mode.name == CloudCameraRecordingMode.CONTINUES.name){
			mUpdateData['rec_mode'] = "on";
		}else if(mode.name == CloudCameraRecordingMode.BY_EVENT.name){
			mUpdateData['rec_mode'] = "by_event";
		}else if(mode.name == CloudCameraRecordingMode.NO_RECORDING.name){
			mUpdateData['rec_mode'] = "off";
		}else{
			console.error("[CloudCamera] Unknown mode of recording");
		}
	}
	
	self.getRecordingMode = function(){
		if(mRecMode == "on"){
			return CloudHelpers.copy(CloudCameraRecordingMode.CONTINUES);
		}else if(mRecMode == "by_event"){
			return CloudHelpers.copy(CloudCameraRecordingMode.BY_EVENT);
		}else if(mRecMode == "off"){
			return CloudHelpers.copy(CloudCameraRecordingMode.NO_RECORDING);
		}else{
			console.error("[CloudCamera] Unknown mode of recording");
		}
	}
	
	self.save = function(){
		var p = CloudHelpers.promise();
		
		mConn._getAPI().updateCamera(mID, mUpdateData).done(function(r){
			_parseJsonData(r);
			if(mUpdateData['timezone']){ // timezone need change in cameramanager
				mConn._getAPI().updateCameraManager(mCameraManagerID, {timezone: mUpdateData['timezone']}).done(function(){
					mTZ = mUpdateData['timezone'];
					mUpdateData = {};
					p.resolve();
				}).fail(function(err){
					CloudHelpers.handleError(err, p);
				});
			}else{
				mUpdateData = {};
				p.resolve();
			}
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	self.getPreview = function(){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		var diffTime = mConn._getAPI().diffServerTime;
		mConn._getAPI().cameraPreview(mID).done(function(r){
			console.log(r);
			var preview_time = CloudHelpers.parseUTCTime(r.time);
			curr_time = CloudHelpers.getCurrentTimeUTC() + diffTime;
			if((curr_time - preview_time)/1000 > 60){
				mConn._getAPI().cameraUpdatePreview(mID).done(function(up_r){
					p.resolve(r.url);
				}).fail(function(up_err){
					CloudHelpers.handleError(up_err, p);
				});
			}else{
				p.resolve(r.url);
			}
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

	self.getTimeline = function(start,end){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		var start_dt = CloudHelpers.formatUTCTime(start);
		var end_dt = CloudHelpers.formatUTCTime(end);
		var slice = 4;
		mConn._getAPI().storageTimeline(mID,start_dt,end_dt,slice).done(function(r){
			var res = {};
			res.start = start;
			res.end = end;
			res.periods = []
			var list = r.objects[0][slice];
			for(var i in list){
				var period = {}
				period.start = CloudHelpers.parseUTCTime(list[i][0]);
				period.end = period.start + list[i][1]*1000;
				res.periods.push(period);
			}
			p.resolve(res);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	self.getTimelineDays = function(use_timezone){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().storageActivity(mID,use_timezone).done(function(r){
			var res = [];
			for(var i in r.objects){
				res.push(CloudHelpers.parseUTCTime(r.objects[i] + 'T00:00:00'));
			}
			p.resolve(res);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	self.getCameraUsage = function(){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().cameraUsage(mID).done(function(r){
			p.resolve(r);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

	var sharing_token_name = 'COMMON_SHARING_TOKEN';
	
	function channelCode(share_token){
		var channel = {};
		channel.token = share_token;
		channel.camid = mID;
		channel.access = 'watch';
		if(mConn.ServiceProviderUrl){
			channel.svcp = mConn.ServiceProviderUrl;
		}

		if(mConn.ApiHost){
			channel.api = mConn.ApiHost;
		}

		if(mConn.ApiPort && mConn.ApiPort != 80){
			channel.api_p = mConn.ApiPort;
		}

		if(mConn.ApiSecurePort && mConn.ApiSecurePort != 443){
			channel.api_sp = mConn.ApiSecurePort; 
		}

		// console.log("js: " + JSON.stringify(channel));
		// console.log("js2: " + btoa(JSON.stringify(channel)));
		return CloudHelpers.base64_encode(JSON.stringify(channel));
	}
	
	self.enableSharing = function(){
		var p = CloudHelpers.promise();
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().getCameraSharingTokensList(mID).done(function(r){
			var bFound = false;
			for(var i in r.objects){
				var sh_tkn = r.objects[i];
				if(sh_tkn.name == sharing_token_name){
					bFound = true;
					if(sh_tkn.enabled == true){
						p.resolve(channelCode(sh_tkn.token, mID, 'watch'));
					}else{
						mConn._getAPI().updateCameraSharingToken(mID, sh_tkn.id, {enabled: true}).done(function(r2){
							// console.log(r2);
							p.resolve(channelCode(sh_tkn.token, mID, 'watch'));
						}).fail(function(err){
							CloudHelpers.handleError(err, p);
						})
					}
					// mConn._getAPI().
					return;
				}
			}
			if(!bFound){
				mConn._getAPI().creareCameraSharingToken(mID, sharing_token_name, ['live', 'play', 'clipsplay']).done(function(r){
					p.resolve(channelCode(r.token, mID, 'watch'));
				}).fail(function(err){
					CloudHelpers.handleError(err, p);
				});	
			}
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	self.disableSharing = function(sharing_token){
		var p = CloudHelpers.promise();
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().getCameraSharingTokensList(mID).done(function(r){
			var bFound = false
			for(var i in r.objects){
				var sh_tkn = r.objects[i];
				if(sh_tkn.name == sharing_token_name){
					bFound = true;
					mConn._getAPI().updateCameraSharingToken(mID, sh_tkn.id, {enabled: false}).done(function(r2){
						console.log(r2);
						p.resolve();
					}).fail(function(err){
						CloudHelpers.handleError(err, p);
					})
					return;
				}
			}
			p.reject();
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	var sharing_token_name_for_stream = 'COMMON_SHARING_TOKEN_FOR_STREAM';

	function channelCodeForStream(share_token){
		var channel = {};
		channel.token = share_token;
		channel.camid = mID;
		channel.cmngrid = mCameraManagerID;
		channel.access = 'all';
		channel.api_p = 80;
		channel.api_sp = 443;
		channel.cam = "cam.skyvr.videoexpertsgroup.com";
		channel.cam_p = 8888; // default port
		channel.cam_sp = 8883; // default port

		if(mConn.ServiceProviderUrl){
			channel.svcp = mConn.ServiceProviderUrl;
			// channel.api = mConn.ServiceProviderUrl;
		}
		if(mConn.ApiHost){
			channel.api = mConn.ApiHost;
		}

		if(mConn.ApiPort && mConn.ApiPort != 80){
			channel.api_p = mConn.ApiPort;
		}

		if(mConn.ApiSecurePort && mConn.ApiSecurePort != 443){
			channel.api_sp = mConn.ApiSecurePort; 
		}

		if(mConn.CamHost){
			channel.cam = mConn.CamHost;
		}

		if(mConn.CamPort){
			channel.cam_p = mConn.CamPort;
		}

		if(mConn.CamSecurePort){
			channel.cam_sp = mConn.CamSecurePort; 
		}

		// console.log("js: " + JSON.stringify(channel));
		// console.log("js2: " + btoa(JSON.stringify(channel)));
		return CloudHelpers.base64_encode(JSON.stringify(channel));
	}
	
	self.enableSharingForStream = function(){
		var p = CloudHelpers.promise();
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		mConn._getAPI().getCameraSharingTokensList(mID).done(function(r){
			var bFound = false;
			for(var i in r.objects){
				var sh_tkn = r.objects[i];
				if(sh_tkn.name == sharing_token_name_for_stream){
					bFound = true;
					if(sh_tkn.enabled == true){
						p.resolve(channelCodeForStream(sh_tkn.token));
					}else{
						mConn._getAPI().updateCameraSharingToken(mID, sh_tkn.id, {enabled: true}).done(function(r2){
							// console.log(r2);
							p.resolve(channelCodeForStream(sh_tkn.token));
						}).fail(function(err){
							CloudHelpers.handleError(err, p);
						})
					}
					// mConn._getAPI().
					return;
				}
			}
			if(!bFound){
				mConn._getAPI().creareCameraSharingToken(mID, sharing_token_name_for_stream, ['all']).done(function(r){
					p.resolve(channelCodeForStream(r.token));
				}).fail(function(err){
					CloudHelpers.handleError(err, p);
				});	
			}
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

    self.getStreamingURL = function(){
        var p = CloudHelpers.promise();
        if(!mConn || !mConn.isOpened()){
            p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
            return p;
        }
        mConn._getAPI().getCameraStreamingURLs(mID).done(function(r){
            p.resolve(r);
        }).fail(function(err){
            CloudHelpers.handleError(err, p);
        });
        return p;
    };

    self.setPublishPassword = function(val){
        mUpdateData['publish_password'] = val;
    };

}

window.CloudCameraListFilter = function(){
	var self = this;
	self.filterParams = {
		'detail': 'detail',
		'limit': 50
	};

	self.setLimit = function(limit){
		self.filterParams['limit'] = limit;
	}

	self.setOffset = function(offset){
		self.filterParams['offset'] = offset;
	}

	self.setName = function(name){
		if(name !== undefined){
			self.filterParams['name'] = name;
		}else{
			delete self.filterParams['name'];
		}
	}
	
	self.setPartOfName = function(name){
		if(name !== undefined){
			self.filterParams['name__icontains'] = name;
		}else{
			delete self.filterParams['name__icontains'];
		}
	}

	self.sortByName = function(asc){
		self.filterParams['order_by'] = (asc ? '-' : '') + 'name';
	}

	self.sortByDate = function(asc){
		self.filterParams['order_by'] = (asc ? '-' : '') + 'created';
	}

	self.setOwner = function(val){
		console.warn("setPublic is deprecated");
		if(val !== undefined){
			self.filterParams['is_owner'] = val;
		}else{
			delete self.filterParams['is_owner'];
		}
	}

	self.setPublic = function(val){
		console.warn("setPublic is deprecated");
		if(val !== undefined){
			self.filterParams['public'] = val;
		}else{
			delete self.filterParams['public'];
		}
	}

	self.setForStream = function(val){
		if(val !== undefined){
			if(val !== undefined){
				self.filterParams['url__isnull'] = val;
			}else{
				delete self.filterParams['url__isnull'];
			}
		}else{
			delete self.filterParams['url__isnull'];
		}
	}

	self.setPrivacy = function(val){
		if(val !== undefined && val.name){
			if(val.name == "PS_OWNER_NOT_PUBLIC"){
				self.filterParams['public'] = false;
				self.filterParams['is_owner'] = true;
			}else if(val.name == "PS_OWNER"){
				delete self.filterParams['public'];
				self.filterParams['is_owner'] = true;
			}else if(val.name == "PS_PUBLIC_NOT_OWNERS"){
				self.filterParams['public'] = true;
				self.filterParams['is_owner'] = false;
			}else if(val.name == "PS_PUBLIC"){
				self.filterParams['public'] = true;
				delete self.filterParams['is_owner'];
			}else if(val.name == "PS_OWNERS_PUBLIC"){
				self.filterParams['public'] = true;
				self.filterParams['is_owner'] = true;
			}else if(val.name == "PS_ALL"){
				delete self.filterParams['public'];
				delete self.filterParams['is_owner'];
			}else{
				console.error("Unknown privacy filter");
				delete self.filterParams['public'];
				delete self.filterParams['is_owner'];
			}
		}else{
			console.error("Unknown privacy filter");
			delete self.filterParams['public'];
			delete self.filterParams['is_owner'];
		}
	}

	self.setURL = function(url){
		if(url !== undefined){
			self.filterParams['url'] = url;
		}else{
			delete self.filterParams['url'];
		}
	}

	self.setLatLngBounds = function(latitude_min, latitude_max, longitude_min, longitude_max){
		 console.warn("[CloudCamerasListFilter] SetLatLngBounds, TODO test -1 < lat,lang < 1");
		 // TODO: don't forget check situation when MAX < MIN (if it possible, of course)!!!!
		 if(latitude_min <= latitude_max){
			self.filterParams['latitude__gte'] = latitude_min;
			self.filterParams['latitude__lte'] = latitude_max;
        }

        if(longitude_min <= longitude_max){
			self.filterParams['longitude__gte'] = longitude_min;
			self.filterParams['longitude__lte'] = longitude_max;
        }
	}

	self._values = function(){
		return self.filterParams;
	}
}

// construct
window.CloudCameraList = function(conn){
	var self = this;
	var mConn = conn;
	
	self.getCamera = function(camid){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		
		mConn._getAPI().getCamera(camid).done(function(r){
			p.resolve(new CloudCamera(mConn, r));
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

	self.createCamera = function(url, login, password){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}

		var data = {
			url: url,
			login: login,
			password: password
		};
		mConn._getAPI().createCamera(data).done(function(r){
			p.resolve(new CloudCamera(mConn, r));
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
	
	self.createCameraForStream = function(){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}

		var data = {};
		mConn._getAPI().createCamera(data).done(function(r){
			p.resolve(new CloudCamera(mConn, r));
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

	self.findOrCreateCamera = function(url){
		var p = CloudHelpers.promise();
		var camFilter = new CloudCameraListFilter();
		camFilter.setOwner(true);
		var u = CloudHelpers.splitUserInfoFromURL(url);
		camFilter.setURL(u.url);
		u.login = u.login || "";
		mConn._getAPI().camerasList(camFilter._values()).done(function(r){
			var bFound = false;
			for(var i in r.objects){
				var cam = r.objects[i];
				cam['login'] = cam['login'] || "";
				if(cam['login'] == u.login){
					bFound = true;
					p.resolve(new CloudCamera(mConn, cam));
					break;
				}
			}
			if(!bFound){
				self.createCamera(u.url, u.login, u.password).done(function(r){
					p.resolve(r);
				}).fail(function(err){
					CloudHelpers.handleError(err, p);
				})
			}
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	

	self.getCameraList = function(camFilter){
		var p = CloudHelpers.promise();
		
		camFilter = camFilter || new CloudCameraListFilter();
		if(!camFilter['_values']){
			console.error(CloudReturnCode.ERROR_EXPECTED_FILTER);
			p.reject(CloudReturnCode.ERROR_EXPECTED_FILTER);
			return p;
		}
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		
		mConn._getAPI().camerasList(camFilter._values()).done(function(r){
			var arr = [];
			for(var i in r.objects){
				arr.push(new CloudCamera(mConn, r.objects[i]));
			}
			p.resolve(arr);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getCameraListLight = function(camFilter){
		var p = CloudHelpers.promise();
		
		camFilter = camFilter || new CloudCameraListFilter();
		if(!camFilter['_values']){
			console.error(CloudReturnCode.ERROR_EXPECTED_FILTER);
			p.reject(CloudReturnCode.ERROR_EXPECTED_FILTER);
			return p;
		}
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		var filter = camFilter._values();
		delete filterMap['detail'];
		mConn._getAPI().camerasList(filter).done(function(r){
			p.resolve(r.objects);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.deleteCamera = function(camid){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		
		mConn._getAPI().deleteCamera(camid).done(function(){
			p.resolve();
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
}

// construct
window.CloudSession = function(conn, jsonData){
	var self = this;
	self.type = 'session';
	var mConn = conn;
	var mOrigJson;
	var mID = jsonData.id;
	
	// TODO
	
	var mActive, mTitle, mPreviewURL, mAuthor;
	var mStreaming, mPublic, mLatitude, mLongitude;
	var mStart, mEnd, mHasRecords;
	var mHasAccessAll;
	var mHasAccessWatch;
	var mStatisticsLive = 0, mStatisticsPeakLive = 0, mStatisticsPlayback = 0;
	var mAuthorPreferredName;
	var mLiveURL_rtmp, mLiveURL_hls, mLiveURL_expire;
	 
	mPreviewURL = "";
	
	function _parseJsonData(data){
		mOrigJson = data;
		mActive = data.active;
		mTitle = data.title;
		if(data.preview){
			mPreviewURL = data.preview.url;
		}

		if(data.live_urls){
			mLiveURL_rtmp = data.live_urls.rtmp;
			mLiveURL_hls = data.live_urls.hls;
			mLiveURL_expire = data.live_urls.expire;
		}

		mLatitude = data.latitude;
		mLongitude = data.longitude;
		mStreaming = data.streaming;
		mPublic = data.public;
		mStart = data.start;
		mEnd = data.end;
		mHasRecords = data.has_records;
		if(data.statistics){
			mStatisticsPeakLive = data.statistics.peak_live || 0;
			mStatisticsPlayback = data.statistics.playback || 0;
			mStatisticsLive = data.statistics.live || 0;
		}

		if(data.author){
			// TODO: author:{first_name: "Evgenii", id: "user5", last_name: "Sopov", name: "Evgenii Sopov", preferred_name: "evgenii"}
			mAuthorPreferredName = data.author.preferred_name;
		}else{
			mAuthorPreferredName = "unknown";
		}
		
		if(data.access){
			mHasAccessAll = data.access.indexOf("all") != -1;
			mHasAccessWatch = data.access.indexOf("watch") != -1;
		}
	}
	var mUpdateData = {};
	
	_parseJsonData(jsonData);

	self._getConn = function(){
		return mConn;
	}

	self._origJson = function(){
		return mOrigJson;
	}
	
	self.hasAccessAll = function(){
		return mHasAccessAll;
	}
	
	self.hasAccessWatch = function(){
		return mHasAccessAll || mHasAccessWatch;
	}
	
	self.getID = function(){
		return mID;
	}
	
	self.isOnline = function(){
		return mActive;
	}
	
	self.getTitle = function(){
		return mTitle;
	}

	self.getAuthorPreferredName = function(){
		return mAuthorPreferredName;
	}
	
	self.getStatisticsLive = function(){
		return mStatisticsLive;
	}
	
	self.getStatisticsPeakLive = function(){
		return mStatisticsPeakLive;
	}
	
	self.getStatisticsPlayback = function(){
		return mStatisticsPlayback;
	}
	
	self.getStartTime = function(){
		if(mStart == null){
			console.error("[CloudSession] #" + mID + " Start time is null");
			return 0;
		}
		return CloudHelpers.parseUTCTime(mStart);
	}
	
	self.getEndTime = function(){
		if(mStart == null){
			console.error("[CloudSession] #" + mID + " End time is null but session is mActive: " + mActive);
			return 0;
		}
		return CloudHelpers.parseUTCTime(mEnd);
	}

	self.getPreview = function(){
		return mPreviewURL;
	}
	
	self.getLatitude = function(){
		return mLatitude;
	}
	
	self.getLongitude = function(){
		return mLongitude;
	}
	
	self.isStreaming = function(){
		return mStreaming;
	}
	
	self.isPublic = function(){
		return mPublic;
	}
	
	self.hasRecords = function(){
		return mHasRecords;
	}
	
	self.getLiveUrl_Rtmp = function(){
		return mLiveURL_rtmp;
	}
	
	self.getLiveUrl_HLS = function(){
		return mLiveURL_hls;
	}
	
	self.getLiveUrl_Expire = function(){
		return mLiveURL_expire;
	}

	self.refresh = function(){
		var p = CloudHelpers.promise();
		mConn._getAPI().getCamsess(mID).done(function(r){
			_parseJsonData(r);
			p.resolve();
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
}

window.CloudSessionListFilter = function(){
	var self = this;
	self.filterParams = {
		'limit': 50,
		'order_by': '-start' // default
	};

	self.setLimit = function(limit){
		self.filterParams['limit'] = limit;
	}
	
	self.setOffset = function(offset){
		self.filterParams['offset'] = offset;
	}

	self.setTitle = function(s){
		self.filterParams["title__icontains"] = s; // ignore case
	}
	
	self.setStartLessThen = function(s){
		self.filterParams['start__lte'] = s;
	}
	
	self.setHasRecords = function(s){
		if(s == 'any'){
			// all
        }else if(s == 'yes'){
			self.filterParams['has_records'] = true;
			self.filterParams['active'] = false;
		}else if(s == 'no'){
			self.filterParams['has_records'] = false;
			self.filterParams['active'] = false;
		}else{
			console.error("[CloudSessionListFilter] setHasRecords, expected 'any', 'yes' or 'no'")
		}
	}
	
	self.setStreaming = function(s){
		if(s == 'any'){
			// all
        }else if(s == 'yes'){
			self.filterParams['streaming'] = true;
			self.filterParams['camera_online'] = true;
			self.filterParams['active'] = true;
		}else if(s == 'no'){
			self.filterParams['streaming'] = false;
			delete self.filterParams['camera_online'];
			self.filterParams['active'] = false;
		}else{
			console.error("[CloudSessionListFilter] setStreaming, expected 'any', 'yes' or 'no'")
		}
	}

	self.setAuthorName = function(s){
		self.filterParams['author_name__icontains'] = s;
	}
	
	self.setAuthorID = function(n){
		if(n){
			self.filterParams['author_id'] = n;
		}else{
			delete self.filterParams['author_id'];
		}
	}
	
	self.setAuthorPreferredName = function(s){
		if(s){
			self.filterParams['author_preferred_name__icontains'] = s;
		}else{
			delete self.filterParams['author_preferred_name__icontains'];
		}
	}
	
	self.setWithDetails = function(){
		console.warn("[CloudSessionListFilter] 'setWithDetails' not supported anymore. Please use getSessionList or getSessionListLight")
	}
	
	self.setOnline = function(s){
		console.warn("[CloudSessionListFilter] 'setOnline' not supported anymore")
	}
	
	self.setPublic = function(s){
		if(s == 'any'){
			// any
        }else if(s == 'yes'){
			self.filterParams['public'] = true;
		}else if(s == 'no'){
			self.filterParams['public'] = false;
		}else{
			console.error("[CloudSessionListFilter] setOnline, expected 'any', 'yes' or 'no'")
		}
	}
	
	self.setLatLngBounds = function(latitude_min, latitude_max, longitude_min, longitude_max){
		if(latitude_min <= latitude_max){
			self.filterParams['latitude__gte'] = latitude_min;
			self.filterParams['latitude__lte'] = latitude_max;
		}else{
			console.error("[CloudCamerasListFilter] latitude_max must be greater or equal to latitude_min");
		}

		if(longitude_min <= longitude_max){
			self.filterParams['longitude__gte'] = longitude_min;
			self.filterParams['longitude__lte'] = longitude_max;
		}else{
			console.error("[CloudCamerasListFilter] longitude_max must be greater or equal to longitude_min");
		}
	}

	self._values = function(){
		var filterMapCopy = {};
		for(var p in self.filterParams){
			filterMapCopy[p] = self.filterParams[p];
		}
		return filterMapCopy;
	}
}

// construct
window.CloudSessionList = function(conn){
	var self = this;
	var mConn = conn;
	
	self.getSession = function(sessid){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		
		mConn._getAPI().getCamsess(sessid).done(function(r){
			p.resolve(new CloudSession(mConn, r));
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}

	self.getSessionList = function(sessionFilter){
		var p = CloudHelpers.promise();
		
		sessionFilter = sessionFilter || new CloudSessionListFilter();
		if(!sessionFilter['_values']){
			console.error(CloudReturnCode.ERROR_EXPECTED_FILTER);
			p.reject(CloudReturnCode.ERROR_EXPECTED_FILTER);
			return p;
		}
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		var filterMap = sessionFilter._values();
		filterMap['detail'] = 'detail';
		mConn._getAPI().getCamsessList(filterMap).done(function(r){
			var arr = [];
			for(var i in r.objects){
				arr.push(new CloudSession(mConn, r.objects[i]));
			}
			p.resolve(arr);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.getSessionListLight = function(sessionFilter){
		var p = CloudHelpers.promise();
		
		sessionFilter = sessionFilter || new CloudSessionListFilter();
		if(!sessionFilter['_values']){
			console.error(CloudReturnCode.ERROR_EXPECTED_FILTER);
			p.reject(CloudReturnCode.ERROR_EXPECTED_FILTER);
			return p;
		}
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		var filterMap = sessionFilter._values();
		delete filterMap['detail'];
		mConn._getAPI().getCamsessList(filterMap).done(function(r){
			p.resolve(r.objects);
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		})
		return p;
	}
	
	self.deleteSession = function(sessid){
		var p = CloudHelpers.promise();
		
		if(!mConn || !mConn.isOpened()){
			p.reject(CloudReturnCode.ERROR_NO_CLOUD_CONNECTION);
			return p;
		}
		
		mConn._getAPI().deleteCamsess(sessid).done(function(){
			p.resolve();
		}).fail(function(err){
			CloudHelpers.handleError(err, p);
		});
		return p;
	}
}

window.CloudPlayerEvent = {};

CloudPlayerEvent.CONNECTING = {
	name: 'CONNECTING',
	code: 0,
	text: 'Connection is establishing'
};

CloudPlayerEvent.CONNECTED = {
	name: 'CONNECTED',
	code: 1,
	text: 'Connection is established'
};

CloudPlayerEvent.PLAYED = {
	name: 'PLAYED',
	code: 2,
	text: 'Player changes state to PLAY.'
};

CloudPlayerEvent.PAUSED = {
	name: 'PAUSED',
	code: 3,
	text: 'Player state is PAUSE.'
};

CloudPlayerEvent.CLOSED = {
	name: 'CLOSED',
	code: 6,
	text: 'Player state is CLOSED.'
};
   
CloudPlayerEvent.SEEK_COMPLETED = {
	name: 'SEEK_COMPLETED',
	code: 17,
	text: 'setPosition() is successfully finished.'
};

CloudPlayerEvent.ERROR = {
	name: 'ERROR',
	code: 105,
	text: 'Player is disconnected from media stream due to an error'
};

CloudPlayerEvent.SOURCE_CHANGED = {
	name: 'SOURCE_CHANGED',
	code: 3000,
	text: 'setSource() is successfully finished.'
};

CloudPlayerEvent.POSITION_JUMPED = {
	name: 'POSITION_JUMPED',
	code: 3001,
	text: 'Position was changed by player (possible that player did not found records).'
};

CloudPlayerEvent.RANGE_ENDED = {
	name: 'RANGE_ENDED',
	code: 4455,
	text: 'The player reached the end of the range when playing'
}

CloudPlayerEvent.CHANNEL_STATUS = {
	name: 'CHANNEL_STATUS',
	code: 4456,
	text: 'When channel status'
}

CloudPlayerEvent.USER_CLICKED_ON_TIMELINE = {
	name: 'USER_CLICKED_ON_TIMELINE',
	code: 4457,
	text: 'When user click on timeline.'
};

CloudPlayerEvent.CHANGED_CONTROLS = {
	name: 'CHANGED_CONTROLS',
	code: 4458,
	text: 'Event when controls changes'
};

CloudPlayerEvent.TIMELINE_END_UPDATED = {
	name: 'TIMELINE_END_UPDATED',
	code: 4459,
	text: 'Event when timeline end updated'
};




// construct
window._cloudPlayers = window._cloudPlayers || {};

window.CloudPlayer = function(elid, options){
	var self = this;
	self.options = options = options || {};
	self.elid = elid;
	var mConn = null;
	var mEvent = null;
	var mShowedBigPlayButton = false;
	var mShowedLoading = true;
	var mTimeWaitStartStream = 0;
	var mStopped = true;
	var mPlaying = false;
	var mHLSLinkExpire = 0;
	var mSafariAndHlsNotStarted = false;
	var mCallbacks = CloudHelpers.createCallbacks();
	var mUsedPlayer = '';
	var mWebRTC_el = null;
	var mWebRTC0_Player = null;
	var mWebRTC2_Player = null;
	var mNativeHLS_el = null;
	var mNativeHLS_Player = null;
	var mNativeVideo1_el = null;
	var mNativeVideo2_el = null;
	var mLiveModeAutoStart = false;
	var mPolingCameraStatus = null;
	var mCallback_onError = null; // deprecated
	var mCallback_onChannelStatus = null; // deprecated
	var mPlayerFormatForced = null;
	var mIsDewarping = null;
	var mElementCalendar = null;
	var mCurrentTimeInterval = null;
	var mExpireHLSTimeInterval = null;
	var mEnablePlaybackNative = true;
	var mTrasholdPlayback = 0; // default in ms for playback
	var mPreferredPlayerFormat = null;
	var f_callbackFullscreenFunc = null;

	self.timePolingLiveUrls = 15000;
	self.player = document.getElementById(elid);
	
	if (_cloudPlayers[elid]) {
		return _cloudPlayers[elid];
	}
	
	var mCurrentRecord_vjs = null;
	var mNextRecord_vjs = null;
	
	var mRangeMin = -1;
	var mRangeMax = -1;
	var mVideoSizeLive = {w: 0, h: 0};

	// configure hls plugin
	if (CloudHelpers.isChrome() && !CloudHelpers.isMobile()) {
		videojs.options.hls = videojs.options.hls || {};
		videojs.options.html5.nativeAudioTracks = true;
		videojs.options.html5.nativeVideoTracks = false;//true;
		videojs.options.hls.overrideNative = false;
	} else {
		videojs.options.hls = videojs.options.hls || {};
		videojs.options.html5.nativeAudioTracks = false;
		videojs.options.html5.nativeVideoTracks = false;
		videojs.options.hls.overrideNative = true;
	}
	// videojs.options.hls.withCredentials = false;
	videojs.options.hls.enableLowInitialPlaylist = true;
	// videojs.options.hls.blacklistDuration = 0;
	// videojs.options.hls.handleManifestRedirects = false;

	// videojs.options.hls.bandwidth

	if (self.player == null) {
		console.error("[CloudPlayer] Not found element");
		return null;
	}
	
	if (self.player.tagName != 'DIV') {
		console.error("[CloudPlayer] Expected DIV tag but got " + self.player.tagName);
		return null;
	}
	
	var mPosition = -1;
	
	var mWaitSourceActivationCounter = 0;
	var mTimePolingCameraStatus_inactive = 2000;
	var mTimePolingCameraStatus_active = 5000;

	var mCurrentPlayRecord = null;
	var mNextPlayRecord = null;
	self.m = {};
	self.m.mute = false;
	self.m.waitSourceActivation = options.waitSourceActivation || 0;
	/*if (self.m.waitSourceActivation > 60000) {
		console.warn("[CloudPlayer] option waitSourceActivation must be less than 30");
		self.m.waitSourceActivation = 30;
	}*/
	self.m.useTimezone = options.useTimezone;
	if (self.m.useTimezone) {
		console.warn("[CloudPlayer] useTimezone: " + self.m.useTimezone);
	}
	
	if (self.m.waitSourceActivation < 0) {
		console.warn("[CloudPlayer] option waitSourceActivation must be greater than -1");
		self.m.waitSourceActivation = 0;
	}

	self.m.useNativeHLS = options.useNativeHLS || false;

	self.m.backwardAudio = false;
	self.m.backwardAudio = options.backwardAudio || self.player.getAttribute('backward-audio') != null || self.m.backwardAudio; 
	self.defualtAutohide = CloudHelpers.isMobile() ? 0 : 3000;
	if (options["autohide"] !== undefined) {
		self.m.autohide = options.autohide	
	} else {
		self.m.autohide = self.defualtAutohide;	
	}

	if (options.trasholdPlaybackInMs) {
		mTrasholdPlayback = options.trasholdPlaybackInMs;
		console.log("[CloudPlayer] applied option trasholdPlaybackInMs " + options.trasholdPlaybackInMs);
	}
	
	self.mPlayerFormat = 'html5';

	// load format from storage
	
	var tmp_plr_frmt = '';
	if (options.preferredPlayerFormat) {
		self.mPreferredPlayerFormat = options.preferredPlayerFormat;
		tmp_plr_frmt = options.preferredPlayerFormat;
	} else {
		try{
			tmp_plr_frmt = localStorage.getItem("preferred_player_format");
		} catch (e) {
			console.error("[CloudPlayer] error load format: ", e)
		}
	}

	if (tmp_plr_frmt == 'webrtc' || tmp_plr_frmt == 'html5' || tmp_plr_frmt == 'flash') {
		self.mPlayerFormat = tmp_plr_frmt;
	}else{
		if(tmp_plr_frmt != null){
		} 
		console.warn("[CloudPlayer] Unknown player format: ", tmp_plr_frmt, ", html5 is used by default");
	}

	if (options.useOnlyPlayerFormat) {
		var use_plr_frmt = options.useOnlyPlayerFormat;
		if (use_plr_frmt !== 'webrtc' && use_plr_frmt !== 'html5' && use_plr_frmt !== 'flash') {
			console.error("Wrong value of useOnlyPlayerFormat, expected 'webrtc' or 'html5' or 'flash'")
		} else {
			self.mPlayerFormat = use_plr_frmt;
			mPlayerFormatForced = use_plr_frmt;
			try { localStorage.setItem("preferred_player_format", use_plr_frmt); } catch(e) {}
		}
	}

	if (options.mute !== undefined) {
		self.m.mute = options.mute === true ? true : false
	}

	self.swf_backwardaudio = '';

	// default
	self.player.classList.add("cloudplayer");
	self.player.classList.add("green");
	self.player.classList.add("black");
	
	self.player.innerHTML = ''
		+ '<div class="cloudplayer-loader" style="display: inline-block"></div>'
		+ '<div class="cloudplayer-screenshot-loading" style="display: none">'
		+ '		<div class="cloudplayer-screenshot-loading">'
		+ '     </div>'
		+ '</div>'
		+ '<div class="cloudplayer-error" style="display: none">'
		+ '	<div class="cloudplayer-error-text" style="display: none"></div>'
		+ '</div>'
		+ '<div class="cloudplayer-ptz">'
		+ '<div class="ptz-controls">'
		+ '	<div class="ptz-arrow ptz-top"></div>'
		+ '	<div class="ptz-arrow ptz-right"></div>'
		+ '	<div class="ptz-arrow ptz-bottom"></div>'
		+ '	<div class="ptz-arrow ptz-left"></div>'
		+ '<div class="ptz-zoom">'
		+ '	<div class="ptz-zoom-plus"></div>'
		+ '	<div class="ptz-zoom-minus"></div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="ptz-presets">'
		+ '<h4>Presets</h4>'
		+ '<ul class="presets-list">'
		+ '<li data-presetNo="1">1</li>'
		+ '<li data-presetNo="2">2</li>'
		+ '<li data-presetNo="3">3</li>'
		+ '<li data-presetNo="4">4</li>'
		+ '<li data-presetNo="5">5</li>'
		+ '</ul>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudplayer-controls-zoom-container">'
		+ '<div class="cloudplayer-controls-zoom-position">'
		+ '		<div class="cloudplayer-zoom-position-cursor"></div>'
		+ '</div>'
		+ '<div class="cloudplayer-controls-zoom">'
		+ '	<div class="cloudplayer-zoom-up"></div>'
		+ '	<div class="cloudplayer-zoom-progress zoom10x"></div>'
		+ '	<div class="cloudplayer-zoom-down"></div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudplayer-watermark">'
		+ '</div>'
		+ '<div class="cloudplayer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '<div class="cloudplayer-info">'
		+ '<div class="cloudplayer-info-main">'
		+ '		<div class="cloudplayer-info-title">Settings</div>'
		+ '		<div class="cloudplayer-info-container">'
		+ '		<div class="cloudplayer-info-player-mode" style="' + (mPlayerFormatForced !== null ? 'disabled' : '' ) + '"> Preferred format: '
		+ '		<div class="selected-format"></div></div>'
		+ '		<div class="cloudplayer-info-player-dewarping enabled"  style="' + (mIsDewarping !== null && False ? 'display: none' : '' ) + '">Dewarping: '
		+ '		<div class="selected-dewarping">Off</div></div>'
		+ '		<div class="cloudplayer-info-player-speed enabled">Speed: '
		+ '		<div class="selected-speed">1x</div></div>'
		+ '		<!-- div class="cloudplayer-info-latency">Player Latency: '
		+ '			<div class="cloudplayer-info-latency-minimal">Minimal Latency</div>'
		+ '			/ '
		+ ' 		<div class="cloudplayer-info-latency-smoothless">Maximum Smoothness</div>'
		+ '		</div -->'
		+ '		<!-- div class="cloudplayer-info-latency-not-supported">Player Latency: Setting is not available for HTML5 player</div -->'
		+ '		<div class="cloudplayer-info-bufferlength"></div>'
		+ '		<div class="cloudplayer-info-audio-stream">Audio stream: '
		+'			<div class="cloudplayer-info-audio-stream-on">On</div>'
		+ '			/ '
		+ ' 		<div class="cloudplayer-info-audio-stream-off">Off</div>'
		+'		</div>'
		+ '		<div class="cloudplayer-info-playerversion">Version: ' + CloudSDK.version + ' (' + CloudSDK.datebuild + ')</div>'
		+ '		<div class="cloudplayer-info-playertype">Used player:</div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudplayer-info-setting mode-select">'
		+ '		<div class="cloudplayer-info-title"><span class="back"></span>Preferred format</div>'
		+ '		<div class="cloudplayer-info-container">'
		+ '		<div class="cloudplayer-player-mode cloudplayer-webrtc-mode" style="display: none">'+(options['alt_protocol_names']?'Low latency':'WebRTC')+'</div>'
		+ ' 		<div class="cloudplayer-player-mode cloudplayer-flash-mode selected">'+(options['alt_protocol_names']?'Standard':'RTMP')+'</div>'
		+ ' 		<div class="cloudplayer-player-mode cloudplayer-html5-mode">'+(options['alt_protocol_names']?'Reliable':'HLS')+'</div>'
		+ '		</div>'
		+ '</div>'
		+ '<div class="cloudplayer-info-setting dewarping-select">'
		+ '		<div class="cloudplayer-info-title"><span class="back"></span>Dewarping</div>'
		+ '		<div class="cloudplayer-info-container">'
		+ '			<div class="cloudplayer-player-mode cloudplayer-dewarping-mode selected" data-dewarping="0">Off</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-dewarping-mode" data-dewarping="1">On</div>'
		+ '		</div>'
		+ '</div>'
		+ '<div class="cloudplayer-info-setting speed-select">'
		+ '		<div class="cloudplayer-info-title"><span class="back"></span>Speed</div>'
		+ '		<div class="cloudplayer-info-container">'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="0.125">0.125x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="0.25">0.25x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="0.5">0.5x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode selected" data-speed="1">1x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="2">2x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="4">4x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="8">8x</div>'
		+ '			<div class="cloudplayer-player-mode cloudplayer-speed-mode" data-speed="16">16x</div>'
		+ '		</div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudplayer-backwardaudio-container">'
		+ (self.m.backwardAudio ? ''
		+ '<object data="' + self.swf_backwardaudio + '" type="application/x-shockwave-flash" id="backwardaudio_swf_single" align="top">'
		+ '		<param name="movie" value="' + self.swf_backwardaudio + '" />'
		+ '		<embed type="application/x-shockwave-flash" src="' + self.swf_backwardaudio + '">'
		+ '		<param name="allowScriptAccess" value="always"/>'
		+ '		<param value="allowNetworking" value="all"/>'
		+ '		<param name="menu" value="true" />'
		+ '		<param name="wmode" value="transparent"/>'
		+ '		<!-- param name="bgcolor" value="#ffffff" / -->'
		+ '		<param name="menu" value="false" />'
		+ '</object>'
		: '')
		+ '</div>'
		+ '<div class="cloudplayer-calendar-container"></div>'
		+ '<div class="cloudplayer-live-container"></div>'
		+ '<div class="cloudplayer-controls-container">'
		+ '<div class="cloudplayer-timeline-container"></div>'
		+ '<div class="cloudplayer-controls">'
		+ '	<div class="cloudplayer-play" style="display: none"></div>'
		+ '	<div class="cloudplayer-stop" style="display: none"></div>'		+ '	<div class="cloudplayer-volume-mute"></div>'
		+ '	<div class="cloudplayer-volume-container">'
		+ '	<input type="range" min="0" max="100" step="1" data-buffer="0" id="volume" class="cloudplayer-volume" data-rangeSlider>'
		+ '	<output></output>'
		+ '</div>'
		+ '	<div class="cloudplayer-time"></div>'
		+ '	<div class="cloudplayer-volume-down"></div>'
		+ '	<div class="cloudplayer-volume-progress vol7"></div>'
		+ '	<div class="cloudplayer-volume-up"></div>'
		+ '	<div class="cloudplayer-microphone"></div>'
		+ '	<div class="cloudplayer-settings"></div>'
		+ '	<div class="cloudplayer-show-zoom"></div>'
		+ '	<div class="cloudplayer-show-ptz"></div>'
		+ '	<div class="cloudplayer-fullscreen"></div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudcameracalendar-content">'
		+ '</div>'
		+ '<div class="cloudplayer-big-play-button" style="display: none"></div>'
		+ '<div class="allvideotags" style="width:100%; height:100%;" >'
		+ '<video crossorigin="anonymous" id="' + elid + '_vjs" class="video-js" preload="auto" class="video-js vjs-default-skin vjs-live"'
		+ ' muted=' + self.m.mute + ' autoplay=true preload playsinline="true"></video>'
		+ '<video crossorigin="anonymous" id="' + elid + '_vjs2" class="video-js" preload="auto" class="video-js vjs-default-skin vjs-live"'
		+ ' muted=' + self.m.mute + ' autoplay=true preload playsinline="true" ></video>'
		+ '<video crossorigin="anonymous" id="' + elid + '_nv1" class="cloudplayer-native-video"'
		+ ' autoplay=true preload  playsinline="true" ></video>'
		+ '<video crossorigin="anonymous" id="' + elid + '_nv2" class="cloudplayer-native-video"'
		+ ' autoplay=true preload  playsinline="true" ></video>'
		+ '<video crossorigin="anonymous" id="' + elid + '_native_hls" class="cloudplayer-native-hls"'
		+ ' muted=' + self.m.mute + ' autoplay=true preload  playsinline="true" ></video>'
		+ '<video crossorigin="anonymous" id="' + elid + '_webrtc" class="cloudplayer-webrtc"'
		+ ' muted=' + self.m.mute + ' preload  playsinline="true" ></video>'
		+ '</div>'
		+ '<div class="cloudplayer-black-screen" style="display: none">'
		+ '		<div class="cloudplayer-watermark"></div>'
		+ '		<div class="cloudplayer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '</div>'
	;

	self.vjs = videojs(elid + '_vjs', {
		"controls": false
	});
	
	self.vjs2 = videojs(elid + '_vjs2', {
		"controls": false
	}).ready(function(){
		self.vjs2.el().style.display = "none";
	});

	self.vjs.on('error',function(error){
		_hideloading();
		if(self.vjs.error() != null){
			var e = self.vjs.error();
			if (self.isLive()) {
				if (e.code == 4 && !CloudHelpers.supportFlash() && !CloudHelpers.isMobile() && self.mPlayerFormat == "flash") {
					//self._showerror({name: "REQUIRE_FLASH", text: "Please install and enable <a target='_black' href='https://get.adobe.com/flashplayer/'>Adobe Flash Player</a> and try again", code: -6001});
					self._showConsoleError({name: "REQUIRE_FLASH", text: "Please install and enable <a target='_black' href='https://get.adobe.com/flashplayer/'>Adobe Flash Player</a> and try again", code: -6001});
				} else if(e.code == 3 && CloudHelpers.isMobile()) {
					//self._showerror(CloudReturnCode.ERROR_COULD_NOT_DECODE_STREAM_OR_COULD_NOT_SET_COOKIE_HLS);
					self._showConsoleError(CloudReturnCode.ERROR_COULD_NOT_DECODE_STREAM_OR_COULD_NOT_SET_COOKIE_HLS);
				} else {
					//self._showerror({name: "VIDEOJS_ERROR", text: "Code " + e.code + ": " + e.message, code: -6000});
					self._showConsoleError({name: "VIDEOJS_ERROR", text: "Code " + e.code + ": " + e.message, code: -6000});
				}
			} else {
				//self._showerror({name: "VIDEOJS_ERROR", text: "Code " + e.code + ": " + e.message, code: -6000});
				self._showConsoleError({name: "VIDEOJS_ERROR", text: "Code " + e.code + ": " + e.message, code: -6000});
			}
		}
		self.stop("by_vjs_error");
		self.play();
	});

	var mPlaybackPlayer1 = null;
	var mPlaybackPlayer2 = null;

	if (mEnablePlaybackNative) {
		mPlaybackPlayer1 = new CloudPlayerNativeVideo(elid + '_nv1');
		mPlaybackPlayer2 = new CloudPlayerNativeVideo(elid + '_nv2');
	} else {
		mPlaybackPlayer1 = self.vjs;
		mPlaybackPlayer2 = self.vjs2;
	}

	var mUniqPlay = null;
	// poling time
	self.time = 0;

	var el_player = self.player;//document.querySelector('.cloudplayer');
	var el_controls = self.player.getElementsByClassName('cloudplayer-controls')[0];
	var el_volume = self.player.getElementsByClassName('cloudplayer-volume')[0];
	var el_controls_zoom_container = self.player.getElementsByClassName('cloudplayer-controls-zoom-container')[0];
	var el_controls_zoom = self.player.getElementsByClassName('cloudplayer-controls-zoom')[0];
	var el_controls_zoom_position = self.player.getElementsByClassName('cloudplayer-controls-zoom-position')[0];
	var el_controls_container = self.player.getElementsByClassName('cloudplayer-controls-container')[0];
	var el_controls_zoom_switcher = self.player.getElementsByClassName('cloudplayer-show-zoom')[0];
	var el_controls_ptz_switcher = self.player.getElementsByClassName('cloudplayer-show-ptz')[0];
	var el_controls_ptz_container = self.player.getElementsByClassName('cloudplayer-ptz')[0];
	var mElementPlay = self.player.getElementsByClassName('cloudplayer-play')[0];
	var el_info = self.player.getElementsByClassName('cloudplayer-info')[0];
	var el_stop = self.player.getElementsByClassName('cloudplayer-stop')[0];
	var el_loader = self.player.getElementsByClassName('cloudplayer-loader')[0];
	var mElError = self.player.getElementsByClassName('cloudplayer-error')[0];
	var mElErrorText = self.player.getElementsByClassName('cloudplayer-error-text')[0];
	var el_player_time = self.player.getElementsByClassName('cloudplayer-time')[0];
	var mElBigPlayButton = self.player.getElementsByClassName('cloudplayer-big-play-button')[0];
	mWebRTC_el = self.player.getElementsByClassName('cloudplayer-webrtc')[0];
	mNativeHLS_el = self.player.getElementsByClassName('cloudplayer-native-hls')[0];
	mNativeVideo1_el = document.getElementById(elid + '_nv1');
	mNativeVideo2_el = document.getElementById(elid + '_nv2');
	var mElPlrType = self.player.getElementsByClassName('cloudplayer-info-playertype')[0];
	var mElSettingsOpen = self.player.getElementsByClassName('cloudplayer-settings')[0];
	var mElSettingsClose = self.player.getElementsByClassName('cloudplayer-info-close')[0];

	var mElSettings_back_buttons = self.player.querySelectorAll('.cloudplayer-info-title .back');
	var mElSettings_format_container = self.player.getElementsByClassName('cloudplayer-info-player-mode')[0];
	var mElSettings_speed_container = self.player.querySelector('.cloudplayer-info-player-speed');
	var mElSettings_selected_format_container = self.player.getElementsByClassName('selected-format')[0];
	var mElSettings_selected_speed_container = self.player.querySelector('.cloudplayer-info-player-speed.enabled .selected-speed');
	var mElSettings_selected_dewarping_container = self.player.querySelector('.cloudplayer-info-player-dewarping.enabled .selected-dewarping');
	var mElSettings_wantWebRTC = self.player.getElementsByClassName('cloudplayer-webrtc-mode')[0];
	var mElSettings_wantFlash = self.player.getElementsByClassName('cloudplayer-flash-mode')[0];
	var mElSettings_wantHTML5 = self.player.getElementsByClassName('cloudplayer-html5-mode')[0];
	var mElementCalendar = self.player.getElementsByClassName('cloudcameracalendar-content')[0];
	var mElementCalendarButton = self.player.getElementsByClassName('cloudplayer-calendar-container')[0];

	var el_controls_ptz_left = self.player.getElementsByClassName('ptz-left')[0];
	var el_controls_ptz_right = self.player.getElementsByClassName('ptz-right')[0];
	var el_controls_ptz_up = self.player.getElementsByClassName('ptz-top')[0];
	var el_controls_ptz_down = self.player.getElementsByClassName('ptz-bottom')[0];
	var el_controls_ptz_zoomin = self.player.getElementsByClassName('ptz-zoom-plus')[0];	
	var el_controls_ptz_zoomout = self.player.getElementsByClassName('ptz-zoom-minus')[0];	
	
	var el_calendar_container = self.player.getElementsByClassName('cloudplayer-calendar-container')[0];
	var el_live_container = self.player.getElementsByClassName('cloudplayer-live-container')[0];

	var mElSettings_speed_mode = self.player.querySelectorAll('.cloudplayer-speed-mode');
	var mElSettings_dewarping_mode = self.player.querySelectorAll('.cloudplayer-dewarping-mode');

	for (var speed = mElSettings_speed_mode.length - 1; speed >= 0; speed--) {
		mElSettings_speed_mode[speed].onclick = selectSpeed;
	}

	for (var dewarping = mElSettings_dewarping_mode.length - 1; dewarping >= 0; dewarping--) {
		mElSettings_dewarping_mode[dewarping].onclick = selectDewarping;
	}

	
	if(typeof rangeSlider !== "undefined") {
	    rangeSlider.create(el_volume);
	}

	var selector = '[data-rangeSlider]',
		elements = document.querySelectorAll(selector);

	function valueOutput(element) {
		var value = element.value,
			output = element.parentNode.getElementsByTagName('output')[0];
		output.innerHTML = value+'%';
	}

	for (var i = elements.length - 1; i >= 0; i--) {
		valueOutput(elements[i]);
	}

	function selectSpeed(){
		for (var el = mElSettings_speed_mode.length - 1; el >= 0; el--) {
			mElSettings_speed_mode[el].classList.remove('selected');
		}

		this.classList.add('selected');
		mElSettings_selected_speed_container.textContent = this.textContent;
		_applySpeed(this.dataset.speed);
	}

	function selectDewarping(){
		for (var el = mElSettings_dewarping_mode.length - 1; el >= 0; el--) {
			mElSettings_dewarping_mode[el].classList.remove('selected');
		}

		this.classList.add('selected');
		mElSettings_selected_dewarping_container.textContent = this.textContent;
		_applyDewarping(this.dataset.dewarping);
	}

	Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function (el) {
		el.addEventListener('input', function (e) {
			valueOutput(e.target);
		}, false);
	});

	for(i=0; i<mElSettings_back_buttons.length; i++){
		mElSettings_back_buttons[i].onclick = function(){
			
			el_player.classList.remove('showing-format-selection');
			el_player.classList.remove('showing-dewarping-selection');
			el_player.classList.remove('showing-speed-selection');
			
		}
	}

	function _applyDewarping(dewarping)
	{
		if (dewarping == 1)
			self.pano.start();
		else
			self.pano.stop();	
	}

	function _applySpeed(speed){
		var p = document.getElementById(player.playerElementID).getElementsByClassName('cloudplayer-native-video');
		for (var i=0;i<p.length;i++)
			p[i].defaultPlaybackRate=p[i].playbackRate=speed;
	}

	function _hideerror(){
		mElError.style.display = "none";
		mElErrorText.style.display = "none";
	}

	function _isShowedError() {
		return mElError.style.display == "block";
	}

	function _showloading(){
		if(self.mShowedBigPlayButton == true){
			_hideloading();
		} else if(!mShowedLoading){
			el_loader.style.display = "inline-block";
			mShowedLoading = true;
		}
	}

	function _hideloading(){
		if(mShowedLoading){
			el_loader.style.display = "none";
			mShowedLoading = false;
		}
	}
	
	/* settings */

	self.onDocumentClick = function(event) {
		var isClickInside = el_info.contains(event.target) || mElSettingsOpen == event.target || mElSettingsOpen.contains(event.target) ||
			mElementCalendar == event.target || mElementCalendar.contains(event.target) ||
			el_controls_zoom_switcher == event.target || el_controls_zoom_switcher.contains(event.target) ||
			el_controls_zoom_container == event.target || el_controls_zoom_container.contains(event.target) ||
                        mElementCalendarButton == event.target || mElementCalendarButton.contains(event.target);

		if (!isClickInside) {
			self.player.classList.remove('showing-zoom', 'showing-settings');
			if(self.calendar){
				self.calendar.hideCalendar();
				var el_timelineCalendar = self.player
					.getElementsByClassName('cloudcameratimeline-calendar')[0];
				if (el_timelineCalendar) el_timelineCalendar.classList.remove("shadowed");
			}
		}
	};
	document.addEventListener('click', self.onDocumentClick);
	
	mElSettingsOpen.onclick = function(){
		self.player.classList.toggle('showing-settings');
		self.player.classList.remove('showing-zoom');
		if(self.calendar){
			self.calendar.hideCalendar();
			var el_timelineCalendar = self.player
				.getElementsByClassName('cloudcameratimeline-calendar')[0];
			if (el_timelineCalendar) el_timelineCalendar.classList.remove("shadowed");
		}
	};

	mElSettings_selected_format_container.onclick = function(){
		el_player.classList.toggle('showing-format-selection');
	};

	mElSettings_selected_speed_container.onclick = function () {
		el_player.classList.toggle('showing-speed-selection');
	};

	mElSettings_selected_dewarping_container.onclick = function () {
		el_player.classList.toggle('showing-dewarping-selection');
	}

	// mElSettingsClose.onclick = function(){
	// 	el_info.style.display = 'none';
	// }

	el_controls_ptz_left.onmousedown = function(){
	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"left",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('shifted to left');	
	    }).fail(function(r){
		console.error(r);
	    });
	}

	el_controls_ptz_right.onmousedown = function(){
	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"right",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('shifted to right');	
	    }).fail(function(r){
		console.error(r);
	    });
	}
	
	el_controls_ptz_up.onmousedown = function(){
    	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"top",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('shifted to up');	
	    }).fail(function(r){
		console.error(r);
	    });
	}

	el_controls_ptz_down.onmousedown = function(){
	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"bottom",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('shifted to down');	
	    }).fail(function(r){
		console.error(r);
	    });
	}

	el_controls_ptz_zoomin.onmousedown = function(){
	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"zoom_in",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('Zoomed in');	
	    }).fail(function(r){
		console.error(r);
	    });
	}

	el_controls_ptz_zoomout.onmousedown = function(){
	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"zoom_out",
		"timeout": 10000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('Zoomed out');	
	    }).fail(function(r){
		console.error(r);
	    });
	}

	el_controls_ptz_zoomin.onmouseup =
	el_controls_ptz_zoomout.onmouseup =	
	el_controls_ptz_left.onmouseup =
	el_controls_ptz_right.onmouseup =
	el_controls_ptz_up.onmouseup =	
	el_controls_ptz_down.onmouseup = function(){
    	    var api = mConn._getAPI()
	    if (api == null) {
		return;
	    }
	    var data = {
		"action":"stop",
		"timeout": 1000
	    }
	    api.cameraPtzExecute(self.mSrc.getID(), data).done(function(r){
		console.log('stop move');	
	    }).fail(function(r){
		console.error(r);
	    });
	}


	el_controls_zoom_switcher.onclick = function(){
		self.player.classList.toggle('showing-zoom');
		self.player.classList.remove('showing-settings');
		if(self.calendar){
			self.calendar.hideCalendar();
			var el_timelineCalendar = self.player
				.getElementsByClassName('cloudcameratimeline-calendar')[0];
			if (el_timelineCalendar) el_timelineCalendar.classList.remove("shadowed");
		}
	};

	el_controls_ptz_switcher.onclick = function(){
		el_player.classList.toggle('showing-ptz');
	};

	mElSettings_wantWebRTC.onclick = function(){
		self.setPlayerFormat('webrtc');
		self.play();
	}
	mElSettings_wantFlash.onclick = function(){
		self.setPlayerFormat('flash');
		self.play();
	}
	mElSettings_wantHTML5.onclick = function(){
		self.setPlayerFormat('html5');
		self.play();
	}

	//mElSettings_circular_fisheye_on.onclick = function(){
	//	mElSettings_circular_fisheye_on.classList.add('selected');
	//	mElSettings_circular_fisheye_off.classList.remove('selected');
	//	self.pano.start();
	//}
	//mElSettings_circular_fisheye_off.onclick = function(){
	//	mElSettings_circular_fisheye_off.classList.add('selected');
	//	mElSettings_circular_fisheye_on.classList.remove('selected');
	//	self.pano.stop();
	//}


	if(CloudHelpers.isMobile()){
		mElSettings_wantFlash.style.display = 'none';
	}

	function _updatePlayerFormatUI(live_urls) {
		live_urls = live_urls || {};
		mElSettings_wantWebRTC.style.display = (live_urls.rtc || live_urls.webrtc) ? '' : 'none';
		mElSettings_wantFlash.style.display = (!CloudHelpers.isMobile() && live_urls.rtmp) ? '' : 'none';
		mElSettings_wantHTML5.style.display = (live_urls.hls) ? '' : 'none';

		// UI
		mElSettings_wantWebRTC.classList.remove('selected');
		mElSettings_wantFlash.classList.remove('selected');
		mElSettings_wantHTML5.classList.remove('selected');

		if(self.mPlayerFormat == 'webrtc'){
			mElSettings_wantWebRTC.classList.add('selected');
			mElSettings_selected_format_container.textContent = mElSettings_wantWebRTC.textContent;
		}else if(self.mPlayerFormat == 'flash'){
			mElSettings_wantFlash.classList.add('selected');
			mElSettings_selected_format_container.textContent = mElSettings_wantFlash.textContent;
		}else if(self.mPlayerFormat == 'html5'){
			mElSettings_wantHTML5.classList.add('selected');
			mElSettings_selected_format_container.textContent = mElSettings_wantHTML5.textContent;
		}
	}
	
	_updatePlayerFormatUI();

	/* element for black screen */
	
	var mElementPlayerBlackScreen = self.player.getElementsByClassName('cloudplayer-black-screen')[0];
	function _showBlackScreen(){
		if(CloudHelpers.isFireFox()){
			console.warn("in firefox not good solution for a hiding adobe flash player");
		}else{
			mElementPlayerBlackScreen.style.display = "block";
		}
	}

	function showPTZButton(button_element, state){
		button_element.style.display = state;
	}

	function _hideBlackScreen(){
		mElementPlayerBlackScreen.style.display = "";
	}

	_hideloading();

	self._showerror = function(err){
		console.error(err);
		self._setError(err);
		self.showErrorText(err.text);
		console.error(err.text);
		mCallbacks.executeCallbacks(CloudPlayerEvent.ERROR, err);
	}
	self._showConsoleError = function(err) {
		console.error(err);
		console.error(err.text);
	}
	/*
	 * Poling time Start/Stop 
	 * */
	
	var _timeWaitStartStreamMax = 30;
	var _timeWaitStreamMax = 15; // if video stopped and wait for restart
	
	var _source_type = null;
	
	function _formatTimeMS(t){
		var t_ = t;
		var sec = t % 60;
		t = (t - sec)/60;
		var min = t % 60;
		// t = (t - min)/60;
		return ("00" + min).slice(-2) + ":" + ("00" + sec).slice(-2);
	}
		
	function _formatTimeLive(){
		var offset = 0;
		if (self.mSrc.type == 'camera' && self.m.useTimezone) {
			offset = CloudHelpers.getOffsetTimezone(self.m.useTimezone);
		} else if(self.mSrc.type == 'camera'){
			offset = CloudHelpers.getOffsetTimezone(self.mSrc.getTimezone());
		}

		var now = new Date();
		now.setTime(now.getTime() + offset);
		var hours = now.getUTCHours();
		var suffix = '';
		if (self.options['timelineampm']) {
			suffix = hours>=12 ? ' pm' : ' am';
			hours = hours==0 ? 12 : (hours>12 ? hours-12 : hours);
		}
		var res = ""
			+ " " + ("0000" + now.getUTCFullYear()).slice(-4)
			+ "-" + ("00" + (now.getUTCMonth() + 1)).slice(-2)
			+ "-" + ("00" + now.getUTCDate()).slice(-2)
			+ " " + ("00" + hours).slice(-2)
			+ ":" + ("00" + now.getUTCMinutes()).slice(-2)
			+ ":" + ("00" + now.getUTCSeconds()).slice(-2) + suffix;
		return res;
	}
	
	function _formatTimeCameraRecords(t){
		var offset = 0;
		if (self.mSrc.type == 'camera' && self.m.useTimezone) {
			offset = CloudHelpers.getOffsetTimezone(self.m.useTimezone);
		} else if(self.mSrc.type == 'camera'){
			offset = CloudHelpers.getOffsetTimezone(self.mSrc.getTimezone());
		}
		var now = new Date();
		now.setTime(t + offset);
		var hours = now.getUTCHours();
		var suffix = '';
		if (self.options['timelineampm']) {
			suffix = hours>=12 ? ' pm' : ' am';
			hours = hours==0 ? 12 : (hours>12 ? hours-12 : hours);
		}
		var res = ""
			+ " " + ("0000" + now.getUTCFullYear()).slice(-4)
			+ "-" + ("00" + (now.getUTCMonth() + 1)).slice(-2)
			+ "-" + ("00" + now.getUTCDate()).slice(-2)
			+ " " + ("00" + hours).slice(-2)
			+ ":" + ("00" + now.getUTCMinutes()).slice(-2)
			+ ":" + ("00" + now.getUTCSeconds()).slice(-2) + suffix;
		return res;
	}
	
	function _calculateTime(){
		if(mPosition != -1){
			if (mEnablePlaybackNative) {
				return Math.floor(mCurrentPlayRecord.startUTC + mPlaybackPlayer1.currentTime()*1000);
			}
			return mCurrentPlayRecord.startUTC + self.vjs.currentTime()*1000;
		}
		return Math.floor(self.vjs.currentTime());
	}
	
	function _checkAndFixVideoSize(){
		
		var h = self.vjs.videoHeight();
		var w = self.vjs.videoWidth();
		
		if(mVideoSizeLive.w != w || mVideoSizeLive.h != h){
			// console.log("_checkAndFixVideoSize");
			// console.log("video h = " + h + ", w = " + w);

			// fix resizing
			setTimeout(function(){
				var el = self.vjs.el();
				if (!el){
				    return;
				}
				var o = el.getElementsByTagName('object')[0];
				if(o){
					o.style['width'] = "calc(100% - 5px)";
					setTimeout(function(){
						o.style['width'] = "";
					},1000);
				}
			},1000);

			mVideoSizeLive.w = w;
			mVideoSizeLive.h = h;
		}
	}
	
	function _stopPolingTime(){
		clearInterval(mCurrentTimeInterval);
		el_player_time.innerHTML = "";
	}
	
	function _startPolingTime(){
		console.warn("[PLAYER] Start poling player time");
		clearInterval(mCurrentTimeInterval);

		mCurrentTimeInterval = setInterval(function(){
			if(mPlaying && !mStopped){
				var curr_time = 0;
				if(_source_type == 'camera_records') {
					curr_time = mCurrentPlayRecord.startUTC + mCurrentRecord_vjs.currentTime()*1000;
				} else if(_source_type == 'camera_live') {
					// TODO webrtc
					if (mUsedPlayer == 'webrtc0' || mUsedPlayer == 'webrtc2') {
						curr_time = mWebRTC_el ? mWebRTC_el.currentTime : 0;
					} else if (mUsedPlayer == 'native-hls') {
						curr_time = mNativeHLS_el ? mNativeHLS_el.currentTime : 0;
					} else {
						try {
							curr_time = self.vjs.currentTime()*1000 
						} catch (e) {
							console.error("Ignore: ", e);
						}
						try {
							_checkAndFixVideoSize();
						} catch(e) { 
							// silent exception
						}
					}
				} else {
					try {
						curr_time = self.vjs.currentTime()*1000;
					} catch (e) {
						console.error("Ignore: ", e);
					}
				}
				if (curr_time == self.time) {
					_showloading();
					mTimeWaitStartStream++;
					if ( self.time == 0 && mTimeWaitStartStream > _timeWaitStartStreamMax) {
						self.stop("by_poling_time_1");
						// self.callOnStateChange(vxgcloudplayer.states.PLAYER_STOPPED);
						if (self.mPlayerFormat === 'webrtc') {
						    self.stop("by_setError");
						    self.play();
						} else {
						    self.count_ERROR_STREAM_UNREACHABLE = (self.count_ERROR_STREAM_UNREACHABLE|0)+1;
						    if (self.count_ERROR_STREAM_UNREACHABLE>3){
							    self._showerror(CloudReturnCode.ERROR_STREAM_UNREACHABLE);
								self.count_ERROR_STREAM_UNREACHABLE=0;
						    } else {
							    console.warn("[PLAYER] stream unreachable: restart count" + self.count_ERROR_STREAM_UNREACHABLE);
							    self.stop("by_setError");
							    self.play();
						    }
						}
					} else if((self.time != 0 && mTimeWaitStartStream > _timeWaitStreamMax)) {
						// restart player
						console.warn("Restart player");
						self.stop("by_poling_time_2");
						// fix if need start in current position
						if (mPosition != -1 && self.time > mPosition) {
							mPosition = Math.floor(self.time);
						}
						self.play();
					} else {
						console.warn("[PLAYER] Wait stream " + mTimeWaitStartStream);
					}
				} else {
					self.count_ERROR_STREAM_UNREACHABLE = 0;
					mTimeWaitStartStream = 0;
					self.mShowedBigPlayButton == false;
					mElBigPlayButton.style.display = "none";
					
					if (_source_type == 'camera_records') {
						self.time = curr_time;
						mPosition = self.time; // remember last success position
						el_player_time.innerHTML = _formatTimeCameraRecords(self.time);
					} else if (_source_type == 'camera_live') {
						self.time = curr_time;
						el_player_time.innerHTML = _formatTimeLive();
						if(self.isRange() && CloudHelpers.getCurrentTimeUTC() > mRangeMax){
							_stopPolingTime();
							self.stop("by_ended_timerange2");
							mCallbacks.executeCallbacks(CloudPlayerEvent.RANGE_ENDED, {});
						}
					} else {
						if(mPosition == -1){
							self.time = self.vjs.currentTime()*1000;
						}else{
							self.time = mCurrentPlayRecord.startUTC + self.vjs.currentTime()*1000;
						}
						el_player_time.innerHTML = _formatTimeLive();
						// self.callOnStateChange(vxgcloudplayer.states.PLAYER_PLAYING);
					}

					_hideloading();
					_hideerror();
				}
				if(self.isRange() && self.time > mRangeMax){
					mPosition = mRangeMin;
					_stopPolingTime();
					self.stop("by_ended_timerange");
					mCallbacks.executeCallbacks(CloudPlayerEvent.RANGE_ENDED, {});
				}
				// el_player_time.innerHTML = _calculateTime();
			}else{
				_hideloading();
				el_player_time.innerHTML = "";
			}
		},1000);
	}

	function _prepareNextCameraRecord(){
		if(mCurrentPlayRecord != null){
			var _currEnd = mCurrentPlayRecord.endUTC;
			var start = CloudHelpers.formatUTCTime(_currEnd - CloudHelpers.ONE_SECOND*5);
			mNextPlayRecord = null;
			if(self.isRange() && start > mRangeMax){
				return;
			}
			if (mConn._getAPI() == null) {
				return;
			}
			mConn._getAPI().storageRecordsFirst(self.mSrc.getID(), start, 3).done(function(r){
				if (r.meta.total_count == 0) {
					mNextPlayRecord = null;
				} else {
					// console.log(r.objects);
					var len = r.objects.length;
					for (var i = 0; i < len; i++) {
						var nextRec = r.objects[i];
						if (nextRec.size < 500) {
							console.error("mNextPlayRecord less than 500 bytes, skip ", nextRec)
							continue;
						}

						nextRec.startUTC = CloudHelpers.parseUTCTime(nextRec.start);
						nextRec.endUTC = CloudHelpers.parseUTCTime(nextRec.end);
						if (nextRec.endUTC > _currEnd && nextRec.startUTC < _currEnd) {
							console.warn("[CloudPlayer] found trashold segment in " + (nextRec.startUTC - _currEnd) + " ms, segment", nextRec);
						}

						if (nextRec.startUTC >= (_currEnd - mTrasholdPlayback) && mNextPlayRecord == null) {
							mNextPlayRecord = r.objects[i];
							// console.log("mNextPlayRecord: ", mNextPlayRecord);
							var _url = mNextPlayRecord.url;
							if (_url.indexOf('http://') == 0) {
								_url = _url.replace("http://", (location.protocol=="file:"?"http:":location.protocol) + "//");
							}
							mNextRecord_vjs.reset()
							mNextRecord_vjs.src([{src: _url, type: 'video/mp4'}])
							mNextRecord_vjs.off('loadeddata');
							mNextRecord_vjs.on('loadeddata', function(){
								mNextRecord_vjs.pause();
							});
							break;
						}
					}
				}
			});
		}else{
			mNextPlayRecord = null;
		}
	}

	function _loadCameraRecords(_uniqPlay){
		if(self.mSrc.type != 'camera'){
			self._showerror(CloudReturnCode.ERROR_INVALID_SOURCE);
			return;
		}
		if(self.updateAudioCaps){
			self.updateAudioCaps(self.mSrc.getID());
		}
		_updatePlayerFormatUI();
		_source_type = 'camera_records';
		var pos = mPosition;
		var start = CloudHelpers.formatUTCTime(pos - CloudHelpers.ONE_MINUTE*2);
		var nLimit = 25;
		if (mConn._getAPI() == null) {
			return;
		}
		mConn._getAPI().storageRecordsFirst(self.mSrc.getID(), start, nLimit).done(function(r){
			if(_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [[_loadCameraRecords fail]]");
				return;
			}
			// console.log(r);
			var len = r.objects.length;
			mCurrentPlayRecord = null;
			var firstRecordAfterT = null;
			// console.log("pos = " + pos);
			// console.log("start - 2 min = " + start);
			_hideBlackScreen();
			var nCountAfterT = 0;
			for(var i = 0; i < len; i++){
				rec = r.objects[i];
				if (rec.size < 500) {
					console.error("Record less than 500 bytes will be skip ", rec);
					continue;
				}

				rec.startUTC = CloudHelpers.parseUTCTime(rec.start);
				rec.endUTC = CloudHelpers.parseUTCTime(rec.end);
				// console.log("rec = ", rec);
				// console.log("pos = ", pos);
				// console.log("pos = ", pos);

				if (firstRecordAfterT == null && rec.startUTC > pos) {
					firstRecordAfterT = rec;
					console.log("firstRecordAfterT selected ", firstRecordAfterT);
				}

				if (rec.startUTC > pos) {
					nCountAfterT++;
				}
				if (pos > rec.endUTC || pos < rec.startUTC) {
					continue;
				}
				// console.log("rec2: ", rec);
				
				if(mCurrentPlayRecord == null && pos >= rec.startUTC && pos <= rec.endUTC){
					mCurrentPlayRecord = rec;
                    // console.log("mCurrentPlayRecord selected ", mCurrentPlayRecord);
					break;
				}

				if (self.isRange()) {
					if (rec.startUTC > mRangeMax) {
						break;
					}
					// console.log("rec2: ", rec);
					if (mCurrentPlayRecord == null && pos < rec.startUTC && rec.startUTC < mRangeMax) {
						mCurrentPlayRecord = rec;
						pos = rec.startUTC;
						break;
					}
				}
			}

			// move to first close record
			var bSendEventPositionJumped = false;
			if(mCurrentPlayRecord == null && firstRecordAfterT != null){
				// need callback to timeline moveto
				if (!self.isRange() || (self.isRange() && firstRecordAfterT.startUTC < mRangeMax)) {
					mCurrentPlayRecord = firstRecordAfterT;
					pos = firstRecordAfterT.startUTC;
					bSendEventPositionJumped = true;	
				}
			}

			// console.log("mCurrentPlayRecord selected2 ", mCurrentPlayRecord);

			/*if(self.isRange() && mCurrentPlayRecord == null){
				for(var i = 0; i < len; i++){
					rec = r.objects[i];
					rec.startUTC = CloudHelpers.parseUTCTime(rec.start);
					rec.endUTC = CloudHelpers.parseUTCTime(rec.end);
					if (rec.startUTC > mRangeMax) {
						break;
					}
					// console.log("rec2: ", rec);
					if(mCurrentPlayRecord == null && pos < rec.startUTC && rec.startUTC < mRangeMax){
						mCurrentPlayRecord = rec;
						pos = rec.startUTC;
						break;
					}
				}
			}*/

			// move to live if records not found
			if (!self.isRange() && mCurrentPlayRecord == null && nCountAfterT == 0) {
				setTimeout( function() {
					self.setPosition(CloudPlayer.POSITION_LIVE);
					self.play();
					mCallbacks.executeCallbacks(CloudPlayerEvent.POSITION_JUMPED, { new_pos: CloudHelpers.getCurrentTimeUTC() });
				},10);
				return;
			}

			if (mCurrentPlayRecord == null) {
				_hideloading();
				self._showerror(CloudReturnCode.ERROR_RECORDS_NOT_FOUND);
				_stopPolingTime();
				return;
			}
			
			if (_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [[_loadCameraRecords fail]]");
				return;
			}

			if (self.isRange() && pos > mRangeMax) {
				_hideloading();
				_stopPolingTime();
				self.stop("by_ended_time_range_2");
				mCallbacks.executeCallbacks(CloudPlayerEvent.RANGE_ENDED, {});
				return;
			}

			if (bSendEventPositionJumped) {
				self.time = pos;
				mCallbacks.executeCallbacks(CloudPlayerEvent.POSITION_JUMPED, {new_pos: pos});
			}

			// 
			mCurrentRecord_vjs = mPlaybackPlayer1;
			mNextRecord_vjs = mPlaybackPlayer2;
		
			if (mEnablePlaybackNative) {
				mCurrentRecord_vjs.el().style.display = "block";
				mNextRecord_vjs.el().style.display = "none";
				self.vjs.el().style.display = "none";
				mCurrentRecord_vjs.onAutoplayBlocked = self.playbackAutoplayBlocked;
			} else {
				mCurrentRecord_vjs.el().style.display = "";
				mNextRecord_vjs.el().style.display = "none";
			}

			// console.log("mCurrentPlayRecord: ", mCurrentPlayRecord);
			_prepareNextCameraRecord();

			mCurrentRecord_vjs.off('loadeddata');
			mCurrentRecord_vjs.ready(function() {
				var _url = mCurrentPlayRecord.url;
				if (_url.indexOf('http://') == 0) {
					_url = _url.replace("http://", (location.protocol=="file:"?"http:":location.protocol) + "//");
				}
				mCurrentRecord_vjs.src([{src: _url, type: 'video/mp4'}]);
				var stime =  pos - mCurrentPlayRecord.startUTC;
				var len_time = mCurrentPlayRecord.endUTC - mCurrentPlayRecord.startUTC;
				console.log(mCurrentPlayRecord);
				console.log("mCurrentRecord_vjs: " +  stime + " / " + len_time);
				mCurrentRecord_vjs.currentTime(Math.floor(stime/1000));
				mCurrentRecord_vjs.play();
			});

			// vxgcloudplayer.vjs_play(vcp);
			mCurrentRecord_vjs.off('ended');
			mNextRecord_vjs.off('ended');
			function swithPlayers() {
				console.warn("ended");
				// stop records
				if(self.isRange() && mNextPlayRecord == null){
					console.warn("stop player");
					_hideloading();
					_stopPolingTime();
					self.stop("by_ended_time_range_3");
					mCallbacks.executeCallbacks(CloudPlayerEvent.RANGE_ENDED, {});
					return;
				}
				
				if (mNextPlayRecord != null) {
					var t = mCurrentRecord_vjs;
					mCurrentRecord_vjs = mNextRecord_vjs;
					mNextRecord_vjs = t;
					
					if (mEnablePlaybackNative) {
						mCurrentRecord_vjs.el().style.display = "block";
						mNextRecord_vjs.el().style.display = "none";
						self.vjs.el().style.display = "none";
					} else {
						mCurrentRecord_vjs.el().style.display = "";
						mNextRecord_vjs.el().style.display = "none";
					}

					mCurrentPlayRecord = mNextPlayRecord;
					mNextPlayRecord = null;
					// console.warn("url: " + mCurrentPlayRecord.url);
					mCurrentRecord_vjs.ready(function(){ mCurrentRecord_vjs.play(); });
					_prepareNextCameraRecord();
				}
			}

			mCurrentRecord_vjs.on('ended', swithPlayers);
			mNextRecord_vjs.on('ended', swithPlayers);

			_startPolingTime();
		});
	}

	function _loadRecords(_uniqPlay){
		if(!self.mSrc){
			self._showerror(CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED);
			return;
		}
		mTimeWaitStartStream = 0;
		if(self.mSrc.type == 'camera'){
			_loadCameraRecords(_uniqPlay);
		}else{
			self._showerror(CloudReturnCode.ERROR_INVALID_SOURCE);
		}
	}

	// function _loadCameraStatus(_uniqPlay){
	// }

	function _loadLiveUrl(_uniqPlay){
		if(_uniqPlay != mUniqPlay) {
			console.warn("_uniqPlay not current [cameraLiveUrls fail]");
			return;
		}

		if(!self.mSrc){
			console.error("[CloudPlayer] source not set");
			self.setError(100);
			return;
		}

		if(self.mSrc._origJson()['status'] != 'active'){
			if (self.m.waitSourceActivation == 0){
				self._showerror(CloudReturnCode.ERROR_CAMERA_OFFLINE);
				mCallbacks.executeCallbacks(CloudPlayerEvent.CHANNEL_STATUS, {status: "offline"});
			}
			_startPolingCameraStatus(_uniqPlay);
			return;
		}

		mTimeWaitStartStream = 0;
		if(self.mSrc.type == 'camera'){
			// start 
			_startPolingCameraStatus(_uniqPlay);
			self._polingLoadCameraLiveUrl(_uniqPlay);
		} else {
			console.error("[CloudPlayer] invalid source");
			self.setError(100);
		}
	}

	/*
	 * Public functions
	 * */
	self.showErrorText = function(text){
		_hideloading();
		mElError.style.display = "block";
		mElErrorText.style.display = "inline-block";
		mElErrorText.innerHTML = text;
		_hideBlackScreen();
	}

	self.getCalendarContent = function() {
		return mElementCalendar;
	}

	self.setSource = function(src){
		_hideerror();
		clearInterval(mPolingCameraStatus);
		self.mSrc = src;
		if (self.mSrc == null) {
			mElementPlay.style.display = "none";
			mConn = null;
		} else {
			mElementPlay.style.display = "inline-block";
			mConn = src._getConn();
		}
		if(self.isRange()){
			var cur_time = CloudHelpers.getCurrentTimeUTC();
			if (mRangeMin < cur_time && cur_time < mRangeMax) {
				self.setPosition(CloudPlayer.POSITION_LIVE);
			} else {
				self.setPosition(mRangeMin);
			}
		}else{
			self.setPosition(CloudPlayer.POSITION_LIVE);
		}
		mCallbacks.executeCallbacks(CloudPlayerEvent.SOURCE_CHANGED);
		/*binary*/
		var el_player = document.querySelector('.cloudplayer');
		if (!el_player) {
		    return;
		}
		el_player.classList.remove('showing-ptz');
		if (mConn) {
		    var el_controls_ptz_switcher = self.player.getElementsByClassName('cloudplayer-show-ptz')[0];
		    var el_controls_ptz_top = self.player.getElementsByClassName('ptz-top')[0];
		    var el_controls_ptz_bottom = self.player.getElementsByClassName('ptz-bottom')[0];
		    var el_controls_ptz_left = self.player.getElementsByClassName('ptz-left')[0];
		    var el_controls_ptz_right = self.player.getElementsByClassName('ptz-right')[0];
		    var el_controls_ptz_zoom_in = self.player.getElementsByClassName('ptz-zoom-plus')[0];
		    var el_controls_ptz_zoom_out = self.player.getElementsByClassName('ptz-zoom-minus')[0];
                    if (self.mSrc._origJson().access.indexOf('all')<0) el_controls_ptz_switcher.style.display = 'none';
                    else mConn._getAPI().cameraPtz(self.mSrc.getID()).done(function(r){
			console.log(r);
			var actions = r.actions;
			if (actions!== undefined){ 
			    el_controls_ptz_switcher.style.display = 'block';
			    el_controls_ptz_top.style.display = actions.indexOf("top") > -1 ? 'block' : 'none';
			    el_controls_ptz_bottom.style.display = actions.indexOf("bottom") > -1 ? 'block' : 'none';
			    el_controls_ptz_left.style.display = actions.indexOf("left") > -1 ? 'block' : 'none';
			    el_controls_ptz_right.style.display = actions.indexOf("right") > -1 ? 'block' : 'none';
			    el_controls_ptz_zoom_in.style.display = actions.indexOf("zoom_in") > -1 ? 'block' : 'none';
			    el_controls_ptz_zoom_out.style.display = actions.indexOf("zoom_out") > -1 ? 'block' : 'none';
			} else {
			    el_controls_ptz_switcher.style.display = 'none';
			}
		    }).fail(function(r){
			console.log(r);
			el_controls_ptz_switcher.style.display = 'none';
		    });
		}
		/*binary*/		
	}

	self.getSource = function(){
		return self.mSrc
	}

	self.removeCallback = function(uniqname){
		mCallbacks.removeCallback(uniqname);
	}
	
	self.addCallback = function(uniqname, func){
		mCallbacks.addCallback(uniqname, func);
	}

	self.onTimelineEndUpdate = function () {
		if (mPosition == -1 && mStopped && _isShowedError()) {
			console.warn("TODO Restart live if some errors happends");
			self.play();
		}
	}

	self.playbackAutoplayBlocked = function() {
		if (mPosition == -1)  {
			console.warn("Skip error player already in live mode");
			return;
		}
		_stopPolingTime();
		try{mPlaybackPlayer1.pause();}catch(e){console.warn("_vjs_play: skip error", e);}
		mTimeWaitStartStream = 0;
		// TODO show PlayButton
		console.warn('_vjs_play. is mobile or autoplay not allowed. show big button');
		mShowedBigPlayButton = true;
		mElBigPlayButton.style.display = "block";
		mElBigPlayButton.onclick = function(event){
			mEvent = event;
			mElBigPlayButton.style.display = "none";
			var v = mCurrentRecord_vjs.el().getElementsByTagName('video')[0];
			if(v){
				v.setAttribute('webkit-playsinline', true);
				v.setAttribute('playsinline', true);
			}
			mShowedBigPlayButton = false;
			mTimeWaitStartStream = 0;
			mCurrentRecord_vjs.play();
			_stopPolingTime();
			_startPolingTime();
		}
	}

	function _vjs_play_live() {
		console.log("[PLAYER] _vjs_play_live, mEvent: ", mEvent);
		// if(!mEvent && !CloudHelpers.autoPlayAllowed){
		mElBigPlayButton.style.display = "none";
		
		function startVideo() {
			var safari_and_hls = mSafariAndHlsNotStarted == 'pause'; // mUsedPlayer == 'hls' && CloudHelpers.isSafari();
			var is_mobile = CloudHelpers.isIOS() || CloudHelpers.isAndroid();
			var bFrameAndHLS = false;//CloudHelpers.isFrame() && CloudHelpers.useHls();
			var bChromeAndHLS = CloudHelpers.isChrome() && !CloudHelpers.autoPlayAllowed && self.mPlayerFormat == 'html5';
			// CloudHelpers.useHls();
			// console.warn('_vjs_play bFrameAndHLS', bFrameAndHLS);
			// console.warn('_vjs_play CloudHelpers.useHls()', CloudHelpers.useHls());
			// console.warn('_vjs_play CloudHelpers.isFrame()', CloudHelpers.isFrame());
			// console.warn('_vjs_play mEvent', mEvent);

			if (!mEvent && (is_mobile || safari_and_hls || bFrameAndHLS || bChromeAndHLS)) {
				_stopPolingTime();
				try{self.vjs.pause();}catch(e){console.warn("_vjs_play_live: skip error", e);}
				mTimeWaitStartStream = 0;
				// TODO show PlayButton
				console.warn('_vjs_play. is mobile or autoplay not allowed. show big button');
				mShowedBigPlayButton = true;
				mElBigPlayButton.style.display = "block";
				mElBigPlayButton.onclick = function(event){
					mEvent = event;
					mElBigPlayButton.style.display = "none";
					if(document.getElementById('player1_vjs_Html5_api')){
						document.getElementById('player1_vjs_Html5_api').setAttribute('webkit-playsinline', true);
						document.getElementById('player1_vjs_Html5_api').setAttribute('playsinline', true);
					}
					mShowedBigPlayButton = false;
					mTimeWaitStartStream = 0;
					self.vjs.play();
					_stopPolingTime();
					_startPolingTime();
				}
				console.log('vjs_play ');
			}else{
				self.vjs.play();
				_stopPolingTime();
				_startPolingTime();
			}
		}

		if (CloudHelpers.isChrome() && !CloudHelpers.autoPlayAllowed && self.mPlayerFormat == 'html5') {
			// refresh status autoPlayAllowed
			CloudHelpers.checkAutoplay(startVideo);
		} else {
			startVideo();
		}
	}

	self.setPlayerFormat = function(sMode){
		sMode = sMode.toLowerCase();
		if(sMode != 'webrtc' && sMode != 'flash' && sMode != 'html5'){
			console.error("Player format expected 'webrtc' or 'flash' or 'html5'");
			return;
		}
		self.mPlayerFormat = sMode;
		try{localStorage.setItem("preferred_player_format", self.mPlayerFormat);}catch(e){console.error("[CloudPlayer] error save format: ", e)}

		_updatePlayerFormatUI();
	}

	self.getPlayerFormat = function(){
		return sMode;
	}

	self.play = function(event){
		if(mPlaying){
			self.stop("by_play");
		}
		if (self.mSrc.type != 'camera') {
			self._showerror(CloudReturnCode.ERROR_INVALID_SOURCE);
			return;
		}
		mUniqPlay = Math.random();
		mEvent = event;
		console.warn("[PLAYER] mUniqPlay: " + mUniqPlay);
		el_stop.style.display = "inline-block";
		mElementPlay.style.display = "none";
		mStopped = false;
		mPlaying = true;
		_stopPolingTime();
		_startPolingTime();
		self._reset_players();
		_hideerror();
		
		// reset position to start of range
		if (self.isRange() && mPosition == -1 && CloudHelpers.getCurrentTimeUTC() > mRangeMax) {
			mPosition = mRangeMin;
		}

		// reset position to start of range
		if (self.isRange() && mPosition > mRangeMax) {
			mPosition = mRangeMin;
		}

		if(mPosition == -1){
			_loadLiveUrl(mUniqPlay);
			mCallbacks.executeCallbacks(CloudPlayerEvent.POSITION_JUMPED, {new_pos: CloudHelpers.getCurrentTimeUTC()});
		}else{
			console.warn("Try load records from " + CloudHelpers.formatUTCTime(mPosition));
			_loadRecords(mUniqPlay);
		}
		_showloading();
	}
	
	self.setPosition = function(t){
		mPosition = t;
		if(mPosition == CloudHelpers.POSITION_LIVE){
			mLiveModeAutoStart = true;
		} else {
			self.time = t;
		}
	}
	
	// apply option position
	if(options["position"] !== undefined){
		self.setPosition(mPosition);
	}

	self.getPosition = function(){
		if (mPlaying) {
			if (mPosition == -1) {
				if ((mUsedPlayer == 'webrtc0' || mUsedPlayer == 'webrtc2')
					&& mWebRTC_el && mWebRTC_el.currentTime != 0){
					return CloudHelpers.getCurrentTimeUTC() + (mConn ? mConn.getServerTimeDiff() : 0);
				} else if(mUsedPlayer == 'native-hls' && mNativeHLS_el && mNativeHLS_el.currentTime != 0){
					return CloudHelpers.getCurrentTimeUTC() + (mConn ? mConn.getServerTimeDiff() : 0);
				} else if( (mUsedPlayer != 'webrtc0' && mUsedPlayer != 'webrtc2')
					&& self.vjs && self.vjs.currentTime() != 0){
					return CloudHelpers.getCurrentTimeUTC() + (mConn ? mConn.getServerTimeDiff() : 0);
				}
				return 0;
			} else if(self.time == 0) {
				return mPosition;
			}
			return Math.floor(self.time);
		} else {
			// TODO
		}
		return 0;
	}

	self.isLive = function(){
		return mPosition == -1 && !mStopped;
	}

	self.stop = function(who_call_stop){
		console.log("[PLAYER] stop called " + who_call_stop);
		mUniqPlay = null; // stop any async requests or ignore results
		mStopped = true;
		mPlaying = false;
		mLiveModeAutoStart = false;
		
		if ( ((who_call_stop === 'by_webrtc2_error') || (who_call_stop === 'by_webrtc0_error')) || ( (who_call_stop === 'by_setError')&&(self.mPlayerFormat === 'webrtc')) ) {
		    self.mPlayerFormat = 'html5';
		}
		
		console.log("[PLAYER] self.stop: somebody call");
		self._reset_players();
		if (mNativeVideo1_el != null) {
			mNativeVideo1_el.style.display = 'none';
		}

		if (mNativeVideo2_el != null) {
			mNativeVideo2_el.style.display = 'none';
		}

		if(mWebRTC0_Player != null){
			mWebRTC0_Player.stopWS();
			mWebRTC_el.style.display = 'none';
		};

		if(mWebRTC2_Player != null){
			mWebRTC2_Player.stopWS();
			mWebRTC_el.style.display = 'none';
		};

		if (mNativeHLS_Player != null) {
			mNativeHLS_Player.stop();
			mNativeHLS_el.style.display = 'none';
		}	

		el_stop.style.display = "none";
		mElementPlay.style.display = "inline-block";
		_stopPolingTime();
		clearInterval(mExpireHLSTimeInterval);
		self._stopPolingMediaTicket();
		_hideloading();
		// vxgcloudplayer.stopPolingCameraLife();
		// self.stopPolingFlashStats();
		// self.currentRecordsList = undefined;
		// self.currentCamID = 0;
	}

	self.close = function(){
		self.stop("by_close");
		clearInterval(self.currentTime);
		clearInterval(mPolingCameraStatus);
		// TODO stop any context
	}

	self.destroy = function(){
		document.removeEventListener('click', self.onDocumentClick);
		self.stop("by_destroy");
		clearInterval(self.currentTime);
		clearInterval(mPolingCameraStatus);
		self.vjs.dispose();
		self.vjs2.dispose();
		delete window._cloudPlayers[self.elid];
		
		self.player.onwebkitfullscreenchange = null;
		self.player.onmozfullscreenchange = null;
		self.player.onfullscreenchange = null;
		self.player.onfullscreenchange = null;

		if (self.f_callbackFullscreenFunc) {
		    self.f_callbackFullscreenFunc = null;
		}

		// TODO destroy timeline
	}
	
	self.error = function(){
		return self.mLastError || -1;
	}
	
	self.onError = function(callback){
		mCallback_onError = callback;
	}

	self.onChannelStatus = function(callback){
		mCallback_onChannelStatus = callback;
	}

	self._setError = function(error){
		setTimeout(function(){self.stop("by_setError")},10);
		self.mLastError = error;
		if(mCallback_onError){
			mCallbacks.executeCallbacks(CloudPlayerEvent.ERROR, error)
			setTimeout(function(){ mCallback_onError(self, error); },10);
		}
		// vxgcloudplayer.trigger('error', [self, error]);
	}
	
	self.setRange = function(startPos,endPos){
		console.warn("[PLAYER] setRange");
		mRangeMin = startPos;
		mRangeMax = endPos;
		// TODO check
	}

	// apply options
	if (options["range"] !== undefined) {
		var rangeMin = parseInt(options["range"]["min"], 10);
		var rangeMax = parseInt(options["range"]["max"], 10);
		self.setRange(rangeMin, rangeMax);
	}
	
	self.isRange = function(){
		return mRangeMin != -1 && mRangeMax != -1;
	}
	
	self.resetRange = function(){
		console.warn("[PLAYER] resetRange");
		mRangeMin = -1;
		mRangeMax = -1;
	}
	
	/* end public functions */
	function _applyFuncTo(arr, val, func) {
		for (var i in arr) {
			func(arr[i], val);
		}
	}
	function _initZoomControls(){
		self.currentZoom = 0;

		var el_controls_zoom = self.player.getElementsByClassName('cloudplayer-controls-zoom')[0];
		var el_controls_zoom_position = self.player.getElementsByClassName('cloudplayer-controls-zoom-position')[0];
		var el_zoomUp = self.player.getElementsByClassName('cloudplayer-zoom-up')[0];
		var el_zoomDown = self.player.getElementsByClassName('cloudplayer-zoom-down')[0];
		var el_zoomProgress = self.player.getElementsByClassName('cloudplayer-zoom-progress')[0];
		var el_zoomPositionCursor = self.player.getElementsByClassName('cloudplayer-zoom-position-cursor')[0];
		
		var _players = [];
		_players.push(document.getElementById(elid + '_vjs'));
		_players.push(document.getElementById(elid + '_vjs2'));
		_players.push(mNativeVideo1_el);
		_players.push(mNativeVideo2_el);
		_players.push(self.player.getElementsByClassName('cloudplayer-webrtc')[0]);
		
		if(CloudHelpers.isMobile()){
			el_controls_zoom.style.display = 'none';
		}

		self.zoomCursorDownBool = false;
		self.zoomCursorX = 0;
		self.zoomCursorY = 0;
		self.zoomCursorWidth = 176;
		self.zoomCursorHeight = 160;
		self.zoomControlsWidth = 0;
		self.zoomControlsHeight = 0;

		self.setNewZoom = function(v) {
			if(v >= 30){ v = 30; }
			if(v <= 10){ v = 10; }
			
			if (self.currentZoom != v) {
				self.currentZoom = v;
				var _scale_transform = "scale(" + (self.currentZoom/10) + ")";
				_applyFuncTo(_players, _scale_transform, function(plr_el, val) {
					plr_el.style.transform = val;
				});
				el_zoomPositionCursor.style.transform = "scale(" + (10/self.currentZoom) + ")";
				el_zoomProgress.className = el_zoomProgress.className.replace(/zoom\d+x/g,'zoom' + Math.ceil(self.currentZoom) + 'x');
				el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
				el_zoomPositionCursor.style.left = '';
				el_zoomPositionCursor.style.top = '';

				_applyFuncTo(_players, '', function(plr_el, val) {
					plr_el.style.left = val;
					plr_el.style.top = val;
				});
			}
		}

		self.setNewZoom(10);
		
		self.zoomUp = function() {
			self.setNewZoom(self.currentZoom + 5)
		}
		self.zoomDown = function() {
			self.setNewZoom(self.currentZoom - 5);
		}
		self.zoomProgressDownBool = false;
		self.zoomProgressDown = function(e) {
			self.zoomProgressDownBool = true;
		}

		self.zoomProgressMove = function(e){
			if(self.zoomProgressDownBool == true){
				var y = e.pageY - CloudHelpers.getAbsolutePosition(e.currentTarget).y;
				var height = el_zoomProgress.offsetHeight;
				var steps = height/5;
				y = 10*(Math.floor((height-y)/steps)/2 + 1);
				self.setNewZoom(y);				
			}
		}
		self.zoomProgressLeave = function(e){
			self.zoomProgressDownBool = false;
		}
		self.zoomProgressUp = function(e){
			if(self.zoomProgressDownBool == true){
				var y = e.pageY - CloudHelpers.getAbsolutePosition(e.currentTarget).y;
				var height = el_zoomProgress.offsetHeight;
				var steps = height/5;
				y = 10*(Math.floor((height-y)/steps)/2 + 1);
				self.setNewZoom(y);	
			}
			self.zoomProgressDownBool = false;
		}

		self.zoomCursorDown = function(e){
			self.zoomCursorX = e.pageX;
			self.zoomCursorY = e.pageY;
			self.zoomCursorWidth = el_zoomPositionCursor.offsetWidth;
			self.zoomCursorHeight = el_zoomPositionCursor.offsetHeight;
			self.zoomControlsWidth = el_controls_zoom_position.offsetWidth;
			self.zoomControlsHeight = el_controls_zoom_position.offsetHeight;
			self.zoomCursorDownBool = true;
		}
		
		self.zoomCursorUp = function(e){
			console.log("zoomCursorUp");
			self.zoomCursorDownBool = false;
		}
		
		self.zoomCursorMove = function(e){
			if(self.zoomCursorDownBool == true){
				var diffX = self.zoomCursorX - e.pageX;
				var diffY = self.zoomCursorY - e.pageY;
				self.zoomCursorX = e.pageX;
				self.zoomCursorY = e.pageY;
				var newx = el_zoomPositionCursor.offsetLeft - diffX;
				var newy = el_zoomPositionCursor.offsetTop - diffY;
				var d2x = (self.zoomControlsWidth - self.zoomCursorWidth*(10/self.currentZoom));
				var d2y = (self.zoomControlsHeight - self.zoomCursorHeight*(10/self.currentZoom));
				var minX = -1*d2x/2;
				var maxX = d2x/2;
				var minY = -1*d2y/2;
				var maxY = d2y/2;
				if (newx < minX) newx = minX;
				if (newy < minY) newy = minY;
				if (newx >= maxX) newx = maxX;
				if (newy >= maxY) newy = maxY;
				el_zoomPositionCursor.style.left = newx + "px";
				el_zoomPositionCursor.style.top = newy + "px";
				
				
				var zoom = self.currentZoom/10 - 1;
				var left = Math.floor(-100*((newx/d2x)*zoom));
				var top = Math.floor(-100*((newy/d2y)*zoom));
				
				//console.log("<binary> top:" + top + "; left:" + left + ";");
								
				
				var h = self.vjs.videoHeight();
				var w = self.vjs.videoWidth();
				//var top_px = h*top/500;
				//var left_px = w*left/500;
				_applyFuncTo(_players, left + '%' , function(plr_el, val) {
					plr_el.style.left = val;
				});

				
				_applyFuncTo(_players, top  + '%', function(plr_el, val) {
					plr_el.style.top = val;
				});
			}
		}

		el_zoomUp.onclick = self.zoomUp;
		el_zoomDown.onclick = self.zoomDown;
		el_zoomPositionCursor.addEventListener('mousedown',self.zoomCursorDown,false);
		el_zoomPositionCursor.addEventListener('mousemove',self.zoomCursorMove,false);
		el_zoomPositionCursor.addEventListener('mouseleave',self.zoomCursorUp,false);
		el_zoomPositionCursor.addEventListener('mouseup',self.zoomCursorUp,false);
		el_zoomProgress.addEventListener('mousedown',self.zoomProgressDown,false);
		el_zoomProgress.addEventListener('mousemove',self.zoomProgressMove,false);
		el_zoomProgress.addEventListener('mouseleave',self.zoomProgressLeave,false);
		el_zoomProgress.addEventListener('mouseup',self.zoomProgressUp,false);
	}
	_initZoomControls();
	
	/* 
	 * check audio channels
	 * */
	
	self.isAudioChannelExists = function(){
		// console.log("self.mstreams.current = " + self.mstreams.current);
		// console.log("self.mstreams.audio_on = " + self.mstreams.audio_on);
		// return self.mstreams && self.mstreams.current == self.mstreams.audio_on;
		// TODO
		return true;
	}

	self.updateAudioStream = function(){
		el_info_audio_stream.style.display = "none";
		// console.log("api: ", mConn._getAPI());
		mConn._getAPI().cameraMediaStreams(self.currentCamID).done(function(r){
			// console.log("cameraMediaStreams: ", r);
			if(r.mstreams_supported && r.mstreams_supported.length > 1){
				el_info_audio_stream.style.display = "block";
				self.mstreams.audio_on = '';
				self.mstreams.audio_off = '';
				self.mstreams.current = r.live_ms_id;
				for(var i in r.mstreams_supported){
					if(r.mstreams_supported[i].as_id && r.mstreams_supported[i].vs_id){
						self.mstreams.audio_on = r.mstreams_supported[i].id;
					}else if(r.mstreams_supported[i].vs_id){
						self.mstreams.audio_off = r.mstreams_supported[i].id;
					}
				}
				if(self.mstreams.audio_on == self.mstreams.current){
					el_info_audio_stream_on.classList.add("selected");
				}else if(self.mstreams.audio_off == self.mstreams.current){
					el_info_audio_stream_off.classList.add("selected");
				}
			}else{
				el_info_audio_stream.style.display = "none";
			}

			if(!self.isAudioChannelExists()){
				
			}
		}).fail(function(r){
			console.error(r);
			el_info_audio_stream.style.display = "none";
		})
	}
	
	/*
	 * volume controls begin
	 * */

	function _initVolumeControls(){
		var el_volumeMute = self.player.getElementsByClassName('cloudplayer-volume-mute')[0];
		var el_volumeDown = self.player.getElementsByClassName('cloudplayer-volume-down')[0];
		var el_volumeProgress = self.player.getElementsByClassName('cloudplayer-volume-progress')[0];
		var el_volumeUp = self.player.getElementsByClassName('cloudplayer-volume-up')[0];
		var el_volumeContainer = self.player.getElementsByClassName('cloudplayer-volume-container')[0];
		var el_volumeSlider = self.player.getElementsByClassName('cloudplayer-volume')[0];

		self.m = self.m || {};
		self.m.volume = 0.5;
		el_volumeMute.style.display='inline-block';
		if (self.m.mute) {
			el_volumeContainer.style.display='none';
			el_volumeMute.classList.add("unmute");
		} else {
			el_volumeContainer.style.display='flex';
			el_volumeMute.classList.remove("unmute");
		}

		function applyVolumeToPlayers(v) {

		        var muted = (v == 0)? true : false;
			player_native_hls	= document.getElementById(self.elid+"_native_hls");
			player_vjs2		= document.getElementById(self.elid+"_vjs2");
			player_vjs              = document.getElementById(self.elid+"_vjs");
			player_nv1		= document.getElementById(self.elid+"_nv1");
			player_nv2		= document.getElementById(self.elid+"_nv2");
			player_webrtc		= document.getElementById(self.elid+"_webrtc");
	

			if(player_native_hls != null && typeof player_native_hls !== "undefined") player_native_hls.muted = muted;
			if(player_vjs2 != null && typeof player_vjs2       !== "undefined") player_vjs2.muted = muted;
			if(player_vjs != null && typeof player_vjs	     !== "undefined") player_vjs.muted = muted;
			if(player_nv1 != null && typeof player_nv1	     !== "undefined") player_nv1.muted = muted;
			if(player_nv2 != null && typeof player_nv2	     !== "undefined") player_nv2.muted = muted;

			self.vjs.muted(muted);
			self.vjs2.muted(muted);
			self.vjs.volume(v);
			self.vjs2.volume(v);

			mPlaybackPlayer1.volume(v);
			mPlaybackPlayer2.volume(v);
			if (mWebRTC_el != null) {
				if(player_webrtc != null && typeof player_webrtc !== "undefined") player_webrtc.muted = muted;
				mWebRTC_el.volume = v;
			}
		}


		self.mute = function(){
			if (!self.isAudioChannelExists()) {
				return;
			}
			self.m.mute = !self.m.mute;
			if (self.m.mute) {
				el_volumeContainer.style.display='none';
				el_volumeMute.classList.add("unmute");
			} else {
				el_volumeContainer.style.display='flex';
				el_volumeMute.classList.remove("unmute");
			}
			var v = self.m.mute? 0: '' + self.m.volume.toFixed(1);
			applyVolumeToPlayers(v);
		}

		self.volume = function(val){
			if (!self.isAudioChannelExists()) {
				return;
			}
			if (val != undefined) {
				val = val > 1 ? 1 : val;
				val = val < 0 ? 0 : val;
				self.m.volume = Math.ceil(val*10)/10;
				var v = self.m.mute ? 0 : self.m.volume.toFixed(1);
				applyVolumeToPlayers(v);
				el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));
			} else {
				return self.m.volume;
			}
		}

		self.volup = function(){
			if (!self.isAudioChannelExists()) {
				return;
			}
			
			if (Math.round(self.m.volume*10) < 10) {
				self.m.volume = self.m.volume + 0.1;
				var v = self.m.mute ? 0 : self.m.volume.toFixed(1);
				applyVolumeToPlayers(v);
				el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));
			}
		};

		self.voldown = function(){
			if (!self.isAudioChannelExists()) {
				return;
			}
			if (Math.round(self.m.volume*10) > 0) {
				self.m.volume = self.m.volume - 0.1;
				var v = self.m.mute ? 0 : self.m.volume.toFixed(1)
				applyVolumeToPlayers(v);
				el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.floor(self.m.volume*10));
			}
		};
		
		el_volumeMute.onclick = self.mute;
		el_volumeDown.onclick = self.voldown;
		el_volumeUp.onclick = self.volup;
		el_volumeSlider.addEventListener('input', function(event){
			if (!self.player.getElementsByClassName('cloudplayer-volume')[0]) return;
			self.volume(event.target.value/100);
		});

		// init volume
		self.vjs.ready(function(){
			if (!self.isAudioChannelExists()) {
				return
			}

			self.vjs.muted(true);
			self.volume(self.m.volume);	
		});
		
		if (!self.isAudioChannelExists()) {
			el_volumeDown.style.display='none';
			el_volumeProgress.style.display='none';
			el_volumeUp.style.display='none';
			el_volumeMute.style.display='none';
		}
	}
	_initVolumeControls();
	
	// ---- volume controls end ---- 

	function _polingCameraHLSList(live_urls, _uniqPlay){
		if(_uniqPlay != mUniqPlay) {
			console.warn("_uniqPlay not current [_polingCameraHLSList]");
			return;
		}

		var xhr = new XMLHttpRequest();
		xhr.open('GET', live_urls.hls);
		// xhr.withCredentials = false;
		xhr.onload = function() {
			if(_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [_polingCameraHLSList 2]");
				return;
			}
			if(xhr.status === 200){
				if(_uniqPlay != mUniqPlay) return;
				self._applyMediaTiket(live_urls.hls, live_urls.expire);
				// self._startPolingMediaTicket(_uniqPlay);
				// For debug
				// live_urls.hls = live_urls.hls.replace("/hls/", "/hls1/");
				self.vjs.src([{
					src: live_urls.hls,
					type: 'application/x-mpegURL'
				}]);
				xhr = null;
			}else if(xhr.status === 404){
				if(_uniqPlay != mUniqPlay){
					console.warn("[VXGCLOUDPLAYER] polingHLSList, camid was changed stop poling hls list, currentCmaID=" + self.mSrc.getID());
					return;
				}
				mTimeWaitStartStream++;
				if(mTimeWaitStartStream > _timeWaitStartStreamMax){
					self.count_ERROR_STREAM_UNREACHABLE = (self.count_ERROR_STREAM_UNREACHABLE|0)+1;
					if (self.count_ERROR_STREAM_UNREACHABLE>3){
						self._showerror(CloudReturnCode.ERROR_STREAM_UNREACHABLE_HLS);
						self.count_ERROR_STREAM_UNREACHABLE=0;
					} else {	
						self.stop();
						self.play();
					}
					return;
				}
				setTimeout(function(){
					console.warn("Wait one sec " + live_urls.hls);
					xhr = null;
					_polingCameraHLSList(live_urls, _uniqPlay);
				},1000);
			}else{
				console.error("Unhandled");
			}
		};
		xhr.send();
	}

	self.WebRTC0_autoplayBlocked = function() {
		_stopPolingTime();
		try{mWebRTC0_Player.stopWS();}catch(e){console.warn("WebRTC0_autoplayBlocked: skip error", e);}
		mTimeWaitStartStream = 0;
		// TODO show PlayButton
		console.warn('_vjs_play. is mobile or autoplay not allowed. show big button');
		mShowedBigPlayButton = true;
		mElBigPlayButton.style.display = "block";
		mElBigPlayButton.onclick = function(event){
			mEvent = event;
			mElBigPlayButton.style.display = "none";
			mShowedBigPlayButton = false;
			mTimeWaitStartStream = 0;
			self.play();
		}
	}

	function _polingLoadCameraLiveUrl_WebRTC0(_uniqPlay, live_urls){
		if (!live_urls.rtc) {
			self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
			return;
		}

		console.warn("webrtc0 - depracated");
		mUsedPlayer = 'webrtc0';
		// WebRTC
		mElPlrType.innerHTML = "Used player: WebRTC (v0)";
/*
		if(window.location.protocol.startsWith ("file")){
			self.player.showErrorText("Please open from browser");
			return;
		}
*/
		var ws_protocol = (location.protocol == "https:" ? "wss://" : "ws://");
		var ws_host = location.hostname;
		var ws_port = 8080;
		var svcp_url = mConn.ServiceProviderUrl;
		if(live_urls.rtc){
			var p_rtc = CloudHelpers.parseUri(live_urls.rtc);
			var prt = p_rtc.protocol;
			if(prt == 'http' || prt == 'ws') {
				ws_protocol = "ws://";
			}else if(prt == 'https' || prt == 'wss'){
				ws_protocol = "wss://";
			}else{
				console.warn("Unknown protocol in '" + live_urls + "'");
			}
			ws_host = CloudHelpers.parseUri(live_urls.rtc).host;
			ws_port = CloudHelpers.parseUri(live_urls.rtc).port;
		}
		var ws_srv = ws_protocol + ws_host + ':' + ws_port + '/';

		// TODO keep player element
		self.vjs.el().style.display = "none";
		self.vjs2.el().style.display = "none";
		mNativeHLS_el.style.display = "none";
		mWebRTC_el.style.display = "block";
		if(!window['CloudPlayerWebRTC0']){
			console.error("Not found module CloudPlayerWebRTC0");
			return;
		}
		mWebRTC0_Player = new CloudPlayerWebRTC0(mWebRTC_el, ws_srv, live_urls.rtmp);
		mWebRTC0_Player.onAutoplayBlocked = self.WebRTC2_autoplayBlocked;
		mWebRTC0_Player.onServerError = function(event){
			console.error("[WebRTC0] Event error ", event);
			self._showerror(CloudReturnCode.ERROR_WEBRTC_SERVER_ERROR);
			self.stop("by_webrtc0_error");
		}
		mWebRTC0_Player.startWS();
		_startPolingTime();
	}

	self.WebRTC2_autoplayBlocked = function() {
		_stopPolingTime();
		try{mWebRTC2_Player.stopWS();}catch(e){console.warn("WebRTC2_autoplayBlocked: skip error", e);}
		mTimeWaitStartStream = 0;
		// TODO show PlayButton
		console.warn('_vjs_play. is mobile or autoplay not allowed. show big button');
		mShowedBigPlayButton = true;
		mElBigPlayButton.style.display = "block";
		mElBigPlayButton.onclick = function(event){
			mEvent = event;
			mElBigPlayButton.style.display = "none";
			mShowedBigPlayButton = false;
			mTimeWaitStartStream = 0;
			self.play();
		}
	}

	function _polingLoadCameraLiveUrl_WebRTC2(_uniqPlay, live_urls){
		if (!live_urls.webrtc) {
			self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
			return;
		}

		mUsedPlayer = 'webrtc2';
		// WebRTC
		mElPlrType.innerHTML = "Used player: WebRTC (v2)";
/*
		if(window.location.protocol.startsWith ("file")){
			self.player.showErrorText("Please open from browser");
			return;
		}
*/
		// TODO keep player element
		self.vjs.el().style.display = "none";
		self.vjs2.el().style.display = "none";
		mNativeHLS_el.style.display = "none";
		mWebRTC_el.style.display = "block";
		if(!window['CloudPlayerWebRTC2']){ // webrtc2
			console.error("Not found module CloudPlayerWebRTC2");
			return;
		}

		var p = CloudHelpers.promise();
		if (CloudHelpers.compareVersions(CloudPlayerWebRTC2.version, live_urls.webrtc.version) > 0) {
			console.warn("Expected version webrtc.version (v" + live_urls.webrtc.version + ") "
			+ " mismatch with included CloudPlayerWebRTC (v" + CloudPlayerWebRTC2.version + ")");
			p = CloudHelpers.requestJS(live_urls.webrtc.scripts.player, function(r) { 
				r = r.replace("CloudPlayerWebRTC =", "CloudPlayerWebRTC2 =");
				while (r.indexOf("CloudPlayerWebRTC.") !== -1) {
					r = r.replace("CloudPlayerWebRTC.", "CloudPlayerWebRTC2.");
				}
				return r;
			});
		} else {
			p.resolve();
		}

		p.done(function(){
			console.log("[PLAYER] ", live_urls.webrtc.connection_url)
			mWebRTC2_Player = new CloudPlayerWebRTC2(mWebRTC_el,
				live_urls.webrtc.connection_url,
				live_urls.webrtc.ice_servers, {
					send_video: false,
					send_audio: false,
				}
			);
			mWebRTC2_Player.onAutoplayBlocked = self.WebRTC2_autoplayBlocked;
			mWebRTC2_Player.onServerError = function(event){
				console.error("[WebRTC2] Event error ", event);
				self._showerror(CloudReturnCode.ERROR_WEBRTC_SERVER_ERROR);
				self.stop("by_webrtc2_error");
			}
			mWebRTC2_Player.startWS();
			_startPolingTime();
		})
	}

	function _polingLoadCameraLiveUrl_RTMP (_uniqPlay, live_urls){
		if (!live_urls.rtmp) {
			self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
			return;
		}

		mElPlrType.innerHTML = "Used player: Flash";
		self.vjs.ready(function(){
			console.log("[PLAYER] Set url (rtmp): " + live_urls.rtmp);
			self.vjs.options().flash.swf = CloudSDK.flashswf || 'swf/video-js-by-vxg-buff200.swf';
			self.vjs.src([{src: live_urls.rtmp, type: 'rtmp/mp4'}]);
			_showBlackScreen();
		});
	
		// vxgcloudplayer.vjs_play(vcp);
		self.vjs.off('ended');
		self.vjs.on('ended', function() {
			self.stop("by_rtmp_ended");
		});
		var bLoadedData = false;
		self.vjs.off('loadeddata');
		self.vjs.on('loadeddata', function() {
			console.warn("loadeddata");
			bLoadedData = true;
			_hideBlackScreen();
			if(_uniqPlay != mUniqPlay) {
				console.warn("[PLAYER]  _uniqPlay not current [loadeddata]");
				return;
			}
			_hideloading();
			_initZoomControls();
			_initVolumeControls();
			_vjs_play_live();
		});

		self.vjs.off('loadedmetadata');
		self.vjs.on('loadedmetadata', function() {
			console.warn("loadedmetadata");
		});

		// ad-hoc for network encoder
		setTimeout(function(){
			console.log("[PLAYER] Set url (rtmp) 2: " + live_urls.rtmp);
			if(!bLoadedData){
				self.vjs.src([{src: live_urls.rtmp, type: 'rtmp/mp4'}]);
			}
		},5000)

		_stopPolingTime();
		_startPolingTime();
		if (CloudHelpers.isChrome() && !CloudHelpers.autoPlayAllowed) {
			_vjs_play_live();
		} else {
			self.vjs.play();
		}
	}

	function _polingLoadCameraLiveUrl_NativeHLS(_uniqPlay, live_urls){
		if (!live_urls.hls) {
			self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
			return;
		}

		mUsedPlayer = 'native-hls';
		// No work
		mElPlrType.innerHTML = "Used player: NativeHLS";
/*
		if(window.location.protocol.startsWith ("file")){
			self.player.showErrorText("Please open from browser");
			return;
		}
*/
		// TODO keep player element
		self.vjs.el().style.display = "none";
		self.vjs2.el().style.display = "none";
		mWebRTC_el.style.display = "none";
		mNativeHLS_el.style.display = "block";
		if(!window['CloudPlayerNativeHLS']){
			console.error("[PLAYER]  Not found module CloudPlayerNativeHLS");
			return;
		}

		mNativeHLS_Player = new CloudPlayerNativeHLS(mNativeHLS_el, live_urls.hls);
		mNativeHLS_Player.play();
		_startPolingTime();
	}

	function _polingLoadCameraLiveUrl_HLS (_uniqPlay, live_urls){
		if (!live_urls.hls) {
			self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
			return;
		}

		if (self.m.useNativeHLS) {
			_polingLoadCameraLiveUrl_NativeHLS(_uniqPlay, live_urls);
			return;
		}
		mElPlrType.innerHTML = "Used player: HTML5 (hls)";
		mUsedPlayer = 'hls';

		console.log("[PLAYER] Set url (hls): " + live_urls.hls);

		clearInterval(mExpireHLSTimeInterval);
		/*if (live_urls.expire_hls) {
			var _expire_hls = live_urls.expire_hls;
			mExpireHLSTimeInterval = setInterval(function() {
				if(_source_type == 'camera_live' && mUsedPlayer == 'hls') {
					var nDiff = CloudHelpers.parseUTCTime(_expire_hls) - CloudHelpers.getCurrentTimeUTC();
					// console.warn("[PLAYER] hls, check the expire hls (at " + Math.floor(nDiff/1000) + " seconds)");
					if (nDiff < 0) {
						console.warn("[PLAYER] hls, reload new urls");
						self._polingLoadCameraLiveUrl(_uniqPlay);
					}
					// request again live urls
				}
			},10000);
		}*/

		_polingCameraHLSList(live_urls, _uniqPlay);

		self.vjs.off('ended');
		self.vjs.on('ended', function() {
			self.stop("by_hls_ended");
			self._showerror(CloudReturnCode.ERROR_HLS_ENDED);
		});
		mSafariAndHlsNotStarted = '';

		self.vjs.off('loadeddata');
		self.vjs.on('loadeddata', function() {
			console.warn("loadeddata");
			_hideBlackScreen();
			if(_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [loadeddata]");
				return;
			}
			_hideloading();
			_initZoomControls();
			_initVolumeControls();
			_vjs_play_live();
			if (CloudHelpers.isSafari()) {
				mSafariAndHlsNotStarted = 'loadeddata';
			}
		});

		self.vjs.off('loadedmetadata');
		self.vjs.on('loadedmetadata', function() {
			// console.warn("loadedmetadata");
		});

		self.vjs.off('playing');
		self.vjs.on('playing', function() {
			if (CloudHelpers.isSafari() && mSafariAndHlsNotStarted === 'loadeddata') {
				mSafariAndHlsNotStarted = 'playing';
			}
		});

		self.vjs.off('pause');
		self.vjs.on('pause', function() {
			// console.warn("pause");
			if (CloudHelpers.isSafari() && mSafariAndHlsNotStarted === 'playing') {
				mSafariAndHlsNotStarted = 'pause';
				_vjs_play_live();
			}
		});

		_stopPolingTime();
		_startPolingTime();
		if (CloudHelpers.isChrome() && !CloudHelpers.autoPlayAllowed) {
			_vjs_play_live();
		} else {
			self.vjs.play();
		}
	}

	function _polingCameraStatus(_uniqPlay){
		if(mUniqPlay != null && _uniqPlay != mUniqPlay) {
			console.warn("[_polingCameraStatus] _uniqPlay not current 1");
			clearInterval(mPolingCameraStatus);
			return;
		}
		if(!self.mSrc){
			console.warn("[_polingCameraStatus] no source");
			clearInterval(mPolingCameraStatus);
			return;
		}
		if(self.mSrc.type != 'camera'){
			console.warn("[_polingCameraStatus] no type camera");
			clearInterval(mPolingCameraStatus);
			return;
		}
		var camId = self.mSrc.getID();
		var prev_status = self.mSrc._origJson()['status'];
		mConn._getAPI().getCamera2(camId, {}).done(function(r){
			// console.log("[_polingCameraStatus] ",r);
			var new_status = r['status'];
			if(mUniqPlay != null && _uniqPlay != mUniqPlay) {
				console.warn("[_polingCameraStatus] _uniqPlay not current (2) " + _uniqPlay + "!=" + mUniqPlay);
				clearInterval(mPolingCameraStatus);
				return;
			}

			if(new_status !== 'active'
				&& self.m.waitSourceActivation != 0
				&& mWaitSourceActivationCounter > self.m.waitSourceActivation) {
				self._showerror(CloudReturnCode.ERROR_CAMERA_OFFLINE);
				mWaitSourceActivationCounter = 0;
			}

			if(prev_status != new_status){
				console.warn("switched camera status: from " + prev_status + " to " + new_status + ' mLiveModeAutoStart: ' + mLiveModeAutoStart);
				self.mSrc._origJson()['status'] = new_status;
				if(mLiveModeAutoStart){
					if(new_status == 'active'){
						self.play();
					}else{
						self.stop("by_poling_camera_status");
						self._showerror(CloudReturnCode.ERROR_CAMERA_OFFLINE);
						_startPolingCameraStatus(_uniqPlay);
					}
				}
				mCallbacks.executeCallbacks(CloudPlayerEvent.CHANNEL_STATUS, {status: new_status});
				if (mCallback_onChannelStatus) {
					setTimeout(function(){ mCallback_onChannelStatus(self, new_status); },10);
				}
			}
		}).fail(function(err){
			console.error("[_polingCameraStatus] ",err);
			self.mSrc._origJson()['status'] = 'error';
		});
		// 
	}

	function _startPolingCameraStatus(_uniqPlay){
		setTimeout(function(){
			mLiveModeAutoStart = true;
			clearInterval(mPolingCameraStatus);
			_polingCameraStatus(_uniqPlay);
			mWaitSourceActivationCounter = 100;
			var timePolingStart = 3000;

			if (self.mSrc._origJson()['status'] == 'active'){
				timePolingStart = mTimePolingCameraStatus_active;
			}else{
				timePolingStart = mTimePolingCameraStatus_inactive;
			}

			mPolingCameraStatus = setInterval(function(){
				if (mWaitSourceActivationCounter > 0) {
					mWaitSourceActivationCounter += timePolingStart;
				}
				_polingCameraStatus(_uniqPlay);
			}, timePolingStart);
		},100); // if called self.stop()
	}

	self._polingLoadCameraLiveUrl = function(_uniqPlay){
		if(_uniqPlay != mUniqPlay) {
			console.warn("_uniqPlay not current [_polingLoadCameraLiveUrl]");
			return;
		}
		
		if(self.mSrc.type != 'camera'){
			self._showerror(CloudReturnCode.ERROR_INVALID_SOURCE);
			return;
		}

		if(self.updateAudioCaps){
			self.updateAudioCaps(self.mSrc.getID());
		}
		_source_type = 'camera_live';
		mUsedPlayer = '';
		mConn._getAPI().cameraLiveUrls(self.mSrc.getID()).done(function(live_urls){
			if(_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [_polingLoadCameraLiveUrl.done]");
				return;
			}

			_updatePlayerFormatUI(live_urls);

			var webrtc_major_version = 1;
			if (live_urls.webrtc) {
				webrtc_major_version = live_urls.webrtc.version.split(".")[0];
				webrtc_major_version = parseInt(webrtc_major_version, 10);
			}

			if (!live_urls.hls && !live_urls.rtmp) {
				mPlayerFormatForced = 'webrtc';
			}

			if (mPlayerFormatForced !== null) {
				if (mPlayerFormatForced === 'flash') {
					_polingLoadCameraLiveUrl_RTMP(_uniqPlay, live_urls);
				} else if (mPlayerFormatForced === 'html5') {
					_polingLoadCameraLiveUrl_HLS(_uniqPlay, live_urls);
				} else if (live_urls.rtc && mPlayerFormatForced === 'webrtc') {
					_polingLoadCameraLiveUrl_WebRTC0(_uniqPlay, live_urls);
				} else if (live_urls.webrtc && webrtc_major_version === 2 && mPlayerFormatForced === 'webrtc') {
					_polingLoadCameraLiveUrl_WebRTC2(_uniqPlay, live_urls);
				} else {
					self._showerror(CloudReturnCode.NOT_SUPPORTED_FORMAT);
				}
				return;
			}

			if(self.mPlayerFormat == 'webrtc'){
				if(live_urls.rtc && CloudHelpers.supportWebRTC()){
					_polingLoadCameraLiveUrl_WebRTC0(_uniqPlay, live_urls);
				} else if (live_urls.webrtc && webrtc_major_version === 2 && CloudHelpers.supportWebRTC()){
					_polingLoadCameraLiveUrl_WebRTC2(_uniqPlay, live_urls);
				}else{
					_polingLoadCameraLiveUrl_HLS(_uniqPlay, live_urls);
				}
			}
			
			if(self.mPlayerFormat == 'flash'){
				if(!CloudHelpers.useHls()){
					_polingLoadCameraLiveUrl_RTMP(_uniqPlay, live_urls);
				}else{
					_polingLoadCameraLiveUrl_HLS(_uniqPlay, live_urls);
				}
			}

			if(self.mPlayerFormat == 'html5'){
				_polingLoadCameraLiveUrl_HLS(_uniqPlay, live_urls);
			}
		}).fail(function(r){
			console.error(r);
			if(_uniqPlay != mUniqPlay) {
				console.warn("_uniqPlay not current [_polingLoadCameraLiveUrl.fail]");
				return;
			}
			if(r.status && r.status == 503){
				// try load urls
				mTimeWaitStartStream++;
				if(mTimeWaitStartStream < self.timePolingLiveUrls){
					setTimeout(function(){
						self._polingLoadCameraLiveUrl(_uniqPlay);
					}, 1000);
				}else{
					console.error(r);
				}
				return;
			}
			console.error(r);
		});
	}

	self._reset_players = function() {
		console.log("_reset_players");
		self.vjs.reset();
		self.vjs.controls(false);
		self.vjs.muted(true);
		self.vjs.autoplay(true);
		self.vjs.volume(0);
		self.vjs.el().style.display = "";
		
		self.vjs2.reset();
		self.vjs2.controls(false);
		self.vjs2.muted(true);
		self.vjs2.autoplay(true);
		self.vjs2.volume(0);
		self.vjs2.el().style.display = "none";

		mPlaybackPlayer1.reset();
		mPlaybackPlayer1.el().style.display = "none";

		mPlaybackPlayer2.reset();
		mPlaybackPlayer2.el().style.display = "none";

		self.volume(self.m.volume);
		_stopPolingTime();
		self._stopPolingMediaTicket();
		// vxgcloudplayer.stopPolingCameraLife();
		// self.updatePlayerType("");
	}

	self.isPlaying = function(){
		return mPlaying;
	}

	self.set_controls_opacity = function(val){
		if (el_controls.style.opacity != val) {
			mCallbacks.executeCallbacks(CloudPlayerEvent.CHANGED_CONTROLS, {opacity: val});
		}
		el_controls.style.opacity = val;
		el_controls_zoom.style.opacity = val;
		el_controls_zoom_position.style.opacity = val;
		el_controls_container.style.opacity = val;
		el_info.style.opacity = val;
		mElementCalendar.style.opacity = val;
		el_controls_ptz_container.style.opacity = val;
        el_controls_zoom_container.style.opacity = val;
        el_calendar_container.style.opacity = val;
        el_live_container.style.opacity = val;
	}
			
	self.restartTimeout = function(){
		if(self.m.autohide < 0){
			self.set_controls_opacity("0");
			return;
		}
		if(self.m.autohide == 0){
			self.set_controls_opacity("1");
			return;
		}
		self.set_controls_opacity("1");
		clearTimeout(self.timeout);
		self.timeout = setTimeout(function(){
			self.set_controls_opacity("0");
		},self.m.autohide);
	};
	
	self.restartTimeout();
	

	self.player.addEventListener('mousemove', self.restartTimeout, true);
	self.player.addEventListener('touchmove', self.restartTimeout, true);
	self.player.addEventListener('touchstart', self.restartTimeout, true);
	

	mElementPlay.onclick = self.play;
	el_stop.onclick = self.stop;
	
	self.size = function(width, height){
		// redesign
		console.error("[CloudPlayer] size not support");
		/*if(width && height){
			if(Number.isInteger(width) && Number.isInteger(height)){
				var w = parseInt(width,10);
				var h = parseInt(height,10);
				self.playerWidth = self.playerWidth != w ? w : self.playerWidth;
				self.playerHeight = self.playerHeight != h ? h : self.playerHeight;
				self.player.style.width = width + 'px';
				self.player.style.height = height + 'px';
			}else{
				self.player.style.width = width;
				self.player.style.height = height;
			}
		}else{
			return  { width: self.playerWidth, height: self.playerHeight };
		}*/
	};
	
	self.setFullscreenCallback = function(func) {
	    self.f_callbackFullscreenFunc = func;
	}   
	
	self.initFullscreenControls = function(){
		var el_fullscreen = self.player.getElementsByClassName('cloudplayer-fullscreen')[0];
		var _prevHeight, _prevWidth, _prevMaxW , _prevMaxH;
		self.changedFullscreen = function(){
			console.log('changedFullscreen: ' + document.webkitIsFullScreen);
			if (document.webkitIsFullScreen){
				_prevHeight = self.player.style.height;
				_prevWidth = self.player.style.width;
				_prevMaxH = self.player.style.maxHeight;
				_prevMaxW = self.player.style.maxWidth;
				
				self.player.style.height ='100%';
				self.player.style.width = '100%';
				self.player.style.maxHeight = '100%';
				self.player.style.maxWidth = '100%';
				// self.size('100%', '100%');
				console.log('changedFullscreen -> fullscreen');
				
				if (self.f_callbackFullscreenFunc) {
				    self.f_callbackFullscreenFunc();
				}
			}else{
				//_prevHeight
				self.player.style.height = _prevHeight;
				self.player.style.width = _prevWidth;
				
				self.player.style.maxHeight =_prevMaxH;
				self.player.style.maxWidth = _prevMaxW;

				// self.size(self.playerWidth + 'px', self.playerHeight + 'px');
				console.log('changedFullscreen -> NOT fullscreen');
				
				if (self.f_callbackFullscreenFunc) {
				    self.f_callbackFullscreenFunc();
				}
			}
		};

		self.player.onwebkitfullscreenchange = self.changedFullscreen;
		self.player.onmozfullscreenchange = self.changedFullscreen;
		self.player.onfullscreenchange = self.changedFullscreen;

		self.fullscreen = function(){
			console.log("fullscreen: clicked");
			if(document.webkitIsFullScreen == true){
				document.webkitCancelFullScreen();
			} else if(document.mozFullScreen){
				document.mozCancelFullScreen();
			} else if(document.msFullscreenElement && document.msFullscreenElement != null){
				document.msExitFullscreen();
			}else{
				if(self.player.mozRequestFullScreen) {
					self.player.mozRequestFullScreen();
				} else if(self.player.requestFullscreen) {
					self.player.requestFullscreen();
				} else if(self.player.webkitRequestFullscreen) {
					self.player.webkitRequestFullscreen();
				} else if(self.player.msRequestFullscreen) {
					self.player.msRequestFullscreen();
				}
			}
		};
		
		el_fullscreen.onclick = self.fullscreen;
	}
	self.initFullscreenControls();
	
	self.initHLSMechanism = function(){

		self._applyMediaTiket = function(url_hls, expire){
			console.log("media-tiсket: old = " + self.hls_mediaticket_value);
			if(url_hls.indexOf('?') != -1){
				self.hls_mediaticket_value = '?' + url_hls.split('?')[1];
			}
			mHLSLinkExpire = Date.parse(expire + 'Z');
			console.log("media-tiсket: new = " + self.hls_mediaticket_value);
		}

		self._stopPolingMediaTicket = function(){
			clearInterval(self._polingMediaTicketInterval);
		}
	}
	self.initHLSMechanism();
	window._cloudPlayers[elid] = self;
        self.pano = CloudPano(self.player.getElementsByClassName('allvideotags')[0],self);

	self.enableSpeedSetting = function () {
		mElSettings_speed_container.classList.add('enabled');
	};
	self.disableSpeedSetting = function () {
		mElSettings_speed_container.classList.remove('enabled');
	};
	self.enableModeSetting = function () {
		mElSettings_format_container.classList.add('enabled');
	};
	self.disableModeSetting = function () {
		mElSettings_format_container.classList.remove('enabled');
	}
	
	
	if (self.mPreferredPlayerFormat !== undefined)
		self.disableModeSetting();
	else	
		self.enableModeSetting();
		
}

CloudPlayer.POSITION_LIVE = -1;

window.CloudPlayerNativeHLS = function(videoEl, hlsUrl){
	var mVideoEl = videoEl;
	var mHLSUrl = hlsUrl;
	var self = this;

	console.warn("[NativeHLS] canPlay: application/vnd.apple.mpegurl => ", mVideoEl.canPlayType('application/vnd.apple.mpegurl'))
	console.warn("[NativeHLS] canPlay: application/x-mpegURL => ", mVideoEl.canPlayType('application/x-mpegURL'))
	console.warn("[NativeHLS] canPlay: video/mp4 => ", mVideoEl.canPlayType('video/mp4'))

	self.play = function() {
		if (mVideoEl.children.length > 0) {
			mVideoEl.removeChild(mVideoEl.children[0]);
		}
		
		var source = document.createElement('source');
		source.src = mHLSUrl;
		source.type="video/mp4";

		mVideoEl.append(source);
		mVideoEl.load();
	}

	self.stop = function() {
		if (mVideoEl.children.length > 0) {
			mVideoEl.removeChild(mVideoEl.children[0]);
		}
	}


	mVideoEl.addEventListener("abort", function() {
		console.warn("[NativeHLS] abort");
	}, true);
	mVideoEl.addEventListener("canplay", function() {
		console.warn("[NativeHLS] canplay");
	}, true);
	mVideoEl.addEventListener("canplaythrough", function() {
		console.warn("[NativeHLS] canplaythrough");
	}, true);
	mVideoEl.addEventListener("durationchange", function() {
		console.warn("[NativeHLS] durationchange");
	}, true);
	mVideoEl.addEventListener("emptied", function() {
		console.warn("[NativeHLS] emptied");
	}, true);
	mVideoEl.addEventListener("encrypted", function() {
		console.warn("[NativeHLS] encrypted");
	}, true);
	mVideoEl.addEventListener("ended", function() {
		console.warn("[NativeHLS] ended");
	}, true);
	mVideoEl.addEventListener("error", function(err, err1) {
		console.error("[NativeHLS] error ", err);
		console.error("[NativeHLS] error ", err1);
	}, true);
	mVideoEl.addEventListener("interruptbegin", function() {
		console.warn("[NativeHLS] interruptbegin");
	}, true);
	mVideoEl.addEventListener("interruptend", function() {
		console.warn("[NativeHLS] interruptend");
	}, true);
	mVideoEl.addEventListener("loadeddata", function() {
		console.warn("[NativeHLS] loadeddata");
		mVideoEl.play();
	}, true);
	mVideoEl.addEventListener("loadedmetadata", function() {
		console.warn("[NativeHLS] loadedmetadata");
	}, true);
	mVideoEl.addEventListener("loadstart", function() {
		console.warn("[NativeHLS] loadstart");
	}, true);
	mVideoEl.addEventListener("mozaudioavailable", function() {
		console.warn("[NativeHLS] mozaudioavailable");
	}, true);
	mVideoEl.addEventListener("pause", function() {
		console.warn("[NativeHLS] pause");
	}, true);
	mVideoEl.addEventListener("play", function() {
		console.warn("[NativeHLS] play");
	}, true);
	mVideoEl.addEventListener("playing", function() {
		console.warn("[NativeHLS] playing");
	}, true);
	mVideoEl.addEventListener("progress", function() {
		console.warn("[NativeHLS] progress");
	}, true);
	mVideoEl.addEventListener("ratechange", function() {
		console.warn("[NativeHLS] ratechange");
	}, true);
	mVideoEl.addEventListener("seeked", function() {
		console.warn("[NativeHLS] seeked");
	}, true);
	mVideoEl.addEventListener("seeking", function() {
		console.warn("[NativeHLS] seeking");
	}, true);
	mVideoEl.addEventListener("stalled", function() {
		console.warn("[NativeHLS] stalled");
	}, true);
	mVideoEl.addEventListener("suspend", function() {
		console.warn("[NativeHLS] suspend");
	}, true);
	mVideoEl.addEventListener("timeupdate", function() {
		console.warn("[NativeHLS] timeupdate");
	}, true);
	mVideoEl.addEventListener("volumechange", function() {
		console.warn("[NativeHLS] volumechange");
	}, true);
	mVideoEl.addEventListener("waiting", function() {
		console.warn("[NativeHLS] waiting");
	}, true);
	
};



window.CloudPlayerNativeVideo = function(elId){
	var mVideoEl = document.getElementById(elId);
	var mSourceEl = null;
	var self = this;
	var _TAG = "[NativeVideo] ";
	var mAutoplayBlocked = null;
	var mResetCalled = false;
	var mCurrentTime = 0;
	var mCallbackError = null;

	function _checkAutoPlay(p) {
		var s = '';
		if (window['Promise']) {
			s = window['Promise'].toString();
		}

		if (s.indexOf('function Promise()') !== -1
			|| s.indexOf('function ZoneAwarePromise()') !== -1) {

			p.catch(function(error) {
				console.error(_TAG + "checkAutoplay, error:", error)
				// Check if it is the right error
				if(error.name == "NotAllowedError") {
					console.error(_TAG + "_checkAutoPlay: error.name:", "NotAllowedError")
					self.onAutoplayBlocked();
				} else if (error.name == "AbortError" && CloudHelpers.isSafari()) {
					console.error(_TAG + "_checkAutoPlay: AbortError (Safari)")
					self.onAutoplayBlocked();
				} else {
					console.error(error);
					console.error(_TAG + "checkAutoplay: happened something else");
					// throw error; // happened something else
				}
			}).then(function(){
				console.log(_TAG + "checkAutoplay: then");
				// Auto-play started
			});
		} else {
			console.error(_TAG + "checkAutoplay: could not work in your browser ", p);
		}
	}

	self.onAutoplayBlocked = function() {
		// nothing
	}

	self.on = function(event_t, func) {
		if (event_t == 'error') {
			mCallbackError = func;
			// mVideoEl.onerror = func;
		} else if (event_t == 'loadeddata') {
			mVideoEl.onloadeddata = func;
		} else if (event_t == 'ended') {
			mVideoEl.onended = func;
		} else if (event_t == 'autoplay_blocked') {
			mAutoplayBlocked = func;
		} else {
			console.error(_TAG + "ON Unknown " + event_t);
		}
	}

	self.off = function(event_t) {
		if (event_t == 'loadeddata') {
			mVideoEl.onloadeddata = null;
		} else if (event_t == 'ended') {
			mVideoEl.onended = null;
		} else {
			console.error(_TAG + "OFF Unknown " + event_t);
		}
	}

	self.ready = function(ready) {
		ready();
		console.error(_TAG + "TODO ready");
	}

	self.muted = function(b) {
		mVideoEl.muted = b;
		console.error(_TAG + "TODO muted");
	}

	self.volume = function(v) {
		if (v !== undefined) {
			mVideoEl.volume = v;
			return;
		}
		return mVideoEl.volume;
	}

	self.reset = function() {
		console.warn(_TAG, "reset");
		mResetCalled = true;
		mCurrentTime = 0;
		mVideoEl.pause();
		if (mSourceEl != null) {
			mSourceEl.removeAttribute('src');
		}
		mVideoEl.load();
	}

	self.controls = function(b) {
		console.error(_TAG + "TODO controls");
	}

	self.autoplay = function(b) {
		if (b == true) {
			console.error(_TAG + "Not supported autoplay");
		}
	}

	self.el = function() {
		return mVideoEl;
	}

	self.src = function(s) {
		// console.log(s);
		if (mSourceEl == null) {
			mSourceEl = document.createElement('source');
			mVideoEl.appendChild(mSourceEl);
		}
		mVideoEl.pause();
		mVideoEl.currentTime = 0;
		mSourceEl.setAttribute('src', s[0].src);
		mVideoEl.load();
		// self.play();
		// mVideoEl.play();
	}

	self.currentTime = function(v) {
		if (v !== undefined) {
			mCurrentTime = v;
			mVideoEl.currentTime = v;
			return;
		}
		return mVideoEl.currentTime || mCurrentTime;
	}
	
	self.play = function() {
		_checkAutoPlay(mVideoEl.play());
	}

	self.pause = function() {
		mVideoEl.pause();
	}

	mVideoEl.addEventListener("abort", function() {
		// console.warn(_TAG + "abort");
	}, true);
	mVideoEl.addEventListener("canplay", function() {
		// console.warn(_TAG + "canplay");
	}, true);
	mVideoEl.addEventListener("canplaythrough", function() {
		// console.warn(_TAG + "canplaythrough");
	}, true);
	mVideoEl.addEventListener("durationchange", function() {
		// console.warn(_TAG + "durationchange");
	}, true);
	mVideoEl.addEventListener("emptied", function() {
		// console.warn(_TAG + "emptied");
	}, true);
	mVideoEl.addEventListener("encrypted", function() {
		// console.warn(_TAG + "encrypted");
	}, true);
	mVideoEl.addEventListener("ended", function() {
		console.warn(_TAG + "ended");
	}, true);
	mVideoEl.addEventListener("error", function(err0, err1) {
		console.error(_TAG + "err0 ", err0);	
		/*if (mResetCalled == true) {
			console.warn(_TAG + "Skip error after reset");
			mResetCalled = false;
			return;
		}*/
		if (mCallbackError != null) {
			mCallbackError(err0);
		}
		// console.error(_TAG + " err1 ", err1);
	}, true);
	mVideoEl.addEventListener("interruptbegin", function() {
		// console.warn(_TAG + "interruptbegin");
	}, true);
	mVideoEl.addEventListener("interruptend", function() {
		// console.warn(_TAG + "interruptend");
	}, true);
	mVideoEl.addEventListener("loadeddata", function() {
		// console.warn(_TAG + "loadeddata");
		mVideoEl.currentTime = mCurrentTime;
		// console.warn(_TAG + "currentTime = " + mCurrentTime);
	}, true);
	mVideoEl.addEventListener("loadedmetadata", function() {
		// console.warn(_TAG + "loadedmetadata");
	}, true);
	mVideoEl.addEventListener("loadstart", function() {
		// console.warn(_TAG + "loadstart");
	}, true);
	mVideoEl.addEventListener("mozaudioavailable", function() {
		// console.warn(_TAG + "mozaudioavailable");
	}, true);
	mVideoEl.addEventListener("pause", function() {
		// console.warn(_TAG + "pause");
	}, true);
	mVideoEl.addEventListener("play", function() {
		// console.warn(_TAG + "play");
	}, true);
	mVideoEl.addEventListener("playing", function() {
		// console.warn(_TAG + "playing");
	}, true);
	mVideoEl.addEventListener("progress", function() {
		// console.warn(_TAG + "progress");
	}, true);
	mVideoEl.addEventListener("ratechange", function() {
		// console.warn(_TAG + "ratechange");
	}, true);
	mVideoEl.addEventListener("seeked", function() {
		// console.warn(_TAG + "seeked");
	}, true);
	mVideoEl.addEventListener("seeking", function() {
		// console.warn(_TAG + "seeking");
	}, true);
	mVideoEl.addEventListener("stalled", function() {
		// console.warn(_TAG + "stalled");
	}, true);
	mVideoEl.addEventListener("suspend", function() {
		// console.warn(_TAG + "suspend");
	}, true);
	mVideoEl.addEventListener("timeupdate", function() {
		// console.warn(_TAG + "timeupdate");
	}, true);
	mVideoEl.addEventListener("volumechange", function() {
		// console.warn(_TAG + "volumechange");
	}, true);
	mVideoEl.addEventListener("waiting", function() {
		// console.warn(_TAG + "waiting");
	}, true);
	
};



window.CloudPlayerWebRTC0 = function(videoEl, srv, rtmpUrl){
	// for VXG Server
	var mVideoEl = videoEl;
	var mWSServer = srv;
	var mRtmpUrl = rtmpUrl;
	var peer_connection = null;
	var _TAG = "[WEBRTC0] ";
	/*var rtc_configuration = {iceServers: [{urls: "stun:stun.services.mozilla.com"},
										  {urls: "stun:stun.l.google.com:19302"}]};*/

	var rtc_configuration = {iceServers: [{
			urls: "stun:stun.l.google.com:19302"
		}, {
			"urls": ["turn:turn.vxg.io:3478?transport=udp"],
			"username": "vxgturn",
			"credential": "vxgturn"
		}
	]};

	var self = this;
	
	var ws_conn;
	var mPeerId = Math.floor(Math.random() * (9000 - 10) + 10).toString();
	self.onWsError = function(msg){
		console.error(msg);
	}
	
	self.onAutoplayBlocked = function() {
        // nothing
        console.error(_TAG + "onAutoplayBlocked");
    }
    
    function _checkAutoPlay(p) {
		var s = '';
		if (window['Promise']) {
			s = window['Promise'].toString();
		}

		if (s.indexOf('function Promise()') !== -1
			|| s.indexOf('function ZoneAwarePromise()') !== -1) {

			p.catch(function(error) {
				console.error(_TAG + "_checkAutoplay, error:", error)
				// Check if it is the right error
				if(error.name == "NotAllowedError") {
					console.error(_TAG + "_checkAutoPlay: error.name:", "NotAllowedError")
					self.onAutoplayBlocked();
				} else if (error.name == "AbortError" && CloudHelpers.isSafari()) {
					console.error(_TAG + "_checkAutoPlay: AbortError (Safari)")
					self.onAutoplayBlocked();
				} else {
					console.error(error);
					console.error(_TAG + "checkAutoplay: happened something else");
					// throw error; // happened something else
				}
			}).then(function(){
				console.log(_TAG + "checkAutoplay: then");
				// Auto-play started
			});
		} else {
			console.error(_TAG + "_checkAutoplay: could not work in your browser ", p);
		}
	}
	
	if (CloudHelpers.isSafari() ) {
        navigator.mediaDevices.getUserMedia({ "audio": false, "video": true}).then(function (stream) {
            console.log(_TAG + "Camera permission granted");
        }).catch(function(a1, a2){
			console.error(a1, a2)
		});
    }

	self.resetState = function() {
		// This will call onServerClose()
		ws_conn.close();
	}

	self.handleIncomingError = function(error) {
		console.error(_TAG + "IncomingError: ", error);
		resetState();
	}

	self.resetVideoElement = function() {
		mVideoEl.pause();
		mVideoEl.src = "";
		mVideoEl.load();
	}

	// SDP offer received from peer, set remote description and create an answer
	self.onIncomingSDP = function(sdp) {
		sdp.sdp = sdp.sdp.replace(/profile-level-id=[^;]+/, 'profile-level-id=42e01f');
		console.log(_TAG + 'Incoming SDP is ' + JSON.stringify(sdp));
		peer_connection.setRemoteDescription(sdp).then(function(){
			console.log("Remote SDP set");
			if (sdp.type != "offer")
				return;
			console.log(_TAG + "Got SDP offer, creating answer");
			peer_connection.createAnswer().then(self.onLocalDescription).catch(function(t){
				console.error('[WEBRTC0] createAnswer: ', t);
			});
		}).catch(function(t){
			console.error(_TAG + 'setRemoteDescription: ', t);
		});
	}

	// Local description was set, send it to peer
	self.onLocalDescription = function(desc) {
		console.log(_TAG + 'Got local description: ' + JSON.stringify(desc));
		peer_connection.setLocalDescription(desc).then(function() {
			console.log(_TAG + 'Sending SDP answer');
			sdp = {'sdp': peer_connection.localDescription}
			ws_conn.send(JSON.stringify(sdp));
			console.warn(_TAG + 'Streaming (1)');
			_checkAutoPlay(mVideoEl.play());
		});
	}

	// ICE candidate received from peer, add it to the peer connection
	self.onIncomingICE = function(ice) {
		console.log(_TAG + 'Incoming ICE: ' + JSON.stringify(ice));
		var candidate = new RTCIceCandidate(ice);
		peer_connection.addIceCandidate(candidate).catch(function(t){
			console.error(_TAG + 'addIceCandidate ', t);
		});
	}

	self.onServerMessage = function(event) {
		console.log(_TAG + "Received " + event.data);
		switch (event.data) {
			case "HELLO":
				console.log(_TAG + "Registered with server, waiting for stream");
				return;
			default:
				if (event.data.startsWith("ERROR")) {
					self.handleIncomingError(event.data);
					return;
				}
				// Handle incoming JSON SDP and ICE messages
				try {
					msg = JSON.parse(event.data);
				} catch (e) {
					if (e instanceof SyntaxError) {
						handleIncomingError("Error parsing incoming JSON: " + event.data);
					} else {
						handleIncomingError("Unknown error parsing response: " + event.data);
					}
					return;
				}

				// Incoming JSON signals the beginning of a call
				if (peer_connection == null)
					self.createCall(msg);

				if (msg.sdp != null) {
					self.onIncomingSDP(msg.sdp);
				} else if (msg.ice != null) {
					self.onIncomingICE(msg.ice);
				} else {
					self.handleIncomingError("Unknown incoming JSON: " + msg);
				}
		}
	}

	// window.onload = websocketServerConnect;

	self.stopWS = function(){
		ws_conn.close();
		// self.onServerClose();
		// delete self;
	}

	self.onServerClose = function(event) {
		self.resetVideoElement();

		if (peer_connection != null) {
			peer_connection.close();
			peer_connection = null;
		}

		// Reset after a second
		// window.setTimeout(websocketServerConnect, 1000);
	}

	self.onServerError = function(event) {
		console.error("[WEBRTC0] Unable to connect to server, did you add an exception for the certificate?")
	}

	self.onRemoteStreamAdded = function(event) {
		videoTracks = event.stream.getVideoTracks();
		audioTracks = event.stream.getAudioTracks();

		if (videoTracks.length > 0) {
			console.log('[WEBRTC0] Incoming stream: ' + videoTracks.length + ' video tracks and ' + audioTracks.length + ' audio tracks');
			mVideoEl.srcObject = event.stream;
		} else {
			self.handleIncomingError('[WEBRTC0] Stream with unknown tracks added, resetting');
		}
	}

	self.errorUserMediaHandler = function() {
		console.error("[WEBRTC0] Browser doesn't support getUserMedia!");
	}

	self.createCall = function(msg) {
		// Reset connection attempts because we connected successfully
		connect_attempts = 0;

		peer_connection = new RTCPeerConnection(rtc_configuration);
		peer_connection.onaddstream = self.onRemoteStreamAdded;
		/* Send our video/audio to the other peer */

		if (!msg.sdp) {
			console.log("[WEBRTC0] WARNING: First message wasn't an SDP message!?");
		}

        peer_connection.onicecandidate = function(event) {
			// We have a candidate, send it to the remote party with the
			// same uuid
			if (event.candidate == null) {
				console.error("[WEBRTC0] ICE Candidate was null, done"); // why log error ?
				return;
			}
			ws_conn.send(JSON.stringify({'ice': event.candidate}));
		};

		console.log("[WEBRTC0] Created peer connection for call, waiting for SDP");
	}
	
	self.startWS = function() {
		self.connect_attempts++;
		if (self.connect_attempts > 3) {
			console.error("[WEBRTC0] Too many connection attempts, aborting. Refresh page to try again");
			return;
		}
		console.log("[WEBRTC0] Connecting to server...");
		loc = null;
		
		ws_conn = new WebSocket(mWSServer);
		/* When connected, immediately register with the server */
		ws_conn.addEventListener('open', function(event) {
			ws_conn.send('HELLO ' + mPeerId);
			console.log(_TAG + "Registering with server");
			ws_conn.send('SPAWN ' + mRtmpUrl)
		});
		ws_conn.addEventListener('error', self.onServerError);
		ws_conn.addEventListener('message', self.onServerMessage);
		ws_conn.addEventListener('close', self.onServerClose);

		var constraints = {video: true, audio: true};
	}
	
};



window.CloudPlayerWebRTC2 = function(objVideoEl, strConnectionUrl, arrIceServers, options) {
    options = options || {};
    var self = this;
    var _TAG = "[WEBRTC2] ";

    console.log(_TAG, options);

    var m_objVideoEl = objVideoEl;
	var m_strPeerOnVideoEl = "";
	var m_strConnectionUrl = strConnectionUrl || "";
	var m_bSendVideo = options.send_video || false;
	var m_bSendAudio = options.send_audio || false;
	var m_mapPeers = {};
	var m_objRTCConfiguration = {iceServers: arrIceServers || []};
	var m_bIsPublisher = false;
	var m_objWS = null;
    // console.log("m_bSendVideo: ", m_bSendVideo);
    // console.log("m_bSendAudio: ", m_bSendAudio);
	self.onWsError = function(msg) {
		console.error("[WEBRTC2] onWsError, ", msg);
	}
	
	/*if (CloudHelpers.isSafari()) {
        navigator.mediaDevices.getUserMedia({ "audio": true, "video": true}).then(function (stream) {
            console.log("[WEBRTC2] Camera permission granted");
        }).catch(function(a1, a2){
            console.error("[WEBRTC2] error on getUserMedia (1) a1 = ", a1);
            console.error("[WEBRTC2] error on getUserMedia (1) a2 = ", a2);
		});
    }*/

	self.resetState = function() {
		m_objWS.close();    // It will call onServerClose()
	}

	self.handleIncomingError = function(error) {
		console.error("[WEBRTC2] ERROR: ", error);
		self.resetState();
	}

    self.reset = function() {
        if (m_objVideoEl && m_objVideoEl.srcObject) {
            m_objVideoEl.pause();
            m_objVideoEl.srcObject = null;
            m_strPeerOnVideoEl = "";
            m_objVideoEl.load();
            // m_objVideoEl.onl
	    }
    }

    self.el = function() {
		return m_objVideoEl;
    }

    self.onAutoplayBlocked = function() {
        // nothing
        console.error(_TAG + "onAutoplayBlocked");
    }
    
    function _checkAutoPlay(p) {
		var s = '';
		if (window['Promise']) {
			s = window['Promise'].toString();
		}

		if (s.indexOf('function Promise()') !== -1
			|| s.indexOf('function ZoneAwarePromise()') !== -1) {

			p.catch(function(error) {
				console.error(_TAG + "_checkAutoplay, error:", error)
				// Check if it is the right error
				if(error.name == "NotAllowedError") {
					console.error(_TAG + "_checkAutoPlay: error.name:", "NotAllowedError")
					self.onAutoplayBlocked();
				} else if (error.name == "AbortError" && CloudHelpers.isSafari()) {
					console.error(_TAG + "_checkAutoPlay: AbortError (Safari)")
					self.onAutoplayBlocked();
				} else {
					console.error(error);
					console.error(_TAG + "checkAutoplay: happened something else");
					// throw error; // happened something else
				}
			}).then(function(){
				console.log(_TAG + "checkAutoplay: then");
				// Auto-play started
			});
		} else {
			console.error(_TAG + "_checkAutoplay: could not work in your browser ", p);
		}
    }
    
    function _videoOnLoadedData() {
        console.warn(_TAG + "loadeddata");
        console.warn(_TAG + "currentTime = " + m_objVideoEl.currentTime);
    }

    self.initCalbacks = function () {
        if (m_objVideoEl) {
            m_objVideoEl.addEventListener("loadeddata", _videoOnLoadedData, true);
        }
    }

    self.removeCalbacks = function () {
        if (m_objVideoEl) {
            m_objVideoEl.removeEventListener("loadeddata", _videoOnLoadedData, true);
        }
    }

    self.createWatchingConnection = function(strSessionPartnerPeerUID) {
		// Reset connection attempts because we connected successfully
		connect_attempts = 0;
        console.assert( !(strSessionPartnerPeerUID in m_mapPeers) );
		objPeer = new RTCPeerConnection(m_objRTCConfiguration);
		objPeer.strPeerUID = strSessionPartnerPeerUID;
        m_mapPeers[strSessionPartnerPeerUID] = objPeer;
		objPeer.onaddstream = self.onRemoteStreamAdded;
		objPeer.onicecandidate = function(event) {
            if (event.candidate == null) {
                console.error("[WEBRTC2] ICE Candidate was null, done");
                return;
            }
            m_objWS.send(JSON.stringify({'to': strSessionPartnerPeerUID, 'ice': event.candidate}));
		};
		console.log("[WEBRTC2] Created peer connection for call, waiting for SDP");
	}

    self.getUserMediaConstraints = function() {
        var constraints = {};
        // this must be configurable
        constraints.audio = m_bSendAudio;
        constraints.video = m_bSendVideo;
        try {
            console.warn(_TAG + "getSupportedConstraints: ", navigator.mediaDevices.getSupportedConstraints());
        } catch(e) {
            console.error(_TAG + "error on getSupportedConstraints", e);
        }
        return constraints;
    }

    self.createPublishingConnection = function(strSessionPartnerPeerUID) {
		connect_attempts = 0;   // Reset connection attempts because we connected successfully
        console.assert( !(strSessionPartnerPeerUID in m_mapPeers) );

        m_bIsPublisher = true;
        if (!m_bSendAudio && !m_bSendVideo) {
            console.error("[WEBRTC2] Publisher must send audio or video stream");
            return;
        }
        navigator.mediaDevices.getUserMedia(self.getUserMediaConstraints()).then(function (objLocalStream) {
            console.log("[WEBRTC2] Local stream successfully received");
            var objPeer = new RTCPeerConnection(m_objRTCConfiguration);
            objPeer.strPeerUID = strSessionPartnerPeerUID;
            m_mapPeers[strSessionPartnerPeerUID] = objPeer;
            objPeer.onaddstream = self.onRemoteStreamAdded; // Required when a watcher is sending a stream
            objPeer.onicecandidate = function(event) {
                // We have a candidate, send it to the remote party with the same uuid
                if (event.candidate == null) {
                    console.error("[WEBRTC2] ICE Candidate was null, done");
                    return;
                }
                m_objWS.send(JSON.stringify({'to': strSessionPartnerPeerUID, 'ice': event.candidate}));
            };
            objPeer.onconnectionstatechange = function(event) {
                console.error("[WEBRTC2] Connection state changed " + objPeer.connectionState);
            };
            console.log("[WEBRTC2] Created peer connection for publishing");
            objPeer.addStream(objLocalStream);
            console.log("[WEBRTC2] Local SDP set");
            objPeer.createOffer().then(function(offer) {
                objPeer.setLocalDescription(offer)
                console.log("[WEBRTC2] Sending SDP offer");
                sdp = {'to': strSessionPartnerPeerUID, 'sdp': offer}
                m_objWS.send(JSON.stringify(sdp));
                console.warn("[WEBRTC2] Streaming (1)");
            }).catch(function(t){
                console.error('[WEBRTC2] error on createOffer ', t);
            });
        }).catch(function(a1, a2){
            console.error("[WEBRTC2] error on getUserMedia a1 = ", a1);
            console.error("[WEBRTC2] error on getUserMedia a2 = ", a2);
        });
	}

	// SDP received from peer, set remote description and create an answer when necessary
	self.onIncomingSDP = function(strSessionPartnerPeerUID, objSessionPartnerPeer, sdp) {
		sdp.sdp = sdp.sdp.replace(/profile-level-id=[^;]+/, 'profile-level-id=42e01f');
		console.log("[WEBRTC2] Incoming SDP from " + strSessionPartnerPeerUID + ": " + JSON.stringify(sdp));

		objSessionPartnerPeer.setRemoteDescription(sdp).then(function() {
			console.log("[WEBRTC2] Remote SDP set");
            if (m_bIsPublisher) {
                console.assert(sdp.type === "answer");
                console.log("[WEBRTC2] Got SDP answer from " + strSessionPartnerPeerUID);
            } else {
                console.assert(sdp.type === "offer");
                console.log("[WEBRTC2] Got SDP offer from " + strSessionPartnerPeerUID);

                // Local description was set, send it to peer
                onLocalDescription = function(desc) {
                    console.log("[WEBRTC2] Got local description: " + JSON.stringify(desc));
                    objSessionPartnerPeer.setLocalDescription(desc).then(function() {
                        console.log("[WEBRTC2] Sending SDP answer to " + strSessionPartnerPeerUID);
                        sdp = {'to': strSessionPartnerPeerUID, 'sdp': objSessionPartnerPeer.localDescription}
                        m_objWS.send(JSON.stringify(sdp));
                        console.warn("[WEBRTC2] Streaming (2)");
                        _checkAutoPlay(m_objVideoEl.play());
                    });
                }

                // Are watcher going to send its streams to publisher?
                if (m_bSendVideo || m_bSendAudio) {
                    console.log("[WEBRTC2] Watcher is configured to send stream");
                    navigator.mediaDevices.getUserMedia({audio: m_bSendAudio, video: m_bSendVideo}).then(function(objLocalStream) {
                        objSessionPartnerPeer.addStream(objLocalStream);
                        console.log("[WEBRTC2] Local SDP set, creating answer");
                        objSessionPartnerPeer.createAnswer().then(onLocalDescription).catch(function(t){
                            console.error('[WEBRTC2] error on createAnswer (1) ', t);
                        });
                    });
                } else {
                    console.log("[WEBRTC2] Creating answer without stream sending");
                    objSessionPartnerPeer.createAnswer().then(onLocalDescription).catch(function(t){
                        console.error('[WEBRTC2] error on createAnswer (2) ', t);
                    });
                }
            }
		}).catch(function(t){
			console.error('[WEBRTC2] error on setRemoteDescription ', t);
		});
	}

	// ICE candidate received from peer, add it to the peer connection
	self.onIncomingICE = function(strSessionPartnerPeerUID, objSessionPartnerPeer, ice) {
		console.log("[WEBRTC2] Incoming ICE from " + strSessionPartnerPeerUID + ": " + JSON.stringify(ice));
		var candidate = new RTCIceCandidate(ice);
		objSessionPartnerPeer.addIceCandidate(candidate).catch(function(t){
			console.error('[WEBRTC2] error on addIceCandidate ', t);
		});
	}

	self.onServerMessage = function(event) {
        console.log("[WEBRTC2] Received " + event.data);
        if (event.data.startsWith("HELLO")) {
            console.log("[WEBRTC2] Registered with server, waiting for stream");
            return;
        } else if (event.data.startsWith("SESSION_STARTED")) {
            var strSessionPartnerPeerUID = event.data.split(" ")[1];
            console.log("[WEBRTC2] Publisher " + strSessionPartnerPeerUID + " is going to start session");
            self.createWatchingConnection(strSessionPartnerPeerUID);
            return;
        } else if (event.data.startsWith("SESSION_STOPPED")) {
            var strSessionPartnerPeerUID = event.data.split(" ")[1];
            console.log("[WEBRTC2] Session of publisher " + strSessionPartnerPeerUID + " is terminated");
            if (strSessionPartnerPeerUID in m_mapPeers) {
                if (!!m_mapPeers[strSessionPartnerPeerUID]) {
                    m_mapPeers[strSessionPartnerPeerUID].close();
                    m_mapPeers[strSessionPartnerPeerUID] = null;
                }
                delete m_mapPeers[strSessionPartnerPeerUID];
                if (m_objVideoEl && m_strPeerOnVideoEl === strSessionPartnerPeerUID) {
                    self.reset();
                }
            }
            return;
        } else if (event.data.startsWith("START_SESSION")) {
            var strSessionPartnerPeerUID = event.data.split(" ")[1];
            console.log("[WEBRTC2] Watcher " + strSessionPartnerPeerUID + " has come and awaiting for publishing");
            self.createPublishingConnection(strSessionPartnerPeerUID);
            return;
        } else if (event.data.startsWith("ERROR")) {
            self.handleIncomingError(event.data);
            return;
        } else {
            // Handle incoming JSON SDP and ICE messages
            var objMsg = null, strPeerUID = "", objPeer = null;
            try {
                objMsg = JSON.parse(event.data);
                strPeerUID = objMsg.from
                objPeer = m_mapPeers[strPeerUID]
            } catch (e) {
                if (e instanceof SyntaxError) {
                    self.handleIncomingError("Error parsing incoming JSON: " + event.data);
                } else {
                    self.handleIncomingError("Unknown error parsing response: " + event.data);
                }
                return;
            }

            if (objMsg.sdp != null) {
                self.onIncomingSDP(strPeerUID, objPeer, objMsg.sdp);
            } else if (objMsg.ice != null) {
                self.onIncomingICE(strPeerUID, objPeer, objMsg.ice);
            } else {
                self.handleIncomingError("Unknown incoming JSON: " + objMsg);
            }
		}
	}

	// window.onload = websocketServerConnect;

	self.stopWS = function(){
        m_objWS.close();
        self.removeCalbacks();
		// self.onServerClose();
		// delete self;
	}

	self.onServerClose = function(event) {
		console.error("[WEBRTC2] Closed WebRTC ", event);
		self.reset();

        for (strSessionPartnerPeerUID in m_mapPeers) {
            if (!!m_mapPeers[strSessionPartnerPeerUID]) {
                m_mapPeers[strSessionPartnerPeerUID].close();
                m_mapPeers[strSessionPartnerPeerUID] = null;
            }
        }

        m_mapPeers = {};
	}

	self.onServerError = function(event) {
		console.error("[WEBRTC2] Unable to connect to server, did you add an exception for the certificate?", event)
	}

	self.onRemoteStreamAdded = function(event) {
		videoTracks = event.stream.getVideoTracks();
		audioTracks = event.stream.getAudioTracks();

		if (videoTracks.length > 0 || audioTracks.length > 0) {
			console.log('[WEBRTC2] Incoming stream: ' + videoTracks.length + ' video tracks and ' + audioTracks.length + ' audio tracks');
			if (m_objVideoEl && m_strPeerOnVideoEl === "") {
			    m_objVideoEl.srcObject = event.stream;
			    m_strPeerOnVideoEl = event.currentTarget.strPeerUID;
            }
        }
        else {
			self.handleIncomingError('[WEBRTC2] Stream with unknown tracks added, resetting');
		}
	}

	self.errorUserMediaHandler = function() {
		console.error("[WEBRTC2] Browser doesn't support getUserMedia!");
	}

	self.startWS = function() {
		self.connect_attempts++;
		if (self.connect_attempts > 3) {
			console.error("[WEBRTC2] Too many connection attempts, aborting. Refresh page to try again");
			return;
		}
		console.log("[WEBRTC2] Connecting to server...");
		
		m_objWS = new WebSocket(m_strConnectionUrl);

		/* When connected, immediately register with the server */
		m_objWS.addEventListener('open', function(event) {
			m_objWS.send('HELLO ' + window.CloudPlayerWebRTC2.version);
			console.log("[WEBRTC2] Registering with server");
		});
		m_objWS.addEventListener('error', self.onServerError);
		m_objWS.addEventListener('message', self.onServerMessage);
		m_objWS.addEventListener('close', self.onServerClose);

		var constraints = {video: true, audio: true};
	}
};

window.CloudPlayerWebRTC2.version = "2.0.1";
window.CloudCameraTimelineMode = {};

CloudCameraTimelineMode.MINUTES_MODE = {
	name: 'MINUTES_MODE',
	code: 0,
};

CloudCameraTimelineMode.HOUR_MODE = {
	name: 'HOUR_MODE',
	code: 1,
};

CloudCameraTimelineMode.HOURS_12_MODE = {
	name: 'HOURS_12_MODE',
	code: 2,
};

window.CloudCameraTimelineView = function(viewid, options, parent){
	var self = this;
	options = self.options = options || {};
	var mSource = null;
	var mTimezoneOffset = 0;
	var mConn = null;

	// cache by every 3 hours
	var mCacheDurationGrid = 10800000;
	var mCacheRecords = {};
	var mCursorPosition = 0;
	var mTimelineDrawing = false;
	var mContainerWidth = 0;
	var mDistPx = 0;
	var mDistSec = 0;
	var mViewID = viewid;
	var mIntervalPolingData = null;
	var mPolingDataMax = 0;
	var mPlayer = null;
	var mRangeMin = -1;
	var mRangeMax = -1;
	var mNavArrowsHided = false;
	var mStartMove = false;
	var mFirstMoveX = 0;
	var mLastMoveX = 0;
	var mAnimationToProgress = false;
	var mLeftDataPadding = 0;
	var mRightDataPadding = 0;
	var mOptionCalendar = false;
	var mUseTimezone = null;
	var mRangePolingDataEveryInSec = null;
	var mPolingRangeDataInterval = null;
	var mCallbacks = CloudHelpers.createCallbacks();
	var el_timeline_container	= null;
	var el_calendar_container 	= null;
	var el_live_container		= null;
	var timeline_range_or_not	= null;

	if (options.useTimezone) {
		mUseTimezone = options.useTimezone;
		console.warn("[CloudTimeline] useTimezone: " + mUseTimezone);
	}

	if(options["calendar"] !== undefined){
		mOptionCalendar = options["calendar"] == true;
	}

	if(options["polingRangeDataEveryInSec"] !== undefined) {
		mRangePolingDataEveryInSec = parseInt(options["polingRangeDataEveryInSec"]);
	}

	function clone(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}

	var mModes = {};
	mModes["HOURS_12_MODE"] = {
		len_ms: 9*60*60*1000, // 9 hours
		step_short: 30*60*1000, // 30 minutes
		step_long: 150*60*1000 // 2 hours and 30 minutes
	};
	mModes["HOUR_MODE"] = {
		len_ms: 90*60*1000, // 1 hour and 30 minutes
		step_short: 5*60*1000, // 5 minutes
		step_long: 30*60*1000 // 30 minutes
	};
	mModes["MINUTES_MODE"] = {
		len_ms: 15*60*1000,  // 15 minutes
		step_short: 1*60*1000,  // 1 minute
		step_long: 5*60*1000  // 5 minutes
	};
	var mRangeLenModeMs = 3*60*60*1000 + 60*1000; // 3 hours

	var mDefaultMode = clone(mModes["MINUTES_MODE"]);
	
	var timeline_target = document.createElement("div");
	// default
	timeline_target.classList.add("cloudcameratimeline");
	timeline_target.classList.add("green");
	timeline_target.classList.add("black");
	
	if (parent && parent.player) {
	    el_timeline_container	= parent.player.getElementsByClassName('cloudplayer-timeline-container')[0];
	    el_calendar_container 	= parent.player.getElementsByClassName('cloudplayer-calendar-container')[0];
	    el_live_container	= parent.player.getElementsByClassName('cloudplayer-live-container')[0];	
	} else {
	    el_timeline_container	= document.getElementsByClassName('cloudplayer-timeline-container')[0];
	    el_calendar_container 	= document.getElementsByClassName('cloudplayer-calendar-container')[0];
	    el_live_container	= document.getElementsByClassName('cloudplayer-live-container')[0];
	}


	timeline_target.innerHTML = ''
		+ '<div class="cloudcameratimeline-calendar" style="display: none"></div>'
		+ '<div class="cloudcameratimeline-shift shift-minus">-1h</div>'
		+ '<div class="cloudcameratimeline-left"></div>'
		+ '<div class="cloudcameratimeline-content">'
		+ '		<div class="cloudcameratimeline-scale"></div>'
		+ '		<div class="cloudcameratimeline-data"></div>'
		+ '		<div class="cloudcameratimeline-cursor"></div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudcameratimeline-right"></div>'
		+ '<div class="cloudcameratimeline-shift shift-plus">+1h</div>'
		+ '<div class="cloudcameratimeline-goto-live disabled">Live</div>'
		+ '';
	
	self.left_border = Math.floor(CloudHelpers.getCurrentTimeUTC() - mDefaultMode.len_ms/2);
	self.right_border = Math.floor(self.left_border + mDefaultMode.len_ms);
	
	var mElementContent = timeline_target.getElementsByClassName('cloudcameratimeline-content')[0];
	var mElementData = timeline_target.getElementsByClassName('cloudcameratimeline-data')[0];
	var mElementCalendar = timeline_target.getElementsByClassName('cloudcameratimeline-calendar')[0];
	var mElementCursor = timeline_target.getElementsByClassName('cloudcameratimeline-cursor')[0];
	var mElementScale = timeline_target.getElementsByClassName('cloudcameratimeline-scale')[0];
	var mElementGotoLive = timeline_target.getElementsByClassName('cloudcameratimeline-goto-live')[0];
	var mLeftArrow = timeline_target.getElementsByClassName('cloudcameratimeline-left')[0];
	var mRightArrow = timeline_target.getElementsByClassName('cloudcameratimeline-right')[0];
	var mShiftMinus = timeline_target.getElementsByClassName('shift-minus')[0];
	var mShiftPlus = timeline_target.getElementsByClassName('shift-plus')[0];
	
	el_calendar_container.appendChild(mElementCalendar);
	el_live_container.appendChild(mElementGotoLive);

	self.elem = document.getElementById(viewid);
	if ((self.elem != null) && (self.elem.tagName === 'DIV')){
	    self.elem.appendChild(timeline_target);
	    timeline_range_or_not = self.elem;
	} else {
	    el_timeline_container.appendChild(timeline_target);
	    timeline_range_or_not = el_timeline_container;	    
	}


	/*
	self.elem = document.getElementById(viewid);

	if (self.elem == null){
		console.error("[CloudCameraTimeline] Not found element");
		return null;
	}
	
	if(self.elem.tagName != 'DIV'){
		console.error("[CloudCameraTimeline] Expected DIV tag but got " + self.elem.tagName);
		return null;
	}
	
	// default
	self.elem.classList.add("cloudcameratimeline");
	self.elem.classList.add("green");
	self.elem.classList.add("black");

	var el_timeline_container = document.getElementsByClassName('cloudplayer-timeline-container')[0];
	var el_calendar_container = document.getElementsByClassName('cloudplayer-calendar-container')[0];
	var el_live_container = document.getElementsByClassName('cloudplayer-live-container')[0];
	el_timeline_container.appendChild(self.elem);

	self.elem.innerHTML = ''
		+ '<div class="cloudcameratimeline-calendar" style="display: none"></div>'
		+ '<div class="cloudcameratimeline-shift shift-minus">-1h</div>'
		+ '<div class="cloudcameratimeline-left"></div>'
		+ '<div class="cloudcameratimeline-content">'
		+ '		<div class="cloudcameratimeline-scale"></div>'
		+ '		<div class="cloudcameratimeline-data"></div>'
		+ '		<div class="cloudcameratimeline-cursor"></div>'
		+ '</div>'
		+ '</div>'
		+ '<div class="cloudcameratimeline-right"></div>'
		+ '<div class="cloudcameratimeline-shift shift-plus">+1h</div>'
		+ '<div class="cloudcameratimeline-goto-live disabled">Live</div>'
		+ '';
	
	self.left_border = Math.floor(CloudHelpers.getCurrentTimeUTC() - mDefaultMode.len_ms/2);
	self.right_border = Math.floor(self.left_border + mDefaultMode.len_ms);
	var mElementContent = self.elem.getElementsByClassName('cloudcameratimeline-content')[0];
	var mElementData = self.elem.getElementsByClassName('cloudcameratimeline-data')[0];
	var mElementCalendar = self.elem.getElementsByClassName('cloudcameratimeline-calendar')[0];
	var mElementCursor = self.elem.getElementsByClassName('cloudcameratimeline-cursor')[0];
	var mElementScale = self.elem.getElementsByClassName('cloudcameratimeline-scale')[0];
	var mElementGotoLive = self.elem.getElementsByClassName('cloudcameratimeline-goto-live')[0];
	var mLeftArrow = self.elem.getElementsByClassName('cloudcameratimeline-left')[0];
	var mRightArrow = self.elem.getElementsByClassName('cloudcameratimeline-right')[0];
	var mShiftMinus = self.elem.getElementsByClassName('shift-minus')[0];
	var mShiftPlus = self.elem.getElementsByClassName('shift-plus')[0];
	el_calendar_container.appendChild(mElementCalendar);
	el_live_container.appendChild(mElementGotoLive);
	*/

	var mCalendar = null;

	function _initCalendar() {
		if (mPlayer == null) {
			console.error("[TIMELINE] player is null") ;
			return;
		}

		if (mOptionCalendar) {
			mCalendar = new CloudCameraCalendarView(mPlayer.getCalendarContent(), options);
			mCalendar.onChangeDate = function(t, e) {
				if (mPlayer == null) {
					console.error("[TIMELINE] player is null") ;
					return;
				}
				mPlayer.setPosition(t - mTimezoneOffset);
				self.moveToPosition(t - mTimezoneOffset);
				mPlayer.play(e);
			};
			self.calendar = mCalendar;
		}
	}

	mElementCalendar.onclick = function() {
		if (mCalendar != null) {
			console.log(mPlayer);
			mPlayer.player.classList.remove('showing-settings', 'showing-zoom');
			mCalendar.toggleCalendar(mElementCalendar);
		}
	}

	mShiftMinus.onclick = function() {
				var t = mPlayer.getPosition();
  				// Live video and position is not detected
				if (t == 0)
				    t = CloudHelpers.getCurrentTimeUTC();
				if (t != 0)
				{	
					mPlayer.stop("by_timeline_2");
					mPlayer.setPosition(t - 3600*1000);
					self.moveToPosition(t - 3600*1000);
					mPlayer.play();
				}
				else
					console.log("Invalid current position");
	};

	mShiftPlus.onclick = function() {
				var isLive = mPlayer.isLive();
				if (isLive == true){
				    return;
				}
				var t = mPlayer.getPosition();
				if (t == 0)
				    t = CloudHelpers.getCurrentTimeUTC();
				if (t != 0)
				{	
					mPlayer.stop("by_timeline_2");
					mPlayer.setPosition(t + 3600*1000);
					self.moveToPosition(t + 3600*1000);
					mPlayer.play();
				}
				else
					console.log("Invalid current position ");
	};

	function _gotoLive(e){
		if(mPlayer != null && mPlayer.getSource() != null){
			var sClasses = mElementGotoLive.classList.value;
			if(sClasses.indexOf('now') == -1 && sClasses.indexOf('disabled') == -1){
				mPlayer.setPosition(CloudPlayer.POSITION_LIVE);
				mPlayer.play(e);
				self.moveToPosition(CloudHelpers.getCurrentTimeUTC());
			}
			if(sClasses.indexOf('now') != -1){
				self.moveToPosition(CloudHelpers.getCurrentTimeUTC());
			}
		}
	}
	mElementGotoLive.onclick = _gotoLive;

	function _updateScale(){
		if((mContainerWidth != mElementScale.offsetWidth) && (mElementScale.offsetWidth != 0)){
			mContainerWidth = mElementScale.offsetWidth
		}
		mDistPx = mContainerWidth / (self.right_border - self.left_border); // TODO on init mode or resize
		mDistSec = (self.right_border - self.left_border) / mContainerWidth; // TODO on init mode or resize
	}
	_updateScale();

	function _normalizeT(t){
		var tmp = t;
		tmp = tmp - tmp%1000;
		tmp = tmp - tmp % mCacheDurationGrid;
		return tmp;
	}
	
	function _stopPolingCursor(){
		clearInterval(self._polingCursor);
		mElementGotoLive.classList.remove("now");
		mElementGotoLive.classList.add("disabled");
	}

	function _polingUpdateData(){
		if(mSource != null && mSource.type == 'camera'){
			var camid = mSource.getID();
			var startDT = CloudHelpers.formatUTCTime(mPolingDataMax);
			if (mConn._getAPI() == null) {
				return;
			}
			mConn._getAPI().storageRecordsFirst(camid, startDT, 50).done(function(r){
				var bNeedExecuteCallback = false;
				for (var i in r.objects) {
					var record = r.objects[i];
					var startUTCTime = CloudHelpers.parseUTCTime(record.start);
					var endUTCTime = CloudHelpers.parseUTCTime(record.end);
					
					var nsta = _normalizeT(startUTCTime);
					var nend = _normalizeT(endUTCTime);
					if (!mCacheRecords[nsta]) {
						mCacheRecords[nsta] = { status: 1, data: [] };
					}
					var nUpdated = 0;
					var maxVal = 0;
					var minVal = 0;
					for(var pr in mCacheRecords[nsta].data){
						var period = mCacheRecords[nsta].data[pr];
						if (period.end > maxVal) {
							maxVal = period.end;
						}
						if (period.start < startUTCTime && startUTCTime - 2000 < period.end) {
							if (endUTCTime > period.end) {
								mCacheRecords[nsta].data[pr].end = endUTCTime;
								nUpdated = 1;
								// console.log("Updated end period2 ", mCacheRecords[nsta].data[pr]);
								self._eventRedrawTimeline();
								bNeedExecuteCallback = true;
							} else {
								nUpdated = 2;
								// console.log("Skip");
							}
						}
					}
					if (nUpdated == 0) {
						if (maxVal < endUTCTime) {
							var period = {start: startUTCTime, end: endUTCTime};
							mCacheRecords[nsta].data.push(period);
							// console.warn("Added period: ", period);
							self._eventRedrawTimeline();
							bNeedExecuteCallback = true;
						}
					}

					if(endUTCTime > mPolingDataMax){
						mPolingDataMax = endUTCTime + CloudHelpers.ONE_SECOND;
					}
				}
				if (bNeedExecuteCallback) {
					mCallbacks.executeCallbacks(CloudPlayerEvent.TIMELINE_END_UPDATED, {});
					if (mPlayer != null) {
						setTimeout(mPlayer.onTimelineEndUpdate, 1);
					}
				}
			});
		}
	}

	function _stopPolingData(){
		clearInterval(mIntervalPolingData);
	}
	
	function _startPolingData(){
		clearInterval(mIntervalPolingData);
		mPolingDataMax = CloudHelpers.getCurrentTimeUTC() - CloudHelpers.ONE_MINUTE;
		mIntervalPolingData = setInterval(_polingUpdateData, 30000); // every 30 sec
	}

	function _calcPosition(t){
		return Math.floor((t - self.left_border) * mDistPx);
	}

	self.removeCallback = function(uniqname){
		mCallbacks.removeCallback(uniqname);
	}
	
	self.addCallback = function(uniqname, func){
		mCallbacks.addCallback(uniqname, func);
	}

	function _updateCursorPosition(opt){
		opt = opt || {};
		// console.log("self.left_border: " + self.left_border);
		// console.log("mCursorPosition: " + mCursorPosition);
		if(mPlayer != null && mPlayer.getSource() != null){
			if(mPlayer.isLive()){
				mElementGotoLive.classList.remove("disabled");
				mElementGotoLive.classList.add("now");
			}else{
				mElementGotoLive.classList.remove("disabled");
				mElementGotoLive.classList.remove("now");
			}
		}else{
			mElementGotoLive.classList.remove("now");
			mElementGotoLive.classList.add("disabled");
		}

		if(mCursorPosition < (self.left_border - 1000) || mCursorPosition > (self.right_border + 1000)){
			if(mElementCursor.style.display != 'none'){
				mElementCursor.style.display = 'none'
			}
			return;
		}
		if(mElementCursor.style.display != 'inline-block'){
			mElementCursor.style.display = 'inline-block';
		}
		if(mCursorPosition != 0){
			var le = _calcPosition(mCursorPosition);
			var leftPositionAdjustment = -10;
			if(le > -5 && le < mContainerWidth){

				mElementCursor.style.left = (le + mLeftDataPadding + leftPositionAdjustment) + 'px';
				
				// automove if near to ritght border
				var diff = mContainerWidth - le;
				var ritgh_diff_procents = (diff*100/mContainerWidth);
				if(ritgh_diff_procents < 3){
					if(opt.sender == "poling" || opt.sender == "click"){
						if(!self.isRange() && !mStartMove && !mAnimationToProgress){
							console.log("[TIMELINE] Auto move if not user drag");
							setTimeout(function(){
								console.log("[TIMELINE] mCursorPosition: " + mCursorPosition);
								self.moveToPosition(mCursorPosition);
							},100);
						}
					}
				}
			}else{
				if(mElementCursor.style.display != 'none'){
					mElementCursor.style.display = 'none'
				}
			}
		}else{
			if(mElementCursor.style.display != 'none'){
				mElementCursor.style.display = 'none'
			}
		}
	}

	function _startPolingCursor(){
		_stopPolingCursor();
		self._polingCursor = setInterval(function(){
			if(mPlayer != null){
				var currPos = mPlayer.getPosition();
				if (currPos != 0) {
					mCursorPosition = mPlayer.getPosition();
				}
				// console.log("mCursorPosition1: " + mCursorPosition);
			}else{
				// console.log("mCursorPosition2: " + mCursorPosition);
				mCursorPosition = 0;
			}
			_updateCursorPosition({sender: "poling"});
		},1000);
	}

	function _isLoadedData(left,right){
		var start = _normalizeT(left);
		var end = _normalizeT(right) + mCacheDurationGrid;
		if(end < start){
			console.error("[ERROR] start must be more than end");
			return false;
		}
		var bLoaded = true;
		for(var i = start; i <= end; i = i + mCacheDurationGrid){
			if(!mCacheRecords[i]){
				bLoaded = false;
			}else if (mCacheRecords[i].status != 1){
				bLoaded = false;
			}
		}
		return bLoaded;
	}

	function _updatedRecords(){
		var calltime = new Date().getTime();
		// console.log("_updatedRecords() start ");
		// self.el_data.innerHTML = '';
		var start = _normalizeT(self.left_border);
		var end = _normalizeT(self.right_border) + mCacheDurationGrid;
		if(end < start){
			console.error("[ERROR] start must be more than end");
			return false;
		}
		if(self.isRange()){
			if(start < mRangeMin_Normalize){
				console.error("[ERROR] Going beyond the range (start)");
				return false;
			}
			
			if(end > mRangeMax_Normalize){
				console.error("[ERROR] Going beyond the range (end)");
				return false;
			}
		}
		
		// document.getElementsByClassName("cloudcameratimeline-data")[0].getElementsByClassName("crect")
		// var crectList = document.getElementsByClassName("cloudcameratimeline-data")[0].getElementsByTagName("crect");
		var crectList = mElementData.getElementsByTagName("crect");
		var crect_i = 0;
		// console.log("Before: " + crectList.length);
		for(var i = start; i <= end; i = i + mCacheDurationGrid){
			var c = mCacheRecords[i];
			if(c && c.status == 1){
				for(var di = 0; di < c.data.length; di++){
					if(c.data[di].end < self.left_border)
						continue;
					if(c.data[di].start > self.right_border)
						continue;
					var start_rec_px_ = _calcPosition(c.data[di].start);
					var end_rec_px_ = _calcPosition(c.data[di].end);
					var sLeft = start_rec_px_ + "px";
					var sWidth = (end_rec_px_ - start_rec_px_) + "px";
					if(crect_i < crectList.length){
						crectList[crect_i].style.display = "";
						crectList[crect_i].style.left = sLeft;
						crectList[crect_i].style.width = sWidth;
						crect_i++;
					}else{
						var el = '<crect style="left: ' + sLeft + '; width: ' + sWidth + '"></crect>';
						mElementData.innerHTML += el;
						crect_i++;
					}
				}
			}
		}
		// console.log("After: " + crectList.length);
		for(var i = crect_i; i < crectList.length; i++){
			if(crectList[i].style.display != "none"){
				crectList[i].style.display = "none";
			}
		}
		// console.log("_updatedRecords() end " + (new Date().getTime() - calltime) + " ms, count elements: " + mElementData.childElementCount);
	}
	
	function _loadRecordsPortion(i){
		// console.log("_loadRecordsPortion(" + i + ")");
		var p = CloudHelpers.promise();
		var ca = mCacheRecords[i];
		if(ca && ca.status == 1) {
			p.resolve();
			return p;
		}
		
		if(mSource != null){
			mCacheRecords[i] = {};
			mCacheRecords[i].status = 0;
			mCacheRecords[i].data = [];

			mSource.getTimeline(i, i + mCacheDurationGrid).done(function(timeline){
				// console.warn(timeline);
				if(mCacheRecords[i]){
					mCacheRecords[i].status = 1;
					mCacheRecords[i].data = timeline.periods;
				}
				_updatedRecords();
			}).fail(function(){
				if(mCacheRecords[i]){
					mCacheRecords[i].status = -1;
				}
				p.reject();
			})
		}else{
			p.reject();
		}
		return p;
	}
	
	function _loadData(left,right){
		// console.log("_loadData(" + left + "," + right + ")");
		var start = _normalizeT(left);
		var end = _normalizeT(right) + mCacheDurationGrid;
		if(end < start){
			console.error("[ERROR] start must be more than end");
			return false;
		}
		
		if(self.isRange()){
			if(left < mRangeMin_Normalize){
				console.error("[ERROR] Going beyond the range (left)");
				return false;
			}
			
			if(end > mRangeMax_Normalize){
				console.error("[ERROR] Going beyond the range (right)");
				return false;
			}
		}

		if (mSource != null) {
			// console.warn("TODO load data");
			for(var i = start; i <= end; i = i + mCacheDurationGrid){
				var c = mCacheRecords[i];
				if(!c || (c && c.status == -1)){
					_loadRecordsPortion(i);
				}
			}
		}
	}
	
	function _isDifferentTimelinePeriods(data1, data2) {
		if (data1.length == 0 && data2.length == 0) {
			return false;
		}
		// check the data
		for (var i1 = 0; i1 < data1.length; i1++) {
			var p1 = data1[i1];
			var bFound = false;
			for (var i2 = 0; i2 < data2.length; i2++) {
				var p2 = data2[i2];
				if (p1.start == p2.start && p1.end == p2.end) {
					bFound = true;
				}
			}
			if (!bFound) {
				return true;
			}
		}
		// check the data
		for (var i2 = 0; i2 < data2.length; i2++) {
			var p2 = data2[i2];
			var bFound = false;
			for (var i1 = 0; i1 < data1.length; i1++) {
				var p1 = data1[i1];
				if (p1.start == p2.start && p1.end == p2.end) {
					bFound = true;
				}
			}
			if (!bFound) {
				return true;
			}
		}
		return false;
	}
	
	function _reloadData(i) {
		mSource.getTimeline(i, i + mCacheDurationGrid).done(function(timeline){
			if (_isDifferentTimelinePeriods(mCacheRecords[i].data, timeline.periods)) {
				mCacheRecords[i].data = timeline.periods;
				_updatedRecords();
			}
		})
	}

	function _reloadRangeData() {
		console.log("_reloadRangeData");
		var start = _normalizeT(mRangeMin);
		var end = _normalizeT(mRangeMax) + mCacheDurationGrid;
		if (mSource != null) {
			for(var i = start; i <= end; i = i + mCacheDurationGrid){
				var c = mCacheRecords[i];
				if (c && c.status == 1) { 
					_reloadData(i);
				}
			}
		}
	}

	function _stopPolingRangeData() {
		console.log("_stopPolingRangeData");
		clearInterval(mPolingRangeDataInterval);
	}

	function _startPolingRangeData() {
		_stopPolingRangeData();
		// console.log("_startPolingRangeData ", mRangePolingDataEveryInSec);
		if (mRangePolingDataEveryInSec != null && self.isRange()) {
			// console.log("_startPolingRangeData start");
			mPolingRangeDataInterval = setInterval(function () {
				if (mSource != null) {
					_reloadRangeData();
				}
			}, mRangePolingDataEveryInSec*1000);
		}
	}

	self.reloadRangeData = function() {
		_reloadRangeData();
	}

	function _disposeTimeline(){
		console.warn("_disposeTimeline");
		mPolingDataMax = 0;
		mCacheRecords = {};
		mElementData.innerHTML = "";
		_stopPolingCursor();
		_stopPolingData();
		_stopPolingRangeData();
		if (mCalendar != null) {
			mCalendar.dispose();
		}
	}
	
	function _changedSource(){
		console.warn("_changedSource");
		_disposeTimeline();
		if(mPlayer != null){
			mSource = mPlayer.getSource();
			if(mSource){
				if (mUseTimezone) {
					mTimezoneOffset = CloudHelpers.getOffsetTimezone(mUseTimezone);
				} else {
					mTimezoneOffset = CloudHelpers.getOffsetTimezone(mSource.getTimezone());
				}
				mConn = mSource._getConn();	
				if (mCalendar != null) {
					mCalendar.setSource(mSource);
				}
				_startPolingCursor();
				_startPolingData();
				_startPolingRangeData();
			}else{
				mConn = null;
				mSource = null;
				mTimezoneOffset = 0;
			}
		}else{
			mSource = null;
		}
		self.redrawTimeline({sender: "changed_source"});
	}
	
	function _playerEvent(evnt, args){
		console.warn("_playerEvent ", evnt);
		if(evnt.name == "SOURCE_CHANGED"){
			_changedSource();
			// mCalendar./
		}else if(evnt.name == "POSITION_JUMPED"){
			console.warn("POSITION_JUMPED", mPlayer)
			mCursorPosition = args.new_pos;
			_updateCursorPosition({sender: "pos jumped"});
			self.moveToPosition(args.new_pos);
			
		}
	}

	function _recalculateDataPaddings(){
		mLeftDataPadding = 0;
		if(mLeftArrow.style.display != "none"){
			mLeftDataPadding += 80;
		}
		// if(mElementCalendar.style.display != "none"){
		// 	mLeftDataPadding += 40;
		// }
		mRightDataPadding = 0;
		if(mRightArrow.style.display != "none"){
			mRightDataPadding += 80;
		}
		// if(mElementGotoLive.style.display != "none"){
		// 	mRightDataPadding += 40;
		// }
		if(mLeftDataPadding == 0){
			mLeftDataPadding = 80
		}
		if(mRightDataPadding == 0){
			mRightDataPadding = 80;
		}

		mElementContent.style.width = "calc(100% - " + (mLeftDataPadding + mRightDataPadding) + "px)";
		mElementContent.style.left = mLeftDataPadding + "px";
		mElementData.style.width = "calc(100% - " + (mLeftDataPadding + mRightDataPadding) + "px)";
		mElementData.style.left = mLeftDataPadding + "px";
		mElementScale.style.width = "calc(100% - " + (mLeftDataPadding + mRightDataPadding) + "px)";
		mElementScale.style.left = mLeftDataPadding + "px";
	}

	self.hideCalendarButton = function(){
		if(mElementCalendar.style.display != "none"){
			mElementCalendar.style.display = "none";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.showCalendarButton = function(){
		if(mElementCalendar.style.display == "none"){
			mElementCalendar.style.display = "";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.hideArrowsButtons = function(){
		if(mLeftArrow.style.display != "none"){
			mLeftArrow.style.display = "none";
		}

		if(mRightArrow.style.display != "none"){
			mRightArrow.style.display = "none";
		}
		_recalculateDataPaddings();

		self.redrawTimeline();
	};

	self.showArrowsButtons = function(){
		if(mLeftArrow.style.display == "none"){
			mLeftArrow.style.display = "";
		}
		if(mRightArrow.style.display == "none"){
			mRightArrow.style.display = "";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.hideShiftButtons = function(){
		if(mShiftMinus.style.display != "none"){
			mShiftMinus.style.display = "none";
		}

		if(mShiftPlus.style.display != "none"){
			mShiftPlus.style.display = "none";
		}
		_recalculateDataPaddings();

		self.redrawTimeline();
	};

	self.showShiftButtons = function(){
		if(mShiftMinus.style.display == "none"){
			mShiftMinus.style.display = "";
		}
		if(mShiftPlus.style.display == "none"){
			mShiftPlus.style.display = "";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.hideGotoLiveButton = function(){
		if(mElementGotoLive.style.display != "none"){
			mElementGotoLive.style.display = "none";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.showGotoLiveButton = function(){
		if(mElementGotoLive.style.display == "none"){
			mElementGotoLive.style.display = "";
		}
		_recalculateDataPaddings();
		self.redrawTimeline();
	}

	self.setPlayer = function(player){
		_disposeTimeline();
		
		
		if (mPlayer) {
			mPlayer.removeCallback(mViewID);
		}
		if (player) {
			mPlayer = player;
			_initCalendar();
			_changedSource();
			mPlayer.addCallback(mViewID, _playerEvent);
			
			mPlayer.setFullscreenCallback (function(){
				console.warn("fullscreenCallback");
				self.redrawTimeline();
			});
		} else {
			mPlayer = null;
			_changedSource();
		}
	}

	self.setRange = function(startPos,endPos){
		console.warn("[TIMELINE] setRange todo");
		mRangeMin = startPos;
		mRangeMax = endPos;
		mRangeMin_Normalize = _normalizeT(startPos);
		mRangeMax_Normalize = _normalizeT(endPos) + mCacheDurationGrid;
		
		timeline_range_or_not.classList.add("range");
		//self.elem.classList.add("range");
		_updateScale();
		var range_len = mRangeMax - mRangeMin;
		var start_t = mRangeMin;
		var end_t = mRangeMax;
		
		if (range_len <= mRangeLenModeMs) {
			self.hideArrowsButtons();
			self.hideShiftButtons();
			mDefaultMode.len_ms = range_len;
			self.left_border = Math.floor(start_t);
			self.right_border = Math.floor(end_t);
		} else {
			end_t = mRangeMin + mRangeLenModeMs;
			mDefaultMode.len_ms = mRangeLenModeMs;

			// correct if current time
			var t = CloudHelpers.getCurrentTimeUTC();
			if(t < mRangeMax && t > mRangeMin){
				if(t > end_t){
					end_t = t + Math.floor(mRangeLenModeMs/2);
					if(end_t > mRangeMax){
						end_t = mRangeMax;
					}
					start_t = end_t - mRangeLenModeMs;
				}
			}
			self.left_border = Math.floor(start_t);
			self.right_border = Math.floor(end_t);
		}

		// self.animationTo(start_t, end_t, newmode);
		self.redrawTimeline({sender: "animation"});
	}

	self.isRange = function(){
		return mRangeMin != -1 && mRangeMax != -1;
	}
	
	self.resetRange = function(){
		console.warn("[TIMELINE] resetRange");
		mRangeMin = -1;
		mRangeMax = -1;
		timeline_range_or_not.classList.remove("range");
		//self.elem.classList.remove("range");
		self.showArrowsButtons();
		self.showShiftButtons();
		_updateScale();
	}

	self.months = ['Jan','Feb','Mar','Apr','May','Jun', 'Jul', 'Aug', 'Spt', 'Oct', 'Nov', 'Dec'];

	self.dateFormat = function(t, bMonth, bAmPm){
		var str = "";
		if(self.isRange()){
			var t = Math.floor((t - mRangeMin)/1000);
			var nSeconds = t % 60;
			t = (t - nSeconds) / 60;
			var nMinutes = t % 60;
			var nHours = (t - nMinutes) / 60;
			var str = ("00" + nHours).slice(-2) + ":"
				+ ("00" + nMinutes).slice(-2);
		}else{
			var d = new Date();
			d.setTime(t + mTimezoneOffset);
			var hours = d.getUTCHours()
			var suffix = '';
			if (bAmPm) {
				suffix = hours>=12 ? ' pm' : ' am';
				hours = hours==0 ? 12 : (hours>12 ? hours-12 : hours);
			}

			var str = ("00" + hours).slice(-2) + ":"
				+ ("00" + d.getUTCMinutes()).slice(-2);
			str += suffix;
			if(bMonth){
				str += " (" + d.getUTCDate() + " " + self.months[d.getUTCMonth()] + ")";
			}
		}
		return str;
	}

	self._eventRedrawTimeline = function(){
		setTimeout(self.redrawTimeline,10);
	}

	self.redrawTimeline = function(opt){
		// console.log("redrawTimeline");
		opt = opt || {};
		if(mTimelineDrawing) {
			console.warn("redrawTimeline busy");
			return;
		}
		mTimelineDrawing = true;
		_updateScale();
		
		var left_border_short = Math.floor(self.left_border / mDefaultMode.step_short);
		var right_border_short = Math.floor(self.right_border / mDefaultMode.step_short) + 1;
		
		// left and right arrows
		if(self.isRange()){
			if(self.left_border <= mRangeMin){
				mLeftArrow.classList.add("disabled");
			}else{
				mLeftArrow.classList.remove("disabled");
			}
				
			if(self.right_border >= mRangeMax){
				mRightArrow.classList.add("disabled");
			}else{
				mRightArrow.classList.remove("disabled");
			}
		}
		
		// mElementData.innerHTML = '';
		mElementScale.innerHTML = '<vtext id="texttimelinetest"><vtext>';
		var test_text = document.getElementById('texttimelinetest');
		if (!test_text) {
		    return;
		}
		test_text.innerHTML = self.dateFormat(self.left_border, false, self.options.timelineampm===true);
		var textWidth = test_text.clientWidth;
		test_text.innerHTML = self.dateFormat(self.left_border, true, self.options.timelineampm===true);
		var textWidthWithMonth = test_text.clientWidth;

		// correct step long (if text was biggest)
		var step_long = mDefaultMode.step_long;
		while((textWidth)*mDistSec > step_long){
			step_long += mDefaultMode.step_long;
		};
		
		var nTextWithMonth = step_long*2;
		
		mElementScale.innerHTML += '<hline></hline>';
		for(var i = left_border_short; i < right_border_short; i++){
			var t = i*mDefaultMode.step_short;
			var pos = _calcPosition(t);
			if(t % mDefaultMode.step_long == 0){
				var bTextWithMonth = t % nTextWithMonth == 0;
				var tw = (bTextWithMonth ? textWidthWithMonth : textWidth);
				var tpos = pos - tw/2;
				
				mElementScale.innerHTML += '<vline style="left: ' + pos + 'px"></vline>';

				if(t % step_long == 0){
					mElementScale.innerHTML += '<vtext style="left: ' + tpos + 'px">' + self.dateFormat(t,bTextWithMonth, self.options.timelineampm===true) + '</vtext>';	
				}
			}else{
				mElementScale.innerHTML += '<vline style="left: ' + pos + 'px"></vline>';
			}
		}

		// mElementData.innerHTML = '';
		_updateCursorPosition(opt);
		if(mSource != null){
			if(_isLoadedData(self.left_border, self.right_border)){
				_updatedRecords();
			}else{
	
				if(self.isRange()){
					if(self.left_border < mRangeMin_Normalize || self.right_border > mRangeMax_Normalize){
						// console.log("skip");
						mTimelineDrawing = false;
						return;
					}
				}
				// console.log("don't skip");
				_loadData(self.left_border, self.right_border);
			}
		}
		mTimelineDrawing = false;
	}
	self.redrawTimeline();
	
	self.onTimeLineResize = function() {
//		console.warn("resize "  + document.webkitIsFullScreen);
		self.redrawTimeline();
	}

	window.addEventListener("resize", self.onTimeLineResize);

	self.animationTo = function(l,r, mode_new){
		// console.log("animationTo");
		mAnimationToProgress = true;
		mode_new = mode_new || mDefaultMode;
		// TODO lock timeline
		var steps = 25; // for ~1 sec
		var len_left = l - self.left_border;
		var len_right = r - self.right_border;
		if(len_left == 0 && len_right == 0){
			console.warn("Already in current position");
			self.redrawTimeline({sender: "animation"});
			mAnimationToProgress = false;
			return;
		}
		var len_step_short = mode_new.step_short - mDefaultMode.step_short;
		var len_step_long = mode_new.step_long - mDefaultMode.step_long;
		var bChangedSteps = (len_step_short != 0 && len_step_long != 0);
		var lb = self.left_border;
		var rb = self.right_border;
		var st = [];
		var p = 3.14/steps;
		var sum = 0;
		for(var i = 0; i < steps; i++){
			var k = Math.sin(i*p);
			sum += k;
			st.push({k: k});
		}
		var step_sl = len_left/sum;
		var step_sr = len_right/sum;
		var short_s = len_step_short/sum;
		var long_s = len_step_long/sum;

		// init first value
		var k0 = st[0].k;
		st[0].left = self.left_border + k0 * step_sl;
		st[0].right = self.right_border + k0 * step_sr;
		if(bChangedSteps){
			st[0].step_short = mDefaultMode.step_short + k0 * short_s;
			st[0].step_long = mDefaultMode.step_long + k0 * long_s;
		}

		for(var i = 1; i < steps; i++){
			var k = st[i].k;
			st[i].left = st[i-1].left + k*step_sl;
			st[i].right = st[i-1].right +  k*step_sr;
			if(bChangedSteps){
				st[i].step_short = st[i-1].step_short + k * short_s;
				st[i].step_long = st[i-1].step_short + k * long_s;
			}
		}
		// correction last value
		st[steps - 1].left = l;
		st[steps - 1].right = r;

		var counter = 0;
		function anumation_timeline_(){
			self.left_border = Math.floor(st[counter].left);
			self.right_border = Math.floor(st[counter].right);
			
			if(bChangedSteps){
				mDefaultMode.step_short = Math.floor(st[counter].step_short);
				mDefaultMode.step_long = Math.floor(st[counter].step_long);
			}
			// _updateScale();
			self.redrawTimeline({sender: "animation"});
			counter++;
			if(counter < steps){
				setTimeout(anumation_timeline_, 10);
			}else{
				if(bChangedSteps){
					mDefaultMode = clone(mode_new);
				}
				self.left_border = l;
				self.right_border = r;
				self.redrawTimeline({sender: "animation"});
				mAnimationToProgress = false;
			}
		}
		setTimeout(anumation_timeline_, 15);
	}

	self.fixBorderLimit = function(left_b,right_b){
		var res = {};
		res.left = left_b;
		res.right = right_b;
		
		if(self.isRange()){
			if(res.right > mRangeMax){
				res.right = mRangeMax;
				res.left = res.right - mDefaultMode.len_ms;
			}
			if(res.left < mRangeMin){
				res.left = mRangeMin;
				res.right = res.left + mDefaultMode.len_ms;
			}
		}else{
			var max = CloudHelpers.getCurrentTimeUTC() + mDefaultMode.len_ms/2;
			if(res.right > max){
				var d = res.right - max;
				res.left = res.left - d;
				res.right = res.right - d;
			}
		}
		return res;
	}

	self.moveToRight = function(){
		var diff = self.right_border - self.left_border;
		diff = Math.floor(0.75*diff);
		var l = self.left_border + diff;
		var r = self.right_border + diff;
		var f = self.fixBorderLimit(l,r);
		self.animationTo(f.left,f.right);
	}
	mRightArrow.onclick = self.moveToRight;

	self.moveToLeft = function(){
		var diff = self.right_border - self.left_border;
		diff = Math.floor(0.75*diff);
		var l = self.left_border - diff;
		var r = self.right_border - diff;
		var f = self.fixBorderLimit(l,r);
		self.animationTo(f.left,f.right);
	}
	mLeftArrow.onclick = self.moveToLeft;


	self.moveToPosition = function(t){
		console.log("moveToPosition");
		var diff2 = Math.floor((self.right_border - self.left_border)/2);
		var newLeft = t - diff2;
		var newRight = t + diff2;
		if(self.isRange()){
			if(newLeft < mRangeMin || newRight > mRangeMax){
				console.error("Can not move beyond range")
				return;
			}
		}
		self.animationTo(newLeft, newRight);
	}

	self.mousedown = function(event){
		if(!mStartMove){
			// console.log("mousedown", event);
			mFirstMoveX = event.offsetX;
			mLastMoveX =  event.offsetX;
			mStartMove = true;
			mElementContent.style.cursor = "move";
			try{
				if (window.getSelection) {
					window.getSelection().removeAllRanges();
				} else if (document.selection) {
					document.selection.empty();
				}
			}catch(e){
				console.error(e)
			}
			
		}
	}

	self.mousemove = function(event){
		if(mStartMove && !self.isRange()){
			// console.log("mousemove", event);
			var nDiff = event.offsetX - mLastMoveX;
			if(event.movementX !== undefined){ // not supported in safari & ie
				nDiff = event.movementX;
			}
			if(nDiff != 0){
				var diff_t = Math.floor(nDiff*mDistSec);
				mLastMoveX += nDiff;
				var f = self.fixBorderLimit(self.left_border - diff_t, self.right_border - diff_t);
				self.left_border = f.left;
				self.right_border = f.right;
				self.redrawTimeline({sender: "mousemove"});
			}
		}
	}

	self.mouseup = function(event){
		if(mStartMove){
			// console.log("mouseup", event);
			mElementContent.style.cursor = "default";
			mStartMove = false;	
		}
	}

	self.mouseout = function(event){
		if(mStartMove){
			// console.log("mouseout", event);
			if(event.relatedTarget && event.relatedTarget.nodeName == "CRECT"
		      || event.target && event.target.nodeName == "CRECT"){
				return; // skip
			}

			if(event.relatedTarget && event.relatedTarget.className == "cloudcameratimeline-cursor"
				|| event.target && event.target.className == "cloudcameratimeline-cursor"){
				return; // skip
			}

			mElementContent.style.cursor = "default";
			mStartMove = false;
		}
	}

	mElementContent.addEventListener('mousedown', self.mousedown);
	mElementContent.addEventListener('mousemove', self.mousemove);
	mElementContent.addEventListener('mouseup', self.mouseup);
	mElementContent.addEventListener('mouseout', self.mouseout);

	function _clickOnData(event){
		if (mPlayer == null) {
			console.log("[CloudCameraTimeline] player is null");
			return;
		}
		
		if (mSource == null) {
			console.log("[CloudCameraTimeline] source is null");
			return;
		}

		if(mFirstMoveX == mLastMoveX){
			var rect = event.currentTarget.getBoundingClientRect();
			var offsetX = event.clientX - rect.left;
			var t = Math.floor(offsetX*mDistSec);
			t = t + self.left_border;
			if(t >= CloudHelpers.getCurrentTimeUTC() && mPlayer){
				mCursorPosition = CloudHelpers.getCurrentTimeUTC();
				_updateCursorPosition({sender: "click"});
				mPlayer.stop("by_timeline_1");
				mPlayer.setPosition(CloudPlayer.POSITION_LIVE);
				mPlayer.play();
				mCallbacks.executeCallbacks(CloudPlayerEvent.USER_CLICKED_ON_TIMELINE, {pos: CloudPlayer.POSITION_LIVE});
			} else if(t && mPlayer){
				mCursorPosition = t;
				_updateCursorPosition({sender: "click"});
				mPlayer.stop("by_timeline_2");
				mPlayer.setPosition(t);
				mPlayer.play();
				mCallbacks.executeCallbacks(CloudPlayerEvent.USER_CLICKED_ON_TIMELINE, {pos: t});
			}else{
				_updateCursorPosition({sender: "click"});
			}
		}
	}
	mElementData.onclick = _clickOnData;

	self.setMode = function(mode){
		var mode_new = null;
		if(mModes[mode.name]){
			mode_new = mModes[mode.name];
		}else{
			console.error('Unknown timeline mode')
			return -1;
		}
		var _center = (self.right_border - self.left_border)/2 + self.left_border;
		var mode_new_copy = clone(mode_new);
		var diff = mode_new.len_ms / 2;
		self.animationTo(_center - diff, _center + diff, mode_new_copy);
		return 0;
	}

	self.getMode = function(){
		return mDefaultMode;
	}

	self.destroy = function() {
            window.removeEventListener("resize", self.onTimeLineResize);
	    if(self.elem && (self.elem.tagName === 'DIV')) {
		while (self.elem.firstChild) {
		    self.elem.firstChild.remove();
		}
	    }
	    clearInterval(mIntervalPolingData);
	}
	
	// apply options
	if(options["arrows"] !== undefined){
		if(options["arrows"] == true){
			self.showArrowsButtons();
		}else{
			self.hideArrowsButtons();
		}
	}

	if(options["gotoLive"] !== undefined){
		if(options["gotoLive"] == true){
			self.showGotoLiveButton();
		}else{
			self.hideGotoLiveButton();
		}
	}

	if(options["range"] !== undefined){
		var rangeMin = options["range"]["min"];
		var rangeMax = options["range"]["max"];
		self.setRange(rangeMin, rangeMax);
	}

	if(mOptionCalendar){
		self.showCalendarButton();
	}else{
		self.hideCalendarButton();
	}
	console.log("options: ", options);
};

window.CloudCameraCalendarView = function(elem, options){
	var mElementContent = elem;
	options = options || {};
	var self = this;
	var mConn = null;
	var mActivity = {};
	var mCamID = null;
	var mLastUpdated = null;
	var mSelectedMonth = new Date().getMonth();
	var mSelectedYear = new Date().getFullYear();
	var mMinMonth = mSelectedYear * 100 + mSelectedMonth;
	var mMaxMonth = mSelectedYear * 100 + mSelectedMonth;
	var mTimezoneOffset = 0;

	function _generateMonthName(nYear, nMonth) {
		var name_month = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		return name_month[nMonth%12] + ' ' + nYear;
	}

	function _formatId(nYear, nMonth, nDay) {
		return nYear + "-" + ("00" + (nMonth+1)).slice(-2) + "-" + ("00" + nDay).slice(-2);
	}

	function _generateMonthDays(nYear, nMonth) {
		var dt = new Date();
		var startDate = 1;
		dt.setFullYear(nYear);
		dt.setMonth(nMonth);
		dt.setDate(1);
		var startDay = dt.getDay();
		var prevMonth = (nMonth-1 + 12) % 12;
		var prevYear = nMonth == 0 ? nYear - 1 : nYear;
		var nextMonth = (nMonth+1 + 12) % 12;
		var nextYear = nMonth == 11 ? nYear + 1 : nYear;

		// 0 - Sunday, 1 - Moday, 2 - Thuesday...
		var lastDay = new Date(nextYear, nextMonth, 0);
		var endDate = lastDay.getDate();
		var endDay = lastDay.getDay();

		var prevEndDay = new Date(prevYear, prevMonth+1, 0).getDate();
		var name_days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
		var days = [];
		prevEndDay = prevEndDay - startDay + 1;
		for (var i = 0; i < startDay; i++) {
			days.push({d: prevEndDay, cl: 'disabled', dt: _formatId(nextYear, nextMonth, prevEndDay)});
			prevEndDay++;
		}

		for (var i = startDate; i <= endDate; i++) {
			days.push({d: i, cl: '', dt: _formatId(nYear, nMonth, i)});
		}
		var d = 0;
		for (var i = endDay+1; i < 7; i++) {
			d++;
			days.push({d: d, cl: 'disabled', dt: _formatId(nextYear, nextMonth, d)});
		}

		for (var i = 0; i < mActivity.length; i++) {
			var activeDay = mActivity[i];
			for (var dai = 0; dai < days.length; dai++) {
				if (days[dai].dt === activeDay) {
					days[dai].cl += "active-day";
				}
			}
		}

		var html = '<div class="cal-row week">';
		for (var i = 0; i < name_days.length; i++) {
			html += '<div class="cal-day name">' + name_days[i] + '</div>';
		}
		html += '</div>';
		html += '<div class="cal-row">';
		for (var i = 0; i < days.length; i++) {
			if (i % 7 == 0 && i > 0) {
				html += '</div><div class="cal-row">'
			}
			html += '<div class="cal-day ' + days[i].cl + '" dt="' + days[i].dt + '">' + days[i].d + '</div>';
		}
		html += '</div>';
		return html;
	}

	mElementContent.innerHTML = ''
		+ '	<div class="cloudcameracalendar-header">'
		+ '		<div class="cloudcameracalendar-prev-month"></div>'
		+ '		<div class="cloudcameracalendar-title">' + _generateMonthName(mSelectedYear, mSelectedMonth) + '</div>'
		+ '		<div class="cloudcameracalendar-next-month"></div>'
		// + '		<div class="cloudcameracalendar-close"></div>'
		+ "	</div>"
		+ "	<div class='cloudcameracalendar-table'>"
		+ _generateMonthDays(mSelectedYear, mSelectedMonth)
		+ "	</div>";

	var mElementClose = mElementContent.getElementsByClassName('cloudcameracalendar-close')[0];
	var mElementPrev = mElementContent.getElementsByClassName('cloudcameracalendar-prev-month')[0];
	var mElementNext = mElementContent.getElementsByClassName('cloudcameracalendar-next-month')[0];
	var mElementTable = mElementContent.getElementsByClassName('cloudcameracalendar-table')[0];
	var mElementTitle = mElementContent.getElementsByClassName('cloudcameracalendar-title')[0];

	// mElementClose.onclick = function(e){
	// 	// console.log("[CALENDAR] close ");
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// 	mElementContent.style.display = "";
	// 	return true;
	// }
	
	self.renderContent = function() {
		// console.log("[CALENDAR] ", mActivity);
		mElementTitle.innerHTML = _generateMonthName(mSelectedYear, mSelectedMonth);
		mElementTable.innerHTML = _generateMonthDays(mSelectedYear, mSelectedMonth);

		var active_days = mElementContent.getElementsByClassName('active-day');
		for (var i = 0; i < active_days.length; i++) {
			active_days[i].onclick = function(ev){
				var _dt = this.getAttribute('dt');
				if (self.onChangeDate) {
					self.onChangeDate(Date.parse(_dt), ev);
				}
			}
		}
		var _currMonth = mSelectedYear*100 + mSelectedMonth;
		if (_currMonth <= mMinMonth) {
			mElementPrev.style.display = 'none';
		} else {
			mElementPrev.style.display = '';
		}

		if (_currMonth >= mMaxMonth) {
			mElementNext.style.display = 'none';
		} else {
			mElementNext.style.display = '';
		}
	}
	self.renderContent();

	self.updateActivity = function() {
		if (mConn == null) {
			console.log("[CALENDAR] mConn is null");
			mActivity = [];
			self.renderContent();
			return;
		}
		mApi = mConn._getAPI();
		if (!mApi) {
		    return;
		}
		mApi.storageActivity(mCamID, true).done(function(r){
			mLastUpdated = new Date();
			mActivity = r.objects;
			for (var i = 0; i < mActivity.length; i++) {
				var s = mActivity[i].split("-");
				var _month = parseInt(s[1],10)-1;
				var val = parseInt(s[0],10)*100 + _month;
				if (i == 0) {
					mMinMonth = val;
					mMaxMonth = val;
				} else {
					mMinMonth = Math.min(val, mMinMonth);
					mMaxMonth = Math.max(val, mMaxMonth);
				}
			}
			self.renderContent();
		})
	}

	self.setSource = function(mSource) {
		mSelectedMonth = new Date().getMonth();
		mSelectedYear = new Date().getFullYear();
		mLastUpdated = null;

		if (mSource != null) {
			mConn = mSource._getConn();	
			mCamID = mSource.getID();
			// reset month and year
			mTimezoneOffset = CloudHelpers.getOffsetTimezone(mSource.getTimezone());
			self.updateActivity();
		} else {
			mConn = null;
			mTimezoneOffset = 0;
			mActivity = [];
			self.renderContent();
		}
	}

	self.dispose = function() {
		mConn = null;
	}

	mElementPrev.onclick = function() {
		mSelectedMonth = mSelectedMonth - 1;
		if (mSelectedMonth < 0) {
			mSelectedMonth = 11;
			mSelectedYear = mSelectedYear - 1;
		}
		self.renderContent();
	}

	mElementNext.onclick = function() {
		mSelectedMonth =  mSelectedMonth + 1;
		if (mSelectedMonth > 11) {
			mSelectedMonth = 0;
			mSelectedYear = mSelectedYear + 1;
		}
		self.renderContent();
	}
	
	self.isVisible = function() {
		return mElementContent.style.display !== '';
	}

	self.showCalendar = function() {
		console.log("[CALENDAR] show");
		mElementContent.style.display = "block";
		if (mConn == null) {
			self.renderContent();
			return;
		}
		if (mLastUpdated == null) {
			self.updateActivity();
			return;
		}
		var dt = new Date();
		dt.setUTCHours(24);
		dt.setUTCMinutes(0);
		dt.setUTCSeconds(0);

		if (new Date().getTime() > dt.getTime() && mLastUpdated.getTime() < dt.getTime()) {
			self.updateActivity();
		}
	}

	self.hideCalendar = function() {
		console.log("[CALENDAR] hide");
		mElementContent.style.display = '';
	}

	self.toggleCalendar = function(mElementCalendar) {
		console.log("[CALENDAR] toggle");
		if (self.isVisible()) {
			self.hideCalendar();
			mElementCalendar.classList.remove("shadowed");
		} else {
			self.showCalendar();
			mElementCalendar.classList.add("shadowed");
		}
	}
};

window.CloudSessionTimeline = function(viewid){
	var self = this;
	var mSource = null;
	var mModes = {};
	mModes["h12"] = { to: "min", len_ms: 9*60*60*1000, step_short: 30*60*1000, step_long: 150*60*1000 }; // 2,5 hr, step 30 min
	mModes["hr"] = { to: "h12", len_ms: 90*60*1000, step_short: 5*60*1000, step_long: 30*60*1000 }; // 30 min, step 5 min
	mModes["min"] = { to: "hr", len_ms: 15*60*1000, step_short: 1*60*1000, step_long: 5*60*1000 }; // 5 min, step 1 min
	
	function clone(obj) {
		if (null == obj || "object" != typeof obj) return obj;
		var copy = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		}
		return copy;
	}

	var mDefaultMode = clone(mModes["min"]);
	
	self.elem = document.getElementById(viewid);
	
	if(self.elem == null){
		console.error("[CloudPlayerTimeline] Not found element");
		return null;
	}
	
	if(self.elem.tagName != 'DIV'){
		console.error("[CloudPlayerTimeline] Expected DIV tag but got " + self.elem.tagName);
		return null;
	}
	
	// default
	self.elem.classList.add("cloudplayertimeline");
	self.elem.classList.add("green");
	self.elem.classList.add("black");
	
	self.elem.innerHTML = ''
		+ '<div class="cloudplayertimeline-content">'
		+ '		<div class="cloudplayertimeline-scale session"></div>'
		+ '		<div class="cloudplayertimeline-data session"></div>'
		+ '		<div class="cloudplayertimeline-cursor"></div>'
		+ '</div>';
		
	self.left_border = CloudHelpers.getCurrentTimeUTC() - mDefaultMode.len_ms/2;
	self.right_border = self.left_border + mDefaultMode.len_ms;
	
	self.el_data = self.elem.getElementsByClassName('cloudplayertimeline-data')[0];
	var el_cursor = self.elem.getElementsByClassName('cloudplayertimeline-cursor')[0];
	self.el_scale = self.elem.getElementsByClassName('cloudplayertimeline-scale')[0];

	function _stopPolingCursor(){
		clearInterval(self._polingCursor);
	}
	
	function _startPolingCursor(){
		_stopPolingCursor();
		self._polingCursor = setInterval(function(){
			var t = self.plr.getPosition();
			if(t < self.left_border || t > self.right_border){
				if(el_cursor.style.display != 'none'){
					el_cursor.style.display = 'none'
				}
			}
			if(el_cursor.style.display != 'inline-block'){
				el_cursor.style.display = 'inline-block';
			}
			if(t != 0){
				var le = self.calcPosition(t) + 50 + 'px';
				el_cursor.style.left = le;
			}
		},1000);
	}
	
	self.setPlayer = function(player){
		_stopPolingCursor();
		self.plr = player;
		if(self.plr){
			_startPolingCursor();
		}
	}

	self.calcPosition = function(t){
		return Math.floor((t - self.left_border) * self.distPx);
	}

	self.months = ['Jan','Feb','Mar','Apr','May','Jun', 'Jul', 'Aug', 'Spt', 'Oct', 'Nov', 'Dec'];
	
	self.dateFormat = function(t, bMonth){
		var d = new Date();
		d.setTime(t);
		var str = ("00" + d.getUTCHours()).slice(-2) + ":"
			+ ("00" + d.getUTCMinutes()).slice(-2);
		if(bMonth)
			str += " (" + d.getUTCDate() + " " + self.months[d.getUTCMonth()] + ")";
		return str;
	}
	
	self.redrawTimeline = function(){
		if(self.plr != null){
			mSource = self.plr.getSource();
		}else{
			mSource = null;
		}
		if(mSource != null){
			self.left_border = mSource.getStartTime();
			self.right_border = mSource.getEndTime();
			mDefaultMode.step_short = (self.right_border - self.left_border)/20;
			// TODO 
			// 120000
		}
		el_cursor.style.display = 'none'; // hide
		
		self.containerWidth = self.el_scale.offsetWidth;
		self.distPx = self.containerWidth / (self.right_border - self.left_border); // TODO on init mode
		self.distSec = (self.right_border - self.left_border) / self.containerWidth; // TODO on init mode
		
		var left_border_short = Math.floor(self.left_border / mDefaultMode.step_short);
		var right_border_short = Math.floor(self.right_border / mDefaultMode.step_short) + 1;
		
		self.el_data.innerHTML = '';
		self.el_scale.innerHTML = '<vtext id="texttimelinetest"><vtext>';
		var test_text = document.getElementById('texttimelinetest');
		test_text.innerHTML = self.dateFormat(self.left_border, false);
		var textWidth = test_text.clientWidth;
		test_text.innerHTML = self.dateFormat(self.left_border, true);
		var textWidthWithMonth = test_text.clientWidth;

		// correct step long (if text was biggest)
		var step_long = mDefaultMode.step_long;
		while((textWidth)*self.distSec > step_long){
			step_long += mDefaultMode.step_long;
		};

		var nTextWithMonth = step_long*2;

		self.el_scale.innerHTML += '<hline></hline>';
		for(var i = left_border_short; i < right_border_short; i++){
			var t = i*mDefaultMode.step_short;
			var pos = self.calcPosition(t);
			if(t % mDefaultMode.step_long == 0){
				var bTextWithMonth = t % nTextWithMonth == 0;
				var tw = (bTextWithMonth ? textWidthWithMonth : textWidth);
				var tpos = pos - tw/2;

				self.el_scale.innerHTML += '<vline style="left: ' + pos + 'px"></vline>';

				if(t % step_long == 0){
					self.el_scale.innerHTML += '<vtext style="left: ' + tpos + 'px">' + self.dateFormat(t,bTextWithMonth) + '</vtext>';	
				}
			}else{
				self.el_scale.innerHTML += '<vline style="left: ' + pos + 'px"></vline>';
			}
		}
		
		self.el_data.innerHTML = '';
			if(mSource != null){
				
				// mSource._getAPI().getCamsessRecords();
				
				mSource.getTimeline(self.left_border, self.right_border).done(function(timeline){
				
				var per = timeline.periods;
				self.el_data.innerHTML = '';
				for(var i = 0; i < per.length; i++){
					var start = self.calcPosition(per[i].start);
					var end = self.calcPosition(per[i].end);
					var el = '<crect style="left: ' + start + 'px; width: ' + (end - start) + 'px"></crect>';
					self.el_data.innerHTML += el;
				}
			}).fail(function(err){
				console.error(err);
			});
		}
	}
	self.redrawTimeline();
	
	window.addEventListener("resize", self.redrawTimeline);
	
	self.animationTo = function(l,r, mode_new){
		mode_new = mode_new || mDefaultMode;
		// TODO lock timeline
		var steps = 25; // for ~1 sec
		var len_left = l - self.left_border;
		var len_right = r - self.right_border;
		var len_step_short = mode_new.step_short - mDefaultMode.step_short;
		var len_step_long = mode_new.step_long - mDefaultMode.step_long;
		var bChangedSteps = (len_step_short != 0 && len_step_long != 0);
		var steps_left = [];
		var steps_right = [];
		var steps_step_short = [];
		var steps_step_long = [];
		var p = 3.14/steps;
		var sum = 0;
		for(var i = 0; i < steps; i++){
			var k = Math.sin(i*p);
			sum += k;
		}

		for(var i = 0; i < steps; i++){
			var k = Math.sin(i*(3.14/steps));
			steps_left.push(k*(len_left/sum));
			steps_right.push(k*(len_right/sum));
			if(bChangedSteps){
				steps_step_short.push(k*(len_step_short/sum));
				steps_step_long.push(k*(len_step_long/sum));
			}
		}
		
		var counter = 0;
		function anumation_timeline_(){
			self.left_border += steps_left[counter];
			self.right_border += steps_right[counter];
			
			if(bChangedSteps){
				mDefaultMode.step_short += steps_step_short[counter];
				mDefaultMode.step_long += steps_step_long[counter];
			}

			self.redrawTimeline();
			counter++;
			if(counter < steps){
				setTimeout(anumation_timeline_, 10);
			}else{
				if(bChangedSteps){
					mDefaultMode = clone(mode_new);
				}
				self.redrawTimeline();
			}
		}
		setTimeout(anumation_timeline_, 15);
	}
	
	self.fixBorderLimit = function(left_b,right_b){
		var res = {};
		res.left = left_b;
		res.right = right_b;
		var max = CloudHelpers.getCurrentTimeUTC() + mDefaultMode.len_ms/2;
		if(res.right > max){
			var d = res.right - max;
			res.left = res.left - d;
			res.right = res.right - d;
		}
		return res;
	}
	
	self._clickOnData = function(e){
		if(self.plr == null){
			console.log("[CloudCameraTimeline] player is null");
			return;
		}
		
		if(mSource == null){
			console.log("[CloudCameraTimeline] source is null");
			return;
		}

		var t = Math.floor(e.offsetX*self.distSec);
		t = t + self.left_border;
		if(t && self.plr){
			self.plr.stop("by_session_timeline_1");
			self.plr.setPosition(t);
			self.plr.play();
		}
	}
	self.el_data.onclick = self._clickOnData;

	self._startMove = false;
	self._lastMoveX = 0;

	self.mousedown = function(event){
		// console.log("down", event);
		self._lastMoveX =  event.offsetX;
		self._startMove = true;
		self.el_data.style.cursor = "move";
		
		// console.log("down", self._lastMoveX);
	}

	self.mousemove = function(event){
		if(self._startMove){
			// console.log("move", event);
			var diff = event.offsetX - self._lastMoveX;
			// console.log("move " + diff);
			if(diff != 0){
				var diff_t = Math.floor(diff*self.distSec);
				self._lastMoveX = event.offsetX;
				var f = self.fixBorderLimit(self.left_border - diff_t, self.right_border - diff_t);
				self.left_border = f.left;
				self.right_border = f.right;
				self.redrawTimeline();
			}
		}
	}

	self.mouseup = function(event){
		// console.log("up", event);
		// console.log("up/out " + self._lastMoveX + " , new: " + event.offsetX);
		self._startMove = false;
		self.el_data.style.cursor = "default";
	}

	self.el_data.addEventListener('mousedown', self.mousedown);
	self.el_data.addEventListener('mousemove', self.mousemove);
	self.el_data.addEventListener('mouseup', self.mouseup);
	self.el_data.addEventListener('mouseout', self.mouseup);
};

// init base options of sdk
window.CloudSDK = window.CloudSDK || {};

// Automaticlly generated
CloudSDK.version = '3.0.18';
CloudSDK.datebuild = '200702';
console.log('CloudSDK.version='+CloudSDK.version + '_' + CloudSDK.datebuild);

// Wrapper for VXGCloudPlayer & CloudSDK

window.CloudPlayerSDK = function(playerElementID, o) {
	console.log(o);

    var self = this;
    self.options = o || {};
    self.player = null;
    self.conn = null;
    self.filter = null;
    self.cm = null;
    self.mCameraID = null;
    var mPosition = CloudPlayer.POSITION_LIVE;
    self.camera = null;
    self.svcp_url = null;
    self.sharedKey = null;
    self.playerElementID = null;
    window['_CloudPlayerSDK'] = window['_CloudPlayerSDK'] || {};

    if (!playerElementID || playerElementID === '') throw 'Player container element ID is required.';
    self.playerElementID = playerElementID;
    if (self.playerElementID.indexOf('%') === -1)
        self.playerElementID = encodeURIComponent(self.playerElementID);

    self.conn = new CloudShareConnection(self.options);

    if (window['_CloudPlayerSDK'][playerElementID]){
        throw 'Oops! CloudPlayerSDK instance with player element ID: ' + playerElementID + ' already exist. Try use another ID.';
	}

    window['_CloudPlayerSDK'][playerElementID] = {};
    self.player = new CloudPlayer(playerElementID, self.options);
    console.log("self.options: ", self.options);
    if((self.options.timeline != null)&&(self.options.timeline != false)){
	self.timeline = new CloudCameraTimelineView(self.options.timeline, self.options, self.player);
	self.timeline.setPlayer(self.player);
        self.player.player.classList.add('with-timeline');
        self.player.calendar = self.timeline.calendar;
        console.log(self.player);
    }


    self.setSource = function (key) {
        if (!key || key === '') {
//            var msg = 'Access token is required';
//            console.error(msg);
            self.player._showerror(CloudReturnCode.ERROR_ACCESS_TOKEN_REQUIRED);
//            self.player._setError(msg);
//            self.player.showErrorText(msg);
            return CloudReturnCode.ERROR_ACCESS_TOKEN_REQUIRED;
        }
        var camid = 0;
        try {
            var obj = atob(key);
            obj = JSON.parse(obj);
            console.log("[CloudPlayerSDK] access_token: ", obj);
            if (obj.token && obj.camid && obj.access && obj.token !== '' && obj.camid !== '' && obj.access !== ''){
                self.sharedKey = obj.token;
                self.mCameraID = obj.camid;
            }

			if(obj.svcp && obj.svcp != ''){
				self.svcp_url = obj.svcp;
            }
            
            // obj.api = obj.api || "web.skyvr.videoexpertsgroup.com";
            // TODO move to CloudHelpers function and create tests
            if(obj.api && obj.api != ''){
                self.svcp_url = (location.protocol=="file:"?"http:":location.protocol) + "//" + obj.api;
                if(location.protocol == "http:" || location.protocol == "file:"){
                    self.svcp_url += (obj.api_p ? ":" + obj.api_p : "");
                }else if(location.protocol == "https:"){
                    self.svcp_url += (obj.api_sp ? ":" + obj.api_sp : "");
                }
                self.svcp_url += "/";
                if (obj.path && obj.path != '') {
                    self.svcp_url += obj.path;
                    self.svcp_url += "/";
                }
            }
        } catch (err) {
//            var msg = 'Invalid access token format';
//            console.error(msg);
            self.player._showerror(CloudReturnCode.ERROR_INVALID_ACCESS_TOKEN_FORMAT);
//            self.player.showErrorText(msg);
            return CloudReturnCode.ERROR_INVALID_ACCESS_TOKEN_FORMAT;
        }

        self.player.stop("by_plrsdk_3");
		if(self.svcp_url != null){ // if server is custom
			self.conn.ServiceProviderUrl = self.svcp_url.replace('file://','https://');
		}
        self.conn.open(self.sharedKey).done(function (cam) {
        
            if (self.conn) {
                self.cm = new CloudCameraList(self.conn);
                self.cm.getCamera(self.mCameraID).done(function (cam) {
                    self.camera = cam;
                    self.player.setSource(self.camera);
                    console.log(self.camera)
                    console.log(self.camera._origJson())
                    self.player.setPosition(mPosition);
                    if (self.timeline && mPosition != -1) {
                        self.timeline.moveToPosition(mPosition);
                    }
                    self.player.play();
                }).fail(function (err) {
                    console.log(err);
                    self.player._showerror(CloudReturnCode.ERROR_CHANNEL_NOT_FOUND);
//                    self.player._setError("Channel is not found");
//                    self.player.showErrorText("Channel is not found");
                    // TODO callback error
                });
                //return CloudReturnCode.OK;
            }
        }).fail(function (err) {
            self.player._showerror(CloudReturnCode.ERROR_NETWORK_ERROR);
//            self.player._setError("Network error");
//            self.player.showErrorText("Network error");
        });        
        //self.player.showErrorText("Access token invalid");
        //return CloudReturnCode.ERROR_NO_CLOUD_CONNECTION;
    };

    self.getSource = function () {
        if (!self.sharedKey)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.sharedKey;
    };
	
	self.play = function(){
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        self.player.play();
	};
	
	self.stop = function(){
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        self.player.stop("by_plrsdk_1");
	};
	
    self.pause = function(){
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        // TODO: what to do here ...
    };

    self.close = function(){
        self.player.stop("by_plrsdk_2");
        self.player.close();
        self.player.player.innerHTML = '';
        self.conn.close();
        if(window['_CloudPlayerSDK'][playerElementID]){
			delete window['_CloudPlayerSDK'][playerElementID];
		}
    };

    self.destroy = function(){
        self.player.stop("by_plrsdk_2");
        self.player.player.innerHTML = '';
        self.player.destroy();
        self.conn.close();
        if (self.timeline) {
            self.timeline.destroy();
        }
        if(window['_CloudPlayerSDK'][self.playerElementID]){
		delete window['_CloudPlayerSDK'][self.playerElementID];
	}
    }
    
    self.isPlaying = function(){
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.player.isPlaying();
    };

	self.setPosition = function(time){
        mPosition = time;
        if (!self.camera) {
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        }
        self.player.stop("by_plrsdk_2");
        self.player.setPosition(time);
        self.player.play();
    };
    
    self.getPosition = function(){
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.player.getPosition();
    };

    self.showTimeline = function(show){
        if (!self.camera) {
            console.error(CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED.text);
            return null;
        }
        if(!self.timeline){
            console.error(CloudReturnCode.ERROR_NOT_CONFIGURED.text);
            return null;
        }
        document.getElementById(self.options.timeline).style.display = show ? 'block' : 'hide';
        return true;
    };
    
    self.getChannelName = function () {
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.camera.getName();
    };
    
    self.setRange = function(startPos,endPos){
        self.player.setRange(startPos,endPos);
		if(self.timeline){
			self.timeline.setRange(startPos,endPos);
		}
	}

	self.resetRange = function(){
		self.player.resetRange();
		if(self.timeline){
			self.timeline.resetRange();
		}
    }
    self.mOnError_callback = null;
    self.onError = function(callback) {
        if (!callback) {
            self.player.onError(null);
            return;
        }
        self.mOnError_callback = callback;
		self.player.onError(function(plr, error) {
            self.mOnError_callback(self, error);
        });
    }
    self.mOnChannelStatus_callback = null;
    self.onChannelStatus = function(callback) {
        if(!callback) {
            self.mOnChannelStatus_callback = null;
            self.player.onChannelStatus(null);
            return;
        }
        self.mOnChannelStatus_callback = callback;
		self.player.onChannelStatus(function(plr, status){
            self.mOnChannelStatus_callback(self, status);
        });
    }
    
    self.addCallback = function(uniqname, func) {
        self.player.addCallback(uniqname, func);
        if (self.timeline) {
            self.timeline.addCallback(uniqname, func);
        }
    }

    self.removeCallback = function(uniqname) {
        self.player.removeCallback(uniqname);
        if (self.timeline) {
            self.timeline.removeCallback(uniqname, func);
        }
    }
};

window.StreamerSWF = window.StreamerSWF || {};
StreamerSWF.elemId = "streamer_swf";
StreamerSWF.obj = undefined;
StreamerSWF.log = function(s){
	console.log("[StreamerSWF] " + s);
}

StreamerSWF.warn = function(s){
	console.warn("[StreamerSWF] " + s);
}
	
StreamerSWF.error = function(s){
	console.error("[StreamerSWF] " + s);
}

/* override functions */
StreamerSWF.startedPublish = function(){ /* you can override */ }
StreamerSWF.stoppedPublish = function(){ /* you can override */ }
StreamerSWF.showSecuritySettings = function(){ /* you can override */ }
StreamerSWF.hideSecuritySettings = function(){ /* you can override */ }

StreamerSWF.activityLevel = function(lvl){
	console.log("audio lvl " + lvl);
}

StreamerSWF.flash = function(){
	if(!StreamerSWF.obj){
		StreamerSWF.obj = document.getElementById(StreamerSWF.elemId);
		if(!StreamerSWF.obj){
			StreamerSWF.error("Element '" + StreamerSWF.elemId + "' not found");
		}
		StreamerSWF.log("Init");
	}else if(!StreamerSWF.obj.vjs_activate){
		// try again
		StreamerSWF.obj = document.getElementById(StreamerSWF.elemId);
		if(!StreamerSWF.obj){
			StreamerSWF.error("Element '" + StreamerSWF.elemId + "' not found");
		}
		StreamerSWF.log("reinit");
	}
	return StreamerSWF.obj;
};
	
StreamerSWF.activate = function(rtmpUrl, codec){

	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_activate){
		var is_private = StreamerSWF.private.is() || false;
		f.vjs_activate(rtmpUrl, is_private, codec);
	}else{
		StreamerSWF.error("Function vjs_activate not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.support = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_support)
		return f.vjs_support();
	else{
		StreamerSWF.error("Function vjs_support not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.status = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_status)
		return f.vjs_status();
	else{
		StreamerSWF.error("Function vjs_status not found");
		StreamerSWF.obj = undefined;
	}
};
	
StreamerSWF.deactivate = function(){
	var f = StreamerSWF.flash();
	if(!f) return;
	if(f.vjs_deactivate)
		f.vjs_deactivate();
	else{
		console.error("Function vjs_deactivate not found");
		StreamerSWF.obj = undefined;
	}
};

StreamerSWF.isActivated = function(){
	return (StreamerSWF.status() == "activated");
};

StreamerSWF.isDeactivated = function(){
	return (StreamerSWF.status() == "deactivated");
};

StreamerSWF.isTransitive = function(){
	return (StreamerSWF.status() == "transitive");
};

/* private mode opened */
StreamerSWF.private = {};
StreamerSWF.private.retry = function(isDone, next) {
    var current_trial = 0, max_retry = 50, interval = 10, is_timeout = false;
    var id = window.setInterval(
        function() {
            if (isDone()) {
                window.clearInterval(id);
                next(is_timeout);
            }
            if (current_trial++ > max_retry) {
                window.clearInterval(id);
                is_timeout = true;
                next(is_timeout);
            }
        },
        10
    );
}

StreamerSWF.private.isIE10OrLater = function(user_agent) {
    var ua = user_agent.toLowerCase();
    if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
        return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
        return true;
    }
    var edge = /edge/.exec(ua);
	if(edge && edge[0] == "edge"){
		return true;
	}
    return false;
}

StreamerSWF.private.detectPrivateMode = function(callback) {
    var is_private;

    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(
            window.TEMPORARY, 1,
            function() {
                is_private = false;
            },
            function(e) {
                console.log(e);
                is_private = true;
            }
        );
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        var db;
        try {
            db = window.indexedDB.open('test');
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            StreamerSWF.private.retry(
                function isDone() {
                    return db.readyState === 'done' ? true : false;
                },
                function next(is_timeout) {
                    if (!is_timeout) {
                        is_private = db.result ? false : true;
                    }
                }
            );
        }
    } else if (StreamerSWF.private.isIE10OrLater(window.navigator.userAgent)) {
        is_private = false;
        try {
            if (!window.indexedDB) {
                is_private = true;
            }                 
        } catch (e) {
            is_private = true;
        }
    } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
        try {
            window.localStorage.setItem('test', 1);
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            is_private = false;
            window.localStorage.removeItem('test');
        }
    }

    StreamerSWF.private.retry(
        function isDone() {
			return typeof is_private !== 'undefined' ? true : false;
        },
        function next(is_timeout) {
            callback(is_private);
        }
    );
}

StreamerSWF.private.is = function(){
	if(typeof StreamerSWF.private.is_ === 'undefined'){
		console.error('[StreamerSWF.private] cannot detect');
	}
	return StreamerSWF.private.is_;
}

StreamerSWF.private.detectPrivateMode(
	function(is_private) {
		StreamerSWF.private.is_ = is_private;
		
		if(typeof is_private === 'undefined'){
			console.error('[StreamerSWF.private] cannot detect');
		}else{
			StreamerSWF.private.is_ = is_private;
			console.log(is_private ? '[StreamerSWF.private] private' : '[StreamerSWF.private] not private')
		}
	}
);

// video_container_selector - DOM элемент, в котором размещаются элементы video. 
// В канвасе будет воспроизводиться первый video, который не спрятан

var ptzconfig = {
    xRot : -48.6, // Поворот камеры по вертикали
    zRot : 145, // Поворот камеры по вертикальной оси
    xScale : 1, // Масштаб текстуры по Х
    yScale : 1, // Масштаб текстуры по Y
    xShift : 0, // Смещение текстуры по X
    yShift : 0, // Смещение текстуры по Y
    zCamShift : .2, // Смещение камеры по Z
    zZoom : -.6, // Приближение/удаление камеры
    xLens : 1, // Коэффициент коррекции линзы по X
    zLens : 1.0, // Коэффициент коррекции выпуклости линзы
    divider: 4, // Количество линий, из которых будет состоять круги у сферы. Экспоненциально влияет на количество треугольников
    src: document.currentScript.src.replace(/(\/[^\/]+)$/,'\/')
}
/*
var ptzconfig = {
    xRot : -65, // Поворот камеры по вертикали
    zRot : 145, // Поворот камеры по вертикальной оси
    xScale : 1.01, // Масштаб текстуры по Х
    yScale : 1.01, // Масштаб текстуры по Y
    xShift : -0.01, // Смещение текстуры по X
    yShift : 0.02, // Смещение текстуры по Y
    zCamShift : .23, // Смещение камеры по Z
    zZoom : -.6, // Приближение/удаление камеры
    xLens : 1, // Коэффициент коррекции линзы по X
    zLens : 1.0, // Коэффициент коррекции выпуклости линзы
    divider: 64 // Количество линий, из которых будет состоять круги у сферы. Экспоненциально влияет на количество треугольников
}
*/

function changepztconfig(v,c){
ptzconfig[c]=v;
}
function testplay(){
$('#player1_vjs_html5_api').attr('src','/video.mp4');
player1_vjs_html5_api.play();
}
function testplay2(){
$('#player1_vjs_html5_api').attr('src','/fisheye.mp4');
player1_vjs_html5_api.play();
}

window.CloudPano = function(video_container, cloudplayer){
    var self = this;
    self.container = video_container;
    self.player = cloudplayer;

    self.beMouseDown = false;
    self.bezRot = self.bexRot = 0;
    self.beX = self.beY = 0;
    self.model = {vertex :[], indices :[], texture : []};


    self.load_model = function(){
        if (self.textureBuffer)
            return;
        var xhr;
    
        try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); }
        catch(e)
        {
            try { xhr = new ActiveXObject('Microsoft.XMLHTTP'); }
            catch(e2)
            {
                try { xhr = new XMLHttpRequest(); }
                catch(e3) { xhr = false; }
            }
        }
    
        xhr.onreadystatechange = function()
        {
            if (self.textureBuffer)
                return;
            if(xhr.readyState == 4)
            {
                if(xhr.status == 200){
                    self.model = JSON.parse(xhr.response);
                    self.model.indices=[];c=0;
                    for (i=0;i<self.model.vertex.length;i+=3){
                        self.model.indices.push(c++);
                    }
                    self.vertexBuffer = self.gl.createBuffer();
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.vertexBuffer);
                    self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.model.vertex), self.gl.STATIC_DRAW);
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, null);
                
                    self.indexBuffer = self.gl.createBuffer();
                    self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
                    self.gl.bufferData(self.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.model.indices), self.gl.STATIC_DRAW);
                    self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, null);
                
                    self.textureBuffer = self.gl.createBuffer();
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.textureBuffer);
                    self.gl.bufferData(self.gl.ARRAY_BUFFER, new Float32Array(self.model.texture), self.gl.STATIC_DRAW);
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, null);
                    console.log("[CloudPlayer] vehicles count is " + self.model.vertex.length/3);
                }
            }
        };
    
        xhr.open('GET', ptzconfig.src+'model.json', true);
        xhr.send(null);
        // return xhr;
    }


    self.mouseMoveHandler = function(e) {
        var x = e.clientX;
        var y = e.clientY;

        if (!self.beMouseDown && e.buttons==1) {
            self.bezRot = ptzconfig.zRot;
            self.bexRot = ptzconfig.xRot;
            self.beMouseDown=true;
            self.beX = x;
            self.beY = y;
        }
        if (e.buttons==0) {
            self.beMouseDown=false;
        }
        if (!self.beMouseDown) return;
        ptzconfig.zRot = self.bezRot + (self.beX-x)/5.0;
        ptzconfig.xRot = self.bexRot + (self.beY-y)/5.0;
        if (ptzconfig.xRot>0) ptzconfig.xRot=0;
        if (ptzconfig.xRot<-65.2) ptzconfig.xRot=-65.2;

    }
    self.mouseWheelHandler = function(e) {
        e = e || window.event;
        var delta = e.deltaY || e.detail || e.wheelDelta;
        ptzconfig.zZoom-= delta/1000;
        if (ptzconfig.zZoom>0.6) ptzconfig.zZoom=0.6;
        if (ptzconfig.zZoom<-0.6) ptzconfig.zZoom=-0.6;
        e.preventDefault();
    }


    self.createGLContext = function(){
        var sliders = document.createElement("div");
        sliders.style.top="90px";
        sliders.style.position="absolute";
        sliders.style.color="black";
        sliders.style.fontSize="12px";
        sliders.innerHTML = '\
            <span style="background:rgba(255,255,255,.7);padding:0 5px">Смещение камеры по вертикали</span><br/>               <input style="width:250px" id="zCamShift" type="range" min="-1" max="2" step=".01" value="'+ptzconfig.zCamShift+'" onchange="changepztconfig(this.value,\'zCamShift\')"><br/>\
            <span for="zZoom" style="background:rgba(255,255,255,.7);padding:0 5px">Приближение</span><br/>                    <input style="width:250px" id="zZoom" type="range" min="-5" max="2" step=".1" value="'+ptzconfig.zZoom+'" onchange="changepztconfig(this.value,\'zZoom\')"><br/>\
            <span for="xRot" style="background:rgba(255,255,255,.7);padding:0 5px">Наклон камеры вниз</span><br/>              <input style="width:250px" id="xRot" type="range" min="-120" max="0" step="5" value="'+ptzconfig.xRot+'" onchange="changepztconfig(this.value,\'xRot\')"><br/>\
            <span for="xScale" style="background:rgba(255,255,255,.7);padding:0 5px">Масштабирование текстуры по X</span><br/> <input style="width:250px" id="xScale" type="range" min="-2.5" max="2.5" step=".01" value="'+ptzconfig.xScale+'" onchange="changepztconfig(this.value,\'xScale\')"><br/>\
            <span for="yScale" style="background:rgba(255,255,255,.7);padding:0 5px">Масштабирование текстуры по Y</span><br/> <input style="width:250px" id="yScale" type="range" min="-2.5" max="2.5" step=".01" value="'+ptzconfig.yScale+'" onchange="changepztconfig(this.value,\'yScale\')"><br/>\
            <span for="xShift" style="background:rgba(255,255,255,.7);padding:0 5px">Смещение текстуры по X</span><br/>        <input style="width:250px" id="xShift" type="range" min="-2.5" max="2.5" step=".01" value="'+ptzconfig.xShift+'" onchange="changepztconfig(this.value,\'xShift\')"><br/>\
            <span for="yShift" style="background:rgba(255,255,255,.7);padding:0 5px">Смещение текстуры по Y</span><br/>        <input style="width:250px" id="yShift" type="range" min="-2.5" max="2.5" step=".01" value="'+ptzconfig.yShift+'" onchange="changepztconfig(this.value,\'yShift\')"><br/>\
            <span for="zLens" style="background:rgba(255,255,255,.7);padding:0 5px">Коррекция выпуклости линзы</span><br/>     <input style="width:250px" id="yShift" type="range" min="-2.5" max="2.5" step=".01" value="'+ptzconfig.zLens+'" onchange="changepztconfig(this.value,\'zLens\')"><br/>\
            <span for="xLens" style="background:rgba(255,255,255,.7);padding:0 5px">Коррекция масштаба линзы по X</span><br/>     <input style="width:250px" id="xLens" type="range" min=".5" max="2" step=".01" value="'+ptzconfig.xLens+'" onchange="changepztconfig(this.value,\'xLens\')"><br/>\
            <button onclick="testplay()">Проиграть тестовый пример</button>&nbsp;<button onclick="testplay2()">Проиграть второй пример</button>\
        ';
//        video_container.parentElement.insertBefore(sliders,video_container);


        self.canvas = document.createElement("canvas");
        self.canvas.style.width = "100%";
        self.canvas.style.height = "100%";
        self.canvas.style.display = "none";

        video_container.parentElement.insertBefore(canvas,video_container);
        self.canvas.setAttribute('width', video_container.parentElement.offsetWidth)
        self.canvas.setAttribute('height', video_container.parentElement.offsetHeight)

        self.canvas.addEventListener("mousemove", self.mouseMoveHandler);
        self.canvas.addEventListener("wheel", self.mouseWheelHandler);

        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        for (var i = 0; i < names.length; ++i) {
            var gl;
            try {
                gl = self.canvas.getContext(names[i]);
            } catch(e) {
                continue;
            }
            if (gl) return gl;
        }

        throw new Error("WebGL is not supported!");
    }
    self.compileShader = function(gl, vertexSrc, fragmentSrc){
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSrc);
        gl.compileShader(vertexShader);

        _checkCompile(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSrc);
        gl.compileShader(fragmentShader);

        _checkCompile(fragmentShader);

        var program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        return program;

        function _checkCompile(shader){
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(shader));
            }
        }
    }
    self.run = function(onframe){
        var f = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        if(f){
            f(on);
        } else {
            throw new Error("do not support 'requestAnimationFram'");
        }

        var current = null;
        function on(t){
            if(!current) current = t;
            var dt = t - current;
            current = t;
            onframe(dt);
            f(on);
        }
    }

    function initTexture(gl) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        var level = 0;
        var internalFormat = gl.RGBA;
        var width = 1;
        var height = 1;
        var border = 0;
        var srcFormat = gl.RGBA;
        var srcType = gl.UNSIGNED_BYTE;
        var pixel = new Uint8Array([0, 0, 0, 255]);  // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,width, height, border, srcFormat, srcType,pixel);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return texture;
    }

    function updateTexture(gl, texture, video) {
        var level = 0;
        var internalFormat = gl.RGBA;
        var srcFormat = gl.RGBA;
        var srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
    }

    self.ptz_enabled = false;

    self.start = function(){
        self.load_model();
        self.ptz_enabled = true;
        self.canvas.style.display = "block";
        self.container.style.visibility="hidden";
        self.container.style.position="fixed";
        self.container.style.top="0";
        self.container.style.height="1px";
        self.container.style.width="1px";
        self.container.style.zIndex="-1";
    }
    self.stop = function(){
        self.ptz_enabled = false;
        self.canvas.style.display = "none";
        self.container.style.visibility="";
        self.container.style.position="";
        self.container.style.top="";
        self.container.style.height="";
        self.container.style.width="";
        self.container.style.zIndex="";
    }


    function create_model(model){
/*
        var di=0;
        const pi = 3.1415926535897932;
        var a=b=0,vx=is=0;
        model.vertex=[];
        model.indices=[];
        model.texture=[];
        while(1){
            var v1 = get_point_from_angles(a,b);
            var v2 = get_point_from_angles(a+2*pi/ptzconfig.divider,b);
            var v3 = get_point_from_angles(a+pi/ptzconfig.divider,b+2*pi/ptzconfig.divider);
            var v4 = get_point_from_angles(a+2*pi/ptzconfig.divider+pi/ptzconfig.divider,b+2*pi/ptzconfig.divider);
            a += 2*pi/ptzconfig.divider;
            if (di>=ptzconfig.divider) {
                di=0;
                a = a + 2*pi/ptzconfig.divider/2;
                b += 2*pi/ptzconfig.divider;
            } else
                di++;
            if (a>2*pi) a -= 2*pi;
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v1[0];model.vertex[vx++]=v1[1];model.vertex[vx++]=v1[2];
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v2[0];model.vertex[vx++]=v2[1];model.vertex[vx++]=v2[2];
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v3[0];model.vertex[vx++]=v3[1];model.vertex[vx++]=v3[2];
          
            model.texture.push((v1[0]+1.0)/2.0);
            model.texture.push((v1[1]+1.0)/2.0);
            model.texture.push((v2[0]+1.0)/2.0);
            model.texture.push((v2[1]+1.0)/2.0);
            model.texture.push((v3[0]+1.0)/2.0);
            model.texture.push((v3[1]+1.0)/2.0);
          
          
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v2[0];model.vertex[vx++]=v2[1];model.vertex[vx++]=v2[2];
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v3[0];model.vertex[vx++]=v3[1];model.vertex[vx++]=v3[2];
            model.indices = model.indices.concat([vx,vx+1,vx+2]);
            model.vertex[vx++]=v4[0];model.vertex[vx++]=v4[1];model.vertex[vx++]=v4[2];
          
            model.texture.push((v2[0]+1.0)/2.0);
            model.texture.push((v2[1]+1.0)/2.0);
            model.texture.push((v3[0]+1.0)/2.0);
            model.texture.push((v3[1]+1.0)/2.0);
            model.texture.push((v4[0]+1.0)/2.0);
            model.texture.push((v4[1]+1.0)/2.0);
          
            if (b>pi/2) 
                break;
        }
        
        function get_point_from_angles(a,b){
            if (b>pi/2) b=pi/2;
            if (b<0) b=0;
            while (a>=2*pi) a-=2*pi;
            var x = Math.cos(a)*Math.cos(b);
            var y = Math.sin(a)*Math.cos(b);
            var z = -Math.sin(b);
            return [x,y,z];
        }
*/
        
    }
 
    create_model(self.model);

    self.gl = createGLContext();

    var vertexSrc = "\
        attribute vec3 aVertexPosition;\n\
        attribute vec2 aTextureCoord;\n\
        uniform mat4 uMVMatrix;\n\
        uniform mat4 uPMatrix;\n\
        uniform float fCamShift;\n\
        uniform float zLens;\n\
        varying vec2 vTextureCoord;\n\
        void main(void) {\n\
            gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z*zLens+fCamShift, 1.0);\n\
            vTextureCoord = aTextureCoord;\n\
        }";
    var fragmentSrc = "\
        precision mediump float;\n\
        varying vec2 vTextureCoord;\n\
        uniform sampler2D uSampler;\n\
        uniform vec4 uScale;\n\
        void main(void) {\n\
            gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x / uScale.x + uScale.z, vTextureCoord.y / uScale.y + uScale.w));\n\
        }";

    var program = self.compileShader(self.gl, vertexSrc, fragmentSrc);
    self.gl.useProgram(program);

    self.aVertexPosition = self.gl.getAttribLocation(program, "aVertexPosition");
    self.aTextureCoord = self.gl.getAttribLocation(program, "aTextureCoord");
    self.uSampler = self.gl.getUniformLocation(program, "uSampler");
    self.uScale = self.gl.getUniformLocation(program, "uScale");
    self.pMatrixUniform = self.gl.getUniformLocation(program, "uPMatrix");
    self.mvMatrixUniform = self.gl.getUniformLocation(program, "uMVMatrix");
    self.fCamShift= self.gl.getUniformLocation(program, "fCamShift");
    self.zLens= self.gl.getUniformLocation(program, "zLens");

    self.texture = initTexture(gl);
    self.mvMatrix = mat4.create();
    self.pMatrix = mat4.create();

    self.run(function(dt){
        if (!self.ptz_enabled) return;
        if (!self.textureBuffer || !self.indexBuffer) return;
        var videos = self.container.querySelectorAll('video');
        var video;
        // search active video container
        for (var i = 0; i < videos.length; ++i) 
            if (getComputedStyle(videos[i],null).display!="none" && getComputedStyle(videos[i].parentElement,null).display!="none") {
                video = videos[i];
                break;
            }

        updateTexture(self.gl, self.texture, video);
        
        self.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        self.gl.enable(gl.DEPTH_TEST);
        self.gl.clear(self.gl.COLOR_BUFFER_BIT | self.gl.DEPTH_BUFFER_BIT);
        if (!player.isPlaying()) return;

        self.gl.viewport(0, 0, self.canvas.width , self.canvas.height);

        mat4.perspective(45, self.canvas.width / self.canvas.height, 0.1, 100.0, self.pMatrix);

        mat4.identity(self.mvMatrix);

        mat4.translate(self.mvMatrix, [0.0, 0.0, ptzconfig.zZoom]);

        mat4.rotate(self.mvMatrix, degToRad(ptzconfig.xRot), [1, 0, 0]);
        mat4.rotate(self.mvMatrix, degToRad(ptzconfig.zRot), [0, 0, 1]);
        
        self.gl.enableVertexAttribArray(self.aVertexPosition);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.vertexBuffer);
        self.gl.vertexAttribPointer(aVertexPosition, 3, self.gl.FLOAT, false, 0, 0);

        self.gl.enableVertexAttribArray(self.aTextureCoord);

        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.textureBuffer);
        self.gl.vertexAttribPointer(self.aTextureCoord, 2, self.gl.FLOAT, false, 0, 0);

        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.texture);
        self.gl.pixelStorei(self.gl.UNPACK_FLIP_Y_WEBGL, true);
        self.gl.uniform1i(self.uSampler, 0);
        self.gl.uniform4f(self.uScale, ptzconfig.xScale,ptzconfig.yScale,ptzconfig.xShift, ptzconfig.yShift);

        self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
        self.gl.uniformMatrix4fv(self.pMatrixUniform, false, self.pMatrix);
        self.gl.uniformMatrix4fv(self.mvMatrixUniform, false, self.mvMatrix);
        self.gl.uniform1f(self.fCamShift, ptzconfig.zCamShift);
        self.gl.uniform1f(self.zLens, ptzconfig.zLens);
        self.gl.drawElements(self.gl.TRIANGLES, self.model.vertex.length/3, self.gl.UNSIGNED_SHORT, model.indices);
    });

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    return this;
}

// glMatrix v0.9.5
glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};

!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("rangeSlider",[],e):"object"==typeof exports?exports.rangeSlider=e():t.rangeSlider=e()}(window,function(){return function(i){var n={};function s(t){if(n[t])return n[t].exports;var e=n[t]={i:t,l:!1,exports:{}};return i[t].call(e.exports,e,e.exports,s),e.l=!0,e.exports}return s.m=i,s.c=n,s.d=function(t,e,i){s.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:i})},s.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(s.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(i,n,function(t){return e[t]}.bind(null,n));return i},s.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return s.d(e,"a",e),e},s.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},s.p="",s(s.s=1)}([function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});e.uuid=function(){var t=function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)};return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()},e.delay=function(t,e){for(var i=arguments.length,n=Array(2<i?i-2:0),s=2;s<i;s++)n[s-2]=arguments[s];return setTimeout(function(){return t.apply(null,n)},e)},e.debounce=function(n){var s=1<arguments.length&&void 0!==arguments[1]?arguments[1]:100;return function(){for(var t=arguments.length,e=Array(t),i=0;i<t;i++)e[i]=arguments[i];return n.debouncing||(n.lastReturnVal=n.apply(window,e),n.debouncing=!0),clearTimeout(n.debounceTimeout),n.debounceTimeout=setTimeout(function(){n.debouncing=!1},s),n.lastReturnVal}};var n=e.isString=function(t){return t===""+t},r=(e.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)},e.isNumberLike=function(t){return null!=t&&(n(t)&&isFinite(parseFloat(t))||isFinite(t))});e.getFirsNumberLike=function(){for(var t=arguments.length,e=Array(t),i=0;i<t;i++)e[i]=arguments[i];if(!e.length)return null;for(var n=0,s=e.length;n<s;n++)if(r(e[n]))return e[n];return null},e.isObject=function(t){return"[object Object]"===Object.prototype.toString.call(t)},e.simpleExtend=function(t,e){var i={};for(var n in t)i[n]=t[n];for(var s in e)i[s]=e[s];return i},e.between=function(t,e,i){return t<e?e:i<t?i:t}},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=function(){function n(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(t,e,i){return e&&n(t.prototype,e),i&&n(t,i),t}}(),l=s(i(2)),h=s(i(0));function s(t){if(t&&t.__esModule)return t;var e={};if(null!=t)for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e.default=t,e}i(3);var o=new RegExp("/[\\n\\t]/","g"),u="rangeSlider",d=l.supportsRange(),f={polyfill:!0,root:document,rangeClass:"rangeSlider",disabledClass:"rangeSlider--disabled",fillClass:"rangeSlider__fill",bufferClass:"rangeSlider__buffer",handleClass:"rangeSlider__handle",startEvent:["mousedown","touchstart","pointerdown"],moveEvent:["mousemove","touchmove","pointermove"],endEvent:["mouseup","touchend","pointerup"],min:null,max:null,step:null,value:null,buffer:null,stick:null,borderRadius:10,vertical:!1},r=function(){function a(t,e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,a);var i=void 0,n=void 0,s=void 0;if(this.element=t,this.options=h.simpleExtend(f,e),this.polyfill=this.options.polyfill,this.vertical=this.options.vertical,this.onInit=this.options.onInit,this.onSlide=this.options.onSlide,this.onSlideStart=this.options.onSlideStart,this.onSlideEnd=this.options.onSlideEnd,this.onSlideEventsCount=-1,this.isInteractsNow=!1,this.needTriggerEvents=!1,this.polyfill||!d){this.options.buffer=this.options.buffer||parseFloat(this.element.getAttribute("data-buffer")),this.identifier="js-"+u+"-"+h.uuid(),this.min=h.getFirsNumberLike(this.options.min,parseFloat(this.element.getAttribute("min")),0),this.max=h.getFirsNumberLike(this.options.max,parseFloat(this.element.getAttribute("max")),100),this.value=h.getFirsNumberLike(this.options.value,this.element.value,parseFloat(this.element.value||this.min+(this.max-this.min)/2)),this.step=h.getFirsNumberLike(this.options.step,parseFloat(this.element.getAttribute("step"))||(i=1)),this.percent=null,h.isArray(this.options.stick)&&1<=this.options.stick.length?this.stick=this.options.stick:(n=this.element.getAttribute("stick"))&&1<=(s=n.split(" ")).length&&(this.stick=s.map(parseFloat)),this.stick&&1===this.stick.length&&this.stick.push(1.5*this.step),this._updatePercentFromValue(),this.toFixed=this._toFixed(this.step);var r=void 0;this.container=document.createElement("div"),l.addClass(this.container,this.options.fillClass),r=this.vertical?this.options.fillClass+"__vertical":this.options.fillClass+"__horizontal",l.addClass(this.container,r),this.handle=document.createElement("div"),l.addClass(this.handle,this.options.handleClass),r=this.vertical?this.options.handleClass+"__vertical":this.options.handleClass+"__horizontal",l.addClass(this.handle,r),this.range=document.createElement("div"),l.addClass(this.range,this.options.rangeClass),this.range.id=this.identifier;var o=t.getAttribute("title");o&&0<o.length&&this.range.setAttribute("title",o),this.options.bufferClass&&(this.buffer=document.createElement("div"),l.addClass(this.buffer,this.options.bufferClass),this.range.appendChild(this.buffer),r=this.vertical?this.options.bufferClass+"__vertical":this.options.bufferClass+"__horizontal",l.addClass(this.buffer,r)),this.range.appendChild(this.container),this.range.appendChild(this.handle),r=this.vertical?this.options.rangeClass+"__vertical":this.options.rangeClass+"__horizontal",l.addClass(this.range,r),h.isNumberLike(this.options.value)&&(this._setValue(this.options.value,!0),this.element.value=this.options.value),h.isNumberLike(this.options.buffer)&&this.element.setAttribute("data-buffer",this.options.buffer),h.isNumberLike(this.options.min)&&this.element.setAttribute("min",""+this.min),h.isNumberLike(this.options.max),this.element.setAttribute("max",""+this.max),(h.isNumberLike(this.options.step)||i)&&this.element.setAttribute("step",""+this.step),l.insertAfter(this.element,this.range),l.setCss(this.element,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",opacity:"0"}),this._handleDown=this._handleDown.bind(this),this._handleMove=this._handleMove.bind(this),this._handleEnd=this._handleEnd.bind(this),this._startEventListener=this._startEventListener.bind(this),this._changeEventListener=this._changeEventListener.bind(this),this._handleResize=this._handleResize.bind(this),this._init(),window.addEventListener("resize",this._handleResize,!1),l.addEventListeners(this.options.root,this.options.startEvent,this._startEventListener),this.element.addEventListener("change",this._changeEventListener,!1)}}return n(a,[{key:"update",value:function(t,e){return e&&(this.needTriggerEvents=!0),h.isObject(t)&&(h.isNumberLike(t.min)&&(this.element.setAttribute("min",""+t.min),this.min=t.min),h.isNumberLike(t.max)&&(this.element.setAttribute("max",""+t.max),this.max=t.max),h.isNumberLike(t.step)&&(this.element.setAttribute("step",""+t.step),this.step=t.step,this.toFixed=this._toFixed(t.step)),h.isNumberLike(t.buffer)&&this._setBufferPosition(t.buffer),h.isNumberLike(t.value)&&this._setValue(t.value)),this._update(),this.onSlideEventsCount=0,this.needTriggerEvents=!1,this}},{key:"destroy",value:function(){l.removeAllListenersFromEl(this,this.options.root),window.removeEventListener("resize",this._handleResize,!1),this.element.removeEventListener("change",this._changeEventListener,!1),this.element.style.cssText="",delete this.element[u],this.range&&this.range.parentNode.removeChild(this.range)}},{key:"_toFixed",value:function(t){return(t+"").replace(".","").length-1}},{key:"_init",value:function(){this.onInit&&"function"==typeof this.onInit&&this.onInit(),this._update(!1)}},{key:"_updatePercentFromValue",value:function(){this.percent=(this.value-this.min)/(this.max-this.min)}},{key:"_startEventListener",value:function(t,e){var i=this,n=t.target,s=!1;(1===t.which||"touches"in t)&&(l.forEachAncestors(n,function(t){return s=t.id===i.identifier&&!l.hasClass(t,i.options.disabledClass)},!0),s&&this._handleDown(t,e))}},{key:"_changeEventListener",value:function(t,e){if(!e||e.origin!==this.identifier){var i=t.target.value,n=this._getPositionFromValue(i);this._setPosition(n)}}},{key:"_update",value:function(t){var e=this.vertical?"offsetHeight":"offsetWidth";this.handleSize=l.getDimension(this.handle,e),this.rangeSize=l.getDimension(this.range,e),this.maxHandleX=this.rangeSize-this.handleSize,this.grabX=this.handleSize/2,this.position=this._getPositionFromValue(this.value),this.element.disabled?l.addClass(this.range,this.options.disabledClass):l.removeClass(this.range,this.options.disabledClass),this._setPosition(this.position),this.options.bufferClass&&this.options.buffer&&this._setBufferPosition(this.options.buffer),this._updatePercentFromValue(),!1!==t&&l.triggerEvent(this.element,"change",{origin:this.identifier})}},{key:"_handleResize",value:function(){var t=this;return h.debounce(function(){h.delay(function(){t._update()},300)},50)()}},{key:"_handleDown",value:function(t){if(this.isInteractsNow=!0,t.preventDefault(),l.addEventListeners(this.options.root,this.options.moveEvent,this._handleMove),l.addEventListeners(this.options.root,this.options.endEvent,this._handleEnd),!(-1<(" "+t.target.className+" ").replace(o," ").indexOf(this.options.handleClass))){var e=this.range.getBoundingClientRect(),i=this._getRelativePosition(t),n=this.vertical?e.bottom:e.left,s=this._getPositionFromNode(this.handle)-n,r=i-this.grabX;this._setPosition(r),s<=i&&i<s+2*this.options.borderRadius&&(this.grabX=i-s),this._updatePercentFromValue()}}},{key:"_handleMove",value:function(t){var e=this._getRelativePosition(t);this.isInteractsNow=!0,t.preventDefault(),this._setPosition(e-this.grabX)}},{key:"_handleEnd",value:function(t){t.preventDefault(),l.removeEventListeners(this.options.root,this.options.moveEvent,this._handleMove),l.removeEventListeners(this.options.root,this.options.endEvent,this._handleEnd),l.triggerEvent(this.element,"change",{origin:this.identifier}),(this.isInteractsNow||this.needTriggerEvents)&&this.onSlideEnd&&"function"==typeof this.onSlideEnd&&this.onSlideEnd(this.value,this.percent,this.position),this.onSlideEventsCount=0,this.isInteractsNow=!1}},{key:"_setPosition",value:function(t){var e,i=void 0,n=void 0,s=void 0,r=this._getValueFromPosition(h.between(t,0,this.maxHandleX));this.stick&&((n=r%(s=this.stick[0]))<(i=this.stick[1]||.1)?r-=n:Math.abs(s-n)<i&&(r=r-n+s)),e=this._getPositionFromValue(r),this.vertical?(this.container.style.height=e+this.grabX+"px",this.handle.style.webkitTransform="translateY(-"+e+"px)",this.handle.style.msTransform="translateY(-"+e+"px)",this.handle.style.transform="translateY(-"+e+"px)"):(this.container.style.width=e+this.grabX+"px",this.handle.style.webkitTransform="translateX("+e+"px)",this.handle.style.msTransform="translateX("+e+"px)",this.handle.style.transform="translateX("+e+"px)"),this._setValue(r),this.position=e,this.value=r,this._updatePercentFromValue(),(this.isInteractsNow||this.needTriggerEvents)&&(this.onSlideStart&&"function"==typeof this.onSlideStart&&0===this.onSlideEventsCount&&this.onSlideStart(this.value,this.percent,this.position),this.onSlide&&"function"==typeof this.onSlide&&this.onSlide(this.value,this.percent,this.position)),this.onSlideEventsCount++}},{key:"_setBufferPosition",value:function(t){var e=!0;if(isFinite(t))t=parseFloat(t);else{if(!h.isString(t))return void console.warn("New position must be XXpx or XX%");0<t.indexOf("px")&&(e=!1),t=parseFloat(t)}if(isNaN(t))console.warn("New position is NaN");else if(this.options.bufferClass){var i=e?t:t/this.rangeSize*100;i<0&&(i=0),100<i&&(i=100),this.options.buffer=i;var n=this.options.borderRadius/this.rangeSize*100,s=i-n;s<0&&(s=0),this.vertical?(this.buffer.style.height=s+"%",this.buffer.style.bottom=.5*n+"%"):(this.buffer.style.width=s+"%",this.buffer.style.left=.5*n+"%"),this.element.setAttribute("data-buffer",i)}else console.warn("You disabled buffer, it's className is empty")}},{key:"_getPositionFromNode",value:function(t){for(var e=this.vertical?this.maxHandleX:0;null!==t;)e+=this.vertical?t.offsetTop:t.offsetLeft,t=t.offsetParent;return e}},{key:"_getRelativePosition",value:function(t){var e=this.range.getBoundingClientRect(),i=this.vertical?e.bottom:e.left,n=0,s=this.vertical?"pageY":"pageX";return void 0!==t[s]?n=t.touches&&t.touches.length?t.touches[0][s]:t[s]:void 0!==t.originalEvent?void 0!==t.originalEvent[s]?n=t.originalEvent[s]:t.originalEvent.touches&&t.originalEvent.touches[0]&&void 0!==t.originalEvent.touches[0][s]&&(n=t.originalEvent.touches[0][s]):t.touches&&t.touches[0]&&void 0!==t.touches[0][s]?n=t.touches[0][s]:!t.currentPoint||void 0===t.currentPoint.x&&void 0===t.currentPoint.y||(n=this.vertical?t.currentPoint.y:t.currentPoint.x),this.vertical&&(n-=window.pageYOffset),this.vertical?i-n:n-i}},{key:"_getPositionFromValue",value:function(t){var e=(t-this.min)/(this.max-this.min)*this.maxHandleX;return isNaN(e)?0:e}},{key:"_getValueFromPosition",value:function(t){var e=t/(this.maxHandleX||1),i=this.step*Math.round(e*(this.max-this.min)/this.step)+this.min;return Number(i.toFixed(this.toFixed))}},{key:"_setValue",value:function(t,e){(t!==this.value||e)&&(this.element.value=t,this.value=t,l.triggerEvent(this.element,"input",{origin:this.identifier}))}}],[{key:"create",value:function(t,i){var e=function(t){var e=t[u];e||(e=new a(t,i),t[u]=e)};t.length?Array.prototype.slice.call(t).forEach(function(t){e(t)}):e(t)}}]),a}();(e.default=r).version="0.4.10",r.dom=l,r.functions=h,t.exports=e.default},function(t,e,i){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.supportsRange=e.removeAllListenersFromEl=e.removeEventListeners=e.addEventListeners=e.insertAfter=e.triggerEvent=e.forEachAncestors=e.removeClass=e.addClass=e.hasClass=e.setCss=e.getDimension=e.getHiddenParentNodes=e.isHidden=e.detectIE=void 0;var s=function(t){{if(t&&t.__esModule)return t;var e={};if(null!=t)for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e.default=t,e}}(i(0));var r="eventListenerList",n=(e.detectIE=function(){var t=window.navigator.userAgent,e=t.indexOf("MSIE ");if(0<e)return parseInt(t.substring(e+5,t.indexOf(".",e)),10);if(0<t.indexOf("Trident/")){var i=t.indexOf("rv:");return parseInt(t.substring(i+3,t.indexOf(".",i)),10)}var n=t.indexOf("Edge/");return 0<n&&parseInt(t.substring(n+5,t.indexOf(".",n)),10)})(),o=!(!window.PointerEvent||n)&&{passive:!1},a=e.isHidden=function(t){return 0===t.offsetWidth||0===t.offsetHeight||!1===t.open},h=e.getHiddenParentNodes=function(t){for(var e=[],i=t.parentNode;i&&a(i);)e.push(i),i=i.parentNode;return e},l=(e.getDimension=function(t,e){var i=h(t),n=i.length,s=[],r=t[e],o=function(t){void 0!==t.open&&(t.open=!t.open)};if(n){for(var a=0;a<n;a++)s.push({display:i[a].style.display,height:i[a].style.height,overflow:i[a].style.overflow,visibility:i[a].style.visibility}),i[a].style.display="block",i[a].style.height="0",i[a].style.overflow="hidden",i[a].style.visibility="hidden",o(i[a]);r=t[e];for(var l=0;l<n;l++)o(i[l]),i[l].style.display=s[l].display,i[l].style.height=s[l].height,i[l].style.overflow=s[l].overflow,i[l].style.visibility=s[l].visibility}return r},e.setCss=function(t,e){for(var i in e)t.style[i]=e[i];return t.style},e.hasClass=function(t,e){return new RegExp(" "+e+" ").test(" "+t.className+" ")});e.addClass=function(t,e){l(t,e)||(t.className+=" "+e)},e.removeClass=function(t,e){var i=" "+t.className.replace(/[\t\r\n]/g," ")+" ";if(l(t,e)){for(;0<=i.indexOf(" "+e+" ");)i=i.replace(" "+e+" "," ");t.className=i.replace(/^\s+|\s+$/g,"")}},e.forEachAncestors=function(t,e,i){for(i&&e(t);t.parentNode&&!e(t);)t=t.parentNode;return t},e.triggerEvent=function(t,e,i){if(!s.isString(e))throw new TypeError("event name must be String");if(!(t instanceof HTMLElement))throw new TypeError("element must be HTMLElement");e=e.trim();var n=document.createEvent("CustomEvent");n.initCustomEvent(e,!1,!1,i),t.dispatchEvent(n)},e.insertAfter=function(t,e){return t.parentNode.insertBefore(e,t.nextSibling)},e.addEventListeners=function(e,t,i){t.forEach(function(t){e[r]||(e[r]={}),e[r][t]||(e[r][t]=[]),e.addEventListener(t,i,o),e[r][t].indexOf(i)<0&&e[r][t].push(i)})},e.removeEventListeners=function(i,t,n){t.forEach(function(t){var e=void 0;i.removeEventListener(t,n,!1),i[r]&&i[r][t]&&-1<(e=i[r][t].indexOf(n))&&i[r][t].splice(e,1)})},e.removeAllListenersFromEl=function(e,t){if(t[r]){for(var i in t[r])t[r][i].forEach(n,{eventName:i,el:t});t[r]={}}function n(t){t===e._startEventListener&&this.el.removeEventListener(this.eventName,t,!1)}},e.supportsRange=function(){var t=document.createElement("input");return t.setAttribute("type","range"),"text"!==t.type}},function(t,e,i){}])});
//# sourceMappingURL=range-slider.min.js.map
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.moment=t()}(this,function(){"use strict";function e(){return Yt.apply(null,arguments)}function t(e){return e instanceof Array||"[object Array]"===Object.prototype.toString.call(e)}function n(e){return null!=e&&"[object Object]"===Object.prototype.toString.call(e)}function s(e){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(e).length;var t;for(t in e)if(e.hasOwnProperty(t))return!1;return!0}function i(e){return void 0===e}function r(e){return"number"==typeof e||"[object Number]"===Object.prototype.toString.call(e)}function a(e){return e instanceof Date||"[object Date]"===Object.prototype.toString.call(e)}function o(e,t){var n,s=[];for(n=0;n<e.length;++n)s.push(t(e[n],n));return s}function u(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function l(e,t){for(var n in t)u(t,n)&&(e[n]=t[n]);return u(t,"toString")&&(e.toString=t.toString),u(t,"valueOf")&&(e.valueOf=t.valueOf),e}function d(e,t,n,s){return je(e,t,n,s,!0).utc()}function h(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function c(e){return null==e._pf&&(e._pf=h()),e._pf}function f(e){if(null==e._isValid){var t=c(e),n=Ot.call(t.parsedDateParts,function(e){return null!=e}),s=!isNaN(e._d.getTime())&&t.overflow<0&&!t.empty&&!t.invalidMonth&&!t.invalidWeekday&&!t.weekdayMismatch&&!t.nullInput&&!t.invalidFormat&&!t.userInvalidated&&(!t.meridiem||t.meridiem&&n);if(e._strict&&(s=s&&0===t.charsLeftOver&&0===t.unusedTokens.length&&void 0===t.bigHour),null!=Object.isFrozen&&Object.isFrozen(e))return s;e._isValid=s}return e._isValid}function m(e){var t=d(NaN);return null!=e?l(c(t),e):c(t).userInvalidated=!0,t}function _(e,t){var n,s,r;if(i(t._isAMomentObject)||(e._isAMomentObject=t._isAMomentObject),i(t._i)||(e._i=t._i),i(t._f)||(e._f=t._f),i(t._l)||(e._l=t._l),i(t._strict)||(e._strict=t._strict),i(t._tzm)||(e._tzm=t._tzm),i(t._isUTC)||(e._isUTC=t._isUTC),i(t._offset)||(e._offset=t._offset),i(t._pf)||(e._pf=c(t)),i(t._locale)||(e._locale=t._locale),xt.length>0)for(n=0;n<xt.length;n++)i(r=t[s=xt[n]])||(e[s]=r);return e}function y(t){_(this,t),this._d=new Date(null!=t._d?t._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===Tt&&(Tt=!0,e.updateOffset(this),Tt=!1)}function g(e){return e instanceof y||null!=e&&null!=e._isAMomentObject}function p(e){return e<0?Math.ceil(e)||0:Math.floor(e)}function w(e){var t=+e,n=0;return 0!==t&&isFinite(t)&&(n=p(t)),n}function v(e,t,n){var s,i=Math.min(e.length,t.length),r=Math.abs(e.length-t.length),a=0;for(s=0;s<i;s++)(n&&e[s]!==t[s]||!n&&w(e[s])!==w(t[s]))&&a++;return a+r}function M(t){!1===e.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+t)}function k(t,n){var s=!0;return l(function(){if(null!=e.deprecationHandler&&e.deprecationHandler(null,t),s){for(var i,r=[],a=0;a<arguments.length;a++){if(i="","object"==typeof arguments[a]){i+="\n["+a+"] ";for(var o in arguments[0])i+=o+": "+arguments[0][o]+", ";i=i.slice(0,-2)}else i=arguments[a];r.push(i)}M(t+"\nArguments: "+Array.prototype.slice.call(r).join("")+"\n"+(new Error).stack),s=!1}return n.apply(this,arguments)},n)}function S(t,n){null!=e.deprecationHandler&&e.deprecationHandler(t,n),bt[t]||(M(n),bt[t]=!0)}function D(e){return e instanceof Function||"[object Function]"===Object.prototype.toString.call(e)}function Y(e,t){var s,i=l({},e);for(s in t)u(t,s)&&(n(e[s])&&n(t[s])?(i[s]={},l(i[s],e[s]),l(i[s],t[s])):null!=t[s]?i[s]=t[s]:delete i[s]);for(s in e)u(e,s)&&!u(t,s)&&n(e[s])&&(i[s]=l({},i[s]));return i}function O(e){null!=e&&this.set(e)}function x(e,t){var n=e.toLowerCase();Ut[n]=Ut[n+"s"]=Ut[t]=e}function T(e){return"string"==typeof e?Ut[e]||Ut[e.toLowerCase()]:void 0}function b(e){var t,n,s={};for(n in e)u(e,n)&&(t=T(n))&&(s[t]=e[n]);return s}function P(e,t){Nt[e]=t}function W(e){var t=[];for(var n in e)t.push({unit:n,priority:Nt[n]});return t.sort(function(e,t){return e.priority-t.priority}),t}function R(e,t,n){var s=""+Math.abs(e),i=t-s.length;return(e>=0?n?"+":"":"-")+Math.pow(10,Math.max(0,i)).toString().substr(1)+s}function C(e,t,n,s){var i=s;"string"==typeof s&&(i=function(){return this[s]()}),e&&(Vt[e]=i),t&&(Vt[t[0]]=function(){return R(i.apply(this,arguments),t[1],t[2])}),n&&(Vt[n]=function(){return this.localeData().ordinal(i.apply(this,arguments),e)})}function F(e){return e.match(/\[[\s\S]/)?e.replace(/^\[|\]$/g,""):e.replace(/\\/g,"")}function U(e){var t,n,s=e.match(Ht);for(t=0,n=s.length;t<n;t++)Vt[s[t]]?s[t]=Vt[s[t]]:s[t]=F(s[t]);return function(t){var i,r="";for(i=0;i<n;i++)r+=D(s[i])?s[i].call(t,e):s[i];return r}}function N(e,t){return e.isValid()?(t=H(t,e.localeData()),Gt[t]=Gt[t]||U(t),Gt[t](e)):e.localeData().invalidDate()}function H(e,t){var n=5;for(Lt.lastIndex=0;n>=0&&Lt.test(e);)e=e.replace(Lt,function(e){return t.longDateFormat(e)||e}),Lt.lastIndex=0,n-=1;return e}function L(e,t,n){rn[e]=D(t)?t:function(e,s){return e&&n?n:t}}function G(e,t){return u(rn,e)?rn[e](t._strict,t._locale):new RegExp(V(e))}function V(e){return j(e.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(e,t,n,s,i){return t||n||s||i}))}function j(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function I(e,t){var n,s=t;for("string"==typeof e&&(e=[e]),r(t)&&(s=function(e,n){n[t]=w(e)}),n=0;n<e.length;n++)an[e[n]]=s}function E(e,t){I(e,function(e,n,s,i){s._w=s._w||{},t(e,s._w,s,i)})}function A(e,t,n){null!=t&&u(an,e)&&an[e](t,n._a,n,e)}function z(e){return Z(e)?366:365}function Z(e){return e%4==0&&e%100!=0||e%400==0}function $(t,n){return function(s){return null!=s?(J(this,t,s),e.updateOffset(this,n),this):q(this,t)}}function q(e,t){return e.isValid()?e._d["get"+(e._isUTC?"UTC":"")+t]():NaN}function J(e,t,n){e.isValid()&&!isNaN(n)&&("FullYear"===t&&Z(e.year())?e._d["set"+(e._isUTC?"UTC":"")+t](n,e.month(),Q(n,e.month())):e._d["set"+(e._isUTC?"UTC":"")+t](n))}function B(e,t){return(e%t+t)%t}function Q(e,t){if(isNaN(e)||isNaN(t))return NaN;var n=B(t,12);return e+=(t-n)/12,1===n?Z(e)?29:28:31-n%7%2}function X(e,t,n){var s,i,r,a=e.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],s=0;s<12;++s)r=d([2e3,s]),this._shortMonthsParse[s]=this.monthsShort(r,"").toLocaleLowerCase(),this._longMonthsParse[s]=this.months(r,"").toLocaleLowerCase();return n?"MMM"===t?-1!==(i=yn.call(this._shortMonthsParse,a))?i:null:-1!==(i=yn.call(this._longMonthsParse,a))?i:null:"MMM"===t?-1!==(i=yn.call(this._shortMonthsParse,a))?i:-1!==(i=yn.call(this._longMonthsParse,a))?i:null:-1!==(i=yn.call(this._longMonthsParse,a))?i:-1!==(i=yn.call(this._shortMonthsParse,a))?i:null}function K(e,t){var n;if(!e.isValid())return e;if("string"==typeof t)if(/^\d+$/.test(t))t=w(t);else if(t=e.localeData().monthsParse(t),!r(t))return e;return n=Math.min(e.date(),Q(e.year(),t)),e._d["set"+(e._isUTC?"UTC":"")+"Month"](t,n),e}function ee(t){return null!=t?(K(this,t),e.updateOffset(this,!0),this):q(this,"Month")}function te(){function e(e,t){return t.length-e.length}var t,n,s=[],i=[],r=[];for(t=0;t<12;t++)n=d([2e3,t]),s.push(this.monthsShort(n,"")),i.push(this.months(n,"")),r.push(this.months(n,"")),r.push(this.monthsShort(n,""));for(s.sort(e),i.sort(e),r.sort(e),t=0;t<12;t++)s[t]=j(s[t]),i[t]=j(i[t]);for(t=0;t<24;t++)r[t]=j(r[t]);this._monthsRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+s.join("|")+")","i")}function ne(e,t,n,s,i,r,a){var o=new Date(e,t,n,s,i,r,a);return e<100&&e>=0&&isFinite(o.getFullYear())&&o.setFullYear(e),o}function se(e){var t=new Date(Date.UTC.apply(null,arguments));return e<100&&e>=0&&isFinite(t.getUTCFullYear())&&t.setUTCFullYear(e),t}function ie(e,t,n){var s=7+t-n;return-((7+se(e,0,s).getUTCDay()-t)%7)+s-1}function re(e,t,n,s,i){var r,a,o=1+7*(t-1)+(7+n-s)%7+ie(e,s,i);return o<=0?a=z(r=e-1)+o:o>z(e)?(r=e+1,a=o-z(e)):(r=e,a=o),{year:r,dayOfYear:a}}function ae(e,t,n){var s,i,r=ie(e.year(),t,n),a=Math.floor((e.dayOfYear()-r-1)/7)+1;return a<1?s=a+oe(i=e.year()-1,t,n):a>oe(e.year(),t,n)?(s=a-oe(e.year(),t,n),i=e.year()+1):(i=e.year(),s=a),{week:s,year:i}}function oe(e,t,n){var s=ie(e,t,n),i=ie(e+1,t,n);return(z(e)-s+i)/7}function ue(e,t){return"string"!=typeof e?e:isNaN(e)?"number"==typeof(e=t.weekdaysParse(e))?e:null:parseInt(e,10)}function le(e,t){return"string"==typeof e?t.weekdaysParse(e)%7||7:isNaN(e)?null:e}function de(e,t,n){var s,i,r,a=e.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],s=0;s<7;++s)r=d([2e3,1]).day(s),this._minWeekdaysParse[s]=this.weekdaysMin(r,"").toLocaleLowerCase(),this._shortWeekdaysParse[s]=this.weekdaysShort(r,"").toLocaleLowerCase(),this._weekdaysParse[s]=this.weekdays(r,"").toLocaleLowerCase();return n?"dddd"===t?-1!==(i=yn.call(this._weekdaysParse,a))?i:null:"ddd"===t?-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:null:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:"dddd"===t?-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:"ddd"===t?-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:null:-1!==(i=yn.call(this._minWeekdaysParse,a))?i:-1!==(i=yn.call(this._weekdaysParse,a))?i:-1!==(i=yn.call(this._shortWeekdaysParse,a))?i:null}function he(){function e(e,t){return t.length-e.length}var t,n,s,i,r,a=[],o=[],u=[],l=[];for(t=0;t<7;t++)n=d([2e3,1]).day(t),s=this.weekdaysMin(n,""),i=this.weekdaysShort(n,""),r=this.weekdays(n,""),a.push(s),o.push(i),u.push(r),l.push(s),l.push(i),l.push(r);for(a.sort(e),o.sort(e),u.sort(e),l.sort(e),t=0;t<7;t++)o[t]=j(o[t]),u[t]=j(u[t]),l[t]=j(l[t]);this._weekdaysRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+u.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+o.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+a.join("|")+")","i")}function ce(){return this.hours()%12||12}function fe(e,t){C(e,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),t)})}function me(e,t){return t._meridiemParse}function _e(e){return e?e.toLowerCase().replace("_","-"):e}function ye(e){for(var t,n,s,i,r=0;r<e.length;){for(t=(i=_e(e[r]).split("-")).length,n=(n=_e(e[r+1]))?n.split("-"):null;t>0;){if(s=ge(i.slice(0,t).join("-")))return s;if(n&&n.length>=t&&v(i,n,!0)>=t-1)break;t--}r++}return null}function ge(e){var t=null;if(!Fn[e]&&"undefined"!=typeof module&&module&&module.exports)try{t=Pn._abbr,require("./locale/"+e),pe(t)}catch(e){}return Fn[e]}function pe(e,t){var n;return e&&(n=i(t)?ve(e):we(e,t))&&(Pn=n),Pn._abbr}function we(e,t){if(null!==t){var n=Cn;if(t.abbr=e,null!=Fn[e])S("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),n=Fn[e]._config;else if(null!=t.parentLocale){if(null==Fn[t.parentLocale])return Un[t.parentLocale]||(Un[t.parentLocale]=[]),Un[t.parentLocale].push({name:e,config:t}),null;n=Fn[t.parentLocale]._config}return Fn[e]=new O(Y(n,t)),Un[e]&&Un[e].forEach(function(e){we(e.name,e.config)}),pe(e),Fn[e]}return delete Fn[e],null}function ve(e){var n;if(e&&e._locale&&e._locale._abbr&&(e=e._locale._abbr),!e)return Pn;if(!t(e)){if(n=ge(e))return n;e=[e]}return ye(e)}function Me(e){var t,n=e._a;return n&&-2===c(e).overflow&&(t=n[un]<0||n[un]>11?un:n[ln]<1||n[ln]>Q(n[on],n[un])?ln:n[dn]<0||n[dn]>24||24===n[dn]&&(0!==n[hn]||0!==n[cn]||0!==n[fn])?dn:n[hn]<0||n[hn]>59?hn:n[cn]<0||n[cn]>59?cn:n[fn]<0||n[fn]>999?fn:-1,c(e)._overflowDayOfYear&&(t<on||t>ln)&&(t=ln),c(e)._overflowWeeks&&-1===t&&(t=mn),c(e)._overflowWeekday&&-1===t&&(t=_n),c(e).overflow=t),e}function ke(e,t,n){return null!=e?e:null!=t?t:n}function Se(t){var n=new Date(e.now());return t._useUTC?[n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()]:[n.getFullYear(),n.getMonth(),n.getDate()]}function De(e){var t,n,s,i,r=[];if(!e._d){for(s=Se(e),e._w&&null==e._a[ln]&&null==e._a[un]&&Ye(e),null!=e._dayOfYear&&(i=ke(e._a[on],s[on]),(e._dayOfYear>z(i)||0===e._dayOfYear)&&(c(e)._overflowDayOfYear=!0),n=se(i,0,e._dayOfYear),e._a[un]=n.getUTCMonth(),e._a[ln]=n.getUTCDate()),t=0;t<3&&null==e._a[t];++t)e._a[t]=r[t]=s[t];for(;t<7;t++)e._a[t]=r[t]=null==e._a[t]?2===t?1:0:e._a[t];24===e._a[dn]&&0===e._a[hn]&&0===e._a[cn]&&0===e._a[fn]&&(e._nextDay=!0,e._a[dn]=0),e._d=(e._useUTC?se:ne).apply(null,r),null!=e._tzm&&e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),e._nextDay&&(e._a[dn]=24),e._w&&void 0!==e._w.d&&e._w.d!==e._d.getDay()&&(c(e).weekdayMismatch=!0)}}function Ye(e){var t,n,s,i,r,a,o,u;if(null!=(t=e._w).GG||null!=t.W||null!=t.E)r=1,a=4,n=ke(t.GG,e._a[on],ae(Ie(),1,4).year),s=ke(t.W,1),((i=ke(t.E,1))<1||i>7)&&(u=!0);else{r=e._locale._week.dow,a=e._locale._week.doy;var l=ae(Ie(),r,a);n=ke(t.gg,e._a[on],l.year),s=ke(t.w,l.week),null!=t.d?((i=t.d)<0||i>6)&&(u=!0):null!=t.e?(i=t.e+r,(t.e<0||t.e>6)&&(u=!0)):i=r}s<1||s>oe(n,r,a)?c(e)._overflowWeeks=!0:null!=u?c(e)._overflowWeekday=!0:(o=re(n,s,i,r,a),e._a[on]=o.year,e._dayOfYear=o.dayOfYear)}function Oe(e){var t,n,s,i,r,a,o=e._i,u=Nn.exec(o)||Hn.exec(o);if(u){for(c(e).iso=!0,t=0,n=Gn.length;t<n;t++)if(Gn[t][1].exec(u[1])){i=Gn[t][0],s=!1!==Gn[t][2];break}if(null==i)return void(e._isValid=!1);if(u[3]){for(t=0,n=Vn.length;t<n;t++)if(Vn[t][1].exec(u[3])){r=(u[2]||" ")+Vn[t][0];break}if(null==r)return void(e._isValid=!1)}if(!s&&null!=r)return void(e._isValid=!1);if(u[4]){if(!Ln.exec(u[4]))return void(e._isValid=!1);a="Z"}e._f=i+(r||"")+(a||""),Fe(e)}else e._isValid=!1}function xe(e,t,n,s,i,r){var a=[Te(e),vn.indexOf(t),parseInt(n,10),parseInt(s,10),parseInt(i,10)];return r&&a.push(parseInt(r,10)),a}function Te(e){var t=parseInt(e,10);return t<=49?2e3+t:t<=999?1900+t:t}function be(e){return e.replace(/\([^)]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim()}function Pe(e,t,n){return!e||Yn.indexOf(e)===new Date(t[0],t[1],t[2]).getDay()||(c(n).weekdayMismatch=!0,n._isValid=!1,!1)}function We(e,t,n){if(e)return En[e];if(t)return 0;var s=parseInt(n,10),i=s%100;return 60*((s-i)/100)+i}function Re(e){var t=In.exec(be(e._i));if(t){var n=xe(t[4],t[3],t[2],t[5],t[6],t[7]);if(!Pe(t[1],n,e))return;e._a=n,e._tzm=We(t[8],t[9],t[10]),e._d=se.apply(null,e._a),e._d.setUTCMinutes(e._d.getUTCMinutes()-e._tzm),c(e).rfc2822=!0}else e._isValid=!1}function Ce(t){var n=jn.exec(t._i);null===n?(Oe(t),!1===t._isValid&&(delete t._isValid,Re(t),!1===t._isValid&&(delete t._isValid,e.createFromInputFallback(t)))):t._d=new Date(+n[1])}function Fe(t){if(t._f!==e.ISO_8601)if(t._f!==e.RFC_2822){t._a=[],c(t).empty=!0;var n,s,i,r,a,o=""+t._i,u=o.length,l=0;for(i=H(t._f,t._locale).match(Ht)||[],n=0;n<i.length;n++)r=i[n],(s=(o.match(G(r,t))||[])[0])&&((a=o.substr(0,o.indexOf(s))).length>0&&c(t).unusedInput.push(a),o=o.slice(o.indexOf(s)+s.length),l+=s.length),Vt[r]?(s?c(t).empty=!1:c(t).unusedTokens.push(r),A(r,s,t)):t._strict&&!s&&c(t).unusedTokens.push(r);c(t).charsLeftOver=u-l,o.length>0&&c(t).unusedInput.push(o),t._a[dn]<=12&&!0===c(t).bigHour&&t._a[dn]>0&&(c(t).bigHour=void 0),c(t).parsedDateParts=t._a.slice(0),c(t).meridiem=t._meridiem,t._a[dn]=Ue(t._locale,t._a[dn],t._meridiem),De(t),Me(t)}else Re(t);else Oe(t)}function Ue(e,t,n){var s;return null==n?t:null!=e.meridiemHour?e.meridiemHour(t,n):null!=e.isPM?((s=e.isPM(n))&&t<12&&(t+=12),s||12!==t||(t=0),t):t}function Ne(e){var t,n,s,i,r;if(0===e._f.length)return c(e).invalidFormat=!0,void(e._d=new Date(NaN));for(i=0;i<e._f.length;i++)r=0,t=_({},e),null!=e._useUTC&&(t._useUTC=e._useUTC),t._f=e._f[i],Fe(t),f(t)&&(r+=c(t).charsLeftOver,r+=10*c(t).unusedTokens.length,c(t).score=r,(null==s||r<s)&&(s=r,n=t));l(e,n||t)}function He(e){if(!e._d){var t=b(e._i);e._a=o([t.year,t.month,t.day||t.date,t.hour,t.minute,t.second,t.millisecond],function(e){return e&&parseInt(e,10)}),De(e)}}function Le(e){var t=new y(Me(Ge(e)));return t._nextDay&&(t.add(1,"d"),t._nextDay=void 0),t}function Ge(e){var n=e._i,s=e._f;return e._locale=e._locale||ve(e._l),null===n||void 0===s&&""===n?m({nullInput:!0}):("string"==typeof n&&(e._i=n=e._locale.preparse(n)),g(n)?new y(Me(n)):(a(n)?e._d=n:t(s)?Ne(e):s?Fe(e):Ve(e),f(e)||(e._d=null),e))}function Ve(s){var u=s._i;i(u)?s._d=new Date(e.now()):a(u)?s._d=new Date(u.valueOf()):"string"==typeof u?Ce(s):t(u)?(s._a=o(u.slice(0),function(e){return parseInt(e,10)}),De(s)):n(u)?He(s):r(u)?s._d=new Date(u):e.createFromInputFallback(s)}function je(e,i,r,a,o){var u={};return!0!==r&&!1!==r||(a=r,r=void 0),(n(e)&&s(e)||t(e)&&0===e.length)&&(e=void 0),u._isAMomentObject=!0,u._useUTC=u._isUTC=o,u._l=r,u._i=e,u._f=i,u._strict=a,Le(u)}function Ie(e,t,n,s){return je(e,t,n,s,!1)}function Ee(e,n){var s,i;if(1===n.length&&t(n[0])&&(n=n[0]),!n.length)return Ie();for(s=n[0],i=1;i<n.length;++i)n[i].isValid()&&!n[i][e](s)||(s=n[i]);return s}function Ae(e){for(var t in e)if(-1===yn.call(Zn,t)||null!=e[t]&&isNaN(e[t]))return!1;for(var n=!1,s=0;s<Zn.length;++s)if(e[Zn[s]]){if(n)return!1;parseFloat(e[Zn[s]])!==w(e[Zn[s]])&&(n=!0)}return!0}function ze(e){var t=b(e),n=t.year||0,s=t.quarter||0,i=t.month||0,r=t.week||0,a=t.day||0,o=t.hour||0,u=t.minute||0,l=t.second||0,d=t.millisecond||0;this._isValid=Ae(t),this._milliseconds=+d+1e3*l+6e4*u+1e3*o*60*60,this._days=+a+7*r,this._months=+i+3*s+12*n,this._data={},this._locale=ve(),this._bubble()}function Ze(e){return e instanceof ze}function $e(e){return e<0?-1*Math.round(-1*e):Math.round(e)}function qe(e,t){C(e,0,0,function(){var e=this.utcOffset(),n="+";return e<0&&(e=-e,n="-"),n+R(~~(e/60),2)+t+R(~~e%60,2)})}function Je(e,t){var n=(t||"").match(e);if(null===n)return null;var s=((n[n.length-1]||[])+"").match($n)||["-",0,0],i=60*s[1]+w(s[2]);return 0===i?0:"+"===s[0]?i:-i}function Be(t,n){var s,i;return n._isUTC?(s=n.clone(),i=(g(t)||a(t)?t.valueOf():Ie(t).valueOf())-s.valueOf(),s._d.setTime(s._d.valueOf()+i),e.updateOffset(s,!1),s):Ie(t).local()}function Qe(e){return 15*-Math.round(e._d.getTimezoneOffset()/15)}function Xe(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Ke(e,t){var n,s,i,a=e,o=null;return Ze(e)?a={ms:e._milliseconds,d:e._days,M:e._months}:r(e)?(a={},t?a[t]=e:a.milliseconds=e):(o=qn.exec(e))?(n="-"===o[1]?-1:1,a={y:0,d:w(o[ln])*n,h:w(o[dn])*n,m:w(o[hn])*n,s:w(o[cn])*n,ms:w($e(1e3*o[fn]))*n}):(o=Jn.exec(e))?(n="-"===o[1]?-1:(o[1],1),a={y:et(o[2],n),M:et(o[3],n),w:et(o[4],n),d:et(o[5],n),h:et(o[6],n),m:et(o[7],n),s:et(o[8],n)}):null==a?a={}:"object"==typeof a&&("from"in a||"to"in a)&&(i=nt(Ie(a.from),Ie(a.to)),(a={}).ms=i.milliseconds,a.M=i.months),s=new ze(a),Ze(e)&&u(e,"_locale")&&(s._locale=e._locale),s}function et(e,t){var n=e&&parseFloat(e.replace(",","."));return(isNaN(n)?0:n)*t}function tt(e,t){var n={milliseconds:0,months:0};return n.months=t.month()-e.month()+12*(t.year()-e.year()),e.clone().add(n.months,"M").isAfter(t)&&--n.months,n.milliseconds=+t-+e.clone().add(n.months,"M"),n}function nt(e,t){var n;return e.isValid()&&t.isValid()?(t=Be(t,e),e.isBefore(t)?n=tt(e,t):((n=tt(t,e)).milliseconds=-n.milliseconds,n.months=-n.months),n):{milliseconds:0,months:0}}function st(e,t){return function(n,s){var i,r;return null===s||isNaN(+s)||(S(t,"moment()."+t+"(period, number) is deprecated. Please use moment()."+t+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),r=n,n=s,s=r),n="string"==typeof n?+n:n,i=Ke(n,s),it(this,i,e),this}}function it(t,n,s,i){var r=n._milliseconds,a=$e(n._days),o=$e(n._months);t.isValid()&&(i=null==i||i,o&&K(t,q(t,"Month")+o*s),a&&J(t,"Date",q(t,"Date")+a*s),r&&t._d.setTime(t._d.valueOf()+r*s),i&&e.updateOffset(t,a||o))}function rt(e,t){var n,s=12*(t.year()-e.year())+(t.month()-e.month()),i=e.clone().add(s,"months");return n=t-i<0?(t-i)/(i-e.clone().add(s-1,"months")):(t-i)/(e.clone().add(s+1,"months")-i),-(s+n)||0}function at(e){var t;return void 0===e?this._locale._abbr:(null!=(t=ve(e))&&(this._locale=t),this)}function ot(){return this._locale}function ut(e,t){C(0,[e,e.length],0,t)}function lt(e,t,n,s,i){var r;return null==e?ae(this,s,i).year:(r=oe(e,s,i),t>r&&(t=r),dt.call(this,e,t,n,s,i))}function dt(e,t,n,s,i){var r=re(e,t,n,s,i),a=se(r.year,0,r.dayOfYear);return this.year(a.getUTCFullYear()),this.month(a.getUTCMonth()),this.date(a.getUTCDate()),this}function ht(e){return e}function ct(e,t,n,s){var i=ve(),r=d().set(s,t);return i[n](r,e)}function ft(e,t,n){if(r(e)&&(t=e,e=void 0),e=e||"",null!=t)return ct(e,t,n,"month");var s,i=[];for(s=0;s<12;s++)i[s]=ct(e,s,n,"month");return i}function mt(e,t,n,s){"boolean"==typeof e?(r(t)&&(n=t,t=void 0),t=t||""):(n=t=e,e=!1,r(t)&&(n=t,t=void 0),t=t||"");var i=ve(),a=e?i._week.dow:0;if(null!=n)return ct(t,(n+a)%7,s,"day");var o,u=[];for(o=0;o<7;o++)u[o]=ct(t,(o+a)%7,s,"day");return u}function _t(e,t,n,s){var i=Ke(t,n);return e._milliseconds+=s*i._milliseconds,e._days+=s*i._days,e._months+=s*i._months,e._bubble()}function yt(e){return e<0?Math.floor(e):Math.ceil(e)}function gt(e){return 4800*e/146097}function pt(e){return 146097*e/4800}function wt(e){return function(){return this.as(e)}}function vt(e){return function(){return this.isValid()?this._data[e]:NaN}}function Mt(e,t,n,s,i){return i.relativeTime(t||1,!!n,e,s)}function kt(e,t,n){var s=Ke(e).abs(),i=ks(s.as("s")),r=ks(s.as("m")),a=ks(s.as("h")),o=ks(s.as("d")),u=ks(s.as("M")),l=ks(s.as("y")),d=i<=Ss.ss&&["s",i]||i<Ss.s&&["ss",i]||r<=1&&["m"]||r<Ss.m&&["mm",r]||a<=1&&["h"]||a<Ss.h&&["hh",a]||o<=1&&["d"]||o<Ss.d&&["dd",o]||u<=1&&["M"]||u<Ss.M&&["MM",u]||l<=1&&["y"]||["yy",l];return d[2]=t,d[3]=+e>0,d[4]=n,Mt.apply(null,d)}function St(e){return(e>0)-(e<0)||+e}function Dt(){if(!this.isValid())return this.localeData().invalidDate();var e,t,n,s=Ds(this._milliseconds)/1e3,i=Ds(this._days),r=Ds(this._months);t=p((e=p(s/60))/60),s%=60,e%=60;var a=n=p(r/12),o=r%=12,u=i,l=t,d=e,h=s?s.toFixed(3).replace(/\.?0+$/,""):"",c=this.asSeconds();if(!c)return"P0D";var f=c<0?"-":"",m=St(this._months)!==St(c)?"-":"",_=St(this._days)!==St(c)?"-":"",y=St(this._milliseconds)!==St(c)?"-":"";return f+"P"+(a?m+a+"Y":"")+(o?m+o+"M":"")+(u?_+u+"D":"")+(l||d||h?"T":"")+(l?y+l+"H":"")+(d?y+d+"M":"")+(h?y+h+"S":"")}var Yt,Ot;Ot=Array.prototype.some?Array.prototype.some:function(e){for(var t=Object(this),n=t.length>>>0,s=0;s<n;s++)if(s in t&&e.call(this,t[s],s,t))return!0;return!1};var xt=e.momentProperties=[],Tt=!1,bt={};e.suppressDeprecationWarnings=!1,e.deprecationHandler=null;var Pt;Pt=Object.keys?Object.keys:function(e){var t,n=[];for(t in e)u(e,t)&&n.push(t);return n};var Wt={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Rt={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},Ct=/\d{1,2}/,Ft={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Ut={},Nt={},Ht=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Lt=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Gt={},Vt={},jt=/\d/,It=/\d\d/,Et=/\d{3}/,At=/\d{4}/,zt=/[+-]?\d{6}/,Zt=/\d\d?/,$t=/\d\d\d\d?/,qt=/\d\d\d\d\d\d?/,Jt=/\d{1,3}/,Bt=/\d{1,4}/,Qt=/[+-]?\d{1,6}/,Xt=/\d+/,Kt=/[+-]?\d+/,en=/Z|[+-]\d\d:?\d\d/gi,tn=/Z|[+-]\d\d(?::?\d\d)?/gi,nn=/[+-]?\d+(\.\d{1,3})?/,sn=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,rn={},an={},on=0,un=1,ln=2,dn=3,hn=4,cn=5,fn=6,mn=7,_n=8;C("Y",0,0,function(){var e=this.year();return e<=9999?""+e:"+"+e}),C(0,["YY",2],0,function(){return this.year()%100}),C(0,["YYYY",4],0,"year"),C(0,["YYYYY",5],0,"year"),C(0,["YYYYYY",6,!0],0,"year"),x("year","y"),P("year",1),L("Y",Kt),L("YY",Zt,It),L("YYYY",Bt,At),L("YYYYY",Qt,zt),L("YYYYYY",Qt,zt),I(["YYYYY","YYYYYY"],on),I("YYYY",function(t,n){n[on]=2===t.length?e.parseTwoDigitYear(t):w(t)}),I("YY",function(t,n){n[on]=e.parseTwoDigitYear(t)}),I("Y",function(e,t){t[on]=parseInt(e,10)}),e.parseTwoDigitYear=function(e){return w(e)+(w(e)>68?1900:2e3)};var yn,gn=$("FullYear",!0);yn=Array.prototype.indexOf?Array.prototype.indexOf:function(e){var t;for(t=0;t<this.length;++t)if(this[t]===e)return t;return-1},C("M",["MM",2],"Mo",function(){return this.month()+1}),C("MMM",0,0,function(e){return this.localeData().monthsShort(this,e)}),C("MMMM",0,0,function(e){return this.localeData().months(this,e)}),x("month","M"),P("month",8),L("M",Zt),L("MM",Zt,It),L("MMM",function(e,t){return t.monthsShortRegex(e)}),L("MMMM",function(e,t){return t.monthsRegex(e)}),I(["M","MM"],function(e,t){t[un]=w(e)-1}),I(["MMM","MMMM"],function(e,t,n,s){var i=n._locale.monthsParse(e,s,n._strict);null!=i?t[un]=i:c(n).invalidMonth=e});var pn=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,wn="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),vn="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Mn=sn,kn=sn;C("w",["ww",2],"wo","week"),C("W",["WW",2],"Wo","isoWeek"),x("week","w"),x("isoWeek","W"),P("week",5),P("isoWeek",5),L("w",Zt),L("ww",Zt,It),L("W",Zt),L("WW",Zt,It),E(["w","ww","W","WW"],function(e,t,n,s){t[s.substr(0,1)]=w(e)});var Sn={dow:0,doy:6};C("d",0,"do","day"),C("dd",0,0,function(e){return this.localeData().weekdaysMin(this,e)}),C("ddd",0,0,function(e){return this.localeData().weekdaysShort(this,e)}),C("dddd",0,0,function(e){return this.localeData().weekdays(this,e)}),C("e",0,0,"weekday"),C("E",0,0,"isoWeekday"),x("day","d"),x("weekday","e"),x("isoWeekday","E"),P("day",11),P("weekday",11),P("isoWeekday",11),L("d",Zt),L("e",Zt),L("E",Zt),L("dd",function(e,t){return t.weekdaysMinRegex(e)}),L("ddd",function(e,t){return t.weekdaysShortRegex(e)}),L("dddd",function(e,t){return t.weekdaysRegex(e)}),E(["dd","ddd","dddd"],function(e,t,n,s){var i=n._locale.weekdaysParse(e,s,n._strict);null!=i?t.d=i:c(n).invalidWeekday=e}),E(["d","e","E"],function(e,t,n,s){t[s]=w(e)});var Dn="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Yn="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),On="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),xn=sn,Tn=sn,bn=sn;C("H",["HH",2],0,"hour"),C("h",["hh",2],0,ce),C("k",["kk",2],0,function(){return this.hours()||24}),C("hmm",0,0,function(){return""+ce.apply(this)+R(this.minutes(),2)}),C("hmmss",0,0,function(){return""+ce.apply(this)+R(this.minutes(),2)+R(this.seconds(),2)}),C("Hmm",0,0,function(){return""+this.hours()+R(this.minutes(),2)}),C("Hmmss",0,0,function(){return""+this.hours()+R(this.minutes(),2)+R(this.seconds(),2)}),fe("a",!0),fe("A",!1),x("hour","h"),P("hour",13),L("a",me),L("A",me),L("H",Zt),L("h",Zt),L("k",Zt),L("HH",Zt,It),L("hh",Zt,It),L("kk",Zt,It),L("hmm",$t),L("hmmss",qt),L("Hmm",$t),L("Hmmss",qt),I(["H","HH"],dn),I(["k","kk"],function(e,t,n){var s=w(e);t[dn]=24===s?0:s}),I(["a","A"],function(e,t,n){n._isPm=n._locale.isPM(e),n._meridiem=e}),I(["h","hh"],function(e,t,n){t[dn]=w(e),c(n).bigHour=!0}),I("hmm",function(e,t,n){var s=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s)),c(n).bigHour=!0}),I("hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s,2)),t[cn]=w(e.substr(i)),c(n).bigHour=!0}),I("Hmm",function(e,t,n){var s=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s))}),I("Hmmss",function(e,t,n){var s=e.length-4,i=e.length-2;t[dn]=w(e.substr(0,s)),t[hn]=w(e.substr(s,2)),t[cn]=w(e.substr(i))});var Pn,Wn=/[ap]\.?m?\.?/i,Rn=$("Hours",!0),Cn={calendar:Wt,longDateFormat:Rt,invalidDate:"Invalid date",ordinal:"%d",dayOfMonthOrdinalParse:Ct,relativeTime:Ft,months:wn,monthsShort:vn,week:Sn,weekdays:Dn,weekdaysMin:On,weekdaysShort:Yn,meridiemParse:Wn},Fn={},Un={},Nn=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Hn=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ln=/Z|[+-]\d\d(?::?\d\d)?/,Gn=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],Vn=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],jn=/^\/?Date\((\-?\d+)/i,In=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,En={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};e.createFromInputFallback=k("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(e){e._d=new Date(e._i+(e._useUTC?" UTC":""))}),e.ISO_8601=function(){},e.RFC_2822=function(){};var An=k("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=Ie.apply(null,arguments);return this.isValid()&&e.isValid()?e<this?this:e:m()}),zn=k("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var e=Ie.apply(null,arguments);return this.isValid()&&e.isValid()?e>this?this:e:m()}),Zn=["year","quarter","month","week","day","hour","minute","second","millisecond"];qe("Z",":"),qe("ZZ",""),L("Z",tn),L("ZZ",tn),I(["Z","ZZ"],function(e,t,n){n._useUTC=!0,n._tzm=Je(tn,e)});var $n=/([\+\-]|\d\d)/gi;e.updateOffset=function(){};var qn=/^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Jn=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;Ke.fn=ze.prototype,Ke.invalid=function(){return Ke(NaN)};var Bn=st(1,"add"),Qn=st(-1,"subtract");e.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",e.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Xn=k("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(e){return void 0===e?this.localeData():this.locale(e)});C(0,["gg",2],0,function(){return this.weekYear()%100}),C(0,["GG",2],0,function(){return this.isoWeekYear()%100}),ut("gggg","weekYear"),ut("ggggg","weekYear"),ut("GGGG","isoWeekYear"),ut("GGGGG","isoWeekYear"),x("weekYear","gg"),x("isoWeekYear","GG"),P("weekYear",1),P("isoWeekYear",1),L("G",Kt),L("g",Kt),L("GG",Zt,It),L("gg",Zt,It),L("GGGG",Bt,At),L("gggg",Bt,At),L("GGGGG",Qt,zt),L("ggggg",Qt,zt),E(["gggg","ggggg","GGGG","GGGGG"],function(e,t,n,s){t[s.substr(0,2)]=w(e)}),E(["gg","GG"],function(t,n,s,i){n[i]=e.parseTwoDigitYear(t)}),C("Q",0,"Qo","quarter"),x("quarter","Q"),P("quarter",7),L("Q",jt),I("Q",function(e,t){t[un]=3*(w(e)-1)}),C("D",["DD",2],"Do","date"),x("date","D"),P("date",9),L("D",Zt),L("DD",Zt,It),L("Do",function(e,t){return e?t._dayOfMonthOrdinalParse||t._ordinalParse:t._dayOfMonthOrdinalParseLenient}),I(["D","DD"],ln),I("Do",function(e,t){t[ln]=w(e.match(Zt)[0],10)});var Kn=$("Date",!0);C("DDD",["DDDD",3],"DDDo","dayOfYear"),x("dayOfYear","DDD"),P("dayOfYear",4),L("DDD",Jt),L("DDDD",Et),I(["DDD","DDDD"],function(e,t,n){n._dayOfYear=w(e)}),C("m",["mm",2],0,"minute"),x("minute","m"),P("minute",14),L("m",Zt),L("mm",Zt,It),I(["m","mm"],hn);var es=$("Minutes",!1);C("s",["ss",2],0,"second"),x("second","s"),P("second",15),L("s",Zt),L("ss",Zt,It),I(["s","ss"],cn);var ts=$("Seconds",!1);C("S",0,0,function(){return~~(this.millisecond()/100)}),C(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),C(0,["SSS",3],0,"millisecond"),C(0,["SSSS",4],0,function(){return 10*this.millisecond()}),C(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),C(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),C(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),C(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),C(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),x("millisecond","ms"),P("millisecond",16),L("S",Jt,jt),L("SS",Jt,It),L("SSS",Jt,Et);var ns;for(ns="SSSS";ns.length<=9;ns+="S")L(ns,Xt);for(ns="S";ns.length<=9;ns+="S")I(ns,function(e,t){t[fn]=w(1e3*("0."+e))});var ss=$("Milliseconds",!1);C("z",0,0,"zoneAbbr"),C("zz",0,0,"zoneName");var is=y.prototype;is.add=Bn,is.calendar=function(t,n){var s=t||Ie(),i=Be(s,this).startOf("day"),r=e.calendarFormat(this,i)||"sameElse",a=n&&(D(n[r])?n[r].call(this,s):n[r]);return this.format(a||this.localeData().calendar(r,this,Ie(s)))},is.clone=function(){return new y(this)},is.diff=function(e,t,n){var s,i,r;if(!this.isValid())return NaN;if(!(s=Be(e,this)).isValid())return NaN;switch(i=6e4*(s.utcOffset()-this.utcOffset()),t=T(t)){case"year":r=rt(this,s)/12;break;case"month":r=rt(this,s);break;case"quarter":r=rt(this,s)/3;break;case"second":r=(this-s)/1e3;break;case"minute":r=(this-s)/6e4;break;case"hour":r=(this-s)/36e5;break;case"day":r=(this-s-i)/864e5;break;case"week":r=(this-s-i)/6048e5;break;default:r=this-s}return n?r:p(r)},is.endOf=function(e){return void 0===(e=T(e))||"millisecond"===e?this:("date"===e&&(e="day"),this.startOf(e).add(1,"isoWeek"===e?"week":e).subtract(1,"ms"))},is.format=function(t){t||(t=this.isUtc()?e.defaultFormatUtc:e.defaultFormat);var n=N(this,t);return this.localeData().postformat(n)},is.from=function(e,t){return this.isValid()&&(g(e)&&e.isValid()||Ie(e).isValid())?Ke({to:this,from:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},is.fromNow=function(e){return this.from(Ie(),e)},is.to=function(e,t){return this.isValid()&&(g(e)&&e.isValid()||Ie(e).isValid())?Ke({from:this,to:e}).locale(this.locale()).humanize(!t):this.localeData().invalidDate()},is.toNow=function(e){return this.to(Ie(),e)},is.get=function(e){return e=T(e),D(this[e])?this[e]():this},is.invalidAt=function(){return c(this).overflow},is.isAfter=function(e,t){var n=g(e)?e:Ie(e);return!(!this.isValid()||!n.isValid())&&("millisecond"===(t=T(i(t)?"millisecond":t))?this.valueOf()>n.valueOf():n.valueOf()<this.clone().startOf(t).valueOf())},is.isBefore=function(e,t){var n=g(e)?e:Ie(e);return!(!this.isValid()||!n.isValid())&&("millisecond"===(t=T(i(t)?"millisecond":t))?this.valueOf()<n.valueOf():this.clone().endOf(t).valueOf()<n.valueOf())},is.isBetween=function(e,t,n,s){return("("===(s=s||"()")[0]?this.isAfter(e,n):!this.isBefore(e,n))&&(")"===s[1]?this.isBefore(t,n):!this.isAfter(t,n))},is.isSame=function(e,t){var n,s=g(e)?e:Ie(e);return!(!this.isValid()||!s.isValid())&&("millisecond"===(t=T(t||"millisecond"))?this.valueOf()===s.valueOf():(n=s.valueOf(),this.clone().startOf(t).valueOf()<=n&&n<=this.clone().endOf(t).valueOf()))},is.isSameOrAfter=function(e,t){return this.isSame(e,t)||this.isAfter(e,t)},is.isSameOrBefore=function(e,t){return this.isSame(e,t)||this.isBefore(e,t)},is.isValid=function(){return f(this)},is.lang=Xn,is.locale=at,is.localeData=ot,is.max=zn,is.min=An,is.parsingFlags=function(){return l({},c(this))},is.set=function(e,t){if("object"==typeof e)for(var n=W(e=b(e)),s=0;s<n.length;s++)this[n[s].unit](e[n[s].unit]);else if(e=T(e),D(this[e]))return this[e](t);return this},is.startOf=function(e){switch(e=T(e)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":case"date":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===e&&this.weekday(0),"isoWeek"===e&&this.isoWeekday(1),"quarter"===e&&this.month(3*Math.floor(this.month()/3)),this},is.subtract=Qn,is.toArray=function(){var e=this;return[e.year(),e.month(),e.date(),e.hour(),e.minute(),e.second(),e.millisecond()]},is.toObject=function(){var e=this;return{years:e.year(),months:e.month(),date:e.date(),hours:e.hours(),minutes:e.minutes(),seconds:e.seconds(),milliseconds:e.milliseconds()}},is.toDate=function(){return new Date(this.valueOf())},is.toISOString=function(){if(!this.isValid())return null;var e=this.clone().utc();return e.year()<0||e.year()>9999?N(e,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):D(Date.prototype.toISOString)?this.toDate().toISOString():N(e,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},is.inspect=function(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var e="moment",t="";this.isLocal()||(e=0===this.utcOffset()?"moment.utc":"moment.parseZone",t="Z");var n="["+e+'("]',s=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",i=t+'[")]';return this.format(n+s+"-MM-DD[T]HH:mm:ss.SSS"+i)},is.toJSON=function(){return this.isValid()?this.toISOString():null},is.toString=function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},is.unix=function(){return Math.floor(this.valueOf()/1e3)},is.valueOf=function(){return this._d.valueOf()-6e4*(this._offset||0)},is.creationData=function(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}},is.year=gn,is.isLeapYear=function(){return Z(this.year())},is.weekYear=function(e){return lt.call(this,e,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)},is.isoWeekYear=function(e){return lt.call(this,e,this.isoWeek(),this.isoWeekday(),1,4)},is.quarter=is.quarters=function(e){return null==e?Math.ceil((this.month()+1)/3):this.month(3*(e-1)+this.month()%3)},is.month=ee,is.daysInMonth=function(){return Q(this.year(),this.month())},is.week=is.weeks=function(e){var t=this.localeData().week(this);return null==e?t:this.add(7*(e-t),"d")},is.isoWeek=is.isoWeeks=function(e){var t=ae(this,1,4).week;return null==e?t:this.add(7*(e-t),"d")},is.weeksInYear=function(){var e=this.localeData()._week;return oe(this.year(),e.dow,e.doy)},is.isoWeeksInYear=function(){return oe(this.year(),1,4)},is.date=Kn,is.day=is.days=function(e){if(!this.isValid())return null!=e?this:NaN;var t=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=e?(e=ue(e,this.localeData()),this.add(e-t,"d")):t},is.weekday=function(e){if(!this.isValid())return null!=e?this:NaN;var t=(this.day()+7-this.localeData()._week.dow)%7;return null==e?t:this.add(e-t,"d")},is.isoWeekday=function(e){if(!this.isValid())return null!=e?this:NaN;if(null!=e){var t=le(e,this.localeData());return this.day(this.day()%7?t:t-7)}return this.day()||7},is.dayOfYear=function(e){var t=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==e?t:this.add(e-t,"d")},is.hour=is.hours=Rn,is.minute=is.minutes=es,is.second=is.seconds=ts,is.millisecond=is.milliseconds=ss,is.utcOffset=function(t,n,s){var i,r=this._offset||0;if(!this.isValid())return null!=t?this:NaN;if(null!=t){if("string"==typeof t){if(null===(t=Je(tn,t)))return this}else Math.abs(t)<16&&!s&&(t*=60);return!this._isUTC&&n&&(i=Qe(this)),this._offset=t,this._isUTC=!0,null!=i&&this.add(i,"m"),r!==t&&(!n||this._changeInProgress?it(this,Ke(t-r,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,e.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?r:Qe(this)},is.utc=function(e){return this.utcOffset(0,e)},is.local=function(e){return this._isUTC&&(this.utcOffset(0,e),this._isUTC=!1,e&&this.subtract(Qe(this),"m")),this},is.parseZone=function(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var e=Je(en,this._i);null!=e?this.utcOffset(e):this.utcOffset(0,!0)}return this},is.hasAlignedHourOffset=function(e){return!!this.isValid()&&(e=e?Ie(e).utcOffset():0,(this.utcOffset()-e)%60==0)},is.isDST=function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},is.isLocal=function(){return!!this.isValid()&&!this._isUTC},is.isUtcOffset=function(){return!!this.isValid()&&this._isUTC},is.isUtc=Xe,is.isUTC=Xe,is.zoneAbbr=function(){return this._isUTC?"UTC":""},is.zoneName=function(){return this._isUTC?"Coordinated Universal Time":""},is.dates=k("dates accessor is deprecated. Use date instead.",Kn),is.months=k("months accessor is deprecated. Use month instead",ee),is.years=k("years accessor is deprecated. Use year instead",gn),is.zone=k("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",function(e,t){return null!=e?("string"!=typeof e&&(e=-e),this.utcOffset(e,t),this):-this.utcOffset()}),is.isDSTShifted=k("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",function(){if(!i(this._isDSTShifted))return this._isDSTShifted;var e={};if(_(e,this),(e=Ge(e))._a){var t=e._isUTC?d(e._a):Ie(e._a);this._isDSTShifted=this.isValid()&&v(e._a,t.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted});var rs=O.prototype;rs.calendar=function(e,t,n){var s=this._calendar[e]||this._calendar.sameElse;return D(s)?s.call(t,n):s},rs.longDateFormat=function(e){var t=this._longDateFormat[e],n=this._longDateFormat[e.toUpperCase()];return t||!n?t:(this._longDateFormat[e]=n.replace(/MMMM|MM|DD|dddd/g,function(e){return e.slice(1)}),this._longDateFormat[e])},rs.invalidDate=function(){return this._invalidDate},rs.ordinal=function(e){return this._ordinal.replace("%d",e)},rs.preparse=ht,rs.postformat=ht,rs.relativeTime=function(e,t,n,s){var i=this._relativeTime[n];return D(i)?i(e,t,n,s):i.replace(/%d/i,e)},rs.pastFuture=function(e,t){var n=this._relativeTime[e>0?"future":"past"];return D(n)?n(t):n.replace(/%s/i,t)},rs.set=function(e){var t,n;for(n in e)D(t=e[n])?this[n]=t:this["_"+n]=t;this._config=e,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)},rs.months=function(e,n){return e?t(this._months)?this._months[e.month()]:this._months[(this._months.isFormat||pn).test(n)?"format":"standalone"][e.month()]:t(this._months)?this._months:this._months.standalone},rs.monthsShort=function(e,n){return e?t(this._monthsShort)?this._monthsShort[e.month()]:this._monthsShort[pn.test(n)?"format":"standalone"][e.month()]:t(this._monthsShort)?this._monthsShort:this._monthsShort.standalone},rs.monthsParse=function(e,t,n){var s,i,r;if(this._monthsParseExact)return X.call(this,e,t,n);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),s=0;s<12;s++){if(i=d([2e3,s]),n&&!this._longMonthsParse[s]&&(this._longMonthsParse[s]=new RegExp("^"+this.months(i,"").replace(".","")+"$","i"),this._shortMonthsParse[s]=new RegExp("^"+this.monthsShort(i,"").replace(".","")+"$","i")),n||this._monthsParse[s]||(r="^"+this.months(i,"")+"|^"+this.monthsShort(i,""),this._monthsParse[s]=new RegExp(r.replace(".",""),"i")),n&&"MMMM"===t&&this._longMonthsParse[s].test(e))return s;if(n&&"MMM"===t&&this._shortMonthsParse[s].test(e))return s;if(!n&&this._monthsParse[s].test(e))return s}},rs.monthsRegex=function(e){return this._monthsParseExact?(u(this,"_monthsRegex")||te.call(this),e?this._monthsStrictRegex:this._monthsRegex):(u(this,"_monthsRegex")||(this._monthsRegex=kn),this._monthsStrictRegex&&e?this._monthsStrictRegex:this._monthsRegex)},rs.monthsShortRegex=function(e){return this._monthsParseExact?(u(this,"_monthsRegex")||te.call(this),e?this._monthsShortStrictRegex:this._monthsShortRegex):(u(this,"_monthsShortRegex")||(this._monthsShortRegex=Mn),this._monthsShortStrictRegex&&e?this._monthsShortStrictRegex:this._monthsShortRegex)},rs.week=function(e){return ae(e,this._week.dow,this._week.doy).week},rs.firstDayOfYear=function(){return this._week.doy},rs.firstDayOfWeek=function(){return this._week.dow},rs.weekdays=function(e,n){return e?t(this._weekdays)?this._weekdays[e.day()]:this._weekdays[this._weekdays.isFormat.test(n)?"format":"standalone"][e.day()]:t(this._weekdays)?this._weekdays:this._weekdays.standalone},rs.weekdaysMin=function(e){return e?this._weekdaysMin[e.day()]:this._weekdaysMin},rs.weekdaysShort=function(e){return e?this._weekdaysShort[e.day()]:this._weekdaysShort},rs.weekdaysParse=function(e,t,n){var s,i,r;if(this._weekdaysParseExact)return de.call(this,e,t,n);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),s=0;s<7;s++){if(i=d([2e3,1]).day(s),n&&!this._fullWeekdaysParse[s]&&(this._fullWeekdaysParse[s]=new RegExp("^"+this.weekdays(i,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[s]=new RegExp("^"+this.weekdaysShort(i,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[s]=new RegExp("^"+this.weekdaysMin(i,"").replace(".",".?")+"$","i")),this._weekdaysParse[s]||(r="^"+this.weekdays(i,"")+"|^"+this.weekdaysShort(i,"")+"|^"+this.weekdaysMin(i,""),this._weekdaysParse[s]=new RegExp(r.replace(".",""),"i")),n&&"dddd"===t&&this._fullWeekdaysParse[s].test(e))return s;if(n&&"ddd"===t&&this._shortWeekdaysParse[s].test(e))return s;if(n&&"dd"===t&&this._minWeekdaysParse[s].test(e))return s;if(!n&&this._weekdaysParse[s].test(e))return s}},rs.weekdaysRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysStrictRegex:this._weekdaysRegex):(u(this,"_weekdaysRegex")||(this._weekdaysRegex=xn),this._weekdaysStrictRegex&&e?this._weekdaysStrictRegex:this._weekdaysRegex)},rs.weekdaysShortRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(u(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=Tn),this._weekdaysShortStrictRegex&&e?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)},rs.weekdaysMinRegex=function(e){return this._weekdaysParseExact?(u(this,"_weekdaysRegex")||he.call(this),e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(u(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=bn),this._weekdaysMinStrictRegex&&e?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)},rs.isPM=function(e){return"p"===(e+"").toLowerCase().charAt(0)},rs.meridiem=function(e,t,n){return e>11?n?"pm":"PM":n?"am":"AM"},pe("en",{dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(e){var t=e%10;return e+(1===w(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th")}}),e.lang=k("moment.lang is deprecated. Use moment.locale instead.",pe),e.langData=k("moment.langData is deprecated. Use moment.localeData instead.",ve);var as=Math.abs,os=wt("ms"),us=wt("s"),ls=wt("m"),ds=wt("h"),hs=wt("d"),cs=wt("w"),fs=wt("M"),ms=wt("y"),_s=vt("milliseconds"),ys=vt("seconds"),gs=vt("minutes"),ps=vt("hours"),ws=vt("days"),vs=vt("months"),Ms=vt("years"),ks=Math.round,Ss={ss:44,s:45,m:45,h:22,d:26,M:11},Ds=Math.abs,Ys=ze.prototype;return Ys.isValid=function(){return this._isValid},Ys.abs=function(){var e=this._data;return this._milliseconds=as(this._milliseconds),this._days=as(this._days),this._months=as(this._months),e.milliseconds=as(e.milliseconds),e.seconds=as(e.seconds),e.minutes=as(e.minutes),e.hours=as(e.hours),e.months=as(e.months),e.years=as(e.years),this},Ys.add=function(e,t){return _t(this,e,t,1)},Ys.subtract=function(e,t){return _t(this,e,t,-1)},Ys.as=function(e){if(!this.isValid())return NaN;var t,n,s=this._milliseconds;if("month"===(e=T(e))||"year"===e)return t=this._days+s/864e5,n=this._months+gt(t),"month"===e?n:n/12;switch(t=this._days+Math.round(pt(this._months)),e){case"week":return t/7+s/6048e5;case"day":return t+s/864e5;case"hour":return 24*t+s/36e5;case"minute":return 1440*t+s/6e4;case"second":return 86400*t+s/1e3;case"millisecond":return Math.floor(864e5*t)+s;default:throw new Error("Unknown unit "+e)}},Ys.asMilliseconds=os,Ys.asSeconds=us,Ys.asMinutes=ls,Ys.asHours=ds,Ys.asDays=hs,Ys.asWeeks=cs,Ys.asMonths=fs,Ys.asYears=ms,Ys.valueOf=function(){return this.isValid()?this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*w(this._months/12):NaN},Ys._bubble=function(){var e,t,n,s,i,r=this._milliseconds,a=this._days,o=this._months,u=this._data;return r>=0&&a>=0&&o>=0||r<=0&&a<=0&&o<=0||(r+=864e5*yt(pt(o)+a),a=0,o=0),u.milliseconds=r%1e3,e=p(r/1e3),u.seconds=e%60,t=p(e/60),u.minutes=t%60,n=p(t/60),u.hours=n%24,a+=p(n/24),i=p(gt(a)),o+=i,a-=yt(pt(i)),s=p(o/12),o%=12,u.days=a,u.months=o,u.years=s,this},Ys.clone=function(){return Ke(this)},Ys.get=function(e){return e=T(e),this.isValid()?this[e+"s"]():NaN},Ys.milliseconds=_s,Ys.seconds=ys,Ys.minutes=gs,Ys.hours=ps,Ys.days=ws,Ys.weeks=function(){return p(this.days()/7)},Ys.months=vs,Ys.years=Ms,Ys.humanize=function(e){if(!this.isValid())return this.localeData().invalidDate();var t=this.localeData(),n=kt(this,!e,t);return e&&(n=t.pastFuture(+this,n)),t.postformat(n)},Ys.toISOString=Dt,Ys.toString=Dt,Ys.toJSON=Dt,Ys.locale=at,Ys.localeData=ot,Ys.toIsoString=k("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Dt),Ys.lang=Xn,C("X",0,0,"unix"),C("x",0,0,"valueOf"),L("x",Kt),L("X",nn),I("X",function(e,t,n){n._d=new Date(1e3*parseFloat(e,10))}),I("x",function(e,t,n){n._d=new Date(w(e))}),e.version="2.19.1",function(e){Yt=e}(Ie),e.fn=is,e.min=function(){return Ee("isBefore",[].slice.call(arguments,0))},e.max=function(){return Ee("isAfter",[].slice.call(arguments,0))},e.now=function(){return Date.now?Date.now():+new Date},e.utc=d,e.unix=function(e){return Ie(1e3*e)},e.months=function(e,t){return ft(e,t,"months")},e.isDate=a,e.locale=pe,e.invalid=m,e.duration=Ke,e.isMoment=g,e.weekdays=function(e,t,n){return mt(e,t,n,"weekdays")},e.parseZone=function(){return Ie.apply(null,arguments).parseZone()},e.localeData=ve,e.isDuration=Ze,e.monthsShort=function(e,t){return ft(e,t,"monthsShort")},e.weekdaysMin=function(e,t,n){return mt(e,t,n,"weekdaysMin")},e.defineLocale=we,e.updateLocale=function(e,t){if(null!=t){var n,s=Cn;null!=Fn[e]&&(s=Fn[e]._config),(n=new O(t=Y(s,t))).parentLocale=Fn[e],Fn[e]=n,pe(e)}else null!=Fn[e]&&(null!=Fn[e].parentLocale?Fn[e]=Fn[e].parentLocale:null!=Fn[e]&&delete Fn[e]);return Fn[e]},e.locales=function(){return Pt(Fn)},e.weekdaysShort=function(e,t,n){return mt(e,t,n,"weekdaysShort")},e.normalizeUnits=T,e.relativeTimeRounding=function(e){return void 0===e?ks:"function"==typeof e&&(ks=e,!0)},e.relativeTimeThreshold=function(e,t){return void 0!==Ss[e]&&(void 0===t?Ss[e]:(Ss[e]=t,"s"===e&&(Ss.ss=t-1),!0))},e.calendarFormat=function(e,t){var n=e.diff(t,"days",!0);return n<-6?"sameElse":n<-1?"lastWeek":n<0?"lastDay":n<1?"sameDay":n<2?"nextDay":n<7?"nextWeek":"sameElse"},e.prototype=is,e});
//! moment-timezone.js
//! version : 0.5.13
//! Copyright (c) JS Foundation and other contributors
//! license : MIT
//! github.com/moment/moment-timezone
!function(a,b){"use strict";"function"==typeof define&&define.amd?define(["moment"],b):"object"==typeof module&&module.exports?module.exports=b(require("moment")):b(a.moment)}(this,function(a){"use strict";function b(a){return a>96?a-87:a>64?a-29:a-48}function c(a){var c,d=0,e=a.split("."),f=e[0],g=e[1]||"",h=1,i=0,j=1;for(45===a.charCodeAt(0)&&(d=1,j=-1),d;d<f.length;d++)c=b(f.charCodeAt(d)),i=60*i+c;for(d=0;d<g.length;d++)h/=60,c=b(g.charCodeAt(d)),i+=c*h;return i*j}function d(a){for(var b=0;b<a.length;b++)a[b]=c(a[b])}function e(a,b){for(var c=0;c<b;c++)a[c]=Math.round((a[c-1]||0)+6e4*a[c]);a[b-1]=1/0}function f(a,b){var c,d=[];for(c=0;c<b.length;c++)d[c]=a[b[c]];return d}function g(a){var b=a.split("|"),c=b[2].split(" "),g=b[3].split(""),h=b[4].split(" ");return d(c),d(g),d(h),e(h,g.length),{name:b[0],abbrs:f(b[1].split(" "),g),offsets:f(c,g),untils:h,population:0|b[5]}}function h(a){a&&this._set(g(a))}function i(a){var b=a.toTimeString(),c=b.match(/\([a-z ]+\)/i);c&&c[0]?(c=c[0].match(/[A-Z]/g),c=c?c.join(""):void 0):(c=b.match(/[A-Z]{3,5}/g),c=c?c[0]:void 0),"GMT"===c&&(c=void 0),this.at=+a,this.abbr=c,this.offset=a.getTimezoneOffset()}function j(a){this.zone=a,this.offsetScore=0,this.abbrScore=0}function k(a,b){for(var c,d;d=6e4*((b.at-a.at)/12e4|0);)c=new i(new Date(a.at+d)),c.offset===a.offset?a=c:b=c;return a}function l(){var a,b,c,d=(new Date).getFullYear()-2,e=new i(new Date(d,0,1)),f=[e];for(c=1;c<48;c++)b=new i(new Date(d,c,1)),b.offset!==e.offset&&(a=k(e,b),f.push(a),f.push(new i(new Date(a.at+6e4)))),e=b;for(c=0;c<4;c++)f.push(new i(new Date(d+c,0,1))),f.push(new i(new Date(d+c,6,1)));return f}function m(a,b){return a.offsetScore!==b.offsetScore?a.offsetScore-b.offsetScore:a.abbrScore!==b.abbrScore?a.abbrScore-b.abbrScore:b.zone.population-a.zone.population}function n(a,b){var c,e;for(d(b),c=0;c<b.length;c++)e=b[c],I[e]=I[e]||{},I[e][a]=!0}function o(a){var b,c,d,e=a.length,f={},g=[];for(b=0;b<e;b++){d=I[a[b].offset]||{};for(c in d)d.hasOwnProperty(c)&&(f[c]=!0)}for(b in f)f.hasOwnProperty(b)&&g.push(H[b]);return g}function p(){try{var a=Intl.DateTimeFormat().resolvedOptions().timeZone;if(a){var b=H[r(a)];if(b)return b;z("Moment Timezone found "+a+" from the Intl api, but did not have that data loaded.")}}catch(c){}var d,e,f,g=l(),h=g.length,i=o(g),k=[];for(e=0;e<i.length;e++){for(d=new j(t(i[e]),h),f=0;f<h;f++)d.scoreOffsetAt(g[f]);k.push(d)}return k.sort(m),k.length>0?k[0].zone.name:void 0}function q(a){return D&&!a||(D=p()),D}function r(a){return(a||"").toLowerCase().replace(/\//g,"_")}function s(a){var b,c,d,e;for("string"==typeof a&&(a=[a]),b=0;b<a.length;b++)d=a[b].split("|"),c=d[0],e=r(c),F[e]=a[b],H[e]=c,d[5]&&n(e,d[2].split(" "))}function t(a,b){a=r(a);var c,d=F[a];return d instanceof h?d:"string"==typeof d?(d=new h(d),F[a]=d,d):G[a]&&b!==t&&(c=t(G[a],t))?(d=F[a]=new h,d._set(c),d.name=H[a],d):null}function u(){var a,b=[];for(a in H)H.hasOwnProperty(a)&&(F[a]||F[G[a]])&&H[a]&&b.push(H[a]);return b.sort()}function v(a){var b,c,d,e;for("string"==typeof a&&(a=[a]),b=0;b<a.length;b++)c=a[b].split("|"),d=r(c[0]),e=r(c[1]),G[d]=e,H[d]=c[0],G[e]=d,H[e]=c[1]}function w(a){s(a.zones),v(a.links),A.dataVersion=a.version}function x(a){return x.didShowError||(x.didShowError=!0,z("moment.tz.zoneExists('"+a+"') has been deprecated in favor of !moment.tz.zone('"+a+"')")),!!t(a)}function y(a){return!(!a._a||void 0!==a._tzm)}function z(a){"undefined"!=typeof console&&"function"==typeof console.error&&console.error(a)}function A(b){var c=Array.prototype.slice.call(arguments,0,-1),d=arguments[arguments.length-1],e=t(d),f=a.utc.apply(null,c);return e&&!a.isMoment(b)&&y(f)&&f.add(e.parse(f),"minutes"),f.tz(d),f}function B(a){return function(){return this._z?this._z.abbr(this):a.call(this)}}function C(a){return function(){return this._z=null,a.apply(this,arguments)}}var D,E="0.5.13",F={},G={},H={},I={},J=a.version.split("."),K=+J[0],L=+J[1];(K<2||2===K&&L<6)&&z("Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js "+a.version+". See momentjs.com"),h.prototype={_set:function(a){this.name=a.name,this.abbrs=a.abbrs,this.untils=a.untils,this.offsets=a.offsets,this.population=a.population},_index:function(a){var b,c=+a,d=this.untils;for(b=0;b<d.length;b++)if(c<d[b])return b},parse:function(a){var b,c,d,e,f=+a,g=this.offsets,h=this.untils,i=h.length-1;for(e=0;e<i;e++)if(b=g[e],c=g[e+1],d=g[e?e-1:e],b<c&&A.moveAmbiguousForward?b=c:b>d&&A.moveInvalidForward&&(b=d),f<h[e]-6e4*b)return g[e];return g[i]},abbr:function(a){return this.abbrs[this._index(a)]},offset:function(a){return this.offsets[this._index(a)]}},j.prototype.scoreOffsetAt=function(a){this.offsetScore+=Math.abs(this.zone.offset(a.at)-a.offset),this.zone.abbr(a.at).replace(/[^A-Z]/g,"")!==a.abbr&&this.abbrScore++},A.version=E,A.dataVersion="",A._zones=F,A._links=G,A._names=H,A.add=s,A.link=v,A.load=w,A.zone=t,A.zoneExists=x,A.guess=q,A.names=u,A.Zone=h,A.unpack=g,A.unpackBase60=c,A.needsOffset=y,A.moveInvalidForward=!0,A.moveAmbiguousForward=!1;var M=a.fn;a.tz=A,a.defaultZone=null,a.updateOffset=function(b,c){var d,e=a.defaultZone;void 0===b._z&&(e&&y(b)&&!b._isUTC&&(b._d=a.utc(b._a)._d,b.utc().add(e.parse(b),"minutes")),b._z=e),b._z&&(d=b._z.offset(b),Math.abs(d)<16&&(d/=60),void 0!==b.utcOffset?b.utcOffset(-d,c):b.zone(d,c))},M.tz=function(b){return b?(this._z=t(b),this._z?a.updateOffset(this):z("Moment Timezone has no data for "+b+". See http://momentjs.com/timezone/docs/#/data-loading/."),this):this._z?this._z.name:void 0},M.zoneName=B(M.zoneName),M.zoneAbbr=B(M.zoneAbbr),M.utc=C(M.utc),a.tz.setDefault=function(b){return(K<2||2===K&&L<9)&&z("Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js "+a.version+"."),a.defaultZone=b?t(b):null,a};var N=a.momentProperties;return"[object Array]"===Object.prototype.toString.call(N)?(N.push("_z"),N.push("_a")):N&&(N._z=null),w({version:"2017b",zones:["Africa/Abidjan|GMT|0|0||48e5","Africa/Khartoum|EAT|-30|0||51e5","Africa/Algiers|CET|-10|0||26e5","Africa/Lagos|WAT|-10|0||17e6","Africa/Maputo|CAT|-20|0||26e5","Africa/Cairo|EET EEST|-20 -30|01010|1M2m0 gL0 e10 mn0|15e6","Africa/Casablanca|WET WEST|0 -10|0101010101010101010101010101010101010101010|1H3C0 wM0 co0 go0 1o00 s00 dA0 vc0 11A0 A00 e00 y00 11A0 uM0 e00 Dc0 11A0 s00 e00 IM0 WM0 mo0 gM0 LA0 WM0 jA0 e00 Rc0 11A0 e00 e00 U00 11A0 8o0 e00 11A0 11A0 5A0 e00 17c0 1fA0 1a00|32e5","Europe/Paris|CET CEST|-10 -20|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|11e6","Africa/Johannesburg|SAST|-20|0||84e5","Africa/Tripoli|EET CET CEST|-20 -10 -20|0120|1IlA0 TA0 1o00|11e5","Africa/Windhoek|WAST WAT|-20 -10|01010101010101010101010|1GQo0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0|32e4","America/Adak|HST HDT|a0 90|01010101010101010101010|1GIc0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|326","America/Anchorage|AKST AKDT|90 80|01010101010101010101010|1GIb0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|30e4","America/Santo_Domingo|AST|40|0||29e5","America/Araguaina|-03 -02|30 20|010|1IdD0 Lz0|14e4","America/Fortaleza|-03|30|0||34e5","America/Asuncion|-03 -04|30 40|01010101010101010101010|1GTf0 1cN0 17b0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0 19X0 1ip0 17b0 1ip0 17b0 1ip0 19X0 1fB0 19X0 1fB0|28e5","America/Panama|EST|50|0||15e5","America/Bahia|-02 -03|20 30|01|1GCq0|27e5","America/Mexico_City|CST CDT|60 50|01010101010101010101010|1GQw0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0|20e6","America/Managua|CST|60|0||22e5","America/La_Paz|-04|40|0||19e5","America/Lima|-05|50|0||11e6","America/Denver|MST MDT|70 60|01010101010101010101010|1GI90 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|26e5","America/Campo_Grande|-03 -04|30 40|01010101010101010101010|1GCr0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0|77e4","America/Cancun|CST CDT EST|60 50 50|01010102|1GQw0 1nX0 14p0 1lb0 14p0 1lb0 Dd0|63e4","America/Caracas|-0430 -04|4u 40|01|1QMT0|29e5","America/Chicago|CST CDT|60 50|01010101010101010101010|1GI80 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|92e5","America/Chihuahua|MST MDT|70 60|01010101010101010101010|1GQx0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0 11B0 1nX0 14p0 1lb0 14p0 1lb0 14p0 1nX0 11B0 1nX0|81e4","America/Phoenix|MST|70|0||42e5","America/Los_Angeles|PST PDT|80 70|01010101010101010101010|1GIa0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|15e6","America/New_York|EST EDT|50 40|01010101010101010101010|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|21e6","America/Rio_Branco|-04 -05|40 50|01|1KLE0|31e4","America/Fort_Nelson|PST PDT MST|80 70 70|01010102|1GIa0 1zb0 Op0 1zb0 Op0 1zb0 Op0|39e2","America/Halifax|AST ADT|40 30|01010101010101010101010|1GI60 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|39e4","America/Godthab|-03 -02|30 20|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|17e3","America/Grand_Turk|EST EDT AST|50 40 40|010101012|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0|37e2","America/Havana|CST CDT|50 40|01010101010101010101010|1GQt0 1qM0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Oo0 1zc0 Rc0 1zc0 Oo0 1zc0|21e5","America/Metlakatla|PST AKST AKDT|80 90 80|0121212121212121|1PAa0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|14e2","America/Miquelon|-03 -02|30 20|01010101010101010101010|1GI50 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|61e2","America/Montevideo|-02 -03|20 30|01010101|1GI40 1o10 11z0 1o10 11z0 1o10 11z0|17e5","America/Noronha|-02|20|0||30e2","America/Port-au-Prince|EST EDT|50 40|010101010101010101010|1GI70 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 3iN0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|23e5","Antarctica/Palmer|-03 -04|30 40|010101010|1H3D0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0|40","America/Santiago|-03 -04|30 40|010101010101010101010|1H3D0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Dd0 1Nb0 Ap0|62e5","America/Sao_Paulo|-02 -03|20 30|01010101010101010101010|1GCq0 1zd0 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0 On0 1zd0 On0 1C10 Lz0 1C10 Lz0 1C10 On0 1zd0 On0 1zd0|20e6","Atlantic/Azores|-01 +00|10 0|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|25e4","America/St_Johns|NST NDT|3u 2u|01010101010101010101010|1GI5u 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Op0 1zb0 Rd0 1zb0 Op0 1zb0|11e4","Antarctica/Casey|+11 +08|-b0 -80|010|1GAF0 blz0|10","Antarctica/Davis|+05 +07|-50 -70|01|1GAI0|70","Pacific/Port_Moresby|+10|-a0|0||25e4","Pacific/Guadalcanal|+11|-b0|0||11e4","Asia/Tashkent|+05|-50|0||23e5","Pacific/Auckland|NZDT NZST|-d0 -c0|01010101010101010101010|1GQe0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00|14e5","Asia/Baghdad|+03|-30|0||66e5","Antarctica/Troll|+00 +02|0 -20|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|40","Asia/Dhaka|+06|-60|0||16e6","Asia/Amman|EET EEST|-20 -30|010101010101010101010|1GPy0 4bX0 Dd0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 11A0 1o00|25e5","Asia/Kamchatka|+12|-c0|0||18e4","Asia/Baku|+04 +05|-40 -50|010101010|1GNA0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00|27e5","Asia/Bangkok|+07|-70|0||15e6","Asia/Barnaul|+07 +06|-70 -60|010|1N7v0 3rd0","Asia/Beirut|EET EEST|-20 -30|01010101010101010101010|1GNy0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0|22e5","Asia/Manila|+08|-80|0||24e6","Asia/Kolkata|IST|-5u|0||15e6","Asia/Chita|+10 +08 +09|-a0 -80 -90|012|1N7s0 3re0|33e4","Asia/Ulaanbaatar|+08 +09|-80 -90|01010|1O8G0 1cJ0 1cP0 1cJ0|12e5","Asia/Shanghai|CST|-80|0||23e6","Asia/Colombo|+0530|-5u|0||22e5","Asia/Damascus|EET EEST|-20 -30|01010101010101010101010|1GPy0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0|26e5","Asia/Dili|+09|-90|0||19e4","Asia/Dubai|+04|-40|0||39e5","Asia/Famagusta|EET EEST +03|-20 -30 -30|01010101012|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 15U0","Asia/Gaza|EET EEST|-20 -30|01010101010101010101010|1GPy0 1a00 1fA0 1cL0 1cN0 1nX0 1210 1nz0 1220 1qL0 WN0 1qL0 11B0 1nX0 11B0 1nX0 11B0 1qL0 WN0 1qL0 WN0 1qL0|18e5","Asia/Hong_Kong|HKT|-80|0||73e5","Asia/Hovd|+07 +08|-70 -80|01010|1O8H0 1cJ0 1cP0 1cJ0|81e3","Asia/Irkutsk|+09 +08|-90 -80|01|1N7t0|60e4","Europe/Istanbul|EET EEST +03|-20 -30 -30|01010101012|1GNB0 1qM0 11A0 1o00 1200 1nA0 11A0 1tA0 U00 15w0|13e6","Asia/Jakarta|WIB|-70|0||31e6","Asia/Jayapura|WIT|-90|0||26e4","Asia/Jerusalem|IST IDT|-20 -30|01010101010101010101010|1GPA0 1aL0 1eN0 1oL0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0 W10 1rz0 10N0 1oL0 10N0 1oL0 10N0 1rz0 W10 1rz0|81e4","Asia/Kabul|+0430|-4u|0||46e5","Asia/Karachi|PKT|-50|0||24e6","Asia/Kathmandu|+0545|-5J|0||12e5","Asia/Yakutsk|+10 +09|-a0 -90|01|1N7s0|28e4","Asia/Krasnoyarsk|+08 +07|-80 -70|01|1N7u0|10e5","Asia/Magadan|+12 +10 +11|-c0 -a0 -b0|012|1N7q0 3Cq0|95e3","Asia/Makassar|WITA|-80|0||15e5","Europe/Athens|EET EEST|-20 -30|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|35e5","Asia/Novosibirsk|+07 +06|-70 -60|010|1N7v0 4eN0|15e5","Asia/Omsk|+07 +06|-70 -60|01|1N7v0|12e5","Asia/Pyongyang|KST KST|-90 -8u|01|1P4D0|29e5","Asia/Rangoon|+0630|-6u|0||48e5","Asia/Sakhalin|+11 +10|-b0 -a0|010|1N7r0 3rd0|58e4","Asia/Seoul|KST|-90|0||23e6","Asia/Srednekolymsk|+12 +11|-c0 -b0|01|1N7q0|35e2","Asia/Tehran|+0330 +0430|-3u -4u|01010101010101010101010|1GLUu 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0 1cp0 1dz0 1cp0 1dz0 1cN0 1dz0 1cp0 1dz0|14e6","Asia/Tokyo|JST|-90|0||38e6","Asia/Tomsk|+07 +06|-70 -60|010|1N7v0 3Qp0|10e5","Asia/Vladivostok|+11 +10|-b0 -a0|01|1N7r0|60e4","Asia/Yekaterinburg|+06 +05|-60 -50|01|1N7w0|14e5","Europe/Lisbon|WET WEST|0 -10|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|27e5","Atlantic/Cape_Verde|-01|10|0||50e4","Australia/Sydney|AEDT AEST|-b0 -a0|01010101010101010101010|1GQg0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0|40e5","Australia/Adelaide|ACDT ACST|-au -9u|01010101010101010101010|1GQgu 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0|11e5","Australia/Brisbane|AEST|-a0|0||20e5","Australia/Darwin|ACST|-9u|0||12e4","Australia/Eucla|+0845|-8J|0||368","Australia/Lord_Howe|+11 +1030|-b0 -au|01010101010101010101010|1GQf0 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1fAu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu 1cLu 1cMu|347","Australia/Perth|AWST|-80|0||18e5","Pacific/Easter|-05 -06|50 60|010101010101010101010|1H3D0 Op0 1zb0 Rd0 1wn0 Rd0 46n0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Ap0 1Nb0 Dd0 1Nb0 Ap0|30e2","Europe/Dublin|GMT IST|0 -10|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|12e5","Pacific/Tahiti|-10|a0|0||18e4","Pacific/Niue|-11|b0|0||12e2","Etc/GMT+12|-12|c0|0|","Pacific/Galapagos|-06|60|0||25e3","Etc/GMT+7|-07|70|0|","Pacific/Pitcairn|-08|80|0||56","Pacific/Gambier|-09|90|0||125","Etc/GMT-1|+01|-10|0|","Pacific/Fakaofo|+13|-d0|0||483","Pacific/Kiritimati|+14|-e0|0||51e2","Etc/GMT-2|+02|-20|0|","Etc/UCT|UCT|0|0|","Etc/UTC|UTC|0|0|","Europe/Astrakhan|+04 +03|-40 -30|010|1N7y0 3rd0","Europe/London|GMT BST|0 -10|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|10e6","Europe/Chisinau|EET EEST|-20 -30|01010101010101010101010|1GNA0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0|67e4","Europe/Kaliningrad|+03 EET|-30 -20|01|1N7z0|44e4","Europe/Volgograd|+04 +03|-40 -30|01|1N7y0|10e5","Europe/Moscow|MSK MSK|-40 -30|01|1N7y0|16e6","Europe/Saratov|+04 +03|-40 -30|010|1N7y0 5810","Europe/Simferopol|EET EEST MSK MSK|-20 -30 -40 -30|0101023|1GNB0 1qM0 11A0 1o00 11z0 1nW0|33e4","Pacific/Honolulu|HST|a0|0||37e4","MET|MET MEST|-10 -20|01010101010101010101010|1GNB0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0","Pacific/Chatham|+1345 +1245|-dJ -cJ|01010101010101010101010|1GQe0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00|600","Pacific/Apia|+14 +13|-e0 -d0|01010101010101010101010|1GQe0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1cM0 1fA0 1a00 1fA0 1a00 1fA0 1a00 1fA0 1a00|37e3","Pacific/Bougainville|+10 +11|-a0 -b0|01|1NwE0|18e4","Pacific/Fiji|+13 +12|-d0 -c0|01010101010101010101010|1Goe0 1Nc0 Ao0 1Q00 xz0 1SN0 uM0 1SM0 uM0 1VA0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0 uM0 1VA0 s00 1VA0|88e4","Pacific/Guam|ChST|-a0|0||17e4","Pacific/Marquesas|-0930|9u|0||86e2","Pacific/Pago_Pago|SST|b0|0||37e2","Pacific/Norfolk|+1130 +11|-bu -b0|01|1PoCu|25e4","Pacific/Tongatapu|+13 +14|-d0 -e0|01010101010101|1S4d0 s00 1VA0 uM0 1SM0 uM0 1SM0 uM0 1SM0 uM0 1VA0 s00 1VA0|75e3"],links:["Africa/Abidjan|Africa/Accra","Africa/Abidjan|Africa/Bamako","Africa/Abidjan|Africa/Banjul","Africa/Abidjan|Africa/Bissau","Africa/Abidjan|Africa/Conakry","Africa/Abidjan|Africa/Dakar","Africa/Abidjan|Africa/Freetown","Africa/Abidjan|Africa/Lome","Africa/Abidjan|Africa/Monrovia","Africa/Abidjan|Africa/Nouakchott","Africa/Abidjan|Africa/Ouagadougou","Africa/Abidjan|Africa/Sao_Tome","Africa/Abidjan|Africa/Timbuktu","Africa/Abidjan|America/Danmarkshavn","Africa/Abidjan|Atlantic/Reykjavik","Africa/Abidjan|Atlantic/St_Helena","Africa/Abidjan|Etc/GMT","Africa/Abidjan|Etc/GMT+0","Africa/Abidjan|Etc/GMT-0","Africa/Abidjan|Etc/GMT0","Africa/Abidjan|Etc/Greenwich","Africa/Abidjan|GMT","Africa/Abidjan|GMT+0","Africa/Abidjan|GMT-0","Africa/Abidjan|GMT0","Africa/Abidjan|Greenwich","Africa/Abidjan|Iceland","Africa/Algiers|Africa/Tunis","Africa/Cairo|Egypt","Africa/Casablanca|Africa/El_Aaiun","Africa/Johannesburg|Africa/Maseru","Africa/Johannesburg|Africa/Mbabane","Africa/Khartoum|Africa/Addis_Ababa","Africa/Khartoum|Africa/Asmara","Africa/Khartoum|Africa/Asmera","Africa/Khartoum|Africa/Dar_es_Salaam","Africa/Khartoum|Africa/Djibouti","Africa/Khartoum|Africa/Juba","Africa/Khartoum|Africa/Kampala","Africa/Khartoum|Africa/Mogadishu","Africa/Khartoum|Africa/Nairobi","Africa/Khartoum|Indian/Antananarivo","Africa/Khartoum|Indian/Comoro","Africa/Khartoum|Indian/Mayotte","Africa/Lagos|Africa/Bangui","Africa/Lagos|Africa/Brazzaville","Africa/Lagos|Africa/Douala","Africa/Lagos|Africa/Kinshasa","Africa/Lagos|Africa/Libreville","Africa/Lagos|Africa/Luanda","Africa/Lagos|Africa/Malabo","Africa/Lagos|Africa/Ndjamena","Africa/Lagos|Africa/Niamey","Africa/Lagos|Africa/Porto-Novo","Africa/Maputo|Africa/Blantyre","Africa/Maputo|Africa/Bujumbura","Africa/Maputo|Africa/Gaborone","Africa/Maputo|Africa/Harare","Africa/Maputo|Africa/Kigali","Africa/Maputo|Africa/Lubumbashi","Africa/Maputo|Africa/Lusaka","Africa/Tripoli|Libya","America/Adak|America/Atka","America/Adak|US/Aleutian","America/Anchorage|America/Juneau","America/Anchorage|America/Nome","America/Anchorage|America/Sitka","America/Anchorage|America/Yakutat","America/Anchorage|US/Alaska","America/Campo_Grande|America/Cuiaba","America/Chicago|America/Indiana/Knox","America/Chicago|America/Indiana/Tell_City","America/Chicago|America/Knox_IN","America/Chicago|America/Matamoros","America/Chicago|America/Menominee","America/Chicago|America/North_Dakota/Beulah","America/Chicago|America/North_Dakota/Center","America/Chicago|America/North_Dakota/New_Salem","America/Chicago|America/Rainy_River","America/Chicago|America/Rankin_Inlet","America/Chicago|America/Resolute","America/Chicago|America/Winnipeg","America/Chicago|CST6CDT","America/Chicago|Canada/Central","America/Chicago|US/Central","America/Chicago|US/Indiana-Starke","America/Chihuahua|America/Mazatlan","America/Chihuahua|Mexico/BajaSur","America/Denver|America/Boise","America/Denver|America/Cambridge_Bay","America/Denver|America/Edmonton","America/Denver|America/Inuvik","America/Denver|America/Ojinaga","America/Denver|America/Shiprock","America/Denver|America/Yellowknife","America/Denver|Canada/Mountain","America/Denver|MST7MDT","America/Denver|Navajo","America/Denver|US/Mountain","America/Fortaleza|America/Argentina/Buenos_Aires","America/Fortaleza|America/Argentina/Catamarca","America/Fortaleza|America/Argentina/ComodRivadavia","America/Fortaleza|America/Argentina/Cordoba","America/Fortaleza|America/Argentina/Jujuy","America/Fortaleza|America/Argentina/La_Rioja","America/Fortaleza|America/Argentina/Mendoza","America/Fortaleza|America/Argentina/Rio_Gallegos","America/Fortaleza|America/Argentina/Salta","America/Fortaleza|America/Argentina/San_Juan","America/Fortaleza|America/Argentina/San_Luis","America/Fortaleza|America/Argentina/Tucuman","America/Fortaleza|America/Argentina/Ushuaia","America/Fortaleza|America/Belem","America/Fortaleza|America/Buenos_Aires","America/Fortaleza|America/Catamarca","America/Fortaleza|America/Cayenne","America/Fortaleza|America/Cordoba","America/Fortaleza|America/Jujuy","America/Fortaleza|America/Maceio","America/Fortaleza|America/Mendoza","America/Fortaleza|America/Paramaribo","America/Fortaleza|America/Recife","America/Fortaleza|America/Rosario","America/Fortaleza|America/Santarem","America/Fortaleza|Antarctica/Rothera","America/Fortaleza|Atlantic/Stanley","America/Fortaleza|Etc/GMT+3","America/Halifax|America/Glace_Bay","America/Halifax|America/Goose_Bay","America/Halifax|America/Moncton","America/Halifax|America/Thule","America/Halifax|Atlantic/Bermuda","America/Halifax|Canada/Atlantic","America/Havana|Cuba","America/La_Paz|America/Boa_Vista","America/La_Paz|America/Guyana","America/La_Paz|America/Manaus","America/La_Paz|America/Porto_Velho","America/La_Paz|Brazil/West","America/La_Paz|Etc/GMT+4","America/Lima|America/Bogota","America/Lima|America/Guayaquil","America/Lima|Etc/GMT+5","America/Los_Angeles|America/Dawson","America/Los_Angeles|America/Ensenada","America/Los_Angeles|America/Santa_Isabel","America/Los_Angeles|America/Tijuana","America/Los_Angeles|America/Vancouver","America/Los_Angeles|America/Whitehorse","America/Los_Angeles|Canada/Pacific","America/Los_Angeles|Canada/Yukon","America/Los_Angeles|Mexico/BajaNorte","America/Los_Angeles|PST8PDT","America/Los_Angeles|US/Pacific","America/Los_Angeles|US/Pacific-New","America/Managua|America/Belize","America/Managua|America/Costa_Rica","America/Managua|America/El_Salvador","America/Managua|America/Guatemala","America/Managua|America/Regina","America/Managua|America/Swift_Current","America/Managua|America/Tegucigalpa","America/Managua|Canada/East-Saskatchewan","America/Managua|Canada/Saskatchewan","America/Mexico_City|America/Bahia_Banderas","America/Mexico_City|America/Merida","America/Mexico_City|America/Monterrey","America/Mexico_City|Mexico/General","America/New_York|America/Detroit","America/New_York|America/Fort_Wayne","America/New_York|America/Indiana/Indianapolis","America/New_York|America/Indiana/Marengo","America/New_York|America/Indiana/Petersburg","America/New_York|America/Indiana/Vevay","America/New_York|America/Indiana/Vincennes","America/New_York|America/Indiana/Winamac","America/New_York|America/Indianapolis","America/New_York|America/Iqaluit","America/New_York|America/Kentucky/Louisville","America/New_York|America/Kentucky/Monticello","America/New_York|America/Louisville","America/New_York|America/Montreal","America/New_York|America/Nassau","America/New_York|America/Nipigon","America/New_York|America/Pangnirtung","America/New_York|America/Thunder_Bay","America/New_York|America/Toronto","America/New_York|Canada/Eastern","America/New_York|EST5EDT","America/New_York|US/East-Indiana","America/New_York|US/Eastern","America/New_York|US/Michigan","America/Noronha|Atlantic/South_Georgia","America/Noronha|Brazil/DeNoronha","America/Noronha|Etc/GMT+2","America/Panama|America/Atikokan","America/Panama|America/Cayman","America/Panama|America/Coral_Harbour","America/Panama|America/Jamaica","America/Panama|EST","America/Panama|Jamaica","America/Phoenix|America/Creston","America/Phoenix|America/Dawson_Creek","America/Phoenix|America/Hermosillo","America/Phoenix|MST","America/Phoenix|US/Arizona","America/Rio_Branco|America/Eirunepe","America/Rio_Branco|America/Porto_Acre","America/Rio_Branco|Brazil/Acre","America/Santiago|Chile/Continental","America/Santo_Domingo|America/Anguilla","America/Santo_Domingo|America/Antigua","America/Santo_Domingo|America/Aruba","America/Santo_Domingo|America/Barbados","America/Santo_Domingo|America/Blanc-Sablon","America/Santo_Domingo|America/Curacao","America/Santo_Domingo|America/Dominica","America/Santo_Domingo|America/Grenada","America/Santo_Domingo|America/Guadeloupe","America/Santo_Domingo|America/Kralendijk","America/Santo_Domingo|America/Lower_Princes","America/Santo_Domingo|America/Marigot","America/Santo_Domingo|America/Martinique","America/Santo_Domingo|America/Montserrat","America/Santo_Domingo|America/Port_of_Spain","America/Santo_Domingo|America/Puerto_Rico","America/Santo_Domingo|America/St_Barthelemy","America/Santo_Domingo|America/St_Kitts","America/Santo_Domingo|America/St_Lucia","America/Santo_Domingo|America/St_Thomas","America/Santo_Domingo|America/St_Vincent","America/Santo_Domingo|America/Tortola","America/Santo_Domingo|America/Virgin","America/Sao_Paulo|Brazil/East","America/St_Johns|Canada/Newfoundland","Antarctica/Palmer|America/Punta_Arenas","Asia/Baghdad|Antarctica/Syowa","Asia/Baghdad|Asia/Aden","Asia/Baghdad|Asia/Bahrain","Asia/Baghdad|Asia/Kuwait","Asia/Baghdad|Asia/Qatar","Asia/Baghdad|Asia/Riyadh","Asia/Baghdad|Etc/GMT-3","Asia/Baghdad|Europe/Minsk","Asia/Bangkok|Asia/Ho_Chi_Minh","Asia/Bangkok|Asia/Novokuznetsk","Asia/Bangkok|Asia/Phnom_Penh","Asia/Bangkok|Asia/Saigon","Asia/Bangkok|Asia/Vientiane","Asia/Bangkok|Etc/GMT-7","Asia/Bangkok|Indian/Christmas","Asia/Dhaka|Antarctica/Vostok","Asia/Dhaka|Asia/Almaty","Asia/Dhaka|Asia/Bishkek","Asia/Dhaka|Asia/Dacca","Asia/Dhaka|Asia/Kashgar","Asia/Dhaka|Asia/Qyzylorda","Asia/Dhaka|Asia/Thimbu","Asia/Dhaka|Asia/Thimphu","Asia/Dhaka|Asia/Urumqi","Asia/Dhaka|Etc/GMT-6","Asia/Dhaka|Indian/Chagos","Asia/Dili|Etc/GMT-9","Asia/Dili|Pacific/Palau","Asia/Dubai|Asia/Muscat","Asia/Dubai|Asia/Tbilisi","Asia/Dubai|Asia/Yerevan","Asia/Dubai|Etc/GMT-4","Asia/Dubai|Europe/Samara","Asia/Dubai|Indian/Mahe","Asia/Dubai|Indian/Mauritius","Asia/Dubai|Indian/Reunion","Asia/Gaza|Asia/Hebron","Asia/Hong_Kong|Hongkong","Asia/Jakarta|Asia/Pontianak","Asia/Jerusalem|Asia/Tel_Aviv","Asia/Jerusalem|Israel","Asia/Kamchatka|Asia/Anadyr","Asia/Kamchatka|Etc/GMT-12","Asia/Kamchatka|Kwajalein","Asia/Kamchatka|Pacific/Funafuti","Asia/Kamchatka|Pacific/Kwajalein","Asia/Kamchatka|Pacific/Majuro","Asia/Kamchatka|Pacific/Nauru","Asia/Kamchatka|Pacific/Tarawa","Asia/Kamchatka|Pacific/Wake","Asia/Kamchatka|Pacific/Wallis","Asia/Kathmandu|Asia/Katmandu","Asia/Kolkata|Asia/Calcutta","Asia/Makassar|Asia/Ujung_Pandang","Asia/Manila|Asia/Brunei","Asia/Manila|Asia/Kuala_Lumpur","Asia/Manila|Asia/Kuching","Asia/Manila|Asia/Singapore","Asia/Manila|Etc/GMT-8","Asia/Manila|Singapore","Asia/Rangoon|Asia/Yangon","Asia/Rangoon|Indian/Cocos","Asia/Seoul|ROK","Asia/Shanghai|Asia/Chongqing","Asia/Shanghai|Asia/Chungking","Asia/Shanghai|Asia/Harbin","Asia/Shanghai|Asia/Macao","Asia/Shanghai|Asia/Macau","Asia/Shanghai|Asia/Taipei","Asia/Shanghai|PRC","Asia/Shanghai|ROC","Asia/Tashkent|Antarctica/Mawson","Asia/Tashkent|Asia/Aqtau","Asia/Tashkent|Asia/Aqtobe","Asia/Tashkent|Asia/Ashgabat","Asia/Tashkent|Asia/Ashkhabad","Asia/Tashkent|Asia/Atyrau","Asia/Tashkent|Asia/Dushanbe","Asia/Tashkent|Asia/Oral","Asia/Tashkent|Asia/Samarkand","Asia/Tashkent|Etc/GMT-5","Asia/Tashkent|Indian/Kerguelen","Asia/Tashkent|Indian/Maldives","Asia/Tehran|Iran","Asia/Tokyo|Japan","Asia/Ulaanbaatar|Asia/Choibalsan","Asia/Ulaanbaatar|Asia/Ulan_Bator","Asia/Vladivostok|Asia/Ust-Nera","Asia/Yakutsk|Asia/Khandyga","Atlantic/Azores|America/Scoresbysund","Atlantic/Cape_Verde|Etc/GMT+1","Australia/Adelaide|Australia/Broken_Hill","Australia/Adelaide|Australia/South","Australia/Adelaide|Australia/Yancowinna","Australia/Brisbane|Australia/Lindeman","Australia/Brisbane|Australia/Queensland","Australia/Darwin|Australia/North","Australia/Lord_Howe|Australia/LHI","Australia/Perth|Australia/West","Australia/Sydney|Australia/ACT","Australia/Sydney|Australia/Canberra","Australia/Sydney|Australia/Currie","Australia/Sydney|Australia/Hobart","Australia/Sydney|Australia/Melbourne","Australia/Sydney|Australia/NSW","Australia/Sydney|Australia/Tasmania","Australia/Sydney|Australia/Victoria","Etc/UCT|UCT","Etc/UTC|Etc/Universal","Etc/UTC|Etc/Zulu","Etc/UTC|UTC","Etc/UTC|Universal","Etc/UTC|Zulu","Europe/Astrakhan|Europe/Ulyanovsk","Europe/Athens|Asia/Nicosia","Europe/Athens|EET","Europe/Athens|Europe/Bucharest","Europe/Athens|Europe/Helsinki","Europe/Athens|Europe/Kiev","Europe/Athens|Europe/Mariehamn","Europe/Athens|Europe/Nicosia","Europe/Athens|Europe/Riga","Europe/Athens|Europe/Sofia","Europe/Athens|Europe/Tallinn","Europe/Athens|Europe/Uzhgorod","Europe/Athens|Europe/Vilnius","Europe/Athens|Europe/Zaporozhye","Europe/Chisinau|Europe/Tiraspol","Europe/Dublin|Eire","Europe/Istanbul|Asia/Istanbul","Europe/Istanbul|Turkey","Europe/Lisbon|Atlantic/Canary","Europe/Lisbon|Atlantic/Faeroe","Europe/Lisbon|Atlantic/Faroe","Europe/Lisbon|Atlantic/Madeira","Europe/Lisbon|Portugal","Europe/Lisbon|WET","Europe/London|Europe/Belfast","Europe/London|Europe/Guernsey","Europe/London|Europe/Isle_of_Man","Europe/London|Europe/Jersey","Europe/London|GB","Europe/London|GB-Eire","Europe/Moscow|W-SU","Europe/Paris|Africa/Ceuta","Europe/Paris|Arctic/Longyearbyen","Europe/Paris|Atlantic/Jan_Mayen","Europe/Paris|CET","Europe/Paris|Europe/Amsterdam","Europe/Paris|Europe/Andorra","Europe/Paris|Europe/Belgrade","Europe/Paris|Europe/Berlin","Europe/Paris|Europe/Bratislava","Europe/Paris|Europe/Brussels","Europe/Paris|Europe/Budapest","Europe/Paris|Europe/Busingen","Europe/Paris|Europe/Copenhagen","Europe/Paris|Europe/Gibraltar","Europe/Paris|Europe/Ljubljana","Europe/Paris|Europe/Luxembourg","Europe/Paris|Europe/Madrid","Europe/Paris|Europe/Malta","Europe/Paris|Europe/Monaco","Europe/Paris|Europe/Oslo","Europe/Paris|Europe/Podgorica","Europe/Paris|Europe/Prague","Europe/Paris|Europe/Rome","Europe/Paris|Europe/San_Marino","Europe/Paris|Europe/Sarajevo","Europe/Paris|Europe/Skopje","Europe/Paris|Europe/Stockholm","Europe/Paris|Europe/Tirane","Europe/Paris|Europe/Vaduz","Europe/Paris|Europe/Vatican","Europe/Paris|Europe/Vienna","Europe/Paris|Europe/Warsaw","Europe/Paris|Europe/Zagreb","Europe/Paris|Europe/Zurich","Europe/Paris|Poland","Europe/Volgograd|Europe/Kirov","Pacific/Auckland|Antarctica/McMurdo","Pacific/Auckland|Antarctica/South_Pole","Pacific/Auckland|NZ","Pacific/Chatham|NZ-CHAT","Pacific/Easter|Chile/EasterIsland","Pacific/Fakaofo|Etc/GMT-13","Pacific/Fakaofo|Pacific/Enderbury","Pacific/Galapagos|Etc/GMT+6","Pacific/Gambier|Etc/GMT+9","Pacific/Guadalcanal|Antarctica/Macquarie","Pacific/Guadalcanal|Etc/GMT-11","Pacific/Guadalcanal|Pacific/Efate","Pacific/Guadalcanal|Pacific/Kosrae","Pacific/Guadalcanal|Pacific/Noumea","Pacific/Guadalcanal|Pacific/Pohnpei","Pacific/Guadalcanal|Pacific/Ponape","Pacific/Guam|Pacific/Saipan","Pacific/Honolulu|HST","Pacific/Honolulu|Pacific/Johnston","Pacific/Honolulu|US/Hawaii","Pacific/Kiritimati|Etc/GMT-14","Pacific/Niue|Etc/GMT+11","Pacific/Pago_Pago|Pacific/Midway","Pacific/Pago_Pago|Pacific/Samoa","Pacific/Pago_Pago|US/Samoa","Pacific/Pitcairn|Etc/GMT+8","Pacific/Port_Moresby|Antarctica/DumontDUrville","Pacific/Port_Moresby|Etc/GMT-10","Pacific/Port_Moresby|Pacific/Chuuk","Pacific/Port_Moresby|Pacific/Truk","Pacific/Port_Moresby|Pacific/Yap","Pacific/Tahiti|Etc/GMT+10","Pacific/Tahiti|Pacific/Rarotonga"]
}),a});
// Wrapper for VXGCloudPlayer & CloudSDK

window.CloudStreamerSDK = function(elid, o) {
	console.log(o);

    var self = this;
    self.options = o || {};
    self.conn = null;
    self.cm = null;
    self.mCameraID = null;
    self.camera = null;
    self.sharedKey = null;
    self.mAccessToken = null;
    self.streamer = document.getElementById(elid);
	self.m = {};
	self.conn = new CloudShareConnection(self.options);
	self.config = {};
	self.config.ws_port = 8888;
	self.config.wss_port = 8883;
	self.config.host = "cam.skyvr.videoexpertsgroup.com";
	self.api_host = self.options.cloud_domain ? self.options.cloud_domain : 'web.skyvr.videoexpertsgroup.com';
	self.api_port = null;
	self.api_security_port = null;
	var mWebRTC_Streamer = null;

	self.streamer.classList.add("cloudstreamer");
	self.streamer.classList.add("green");
	self.streamer.classList.add("black");
	
	self.streamer.innerHTML = ''
		+ '<div class="cloudstreamer-loader" style="display: none"></div>'
		+ '<div class="cloudstreamer-error" style="display: none">'
		+ '	<div class="cloudstreamer-error-text" style="display: none"></div>'
		+ '</div>'
		+ '<div class="cloudstreamer-watermark">'
		+ '</div>'
		+ '<div class="cloudstreamer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '<div class="cloudstreamer-black-screen" style="display: none">'
		+ '		<div class="cloudstreamer-watermark"></div>'
		+ '		<div class="cloudstreamer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '</div>'
		+ '<div class="cloudplayer-controls">'
		+ '	<div class="cloudplayer-stop" style="display: none"></div>'
		+ '	<div class="cloudplayer-play" style="display: none"></div>'
		+ '	<div class="cloudplayer-time"></div>'
		+ '	<div class="cloudplayer-fullscreen"></div>'
		+ '</div>'
		+ '<video class="cloudstreamer-webcam-video" autoplay="true">'
		+ '</video>'
	;
	var el_loader = self.streamer.getElementsByClassName('cloudstreamer-loader')[0];
	var el_error = self.streamer.getElementsByClassName('cloudstreamer-error')[0];
	var el_error_text = self.streamer.getElementsByClassName('cloudstreamer-error-text')[0];
	var mElVideo = self.streamer.getElementsByClassName('cloudstreamer-webcam-video')[0];
	var mElStop = self.streamer.getElementsByClassName('cloudplayer-stop')[0];
	var mElPlay = self.streamer.getElementsByClassName('cloudplayer-play')[0];
	
	var mShowedLoading = false;
	
	function _hideerror(){
		el_error.style.display = "none";
		el_error_text.style.display = "none";
	}

	function _showloading(){
		if(self.mShowedBigPlayButton == true){
			_hideloading();
		} else if(!mShowedLoading){
			el_loader.style.display = "inline-block";
			mShowedLoading = true;
		}
	}

	function _hideloading(){
		if(mShowedLoading){
			el_loader.style.display = "none";
			mShowedLoading = false;
		}
	}
	
	self._setError = function(error){
		setTimeout(self.stop,10);
		self.mLastError = error;
		if(self.mCallback_onError){
			self.mCallback_onError(self, error);
		}
	}
	
	function _showerror(err){
		console.error(err);
		self._setError(err);
		self.showErrorText(err.text);
		console.error(err.text);
	}
	
	/*
	 * Public functions
	 * */
	self.showErrorText = function(text){
		_hideloading();
		el_error.style.display = "inline-block";
		el_error_text.style.display = "inline-block";
		el_error_text.innerHTML = text;
		mElStop.style.display = 'none';
		mElPlay.style.display = 'none';
		mElVideo.srcObject = null;

		// _hideBlackScreen();
	}
	
    self.setSource = function (key) {
		_hideerror();
		mElPlay.style.display = 'none';

        if (!key || key === '') {
            var msg = 'Access token is required';
            console.error(msg);
            self.showErrorText(msg);
            return CloudReturnCode.ERROR_INVALID_SOURCE;
		}

		if (location.protocol != 'https:') {
			self.showErrorText("Streamer is only available with HTTPS connection");
			return;
		}

		var camid = 0;
        try {
            var obj = atob(key);
            obj = JSON.parse(obj);
            console.log(obj);
            if (obj.token && obj.camid && obj.access && obj.token !== '' && obj.camid !== '' && obj.access !== ''){
                self.sharedKey = obj.token;
                self.mCameraID = obj.camid;
			}

			if (obj.api) {
				self.api_host = obj.api;
				console.log('self.api_host: ', self.api_host);
			}

			if (obj.api_p) {
				self.api_port = obj.api_p;
				console.log('self.api_port: ', self.api_port);
			}

			if (obj.api_security_port) {
				self.api_security_port = obj.api_security_port;
				console.log('self.api_security_port: ', self.api_security_port);
			}

        } catch (err) {
            var msg = 'Invalid access token format';
            console.error(msg);
            return CloudReturnCode.ERROR_INVALID_SOURCE;
		}
		
		var base_url = self.api_host;

		if (self.api_host == (self.options.cloud_domain ? self.options.cloud_domain : 'web.skyvr.videoexpertsgroup.com')) {
			base_url = 'https://' + self.api_host;
		} else if (location.protocol === 'https:') {
			base_url = 'https://' + self.api_host;
			if (self.api_secutiry_port != null) {
				base_url += ':' + self.api_secutiry_port;
			}
		} else if (location.protocol === 'http:' || location.protocol === 'file:') {
			base_url = 'http://' + self.api_host;
			if (self.api_secutiry_port != null) {
				base_url += ':' + self.api_secutiry_port;
			}
		}

		self.conn.ServiceProviderUrl = base_url + '/';
		self.conn.open(self.sharedKey);
		self.mAccessToken = key;
		mElPlay.style.display = '';
		
		/*if(CloudHelpers.isMobile()){
			self.showErrorText("Mobile streamer is not available yet");
			return;
		}
		
		if(CloudHelpers.isChrome()){
			self.showErrorText("Streamer is not available yet for Chrome. But you can open this page in Edge or Firefox to start streaming from your web camera.");
			return;
		}
		
		if(!CloudHelpers.supportFlash() && CloudHelpers.isFireFox()){
			self.showErrorText("In Firefox Streamer available using by flash now.<br>"
				+ "Please install flash <a href='https://get.adobe.com/flashplayer' target='_blank'>https://get.adobe.com/flashplayer</a><br>"
				+ " or maybe enable Plugin 'Shockwave Flash' in your browser <a href='about:addons' target='_blank'>about:addons</a>.");
			return;
		}
		*/
    };

    self.getSource = function () {
        if (!self.mAccessToken)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.mAccessToken;
    };

	self.start = function(){
        if (!self.sharedKey){
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
		}
		console.warn("[CloudStreamerSDK] Start");

		self.stop("by_strm_sdk_1");
		if (navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
				mElVideo.srcObject = stream;

				if (self.conn) {
					// self.cm = new CloudCameraList(self.conn);
					self.conn._getAPI().cameraStreamUrls_webrtc(self.mCameraID).done(function (stream_urls) {
						console.log("stream_urls: ", stream_urls);
						if (!stream_urls.webrtc) {
							self.showErrorText("Channel does not support WebRTC streamer");
							return;
						}

						var p = CloudHelpers.promise();

						if (CloudHelpers.compareVersions(CloudPlayerWebRTC2.version, stream_urls.webrtc.version) > 0) {
							console.warn("Expected version webrtc.version (v" + stream_urls.webrtc.version + ") "
							+ " mismatch with included CloudPlayerWebRTC (v" + CloudPlayerWebRTC2.version + ")");
							p = CloudHelpers.requestJS(stream_urls.webrtc.scripts.player, function(r) { 
								r = r.replace("CloudPlayerWebRTC =", "CloudPlayerWebRTC2 =");
								while (r.indexOf("CloudPlayerWebRTC.") !== -1) {
									r = r.replace("CloudPlayerWebRTC.", "CloudPlayerWebRTC2.");
								}
								return r;
							});
						} else {
							p.resolve();
						}
						p.done(function(){
							// self.mCamera = ;
							mWebRTC_Streamer = new CloudPlayerWebRTC2(null,
								stream_urls.webrtc.connection_url, 
								stream_urls.webrtc.ice_servers, {
									send_video: true,
									send_audio: true,
								}
							);

							mWebRTC_Streamer.startWS();
							mElStop.style.display = '';
							mElPlay.style.display = 'none';
						}).fail(function(err){
							console.error("err: ", err);
							self.showErrorText("Problem with streaming protocol");
						})
						// self.start();
					}).fail(function (err) {
						console.error("err: ", err);
						self.showErrorText("Channel for streaming is not found");
						return;
					});
				}
			}).catch(function(err) {
				self.sharedKey = null;
				console.error(err);
				console.error("Something went wrong! ", err);
				if (("" + err).indexOf("Requested device is not found") != -1) {
					self.showErrorText("Camera is not found");
				}
			});
		}
        // self.player.play();
	};

	mElPlay.onclick = self.start;
	
	self.stop = function(){
		mElStop.style.display = 'none';
		mElPlay.style.display = self.mAccessToken ? '' : 'none';
		mElVideo.srcObject = null;

		if (!self.sharedKey)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;

		try{ if (mWebRTC_Streamer) { mWebRTC_Streamer.stopWS(); } }catch(err){console.error(err)};
	};

	mElStop.onclick = self.stop;

	self.initFullscreenControls = function(){
		var el_fullscreen = self.streamer.getElementsByClassName('cloudplayer-fullscreen')[0];
		var _prevHeight, _prevWidth;
		self.changedFullscreen = function(){
			console.log('changedFullscreen');
			if (document.webkitIsFullScreen){
				_prevHeight = self.player.style.height;
				_prevWidth = self.player.style.width;
				self.streamer.style.height = '100%';
				self.streamer.style.width = '100%';
				// self.size('100%', '100%');
				console.log('changedFullscreen -> fullscreen');
			}else{
				_prevHeight
				self.streamer.style.height = _prevHeight;
				self.streamer.style.width = _prevWidth;
				// self.size(self.playerWidth + 'px', self.playerHeight + 'px');
				console.log('changedFullscreen -> NOT fullscreen');
			}
		};

		if (document.addEventListener){
			document.addEventListener('webkitfullscreenchange', self.changedFullscreen, false);
			document.addEventListener('mozfullscreenchange', self.changedFullscreen, false);
			document.addEventListener('fullscreenchange', self.changedFullscreen, false);
			document.addEventListener('MSFullscreenChange', self.changedFullscreen, false);
		}

		self.fullscreen = function(){
			console.log("fullscreen: clicked");
			if(document.webkitIsFullScreen == true){
				document.webkitCancelFullScreen();
			} else if(document.mozFullScreen){
				document.mozCancelFullScreen();
			} else if(document.msFullscreenElement && document.msFullscreenElement != null){
				document.msExitFullscreen();
			}else{
				if(self.streamer.mozRequestFullScreen) {
					self.streamer.mozRequestFullScreen();
				} else if(self.streamer.requestFullscreen) {
					self.streamer.requestFullscreen();
				} else if(self.streamer.webkitRequestFullscreen) {
					self.streamer.webkitRequestFullscreen();
				} else if(self.streamer.msRequestFullscreen) {
					self.streamer.msRequestFullscreen();
				}
			}
		};
		
		el_fullscreen.onclick = self.fullscreen;
	}
	self.initFullscreenControls();
};

// Wrapper for VXGCloudPlayer & CloudSDK

window.CloudStreamerFlash = function(elid, o) {
	console.log(o);

    var self = this;
    self.options = o || {};
    self.conn = null;
    self.cm = null;
    self.mCameraID = null;
    self.camera = null;
    self.sharedKey = null;
    self.mAccessToken = "";
    self.streamer = document.getElementById(elid);
	self.m = {};
	self.conn = new CloudShareConnection(self.options);
	self.config = {};
	self.config.ws_port = 8888;
	self.config.wss_port = 8883;
	self.config.host = "cam.skyvr.videoexpertsgroup.com";

	self.streamer.classList.add("cloudstreamer");
	self.streamer.classList.add("green");
	self.streamer.classList.add("black");
	
	StreamerSWF.log = function(s){
		console.log("[CloudStreamerFlash]", s);
	}

	StreamerSWF.error = function(s){
		console.error("[CloudStreamerFlash]", s);
	}

	StreamerSWF.warn = function(s){
		console.warn("[CloudStreamerFlash]", s);
	}

	StreamerSWF.startedPublish = function(){
		console.log("[CloudStreamerFlash] publishing started");
	}

	StreamerSWF.stoppedPublish = function(){
		console.log("[CloudStreamerFlash] publishing stopped");
	}

	StreamerSWF.activityLevel = function(lvl){
		// sound
	}
	
	self.streamer.innerHTML = ''
		+ '<div class="cloudstreamer-loader" style="display: none"></div>'
		+ '<div class="cloudstreamer-error" style="display: none">'
		+ '	<div class="cloudstreamer-error-text" style="display: none"></div>'
		+ '</div>'
		+ '<div class="cloudstreamer-watermark">'
		+ '</div>'
		+ '<div class="cloudstreamer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '<div class="cloudstreamer-black-screen" style="display: none">'
		+ '		<div class="cloudstreamer-watermark"></div>'
		+ '		<div class="cloudstreamer-sdkversion">SDK ' + CloudSDK.version + '</div>'
		+ '</div>'
		+ '<object class="streamer-swf" id="streamer_swf" type="application/x-shockwave-flash" data="' + CloudSDK.streamer_swf + '" width="100%" height="100%" >'
		+ '<param name="movie" value="' + CloudSDK.streamer_swf + '" />'
		+ '<embed src="' + CloudSDK.streamer_swf + '">'
		+ '<param name="allowScriptAccess" value="always"/>'
		+ '<param value="allowNetworking" value="all"/>'
		+ '<param name="wmode" value="transparent"/>'
		+ '<param name="menu" value="false" />'
		+ '</object>'
	;
	var el_loader = self.streamer.getElementsByClassName('cloudstreamer-loader')[0];
	var el_error = self.streamer.getElementsByClassName('cloudstreamer-error')[0];
	var el_error_text = self.streamer.getElementsByClassName('cloudstreamer-error-text')[0];
	var el_streamer_swf = self.streamer.getElementsByClassName('streamer-swf')[0];
	console.log(StreamerSWF.flash());

	self.onStarted = function(rtmp_url){
		console.log("[CloudStreamerFlash] activate streaming to rtmp_url: ", rtmp_url);
		StreamerSWF.activate(rtmp_url, "PCMU");
		
		/*var strm = rtmp_url.split("/").slice(4).join("/");
		var srv = rtmp_url.split("/").slice(0,4).join("/");
		if(!el_streamer_swf){
			self.streamer.innerHTML += '<embed src="' + CloudSDK.webcamswf + '"'
					+ ' flashvars="server=' + encodeURIComponent(srv) + '&stream=' + encodeURIComponent(strm) + '" '
					+ ' bgcolor="#000000" '
					+ ' width="100%" '
					+ ' height="100%" '
					+ ' name="haxe" '
					+ ' quality="high" '
					+ ' align="center" '
					+ ' allowScriptAccess="always" '
					+ ' type="application/x-shockwave-flash" '
					+ ' pluginspage="http://www.macromedia.com/go/getflashplayer" />';
		}else{
			console.warn("TODO already defined streamer_swf element");
		}*/
	}
	
	self.onStopped = function(){
		console.log("[CloudStreamerFlash] deactivate");
		StreamerSWF.deactivate();
	}
	var mShowedLoading = false;
	
	function _hideerror(){
		el_error.style.display = "none";
		el_error_text.style.display = "none";
	}

	function _showloading(){
		if(self.mShowedBigPlayButton == true){
			_hideloading();
		} else if(!mShowedLoading){
			el_loader.style.display = "inline-block";
			mShowedLoading = true;
		}
	}

	function _hideloading(){
		if(mShowedLoading){
			el_loader.style.display = "none";
			mShowedLoading = false;
		}
	}
	
	self._setError = function(error){
		setTimeout(self.stop,10);
		self.mLastError = error;
		if(self.mCallback_onError){
			self.mCallback_onError(self, error);
		}
	}
	
	function _showerror(err){
		console.error(err);
		self._setError(err);
		self.showErrorText(err.text);
		console.error(err.text);
	}

	/*
	 * Public functions
	 * */
	self.showErrorText = function(text){
		_hideloading();
		el_error.style.display = "inline-block";
		el_error_text.style.display = "inline-block";
		el_error_text.innerHTML = text;
		// _hideBlackScreen();
	}
	
    self.setSource = function (key) {
		_hideerror();

        if (!key || key === '') {
            var msg = 'Access token required';
            console.error(msg);
            self.showErrorText(msg);
            return CloudReturnCode.ERROR_INVALID_SOURCE;
		}

		if(CloudHelpers.isMobile()){
			self.showErrorText("Mobile streamer is not available yet");
			return;
		}
		
		if(CloudHelpers.isChrome()){
			self.showErrorText("Streamer is not available yet for Chrome. But you can open this page in Edge or Firefox to start streaming from your web camera.");
			return;
		}
		
		if(!CloudHelpers.supportFlash() && CloudHelpers.isFireFox()){
			self.showErrorText("In Firefox Streamer available using by flash now.<br>"
				+ "Please install flash <a href='https://get.adobe.com/flashplayer' target='_blank'>https://get.adobe.com/flashplayer</a><br>"
				+ " or maybe enable Plugin 'Shockwave Flash' in your browser <a href='about:addons' target='_blank'>about:addons</a>.");
			return;
		}

		if(window.location.protocol == "https:"){
			self.showErrorText("Streamer are not available yet with https");
			return;
		}
        
        var camid = 0;
        try {
            var obj = atob(key);
            obj = JSON.parse(obj);
            console.log(obj);
            if (obj.token && obj.camid && obj.access && obj.token !== '' && obj.camid !== '' && obj.access !== ''){
                self.sharedKey = obj.token;
                self.mCameraID = obj.camid;
			}

			if(obj.svcp && obj.svcp != ''){
				self.svcp_url = obj.svcp;
				console.log('self.svcp_url: ', self.svcp_url);
			}
        } catch (err) {
            var msg = 'Invalid access token format';
            console.error(msg);
            return CloudReturnCode.ERROR_INVALID_SOURCE;
        }
		
		self.mAccessToken = key;
		
		if(self.svcp_url != null){ // if server is custom
			self.conn.ServiceProviderUrl = self.svcp_url;
			var uri = CloudHelpers.parseUri(self.svcp_url);
			self.config.host = uri.host;
		}
        self.conn.open(self.sharedKey);
        if (self.conn) {
            self.cm = new CloudCameraList(self.conn);
            self.cm.getCamera(self.mCameraID).done(function (cam) {
				self.mCamera = cam;
				console.log("camera: ", self.mCamera._origJson());
				/*if(self.mCamera._origJson().rec_mode != 'on'){
					console.error("Please enable channel recording");
					self.showErrorText("Please enable channel recording");
				}*/
				self.start();
            }).fail(function (err) {
                self.showErrorText("Channel for streaming not found");
				return;
            });
            return CloudReturnCode.OK;
        }
        return CloudReturnCode.ERROR_NO_CLOUD_CONNECTION;
    };

    self.getSource = function () {
        if (!self.sharedKey)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        return self.mAccessToken;
    };
	var mPolingPreStartFlash = null;

	function _stopPolingPREStart(){
		clearInterval(mPolingPreStartFlash);
	}

	function _startPolingPREStart(){
		_stopPolingPREStart();
		mPolingPreStartFlash = setInterval(function(){
			if(StreamerSWF.flash().vjs_activate){
				self.start();
				_stopPolingPREStart();
			}
		},1000);
	}

	self.start = function(){
        if (!self.mCamera){
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
		}
		
		if(!StreamerSWF.flash().vjs_activate){
			_startPolingPREStart();
			return;
		}
		
        console.warn("[CloudStreamerFlash] Start");	
        self.stop("by_strm_sdk_1");
		var cmngrid = self.mCamera.getCameraManagerID();
		self.mCamera._getConn()._getAPI().resetCameraManager(cmngrid, {}).done(function(r){
			console.log(r);
			self.config.token = r.token;
			self.config.camid = self.mCamera.getID();
			self.initWebSocket();
		}).fail(function(err){
			console.error(err);
		})
        // self.player.play();
	};
	
	self.stop = function(){
		_stopPolingPREStart();
		
        if (!self.camera)
            return CloudReturnCode.ERROR_SOURCE_NOT_CONFIGURED;
        console.warn("Stop");
        if(self.ws && self.ws.socket){
			try{self.ws.socket.close();}catch(err){console.error(err)};
		}
		
		
		// TODO if started
		try{StreamerSWF.deactivate();}catch(err){console.error(err)};
		
	};

	/* *************************************
	**** Camera Manager Protocol
	* ************************************ */

	self.initWebSocket = function(){

		var connection_url = self.config.srv || self.config.host;
		self.ws = {};

		console.log("self.config.host: " + self.config.host);
		console.log("self.config.srv: " + self.config.srv);

		
		// dirty hack begin
		/*var bBaseURL = false;
		if(connection_url == self.config.host){
			connection_url = window.location.hostname;
			bBaseURL = true;
		}else{
			connection_url = window.location.hostname;
		}*/
		// dirty hack end
		
		// protocol
		if(window.location.protocol == "http:" || window.location.protocol == "file:"){
			connection_url = "ws://" + connection_url + ":" + self.config.ws_port;
		}else if(window.location.protocol == "https:"){
			// connection_url = "wss://" + connection_url + ":" + self.config.wss_port;
			console.error("Not supported https yet");
			return;
		}else{
			console.error("Expected protocol http or https");
			return;
		}
		
		// dirty hack begin
		/*if(!bBaseURL){
			connection_url += '/' + self.config.srv;
		}*/
		// dirty hack end

		// append regtoken
		connection_url +=  "/ctl/NEW/" + self.config.token + "/";

		self.ws.socket = new WebSocket(connection_url);
		self.ws.socket.onopen = function() {
			console.log('WS Opened');
			self._register();
		};
		self.ws.socket.onclose = function(event) {
			console.log('Closed');
		};
		self.ws.socket.onmessage = function(event) {
			console.log('Received: ' + event.data);
			try{
				var response = JSON.parse(event.data);
				var cmd = response['cmd'];
				if(self.handlers[cmd]){
					self.handlers[cmd](response);
				}else{
					console.warn("Not found handler " + cmd);
				}
			}catch(e){
				console.error(e);
			}
		};
		self.ws.socket.onerror = function(error) {
			console.error('Error: ' + error.message);
		};
	}

	self.m_nMessageID = 0;

	self.makeCommand = function(cmd){
		self.m_nMessageID++;
		return {
			cmd: cmd,
			msgid: self.m_nMessageID
		};
	}
	
	self.makeCommandDone = function(orig_cmd, refid, status){
		var response = self.makeCommand("done");
		response["orig_cmd"] = orig_cmd;
		response["refid"] = refid;
		response["status"] = status;
		return response;
	}

	self._register = function(){
		var request = self.makeCommand("register");
		request['pwd'] = '';
		request['reg_token'] = self.config.token;
		request["ver"] = '0.1';
		request["tz"] = 'UTC';
		request["vendor"] = 'web';
		self.sendMessage(request);
	}

	self.sendMessage = function(r){
		self.ws.socket.send(JSON.stringify(r));
	}

	self.handlers = {};
	self.handlers['configure'] = function(response){
		if(response["server"]){
			self.config.srv = response["server"];
		}
		if(response["uuid"]){
			self.config.uuid = response["uuid"];
		}
	}

	self.handlers['bye'] = function(response){
		if(response["reason"] && response["reason"] == "RECONNECT"){
			setTimeout(function(){
				self.initWebSocket();
			},1200);
		}
	}
	
	self.handlers['hello'] = function(response){
		if(response['media_server']){  // deprecated
			self.config.media_server = response['media_server'];
		}
		if(response['sid']){
			self.config.sid = response['sid'];
		}
		if(response['upload_url']){ 
			self.config.upload_url = response['upload_url'];
		}
		
		self.sendMessage(self.makeCommandDone('hello', response["msgid"], "OK"));
		
		var data = self.makeCommand("cam_register");
		data["ip"] = '127.0.0.1';
		data["uuid"] = self.config.uuid;
		data["brand"] = 'None';
		data["model"] = 'Unknown';
		data["sn"] = 'nope';
		data["type"] = "cm";
		data["version"] = '0';
		data["initial_mode"] = 'cloud';
	
		self.sendMessage(data);
	}
	
	self.handlers['cam_hello'] = function(response){
		self.sendMessage(self.makeCommandDone('cam_hello', response["msgid"], "OK"));
		self.config.camid = response["cam_id"];
		if(response["media_url"]){ // deprecated
			self.config.media_url = response["media_url"];
		}
		if(response["media_uri"]){ // new
			self.config.media_server = response["media_uri"];
		}
		if(response["path"]){ // new
			self.config.media_url = response["path"];
		}
	}
	
	self.handlers['get_cam_status'] = function(response){
		var data = self.makeCommand('cam_status');
		data['cam_id'] = self.config.camid;
		data["ip"] = '127.0.0.1';
		data["activity"] = true;
		data["streaming"] = true;
		data["status_led"] = false;
		self.sendMessage(data);
	}
	
	
	self.handlers['get_supported_streams'] = function(response){
		var data = self.makeCommand('supported_streams');
		data['cam_id'] = self.config.camid;
		data["audio_es"] = ['Aud'];
		data["video_es"] = ['Vid'];
		data["streams"] = [{
			id: "Main",
			"video": "Vid",
			"audio": "Aud"
		}]
		self.sendMessage(data);
	}

	self.stream_start_counter = 0;
	self.handlers['stream_start'] = function(response){
		var stream_url = "rtmp://" + self.config.media_server + "/" + self.config.media_url + "Main";
		stream_url += "?sid=" + self.config.sid;
		console.log(stream_url);
		if(self.stream_start_counter == 0){
			self.stream_start_counter++;
			if(self.options.onStarted){
				self.options.onStarted(stream_url);
			}else if(!self.options.onStarted){
				self.onStarted(stream_url);
			}	
		}
		self.sendMessage(self.makeCommandDone('stream_start', response["msgid"], "OK"));
	}
	self.handlers['stream_stop'] = function(response){
		self.stream_start_counter--;
		self.sendMessage(self.makeCommandDone('stream_start', response["msgid"], "OK"));
		if(self.stream_start_counter == 0){
			if(self.options.onStopped){
				self.options.onStarted(stream_url);
			}else if(!self.options.onStarted){
				self.onStopped();
			}	
		}
	}
	
};
