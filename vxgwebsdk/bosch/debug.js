if(typeof(jQuery)=="undefined") {
    jQuery = {};
    $ = {};
}

var Dbg = (function(Dbg, $) {

	//log levels
	Dbg.DEBUG = 1;
	Dbg.INFO = 3;
	Dbg.WARN = 5;
	Dbg.ERROR = 10;
	Dbg.ALWAYS = 99;

	//private stuff
	var dbgLvl = 0;
	var allowConsole = true;

	var xml2html = function(s) {
		s += "";
		s = s.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;");
		return s;
	};

	var toSingleLine = function(s) {
		s += "";
		s = s.replace(/\r/g, "").replace(/\n/g, "");
		s = s.replace(/\>\s+\</g, "><");
		return s;
	};

	var appendDiv = function(txt) {
		txt = xml2html(txt);
		var e = $("<div class='notrans'><code style='white-space: nowrap'>"+txt+"</code></div>");
		$("body").append(e);
	};

	var getLevelAsString = function(lvl) {
		if(lvl==$.dbg.DEBUG) return "DEBUG";
		else if(lvl==$.dbg.INFO) return "INFO";
		else if(lvl==$.dbg.WARN) return "WARN";
		else if(lvl==$.dbg.ERROR) return "ERROR";
		else if(lvl==$.dbg.ALWAYS) return "ALWAYS";
		else return ""+lvl;
	};

	var setLevel = function(lvl) {
		dbgLvl = lvl;
	};

	var out = function(s, lvl) {
		s = createString(s);
		s = toSingleLine(s);
		if(!lvl) lvl = $.dbg.ALWAYS;
		if(lvl>=dbgLvl) {
			var date = new Date();
			var txtLvl = getLevelAsString(lvl);
			var txt = "["+txtLvl+"] "+date.toLocaleString()+":"+date.getMilliseconds()+" - "+s;
			if(typeof(console)!="undefined" && allowConsole) {
				if(console[txtLvl.toLowerCase()]) {
					console[txtLvl.toLowerCase()](txt);
				} else {
					console.log(txt);
				}
			} else {
				//appendDiv(txt);
			}
		}
	};

	var debug = function(s) {
		out(s, Dbg.DEBUG);
	};

	var info = function(s) {
		out(s, Dbg.INFO);
	};

	var warn = function(s) {
		out(s, Dbg.WARN);
	};

	var error = function(s, ex) {
		if(!s) s = "";
		if(ex) s += " ("+createObjString(ex)+")";
		out(s, Dbg.ERROR);
	};

	var createString = function(val) {
		var s = "";
		if(val===null) {
			s = "null";
		} else if ($.isArray(val)) {
			s = "[" + val + "]";
			if(val.length>0 && typeof(val[0])=="number") {
				s += " (bytes: " + createByteString(val) + ")";
			}
		} else if(typeof(val)=="object") {
			s = "{" + createObjString(val) + "}";
		} else {
			s = val;
		}
		return s;
	};

	var createByteString = function(a) {
		var s = "";
		if(!a) {
			s = "null";
		} else {
			for(var i=0; i<a.length; i++) {
				var tmp = a[i].toString(16);
				if(tmp.length==1) tmp = "0"+tmp;
				s += tmp;
				if(i<a.length-1) s += " ";
			}
		}
		return s;
	};

	var createObjString = function(obj) {
		var s = "";
		if(obj==null) {
			s = "null";
		} else {
			for (var e in obj) {
				var tmpStr = createString(obj[e]);
				if(getType(obj[e])=="string") tmpStr = "'"+tmpStr+"'";
				s += e+": "+tmpStr;
				//s += " ("+getType(obj[e])+")";
				s += "\n; "
			}
		}
		return s;
	};

	var getType = function(val) {
		var back = typeof(val);
		if(typeof(val)=='object' && $.isArray(val)) back = "array";
		return back;
	};

	var enableConsole = function(b) {
		allowConsole = b;
	};

	var showCommands = function() {
		$("*[rcp]:visible, *[bicom]:visible").each( function(i) {
			var conf = $(this).getConfig();
			var txt = "";
			if(conf.rcpcmd) {
				txt = "rcpcmd: "+conf.rcpcmd+", num: "+conf.rcpnum+", type: "+conf.rcptype;
			} if(conf.bicomserver) {
				txt = "srv: " + conf.bicomserver + ", obj: " + conf.bicomobjid
			}
			var x = +$(this).offset().left + $(this).width();
			var y = +$(this).offset().top;
			$("<div class='cmdhint' style='top:"+y+"px; left:"+x+"px;'>"+txt+"</div>").appendTo("body");
		});
	};

	var test = function() {
		$.dbg.debug("DebugText");
		$.dbg.info("InfoText");
		$.dbg.warn("WarnText");
		$.dbg.error("ErrorText");
		$.dbg.info({
			value1: 1,
			value2: "test"
		});
	};

	//init debug level
	var tls = null;
	try {
		tls = top.location.search.toLowerCase();
	} catch (e) {
		tls = "";
	}
	var res = /debug=(\d+)/.exec(tls);
	if(res && res.length>1) setLevel(parseInt(res[1], 10));
	else if(tls.indexOf("debug=true")>0) setLevel(Dbg.DEBUG);
	else if(tls.indexOf("log=debug")>0) setLevel(Dbg.DEBUG);
	else if(tls.indexOf("log=info")>0) setLevel(Dbg.INFO);
	else if(tls.indexOf("log=warn")>0)  setLevel(Dbg.WARN);
	else if(tls.indexOf("log=error")>0)  setLevel(Dbg.ERROR);
	else  setLevel(Dbg.WARN);

	//disable console logging on ipad
	if(tls.indexOf("console=false")>0) {
		enableConsole(false);
	} else if(navigator.userAgent.match(/android|ipad|ipod|iphone/i)) {
		enableConsole(false);
	}

	//public methods
	Dbg.setLevel = setLevel;
	Dbg.out = out;
	Dbg.debug = debug;
	Dbg.d = debug;
	Dbg.info = info;
	Dbg.i = info;
	Dbg.warn = warn;
	Dbg.w = warn;
	Dbg.error = error;
	Dbg.e = error;
	Dbg.createByteString = createByteString;
	Dbg.createObjString = createObjString;
	Dbg.enableConsole = enableConsole;
	Dbg.showCommands = showCommands;
	Dbg.test = test;

	return Dbg;
})(Dbg || {}, jQuery);

$.dbg = Dbg; //for backward compatibility


//improved Logger with topics and multiple parameters
var Logger = (function(Logger, $, undefined) {

	//log levels
	Logger.DEBUG = 1;
	Logger.INFO = 3;
	Logger.WARN = 5;
	Logger.ERROR = 10;
	Logger.ALWAYS = 99;

	//private stuff
	var levels = {
		'default': Logger.WARN
	};
	var allowConsole = true;

	var xml2html = function(s) {
		s += "";
		s = s.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;");
		return s;
	};

	var toSingleLine = function(s) {
		s += "";
		s = s.replace(/\r/g, "").replace(/\n/g, "");
		s = s.replace(/\>\s+\</g, "><");
		return s;
	};

	var appendDiv = function(txt) {
		txt = toSingleLine(txt);
		txt = xml2html(txt);
		var e = $("<div class='notrans'><code style='white-space: nowrap'>"+txt+"</code></div>");
		$("body").append(e);
	};

	var getLevelAsString = function(lvl) {
		if(lvl==Logger.DEBUG) return "DEBUG";
		else if(lvl==Logger.INFO) return "INFO";
		else if(lvl==Logger.WARN) return "WARN";
		else if(lvl==Logger.ERROR) return "ERROR";
		else if(lvl==Logger.ALWAYS) return "ALWAYS";
		else return ""+lvl;
	};

	var setLevel = function(lvl, topic) {
		if(!topic) topic = "default";
		levels[topic] = lvl;
	};

	var enableConsole = function(b) {
		allowConsole = b;
	};

	var getLevelForTopic = function(topic) {
		if(levels[topic]===undefined) return levels["default"];
		else return levels[topic];
	};

	var createDescString = function(nbrLvl, strTopic) {
		var strLvl = getLevelAsString(nbrLvl);
		var date = new Date();
		//return "["+strLvl+"] ["+strTopic+"] "+date.toLocaleString()+":"+date.getMilliseconds()+" - ";
        return "["+strLvl+"] ["+strTopic+"] - ";
	};

	var checkAndPrint = function(nbrLvl, strTopic, msgs) {
		var curLvl = getLevelForTopic(strTopic);
		if(curLvl>nbrLvl) return;
		var txtLvl = getLevelAsString(nbrLvl);
		var pre = createDescString(nbrLvl, strTopic);
		var data = Array.prototype.slice.call(arguments, 2);
		Array.prototype.unshift.call(data, pre);
		if(console!==undefined && allowConsole) {
			if(console[txtLvl.toLowerCase()]) {
				console[txtLvl.toLowerCase()].apply(console, data);
			} else {
				console.log.apply(console, data);
			}
		} else {
			appendDiv(data.join(" "));
		}
	};

	var debug = function(s) {
		Array.prototype.unshift.call(arguments, Logger.DEBUG);
		checkAndPrint.apply(this, arguments);
	};

	var info = function(s) {
		Array.prototype.unshift.call(arguments, Logger.INFO);
		checkAndPrint.apply(this, arguments);
	};

	var warn = function(s) {
		Array.prototype.unshift.call(arguments, Logger.WARN);
		checkAndPrint.apply(this, arguments);
	};

	var error = function(s) {
		Array.prototype.unshift.call(arguments, Logger.ERROR);
		checkAndPrint.apply(this, arguments);
	};

	var createByteString = function(a) {
		var s = "";
		if(!a) {
			s = "null";
		} else {
			for(var i=0; i<a.length; i++) {
				var tmp = a[i].toString(16);
				if(tmp.length==1) tmp = "0"+tmp;
				s += tmp;
				if(i<a.length-1) s += " ";
			}
		}
		return s;
	};

	//init debug level
	var tls = "";
    try {
        tls = top.location.search.toLowerCase();
    } catch (e) {
        tls = "";
    }

	if(tls.indexOf("debug=true")>0) setLevel(Logger.DEBUG);
	else if(tls.indexOf("log=debug")>0) setLevel(Logger.DEBUG);
	else if(tls.indexOf("log=info")>0) setLevel(Logger.INFO);
	else if(tls.indexOf("log=warn")>0)  setLevel(Logger.WARN);
	else if(tls.indexOf("log=error")>0)  setLevel(Logger.ERROR);
	else  setLevel(Logger.WARN);

	//disable console logging on ipad
	if(tls.indexOf("console=false")>0) {
		enableConsole(false);
	} else if(navigator.userAgent.match(/android|ipad|ipod|iphone/i)) {
		enableConsole(false);
	}

	//public methods
	Logger.setLevel = setLevel;
	Logger.debug = debug;
	Logger.d = debug;
	Logger.info = info;
	Logger.i = info;
	Logger.warn = warn;
	Logger.w = warn;
	Logger.error = error;
	Logger.e = error;
	Logger.createByteString = createByteString;
	Logger.enableConsole = enableConsole;

	return Logger;

})(Logger || {}, jQuery);
