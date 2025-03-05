// JavaScript Document

var CN_JPEGSIZE = "JpegSize";
var CN_JPEGDELAY = "JpegDelay";
var CN_JPEGQUALITY = "JpegQuality";
var CN_RECPATH = "RecordingPath";
var CN_TRANSMITAUDIO = "ActiveAudio";
var CN_LEASETIME = "leasetime";
var CN_VIDEOINPUT = "VideoInput";
var CN_VIDEOSTREAM = "Instance";
var CN_VIDEOTYPE = "VidType";
var CN_USECURRENTVSDK = "CurVSDK";

//multi purpose cookie
var CN_MP_BVIPINSTALLPOPUP = "bvi";
var CN_MP_FWUPDATEPOPUP = "fwu";
var CN_MP_MOB_LPVIDEO = "lpv";
var CN_MP_LP_IFRAMESONLY = "ifo";
var CN_MP_REP_TRANSCODER = "trco";
var CN_MP_VIP = "vip";

var VAL_VIDEOTYPE_MP4 = "MPEG4";
var VAL_VIDEOTYPE_JPG = "MJPEG";
var VAL_VIDEOTYPE_HTTP = "HTTP";
var VAL_VIDEOTYPE_RTSP = "RTSP";

var VAL_JPEG_LARGE = "large";
var VAL_JPEG_MEDIUM = "medium";
var VAL_JPEG_SMALL = "small";
var VAL_JPEG_720 = "720";
var VAL_JPEG_1080 = "1080";
var VAL_JPEG_5MP = "5MP";
var VAL_JPEG_MAX = "MAX";
var VAL_JPEG_FROM_ENC = "encoder";


function cs_readNamedCookie(name) {
	var back = "";
	switch (name) {
		case CN_JPEGSIZE:
			back = VAL_JPEG_FROM_ENC;
			var size = cs_readCookie(CN_JPEGSIZE, VAL_JPEG_FROM_ENC);
			if(size==VAL_JPEG_SMALL || size==VAL_JPEG_MEDIUM || size==VAL_JPEG_LARGE || size==VAL_JPEG_720 || size==VAL_JPEG_1080 || size==VAL_JPEG_5MP || size==VAL_JPEG_MAX || size==VAL_JPEG_FROM_ENC) back = size;
			break;
		case CN_JPEGDELAY:
			var delay = cs_readCookie(CN_JPEGDELAY, "0");
			back = parseInt(delay, 10);
			break;
		case CN_JPEGQUALITY:
			var quality = cs_readCookie(CN_JPEGQUALITY, "4");
			back = parseInt(quality, 10);
			break;
		case CN_RECPATH:
			back = cs_readCookie(CN_RECPATH, "");
			break;
		case CN_TRANSMITAUDIO:
			var val = cs_readCookie(CN_TRANSMITAUDIO, "false");
			if(val=="true") back = true;
			else back = false;
			break;
		case CN_LEASETIME:
			var leasetime = cs_readCookie(CN_LEASETIME, "0");
			back = parseInt(leasetime, 10);
			break;
		case CN_VIDEOINPUT:
			var input = cs_readCookie(CN_VIDEOINPUT, "1");
			back = parseInt(input, 10);
			break;
		case CN_VIDEOSTREAM:
			var stream = cs_readCookie(CN_VIDEOSTREAM, "1");
			back = parseInt(stream, 10);
			break;
		case CN_VIDEOTYPE:
			back = cs_readCookie(CN_VIDEOTYPE, VAL_VIDEOTYPE_MP4);
			break;
		case CN_USECURRENTVSDK:
			var val = cs_readCookie(CN_USECURRENTVSDK, "false");
			if(val=="true") back = true;
			else back = false;
			break;
		default:
			break;
	}
	return back;
}

function cs_writeNamedCookie(name, value) {
	var back = "";
	switch (name) {
		case CN_JPEGSIZE:
			var val = VAL_JPEG_SMALL;
			if(value==VAL_JPEG_SMALL || value==VAL_JPEG_MEDIUM || value==VAL_JPEG_LARGE || value==VAL_JPEG_720 || value==VAL_JPEG_1080 || value==VAL_JPEG_5MP || value==VAL_JPEG_MAX || value==VAL_JPEG_FROM_ENC) val = value;
			cs_writeCookie(CN_JPEGSIZE, val, null);
			back = val;
			break;
		case CN_JPEGDELAY:
			cs_writeCookie(CN_JPEGDELAY, value, null);
			back = value;
			break;
		case CN_JPEGQUALITY:
			var val = parseInt(value, 10);
			if(val>99) val = 99;
			else if(val<1) val = 1;
			cs_writeCookie(CN_JPEGQUALITY, val, null);
			back = val;
			break;
		case CN_RECPATH:
			cs_writeCookie(CN_RECPATH, value, null);
			back = value;
			break;
		case CN_TRANSMITAUDIO:
			var val = "true";
			if(value==false || value=="false") val = "false";
			cs_writeCookie(CN_TRANSMITAUDIO, val, null);
			back = (val=="true");
			break;
		case CN_LEASETIME:
			var val = parseInt(value, 10);
			cs_writeCookie(CN_LEASETIME, val, null);
			back = val;
			break;
		case CN_VIDEOINPUT:
			var val = parseInt(value, 10);
			cs_writeCookie(CN_VIDEOINPUT, val, null);
			back = val;
			break;
		case CN_VIDEOSTREAM:
			var val = parseInt(value, 10);
			cs_writeCookie(CN_VIDEOSTREAM, val, null);
			back = val;
			break;
		case CN_VIDEOTYPE:
			cs_writeCookie(CN_VIDEOTYPE, value, null);
			back = value;
			break;
		case CN_USECURRENTVSDK:
			var val = "true";
			if(value==false || value=="false") val = "false";
			cs_writeTmpCookie(CN_USECURRENTVSDK, val);
			back = val;
			break;
		default:
			break;
	}
	return back;
}

function cs_writeMPCookie(name, val) {
	//pattern: §§name1§value1§§_§§name2§value2§§_...
	var s = cs_readCookie("mpc", "");
	s = eval("s.replace(/§§"+name+"§[^§]*§§/g, '')");
	s = s.replace(/_*$/, "");
	s = s + "_§§"+name+"§"+val+"§§";
	s = s.replace(/^_*/, "");
	cs_writeCookie("mpc", s, null);
}

function cs_readMPCookie(name, defaultvalue) {
	var s = cs_readCookie("mpc", "");
	if(s.match("§§"+name+"§[^§]*§§")) {
		s = eval("s.replace(/.*§§"+name+"§/, '')");
		s = eval("s.replace(/§.*$/, '')");
		return s;
	} else {
		return defaultvalue;
	}
}


/*****************************************************************/
/* Methods to write and read a cookie
/*****************************************************************/
function cs_writeTmpCookie(name, value) {
	document.cookie = name + "=" + escape(value);
}

function cs_writeCookie(name, value, hours) {
	var expire = "";
	if(hours==null) hours = 365*24*10;
	if(hours != null && hours != 0) {
		expire = new Date((new Date()).getTime() + hours * 3600000);
		expire = "; expires=" + expire.toGMTString();
	}
	document.cookie = name + "=" + escape(value) + expire;
}

function cs_readCookie(name, defaultvalue) {
	var cookieValue = "";
	if(typeof(defaultvalue)!="undefined") cookieValue = defaultvalue;
	var search = name + "=";
	if(document.cookie.length > 0) {
		offset = document.cookie.indexOf(search);
		if (offset != -1) {
			offset += search.length;
			end = document.cookie.indexOf(";", offset);
			if (end == -1) end = document.cookie.length;
			cookieValue = unescape(document.cookie.substring(offset, end))
		}
	}
	if(typeof(defaultvalue)=="Number" && isNaN(cookieValue)) cookieValue = defaultvalue;
	return cookieValue;
}

var CookieSupport = (function(undefined) {

    function parseCookies() {
        var map = {};
        if(document.cookie.length > 0) {
            var tokens = document.cookie.split(";");
            for (var i=0; i<tokens.length; i++) {
                var key = decodeURIComponent(tokens[i].substring(0, tokens[i].indexOf("=")));
                var val = decodeURIComponent(tokens[i].substring(tokens[i].indexOf("=") + 1, tokens[i].length));
                map[key.trim()] = val.trim();
            }
        }
        return map;
    }

    function getCookie(key, defaultvalue) {
        var map = parseCookies();
        var back = map[key];
        if(back == undefined) {
            if(defaultvalue != undefined) {
                back = defaultvalue;
            } else {
                back = null;
            }
        }
        return back;
    }

    return {
        getCookie: getCookie
    }

})();

