var AudioBackChannel = function(params) {

    var params = params || {};

    var m_log = LogFactory.getLogger('audiobackchannel'),
        m_rcpclient = params.rcpclient || null,
        m_socket = null,
        m_audiosrc = null,
        m_seq_nbr = 0,
        m_timestamp = 0,
        m_audiobuffer = new FixLengthByteBuffer(656);
        

    function connectRCP() {
        return new Promise(function(resolve, reject) {
            if (!m_rcpclient) {
                m_rcpclient = new RCPClient2();
            }
            var rcpurl = params.bosch_backaud_camera_protocol + '//' + params.bosch_backaud_camera_ip + ':' + params.bosch_backaud_camera_port + '/' + params.bosch_backaud_camera_path + 'rcp.xml';
            m_rcpclient.setRCPUrl(rcpurl);
	    if (params.username && params.password){
		m_rcpclient.setAuth(params.username, params.password);
	    }

            m_rcpclient.connect({
                method: 0x1,    //PUT
                media: 0x2,     //audio
                flags: 0x0
            }).done(function(res) {
                resolve(res);
            }).fail(function(e) {
                reject(e);
            })
        });
    }

    function setParams( new_params) {
	params = new_params;
    }

    function connectAudioSocket(cfg) {
        cfg = cfg || {};
        return new Promise(function(resolve, reject) {
            var sesid = m_rcpclient.getSessionId();
	    if (sesid == 0 && cfg.sessionid){
		sesid = cfg.sessionid;
	    }

            var strSessionid = DataHelper.blowup(sesid.toString(16), 8);
            var strMediatype = "02"; //01: video, 02: audio
            var strDirection = "00"; //01: receive, 00: transmit
            var strLine = DataHelper.blowup(1, 2); //input nr
            var strCoder = DataHelper.blowup(1, 2); //relative coder nbr

            var url = params.bosch_backaud_camera_protocol == "https:" ? "wss://" : "ws://";
            url += params.bosch_backaud_camera_ip + ':' + params.bosch_backaud_camera_port + '/' + params.bosch_backaud_camera_path + "websocket/media_tunnel/" + strSessionid + "/" + strMediatype + "/" + strDirection + "/" + strLine + "/" + strCoder + "?index=1";
            m_log("connecting '" + url + "'...");
            m_socket = new WebSocket(url);
            m_socket.onopen = function () {
                m_log('socket opened');
                resolve();
            };
            m_socket.onclose = function () {
                m_log('socket closed');
            };
            m_socket.onerror = function (err) {
                m_log('socket error: %o', err);
                reject(err);
            };
            m_socket.onmessage = function (msg) {
                m_log('socket msg: %o', msg);
            };
        });
    }

    function connect() {
        return new Promise(function(resolve, reject) {
            connectRCP().then(function(res) {
                m_log('rcp connected');
                connectAudioSocket(res.conf).then(function(res) {
                    m_log('websocket connected');
                    m_seq_nbr = 0;
                    m_timestamp = 0;
                    m_audiosrc = new AudioSource(function(data) {
                        // m_log('data received from audiosrc: ', data);
                        chunkReceived(data);
                    }, params);
                    m_audiosrc.connect().then(function() {
                        resolve();
                    }).catch(function(res) {
                        reject(res)
                    });
                }).catch(function(res) {
                    m_log('websocket connection failed: %o', res);
                    reject(res);
                })
            }).catch(function(res) {
                m_log('rcp connection failed: %o', res);
                reject(res);
            });
        });
    }

    function chunkReceived(data) {
        let a = m_audiobuffer.appendBuffer(data.buffer);
        for (let i = 0 ; i < a.length; i++) {
            sendChunk(a[i], m_seq_nbr, m_timestamp);
            m_seq_nbr++;
            m_timestamp += 7200;
        }
    }

    function sendChunk(buffer, seqNbr, timestamp) {
        var l = buffer.byteLength + 4 + 12; //file length + 4 bytes T-Pkt-Header + 12 bytes RTP-Header
        //tpkt header
        var tpkt_header = [3, 0, (l&0xff00)>>8, l&0x00ff];
        //rtp header
        var rtp_buf = new ArrayBuffer(12);
        var rtp_view = new DataView(rtp_buf);
        var flags = 0x8000;
        rtp_view.setUint16(0, flags);
        rtp_view.setUint16(2, seqNbr);
        rtp_view.setUint32(4, timestamp);
        rtp_view.setUint32(8, 0xffffffff);
        var buf = new ArrayBuffer(l);
        var uint8 = new Uint8Array(buf);
        uint8.set(tpkt_header, 0);
        uint8.set(new Uint8Array(rtp_buf), 4);
        uint8.set(new Uint8Array(buffer), 16);

	var sendto = params.bosch_backaud_camera_ip + ':' + params.bosch_backaud_camera_port;
	console.log('new audio data (' + l + ' bytes, socket state: ' + m_socket.readyState + ', seqNbr: ' + seqNbr + ', timestamp: ' + timestamp + ') sent to ' + sendto);

        if (m_socket.readyState === 1) {
            m_socket.send(uint8);
        } else if (m_socket.readyState === 2 || m_socket.readyState === 3) {
            m_log('socket in closing state, disconnecting...');
            disconnect();
        }
    }

    function disconnect() {
        m_log('disconnect');
        if (m_rcpclient) {
            m_rcpclient.disconnect();
        }
        if (m_audiosrc) {
            m_audiosrc.disconnect();
        }
        if (m_socket) {
            m_socket.close();
        }
    }

    return {
	setParams: setParams,
        connect: connect,
        disconnect: disconnect
    }
};


var AudioSource = function(callback, params) {

    let m_log = LogFactory.getLogger('audiosource'),
        m_actx = AudioBackChannelHelper.getAudioContext(),
        m_microphone = null,
	m_test_oscilator = null,
        m_biquad = null,
        m_gain = null,
        m_resampler = null,
        m_callback = callback;

    function connect(cfg) {
        cfg = cfg || {};
        return new Promise(function(resolve, reject) {
            if (!navigator.mediaDevices) {
                console.log('no media devices available. Maybe https is required.');
                reject('no media devices available. Maybe https is required');
            }
            /*
            let constraints = JSON.parse(sessionStorage.getItem('audioconstraints'));
            m_log('audioconstraints: %o', constraints);
             */
            navigator.mediaDevices.getUserMedia({
                audio: true
            })
            .then(function(stream) {
                m_biquad = m_actx.createBiquadFilter();
                m_biquad.type = "lowpass";
                m_biquad.frequency.value = 8000;
                m_gain = m_actx.createGain();
                m_gain.gain.value = 1;
                m_microphone = m_actx.createMediaStreamSource(stream);

//		m_test_oscilator = m_actx.createOscillator();
//		m_test_oscilator.type = 'square';
//		m_test_oscilator.frequency.setValueAtTime(440, m_actx.currentTime);
                // microphone -> filter -> processor -> destination.
                m_microphone.connect(m_biquad);
//		m_test_oscilator.connect(m_biquad);
                m_biquad.connect(m_gain);

		try {
  			m_resampler = new AudioWorkletNode(m_actx, 'resampler-node');
                 	m_resampler.port.onmessage = (event) => {
				m_callback(event.data);
                    	};
                    	m_gain.connect(m_resampler);
                    	m_resampler.connect(m_actx.destination);
                   	m_resampler.port.postMessage({ command: 'config', samplerate: m_actx.sampleRate });
                    	m_log('context: %O', m_actx);
			//m_test_oscilator.start();
                    	resolve();
		} catch (err) {
			var workleturl = (params && params.options && params.options.boschbackwardaudio)?(params.options.boschbackwardaudio + '/audioworklet.js?_=' + new Date().getTime()):('js/audioworklet.js')
			var request = new XMLHttpRequest();
			request.onload = function(answer){
				var text = answer.currentTarget.responseText;
		        	const blob = new Blob([text], { type: 'application/javascript; charset=utf-8' });
		        	const objectUrl = URL.createObjectURL(blob);
        			m_actx.audioWorklet.addModule(objectUrl).then(() => {
               				m_resampler = new AudioWorkletNode(m_actx, 'resampler-node');
                			m_resampler.port.onmessage = (event) => {
        	       				m_callback(event.data);
               				};
               				m_gain.connect(m_resampler);
               				m_resampler.connect(m_actx.destination);
               				m_resampler.port.postMessage({ command: 'config', samplerate: m_actx.sampleRate });
              				m_log('context: %O', m_actx);
					//m_test_oscilator.start();
               				resolve();
               			})
               			.catch(function(error){
               				console.log	('something wrong');
					URL.revokeObjectURL(objectUrl);
					reject();
               			})
				.finally(function(){
					URL.revokeObjectURL(objectUrl);
				});

			}
			request.open('GET', workleturl);
            		request.send();
		}
            })
            .catch(function(error) {
                m_log("error getting audio stream: %O", error);
                reject(error);
            });
        });
    }

    function disconnect() {
        m_log("disconnecting audiosource");
        if(m_resampler) m_resampler.disconnect();
        if(m_biquad) m_biquad.disconnect();
        if(m_gain) m_gain.disconnect();
        if(m_microphone) m_microphone.disconnect();
        /*
        if(m_actx) {
            m_actx.close().then(function () {
                console.log("audio context closed")
            }).catch(function (e) {
                console.log("closing audio context failed: ", e)
            })
        }
         */
    }

    return {
        connect: connect,
        disconnect: disconnect
    }
};

var AudioBackChannelHelper = (function() {

    var m_audioctx = null;

    function getAudioContext() {
        if (m_audioctx === null) {
            m_audioctx = new AudioContext();
        }
        return m_audioctx;
    }

    function closeAudioContext() {
        if (m_audioctx != null) {
            m_audioctx.close().then(function () {
                console.log("audio context closed")
            }).catch(function (e) {
                console.log("closing audio context failed: ", e)
            })
        }
    }

    function checkMicrophoneAccess() {
        return !!navigator.mediaDevices;
    }

    return {
        checkMicrophoneAccess: checkMicrophoneAccess,
        getAudioContext: getAudioContext,
        closeAudioContext: closeAudioContext
    }
})();


var FixLengthByteBuffer = function(length) {

    let m_buffer = new ArrayBuffer(0),
        m_maxlen = length;

    function appendBuffer (buffer /*ArrayBuffer*/) {
        let tmpBuffer = new Uint8Array(m_buffer.byteLength + buffer.byteLength);
        tmpBuffer.set(new Uint8Array(m_buffer), 0);
        tmpBuffer.set(new Uint8Array(buffer), m_buffer.byteLength);
        let res = stripBuffer(tmpBuffer);
        m_buffer = res.remaining;
        return res.stripped;
    }

    function stripBuffer (buffer) {
        let back = {
            stripped:[],
            remaining: []
        };
        while (buffer.byteLength >= m_maxlen) {
            let tmp = new Uint8Array(m_maxlen);
            tmp.set(new Uint8Array(buffer.slice(0, m_maxlen)), 0);
            back.stripped.push(tmp);
            buffer = buffer.slice(m_maxlen);
        }
        back.remaining = buffer;
        return back;
    }

    function getRemainingBuffer() {
        return m_buffer;
    }

    return {
        appendBuffer: appendBuffer,
        getRemainingBuffer: getRemainingBuffer
    }
};
