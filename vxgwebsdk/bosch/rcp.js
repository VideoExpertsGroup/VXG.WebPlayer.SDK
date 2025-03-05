var RCP = (function(RCP, $, undefined) {

	//error types
	var RCP_ERROR = 0;
	var BICOM_ERROR = 1;
	var NETWORK_ERROR = 2;
	var JSON_ERROR = 3;

    var BICOMSERVER = {
        DEVICE: 2,
        CAMERA: 4,
        PTZ: 6,
        CA: 8,
        IO: 10,
        VCA: 12
    }

    var AUTHLEVEL = {
        NOPROT: 0,
        USER: 1,
        SERVICE: 2,
        LIVE: 3,
        PRIVATE: 4,
        SETPWD: 5,
        ANY: 6
    }

	var rf_handle = 0, sf_handle = 0; //reading-finished, saving-finished handle

	var globalcallbacks = {
		readingfinished: null,
		savingfinished: null
	};

	var rcpdefaults = {
		type: "GET",
		rcpcmd: 0x0000,
		rcptype: "T_DWORD",
		rcpnum: 1,
		direction: "READ",
		payload: null,
		value:null,
    		value_formatted: null,
		callback: null,
		noglobalfinish: false,
		sessionid: null,
		ip: null,
		httpport: null,
		httpsport: null,
		remotedev: null,
		async: true,
        fullreply: false,
        onerror: null
	};

	var bicomdefaults = {
		rcpcmd: 0x09A5,
		rcptype: "P_OCTET",
		rcpnum: 1,
		direction: "WRITE",
		payload: null,
		bicomserver: 0x0002,
		bicomobjid: 0x0140,
		bicomtype: "NUMBER",
		bicomflags: 0x85,
		bicomaction: 0
	};

	var requestCounter = {
		read_sent: 0,
		write_sent: 0,
		read_received: 0,
		write_received: 0,

		requestSent: function(conf) {
			if(!conf.noglobalfinish) {
				if(isReadRequest(conf)) {
					this.read_sent++;
				} else {
					this.write_sent++;
				}
			}
		},
		replyReceived: function(conf) {
			if(!conf.noglobalfinish) {
				if(isReadRequest(conf)) {
					this.read_received++;
				} else {
					this.write_received++;
				}
			}
		}
	};

	var isReadRequest = function(conf) {
		if(conf.direction=="READ" || conf.bicomaction==0x01 || conf.bicomaction==0x0b) { //0x01: Get, 0x0B: GetMax
			return true;
		} else {
			return false;
		}
	};

	var isBicomConfig = function(conf) {
		var back = false;
		if(conf) {
			if(conf.bicomserver && conf.bicomobjid) back = true;
		}
		return back;
	};

	var getRCPUrl = function(conf) {
		var url = "";
		if(conf && conf.rcpurl) {
			url = conf.rcpurl;
		} else {
			var ip =  window.location.hostname;
			if(conf && conf.httpport) {
				url = "http://"+ip+":"+conf.httpport+ "/" ;
			} else if(conf && conf.httpsport) {
				url = "https://"+ip+":"+conf.httpsport+ "/";
			} else if(window.location.protocol=="file:") {
				url = "http://"+ip+"/";
			} else if(window.location.pathname.indexOf('configurationsite')>=0 ||
                      window.location.pathname.indexOf('configurationwizard')>=0) {
                //VRM
                var p = window.location.pathname;
                var cnt = p.replace(/.*configurationsite\/?/, '').replace(/.*configurationwizard\/?/, '').split('/').length;
                for(var i=0; i<cnt; i++) url += "../";
            }
			url += "rcp.xml";
		}
		return url;
	};

	var createErrorObject = function(type, code, msg) {
		var error = new Object();
		error.type = type;
		if(typeof(code)=="string") code = parseInt(code, 16);
		if(!isNaN(code)) error.code = code;
		if(msg==null) {
			if(type==RCP_ERROR || type==BICOM_ERROR) {
				error.msg = getErrorMessage(error);
			} else if(type==JSON_ERROR) {
				error.msg = "JSON ERROR";
			}
		} else {
			error.msg = msg;
		}
		return error;
	};

	var getErrorMessage = function(error) {
		var back = "";
		if(error.type==RCP_ERROR) {
			if(error.code==0xff) back = "RCP_ERROR_UNKNOWN";
			else if(error.code==0x10) back = "RCP_ERROR_INVALID_VERSION";
			else if(error.code==0x20) back = "RCP_ERROR_NOT_REGISTERED";
			else if(error.code==0x21) back = "RCP_ERROR_INVALID_CLIENT_ID";
			else if(error.code==0x30) back = "RCP_ERROR_INVALID_METHOD";
			else if(error.code==0x40) back = "RCP_ERROR_INVALID_CMD";
			else if(error.code==0x50) back = "RCP_ERROR_INVALID_ACCESS_TYPE";
			else if(error.code==0x60) back = "RCP_ERROR_INVALID_DATA_TYPE";
			else if(error.code==0x70) back = "RCP_ERROR_WRITE_ERROR";
			else if(error.code==0x80) back = "RCP_ERROR_PACKET_SIZE";
			else if(error.code==0x90) back = "RCP_ERROR_READ_NOT_SUPPORTED";
			else if(error.code==0xa0) back = "RCP_ERROR_INVALID_AUTH_LEVEL";
			else if(error.code==0xb0) back = "RCP_ERROR_INVAILD_SESSION_ID";
			else if(error.code==0xc0) back = "RCP_ERROR_TRY_LATER";
			else if(error.code==0xd0) back = "RCP_ERROR_TIMEOUT";
			else if(error.code==0xe0) back = "RCP_ERROR_NO_LICENCE";
			else if(error.code==0xf0) back = "RCP_ERROR_COMMAND_SPECIFIC";
			else if(error.code==0xf1) back = "RCP_ERROR_ADDRESS_FORMAT";
			else if(error.code==0xf2) back = "RCP_ERROR_NOT_SUPPORTED_ON_THIS_PLATFORM";
			else back = "RCP-ERROR "+error.code;
		} else if(error.type==BICOM_ERROR) {
			if(error.code==0x0001) back = "BICOM_ERROR_ILLEGAL_OBJECT_ID";
			else if(error.code==0x0002) back = "BICOM_ERROR_ILLEGAL_MEMBER_ID";
			else if(error.code==0x0003) back = "BICOM_ERROR_ILLEGAL_OPERATION";
			else if(error.code==0x0010) back = "BICOM_ERROR_OUT_OFF_RANGE";
			else if(error.code==0x0011) back = "BICOM_ERROR_ILLEGAL_DATA_SIZE";
			else if(error.code==0x0020) back = "BICOM_ERROR_NOT_ALLOWED";
			else if(error.code==0x0021) back = "BICOM_ERROR_OSD_ACTIVE";
			else back = "BICOM_ERROR "+error.code;
		}
		return back;
	};

	var createPayloadString = function(conf) {
		var back = null;
		if(isBicomConfig(conf)) {
            //check flags and action to find errors due to format change
            if(conf.bicomflags<0x80) Dbg.warn("invalid bicom flags: "+conf.bicomflags+", conf: "+Dbg.createObjString(conf));
            if(conf.bicomaction>=0x50 && conf.bicomaction<0x80) Dbg.warn("invalid bicom action: "+conf.bicomaction+", conf: "+Dbg.createObjString(conf));

			var tmpBFlags = conf.bicomflags;

			var leasetime = typeof LocalStorageMgr != 'undefined' ? LocalStorageMgr.getValue(LocalStorageMgr.LEASE_TIME) : 0;
			if(leasetime>0) {
				var leasetime_id = getLeaseTimeID();
				tmpBFlags = tmpBFlags|0x08;
				back = "0x"+DataHelper.nbrToString(tmpBFlags, 2);
				var strLTime = DataHelper.nbrToString(leasetime, 4);
				var strLTimeId = DataHelper.nbrToString(leasetime_id, 8);
				var strLTimeLE = strLTime.substring(2,4) + strLTime.substring(0,2);
				back += strLTimeLE + strLTimeId;
			} else {
				back = "0x"+DataHelper.nbrToString(tmpBFlags, 2);
			}
			back += DataHelper.nbrToString(conf.bicomserver, 4);
			back += DataHelper.nbrToString(conf.bicomobjid, 4);
			back += DataHelper.nbrToString(conf.bicomaction, 2);
			if(conf.value!=null) {
				var val = conf.value;
				if(conf.bicomtype.toLowerCase()=="number" || conf.bicomtype.toLowerCase()=="usnumber") {
					val = DataHelper.strToNumber(val);
					back += DataHelper.nbrToString(val, 4);
				} else if(conf.bicomtype.toLowerCase()=="ulong") {
                    val = DataHelper.strToNumber(val);
                    back += DataHelper.nbrToString(val, 8);
				} else if(conf.bicomtype.toLowerCase()=="int") {
                    val = DataHelper.strToNumber(val);
                    back += DataHelper.nbrToString(val, 8);
                } else if(conf.bicomtype.toLowerCase()=="byte") {
					val = DataHelper.strToNumber(val);
					back += DataHelper.nbrToString(val, 2);
				} else if(conf.bicomtype.toLowerCase()=="unicode") {
					var a = DataHelper.charsToNbrArray(val, 2);
					back += DataHelper.nbrArrayToString(a);
				} else if(conf.bicomtype.toLowerCase()=="bytes") {
					if(typeof(val)=="number") {
						val = DataHelper.nbrToString(val, 2);
						if(val.length%2!=0) val = "0"+val;
					} else if(typeof(val)!="string") {
						val = DataHelper.nbrArrayToString(val);
					}
					back += val.replace('0x', '');
				} else {
					Dbg.e("dont know what to do with "+conf.bicomtype+" (createPayloadString, bicom)");
				}
			} else if(conf.value_formatted!=null) {
                back += conf.value_formatted;
            }
		} else if(conf.rcptype) {
			if(conf.value!=null) {
				if(conf.rcptype.toLowerCase()=="p_unicode") {
					var a = DataHelper.charsToNbrArray(conf.value, 2);
					back = "0x" + DataHelper.nbrArrayToString(a) + "0000";
				} else if(conf.rcptype.toLowerCase()=="p_string") {
					back = encodeURIComponent(conf.value);
				} else if(conf.rcptype.toLowerCase()=="t_octet" ||
						conf.rcptype.toLowerCase()=="f_flag"  ||
						conf.rcptype.toLowerCase()=="t_word"  ||
						conf.rcptype.toLowerCase()=="t_int"  ||
						conf.rcptype.toLowerCase()=="t_dword" ) {
					back = conf.value;
				} else if(conf.rcptype.toLowerCase()=="p_octet") {
					back = conf.value;
					if(typeof(back)!="string") {
						back = DataHelper.nbrArrayToString(back);
					}
					back = "0x" + back.replace(/0x/g, "").replace(/\s/g, "");
				}
			}
		}
		return back;
	};

	var doRequest = function(cfg, cfgupdates) {
		var conf = DataHelper.cloneObject(cfg); //clone config because it will be modified
		if(cfgupdates) {
			for (var e in cfgupdates) {
				conf[e] = cfgupdates[e];
			}
		}
		if(isBicomConfig(conf)) {
			conf = DataHelper.extendObj(conf, bicomdefaults);
			conf = DataHelper.extendObj(conf, rcpdefaults);
			conf.direction = "WRITE";
			if(conf.bicomaction==0 && conf.value!=null) conf.bicomaction = 3;
			else if(conf.bicomaction==0) conf.bicomaction = 1;
			if(conf.payload==null) conf.payload = createPayloadString(conf);
		} else {
			conf = DataHelper.extendObj(conf, rcpdefaults);
			if(conf.payload==null && conf.value!=null) conf.payload = createPayloadString(conf);
		}
		//Dbg.d("doRequest, conf: "+Dbg.createObjString(conf));
		var url = getRCPUrl(conf);
		var data = "command=0x"+DataHelper.nbrToString(conf.rcpcmd, 4, 16)+"&type="+conf.rcptype+"&direction="+conf.direction+"&num="+conf.rcpnum;
		if(conf.idstring) data += "&idstring="+conf.idstring;
		if(conf.sessionid) data += "&sessionid="+conf.sessionid;
		if(typeof(conf.payload)!="undefined" && conf.payload!=null) data += "&payload="+conf.payload;
		if(conf.ip) data += "&ip="+conf.ip;
		if(conf.timeout) data += "&reqtimeout="+conf.timeout;
		if(conf.remotedev) data += "&rde="+conf.remotedev;

		if(typeof(CookieSupport) != "undefined") {
            var csrf = CookieSupport.getCookie('csrf');
            if (csrf != null) data += "&csrf=" + csrf;
        } else {
		    console.warn("no cookie support!");
        }
	Dbg.i("doRequest, type: "+conf.type+", url: "+url+", data: "+data);
	if (conf.asBeacon && navigator.sendBeacon) {
            navigator.sendBeacon(url, new URLSearchParams(data));
        } else {
            $.ajax({
                url: url,
                data: data,
                type: conf.type,
                async: conf.async,
                cache: false,
                dataType: "xml",
                context: {conf: conf},
                complete: requestComplete,
                error: requestError,
		beforeSend: function (xhr) {
			if (conf.username && conf.password) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa( conf.username + ":" + conf.password));
			}
		},
            });
            requestCounter.requestSent(conf);
        }
	};

	var requestComplete = function(res, status) {
		if(status=="success" || status=="notmodified") {
			processAnswer(res, this.conf);
		} else {
			Dbg.i("requestComplete, invalid status: "+status);
			if(this.conf.callback) {
				var error = createErrorObject(NETWORK_ERROR, 0, res.statusText);
				if(typeof(this.conf.callback)=="function") {
					this.conf.callback(createResponseObj(res.statusText, this.conf, error));
				} else {
					window[this.conf.callback](createResponseObj(res.statusText, this.conf, error));
				}
			}
		}
		requestCounter.replyReceived(this.conf);
		checkFinished(this.conf);
		this.conf = null;
		res = null;
	};

	var requestError = function(res, desc, ex) {
		if(typeof(Dbg)=="undefined") {
			console.warn("Dbg not defined, error: "+desc+", exception: ", ex)
			return;
		}
		//Dbg.w("an error occured: "+desc+", exception: "+ex);
		if(res) {
			//Dbg.w("errorous response: ", res);
			try {
				Dbg.w("error reason: "+res.responseXML.parseError.reason+", line: "+res.responseXML.parseError.line+", column: "+res.responseXML.parseError.linepos+", src: "+res.responseXML.parseError.srcText);
			} catch(e) {}
		}
		if(this.conf.onerror) {
			if(typeof(this.conf.onerror)=="function") {
				this.conf.onerror(res, desc, ex);
			} else {
				window[this.conf.onerror](res, desc, ex);
			}
		}
	};

    var createResponseObj = function(val, conf, error) {
        return {
            value: val,
            conf: conf,
            error: error
        }
    };

	var processAnswer = function(res, conf) {
		Dbg.i("processAnswer, response: "+res.responseText);
		var val = 0;
		var error = null;
        if(typeof(res.responseXML)=="undefined") res.responseXML = $.parseXML(res.responseText); //jQuery 1.9 bug (used in VRM)
		var data = RCPParser.parseXMLAnswer(res.responseXML);
		if(data.sessionid) {
			conf.sessionid = DataHelper.strToNumber(data.sessionid);
			if(isNaN(conf.sessionid)) conf.sessionid=0;
		}
		if(data.auth) {
			conf.auth = DataHelper.strToNumber(data.auth);
		}

		if(conf.fullreply) {
			val = data;
			if(data.err) error = createErrorObject(RCP_ERROR, data.err);
		} else if(data.err) {
			val = "ERROR";
			if(data.type == "JSON_ERROR") {
				error = createErrorObject(JSON_ERROR, data.err);
			} else {
				error = createErrorObject(RCP_ERROR, data.err);
			}
			if(conf.onerror) {
				if(typeof(conf.onerror)=="function") {
					conf.onerror(createResponseObj(val, conf, error));
				} else {
					window[conf.onerror](createResponseObj(val, conf, error));
				}
			}
		} else {
			val = data.val;
		}

		if(data.type.toLowerCase()=="p_octet" && error==null) {
			var a = data.val;
			if(isBicomConfig(conf)) {
				if(a.length>=6) {
                    if((a[0]&0x08)>0) a.splice(1, 6); //leasetime
					if(a[5]===0x6f) {
						a.splice(0, 6);
						error = createErrorObject(BICOM_ERROR, DataHelper.nbrArrayToNbr(a, false));
						val = "ERROR";
					} else {
						a.splice(0, 6);
						if(conf.bicomtype.toLowerCase()=="number" || conf.bicomtype.toLowerCase()=="int") {
							val = DataHelper.nbrArrayToNbr(a, false);
						} else if(conf.bicomtype.toLowerCase()=="byte") {
							val = DataHelper.nbrArrayToNbr(a, false);
						} else if(conf.bicomtype.toLowerCase()=="usnumber" || conf.bicomtype.toLowerCase()=="ulong") {
							val = DataHelper.nbrArrayToNbr(a, true);
						} else if(conf.bicomtype.toLowerCase()=="unicode" || conf.bicomtype.toLowerCase()=="utf16") {
							a = DataHelper.strToNbrArray(a.join(" "), 2, 10);
							val = DataHelper.nbrArrayToChars(a);
						} else {
							val = a;
						}
					}
				} else {
					Dbg.e("processAnswer, response too short: "+res.responseText);
				}
			} else {
				val = a;
			}
		}
		if(conf.callback) {
			if(typeof(conf.callback)=="function") {
				conf.callback(createResponseObj(val, conf, error));
			} else {
				window[conf.callback](createResponseObj(val, conf, error));
			}
		}
	};

	var checkFinished = function(conf) {
		if(conf.noglobalfinish==false) {
			if(isReadRequest(conf)) {
				if(requestCounter.read_received >= requestCounter.read_sent) {
					if(rf_handle) window.clearTimeout(rf_handle);
					rf_handle = window.setTimeout( function() {
						if(globalcallbacks.readingfinished) {
							Dbg.i("calling 'readingfinished'...");
							globalcallbacks.readingfinished();
						}
					}, 500);
				} else if(rf_handle) {
					window.clearTimeout(rf_handle);
					rf_handle = 0;
				}
			} else {
				if(requestCounter.write_received >= requestCounter.write_sent) {
					if(sf_handle) window.clearTimeout(sf_handle);
					sf_handle = window.setTimeout( function() {
						if(globalcallbacks.savingfinished) {
							Dbg.i("calling 'savingFinished'...");
							globalcallbacks.savingfinished();
						}
					}, 500);
				} else if(sf_handle) {
					window.clearTimeout(sf_handle);
					sf_handle = 0;
				}
			}
		}
	};

    /******************************************************************
     * messages
     *****************************************************************/
    var readMessages = function(msg, time, callback, msgdomain, sessionid) {
        var url = getRCPUrl() + '?message=' + msg + '&collectms=' + time;
        if(msgdomain) url += "&msgdomainID="+msgdomain;
        if(sessionid) url += "&sessionid="+sessionid;
        if(typeof(CookieSupport) != "undefined") {
            var csrf = CookieSupport.getCookie('csrf');
            if (csrf != null) url += "&csrf=" + csrf;
        }
        Dbg.d("readMessages, url: "+url);
        $.ajax({
            url: url,
            cache: false,
            type: "GET",
            dataType: "xml",
            context: {callback: callback, msgdomain: msgdomain},
            complete: msgRequestComplete,
            error: msgRequestError
        });
    };

    var msgRequestComplete = function(res, status) {
        if(status=="success" || status=="notmodified") {
            this.callback(res, this.msgdomain);
        } else {
            Dbg.i("readMessages, unknown status: "+status);
            this.callback(null, this.msgdomain);
        }
    };

    var msgRequestError = function(res, desc, ex) {
        if(Dbg) {
            Dbg.w("an error occured while reading messages: " + desc + ", exception: " + ex);
            if (res) {
                Dbg.w("errorous response: ", res);
                try {
                    Dbg.w("error reason: " + res.responseXML.parseError.reason + ", line: " + res.responseXML.parseError.line + ", column: " + res.responseXML.parseError.linepos + ", src: " + res.responseXML.parseError.srcText);
                } catch (e) {
                }
            }
        }
        if (ex && ex.message) {
            if (ex.message.indexOf('waiting for reset')) {
                $(window).trigger('deviceReboot', { msg: ex.message });
            }
        }
    };

	jQuery.support.cors = true;

	return {
		RCP_ERROR: RCP_ERROR,
		BICOM_ERROR: BICOM_ERROR,
		NETWORK_ERROR: NETWORK_ERROR,
        BICOMSERVER: BICOMSERVER,
        AUTHLEVEL: AUTHLEVEL,
		createErrorObject: createErrorObject,
		setCallbacks: function(readingfinished, savingfinished) {
			globalcallbacks.readingfinished = readingfinished;
			globalcallbacks.savingfinished = savingfinished;
		},
		readRCP: function(rcpcmd, datatype, cfg) {
            var def = new jQuery.Deferred();
			doRequest({
				rcpcmd: rcpcmd,
				rcptype: datatype,
                		deferred: def,
				callback: function(response) {
                    if(response.error) def.reject(response);
                    else def.resolve(response);
				}
			}, cfg);
            return def.promise();
		},
		readBicom: function(bicomserver, bicomobjid, cfg) {
            var def = new jQuery.Deferred();
			doRequest({
				bicomserver: bicomserver,
				bicomobjid: bicomobjid,
				bicomaction: 1,
				bicomtype: "number",
                deferred: def,
				callback: function(response) {
                    if(response.error) def.reject(response);
                    else def.resolve(response);
				}
			}, cfg);
            return def.promise();
		},
        readBicomMin: function(bicomserver, bicomobj, cfg) {
            let cfg_clone = DataHelper.cloneObject(cfg || {});
            cfg_clone.bicomaction = 0xC;
            return this.readBicom(bicomserver, bicomobj, cfg_clone);
        },
        readBicomMax: function(bicomserver, bicomobj, cfg) {
            let cfg_clone = DataHelper.cloneObject(cfg || {});
            cfg_clone.bicomaction = 0xB;
            return this.readBicom(bicomserver, bicomobj, cfg_clone)
        },
        readBicomOptions: function(bicomserver, bicomobj, cfg) {
            cfg = cfg || {};
            let cfg_clone = DataHelper.cloneObject(cfg);
		    cfg_clone.bicomaction = 0x0D;
            cfg_clone.bicomtype = 'bytes';
            return this.readBicom(bicomserver, bicomobj, cfg_clone).done(function(res) {
                if (res.conf.bicomtype == 'bytes') {
                    var datatype = cfg.bicomtype || "number";
                    var bytecnt = (datatype === "ulong" || datatype === "long") ? 4 : 2;
                    var signed = (datatype === "ulong" || datatype === "usnumber") ? false : true;
                    var parsed = [];
                    var is = new InputStream(res.value);
                    var count = is.readNumber(bytecnt, false);
                    for (var i=0; i<count; i++) {
                        parsed.push(is.readNumber(bytecnt, signed));
                    }
                    res.parsed = parsed;
                }
            });
        },
        readBicomNOP: function(bicomserver, bicomobj, cfg) {
            cfg = cfg || {};
            let cfg_clone = DataHelper.cloneObject(cfg);
            cfg_clone.bicomaction = 0x0A;
            return this.readBicom(bicomserver, bicomobj, cfg_clone);
        },
        setBicomDefault: function(bicomserver, bicomobj, cfg) {
            let cfg_clone = DataHelper.cloneObject(cfg || {});
            cfg_clone.bicomaction = 0x8;
            return this.readBicom(bicomserver, bicomobj, cfg_clone);
        },
		writeRCP: function(rcpcmd, datatype, value, cfg) {
            var def = new jQuery.Deferred();
			doRequest({
				rcpcmd: rcpcmd,
				rcptype: datatype,
				direction: "WRITE",
				value: value,
                deferred: def,
				callback: function(response) {
                    if(response.error) def.reject(response);
                    else def.resolve(response);
				}
			}, cfg);
            return def.promise();
		},
		writeBicom: function(bicomserver, bicomobjid, value, cfg) {
            var def = new jQuery.Deferred();
			doRequest({
				bicomserver: bicomserver,
				bicomobjid: bicomobjid,
				bicomaction: 3,
				bicomtype: "number",
				value: value,
                deferred: def,
				callback: function(response) {
                    if(response.error) def.reject(response);
                    else def.resolve(response);
				}
			}, cfg);
            return def.promise();
		},
        readCommand: function(cmd, cfg) {
            var def = new jQuery.Deferred();
            cfg = cfg||{};
            var fkt_done = function(res) {
                RCPParser.parseResponse(res, cmd);
                def.resolve(res);
            };
            var fkt_fail = function(res) {
                def.reject(res);
            };
            if (!cfg.payload && typeof cfg.value != 'undefined') {
                // create read payload
                if (cmd.datatype === "P_OCTET" && typeof cfg.value === 'object' && !Array.isArray(cfg.value)) {
                    var b = RCPParser.getPayload(cfg.value, cmd, {direction: "READ"});
                    if (b) {
                        cfg.payload = '0x' + DataHelper.nbrArrayToString(b);
                    }
                }
            }
            if(cmd.server==undefined) {
                //RCP command
                this.readRCP(cmd.opcode, cmd.datatype, cfg).done(fkt_done).fail(fkt_fail);
            } else {
                //Bicom command
                if(cfg.bicomtype==undefined) cfg.bicomtype = cmd.bicomtype || 'bytes';
                this.readBicom(cmd.server, cmd.object, cfg).done(fkt_done).fail(fkt_fail);
            }
            return def.promise();
        },
        writeCommand: function(cmd, data, cfg) {
            var def = new jQuery.Deferred();
            cfg = cfg||{};
            var payload = RCPParser.getPayload(data, cmd, { direction: "WRITE"});
            var fkt_done = function(res) {
                RCPParser.parseResponse(res, cmd);
                def.resolve(res);
            };
            var fkt_fail = function(res) {
                def.reject(res);
            };
            if(cmd.server==undefined) {
                //RCP command
                this.writeRCP(cmd.opcode, cmd.datatype, payload, cfg).done(fkt_done).fail(fkt_fail);
            } else {
                //Bicom command
                if(cfg.bicomtype==undefined) cfg.bicomtype = cmd.bicomtype || 'bytes';
                this.writeBicom(cmd.server, cmd.object, payload, cfg).done(fkt_done).fail(fkt_fail);
            }
            return def.promise();
        },
        isReadRequest: isReadRequest,
        doRequest: doRequest, //backward compatibility to jqframework
        readMessages: readMessages
	};
})(RCP || {}, jQuery);

var RCPParser = (function(RCPParser, $, undefined) {

	var x2js = null;

	var parseXMLAnswer = function(data) {
		var back = {};
		var json = "";
		if(!x2js) x2js = new X2JS();
		if(typeof(data)=="string") {
			json = x2js.xml2js(data);
		} else {
			json = x2js.dom2js(data);
		}
		if(json.rcp) {
            back.idstring = json.rcp.idstring;
            back.command = DataHelper.strToNumber(json.rcp.command.dec);
            back.cltid = DataHelper.strToNumber(json.rcp.cltid);
            back.num = DataHelper.strToNumber(json.rcp.num);
            back.payload = json.rcp.payload;
            back.auth = DataHelper.strToNumber(json.rcp.auth);
            //back.auth = 2;
            back.type = json.rcp.type;
            back.sessionid = DataHelper.strToNumber(json.rcp.sessionid);
            if(json.rcp.result.err) {
                back.err = DataHelper.strToNumber(json.rcp.result.err);
            } else if(typeof(json.rcp.result.dec)!="undefined") {
                back.dec = DataHelper.strToNumber(json.rcp.result.dec);
            } else if(typeof(json.rcp.result.str)!="undefined") {
                back.str = json.rcp.result.str;
                if(typeof(back.str)==="object") back.str = back.str.toString(); //in firefox this is necessary...
                if(back.type=="P_OCTET") back.str = back.str.replace(/\n/g, "").replace(/\s+/g, " "); //remove strange linebreaks in firefox e.g. in iscsi discovery
            }

            if(!json.rcp.result.err) {
                if(back.type.toUpperCase()=="P_UNICODE") {
                    back.str = back.str.replace(/(\s+)/g, " ");
                    back.array = DataHelper.strToNbrArray(back.str, 1, 16);
                    back.val = DataHelper.nbrArrayToChars(back.array, 2);
                } else if(back.type.toLowerCase()=="p_string") {
                    back.val = back.str;
                } else if(back.type.toLowerCase()=="t_octet" ||
                        back.type.toLowerCase()=="f_flag"  ||
                        back.type.toLowerCase()=="t_word"  ||
                        back.type.toLowerCase()=="t_int"   ||
                        back.type.toLowerCase()=="t_dword" ) {
                    back.val = back.dec;
                } else if(back.type.toLowerCase()=="p_octet") {
                    back.str = back.str.replace(/(\s+)/g, " ");
                    back.array = DataHelper.strToNbrArray(back.str, 1, 16);
                    back.val = back.array;
                }
            }
		} else {
			back.err = "No JSON response";
			back.type = "JSON_ERROR";
		}
		return back;
	};

    var parseResponse = function(response, definition) {
        if(response && definition) {
            if(definition.format) {
                if (response.conf.rcptype == "P_OCTET") {
                    response.parsed = parseByteArray(response.value, definition.format);
                } else {
                    $.dbg.error("wrong data format for parsing rcp");
                }
            } else if(definition.parser) {
                response.parsed = definition.parser(response.value, response);
            }
        }
    };

	var parseByteArray = function(a, format) {
		var parsed = {};
		var is = new InputStream(a);
		$.each(format, function (idx, obj) {
			if(typeof(obj)=="string") {
				obj = parseFormatString(obj);
			}
			if (obj.type == "NUMBER") {
				parsed[obj.name] = is.readNumber(obj.length);
			} else if (obj.type == "BYTES") {
				parsed[obj.name] = is.readBytes(obj.length);
			} else {
				Dbg.e("datatype " + obj.type + " not yet implemented");
			}
		})
		return parsed;
	};

    var formatToPayload = function(format, data) {
        var os = new OutputStream();
        $.each(format, function (idx, obj) {
            if (typeof(obj) == "string") {
                obj = parseFormatString(obj);
            }
            if (obj.type == "NUMBER") {
                os.writeNumber(data[obj.name], obj.length);
            } else if (obj.type == "BYTES") {
                if(data[obj.name]===undefined) {
                    if(obj.name === "reserved") data[obj.name] = DataHelper.createEmptyByteArray(obj.length);
                    else $.dbg.e("missing value in data-object: "+obj.name+" data: "+ $.dbg.createObjString(data));
                }
                os.writeBytes(data[obj.name]);
            } else {
                $.dbg.error("formatPayload, datatype " + obj.type + " not yet implemented");
            }
        });
        return os.getBytes();
    };

    var parseFormatString = function(s) {
        var back = {};
        var a = s.split('|');
        if(a.length>=3) {
            back.name = a[0];
            back.length = parseInt(a[1], 10);
            back.type = a[2];
        } else {
            $.dbg.e("invalid format string: '"+s+"'");
        }
        return back;
    };

	function getPayload(data, definition, cfg) {
		if (definition) {
			if (definition.serializer) {
				return definition.serializer(data, cfg);
			}
			if(definition.format) {
				return formatToPayload(definition.format, data, cfg);
			}
		}
		return data;
	}

    var parseTaggedRCPCommand = function(b) {
        back = [];
        var is = new InputStream(b);
        while(is.available()>=4) {
            var o = {};
            o.length = is.readShort();
            o.tag = (is.readShort()&0x7FFF); //mask out first bit (this signals that this tag contains other tags)
            o.data = is.readBytes(o.length-4);
            if(typeof(back[o.tag])=="undefined") back[o.tag] = [];
            back[o.tag].push(o);
        }
        return back;
    };

    var parseTaggedRCPCommand_V2 = function(b, cfg) {
    	cfg = cfg || {};
    	var unique = cfg.unique || false;
        var simplify = cfg.simplify || false;
    	var mappings = cfg.mappings || new Map();
    	var tagformat = cfg.tagformat || "TLD";
    	var length_includes_header = cfg.length_includes_header || false;
        var back = new Map();
        var is = new InputStream(b);
        while(is.available()>=4) {
            var o = {};
            if (tagformat === "TLD") {
                o.tag = is.readShort();
                o.length = is.readShort();
            } else if (tagformat === "LTD") {
                o.length = is.readShort();
                o.tag = is.readShort();
            } else {
                throw "invalid tag format: " + tagformat;
            }
            if (length_includes_header) {
                o.length -= 4;
            }
            o.data = is.readBytes(o.length);

            /**
             * check for mappings to convert the tag data
             */
            var mapping = mappings.get(o.tag) || {};
            if(mapping.name) {
            	o.name = mapping.name
			}
            if(mapping.parse) {
            	o.parsed = mapping.parse(o.data);
			} else if(mapping.type === "bytes") {
            	o.parsed = o.data;
			} else if(mapping.type === "number") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data);
			} else if(mapping.type === "uint8") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, true);
            } else if(mapping.type === "int8") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, false);
            } else if(mapping.type === "uint16") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, true);
            } else if(mapping.type === "int16") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, false);
            } else if(mapping.type === "uint32") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, true);
            } else if(mapping.type === "int32") {
                o.parsed = DataHelper.nbrArrayToNbr(o.data, false);
            } else if(mapping.type === "string") {
                o.parsed = DataHelper.nbrArrayToChars(o.data);
            } else if(mapping.type === "utf32") {
                o.parsed = DataHelper.nbrArrayToChars(o.data, 4);
            } else if(mapping.type === "utf16") {
                o.parsed = DataHelper.nbrArrayToChars(o.data, 2);
            } else if(mapping.type === "utf8") {
            	var isTmp = new InputStream(o.data);
                o.parsed = isTmp.readUTF8(isTmp.available());
            } else if ((o.tag & 0x8000) !== 0) {
                // first bit signals that this tag contains other tags
            	o.parsed = parseTaggedRCPCommand_V2(o.data, cfg);
			}

            /**
			 * If unique is set, the parsed object overrides other objects with the same tag.
			 * If unique is not set each entry in the returned map is a array
             */
            if (unique) {
            	back.set(o.tag, o);
			} else {
                if (typeof (back.get(o.tag)) == "undefined") back.set(o.tag, []);
                back.get(o.tag).push(o);
            }
        }

        /**
		 * create a simple object representation of the tags
         */
        if (simplify) {
            var sobj = {};
            back.forEach(function(o, key) {
                sobj[o.name || "tag_" + o.tag] = typeof(o.parsed) === 'undefined' ? o.data : o.parsed;
            });
            back = sobj;
        }

        return back;
    };

    var serializeTaggedRCPCommand_V2 = function(obj, cfg) {
        /**
		 * curently only simple format is supported
         */
    	obj = obj || {};
        cfg = cfg || {};
        var tagformat = cfg.tagformat || "TLD";
        var length_includes_header = cfg.length_includes_header || false;
        var mappings = cfg.mappings || new Map();
        var os = new OutputStream();
        for (var key in obj) {
            /**
             * find mapping by name
             */
        	var mapping = null;

            mappings.forEach(function(o, mkey) {
                if(o.name === key) {
                    mapping = o;
                    mapping.tag = mkey;
                }
            });

            if(mapping) {
                if(mapping.serialize) {
                	var data = mapping.serialize(obj[key]);
                    var header = getTagHeader(mapping.tag, data.length, tagformat, length_includes_header);
                    os.writeBytes(header);
                	os.writeBytes(data);
                } else if(mapping.type === "bytes") {
                    var header = getTagHeader(mapping.tag, obj[key].length, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeBytes(obj[key]);
                } else if(mapping.type === "uint8" || mapping.type === "int8") {
                    var header = getTagHeader(mapping.tag, 1, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeByte(obj[key]);
                } else if(mapping.type === "uint16" || mapping.type === "int16") {
                    var header = getTagHeader(mapping.tag, 2, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeShort(obj[key]);
                } else if(mapping.type === "uint32" || mapping.type === "int32") {
                    var header = getTagHeader(mapping.tag, 4, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeInt(obj[key]);
                } else if(mapping.type === "string") {
                    var header = getTagHeader(mapping.tag, obj[key].length, tagformat, length_includes_header);
                    os.writeBytes(header);
                	os.writeString(obj[key]);
                } else if(mapping.type === "utf16") {
                    var os2 = new OutputStream();
                    os2.writeUTF16(obj[key]);
                    var data = os2.getBytes();
                    var header = getTagHeader(mapping.tag, data.length, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeBytes(data);
                } else if(mapping.type === "utf8") {
                    var os2 = new OutputStream();
                    os2.writeUTF8(obj[key]);
                    var data = os2.getBytes();
                    var header = getTagHeader(mapping.tag, data.length, tagformat, length_includes_header);
                    os.writeBytes(header);
                    os.writeBytes(data);
                }
			} else {
            	// console.info('serializer: no mapping found for "' + key + '": ', obj[key])
			}
        }
		return os.getBytes();
    };

    function getTagHeader(tag, length_without_header, tagformat, length_includes_header) {
        var os = new OutputStream();
        var taglength = length_includes_header ? length_without_header + 4 : length_without_header;
        if (tagformat == 'TLD') {
            os.writeShort(tag);
            os.writeShort(taglength);
        } else if (tagformat == 'LTD') {
            os.writeShort(taglength);
            os.writeShort(tag);
        }
        return os.getBytes();
    }

	RCPParser.parseXMLAnswer = parseXMLAnswer;
    RCPParser.parseResponse = parseResponse;
    RCPParser.parseTaggedRCPCommand = parseTaggedRCPCommand;
    RCPParser.parseTaggedRCPCommand_V2 = parseTaggedRCPCommand_V2;
    RCPParser.serializeTaggedRCPCommand_V2 = serializeTaggedRCPCommand_V2;
    RCPParser.getPayload = getPayload;

	return RCPParser;

})(RCPParser || {}, jQuery);


var DataHelper = (function(DataHelper, $, undefined) {

	var nbrToString = function(nbr, length, base) {
		var back = "";
		length = length || 2;
		base = base || 16;
		if(typeof(nbr) == "number") {
			if(nbr>=0) {
				back = nbr.toString(base);
			} else {
				var intMax = Math.pow(2, (length/2)*8)-1;
				back = (intMax+nbr+1).toString(base);
			}
		} else {
			back = ""+nbr;
		}
		back = blowup(back, length);
		return back.toUpperCase();
	};

	var strToNumber = function(s) {
		if(typeof(s)=="number") return s;
		var back=0;
		if(s) {
			if(/0x.*/.test(s)) back = parseInt(s.replace(/0x/, ""), 16);
			else back = parseInt(s, 10);
		}
		return back;
	};

    var nbrArrayToHexString = function(a) {
        return '0x' + this.nbrArrayToString(a, '');
    };

	var nbrArrayToString = function(a, sep) {
	    if (a instanceof ArrayBuffer) {
	        a = new Uint8Array(a);
        }
		var back = "";
		if(typeof(sep)=="undefined") sep = "";
		for(var i=0; i<a.length; i++) {
			if(typeof(a[i])=="undefined") a[i] = 0;
			back += nbrToString(a[i], 2);
			if(i<a.length-1) back += sep;
		}
		return back;
	};

	var nbrArrayToNbr = function(a, unsigned) {
		var back = 0;
		unsigned = unsigned||false;
		if(a) {
			for(var i=0; i<a.length; i++) {
				var idx = a.length-1-i;
				var val = a[idx];
				if(typeof(val)=="string") {
					val = strToNumber(val);
				}
				//back += val<<(i*8)
				back += val * (Math.pow(256, i));
			}
			if(unsigned==false) {
				if((a[0]&0x80)>0) {
					//1st bit is set --> negative number
					var intMax = Math.pow(2, a.length*8)-1;
					back = (intMax-back+1)*(-1);
				}
			}
		}
		return back;
	};

    var byteToSignedNumber = function(b) {
        var nbr = b&0xFF;
        if((nbr&0x80)>0) {
            nbr = (255-nbr+1)*(-1);
        }
        return nbr;
    };

	/***************************************************************************
	/* creates an array of numbers from an string with space separated bytes
	/* example: data = "31 32 33 34", step=1 --> {49,50,51,52}
	/* example: data = "00 01 00 02", step=2 --> {1,2}
	/**************************************************************************/
	var strToNbrArray = function(s, step, radix) {
		if(!s || typeof(s)!="string") return new Array();
		// remove double spaces
		s = s.trim().replace(/(\s+)/g, " ");
		// check comma separated ( "[1,2,3]" )
        s = s.trim().replace(/^\[/, "").replace(/\]$/, "").replace(/,/g, " ");
		step = step||1;
		radix = radix||16;
		var back = new Array();
		if(s.length>0) {
			var a = s.split(" ");
			var idx=0;
			while(idx <= a.length-step) {
				var tmp = 0;
				for(var i=0; i<step; i++) {
					tmp = tmp<<(8*i);
					tmp += parseInt(a[i+idx], radix);
				}
				back.push(tmp);
				idx += step;
			}
		}
		return back;
	};

    /***************************************************************************
     * creates a byte array from an string
     * e.g. data = 0x74657374 returns an array with values {116,101,115,116}
     **************************************************************************/
    function strToByteArray(data) {
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

	var nbrToByteArray = function(val, count) {
		count = count||4;
		var back = [];
		for(var i=0; i<count; i++) {
			back.unshift(val&0xFF);
			val = val>>8;
		}
		return back;
	};

	var nbrArrayToChars = function(a, bytesPerChar) {
		var back = "";
		bytesPerChar = bytesPerChar||1;
		for(var i=0; i<a.length; i=i+bytesPerChar) {
			var c = 0;
			for(var j=0; j<bytesPerChar; j++) {
				c += a[i+j]<<(8*(bytesPerChar-j-1));
			}
			if(c>0) {
				back += String.fromCharCode(c);
			}
		}
		return back;
	};

	var charsToNbrArray = function(chars, bytesPerChar) {
		var back = new Array();
		bytesPerChar = bytesPerChar||1;
		if(!chars) return back;
		for(var i=0; i<chars.length; i++) {
			var n = Number(chars.charCodeAt(i));
			//var s = blowup(n.toString(16), bytesPerChar*2);
			for(var j=0; j<bytesPerChar; j++) {
				var tmp = n & ((0xff<<8*(bytesPerChar-j-1)));
				tmp = (n>>(8*(bytesPerChar-j-1)))&0xff;
				back.push(tmp);
			}
		}
		return back;
	};

	var ip2bytes = function(ip) {
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
                    a[i] = DataHelper.blowup(a[i], 4);
                }
                ip = a.join(":");
                back = DataHelper.strToByteArray(ip.replace(/:/g, ""));
            }
        }
        return back;
    };

	var blowup = function(val, length, c, trailing) {
		var back = ""+val;
		var count = length - back.length;
		if(!c) c="0";
		if(!trailing) trailing=false;
		for(var i=0; i<count; i++) {
			if(trailing) back = back+c;
			else back = c+back;
		}
		return back;
	};

    var adjustByteArray = function(b, length) {
        if (!b) b = [];
        if (length > b.length) {
            var count = length - b.length;
            for (var i = 0; i < count; i++) {
                b.push(0);
            }
        } else if (length < b.length) {
            b = subarray(b, 0, length);
        }
        return b;
    }

	var cloneObject = function(obj) {
		var newObj = {};
		for (var e in obj) {
			newObj[e] = obj[e];
		}
		return newObj;
	};

	var extendObj = function(obj, defaults) {
		if(obj==null) obj = {};
		for (var e in defaults) {
			if(typeof(obj[e])=="undefined") {
				obj[e] = defaults[e];
			} else if(typeof(defaults[e])=="number" && typeof(obj[e])=="string") {
				obj[e] = strToNumber(obj[e]);
			} else if(typeof(defaults[e])=="boolean"  && typeof(obj[e])=="string") {
				if(obj[e]=="true") obj[e] = true;
				else obj[e] = false;
			}
		}
		return obj;
	};

    var createEmptyByteArray = function(length) {
        var a = [];
        for(var i=0; i<length; i++) a.push(0);
        return a;
    };

	var subarray = function(a, start, end) {
		var back = [];
		if(typeof(a.slice)=="function") {
			back = a.slice(start, end);
		} else if(typeof(a.subarray)=="function") {
			//here we are in case of a typed array (UInt8Array)
			back = a.subarray(start, end);
			//convert back to 'normal' array
			back = Array.prototype.slice.call(back);
		}
		return back;
	};

    /**
     * Serializes an object to json string
     * @param {object} obj the object to serialize
     * @return {string} object in JSON fromat string
     */
    var serialize = function (obj) {
        if (!obj) return "";
        else return JSON.stringify(obj);
    };

    /**
     * Deserializes JSON formatted string to an object
     * @param {string} string in JSON format
     * @return {object} deserizlized object
     */
    var deserialize = function (str) {
        if (str == null || str == '') {
            return {};
        } else {
            return JSON.parse(str);
        }
    };

    var JSONCopy = function (obj) {
        if (!obj) return null;
        else return JSON.parse(JSON.stringify(obj))
    };

    var createByteString = function(a, base, separator) {
        base = base || 16;
        if (typeof separator === 'undefined') separator = ' ';
        var s = "";
        if(!a) {
            s = "null";
        } else {
            for(var i=0; i<a.length; i++) {
                var tmp = a[i].toString(base);
                if(base == 2) tmp = blowup(tmp, 8);
                else if(base == 10) tmp = blowup(tmp, 3);
                else if(base == 16) tmp = blowup(tmp, 2);
                s += tmp;
                if(i<a.length-1) s += separator;
            }
            s = s.toUpperCase();
        }
        return s;
    };

    var toPrecision = function(n, decimal) {
        var s = "" + n;
        var dpos = s.indexOf(".");
        if(dpos >= 0) {
            s = s.substr(0, dpos + decimal + 1);
        }
        return parseFloat(s);
    };

    var qToFloat = function(val, q) {
        return val * Math.pow(2, -q);
    };

    var floatToQ = function(val, q) {
        return val * Math.pow(2, q);
    };

	DataHelper.nbrToString = nbrToString;
	DataHelper.nbrArrayToString = nbrArrayToString;
	DataHelper.nbrArrayToHexString = nbrArrayToHexString;
	DataHelper.nbrArrayToChars = nbrArrayToChars;
	DataHelper.nbrArrayToNbr = nbrArrayToNbr;
	DataHelper.byteToSignedNumber = byteToSignedNumber;
	DataHelper.strToNumber = strToNumber;
	DataHelper.strToNbrArray = strToNbrArray;
	DataHelper.strToByteArray = strToByteArray;
	DataHelper.charsToNbrArray = charsToNbrArray;
	DataHelper.nbrToByteArray = nbrToByteArray;
	DataHelper.ip2bytes = ip2bytes;
	DataHelper.blowup = blowup;
	DataHelper.adjustByteArray = adjustByteArray;
	DataHelper.cloneObject = cloneObject;
	DataHelper.extendObj = extendObj;
    DataHelper.createEmptyByteArray = createEmptyByteArray;
    DataHelper.createByteString = createByteString;
	DataHelper.subarray = subarray;
    DataHelper.serialize = serialize;
    DataHelper.deserialize = deserialize;
    DataHelper.toPrecision = toPrecision;
    DataHelper.qToFloat = qToFloat;
    DataHelper.floatToQ = floatToQ;
    DataHelper.JSONCopy = JSONCopy;

	return DataHelper;

})(DataHelper || {}, jQuery);

var RCPHelper = (function(RCPHelper, $, undefined) {

    RCPHelper.getCertificatesByUsageId = function(usageid) {
        var def = new jQuery.Deferred();
        var certs = [];

        function getCertsForUsageID(id) {
            var out = new OutputStream();
            out.writeShort(8); //8 bytes length
            out.writeShort(0); //tag 1 -> type
            out.writeInt(id); //4 bytes id
            var pl = '0x'+DataHelper.nbrArrayToString(out.getBytes());
            return RCP.readCommand(RCPCommands.CONF_CERTIFICATE_USAGE, {payload: pl})
        }

        RCP.readCommand(RCPCommands.CONF_CERTIFICATE_OPTIONS).done(function(res) {
            if (res.parsed.certStoreSupport) {
                var certlist = [];
                RCP.readCommand(RCPCommands.CONF_CERTIFICATE_LIST).done(function(res) {
                    certlist = res.parsed;
                    getCertsForUsageID(usageid).done(function(res) {
                        var files = res.parsed.files;
                        for(var i=0; i<files.length; i++) {
                            for (var j = 0; j < certlist.length; j++) {
                                if(certlist[j].label == files[i]) certs.push(certlist[j]);
                            }
                        }
                        def.resolve(certs);
                    }).fail(function(res) {
                        //rcp error is thrown if no certificate for this id is available, we want the empty list here so resolve
                        def.resolve(certs);
                    });
                }).fail(function(res) {
                    def.reject(res);
                });
            } else {
                def.reject('certstore_not_supported');
            }
        }).fail(function(res) {
            def.reject(res);
        });
        return def.promise();
    };

    RCPHelper.fixVideoInputOptionLabels = function(options) {
        var reso_changed = true;
        if (options.length > 1) {
            reso_changed = false;
            for (var i = 1; i < options.length; i++) {
                if ((options[i - 1].width !== options[i].width) || (options[i - 1].height !== options[i].height)) {
                    reso_changed = true;
                }
            }
        }
        // create the labels
        for(var j = 0; j < options.length; j++) {
            options[j].label = RCPHelper.getVideoInputOptionLabel(options[j], {
                show_resolution: reso_changed
            });
        }
    }

    RCPHelper.getVideoInputOptionLabel = function(o, cfg) {
        cfg = cfg || {};
        var fps = Math.round(o.framerate/100) / 10;
        var minfps = Math.round(o.minframerate/100) / 10;

        //get aspect ratio
        var ar = "";
        if ((o.width === 704 && o.height === 576) ||  //PAL
            (o.width === 704 && o.height === 480)) {  //NTSC
            //because of non-quadratic pixels
            ar = "4:3";
        } else if (DataHelper.toPrecision(o.width / o.height, 1) === DataHelper.toPrecision(16 / 9, 1)) ar = "16:9";
        else if (DataHelper.toPrecision(o.width / o.height, 1) === DataHelper.toPrecision(4 / 3, 1)) ar = "4:3";
        else if (DataHelper.toPrecision(o.width / o.height, 1) === DataHelper.toPrecision(5 / 4, 1)) ar = "5:4";
        else if (DataHelper.toPrecision(o.width / o.height, 1) === DataHelper.toPrecision(1 / 1, 1)) ar = "1:1";

        //get mpixels
        var mp = Math.round((o.width * o.height) / 100000) / 10;
        if (o.width === 1280 && o.height === 720) mp = 1;

        //get reso
        var reso = getMessage("cam_sensormode_xy").replace(/%x/, o.width).replace(/%y/, o.height);
        if(o.width === 1280 && o.height === 720) reso = "HD 720p";
        else if(o.width === 1920 && o.height === 1080) reso = "HD 1080p";
        else if((o.width === 4096 || o.width === 3840) && o.height === 2160) reso = "4K UHD";
        else if(mp >= 1) reso = getMessage("cam_sensormode_mp").replace(/%mp/, mp);

        //get text
        var txt = getMessage(cfg.show_resolution ? 'cam_sensormode_dyn' : 'cam_sensormode_nores_dyn');
        if ((o.minframerate !== o.framerate) && (o.minframerate > 0)) {
            txt = getMessage('cam_sensormode_minmax_dyn');
        } else if (o.hdrcnt > 0) {
            txt = getMessage(cfg.show_resolution ? 'cam_sensormode_hdr_dyn' : 'cam_sensormode_nores_hdr_dyn').replace(/%hdr/, o.hdrxmode ? 'HDR X' : 'HDR');
        }
        txt = txt.replace(/%minfps/, minfps)
            .replace(/%maxfps/, fps)
            .replace(/%fps/, fps)
            .replace(/%x/, o.width)
            .replace(/%y/, o.height)
            .replace(/%ar/, ar)
            .replace(/%mp/, mp)
            .replace(/%reso/, reso);

        return txt;
    };

    return RCPHelper;

})(RCPHelper || {}, jQuery);

var RCPCommands = (function(RCPCommands, $, undefined) {

    var m_logger = log.getLogger('RCPCommands');

    RCPCommands.CONF_PRIV_MSK_OPTIONS = {
        opcode: 0x0bd7,
        datatype: "P_OCTET",
        format: [ {
            name: "colorSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "rectangleSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "polygonSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "maxNbrOfPoints",
            length: 1,
            type: "NUMBER"
        }, {
            name: "maxNbrOfMasks",
            length: 1,
            type: "NUMBER"
        }, {
            name: "reserved",
            length: 2,
            type: "NUMBER"
        }, {
            name: "rcpPrivMaskSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "zoomThresholdSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "nbPrivMaskLines",
            length: 1,
            type: "NUMBER"
        }, {
            name: "privMaskEnlargement",
            length: 1,
            type: "NUMBER"
        }, {
            name: "ivaBehindMask",
            length: 1,
            type: "NUMBER"
        }, {
            name: "featureBits",
            length: 1,
            type: "NUMBER"
        }
        ]
    };

    RCPCommands.CONF_PRIV_MSK_POLY = {
        opcode: 0x0bd8,
        datatype: "P_OCTET",
        parser: function(b) {
            var back = {};
            var is = new InputStream(b);
            while(is.available()>4) {
                var length = is.readShort();
                var obj = {
                    length: length,
                    tag: is.readShort()
                };
                if(obj.tag==0) {
                    //color info
                    obj.mode = is.readByte();
                    obj.red = is.readByte();
                    obj.green = is.readByte();
                    obj.blue = is.readByte();
                    back["color"] = obj;
                } else if(obj.tag==1) {
                    //mask fixed cam
                    if(typeof(back.masks)=="undefined") back.masks = [];
                    obj.points = [];
                    obj.enabled = is.readByte();
                    obj.id = is.readByte();
                    obj.nbrPoints = is.readByte();
                    is.readBytes(5); //reserved
                    for(var i=0; i<obj.nbrPoints; i++) {
                        obj.points.push({
                            x: is.readShort(),
                            y: is.readShort()
                        })
                    }
                    //check if all points are 0/0
                    var allZero = true;
                    for (var i = 0; i < obj.points.length; i++) {
                        if (obj.points[i].x != 0 || obj.points[i].y != 0) allZero = false;
                    }
                    if(allZero) {
                        obj.nbrPoints = 0;
                        obj.points = [];
                        obj.enabled = 0;
                    }
                    back.masks[obj.id] = obj;
                } else if(obj.tag==2) {
                    //mask ptz
                    if(typeof(back.ptzmasks)=="undefined") back.ptzmasks = [];
                    obj.points = [];
                    obj.enabled = is.readByte();
                    obj.id = is.readByte();
                    obj.nbrPoints = is.readByte();
                    obj.zoomThreshold = is.readByte();
                    is.readBytes(4); //reserved
                    for(var i=0; i<obj.nbrPoints; i++) {
                        obj.points.push({
                            x: is.readShort(),
                            y: is.readShort()
                        })
                    }
                    //check if all points are 0/0
                    var allZero = true;
                    for (var i = 0; i < obj.points.length; i++) {
                        if (obj.points[i].x != 0 || obj.points[i].y != 0) allZero = false;
                    }
                    if(allZero) {
                        obj.nbrPoints = 0;
                        obj.points = [];
                        obj.enabled = 0;
                    }
                    back.ptzmasks[obj.id] = obj;
                } else if(obj.tag==3) {
                    //global options
                    obj.disableMasks = is.readByte();
                    obj.IVABehindMasks = is.readByte();
                    obj.maskEnlargement = is.readByte();
                    obj.reserved = is.readBytes(obj.length - 7);
                    back.globaloptions = obj;
                } else if(obj.tag==4) {
                    if(typeof(back.ptzpositions)=="undefined") back.ptzpositions = [];
                    obj.enable = is.readByte();
                    obj.id = is.readByte();
                    is.readShort();
                    obj.pan = is.readInt();
                    obj.tilt = is.readInt();
                    obj.zoom = is.readInt();
                    obj.reserved = is.readInt();
                    back.ptzpositions[obj.id] = obj;
                } else {
                    console.log("unknown tag in CONF_PRIV_MSK_POLY: ", obj);
                    obj.data = is.readBytes(obj.length - 4);
                }
            }
            return back;
        },
        serializer: function(obj) {
            var os = new OutputStream();
            if(obj.color) {
                os.writeShort(8);
                os.writeShort(0);
                os.writeByte(obj.color.mode);
                os.writeByte(obj.color.red || 0);
                os.writeByte(obj.color.green || 0);
                os.writeByte(obj.color.blue || 0);
            }
            if(obj.masks) {
                $.each(obj.masks, function(idx, mask) {
                    var len = mask.points.length * 4 + 12;
                    os.writeShort(len);             //length
                    os.writeShort(1);               //tag
                    os.writeByte(mask.enabled ? 1 : 0);
                    os.writeByte(mask.id);
                    os.writeByte(mask.points.length);
                    os.writeBytes([0,0,0,0,0]);     //reserved
                    for(var i=0; i<mask.points.length; i++) {
                        os.writeShort(mask.points[i].x);
                        os.writeShort(mask.points[i].y);
                    }
                });
            }
            if(obj.ptzmasks) {
                $.each(obj.ptzmasks, function(idx, mask) {
                    var len = mask.points.length * 4 + 12;
                    os.writeShort(len);             //length
                    os.writeShort(2);               //tag
                    os.writeByte(mask.enabled ? 1 : 0);
                    os.writeByte(mask.id);
                    os.writeByte(mask.points.length);
                    os.writeByte(mask.zoomThreshold);
                    os.writeBytes([0,0,0,0]);       //reserved
                    for(var i=0; i<mask.points.length; i++) {
                        os.writeShort(mask.points[i].x);
                        os.writeShort(mask.points[i].y);
                    }
                });
            }
            if(obj.globaloptions) {
                os.writeShort(12);              //length
                os.writeShort(3);               //tag
                os.writeByte(obj.globaloptions.disableMasks);
                os.writeByte(obj.globaloptions.IVABehindMasks);
                os.writeByte(obj.globaloptions.maskEnlargement);
                os.writeBytes([0,0,0,0,0]);   	//reserved
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_PRIV_MASK_DOME_PTZ_POS = {
        CMD_GO_TO_POS: 0,
        CMD_STORE_POS: 1,
        opcode: 0x0c48,
        datatype: "P_OCTET",
        serializer: function (obj) {
            var os = new OutputStream();
            os.writeShort(12);              //length
            os.writeShort(0);               //tag
            os.writeByte(obj.cmd);
            os.writeByte(obj.maskid);
            os.writeBytes([0,0,0,0,0,0]);   //reserved
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VCA_MSK_OPTIONS = {
        opcode: 0xc6f,
        datatype: "P_OCTET",
        format: [ {
            name: "reserved",
            length: 1,
            type: "NUMBER"
        }, {
            name: "rectangleSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "polygonSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "maxNbrOfPoints",
            length: 1,
            type: "NUMBER"
        }, {
            name: "maxNbrOfMasks",
            length: 1,
            type: "NUMBER"
        }, {
            name: "reserved",
            length: 2,
            type: "NUMBER"
        }, {
            name: "rcpVCAMaskSupport",
            length: 1,
            type: "NUMBER"
        }, {
            name: "reserved",
            length: 1,
            type: "NUMBER"
        }, {
            name: "nbVCAMaskLines",
            length: 1,
            type: "NUMBER"
        }
        ]
    };

    RCPCommands.CONF_VCA_MSK_POLY = {
        opcode: 0x0c6e,
        datatype: "P_OCTET",
        parser: function(b) {
            var back = {};
            var tags = [];
            var is = new InputStream(b);
            while(is.available()>4) {
                var length = is.readShort();
                var obj = {
                    length: length,
                    tag: is.readShort()
                };
                if(obj.tag==2) {
                    //mask ptz
                    if(typeof(back.ptzmasks)=="undefined") back.ptzmasks = [];
                    obj.points = [];
                    obj.enabled = is.readByte();
                    obj.id = is.readByte();
                    obj.nbrPoints = is.readByte();
                    is.readBytes(5); //reserved
                    for(var i=0; i<obj.nbrPoints; i++) {
                        obj.points.push({
                            x: is.readShort(),
                            y: is.readShort()
                        })
                    }
                    //check if all points are 0/0
                    var allZero = true;
                    for (var i = 0; i < obj.points.length; i++) {
                        if (obj.points[i].x != 0 || obj.points[i].y != 0) allZero = false;
                    }
                    if(allZero) {
                        obj.nbrPoints = 0;
                        obj.points = [];
                        obj.enabled = 0;
                    }
                    back.ptzmasks[obj.id] = obj;
                } else if(obj.tag==3) {
                    //global options
                    obj.disableMasks = is.readByte();
                    obj.reserved = is.readBytes(obj.length - 5);
                    back.globaloptions = obj;
                } else {
                    m_logger.warn("unknown tag in CONF_VCA_MSK_POLY: ", obj);
                }
            }
            return back;
        },
        serializer: function(obj) {
            var os = new OutputStream();
            if(obj.ptzmasks) {
                $.each(obj.ptzmasks, function(idx, mask) {
                    var len = mask.points.length * 4 + 12;
                    os.writeShort(len);             //length
                    os.writeShort(2);               //tag
                    os.writeByte(mask.enabled ? 1 : 0);
                    os.writeByte(mask.id);
                    os.writeByte(mask.nbrPoints);
                    os.writeBytes([0,0,0,0,0]);       //reserved
                    for(var i=0; i<mask.points.length; i++) {
                        os.writeShort(mask.points[i].x);
                        os.writeShort(mask.points[i].y);
                    }
                });
            }
            if(obj.globaloptions) {
                os.writeShort(12);              //length
                os.writeShort(3);               //tag
                os.writeByte(obj.globaloptions.disableMasks);
                os.writeBytes([0,0,0,0,0,0,0]); //reserved
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VCA_MASK_DOME_PTZ_POS = {
        CMD_GO_TO_POS: 0,
        CMD_STORE_POS: 1,
        opcode: 0x0c70,
        datatype: "P_OCTET",
        serializer: function (obj) {
            var os = new OutputStream();
            os.writeShort(12);              //length
            os.writeShort(0);               //tag
            os.writeByte(obj.cmd);
            os.writeByte(obj.maskid);
            os.writeBytes([0,0,0,0,0,0]);   //reserved
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VIDEO_STATIC_SCENE_REGIONS = {
        opcode: 0x0623,
        datatype: "P_OCTET",
        parser: function(b) {
            var back = [];
            var is = new InputStream(b);
            while (is.available() >= 12) {
                var o = {};
				o.preset = is.readByte();
                o.exclude = is.readByte() & 0x03;
                var temp = is.readByte();
                o.category = (temp >> 1) & 0x03;
                o.shrink = temp & 0x01;
                var shapeCnt = is.readByte() & 0x7f;
                o.shapeCnt = shapeCnt;
                o.left = is.readShort();
                o.right = is.readShort();
                o.top = is.readShort();
                o.bottom = is.readShort();
                o.shapes = [];
                for (var j = 0; j < shapeCnt; j++) {
                    o.shapes.push({
                        x: is.readShort(),
                        y: is.readShort()
                    })
                }
                back.push(o);
            }
            return back;
        },
        serializer: function(a) {
            var os = new OutputStream();
            for(var i=0; i< a.length; i++) {
                var obj = a[i];
				if(obj!=null) {
					os.writeByte(obj.preset);
					os.writeByte(obj.exclude);
					var tmp = ((obj.category & 0x03) << 1) + (obj.shrink & 0x01);
					os.writeByte(tmp);
					obj.shapeCnt = obj.shapes.length & 0x7f;
					os.writeByte(obj.shapeCnt);
					os.writeShort(obj.left);
					os.writeShort(obj.right);
					os.writeShort(obj.top);
					os.writeShort(obj.bottom);
					for (var shapeidx = 0; shapeidx < obj.shapeCnt; shapeidx++) {
						os.writeShort(obj.shapes[shapeidx].x);
						os.writeShort(obj.shapes[shapeidx].y);
					}
				} else {
                    //write unavailable regions to keep the order...
                    os.writeByte(0); //preset
                    os.writeByte(0); //exclude
                    os.writeByte(0); //category and shrink
                    os.writeByte(0); //shape count
                    os.writeShort(0); //left
                    os.writeShort(0); //right
                    os.writeShort(0); //top
                    os.writeShort(0); //bottom
                }
            }
            return os.getBytes();
        }
    };

	RCPCommands.CONF_CERTIFICATE_OPTIONS = { opcode: 0x0bea, datatype: "P_OCTET", format: [ "maxLabelLength|4|NUMBER", "certStoreSupport|1|NUMBER" ] };

	RCPCommands.CONF_CERTIFICATE_REQUEST_OPTIONS = {
		opcode: 0x0bed,
		datatype: "P_OCTET",
		parser: function (b) {
			var o = {};
			var is = new InputStream(b);
			o.maxLabelLength = is.readInt();
			o.maxIPStringLength = is.readInt();
			o.keyTypes = new Array(is.readInt());
			o.srvTypes = new Array(is.readInt());
			for(var i=0; i< o.keyTypes.length; i++) {
				var kType = {};
				kType.id = is.readInt();
				kType.label = is.readString(64);
				o.keyTypes[i] = kType;
			}
			for(var i=0; i< o.srvTypes.length; i++) {
				var sType = {};
				sType.id = is.readInt();
				sType.label = is.readString(64);
				o.srvTypes[i] = sType;
			}
			return o;
		}
	};

	RCPCommands.CONF_CERTIFICATE_USAGE_OPTIONS = {
		opcode: 0x0bf3,
		datatype: "P_OCTET",
		parser: function (b) {
			var o = {};
			var is = new InputStream(b);
			o.writeSupport = is.readInt();
			o.maxLabelLength = is.readInt();
			o.maxNbrOfLabelsPerUsage = is.readInt();
			o.usages = new Array(is.readInt());
			for(var i=0; i< o.usages.length; i++) {
				var usage = {};
				usage.id = is.readInt();
				usage.label = is.readString(64);
				o.usages[i] = usage;
			}
			return o;
		}
	};

	RCPCommands.CONF_CERTIFICATE_USAGE = {
        USAGE_HTTPS_SERVER: 0,
        USAGE_EAP_TLS_CLIENT: 1,
        USAGE_TLS_DATE_CLIENT: 2,
        USAGE_EAP_TLS_TRUSTED: 0x80000000,
        USAGE_USER_AUTH_TRUSTED: 0x80000001,
        USAGE_TLS_DATE_TRUSTED: 0x80000002,
        USAGE_ADFS_CA_TRUSTED: 0x80000003,
        USAGE_CBS_TRUSTED: 0x80000004,
		opcode: 0x0bf2,
		datatype: "P_OCTET",
		parser: function (b) {
			var usages = {
				usageid: 0,
				files: []
			};
			var is = new InputStream(b);
			while(is.available()>4) {
				var len = is.readShort();
				var tag = is.readShort();
				if (tag == 0 && len >= 4) {
					usages.usageid = is.readInt();
				} else if (tag == 1 && len > 4) {
					var fname = is.readString(len - 4).trim();
					usages.files.push(fname);
				} else {
					is.readBytes(len - 4);
				}
			}
			return usages;
		},
		serializer: function(usages) {
			var out = new OutputStream();
			out.writeShort(8);
			out.writeShort(0);
			out.writeInt(usages.usageid);
			for (var i = 0; i < usages.files.length; i++) {
				out.writeShort(usages.files[i].length + 4);
				out.writeShort(1);
				out.writeString(usages.files[i]);
			}
			return out.getBytes();
		}
	};

	RCPCommands.CONF_CERTIFICATE_LIST = {

		TYPE_CERTIFICATE: 1,
		TYPE_SIGNING_REQUEST: 2,
		TYPE_KEY: 3,

        PROTECTION_FACDEFAULT: 0x01,
        PROTECTION_DELETE: 0x02,

		opcode: 0x0beb,
		datatype: "P_OCTET",
		parser: function (b) {
			var back = [];
			var is = new InputStream(b);
			while (is.available() >= 4) {
				var o = {};
				o.len = is.readShort();
				o.tag = is.readShort();
				o.data = is.readBytes(o.len-4);
				back.push(o);
			}
			//parse single list entries
			for(var i=0; i<back.length; i++) {
				if(back[i].tag != 0) throw ("wrong tag in certificate list");
				is = new InputStream(back[i].data);
				while (is.available() >= 4) {
					var entry = {};
					entry.len = is.readShort();
					entry.tag = is.readShort();
					switch (entry.tag) {
						case 1:
							//label
							back[i].label = is.readString(entry.len - 4);
							break;
						case 2:
							//type
							back[i].type = is.readNumber(entry.len - 4);
							break;
						case 3:
							//common name
							back[i].cname = is.readUTF16(entry.len - 4);
							break;
                        case 4:
                            //protection bitmap
                            back[i].protection = is.readNumber(entry.len - 4);
                            break;
                        case 5:
                            //issuer common name
                            back[i].issuercname = is.readUTF16(entry.len - 4);
                            break;
                        case 6:
                            //not after date (2 digits year)
                            back[i].notafter = is.readUTF16(entry.len - 4);
                            break;
                        case 7:
                            //not after date (4 digits year)
                            back[i].notafterfull = is.readUTF16(entry.len - 4);
                            break;
                        case 8:
                            //key type (same value as in CONF_CERTIFICATE_REQUEST_OPTIONS
                            back[i].keytype = is.readNumber(entry.len - 4);
                            break;
						default:
							back[i]['tag_'+entry.tag] = is.readBytes(entry.len - 4);
							break;
					}
				}
			}
			return back;
		}
	};

    RCPCommands.CONF_EAP_GET_IDENTITY_LIST = {
        opcode: 0x0c4d,
        datatype: "P_OCTET",
        parser: function(b) {
            var back = {};
            var tags = RCPParser.parseTaggedRCPCommand(b);
            //tag 0 is the enclosing list tag
            if(tags[0] && tags[0].length>0) {
                //first (and only) tag 0 object
                var tag0 = tags[0][0];
                //inner tags
                back.identity_chain = [];
                var innertags = RCPParser.parseTaggedRCPCommand(tag0.data);
                if(innertags[1]) {
                    back.subject_alt_name = DataHelper.nbrArrayToChars(innertags[1][0].data, 2);
                    back.identity_chain.push(back.subject_alt_name);
                }
                if(innertags[2]) {
                    back.common_name = DataHelper.nbrArrayToChars(innertags[2][0].data, 2);
                    back.identity_chain.push(back.common_name);
                }
                if(innertags[3]) {
                    back.conf_identity = DataHelper.nbrArrayToChars(innertags[3][0].data, 2);
                    back.identity_chain.push(back.conf_identity);
                }
                if(innertags[4]) {
                    back.no_identity = true;
                    back.identity_chain = [];
                }
            } else if(tags[4] && tags[4].length>0) {
                back.no_identity = true;
                back.identity_chain = [];
			}
            return back;
        }
    };

	RCPCommands.CONF_VIPROC_RE_GEO_PRIMITIVES = {
		//type of primitive
		CONST_FIELD: 0x2,
		CONST_LINE: 0x14,
		CONST_ROUTE: 0x15,
		//inside mode
		CONST_ANY_PIXEL: 0x1,
		CONST_ALL_PIXEL: 0x2,
		CONST_CENTER: 0x4,
		//area mode
		CONST_STAYING: 0x1,
		CONST_ENTERING: 0x2,
		CONST_LEAVING: 0x4,
		opcode: 0x0bae,
		datatype: "P_OCTET",
		parser: function(b) {
			var back = [];
			var is = new InputStream(b);
			while (is.available() >= 4) {
				var o = {};
				o.type = is.readShort();
				var tmp = is.readShort();
				o.flags = (tmp&0xF000)>>12;
				o.length = tmp&0x0FFF;
				o.id = is.readShort();
				o.debouncetime = is.readShort();
				switch(o.type) {
					case this.CONST_LINE:
						o.type_string = "line";
						o.direction = is.readByte();
						o.pts = new Array(is.readByte());
						is.readShort(); //reserved
						for(var i=0; i< o.pts.length; i++) {
							o.pts[i] = {
								x: is.readShort(),
								y: is.readShort()
							};
						}
						break;
					case this.CONST_FIELD:
						o.type_string = "field";
						o.insidemode = is.readByte();
						o.areamode = is.readByte();
						o.pts = new Array(is.readByte());
						is.readByte(); //reserved
						for(var i=0; i< o.pts.length; i++) {
							o.pts[i] = {
								x: is.readShort(),
								y: is.readShort()
							};
						}
						break;
					case this.CONST_ROUTE:
						o.type_string = "route";
						o.direction = is.readByte();
						o.max_gap = is.readByte();
						o.min_percentage = is.readByte();
						o.pts = new Array(is.readByte());
						for(var i=0; i< o.pts.length; i++) {
							o.pts[i] = {
								x: is.readShort(),
								y: is.readShort(),
								d: is.readShort()
							};
						}
						break;
					default:
						o.type_string = "unknown";
						o.data = is.readBytes(o.length-4);
				}
				back.push(o);
			}
			return back;
		},
		serializer: function(o) {
			var os = new OutputStream();
			for (var i = 0; i < o.length; i++) {
				os.writeShort(o[i].type);
				switch(o[i].type) {
					case this.CONST_LINE:
						var l = 8 + o[i].pts.length * 8; //2 Bytes id, 2 Bytes debouncetime, 1 Byte direction, 1 Byte nbrVertices, 2 Bytes reserved
						var sTmp = (o[i].flags<<12)+(l&0x0FFF);
						os.writeShort(sTmp);
						os.writeShort(o[i].id);
						os.writeShort(o[i].debouncetime);
						os.writeByte(o[i].direction);
						os.writeByte(o[i].pts.length);
						os.writeShort(0); //reserved
						for(var j=0; j< o[i].pts.length; j++) {
							os.writeShort(o[i].pts[j].x);
							os.writeShort(o[i].pts[j].y);
						}
						break;
					case this.CONST_FIELD:
						var l = 8 + o[i].pts.length * 8; //2 Bytes id, 2 Bytes debouncetime, 1 Byte insidemode, 1 Byte areamode, 1 Bytes nbrVertices, 1 Byte reserved
						var sTmp = (o[i].flags<<12)+(l&0x0FFF);
						os.writeShort(sTmp);
						os.writeShort(o[i].id);
						os.writeShort(o[i].debouncetime);
						os.writeByte(o[i].insidemode);
						os.writeByte(o[i].areamode);
						os.writeByte(o[i].pts.length);
						os.writeByte(0); //reserved
						for(var j=0; j< o[i].pts.length; j++) {
							os.writeShort(o[i].pts[j].x);
							os.writeShort(o[i].pts[j].y);
						}
						break;
					case this.CONST_ROUTE:
						var l = 8 + o[i].pts.length * 12; //2 Bytes id, 2 Bytes debouncetime, 1 Byte direction, 1 Byte max_gap, 1 Byte min_percentage, 1 Bytes nbrVertices
						var sTmp = (o[i].flags<<12)+(l&0x0FFF);
						os.writeShort(sTmp);
						os.writeShort(o[i].id);
						os.writeShort(o[i].debouncetime);
						os.writeByte(o[i].direction);
						os.writeByte(o[i].max_gap);
						os.writeByte(o[i].min_percentage);
						os.writeByte(o[i].pts.length);
						for(var j=0; j< o[i].pts.length; j++) {
							os.writeShort(o[i].pts[j].x);
							os.writeShort(o[i].pts[j].y);
							os.writeShort(o[i].pts[j].d);
						}
						break;
					default:
						var l = o[i].data.length+4;
						var sTmp = (o[i].flags<<12)+(l&0x0FFF);
						os.writeShort(sTmp);
						os.writeShort(o[i].id);
						os.writeShort(o[i].debouncetime);
						os.writeBytes(o[i].data);
						break;

				}
			}
			return os.getBytes();
		}
	};

	RCPCommands.CONF_ENC_STAMPING_PROPERTIES = {
		opcode: 0x0bb3,
		datatype: 'P_OCTET',
		parser: function(b) {
			var s = new InputStream(b);
			return s.available() < 20 ? {} : {
				lineSize: s.readShort(),
				lineCount: s.readShort(),
				alarmLineCount: s.readByte(),
				timeSupport: s.readByte() == 1,
				msSupport: s.readByte() == 1,
				transparentSupport: s.readByte() == 1,
				bannerSupport: s.readByte() == 1,
                sysConAreas: s.readByte(),
                spinnerSupport: s.readByte() == 1,
                bigFontSupport: s.readByte() == 1,
                seperateLogoArea: s.readByte() == 1,
                infoSupport: s.readByte() == 1,
                logoType: s.readByte(),
                customStampingLines: s.readByte(),
                colorSupport: s.readByte() == 1,
                customFontSupport: s.readByte() == 1
			};
		}
	};

	RCPCommands.CONF_JPEG_STREAM_SETUP_OPTIONS_VERBOSE = {
		opcode: 0x0c00,
		datatype: "P_OCTET",
		parser: function (b) {
			var back = {
                resolutions: [],
                unknown: []
            };
			var is = new InputStream(b);
			while(is.available()>=4) {
				var o = {};
				o.length = is.readShort();
				o.tag = is.readShort();
				if (o.tag == 0) {
					o.id = is.readInt();
					o.width = is.readInt();
					o.height = is.readInt();
                    is.readInt(); //reserved
                    back.resolutions.push(o);
				} else {
					o.data = is.readBytes(o.length - 4);
                    back.unknown.push(o);
				}

			}
            return back;
		}
	};

    RCPCommands.CONF_JPEG_STREAM_FRAME_RATES = {
        opcode: 0x0c81,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {
                framerates: [],
                unknown: []
            };
            var is = new InputStream(b);
            while(is.available()>=4) {
                var o = {};
                o.length = is.readShort();
                o.tag = is.readShort();
                if (o.tag == 1) {
                    var cnt = (o.length - 4) / 4;
                    for(var i=0; i<cnt; i++) {
                        back.framerates.push(is.readInt());
                    }
                } else {
                    o.data = is.readBytes(back.length - 4);
                    back.unknown.push(o);
                }

            }
            return back;
        }
    };

    RCPCommands.CONF_VCD_OPERATOR_PARAMS = {
        opcode: 0x0a1b,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var o = {};
            o.id = is.readInt();
            o.tags = {};
            while(is.available()>=4) {
                var tag = is.readShort();
                var len = is.readShort();
                if(tag!=0 || len!=0) {
                    o.tags[tag] = {};
                    if (tag == 0x11) {
                        //rule engine script
                        var s = {};
                        s.language = is.readByte();
                        s.version = is.readShort();
                        s.encoding = is.readByte();
                        var bScript = is.readBytes(len - 4);
                        if(s.encoding==0) {
                            //plain text
                            s.data = DataHelper.nbrArrayToChars(bScript);
                        } else {
                            s.data = bScript;
                        }
                        o.tags[tag].script = s;
                    } else {
                        o.tags[tag].bytes = is.readBytes(len);
                    }
                }
            }
            return o;
        },
        serializer: function(o) {
            var os = new OutputStream();
            os.writeInt(o.id);
            if(o.tags[0x11]) {
                var s = o.tags[0x11];
                var script = s.data;
                var b = DataHelper.charsToNbrArray(script, 1);
                os.writeShort(0x11);
                os.writeShort(b.length+4);
                os.writeByte(s.language);
                os.writeShort(s.version);
                os.writeByte(s.encoding);
                os.writeBytes(b);
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_USER_AUTH_MODE = {
        AUTHMODE_PASSWORD: 1,
        AUTHMODE_CERTIFICATE: 2,
        AUTHMODE_ADSERVER: 4,
        opcode: 0x0be3,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {};
            var is = new InputStream(b);
            while (is.available() >= 4) {
                var entry = {};
                entry.len = is.readShort();
                entry.tag = is.readShort();
                switch (entry.tag) {
                    case 0:
                        //auth modes
                        back.authmode = is.readNumber(entry.len - 4);
                        break;
                    default:
                        back['tag_'+entry.tag] = is.readBytes(entry.len - 4);
                        break;
                }
            }
            return back;
        },
        serializer: function (o) {
            alert("WRITING AUTH_MODE NOT YET IMPLEMENTED");
        }
    };

    RCPCommands.CONF_ISCSI_MULTIPATH_STATE = {
        ISCSI_CONNECTION_OFFLINE: 0x1,                      //The connection is offline and not in a working state
        ISCSI_CONNECTION_MAIN_PATH: 0x2,                    //The connection is connected via the main IP (main path) and working optimal
        ISCSI_CONNECTION_PREF_ALT_PATH: 0x4,                //The connection is connected via an alternative path, but this is a prefered one. So the connection runs optimal but not through the inital path
        ISCSI_CONNECTION_ALT_PATH: 0x8,                     //The connection runs through an alternative path which is not declared as being optimal or not optimal. Connection will go back to the prefered path when possible
        ISCSI_CONNECTION_NON_OPT_PATH: 0x10,                //Connection runs on a non optimal path (lower performance) and will try to go back to an prefered path as soon as possible
        ISCSI_CONNECTION_CLOSING: 0x20,                     //The session is about to be closed gracefully. There are no more users on this session and it will be closed.
        ISCSI_CONNECTION_MAIN_PATH_ALT_PATH_BROKEN: 0x40,   //The session is about to be closed gracefully. There are no more users on this session and it will be closed.
        opcode: 0x0c14,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = [];
            var tags = RCPParser.parseTaggedRCPCommand(b);
            if(tags[0]) {
                //0: group tag
                for(var i=0; i<tags[0].length; i++) {
                    var p = RCPParser.parseTaggedRCPCommand(tags[0][i].data);
                    var o = {};
                    if(p[1]) o.targetIp = ip2string(p[1][0].data);
                    if(p[2]) o.connectedIp = ip2string(p[2][0].data);
                    if(p[3]) o.status = DataHelper.nbrArrayToNbr(p[3][0].data);
                    if(p[4]) o.noconnection = false;
                    if(p[5]) o.targetIdx = DataHelper.nbrArrayToNbr(p[5][0].data);
                    if(p[6]) o.multipathSupport = DataHelper.nbrArrayToNbr(p[6][0].data);
                    back.push(o);
                }
            } else if (tags[4]) {
                var o = {};
                o.noconnection = true;
                back.push(o);
            }
            return back;
        }
    };

    RCPCommands.CONF_SCHEDULED_PTZ_PROFILES = {
        opcode: 0x0c1f,
        datatype: "P_OCTET",
        parser: function (b, res) {
            var a = [];
            var is = new InputStream(b);
            while(is.available()>=8) {
                var o = {};
                o.cam = res.conf.rcpnum;
                o.action = is.readShort();
                o.flags = is.readByte();
                is.readByte();
                is.readInt();
                a.push(o);
            }
            return a;
        },
        serializer: function(a) {
            if(a.length!=10) {
                console.error("10 profiles are required for CONF_SCHEDULED_PTZ_PROFILES")
                return [];
            }
            var os = new OutputStream();
            for(var i=0; i< a.length; i++) {
                os.writeShort(a[i].action);
                os.writeByte(a[i].flags);
                os.writeByte(0);
                os.writeInt(0);
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VIDEO_INPUT_FORMAT_EX = {
        ROTATE_0_NO_MIRROR: 0,
        ROTATE_0_MIRROR: 1,
        ROTATE_90_NO_MIRROR: 2,
        ROTATE_90_MIRROR: 3,
        ROTATE_180_NO_MIRROR: 4,
        ROTATE_180_MIRROR: 5,
        ROTATE_270_NO_MIRROR: 6,
        ROTATE_270_MIRROR: 7,
        opcode: 0x0b10,
        datatype: "P_OCTET",
        parser: function (b, res) {
            var back = {};
            back.formatmode = b[0];
            back.formatid = b[1];
            back.rotation = (b[2] & 6) * 45;
            back.mirror = (b[2] & 1) > 0;
            back.customrotation = (b[4]<<8) + b[5];
            back.rotationmode = b[6];
            return back;
        },
        serializer: function(o) {
            m_logger.debug("saving CONF_VIDEO_INPUT_FORMAT_EX: ", o);
            var b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            b[0] = o.formatmode || 0;
            b[1] = o.formatid;
            b[2] = (o.rotation / 45) || 0;
            if(o.mirror) b[2] += 1;
            b[4] = (o.customrotation & 0xFF00) >> 8;
            b[5] = o.customrotation & 0xFF;
            b[6] = o.rotationmode;
            return b;
        }
    };

    RCPCommands.CONF_VIDEO_INPUT_FORMAT_EX_VERBOSE = {
        ROTATE_0: 0x1,
        ROTATE_0_MIRROR: 0x2,
        ROTATE_90: 0x4,
        ROTATE_90_MIRROR: 0x8,
        ROTATE_180: 0x10,
        ROTATE_180_MIRROR: 0x20,
        ROTATE_270: 0x40,
        ROTATE_270_MIRROR: 0x80,
        opcode: 0x0bfb,
        datatype: "P_OCTET",
        parser: function (b, res) {
            var back = [];
            var tags = RCPParser.parseTaggedRCPCommand(b);
            if(tags[0]) {
                for(var i=0; i<tags[0].length; i++) {
                    var is = new InputStream(tags[0][i].data);
                    var o = {};
                    o.id = is.readByte();
                    o.infobits = is.readByte();
                    o.crop = (o.infobits&0x1) != 0;
                    o.hdrcnt = (o.infobits&0xE)>>1;
                    o.customrotation = (o.infobits&0x10) != 0;
                    o.hdrxmode = (o.infobits&0x20) != 0;
                    o.rotate = is.readByte();
                    o.reserved = is.readByte();
                    o.width = is.readInt();
                    o.height = is.readInt();
                    o.framerate = is.readInt();
                    o.minframerate = o.framerate;
                    if(is.available()>=4) {
                        o.minframerate = is.readInt();
                    }
                    back.push(o);
                }
            }
            RCPHelper.fixVideoInputOptionLabels(back);
            m_logger.debug('CONF_VIDEO_INPUT_FORMAT_EX_VERBOSE: ', back);
            return back;
        }
    };

    RCPCommands.CONF_SENSOR_ORIENTATION = {
        opcode: 0x0c39,
        datatype: "P_OCTET",
        parser: function (b, res) {
            var back = {};
            var tmpIs;
            var tags = RCPParser.parseTaggedRCPCommand(b);
            if(tags[1]) {   //pan (magnetic)
                tmpIs = new InputStream(tags[1][0].data);
                back.pan = tmpIs.readInt();
                back.pan = back.pan / Math.pow(2, 32) * 360;
                back.panError = tmpIs.readInt();
                back.panError = back.panError / Math.pow(2, 32) * 360;
            }
            if(tags[2]) {   //tilt
                tmpIs = new InputStream(tags[2][0].data);
                back.tilt = tmpIs.readInt();
                back.tilt = back.tilt / Math.pow(2, 32) * 360;
                back.tiltError = tmpIs.readInt();
                back.tiltError = back.tiltError / Math.pow(2, 32) * 360;
            }
            if(tags[3]) {   //roll
                tmpIs = new InputStream(tags[3][0].data);
                back.roll = tmpIs.readInt();
                back.roll = back.roll / Math.pow(2, 32) * 360;
                back.rollError = tmpIs.readInt();
                back.rollError = back.rollError / Math.pow(2, 32) * 360;
            }
            if(tags[4]) {   //image rotation
                back.imgrotation = DataHelper.nbrArrayToNbr(tags[4][0].data, true);
                back.imgrotation = back.imgrotation / Math.pow(2, 32) * 360;
            } else {
                back.imgrotation = 0;
            }
            if(tags[5]) {   //image rotation
                tmpIs = new InputStream(tags[5][0].data);
                back.vector = {};
                back.vector.x = tmpIs.readSignedInt();
                back.vector.y = tmpIs.readSignedInt();
                back.vector.z = tmpIs.readSignedInt();
            } else {
                back.vector = { x: 0, y: 0, z: 0 };
            }
            return back;
        }
    };

    RCPCommands.CONF_AUXILIARY_POWER = {
        opcode: 0x0c55,
        datatype: "T_DWORD",
        parser: function (val) {
            var back = {};
            back.available = (val&0x1)!=0;
            back.enabled = (val&0x2)!=0;
            back.overload_available = (val&0x4)!=0;
            back.overloaded = (val&0x8)!=0;
            back.overload_count = (val&0xFF00)>>8;
            return back;
        },
        serializer: function (o) {
            var back = 0;
            if(o.enabled) back |= 0x2;
            return back;
        }
    };

    RCPCommands.CONF_SOFT_VARIANT_ID_OPTIONS = {
        opcode: 0x0bb6,
        datatype: 'P_OCTET',
        parser: function(b) {
            var o = {
                count: 0,
                noFactoryDefaults: false,
                flags: 0,
                variants: []
            }
            if (b.length > 0) {
                var s = new InputStream(b);
                o.count = s.readByte();
                o.flags = s.readByte();
                o.noFactoryDefaults = (o.flags&1) > 0;
                s.readShort();
                for (var i = 0; i < o.count; i++) {
                    o.variants.push({value: s.readInt(), name: DataHelper.nbrArrayToChars(s.readBytes(60))});
                }
            }
            return o;
        }
    };

    RCPCommands.CONF_ADV_USER_SETTINGS_LIST = {
        opcode: 0x0bdc,
        datatype: "P_OCTET",
        parser: function(b) {
            var users = [];
            var is = new InputStream(b);
            var len, tag, data;
            while(is.available()>=4) {
                len = is.readShort();
                tag = is.readShort();
                data = is.readBytes(len - 4);
                users.push(RCPCommands.CONF_ADV_USER_SETTINGS.parseUser(data));
            }
            //fix order so the list starts with service - user - live
            var firstusers = ['service', 'user', 'live'];
            for(var i=firstusers.length-1; i>=0; i--) {
                for(var j=0; j<users.length; j++) {
                    if(users[j].name == firstusers[i]) {
                        users.unshift(users[j]);
                        users.splice(j+1, 1);
                    }
                }
            }

            return users;
        }
    };

    RCPCommands.CONF_ADV_USER_SETTINGS = {
        USER_LEVEL_USER: 1,
        USER_LEVEL_SERVICE: 2,
        USER_LEVEL_LIVE: 3,
        USER_TYPE_DELETE: 0,
        USER_TYPE_PWD: 1,
        USER_TYPE_CERT: 2,
        opcode: 0x0bda,
        datatype: "P_OCTET",
        parser: function(b) {
            return this.parseUser(b);
        },
        serializer: function(user) {
            var os = new OutputStream();
            os.writeShort(0);   //length (updated at the end)
            os.writeShort(0);   //tag 0 (user entry)
            var bName = os.stringToUtf8ByteArray(user.name);
            os.writeShort(bName.length + 4);  //length of tag 1
            os.writeShort(1);   //tag 1 (username)
            os.writeBytes(bName);
            if(typeof(user.type)!="undefined") {
                os.writeShort(8);   //length of tag 2 (always 8)
                os.writeShort(2);   //tag 2 (user type)
                os.writeInt(user.type);
            }
            if(typeof(user.level)!="undefined") {
                os.writeShort(8);   //length of tag 3 (always 8)
                os.writeShort(3);   //tag 3 (user level)
                os.writeInt(user.level);
            }
            if(typeof(user.password)!="undefined") {
                os.writeShort(user.password.length + 4);
                os.writeShort(4);   //tag 4 (user password)
                os.writeString(user.password);
            }
            var b = os.getBytes();
            b[0] = (b.length&0xff00) >> 8;
            b[1] = b.length&0x00ff;
            return b;
        },
        parseUser: function(b) {
            var user = {};
            var is = new InputStream(b);
            var len, tag;
            while(is.available()>=4) {
                len = is.readShort();
                tag = is.readShort();
                switch(tag) {
                    case 0:
                        //user entry tag
                        break;
                    case 1:
                        user.name = is.readUTF8(len - 4);
                        break;
                    case 2:
                        user.type = is.readInt();
                        break;
                    case 3:
                        user.level = is.readInt();
                        break;
                    case 4:
                        user.password = is.readString(len - 4);
                        break;
                    case 5:
                        user.expires = $.byteutils.bytes2int(is.readBytes(len - 4), true);
                        break;
                    default:
                        var tmp = is.readBytes(len - 4);
                        console.log("unknown tag: "+tag+": ", tmp);

                }
            }
            return user;
        }
    };

    RCPCommands.CONF_LIST_OF_VIPROC_SCENES = {
        opcode: 0x0a41,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var scenes = [], scenenbr, namelength;
            var text = getMessage('motiondetector_gen4_position_scene');
            while (is.available() > 1) {
                scenenbr = is.readByte();
                namelength = is.readByte();
                if (scenenbr > 0) {
                    scenes.push({ index: scenenbr, name: namelength == 0 ? text.replace('%s', scenenbr) : bytes2stringUTF16(is.readBytes(namelength)) });
                }
            }
            return scenes;
        }
    };

    RCPCommands.CONF_NETWORK_SERVICES = {
        opcode: 0x0c62,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = [];
            var tags = RCPParser.parseTaggedRCPCommand(b);
            //each tag 0 contains one network entry
            if(tags[0] && tags[0].length>0) {
                for(var i=0; i<tags[0].length; i++) {
                    var innertags = RCPParser.parseTaggedRCPCommand(tags[0][i].data);
					var entry = {};
                    $.each(innertags, function (idx, t) {
                    	if(t && t.length>0) {
                            switch (t[0].tag) {
                                case 1:
                                    entry.id = DataHelper.nbrArrayToNbr(t[0].data);
                                    break;
                                case 2:
                                	entry.name = DataHelper.nbrArrayToChars(t[0].data);
                                	break;
                                case 3:
                                    entry.enabled = DataHelper.nbrArrayToNbr(t[0].data);
                                    break;
                                case 4:
                                    entry.port = DataHelper.nbrArrayToNbr(t[0].data);
                                    break;
                                default:
                                    entry["tag_" + t[0].tag] = t;
                            }
                        }
                    });
                    back.push(entry);
				}
            }
            return back;
        },
        serializer: function(a) {
            var os = new OutputStream();
			for(var i=0; i<a.length; i++) {
                var tempOs = new OutputStream();
				//id
                tempOs.writeShort(8);
                tempOs.writeShort(1);
                tempOs.writeInt(a[i].id);
				//label
                tempOs.writeShort(4 + a[i].name.length);
                tempOs.writeShort(2);
                tempOs.writeString(a[i].name);
				//enabled
                tempOs.writeShort(8);
                tempOs.writeShort(3);
                tempOs.writeInt(a[i].enabled > 0 ? 1 : 0);
                //port
				if(typeof(a[i].port)!="undefined") {
                    tempOs.writeShort(8);
                    tempOs.writeShort(4);
                    tempOs.writeInt(a[i].port);
				}
				var b = tempOs.getBytes();
				os.writeShort(4 + b.length);
				os.writeShort(0x8000);
				os.writeBytes(b);
			}
			return os.getBytes();
        }
    };

    RCPCommands.CONF_ALARM_INPUT_CAPABILITIES = {
        opcode: 0x0c6a,
        datatype: "P_OCTET",
        parser: function (b) {
            var inputs = [];
            var is = new InputStream(b);
            var len = is.readInt();
            for(var i=0; i<len; i++) {
                var caps = {
                    full: is.readInt()
                };
                caps.supervised = (caps.full&0x1)>0;
                inputs.push(caps);
            }
            return inputs;
        }
    };

    RCPCommands.CONF_GETPROFILE_ALGO_PRESET_NAME_LIST = {
        ALGOS: {
            IVA_EVA: 0x1,
            FLOW: 0x2,
            MOTION: 0x4
        },
        opcode: 0x0c6c,
        datatype: "P_OCTET",
        parser: function (b) {
            var profiles = [];
            var is = new InputStream(b);
            var cnt = is.readByte();
            is.readByte();
            for(var i=0; i<cnt; i++) {
                var profile = {};
                profile.algo = is.readShort();
                profile.preset = is.readShort();
                profile.name = is.readUTF16(32);
                profiles.push(profile);
            }
            return profiles;
        }
    };

    RCPCommands.CONF_STAMP = {
        CONST: {
            VIS_HIDDEN:0,
            VIS_VISIBLE: 1,
            POS_CUSTOM: 3,
            AREA_GLOBAL: 0,
            AREA_TIMESTAMP: 1,
            AREA_NAMESTAMP: 2,
            AREA_ALARMSTAMP: 3,
            AREA_INFOSTAMP: 4,
            AREA_SPINNER: 5,
            AREA_SYSCON1: 6,
            AREA_SYSCON2: 7,
            AREA_SYSCON3: 8,
            AREA_LOGO: 9,
            AREA_CUSTOM: 10
        },
        opcode: 0x0c71,
        datatype: "P_OCTET",
        parser: function (b) {
            var regions = [];
            var is = new InputStream(b);
            while(is.available() >= 4) {
                var region = {};
                region.id = is.readShort();
                var regionlength = is.readShort();
                var bytes2read = regionlength;
                while(bytes2read >= 4) {
                    var tag = {};
                    tag.id = is.readShort();
                    tag.length = is.readShort();
                    tag.data = is.readBytes(tag.length);
                    switch(tag.id) {
                        case 0x1:
                            region['visible'] = tag.data[0] == this.CONST.VIS_VISIBLE;
                            break;
                        case 0x2:
                            var pos_type = tag.data[0];
                            region['position'] = pos_type;
                            if(pos_type == this.CONST.POS_CUSTOM) {
                                region['position_data'] = { x: tag.data[1], y: tag.data[2]};
                            } else {
                                region['position_data'] = { x: 0, y: 0};
                            }
                            break;
                        case 0x3:
                            m_logger.info("stamping tag 3 (TEXT) received which should not be available when reading: ", tag, region);
                            region['text'] = tag.data;
                            break;
                        case 0x4:
                            if (tag.data.length == 1) {
                                region['fontsize'] = tag.data[0];
                            } else if (tag.data.length == 12) {
                                region['fontsize'] = {};
                                region['fontsize'].mode = tag.data[0];
                                region['fontsize'].size = (tag.data[2] << 8) + tag.data[3];
                            } else {
                                console.log('unknown tag length for font size: ', tag);
                            }
                            break;
                        case 0x5:
                            region['transparent'] = tag.data[0];
                            break;
                        case 0x6:
                            var colorcfg = {};
                            colorcfg.mode = tag.data[0];
                            colorcfg.background = {
                                red: tag.data[4],
                                green: tag.data[5],
                                blue: tag.data[6]
                            };
                            colorcfg.text = {
                                red: tag.data[8],
                                green: tag.data[9],
                                blue: tag.data[10]
                            };
                            region['color'] = colorcfg;
                            break;
                        default:
                            m_logger.info("unknown stamping tag: ", tag);
                            region['tag'+tag.id] = tag;
                    }
                    bytes2read -= 2 + 2 + tag.length;
                }
                regions.push(region);
            }
            return regions;
        },
        serializer: function(regions) {
            regions = regions || [];
            var osFull = new OutputStream();
            for(var r=0; r<regions.length; r++) {
                var os = new OutputStream();
                if(typeof(regions[r].visible) != "undefined") {
                    os.writeShort(1);
                    os.writeShort(1);
                    os.writeByte(regions[r].visible ? 1 : 0);
                }
                if(typeof(regions[r].position) != "undefined") {
                    if(typeof(regions[r].position_data) === 'undefined') {
                        regions[r].position_data = { x: 0, y: 0 };
                    }
					os.writeShort(2);
					os.writeShort(3);
					os.writeByte(regions[r].position);
					os.writeByte(regions[r].position_data.x);
					os.writeByte(regions[r].position_data.y);
                }
                if(typeof(regions[r].text) != "undefined") {
                    os.writeShort(3);
                    os.writeShort(regions[r].text.length + 3); //currently only ascii...
                    os.writeByte(0);                           //ascii
                    os.writeShort(32);                         //line length
                    os.writeString(regions[r].text);
                }
                if(typeof(regions[r].fontsize) != "undefined") {
                    if (typeof(regions[r].fontsize) == "number") {
                        os.writeShort(4);
                        os.writeShort(1);
                        os.writeByte(regions[r].fontsize ? 1 : 0)
                    } else if (typeof(regions[r].fontsize.mode) != "undefined") {
                        os.writeShort(4);
                        os.writeShort(12);
                        os.writeByte(regions[r].fontsize.mode);
                        os.writeByte(0);
                        os.writeShort(regions[r].fontsize.size);
                        os.writeInt(0);
                        os.writeInt(0);
                    } else {
                        console.log('unknown font format: ', regions[r].fontsize);
                    }
                }
                if(typeof(regions[r].transparent) != "undefined") {
                    os.writeShort(5);
                    os.writeShort(1);
                    os.writeByte(regions[r].transparent ? 1 : 0)
                }
                if(typeof(regions[r].color) != "undefined") {
                    os.writeShort(6);
                    os.writeShort(12);
                    os.writeByte(0); // mode
                    os.writeByte(0); // reserved
                    os.writeShort(0); // reserved
                    os.writeByte(regions[r].color.background.red);
                    os.writeByte(regions[r].color.background.green);
                    os.writeByte(regions[r].color.background.blue);
                    os.writeByte(0);
                    os.writeByte(regions[r].color.text.red);
                    os.writeByte(regions[r].color.text.green);
                    os.writeByte(regions[r].color.text.blue);
                    os.writeByte(0);
                }
                osFull.writeShort(regions[r].id);
                osFull.writeShort(os.available());
                osFull.writeBytes(os.getBytes());
            }
            return osFull.getBytes();
        }
    };

    RCPCommands.CONF_STAMP_V2 = {
        CONST: {
            VIS_HIDDEN:0,
            VIS_VISIBLE: 1,
            POS_CUSTOM: 3,
            AREA_GLOBAL: 0,
            AREA_TIMESTAMP: 1,
            AREA_NAMESTAMP: 2,
            AREA_ALARMSTAMP: 3,
            AREA_INFOSTAMP: 4,
            AREA_SPINNER: 5,
            AREA_SYSCON1: 6,
            AREA_SYSCON2: 7,
            AREA_SYSCON3: 8,
            AREA_LOGO: 9,
            AREA_CUSTOM: 10
        },
        opcode: 0x0c71,
        datatype: "P_OCTET",
        parser: function (b) {
            var regions = [];
            var is = new InputStream(b);
            while(is.available() >= 4) {
                var region = {};
                region.id = is.readShort();
                var regionlength = is.readShort();
                var bytes2read = regionlength;
                while(bytes2read >= 4) {
                    var tag = {};
                    tag.id = is.readShort();
                    tag.length = is.readShort();
                    tag.data = is.readBytes(tag.length);
                    switch(tag.id) {
                        case 0x1:
                            region['visible'] = tag.data[0] == this.CONST.VIS_VISIBLE;
                            break;
                        case 0x2:
                            var pos_type = tag.data[0];
                            region['position'] = {
                                mode: pos_type,
                                x: 0,
                                y: 0
                            };
                            if(region['position'].mode == this.CONST.POS_CUSTOM) {
                                region['position'].x = tag.data[1];
                                region['position'].y = tag.data[2];
                            }
                            break;
                        case 0x3:
                            m_logger.info("stamping tag 3 (TEXT) received which should not be available when reading: ", tag, region);
                            region['text'] = tag.data;
                            break;
                        case 0x4:
                            region['fontsize'] = {
                                mode: tag.data[0]
                            };
                            if (tag.data.length == 1) {
                                region['fontsize'].version = 1;
                            } else if (tag.data.length == 12) {
                                region['fontsize'].version = 2;
                                region['fontsize'].size = (tag.data[2] << 8) + tag.data[3];
                            } else {
                                console.log('unknown tag length for font size: ', tag);
                            }
                            break;
                        case 0x5:
                            region['transparent'] = tag.data[0];
                            break;
                        case 0x6:
                            region['color'] = {
                                mode: tag.data[0]
                            }
                            region['color'].background = {
                                red: tag.data[4],
                                green: tag.data[5],
                                blue: tag.data[6]
                            };
                            region['color'].text = {
                                red: tag.data[8],
                                green: tag.data[9],
                                blue: tag.data[10]
                            };
                            break;
                        default:
                            m_logger.info("unknown stamping tag: ", tag);
                            region['tag'+tag.id] = tag;
                    }
                    bytes2read -= 2 + 2 + tag.length;
                }
                regions.push(region);
            }
            return regions;
        },
        serializer: function(regions) {
            regions = regions || [];
            var osFull = new OutputStream();
            for(var r=0; r<regions.length; r++) {
                if(regions[r]) {
                    var os = new OutputStream();
                    if (typeof (regions[r].visible) != "undefined") {
                        os.writeShort(1);
                        os.writeShort(1);
                        os.writeByte(regions[r].visible ? 1 : 0);
                    }
                    if (typeof (regions[r].position) != "undefined") {
                        os.writeShort(2);
                        os.writeShort(3);
                        os.writeByte(regions[r].position.mode);
                        os.writeByte(regions[r].position.x);
                        os.writeByte(regions[r].position.y);
                    }
                    if (typeof (regions[r].text) != "undefined") {
                        os.writeShort(3);
                        os.writeShort(regions[r].text.length + 3); //currently only ascii...
                        os.writeByte(0);                           //ascii
                        os.writeShort(32);                         //line length
                        os.writeString(regions[r].text);
                    }
                    if (typeof (regions[r].fontsize) != "undefined") {
                        if (regions[r].fontsize.version == 1) {
                            os.writeShort(4);
                            os.writeShort(1);
                            os.writeByte(regions[r].fontsize.mode)
                        } else if (regions[r].fontsize.version == 2) {
                            os.writeShort(4);
                            os.writeShort(12);
                            os.writeByte(regions[r].fontsize.mode);
                            os.writeByte(0);
                            os.writeShort(regions[r].fontsize.size);
                            os.writeInt(0);
                            os.writeInt(0);
                        } else {
                            console.log('unknown fontsize version: ', regions[r].fontsize.version, regions[r].fontsize);
                        }
                    }
                    if (typeof (regions[r].transparent) != "undefined") {
                        os.writeShort(5);
                        os.writeShort(1);
                        os.writeByte(regions[r].transparent ? 1 : 0)
                    }
                    if (typeof (regions[r].color) != "undefined") {
                        os.writeShort(6);
                        os.writeShort(12);
                        os.writeByte(0); // mode
                        os.writeByte(0); // reserved
                        os.writeShort(0); // reserved
                        os.writeByte(regions[r].color.background.red);
                        os.writeByte(regions[r].color.background.green);
                        os.writeByte(regions[r].color.background.blue);
                        os.writeByte(0);
                        os.writeByte(regions[r].color.text.red);
                        os.writeByte(regions[r].color.text.green);
                        os.writeByte(regions[r].color.text.blue);
                        os.writeByte(0);
                    }
                    osFull.writeShort(regions[r].id);
                    osFull.writeShort(os.available());
                    osFull.writeBytes(os.getBytes());
                }
            }
            return osFull.getBytes();
        }
    };

    RCPCommands.CONF_STAMP_ATTR_NAME_V2 = {
        opcode: 0x0936,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var obj = {};
            if (is.available() >= 12) {
                obj.x = is.readByte();
                obj.y = is.readByte();
                is.readShort();
                var attributes = is.readInt();
                obj.transparent = (attributes & 0x100000) > 0;
                obj.banner = (attributes & 0x200000) > 0;
                obj.customcolor = (attributes & 0x200) > 0;
                is.readShort();
                var flags = is.readShort();
                obj.logo_enabled = (flags & 2) > 0;
                obj.logo_right = (flags & 4) > 0;
                obj.logo_only = (flags & 8) > 0;
            }
            return obj;
        },
        serializer: function(obj) {
            var os = new OutputStream();
            os.writeByte(obj.x);
            os.writeByte(obj.y);
            os.writeShort(0);
            var attributes = 0;
            if(obj.transparent) attributes |= 0x100000;
            if(obj.banner) attributes |= 0x200000;
            if(obj.customcolor) attributes |= 0x200;
            os.writeInt(attributes);
            os.writeShort(0);
            var flags = 0;
            if(obj.logo_enabled) flags |= 0x2;
            if(obj.logo_right) flags |= 0x4;
            if(obj.logo_only) flags |= 0x8;
            os.writeShort(flags);
            return os.getBytes();
        }
    }

    RCPCommands.CONF_STAMP_ATTR_ALARM_V2 = {
        opcode: 0x0938,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var obj = {};
            if (is.available() >= 12) {
                obj.x = is.readByte();
                obj.y = is.readByte();
                is.readShort();
                var attributes = is.readInt();
                obj.transparent = (attributes & 0x100000) > 0;
                obj.customcolor = (attributes & 0x200) > 0;
                is.readInt();
            }
            return obj;
        },
        serializer: function (obj) {
            var os = new OutputStream();
            os.writeByte(obj.x);
            os.writeByte(obj.y);
            os.writeShort(0);
            var attributes = 0;
            if(obj.transparent) attributes |= 0x100000;
            if(obj.customcolor) attributes |= 0x200;
            os.writeInt(attributes);
            os.writeInt(0);
            return os.getBytes();
        }
    }

    RCPCommands.CONF_ALARM_DISP_VAL = {
        opcode: 0x008e,
        datatype: "T_OCTET",
        CONST: {
            OFF: 1,
            ON: 2,
            CUSTOM: 3
        }
    }

    RCPCommands.CONF_STREAM_SECURITY_V2 = {
        CONST: {
            OFF: 0,
            WATERMARK: 1,
            MD5: 2,
            SHA1: 3,
            SHA256: 4
        },
        opcode: 0x0bb8,
        datatype: 'P_OCTET',
        parser: function(b) {
            var s = new InputStream(b);
            return s.available() < 8 ? {} : {
                hashId: s.readShort(),
                signatureId: s.readShort(),
                signatureDistance: s.readInt()
            };
        },
        serializer: function(o) {
            var s = new OutputStream();
            s.writeShort(o.hashId);
            s.writeShort(o.signatureId);
            s.writeInt(o.signatureDistance);
            return s.getBytes();
        }
    };

    RCPCommands.CONF_STREAM_SECURITY_OPTIONS = {
        opcode: 0x0bb9,
        datatype: 'P_OCTET',
        parser: function(b) {
            var s = new InputStream(b);
            return s.available() < 20 ? {} : {
                maxHashId: s.readShort(),
                maxSignatureId: s.readShort(),
                minSignatureDistance: s.readInt(),
                maxSignatureDistance: s.readInt(),
                midSignatureDistance: s.readInt(),
                lowSignatureDistance: s.readInt()
            };
        }
    };

    RCPCommands.CONF_RCP_CODER_LIST = {
        MEDIATYPE: {
            VIDEO: 0x1,
            AUDIO: 0x2,
            DATA: 0x3
        },
        DIRECTION: {
            IN: 0x0,
            OUT: 0x1
        },
        FLAGS: {
            EXTENDED: 0x1
        },
        VIDEOFORMAT: {
            META: 0x10,
            H264: 0x40,
            JPEG: 0x80,
            H265: 0x200,
            RECORDED: 0x4000
        },
        AUDIOFORMAT: {
            G711: 0x1,
            AAC: 0x2,
            G711_8KHZ: 0x4,
            L16_16KHZ: 0x8,
            L16: 0x10,
            RECORDED: 0x4000
        },
        opcode: 0xff11,
        datatype: "P_OCTET",
        parser: function(b, conf) {
            var s = new InputStream(b);
            if (s.available() == 0) {
                return null;
            }
            var coders = [];
            var mediatype = (DataHelper.strToNumber(conf.conf.payload) & 0xFF0000) >> 16;
            var direction = (DataHelper.strToNumber(conf.conf.payload) & 0x00FF00) >> 8;
            var flags = DataHelper.strToNumber(conf.conf.payload) & 0x0000FF;
            while (s.available() > 0) {
                var o = {};
                o.mediatype = mediatype;
                o.direction = direction;
                o.flags = flags;
                if(o.mediatype == this.MEDIATYPE.VIDEO) {
                    o.identifier = s.readShort();
                    o.compression = s.readShort();
                    o.codingcurrent = s.readShort();
                    o.resolution = s.readShort();
                    o.resolutioncurrent = s.readShort();
                    s.readShort();
                    s.readInt();
                } else if(o.mediatype == this.MEDIATYPE.AUDIO) {
                    o.identifier = s.readShort();
                    o.codingcaps = s.readShort();
                    o.codingcurrent = s.readShort();
                    o.codingparamcaps = s.readShort();
                    o.codingparamcurrent = s.readShort();
                    s.readShort();
                    s.readInt();
                } else if(o.mediatype == this.MEDIATYPE.DATA) {
                    o.identifier = s.readShort();
                    o.codingcaps = s.readShort();
                    o.codingcurrent = s.readShort();
                    o.codingparamcaps = s.readShort();
                    o.codingparamcurrent = s.readShort();
                    s.readShort();
                    s.readInt();
                }else {
                	o.data = s.readBytes(s.available());
				}
                coders.push(o);
            }
            return coders;
        }
    };


    RCPCommands.CONF_CBS_COMMISION = {
        opcode: 0x0c72,
        datatype: "P_OCTET",
        serializer: function (obj) {
            var os = new OutputStream();
            if(obj.cancel) {
                os.writeByte(0);
            } else {
                os.writeByte(1);
                os.writeUTF8(obj.username);
                os.writeByte(0);
                os.writeUTF8(obj.password);
                os.writeByte(0);
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VIPROC_CUSTOM_PARAMETERS_TAGS = {
        opcode: 0x0bac,
        datatype: "P_OCTET",
        parser: function(b) {
            var tags = {};
            var is = new InputStream(b);
            while (is.available() >= 4) {
                var obj = {};
                obj.tag = is.readShort();
                obj.len = is.readShort();
                obj.bytes = is.readBytes(obj.len);
                if (obj.bytes.length > 0) {
                    switch (obj.tag) {
                        case 0x1F:
                            obj.label = "DeviceCapabilities";
                            break;
                        default:
                            obj.label = "Tag_0x" + obj.tag.toString(16);
                            break;
                    }
                    tags[obj.label] = obj;
                }
            }
            m_logger.info("viproc custom tags: ", tags);
            return tags;
        },
        serializer: function (obj) {
            throw("serializer not yet implemented")
        }
    };

    RCPCommands.CONF_VIPROC_GLOBAL_PARAMETERS_TAGS = {
        opcode: 0x0c68,
        datatype: "P_OCTET",
        parser: function(b) {
            var tags = {};
            var is = new InputStream(b);
            while (is.available() >= 4) {
                var obj = {};
                obj.tag = is.readShort();
                obj.len = is.readShort();
                obj.bytes = is.readBytes(obj.len);
                if (obj.bytes.length > 0) {
                    switch (obj.tag) {
                        case 0x58:
                            obj.label = "MultipleVideoStreamSettings";
                            obj.value = obj.bytes[0];
                            break;
                        default:
                            obj.label = "Tag_0x" + obj.tag.toString(16);
                    }
                    tags[obj.label] = obj;
                }
            }
            return tags;
        },
        serializer: function (tags) {
            m_logger.debug("serialize global parameters: ", tags);
            var os = new OutputStream();
            $.each(tags, function(key, tag) {
                switch (key) {
                    case "MultipleVideoStreamSettings":
                        os.writeShort(0x58);
                        os.writeShort(1);
                        os.writeByte(tag.value);
                        break;
                    default:
                        m_logger.info("unknown tag: ", tag);
                }
            });
            return os.getBytes();
        }
    };

    RCPCommands.CONF_PREDEFINED_MOUNTING_LIST = {
        MOUNTPOS: {
            CUSTOM: -1,
            NOTSET: -2
        },
        opcode: 0x0c76,
        datatype: "P_STRING",
        parser: function (s) {
            s = s.replace(/;$/, "");
            var p = s.split(';');
            var entries = [];
            for(var i=0; i<p.length; i++) {
                var entry = {};
                if(p[i].toLowerCase() === "notset_xxx") {
                    entry.name = "notset";
                    entry.value = RCPCommands.CONF_PREDEFINED_MOUNTING_LIST.MOUNTPOS.NOTSET;
                    entry = null;
                } else if(p[i].toLowerCase() === "custom_xxx") {
                    entry.name = "custom";
                    entry.value = RCPCommands.CONF_PREDEFINED_MOUNTING_LIST.MOUNTPOS.CUSTOM;
                } else {
                    entry.name = p[i].substring(0, p[i].length - 4);
                    entry.value = parseInt(p[i].substring(p[i].length - 3), 10);
                }
                if(entry != null) {
                    entries.push(entry);
                }
            }
            return entries;
        }
    };

    RCPCommands.CONF_H264_ENC_BASE_OP_MODE_CAPS_VERBOSE = {
        opcode: 0x0c7c,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var data = {};
            data.streamcount = is.readInt();
            data.combinations = [];
            data.allmodes = {};
            while(is.available()>=36) {
                var desc = { streams: [] };
                for (var stream = 0; stream < data.streamcount; stream++) {
                    var obj = {};
                    obj.basemodeid = is.readInt();
                    obj.height = is.readInt();
                    obj.width = is.readInt();
                    obj.copy = is.readByte();
                    obj.sd = is.readByte();
                    obj.framedependent = is.readByte();
                    obj.crop = is.readByte();
                    obj.skip = is.readByte();
                    obj.roi = is.readByte();
                    obj.ptz = is.readByte();
                    obj.dual = is.readByte();
                    obj.exclusive = is.readByte();
                    obj.flags = is.readByte();
                    is.readBytes(14);
                    desc.streams.push(obj);
                    if(!data.allmodes[obj.basemodeid]) {
                        data.allmodes[obj.basemodeid] = obj;
                    }
                }
                data.combinations.push(desc);
            }
            return data;
        }
    };

    RCPCommands.CONF_EXT_ENCODER_BITRATE_STATISTICS = {
        opcode: 0x0c85,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var data = {
                time: {},
                records: []
            };
            data.time.ss2000Local = is.readInt();
            data.time.ss2000UTC = is.readInt();
            is.readBytes(24);
            while(is.available() > 32) {
                var record = {};
                record.timebaseSec = is.readInt();
                record.lastCellActiveSinceSec = is.readInt();
                record.elementCount = is.readInt();
                record.reserved = is.readBytes(20);
                record.bitrates = [];
                for(var i=0; i<record.elementCount; i++) {
                    record.bitrates.push(is.readInt());
                }
                data.records.push(record);
            }
            return data;
        }
    };

    RCPCommands.CONF_EXT_RECORDER_BITRATE_STATISTICS = {
        opcode: 0x0c94,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var data = {
                time: {},
                records: []
            };
            data.time.ss2000Local = is.readInt();
            data.time.ss2000UTC = is.readInt();
            is.readBytes(24);
            while(is.available() > 32) {
                var record = {};
                record.timebaseSec = is.readInt();
                record.lastCellActiveSinceSec = is.readInt();
                record.elementCount = is.readInt();
                record.reserved = is.readBytes(20);
                record.bitrates = [];
                for(var i=0; i<record.elementCount; i++) {
                    record.bitrates.push(is.readInt());
                }
                data.records.push(record);
            }
            return data;
        }
    };

    RCPCommands.CONF_CONFIG_SEALING_STATUS = {
        opcode: 0x0c8c,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var data = {};
            data.status = is.readByte();
            is.readBytes(3);
            data.sealTimestamp = is.readInt();
            data.sealRandom = is.readInt();
            data.systemTimestamp = is.readInt();
            return data;
        }
    };

    RCPCommands.CONF_SD_CARD_LIFE_SPAN_STATUS = {
        opcode: 0x0c5a,
        datatype: "P_OCTET",
        parser: function (b) {
            var data = {};
            var tags = RCPParser.parseTaggedRCPCommand(b);
            for( var i=0; i<tags.length; i++ ) {
                if(tags[i]) {
                    //assuming only one entry per tag
                    var t = tags[i][0];
                    switch(t.tag) {
                        case 1:
                            data.manufacturerid = t.data[0];
                            break;
                        case 2:
                            data.productid = $.byteutils.bytes2int(t.data, true);
                            break;
                        case 3:
                            data.product = $.byteutils.charcodes2string(t.data);
                            break;
                        case 4:
                            data.nbrblocks = $.byteutils.bytes2int(t.data, true);
                            data.megabytes = Math.round(data.nbrblocks/2/1024); //since we have always 512 byte blocks
                            break;
                        case 5:
                            data.lifespanpct = t.data[0];
                            break;
                        case 6:
                            data.manufacturer = $.byteutils.charcodes2string(t.data);
                            break;
                        case 7:
                            data.serial = $.byteutils.bytes2int(t.data, true);
                            break;
                        default:
                            data["tag_"+t.tag] = t.data;
                    }
                }
            }
            return data;
        }
    };

    RCPCommands.CONF_STORAGE_MEDIUM_AVAIL = {
        TYPES: {
            NONE: 0,
            USB: 5,
            IDE: 8,
            CF: 9,
            IMG: 10,
            SD: 11,
            SPAN: 12,
            SD_NOT_INSERTED: 14,
            CF_NOT_INSERTED: 15,
            IMG_NOT_INSERTED: 16,
            SMB: 17,
            SECOND_SD: 18,
            SECOND_SD_NOT_INSERTED: 19,
            SD_OVER_USB: 22,
            SD_OVER_USB_NOT_INSERTED: 23
        },
        DESCRIPTIONS: [{
            id: 0, label: 'none', transkey: 'ssettings_none'
        }, {
            id: 5, label: 'usb', transkey: 'iscsi_rec_type3'
        }, {
            id: 8, label: 'ide', transkey: 'iscsi_rec_type2'
        }, {
            id: 9, label: 'cfcard', transkey: 'iscsi_rec_type9'
        }, {
            id: 10, label: 'imgfile', transkey: 'iscsi_rec_type10'
        }, {
            id: 11, label: 'sdcard', transkey: 'iscsi_rec_type11'
        }, {
            id: 12, label: 'spanfile', transkey: 'iscsi_rec_type12'
        }, {
            id: 14, label: 'sdcard_not_inserted', transkey: 'iscsi_rec_type14'
        }, {
            id: 15, label: 'cfcard_not_inserted', transkey: 'iscsi_rec_type15'
        }, {
            id: 16, label: 'imgfile_not_inserted', transkey: 'iscsi_rec_type16'
        }, {
            id: 17, label: 'smb_span_file', transkey: 'iscsi_rec_type17'
        }, {
            id: 18, label: 'second_sdcard', transkey: 'iscsi_rec_type18'
        }, {
            id: 19, label: 'second_sdcard_not_inserted', transkey: 'iscsi_rec_type19'
        }, {
            id: 22, label: 'sdcard_usb', transkey: 'iscsi_rec_type22'
        }, {
            id: 23, label: 'sdcard_usb_not_inserted', transkey: 'iscsi_rec_type23'
        }],
        opcode: 0x09d4,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var storages = [];
            while (is.available() >= 4) {
                var storage = {
                    type: is.readInt(),
                    label: 'unknown',
                    transkey: ''
                };
                for(var i=0; i<this.DESCRIPTIONS.length; i++) {
                    if(storage.type == this.DESCRIPTIONS[i].id) {
                        storage.label = this.DESCRIPTIONS[i].label;
                        storage.transkey = this.DESCRIPTIONS[i].transkey;
                    }
                }
                if(storage.type != this.TYPES.NONE) {
                    storages.push(storage);
                }
            }
            return storages;
        }
    };

    RCPCommands.CONF_ENC_PROFILE_RESOLUTION_OPTIONS = {
        opcode: 0x0c99,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {
                resolutions: [],
                unknown: []
            };
            var is = new InputStream(b);
            while(is.available()>=4) {
                var o = {};
                o.length = is.readShort();
                o.tag = is.readShort();
                if (o.tag == 1) {
                    o.id = is.readInt();
                    o.width = is.readInt();
                    o.height = is.readInt();
                    is.readInt(); //reserved
                    back.resolutions.push(o);
                } else if (o.tag == 2) {
                    o.stream = is.readByte();
                    o.abscoder = is.readByte();
                    is.readShort();
                    o.id = is.readInt();
                    o.width = is.readInt();
                    o.height = is.readInt();
                    is.readInt(); //reserved
                    back.resolutions.push(o);
                } else {
                    console.log('unknown tag ' + o.tag);
                    o.data = is.readBytes(o.length - 4);
                    back.unknown.push(o);
                }
            }
            return back;
        }
    };

    RCPCommands.CONF_VID_H264_ENC_BASE_OPERATION_MODE_CAPS = {
        opcode: 0x0AF9,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var streamcount = is.readInt();
            var combinations = [];
            while (is.available() >= streamcount * 4) {
                var combination = [];
                for (i = 0; i < streamcount; i++) {
                    combination.push(is.readInt());
                }
                combinations.push(combination);
            }
            return combinations;
        }
    };

    RCPCommands.CONF_VIDEO_H264_ENC_BASE_OPERATION_MODE = {
        opcode: 0x0AD3,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var res = [];
            while (is.available() >= 4) {
                res.push(is.readInt());
            }
            return res;
        },
        serializer: function(modes) {
            var os = new OutputStream();
            for(var i=0; i<modes.length; i++) {
                os.writeInt(modes[i]);
            }
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VIDEO_H264_ENC_CURRENT_PROFILE = {
        opcode: 0x0AD4,
        datatype: "P_OCTET",
        parser: function (b) {
            var is = new InputStream(b);
            var res = [];
            while (is.available() >= 4) {
                res.push(is.readInt());
            }
            return res;
        }
    };

    RCPCommands.CONF_CODER_VIDEO_OPERATION_MODE_OPTIONS = {
        opcode: 0x0ca3,
        datatype: "P_OCTET",
        parser: function (b) {
            back = {
                jpeg: false,
                h264: false,
                h265: false,
                h265_wo_bframes: false
            };
            var is = new InputStream(b);
            while(is.available()>=4) {
                var tmp = is.readInt();
                switch(tmp) {
                    case 0x00:
                        back.jpeg = true;
                        break;
                    case 0x02:
                        back.h264 = true;
                        break;
                    case 0x03:
                        back.h265 = true;
                        break;
                    case 0x103:
                        back.h265_wo_bframes = true;
                        break;
                }
            }
            return back;
        }
    };

    RCPCommands.CONF_REMOTE_PORTAL_INFO = {
        opcode: 0x0d00,
        datatype: "P_OCTET",
        getMappings: function() {
            var m = new Map();
            m.set(0x01, {name: 'camlink', type: 'string'});
            return m;
        },
        parser: function (b) {
            var info = RCPParser.parseTaggedRCPCommand_V2(b, {
                unique: true,
                simplify: true,
                length_includes_header: false,
                mappings: this.getMappings()
            });
            return info;
        }
    };

    RCPCommands.CONF_ROI_OPTIONS = {
        opcode: 0x0c7e,
        datatype: "P_OCTET",
        parser: function (val) {
            var back = {
                roi: val[0] > 0,
                roi_h264: (val[0]&0x1) > 0,
                roi_h265: (val[0]&0x2) > 0,
                roi_preset_pos_internal: val[1] > 0,
                only_positive_qp: val[2] > 0
            };
            return back;
        }
    };

    RCPCommands.CONF_VIDEO_CURRENT_PARAMS_CODNBR = {
        opcode: 0x0982,
        datatype: "T_DWORD",
        parser: function (val) {
            return val;
        }
    };

    RCPCommands.CONF_MPEG4_NAME = {
        opcode: 0x0602,
        datatype: "P_STRING",
        parser: function (val) {
            return val;
        }
    };

    RCPCommands.CONF_VIDEO_H264_ENC_CONFIG = {
        opcode: 0x0ad2,
        datatype: "P_OCTET",
        parser: function (a) {
            var is = new InputStream(a);
        	var back = {};
            back.mode = is.readInt();
			back.streams = [];
            while(is.available() >= 4) {
            	back.streams.push(is.readInt());
			}
			return back;
        },
        serializer: function(o) {
            var os = new OutputStream();
            os.writeInt(o.mode);
            for(var i=0; i<o.streams.length; i++) {
                os.writeInt(o.streams[i]);
			}
            return os.getBytes();
        }
    };

    RCPCommands.CONF_EXTERNAL_CLIENTS_LIST = {
        opcode: 0x0c9d,
        datatype: "P_OCTET",
        parser: function(val) {
            var tmp = DataHelper.nbrArrayToChars(val).split(';');
            var res = [];
            tmp.forEach(function(item) {
                if(item.length > 0) {
                    res.push({
						name: item
                    });
                }
            });
            return res;
        }
    };

    RCPCommands.CONF_EXTERNAL_CLIENTS = {
        opcode: 0x0c9e,
        datatype: "P_OCTET",
        parser: function(val) {
            var res = [];
            var is = new InputStream(val);
            while(is.available()>=3) {
                var line = is.readByte(); /* 1 based */
                var inst = is.readByte(); /* 0 based */
                var len = is.readByte();
                if(len>0) {
                    var name = DataHelper.nbrArrayToChars(is.readBytes(len));
                    res.push({
						'name': name,
						'line': line,
						'inst': inst
                    })
                }
            }
            return res;
        },
        serializer: function(a) {
            var os = new OutputStream();
            os.writeByte(a.line);
            os.writeByte(a.inst);
            os.writeByte(a.name.length);
            os.writeString(a.name);
            return os.getBytes();
        }
    };

    RCPCommands.CONF_DAY_LIGHT_SAVE_TIME_TABLE = {
        opcode: 0x0987,
        datatype: "P_OCTET",
        parser: function (b) {
            var a = [];
            var is = new InputStream(b);
            while (is.available() >= 8) {
                var obj = {};
                obj.ss2000 = is.readInt();
                obj.offset = is.readSignedInt();
                a.push(obj);
            }
            return a;
        }
    };

    RCPCommands.CONF_VIDEO_ENCODER_STATUS_EXT = {
        opcode: 0x0a90,
        datatype: "P_OCTET",
        parser: function (a, cfg) {
            var is = new InputStream(a);
            var back = {};
            back.coder = cfg.conf.rcpnum;
			back.frames = is.readInt() / 10;
			back.kbps = is.readInt();
			back.grabframes = is.readInt() / 10;
			back.lostframes = is.readInt() / 10;
			back.skipped = is.readInt() / 10;
            return back;
        }
    };

    RCPCommands.CONF_WLAN_WPS_STATUS = {
        STATES: {
            NOT_STARTED: 0,
            ONGOING: 1,
            SUCCESSFUL: 2,
            REJECTED_BY_AP: 3,
            TIMEOUT: 4,
            INVALID_PIN: 5
        },
        MODES: {
            NONE: 0,
            PBC: 1,
            PIN: 2
        },
        opcode: 0x0bc5,
        datatype: 'T_OCTET',
        parser: function (val, cfg) {
            var status_keys = ['notstarted', 'ongoing', 'success', 'rejected', 'timeout', 'invalidPIN'];
            var back = {};
            back.status = (val & 0xf0) >> 4;
            back.mode = val & 0x0f;
            if(status_keys.length > back.status) {
                back.status_key = 'wlan_wps_' + status_keys[back.status];
            }
            return back;
        }
    };

    RCPCommands.CONF_WLAN_SCAN = {
        FLAGS: {
            WEP: 0x1,
            WPA: 0x2,
            WPA2: 0x4,
            WPS: 0x8
        },
        opcode: 0x0ac6,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var back = {};
            back.accesspoints = [];
            var is = new InputStream(b);
            var cnt = is.readInt();
            for(var i=0; i<cnt; i++) {
                var ap = {};
                ap.ssid = is.readString(32);
                ap.mac = is.readBytes(6);
                ap.mac_str = DataHelper.createByteString(ap.mac, 16, "-");
                ap.strength = is.readInt();
                ap.channel = is.readInt();
                ap.flags = is.readInt();
                back.accesspoints.push(ap);
            }
            return back;
        }
    };

    RCPCommands.CONF_SYSTEM_LOAD = {
        MEDIA_STATUS: {
            NOT_INSERTED: 1,
            OK: 2,
            HARDWARE_INIT_FAILED: 3,
            HARDWARE_DRIVER_IO_ERROR: 4,
            HARDWARE_CRC_ERROR: 5,
            HARDWARE_IO_TIMEOUT: 6,
            SLOW_IO: 7,
            READONLY: 8,
            MEDIA_NOT_SUITABLE: 9,
            MEDIA_TOO_SMALL: 10
        },
        opcode: 0x0cb5,
        datatype: "P_OCTET",
        parser: function (b) {
            var containers = [];
            var back = {
                cpu: [],
                recordingmedia: [],
                unknown: []
            };
            var is = new InputStream(b);
            while (is.available() >= 4) {
                var o = {};
                o.len = is.readShort();
                o.tag = is.readShort();
                o.data = is.readBytes(o.len - 4);
                containers.push(o);
            }
            //parse single containers
            for(var i=0; i<containers.length; i++) {
                var tmp = {};
                is = new InputStream(containers[i].data);
                while (is.available() >= 4) {
                    var entry = {};
                    entry.len = is.readShort();
                    entry.tag = is.readShort();
                    switch (entry.tag) {
                        case 3:
                            //cpu idx
                            tmp.cpu_idx = is.readNumber(entry.len - 4);
                            break;
                        case 4:
                            //media idx
                            tmp.media_idx = is.readNumber(entry.len - 4);
                            break;
                        case 5:
                            //cpu-load idle
                            tmp.cpu_idle = is.readNumber(entry.len - 4);
                            break;
                        case 6:
                            //cpu-load encoder
                            tmp.cpu_encoder = is.readNumber(entry.len - 4);
                            break;
                        case 7:
                            //cpu-load vca
                            tmp.cpu_vca = is.readNumber(entry.len - 4);
                            break;
                        case 8:
                            //recording load
                            tmp.media_load = is.readNumber(entry.len - 4);
                            break;
                        case 9:
                            //recording media status
                            tmp.media_status = is.readNumber(entry.len - 4);
                            break;
                        default:
                            tmp['tag_'+entry.tag] = is.readBytes(entry.len - 4);
                            m_logger.info('[CONF_SYSTEM_LOAD] unknown tag ', entry.tag);
                    }
                }
                switch(containers[i].tag) {
                    case 1:
                        back.cpu.push(tmp);
                        break;
                    case 2:
                        back.recordingmedia.push(tmp);
                        break;
                    default:
                        back.unknown.push(tmp);
                        m_logger.info('[CONF_SYSTEM_LOAD] unknown container type ', o.tag);
                }
            }
            return back;
        }
    };

    RCPCommands.CONF_ENC_DYN_SCENE_CTRL = {
        CONST: {
            SMART_STREAM: 255
        },
        opcode: 0x0cb6,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var back = {};
            var is = new InputStream(b);
            back.enabled = is.readByte();
            back.stream = is.readByte();
            return back;
        },
        serializer: function(obj) {
            var os = new OutputStream();
            os.writeByte(obj.enabled);
            os.writeByte(obj.stream);
            os.writeBytes([], 14);
            return os.getBytes();
        }
    };

    RCPCommands.CONF_ENC_DYN_SCENE_CTRL_OPTIONS = {
        opcode: 0x0cb7,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var back = {};
            var is = new InputStream(b);
            back.dyn_scene_ctrl = is.readByte();
            back.multi_ipipe = is.readByte();
            return back;
        }
    };

    RCPCommands.CONF_GET_ENC_DYN_SCENE_CTRL_INFO = {
        opcode: 0x0cb8,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var back = {};
            back['modifiers'] = [];
            var is = new InputStream(b);
            while(is.available()>4) {
                var obj = {};
                obj.tag = is.readShort();
                obj.length = is.readShort();
                switch (obj.tag) {
                    case 0:
                        obj.leadingstream = is.readByte();
                        obj.currentprofile = is.readByte();
                        obj.curbitratemode = is.readByte();
                        obj.offsets = {};
                        obj.offsets.sharpness = is.readSignedByte();
                        obj.offsets.temporalnoise = is.readSignedByte();
                        obj.offsets.spatialnoise = is.readSignedByte();
                        is.readShort();
                        back['ipipeoffsets'] = obj;
                        break;
                    case 1:
                        obj.stream = is.readShort();
                        obj.reserved = is.readShort();
                        obj.modifier = is.readInt();
                        back['modifiers'].push(obj);
                        break;
                    default:
                        m_logger.info("unknown tag in CONF_GET_ENC_DYN_SCENE_CTRL_INFO: ", obj.tag);
                }
            }
            return back;
        }
    };

    RCPCommands.CONF_NBR_OF_VIRTUAL_ALARMS = {
        opcode: 0x0aed,
        datatype: 'T_DWORD',
        parser: function (val, cfg) {
            //we use max 4 virtual alarms in GUI
            return Math.min(4, val);
        }
    };

    RCPCommands.CONF_ACCOUNT_SETTINGS_V2 = {
        ACCOUNT_TYPES: {
            NONE: 0,
            FTP: 1,
            DROPBOX: 2,
            SMB: 3,
            RECORD: 4,
            AMAZON_S3: 5,
            AMAZON_KINESIS: 6,
            FILESYSTEM: 7
        },
    	getMappings: function() {
			var m = new Map();
			m.set(0x01, { name: 'type', type: 'uint32' } );
            m.set(0x02, { name: 'accountname', type: 'utf8' } );
            m.set(0x03, { name: 'url', type: 'utf8' } );
            m.set(0x04, { name: 'username', type: 'utf8' } );
            m.set(0x05, { name: 'password', type: 'utf8' } );
            m.set(0x06, { name: 'path', type: 'utf8' } );
            m.set(0x07, { name: 'flags',
				parse: function(flags) {
            		var f = DataHelper.nbrArrayToNbr(flags);
					return {
						value: f,
                        encryption: (f&0x1000000) !== 0
					}
				},
				serialize: function(o) {
					var flags = 0;
					if(o.encryption) flags |= 0x1000000;
					var os = new OutputStream();
					os.writeInt(flags);
					return os.getBytes();
				}});
            m.set(0x08, { name: 'accesskey', type: 'utf8' } );
            m.set(0x09, { name: 'accesskeysecret', type: 'utf8' } );
            m.set(0x0a, { name: 'bucketname', type: 'utf8' } );
            m.set(0x0b, { name: 'region', type: 'utf8' } );
            m.set(0x0c, { name: 'cameraid', type: 'utf8' } );
            m.set(0x0d, { name: 'fileduration', type: 'uint32' } );
            m.set(0x0e, { name: 'streamname', type: 'utf8' } );
            m.set(0x0f, { name: 'maxkbps', type: 'uint32' } );
            m.set(0x12, { name: 'kmsencryption', type: 'uint8' } );
            m.set(0x13, { name: 'kmsencryptionkey', type: 'utf8' } );
			return m;
		},
        opcode: 0x0cc0,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var account = RCPParser.parseTaggedRCPCommand_V2(b, {
            	unique: true,
				simplify: true,
				mappings: this.getMappings()
			});
            return account;
        },
        serializer: function(obj) {
			var b = RCPParser.serializeTaggedRCPCommand_V2(obj, {
                unique: true,
                mappings: this.getMappings()
            });
			return b;
		}
	};

    RCPCommands.CONF_CLOUD_WATCH_SETTINGS = {
        getMappings: function() {
            var m = new Map();
            m.set(0x08, { name: 'accesskey', type: 'utf8' } );
            m.set(0x09, { name: 'accesskeysecret', type: 'utf8' } );
            m.set(0x0b, { name: 'region', type: 'utf8' } );
            m.set(0x0e, { name: 'streamname', type: 'utf8' } );
            m.set(0x10, { name: 'group', type: 'utf8' } );
            m.set(0x11, { name: 'enable', type: 'uint8' } );
            return m;
        },
        opcode: 0x0cd6,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var cfg = RCPParser.parseTaggedRCPCommand_V2(b, {
                unique: true,
                simplify: true,
                mappings: this.getMappings()
            });
            return cfg;
        },
        serializer: function(obj) {
            var b = RCPParser.serializeTaggedRCPCommand_V2(obj, {
                unique: true,
                mappings: this.getMappings()
            });
            return b;
        }
    };

    RCPCommands.CONF_STATIC_PRIV_MSK_OVERLAY = {
        getMappings: function() {
            var m = new Map();
            m.set(0x00, {
                name: 'enabled',
                parse: function(b) {
                    return b[0] > 0;
                },
                serialize: function(enabled) {
                    var b = [0,0,0,0,0,0,0,0];
                    if(enabled) {
                        b[0] = 1;
                    }
                    return b;
                }});
            return m;
        },
        opcode: 0x0cd3,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var cfg = RCPParser.parseTaggedRCPCommand_V2(b, {
                unique: true,
                simplify: true,
                mappings: this.getMappings()
            });
            return cfg;
        },
        serializer: function(obj) {
            var b = RCPParser.serializeTaggedRCPCommand_V2(obj, {
                unique: true,
                mappings: this.getMappings()
            });
            return b;
        }
    };

    RCPCommands.CONF_STATIC_PRIV_MSK_OVERLAY_OPTIONS = {
        opcode: 0x0cd9,
        datatype: 'P_OCTET',
        parser: function (b, cfg) {
            var o = {};
            o.crosshair = b[0] != 0;
            return o;
        }
    };

    RCPCommands.CONF_UPLOAD_HISTORY = {
        opcode: 0x0B44,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {
                entries: []
            };
            var is = new InputStream(b);
            back.uploadStartedCount = is.readShort();
            back.uploadSuccessCount = is.readShort();
            back.uploadFailedCount = is.readShort();
            back.newestUploadIndex = is.readByte();
            back.reserved = is.readByte();
            while(is.available()>=12) {
                var entry = {};
                entry.version = is.readInt();
                entry.version_parsed = numberToVersion(entry.version);
                entry.ss2000 = is.readInt();
                entry.flags = is.readInt();
                entry.flags_parsed = {
                    upload_started: (entry.flags&0x1) !== 0,
                    upload_finished: (entry.flags&0x2) !== 0,
                    upload_failed: (entry.flags&0x4) !== 0,
                    upload_success: (entry.flags&0x8) !== 0,
                    device_restarted: (entry.flags&0x10) !== 0,
                    error_code: (entry.flags&0xFF0000) >> 16,
                    file_type: (entry.flags&0xFF000000) >> 24,
                };

                back.entries.push(entry);
            }
            back.entries.sort(function(a, b) {
                return b.ss2000 - a.ss2000;
            });
            return back;
        }
    };

    RCPCommands.CONF_ISCSI_DISCOVERY_NEW = {
        opcode: 0x09cc,
        datatype: "P_OCTET",
        parser: function (b) {
            return DataHelper.nbrArrayToChars(b);
        },
        serializer: function (obj, cfg) {
            console.log('serializer: ', obj, cfg);
            var os = new OutputStream();
            os.writeBytes(DataHelper.ip2bytes(obj.ip));
            var b = DataHelper.charsToNbrArray(obj.password);
            os.writeBytes(b, 64);
            return os.getBytes();
        }
    };

    RCPCommands.CONF_VIPROC_REF_ORIENTATION = {
        opcode: 0x0cf2,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {};
            var is = new InputStream(b);
            back.x = {};
            back.x.rad = is.readInt() * (2*Math.PI/Math.pow(2, 32));
            back.x.deg = back.x.rad * 180 / Math.PI;
            back.y = {};
            back.y.rad = is.readInt() * (2*Math.PI/Math.pow(2, 32));
            back.y.deg = back.y.rad * 180 / Math.PI;
            back.z = {};
            back.z.rad = is.readInt() * (2*Math.PI/Math.pow(2, 32));
            back.z.deg = back.z.rad * 180 / Math.PI;
            return back;
        },
    };

    RCPCommands.CONF_ENC_PROFILE_PARAMS = {
        opcode: 0x0cb9,
        datatype: "P_OCTET",
        getMappings: function() {
            var m = new Map();
            m.set(0x0602, {name: 'name', type: 'utf8'});
            m.set(0x0604, {name: 'iframe_dist', type: 'uint32'});
            m.set(0x0606, {name: 'skip', type: 'uint32'});
            m.set(0x0607, {name: 'datarate_target', type: 'uint32'});
            m.set(0x0608, {name: 'resolution', type: 'uint32', parse: function(b) {
                    var v = DataHelper.nbrArrayToNbr(b, true);
                    if (v < 0xFFFF) {
                        return {
                            id: v
                        };
                    } else {
                        return {
                            id: v,
                            width: v >> 16,
                            height: v & 0xFFFF
                        }
                    }
                }, serialize: function(res) {
                    var os = new OutputStream();
                    os.writeInt(res.id);
                    return os.getBytes();
                }});
            m.set(0x0612, {name: 'datarate_max', type: 'uint32'});
            m.set(0x0620, {name: 'min_pframe_qp', type: 'uint32'});
            m.set(0x0621, {name: 'ipframe_delta_qp', type: 'int32'});
            m.set(0x0622, {name: 'averaging_period', type: 'uint32'});
            m.set(0x0624, {name: 'background_delta_qp', type: 'int32'});
            m.set(0x0625, {name: 'object_delta_qp', type: 'int32'});
            m.set(0x0627, {name: 'pref_list_size', type: 'uint8'});
            m.set(0x0a94, {name: 'gop_structure', type: 'uint8'});
            m.set(0x0c37, {name: 'bitrate_optimization', parse: function(b) {
                    return b[0];
                }, serialize: function(b) {
                    return [b,0,0,0,0,0,0,0];
                }});
            return m;
        },
        parser: function (b) {
            var cfg = {};
            var tags = RCPParser.parseTaggedRCPCommand_V2(b, {
                tagformat: "LTD",
                length_includes_header: true,
                unique: true,
                simplify: true,
                mappings: this.getMappings()
            });
            return tags;
        },
        serializer: function (obj, cfg) {
            console.log('saving encoder params: ', obj);
            var b = RCPParser.serializeTaggedRCPCommand_V2(obj, {
                tagformat: "LTD",
                length_includes_header: true,
                unique: true,
                simplify: true,
                mappings: this.getMappings()
            });
            return b;
        }
    };

    RCPCommands.CONF_DEVICE_TYPE_IDS = {
        opcode: 0x0b07,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {};
            var is = new InputStream(b);
            back.productid = is.readInt();
            back.variantid_full = is.readInt();
            back.oemid = (back.variantid_full&0xFF000000) >> 24;
            back.variantid = back.variantid_full&0xFFFFFF;
            back.frontendid = is.readInt();
            return back;
        }
    };

    RCPCommands.CONF_SOCKET_KNOCKER_STATUS = {
        STATES: {
            NOT_RUNNING: 0,
            CONNECTING: 1,
            CONNECTED: 2
        },
        REASONS: {
            AS_EXPECTED: 0,
            UNKNOWN: 1,
            DHCP_OFF: 2,
            MAX_KNOCKING_ATTEMPTS_REACHED: 3,
            MAX_KNOCKING_TIME_REACHED: 4,
            URL_NOT_RESOLVED: 5,
            NO_RESPONSE: 6
        },
        opcode: 0x0b98,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {};
            back.state = b[0];
            back.reason = b[1];
            return back;
        }
    };

    RCPCommands.CONF_CBS_STATUS = {
        STATES: {
            REGISTERED: 0,
            ONGOING: 1,
            UNREGISTERED: 2,
            UNKNOWN: 0xFF
        },
        opcode: 0x0c73,
        datatype: "P_OCTET",
        parser: function (b) {
            var back = {};
            back.cbs_state = b[0];
            back.cbs_action_state = b[1];
            return back;
        }
    };

    RCPCommands.CONF_AUPROC_MELPEGEL = {
        opcode: 0x0a7b,
        datatype: "P_OCTET",
        parser: function (b) {
            var cnt = b.length / 2;
            var back  ={
                levels: b.slice(0, cnt),
                thresholds: b.slice(cnt)
            }
            return back;
        }
    };

    RCPCommands.CONF_AUPROC_CONFIG = {
        opcode: 0x0a7a,
        datatype: "P_OCTET",
        parser: function (b) {
            var s = new InputStream(b);
            var back = {};
            back.version = s.readInt();
            back.triggerlevels = s.readBytes(16);
            back.sensitivities = s.readBytes(16);
            back.reserved = s.readByte();
            var flags = s.readByte();
            back.enabled = (flags & 0x80) != 0;
            return back;
        },
        serializer: function (obj, cfg) {
            var s = new OutputStream();
            s.writeInt(obj.version || 0);
            s.writeBytes(DataHelper.adjustByteArray(obj.triggerlevels, 16));
            s.writeBytes(DataHelper.adjustByteArray(obj.sensitivities, 16));
            s.writeByte(0); //reserved
            var flags = 0;
            if (obj.enabled) flags |= 0x80;
            s.writeByte(flags);
            s.writeShort(0); //reserved
            return s.getBytes();
        }
    }
    RCPCommands.CONF_RECOMMENDED_JPEG_POSTING_RESOLUTIONS = {
        opcode: 0x0D09,
        datatype: "P_OCTET",
        getMappings: function() {
            var m = new Map();
            m.set(0x01, { name: 'resolution',
                parse: function(b) {
                    var is = new InputStream(b);
                    var reso = {};
                    is.readInt(); // reserved
                    reso.width = is.readInt();
                    reso.height = is.readInt();
                    return reso;
                }
            });
            return m;
        },
        parser: function (b) {
            var tags = RCPParser.parseTaggedRCPCommand_V2(b, {
                unique: false,
                simplify: false,
                tagformat: 'LTD',
                length_includes_header: true,
                mappings: this.getMappings()
            });
            var o = {
                resolutions: []
            }
            var resotags = tags.get(1);
            if (resotags) {
                for (var i = 0; i < resotags.length; i++) {
                    o.resolutions.push(resotags[i].parsed);
                }
            }
            o.resolutions.sort(function(a, b) {
                // sort by image width
                if (a.width === b.width) {
                    return b.height - a.height;
                } else {
                    return b.width - a.width;
                }
            });
            return o;
        }
    }

	RCPCommands.CONF_STARTPAGE_PRESENTATION_SWITCHES = { opcode: 0x028f, datatype: 'T_DWORD' };
	RCPCommands.CONF_DYNAMIC_HTML_NAME = { opcode: 0x0298, datatype: 'P_STRING' };
	RCPCommands.CONF_DYNAMIC_HTML_DATA = { opcode: 0x0299, datatype: 'P_OCTET' };
	RCPCommands.CONF_AUDIO_ON_OFF = { opcode: 0x000c, datatype: 'F_FLAG' };

	return RCPCommands;

})(RCPCommands || {}, jQuery);

var BicomCommands = (function(BicomCommands, $, undefined) {

    BicomCommands.ImageMeasurementInExRegion = {
        server: 0x04,
        object: 0x05B1,
        parser: function(b) {
            var is = new InputStream(b);
            var back = {};
            back.reserved = is.readByte();
            back.nbrOfVertices = is.readByte();
            back.action = is.readByte();
            back.regionNbr = is.readByte();
            back.points = [];
            for(var i=0; i<back.nbrOfVertices; i++) {
                back.points.push({
                    y: is.readShort(),
                    x: is.readShort()
                })
            }
            return back;
        },
        serializer: function(obj) {
            var os = new OutputStream();
            os.writeByte(0);
            os.writeByte(obj.nbrOfVertices);
            os.writeByte(obj.action);
            os.writeByte(obj.regionNbr);
            for(var i=0; i<obj.points.length; i++) {
                os.writeShort(obj.points[i].y);
                os.writeShort(obj.points[i].x);
            }
            //fill up to 5 points...
            for(var i=0; i<5-obj.points.length; i++) {
                os.writeShort(0);
                os.writeShort(0);
            }
            return os.getBytes();
        }
    };
    BicomCommands.FrameFormat = {
        server: 0x04,
        object: 0x0430,
        parser: function (b) {
            var is = new InputStream(b);
            var back = {};
            back.format = is.readShort();
            back.isHDRX = back.format >= 4096 && back.format <= 8191;
            return back;
        }
    };

    BicomCommands.ImageMeasurementInExStatus = {
        server: 0x04,
        object: 0x05B2,
        format: [ "reserved|2|BYTES", "status|1|NUMBER", "regionNbr|1|NUMBER" ]
    };

    BicomCommands.ImageMeasurementInExSupport = {
        server: 0x04,
        object: 0x05B3,
        format: [ "reserved|2|BYTES", "maxNbrOfRegions|1|NUMBER", "maxNbrOfPoints|1|NUMBER" ]
    };

    BicomCommands.ImageMeasurementInExSupport2 = {
        server: 0x04,
        object: 0x05B3,
        format: [ {
            name: "reserved",
            length: 2,
            type: "BYTES"
        }, {
            name: "maxNbrOfRegions",
            length: 1,
            type: "NUMBER"
        }, {
            name: "maxNbrOfPoints",
            length: 1,
            type: "NUMBER"
        }]
    };

    BicomCommands.BandingMode = {
        INDOOR: 0,
        OUTDOOR: 1,
        server: 0x04,
        object: 0x0117,
        bicomtype: "NUMBER"
    };

    BicomCommands.MainsFrequency = {
        FRQ50: 0,
        FRQ60: 1,
        server: 0x04,
        object: 0x0116,
        bicomtype: "NUMBER"
    };

    return BicomCommands;

})(BicomCommands || {}, jQuery);

if(typeof("".trim)=="undefined") {
	String.prototype.trim = function() {
		return this.replace(/^\s+/, "").replace(/\s+$/, "");
	};
}
