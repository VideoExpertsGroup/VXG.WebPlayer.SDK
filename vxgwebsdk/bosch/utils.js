var bosch_backaud_camera_ip = 'vxg.ddns.net'; //"0.0.0.0";
var bosch_backaud_camera_port = 5443;
var bosch_backaud_camera_path = '';
var bosch_backaud_camera_protocol = 'https:';

var rcp_url = "rcp.xml";
var utils_rfHandle;
var utils_readCount=0;
var utils_sfHandle;
var utils_saveCount=0;
var utils_debuglevel=0; //0=off, 1=all, ...
var utils_resolvedIP = null; // will be set by an applet which executes a dns query
var utils_msgdomainId = null;
var utils_guiversion = 1;
var utils_eventhandlermap = {};

if(typeof(VideoIn)=="undefined") VideoIn=1;
if(VideoIn>4) {
	utils_guiversion = 2;
}

// create console if not available
if(!window.console) window.console = {};
if(!window.console.log) window.console.log = function(msg) {};
if(!window.console.warn) window.console.warn = function(msg) {};
if(!window.console.error) window.console.error = function(msg) {};

$("html").addClass('protocol_' + document.location.protocol.replace(/\W/g, ""));
if ((window.navigator.userAgent || "").indexOf('Edge/') > 0) $("html").addClass('edge');
if ((window.navigator.userAgent || "").indexOf('Trident/') > 0) $("html").addClass('ie');

/* remove() polyfill */
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

function jQueryAvail() {
    return typeof(jQuery)=="function";
}

function jQueryUIAvail() {
    return (jQueryAvail() && typeof($.widget)!="undefined");
}

if(jQueryAvail()) {
    $.fn.extend({
        valSBIT: function (v) {
            var back = null;
            if (typeof v == 'undefined') {
                back = this.val();
            } else {
                back = this.val(v);
                var sbit = $(this).data("selectBox-selectBoxIt");
                if (sbit) {
                    try {
                        sbit.refresh();
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    console.log("no sbit (" + $(this).attr("id") + ") ...", this);
                }
            }
            return back;
        },
        valChange: function (v) {
            var back = null;
            if (typeof v == 'undefined') {
                back = this.val();
            } else {
                back = this.val(v);
                this.change();
            }
            return back;
        },
        valChosen: function (v) {
            var back = null;
            if (typeof v == 'undefined') {
                back = this.val();
            } else {
                back = this.val(v);
                $(this).trigger("chosen:updated");
            }
            return back;
        }
    });
} else {
    console.log("jquery not available, no sbit extentions created...")
}

//extend string with trim
if(typeof("".trim)=="undefined") {
	String.prototype.trim = function() {
		return this.replace(/^\s+/, "").replace(/\s+$/, "");
	};
}
if(typeof("".repeat)=="undefined") {
	String.prototype.repeat = function(num) {
        return new Array( num + 1 ).join( this );
    };
}
if(typeof("".replaceHTML)=="undefined") {
    String.prototype.replaceHTML = function(pattern, string) {
        return this.replace(pattern, escapeHTML(string));
    };
}
if(typeof(Date.now)=="undefined") {
	Date.now = function() {
		return new Date().getTime();
	};
}
jQuery.fn.reverse = [].reverse;

// shim layer with setTimeout fallback

if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return 	window.webkitRequestAnimationFrame ||
            	window.mozRequestAnimationFrame ||
            	function (callback) {
                	window.setTimeout(callback, 1000 / 60);
            	};
    })();
}

window.requestAnimFrame = window.requestAnimationFrame; //for compatibility

//jquery ui fix for user:pass@url urls which are used by CfgMgr (see http://bugs.jqueryui.com/ticket/11223)
if(jQueryUIAvail() && navigator.userAgent.indexOf("Firefox")>0) {
    $.widget("ui.tabs", $.ui.tabs, {
        _isLocal: function (anchor) {

            // If there's no hash, it can't be local
            if (!anchor.hash.length) {
                return false;
            }

            // http://bugs.jqueryui.com/ticket/11223
            // Intentionally skip hash, username, password
            // href may contain username and password, so we can't use that
            // host, hostname, port, and protocol are all included in origin
            var urlParts = ["origin", "pathname", "search"];
            var isLocal = true;

            $.each(urlParts, function (urlPart) {
                var anchorValue = anchor[urlPart];
                var locationValue = location[urlPart];

                // Decoding may throw an error if the URL isn't UTF-8 (#9518)
                try {
                    anchorValue = decodeURIComponent(anchorValue);
                } catch (error) {}
                try {
                    locationValue = decodeURIComponent(locationValue);
                } catch (error) {}

                if (anchorValue !== locationValue) {
                    isLocal = false;
                    return false;
                }
            });

            return isLocal;
        }
    });
}

var LoggerFactory = (function() {

    if(typeof(log) === 'undefined') {
        console.info('logger not available');
        //create dummy logger to avoid script errors
        log = {
            getLogger: function() {
                return {
                    trace: function(msg) { console.log(msg)},
                    debug: function(msg) { console.log(msg)},
                    info: function(msg) { console.log(msg)},
                    warn: function(msg) { console.log(msg)},
                    error: function(msg) { console.log(msg)},
                    setLevel: function() {}
                }
            },
            setLevel: function() {}
        }
    } else {
        //loglevel plugin
        var originalFactory = log.methodFactory;
        log.methodFactory = function (methodName, logLevel, loggerName) {
            var rawMethod = originalFactory(methodName, logLevel, loggerName);

            return function () {
                var messages = [getCurDateAsString() + ' [' + loggerName.toUpperCase() + '] - '];
                for (var i = 0; i < arguments.length; i++) {
                    messages.push(arguments[i]);
                }
                rawMethod.apply(undefined, messages);
            };
        };
        log.setLevel(log.getLevel()); // Be sure to call setLevel method in order to apply plugin
    }

    function createLogger(name) {
        var logger = log.getLogger(name);
        return logger;
    }

    function getCurDateAsString() {
        var d = new Date();
        var strDate = blowup(d.getDate(), 2) + "." + blowup(d.getMonth()+1, 2) + "." + d.getFullYear();
        strDate += " " + blowup(d.getHours(),2) + ":" + blowup(d.getMinutes(),2) + ":" + blowup(d.getSeconds(),2) + ":" + blowup(d.getMilliseconds(), 3);
        return strDate;
    }

    function redirectConsole() {
        $('<div>').addClass('logcontainer').appendTo('body');
        $('#page').css('padding-top', '150px');
        console.trace = function () { printRow(arguments, 'log-trace'); };
        console.debug = function () { printRow(arguments, 'log-debug'); };
        console.log = function () { printRow(arguments, 'log-log'); };
        console.info = function () { printRow(arguments, 'log-info'); };
        console.warn = function () { printRow(arguments, 'log-warn'); };
        console.error = function () { printRow(arguments, 'log-error'); };
        function printRow(msgs, cls) {
            var $row = $('<div>').addClass('row-log').addClass(cls);
            for (var i = 0; i < msgs.length; i++) {
                $('<span>').text(msgs[i]).appendTo($row);

            }
            $row.prependTo('.logcontainer');
        }
    }

    return {
        createLogger: createLogger,
        redirectConsole: redirectConsole
    }
})();

var LogFactory = (function() {
    if(typeof(debug) === 'undefined') {
        console.log("debug.min.js not included");
    } else {
        /* formatter for byte arrays */
        debug.formatters.h = function(data) {
            return DataHelper.createByteString(data)
        };
    }

    function getLogger(name) {
        return debug(name);
    }

    function getLevelLogger(name) {
        return new DebugLeveled(name);
    }

    return {
        getLogger: getLogger,
        getLevelLogger: getLevelLogger,
        redirectConsole: LoggerFactory.redirectConsole
    }
})();

function redirectConsole() {
    LoggerFactory.redirectConsole();
}

var DebugLeveled = function(name) {

    var LEVELS = {
        TRACE: 5,
        DEBUG: 10,
        INFO: 15,
        WARN: 20,
        ERROR: 25,
        OFF: 90,
        ALWAYS: 99
    };

    var m_dbg = debug(name),
        m_curlevel = LEVELS.ALWAYS;

    function _always() {
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[ALWAYS] ' + args[0];
        _log(args);
    }

    function _trace() {
        if (m_curlevel > LEVELS.TRACE) return;
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[TRACE] ' + args[0];
        _log(args);
    }

    function _debug() {
        if (m_curlevel > LEVELS.DEBUG) return;
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[DEBUG] ' + args[0];
        _log(args);
    }

    function _info() {
        if (m_curlevel > LEVELS.INFO) return;
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[INFO] ' + args[0];
        _log(args);
    }

    function _warn() {
        if (m_curlevel > LEVELS.WARN) return;
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[WARN] ' + args[0];
        _log(args);
    }

    function _error() {
        if (m_curlevel > LEVELS.ERROR) return;
        var args = Array.prototype.slice.call(arguments);
        args[0] = '[ERROR] ' + args[0];
        // args.splice(1,0, "color: red");
        _log(args);
    }

    function _log(args) {
        m_dbg.apply(null, args)
    }

    function _setLevel(level) {
        m_level = level;
    }

    function _readLevel() {
        return parseInt(localStorage.getItem('debug_level') || LEVELS.WARN, 10);
    }

    function _nbrToLevel(nbr) {
        var s = "UNKNOWN";
        for (lvl in LEVELS) {
            if(LEVELS[lvl] === nbr) s = lvl;
        }
        return s;
    }

    m_curlevel = _readLevel();

    _always('log level set to %s', _nbrToLevel(m_curlevel));

    return {
        always: _always,
        a: _always,
        trace: _trace,
        t: _trace,
        debug: _debug,
        d: _debug,
        info: _info,
        i: _info,
        warn: _warn,
        w: _warn,
        error: _error,
        e: _error,
        setLevel: _setLevel
    }

};

// constants
var utils_errorbg = "#FF7D7D";
var utils_defaultbg = "#FFFFFF";

var AUTH_LIVE = 3;
var AUTH_USER = 1;
var AUTH_SERVICE = 2;
var AUTH_NOPROT = 0;

function supportCanvas() {
	return !!document.createElement('canvas').getContext;
}

function getRCPUrl() {
	if(window.location.protocol=="file:") {
		//local for testing
			return "https://" + bosch_backaud_camera_ip + "/rcp.xml";
	} else {
		return "rcp.xml";
	}
}

rcp_url = getRCPUrl();

function getZipUrl(zip) {
	if(window.location.protocol=="file:") {
		if(zip) return "http://"+bosch_backaud_camera_ip+"/zip.xml";
		else return "http://"+bosch_backaud_camera_ip+"/unzip.xml";
	} else {
		if(zip) return "zip.xml";
		else return "unzip.xml";
	}
}


function getIP() {
	var ip = "";
	 if(!isIP(window.location.hostname) && utils_resolvedIP!=null) {
		ip = utils_resolvedIP;
	} else {
		ip = window.location.hostname;
		if(isValidIPV6(ip) && /^\[.*\]$/.test(ip)==false) ip = "["+ip+"]";
	}
	return ip;
}

/*
function getIP() {
    var ip = window.location.hostname;
    if(isValidIPV6(ip) && /^\[.*\]$/.test(ip)==false) ip = "["+ip+"]";
    return ip;
}
*/
function isIP(s) {
	var back = false;
	if(isValidIP(s)) {
		back = true;
	} else if(isValidIPV6(s)) {
		back = true;
	}
	return back;
}

function getCurrentURLData() {
    var data = {};
    data.protocol = document.location.protocol.replace(/:/g, '');
    data.isHttps = data.protocol == "https";
    data.port = parseInt(document.location.port, 10)|| (data.isHttps ? 443 : 80);
    data.hostname = document.location.hostname;
    data.ipV4 = isValidIPV4(data.hostname) ? data.hostname : null;
    data.ipV6 = isValidIPV6(data.hostname) ? data.hostname : null;
    return data;
}

function getHashSecure() {
    return window.location.hash.replace(/[#<>()'":.;\/]/g, '');
}

function getJQElem(e) {
    if (!e) return null;
    else if (typeof(e) === "string") return $(e);
    else if (e.jquery) return e;
    else return $(e);
}

//ip of type string
function ip2bytes(ip) {
	var back = null;
	if(ip.indexOf(":")<0) {
		//IP V4
		var a = ip.split(".");
		back = new Array(a.length);
		for(var i=0; i<a.length; i++) {
			var tmp = parseInt(a[i], 10);
			back[i] = tmp;
		}
	} else {
		//IP V6
		//blowup to 8 sections
		if(ip.indexOf("::")>=0) {
			var a = ip.split(":");
			var fill = ":";
			for(var i=0; i<9-a.length; i++) fill += "0000:";
			ip = ip.replace(/::/, fill);
		}
		//blowup to 4 digits
		var a = ip.split(":");
		if(a.length==8) {
			for(var i=0; i<a.length; i++) {
				a[i] = blowup(a[i], 4);
			}
			ip = a.join(":");
			back = string2bytes(ip.replace(/:/g, ""));
		}
	}
	return back;
}

//b of type bytearray
function ip2string(b) {
	var back = null;
	if(b.length==4) {
		//IP V4
		back = b.join(".");
	} else {
		//IP V6
		var s = intArray2string(b).replace(/0x/, "");
		s = s.replace(/(\w{4})(\w{4})/g, "$1:$2");
		s = s.replace(/(\w{4})(\w{4})/g, "$1:$2");
		back = s;
	}
	return back;
}

function setResolvedIP(ip) {
	utils_resolvedIP = ip;
	if(typeof(ipResolved)=="function") {
		 ipResolved();
	}
	if(typeof(lc_startConnectionDNSReady)=="function") {
		if(typeof(noConnectAfterDNS)=="undefined" || noConnectAfterDNS==false) {
			lc_startConnectionDNSReady();
		}
	}
}

/***************************************************************************
/* set debug if "debug=true" is available in url
/**************************************************************************/
try {
    var tw = getTopWindow();
    if (tw && tw.location.search.indexOf("debug=true") > 0) {
        utils_debuglevel = 1;
    }
} catch (e) {
    // maybe it is not allowed to use top window (CSP)...
}

/***************************************************************************
 /* fix variables from config.js
 /**************************************************************************/
if(typeof(HI)=="undefined") var HI='00000000';
if(typeof(SW)=="undefined") var SW='00000000';
if(typeof(CTN)=="undefined") var CTN='';

/***************************************************************************
/* fix variables from script1.js
/**************************************************************************/
if(typeof(AL)=="undefined") var AL=1;
if(typeof(RL)=="undefined") var RL=1;
if(typeof(AM)=="undefined") var AM=1;
if(typeof(GM)=="undefined") var GM=1;
if(typeof(CO)=="undefined") var CO=0;
if(typeof(BI)=="undefined") var BI=0;
if(typeof(CT)=="undefined") var CT=0;
if(typeof(SNAP)=="undefined") var SNAP=1;
if(typeof(REC)=="undefined") var REC=1;
if(typeof(SAVE_AM)=="undefined") var SAVE_AM=0;
if(typeof(SAVE_GM)=="undefined") var SAVE_GM=0;
if(typeof(AT)=="undefined") var AT=1;
if(typeof(SF)=="undefined") var SF=1;
if(typeof(SCENES)=="undefined") var SCENES=1;
if(typeof(AUTOLOGOUT_TIME)=="undefined") var AUTOLOGOUT_TIME=0;
if(typeof(SHOW_DASHBOARD)=="undefined") var SHOW_DASHBOARD=1;
if(CT=="Error" || typeof(CT)=="function") {
	CT=0;
	CO=0;
}

/***************************************************************************
/* parsing SW version (e.g. SW: 06510590 --> 5.90 B106)
/**************************************************************************/
function parseSWVersion(strSW) {
	if(typeof(strSW)=="undefined") throw new Error("Variable strSW not available");
	var maj = strSW.substring(4, 6) || "0";
	var min = strSW.substring(6) || "0";
	var build = (strSW.substring(3,4) || "0") + (strSW.substring(0,2) || "00");
	return {
		major: parseInt(maj, 10),
		minor: parseInt(min, 10),
		build: parseInt(build, 10),
		strVersion: parseInt(maj, 10)+"."+blowup(min, 2)+"."+blowup(build, 4),
		intVersion: parseInt(maj+blowup(min, 2)+blowup(build, 4), 16)
	}
}

function numberToVersion(nbr) {
    return parseSWVersion(('00000000' + nbr.toString(16)).slice(-8));
}


/***************************************************************************
/* extracts the result of an http-query in xml format and add the values
/* to an array.
/* example data:
/* <rcp>
/*   <command>
/*     <hex>0x002b</hex>
/*     <dec>      43</dec>
/*   </command>
/*   <type>T_OCTET</type>
/* 	 <direction>READ</direction>
/* 	 <idstring></idstring>
/* 	 <payload></payload>
/*   <result>
/*     <hex>0x29</hex>
/*     <dec>          41</dec>
/*   </result>
/* </rcp>
/**************************************************************************/
function parseXMLAnswer(data) {
	var back = new Object();
	if (data && data != null && data != undefined) {
		if(data.responseXML) data=data.responseXML;
		if(data.firstChild) {
			var result = data.getElementsByTagName("result");
			if(result && result.length>0) {
				for(var i=0; i<result[0].childNodes.length; i++) {
					if(result[0].childNodes[i].nodeType==1) {
						var name = result[0].childNodes[i].nodeName;
						var value = "";
						if (result[0].childNodes[i].firstChild) {
							for (var j = 0; j < result[0].childNodes[i].childNodes.length; j++) {
								value += result[0].childNodes[i].childNodes[j].nodeValue;
							}
						}
						if(name=="dec") {
							value = parseInt(trim(value), 10);
							if(isNaN(value)) {
								alert("wrong dec value: "+data.responseText);
							}
						}
						back[name] = value;
					}
				}
			} else {
				var msg = data.responseText ? data.responseText : data;
				//alert("error received: " + msg);
			}
			back["idstring"] = getXMLNodeValue(data, "rcp/idstring");
			back["command"] = getXMLNodeValue(data, "rcp/command/hex");
			back["cltid"] = getXMLNodeValue(data, "rcp/cltid");
			back["num"] = getXMLNodeValue(data, "rcp/num");
			back["payload"] = getXMLNodeValue(data, "rcp/payload");
			back["auth"] = getXMLNodeValue(data, "rcp/auth");
			back["type"] = getXMLNodeValue(data, "rcp/type");
			back["sessionid"] = getXMLNodeValue(data, "rcp/sessionid");
		}
	}
	return back;
}

/***************************************************************************
/* extracts the result of requested messages in xml format and add
/* the values to an array.
/* example data:
/* <message_list>
/*   <stats> ... </stats>
/*   <msg>
/*     <no>1</no>
/*     <command>0x01c0</command>
/*     <num>1</num>
/*     <hex>0x01</hex>
/*   </msg>
/*   <msg>
/*     ...
/*   </msg>
/* <message_list>
/**************************************************************************/
function parseXMLMessages(data, onlylast) {
	var back = new Array();
	if (data && data != null && data != undefined) {
		if(data.responseXML) data=data.responseXML;
		if(data.firstChild) {
			var msgs = data.getElementsByTagName("msg");
			for(var i=0; i<msgs.length; i++) {
				var tmp = new Object();
				for(var j=0; j<msgs[i].childNodes.length; j++) {
					var name = msgs[i].childNodes[j].nodeName;
					if(name=="ip-table") {
						//parse ip-table
						var items = msgs[i].childNodes[j].childNodes;
						for(var k=0; k<items.length; k++) {
							var idx = null;
							var type = null;
							var str = null;
							for(var l=0; l<items[k].childNodes.length; l++) {
								if(items[k].childNodes[l].nodeName=="idx") idx=items[k].childNodes[l].firstChild.nodeValue;
								if(items[k].childNodes[l].nodeName=="type") type=items[k].childNodes[l].firstChild.nodeValue;
								if(items[k].childNodes[l].nodeName=="str") str=items[k].childNodes[l].firstChild.nodeValue;
							}
							if(idx!=null && str!=null && type=="IPV6") {
								tmp["iptable"] = new Array();
								tmp["iptable"][parseInt(idx)] = str;
							}
						}
					} else {
						var value = msgs[i].childNodes[j].firstChild.nodeValue;
						if(name.toLowerCase()=="sessionid" && value.indexOf("0x")==0) value = parseInt(value.replace(/0x/, ""), 16);
						tmp[name] = value;
					}
				}
				if(typeof(tmp.sessionID)=="undefined") tmp.sessionID=0;
				tmp["time"] = new Date().getTime();
				back.push(tmp);
			}
		}
		if(onlylast) {
			var check = new Object();
			var tmpArray = new Array();
			for(var i=back.length-1; i>=0; i--) {
				var key = back[i].command+"_"+back[i].num;
				if(!check[key]) {
					tmpArray.push(back[i]);
					check[key]=true;
				} else {
					//alert("removed: "+key);
				}
			}
			back = tmpArray;
		}
	}
	return back;
}

function getXMLNode(xml, strPath) {
	var path = strPath.split("/");
	var curNode = xml;
	for(var j=0; j<path.length; j++) {
		if(curNode.getElementsByTagName(path[j]).length>0) {
			curNode = curNode.getElementsByTagName(path[j])[0];
		} else {
			curNode = null;
			break;
		}
	}
	return curNode;
}

function getXMLNodeValue(xml, strPath) {
	var value = null;
	var node = getXMLNode(xml, strPath);
	if(node && node.firstChild) {
		value = node.firstChild.nodeValue;
	}
	return value;
}


/***************************************************************************
/* creates an ascii representation of a string
/* example: s=test returns 74657374
/**************************************************************************/
function createASCII(s) {
	var back = "";
	for(var i=0; i<s.length; i++) {
		var n = Number(s.charCodeAt(i));
		var t = n.toString(16);
		t = blowup(t,2);
		back+=t;
	}
	return back;
}

/***************************************************************************
/* creates an array of ints from a space-separated string
/* (1 tokens = 1 Byte)
/* example: data = "31 32 33 00"
/*          returns an array with values {49,50,51,0}
/*          (0x0031 = dez 49, ...)
/**************************************************************************/
function createByteArray1(data, separator, radix) {
	if(!data || data.length==0) data="0";
	if(!separator) separator=" ";
	if(!radix) radix=16;
	data = data.replace(/\s+/, " ");
	data = trim(data);
	var a = new Array();
	var tmp="";
	var pos = data.indexOf(separator);
	while(pos>-1) {
		tmp = data.substring(0,pos);
		a.push(parseInt(tmp,radix));
		data = data.substring(pos+1, data.length);
		data = trim(data);
		pos = data.indexOf(separator);
	}
	a.push(parseInt(data,radix));
	return a;
}

/***************************************************************************
/* creates an array of ints from an space-separated string
/* (2 tokens = 1 Byte)
/* example: data = "00 31 00 32 00 33 00 00"
/*          returns an array with values {49,50,51,0}
/*          (0x0031 = dez 49, ...)
/**************************************************************************/
function createByteArray2(data) {
	data = trim(data);
	var a = new Array();
	pattern = /([\dabcdef]+)\s+([\dabcdef]+)/g;
	var tmp;
	while(tmp=pattern.exec(data)) {
		if(tmp[1] && tmp[2]) {
			var strByte = "0x"+tmp[1]+tmp[2];
			a.push(parseInt(strByte,16));
		}
	}
	return a;
}

/***************************************************************************
/* creates an array of ints from an string
/* (2 chars = 1 Byte)
/* example: data = "313233"
/*          returns an array with values {49,50,51}
/**************************************************************************/
function createByteArray3(data) {
	if(data==null || typeof(data)=="undefined") return null;
	data = trim(data);
	data = data.replace(/0x/, "");
	var a = new Array();
	pattern = /([\dabcdef]{2})/g;
	var tmp;
	while(tmp=pattern.exec(data)) {
		if(tmp[1]) {
			var strByte = "0x"+tmp[1];
			a.push(parseInt(strByte,16));
		}
	}
	return a;
}

function getIntFromByteArray(array, start, stop) {
	var back = 0;
	var cur = 0;
	for(var i=stop; i>=start; i--) {
		var shift = cur*8;
		//alert("shift: "+shift+", byte: "+array[i]);
		back += array[i]<<shift
		cur++;
	}
	return back;
}

function int2bytes(val, length) {
	var back = new Array(length);
	if(isNaN(val)) val = 0;
	var filter = 0xff;
	for(var i=0; i<back.length; i++) {
		var idx = back.length-1-i;
		back[idx] = (val&filter) >> (i*8);
		//alert("back["+idx+"]: "+back[idx]+", filter: 0x"+filter.toString(16));
		filter = filter<<8;
	}
	return back;
}

function getArrayFrom(int, length) {
	var array = [];
	var val = int;
	for (var i=0; i<length; i++) {
		array.unshift(val % 256);
		val = Math.floor(val / 256);
	}
	return array;
}

//convert negative 4 byte value to positive
function unsign(val) {
	var back = val;
	if(val<0) {
		var b1 = val&0x80000000;
		if(b1!=0) {
			back = val&0x7FFFFFFF;
			back = back + 0x80000000;
		}
	}
	return back;
}


/***************************************************************************
/* creates an string which represents the string 'data' in unicode bytes.
/* eg. test --> 0x00740065007300740000
/**************************************************************************/
function createUnicodeByteString(data) {
	var back = "";
	for(var i=0; i<data.length; i++) {
		var n = Number(data.charCodeAt(i));
		var t = n.toString(16);
		t=blowup(t,4);
		back = back + t;
	}
	back = back + "0000";
	back = back.toUpperCase();
	back = "0x"+back;
	return back;
}

function createMappedUnicodeByteString(data, map, ignoreIfNotAvailable) {
	var back = "";
	//var onlyASCII = isOnlyASCII(data);
	var onlyASCII = !isMappingPossible(data, map);
	for(var i=0; i<data.length; i++) {
		var n = Number(data.charCodeAt(i));
		if(!onlyASCII) {
			if(typeof(map[n])!="undefined") {
				n = map[n];
			} else if(ignoreIfNotAvailable) {
				n = -1;
			}
		}
		if(n>=0) {
			var t = n.toString(16);
			t=blowup(t,4);
			back = back + t;
		}
	}
	back = back + "0000";
	back = back.toUpperCase();
	back = "0x"+back;
	return back;
}

/***************************************************************************
/* creates an string which represents the string 'data' in bytes.
/* eg. test --> 0x74657374
/**************************************************************************/
function createByteString(data) {
	var back = "";
	for(var i=0; i<data.length; i++) {
		var n = Number(data.charCodeAt(i));
		var t = n.toString(16);
		t=blowup(t,2);
		back = back + t;
	}
	//back = back + "00";
	back = back.toUpperCase();
	back = "0x"+back;
	return back;
}

/***************************************************************************
/* creates a string from an int-array
/**************************************************************************/
function bytes2string(data) {
	var a = [];
	for (var i = 0, l = data.length; i < l; i++) {
		if (data[i] != 0) {
			a.push(String.fromCharCode(data[i]));
		} else {
			break;
		}
	}
	return a.join('');
}

function bytes2stringUTF8(data) {
	/*
	Unicode				Byte1		Byte2		Byte3		Byte4

	U+000000-U+00007F	0xxxxxxx
	U+000080-U+0007FF	110xxxxx	10xxxxxx
	U+000800-U+00FFFF	1110xxxx	10xxxxxx	10xxxxxx
	U+080000-U+10FFFF	11110xxx	10xxxxxx	10xxxxxx	10xxxxxx
	*/
	var back = "";
	while(data.length>0) {
		var cnt = 1;
		if((data[0]&0xE0)==0xC0) { // 0xe0 --> 11100000, 0xc0 --> 11000000
			data[0] = data[0]&0x1F;
			cnt = 2;
		} else if((data[0]&0xF0)==0xE0) { // 0xf0 --> 11110000, 0xe0 --> 11100000
			data[0] = data[0]&0x0F;
			cnt = 3;
		} else if((data[0]&0xF8)==0xF0) { // 0xf8 --> 11111000, 0xf0 --> 11110000
			data[0] = data[0]&0x07;
			cnt = 4;
		}
		if(data.length>=cnt) {
			var b = data.slice(0,cnt);
			data.splice(0,cnt);
			var val = b[0];
			for(var i=1; i<b.length; i++) {
				var tmp = b[i]&0x3F; //remove first 2 bits
				val = (val<<6) + tmp;
			}
			//$.dbg.out("b: "+b+", val: "+val+", data: "+data);
			if (val > 0) {
				back = back + String.fromCharCode(val);
			}
		} else {
			break;
		}
	}
	return back;
}

function string2bytesUTF8(s, maxResponseLength) {
    /*
    Unicode				Byte1		Byte2		Byte3		Byte4

    U+000000-U+00007F	0xxxxxxx
    U+000080-U+0007FF	110xxxxx	10xxxxxx
    U+000800-U+00FFFF	1110xxxx	10xxxxxx	10xxxxxx
    U+080000-U+10FFFF	11110xxx	10xxxxxx	10xxxxxx	10xxxxxx
    */
    var b = [];
    for(var i=0; i< s.length; i++) {
        var c = s.charCodeAt(i);
        if(c<=0x7f) {
			if (maxResponseLength && b.length + 1 > maxResponseLength) {
				break;
			}
            b.push(c);
        } else if(c<=0x7ff) {
            var b1 =(c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b2 = (c&0x1f)+0xc0; //0x1f --> 00011111, 0xc0 --> 11000000
			if (maxResponseLength && b.length + 2 > maxResponseLength) {
				break;
			}
            b.push(b2, b1);
        } else if(c<=0xffff) {
            var b1 =(c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b2 = (c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b3 = (c&0xf)+0xe0; //0xe0 --> 11100000
			if (maxResponseLength && b.length + 3 > maxResponseLength) {
				break;
			}
            b.push(b3, b2, b1);
        } else {
            var b1 =(c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b2 = (c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b3 = (c&0x3f)+0x80; //0x3f --> 00111111, 0x80 --> 10000000
            c = c>>6;
            var b4 = (c&0x7)+0xf0; //0x7 --> 0000011, 0xf0 --> 11110000
			if (maxResponseLength && b.length + 4 > maxResponseLength) {
				break;
			}
            b.push(b4, b3, b2, b1);
        }
    }
    return b;
}

function bytes2stringUTF16(data) {
	var back = "";
	for (var i=0; i<data.length; i=i+2) {
		if (data[i] != 0 || data[i+1] != 0) {
			back = back + String.fromCharCode((data[i] << 8) + data[i+1]);
		} else {
			break;
		}
	}
	return back;
}

/***************************************************************************
/* creates a byte array from an string
/* e.g. data = 0x74657374
/* 		returns an array with values {116,101,115,116}
/**************************************************************************/
function string2bytes(data) {
	if(data.indexOf("0x")==0) data = data.substring(2);
	var a = new Array();
	for(var i=data.length; i>=0; i=i-2) {
		if(i>=2) {
			var tmp = data.substring(i-2, i);
			a.unshift(parseInt(tmp,16));
		}
	}
	return a;
}

/***************************************************************************
/* creates a string from a byte array
/* e.g. data is a array with values {127,0,0,1}
/* 		returns "0x7f000001"
/**************************************************************************/
function intArray2string(data) {
	var back = "0";
	if(data) {
		back = "0x";
		for(var i=0; i<data.length; i++) {
			if(isNaN(data[i])) data[i] = 0;
			back += blowup(Number(data[i]).toString(16),2);
		}
	}
	return back;
}

/***************************************************************************
/* extends a string with leading characters c to the given length
/**************************************************************************/
function blowup(val, length, c) {
	var back = val+"";
	var count = length - back.length;
	if(!c) c="0";
	for(var i=0; i<count; i++) {
		back = c+back;
	}
	return back;
}

function blowup2(val, length, c, trailing) {
	var back = val+"";
	var count = length - back.length;
	if(!c) c="0";
	for(var i=0; i<count; i++) {
		if(trailing) back = back+c;
		else back = c+back;
	}
	return back;
}

function blowupArray(a, length, val) {
    val = val || 0;
    var b = new Array(length);
    for(var i=0; i< b.length; i++) {
        b[i] = val;
    }
    for(var j=0; j< a.length; j++) {
        if(b.length>j) {
            b[j] = a[j];
        }
    }
    return b;
}

/***************************************************************************
/* removes leading and trailing whitespaces
/**************************************************************************/
function trim(s) {
	if(s) {
		s = s.replace(/^\s+/, "");
		s = s.replace(/\s+$/, "");
	}
	return s;
}

/***************************************************************************
/* replaces a string with an other
/**************************************************************************/
function replaceString(origString, oldString, newString) {
	var cmd = "origString.replace(/"+oldString+"/g, '"+newString+"')";
	var back = eval(cmd);
	return back;
}

/***************************************************************************
/* removes all characters which are not included in allowedChars
/**************************************************************************/
function fixString(s, allowedChars) {
	var fixed = "";
	for (var i=0; i<s.length; i++) {
		if (allowedChars.indexOf(s.charAt(i)) >= 0) fixed += s.charAt(i);
	}
	return fixed;
}

/***************************************************************************
/* formats a given value
/* val = value to format
/* leading = count of numbers in front of the separator
/* trailing = count of numbers after the separator
/**************************************************************************/
function formatValue(val, leading, trailing) {
	if(isNaN(val)) {
		return "NaN";
	} else {
		var str = ""+val;
		if(trailing) {
			str = val.toFixed(trailing);
		}
		var tmpLength = (""+parseInt(val, 10)).length;
		var count = leading - tmpLength;
		if(count>0) {
			for(var i=0; i<count; i++) {
				str = "0"+str;
			}
		}
		return str;
	}
}

function isOnlyASCII(str) {
	var back = true;
	for(var i=0; i<str.length; i++) {
		var n = Number(str.charCodeAt(i));
		if(n>255) back = false;
	}
	return back;
}

function limitToASCII(str, min, max) {
    if (typeof min != 'number') min = 0;
    if (typeof max != 'number') max = 255;
    var back = '';
    for(var i=0; i<str.length; i++) {
        var n = Number(str.charCodeAt(i));
        if(n >= min && n <= max) back += String.fromCharCode(n);
    }
    return back;
}

function isValidResponse(req) {
    var back = false;
    if(req!=null && typeof(req)!="undefined") {
        if(req.status==200 || req.statusText.toLowerCase().indexOf("ok")>=0) {
            back = true;
        } else {
            debug("response not valid, status text: "+req.statusText+", status: "+req.status, 1);
        }
    }
    return back;
}

/***************************************************************************
/* parses a number from an bytearray (array of integer)
/* a = array of integers
/* start = position of the first byte
/* length = number of bytes to parse
/**************************************************************************/
function getNumber(a, start, length) {
	var val = 0;
	for(var i=1; i<=length; i++) {
		var shift_count = (length-i) * 8
		val += (a[(i-1)+start]) << shift_count;
	}
	return val;
}

function parseNumberFrom(array, start, end) {
	var string = "";
	for (var i=start; i<=end; i++) {
		string += blowup(array[i].toString(16), 2);
	}
	return parseInt(string, 16);
}
/*
function selectValueFromSelect(id, val, str, sort) {
	var node = document.getElementById(id);
	var childs = node.childNodes;
	var found = false;
	for(var i=0; i<childs.length; i++) {
		if(childs[i].nodeName.toLowerCase()=="option") {
			if(childs[i].attributes["value"].nodeValue==val) {
				node.value = val;
				found = true;
			}
		}
	}
	if(found==false) {
		addToSelect(id, str, val, sort);
		document.getElementById(id).value = val;
	}
}
*/
function selectValueFromSelect(id, val, str, sort) {
    if (!document.getElementById(id)) return;
	if(isValueInSelect(id, val)==false) {
		addToSelect(id, str, val);
		if(sort) sortSelect(id);
	}
	document.getElementById(id).value = val;
	updateCorrespondingSelectBoxIt(id);
}

function isValueInSelect(id, val) {
	var back = false;
	var elem = document.getElementById(id);
	if(elem) {
		for(var i=0; i<elem.options.length; i++) {
			if(elem.options[i].value==val) {
				back = true;
			}
		}
	}
	return back;
}

/***************************************************************************
/* Adds an entry to a drop down box
/* id  = id of the select element
/* str = string to be displayed
/* val = value of the entry
/**************************************************************************/
/*
function addToSelect(id, str, val, sort) {
	var elem = document.getElementById(id);
	if(elem) {
		var newOption = document.createElement("option");
		var att = document.createAttribute("value");
		att.nodeValue = val;
		newOption.setAttributeNode(att);
		newOption.appendChild(document.createTextNode(str));
		if(!sort) {
			elem.appendChild(newOption);
		} else {
			var childs = elem.childNodes;
			var found = false;
			for(var i=0; i<childs.length; i++) {
				if(childs[i].nodeName.toLowerCase()=="option") {
					var tmp = parseInt(childs[i].attributes["value"].nodeValue);
					if(tmp > parseInt(val)) {
						elem.insertBefore(newOption, childs[i]);
						found = true;
						break;
					}
				}
			}
			if(found==false) {
				elem.appendChild(newOption);
			}
		}
	}
}
*/

function addToSelect(id, str, val, sort) {
	var elem = document.getElementById(id);
	if(elem) {
		//var newoption = new Option($.utils.escapeHTML(str), val, false, false);
        var newoption = new Option(str, val, false, false);
		elem.options[elem.options.length] = newoption;
		if(sort) sortSelect(id);
        updateCorrespondingSelectBoxIt(id);
	}
}

function updateCorrespondingSelectBoxIt(elem) {
    if(typeof(jQuery)!="undefined") {
        var id = elem;
        if(typeof(elem)=="object") {
            if (elem.tagName == "OPTION") id = $(elem).parent().attr("id");
            else if (elem.tagName == "SELECT") id = $(elem).attr("id");
        }
        if(typeof(id)=="string") {
            if ($("#" + id).data("selectBox-selectBoxIt")) {
                try {
                    $("#" + id).data("selectBox-selectBoxIt").refresh();
                } catch(e) {}
            }
        } else {
            $.dbg.e("unknown element: "+elem+" (type: "+typeof(id)+")");
        }
    }
}

function getCorrespondingSelectBoxIt(id) {
	if ($("#" + id).data("selectBox-selectBoxIt")) {
		return $("#" + id).data("selectBox-selectBoxIt");
	}
	return null;
}

function refreshAllSBITs() {
	if(jQueryAvail()) {
		$("select").each(function (idx, obj) {
			if ($(obj).data("selectBox-selectBoxIt")) {
				$(obj).data("selectBox-selectBoxIt").refresh();
			}
		});
	}
}

function sortSelect(id) {
	var elem = document.getElementById(id);
	var numeric = isNumericSelect(id);
	if(elem) {
		var changed = true;
		while(changed==true) {
			changed = false;
			for(var i=0; i<elem.options.length-1; i++) {
				//alert("value: "+elem.options[i].value+", type: "+typeof(elem.options[i].value));
				var val1 = elem.options[i].value;
				var val2 = elem.options[i+1].value
				if(numeric) {
					val1 = parseInt(val1);
					val2 = parseInt(val2);
				}
				if(val1>val2) {
					var tmp1 = new Option(elem.options[i].text, elem.options[i].value, false, false);
					var tmp2 = new Option(elem.options[i+1].text, elem.options[i+1].value, false, false);
					elem.options[i] = tmp2;
					elem.options[i+1] = tmp1;
					changed = true;
				}
			}
		}
	}
}

function isNumericSelect(id) {
	var numeric = true;
	var elem = document.getElementById(id);
    if(elem) {
        for (var i = 0; i < elem.options.length - 1; i++) {
            if (!isNumeric(elem.options[i])) numeric = false;
        }
    } else {
        numeric = false;
    }
	return numeric;
}

/***************************************************************************
/* Removes the entry with the given value from a drop down box
/* id   = id of the select element
/* val  = value of the item to remove
/**************************************************************************/
function removeFromSelect(id, val) {
	var elem = document.getElementById(id);
	if(elem) {
		for(var i=0; i<elem.options.length; i++) {
			if(elem.options[i].value == val) {
				elem.removeChild(elem.options[i]);
			}
		}
	}
    updateCorrespondingSelectBoxIt(id);
}

/***************************************************************************
/* Removes all entries of a drop down box
/* id  = id of the select element
/**************************************************************************/
function clearSelect(id) {
	var node = document.getElementById(id);
	if(node) {
		while(node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}
    updateCorrespondingSelectBoxIt(id);
}

/***************************************************************************
/* Changes one entry in a drop down box
/* elem_id  = id of the select element
/* entry_val = new value of the entry
/* str = new string of the entry
/**************************************************************************/
function changeStringInSelect2(elem_id, entry_val, str) {
	var node = document.getElementById(elem_id);
	if(node) {
		var childs = node.childNodes;
		for(var i=0; i<childs.length; i++) {
			if(childs[i].nodeName.toLowerCase()=="option") {
				if(childs[i].attributes["value"].nodeValue==entry_val) {
					var opt_childs = childs[i].childNodes;
					for(var j=0; j<opt_childs.length; j++) {
						//showObj(opt_childs[j]);
						if(opt_childs[j].nodeType==3) {
							opt_childs[j].nodeValue = str;
							//opt_childs[j].data = str;
						}
					}
				}
			}
		}
	}
}

function changeStringInSelect(elem_id, entry_val, str) {
	var elem = document.getElementById(elem_id);
	if(elem) {
		for(var i=0; i<elem.options.length; i++) {
			if(elem.options[i].value == entry_val) {
				var newoption = new Option(str, entry_val, false, elem.options[i].selected);
				elem.options[i] = newoption;
				break;
			}
		}
	}
}

/***************************************************************************
/* Checks a inputfield for numeric value
/**************************************************************************/
function checkNumeric(obj, min, max) {
	var strAllowed = "+-0123456789";
	var strCheck = obj.value;
	var allValid = true;
	for (var i=0; i<strCheck.length; i++) {
		var c = strCheck.charAt(i);
		if(strAllowed.indexOf(""+c)==-1) {
			allValid = false;
			showAlert("Only numeric values are allowed in this field");
			break;
		}
	}
	if(allValid==true) {
		try {
			var intval = parseInt(strCheck,10);
			if(intval<min || intval>max) {
				showAlert("Only values between "+min+" and "+max+" are allowed in this field");
				allValid = false;
			}
		} catch(e) {
			showAlert("Only numeric values are allowed in this field");
		}
	}
	if(allValid==false) {
		obj.select();
		obj.focus();
	}
	return allValid;
}

function isNumeric(str, minval, maxval) {
	var strAllowed = "+-0123456789";
	for (var i=0; i<str.length; i++) {
		var c = str.charAt(i);
		if(strAllowed.indexOf(""+c)==-1) {
			return false;
		}
	}
	if(isNumeric.arguments.length>2) {
		return isInRange(str, minval, maxval);
	} else {
		return true;
	}
}

function isArray(obj) {
	var back = false;
	if(typeof(obj)!="undefined" && typeof(obj)!="number" && typeof(obj)!="string") {
		try {
			var s = obj.join(" ");
			back = true;
		} catch(e) {}
	}
	return back;
}

function isInRange(str, minval, maxval) {
	if(!isNumeric(str)) return false;
	var val = parseInt(str, 10);
	if(val<minval || val>maxval) {
		return false;
	}
	return true;
}

function fixRange(val, min, max) {
	if(typeof(val)=="string") {
		val = parseInt(val, 10);
	}
	if(isNaN(val)) val = min;
	else if(val<min) val = min;
	else if(val>max) val = max;
	return val;
}

function getRecordingPath() {
	var path = LocalStorageMgr.getValue(LocalStorageMgr.RECORDING_PATH);
	if(path.length>0) {
		//check trailing slash
		var pattern = /.*[\/|\\]$/;
		if(!pattern.test(path)) {
			path = path + "\\";
		}
	}
	return path;
}

/***************************************************************************
/* Checks if a ip adress is valid
/**************************************************************************/
function isValidIP(ip) {
	//for compatibility reasons
	return isValidIPV4(ip);
}

function isValidIPV4(ip) {
	var b = /^[012]?[0-9]?[0-9]{1}\.[012]?[0-9]?[0-9]{1}\.[012]?[0-9]?[0-9]{1}\.[012]?[0-9]?[0-9]{1}$/.test(ip);
	if(b==false) return false;
	var parts = ip.split(".");
	if(parts.length!=4) return false;
	for(var i=0; i<parts.length; i++) {
		if(parseInt(parts[i])>255) return false;
	}
	return true;
}

function isValidIPV6(ip) {
	var b = /^\[?([\dabcdef]{0,4}:+[\dabcdef]{0,4})+\]?$/i.test(ip);
	if(b==false) return false;
	var parts = ip.split(":");
	if(parts.length!=8 && ip.indexOf("::")<0) return false;
	return true;
}

/***************************************************************************
/* Checks if a mail adress is valid
/**************************************************************************/
function isValidMail(adr) {
	return /[^\n\t\@ ]+@[^\n\t\@ ]+\.[a-zA-Z]{2,4}/.test(adr);
}

/***************************************************************************
/* Disables the user interface
/**************************************************************************/
function disableGUI(b) {
	var elems = document.getElementsByTagName('select');
	for(var i=0; i<elems.length; i++) {
        if(elems[i].disabled!=b) {
            elems[i].disabled = b;
            updateCorrespondingSelectBoxIt(elems[i].id);
        }
	}
	elems = document.getElementsByTagName('input');
	for(var i=0; i<elems.length; i++) {
		elems[i].disabled=b;
	}
	elems = document.getElementsByTagName('button');
	for(var i=0; i<elems.length; i++) {
		elems[i].disabled=b;
	}
	elems = document.getElementsByTagName('textarea');
	for(var i=0; i<elems.length; i++) {
		elems[i].disabled=b;
	}
	var dots = document.getElementById("loadprogress");
	if(dots) {
		if(b) dots.style.visibility = "visible";
		else dots.style.visibility ="hidden";
	}
}

/***************************************************************************
/* Disables one element
/**************************************************************************/
function disableElement(id, disabled) {
	var elem = document.getElementById(id);
	if(elem) elem.disabled=disabled;
}

/***************************************************************************
 /* escapes a string to be shown in HTML
 /**************************************************************************/
function escapeHTML(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;').replace(/'/g, "&#039;");
}

/***************************************************************************
/* opens a popup window
/**************************************************************************/
function openPopup(url, width, height, resizable, name, scrollbars) {
	if(!width) width = 300;
	if(!height) height = 150;
	if(!name) name = "popup";
	if(!scrollbars) scrollbars = "no";
	else scrollbars = "yes";
	var top = (screen.availHeight-height)/2;
	var left = (screen.availWidth-width)/2;
	var resize = resizable?"yes":"no";
	var win = window.open(url, name, "width="+width+",height="+height+",left="+left+",top="+top+",location=no,menubar=no,resizable="+resize+",status=no,toolbar=no,scrollbars="+scrollbars+",dependent=yes");
	if(win) {
		win.focus();
	}
	return win;
}

function openPTZPopup() {
	var ptzwin = openPopup("ptzctrl.html", 260, 150, true, "ptz");
	//return ptzwin;
}

/***************************************************************************
/* Checks whether a array contains a value or not
/**************************************************************************/
function arrayContains(array, value) {
	var back = false;
	for(var i=0; i<array.length; i++) {
		if(array[i]==value) back=true;
	}
	return back;
}

function removeFromArray(array, value) {
	var back = new Array();
	for(var i=0; i<array.length; i++) {
		if(array[i]!=value) back.push(array[i]);
	}
	return back;
}

function getLeaseTimeID() {
	var lt = 0;
	if(typeof(cs_readCookie)=="function") lt = cs_readCookie("leasetimeid", 0);
	else lt = readCookie_dw("leasetimeid", 0);
	lt = parseInt(lt, 10);
	if(lt==0) {
		lt = getRandomNumber(0, Math.pow(2,31));
		if(typeof(cs_writeCookie)=="function") cs_writeCookie("leasetimeid", lt, 0);
		else writeCookie_dw("leasetimeid", lt, 0);
	}
	return lt;
}

/***************************************************************************
/* returns a random number between _min and _max
/**************************************************************************/
function getRandomNumber(_min, _max) {
	var ran = Math.random()*(_max-_min);
	ran = Math.round(ran);
	return _min+ran;
}

/***************************************************************************
/* DOM functions
/**************************************************************************/
function duplicateNode(id, id_part2replace, count) {
	var e = document.getElementById(id);
	var ns = e.nextSibling;
	if(e) {
		for(var i=0; i<count; i++) {
			var e2 = e.cloneNode(true);
			replaceIDParts(e2, id_part2replace, ""+i);
			if(ns) {
				e.parentNode.insertBefore(e2, ns);
			} else {
				e.parentNode.appendChild(e2);
			}
		}
		e.parentNode.removeChild(e);
	}
}

function replaceIDParts(node, orig, replacement) {
	if(node) {
		if(node.nodeType==1) { //only element nodes
			if(node.id) {
				node.id = replaceString(node.id, orig, replacement);
			}
			if(node.name) {
				node.name = replaceString(node.name, orig, replacement);
			}
			for(var c=0; c<node.childNodes.length; c++) {
				replaceIDParts(node.childNodes[c], orig, replacement);
			}
		}
	}
}

function removeAllChilds(node) {
	if(node.childNodes) {
		while (node.childNodes.length>0) {
			node.removeChild(node.firstChild);
		}
	}
}

/***************************************************************************
/* returns the top window
/**************************************************************************/
function getTopWindow() {
	var obj = window.parent;
	while(obj!=obj.parent && obj.parent!=null) {
		try {
			var parentLocation = obj.parent.location.host;
		} catch (e) {
			break;
		}
		obj = obj.parent;
	}
	return obj;
}

function getPageHeight() {
	return $('html')[0].scrollHeight;
}

/***************************************************************************
/* calls a method when leaving page
/**************************************************************************/
function callOnLeave(fkt) {
	if(typeof(isIELower11)!="function") isIELower11 = function() {return false;}
	if(isIELower11()) {
		//pressing an 'a' element causes onbeforeunload in IE<11
		window.onunload = fkt;
	} else {
		window.onunload = window.onbeforeunload = fkt;
	}
}

/***************************************************************************
/* reload config.js file and evaluate it
/**************************************************************************/
function reloadConfigJS() {
	readFile("config.js", function(req) {
		var s = req.responseText;
		eval(s);
	});
}

/***************************************************************************
/* checks whether a variable is defined or not
/* (parameter v has to be a string!)
/**************************************************************************/
function isDefined(v) {
	try {
		eval(v);
	} catch(e) {
		return false;
	}
	return true;
}


function showAlert(msg, type) {
	//var e = DOM.get("div_alert");
	var visible = false;
	var e = document.getElementById("div_alert");
	if(e) {
        msg = escapeHTML(msg).replace(/\n/g, "<br>");
		var src = "";
		if(showAlert.arguments.length<2) type="error";
		if(type=="ok") {
			src = "ok.png";
			e.className="div_alert_ok";
		} else if(type=="info") {
			src = "info.gif";
			e.className="div_alert_ok";
		} else if(type=="warning") {
			src = "warning.png";
			e.className="div_alert_warning";
		} else if(type=="none") {
			e.className="div_alert_ok";
		} else {
			src = "error.png";
			e.className="div_alert_error";
		}
		var s = "<table border='0' style='width:100%'><tr>";
		if(src.length>0) s += "<td style='width:32px'><img src='"+src+"' /></td>";
		s += "<td>"+msg+"</td></tr></table>";
		if(jQueryAvail()) {
			visible = $("#div_alert:visible").length>0;
			$(e).html(s);
			$(e).show();
			//fix sliders and reassign relative position
			$(".slider").css("position", "relative");
		} else {
			e.innerHTML = s;
			e.style.display="block";
		}
		window.scrollTo(0,0);
        if(!visible) fireLayoutChanged(0, 0, {noSBITRefresh: true});
	} else {
		alert(msg);
	}
}

function hideAlert() {
	var visible = true;
	if(jQueryAvail()) {
		visible = $("#div_alert:visible").length>0;
		$("#div_alert").hide();
	} else {
		if(document.getElementById("div_alert")) {
			document.getElementById("div_alert").style.display="none";
		}
	}
    if(visible) fireLayoutChanged(0, 0, {noSBITRefresh: true});
}

function createHTMLElement(name, params) {
	var elem = document.createElement(name);
	for (var key in params) {
		var att = document.createAttribute(key);
		att.nodeValue = params[key];
		elem.setAttributeNode(att);
	}
	return elem;
}

function getDevId() {
	return HI.substring(4,6).toUpperCase();
}

function updatePTZCursor(evt) {
    var $elem = $(evt.target);
    var x = ((evt.offsetX) / ($elem.width()/2)) - 1;
    var y = ((evt.offsetY) / ($elem.height()/2)) - 1;
    var a = Math.atan(y/x);
    var aDeg = (a/Math.PI)*180;
    if(x>=0) aDeg = aDeg + 180;
    else if(y>0) aDeg = aDeg + 360;
    var l = Math.sqrt(x*x + y*y);
    //console.log("x: "+x+", y: "+y+", angle: "+aDeg+", l: "+l);
    var d = 25;
    var cls = "";
    if(!$elem.hasClass('ptz-avail')) l = 0;
    if(l>0.1) {
        if (aDeg < d) cls = "cursor_l";
        else if (aDeg < 90 - d) cls = "cursor_tl";
        else if (aDeg < 90 + d) cls = "cursor_t";
        else if (aDeg < 180 - d) cls = "cursor_tr";
        else if (aDeg < 180 + d) cls = "cursor_r";
        else if (aDeg < 270 - d) cls = "cursor_br";
        else if (aDeg < 270 + d) cls = "cursor_b";
        else if (aDeg < 360 - d) cls = "cursor_bl";
        else cls = "cursor_l";
    }
    if(cls.length==0) {
        $elem.removeClass("cursor_b cursor_bl cursor_br cursor_t cursor_tl cursor_tr cursor_l cursor_r");
    } else if(!$elem.hasClass(cls)) {
        $elem.removeClass("cursor_b cursor_bl cursor_br cursor_t cursor_tl cursor_tr cursor_l cursor_r");
        $elem.addClass(cls);
    }
}

function openPasswordDialog(filename, width, height) {
	if(!width) width = 350;
	if(!height) height = 150;
	var posX = screen.availWidth/2 - width/2;
	var posY = screen.availHeight/2 - height/2;
	var answer = null;
	if(window.showModalDialog) {
		answer = window.showModalDialog(filename, "popupwindow", "dialogWidth:"+width+"px;dialogHeight:"+height+"px;resizable:yes;status:no");
	}
	return answer;
}

function readAspectRatio(vin, stream, remotedev, callback) {
	var back = {width:640, height:480, aspectratio: 640/480};
	var conf = {
		rcpcmd: '0x0b4b', //CONF_ENC_CURRENT_RESOLUTION
		rcptype: 'P_OCTET',
		payload: '0x' + blowup(parseInt(vin, 10).toString(16), 2) + blowup(parseInt(stream, 10).toString(16), 2),
		callback: function(val, conf, error) {
			if(!error) {
				back.width = getIntFromByteArray(val, 2, 3);
				back.height = getIntFromByteArray(val, 4, 5);
				// nevada: 480/704 = 0.68
                if(back.width==704 && back.height==576 ||  //PAL
                   back.width==704 && back.height==480) {  //NTSC
                    //because of non-quadratic pixels
                    back.aspectratio = (back.height / back.width > 0.65) ? 4 / 3 : 16 / 9;
                } else {
                    back.aspectratio = back.width / back.height;
                }
                back.aspectratio_norm = back.aspectratio;
                if(back.height>back.width) {
                    //rotated 90 or 270 degrees
                    back.aspectratio_norm = back.height / back.width;
                }

			}
			if(typeof(callback)=="function") callback(back);
		}
	};
	if(remotedev) conf.remotedev = remotedev;
	$.rcp.doRequest(conf);
}
function readAspectRatio2(cfg) {
    function getAspectRatio(width, height) {
        if (width==704 && height==576 ||  //PAL
            width==704 && height==480) {  //NTSC
            //because of non-quadratic pixels
            return (4 / 3);
        } else {
            return (width / height)
        }
    }
    var def = new jQuery.Deferred();
    cfg = cfg||{};
    var line = cfg.line || 1;
    var stream = cfg.stream || 1;
    var back = {
        line: line,
        stream: stream
    };
    if(isVRM()) {
        RCP.readRCP(0xd080, 'P_OCTET', {rcpnum: line}).done(function(res) {
            console.log("0xD080: ", res);
            var is = new InputStream(res.value);
            back.width = is.readShort();
            back.height = is.readShort();
            back.aspectratio = getAspectRatio(back.width, back.height);
            back.aspectratio_norm = back.aspectratio;
            if(back.height > back.width) {
                //rotated 90 or 270 degrees
                back.aspectratio_norm = getAspectRatio(back.height, back.width);
            }
            def.resolve(back);
        }).fail(function(res) {
            def.reject(res);
        });
    } else {
        RCP.readRCP(0x0b4b, 'P_OCTET', {value: [line, stream]}).done(function (res) {
            var is = new InputStream(res.value);
            back.line = is.readByte();
            back.stream = is.readByte();
            back.width = is.readShort();
            back.height = is.readShort();
            back.aspectratio = getAspectRatio(back.width, back.height);
            back.aspectratio_norm = back.aspectratio;
            if(back.height > back.width) {
                //rotated 90 or 270 degrees
                back.aspectratio_norm = getAspectRatio(back.height, back.width);
            }
            def.resolve(back);
        }).fail(function (res) {
            def.reject(res);
        });
    }
    return def.promise();
}

function readLivepageSettings() {
    var def = new jQuery.Deferred();
    RCP.readRCP(0x028f, 'T_DWORD').done(function(res) {
        back = {
            showAlarmInputs: (res.value & 0x1) > 0,
            showRelays: (res.value & 0x2) > 0,
            showVCAMeta: (res.value & 0x40) > 0,
            showVCATrajectories: (res.value & 0x80) > 0,
            showSnapshot: (res.value & 0x200) > 0,
            showRecording: (res.value & 0x400) > 0,
            showIcons: (res.value & 0x1000) > 0
        };
        back.showJPEGOverlay = back.showVCAMeta;
        def.resolve(back);
    }).fail(function(res) {
        def.reject(res);
    });
    return def.promise();
}

function checkLights(callback) {
	if($.rcp) {
		$.rcp.doRequest({
			bicomserver: '0x0004',
			bicomobjid: '0x0412',
			callback: function(val, conf, error) {
				var ir = val===2||val===4;
				var wl = val===3||val===4;
				if(typeof(callback)==="function") {
					callback(ir, wl);
				}
			}
		});
	}
}

function initSlider(sliderid, params) {
    params = params || {};
    if(typeof(params.min)=="undefined") params.min = 0;
    if(typeof(params.max)=="undefined") params.max = 100;
    if(typeof(params.value)=="undefined") params.value = params.min;
    var $slider = $("#" + sliderid);
    $slider.data({"params": params});
    if(params.valuefield!=null) {
        var $valField = $("#" + params.valuefield);
        $valField.data("slider_id", sliderid);
        if(typeof(params.slide)=="undefined") {
            params.slide = function (ev, ui) {
                var val = ui.value;
                if (typeof(params.val2txt) == "function") {
                    val = params.val2txt(val);
                }
                var valFieldID = $(this).data("params").valuefield;
                if ($.utils.isTextField(valFieldID)) {
                    $("#" + valFieldID).val(val);
                } else {
                    $("#" + valFieldID).text(val);
                }
            }
        }
        if(typeof(params.change)=="undefined") {
            params.change = params.slide;
        }
        if($.utils.isTextField(params.valuefield)) {
            $valField.on("keyup", function (evt ) {
                var strVal = evt.currentTarget.value;
                var val = $.byteutils.getInt(strVal, 10);
                if (params.step < 1) {
                    if (strVal.match(/\.$/)) {
                        // ignore decimal point at the end
                        return;
                    }
                    if (strVal.match(/^0\.?$/)) {
                        // ignore 0.
                        return;
                    }
                    val = parseFloat(strVal, 10);
                }
                if (!isNaN(val)) {
                    if (val > params.max) val = params.max;
                    else if (val < params.min) val = params.min;
                    if (strVal != val) evt.currentTarget.value = val;
                    if(params.shadowslider) {
                        $slider.shadowslider("value", val);
                    } else {
                        $slider.slider("value", val);
                    }
                }
            });
            $valField.on("blur", function (evt ) {
                var val = parseFloat(evt.currentTarget.value, 10);
                if (evt.currentTarget.value !== ""+val) { // "2." != 2 ==> false
                    evt.currentTarget.value = val;
                    if(params.shadowslider) {
                        $slider.shadowslider("value", val);
                    } else {
                        $slider.slider("value", val);
                    }
                }
            });
            if (typeof(filterInput) == "function") {
                var allowed = "";
                if (params.step < 1) allowed += ".";
                if (params.min < 0) allowed += "-";
                $("#" + params.valuefield).on("keypress", function (e) {
                    return filterInput(1, e, false, allowed);
                });
            }
            $valField.val(params.value);
        }
    }
    if(params.shadowslider) {
        $slider.shadowslider(params);
    } else {
        $slider.slider(params);
    }

}

function formatByteString(bytes) {
    var back = "";
    var tmp = 0;
    if(bytes>(1024*1024*1024)) {
        tmp = bytes/(1024*1024*1024);
        tmp = tmp + 0.005; //add 0.005, because toFixed does not round
        back = getMessage("export_size_gigabyte").replace(/%s/, ""+tmp.toFixed(2));
    } else if(bytes>(1024*1024)) {
        tmp = bytes/(1024*1024);
        tmp = tmp + 0.05;
        back = getMessage("export_size_megabyte").replace(/%s/, ""+tmp.toFixed(1));
    } else if(bytes>1024) {
        tmp = bytes/1024;
        back = getMessage("export_size_kilobyte").replace(/%s/, ""+Math.ceil(tmp));
    } else {
        back = getMessage("export_size_byte").replace(/%s/, ""+bytes);
    }
    return back;
}

/***************************************************************************
/* shows the kanji dialog and set the value to the given textfield
/**************************************************************************/
function openKanjiDialog(id) {
	var win = window.open("kanji.htm?id="+id, "kanjiwindow", "width=500,height=540,left=200,top=200,resizable=yes,toolbar=no,location=no,dependent=yes");
	win.focus();
}

function createKanjiUrl(s) {
	var url = "";
	if(window.location.protocol=="file:") {
		//local for testing
		url = "http://"+test_ip+"/font.jpg?unicode=";
	} else {
		url = "font.jpg?unicode=";
	}
	for(var i=0; i<s.length; i++) {
		var code = s.charCodeAt(i).toString(16);
		url += blowup(code, 4, "0");
	}
	return url;
}

/***************************************************************************
/* date formatting
/**************************************************************************/
var m_df_mem = 1;
function getDateString(format) {
	if(typeof(format)=="undefined") format=m_df_mem;
	else m_df_mem = format;
	var d = new Date();
	var strDate = "";
	if(format==2) { //USA
		strDate =  blowup(d.getMonth()+1, 2) + "/" + blowup(d.getDate(), 2) + "/" + d.getFullYear();
	} else if (format==3) { //Japan
		strDate = d.getFullYear() + "/" + blowup(d.getMonth()+1, 2) + "/" + blowup(d.getDate(), 2);
	} else {
		strDate = blowup(d.getDate(), 2) + "." + blowup(d.getMonth()+1, 2) + "." + d.getFullYear();
	}
	strDate += " " + blowup(d.getHours(),2) + ":" + blowup(d.getMinutes(),2) + ":" + blowup(d.getSeconds(),2);
	return strDate;
}

/***************************************************************************
/* reset language to english
/**************************************************************************/
function resetLanguage() {
	try {
		saveValue(CONF_BROWSER_LANGUAGE_VAL, 1, "reset_languages", 1);
	} catch(e) {}
}

function rebootDevice(useTopWin, params) {
	if(top.ResetPage) {
		top.ResetPage.reboot();
	} else {
		if (rebootDevice.arguments.length == 0) useTopWin = true;
		//getTopWindow().location = "reset";
		var url = "reset_frameset.html";
		if (params) url = url + "?" + params;
		if (useTopWin) getTopWindow().location = url;
		else document.location = url;
	}
}

function getLangIDs() {
	var ids = new Array("en", "de", "nl", "fr", "it", "es", "pt", "pl", "cs", "hu", "ru", "tr", "el", "da", "no", "fi", "sv", "zh", "ar", "ko", "th", "ch", "ja", "sk");
	return ids;
}

function getLanguageShortcut(id) {
	var ids = getLangIDs();
	if(!id) id = LA;
	if(!id) id = 1;
	if(id<1 || id>ids.length) id = 1;
	else if(ids[id-1] == "") id = 1;
	return ids[id-1];
}

function getVRMLangID() {
    var back = 1;
    if (localStorage && $.jStorage) {
        var lang = $.jStorage.get('language');
        if(!lang) {
            var navigatorLanguage = (navigator.language) ? navigator.language : navigator.userLanguage;
            lang = navigatorLanguage.toLowerCase().slice(0, 2);
        }
        if(lang.match(/^\d+$/)) {
            //number saved in local storage
            back = parseInt(lang);
        } else {
            //language characters saved in local storage
            var langids = getLangIDs();
            var idx = $.inArray(lang, langids);
            if(idx>=0) back = idx+1;
        }
    }
    return back;
}

/***************************************************************************
/* maps
/**************************************************************************/
function getFromMap(map, key, def) {
	if(!map) return def;
	if(typeof(map[key])=="undefined") return def;
	return map[key];
}

function extendMap(orig, def) {
	if(!orig) orig = new Object();
	for (e in def) {
		if(typeof(orig[e])=="undefined") {
			orig[e] = def[e];
		}
	}
	return orig;
}
/***************************************************************************
/* refocus
/**************************************************************************/
function refocusCamera(fullrange) {
	if(fullrange) {
		saveValue(CONF_BICOM_COMMAND, 1, "refocus", "0x81000404A1030003", function() {} ); //full range
	} else {
		saveValue(CONF_BICOM_COMMAND, 1, "refocus", "0x81000404A1030002", function() {} ); //local range
	}
}

/***************************************************************************
 /* fullscreen
 /**************************************************************************/

function requestFullscreen(e) {
    var elem = e;
    if (typeof e === 'string') {
        elem = document.getElementById(e);
    }
    if(elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }
}

/***************************************************************************
/* event handlers
/**************************************************************************/
function addEventHandler(obj, evtname, fkt) {
	var clearEvtName = evtname.replace(/\(.*\)/, "");
	var idx = obj.id+"_"+clearEvtName;
	if(utils_eventhandlermap[idx]) {
		removeEventHandler(obj, evtname);
	}
	utils_eventhandlermap[idx] = fkt;
	if(typeof(isIE11)=="function" && isIE11()) {
		var strFkt = fkt.toString();
		var strParams = strFkt.substring(strFkt.indexOf("("), strFkt.indexOf(")")+1);
		strFkt = strFkt.substring(strFkt.indexOf("{")+1).replace(/}[\s|\n|\r]*$/, "");
		var handler = document.createElement("script");
		handler.setAttribute("for", obj.id);
		handler.setAttribute("event", evtname+strParams);
		handler.appendChild(document.createTextNode(strFkt));
		document.body.appendChild(handler);
	} else if (obj.addEventListener && 1==2) {   // does not work with custom events
		try {
			obj.addEventListener(clearEvtName, utils_eventhandlermap[idx], false);
		} catch(e) {
			$.dbg.info("error attaching eventhandler (addEventListener) '"+evtname+"' to '"+obj+"'");
		}
	} else if (obj.attachEvent) {    // IE before version 11 (maybe "on.." is necesarry...
		try {
			obj.attachEvent(clearEvtName, utils_eventhandlermap[idx]);
		} catch(e) {
			$.dbg.info("error attaching eventhandler (attachEvent) '"+evtname+"' to '"+obj+"'");
		}
	}
}

function removeEventHandler(obj, evtname) {
	var clearEvtName = evtname.replace(/\(.*\)/, "");
	var idx = obj.id+"_"+clearEvtName;
	if(typeof(isIE11)=="function" && isIE11()) {
		$("script[for='"+obj.id+"'][event='"+evtname+"']").remove();
	} else if (obj.removeEventListener && 1==2) {    // all browsers except IE before version 9
		try {
			obj.removeEventListener(clearEvtName, utils_eventhandlermap[idx], false);
		} catch(e) {
			$.dbg.info("error detaching eventhandler (removeEventListener) '"+evtname+"' to '"+obj+"'");
		}
	} else if (obj.detachEvent) {        // IE before version 9
		try {
			obj.detachEvent(clearEvtName, utils_eventhandlermap[idx]);
		} catch(e) {
			$.dbg.info("error detaching eventhandler (detachEvent) '"+evtname+"' to '"+obj+"'");
		}
	}
	utils_eventhandlermap[idx] = null;
	delete utils_eventhandlermap[idx];
}

/***************************************************************************
/* iframe
/**************************************************************************/
function fireLayoutChanged(w, h, options) {
	if(typeof(parent.iframeLayoutChanged)=="function") {
		parent.iframeLayoutChanged(w, h, options);
	}
}

/***************************************************************************
/* debugging
/**************************************************************************/
function debug_legacy(s, level) {
	if(!level || (utils_debuglevel>0 && level>=utils_debuglevel)) {
		var date = new Date();
		var txt = date.toLocaleString()+":"+date.getMilliseconds()+" - "+s;
		if(typeof(console)!="undefined") {
			console.log(txt);
		} else {
			var tn  = document.createTextNode(txt);
			var div = document.createElement("div");
			div.style.whiteSpace="nowrap";
			var code = document.createElement("code");
			code.appendChild(tn);
			div.appendChild(code);
			if(document.getElementsByTagName("body").length>0) {
				document.getElementsByTagName("body")[0].appendChild(div);
			}
		}
	}
}

function showElem(elem) {
	var s = "";
	var a = elem.attributes;
	for(var i=0; i<a.length; i++) {
		s += a[i].nodeName + " = '"+a[i].nodeValue+"'; ";
	}
	alert("elem: "+elem+"\nattributes: "+s);
}

function showObj(obj) {
	alert(createObjString(obj));
}

function createObjString(obj) {
	var s = "";
	if(obj==null) {
		s = "null";
	} else {
		for (var e in obj) {
			s += e+" = "+obj[e]+" ("+typeof(obj[e])+");\n";
		}
	}
	return s;
}

function readSceneMode() {
	var BICOM_CURRENT_MODE = { bicomserver: 4, bicomobjid: 0x200, bicomtype: 'number', idstring: 'currentMode' };
	var BICOM_MODE_NAME = { bicomserver: 4, bicomobjid: 0x203, bicomaction: 1, bicomtype: 'bytes', idstring: 'modeName' };

	$.rcp.doRequest(BICOM_CURRENT_MODE, {
		callback: function(val) {
			$.rcp.doRequest(BICOM_MODE_NAME, {
				value: blowup(val, 4),
				callback: function(val) {
					var key = 'profile_header_ext_%s_' + bytes2stringUTF16(val);
					var $header = $('.settings_header');
					$header.html($header.text() + '&nbsp;<span>' + $.utils.escapeHTML(msup_isTranslationFinished() ? getTranslation(key) : key) + '</span>');
				}
			});
		}
	});
}

function getSceneModes() {
    var def = jQuery.Deferred();
    var scenemodes = [];

    if(CamFeatures.getCapability(CamFeatures.CAP_BICOM_DOME)) {
        scenemodes = ['cam_mode_outdoor', 'cam_mode_motion', 'cam_mode_lowlight', 'cam_mode_indoor', 'cam_mode_vibrant'];
        if (isMic7000() || isEX65() || isMic9000()) {
            scenemodes[0] = 'cam_mode_general';
            scenemodes.push('cam_mode_illuminator');
        }
        $.each(scenemodes, function(i, name) {
            scenemodes[i] = getMessage(name);
        });
        def.resolve(scenemodes);
    } else {
        RCP.readBicom(4, 0x0203, {bicomaction: 0xb}).done(function (res) {
            var count = res.value;
            for (var i = 1; i <= count; i++) {
                RCP.readBicom(4, 0x0203, {bicomtype: 'bytes', value: blowup(i.toString(16), 4)}).done(function (res) {
                    scenemodes[parseInt(res.conf.value, 16) - 1] = bytes2stringUTF16(res.value).trim();
                    count--;
                    if (count == 0) {
                        def.resolve(scenemodes);
                    }
                });
            }
        }).fail(function (res) {
            def.reject(res);
        });
    }
    return def.promise();
}

/***************************************************************************
 /* selectboxit
 /**************************************************************************/
var selectboxit_defaults = {
    showEffect: 'fadeIn',
    showEffectSpeed: 100,
    hideEffect: 'fadeOut',
    hideEffectSpeed: 100,
    selectWhenHidden: false,
    autoWidth: false,
    downArrowIcon: 'iconfont',
    html: false
};

var chosen_defaults = {
    disable_search_threshold: 15,
    no_results_text: "Oops, nothing found!",
    inherit_select_classes: true
};

function getSBITDefaultsForVP(viewportselector) {
    var cfg = JSON.parse(JSON.stringify(selectboxit_defaults));
    if (viewportselector) {
        cfg.viewport = $(viewportselector);
    }
    return cfg;
}

function createSelectBoxIt(selector) {
	var $box = $(selector);
	var opt = $.extend({}, selectboxit_defaults);
	if ($box.data("sbit")) {
		$.extend(opt, $box.data("sbit"));
        if(typeof(opt.viewport) == "string") opt.viewport = $(opt.viewport);
	}
	$box.selectBoxIt(opt);
}

function getParams() {
    var params = {};
    var tokens = (top.location.search||"").replace(/^\?/, '').split('&');
    for (var i=0; i<tokens.length; i++) {
        var a = tokens[i].split('=');
        if(a.length>=2) {
            params[a[0]] = a[1];
        }
    }
    return params;
}

function checkConvert() {
    if(colorWhite() && !$('body').hasClass('white')) convertStyle();
}

function colorWhite() {
    var back = false;
    if(top.$) {
        var b = top.$('body');
        if(b.length>0) back = b.hasClass("white")
    }
    return back;
}

function convertStyle() {
    if(typeof(Converter)=="undefined") {
        $.getScript("js/converter.js").done(function() {
            Converter.convert();
        })
    } else {
        Converter.convert();
    }
}

function addVideoNamesToTabs(tabselector) {
	LineInfo.readInputNames().done(function(res) {
		for(var i=0; i<res.videoin.length; i++) {
			var names = res.videoin[i].linestamps;
			if(names.length>0) {
                var name = $.utils.escapeHTML(names[0]);
                if(name.trim()=="") name = "&nbsp;";
				$(tabselector + ".ui-tabs>.ui-tabs-nav li").eq(i).find("a").append("<div class='tab_devname'>" + name + "</div>")
			}
		}
	});
}

function checkFileEnding(filename, endings) {
    endings = endings || [];
    for(var i=0; i<endings.length; i++) {
        if(filename.indexOf(endings[i]) == filename.length-endings[i].length) {
            return true;
        }
    }
    return false;
}

function getSelectedText(elem){
    if(elem && window.getSelection) {
        var e = $(elem)[0];
        if(e.type == "textarea") {
            if(e.selectionStart && e.selectionEnd) {
                return e.value.substring(e.selectionStart, e.selectionEnd);
            }
        }
    }
    if(window.getSelection){
        return window.getSelection().toString();
    } else if(document.getSelection){
        return document.getSelection().toString();
    } else if(document.selection){
        return document.selection.createRange().text;
    } else {
        return "";
    }
}

function getDownloadStoreLink() {
    var def = new jQuery.Deferred();
    if (getOEMID() == 0) {
        //http://downloadstore.boschsecurity.com/links.php?lang=0x1&version=0x9990999&os=Win32&hwid=0x71&platform=5&unitid=421100581497451980075f84910a3000000000000000&sn=044727045822124074
        var strUrl = 'https://downloadstore.boschsecurity.com/links.php';
        strUrl += '?lang=0x' + LA.toString(16);
        strUrl += '&version=0x' + parseSWVersion(SW).intVersion.toString(16);
        strUrl += '&os=' + navigator.platform;
        if (typeof(HI) != "undefined" && HI.length >= 8) {
            strUrl += '&hwid=0x' + HI.substring(4, 6);
        }
        if (typeof(CamFeatures) != "undefined") {
            var platform = CamFeatures.getCapability(CamFeatures.CAP_PLATFORM_TYPE);
            if (platform) strUrl += '&platform=' + platform;
        }
        RCP.readRCP(0x09e1, 'P_STRING').always(function (res) {
            if (!res.error) strUrl += "&unitid=" + res.value;
            RCP.readRCP(0x0ae7, 'P_OCTET').always(function (res) {
                if (!res.error) strUrl += "&sn=" + res.value.join('');
                def.resolve(strUrl);
            });
        });
    } else if(getOEMID()==1) {
        def.resolve("http://rtcam.ru/support")
    } else {
        def.resolve("");
    }
    return def.promise();
}

function reloadAfterBoot(rebootAt100) {
    rebootAt100 = rebootAt100 || false;
    RCP.readRCP(0x09e3, 'T_DWORD').done(function(res) {
        if (res.value == 100) {
            if(rebootAt100) {
                document.location.reload(true);
            }
        } else {
            window.setTimeout(function() {
                reloadAfterBoot(true);
            }, 5000)
        }
    }).fail(function(res) {
        console.log("failed: ", res);
        window.setTimeout(function() {
            reloadAfterBoot();
        }, 5000)
    })
}

function switchVideoPreview(line, stream) {
    var vf = null;
    if(typeof(videoview)!="undefined") vf = videoview;
    else if(typeof(parent.videoview)!="undefined") vf = parent.videoview;
    if(vf) {
        if (typeof(line) != "undefined") {
            vf.changeLine(line);
        }
        if (typeof(stream) != "undefined") {
            vf.changeStream(stream);
        }
    }
}

function startApp(params, callback) {
    getAppURL(params).done(function(url, data) {
        console.log("starting app with url '"+url+"'...");
        if (navigator.msLaunchUri && 1==2) { //does not work reliable in MS Edge...
            //works with IE10+ on Win8+
            function error() {
                callback(false);
            }
            function success() {
                callback(true);
            }
            navigator.msLaunchUri(url, success, error);
        } else {
			//maybe start in hidden iframe...
            if(params.iframe) {
                if($('#applauncheriframe').length==0) $("<iframe>").attr('id', 'applauncheriframe').css({'display': 'none'}).appendTo('body');
                try {
                    $('#applauncheriframe').attr("src", url);
                } catch (e) {
                    console.log(e);
                }
            } else {
                try {
                    window.location.href = url;
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });
}

function getAppURL(params) {
    params = params || {};
    var def = new jQuery.Deferred();
    var strMac = null;
    var type = params.type || (isVRM() ? 'vrm' : 'bvip');
    var cname = 'HcsoB';
    var line = params.line || 1;
    var ssl = typeof(params.ssl)!="undefined" ? params.ssl : (document.location.protocol=="https:");
    var port = window.location.port;
    if(port=="") port = ssl ? "443" : "80";
    RCP.readRCP(0x00bc, "P_OCTET").always(function(res) {
        strMac = $.byteutils.intarray2bytestring(res.value, '-').toUpperCase();
        RCP.readRCP(0xD07C, "P_STRING").always(function(res) {
            if(!res.error) {
                cname = res.value;
            }
            var url = 'boschvideosecurity://';
            var cookie = CookieSupport.getCookie(cname, '');
            if(!isVRM() && cookie.length>0) {
                //currently no authentication on VRM
            	url += 'cookie:' + cookie + '@';
            }
            url += getIP();
            url += ":"+port;
            url += '/connect';
            url += '?type=' + type;
            url += '&ssl=' + (ssl ? 'on' : 'off');
            url += '&mac=' + strMac;
            url += '&line=' + line;
            def.resolve(url);
        });
    });
    return def.promise();
}

function getCfgMgrURL(params) {
    params = params || {};
    var def = new jQuery.Deferred();
    var strMac = null;
    var path = document.location.pathname.replace(/\/[^\/]*$/, '');
    var ssl = typeof(params.ssl)!="undefined" ? params.ssl : (document.location.protocol=="https:");
    var port = window.location.port;
    if(port=="") port = ssl ? "443" : "80";
    RCP.readRCP(0x00bc, "P_OCTET").always(function(res) {
        strMac = $.byteutils.intarray2bytestring(res.value, '-').toUpperCase();
        RCP.readRCP(0xD07C, "P_STRING").always(function (res) {
            if (!res.error) {
                cname = res.value;
            }
            var url = 'btcm://';
            var cookie = CookieSupport.getCookie(cname, '');
            if(cookie.length>0) {
                url += 'cookie:' + cookie + '@';
            }
            url += getIP();
            url += ":"+port;
            url += path;
            url += '?mac=' + strMac;
//            url += '&ssl=' + (ssl ? 'on' : 'off');
            url += '&btcmInsecure=' + (ssl ? 'false' : 'true');
            if (params.page) {
                url += '&btcmPage=' + params.page;
            }
            def.resolve(url);
        });
    });
    return def.promise();
}

function getUpdatedURL(cfg) {
    cfg = cfg || {};
    var url =
        (typeof(cfg.protocol) != "undefined" ?  cfg.protocol : document.location.protocol) + "//" +
        (typeof(cfg.hostname) != "undefined" ?  cfg.hostname : document.location.hostname) + ":" +
        (typeof(cfg.port) != "undefined" ?  cfg.port : document.location.port) +
        (typeof(cfg.pathname) != "undefined" ?  cfg.pathname : document.location.pathname) +
        (typeof(cfg.search) != "undefined" ?  cfg.search : document.location.search) +
        (typeof(cfg.hash) != "undefined" ?  cfg.hash : document.location.hash);
    return url;
}

function mapTest() {
    $.getScript("js/gmaps.js").done(function() {
        GMaps.mapTest();
    });
}

function stringToFile(s, filename) {
    if(window.Blob) {
        var blob = new Blob([s], {type: "text/plain;charset=utf-8"});
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else if (window.URL.createObjectURL) {
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', filename);
            var event = new MouseEvent("click");
            a.dispatchEvent(event);
            //window.URL.revokeObjectURL(url);
        } else {
            throw("can not create a file");
        }
    } else {
        throw("can not create a file, blob not supported");
    }
}

function createHTTPWarning(selector) {
    var def = jQuery.Deferred();
    var back = {
        protocol: document.location.protocol.replace(/\W/g, "")
    };
    var $container = null;
    if(selector) {
        $container = $(selector);
        $container.html('').addClass('errorbox leftaligned hidden');
    }
    if(document.location.protocol === "http:") {
        RCP.readRCP(0x0a0e, 'T_WORD').done(function(res) {
            back.httpsport = res.value;
            if(res.value > 0) {
                var httpsurl = "https://" +
                    document.location.hostname + ":" + res.value +
                    document.location.pathname + document.location.search +
                    document.location.hash;
                var link = "<a href='" + httpsurl + "'>" + getMessage('protocol_secure_warning_link') + "</a>";
                back.msg = getMessage('protocol_secure_warning_with_link').replace(/%link/, link);
                if($container) {
                    $container.append('<span class="icon iconleft error"></span>');
                    $container.append('<span class="msg"></span>');
                    $container.find('.msg').html(back.msg);
                    $container.removeClass('hidden');
                }
            }
            def.resolve(back);
        }).fail(function() {
            def.resolve();
        });
    } else {
        def.resolve(back);
    }
    return def.promise();
}

function getRecordingError(code) {
    // try full error code
    var key = 'recerr_0x' + blowup(code.toString(16), 2);
    var msg = getMessage(key);
    if(msg == key) {
        // remove first byte of command specific errors
        key = 'recerr_0x' + blowup((code&0xFF).toString(16), 2);
        msg = getMessage(key);
        if(msg == key) {
            msg = getMessage('recerr_unknown').replace(/%code/, "0x" + code.toString(16));
        }
    }
    return msg;
}

function disconnectVideoPreview() {
    if(typeof(videoview)!="undefined") {
        videoview.disconnect();
    }
}

var VRMHelper = (function() {

    function getInfo() {
		var info = {}
        var def = jQuery.Deferred();
        RCP.readRCP(0xd007, 'P_OCTET', {value: [3, 0, 0, 0]}).always(function(res) {
			info.devices = [];
			if(!res.error) {
				var is = new InputStream(res.value);
				while (is.available() > 9) {
					length = is.readShort();
					var dev = {
						trackId: is.readShort(),
						ip: is.readBytes(4),
						flags: is.readByte(),
						line: is.readByte(),
						name: bytes2stringUTF16(is.readBytes(length - 10))
					};
					dev.ip = [dev.ip[3], dev.ip[2], dev.ip[1], dev.ip[0]].join('.');
					if(dev.name===null||dev.name.length==0) dev.name=dev.ip;
					info.devices.push(dev);
				}

				//sort tracklist alpabetical
				info.devices.sort(function(a, b) {
					if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
					else if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
					else return 0;
				});
			}
			RCP.readRCP(0xd060, 'P_OCTET', {value: [3, 0, 0, 0]}).always(function(res) { //CONF_TRANSCODER_INFORMATION
				if(!res.error) {
					var TAGNAMES = ["STATE", "VERSION", "SESSIONS_TOTAL", "SESSIONS_LOCAL", "SESSIONS_DEDICATED", "SESSIONS_IN_USE", "SESSIONS_IN_USE_LOCAL", "SESSIONS_IN_USE_DEDICATED", "SESSIONS_IN_USE_BY_OTHER_PROCESS", "SESSIONS_AVAILABLE", "SESSIONS_AVAILABLE_LOCAL", "SESSIONS_AVAILABLE_DEDICATED", "SESSIONS_OFFLINE"];
					var tags = {};
					is = new InputStream(res.value);
					while(is.available()>=4) {
						var tag = is.readShort();
						var len = is.readShort();
						var tagname = TAGNAMES.length > tag-1 ? TAGNAMES[tag-1] : "TAG_"+tag;
						if(tag==2) {
							//version
							tags[tagname] = is.readString(len)
						} else if(len==2) {
							tags[tagname] = is.readShort();
						} else {
							tags[tagname] = is.readBytes(len);
						}
					}
					info.transcoders = tags;
				}
				def.resolve(info);
			});
        });
        return def.promise();
    }

    return {
        getInfo: getInfo
    }

})();

var VSDKHelper = (function() {

    function checkVSDK(cfg) {
        var def = new jQuery.Deferred();
        cfg = cfg || {};
        var checkProtection = typeof (cfg.checkProtection) == 'undefined' ? true : cfg.checkProtection;
        var checkDownload = typeof (cfg.checkDownload) == 'undefined' ? true : cfg.checkDownload;
        // if (LocalStorageMgr.getValue(LocalStorageMgr.CHECK_VSDK) && VideoBaseUtils.supportsVSDK()) {
        if (LocalStorageMgr.getValue(LocalStorageMgr.CHECK_VSDK) && isIE()) {
            //check cookie access
            if(VideoBaseUtils.isPlayerAvailable(VideoBase.DECODER.VSDK_MPEGACTIVEXCONTROL) && !VideoBaseUtils.getCookieInfo().access && checkProtection) {
                var btnOk = {
                    text: getMessage('vsdk_possible_cookie_enable'),
                    callback: function () {
                        RCP.writeRCP(0x0cdc, 'F_FLAG', 0).always(function(res) {
                            //document.location.href = "default.htm";
                            document.location.reload(true);
                            def.resolve();
                        });
                    }
                };
                var btnCancel = {
                    text: getMessage('vsdk_possible_cookie_ok'),
                    callback: function () {
                        def.resolve();
                    }
                };
                var msg = getOEMMessage("vsdk_possible_cookie_msg");
                msg += "<span class='donotshowagain'><input type='checkbox' id='cbDoNotShowAgain' class='checkbox icon' /><label for='cbDoNotShowAgain'>" + getMessage('vsdk_possible_donotshowagain') + "</label></span>";
                AlertBox.showWarning({
                    title: getMessage("vsdk_possible_cookie_header"),
                    message: msg,
                    ok_button: btnOk,
                    cancel_button: btnCancel
                });
                $("#cbDoNotShowAgain").change(function () {
                    console.log("check again: ", !$(this).is(":checked"));
                    LocalStorageMgr.setValue(LocalStorageMgr.CHECK_VSDK, !$(this).is(":checked"));
                })
            } else if (checkDownload) {
                var type = VideoBaseUtils.getAvailablePlayer();
                if ((type == VideoBase.DECODER.JPEG_IMG || type == VideoBase.DECODER.JPEG_CANVAS || type == VideoBase.DECODER.VIDEOTAG_MP4) && navigator.platform.toLowerCase() == "win32") {
                    var btnok = {
                        text: getMessage('btn_ok'),
                        callback: function () {
                            def.resolve();
                        }
                    };
                    var msg = getOEMMessage("vsdk_possible_msg");
                    //links
                    var app_links = "<span class='applinkContainer'>" + getOEMMessage("vsdk_possible_msg2") + "<span class='applinks'>";
                    app_links += "<a href='https://downloadstore.boschsecurity.com/index.php?type=vsw8' target='_blank' class='windows'><img src='img/bosch-security-app.png' /></a>";
                    app_links += "<a href='https://itunes.apple.com/app/video-security/id569156417?mt=8' target='_blank' class='ios'><img src='img/app-store-ios.svg' /></a>";
                    app_links += "<a href='https://play.google.com/store/apps/details?id=com.bosch.onsite' target='_blank' class='android'><img src='img/app-store-google.png' /></a>";
                    app_links += "</span></span>";
                    //checkbox
                    var checkbox = "<span class='donotshowagain'><input type='checkbox' id='cbDoNotShowAgain' class='checkbox icon' /><label for='cbDoNotShowAgain'>" + getMessage('vsdk_possible_donotshowagain') + "</label></span>";
                    //var checkbox = "<span class='donotshowagain'><label class='cbwrapper'><input type='checkbox converted' id='cbDoNotShowAgain' class='checkbox icon' /><span class='checkmark'></span></label><label for='cbDoNotShowAgain'>" + getMessage('vsdk_possible_donotshowagain') + "</label></span>";
                    //app_links = "";
                    if (isVRM()) {
                        //download VSDK from VRM
                        msg += "<br><span class='vsdklinks'><a class='defaultvsdklink' href='../download/VideoSDK_Setup.msi' target='_blank'>VideoSDK_Setup.msi</a></span>";
                        msg += app_links;
                        msg += checkbox;
                        AlertBox.showWarning({
                            title: getMessage("vsdk_possible_header"),
                            message: msg,
                            ok_button: btnok
                        });
                    } else if (isRTEC()) {
                        //currently no ax wrapper for RTEC so only IE is supported
                        if (isIE()) {
                            msg += "<br><span class='vsdklinks'><a class='defaultvsdklink' href='http://rtcam.ru/software/MPEG_ActiveX_1.00.zip' target='_blank' >MPEG ActiveX<span class='rotating iconfont'> &#xE740 </span></a></span>";
                            msg += checkbox;
                            AlertBox.showWarning({
                                title: getMessage("vsdk_possible_header"),
                                message: msg,
                                ok_button: btnok
                            });
                        }
                    } else if (StaticServerUrl.length == 0) {
                        //no download location
                    } else {
                        //on devices check latest version from downloadstore
                        msg += "<br><span class='vsdklinks'><a class='defaultvsdklink' href='" + StaticServerUrl + "' target='_blank' >" + getMessage("vsdk_link") + "<span class='rotating iconfont'> &#xE740 </span></a></span>";
                        msg += app_links;
                        msg += checkbox;
                        AlertBox.showWarning({
                            title: getMessage("vsdk_possible_header"),
                            message: msg,
                            ok_button: btnok
                        });
                        $.versioncheck.checkAX(function (versions) {
                            //success
                            if (versions) {
                                var s = "";
                                for (var i = 0; i < versions.length; i++) {
                                    if (i > 0) s += "<br>";
                                    s += "<a class='directlink' href='" + versions[i].url + "' target='_blank' >" + versions[i].name + "</a>";
                                }
                                $(".alertbox .msg .vsdklinks a").remove();
                                $(".alertbox .msg .vsdklinks").append(s + "<br>");
                            } else {
                                $(".alertbox .msg .rotating").remove();
                            }
                        }, function () {
                            //error
                            $(".alertbox .msg .rotating").remove();
                        });
                    }
                    $("#cbDoNotShowAgain").change(function () {
                        console.log("check again: ", !$(this).is(":checked"));
                        LocalStorageMgr.setValue(LocalStorageMgr.CHECK_VSDK, !$(this).is(":checked"));
                    })
                } else {
                    def.resolve();
                }
            }
        } else {
            def.resolve();
        }
        return def.promise();
    }

    function checkH265() {
        if (VideoBaseUtils.onlyJPEGAvailable() && VideoBaseUtils.isH265()) {
            showOnlyJpegMessage();
        }
    }

    function showOnlyJpegMessage(force) {
        var def = jQuery.Deferred();
        if (!LocalStorageMgr.getValue(LocalStorageMgr.SHOW_ONLY_JPEG_HINT) && !force) {
            def.resolve();
        } else {
            var btnOk = {
                text: getMessage('vsdk_possible_cookie_ok'),
                callback: function () {
                    def.resolve();
                }
            };
            var checked = LocalStorageMgr.getValue(LocalStorageMgr.SHOW_ONLY_JPEG_HINT) ? "" : "checked";
            var msg = getOEMMessage("only_jpeg_msg");
            msg += "<span class='donotshowagain'><input type='checkbox' id='cbDoNotShowAgainJpeg' class='checkbox icon' " + checked + " /><label for='cbDoNotShowAgainJpeg'>" + getMessage('vsdk_possible_donotshowagain') + "</label></span>";
            AlertBox.showWarning({
                title: getMessage("only_jpeg_header"),
                message: msg,
                ok_button: btnOk
            });
            $("#cbDoNotShowAgainJpeg").change(function () {
                console.log("show hint again: ", !$(this).is(":checked"));
                LocalStorageMgr.setValue(LocalStorageMgr.SHOW_ONLY_JPEG_HINT, !$(this).is(":checked"));
            });
        }
        return def.promise();
    }

    return {
        checkVSDK: checkVSDK,
        checkH265: checkH265
    }

})();

var Taskbar = (function() {

	function setLogos() {
		var src = typeof Logo == 'undefined' ? '' : filterImagePath(Logo);
		var name = typeof Unit == 'undefined' ? '' : filterImagePath(Unit);
		var isCTN = name == 'vip2_top.jpg' || name == 'vip1_top.jpg' || name == '';
		$('#header').find('h1').html(isCTN ? CTN : '<img src="' + name + '" />').css('line-height', isCTN ? '' : 'initial');
		if (src == 'vcs_logo.jpg' || src == '') {
			src = 'img/logo.png';
		}
		$('#companyLogo').html('<img src="' + src + '" />');
	}

	function setLogo(logo) {
		Logo = logo;
	}

	function setUnit(unit) {
		Unit = unit;
	}

    function filterImagePath(s) {
        s = s.trim().replace(/\\/g, '/');
        return s.replace(/[\(\)\'\"<>]/g, "");
    }

	return {
		setLogos: setLogos,
		setLogo: setLogo,
		setUnit: setUnit
	};

})();

var ResetPage = (function() {

	var m_time = 40;
	var m_resetpage =
		"<div class='resetblock'>" +
		"	<div>reset_header</div>" +
		"	<div class='counter-row'>" +
		"		<div>reset_reconnecting</div>" +
		"		<input id='txtSec' value='0'>" +
		"		<label for='txtSec'>reset_sec</label>" +
		"	</div>" +
        "   <div class='power-cycle-warning'>" +
        "       <span class='icon iconleft warn'>reset_power_warning</span>" +
        "   </div>" +
		"</div>";
	var m_url = '';

    function rebootDelayed(ms, reconnectURL) {
        window.setTimeout(function() {
            ResetPage.reboot(reconnectURL);
        }, ms);
    }

	function reboot(reconnectURL) {
		sendRebootCmd();
		waitForReboot();
		m_url = reconnectURL || '';
	}

	function waitForReboot(params) {
        params = params || {};
        if (!$('.resetblock').is(':visible') || params.force) {
            disconnectVideoPreview();
            showRebootScreen(params);
            updateCounter();
        }
	}

	function showRebootScreen(params) {
        params = params || {};
        m_time = isVRM()? 10 : 40;
        if(isAndroidCamera()) m_time = 120;
        var selector = $('#main').length > 0 ? '#main' : '#content-container';
        $('body').addClass('left-menu-hidden right-menu-hidden');
		$(selector).fadeOut(0, function() {
		    $(selector).html(m_resetpage);
            if(params.classname) $(".resetblock").addClass(params.classname);
            $('#txtSec').val(m_time);
            GUITranslator.translate(".resetblock", function() {
                $(selector).fadeIn(0);
            });
        });
	}

	function updateCounter() {
		$("#txtSec").val(m_time);
		window.setTimeout(function() {
			var tmp = parseInt($("#txtSec").val(), 10);
			if(!isNaN(tmp)) m_time = tmp;
			m_time--;
			if(m_time==0) {
                if(isVRM()) {
                    top.location.reload(true);
                } else {
                    top.location.href = m_url || ('default.htm?nocache=' + new Date().getTime());
                }
			} else {
				updateCounter();
			}
		}, 1000);
	}

	function sendRebootCmd() {
		if(isVRM()) {
			$.get("../reset", function (data) {
				//nothing
			});
		} else {
			$.rcp.doRequest({
				rcpcmd: '0x0811', //CONF_BOARD_RESET
				rcptype: 'F_FLAG',
				direction: 'WRITE',
				payload: '1'
			});
		}
	}

    /**
     * Triggers a confirm dialog and reboots the device if accepted
     * @param {Object} cfg - configuration of the dialog
     * @param {string} [cfg.header] - Header of the popup
     * @param {string} [cfg.msg] - Message of the popup
     */
    function showRebootConfirm(cfg) {
        cfg = cfg || {};
        var header = cfg.header || getMessage('gen4_warning');
        var msg = cfg.msg || getMessage('inst_reboot_box');
        AlertBox.showConfirmSimple(header, msg, function() {
            ResetPage.reboot();
        });
    }

	return {
		reboot: reboot,
        rebootDelayed: rebootDelayed,
		waitForReboot: waitForReboot,
        showRebootConfirm: showRebootConfirm
	}
})();

var LineInfo = function() {

	var CONST_PHYSICAL = 1;
	var CONST_VIRTUAL = 2;
	var m_lineinfo = {};

    //called in jqframework.js
	function readData() {

		function parseResponse(bytes, array) {
			var is = new InputStream(bytes);
			var nbr = is.readShort();
			var len = is.readShort();
			for (var i = 0; i < nbr; i++) {
				var virtualLine = is.readShort();
				var physicalLine = is.readShort();
				if (physicalLine != virtualLine && array.length>=virtualLine) {
					array[virtualLine - 1].type = CONST_VIRTUAL;
					array[virtualLine - 1].parent = physicalLine;
				}
				if (len > 4) is.readBytes(len - 4);
			}
		}

		m_lineinfo = {
			videoin: [],
			audioin: []
		};
		var def = new jQuery.Deferred();

		//CONF_NBR_OF_VIDEO_IN
		RCP.readRCP(0x01d6, "T_DWORD", {noglobalfinish: true}).always(function(res) {
			var vin = res.value;
			for(var i=0; i<vin; i++) {
				var o = { type: CONST_PHYSICAL, parent: null };
				m_lineinfo.videoin.push(o);
			}
			//CONF_NBR_OF_AUDIO_IN
			RCP.readRCP(0x01d8, "T_DWORD", {noglobalfinish: true}).always(function(res) {
				var ain = res.value;
				for (var i = 0; i < ain; i++) {
					var o = {type: CONST_PHYSICAL, parent: null};
					m_lineinfo.audioin.push(o);
				}
				if(typeof(InputStream)!="undefined") {
					//CONF_VIRTUAL_LINES
					RCP.readRCP(0x0bf4, "P_OCTET", {noglobalfinish: true}).always(function (res) {
						parseResponse(res.value, m_lineinfo.videoin);
						//CONF_VIRTUAL_AUDIO_LINES
						RCP.readRCP(0x0bf5, "P_OCTET", {noglobalfinish: true}).always(function (res) {
							parseResponse(res.value, m_lineinfo.audioin);
							def.resolve(m_lineinfo);
						});
					});
				} else {
					console.warn("InputStream.js not included!");
					def.resolve(m_lineinfo);
				}
			});
		});

		return def.promise();
	}

	function readInputNames() {
		var def = new jQuery.Deferred();

		//CONF_ENC_STAMPING_PROPERTIES
		RCP.readRCP(0x0bb3, "P_OCTET", {noglobalfinish: true}).always(function (res) {
			var is = new InputStream(res.value);
			var charsPerLine = is.readShort();
			var maxLines = is.readShort();
			var counter = 0;
			for(var vin=0; vin<m_lineinfo.videoin.length; vin++) {
				//CONF_CAMNAME_LINES
				RCP.readRCP(0x0bb1, "P_UNICODE", {noglobalfinish: true, rcpnum: vin+1, fullreply: true}).always(function (res) {
					if(!res.error) {
						var ba = res.value.array;
						var linestamps = new Array(maxLines);
						for (idx = 0; idx < maxLines; idx++) {
							var bName = ba.slice(0, charsPerLine * 2);
							ba.splice(0, charsPerLine * 2);
							linestamps[idx] = DataHelper.nbrArrayToChars(bName, 2);
						}
						m_lineinfo.videoin[res.conf.rcpnum - 1].linestamps = linestamps;
					}
					counter++;
					if(counter==m_lineinfo.videoin.length) {
						def.resolve(m_lineinfo);
					}
				});
			}
		});

		return def.promise();
	}

	function getData() {
		return m_lineinfo;
	}

	function getPhysicalVideoLines() {
		var lines = [];
		for(var i=0; i<m_lineinfo.videoin.length; i++) {
			if(m_lineinfo.videoin[i].parent==null) {
				lines.push(i+1);
			}
		}
		return lines;
	}

	function isPhysicalVideoLine(idx) {
		return m_lineinfo.videoin[idx-1].type==CONST_PHYSICAL;
	}

	function getVirtualVideoLinesForLine(l) {
		var lines = [];
		for(var i=0; i<m_lineinfo.videoin.length; i++) {
			if(m_lineinfo.videoin[i].parent==l) {
				lines.push(i+1);
			}
		}
		return lines;
	}

	function isVirtualVideoLineAvailable() {
		for(var i=0; i<m_lineinfo.videoin.length; i++) {
			if(m_lineinfo.videoin[i].parent!=null) {
				return true;
			}
		}
		return false;
	}

    // Line-Objects for knockout.js
    function getLineObjects(cfg) {
        var def = new jQuery.Deferred();
        cfg = cfg || {};
        var strHeader = cfg.header || "vsettings_mpg4_video_tabs";
        var aLineObj = [];
        readInputNames().done(function(data) {
            for(var i=0; i<data.videoin.length; i++) {
                o = {};
                o.header = getMessage(strHeader).replace(/%s/, (i+1));
                o.name = data.videoin[i].linestamps[0];
                o.inputnbr = i+1;
                o.id = "input"+(i+1);
                o.physical = isPhysicalVideoLine(i+1);
                aLineObj[i] = o;
            }
            def.resolve(aLineObj);
        });
        return def.promise();
    }

	//--- Audio ---/
	function getPhysicalAudioLines() {
		var lines = [];
		for(var i=0; i<m_lineinfo.audioin.length; i++) {
			if(m_lineinfo.audioin[i].parent==null) {
				lines.push(i+1);
			}
		}
		return lines;
	}

	function isPhysicalAudioLine(idx) {
		return m_lineinfo.audioin[idx-1].type==CONST_PHYSICAL;
	}

	function getVirtualAudioLinesForLine(l) {
		var lines = [];
		for(var i=0; i<m_lineinfo.audioin.length; i++) {
			if(m_lineinfo.audioin[i].parent==l) {
				lines.push(i+1);
			}
		}
		return lines;
	}

	return {
		PHYSICAL: CONST_PHYSICAL,
		VIRTUAL: CONST_VIRTUAL,
		readData: readData,
		getData: getData,
		readInputNames: readInputNames,
		getPhysicalVideoLines: getPhysicalVideoLines,
		getVirtualVideoLinesForLine: getVirtualVideoLinesForLine,
		isPhysicalVideoLine: isPhysicalVideoLine,
		isVirtualVideoLineAvailable: isVirtualVideoLineAvailable,
		getPhysicalAudioLines: getPhysicalAudioLines,
		isPhysicalAudioLine: isPhysicalAudioLine,
		getVirtualAudioLinesForLine: getVirtualAudioLinesForLine,
        getLineObjects: getLineObjects
	}
}();

var CSSHelper = function() {

	function addClassTemporary(elem, cls, ms) {
		$(elem).addClass(cls);
		window.setTimeout(function() {
			$(elem).removeClass(cls);
		}, ms);
	}

    function parseColorString(s) {
        var back = {r: 0, g: 0, b: 0, a: 255};
        s = s.replace(/\s/g, "");
        if(s=="transparent") {
            back.a = 0;
            return back;
        }
        //rgb(0,0,0)
        var res = s.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if(res) {
            back.r = parseInt(res[1], 10);
            back.g = parseInt(res[2], 10);
            back.b = parseInt(res[3], 10);
            back.a = 255;
            return back;
        }
        //rgba(0,0,0,0)
        res = s.match(/rgba\((\d+),(\d+),(\d+),(\d+)\)/);
        if(res) {
            back.r = parseInt(res[1], 10);
            back.g = parseInt(res[2], 10);
            back.b = parseInt(res[3], 10);
            back.a = parseInt(res[4], 10);
            return back;
        }
        //#000000
        res = s.match(/#(\w{2})(\w{2})(\w{2})$/);
        if(res) {
            back.r = parseInt(res[1], 16);
            back.g = parseInt(res[2], 16);
            back.b = parseInt(res[3], 16);
            back.a = 255;
            return back;
        }
        //#00000000 (with alpha)
        res = s.match(/#(\w{2})(\w{2})(\w{2})(\w{2})/);
        if(res) {
            back.r = parseInt(res[1], 16);
            back.g = parseInt(res[2], 16);
            back.b = parseInt(res[3], 16);
            back.a = parseInt(res[4], 16);
            return back;
        }
        return back;
    }

    function getBackgroundColor(elem) {
        var color = elem.css("background-color");
        return parseColorString(color);
    }

    function getNonTransparentBackgroundColor(elem) {
        var color = elem.css("background-color");
        var parsed = parseColorString(color);
        if(parsed && parsed.a==0 && elem.parents().length>0) {
            return getNonTransparentBackgroundColor(elem.parent());
        } else {
            return parsed;
        }
    }

    function getBackgroundColorForCameo(elem) {
        var c = getBackgroundColor(elem);
        return ((c.b<<16) + (c.g<<8) + (c.r));
    }

	return {
		addClassTemporary: addClassTemporary,
        getBackgroundColor: getBackgroundColor,
        getNonTransparentBackgroundColor: getNonTransparentBackgroundColor,
        getBackgroundColorForCameo: getBackgroundColorForCameo
	}
}();

var FullscreenSupport = function() {

    function requestFullScreen(e) {
        var elem = e;
        if (typeof e === 'string') {
            elem = document.getElementById(e);
        }
        if(elem) {
            if(elem.requestFullscreen !== undefined) elem.requestFullscreen();
            else if(elem.webkitRequestFullscreen !== undefined) elem.webkitRequestFullscreen();
            else if(elem.mozRequestFullScreen !== undefined) elem.mozRequestFullScreen();
            else if(elem.msRequestFullscreen !== undefined) elem.msRequestFullscreen();
        }
    }

    function closeFullScreen() {
        if(document.exitFullscreen !== undefined) document.exitFullscreen();
        else if(document.webkitExitFullscreen!==undefined) document.webkitExitFullscreen();
        else if(document.mozCancelFullScreen!==undefined) document.mozCancelFullScreen();
        else if(document.msExitFullscreen!==undefined) document.msExitFullscreen();
    }

    function isFullScreen() {
        if(document.isFullscreen) return document.isFullscreen();
        else if(document.fullScreenElement == undefined &&
                document.msFullscreenElement == undefined &&
                document.mozFullScreen == undefined &&
                document.webkitIsFullScreen == undefined ) return false;
        else return !((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
                    (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) ||
                    (document.mozFullScreen !== undefined && !document.mozFullScreen) ||
                    (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen));
    }

    return {
        requestFullScreen: requestFullScreen,
        closeFullScreen:closeFullScreen,
        isFullScreen: isFullScreen
    }

}();

var SimpleTabs = function() {

    function createVideoTabs(tabselector, contentselector) {
        var def = jQuery.Deferred();
        var count = 0;
        LineInfo.readInputNames().done(function(info) {
            var html = "";
            for(var i=0; i<info.videoin.length; i++) {
                if(info.videoin[i].type == LineInfo.PHYSICAL) {
                    html += "<input type='radio' name='tab' id='tab" + i + "' " + (i == 0 ? "checked='checked'" : "") + " >\n";
                    html += "<label for='tab" + i + "' >";
                    html += "<span class='tab_header'>" + getMessage("vsettings_mpg4_video_tabs").replace(/%s/, i + 1) + "</span>";
                    html += "<span class='tab_devname'>" + escapeHTML(info.videoin[i].linestamps[0]) + "</span>";
                    html += "</label>\n";
                    count++;
                }
            }
            $(tabselector).html(html);
            $(contentselector).addClass("rb-tabs-content");
            def.resolve({tabcount: count});
        });
        return def.promise();
    }

    function createTabs(tabselector, contentselector, tabs) {
        var html = "";
        var uniqueNbr = getRandomNumber(1,1000);
        for(var i=0; i<tabs.length; i++) {
            var cls = tabs[i].cls ? (" class='" + tabs[i].cls + "'") : "";
            var tabid = 'tab_' + uniqueNbr + '_' + i;
            html += "<input type='radio' name='tab_" + uniqueNbr + "' id='" + tabid + "' " + (i == 0 ? "checked='checked'" : "") + cls + " >\n";
            html += "<label for='" + tabid + "' >";
            html += "<span class='tab_header'>" + escapeHTML(tabs[i].header) + "</span>";
            if (tabs[i].subheader) {
                html += "<span class='tab_subheader'>" + escapeHTML(tabs[i].subheader) + "</span>";
            }
            html += "</label>\n";
        }
        $(tabselector).html(html);
        $(contentselector).addClass("rb-tabs-content");
    }

    function getSelectedTab(tabselector) {
        var idx =  $(tabselector+'.rb-tabs input:checked').index()/2;
        if(idx < 0) idx = 0;
        return idx+1;
    }

    function selectTab(tabselector, idx, fireevent) {
        if (typeof fireevent === "undefined") fireevent = true;
        var radios =  $(tabselector+'.rb-tabs input[type=radio]');
        idx--;
        if (idx >= 0 && idx < radios.length) {
            $(radios[idx]).prop('checked', true);
            if (fireevent) {
                $(radios[idx]).trigger('change');
            }
        }
    }

    return {
        createVideoTabs: createVideoTabs,
        createTabs: createTabs,
        getSelectedTab: getSelectedTab,
        selectTab: selectTab
    }
}();

var DragDropUtils = (function() {

    function isDragDropPossible() {
        var dummydiv = document.createElement('div');
        return (('draggable' in dummydiv) || ('ondragstart' in dummydiv && 'ondrop' in dummydiv)) && 'FormData' in window && 'FileReader' in window;
    }

    function ajaxUpload(url, file, name, pwd) {
        var formData = new FormData();
        if(pwd) {
            formData.append("pwd", pwd);
        }
        formData.append(name, file);
        return $.ajax({
            url: url,
            type: 'post',
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false
        });
    }

    return {
        isDragDropPossible: isDragDropPossible,
		ajaxUpload: ajaxUpload
	}
})();

var DataTableUtils = (function() {

    function getTranslations() {
        var language = {
            "decimal":        "",
            "emptyTable":     getMessage("table_empty_table"),                  //default: No data available in table
            "info":           getMessage("table_info"),                         //default: Showing _START_ to _END_ of _TOTAL_ entries
            "infoEmpty":      "",                                               //default: Showing 0 to 0 of 0 entries
            "infoFiltered":   getMessage("table_info_filtered"),                //default: (filtered from _MAX_ total entries)
            "infoPostFix":    "",
            "thousands":      "",
            "lengthMenu":     getMessage("table_length_menu").replace("%s", "_MENU_"), //default: Show _MENU_ entries"
            "loadingRecords": getMessage("table_loading_records"),              //default: Loading...
            "processing":     getMessage("table_processing"),                   //default: Processing...
            "search":         getMessage("table_search"),                       //default: Search:
            "zeroRecords":    getMessage("table_zero_records"),                 //default: No matching records found
            "paginate": {
                "first":      "&#xE748;",
                "last":       "&#xE749;",
                "next":       "&#xE762;",
                "previous":   "&#xE761;"
            },
            "aria": {
                "sortAscending":  "",
                "sortDescending": ""
            }
        };
        return language;
    }

    return {
        getTranslations: getTranslations
    }
})();

var CanvasPush = function(params) {

	var m_img = new Image(),
		m_running = true,
		m_loading = false,
		m_timeout = params.timeout || 0,
		m_tohandle = 0,
		m_cnv = params.cnv || null,
		m_src = params.src || "snap.jpg";

    m_img.onerror = function() {
        m_loading = false;
        if(m_running && m_timeout>=0) {
            m_tohandle = window.setTimeout(updateImage, m_timeout);
        }
    };

    m_img.onload = function() {
        m_loading = false;
        m_cnv.getContext('2d').drawImage(m_img, 0, 0, m_cnv.width, m_cnv.height);
        if(m_running && m_timeout>=0) {
            m_tohandle = window.setTimeout(updateImage, m_timeout);
        }
    };

    var getUniqueImageURL = function() {
		var sep = m_src.indexOf("?") < 0 ? "?" : "&";
		return m_src + sep + "tmp=" + new Date().getTime();
	};

    var updateImage = function() {
		m_img.src = getUniqueImageURL();
		m_loading = true;
	};

    this.start = function() {
    	m_running = true;
    	updateImage();
	};

    this.stop = function() {
    	m_running = false;
	}

};

var CloudUtils = (function() {

    var KNOCKER_STATE_KEYS = [ "cbs_not_running", "cbs_connecting", "cbs_connected" ];
    var KNOCKER_STATE_REASON_KEYS = [ '', 'cbs_err_unknown', 'cbs_err_no_dhcp', 'cbs_err_max_attempts', 'cbs_err_max_time', 'cbs_err_unreachable', 'cbs_err_noresponse' ];

    function checkSocketKnockerState() {
        var def = jQuery.Deferred();
        var state = {
            state: 0,
            state_text: "",
            reason: 0,
            reason_text: ""
        };
        //CONF_SOCKET_KNOCKER_STATUS
        RCP.readRCP(0x0b98, 'P_OCTET', {noglobalfinish: true}).done(function(res) {
            //console.log("socket knocker status: ", res);
            state.state = res.value[0];
            state.state_text = getMessage(KNOCKER_STATE_KEYS[res.value[0]]);
            state.reason = res.value[1];
            state.reason_text = getMessage(KNOCKER_STATE_REASON_KEYS[res.value[1]]);
            def.resolve(state);
        }).fail(function(res) {
            console.log("error checking socket knocker status: ", res);
            def.reject(res);
        });
        return def.promise();
    }

    function checkRemotePortalState() {
        var def = jQuery.Deferred();
        var state = {
            state_cbs: 0,
            state_cbs_text: "",
            state_action: 0,
            state_action_text: ""
        };

        //CONF_CBS_STATUS
        RCP.readRCP(0x0c73, 'P_OCTET', {noglobalfinish: true}).done(function(res) {
            //console.log("cbs status: ", res);
            state.state_cbs = res.value[0];
            state.state_action = res.value[1];
            //state 1
            var key = "cbs_rp_state_" + Number(state.state_cbs).toString(16).toLowerCase();
            var s = getMessage(key);
            if(s == key) s = getMessage("cbs_rp_state_unknown").replace(/%s/, "0x"+ Number(state.state_cbs).toString(16).toUpperCase());
            state.state_cbs_text = getMessage(s);
            //state 2
            key = "cbs_rp_state_" + Number(state.state_action).toString(16).toLowerCase();
            s = getMessage(key);
            if(s == key) s = getMessage("cbs_rp_state_unknown").replace(/%s/, "0x"+ Number(state.state_action).toString(16).toUpperCase());
            state.state_action_text = getMessage(s);
            if(state.state_action == 0xe0) state.state_action_text += "<br>" + getMessage("cbs_rp_time_hint");
            def.resolve(state);
        }).fail(function(res) {
            console.log("error checking cbs status: ", res);
            def.reject(res);
        });
        return def.promise();
    }

    function getConnectedServerURL() {
        var def = jQuery.Deferred();
        RCP.readRCP(0x0c83, 'P_STRING', {noglobalfinish: true, rcpnum: 1}).done(function(res) {
            def.resolve(res.value);
        }).fail(function(res) {
            def.reject(res);
        });
        return def.promise();
    }

    function resetRemotePortalState() {
        return RCP.writeRCP(0x0c73, 'P_OCTET', [0, 0], {noglobalfinish: true});
    }

    return {
        getConnectedServerURL: getConnectedServerURL,
        checkSocketKnockerState: checkSocketKnockerState,
        checkRemotePortalState: checkRemotePortalState,
        resetRemotePortalState: resetRemotePortalState
    }
})();
var InputVerifier = (function() {

    function fixNumberInputRange(selector, postdec, emptyallowed) {
        $(selector).each(function() {
            if($(this).val() == "" && emptyallowed) {
                return;
            }
            var min = parseFloat($(this).attr("min"));
            var max = parseFloat($(this).attr("max"));
            var val = parseFloat($(this).val());
            if(!isNaN(min)) {
                if(val < min) val = min;
            }
            if(!isNaN(max)) {
                if(val > max) val = max;
            }
            if(isNaN(val)) {
                //if field is empty set to 0 if it is in range, otherwise to min
                if(min <= 0 && max >= 0) val = 0;
                else val = min;
            }
            var s = val.toString();
            if(typeof(postdec) != 'undefined') {
                s = val.toFixed(postdec);
            }
            $(this).val(s);
        });
    }

    function isInputInRange(selector) {
        var back = true;
        $(selector).each(function() {
            var min = parseFloat($(this).attr("min"));
            var max = parseFloat($(this).attr("max"));
            var val = parseFloat($(this).val());
            if(!isNaN(min) && val < min) back = false;
            if(!isNaN(max) &&val > max) back = false;
        });
        return back;
    }

    return {
        fixNumberInputRange: fixNumberInputRange,
        isInputInRange: isInputInRange
    }
})();
var TimeHelper = (function() {

    var DE = 1,
        US = 2,
        JP = 3;

    var TYPE_DATE = 0,
        TYPE_TIME = 1,
        TYPE_DATETIME = 2,
        TYPE_TIME_NO_SEC = 3,
        TYPE_DATETIME_NO_SEC = 4;

    var timeformat = US,
        utczoneoffset = 0,
        dsttable = [];

    function init() {
        return RCP.readRCP(0x01E9, 'T_OCTET').then(function(res) {
            timeformat = res.value;
            return RCP.readRCP(0x031f, 'T_INT')
        }).then(function(res) {
            utczoneoffset = res.value;
            return RCP.readCommand(RCPCommands.CONF_DAY_LIGHT_SAVE_TIME_TABLE);
        }).then(function(res) {
            dsttable = res.parsed;
            return;
        });
    }

    function getFormatString(type) {
        var fs = '';
        if(type == TYPE_DATE) {
            if(timeformat == DE) fs = 'DD[.]MM[.]YYYY';
            else if(timeformat == JP) fs = 'YYYY[/]MM[/]DD';
            else fs = 'MM[/]DD[/]YYYY';
        } else if(type == TYPE_TIME_NO_SEC) {
            fs = 'HH:mm';
        } else if(type == TYPE_TIME) {
            fs = 'HH:mm:ss';
        } else if(type == TYPE_DATETIME_NO_SEC) {
            if(timeformat == DE) fs = 'DD[.]MM[.]YYYY HH:mm';
            else if(timeformat == JP) fs = 'YYYY[/]MM[/]DD HH:mm';
            else fs = 'MM[/]DD[/]YYYY HH:mm';
        } else {
            if(timeformat == DE) fs = 'DD[.]MM[.]YYYY HH:mm:ss';
            else if(timeformat == JP) fs = 'YYYY[/]MM[/]DD HH:mm:ss';
            else fs = 'MM[/]DD[/]YYYY HH:mm:ss';
        }
        return fs;
    }

    function getTimezoneOffset(ss2000) {
        var dstoffset = 0;
        for(var i=0; i<dsttable.length; i++) {
            if(dsttable[i].ss2000 <= ss2000) {
                dstoffset = dsttable[i].offset;
                //console.log("offset changed to "+dstoffset+" (ss2000: "+ss2000+")");
            }
        }
        return dstoffset;
    }

    function ss2000ToString(ss2000, format, isUTC) {
        var d = ss2000ToMoment(ss2000, isUTC);
        return d.format(getFormatString(format));
    }

    function ss2000ToDateTimeString(ss2000, isUTC, noseconds) {
        if(noseconds) {
            return ss2000ToString(ss2000, TYPE_DATETIME_NO_SEC, isUTC)
        } else {
            return ss2000ToString(ss2000, TYPE_DATETIME, isUTC)
        }
    }

    function ss2000ToTimeString(ss2000, isUTC, noseconds) {
        if(noseconds) {
            return ss2000ToString(ss2000, TYPE_TIME_NO_SEC, isUTC)
        } else {
            return ss2000ToString(ss2000, TYPE_TIME, isUTC)
        }
    }

    function ss2000ToDateString(ss2000, isUTC) {
        return ss2000ToString(ss2000, TYPE_DATE, isUTC)
    }

    function ss2000ToMoment(ss2000, isUTC) {
        var d = null;
        if(isUTC) {
            d = moment.utc([2000, 0, 1, 0, 0, 0]).add(ss2000, 'seconds');
            //switch to local time
            d.local();
        } else {
            var offset = getTimezoneOffset(ss2000-utczoneoffset);
            // console.log("offset: ", offset);
            d = moment([2000, 0, 1, 0, 0, 0]).add(ss2000 - offset, 'seconds');
        }
        return d;
    }

    function dateToTimeString(d) {
        return moment(d).format(getFormatString(TYPE_TIME));
    }

    function dateToDateString(d) {
        return moment(d).format(getFormatString(TYPE_DATE));
    }

    function dateToDateTimeString(d) {
        return moment(d).format(getFormatString(TYPE_DATETIME));
    }

    function getCurrentSS2000() {
        return moment().diff(moment([2000, 0, 1, 0, 0, 0]), "seconds");
    }

    //565353930 == 30.11.2017 10:45:30

    return {
        init: init,
        ss2000ToDateTimeString: ss2000ToDateTimeString,
        ss2000ToDateString: ss2000ToDateString,
        ss2000ToTimeString: ss2000ToTimeString,
        dateToTimeString: dateToTimeString,
        dateToDateString: dateToDateString,
        dateToDateTimeString: dateToDateTimeString,
        ss2000ToMoment:ss2000ToMoment
    }
})();
var ValueFormatter = (function() {

    function percent(val)  {
        return GUITranslator.getMessage('var_percent').replace(/%s/, val);
    }

    return {
        percent: percent
    }

})();
var ControlFactory = (function() {

    function createCheckboxes(selector, cfg) {
        selector = selector || "";
        $(selector + ' input[type="checkbox"]').not('.converted').each(function (idx, obj) {
            var wrapper = $('<label>').addClass('cbwrapper').insertAfter($(this));
            $(this).addClass('converted').appendTo(wrapper);
            $('<span>').addClass('checkmark').insertAfter($(this));
        });
    }

    function createRadioButtons(selector, cfg) {
        selector = selector || "";
        $(selector + ' input[type="radio"]').not('.converted').each(function (idx, obj) {
            if(!$(this).parent().hasClass('rb-tabs')) {
                var wrapper = $('<label>').addClass('rbwrapper').insertAfter($(this));
                $(this).addClass('converted').appendTo(wrapper);
                $('<span>').addClass('checkmark').insertAfter($(this));
            }
        });
    }

    function createAll(selector, cfg) {
        createCheckboxes(selector, cfg);
        createRadioButtons(selector, cfg);
    }

    return {
        createCheckboxes: createCheckboxes,
        createRadioButtons: createRadioButtons,
        createAll: createAll
    }

})();

var ColorHelper = {
    /*
     * converts { red: 255, green: 255, blue: 255 } to #FFFFFF
     */
    stringToObject: function(s) {
        var o = { red: 0, green: 0, blue: 0 };
        if (s.match(/^#[\dabcdef]{6}$/i)) {
            o.red = parseInt(s.slice(1,3), 16);
            o.green = parseInt(s.slice(3,5), 16);
            o.blue = parseInt(s.slice(5,7), 16);
        } else {
            console.log('can not convert string ' + s + ' to color object')
        }
        return o;
    },
    /*
     * converts { red: 255, green: 255, blue: 255 } to #FFFFFF
     */
    objectToString: function(o) {
        return '#' + $.byteutils.intarray2bytestring([o.red, o.green, o.blue], '');
    }
};

var IlluminatorHelper = (function() {
    var TYPES = {
        UNKNOWN: 0,
        NONE: 1,    //no lights
        IR_ONLY: 2, //ir light
        VL_ONLY: 3, //visible light (white light)
        IR_AND_VL: 4,  //visible and ir light
        LIGHTHOUSE: 5  //ILx300 illuminator (lighthouse, white light and ir light)
    };

    var m_light_type = TYPES.UNKNOWN;

    function checkLights() {
        var def = jQuery.Deferred();
        RCP.readBicom(0x04, 0x412).done(function(res) {
            m_light_type = res.value;
            def.resolve(res.value);
        }).fail(function() {
            m_light_type = TYPES.UNKNOWN;
            def.resolve(TYPES.UNKNOWN);
        });
        return def.promise();
    }

    function getLightType() {
        return m_light_type
    }

    function hasWhiteLight() {
        return m_light_type === TYPES.VL_ONLY || m_light_type === TYPES.IR_AND_VL || m_light_type === TYPES.LIGHTHOUSE;
    }

    function hasIRLight() {
        return m_light_type === TYPES.IR_ONLY || m_light_type === TYPES.IR_AND_VL || m_light_type === TYPES.LIGHTHOUSE;
    }

    function isLighthouse() {
        return m_light_type === TYPES.LIGHTHOUSE;
    }

    return {
        TYPES: TYPES,
        checkLights: checkLights,
        getLightType: getLightType,
        hasWhiteLight: hasWhiteLight,
        hasIRLight: hasIRLight,
        isLighthouse: isLighthouse
    }
})();

var UserAppsMgr = (function($) {

    var logger = log.getLogger('SETTINGS'),
        allClients = [],
        clientList = [];

    function createStructure(allClients, clientsInUse, filter) {
        var back = [];
        var regex = new RegExp(filter || ".*");
        for(var i=0; i<allClients.length; i++) {
            if(regex.exec(allClients[i].name)) {
                var o = {
                    key: allClients[i].name,
                    name: allClients[i].name.replace(/^.*\./, ""),
                    usedFor: []
                };
                //check usage
                for(var j=0; j<clientsInUse.length; j++) {
                    if(allClients[i].name == clientsInUse[j].name) {
                        o.usedFor.push({
                            line: clientsInUse[j].line,
                            inst: clientsInUse[j].inst /* 0 based! */
                        });
                    }
                }
                back.push(o);
            }
        }
        return back;
    }

    function writeUserApp(line, inst, key) {
        var def = $.Deferred();
        logger.info("writing app for line ", line, ", inst ", inst, ": ", key);
        var num = (0xFF & line) | (0xFF & inst) << 8;
        var data = {line:line, inst:inst, name:key};
        RCP.writeCommand(RCPCommands.CONF_EXTERNAL_CLIENTS, data, {rcpnum: num}).done(function(res) {
            var clientsInUse = res.parsed;
            clientList = createStructure(allClients, clientsInUse);
            def.resolve(clientList);
        });
        return def.promise();

    }

    function readUserApps(filter) {
        var def = $.Deferred(),
            clientsInUse = [];
        RCP.readCommand(RCPCommands.CONF_EXTERNAL_CLIENTS_LIST).done(function(res) {
            allClients = res.parsed;
            logger.info("clients list: ", allClients);
        }).always(function() {
            RCP.readCommand(RCPCommands.CONF_EXTERNAL_CLIENTS, {rcpnum: 0xFFFF}).done(function (res) {
                clientsInUse = res.parsed;
                logger.info("used clients: ", clientsInUse);
            }).always(function() {
                clientList = createStructure(allClients, clientsInUse, filter);
                def.resolve(clientList);
            });
        });
        return def.promise();
    }

    return {
        readUserApps: readUserApps,
        writeUserApp: writeUserApp
    }

})(jQuery);

var BootstateHelper = (function() {

    /**
     * Usage:
     *
     * BootstateHelper.startPolling().progress(function(progress) {
     *     // handle progress here
     * }).done(function() {
     *     // handle 100% state here
     * })
     */

    var m_curstate = null,
        m_deferred = null,
        m_timeout = 3000;

    function readBootstateRecursive() {
        RCP.readRCP(0x09e3, 'T_DWORD').done(function(res) {
            if (res.value < 100) {
                if (res.value != m_curstate) {
                    m_deferred.notify({bootstate: res.value, error: null});
                }
                m_curstate = res.value;
                window.setTimeout(readBootstateRecursive, m_timeout);
            } else {
                m_curstate = res.value;
                m_deferred.resolve(m_curstate);
            }
        }).fail(function(e) {
            m_deferred.notify({bootstate: 0, error: e});
            window.setTimeout(readBootstateRecursive, m_timeout);
        })
    }

    function startPolling() {
        m_curstate = null;
        m_deferred = jQuery.Deferred();
        readBootstateRecursive();
        return m_deferred.promise();
    }

    return {
        startPolling: startPolling
    }
})();

var UIConfig = (function($) {

    var ITEMS = {
        SHOW_ALARM_IN: { default: 1, key: 'AL' },
        SHOW_ALARM_OUT: { default: 1, key: 'RL' },
        AUTOLOGOUT_TIME: { default: 0, key: 'LOGOUT' },
        ALLOW_SNAPSHOTS: { default: 1, key: 'SNAP' },
        ALLOW_RECORDING: { default: 1, key: 'REC' },
        SHOW_AUTOTRACKER: { default: 1, key: 'AT' },
        SHOW_SPECIALFUNCTIONS: { default: 1, key: 'SF' },
        SHOW_SCENES: { default: 1, key: 'SCENES' },
        SHOW_DASHBOARD: { default: 1, key: 'DASHBOARD' },
    }

    var m_current_config = {};

    function extendCfg(data) {
        data = data || {};
        for (var itemkey in ITEMS) {
            if (typeof (data[itemkey.key]) == 'undefined') {
                data[ITEMS[itemkey].key] = ITEMS[itemkey].default;
            }
        }
        return data;
    }

    function save() {
        var def = jQuery.Deferred();
        RCP.writeCommand(RCPCommands.CONF_DYNAMIC_HTML_NAME, 'uiconfig.json', { rcpnum: 3 }).done(function() {
            RCP.writeCommand(RCPCommands.CONF_DYNAMIC_HTML_DATA, DataHelper.charsToNbrArray(JSON.stringify(m_current_config)), { rcpnum: 3 }).done(function() {
                def.resolve();
            }).fail(function(res) {
                def.reject(res);
            });
        }).fail(function(res) {
            def.reject(res);
        });
        return def.promise();
    }

    function load() {
        var def = jQuery.Deferred();
        $.getJSON('uiconfig.json').done(function(data) {
            console.log('read: ', data);
            m_current_config = extendCfg(data);
        }).fail(function(res) {
            console.log('failed')
            m_current_config = extendCfg({});
        }).always(function() {
            def.resolve(m_current_config);
        });
        return def.promise();
    }

    function getValue(item) {
        if (typeof m_current_config[item.key] === "undefined") {
            throw "UIConfig - unknown property: " + item.key;
        }
        return m_current_config[item.key];
    }

    function setValue(item, value) {
        return m_current_config[item.key] = value;
    }

    return {
        ITEMS: ITEMS,
        load: load,
        save: save,
        getValue: getValue,
        setValue: setValue
    }
})(jQuery);

var Debouncer = function(timeout, functionToCall) {
	var m_timeout = timeout,
		m_timeouthandle = null;

	this.trigger = function() {
		this.cancel();
		m_timeouthandle = window.setTimeout(functionToCall, m_timeout);
	};

	this.cancel = function() {
        window.clearTimeout(m_timeouthandle);
	};

};

var ScriptLoader = (function() {

    function getScript(filename, cfg) {
        cfg = cfg || {};
        var ajaxcfg = {
            dataType: "script",
            cache: cfg.cache || false,
            url: filename
        };
        if (typeof (hashes) === 'undefined') {
            console.log('file hashes not included');
        } else {
            var hash = cfg.hash ? cfg.hash : hashes[filename];
            if (hash) {
                ajaxcfg.scriptAttrs = {
                    hash: hash
                }
            } else {
                console.log('no hash for file ' + filename);
            }
        }
        return $.ajax(ajaxcfg);
    }

    return {
        getScript: getScript
    }
})();

var UploadHelper = (function() {

    var m_errormap = new Map();
    [
        [1, 'header error'],
        [2, 'write error'],
        [3, 'read back error'],
        [4, 'verify error'],
        [5, "checksum mismatch (read back flash content vs. written data)"],
        [6, "checksum mismatch (announced in header vs. received data)"],
        [10, "magic error"],
        [11, "version too low"],
        [12, "flash type incompatible"],
        [13, "device check failed"],
        [14, "file entry marker failed"],
        [15, "chunk size error"],
        [16, "area already written"],
        [17, "black white list check"],
        [18, "wrong or no signature"],
        [19, "signature invalid"],
        [30, "invalid file name"],
        [31, "ROM init error"],
        [32, "ROM write error"],
        [33, "ROM close error"],
        [34, "socket error"],
        [35, "overflow error"],
        [36, "final flush error"],
        [37, "file format error"],
        [38, "logo size error"],
        [39, "logo compression error"],
        [40, "logo color error"],
        [41, "certificate/key already exists"],
        [42, "certificate/key format error"],
        [43, "no matching certificate"],
        [44, "no free key entry"],
        [45, "no certificate storage space"],
        [46, "device not fully booted"],
        [47, "password required for this upload"],
        [48, "no memory to store the file"],
        [49, "file is to large for that type of upload"]
    ].forEach(function(val) {
        m_errormap.set(val[0], val[1]);
    });

    var m_tmp_msg_reader = null;

    function getUploadError(code) {
        code = code || 0;
        var o = {
            code: code,
            short: m_errormap.get(code)
        };
        o.short_with_code = o.short
            ?  o.short + ' (error ' + o.code + ')'
            : 'error ' + code.toString(10);
        o.short = o.short || o.short_with_code;
        o.translated = GUITranslator.getMessage("uploaderror_"+code, o.short_with_code).replace(/%e/, code.toString(10));
        return o;
    }

    function initUploadField(selector) {
        var $e = $(selector);
        $e.find('input[type=file]').on('change', function() {
            var filename = $(this).val().replace(/.*[\/\\]/, "");
            var id = $(this).attr("id");
            $("#"+id+"_filename").text(filename);
        });
    }

    function startUpload(selector, create_msg_reader) {
        var def = jQuery.Deferred();
        destroyMessageReader();
        if (create_msg_reader) {
            m_tmp_msg_reader = new MessageReader(1000);
            m_tmp_msg_reader.add('0x0701', function(xml) {
                var progress = parseInt(xml.hex, 16);
                if (progress >= 100) {
                    destroyMessageReader();
                    if (progress > 100) {
                        var e = UploadHelper.getUploadError(progress - 100);
                        def.reject(e);
                    } else {
                        def.resolve();
                    }
                } else {
                    def.notify(progress);
                }
            });
            m_tmp_msg_reader.start();
        }
        $e = $(selector);
        if ($e.length > 0) {
            if ($e[0].tagName !== "FORM") {
                $e = $e.find('form');
            }
        }
        if ($e.length > 0) {
            try {
                $e.get(0).submit();
            } catch (e) {
                destroyMessageReader();
                def.reject(e);
            }
        } else {
            def.reject('element not found');
        }
        return def.promise();
    }

    function destroyMessageReader() {
        if (m_tmp_msg_reader) {
            m_tmp_msg_reader.stop();
            m_tmp_msg_reader = null;
        }
    }

    return {
        getUploadError: getUploadError,
        initUploadField: initUploadField,
        startUpload: startUpload
    }
})();

var ListBox = function(selector, params) {

    var $box,
        params = params || {},
        callbacks = {
            change: function() {}
        };

    var multi = params.multiselect === true;

    function initBox() {
        that = this;
        $box = $(selector);
        $box.append('<ul>');
        $box.addClass('listbox unselectable');
        $box.on('click', '.listitem', function(evt) {
            if(!multi) {
                deselectAll();
            }
            if(!evt.ctrlKey && !evt.shiftKey) {
                deselectAll();
            }
            if(evt.shiftKey && multi) {
                //deselect all except lastclick
                $box.find('.selected:not(.lastclick)').removeClass('selected');
                //select from last click to current
                var mark = false
                var items = $box.find('.listitem');
                for(var i=0; i<items.length; i++) {
                    if(items[i] == this || $(items[i]).hasClass('lastclick')) {
                        mark = !mark;
                    }
                    if(mark) {
                        $(items[i]).addClass('selected');
                    }
                }
                //mark the clicked
                $(this).addClass('selected');
            } else {
                $box.find('.listitem').removeClass('lastclick');
                $(this).toggleClass('selected');
                if($(this).hasClass('selected')) $(this).addClass('lastclick');
            }
            callbacks.change(getSelectedValues());
        });
    }

    function on(eventname, handler) {
        if(callbacks[eventname]) {
            callbacks[eventname] = handler;
        }
        return this;
    }

    function trigger(eventname) {
        if(callbacks[eventname]) {
            callbacks[eventname](getSelectedValues());
        }
        return this;
    }

    function addItem(text, value) {
        $('<li>')
            .addClass('listitem')
            .attr('data-value', value)
            .text(text)
            .appendTo($box.find('ul'));
        return this;
    }

    function deleteItem() {
        $box.find('.listitem.selected').remove();
        return this;
    }

    function clear() {
        $box.find('.listitem').remove();
        return this;
    }

    function moveUp() {
        var items = $box.find('.selected');
        items.each(function() {
            var prev = $(this).prev('.listitem:not(.selected)');
            if(prev.length > 0) {
                $(this).insertBefore(prev);
            }
        });
        return this;
    }

    function moveDown() {
        var items = $box.find('.selected');
        items.reverse().each(function() {
            var next = $(this).next('.listitem:not(.selected)');
            if(next.length > 0) {
                $(this).insertAfter(next);
            }
        });
        return this;
    }

    function getSelectedValues() {
        var a = [];
        $box.find('.listitem.selected').each(function() {
            a.push($(this).data('value'));
        });
        return a;
    }

    function getAllValues() {
        var a = [];
        $box.find('.listitem').each(function() {
            a.push($(this).data('value'));
        });
        return a;
    }

    function selectValues(values) {
        if(multi) {
            values = values || [];
            for (var i = 0; i < values.length; i++) {
                $box.find('.listitem').each(function () {
                    if ($(this).data('value') == values[i]) {
                        $(this).addClass('selected');
                    }
                });
            }
        }
        return this;
    }

    function selectValue(value) {
        if(!multi) {
            deselectAll();
        }
        $box.find('.listitem').each(function() {
            if($(this).data('value') == value) {
                $(this).addClass('selected');
            }
        });
        return this;
    }

    function deselectAll() {
        $box.find('.selected').removeClass('selected lastclick');
        return this;
    }

    initBox();

    return {
        addItem: addItem,
        deleteItem: deleteItem,
        clear: clear,
        getSelectedValues: getSelectedValues,
        getAllValues: getAllValues,
        moveUp: moveUp,
        moveDown: moveDown,
        selectValues: selectValues,
        selectValue: selectValue,
        deselectAll: deselectAll,
        trigger: trigger,
        on: on
    }
};

var ConnectionStateMgr = function() {

    var states = {};

    function isEqual(state1, state2) {
        if((state1 && !state2) || (!state1 && state2)) {
            return false;
        } else if((state1.videoid != state2.videoid) ||
            (state1.line != state2.line) ||
            (state1.stream != state2.stream) ||
            (state1.established != state2.established) ||
            (state1.sessionid != state2.sessionid) ||
            (state1.videotype != state2.videotype)) {
            return false;
        }
        return true;
    }

    function triggerChangeEvent(state) {
        $(window).trigger('ConnectionStateChanged', state);
    }

    function getCurrentState(videoid) {
        return states[videoid];
    }

    function stateChanged(videoid, line, stream, established, sessionid, videotype) {
        var newstate = {
            videoid: videoid,
            line: line,
            stream: stream,
            established: established,
            sessionid: sessionid,
            videotype: videotype
        };
        var curstate = states[videoid];
        if(!isEqual(curstate, newstate)) {
            triggerChangeEvent(newstate);
        }
        states[videoid] = newstate;
    }

    return {
        stateChanged: stateChanged,
        getCurrentState: getCurrentState
    }
}();

var AutoLogout = function() {

    var timeoutInSec = 5 * 60,
        alertDurationInSec = 30,
        handle = 0,
        logger = log.getLogger('LIVEPAGE');

    function start(cfg) {
        cfg = cfg || {};
        if(typeof cfg.timeoutInSec != "undefined") timeoutInSec = cfg.timeoutInSec;
        if(typeof cfg.alertDurationInSec != "undefined") alertDurationInSec = cfg.alertDurationInSec;
        handle = window.setTimeout(showWarning, (timeoutInSec - alertDurationInSec) * 1000);
        addActivityListener();
        logger.info("[AutoLogout] autologout started (timeout: " + timeoutInSec + " sec, handle: " + handle + ")");
    }

    function stop() {
        window.clearTimeout(handle);
        removeActivityListener();
        logger.info("[AutoLogout] autologout stopped (handle: " + handle + ")");
    }

    function retrigger() {
        window.clearTimeout(handle);
        handle = window.setTimeout(showWarning, (timeoutInSec - alertDurationInSec) * 1000);
        // logger.info("[AutoLogout] autologout retriggered (timeout: " + timeoutInSec + " sec, handle: " + handle + ")");
    }

    function showWarning() {
        AlertBox.showWarning({
            title: getMessage("alert_title_warn"),
            message: getMessage("autologout_warning"),
            ok_button: {
                text: getMessage("autologout_warning_btn"),
                callback: function() {
                    retrigger();
                }
            }
        });
        window.clearTimeout(handle);
        handle = window.setTimeout(logout, alertDurationInSec * 1000);
    }

    function logout() {
        logger.info("[AutoLogout] logout");
        removeActivityListener();
        document.location.href = "logout.htm";
    }

    function addActivityListener() {
        $('body').on('mousemove.autologout', function() {
            if(!$('html').hasClass('dlg-open')) {
                retrigger();
            }
        });
    }

    function removeActivityListener() {
        $('body').off('mousemove.autologout');
    }


    return {
        start: start,
        stop: stop,
        retrigger: retrigger
    }
}();

var StartStopHelper = function() {

    var m_state = 'idle';
    var m_timeout = 5000;
    var m_to_handle = 0;
    var m_line = 0;
    var m_config = 0;
    var m_log = LogFactory.getLogger('StartStopHelper');

    function start(line, config) {
        if (isRunning() && m_line == line && m_config == config) {
            m_log("already running");
            return jQuery.Deferred().resolve();
        } else {
            return restart(line, config);
        }
    }

    function stop(asBeacon) {
        window.clearTimeout(m_to_handle);
        if (!isIdle()) {
            sendStop(m_line, m_config, asBeacon);
        }
    }

    function restart(line, config) {
        var def = jQuery.Deferred();
        m_log("restarting (line: " + line + ", config: " + config + ")...");
        if (isIdle()) {
            sendStart(line, config).done(function() {
                def.resolve();
            }).fail(function(res) {
                def.reject(res);
            })
        } else if (isRunning()) {
            window.clearTimeout(m_to_handle);
            sendStop(m_line, m_config).done(function() {
                sendStart(line, config).done(function() {
                    def.resolve();
                }).fail(function(res) {
                    def.reject(res);
                })
            }).fail(function(res) {
                def.reject(res);
            });
        } else {
            // something is in progress
            log('unknown current state: ' + m_state);
            def.reject('unknown state: ' + m_state);
        }
        return def.promise();
    }

    function sendStart(line, config) {
        m_log("send start (line: " + line + ", config: " + config + ")...");
        return RCP.writeRCP(0x0a38, 'T_DWORD', config, {rcpnum: line}).done(function (res) {
            m_state = 'running';
            m_line = line;
            m_config = config;
            m_to_handle = window.setTimeout(sendContinue, m_timeout);
            m_log("started: %o", res.value);
        }).fail(function(res) {
            m_state = 'idle';
            m_log("start failed ", res);
        });
    }

    function sendContinue() {
        m_log("send continue (line: " + m_line + ", config: " + m_config + ")...");
        return RCP.writeRCP(0x0a3a, 'T_DWORD', m_config, {rcpnum: m_line}).done(function (res) {
            m_log("continued: %o", res.value);
            m_to_handle = window.setTimeout(sendContinue, m_timeout);
        }).fail(function(res) {
            m_log("continue failed ", res);
        });
    }

    function sendStop(line, config, asBeacon) {
        asBeacon = asBeacon || false;
        m_log("send stop (line: " + line + ", config: " + config + ", asBeacon: " + asBeacon +")...");
        var rcpcfg = {rcpnum:line};
        if (asBeacon) rcpcfg.asBeacon = true;
        return RCP.writeRCP(0x0a39, 'T_DWORD', config, rcpcfg).done(function (res) {
            m_state = 'idle';
            m_log("stopped: %o", res.value);
        }).fail(function(res) {
            m_log("stop failed ", res);
            m_state = 'idle';
        });
    }

    function isRunning() {
        return m_state === 'running';
    }

    function isIdle() {
        return m_state === 'idle';
    }

    function callDelayed(fkt, timeout) {
        m_to_handle = window.setTimeout(fkt, timeout);
    }

    return {
        start: start,
        stop: stop,
        restart: restart,
        callDelayed: callDelayed
    }
};

var UrlHelper = function() {

    function getCurrentUrlData() {
        var data = {};
        data.protocol = document.location.protocol.replace(/:/g, '');
        data.isHttps = data.protocol == "https";
        data.port = parseInt(document.location.port, 10)|| (data.isHttps ? 443 : 80);
        data.hostname = document.location.hostname;
        data.path = document.location.pathname.replace(/\/[^\/]*$/, "").replace(/^\//, "");
        data.file = document.location.pathname.replace(/^.*\//, "");
        data.ipV4 = isValidIPV4(data.hostname) ? data.hostname : null;
        data.ipV6 = isValidIPV6(data.hostname) ? data.hostname : null;
        return data;
    }

    function getAbsUrlToFile(cnf) {
    	var curUrlData = getCurrentUrlData();
		var proto = cnf.protocol || curUrlData.protocol;
		var hostname = cnf.hostname || curUrlData.hostname;
		var port = cnf.port || curUrlData.port;
		var path = cnf.path || curUrlData.path;
		var file = cnf.file || curUrlData.file;
		var back =  proto + "://" + hostname;
		if (port) back += ":" + port;
		back += "/";
		if (path) back += path + "/";
		if (file) back += file;
		return back;
	}

    return {
        getCurrentUrlData: getCurrentUrlData,
        getAbsUrlToFile: getAbsUrlToFile
    }

}();

/***************************************************************************
 /* Bootstrap Helper
 /**************************************************************************/
function getBootstrapGridSize() {
    var width = $(window).width();

    if(width < 576) {
        return 'xs';
    } else if (width >= 576 && width < 768) {
        return 'sm';
    } else if (width >= 768 && width < 992) {
        return 'md';
    } else if (width >= 992 && width < 1200) {
        return 'lg';
    } else {
        return 'xl';
    }
}
/***************************************************************************
 /* Material Design Helper
 /**************************************************************************/
var MaterialHelper = ( function() {

    function initControls() {
        $('.md-textfield input').on('focus', function() {
            $(this).parent().find('.md-label').addClass('md-label-above')
        }).on('blur', function() {
            if ($(this).val() == '') {
                $(this).parent().find('.md-label').removeClass('md-label-above')
            }
        })
    }

    return {
        initControls: initControls
    }
})();
