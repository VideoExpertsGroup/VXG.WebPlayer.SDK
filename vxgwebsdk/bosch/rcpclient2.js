function RCPClient2(sessionid, rcpurl) {

	var m_sessionid = sessionid || 0,
	m_retriggertime = 5000, //ms
        m_log = LogFactory.getLogger('rcpclient');
        var m_rcpurl = rcpurl;
        var m_username = undefined;
        var m_password = undefined;

	function retrigger() {
		if(m_sessionid === 0) return;
		var conf = { sessionid: m_sessionid, rcpurl: m_rcpurl };
		if (m_username && m_password){
			conf.username = m_username;
			conf.password = m_password;
		}
		RCP.readRCP(0xFFC2, "T_DWORD", conf).done(function(res) {
            m_log('retrigger success');
            if(m_sessionid !== 0) {
                window.setTimeout(retrigger, m_retriggertime);
            }
        }).fail(function() {
            m_log('retrigger failed');
        })
	}

	/**** public methods ****/

	this.setRCPUrl = function(url) {
		m_rcpurl = url;
	}

	this.setAuth = function (username, password) {
		m_username = username;
		m_password = password;
	}

	this.setSessionId = function(sid) {
		m_sessionid = sid;
	};

	this.getSessionId = function() {
		return m_sessionid;
	};

	this.setRetriggerTime = function(ms) {
		m_retriggertime = ms;
	};

	this.connect = function(params) {
		if(!params) params = {};
		var method = params.method || 0;
		var media = params.media || 1;
		var flags = params.flags || 0;

		var os = new OutputStream();
		os.writeByte(method); //method (0: GET, 1: PUT, 0xE0: KEY_TRANSPORT)
		os.writeByte(media);  //media (1 Video, 2: Audio, 3: Data)
		os.writeByte(0);      //reserved
		os.writeByte(flags);  //flags
		os.writeInt(0);       //4 Bytes reserved

        // Media Descriptors

        // Audio
        if ((media & 2) === 2) {
            os.writeByte(4);    //MEP TCP
            os.writeByte(0x2);  //flags (2: relative addressing)
            os.writeShort(0);   //MTA Port
            os.writeInt(0);     //MTA IP
            os.writeByte(1);    //coder
            os.writeByte(1);    //line
            os.writeShort(0);   //MCTA Port
            os.writeInt(0);     //MCTA IP
            os.writeShort(1);   //coding (0x1: G.711, 0x2: AAC, ...)
            os.writeShort(0);   //reserved
            os.writeInt(0);     //reserved
        }
        
        var conf = { sessionid: m_sessionid, rcpurl: m_rcpurl };
        if (m_username && m_password){
    	    conf.username = m_username;
    	    conf.password = m_password;
        }
        return RCP.writeRCP(0xFF0C, "P_OCTET", os.getBytes(), conf).done(function(res) {
            var is = new InputStream(res.value);
            is.readShort(); //method and media
            var status = is.readByte();
	    if (res && res.conf && res.conf.sessionid){
	            m_sessionid = res.conf.sessionid;
		    if (m_retriggertime > 0) window.setTimeout(retrigger, m_retriggertime);
	    }
            if(status === 1) {
                m_log('connect primitive successful: %h', res.value);
            } else {
                m_log('connect primitive failed: %d, response: %h', status, res.value);
            }
        }).fail(function() {
            m_log('connect primitive failed');
        });
	};

	this.disconnect = function() {
		if(m_sessionid==0) return;
		var conf = { sessionid: m_sessionid, rcpurl: m_rcpurl };
		if (m_username && m_password){
			conf.username = m_username;
			conf.password = m_password;
    		}
        RCP.writeRCP(0xFF0D, "P_OCTET", [], conf).done(function(res) {
            m_log('disconnect success');
            m_sessionid = 0;
        }).fail(function() {
            m_log('disconnect failed');
        })
	};
}
