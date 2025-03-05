var mediaStreamLibrary;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/components/aacdepay/index.ts":
/*!******************************************!*\
  !*** ./lib/components/aacdepay/index.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AACDepay: () => (/* binding */ AACDepay)
/* harmony export */ });
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parser */ "./lib/components/aacdepay/parser.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../messageStreams */ "./lib/components/messageStreams.ts");






/*
media: [{ type: 'video',
   port: '0',
   proto: 'RTP/AVP',
   fmt: '96',
   rtpmap: '96 H264/90000',
   fmtp: {
      format: '96',
      parameters: {
        'packetization-mode': '1',
        'profile-level-id': '4d0029',
        'sprop-parameter-sets': 'Z00AKeKQDwBE/LgLcBAQGkHiRFQ=,aO48gA==',
      },
    },
   control: 'rtsp://hostname/media/media.amp/stream=0?audio=1&video=1',
   framerate: '25.000000',
   transform: [[1, 0, 0], [0, 0.75, 0], [0, 0, 1]] },
   { type: 'audio',
     port: '0',
     proto: 'RTP/AVP',
     fmt: '97',
     fmtp: {
       parameters: {
         bitrate: '32000',
         config: '1408',
         indexdeltalength: '3',
         indexlength: '3',
         mode: 'AAC-hbr',
         'profile-level-id': '2',
         sizelength: '13',
         streamtype: '5'
       },
       format: '97'
     },
     rtpmap: '97 MPEG4-GENERIC/16000/1',
     control: 'rtsp://hostname/media/media.amp/stream=1?audio=1&video=1' }]
*/

class AACDepay extends _component__WEBPACK_IMPORTED_MODULE_1__.Tube {
  constructor() {
    let AACPayloadType;
    let hasHeader;
    const incoming = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_4__.createTransform)(function (msg, encoding, callback) {
      if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP) {
        // Check if there is an AAC track in the SDP
        let validMedia;
        if (msg.sdp.media) {
          for (const media of msg.sdp.media) {
            if (media.type === 'audio' && media.fmtp && media.fmtp.parameters && media.fmtp.parameters.mode === 'AAC-hbr' && media.recvonly !== undefined && media.recvonly == true) {
              validMedia = media;
            }
          }
        }
        if (validMedia && validMedia.rtpmap !== undefined) {
          AACPayloadType = Number(validMedia.rtpmap.payloadType);
          const parameters = validMedia.fmtp.parameters;
          // Required
          const sizeLength = Number(parameters.sizelength) || 0;
          const indexLength = Number(parameters.indexlength) || 0;
          const indexDeltaLength = Number(parameters.indexdeltalength) || 0;
          // Optionals
          const CTSDeltaLength = Number(parameters.ctsdeltalength) || 0;
          const DTSDeltaLength = Number(parameters.dtsdeltalength) || 0;
          const RandomAccessIndication = Number(parameters.randomaccessindication) || 0;
          const StreamStateIndication = Number(parameters.streamstateindication) || 0;
          const AuxiliaryDataSizeLength = Number(parameters.auxiliarydatasizelength) || 0;
          hasHeader = sizeLength + Math.max(indexLength, indexDeltaLength) + CTSDeltaLength + DTSDeltaLength + RandomAccessIndication + StreamStateIndication + AuxiliaryDataSizeLength > 0;
        }
        callback(undefined, msg);
      } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__.payloadType)(msg.data) === AACPayloadType) {
        (0,_parser__WEBPACK_IMPORTED_MODULE_3__.parse)(msg, hasHeader, this.push.bind(this));
        callback();
      } else {
        // Not a message we should handle
        callback(undefined, msg);
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/aacdepay/parser.ts":
/*!*******************************************!*\
  !*** ./lib/components/aacdepay/parser.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parse: () => (/* binding */ parse)
/* harmony export */ });
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");



/*
From RFC 3640 https://tools.ietf.org/html/rfc3640
  2.11.  Global Structure of Payload Format

     The RTP payload following the RTP header, contains three octet-
     aligned data sections, of which the first two MAY be empty, see
     Figure 1.

           +---------+-----------+-----------+---------------+
           | RTP     | AU Header | Auxiliary | Access Unit   |
           | Header  | Section   | Section   | Data Section  |
           +---------+-----------+-----------+---------------+

                     <----------RTP Packet Payload----------->

              Figure 1: Data sections within an RTP packet
Note that auxilary section is empty for AAC-hbr

  3.2.1.  The AU Header Section

   When present, the AU Header Section consists of the AU-headers-length
   field, followed by a number of AU-headers, see Figure 2.

      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- .. -+-+-+-+-+-+-+-+-+-+
      |AU-headers-length|AU-header|AU-header|      |AU-header|padding|
      |                 |   (1)   |   (2)   |      |   (n)   | bits  |
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+- .. -+-+-+-+-+-+-+-+-+-+

                   Figure 2: The AU Header Section
*/

function parse(rtp, hasHeader, callback) {
  const buffer = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__.payload)(rtp.data);
  let headerLength = 0;
  if (hasHeader) {
    const auHeaderLengthInBits = buffer.readUInt16BE(0);
    headerLength = 2 + (auHeaderLengthInBits + auHeaderLengthInBits % 8) / 8; // Add padding
  }

  let syncword = buffer.readUInt16BE(headerLength);
  if ((syncword & 0xFFF0) === 0xFFF0) {
    // ADTS header, see  ISO/IEC 14496-3 (https://wiki.multimedia.cx/index.php/ADTS)
    if ((syncword & 0x0001) === 0x0001) headerLength += 7; //without CRC
    else headerLength += 9; // with CRC
  }

  const packet = {
    type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.ELEMENTARY,
    data: buffer.slice(headerLength),
    payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__.payloadType)(rtp.data),
    timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_0__.timestamp)(rtp.data),
    ntpTimestamp: rtp.ntpTimestamp
  };
  callback(packet);
}

/***/ }),

/***/ "./lib/components/auth/digest.ts":
/*!***************************************!*\
  !*** ./lib/components/auth/digest.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DigestAuth: () => (/* binding */ DigestAuth)
/* harmony export */ });
/* harmony import */ var md5_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! md5.js */ "./node_modules/md5.js/index.js");
/* harmony import */ var md5_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(md5_js__WEBPACK_IMPORTED_MODULE_0__);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// https://tools.ietf.org/html/rfc2617#section-3.2.1


class DigestAuth {
  constructor(params, username, password) {
    _defineProperty(this, "realm", void 0);
    _defineProperty(this, "nonce", void 0);
    _defineProperty(this, "opaque", void 0);
    _defineProperty(this, "algorithm", void 0);
    _defineProperty(this, "qop", void 0);
    _defineProperty(this, "username", void 0);
    _defineProperty(this, "ha1Base", void 0);
    _defineProperty(this, "count", void 0);
    _defineProperty(this, "nc", () => {
      ++this.count;
      return this.count.toString(16).padStart(8, '0');
    });
    _defineProperty(this, "cnonce", () => {
      return new Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).map(n => n.toString(16)).join('');
    });
    _defineProperty(this, "ha1", cnonce => {
      let ha1 = this.ha1Base;
      if (this.algorithm === 'md5-sess') {
        ha1 = new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${ha1}:${this.nonce}:${cnonce}`).digest('hex');
      }
      return ha1;
    });
    _defineProperty(this, "ha2", (method, uri, body = '') => {
      let ha2 = new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${method}:${uri}`).digest('hex');
      if (this.algorithm === 'md5-sess') {
        const hbody = new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(body).digest('hex');
        ha2 = new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${method}:${uri}:${hbody}`).digest('hex');
      }
      return ha2;
    });
    _defineProperty(this, "authorization", (method = 'GET', uri = '', body) => {
      // Increase count
      const nc = this.nc();
      const cnonce = this.cnonce();
      const ha1 = this.ha1(cnonce);
      const ha2 = this.ha2(method, uri, body);
      const response = this.qop === undefined ? new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${ha1}:${this.nonce}:${ha2}`).digest('hex') : new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${ha1}:${this.nonce}:${nc}:${cnonce}:${this.qop}:${ha2}`).digest('hex');
      const authorizationParams = [];
      authorizationParams.push(`username="${this.username}"`);
      authorizationParams.push(`realm="${this.realm}"`);
      authorizationParams.push(`nonce="${this.nonce}"`);
      authorizationParams.push(`uri="${uri}"`);
      if (this.qop !== undefined) {
        authorizationParams.push(`qop=${this.qop}`);
        authorizationParams.push(`nc=${nc}`);
        authorizationParams.push(`cnonce="${cnonce}"`);
      }
      authorizationParams.push(`response="${response}"`);
      if (this.opaque !== undefined) {
        authorizationParams.push(`opaque="${this.opaque}"`);
      }
      return `Digest ${authorizationParams.join(', ')}`;
    });
    const realm = params.get('realm');
    if (realm === undefined) {
      throw new Error('no realm in digest challenge');
    }
    this.realm = realm;
    this.ha1Base = new (md5_js__WEBPACK_IMPORTED_MODULE_0___default())().update(`${username}:${realm}:${password}`).digest('hex');
    const nonce = params.get('nonce');
    if (nonce === undefined) {
      throw new Error('no nonce in digest challenge');
    }
    this.nonce = nonce;
    this.opaque = params.get('opaque');
    const algorithm = params.get('algorithm');
    if (algorithm !== undefined) {
      if (algorithm === 'md5') {
        this.algorithm = 'md5';
      } else if (algorithm === 'md5-sess') {
        this.algorithm = 'md5-sess';
      }
    } else {
      this.algorithm = 'md5';
    }
    const qop = params.get('qop');
    if (qop !== undefined) {
      const possibleQops = qop.split(',').map(qopType => qopType.trim());
      if (possibleQops.some(qopValue => qopValue === 'auth')) {
        this.qop = 'auth';
      } else if (possibleQops.some(qopValue => qopValue === 'auth-int')) {
        this.qop = 'auth-int';
      }
    }
    this.count = 0;
    this.username = username;
  }
}

/***/ }),

/***/ "./lib/components/auth/index.ts":
/*!**************************************!*\
  !*** ./lib/components/auth/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Auth: () => (/* binding */ Auth)
/* harmony export */ });
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/config */ "./lib/utils/config.ts");
/* harmony import */ var _utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/protocols/rtsp */ "./lib/utils/protocols/rtsp.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../messageStreams */ "./lib/components/messageStreams.ts");
/* harmony import */ var _digest__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./digest */ "./lib/components/auth/digest.ts");
/* harmony import */ var _www_authenticate__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./www-authenticate */ "./lib/components/auth/www-authenticate.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];







const UNAUTHORIZED = 401;
const DEFAULT_CONFIG = {
  username: 'root',
  password: 'pass'
};

/*
 * This component currently only supports Basic authentication
 * It should be placed between the RTSP parser and the RTSP Session.
 */

class Auth extends _component__WEBPACK_IMPORTED_MODULE_2__.Tube {
  constructor(config = {}) {
    const {
      username,
      password
    } = (0,_utils_config__WEBPACK_IMPORTED_MODULE_0__.merge)(DEFAULT_CONFIG, config);
    if (username === undefined || password === undefined) {
      throw new Error('need username and password');
    }
    let lastSentMessage;
    let authHeader;
    const outgoing = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_4__.createTransform)(function (msg, encoding, callback) {
      if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTSP) {
        lastSentMessage = msg;
        if (authHeader && msg.headers) {
          msg.headers.Authorization = authHeader;
        }
      }
      callback(undefined, msg);
    });
    const incoming = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_4__.createTransform)(function (msg, encoding, callback) {
      if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTSP && (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_1__.statusCode)(msg.data) === UNAUTHORIZED) {
        const headers = msg.data.toString().split('\n');
        const wwwAuth = headers.find(header => /WWW-Auth/i.test(header));
        if (wwwAuth === undefined) {
          throw new Error('cannot find WWW-Authenticate header');
        }
        const challenge = (0,_www_authenticate__WEBPACK_IMPORTED_MODULE_6__.parseWWWAuthenticate)(wwwAuth);
        if (challenge.type === 'basic') {
          authHeader = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
        } else if (challenge.type === 'digest') {
          const digest = new _digest__WEBPACK_IMPORTED_MODULE_5__.DigestAuth(challenge.params, username, password);
          authHeader = digest.authorization(lastSentMessage.method, lastSentMessage.uri);
        } else {
          // unkown authentication type, give up
          return;
        }

        // Retry last RTSP message
        // Write will fire our outgoing transform function.
        outgoing.write(lastSentMessage, () => callback());
      } else {
        // Not a message we should handle
        callback(undefined, msg);
      }
    });
    super(incoming, outgoing);
  }
}

/***/ }),

/***/ "./lib/components/auth/www-authenticate.ts":
/*!*************************************************!*\
  !*** ./lib/components/auth/www-authenticate.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseWWWAuthenticate: () => (/* binding */ parseWWWAuthenticate)
/* harmony export */ });
const parseWWWAuthenticate = header => {
  const [, type, ...challenge] = header.split(' ');
  const pairs = [];
  const re = /\s*([^=]+)=\"([^\"]*)\",?/gm;
  let match;
  do {
    match = re.exec(challenge.join(' '));
    if (match !== null) {
      const [, key, value] = match;
      pairs.push([key, value]);
    }
  } while (match !== null);
  const params = new Map(pairs);
  return {
    type: type.toLowerCase(),
    params
  };
};

/***/ }),

/***/ "./lib/components/basicdepay/index.ts":
/*!********************************************!*\
  !*** ./lib/components/basicdepay/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BasicDepay: () => (/* binding */ BasicDepay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../messageStreams */ "./lib/components/messageStreams.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];




class BasicDepay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(rtpPayloadType) {
    if (rtpPayloadType === undefined) {
      throw new Error('you must supply a payload type to BasicDepayComponent');
    }
    let buffer = Buffer.alloc(0);
    const incoming = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_3__.createTransform)(function (msg, encoding, callback) {
      if (msg.type === _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data) === rtpPayloadType) {
        const rtpPayload = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payload)(msg.data);
        buffer = Buffer.concat([buffer, rtpPayload]);
        if ((0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.marker)(msg.data)) {
          if (buffer.length > 0) {
            this.push({
              data: buffer,
              timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.timestamp)(msg.data),
              ntpTimestamp: msg.ntpTimestamp,
              payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data),
              type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.ELEMENTARY
            });
          }
          buffer = Buffer.alloc(0);
        }
        callback();
      } else {
        // Not a message we should handle
        callback(undefined, msg);
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/canvas/index.ts":
/*!****************************************!*\
  !*** ./lib/components/canvas/index.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CanvasSink: () => (/* binding */ CanvasSink)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _utils_clock__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/clock */ "./lib/utils/clock.ts");
/* harmony import */ var _utils_scheduler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/scheduler */ "./lib/utils/scheduler.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_4__);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





const resetInfo = info => {
  info.bitrate = 0;
  info.framerate = 0;
  info.renderedFrames = 0;
};
const generateUpdateInfo = clockrate => {
  let cumulativeByteLength = 0;
  let cumulativeDuration = 0;
  let cumulativeFrames = 0;
  return (info, {
    byteLength,
    duration
  }) => {
    cumulativeByteLength += byteLength;
    cumulativeDuration += duration;
    cumulativeFrames++;

    // Update the cumulative number size (bytes) and duration (ticks), and if
    // the duration exceeds the clockrate (meaning longer than 1 second of info),
    // then compute a new bitrate and reset cumulative size and duration.
    if (cumulativeDuration >= clockrate) {
      const bits = 8 * cumulativeByteLength;
      const frames = cumulativeFrames;
      const seconds = cumulativeDuration / clockrate;
      info.bitrate = bits / seconds;
      info.framerate = frames / seconds;
      cumulativeByteLength = 0;
      cumulativeDuration = 0;
      cumulativeFrames = 0;
    }
  };
};

/**
 * Canvas component
 *
 * Draws an incoming stream of JPEG images onto a <canvas> element.
 * The RTP timestamps are used to schedule the drawing of the images.
 * An instance can be used as a 'clock' itself, e.g. with a scheduler.
 *
 * The following handlers can be set on a component instance:
 *  - onCanplay: will be called when the first frame is ready and
 *               the correct frame size has been set on the canvas.
 *               At this point, the clock can be started by calling
 *               `.play()` method on the component.
 *  - onSync: will be called when the presentation time offset is
 *            known, with the latter as argument (in UNIX milliseconds)
 *
 * @class CanvasComponent
 * @extends {Component}
 */
class CanvasSink extends _component__WEBPACK_IMPORTED_MODULE_0__.Sink {
  /**
   * Creates an instance of CanvasComponent.
   * @param { HTMLCanvasElement } el - An HTML < canvas > element
   * @memberof CanvasComponent
   */
  constructor(el) {
    if (el === undefined) {
      throw new Error('canvas element argument missing');
    }
    let firstTimestamp = 0;
    let lastTimestamp = 0;
    let clockrate = 0;
    const info = {
      bitrate: 0,
      framerate: 0,
      renderedFrames: 0
    };
    let updateInfo;

    // The createImageBitmap function is supported in Chrome and Firefox
    // (https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap)
    // Note: drawImage can also be used instead of transferFromImageBitmap, but it caused
    // very large memory use in Chrome (goes up to ~2-3GB, then drops again).
    // Do do not call el.getContext twice, safari returns null for second call
    let ctx = null;
    if (window.createImageBitmap !== undefined) {
      ctx = el.getContext('bitmaprenderer');
    }
    if (ctx === null) {
      ctx = el.getContext('2d');
    }

    // Set up the drawing callback to be used by the scheduler,
    // it receives a blob of a JPEG image.
    let drawImageBlob;
    if (ctx === null) {
      drawImageBlob = () => {
        /** NOOP */
      };
    } else if ('transferFromImageBitmap' in ctx) {
      const ctxBitmaprenderer = ctx;
      drawImageBlob = ({
        blob
      }) => {
        info.renderedFrames++;
        window.createImageBitmap(blob).then(imageBitmap => {
          ctxBitmaprenderer.transferFromImageBitmap(imageBitmap);
        }).catch(() => {
          /** ignore */
        });
      };
    } else {
      const ctx2d = ctx;
      const img = new Image();
      img.onload = () => {
        ctx2d.drawImage(img, 0, 0);
      };
      drawImageBlob = ({
        blob
      }) => {
        info.renderedFrames++;
        const url = window.URL.createObjectURL(blob);
        img.src = url;
      };
    }

    // Because we don't have an element that plays video for us,
    // we have to use our own clock. The clock can be started/stopped
    // with the `play` and `pause` methods, and has a `currentTime`
    // property that keeps track of the presentation time.
    // The scheduler will use the clock (instead of e.g. a video element)
    // to determine when to display the JPEG images.
    const clock = new _utils_clock__WEBPACK_IMPORTED_MODULE_1__.Clock();
    const scheduler = new _utils_scheduler__WEBPACK_IMPORTED_MODULE_2__.Scheduler(clock, drawImageBlob);
    let ntpPresentationTime = 0;
    const onCanplay = () => {
      this.onCanplay && this.onCanplay();
    };
    const onSync = ntpPresentationTime => {
      this.onSync && this.onSync(ntpPresentationTime);
    };

    // Set up an incoming stream and attach it to the image drawing function.
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_4__.Writable({
      objectMode: true,
      write: (msg, encoding, callback) => {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SDP) {
          // start of a new movie, reset timers
          clock.reset();
          scheduler.reset();

          // Initialize first timestamp and clockrate
          firstTimestamp = 0;
          const jpegMedia = msg.sdp.media?.find(media => {
            return media.type === 'video' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'JPEG';
          });
          if (jpegMedia !== undefined && jpegMedia.rtpmap !== undefined) {
            clockrate = jpegMedia.rtpmap.clockrate;
            // Initialize the framerate/bitrate data
            resetInfo(info);
            updateInfo = generateUpdateInfo(clockrate);
          }
          callback();
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.JPEG) {
          const {
            timestamp,
            ntpTimestamp
          } = msg;

          // If first frame, store its timestamp, initialize
          // the scheduler with 0 and start the clock.
          // Also set the proper size on the canvas.
          if (!firstTimestamp) {
            // Initialize timing
            firstTimestamp = timestamp;
            lastTimestamp = timestamp;
            // Initialize frame size
            const {
              width,
              height
            } = msg.framesize;
            el.width = width;
            el.height = height;
            // Notify that we can play at this point
            scheduler.init(0);
          }
          // Compute millisecond presentation time (with offset 0
          // as we initialized the scheduler with 0).
          const presentationTime = 1000 * (timestamp - firstTimestamp) / clockrate;
          const blob = new window.Blob([msg.data], {
            type: 'image/jpeg'
          });

          // If the actual UTC time of the start of presentation isn't known yet,
          // and we do have an ntpTimestamp, then compute it here and notify.
          if (!ntpPresentationTime && ntpTimestamp) {
            ntpPresentationTime = ntpTimestamp - presentationTime;
            onSync(ntpPresentationTime);
          }
          scheduler.run({
            ntpTimestamp: presentationTime,
            blob
          });

          // Notify that we can now start the clock.
          if (timestamp === firstTimestamp) {
            onCanplay();
          }

          // Update bitrate/framerate
          updateInfo(info, {
            byteLength: msg.data.length,
            duration: timestamp - lastTimestamp
          });
          lastTimestamp = timestamp;
          callback();
        } else {
          callback();
        }
      }
    });

    // Set up an outgoing stream.
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_4__.Readable({
      objectMode: true,
      read: function () {
        //
      }
    });

    // When an error is sent on the outgoing stream, whine about it.
    outgoing.on('error', () => {
      console.warn('outgoing stream broke somewhere');
    });
    super(incoming, outgoing);
    _defineProperty(this, "onCanplay", void 0);
    _defineProperty(this, "onSync", void 0);
    _defineProperty(this, "_clock", void 0);
    _defineProperty(this, "_scheduler", void 0);
    _defineProperty(this, "_info", void 0);
    this._clock = clock;
    this._scheduler = scheduler;
    this._info = info;
    this.onCanplay = undefined;
    this.onSync = undefined;
  }

  /**
   * Retrieve the current presentation time (seconds)
   *
   * @readonly
   * @memberof CanvasComponent
   */
  get currentTime() {
    return this._clock.currentTime;
  }

  /**
   * Pause the presentation.
   *
   * @memberof CanvasComponent
   */
  pause() {
    this._scheduler.suspend();
    this._clock.pause();
  }

  /**
   * Start the presentation.
   *
   * @memberof CanvasComponent
   */
  play() {
    this._clock.play();
    this._scheduler.resume();
  }
  get bitrate() {
    return this._info.bitrate;
  }
  get framerate() {
    return this._info.framerate;
  }
}

/***/ }),

/***/ "./lib/components/component.ts":
/*!*************************************!*\
  !*** ./lib/components/component.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Sink: () => (/* binding */ Sink),
/* harmony export */   Source: () => (/* binding */ Source),
/* harmony export */   Tube: () => (/* binding */ Tube)
/* harmony export */ });
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/stream-factory */ "./lib/components/helpers/stream-factory.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }


class AbstractComponent {
  constructor() {
    _defineProperty(this, "incoming", void 0);
    _defineProperty(this, "outgoing", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "prev", void 0);
    _defineProperty(this, "_incomingErrorHandler", void 0);
    _defineProperty(this, "_outgoingErrorHandler", void 0);
  }
  /**
   * Create a component, i.e. a set of bi-directional streams consisting of
   * an 'incoming' and 'outgoing' stream to handle two-way communication with
   * other components.
   * @param {Stream} incoming - The stream going towards the client end-point.
   * @param {Stream} outgoing - The stream going back to the server end-point.
   *
   * Typically, for a component that is connected to two other components, both
   * incoming and outgoing will be Transform streams. For a source, 'incoming'
   * will be a Readable stream and 'outgoing' a Writable stream, while for a sink
   * it is reversed. Both source and sink could also use a single Duplex stream,
   * with incoming === outgoing.
   *
   * server end-point                          client end-point
   *  /-------------      -----------------      -------------\
   *  |  Writable  |  <-  |   Transform   |  <-  |  Readable  |
   *  |   source   |      |      tube     |      |    sink    |
   *  |  Readable  |  ->  |   Transform   |  ->  |  Writable  |
   *  \-------------      -----------------      -------------/
   */
}
class Source extends AbstractComponent {
  /**
   * Set up a component that emits incoming messages.
   * @param {Array} messages List of objects (with data property) to emit.
   * @return {Component}
   */
  static fromMessages(messages) {
    const component = new Source(_helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].producer(messages), _helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].consumer());
    return component;
  }
  constructor(incoming = new stream__WEBPACK_IMPORTED_MODULE_0__.Readable({
    objectMode: true
  }), outgoing = new stream__WEBPACK_IMPORTED_MODULE_0__.Writable({
    objectMode: true
  })) {
    super();
    _defineProperty(this, "incoming", void 0);
    _defineProperty(this, "outgoing", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "prev", void 0);
    this.incoming = incoming;
    this.outgoing = outgoing;
    this.next = null;
    this.prev = null;
  }

  /**
   * Attach another component so the the 'down' stream flows into the
   * next component 'down' stream and the 'up' stream of the other component
   * flows into the 'up' stream of this component. This is what establishes the
   * meaning of 'up' and 'down'.
   * @param {Component} next - The component to connect.
   * @return {Component} - A reference to the connected component.
   *
   *      -------------- pipe --------------
   *  <-  |  outgoing  |  <-  |  outgoing  | <-
   *      |    this    |      |    next    |
   *  ->  |  incoming  |  ->  |  incoming  | ->
   *      -------------- pipe --------------
   */
  connect(next) {
    // If the next component is not there, we want to return this component
    // so that it is possible to continue to chain. If there is a next component,
    // but this component already has a next one, or the next one already has a
    // previous component, throw an error.
    if (next === null) {
      return this;
    } else if (this.next !== null || next.prev !== null) {
      throw new Error('connection failed: component(s) already connected');
    }
    if (!this.incoming.readable || !this.outgoing.writable) {
      throw new Error('connection failed: this component not compatible');
    }
    if (!next.incoming.writable || !next.outgoing.readable) {
      throw new Error('connection failed: next component not compatible');
    }
    try {
      this.incoming.pipe(next.incoming);
      next.outgoing.pipe(this.outgoing);
    } catch (e) {
      throw new Error(`connection failed: ${e.message}`);
    }

    /**
     * Propagate errors back upstream, this assures an error will be propagated
     * to all previous streams (but not further than any endpoints). What happens
     * when an error is emitted on a stream is up to the stream's implementation.
     */
    const incomingErrorHandler = err => {
      this.incoming.emit('error', err);
    };
    next.incoming.on('error', incomingErrorHandler);
    const outgoingErrorHandler = err => {
      next.outgoing.emit('error', err);
    };
    this.outgoing.on('error', outgoingErrorHandler);

    // Keep a bidirectional linked list of components by storing
    // a reference to the next component and the listeners that we set up.
    this.next = next;
    next.prev = this;
    this._incomingErrorHandler = incomingErrorHandler;
    this._outgoingErrorHandler = outgoingErrorHandler;
    return next;
  }

  /**
   * Disconnect the next connected component. When there is no next component
   * the function will just do nothing.
   * @return {Component} - A reference to this component.
   */
  disconnect() {
    const next = this.next;
    if (next !== null) {
      this.incoming.unpipe(next.incoming);
      next.outgoing.unpipe(this.outgoing);
      if (typeof this._incomingErrorHandler !== 'undefined') {
        next.incoming.removeListener('error', this._incomingErrorHandler);
      }
      if (typeof this._outgoingErrorHandler !== 'undefined') {
        this.outgoing.removeListener('error', this._outgoingErrorHandler);
      }
      this.next = null;
      next.prev = null;
      delete this._incomingErrorHandler;
      delete this._outgoingErrorHandler;
    }
    return this;
  }
}
class Tube extends Source {
  static fromHandlers(fnIncoming, fnOutgoing) {
    const incomingStream = fnIncoming ? _helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].peeker(fnIncoming) : undefined;
    const outgoingStream = fnOutgoing ? _helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].peeker(fnOutgoing) : undefined;
    return new Tube(incomingStream, outgoingStream);
  }
  constructor(incoming = new stream__WEBPACK_IMPORTED_MODULE_0__.PassThrough({
    objectMode: true
  }), outgoing = new stream__WEBPACK_IMPORTED_MODULE_0__.PassThrough({
    objectMode: true
  })) {
    super(incoming, outgoing);
    _defineProperty(this, "incoming", void 0);
    _defineProperty(this, "outgoing", void 0);
    this.incoming = incoming;
    this.outgoing = outgoing;
  }
}
class Sink extends AbstractComponent {
  /**
   * Set up a component that swallows incoming data (calling fn on it).
   * To print data, you would use fn = console.log.
   * @param {Function} fn The callback to use for the incoming data.
   * @return {Component}
   */
  static fromHandler(fn) {
    const component = new Sink(_helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].consumer(fn), _helpers_stream_factory__WEBPACK_IMPORTED_MODULE_1__["default"].producer(undefined));
    // A sink should propagate when stream is ending.
    component.incoming.on('finish', () => {
      component.outgoing.push(null);
    });
    return component;
  }
  constructor(incoming = new stream__WEBPACK_IMPORTED_MODULE_0__.Writable({
    objectMode: true
  }), outgoing = new stream__WEBPACK_IMPORTED_MODULE_0__.Readable({
    objectMode: true
  })) {
    super();
    _defineProperty(this, "incoming", void 0);
    _defineProperty(this, "outgoing", void 0);
    _defineProperty(this, "next", void 0);
    _defineProperty(this, "prev", void 0);
    this.incoming = incoming;
    this.outgoing = outgoing;
    this.next = null;
    this.prev = null;
  }
  connect() {
    throw new Error('connection failed: attempting to connect after a sink');
  }
  disconnect() {
    return this;
  }
}

/***/ }),

/***/ "./lib/components/customdepay/index.ts":
/*!*********************************************!*\
  !*** ./lib/components/customdepay/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomDepay: () => (/* binding */ CustomDepay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];





class CustomDepay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(handler, encodingname, payloadtype) {
    let dbg = debug__WEBPACK_IMPORTED_MODULE_2___default()('msl:customdepay');
    let customPayloadType = payloadtype;
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SDP) {
          let validMedia;
          if (msg.sdp.media) {
            for (const media of msg.sdp.media) {
              if (media.type === 'application' && media.rtpmap && media.rtpmap.encodingName === encodingname) {
                validMedia = media;
              }
            }
          }
          if (validMedia && validMedia.rtpmap) {
            customPayloadType = Number(validMedia.rtpmap.payloadType);
            dbg('using payload type %s for %s', customPayloadType, encodingname);
          }
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.payloadType)(msg.data) === customPayloadType) {
          const customMsg = {
            timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.timestamp)(msg.data),
            ntpTimestamp: msg.ntpTimestamp,
            payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.payloadType)(msg.data),
            data: Buffer.concat([Buffer.from([]), (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.payload)(msg.data)]),
            type: _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.META_RAW
          };
          // If there is a handler, the XML message will leave
          // through the handler, otherwise send it on to the
          // next component
          if (handler) {
            handler(customMsg);
          } else {
            this.push(customMsg);
          }
          callback();
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/dataCatcherDepay/index.ts":
/*!**************************************************!*\
  !*** ./lib/components/dataCatcherDepay/index.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dataCatcherDepay: () => (/* binding */ dataCatcherDepay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../messageStreams */ "./lib/components/messageStreams.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




class dataCatcherDepay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(rtpPayloadType) {
    if (rtpPayloadType === undefined) {
      throw new Error('you must supply a payload type to BasicDepayComponent');
    }
    const onDataCallback = msg => {
      this.onDataCallback && this.onDataCallback(msg);
    };
    let buffer = Buffer.alloc(0);
    const incoming = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_3__.createTransform)(function (msg, encoding, callback) {
      var ptype = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data);
      if (
      //        msg.type === MessageType.RTP &&
      ptype === rtpPayloadType || rtpPayloadType == -1) {
        const rtpPayload = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payload)(msg.data);
        buffer = Buffer.concat([buffer, rtpPayload]);
        /*	var mrkr = marker(msg.data);
                if (mrkr) {
        */
        if (buffer.length > 0) {
          var catchmsg = {
            data: buffer,
            rawdata: msg.data,
            header: msg.header,
            timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.timestamp)(msg.data),
            ntpTimestamp: msg.ntpTimestamp,
            payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data),
            type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.UNKNOWN
          };
          onDataCallback && onDataCallback(catchmsg);
        }
        buffer = Buffer.alloc(0);
        /*        }
        */
        callback(undefined, msg);
      } else {
        // Not a message we should handle
        callback(undefined, msg);
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
    _defineProperty(this, "onDataCallback", void 0);
  }
}

/***/ }),

/***/ "./lib/components/g711toPCM/index.ts":
/*!*******************************************!*\
  !*** ./lib/components/g711toPCM/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   g711toPCM: () => (/* binding */ g711toPCM)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../messageStreams */ "./lib/components/messageStreams.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




class g711toPCM extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor() {
    let rtpPayloadType = 0; //pcmu aka ulaw aka g711

    const onDataCallback = msg => {
      this.onDataCallback && this.onDataCallback(msg);
    };
    function mulaw_decode(num) {
      let MULAW_BIAS = 33;
      var sign = 0;
      var position = 0;
      var decoded = 0;
      num = ~num;
      if (num & 0x80) {
        num &= ~(1 << 7);
        sign = -1;
      }
      position = ((num & 0xf0) >> 4) + 5;
      decoded = (1 << position | (num & 0x0F) << position - 4 | 1 << position - 5) - MULAW_BIAS;
      return sign == 0 ? decoded : -decoded;
    }
    let buffer = Buffer.alloc(0);
    const incoming = (0,_messageStreams__WEBPACK_IMPORTED_MODULE_3__.createTransform)(function (msg, encoding, callback) {
      var ptype = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data);
      if (msg.type === _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.SDP) {
        const pcmu = msg.sdp.media?.find(media => {
          return media.type === 'audio' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'PCMU';
        });
        if (pcmu !== undefined && pcmu.rtpmap !== undefined) {
          rtpPayloadType = pcmu.rtpmap.payloadType;
          pcmu.rtpmap.encodingName = 'PCM';
        }
        callback(undefined, msg);
      } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.RTP && ptype === rtpPayloadType) {
        const rtpPayload = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payload)(msg.data);
        buffer = Buffer.concat([buffer, rtpPayload]);
        if (buffer.length > 0) {
          var decodedBuffer = new Int16Array(buffer.length);
          for (var i = 0; i < buffer.length; i++) {
            decodedBuffer[i] = mulaw_decode(buffer[i]);
          }
          var catchmsg = {
            data: decodedBuffer,
            timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.timestamp)(msg.data),
            ntpTimestamp: msg.ntpTimestamp,
            payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_2__.payloadType)(msg.data),
            type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.PCM
          };
          onDataCallback && onDataCallback(catchmsg);
          //send decoded data
          callback(undefined, catchmsg);
          decodedBuffer = new Int16Array(0);
        } else {
          //send as is
          callback(undefined, msg);
        }
        buffer = Buffer.alloc(0);
      } else {
        // Not a message we should handle
        callback(undefined, msg);
      }
    });
    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
    _defineProperty(this, "onDataCallback", void 0);
  }
}

/***/ }),

/***/ "./lib/components/h264depay/index.ts":
/*!*******************************************!*\
  !*** ./lib/components/h264depay/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H264Depay: () => (/* binding */ H264Depay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parser */ "./lib/components/h264depay/parser.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





class H264Depay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor() {
    let h264PayloadType;
    let idrFound = false;
    let packets = [];
    const h264DepayParser = new _parser__WEBPACK_IMPORTED_MODULE_4__.H264DepayParser();
    const onDataCallback = msg => {
      this.onDataCallback && this.onDataCallback(msg);
    };

    // Incoming

    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        // Get correct payload types from sdp to identify video and audio
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP) {
          const h264Media = msg.sdp.media?.find(media => {
            return media.type === 'video' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'H264';
          });
          if (h264Media !== undefined && h264Media.rtpmap !== undefined) {
            h264PayloadType = h264Media.rtpmap.payloadType;
          }
          callback(undefined, msg); // Pass on the original SDP message
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.payloadType)(msg.data) === h264PayloadType) {
          const endOfFrame = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.marker)(msg.data);
          const h264Message = h264DepayParser.parse(msg);

          // Skip if not a full H264 frame, or when there hasn't been an I-frame yet
          if (h264Message === null || !idrFound && h264Message.nalType !== _parser__WEBPACK_IMPORTED_MODULE_4__.NAL_TYPES.IDR_PICTURE) {
            callback();
            return;
          }
          idrFound = true;
          onDataCallback && onDataCallback(h264Message);

          // H.264 over RTP uses the RTP marker bit to indicate a complete
          // frame.  At this point, the packets can be used to construct a
          // complete message.

          packets.push(h264Message.data);
          if (endOfFrame) {
            this.push(_objectSpread(_objectSpread({}, h264Message), {}, {
              data: packets.length === 1 ? packets[0] : Buffer.concat(packets)
            }));
            packets = [];
          }
          //          callback()
          callback(undefined, h264Message);
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
    _defineProperty(this, "onDataCallback", void 0);
  }
}

/***/ }),

/***/ "./lib/components/h264depay/parser.ts":
/*!********************************************!*\
  !*** ./lib/components/h264depay/parser.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H264DepayParser: () => (/* binding */ H264DepayParser),
/* harmony export */   NAL_TYPES: () => (/* binding */ NAL_TYPES)
/* harmony export */ });
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_2__);
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }



let NAL_TYPES = /*#__PURE__*/function (NAL_TYPES) {
  NAL_TYPES[NAL_TYPES["UNSPECIFIED"] = 0] = "UNSPECIFIED";
  NAL_TYPES[NAL_TYPES["NON_IDR_PICTURE"] = 1] = "NON_IDR_PICTURE";
  NAL_TYPES[NAL_TYPES["IDR_PICTURE"] = 5] = "IDR_PICTURE";
  NAL_TYPES[NAL_TYPES["SPS"] = 7] = "SPS";
  NAL_TYPES[NAL_TYPES["PPS"] = 8] = "PPS";
  return NAL_TYPES;
}({});

/*
First byte in payload (rtp payload header):
      +---------------+
      |0|1|2|3|4|5|6|7|
      +-+-+-+-+-+-+-+-+
      |F|NRI|  Type   |
      +---------------+

2nd byte in payload: FU header (if type in first byte is 28)
      +---------------+
      |0|1|2|3|4|5|6|7|
      +-+-+-+-+-+-+-+-+
      |S|E|R|  Type   | S = start, E = end
      +---------------+
*/

const h264Debug = debug__WEBPACK_IMPORTED_MODULE_2___default()('msl:h264depay');
class H264DepayParser {
  constructor() {
    _defineProperty(this, "_buffer", void 0);
    this._buffer = Buffer.alloc(0);
  }
  parse(rtp) {
    const rtpPayload = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.payload)(rtp.data);
    const type = rtpPayload[0] & 0x1f;
    if (type === 28) {
      /* FU-A NALU */const fuIndicator = rtpPayload[0];
      const fuHeader = rtpPayload[1];
      const startBit = !!(fuHeader >> 7);
      const nalType = fuHeader & 0x1f;
      const nal = fuIndicator & 0xe0 | nalType;
      const stopBit = fuHeader & 64;
      if (startBit) {
        this._buffer = Buffer.concat([Buffer.from([0, 0, 0, 0, nal]), rtpPayload.slice(2)]);
        return null;
      } else if (stopBit) {
        /* receieved end bit */const h264frame = Buffer.concat([this._buffer, rtpPayload.slice(2)]);
        h264frame.writeUInt32BE(h264frame.length - 4, 0);
        const msg = {
          data: h264frame,
          type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.H264,
          timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.timestamp)(rtp.data),
          ntpTimestamp: rtp.ntpTimestamp,
          payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.payloadType)(rtp.data),
          nalType: nalType
        };
        this._buffer = Buffer.alloc(0);
        return msg;
      } else {
        // Put the received data on the buffer and cut the header bytes
        this._buffer = Buffer.concat([this._buffer, rtpPayload.slice(2)]);
        return null;
      }
    } else if ((type === NAL_TYPES.NON_IDR_PICTURE || type === NAL_TYPES.IDR_PICTURE) && this._buffer.length === 0) {
      /* Single NALU */const h264frame = Buffer.concat([Buffer.from([0, 0, 0, 0]), rtpPayload]);
      h264frame.writeUInt32BE(h264frame.length - 4, 0);
      const msg = {
        data: h264frame,
        type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.H264,
        timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.timestamp)(rtp.data),
        ntpTimestamp: rtp.ntpTimestamp,
        payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.payloadType)(rtp.data),
        nalType: type
      };
      this._buffer = Buffer.alloc(0);
      return msg;
    } else {
      h264Debug(`H264depayComponent can only extract types 1,5 and 28, got ${type}`);
      this._buffer = Buffer.alloc(0);
      return null;
    }
  }
}

/***/ }),

/***/ "./lib/components/helpers/stream-factory.ts":
/*!**************************************************!*\
  !*** ./lib/components/helpers/stream-factory.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StreamFactory)
/* harmony export */ });
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_0__);
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];

class StreamFactory {
  /**
   * Creates a writable stream that sends all messages written to the stream
   * to a callback function and then considers it written.
   * @param {Function} fn  The callback to be invoked on the message
   */
  static consumer(fn = () => {
    /* */
  }) {
    return new stream__WEBPACK_IMPORTED_MODULE_0__.Writable({
      objectMode: true,
      write(msg, encoding, callback) {
        fn(msg);
        callback();
      }
    });
  }
  static peeker(fn) {
    if (typeof fn !== 'function') {
      throw new Error('you must supply a function');
    }
    return new stream__WEBPACK_IMPORTED_MODULE_0__.Transform({
      objectMode: true,
      transform(msg, encoding, callback) {
        fn(msg);
        callback(undefined, msg);
      }
    });
  }

  /**
   * Creates a readable stream that sends a message for each element of an array.
   * @param {Array} arr  The array with elements to be turned into a stream.
   */
  static producer(messages) {
    let counter = 0;
    return new stream__WEBPACK_IMPORTED_MODULE_0__.Readable({
      objectMode: true,
      read() {
        if (messages !== undefined) {
          if (counter < messages.length) {
            this.push(messages[counter++]);
          } else {
            // End the stream
            this.push(null);
          }
        }
      }
    });
  }
  static recorder(type, fileStream) {
    return new stream__WEBPACK_IMPORTED_MODULE_0__.Transform({
      objectMode: true,
      transform(msg, encoding, callback) {
        const timestamp = Date.now();
        // Replace binary data with base64 string
        const message = Object.assign({}, msg, {
          data: msg.data.toString('base64')
        });
        fileStream.write(JSON.stringify({
          type,
          timestamp,
          message
        }, null, 2));
        fileStream.write(',\n');
        callback(undefined, msg);
      }
    });
  }

  /**
   * Yield binary messages from JSON packet array until depleted.
   * @return {Generator} Returns a JSON packet iterator.
   */
  static replayer(packets) {
    let packetCounter = 0;
    let lastTimestamp = packets[0].timestamp;
    return new stream__WEBPACK_IMPORTED_MODULE_0__.Readable({
      objectMode: true,
      read() {
        const packet = packets[packetCounter++];
        if (packet) {
          const {
            type,
            timestamp,
            message
          } = packet;
          const delay = timestamp - lastTimestamp;
          lastTimestamp = timestamp;
          if (message) {
            const data = message.data ? Buffer.from(message.data, 'base64') : Buffer.alloc(0);
            const msg = Object.assign({}, message, {
              data
            });
            this.push({
              type,
              delay,
              msg
            });
          } else {
            this.push({
              type,
              delay,
              msg: null
            });
          }
        } else {
          this.push(null);
        }
      }
    });
  }
}

/***/ }),

/***/ "./lib/components/http-source/index.ts":
/*!*********************************************!*\
  !*** ./lib/components/http-source/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HttpSource: () => (/* binding */ HttpSource)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




const debug = debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:http-source');
class HttpSource extends _component__WEBPACK_IMPORTED_MODULE_1__.Source {
  /**
   * Create an HTTP component.
   *
   * The constructor sets a single readable stream from a fetch.
   */
  constructor(config) {
    const {
      uri,
      headers
    } = config;

    /**
     * Set up an incoming stream and attach it to the socket.
     */
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_2__.Readable({
      objectMode: true,
      read: function () {
        //
      }
    });

    // When an error is sent on the incoming stream, close the socket.
    incoming.on('error', e => {
      console.warn('closing socket due to incoming error', e);
      this._reader && this._reader.cancel();
    });

    /**
     * initialize the component.
     */
    super(incoming);

    // When a read is requested, continue to pull data
    _defineProperty(this, "uri", void 0);
    _defineProperty(this, "headers", void 0);
    _defineProperty(this, "length", void 0);
    _defineProperty(this, "_reader", void 0);
    incoming._read = () => {
      this._pull();
    };
    this.uri = uri;
    this.headers = headers;
  }
  play() {
    if (this.uri === undefined) {
      throw new Error('cannot start playing when there is no URI');
    }
    this.length = 0;
    fetch(this.uri, {
      headers: this.headers
    }).then(rsp => {
      if (rsp.body === null) {
        throw new Error('empty response body');
      }
      this._reader = rsp.body.getReader();
      this._pull();
    }).catch(err => {
      throw new Error(err);
    });
  }
  _pull() {
    if (this._reader === undefined) {
      return;
    }
    this._reader.read().then(({
      done,
      value
    }) => {
      if (done) {
        debug('fetch completed, total downloaded: ', this.length, ' bytes');
        this.incoming.push(null);
        return;
      }
      if (value === undefined) {
        throw new Error('expected value to be defined');
      }
      if (this.length === undefined) {
        throw new Error('expected length to be defined');
      }
      this.length += value.length;
      const buffer = Buffer.from(value);
      if (!this.incoming.push({
        data: buffer,
        type: _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RAW
      })) {
        // Something happened down stream that it is no longer processing the
        // incoming data, and the stream buffer got full.
        // This could be because we are downloading too much data at once,
        // or because the downstream is frozen. The latter is most likely
        // when dealing with a live stream (as in that case we would expect
        // downstream to be able to handle the data).
        debug('downstream back pressure: pausing read');
      } else {
        // It's ok to read more data
        this._pull();
      }
    });
  }
}

/***/ }),

/***/ "./lib/components/http-tunnel-source/index.ts":
/*!****************************************************!*\
  !*** ./lib/components/http-tunnel-source/index.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HTTPTunnelSource: () => (/* binding */ HTTPTunnelSource),
/* harmony export */   base64ArrayBuffer: () => (/* binding */ base64ArrayBuffer),
/* harmony export */   init_connection: () => (/* binding */ init_connection),
/* harmony export */   send_command: () => (/* binding */ send_command)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _openhttptunnel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./openhttptunnel */ "./lib/components/http-tunnel-source/openhttptunnel.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }






// Named status codes for CloseEvent, see:
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
const CLOSE_GOING_AWAY = 1001;

// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step. According to my tests, this appears to be a faster approach:
// http://jsperf.com/encoding-xhr-image-data/5

/*
MIT LICENSE
Copyright 2011 Jon Leighton
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function base64ArrayBuffer(arrayBuffer) {
  var base64 = '';
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1
    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1
    base64 += encodings[a] + encodings[b] + '==';
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4
    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1
    base64 += encodings[a] + encodings[b] + encodings[c] + '=';
  }
  return base64;
}
function init_connection(uri, signal, sessioncookie) {
  let response = fetch(uri, {
    method: 'GET',
    signal: signal,
    mode: 'cors',
    // no-cors, *cors, same-origin
    cache: 'no-cache',
    // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'include',
    headers: {
      'x-sessioncookie': sessioncookie,
      'Accept': 'application/x-rtsp-tunnelled',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept-Encoding': ''
      //                'Require': 'www.onvif.org/ver20/backchannel'
    }
  }).catch(error => console.error('Connection error: ' + error));
  return response;
}
function send_command(command, uri, sessioncookie) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', uri);
  xhr.setRequestHeader('x-sessioncookie', sessioncookie);
  xhr.setRequestHeader('Content-Type', 'application/x-rtsp-tunnelled');
  xhr.setRequestHeader('Pragma', 'no-cache');
  //xhr.setRequestHeader('Content-Length', '32767');
  //xhr.setRequestHeader('Expires', 'Sun, 9 Jan 1972 00:00:00 GMT');
  //xhr.setRequestHeader('Require', 'www.onvif.org/ver20/backchannel');

  xhr.send(command);
  xhr.send(command);
  xhr.onload = function () {
    if (xhr.status != 200) {
      // alert(`Error ${xhr.status}: ${xhr.statusText}`); // 404: Not Found
      console.error('Error: ' + xhr.status + ': ' + xhr.statusText);
    } else {
      //alert(`OnLoad, receive  ${xhr.response.length} bytes`); 
    }
  };
  xhr.onprogress = function (event) {
    if (event.lengthComputable) {
      //alert(`onprogress ${event.loaded} ?? ${event.total} onprogress`);
    } else {
      //alert(`onprogress ${event.loaded} bytes`); // 1111 ? 111 Content-Length
    }
  };
  xhr.onerror = function (error) {
    console.error('Error: ' + error.error + ': ' + error.message);
  };
}
class HTTPTunnelSource extends _component__WEBPACK_IMPORTED_MODULE_1__.Source {
  /**
   * Create a HTTPTunnelSource component.
   *
   * The constructor sets up GET request .
   *
   */
  constructor(config) {
    /**
     * Set up an incoming stream and attach it to the socket.
     * @type {Readable}
     */
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_2__.Readable({
      objectMode: true,
      read: function () {
        //
      }
    });

    /*
                                    (HTTP GET)
               |----<<<< data <<<<< ----|
    /client -----|                        |---- server
               |-- >>>> data >>>>-------|
                                  / (HTTP POST)
    */

    // Make GET request
    // all command responses and media data come to this socket 

    const consume = responseReader => {
      return responseReader.read().then(result => {
        if (result.done) {
          return;
        }
        const chunk = result.value;
        var buffer = Buffer.from(chunk.buffer);
        incoming.push({
          data: buffer,
          type: _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RAW
        });
        return consume(responseReader);
      });
    };
    const controller = new AbortController();
    const signal = controller.signal;
    const sessioncookie = Math.floor(Math.random() * 99999);
    if (config.uri) {
      init_connection(config.uri, signal, sessioncookie.toString()).then(response => {
        if (response && response.body) {
          return consume(response.body.getReader());
        }
      }).then(data => {
        console.log(data);
      });
    }

    /**
     * Set up outgoing stream using POST command.
     * @type {Writable}
     */
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_2__.Writable({
      objectMode: true,
      write: function (msg, encoding, callback) {
        try {
          var t = null;
          if (msg.constructor === Uint8Array) {
            var a = base64ArrayBuffer(msg.subarray(0, 3));
            var b = base64ArrayBuffer(msg.subarray(4));
            t = a + b;
          } else {
            t = btoa(msg.data);
          }
          if (config.uri) {
            send_command(t, config.uri, sessioncookie.toString());
          }
        } catch (e) {
          console.warn('message lost during send:', msg);
        }
        callback();
      }
    });

    // When an error happens on the outgoing stream, just warn.
    outgoing.on('error', e => {
      console.warn('error during send, ignoring:', e);
    });

    // When there is no more data going to be written, close!
    outgoing.on('finish', () => {
      controller.abort();
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:http_tunnel:outgoing')('finish');
    });

    /**
     * initialize the component.
     */
    super(incoming, outgoing);
    _defineProperty(this, "onServerClose", void 0);
  }

  /**
   * Expose http_tunnel opener as a class method that returns a promise which
   * resolves with a new HTTPTunnelSource.
   */
  static open(config) {
    return (0,_openhttptunnel__WEBPACK_IMPORTED_MODULE_4__.openHTTPTunnnel)(config).then(http_socket => new HTTPTunnelSource(config));
  }
}

/***/ }),

/***/ "./lib/components/http-tunnel-source/openhttptunnel.ts":
/*!*************************************************************!*\
  !*** ./lib/components/http-tunnel-source/openhttptunnel.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   openHTTPTunnnel: () => (/* binding */ openHTTPTunnnel)
/* harmony export */ });
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/config */ "./lib/utils/config.ts");


// Time in milliseconds we want to wait for a HTTP request to open
const HTTP_TUNNEL_TIMEOUT = 10007;
// Default configuration
const defaultConfig = (host = window.location.host, scheme = window.location.protocol) => {
  const Scheme = scheme === 'https:' ? 'https:' : 'http:';
  return {
    uri: `${Scheme}//${host}/rtsp_tunnnel`,
    protocol: 'binary',
    timeout: HTTP_TUNNEL_TIMEOUT
  };
};

/**
 * Open a new WebSocket, fallback to token-auth on failure and retry.
 * @param  {Object} [config={}]  WebSocket configuration.
 * @param  {String} [config.host]  Specify different host
 * @param  {String} [config.sheme]  Specify different scheme.
 * @param  {String} [config.uri]  Full uri for websocket connection
 * @param  {String} [config.protocol] protocol
 * @param  {Number} [config.timeout] HTTP connection timeout for GET request
 * @return {Promise}  Resolves with WebSocket, rejects with error.
 */
const openHTTPTunnnel = (config = {}) => {
  const {
    uri,
    protocol,
    timeout
  } = (0,_utils_config__WEBPACK_IMPORTED_MODULE_0__.merge)(defaultConfig(config.host, config.scheme), config);
  if (uri === undefined) {
    throw new Error('http_tunnel: internal error');
  }
  return new Promise((resolve, reject) => {
    try {
      // We will need to have 
      /*
      let response =  fetch( uri,
        {
         method: 'GET',
         mode: 'same-origin', // no-cors, *cors, same-origin
         cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
         credentials: 'include',
         headers:{
         'x-sessioncookie': '10095',
         'Accept': 'application/x-rtsp-tunnelled',
         'Pragma': 'no-cache',
         'Cache-Control': 'no-cache',
         'Accept-Encoding': '',
               'Require': 'www.onvif.org/ver20/backchannel'
         }
         }).catch(error => 
          reject(error.message)
       );
      return response;	
      */

      //clearTimeout(countdown)
      resolve(undefined);
    } catch (e) {
      reject(e);
    }
  });
};

/***/ }),

/***/ "./lib/components/index.browser.ts":
/*!*****************************************!*\
  !*** ./lib/components/index.browser.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AACDepay: () => (/* reexport safe */ _aacdepay__WEBPACK_IMPORTED_MODULE_1__.AACDepay),
/* harmony export */   BasicDepay: () => (/* reexport safe */ _basicdepay__WEBPACK_IMPORTED_MODULE_2__.BasicDepay),
/* harmony export */   CanvasSink: () => (/* reexport safe */ _canvas__WEBPACK_IMPORTED_MODULE_3__.CanvasSink),
/* harmony export */   CustomDepay: () => (/* reexport safe */ _customdepay__WEBPACK_IMPORTED_MODULE_4__.CustomDepay),
/* harmony export */   H264Depay: () => (/* reexport safe */ _h264depay__WEBPACK_IMPORTED_MODULE_5__.H264Depay),
/* harmony export */   HTTPTunnelSource: () => (/* reexport safe */ _http_tunnel_source__WEBPACK_IMPORTED_MODULE_22__.HTTPTunnelSource),
/* harmony export */   HttpSource: () => (/* reexport safe */ _http_source__WEBPACK_IMPORTED_MODULE_6__.HttpSource),
/* harmony export */   Inspector: () => (/* reexport safe */ _inspector__WEBPACK_IMPORTED_MODULE_7__.Inspector),
/* harmony export */   JPEGDepay: () => (/* reexport safe */ _jpegdepay__WEBPACK_IMPORTED_MODULE_8__.JPEGDepay),
/* harmony export */   MessageType: () => (/* reexport safe */ _message__WEBPACK_IMPORTED_MODULE_9__.MessageType),
/* harmony export */   Mp4Capture: () => (/* reexport safe */ _mp4capture__WEBPACK_IMPORTED_MODULE_11__.Mp4Capture),
/* harmony export */   Mp4Muxer: () => (/* reexport safe */ _mp4muxer__WEBPACK_IMPORTED_MODULE_12__.Mp4Muxer),
/* harmony export */   MseSink: () => (/* reexport safe */ _mse__WEBPACK_IMPORTED_MODULE_13__.MseSink),
/* harmony export */   ONVIFDepay: () => (/* reexport safe */ _onvifdepay__WEBPACK_IMPORTED_MODULE_14__.ONVIFDepay),
/* harmony export */   RTSP_METHOD: () => (/* reexport safe */ _rtsp_session__WEBPACK_IMPORTED_MODULE_16__.RTSP_METHOD),
/* harmony export */   RtspParser: () => (/* reexport safe */ _rtsp_parser__WEBPACK_IMPORTED_MODULE_15__.RtspParser),
/* harmony export */   RtspSession: () => (/* reexport safe */ _rtsp_session__WEBPACK_IMPORTED_MODULE_16__.RtspSession),
/* harmony export */   SDPUpdater: () => (/* reexport safe */ _sdp_updater__WEBPACK_IMPORTED_MODULE_17__.SDPUpdater),
/* harmony export */   Sink: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_0__.Sink),
/* harmony export */   Source: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_0__.Source),
/* harmony export */   Tube: () => (/* reexport safe */ _component__WEBPACK_IMPORTED_MODULE_0__.Tube),
/* harmony export */   WSSource: () => (/* reexport safe */ _ws_source__WEBPACK_IMPORTED_MODULE_18__.WSSource),
/* harmony export */   WebCodecsDecoder: () => (/* reexport safe */ _webcodecsdecoder__WEBPACK_IMPORTED_MODULE_19__.WebCodecsDecoder),
/* harmony export */   base64ArrayBuffer: () => (/* reexport safe */ _http_tunnel_source__WEBPACK_IMPORTED_MODULE_22__.base64ArrayBuffer),
/* harmony export */   createTransform: () => (/* reexport safe */ _messageStreams__WEBPACK_IMPORTED_MODULE_10__.createTransform),
/* harmony export */   dataCatcherDepay: () => (/* reexport safe */ _dataCatcherDepay__WEBPACK_IMPORTED_MODULE_20__.dataCatcherDepay),
/* harmony export */   g711toPCM: () => (/* reexport safe */ _g711toPCM__WEBPACK_IMPORTED_MODULE_21__.g711toPCM),
/* harmony export */   init_connection: () => (/* reexport safe */ _http_tunnel_source__WEBPACK_IMPORTED_MODULE_22__.init_connection),
/* harmony export */   send_command: () => (/* reexport safe */ _http_tunnel_source__WEBPACK_IMPORTED_MODULE_22__.send_command)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component */ "./lib/components/component.ts");
/* harmony import */ var _aacdepay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aacdepay */ "./lib/components/aacdepay/index.ts");
/* harmony import */ var _basicdepay__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./basicdepay */ "./lib/components/basicdepay/index.ts");
/* harmony import */ var _canvas__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./canvas */ "./lib/components/canvas/index.ts");
/* harmony import */ var _customdepay__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./customdepay */ "./lib/components/customdepay/index.ts");
/* harmony import */ var _h264depay__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./h264depay */ "./lib/components/h264depay/index.ts");
/* harmony import */ var _http_source__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./http-source */ "./lib/components/http-source/index.ts");
/* harmony import */ var _inspector__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./inspector */ "./lib/components/inspector/index.ts");
/* harmony import */ var _jpegdepay__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./jpegdepay */ "./lib/components/jpegdepay/index.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./message */ "./lib/components/message.ts");
/* harmony import */ var _messageStreams__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./messageStreams */ "./lib/components/messageStreams.ts");
/* harmony import */ var _mp4capture__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./mp4capture */ "./lib/components/mp4capture/index.ts");
/* harmony import */ var _mp4muxer__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./mp4muxer */ "./lib/components/mp4muxer/index.ts");
/* harmony import */ var _mse__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./mse */ "./lib/components/mse/index.ts");
/* harmony import */ var _onvifdepay__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./onvifdepay */ "./lib/components/onvifdepay/index.ts");
/* harmony import */ var _rtsp_parser__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./rtsp-parser */ "./lib/components/rtsp-parser/index.ts");
/* harmony import */ var _rtsp_session__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./rtsp-session */ "./lib/components/rtsp-session/index.ts");
/* harmony import */ var _sdp_updater__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./sdp-updater */ "./lib/components/sdp-updater/index.ts");
/* harmony import */ var _ws_source__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _webcodecsdecoder__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./webcodecsdecoder */ "./lib/components/webcodecsdecoder/index.ts");
/* harmony import */ var _dataCatcherDepay__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./dataCatcherDepay */ "./lib/components/dataCatcherDepay/index.ts");
/* harmony import */ var _g711toPCM__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./g711toPCM */ "./lib/components/g711toPCM/index.ts");
/* harmony import */ var _http_tunnel_source__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./http-tunnel-source */ "./lib/components/http-tunnel-source/index.ts");

























/***/ }),

/***/ "./lib/components/inspector/index.ts":
/*!*******************************************!*\
  !*** ./lib/components/inspector/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Inspector: () => (/* binding */ Inspector)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);


const generateLogger = (prefix, type) => {
  let lastTimestamp = Date.now();
  const log = msg => {
    const timestamp = Date.now();
    console.log(`${prefix}: +${timestamp - lastTimestamp}ms`, msg);
    lastTimestamp = timestamp;
  };
  if (type === undefined) {
    return log;
  } else {
    return msg => msg.type === type && log(msg);
  }
};

/**
 * Component that logs whatever is passing through.
 */
class Inspector extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  /**
   * Create a new inspector component.
   * @argument {String} type  The type of message to log (default is to log all).
   * @return {undefined}
   */
  constructor(type) {
    const incomingLogger = generateLogger('incoming', type);
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        incomingLogger(msg);
        callback(undefined, msg);
      }
    });
    const outgoingLogger = generateLogger('outgoing', type);
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        outgoingLogger(msg);
        callback(undefined, msg);
      }
    });
    super(incoming, outgoing);
  }
}

/***/ }),

/***/ "./lib/components/jpegdepay/headers.ts":
/*!*********************************************!*\
  !*** ./lib/components/jpegdepay/headers.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeFrameHeader: () => (/* binding */ makeFrameHeader),
/* harmony export */   makeHuffmanHeader: () => (/* binding */ makeHuffmanHeader),
/* harmony export */   makeImageHeader: () => (/* binding */ makeImageHeader),
/* harmony export */   makeQuantHeader: () => (/* binding */ makeQuantHeader),
/* harmony export */   makeScanHeader: () => (/* binding */ makeScanHeader)
/* harmony export */ });
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
/**
 * Generate frame and scan headers that can be prepended to the
 * RTP/JPEG data payload to produce a JPEG compressed image in
 * interchange format.
 *
 * For detailed information, check Appendix A of:
 * https://tools.ietf.org/html/rfc2435
 */

function makeImageHeader() {
  return Buffer.from([0xff, 0xd8]);
}
function makeQuantHeader(precision, qTable) {
  const lumSize = precision & 1 ? 128 : 64;
  const chmSize = precision & 2 ? 128 : 64;
  if (qTable.length !== lumSize + chmSize) {
    throw new Error('invalid quantization table');
  }
  const lumaPrefix = Buffer.from([0xff, 0xdb, 0, lumSize + 3, 0]);
  const chromaPrefix = Buffer.from([0xff, 0xdb, 0, chmSize + 3, 1]);
  return Buffer.concat([lumaPrefix, qTable.slice(0, lumSize), chromaPrefix, qTable.slice(lumSize)]);
}
function makeFrameHeader(width, height, type) {
  return Buffer.from([0xff, 0xc0,
  // SOF_0 (Start Of Frame)
  0, 17, 8, height >> 8, height, width >> 8, width, 3, 0, type === 0 ? 0x21 : 0x22, 0, 1, 0x11, 1, 2, 0x11, 1]);
}

// prettier-ignore
const LUM_DC_CODELENS = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
// prettier-ignore
const LUM_DC_SYMBOLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// prettier-ignore
const LUM_AC_CODELENS = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
// prettier-ignore
const LUM_AC_SYMBOLS = [0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];
// prettier-ignore
const CHM_DC_CODELENS = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
// prettier-ignore
const CHM_DC_SYMBOLS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
// prettier-ignore
const CHM_AC_CODELENS = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
// prettier-ignore
const CHM_AC_SYMBOLS = [0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];
function makeHuffmanHeader() {
  const LUM_DC_BUFFER = [[0xff, 0xc4, 0, 3 + LUM_DC_CODELENS.length + LUM_DC_SYMBOLS.length, 0 << 4 | 0], LUM_DC_CODELENS, LUM_DC_SYMBOLS];
  const LUM_AC_BUFFER = [[0xff, 0xc4, 0, 3 + LUM_AC_CODELENS.length + LUM_AC_SYMBOLS.length, 1 << 4 | 0], LUM_AC_CODELENS, LUM_AC_SYMBOLS];
  const CHM_DC_BUFFER = [[0xff, 0xc4, 0, 3 + CHM_DC_CODELENS.length + CHM_DC_SYMBOLS.length, 0 << 4 | 1], CHM_DC_CODELENS, CHM_DC_SYMBOLS];
  const CHM_AC_BUFFER = [[0xff, 0xc4, 0, 3 + CHM_AC_CODELENS.length + CHM_AC_SYMBOLS.length, 1 << 4 | 1], CHM_AC_CODELENS, CHM_AC_SYMBOLS];
  return Buffer.concat([...LUM_DC_BUFFER.map(Buffer.from), ...LUM_AC_BUFFER.map(Buffer.from), ...CHM_DC_BUFFER.map(Buffer.from), ...CHM_AC_BUFFER.map(Buffer.from)]);
}
function makeScanHeader() {
  return Buffer.from([0xff, 0xda,
  // SOS (Start Of Scan)
  0, 12, 3, 0, 0, 1, 0x11, 2, 0x11, 0, 63, 0]);
}

/***/ }),

/***/ "./lib/components/jpegdepay/index.ts":
/*!*******************************************!*\
  !*** ./lib/components/jpegdepay/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   JPEGDepay: () => (/* binding */ JPEGDepay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parser */ "./lib/components/jpegdepay/parser.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");





class JPEGDepay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor() {
    const jpegDebug = debug('msl:jpegdepay');
    let jpegPayloadType;
    let packets = [];
    let headerExtension;
    let jpegDepay;
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_3__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.SDP) {
          const jpegMedia = msg.sdp.media?.find(media => {
            return media.type === 'video' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'JPEG';
          });
          if (jpegMedia !== undefined && jpegMedia.rtpmap !== undefined) {
            jpegPayloadType = Number(jpegMedia.rtpmap.payloadType);
            const framesize = jpegMedia.framesize;
            // `framesize` is an SDP field that is present in e.g. Camera's
            // and is used because the width and height that can be sent inside
            // the JPEG header are both limited to 2040.
            // If present, we use this width and height as the default values
            // to be used by the jpeg depay function, otherwise we ignore this
            // and let the JPEG header inside the RTP packets determine this.
            if (framesize !== undefined) {
              const [width, height] = framesize;
              // msg.framesize = { width, height }
              jpegDepay = (0,_parser__WEBPACK_IMPORTED_MODULE_2__.jpegDepayFactory)(width, height);
            } else {
              jpegDepay = (0,_parser__WEBPACK_IMPORTED_MODULE_2__.jpegDepayFactory)();
            }
          }
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.payloadType)(msg.data) === jpegPayloadType) {
          packets.push(msg.data);
          if ((0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.extension)(msg.data)) {
            headerExtension = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.extHeader)(msg.data);
          }

          // JPEG over RTP uses the RTP marker bit to indicate end
          // of fragmentation. At this point, the packets can be used
          // to reconstruct a JPEG frame.
          if ((0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.marker)(msg.data) && packets.length > 0) {
            let jpegFrame = jpegDepay(packets);
            const reso = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.getJPEGResolutionFromExtHeader)(headerExtension);
            // jpegDebug('resolution from rtp header: %o', reso)
            if (reso.width > 0 && jpegFrame.size.width !== reso.width || reso.height > 0 && jpegFrame.size.height !== reso.height) {
              jpegDebug('updated resolution from rtp header: %o', reso);
              jpegDepay = (0,_parser__WEBPACK_IMPORTED_MODULE_2__.jpegDepayFactory)(reso.width, reso.height);
              jpegFrame = jpegDepay(packets);
            }
            this.push({
              timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.timestamp)(msg.data),
              ntpTimestamp: msg.ntpTimestamp,
              payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_4__.payloadType)(msg.data),
              data: jpegFrame.data,
              framesize: jpegFrame.size,
              type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.JPEG
            });
            packets = [];
          }
          callback();
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/jpegdepay/make-qtable.ts":
/*!*************************************************!*\
  !*** ./lib/components/jpegdepay/make-qtable.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   makeQtable: () => (/* binding */ makeQtable)
/* harmony export */ });
/* harmony import */ var _utils_clamp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/clamp */ "./lib/utils/clamp.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];

/**
 * @function makeQtable
 * Creating a quantization table from a Q factor
 * Example Code from RFC 2435 Appendix A ported to TypeScript
 *
 * Default luminance/chrominance quantization tables in RFC example are not in zig-zag order.
 * The RFC does not mention that default tables should be in zig-zag ordering,
 * but they say that about the included tables. RFC sample code appears to have a mistake.
 * All the tested cameras and LGPL projects use zig-zag default tables.
 * So we use zig-zaged tables from ISO/IEC 10918-1 Annex K Section K.1
 * @see https://tools.ietf.org/html/rfc2435
 * @see https://www.iso.org/standard/18902.html
 */
// prettier-ignore
const jpegLumaQuantizer = [16, 11, 12, 14, 12, 10, 16, 14, 13, 14, 18, 17, 16, 19, 24, 40, 26, 24, 22, 22, 24, 49, 35, 37, 29, 40, 58, 51, 61, 60, 57, 51, 56, 55, 64, 72, 92, 78, 64, 68, 87, 69, 55, 56, 80, 109, 81, 87, 95, 98, 103, 104, 103, 62, 77, 113, 121, 112, 100, 120, 92, 101, 103, 99];
// prettier-ignore
const jpeChromaQuantizer = [17, 18, 18, 24, 21, 24, 47, 26, 26, 47, 99, 66, 56, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
function makeQtable(Q) {
  const factor = (0,_utils_clamp__WEBPACK_IMPORTED_MODULE_0__.clamp)(Q, 1, 99);
  const buffer = Buffer.alloc(128);
  const S = Q < 50 ? Math.floor(5000 / factor) : 200 - factor * 2;
  for (let i = 0; i < 64; i++) {
    const lq = Math.floor((jpegLumaQuantizer[i] * S + 50) / 100);
    const cq = Math.floor((jpeChromaQuantizer[i] * S + 50) / 100);
    buffer.writeUInt8((0,_utils_clamp__WEBPACK_IMPORTED_MODULE_0__.clamp)(lq, 1, 255), i);
    buffer.writeUInt8((0,_utils_clamp__WEBPACK_IMPORTED_MODULE_0__.clamp)(cq, 1, 255), i + 64);
  }
  return buffer;
}

/***/ }),

/***/ "./lib/components/jpegdepay/parser.ts":
/*!********************************************!*\
  !*** ./lib/components/jpegdepay/parser.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jpegDepayFactory: () => (/* binding */ jpegDepayFactory)
/* harmony export */ });
/* harmony import */ var _headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./headers */ "./lib/components/jpegdepay/headers.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _make_qtable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./make-qtable */ "./lib/components/jpegdepay/make-qtable.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];




/**
 * Each packet contains a special JPEG header which immediately follows
 * the RTP header.  The first 8 bytes of this header, called the "main
 * JPEG header", are as follows:*
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * | Type-specific |              Fragment Offset                  |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |      Type     |       Q       |     Width     |     Height    |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */

/**
 * Restart Marker header: when using types 64-127
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |       Restart Interval        |F|L|       Restart Count       |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */

/**
 * Quantization Table header: when using Q values 128-255
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |      MBZ      |   Precision   |             Length            |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * |                    Quantization Table Data                    |
 * |                              ...                              |
 * +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 */

function jpegDepayFactory(defaultWidth = 0, defaultHeight = 0) {
  const IMAGE_HEADER = (0,_headers__WEBPACK_IMPORTED_MODULE_0__.makeImageHeader)();
  const HUFFMAN_HEADER = (0,_headers__WEBPACK_IMPORTED_MODULE_0__.makeHuffmanHeader)();
  const SCAN_HEADER = (0,_headers__WEBPACK_IMPORTED_MODULE_0__.makeScanHeader)();
  return function jpegDepay(packets) {
    let metadata;
    const fragments = [];
    for (const packet of packets) {
      let fragment = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_1__.payload)(packet);

      // Parse and extract JPEG header.
      const typeSpecific = fragment.readUInt8(0);
      const fragmentOffset = fragment.readUInt8(1) << 16 | fragment.readUInt8(2) << 8 | fragment.readUInt8(3);
      const type = fragment.readUInt8(4);
      const Q = fragment.readUInt8(5);
      const width = fragment.readUInt8(6) * 8 || defaultWidth;
      const height = fragment.readUInt8(7) * 8 || defaultHeight;
      fragment = fragment.slice(8);

      // Parse and extract Restart Marker header if present.
      let DRI = 0;
      if (type >= 64 && type <= 127) {
        DRI = fragment.readUInt16BE(0);
        fragment = fragment.slice(4);
      }

      // Parse and extract Quantization Table header if present.
      if (Q >= 128 && fragmentOffset === 0) {
        // const MBZ = fragment.readUInt8()
        const precision = fragment.readUInt8(1);
        const length = fragment.readUInt16BE(2);
        const qTable = fragment.slice(4, 4 + length);
        metadata = {
          typeSpecific,
          type,
          width,
          height,
          DRI,
          precision,
          qTable
        };
        fragment = fragment.slice(4 + length);
      }
      // Compute Quantization Table
      else if (Q < 128 && fragmentOffset === 0) {
        const precision = 0;
        const qTable = (0,_make_qtable__WEBPACK_IMPORTED_MODULE_2__.makeQtable)(Q);
        metadata = {
          typeSpecific,
          type,
          width,
          height,
          DRI,
          precision,
          qTable
        };
      }
      fragments.push(fragment);
    }
    if (metadata === undefined) {
      throw new Error('no quantization header present');
    }
    const {
      precision,
      qTable,
      type,
      width,
      height
    } = metadata;
    const quantHeader = (0,_headers__WEBPACK_IMPORTED_MODULE_0__.makeQuantHeader)(precision, qTable);
    if (metadata.DRI !== 0) {
      throw new Error('not implemented: DRI');
    }
    const frameHeader = (0,_headers__WEBPACK_IMPORTED_MODULE_0__.makeFrameHeader)(width, height, type);
    return {
      size: {
        width,
        height
      },
      data: Buffer.concat([IMAGE_HEADER, quantHeader, frameHeader, HUFFMAN_HEADER, SCAN_HEADER, ...fragments])
    };
  };
}

/***/ }),

/***/ "./lib/components/message.ts":
/*!***********************************!*\
  !*** ./lib/components/message.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MessageType: () => (/* binding */ MessageType)
/* harmony export */ });
let MessageType = /*#__PURE__*/function (MessageType) {
  MessageType[MessageType["UNKNOWN"] = 0] = "UNKNOWN";
  MessageType[MessageType["RAW"] = 1] = "RAW";
  MessageType[MessageType["RTP"] = 2] = "RTP";
  MessageType[MessageType["RTCP"] = 3] = "RTCP";
  MessageType[MessageType["RTSP"] = 4] = "RTSP";
  MessageType[MessageType["SDP"] = 5] = "SDP";
  MessageType[MessageType["ELEMENTARY"] = 6] = "ELEMENTARY";
  MessageType[MessageType["H264"] = 7] = "H264";
  MessageType[MessageType["ISOM"] = 8] = "ISOM";
  MessageType[MessageType["XML"] = 9] = "XML";
  MessageType[MessageType["JPEG"] = 10] = "JPEG";
  MessageType[MessageType["PCM"] = 11] = "PCM";
  MessageType[MessageType["SPS"] = 12] = "SPS";
  MessageType[MessageType["PPS"] = 13] = "PPS";
  MessageType[MessageType["META_RAW"] = 14] = "META_RAW";
  MessageType[MessageType["SEI"] = 15] = "SEI";
  return MessageType;
}({});

/***/ }),

/***/ "./lib/components/messageStreams.ts":
/*!******************************************!*\
  !*** ./lib/components/messageStreams.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createTransform: () => (/* binding */ createTransform)
/* harmony export */ });
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_0__);

const createTransform = transform => {
  return new stream__WEBPACK_IMPORTED_MODULE_0__.Transform({
    objectMode: true,
    transform
  });
};

/***/ }),

/***/ "./lib/components/mp4-parser/index.ts":
/*!********************************************!*\
  !*** ./lib/components/mp4-parser/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mp4Parser: () => (/* binding */ Mp4Parser)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parser */ "./lib/components/mp4-parser/parser.ts");





/**
 * A component that converts raw binary MP4 data into ISOM boxes.
 * @extends {Component}
 */
class Mp4Parser extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  /**
   * Create a new RTSP parser component.
   */
  constructor() {
    const parser = new _parser__WEBPACK_IMPORTED_MODULE_3__.Parser();

    // Incoming stream
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, _, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RAW) {
          parser.parse(msg.data).forEach(message => incoming.push(message));
          callback();
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/mp4-parser/parser.ts":
/*!*********************************************!*\
  !*** ./lib/components/mp4-parser/parser.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Parser: () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/protocols/isom */ "./lib/utils/protocols/isom.ts");
/* harmony import */ var _mp4muxer_helpers_isom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../mp4muxer/helpers/isom */ "./lib/components/mp4muxer/helpers/isom.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




const debug = debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:mp4-parser');

// Identify boxes that conforms to an ISO BMFF byte stream:
//  - header boxes: ftyp + moov
//  - segment boxes: [stype] + moof + mdat + [[mdat]...]
const ISO_BMFF_BOX_TYPES = new Set(['ftyp', 'moov', 'styp', 'moof', 'mdat']);
/**
 * Extract type and size information from the box header
 * (8-byte section at beginning of the box).
 */
const mp4BoxInfo = chunks => {
  const header = Buffer.alloc(_utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__.BOX_HEADER_BYTES);
  let i = 0;
  let bytesRead = 0;
  while (bytesRead < header.length) {
    const chunk = chunks[i++];
    const bytesToRead = Math.min(chunk.length, header.length - bytesRead);
    chunk.copy(header, bytesRead, 0, bytesToRead);
    bytesRead += bytesToRead;
  }
  const size = header.readUInt32BE(0);
  const type = (0,_utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__.boxType)(header);
  return {
    type,
    size
  };
};

/**
 * Parser class with a public method that takes a data chunk and returns the
 * next box, or null of there is no complete box. The parser keeps track of the
 * added chunks internally in an array and only concatenates chunks when data is
 * needed to construct a message.
 * @type {[type]}
 */
class Parser {
  /**
   * Create a new Parser object.
   */
  constructor() {
    _defineProperty(this, "_chunks", []);
    _defineProperty(this, "_length", 0);
    _defineProperty(this, "_box", void 0);
    _defineProperty(this, "_ftyp", void 0);
    this._init();
  }

  /**
   * Initialize the internal properties to their default starting
   * values.
   */
  _init() {
    this._chunks = [];
    this._length = 0;
  }
  _push(chunk) {
    this._chunks.push(chunk);
    this._length += chunk.length;
  }

  /**
   * Extract MP4 boxes.
   * @return {Array} An array of messages, possibly empty.
   */
  _parseBox() {
    // Skip as long as we don't have the first 8 bytes
    if (this._length < _utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__.BOX_HEADER_BYTES) {
      return null;
    }

    // Enough bytes to construct the header and extract packet info.
    if (!this._box) {
      this._box = mp4BoxInfo(this._chunks);
    }

    // As long as we don't have enough chunks, skip.
    if (this._length < this._box.size) {
      return null;
    }

    // We have enough data to extract a box.
    // The buffer package has a problem that it doesn't optimize concatenation
    // of an array with only one buffer, check for that (prevents performance issue)
    const buffer = this._chunks.length === 1 ? this._chunks[0] : Buffer.concat(this._chunks);
    const box = buffer.slice(0, this._box.size);
    const trailing = buffer.slice(this._box.size);

    // Prepare next bit.
    this._init();
    this._push(trailing);

    // Ignore invalid boxes
    if (!ISO_BMFF_BOX_TYPES.has(this._box.type)) {
      console.warn(`ignored non-ISO BMFF Byte Stream box type: ${this._box.type} (${this._box.size} bytes)`);
      return Buffer.alloc(0);
    }
    delete this._box;
    return box;
  }

  /**
   * Add the next chunk of data to the parser and extract messages.
   * If no message can be extracted, an empty array is returned, otherwise
   * an array of messages is returned.
   * @param  {Buffer} chunk The next piece of data.
   * @return {Array}        An array of messages, possibly empty.
   */
  parse(chunk) {
    this._push(chunk);
    const messages = [];
    let done = false;
    while (!done) {
      const data = this._parseBox();
      if (data !== null) {
        if ((0,_utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__.boxType)(data) === 'ftyp') {
          this._ftyp = data;
        } else if ((0,_utils_protocols_isom__WEBPACK_IMPORTED_MODULE_2__.boxType)(data) === 'moov') {
          const moov = new _mp4muxer_helpers_isom__WEBPACK_IMPORTED_MODULE_3__.Container('moov');
          const tracks = moov.parse(data);
          debug('MP4 tracks: ', tracks);
          messages.push({
            type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.ISOM,
            data: Buffer.concat([this._ftyp ?? Buffer.alloc(0), data]),
            tracks
          });
        } else {
          messages.push({
            type: _message__WEBPACK_IMPORTED_MODULE_1__.MessageType.ISOM,
            data
          });
        }
      } else {
        done = true;
      }
    }
    return messages;
  }
}

/***/ }),

/***/ "./lib/components/mp4capture/index.ts":
/*!********************************************!*\
  !*** ./lib/components/mp4capture/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mp4Capture: () => (/* binding */ Mp4Capture)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




const MAX_CAPTURE_BYTES = 225000000; // 5 min at a rate of 6 Mbit/s

/**
 * Component that records MP4 data.
 *
 * @extends Component
 */
class Mp4Capture extends _component__WEBPACK_IMPORTED_MODULE_1__.Tube {
  /**
   * Create a new mp4muxer component.
   * @return {undefined}
   */
  constructor(maxSize = MAX_CAPTURE_BYTES) {
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_2__.Transform({
      objectMode: true,
      transform: (msg, encoding, callback) => {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SDP) {
          // Arrival of SDP indicates new movie, start recording if active.
          if (this._active) {
            this._capture = true;
          }
        } else if (this._capture && msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.ISOM) {
          // MP4 box has arrived, record if appropriate
          if (this._bufferOffset < this._buffer.byteLength - msg.data.byteLength) {
            msg.data.copy(this._buffer, this._bufferOffset);
            this._bufferOffset += msg.data.byteLength;
          } else {
            this.stop();
          }
        }
        // Always pass on all messages
        callback(undefined, msg);
      }
    });

    // Stop any recording when the stream is closed.
    incoming.on('finish', () => {
      this.stop();
    });
    super(incoming);
    _defineProperty(this, "_active", void 0);
    _defineProperty(this, "_capture", void 0);
    _defineProperty(this, "_captureCallback", void 0);
    _defineProperty(this, "_bufferOffset", void 0);
    _defineProperty(this, "_bufferSize", void 0);
    _defineProperty(this, "_buffer", void 0);
    this._buffer = Buffer.allocUnsafe(0);
    this._bufferSize = maxSize;
    this._bufferOffset = 0;
    this._active = false;
    this._capture = false;
    this._captureCallback = () => {
      /** noop */
    };
  }

  /**
   * Activate video capture. The capture will begin when a new movie starts,
   * and will terminate when the movie ends or when the buffer is full. On
   * termination, the callback you passed will be called with the captured
   * data as argument.
   * @public
   * @param  {Function} callback Will be called when data is captured.
   * @return {undefined}
   */
  start(callback) {
    if (!this._active) {
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:capture:start')(callback);
      this._captureCallback = callback;
      this._buffer = Buffer.allocUnsafe(this._bufferSize);
      this._bufferOffset = 0;
      this._active = true;
    }
  }

  /**
   * Deactivate video capture. This ends an ongoing capture and prevents
   * any further capturing.
   * @public
   * @return {undefined}
   */
  stop() {
    if (this._active) {
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:capture:stop')(`captured bytes: ${this._bufferOffset}`);
      try {
        this._captureCallback(this._buffer.slice(0, this._bufferOffset));
      } catch (e) {
        console.error(e);
      }
      this._buffer = Buffer.allocUnsafe(0);
      this._bufferOffset = 0;
      this._active = false;
      this._capture = false;
    }
  }
}

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/aacSettings.ts":
/*!********************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/aacSettings.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   aacSettings: () => (/* binding */ aacSettings)
/* harmony export */ });
/* harmony import */ var _isom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isom */ "./lib/components/mp4muxer/helpers/isom.ts");


// All audio object types defined in ISO/IEC 14496-3 pp. 40
const AUDIO_OBJECT_TYPE_NAMES = {
  1: 'AAC Main',
  2: 'AAC LC'
};

// All frequencies defined in ISO/IEC 14496-3 pp. 42
const FREQUENCY_VALUES = {
  0: '96 kHz',
  1: '88.2 kHz',
  2: '64 kHz',
  3: '48 kHz',
  4: '44.1 kHz',
  5: '32 kHz',
  6: '24 kHz',
  7: '22.05 kHz',
  8: '16 kHz',
  9: '12 kHz',
  10: '11.025 kHz',
  11: '8 kHz',
  12: '7.35 kHz'
};

// All channels defined in ISO/IEC 14496-3 pp. 42
const CHANNEL_CONFIG_NAMES = {
  1: 'Mono',
  2: 'Stereo'
};
const aacEncodingName = audioConfigBytes => {
  const audioObjectType = audioConfigBytes >>> 11 & 0x001f;
  const frequencyIndex = audioConfigBytes >>> 7 & 0x000f;
  const channelConfig = audioConfigBytes >>> 3 & 0x000f;
  const audioType = AUDIO_OBJECT_TYPE_NAMES[audioObjectType] || `AAC (${audioObjectType})`;
  const samplingRate = FREQUENCY_VALUES[frequencyIndex] || 'unknown';
  const channels = CHANNEL_CONFIG_NAMES[channelConfig] || channelConfig.toString();
  return {
    coding: audioType,
    samplingRate,
    channels
  };
};
const aacSettings = (media, date, trackId) => {
  /*
   * Example SDP media segment for MPEG4-GENERIC audio:
   *
   {
     "type": "audio",
     "port": "0",
     "proto": "RTP/AVP",
     "fmt": "97",
     "connectionData": {
       "netType": "IN",
       "addrType": "IP4",
       "connectionAddress": "0.0.0.0"
     },
     "bwtype": "AS",
     "bandwidth": "32",
     "rtpmap": {
       "payloadType": "97",
       "encodingName": "MPEG4-GENERIC",
       "clockrate": "16000",
       "encodingParameters": "1"
     },
     "fmtp": {
       "format": "97",
       "parameters": {
         "streamtype": "5",
         "profile-level-id": "2",
         "mode": "AAC-hbr",
         "config": "1408",
         "sizelength": "13",
         "indexlength": "3",
         "indexdeltalength": "3",
         "bitrate": "32000"
       }
     },
     "control": "rtsp://hostname/media/media.amp/stream=1?audio=1"
   }
  */

  const bitrate = Number(media.fmtp.parameters.bitrate) || 320000;
  const audioConfigBytes = parseInt(media.fmtp.parameters.config, 16);
  const audioObjectType = audioConfigBytes >>> 11 & 0x001f;
  return {
    tkhd: {
      track_ID: trackId,
      creation_time: date,
      modification_time: date,
      width: 0,
      height: 0,
      volume: 1
    },
    mdhd: {
      timescale: Number(media.rtpmap.clockrate),
      creation_time: date,
      modification_time: date,
      duration: 0
    },
    hdlr: {
      handler_type: 'soun',
      name: 'SoundHandler\0' // 00 soundhandler, add 00 if things screws up
    },

    mediaHeaderBox: new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('smhd'),
    sampleEntryBox: new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('mp4a', {
      samplerate: media.rtpmap.clockrate << 16 >>> 0 // FIXME: Is this  correct?
    }, new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('esds', {
      audioConfigBytes: audioConfigBytes,
      // Converting from hex string to int
      maxBitRate: bitrate,
      avgBitRate: bitrate
    })),
    /*
    https://wiki.multimedia.cx/index.php/Understanding_AAC
    AAC is a variable bitrate (VBR) block-based codec where each block decodes
    to 1024 time-domain samples, which means that a single block (or frame?) is
    1024 ticks long, which we take as default here.
    */
    defaultFrameDuration: 1024,
    // MIME type
    mime: `mp4a.40.${audioObjectType}`,
    codec: aacEncodingName(audioConfigBytes)
  };
};

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/boxbuilder.ts":
/*!*******************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/boxbuilder.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BoxBuilder: () => (/* binding */ BoxBuilder)
/* harmony export */ });
/* harmony import */ var _isom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isom */ "./lib/components/mp4muxer/helpers/isom.ts");
/* harmony import */ var _aacSettings__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./aacSettings */ "./lib/components/mp4muxer/helpers/aacSettings.ts");
/* harmony import */ var _h264Settings__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./h264Settings */ "./lib/components/mp4muxer/helpers/h264Settings.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_3__);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




const formatDefaults = {
  'MPEG4-GENERIC': _aacSettings__WEBPACK_IMPORTED_MODULE_1__.aacSettings,
  H264: _h264Settings__WEBPACK_IMPORTED_MODULE_2__.h264Settings
};
const createTrackData = () => {
  return {
    lastTimestamp: 0,
    baseMediaDecodeTime: 0,
    defaultFrameDuration: 0,
    clockrate: 0,
    bitrate: 0,
    framerate: 0,
    cumulativeByteLength: 0,
    cumulativeDuration: 0,
    cumulativeFrames: 0
  };
};
const updateRateInfo = (trackData, {
  byteLength,
  duration
}) => {
  trackData.cumulativeByteLength += byteLength;
  trackData.cumulativeDuration += duration;
  trackData.cumulativeFrames++;

  // Update the cumulative number size (bytes) and duration (ticks), and if
  // the duration exceeds the clockrate (meaning longer than 1 second of data),
  // then compute a new bitrate and reset cumulative size and duration.
  if (trackData.cumulativeDuration >= trackData.clockrate) {
    const bits = 8 * trackData.cumulativeByteLength;
    const frames = trackData.cumulativeFrames;
    const seconds = trackData.cumulativeDuration / trackData.clockrate;
    trackData.bitrate = bits / seconds;
    trackData.framerate = frames / seconds;
    trackData.cumulativeByteLength = 0;
    trackData.cumulativeDuration = 0;
    trackData.cumulativeFrames = 0;
  }
};

/**
 * Create boxes for a stream initiated by an sdp object
 *
 * @class BoxBuilder
 */
class BoxBuilder {
  constructor() {
    _defineProperty(this, "trackIdMap", void 0);
    _defineProperty(this, "sequenceNumber", void 0);
    _defineProperty(this, "ntpPresentationTime", void 0);
    _defineProperty(this, "trackData", void 0);
    _defineProperty(this, "videoTrackId", void 0);
    this.trackIdMap = {};
    this.sequenceNumber = 0;
    this.ntpPresentationTime = 0;
    this.trackData = [];
  }
  trak(settings) {
    const trak = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('trak');
    const mdia = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('mdia');
    const minf = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('minf');
    const dinf = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('dinf');
    const dref = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('dref');
    const stbl = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('stbl');
    dref.set('entry_count', 1);
    trak.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('tkhd', settings.tkhd), mdia.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('mdhd', settings.mdhd), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('hdlr', settings.hdlr), minf.append(settings.mediaHeaderBox,
    // vmhd or smhd box (video or sound)
    dinf.append(dref.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('url '))), stbl.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('stsd', undefined, settings.sampleEntryBox), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('stts'), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('stsc'), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('stco'), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('stsz'), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('stss')))));
    return trak;
  }

  /**
   * Creates a Moov box from the provided options.
   * @method moov
   * @param  {Object} mvhdSettings settings for the movie header box
   * @param  {Object[]} tracks track specific settings
   * @return {Moov} Moov object
   */
  moov(sdp, date) {
    const moov = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('moov');
    moov.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('mvhd', {
      creation_time: date,
      modification_time: date,
      duration: 0
    }));
    const mvex = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('mvex');

    // For each of the media segments in the SDP structure, we will set up
    // a track in the MP4 file. For each track, a 'trak' box is added to the
    // 'moov' box and a 'trex' box is added to the 'mvex' box.

    this.trackIdMap = {};
    this.sequenceNumber = 0;
    this.ntpPresentationTime = 0;
    let trackId = 0;
    this.trackData = [];
    sdp.media?.forEach(media => {
      if (media.rtpmap === undefined) {
        return;
      }
      const payloadType = media.rtpmap.payloadType;
      const encoding = media.rtpmap.encodingName;
      if (formatDefaults[encoding] !== undefined) {
        // We know how to handle this encoding, add a new track for it, and
        // register the track for this payloadType.
        this.trackIdMap[payloadType] = ++trackId;

        // Mark the video track
        if (media.type.toLowerCase() === 'video') {
          this.videoTrackId = trackId;
        }

        // Extract the settings from the SDP media information based on
        // the encoding name (H264, MPEG4-GENERIC, ...).
        const settings = formatDefaults[encoding](media, date, trackId);
        media.mime = settings.mime; // add MIME type to the SDP media
        media.codec = settings.codec; // add human readable codec string to the SDP media

        const trackData = createTrackData();
        trackData.clockrate = media.rtpmap.clockrate;
        // Set default frame duration (in ticks) for later use
        trackData.defaultFrameDuration = settings.defaultFrameDuration;
        this.trackData.push(trackData);
        const trak = this.trak(settings);
        moov.append(trak);
        mvex.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('trex', {
          track_ID: trackId
        }));
      }
    });
    moov.append(mvex);
    return moov;
  }

  /**
   * Boxes that carry actual elementary stream fragment metadata + data.
   */

  /**
   * Creates a moof box from the provided fragment metadata.
   * @method moof
   * @param  {Object} options options containing, sequencenumber, base time, trun settings, samples
   * @return {Moof} Moof object
   */
  moof(metadata) {
    let dbg = debug__WEBPACK_IMPORTED_MODULE_3___default()('msl:boxbuilder:moof');
    const {
      trackId,
      timestamp,
      byteLength
    } = metadata;
    const trackOffset = trackId - 1;
    const trackData = this.trackData[trackOffset];

    // The RTP timestamps are unsigned 32 bit and will overflow
    // at some point. We can guard against the overflow by ORing with 0,
    // which will bring any difference back into signed 32-bit domain.
    let duration = trackData.lastTimestamp !== 0 ? timestamp - trackData.lastTimestamp | 0 : trackData.defaultFrameDuration;
    if (duration < 0) {
      dbg('track duration < 0! using default frame duration (duration: %o, timestamp: %o, last timestamp: %o, trackdata: %o)', duration, timestamp, trackData.lastTimestamp, trackData);
      duration = trackData.defaultFrameDuration;
    }
    trackData.lastTimestamp = timestamp;
    if (duration < 0) duration = trackData.defaultFrameDuration;
    const moof = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('moof');
    const traf = new _isom__WEBPACK_IMPORTED_MODULE_0__.Container('traf');
    const trun = new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('trun', {
      sample_duration: duration,
      sample_size: byteLength,
      first_sample_flags: 0x40
    });
    moof.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('mfhd', {
      sequence_number: this.sequenceNumber++
    }), traf.append(new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('tfhd', {
      track_ID: trackId
    }), new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('tfdt', {
      baseMediaDecodeTime: trackData.baseMediaDecodeTime
    }), trun));
    trackData.baseMediaDecodeTime += duration;

    // Correct the trun data offset
    trun.set('data_offset', moof.byteLength + 8);
    updateRateInfo(trackData, {
      byteLength,
      duration
    });
    return moof;
  }

  /**
   * Creates an mdat box containing the elementary stream data.
   * @param  {[type]} data [description]
   * @return [type]        [description]
   */
  mdat(data) {
    const box = new _isom__WEBPACK_IMPORTED_MODULE_0__.Box('mdat');
    box.add('data', data);
    return box;
  }
  setPresentationTime(trackId, ntpTimestamp) {
    // Before updating the baseMediaDecodeTime, we check if
    // there is already a base NTP time to use as a reference
    // for computing presentation times.
    if (!this.ntpPresentationTime && ntpTimestamp && trackId === this.videoTrackId) {
      const trackOffset = trackId - 1;
      const trackData = this.trackData[trackOffset];
      this.ntpPresentationTime = ntpTimestamp - 1000 * (trackData.baseMediaDecodeTime / trackData.clockrate);
    }
  }
}

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/bufferreader.ts":
/*!*********************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/bufferreader.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BufferReader: () => (/* binding */ BufferReader)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Defines functions for reading from a binary buffer. Works similair to the
 * DataView object, but uses bitshifts instead for performance.
 * @class BufferReader
 * @constructor
 * @param {ArrayBuffer} buffer An ArrayBuffer to be read from.
 */
class BufferReader {
  constructor(buffer) {
    _defineProperty(this, "_buffer", void 0);
    _defineProperty(this, "_dataView", void 0);
    _defineProperty(this, "_offset", void 0);
    _defineProperty(this, "_bitpos", void 0);
    _defineProperty(this, "_byte", void 0);
    this._buffer = buffer;
    this._dataView = new DataView(this._buffer);
    this._offset = 0;
    this._bitpos = 0;
    this._byte = 0;
  }

  /**
   * Reads 8-bit of data from the buffer.
   * @method readUint8
   * @param  {Number} offset Index in the buffer.
   * @return {Number} An unsigned 8-bit integer.
   */
  readUint8(offset) {
    return this._dataView.getUint8(offset);
  }

  /**
   * Reads 16-bit of data from the buffer.
   * @method readUint16
   * @param  {Number} offset Index in the buffer.
   * @return {Number} An unsigned 16-bit integer.
   */
  readUint16(offset) {
    return this._dataView.getUint16(offset);
  }

  /**
   * Reads 32-bit of data from the buffer.
   * @method readUint32
   * @param  {Number} offset Index in the buffer.
   * @return {Number} An unsigned 32-bit integer.
   */
  readUint32(offset) {
    return this._dataView.getUint32(offset);
  }

  /**
   * Reads the next byte of data from the buffer and increaments the offset.
   * @method readNext
   * @return {Number} An unsigned 8-bit integer.
   */
  readNext() {
    const value = this.readUint8(this._offset);
    this._offset += 1;
    return value;
  }
  readBits(length) {
    if (length > 32 || length === 0) {
      throw new Error('length has to be between 0 - 31 bits');
    }
    let result = 0;
    for (let i = 1; i <= length; ++i) {
      if (this._bitpos === 0) {
        /* Previous byte all read out. Get a new one. */
        this._byte = this.readNext();
      }
      /* Shift result one left to make room for another bit,
      then add the next bit on the stream. */
      result = result << 1 | this._byte >> 8 - ++this._bitpos & 0x01;
      this._bitpos %= 8;
    }
    return result;
  }
  readUnsignedExpGolomb() {
    let bitsToRead = 0;
    while (this.readBits(1) !== 1) {
      bitsToRead++;
    }
    if (bitsToRead === 0) {
      return 0; /* Easy peasy, just a single 1. This is 0 in exp golomb */
    }

    if (bitsToRead >= 31) {
      throw new Error('read unsigned exponential Golomb: internal error');
    }

    /* Read all bits part of this number */
    let n = this.readBits(bitsToRead);
    /* Move in the 1 read by while-statement above */
    n |= 0x1 << bitsToRead;
    return n - 1; /* Because result in exp golomb is one larger */
  }

  readSignedExpGolomb() {
    let r = this.readUnsignedExpGolomb();
    if (r & 0x01) {
      r = r + 1 >> 1;
    } else {
      r = -(r >> 1);
    }
    return r;
  }

  /**
   * Returns the size of the buffer
   * @method readSize
   * @return {Number} The buffer size.
   */
  size() {
    return this._buffer.byteLength;
  }

  /**
   * Returns an instance of the buffer as an unsigned 8-bit integer array.
   * @method getUint8Array
   * @return {Uint8Array} Unsigned 8-bit integer representation of the buffer
   */
  getUint8Array() {
    return new Uint8Array(this._buffer);
  }

  /**
   * Returns the buffer object
   * @method getArrayBuffer
   * @return {ArrayBuffer} The buffer used the BufferReader
   */
  getArrayBuffer() {
    return this._buffer;
  }
}

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/h264Settings.ts":
/*!*********************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/h264Settings.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h264Settings: () => (/* binding */ h264Settings)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./lib/components/mp4muxer/helpers/utils.ts");
/* harmony import */ var _isom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isom */ "./lib/components/mp4muxer/helpers/isom.ts");
/* harmony import */ var _spsparser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./spsparser */ "./lib/components/mp4muxer/helpers/spsparser.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_3__);




const PROFILE_NAMES = {
  66: 'Baseline',
  77: 'Main',
  100: 'High'
};
const h264EncodingName = profileLevelId => {
  const profileCode = parseInt(profileLevelId.substr(0, 2), 16);
  const levelCode = parseInt(profileLevelId.substr(4, 2), 16);
  const profile = PROFILE_NAMES[profileCode] || profileCode.toString();
  const level = (levelCode / 10).toFixed(1);
  return {
    coding: 'H.264',
    profile,
    level
  };
};
const h264Settings = (media, date, trackId) => {
  /*
   * Example SDP media segment for H264 audio:
   *
    {
     "type": "video",
     "port": "0",
     "proto": "RTP/AVP",
     "fmt": "96",
     "connectionData": {
       "netType": "IN",
       "addrType": "IP4",
       "connectionAddress": "0.0.0.0"
     },
     "bwtype": "AS",
     "bandwidth": "50000",
     "rtpmap": {
       "payloadType": "96",
       "encodingName": "H264",
       "clockrate": "90000"
     },
     "fmtp": {
       "format": "96",
       "parameters": {
         "packetization-mode": "1",
         "profile-level-id": "4d0029",
         "sprop-parameter-sets": "Z00AKeKQDwBE/LgLcBAQGkHiRFQ=,aO48gA=="
       }
     },
     "control": "rtsp://hostname/media/media.amp/stream=0?audio=1",
     "framerate": "25.000000",
     "transform": [[1,0,0],[0,1,0],[0,0,1]]
   },
    */

  if (!media.fmtp) {
    debug__WEBPACK_IMPORTED_MODULE_3___default()('adding dummy fmtp block');
    media.fmtp = {
      'format': '35',
      'parameters': {
        'packetization-mode': 1,
        'profile-level-id': '4d402a',
        'sprop-parameter-sets': 'Z01AKo2NYDwBE/LgLcBDQECA,aO44gA=='
      }
    };
  }
  const profileLevelId = media.fmtp.parameters['profile-level-id'];
  const parameterSets = media.fmtp.parameters['sprop-parameter-sets'].split(',').map(_utils__WEBPACK_IMPORTED_MODULE_0__.base64DecToArr);

  // We assume the first set is _the_ SPS (no support for multiple).
  const sps = parameterSets.slice(0, 1);
  // The remaining sets are all PPS to support more than one.
  const pps = parameterSets.slice(1);
  const parsedSps = new _spsparser__WEBPACK_IMPORTED_MODULE_2__.SPSParser(sps[0].buffer).parse();
  // If media framerate is missing in SDP, it is not possible to calculate
  // the frame duration. Use a fallback value (90000 Hz / 25 fps)
  const FALLBACK_FRAME_DURATION = 3600;
  return {
    mediaHeaderBox: new _isom__WEBPACK_IMPORTED_MODULE_1__.Box('vmhd'),
    sampleEntryBox: new _isom__WEBPACK_IMPORTED_MODULE_1__.Container('avc1', {
      width: parsedSps.width,
      height: parsedSps.height
    }, new _isom__WEBPACK_IMPORTED_MODULE_1__.Box('avcC', {
      AVCProfileIndication: sps[0][1],
      profile_compatibility: sps[0][2],
      AVCLevelIndication: sps[0][3],
      sequenceParameterSets: sps,
      pictureParameterSets: pps
    })),
    tkhd: {
      track_ID: trackId,
      creation_time: date,
      modification_time: date,
      width: parsedSps.width << 16,
      height: parsedSps.height << 16,
      volume: 0
    },
    hdlr: {},
    mdhd: {
      timescale: media.rtpmap.clockrate,
      creation_time: date,
      modification_time: date,
      duration: 0
    },
    // (ticks / s) / (frames / s) = ticks / frame, e.g. frame duration in ticks
    defaultFrameDuration: media.framerate !== undefined && media.framerate > 0 ? Number(media.rtpmap.clockrate) / Number(media.framerate) || FALLBACK_FRAME_DURATION : FALLBACK_FRAME_DURATION,
    // MIME type
    mime: `avc1.${profileLevelId}`,
    codec: h264EncodingName(profileLevelId)
  };
};

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/isom.ts":
/*!*************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/isom.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Box: () => (/* binding */ Box),
/* harmony export */   Container: () => (/* binding */ Container)
/* harmony export */ });
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// Elements: parts of a box that hold values.
// They should have a:
// - byteLength
// - value (can be accessed from outside to set/retrieve)
// - store(buffer, offset) -> write the value to a buffer
// - load(buffer, offset) -> read data and store in value

const CONTAINER_TYPES = new Set(['moov']);

// Constants
const UINT32_RANGE = Math.pow(2, 32);
class BoxElement {
  constructor(size) {
    _defineProperty(this, "byteLength", void 0);
    _defineProperty(this, "value", void 0);
    this.byteLength = size;
  }
}
class Empty extends BoxElement {
  constructor(size = 0) {
    super(size);
    _defineProperty(this, "copy", (buffer, offset) => {
      buffer.fill(0, offset, offset + this.byteLength);
    });
  }
  load() {
    /** noop */
  }
}
class CharArray extends BoxElement {
  constructor(s) {
    super(s.length);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      for (let i = 0; i < this.byteLength; i += 1) {
        buffer[offset + i] = this.value.charCodeAt(i);
      }
    });
    _defineProperty(this, "load", (buffer, offset) => {
      this.value = buffer.slice(offset, offset + this.byteLength).toString('ascii');
    });
    this.value = s;
  }
}
class UInt8 extends BoxElement {
  constructor(scalar = 0) {
    super(1);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      buffer.writeUInt8(this.value, offset);
    });
    _defineProperty(this, "load", (buffer, offset) => {
      this.value = buffer.readUInt8(offset);
    });
    this.value = scalar;
  }
}
class UInt8Array extends BoxElement {
  constructor(array) {
    super(array.length);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        buffer.writeUInt8(this.value[i], offset + i);
      }
    });
    _defineProperty(this, "load", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        this.value[i] = buffer.readUInt8(offset + i);
      }
    });
    this.value = array;
  }
}
class UInt16BE extends BoxElement {
  constructor(scalar = 0) {
    super(2);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      buffer.writeUInt16BE(this.value, offset);
    });
    _defineProperty(this, "load", (buffer, offset) => {
      this.value = buffer.readUInt16BE(offset);
    });
    this.value = scalar;
  }
}
class UInt24BE extends BoxElement {
  constructor(scalar = 0) {
    super(3);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      buffer.writeUInt8(this.value >> 16 & 0xff, offset);
      buffer.writeUInt8(this.value >> 8 & 0xff, offset + 1);
      buffer.writeUInt8(this.value & 0xff, offset + 2);
    });
    _defineProperty(this, "load", (buffer, offset) => {
      this.value = buffer.readUInt8(offset) << 16 + buffer.readUInt8(offset + 1) << 8 + buffer.readUInt8(offset + 2);
    });
    this.value = scalar;
  }
}
class UInt16BEArray extends BoxElement {
  constructor(array) {
    super(array.length * 2);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        buffer.writeUInt16BE(this.value[i], offset + 2 * i);
      }
    });
    _defineProperty(this, "load", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        this.value[i] = buffer.readUInt16BE(offset + 2 * i);
      }
    });
    this.value = array;
  }
}
class UInt32BE extends BoxElement {
  constructor(scalar = 0) {
    super(4);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      buffer.writeUInt32BE(this.value, offset);
    });
    _defineProperty(this, "load", (buffer, offset) => {
      this.value = buffer.readUInt32BE(offset);
    });
    this.value = scalar;
  }
}
class UInt32BEArray extends BoxElement {
  constructor(array) {
    super(array.length * 4);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        buffer.writeUInt32BE(this.value[i], offset + 4 * i);
      }
    });
    _defineProperty(this, "load", (buffer, offset) => {
      for (let i = 0; i < this.value.length; ++i) {
        this.value[i] = buffer.readUInt32BE(offset + 4 * i);
      }
    });
    this.value = array;
  }
}
class UInt64BE extends BoxElement {
  constructor(scalar = 0) {
    super(8);
    _defineProperty(this, "value", void 0);
    _defineProperty(this, "copy", (buffer, offset) => {
      const high = this.value / UINT32_RANGE | 0;
      const low = this.value - high * UINT32_RANGE;
      buffer.writeUInt32BE(high, offset);
      buffer.writeUInt32BE(low, offset + 4);
    });
    _defineProperty(this, "load", (buffer, offset) => {
      const high = buffer.readUInt32BE(offset);
      const low = buffer.readUInt32BE(offset + 4);
      this.value = high * UINT32_RANGE + low;
    });
    this.value = scalar;
  }
}

/**
 * Class factory for a parameter set element. A parameter set groups a size,
 * and an array of parameter sets consisting each of a size and a byte array.
 * These elements are used by the avcC box.
 * @param  {Number} [sizeMask=0x00]  A bit mask to use for the size.
 * @return {Class}  An element type that groups parameter sets.
 */
const createParameterSetArrayClass = function (sizeMask = 0x00) {
  return class ParameterSetArray extends BoxElement {
    /**
     * Takes an array of byte-arrays
     * @param  {array} array The array of byte arrays
     * @return {[type]}       [description]
     */
    constructor(array) {
      super(0);
      // this.setLengths = array.map((byteArray) => byteArray.length);
      _defineProperty(this, "value", void 0);
      _defineProperty(this, "copy", (buffer, offset) => {
        let i = 0;
        for (const element of this.value) {
          element.copy(buffer, offset + i);
          i += element.byteLength;
        }
      });
      _defineProperty(this, "load", () => {
        /** noop */
      });
      this.value = array.reduce((flatArray, byteArray) => {
        return flatArray.concat(new UInt16BE(byteArray.length), new UInt8Array(byteArray));
      }, [new UInt8(sizeMask | array.length)]);
      this.byteLength = this.value.reduce((total, element) => total + element.byteLength, 0);
    }
  };
};
/**
 * Specifications for a selection of ISO BMFF box types.
 *
 * Most of these are defined in ISO/IEC 14496-12,
 * For specific boxes like avc1/avcC/mp4a/esds the exact document is specified
 * with the appropriate box/descriptor.
 *
 * To add a new box, follow the same pattern: you need an object with at least
 * the property 'box' (which is 'Box' or 'FullBox') and for non-container boxes
 * you need also a 'body' property specifying the elements that the box contains.
 * The values assigned to each element in the spec are used as default.
 */

const BOXSPEC = {
  // File Type Box
  ftyp: {
    container: 'file',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    is_container: true,
    body: [['major_brand', CharArray, 'isom'], ['minor_version', UInt32BE, 0], ['compatible_brands', CharArray, 'mp41']
    // ['compatible_brands1', CharArray, 'iso2'],
    // ['compatible_brands2', CharArray, 'dash'],
    ]
  },

  // Movie Container
  moov: {
    container: 'file',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    is_container: true
  },
  // Movie Data Box
  mdat: {
    container: 'file',
    mandatory: false,
    quantity: 'any',
    box: 'Box',
    is_container: false,
    body: []
  },
  // Movie Header Box
  mvhd: {
    container: 'moov',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['creation_time', UInt32BE, 0], ['modification_time', UInt32BE, 0], ['timescale', UInt32BE, 1000],
    // time-scale for entire presentation, default = milliseconds
    ['duration', UInt32BE, 0xffffffff],
    // length of entire presentation, default = undetermined
    ['rate', UInt32BE, 0x00010000],
    // fixed point 16.16, preferred playback rate, default = 1.0
    ['volume', UInt16BE, 0x0100],
    // fixed point 8.8, preferred playback volume, default = 1.0
    ['reserved', Empty, 10],
    // transformation matrix, default = unity
    ['matrix', UInt32BEArray, [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000]], ['pre_defined', Empty, 24], ['next_track_ID', UInt32BE, 0xffffffff] // next unused track ID, default = unknown
    ]
  },

  // Track Container
  trak: {
    container: 'moov',
    mandatory: true,
    quantity: 'one+',
    box: 'Box',
    is_container: true
  },
  // Track Header Box
  tkhd: {
    container: 'trak',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    // Flag values for the track header:
    // 0x000001 Track_enabled: track enabled (otherwise ignored)
    // 0x000002 Track_in_movie: track used in presentation
    // 0x000004 Track_in_preview: used when previewing presentation
    config: {
      flags: 0x000003 // track enabled and used in presentation
    },

    body: [['creation_time', UInt32BE, 0], ['modification_time', UInt32BE, 0], ['track_ID', UInt32BE, 1],
    // Track identifier, cannot be 0
    ['reserved', Empty, 4], ['duration', UInt32BE, 0],
    // Duration of track using timescale of mvhd box
    ['reserved2', Empty, 8], ['layer', UInt16BE, 0],
    // Front-to-back ordering, lower is closer to viewer
    ['alternate_group', UInt16BE, 0],
    // Possible grouping of tracks
    ['volume', UInt16BE, 0x0100],
    // Track's relative audio volume 8.8 fixed point
    ['reserved3', Empty, 2], ['matrix', UInt32BEArray, [0x00010000, 0, 0, 0, 0x00010000, 0, 0, 0, 0x40000000]], ['width', UInt32BE, 0],
    // Visual presentation width, 16.16 fixed point
    ['height', UInt32BE, 0] // Visual presentation height, 16.16 fixed point
    ]
  },

  // Track Reference Box
  tref: {
    container: 'trak',
    mandatory: false,
    quantity: 'one-',
    box: 'Box',
    is_container: false
  },
  // Media Container
  mdia: {
    container: 'trak',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
    is_container: true
  },
  // Media Header Box
  mdhd: {
    container: 'mdia',
    mandatory: false,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['creation_time', UInt32BE, 0], ['modification_time', UInt32BE, 0], ['timescale', UInt32BE, 1000],
    // time-scale for entire presentation, default = milliseconds
    ['duration', UInt32BE, 0xffffffff],
    // length of entire presentation, default = undetermined
    ['language', UInt16BE, 0],
    // ISO 639-2 lanugage code, three lower-case letters, stored as
    ['pre_defined', UInt16BE, 0]]
  },
  // Handler Reference Box
  hdlr: {
    container: 'mdia',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['predefined', UInt32BE, 0], ['handler_type', CharArray, 'vide'],
    // 'vide', 'soun', or 'hint'
    ['reserved', Empty, 12], ['name', CharArray, 'VideoHandler\0']]
  },
  // Media Information Container
  minf: {
    container: 'mdia',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    is_container: true
  },
  // Video Media Header Box
  vmhd: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    config: {
      flags: 0x000001
    },
    body: [['graphicsmode', UInt16BE, 0],
    // Composition mode of the video track, 0 = overwrite
    ['opcolor', UInt16BEArray, [0, 0, 0]] // Red green blue, for use by graphics modes
    ]
  },

  // Sound Media Header Box
  smhd: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [
    // Place mono track in stereo space:
    //  8.8 fixed point, 0 = center, -1.0 = left, 1.0 = right
    ['balance', UInt16BE, 0x0000], ['reserved', UInt16BE]]
  },
  // Data Information Container
  dinf: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    is_container: true
  },
  // Data Reference Box
  dref: {
    // When adding elements to this box, update the entry_count value!
    container: 'dinf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: true,
    body: [['entry_count', UInt32BE, 0] // Number of entries.
    ]
  },

  'url ': {
    container: 'dref',
    mandatory: true,
    quantity: 'one+',
    box: 'FullBox',
    is_container: false,
    // Flag values:
    // 0x000001 Local reference, which means empty URL
    config: {
      flags: 0x000001
    },
    body: [
      // ['location', CharArray, ''],
    ]
  },
  // Sample Table Container
  stbl: {
    container: 'minf',
    mandatory: true,
    quantity: 'one',
    box: 'Box',
    is_container: true
  },
  // Decoding Time to Sample Box
  stts: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['entry_count', UInt32BE, 0]
    // For each entry these two elements:
    // ['sample_count', UInt32BE, 0], // Number of consecutive samples with same delta
    // ['sample_delta', UInt32BE, 0], // Delta of each sample
    ]
  },

  stsd: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: true,
    body: [['entry_count', UInt32BE, 1]
    // For each entry, one of these three boxes depending on the handler:
    // VisualSampleEntry, AudioSampleEntry, HintSampleEntry
    ]
  },

  /*
  ISO/IEC 14496-12:2005(E) 8.16.2 (pp. 28)
  aligned(8) abstract class SampleEntry (unsigned int(32) format)
    extends Box(format){
    const unsigned int(8)[6] reserved = 0;
    unsigned int(16) data_reference_index;
  }
  class VisualSampleEntry(codingname) extends SampleEntry (codingname){
    unsigned int(16) pre_defined = 0;
    const unsigned int(16) reserved = 0;
    unsigned int(32)[3] pre_defined = 0;
    unsigned int(16) width;
    unsigned int(16) height;
    template unsigned int(32) horizresolution = 0x00480000; // 72 dpi
    template unsigned int(32) vertresolution = 0x00480000; // 72 dpi
    const unsigned int(32) reserved = 0;
    template unsigned int(16) frame_count = 1;
    string[32] compressorname;
    template unsigned int(16) depth = 0x0018;
    int(16) pre_defined = -1;
  }
  ISO/IEC 14496-15:2004(E) 5.3.4.1 (pp. 14)
  class AVCSampleEntry() extends VisualSampleEntry (‘avc1’){
    AVCConfigurationBox config;
    MPEG4BitRateBox (); // optional
    MPEG4ExtensionDescriptorsBox (); // optional
  }
  */
  avc1: {
    container: 'stsd',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
    is_container: true,
    body: [['reserved', Empty, 6], ['data_reference_index', UInt16BE, 1], ['pre_defined', UInt16BE, 0], ['reserved2', Empty, 2], ['pre_defined2', UInt32BEArray, [0, 0, 0]], ['width', UInt16BE, 1920], ['height', UInt16BE, 1080], ['horizresolution', UInt32BE, 0x00480000], ['vertresolution', UInt32BE, 0x00480000], ['reserved3', UInt32BE, 0], ['frame_count', UInt16BE, 1], ['compressorname', UInt8Array, Buffer.alloc(32)], ['depth', UInt16BE, 0x0018], ['pre_defined3', UInt16BE, 0xffff]]
  },
  /*
  class AVCConfigurationBox extends Box(‘avcC’) {
    AVCDecoderConfigurationRecord() AVCConfig;
  }
  ISO/IEC 14496-15:2004(E) 5.2.4.1.1 (pp. 12)
  aligned(8) class AVCDecoderConfigurationRecord {
    unsigned int(8) configurationVersion = 1;
    unsigned int(8) AVCProfileIndication;
    unsigned int(8) profile_compatibility;
    unsigned int(8) AVCLevelIndication;
    bit(6) reserved = ‘111111’b;
    unsigned int(2) lengthSizeMinusOne;
    bit(3) reserved = ‘111’b;
    unsigned int(5) numOfSequenceParameterSets;
    for (i=0; i< numOfSequenceParameterSets; i++) {
      unsigned int(16) sequenceParameterSetLength ;
      bit(8*sequenceParameterSetLength) sequenceParameterSetNALUnit;
    }
    unsigned int(8) numOfPictureParameterSets;
    for (i=0; i< numOfPictureParameterSets; i++) {
      unsigned int(16) pictureParameterSetLength;
      bit(8*pictureParameterSetLength) pictureParameterSetNALUnit;
    }
  }
  */
  avcC: {
    container: 'avc1',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
    is_container: false,
    body: [['configurationVersion', UInt8, 1], ['AVCProfileIndication', UInt8, 0x4d], ['profile_compatibility', UInt8, 0x00], ['AVCLevelIndication', UInt8, 0x29],
    // size = reserved 0b111111 + 0b11 NALUnitLength (0b11 = 4-byte)
    ['lengthSizeMinusOne', UInt8, 0b11111111],
    // Example SPS (length 20):
    //   [0x67, 0x4d, 0x00, 0x29, 0xe2, 0x90, 0x0f, 0x00,
    //    0x44, 0xfc, 0xb8, 0x0b, 0x70, 0x10, 0x10, 0x1a,
    //    0x41, 0xe2, 0x44, 0x54]
    // number of sets = reserved 0b111 + number of SPS (0b00001 = 1)
    // ['numOfSequenceParameterSets', UInt8, 0b11100001],
    // ['sequenceParameterSetLength', UInt16BE, 0], // Lenght in bytes of the SPS that follows
    // ['sequenceParameterSetNALUnit', UInt8Array, []],
    // These are packed in a single custom element:
    ['sequenceParameterSets', createParameterSetArrayClass(0xe0), []],
    // Example PPS (length 4):
    //   [0x68, 0xee, 0x3c, 0x80]
    // ['numOfPictureParameterSets', UInt8, 1], // number of PPS
    // ['pictureParameterSetLength', UInt16BE, 0], // Length in bytes of the PPS that follows
    // ['pictureParameterSetNALUnit', UInt8Array, []]
    // These are packed in a single custom element:
    ['pictureParameterSets', createParameterSetArrayClass(), []]]
  },
  /*
  ISO/IEC 14496-12:2005(E) 8.16.2 (pp. 28)
  aligned(8) abstract class SampleEntry (unsigned int(32) format)
    extends Box(format){
    const unsigned int(8)[6] reserved = 0;
    unsigned int(16) data_reference_index;
  }
  class AudioSampleEntry(codingname) extends SampleEntry (codingname){
    const unsigned int(32)[2] reserved = 0;
    template unsigned int(16) channelcount = 2;
    template unsigned int(16) samplesize = 16;
    unsigned int(16) pre_defined = 0;
    const unsigned int(16) reserved = 0 ;
    template unsigned int(32) samplerate = {timescale of media}<<16;
  }
  */
  mp4a: {
    container: 'stsd',
    mandatory: false,
    quantity: 'one',
    box: 'Box',
    is_container: true,
    body: [['reserved', Empty, 6], ['data_reference_index', UInt16BE, 1], ['reserved2', UInt32BEArray, [0, 0]], ['channelcount', UInt16BE, 2], ['samplesize', UInt16BE, 16], ['pre_defined', UInt16BE, 0], ['reserved3', UInt16BE, 0], ['samplerate', UInt32BE, 0] // 16.16 bit floating point
    ]
  },

  /* Elementary stream descriptor
  basic box that holds only an ESDescriptor
  reference: 'https://developer.apple.com/library/content/documentation/QuickTime/
  QTFF/QTFFChap3/qtff3.html#//apple_ref/doc/uid/TP40000939-CH205-124774'
  Descriptors have a tag that identifies them, specified in ISO/IEC 14496-1 8.3.12
  ISO/IEC 14496-1 8.3.3 (pp. 24) ES_Descriptor
  aligned(8) class ES_Descriptor : bit(8) tag=ES_DescrTag {
    bit(8) length;
    bit(16) ES_ID;
    bit(1) streamDependenceFlag;
    bit(1) URL_Flag;
    const bit(1) reserved=1;
    bit(5) streamPriority;
    if (streamDependenceFlag)
      bit(16) dependsOn_ES_ID;
    if (URL_Flag)
      bit(8) URLstring[length-3-(streamDependencFlag*2)];
    ExtensionDescriptor extDescr[0 .. 255];
    LanguageDescriptor langDescr[0 .. 1];
    DecoderConfigDescriptor decConfigDescr;
    SLConfigDescriptor slConfigDescr;
    IPI_DescPointer ipiPtr[0 .. 1];
    IP_IdentificationDataSet ipIDS[0 .. 1];
    QoS_Descriptor qosDescr[0 .. 1];
  }
  aligned(8) class DecoderConfigDescriptor
    : bit(8) tag=DecoderConfigDescrTag {
    bit(8) length;
    bit(8) objectProfileIndication;
    bit(6) streamType;
    bit(1) upStream;
    const bit(1) reserved=1;
    bit(24) bufferSizeDB;
    bit(32) maxBitrate;
    bit(32) avgBitrate;
    DecoderSpecificInfo decSpecificInfo[];
  }
  aligned(8) class DecoderSpecificInfoShort extends DecoderSpecificInfo
  : bit(8) tag=DecSpecificInfoShortTag
  {
    bit(8) length;
    bit(8) specificInfo[length];
  }
  aligned(8) class SLConfigDescriptor : bit(8) tag=SLConfigDescrTag {
    bit(8) length;
    bit(8) predefined;
    if (predefined==0) {
      bit(1) useAccessUnitStartFlag;
      bit(1) useAccessUnitEndFlag;
      bit(1) useRandomAccessPointFlag;
      bit(1) usePaddingFlag;
      bit(1) useTimeStampsFlag;
      bit(1) useWallClockTimeStampFlag;
      bit(1) useIdleFlag;
      bit(1) durationFlag;
      bit(32) timeStampResolution;
      bit(32) OCRResolution;
      bit(8) timeStampLength; // must be less than 64
      bit(8) OCRLength;
      // must be less than 64
      bit(8) AU_Length;
      // must be less than 32
      bit(8) instantBitrateLength;
      bit(4) degradationPriorityLength;
      bit(4) seqNumLength;
      if (durationFlag) {
        bit(32) timeScale;
        bit(16) accessUnitDuration;
        bit(16) compositionUnitDuration;
      }
      if (!useTimeStampsFlag) {
        if (useWallClockTimeStampFlag)
          double(64) wallClockTimeStamp;
        bit(timeStampLength) startDecodingTimeStamp;
        bit(timeStampLength) startCompositionTimeStamp;
      }
    }
    aligned(8) bit(1) OCRstreamFlag;
    const bit(7) reserved=0b1111.111;
    if (OCRstreamFlag)
      bit(16) OCR_ES_Id;
  }
  */
  esds: {
    container: 'mp4a',
    mandatory: false,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['ES_DescrTag', UInt8, 3],
    // length of the remainder of this descriptor in byte,
    // excluding trailing embedded descriptors.
    ['ES_DescrLength', UInt8, 25], ['ES_ID', UInt16BE, 1], ['flagsAndStreamPriority', UInt8, 0], ['DecoderConfigDescrTag', UInt8, 4],
    // length of the remainder of this descriptor in bytes,
    // excluding trailing embedded descriptors.
    ['DecoderConfigDescrLength', UInt8, 17], ['objectProfileIndication', UInt8, 0x40], ['streamTypeUpstreamReserved', UInt8, 0x15], ['bufferSizeDB', UInt8Array, [0, 0, 0]], ['maxBitRate', UInt32BE, 0], ['avgBitRate', UInt32BE, 0], ['DecSpecificInfoShortTag', UInt8, 5], ['DecSpecificInfoShortLength', UInt8, 2], ['audioConfigBytes', UInt16BE, 0], ['SLConfigDescrTag', UInt8, 6], ['SLConfigDescrLength', UInt8, 1], ['SLConfigDescrPredefined', UInt8, 0x02] // ISO use
    ]
  },

  // Sample Size Box
  stsz: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['sample_size', UInt32BE, 0], ['sample_count', UInt32BE, 0]
    // For each sample up to sample_count, append an entry_size:
    // ['entry_size', UInt32BE, ],
    ]
  },

  // Sample To Chunk Box
  stsc: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['entry_count', UInt32BE, 0]
    // For each entry up to entry_count, append these elements:
    // ['first_chunk', UInt32BE, ],
    // ['samples_per_chunk', UInt32BE, ],
    // ['samples_description_index', UInt32BE, ],
    ]
  },

  // Chunk Offset Box
  stco: {
    container: 'stbl',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['entry_count', UInt32BE, 0]
    // For each entry up to entry_count, append an element:
    // ['chunk_offset', UInt32BE, ],
    ]
  },

  // Sync Sample Box
  stss: {
    container: 'stbl',
    mandatory: false,
    quantity: 'one-',
    box: 'FullBox',
    is_container: false,
    body: [['entry_count', UInt32BE, 0]
    // For each entry up to entry_count, append an element:
    // ['sample_number', UInt32BE, ],
    ]
  },

  // Edit Box
  edts: {
    container: 'trak',
    mandatory: false,
    quantity: 'one-',
    box: 'Box',
    is_container: true
  },
  // Edit List Box
  elst: {
    container: 'edts',
    mandatory: false,
    quantity: 'one-',
    box: 'FullBox',
    is_container: false,
    body: [['entry_count', UInt32BE, 1], ['segment_duration', UInt32BE, 0], ['media_time', UInt32BE, 0xffffffff], ['media_rate_integer', UInt16BE, 1], ['media_rate_fraction', UInt16BE, 0]]
  },
  mvex: {
    container: 'moov',
    mandatory: false,
    quantity: 'one-',
    box: 'Box',
    is_container: true
  },
  mehd: {
    container: 'mvex',
    mandatory: false,
    quantity: 'one-',
    box: 'FullBox',
    is_container: false,
    body: [['fragment_duration', UInt32BE, 0] // Total duration of movie
    ]
  },

  trex: {
    container: 'mvex',
    mandatory: true,
    quantity: 'one+',
    box: 'FullBox',
    is_container: false,
    body: [['track_ID', UInt32BE, 1],
    // The track to which this data is applicable
    ['default_sample_description_index', UInt32BE, 1], ['default_sample_duration', UInt32BE, 0], ['default_sample_size', UInt32BE, 0], ['default_sample_flags', UInt32BE, 0]]
  },
  moof: {
    container: 'file',
    mandatory: false,
    quantity: 'zero+',
    box: 'Box',
    is_container: false
  },
  mfhd: {
    container: 'moof',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    body: [['sequence_number', UInt32BE, 0] // A number associated with this fragment
    ]
  },

  traf: {
    container: 'moof',
    mandatory: false,
    quantity: 'zero+',
    box: 'Box',
    is_container: true
  },
  tfhd: {
    container: 'traf',
    mandatory: true,
    quantity: 'one',
    box: 'FullBox',
    is_container: false,
    // Flag values for the track fragment header:
    // 0x000001 base-data-offset-present
    // 0x000002 sample-description-index-present
    // 0x000008 default-sample-duration-present
    // 0x000010 default-sample-size-present
    // 0x000020 default-sample-flags-present
    // 0x010000 duration-is-empty
    // 0x020000 default-base-is-moof
    config: {
      flags: 0x000020 // default sample flags present
    },

    body: [['track_ID', UInt32BE, 1],
    // The track to which this data is applicable
    // ['base_data_offset', UInt64BE, 0],
    // ['default_sample_description_index', UInt32BE, 0],
    // ['default_sample_duration', UInt32BE, 0],
    // ['default_sample_size', UInt32BE, 0],
    ['default_sample_flags', UInt32BE, 0]]
  },
  tfdt: {
    container: 'traf',
    mandatory: false,
    quantity: 'one-',
    box: 'FullBox',
    is_container: false,
    config: {
      version: 1 // Version 1 uses 64-bit value for baseMediaDecodeTime
    },

    body: [['baseMediaDecodeTime', UInt64BE, 0]]
  },
  trun: {
    container: 'traf',
    mandatory: false,
    quantity: 'zero+',
    box: 'FullBox',
    is_container: false,
    // Flag values for the track fragment header:
    // 0x000001 data-offset-present
    // 0x000004 first-sample-flags-present
    // 0x000100 sample-duration-present
    // 0x000200 sample-size-present
    // 0x000400 sample-flags-present
    // 0x000800 sample-composition-time-offsets-present
    config: {
      flags: 0x000305 // default sample flags present
    },

    body: [['sample_count', UInt32BE, 1],
    // How many samples there are
    ['data_offset', UInt32BE, 0], ['first_sample_flags', UInt32BE, 0], ['sample_duration', UInt32BE, 0], ['sample_size', UInt32BE, 0]
    // ['sample_flags', UInt32BE, 0],
    // ['sample_composition_time_offset', UInt32BE, 0],
    ]
  },

  // Unknown Box, used for parsing
  '....': {
    box: 'Box',
    is_container: false,
    body: []
  },
  // File Box, special box without any headers
  file: {
    box: 'None',
    is_container: true,
    mandatory: true,
    quantity: 'one'
  }
};

/**
 * Helper functions to generate some standard elements that are needed by
 * all types of boxes.
 * All boxes have a length and type, where so-called full boxes have an
 * additional 4-bytes (1-byte version and 3-byte flags fields).
 */
class Header {
  static None() {
    return [];
  }
  static Box(type) {
    return [['size', UInt32BE, 0], ['type', CharArray, type]];
  }
  static FullBox(type) {
    return [].concat(this.Box(type), [['version', UInt8, 0x00], ['flags', UInt24BE, 0x000000]]);
  }
}

/**
 * Box class.
 *
 * Defines a box as an entity similar to a C struct, where the struct is
 * represented by a Map of elements.
 * Each element is an object with at least:
 *  - a 'byteLength' property (size of element in bytes)
 *  - a 'copy' method (BufferMutation signature)
 */
class Box extends BoxElement {
  /**
   * Create a new Box.
   * @param  {String} type   4-character ASCII string
   * @param  {Object} config Configuration holding (key: value) fields
   */
  constructor(type, config) {
    super(0);
    _defineProperty(this, "type", void 0);
    _defineProperty(this, "config", void 0);
    _defineProperty(this, "struct", void 0);
    this.type = type;
    const spec = BOXSPEC[this.type];
    if (spec === undefined) {
      throw new Error(`unknown box type: ${type}`);
    }
    this.config = Object.assign({}, spec.config, config);
    const header = Header[spec.box](this.type);
    const body = spec.body || [];
    // Uglify changes the name of the original class, so this doesn't work.
    // TODO: find a better way to check for this.
    // if (spec.body === undefined && this.constructor.name !== 'Container') {
    //   throw new Error(`Body missing but '${type}' is not a container box`);
    // }

    // Initialize all elements, an element is something with a byteLength
    this.struct = new Map();
    let offset = 0;
    for (const [key, Type, defaultValue] of [].concat(header, body)) {
      if (this.has(key)) {
        throw new Error('Trying to add existing key');
      }
      let value = defaultValue;
      if (this.config[key]) {
        value = this.config[key];
      }
      const element = new Type(value);
      this.struct.set(key, {
        offset,
        element
      });
      offset += element.byteLength;
    }
    this.byteLength = offset;
  }

  /**
   * Get access to an element based on it's name.
   * @param  {String} key The element's name
   * @return {Element}    Object with 'byteLength' property and 'copy' method
   */
  element(key) {
    const value = this.struct.get(key);
    if (value === undefined) {
      throw new Error('invalid key');
    }
    return value.element;
  }

  /**
   * Set an element's value.
   * @param  {String} key The element's name
   * @param  {Number|Array} value The element's (new) value
   * @return {undefined}
   */
  set(key, value) {
    this.element(key).value = value;
  }

  /**
   * Get an element's value.
   * @param  {String} key The element's name
   * @return {Number|Array}  The element's value
   */
  get(key) {
    return this.element(key).value;
  }

  /**
   * Get an element's offset.
   * @param  {String} key The element's name
   * @return {Number}  The element's offset
   */
  offset(key) {
    const value = this.struct.get(key);
    if (value === undefined) {
      throw new Error('invalid key');
    }
    return value.offset;
  }

  /**
   * Check if a certain element exists
   * @param  {String}  key The element's name
   * @return {Boolean}     true if the element is known, false if not
   */
  has(key) {
    return this.struct.has(key);
  }

  /**
   * Add a new element to the box.
   * @param {String} key     A _new_ non-existing element name.
   * @param {Object} element Something with a 'byteLength' property and 'copy' method.
   * @return {Box} this box, so that 'add' can be used in a chain
   */
  add(key, element) {
    if (this.has(key)) {
      throw new Error('Trying to add existing key');
    }
    this.struct.set(key, {
      offset: this.byteLength,
      element
    });
    this.byteLength += element.byteLength;
    return this;
  }

  /**
   * Create a buffer and copy all element values to it.
   * @return {Buffer} Data representing the box.
   */
  buffer() {
    const buffer = Buffer.allocUnsafe(this.byteLength);
    this.copy(buffer);
    return buffer;
  }

  /**
   * Copy all values of the box into an existing buffer.
   * @param  {Buffer} buffer     The target buffer to accept the box data
   * @param  {Number} [offset=0] The number of bytes into the target to start at.
   * @return {undefined}
   */
  copy(buffer, offset = 0) {
    // Before writing, make sure the size property is set correctly.
    this.set('size', this.byteLength);
    for (const entry of this.struct.values()) {
      entry.element.copy(buffer, offset + entry.offset);
    }
  }

  /**
   * Read element values from a box's data representation.
   * @param  {buffer} buffer     The source buffer with box data
   * @param  {Number} [offset=0] The number of bytes into the source to start at.
   * @return {undefined}
   */
  load(buffer, offset = 0) {
    for (const entry of this.struct.values()) {
      if (entry.element.load !== undefined) {
        entry.element.load(buffer, offset + entry.offset);
      }
    }
  }

  /**
   * Pretty-format an entire box as an element/box hierarchy.
   * @param  {Number} [indent=0] How large an indentation to use for the hierarchy
   * @return {undefined}
   */
  format(indent = 0) {
    const lines = [' '.repeat(indent) + `[${this.type}] (${this.byteLength})`];
    for (const [key, entry] of this.struct) {
      const element = entry.element;
      if (element.format !== undefined) {
        lines.push(element.format(indent + 2));
      } else {
        lines.push(' '.repeat(indent + 2) + `${key} = ${element.value} (${element.byteLength})`);
      }
    }
    return lines.join('\n');
  }

  /**
   * Pretty-print an entire box as an element/box hierarchy.
   * @param  {Number} [indent=0] How large an indentation to use for the hierarchy
   * @return {undefined}
   */
  print(indent) {
    console.warn(this.format(indent));
  }
}

/**
 * Container class
 *
 * special box with an 'add' method which allows appending of other boxes,
 * and a 'parse' method to extract contained boxes.
 */
class Container extends Box {
  /**
   * Create a new container box
   * @param  {String} type   4-character ASCII string
   * @param  {Object} config Configuration holding (key: value) fields
   * @param  {Box} boxes  One or more boxes to append.
   */
  constructor(type, config, ...boxes) {
    super(type, config);
    _defineProperty(this, "boxSize", void 0);
    this.boxSize = 0;
    this.append(...boxes);
  }

  /**
   * Add one or more boxes to the container.
   * @param {Box} boxes The box(es) to append
   * @return {Box} this container, so that add can be used in a chain
   */
  append(...boxes) {
    for (const box of boxes) {
      this.add(`box_${this.boxSize++}`, box);
    }
    return this;
  }

  /**
   * Parse a container box by looking for boxes that it contains, and
   * recursively proceed when it is another container.
   *
   * FIXME: this cannot properly handle different versions of the FullBox,
   * currenlty the loader is hardcoded to the version used in this file.
   * Also, appearance of an esds box is assumed to be AAC audio information,
   * while the avcC box signals H.264 video information.
   *
   * @param  {Buffer} data The data to parse.
   * @return {undefined}
   */
  parse(data) {
    const tracks = [];
    while (data.byteLength > 0) {
      const type = new CharArray('....');
      type.load(data, 4);
      const boxType = type.value;
      const spec = BOXSPEC[boxType];
      let box;
      if (spec !== undefined) {
        if (spec.is_container) {
          box = new Container(boxType);
          box.load(data);
          const boxTracks = box.parse(data.slice(box.byteLength, box.get('size')));
          tracks.push(...boxTracks);
        } else {
          box = new Box(boxType);
          box.load(data);
          // Handle 2 kinds of tracks with streaming MP4: video or audio
          if (boxType === 'avcC') {
            const profile = box.element('AVCProfileIndication').value.toString(16).padStart(2, 0);
            const compat = box.element('profile_compatibility').value.toString(16).padStart(2, 0);
            const level = box.element('AVCLevelIndication').value.toString(16).padStart(2, 0);
            tracks.push({
              type: 'video',
              mime: `avc1.${profile}${compat}${level}`
            });
          } else if (boxType === 'esds') {
            const audioConfigBytes = box.element('audioConfigBytes').value;
            const objectTypeIndication = audioConfigBytes >>> 11 & 0x001f;
            tracks.push({
              type: 'audio',
              mime: `mp4a.40.${objectTypeIndication}`
            });
          }
        }
      } else {
        box = new Box('....');
        box.load(data);
        box.type = box.get('type');
      }
      this.append(box);
      data = data.slice(box.get('size'));
    }
    return tracks;
  }
}

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/spsparser.ts":
/*!******************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/spsparser.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SPSParser: () => (/* binding */ SPSParser)
/* harmony export */ });
/* harmony import */ var _bufferreader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./bufferreader */ "./lib/components/mp4muxer/helpers/bufferreader.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }


/**
 * Defines functions for writing to a binary buffer.
 * @class BufferWriter
 * @constructor
 * @param {Number} size The size of the buffer.
 */
class SPSParser {
  constructor(buffer) {
    _defineProperty(this, "reader", void 0);
    this.reader = new _bufferreader__WEBPACK_IMPORTED_MODULE_0__.BufferReader(buffer);
  }
  parse() {
    // nalhdr
    this.reader.readNext();
    const profile = this.reader.readNext();
    // constraints
    this.reader.readNext();
    const level = this.reader.readNext();

    // seqParameterSetId
    this.reader.readUnsignedExpGolomb();
    if ([100, 110, 122, 244, 44, 83, 86, 118].indexOf(profile) >= 0) {
      const chromaFormat = this.reader.readUnsignedExpGolomb();
      if (chromaFormat === 3) {
        // Separate color plane flag
        this.reader.readBits(1);
      }

      // bitDepthLumaMinus8
      this.reader.readUnsignedExpGolomb();

      // bitDepthChromaMinus8
      this.reader.readUnsignedExpGolomb();

      // qpPrimeYZeroTransformBypassFlag
      this.reader.readBits(1);
      const seqScalingMatrix = this.reader.readBits(1);
      if (seqScalingMatrix) {
        for (let k = 0; k < (chromaFormat !== 3 ? 8 : 12); k++) {
          // seqScalingListPresentFlag
          this.reader.readBits(1);
          // TODO: More logic goes here..
        }
      }
    }

    // log2MaxFrameNumMinus4
    this.reader.readUnsignedExpGolomb();
    const picOrderCntType = this.reader.readUnsignedExpGolomb();
    if (picOrderCntType === 0) {
      // log2MaxPicOrderCntLsbMinus4
      this.reader.readUnsignedExpGolomb();
    } else if (picOrderCntType === 1) {
      let numRefFramesInPic = 0;
      this.reader.readBits(1);
      this.reader.readSignedExpGolomb();
      this.reader.readSignedExpGolomb();
      numRefFramesInPic = this.reader.readUnsignedExpGolomb();
      for (let i = 0; i < numRefFramesInPic; i++) {
        this.reader.readSignedExpGolomb();
      }
    }

    // maxNumRefFrames
    this.reader.readUnsignedExpGolomb();
    // gapsInFrameNumValueAllowedFlag
    this.reader.readBits(1);
    const picWidthInMbsMinus1 = this.reader.readUnsignedExpGolomb();
    const picHeightInMapUnitsMinus1 = this.reader.readUnsignedExpGolomb();
    const picFrameMbsOnlyFlag = this.reader.readBits(1);
    // direct8x8InferenceFlag
    this.reader.readBits(1);
    const frameCroppingFlag = this.reader.readBits(1);
    const frameCropLeftOffset = frameCroppingFlag ? this.reader.readUnsignedExpGolomb() : 0;
    const frameCropRightOffset = frameCroppingFlag ? this.reader.readUnsignedExpGolomb() : 0;
    const frameCropTopOffset = frameCroppingFlag ? this.reader.readUnsignedExpGolomb() : 0;
    const frameCropBottomOffset = frameCroppingFlag ? this.reader.readUnsignedExpGolomb() : 0;
    const w = (picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2;
    const h = (2 - picFrameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - frameCropTopOffset * 2 - frameCropBottomOffset * 2;
    return {
      profile: profile,
      level: level / 10.0,
      width: w,
      height: h
    };
  }
}

/***/ }),

/***/ "./lib/components/mp4muxer/helpers/utils.ts":
/*!**************************************************!*\
  !*** ./lib/components/mp4muxer/helpers/utils.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b64ToUint6: () => (/* binding */ b64ToUint6),
/* harmony export */   base64DecToArr: () => (/* binding */ base64DecToArr)
/* harmony export */ });
function b64ToUint6(nChr) {
  return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding
function base64DecToArr(sBase64, nBlocksSize) {
  const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, '');
  const nInLen = sB64Enc.length;
  const nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2;
  const taBytes = new Uint8Array(nOutLen);
  let nMod3;
  let nMod4;
  let nUint24 = 0;
  let nOutIdx = 0;
  for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }
  return taBytes;
}

/***/ }),

/***/ "./lib/components/mp4muxer/index.ts":
/*!******************************************!*\
  !*** ./lib/components/mp4muxer/index.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mp4Muxer: () => (/* binding */ Mp4Muxer)
/* harmony export */ });
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _helpers_isom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/isom */ "./lib/components/mp4muxer/helpers/isom.ts");
/* harmony import */ var _helpers_boxbuilder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./helpers/boxbuilder */ "./lib/components/mp4muxer/helpers/boxbuilder.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _h264depay_parser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../h264depay/parser */ "./lib/components/h264depay/parser.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }








/**
 * Component that converts elementary stream data into MP4 boxes honouring
 * the ISO BMFF Byte Stream (Some extra restrictions are involved).
 */
class Mp4Muxer extends _component__WEBPACK_IMPORTED_MODULE_5__.Tube {
  /**
   * Create a new mp4muxer component.
   * @return {undefined}
   */
  constructor() {
    const boxBuilder = new _helpers_boxbuilder__WEBPACK_IMPORTED_MODULE_3__.BoxBuilder();
    const onSync = ntpPresentationTime => {
      this.onSync && this.onSync(ntpPresentationTime);
    };
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_4__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.SDP) {
          /**
           * Arrival of SDP signals the beginning of a new movie.
           * Set up the ftyp and moov boxes.
           */

          // Why is this here? These should be default inside the mvhd box?
          const now = Math.floor(new Date().getTime() / 1000 + 2082852000);
          const ftyp = new _helpers_isom__WEBPACK_IMPORTED_MODULE_2__.Box('ftyp');
          const moov = boxBuilder.moov(msg.sdp, now);
          const data = Buffer.allocUnsafe(ftyp.byteLength + moov.byteLength);
          ftyp.copy(data, 0);
          moov.copy(data, ftyp.byteLength);
          debug__WEBPACK_IMPORTED_MODULE_1___default()('msl:mp4:isom')(`ftyp: ${ftyp.format()}`);
          debug__WEBPACK_IMPORTED_MODULE_1___default()('msl:mp4:isom')(`moov: ${moov.format()}`);

          // Set up a list of tracks that contain info about
          // the type of media, encoding, and codec are present.
          const tracks = msg.sdp.media?.map(media => {
            var isrecv = media.sendonly !== undefined ? false : true;
            return {
              type: media.type,
              encoding: media.rtpmap && media.rtpmap.encodingName,
              mime: media.mime,
              codec: media.codec,
              isrecv: isrecv
            };
          });
          this.push({
            type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.ISOM,
            data,
            tracks,
            ftyp,
            moov
          });
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.ELEMENTARY || msg.type === _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.H264) {
          /**
           * Otherwise we are getting some elementary stream data.
           * Set up the moof and mdat boxes.
           */

          const {
            payloadType,
            timestamp,
            ntpTimestamp
          } = msg;
          const trackId = boxBuilder.trackIdMap[payloadType];
          if (trackId) {
            if (!boxBuilder.ntpPresentationTime) {
              boxBuilder.setPresentationTime(trackId, ntpTimestamp);
              if (boxBuilder.ntpPresentationTime) {
                onSync(boxBuilder.ntpPresentationTime);
              }
            }
            let checkpointTime = undefined;
            const idrPicture = msg.type === _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.H264 ? msg.nalType === _h264depay_parser__WEBPACK_IMPORTED_MODULE_6__.NAL_TYPES.IDR_PICTURE : undefined;
            if (boxBuilder.ntpPresentationTime && idrPicture && msg.ntpTimestamp !== undefined) {
              checkpointTime = (msg.ntpTimestamp - boxBuilder.ntpPresentationTime) / 1000;
            }
            if (boxBuilder.ntpPresentationTime) {
              const byteLength = msg.data.byteLength;
              const moof = boxBuilder.moof({
                trackId,
                timestamp,
                byteLength
              });
              const mdat = boxBuilder.mdat(msg.data);
              const data = Buffer.allocUnsafe(moof.byteLength + mdat.byteLength);
              moof.copy(data, 0);
              mdat.copy(data, moof.byteLength);
              this.push({
                type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.ISOM,
                data,
                moof,
                mdat,
                ntpTimestamp,
                checkpointTime
              });
            }
          }
        } else {
          // No message type we recognize, pass it on.
          this.push(msg);
        }
        callback();
      }
    });
    super(incoming);
    _defineProperty(this, "boxBuilder", void 0);
    _defineProperty(this, "onSync", void 0);
    this.boxBuilder = boxBuilder;
  }
  get bitrate() {
    return this.boxBuilder.trackData && this.boxBuilder.trackData.map(data => data.bitrate);
  }
  get framerate() {
    return this.boxBuilder.trackData && this.boxBuilder.trackData.map(data => data.framerate);
  }
  get ntpPresentationTime() {
    return this.boxBuilder.ntpPresentationTime;
  }
}

/***/ }),

/***/ "./lib/components/mse/index.ts":
/*!*************************************!*\
  !*** ./lib/components/mse/index.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MseSink: () => (/* binding */ MseSink)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/protocols/rtcp */ "./lib/utils/protocols/rtcp.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





const TRIGGER_THRESHOLD = 100;
const debug = debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:mse');
class MseSink extends _component__WEBPACK_IMPORTED_MODULE_1__.Sink {
  /**
   * Create a Media component.
   *
   * The constructor sets up two streams and connects them to the MediaSource.
   *
   * @param {MediaSource} mse - A media source.
   */
  constructor(el) {
    if (el === undefined) {
      throw new Error('video element argument missing');
    }
    let mse;
    let sourceBuffer;

    /**
     * Set up an incoming stream and attach it to the sourceBuffer.
     */
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_2__.Writable({
      objectMode: true,
      write: (msg, _, callback) => {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.ISOM) {
          // ISO BMFF Byte Stream data to be added to the source buffer
          this._done = callback;
          if (msg.tracks !== undefined) {
            const tracks = msg.tracks;

            // from bosch, may cause problems
            let isH265 = false;
            tracks.map(track => {
              if (track.type === 'video' && track.encoding === 'H265' && !track.mime) {
                track.mime = "hvc1";
                isH265 = true;
              }
            });
            if (isH265) return;
            if (mse) {
              try {
                mse.endOfStream();
              } catch (e) {}
            }

            // Start a new movie (new SDP info available)
            this._lastCheckpointTime = 0;

            // Start a new mediaSource and prepare it with a sourceBuffer.
            // When ready, this component's .onSourceOpen callback will be called
            // with the mediaSource, and a list of valid/ignored media.
            mse = new MediaSource();
            el.src = window.URL.createObjectURL(mse);
            const handler = () => {
              mse.removeEventListener('sourceopen', handler);
              this.onSourceOpen && this.onSourceOpen(mse, tracks);

              // MIME codecs: https://tools.ietf.org/html/rfc6381
              let mimeCodecs = tracks.map(track => track.mime).filter(mime => mime);
              let codecs = 'avc1.640029, mp4a.40.2';
              if (mimeCodecs.join(', ') === 'avc1.010101' || mimeCodecs.join(', ') === 'avc1.010201') {
                // we have to fix this wrong codec (after switching from h265 to h264) because this breaks the videotag
                codecs = 'avc1.4d4028';
              } else if (mimeCodecs.length !== 0) {
                codecs = mimeCodecs.join(', ');
              }
              sourceBuffer = this.addSourceBuffer(el, mse, `video/mp4; codecs="${codecs}"`);
              sourceBuffer.onerror = e => {
                console.error('error on SourceBuffer: ', e);
                incoming.emit('error');
              };
              try {
                sourceBuffer.appendBuffer(msg.data);
                this.onDataCallback && this.onDataCallback(msg);
              } catch (err) {
                console.error('failed to append to SourceBuffer: ', err, msg);
              }
            };
            mse.addEventListener('sourceopen', handler);
          } else {
            // Continue current movie
            this._lastCheckpointTime = msg.checkpointTime !== undefined ? msg.checkpointTime : this._lastCheckpointTime;
            try {
              sourceBuffer.appendBuffer(msg.data);
              this.onDataCallback && this.onDataCallback(msg);
            } catch (e) {
              console.error('failed to append to SourceBuffer: ', e, msg);
            }
          }
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTCP) {
          if ((0,_utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_4__.packetType)(msg.data) === _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_4__.BYE.packetType) {
            mse.readyState === 'open' && mse.endOfStream();
          }
          callback();
        } else {
          callback();
        }
      }
    });
    incoming.on('finish', () => {
      console.warn('incoming stream finished: end stream');
      mse && mse.readyState === 'open' && mse.endOfStream();
    });

    // When an error is sent on the incoming stream, close it.
    incoming.on('error', () => {
      console.error('error on incoming stream: end stream');
      if (sourceBuffer.updating) {
        sourceBuffer.addEventListener('updateend', () => {
          mse.readyState === 'open' && mse.endOfStream();
        });
      } else {
        mse.readyState === 'open' && mse.endOfStream();
      }
    });

    /**
     * Set up outgoing stream.
     */
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_2__.Readable({
      objectMode: true,
      read: function () {
        //
      }
    });

    // When an error is sent on the outgoing stream, whine about it.
    outgoing.on('error', () => {
      console.warn('outgoing stream broke somewhere');
    });

    /**
     * initialize the component.
     */
    super(incoming, outgoing);
    _defineProperty(this, "_videoEl", void 0);
    _defineProperty(this, "_done", void 0);
    _defineProperty(this, "_lastCheckpointTime", void 0);
    _defineProperty(this, "onDataCallback", void 0);
    _defineProperty(this, "onSourceOpen", void 0);
    this._videoEl = el;
    this._lastCheckpointTime = 0;
  }

  /**
   * Add a new sourceBuffer to the mediaSource and remove old ones.
   * @param {HTMLMediaElement} el  The media element holding the media source.
   * @param {MediaSource} mse  The media source the buffer should be attached to.
   * @param {String} [mimeType='video/mp4; codecs="avc1.4D0029, mp4a.40.2"'] [description]
   */
  addSourceBuffer(el, mse, mimeType) {
    const sourceBuffer = mse.addSourceBuffer(mimeType);
    let trigger = 0;
    const onUpdateEndHandler = () => {
      ++trigger;
      if (trigger > TRIGGER_THRESHOLD && sourceBuffer.buffered.length) {
        trigger = 0;
        const index = sourceBuffer.buffered.length - 1;
        const start = sourceBuffer.buffered.start(index);
        const end = Math.min(el.currentTime, this._lastCheckpointTime) - 10;
        try {
          // remove all material up to 10 seconds before current time
          if (end > start) {
            sourceBuffer.remove(start, end);
            return; // this._done() will be called on the next updateend event!
          }
        } catch (e) {
          console.warn(e);
        }
      }
      this._done && this._done();
    };
    sourceBuffer.addEventListener('updateend', onUpdateEndHandler);
    return sourceBuffer;
  }
  get currentTime() {
    return this._videoEl.currentTime;
  }
  play() {
    return this._videoEl.play();
  }
  pause() {
    return this._videoEl.pause();
  }
}

/***/ }),

/***/ "./lib/components/onvifdepay/index.ts":
/*!********************************************!*\
  !*** ./lib/components/onvifdepay/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ONVIFDepay: () => (/* binding */ ONVIFDepay)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];




class ONVIFDepay extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(handler) {
    let XMLPayloadType;
    let packets = [];
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP) {
          let validMedia;
          if (msg.sdp.media) {
            for (const media of msg.sdp.media) {
              if (media.type === 'application' && media.rtpmap && media.rtpmap.encodingName === 'VND.ONVIF.METADATA') {
                validMedia = media;
              }
            }
            if (validMedia && validMedia.rtpmap) {
              XMLPayloadType = Number(validMedia.rtpmap.payloadType);
            }
          }
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RTP && (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.payloadType)(msg.data) === XMLPayloadType) {
          // Add payload to packet stack
          packets.push((0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.payload)(msg.data));

          // XML over RTP uses the RTP marker bit to indicate end
          // of fragmentation. At this point, the packets can be used
          // to reconstruct an XML packet.
          if ((0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.marker)(msg.data) && packets.length > 0) {
            const xmlMsg = {
              timestamp: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.timestamp)(msg.data),
              ntpTimestamp: msg.ntpTimestamp,
              payloadType: (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_3__.payloadType)(msg.data),
              data: Buffer.concat(packets),
              type: _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.XML
            };
            // If there is a handler, the XML message will leave
            // through the handler, otherwise send it on to the
            // next component
            if (handler) {
              handler(xmlMsg);
            } else {
              this.push(xmlMsg);
            }
            packets = [];
          }
          callback();
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/rtsp-parser/builder.ts":
/*!***********************************************!*\
  !*** ./lib/components/rtsp-parser/builder.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   builder: () => (/* binding */ builder)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];

const DEFAULT_PROTOCOL = 'RTSP/1.0';
const builder = msg => {
  if (!msg.method || !msg.uri) {
    throw new Error('message needs to contain a method and a uri');
  }
  const protocol = msg.protocol || DEFAULT_PROTOCOL;
  const headers = msg.headers || {};
  const messageString = [`${msg.method} ${msg.uri} ${protocol}`, Object.entries(headers).map(([key, value]) => key + ': ' + value).join('\r\n'), '\r\n'].join('\r\n');
  debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:rtsp:outgoing')(messageString);
  return Buffer.from(messageString);
};

/***/ }),

/***/ "./lib/components/rtsp-parser/index.ts":
/*!*********************************************!*\
  !*** ./lib/components/rtsp-parser/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RtspParser: () => (/* binding */ RtspParser)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _builder__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./builder */ "./lib/components/rtsp-parser/builder.ts");
/* harmony import */ var _parser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./parser */ "./lib/components/rtsp-parser/parser.ts");






/**
 * A component that converts raw binary data into RTP/RTSP/RTCP packets on the
 * incoming stream, and converts RTSP commands to raw binary data on the outgoing
 * stream. The component is agnostic of any RTSP session details (you need an
 * RTSP session component in the pipeline).
 * @extends {Component}
 */
class RtspParser extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  /**
   * Create a new RTSP parser component.
   * @return {undefined}
   */
  constructor() {
    const parser = new _parser__WEBPACK_IMPORTED_MODULE_4__.Parser();

    // Incoming stream
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RAW) {
          try {
            parser.parse(msg.data).forEach(message => incoming.push(message));
            callback();
          } catch (e) {
            callback(e);
          }
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });

    // Outgoing stream
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RTSP) {
          const data = (0,_builder__WEBPACK_IMPORTED_MODULE_3__.builder)(msg);
          callback(undefined, {
            type: _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.RAW,
            data
          });
        } else {
          // don't touch other types
          callback(undefined, msg);
        }
      }
    });
    super(incoming, outgoing);
  }
}

/***/ }),

/***/ "./lib/components/rtsp-parser/parser.ts":
/*!**********************************************!*\
  !*** ./lib/components/rtsp-parser/parser.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Parser: () => (/* binding */ Parser)
/* harmony export */ });
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _utils_protocols_sdp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/protocols/sdp */ "./lib/utils/protocols/sdp.ts");
/* harmony import */ var _utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/protocols/rtsp */ "./lib/utils/protocols/rtsp.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




/**
 * The different possible internal parser states.
 */
var STATE = /*#__PURE__*/function (STATE) {
  STATE[STATE["IDLE"] = 0] = "IDLE";
  STATE[STATE["INTERLEAVED"] = 1] = "INTERLEAVED";
  STATE[STATE["RTSP"] = 2] = "RTSP";
  return STATE;
}(STATE || {});
const INTERLEAVED_HEADER_BYTES = 4;
const ASCII_DOLLAR = 0x24;
/**
 * Extract packet information from the interleaved header
 * (4-byte section before the RTP packet).
 * @param  {Array} chunks Buffers constituting the data.
 * @return {Object}       Packet information (channel, begin, end).
 */
const rtpPacketInfo = chunks => {
  const header = Buffer.alloc(INTERLEAVED_HEADER_BYTES);
  let i = 0;
  let bytesRead = 0;
  while (bytesRead < header.length) {
    const chunk = chunks[i++];
    const bytesToRead = Math.min(chunk.length, header.length - bytesRead);
    chunk.copy(header, bytesRead, 0, bytesToRead);
    bytesRead += bytesToRead;
  }
  const channel = header[1];
  const begin = header.length;
  const length = header.readUInt16BE(2);
  const end = begin + length;
  return {
    channel,
    begin,
    end
  };
};

/**
 * Parser class with a public method that takes a data chunk and
 * returns an array of RTP/RTSP/RTCP message objects. The parser
 * keeps track of the added chunks internally in an array and only
 * concatenates chunks when data is needed to construct a message.
 * @type {[type]}
 */
class Parser {
  /**
   * Create a new Parser object.
   * @return {undefined}
   */
  constructor() {
    _defineProperty(this, "_chunks", []);
    _defineProperty(this, "_length", 0);
    _defineProperty(this, "_state", STATE.IDLE);
    _defineProperty(this, "_packet", void 0);
    this._init();
  }

  /**
   * Initialize the internal properties to their default starting
   * values.
   * @return {undefined}
   */
  _init() {
    this._chunks = [];
    this._length = 0;
    this._state = STATE.IDLE;
  }
  _push(chunk) {
    this._chunks.push(chunk);
    this._length += chunk.length;
  }

  /**
   * Extract RTSP messages.
   * @return {Array} An array of messages, possibly empty.
   */
  _parseRtsp() {
    const messages = [];
    const buffer = Buffer.concat(this._chunks);
    const chunkBodyOffset = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_2__.bodyOffset)(buffer);
    // If last added chunk does not have the end of the header, return.
    if (chunkBodyOffset === -1) {
      return messages;
    }
    const rtspHeaderLength = chunkBodyOffset;
    const contentLength = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_2__.extractHeaderValue)(buffer, 'Content-Length');
    if (contentLength && parseInt(contentLength) > buffer.length - rtspHeaderLength) {
      // we do not have the whole body
      return messages;
    }
    this._init(); // resets this._chunks and this._length

    if (rtspHeaderLength === buffer.length || buffer[rtspHeaderLength] === ASCII_DOLLAR) {
      // No body in this chunk, assume there is no body?
      const packet = buffer.slice(0, rtspHeaderLength);
      messages.push({
        type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.RTSP,
        data: packet
      });

      // Add the remaining data to the chunk stack.
      const trailing = buffer.slice(rtspHeaderLength);
      this._push(trailing);
    } else {
      // Body is assumed to be the remaining data of the last chunk.
      const packet = buffer;
      const body = buffer.slice(rtspHeaderLength);
      messages.push({
        type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.RTSP,
        data: packet
      });
      messages.push((0,_utils_protocols_sdp__WEBPACK_IMPORTED_MODULE_1__.messageFromBuffer)(body));
    }
    return messages;
  }

  /**
   * Extract RTP/RTCP messages.
   * @return {Array} An array of messages, possibly empty.
   */
  _parseInterleaved() {
    const messages = [];

    // Skip as long as we don't have the first 4 bytes
    if (this._length < INTERLEAVED_HEADER_BYTES) {
      return messages;
    }

    // Enough bytes to construct the header and extract packet info.
    if (!this._packet) {
      this._packet = rtpPacketInfo(this._chunks);
    }

    // As long as we don't have enough chunks, skip.
    if (this._length < this._packet.end) {
      return messages;
    }

    // We have enough data to extract the packet.
    const buffer = Buffer.concat(this._chunks);
    const packet = buffer.slice(this._packet.begin, this._packet.end);
    const header = buffer.slice(0, this._packet.begin);
    const trailing = buffer.slice(this._packet.end);
    const channel = this._packet.channel;
    delete this._packet;

    // Prepare next bit.
    this._init();
    this._push(trailing);

    // Extract messages
    if (channel % 2 === 0) {
      // Even channels 0, 2, ...
      messages.push({
        type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.RTP,
        data: packet,
        header: header,
        channel
      });
    } else {
      // Odd channels 1, 3, ...
      let rtcpPackets = packet;
      do {
        // RTCP packets can be packed together, unbundle them:
        const rtcpByteSize = rtcpPackets.readUInt16BE(2) * 4 + 4;
        var data = rtcpPackets.slice(0, rtcpByteSize);
        messages.push({
          type: _message__WEBPACK_IMPORTED_MODULE_0__.MessageType.RTCP,
          data: data,
          header: header,
          channel
        });
        rtcpPackets = rtcpPackets.slice(rtcpByteSize);
      } while (rtcpPackets.length > 0);
    }
    return messages;
  }

  /**
   * Set the internal state based on the type of the first chunk
   * @param {[type]} chunk [description]
   */
  _setState() {
    // Remove leading 0-sized chunks.
    while (this._chunks.length > 0 && this._chunks[0].length === 0) {
      this._chunks.shift();
    }
    const firstChunk = this._chunks[0];
    if (this._chunks.length === 0) {
      this._state = STATE.IDLE;
    } else if (firstChunk[0] === ASCII_DOLLAR) {
      this._state = STATE.INTERLEAVED;
    } else if (firstChunk.toString('ascii', 0, 4) === 'RTSP') {
      this._state = STATE.RTSP;
    } else {
      throw new Error(`Unknown chunk of length ${firstChunk.length}`);
    }
  }

  /**
   * Add the next chunk of data to the parser and extract messages.
   * If no message can be extracted, an empty array is returned, otherwise
   * an array of messages is returned.
   * @param  {Buffer} chunk The next piece of data.
   * @return {Array}        An array of messages, possibly empty.
   */
  parse(chunk) {
    this._push(chunk);
    if (this._state === STATE.IDLE) {
      this._setState();
    }
    let messages = [];
    let done = false;
    while (!done) {
      let extracted = [];
      switch (this._state) {
        case STATE.IDLE:
          break;
        case STATE.INTERLEAVED:
          extracted = this._parseInterleaved();
          break;
        case STATE.RTSP:
          extracted = this._parseRtsp();
          break;
        default:
          throw new Error('internal error: unknown state');
      }
      if (extracted.length > 0) {
        messages = messages.concat(extracted);
      } else {
        done = true;
      }
      this._setState();
    }
    return messages;
  }
}

/***/ }),

/***/ "./lib/components/rtsp-session/index.ts":
/*!**********************************************!*\
  !*** ./lib/components/rtsp-session/index.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RTSP_METHOD: () => (/* binding */ RTSP_METHOD),
/* harmony export */   RtspSession: () => (/* binding */ RtspSession)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/config */ "./lib/utils/config.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/protocols/rtsp */ "./lib/utils/protocols/rtsp.ts");
/* harmony import */ var _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/protocols/rtcp */ "./lib/utils/protocols/rtcp.ts");
/* harmony import */ var _utils_protocols_ntp__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/protocols/ntp */ "./lib/utils/protocols/ntp.ts");
/* harmony import */ var _utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/protocols/rtp */ "./lib/utils/protocols/rtp.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }









function isAbsolute(url) {
  return /^[^:]+:\/\//.test(url);
}
var STATE = /*#__PURE__*/function (STATE) {
  STATE["IDLE"] = "idle";
  STATE["PLAYING"] = "playing";
  STATE["PAUSED"] = "paused";
  return STATE;
}(STATE || {});
let RTSP_METHOD = /*#__PURE__*/function (RTSP_METHOD) {
  RTSP_METHOD["OPTIONS"] = "OPTIONS";
  RTSP_METHOD["DESCRIBE"] = "DESCRIBE";
  RTSP_METHOD["SETUP"] = "SETUP";
  RTSP_METHOD["PLAY"] = "PLAY";
  RTSP_METHOD["PAUSE"] = "PAUSE";
  RTSP_METHOD["TEARDOWN"] = "TEARDOWN";
  return RTSP_METHOD;
}({});
const MIN_SESSION_TIMEOUT = 5; // minimum timeout for a rtsp session in seconds

// Default RTSP configuration
const defaultConfig = (hostname = typeof window === 'undefined' ? '' : window.location.hostname, parameters = []) => {
  const uri = parameters.length > 0 ? `rtsp://${hostname}/media/media.amp?${parameters.join('&')}` : `rtsp://${hostname}/media/media.amp`;
  return {
    uri
  };
};

/**
 * A component that sets up a command queue in order to interact with the RTSP
 * server. Allows control over the RTSP session by listening to incoming messages
 * and sending request on the outgoing stream.
 *
 * The following handlers can be set on the component:
 *  - onSdp: will be called when an SDP object is sent with the object as argument
 *  - onPlay: will be called when an RTSP PLAY response is sent with the media range
 *            as argument. The latter is an array [start, stop], where start is "now"
 *            (for live) or a time in seconds, and stop is undefined (for live or
 *            ongoing streams) or a time in seconds.
 * @extends {Component}
 */
class RtspSession extends _component__WEBPACK_IMPORTED_MODULE_1__.Tube {
  /**
   * Create a new RTSP session controller component.
   * @param  {Object} [config={}] Details about the session.
   * @param  {String} [config.hostname] The RTSP server hostname
   * @param  {String[]} [config.parameters] The RTSP URI parameters
   * @param  {String} [config.uri] The full RTSP URI (overrides any hostname/parameters)
   * @param  {Object} [config.defaultHeaders] Default headers to use (for all methods).
   * @param  {Object} [config.headers] Headers to use (mapped to each method).
   * @return {undefined}
   */
  constructor(config = {}) {
    const {
      uri,
      headers,
      defaultHeaders
    } = (0,_utils_config__WEBPACK_IMPORTED_MODULE_2__.merge)(defaultConfig(config.hostname, config.parameters), config);
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_4__.Transform({
      objectMode: true,
      transform: (msg, encoding, callback) => {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTSP) {
          this._onRtsp(msg);
          callback(); // Consumes the RTSP packages
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTCP) {
          this._onRtcp(msg);
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTP) {
          this._onRtp(msg);
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SDP) {
          var sdpmedia = [];
          if (msg.sdp.media) {
            for (var i = 0; i < msg.sdp.media.length; i++) {
              if (msg.sdp.media[i] && msg.sdp.media[i].recvonly && msg.sdp.media[i].recvonly === true) {
                sdpmedia.push(msg.sdp.media[i]);
              } else if (msg.sdp.media[i]) {
                var control = msg.sdp.media[i].control;
                if (control && (control.indexOf("audioback") != -1 || control.indexOf("backchannel") != -1)) {
                  this.audioback_chnl = i * 2;
                  this.audioback_control = control;
                }
              }
            }
          }
          if (msg && msg.sdp && msg.sdp.media) {
            delete msg.sdp.media;
          }
          msg.sdp.media = sdpmedia;
          this._onSdp(msg);
          // Execute externally registered SDP handler
          msg.sdp.rawdata = msg.data;
          this.onSdp && this.onSdp(msg.sdp);
          // Pass SDP forward
          callback(undefined, msg);
        } else {
          // Not a message we should handle
          callback(undefined, msg);
        }
      }
    });
    incoming.on('end', () => {
      // Incoming was ended, assume that outgoing is closed as well
      this._outgoingClosed = true;
    });
    super(incoming);
    _defineProperty(this, "uri", void 0);
    _defineProperty(this, "audioback_chnl", void 0);
    _defineProperty(this, "audioback_control", void 0);
    _defineProperty(this, "headers", void 0);
    _defineProperty(this, "defaultHeaders", void 0);
    _defineProperty(this, "t0", void 0);
    _defineProperty(this, "n0", void 0);
    _defineProperty(this, "clockrates", void 0);
    _defineProperty(this, "startTime", void 0);
    _defineProperty(this, "onSdp", void 0);
    _defineProperty(this, "onError", void 0);
    _defineProperty(this, "onPlay", void 0);
    _defineProperty(this, "_outgoingClosed", void 0);
    _defineProperty(this, "_sequence", void 0);
    _defineProperty(this, "_retry", void 0);
    _defineProperty(this, "_callStack", void 0);
    _defineProperty(this, "_callHistory", void 0);
    _defineProperty(this, "_state", void 0);
    _defineProperty(this, "_waiting", void 0);
    _defineProperty(this, "_contentBase", void 0);
    _defineProperty(this, "_sessionId", void 0);
    _defineProperty(this, "_renewSessionInterval", void 0);
    this._outgoingClosed = false;
    this._reset();
    this.update(uri, headers, defaultHeaders);
  }

  /**
   * Update the cached RTSP uri and headers.
   * @param  {String} uri                 The RTSP URI.
   * @param  {Object} headers             Maps commands to headers.
   * @param  {Object} [defaultHeaders={}] Default headers.
   * @return {[type]}                     [description]
   */
  update(uri, headers = {}, defaultHeaders = {}) {
    if (uri === undefined) {
      throw new Error('You must supply an uri when creating a RtspSessionComponent');
    }
    this.uri = uri;
    this.defaultHeaders = defaultHeaders;
    this.headers = Object.assign({
      [RTSP_METHOD.OPTIONS]: {},
      [RTSP_METHOD.PLAY]: {},
      [RTSP_METHOD.SETUP]: {
        Blocksize: '64000'
      },
      [RTSP_METHOD.DESCRIBE]: {
        Accept: 'application/sdp'
      },
      [RTSP_METHOD.PAUSE]: {}
    }, headers);
  }

  /**
   * Restore the initial values to the state they were in before any RTSP
   * connection was made.
   */
  _reset() {
    this._sequence = 1;
    this._retry = () => console.error("No request sent, can't retry");
    this._callStack = [];
    this._callHistory = [];
    this._state = STATE.IDLE;
    this._waiting = false;
    this._contentBase = null;
    this._sessionId = null;
    if (this._renewSessionInterval !== null) {
      clearInterval(this._renewSessionInterval);
    }
    this._renewSessionInterval = null;
    this.t0 = undefined;
    this.n0 = undefined;
    this.clockrates = undefined;
  }

  /**
   * Handles incoming RTSP messages and send the next command in the queue.
   * @param  {Object} msg An incoming RTSP message.
   * @return {undefined}
   */
  _onRtsp(msg) {
    this._waiting = false;
    const status = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.statusCode)(msg.data);
    const ended = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.connectionEnded)(msg.data);
    const seq = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.sequence)(msg.data);
    if (seq === null) {
      throw new Error('rtsp: expected sequence number');
    }
    if (this._callHistory === undefined) {
      throw new Error('rtsp: internal error');
    }
    const method = this._callHistory[seq - 1];
    debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:rtsp:incoming')(`${msg.data}`);
    if (!this._sessionId && !ended) {
      // Response on first SETUP
      this._sessionId = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.sessionId)(msg.data);
      const _sessionTimeout = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.sessionTimeout)(msg.data);
      if (_sessionTimeout !== null) {
        // The server specified that sessions will timeout if not renewed.
        // In order to keep it alive we need periodically send a RTSP_OPTIONS message
        if (this._renewSessionInterval !== null) {
          clearInterval(this._renewSessionInterval);
        }
        this._renewSessionInterval = setInterval(() => {
          this._enqueue({
            method: RTSP_METHOD.OPTIONS
          });
          this._dequeue();
        }, Math.max(MIN_SESSION_TIMEOUT, _sessionTimeout - 5) * 1000);
      }
    }
    if (!this._contentBase) {
      this._contentBase = (0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.contentBase)(msg.data);
    }
    if (status >= 400) {
      // TODO: Retry in certain cases?
      this.onError && this.onError(new Error(msg.data.toString('ascii')));
    }
    if (method === RTSP_METHOD.PLAY) {
      // When starting to play, send the actual range to an external handler.
      this.onPlay && this.onPlay((0,_utils_protocols_rtsp__WEBPACK_IMPORTED_MODULE_5__.range)(msg.data));
    }
    if (ended) {
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:rtsp:incoming')(`RTSP Session ${this._sessionId} ended with statusCode: ${status}`);
      this._sessionId = null;
    }
    this._dequeue();
  }
  _onRtcp(msg) {
    if (this.t0 === undefined || this.n0 === undefined) {
      throw new Error('rtsp: internal error');
    }
    if ((0,_utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__.packetType)(msg.data) === _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__.SR.packetType) {
      const rtpChannel = msg.channel - 1;
      this.t0[rtpChannel] = _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__.SR.rtpTimestamp(msg.data);
      this.n0[rtpChannel] = (0,_utils_protocols_ntp__WEBPACK_IMPORTED_MODULE_7__.getTime)(_utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__.SR.ntpMost(msg.data), _utils_protocols_rtcp__WEBPACK_IMPORTED_MODULE_6__.SR.ntpLeast(msg.data));
    }
  }
  _onRtp(msg) {
    if (this.t0 === undefined || this.n0 === undefined || this.clockrates === undefined) {
      throw new Error('rtsp: internal error');
    }
    const rtpChannel = msg.channel;
    const t0 = this.t0[rtpChannel];
    const n0 = this.n0[rtpChannel];
    if (typeof t0 !== 'undefined' && typeof n0 !== 'undefined') {
      const clockrate = this.clockrates[rtpChannel];
      const t = (0,_utils_protocols_rtp__WEBPACK_IMPORTED_MODULE_8__.timestamp)(msg.data);
      // The RTP timestamps are unsigned 32 bit and will overflow
      // at some point. We can guard against the overflow by ORing with 0,
      // which will bring any difference back into signed 32-bit domain.
      const dt = t - t0 | 0;
      msg.ntpTimestamp = dt / clockrate * 1000 + n0;
    }
  }

  /**
   * Handles incoming SDP messages, reply with SETUP and optionally PLAY.
   * @param  {Object} msg An incoming SDP message.
   * @return {undefined}
   */
  _onSdp(msg) {
    this.n0 = {};
    this.t0 = {};
    this.clockrates = {};
    msg.sdp.media?.forEach((media, index) => {
      let uri = media.control;
      // We should actually be able to handle
      // non-dynamic payload types, but ignored for now.
      if (media.rtpmap === undefined) {
        //return
        if (media.fmt == 0) {
          //PCMU
          media.rtpmap = {
            clockrate: 8000,
            encodingName: "PCMU",
            payloadType: 0
          };
        }
      }

      //const { clockrate } = media.rtpmap 
      var clockrate = 8000;
      if (media && media.rtpmap && media.rtpmap.clockrate) {
        clockrate = media.rtpmap.clockrate;
      }
      const rtp = index * 2;
      const rtcp = rtp + 1;

      // TODO: investigate if we can make sure this is defined
      if (uri === undefined) {
        return;
      }
      if (!isAbsolute(uri)) {
        uri = this._contentBase + uri;
      }
      if (uri.indexOf("audioback") != -1) {
        this.audioback_chnl = rtp;
      }
      this._enqueue({
        method: RTSP_METHOD.SETUP,
        headers: {
          Transport: 'RTP/AVP/TCP;unicast;interleaved=' + rtp + '-' + rtcp
        },
        uri
      });

      // TODO: see if we can get rid of this check somehow
      if (this.clockrates === undefined) {
        return;
      }
      this.clockrates[rtp] = clockrate;
    });
    if (this.audioback_chnl) {
      let uri = this.audioback_control;
      console.log("audioback_chnl = ", this.audioback_chnl);
      if (!isAbsolute(uri)) {
        uri = this._contentBase + uri;
      }
      this._enqueue({
        method: RTSP_METHOD.SETUP,
        headers: {
          Transport: 'RTP/AVP/TCP;unicast;interleaved=' + this.audioback_chnl + '-' + (this.audioback_chnl + 1)
        },
        uri
      });
    }
    if (this._state === STATE.PLAYING) {
      this._enqueue({
        method: RTSP_METHOD.PLAY,
        headers: {
          Range: `npt=${this.startTime || 0}-`
        }
      });
    }
    this._dequeue();
  }

  /**
   * Set up command queue in order to start playing, i.e. PLAY optionally
   * preceeded by OPTIONS/DESCRIBE commands. If not waiting, immediately
   * start sending.
   * @param  {Number} startTime Time (seconds) at which to start playing
   * @return {undefined}
   */
  play(startTime = 0) {
    if (this._state === STATE.IDLE) {
      this.startTime = Number(startTime) || 0;
      this._enqueue({
        method: RTSP_METHOD.OPTIONS
      });
      this._enqueue({
        method: RTSP_METHOD.DESCRIBE
      });
    } else if (this._state === STATE.PAUSED) {
      if (this._sessionId === null || this._sessionId === undefined) {
        throw new Error('rtsp: internal error');
      }
      this._enqueue({
        method: RTSP_METHOD.PLAY,
        headers: {
          Session: this._sessionId
        }
      });
    }
    this._state = STATE.PLAYING;
    this._dequeue();
  }

  /**
   * Queue a pause command, and send if not waiting.
   * @return {undefined}
   */
  pause() {
    this._enqueue({
      method: RTSP_METHOD.PAUSE
    });
    this._state = STATE.PAUSED;
    this._dequeue();
  }

  /**
   * End the session if there is one, otherwise just cancel
   * any outstanding calls on the stack.
   * @return {undefined}
   */
  stop() {
    if (this._sessionId) {
      this._enqueue({
        method: RTSP_METHOD.TEARDOWN
      });
    } else {
      this._callStack = [];
    }
    this._state = STATE.IDLE;
    if (this._renewSessionInterval !== null) {
      clearInterval(this._renewSessionInterval);
      this._renewSessionInterval = null;
    }
    this._dequeue();
  }

  /**
   * Pushes an RTSP request onto the outgoing stream.
   * @param  {Object} options The details about the command to send.
   * @return {undefined}
   */
  send(cmd) {
    const {
      method,
      headers,
      uri
    } = cmd;
    if (method === undefined) {
      throw new Error('missing method when send request');
    }
    this._waiting = true;
    this._retry = this.send.bind(this, cmd);
    if (this._sequence === undefined || this.headers === undefined || this._callHistory === undefined) {
      throw new Error('rtsp: internal error');
    }
    const message = Object.assign({
      type: _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RTSP,
      uri: uri || this.uri,
      data: Buffer.alloc(0) // data is a mandatory field. Not used by session -> parser messages.
    }, {
      method,
      headers
    }, {
      headers: Object.assign({
        CSeq: this._sequence++
      }, this.defaultHeaders,
      // default headers (for all methods)
      this.headers[method],
      // preset headers for this method
      headers // headers that came with the invokation
      )
    });

    this._sessionId && (message.headers.Session = this._sessionId);
    this._callHistory.push(method);
    if (!this._outgoingClosed) {
      this.outgoing.push(message);
    } else {
      // If the socket is closed, dont attempt to send any data
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:rtsp:outgoing')(`Unable to send ${method}, connection closed`);
    }
  }

  /**
   * Push one or more commands onto the call stack.
   * @param  {...Object} commands One or more commands.
   * @return {undefined}
   */
  _enqueue(cmd) {
    if (this._callStack === undefined) {
      throw new Error('rtsp: internal error');
    }
    this._callStack.push(cmd);
  }

  /**
   * If possible, send the next command on the call stack.
   * @return {undefined}
   */
  _dequeue() {
    if (this._callStack === undefined) {
      throw new Error('rtsp: internal error');
    }
    if (!this._waiting && this._callStack.length > 0) {
      const cmd = this._callStack.shift();
      if (cmd !== undefined) {
        this.send(cmd);
      }
    }
  }
}

/***/ }),

/***/ "./lib/components/sdp-updater/index.ts":
/*!*********************************************!*\
  !*** ./lib/components/sdp-updater/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SDPUpdater: () => (/* binding */ SDPUpdater)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_base64__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/base64 */ "./lib/utils/base64.ts");
/* harmony import */ var _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../mp4muxer/helpers/spsparser */ "./lib/components/mp4muxer/helpers/spsparser.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }






class SDPUpdater extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor() {
    let dbg = debug__WEBPACK_IMPORTED_MODULE_3___default()('msl:sdpupdater');
    let sdp;
    let spschanged = false;
    let payloadTypeVideo = 35;
    let lastVideoTimestamp = 0;
    let lastNtpTimestamp = 0;
    let lastDiff = 0;
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP) {
          sdp = _objectSpread({}, msg.sdp);
          let videoMedia = sdp.media ? sdp.media.find(function (media) {
            return media.type === 'video';
          }) : null;
          if (videoMedia && videoMedia.rtpmap) {
            payloadTypeVideo = videoMedia.rtpmap.payloadType;
          }
          dbg('SDP received: %o', sdp);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SPS) {
          const videoMedia = sdp.media ? sdp.media.find(media => {
            return media.type === 'video';
          }) : null;
          if (videoMedia) {
            const oldSPS = videoMedia.fmtp.parameters['sprop-parameter-sets'].split(',')[0];
            const newSPS = (0,_utils_base64__WEBPACK_IMPORTED_MODULE_4__.uint8ArrToBase64)(msg.data);
            if (oldSPS !== newSPS) {
              // update sdp
              videoMedia.fmtp.parameters['sprop-parameter-sets'] = videoMedia.fmtp.parameters['sprop-parameter-sets'].replace(/^.*,/, newSPS + ',');
              videoMedia.fmtp.parameters['profile-level-id'] = Buffer.from(msg.data.slice(1, 4)).toString('hex');
              dbg('new SPS received %o, forward as SDP %o: ', new _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_5__.SPSParser(msg.data.buffer).parse(), sdp);
              spschanged = true;
              // forward as SDP after PPS is received
            }
          }
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.PPS) {
          const videoMedia = sdp.media ? sdp.media.find(media => {
            return media.type === 'video';
          }) : null;
          if (videoMedia) {
            const oldPPS = videoMedia.fmtp.parameters['sprop-parameter-sets'].split(',')[1];
            const newPPS = (0,_utils_base64__WEBPACK_IMPORTED_MODULE_4__.uint8ArrToBase64)(msg.data);
            if (oldPPS !== newPPS || spschanged) {
              spschanged = false;
              videoMedia.fmtp.parameters['sprop-parameter-sets'] = videoMedia.fmtp.parameters['sprop-parameter-sets'].replace(/,.*$/, ',' + newPPS);
              dbg(`new PPS received %o, forward as SDP %o: `, Buffer.from(msg.data).toString('hex'), sdp);
              incoming.push({
                type: _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP,
                sdp: sdp
              });
            }
          }
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SEI) {
          // nothing to do with SEI. When B-Frames are filtered (skipbframes) and SEI is active, timestamp jumps are possible.
          // we ignore them here
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.ELEMENTARY) {
          if (msg.payloadType === payloadTypeVideo) {
            // console.log(`current ntp: ${msg.ntpTimestamp} (${(msg.ntpTimestamp ?? 0) - lastNtpTimestamp}), current: ${msg.timestamp} (${(msg.timestamp ?? 0) - lastVideoTimestamp})`)
            if (lastNtpTimestamp === 0) lastNtpTimestamp = msg.ntpTimestamp || 0;
            if (lastVideoTimestamp === 0) lastVideoTimestamp = msg.timestamp || 0;
            if (lastNtpTimestamp > 0 && lastVideoTimestamp > 0) {
              let ntpDiff = (msg.ntpTimestamp || 0) - lastNtpTimestamp;
              if ((msg.ntpTimestamp || 0) > 0) {
                ntpDiff = (msg.ntpTimestamp || 0) - lastNtpTimestamp;
                lastNtpTimestamp = msg.ntpTimestamp || 0;
              }
              const diff = msg.timestamp - lastVideoTimestamp;
              // dbg('timestamp: %d, diff: %d', msg.timestamp, diff);
              lastVideoTimestamp = msg.timestamp;
              if (lastDiff === 0) lastDiff = diff;
              const diffAvg = (diff + lastDiff) / 2;
              if (diff < 0) {
                dbg('negative rtp timestamp: %d (diff: %d, last: %d, avg: %d), ntp: %d (diff: %d)', msg.timestamp, diff, lastDiff, diffAvg, msg.ntpTimestamp, ntpDiff);
              }
              if (diff < lastDiff * -5 || diffAvg > lastDiff * 5) {
                dbg('rtp timestamp jump detected, resend SDP (diff: %d, avg: %d, last diff: %d)...', diff, diffAvg, lastDiff);
                incoming.push({
                  type: _message__WEBPACK_IMPORTED_MODULE_2__.MessageType.SDP,
                  sdp: sdp
                });
                lastDiff = 0;
                lastVideoTimestamp = 0;
                lastNtpTimestamp = 0;
              } else {
                lastDiff = diffAvg;
              }
            }
          }
        }
        callback(undefined, msg);
      }
    });
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/streaminfo/helpers/seiparser.ts":
/*!********************************************************!*\
  !*** ./lib/components/streaminfo/helpers/seiparser.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SEIParser: () => (/* binding */ SEIParser)
/* harmony export */ });
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Parses a SEI message
 * @class SEIParser
 * @constructor
 * @param {Buffer} buffer with sei data.
 */

class SEIParser {
  constructor(buffer) {
    _defineProperty(this, "_buffer", void 0);
    this._buffer = buffer;
  }
  parse() {
    this.cleanByteArray();
    let dataView = new DataView(this._buffer);
    let curpos = 19;
    let map = new Map();
    while (curpos < dataView.buffer.byteLength - 4) {
      let o = {
        tag: 0,
        length: 0,
        data: Buffer.from([])
      };
      o.tag = dataView.getUint16(curpos);
      curpos += 2;
      o.length = dataView.getUint16(curpos);
      curpos += 2;
      o.data = dataView.buffer.slice(curpos, curpos + o.length);
      curpos += o.length;
      this.parseTag(o);
      map.set(o.tag, o);
    }
    return map;
  }
  parseTag(o) {
    switch (o.tag) {
      case 0x85:
        let dv = new DataView(o.data);
        o.parsed = {
          tagname: 'roi_pos_info',
          tl: {
            x: dv.getUint16(0),
            y: dv.getUint16(2)
          },
          br: {
            x: dv.getUint16(4),
            y: dv.getUint16(6)
          }
        };
        if (o.data.byteLength >= 16) {
          o.parsed.deltatime = dv.getInt32(8);
          o.parsed.maxdeltatime = dv.getInt32(12);
        }
        break;
      default:
        // console.log('unknown tag: ', o)
        break;
    }
  }
  cleanByteArray() {
    /* we have to replace all 00 00 03 occurencies with 00 00 */
    let cleaned = [];
    let last2bytes = 0x0000;
    let a = new Uint8Array(this._buffer);
    for (let i = 0; i < a.byteLength; i++) {
      if (i > 1) {
        if (a[i] === 3 && last2bytes === 0) {
          // skip this
          continue;
        }
      }
      cleaned.push(a[i]);
      // console.log('cur: 0x' + a[i].toString(16) + ', last: 0x' + last2bytes.toString(16))
      last2bytes = (last2bytes << 8) + a[i] & 0xFFFF;
    }
    this._buffer = new Uint8Array(cleaned).buffer;
  }
}

/***/ }),

/***/ "./lib/components/streaminfo/index.ts":
/*!********************************************!*\
  !*** ./lib/components/streaminfo/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StreamInfo: () => (/* binding */ StreamInfo)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../mp4muxer/helpers/utils */ "./lib/components/mp4muxer/helpers/utils.ts");
/* harmony import */ var _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../mp4muxer/helpers/spsparser */ "./lib/components/mp4muxer/helpers/spsparser.ts");
/* harmony import */ var _helpers_seiparser__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./helpers/seiparser */ "./lib/components/streaminfo/helpers/seiparser.ts");







class StreamInfo extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(infohandler, seihandler) {
    const dbg = debug__WEBPACK_IMPORTED_MODULE_2___default()('msl:streaminfo');
    const COLLECT_MS = 2000;
    let lastTimestamp = 0;
    let bytecount = 0;
    const curData = {
      video: null,
      audio: null,
      meta: null,
      sei: null,
      kbit_sec: 0
    };
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        let forceEvent = false;
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SDP) {
          const dataBackup = JSON.parse(JSON.stringify(curData));
          // video details
          const video = msg.sdp.media ? msg.sdp.media.find(media => {
            return media.type === 'video';
          }) : null;
          if (video) {
            curData.video = {};
            if (video.fmtp) {
              if (video.fmtp.parameters['sprop-parameter-sets']) {
                const parameterSets = video.fmtp.parameters['sprop-parameter-sets'].split(',').map(_mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_4__.base64DecToArr);
                const parsedSps = new _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_5__.SPSParser(parameterSets[0].buffer).parse();
                curData.video.width = parsedSps.width;
                curData.video.height = parsedSps.height;
              }
              if (dataBackup.video && (dataBackup.video.width !== curData.video.width || dataBackup.video.height !== curData.video.height)) {
                // send event immediately when video resolution changes
                dbg('videoresolution changed, forcing event: %o', curData.video);
                forceEvent = true;
              }
            }
            if (video.codec) {
              curData.video.codec = {};
              curData.video.codec.coding = video.codec.coding;
              curData.video.codec.level = video.codec.level;
              curData.video.codec.profile = video.codec.profile;
            } else if (video.rtpmap) {
              curData.video.codec = {};
              curData.video.codec.coding = video.rtpmap.encodingName;
            }
          }
          // audio details
          const audio = msg.sdp.media ? msg.sdp.media.find(media => {
            return media.type === 'audio';
          }) : null;
          if (audio) {
            if (audio.codec) {
              curData.audio = {
                codec: {}
              };
              curData.audio.codec.channels = audio.codec.channels;
              curData.audio.codec.coding = audio.codec.coding;
              curData.audio.codec.samplingrate = audio.codec.samplingRate;
            } else if (audio.rtpmap) {
              curData.audio = {
                codec: {}
              };
              curData.audio.codec.coding = audio.rtpmap.encodingName;
            }
          }
          // meta details
          const application = msg.sdp.media ? msg.sdp.media.find(media => {
            return media.type === 'application';
          }) : null;
          if (application) {
            if (application.rtpmap) {
              curData.meta = {};
              curData.meta.encoding = application.rtpmap.encodingName;
            }
          }
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.JPEG) {
          if (msg.framesize) {
            if (!curData.video) {
              curData.video = {};
            }
            curData.video.width = msg.framesize.width;
            curData.video.height = msg.framesize.height;
          }
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.SEI) {
          const parsed = new _helpers_seiparser__WEBPACK_IMPORTED_MODULE_6__.SEIParser(msg.data.buffer).parse();
          curData.sei = parsed;
          if (seihandler) {
            seihandler(parsed);
          }
        }

        // count bytes and notify handler
        if (msg.data) {
          bytecount += msg.data.length;
        }
        const diff = new Date().getTime() - lastTimestamp;
        if (diff > COLLECT_MS || forceEvent || lastTimestamp === 0) {
          curData.kbit_sec = lastTimestamp === 0 ? 0 : bytecount / diff * 8;
          lastTimestamp = new Date().getTime();
          forceEvent = false;
          bytecount = 0;
          if (infohandler) {
            // dbg('notify streaminfo handler, data: %o', curData)
            infohandler(curData);
          }
        }
        // Always pass on all messages
        callback(undefined, msg);
      }
    });

    // outgoing will be defaulted to a PassThrough stream
    super(incoming);
  }
}

/***/ }),

/***/ "./lib/components/webcodecsdecoder/frame-renderer.ts":
/*!***********************************************************!*\
  !*** ./lib/components/webcodecsdecoder/frame-renderer.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FrameRenderer: () => (/* binding */ FrameRenderer)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

class FrameRenderer {
  constructor(el) {
    _defineProperty(this, "dbg", void 0);
    _defineProperty(this, "cnv", void 0);
    _defineProperty(this, "ctx", void 0);
    _defineProperty(this, "frames", []);
    _defineProperty(this, "renderingInProgress", false);
    _defineProperty(this, "framecnt", 0);
    _defineProperty(this, "curFps", 0);
    _defineProperty(this, "deltaToNow", 0);
    _defineProperty(this, "isRunning", false);
    this.dbg = debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:renderer');
    this.dbg('constructor, el: ', el);
    this.cnv = el;
    this.ctx = this.cnv.getContext('2d', {
      alpha: false
    });
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "#ffffff";
    setInterval(() => {
      this.curFps = this.framecnt;
      this.framecnt = 0;
      this.dbg('fps: ', this.curFps);
    }, 1000);
  }
  processFrame(frame) {
    // this.dbg(`process frame: ${frame.timestamp}`)
    if (frame.timestamp === 0) return;
    this.frames.push(frame);
    if (this.frames.length >= 4 && !this.isRunning) {
      this.isRunning = true;
      setTimeout(() => {
        this.renderFrame();
      }, 0);
    }
  }
  async renderFrame() {
    // this.dbg('render frame')
    if (!this.renderingInProgress && this.frames.length > 0) {
      this.renderingInProgress = true;
      // let bitmap = await frame.createImageBitmap();
      let timeToWait = this.getTimeToWait(this.frames[0].timestamp);
      while (timeToWait < 0 && this.frames.length > 1) {
        this.dbg(`skip this frame (waittime: ${timeToWait}, timestamp: ${this.frames[0].timestamp}, framebuffer: ${this.frames.length})`);
        this.frames.shift().close();
        timeToWait = this.getTimeToWait(this.frames[0].timestamp);
      }
      if (timeToWait >= 0) {
        await this.sleep(timeToWait);
        // let start_time = performance.now();
        this.dbg(`draw image (buffer: ${this.frames.length})`);
        this.ctx.drawImage(this.frames[0], 0, 0, this.cnv.width, this.cnv.height);
        this.ctx.fillText('FPS: ' + this.curFps, 10, 30);
        // this.dbg('draw finished')
        // this.dbg(`time to draw: ${performance.now() - start_time}`)
        this.framecnt++;
        this.frames.shift().close();
      }
      this.renderingInProgress = false;
    }
    if (this.isRunning) {
      setTimeout(() => {
        this.renderFrame();
      }, 0);
    }
  }
  getTimeToWait(timestamp) {
    if (this.deltaToNow === 0) {
      this.deltaToNow = timestamp - performance.now();
      this.dbg('deltaToNow: ', this.deltaToNow, timestamp);
      return 0;
    } else {
      let targetTime = timestamp - this.deltaToNow;
      let delta = targetTime - performance.now();
      this.dbg(`wait: ${delta}, timestamp: ${timestamp}, now: ${performance.now()}, target: ${targetTime}, frames: ${this.frames.length}`);
      // return Math.max(0, delta);
      return delta;
    }
  }
  sleep(ms) {
    // this.dbg('sleep ', ms);
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}

/***/ }),

/***/ "./lib/components/webcodecsdecoder/index.ts":
/*!**************************************************!*\
  !*** ./lib/components/webcodecsdecoder/index.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebCodecsDecoder: () => (/* binding */ WebCodecsDecoder)
/* harmony export */ });
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../mp4muxer/helpers/utils */ "./lib/components/mp4muxer/helpers/utils.ts");
/* harmony import */ var _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../mp4muxer/helpers/spsparser */ "./lib/components/mp4muxer/helpers/spsparser.ts");
/* harmony import */ var _frame_renderer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./frame-renderer */ "./lib/components/webcodecsdecoder/frame-renderer.ts");
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];







class WebCodecsDecoder extends _component__WEBPACK_IMPORTED_MODULE_0__.Tube {
  constructor(el) {
    let dbg = debug__WEBPACK_IMPORTED_MODULE_2___default()('msl:decoder');
    let decoder;
    let renderer;
    if (el) {
      renderer = new _frame_renderer__WEBPACK_IMPORTED_MODULE_5__.FrameRenderer(el);
    }
    const init = {
      output: frame => {
        if (renderer) {
          renderer.processFrame(frame);
        } else {
          dbg('no canvas give, frame: ', frame);
        }
      },
      error: e => {
        console.log('error: ', e);
      }
    };
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_1__.Transform({
      objectMode: true,
      transform: function (msg, encoding, callback) {
        if (msg.type === _message__WEBPACK_IMPORTED_MODULE_6__.MessageType.SDP) {
          dbg('sdp: ', msg);
          const h264Media = msg.sdp.media ? msg.sdp.media.find(media => {
            return media.type === 'video' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'H264';
          }) : null;
          dbg('h264: ', h264Media);
          if (h264Media) {
            const codec = 'avc1.' + h264Media.fmtp.parameters['profile-level-id'];
            const parameterSets = h264Media.fmtp.parameters['sprop-parameter-sets'].split(',').map(_mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_3__.base64DecToArr);

            // We assume the first set is SPS, 2nd is PPS (no support for multiple).
            const sps = parameterSets.slice(0, 1);
            const pps = parameterSets.slice(1);
            const parsedSps = new _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_4__.SPSParser(sps[0].buffer).parse();
            dbg('sps: ', sps);
            dbg('pps: ', pps);
            let avcc_extradata = Buffer.alloc(8);
            avcc_extradata.writeUInt8(1, 0);
            avcc_extradata.writeUInt8(sps[0][1], 1);
            avcc_extradata.writeUInt8(sps[0][2], 2);
            avcc_extradata.writeUInt8(sps[0][3], 3);
            avcc_extradata.writeUInt8(0xff, 4); // 6 bits = 0b111111 + 2 bits of NALULengthSizeMinusOne (typically 3) --> 0b11111111
            avcc_extradata.writeUInt8(0xe1, 5); // 3 bits of 0b111 + 5 bits of number of SPS NALU (usually 1) --> 0b11100001
            avcc_extradata.writeUInt16BE(sps[0].length, 6);
            let totalLength = avcc_extradata.length + sps[0].length + 3;
            avcc_extradata = Buffer.concat([avcc_extradata, Buffer.from(sps[0])], totalLength);
            avcc_extradata.writeUInt8(1, avcc_extradata.length - 3);
            avcc_extradata.writeUInt16BE(pps[0].length, avcc_extradata.length - 2);
            totalLength = avcc_extradata.length + pps[0].length;
            avcc_extradata = Buffer.concat([avcc_extradata, Buffer.from(pps[0])], totalLength);
            dbg('avcc: ', avcc_extradata);
            const config = {
              codec: codec,
              description: avcc_extradata,
              codedWidth: parsedSps.width,
              codedHeight: parsedSps.height
            };
            decoder = new window.VideoDecoder(init);
            decoder.configure(config);
            dbg(`videodecoder config: ${JSON.stringify(config)}, queue size: ${decoder.decodeQueueSize}`);
          } else {
            dbg('h264 media not found');
            const h265Media = msg.sdp.media ? msg.sdp.media.find(media => {
              return media.type === 'video' && media.rtpmap !== undefined && media.rtpmap.encodingName === 'H265';
            }) : null;
            if (h265Media) {
              // this does not yet work (h265)
              dbg('h265: ', h265Media);
              const codec = 'hevc';
              const sps = (0,_mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_3__.base64DecToArr)(h265Media.fmtp.parameters['sprop-sps'], 0);
              const pps = (0,_mp4muxer_helpers_utils__WEBPACK_IMPORTED_MODULE_3__.base64DecToArr)(h265Media.fmtp.parameters['sprop-pps'], 0);
              const parsedSps = new _mp4muxer_helpers_spsparser__WEBPACK_IMPORTED_MODULE_4__.SPSParser(sps.buffer).parse();
              dbg('sps: ', sps);
              dbg('parsed: ', parsedSps);
              dbg('pps: ', pps);
              let avcc_extradata = Buffer.alloc(8);
              avcc_extradata.writeUInt8(1, 0);
              avcc_extradata.writeUInt8(sps[1], 1);
              avcc_extradata.writeUInt8(sps[2], 2);
              avcc_extradata.writeUInt8(sps[3], 3);
              avcc_extradata.writeUInt8(0xff, 4); // 6 bits = 0b111111 + 2 bits of NALULengthSizeMinusOne (typically 3) --> 0b11111111
              avcc_extradata.writeUInt8(0xe1, 5); // 3 bits of 0b111 + 5 bits of number of SPS NALU (usually 1) --> 0b11100001
              avcc_extradata.writeUInt16BE(sps.length, 6);
              let totalLength = avcc_extradata.length + sps.length + 3;
              avcc_extradata = Buffer.concat([avcc_extradata, Buffer.from(sps)], totalLength);
              avcc_extradata.writeUInt8(1, avcc_extradata.length - 3);
              avcc_extradata.writeUInt16BE(pps.length, avcc_extradata.length - 2);
              totalLength = avcc_extradata.length + pps.length;
              avcc_extradata = Buffer.concat([avcc_extradata, Buffer.from(pps)], totalLength);
              dbg('avcc: ', avcc_extradata);
              const config = {
                codec: codec,
                description: avcc_extradata,
                codedWidth: parsedSps.width,
                codedHeight: parsedSps.height
              };
              dbg('config: ' + JSON.stringify(config));
              decoder = new window.VideoDecoder(init);
              decoder.configure(config);
            }
          }
          callback(undefined, msg);
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_6__.MessageType.ELEMENTARY) {
          // dbg('elementary: ', msg);
          if (decoder) {
            const isIFrame = (msg.data[4] & 0x1f) === 5;
            let chunk = new window.EncodedVideoChunk({
              type: isIFrame ? "key" : "delta",
              //              timestamp: msg.timestamp,
              timestamp: msg.ntpTimestamp,
              data: msg.data
            });
            decoder.decode(chunk);
            //decoder.flush();
          } else {
            dbg('decoder not initialized');
          }
          callback();
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_6__.MessageType.SPS) {
          dbg('sps: ', msg);
          callback();
        } else if (msg.type === _message__WEBPACK_IMPORTED_MODULE_6__.MessageType.PPS) {
          dbg('pps: ', msg);
          callback();
        } else {
          callback();
        }
        return Buffer.alloc(0);
      }
    });
    super(incoming);
    dbg('created');
  }
}

/***/ }),

/***/ "./lib/components/ws-source/index.ts":
/*!*******************************************!*\
  !*** ./lib/components/ws-source/index.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WSSource: () => (/* binding */ WSSource)
/* harmony export */ });
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component */ "./lib/components/component.ts");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! stream */ "./node_modules/stream-browserify/index.js");
/* harmony import */ var stream__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(stream__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../message */ "./lib/components/message.ts");
/* harmony import */ var _openwebsocket__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./openwebsocket */ "./lib/components/ws-source/openwebsocket.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }






// Named status codes for CloseEvent, see:
// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
const CLOSE_GOING_AWAY = 1001;
class WSSource extends _component__WEBPACK_IMPORTED_MODULE_1__.Source {
  /**
   * Create a WebSocket component.
   *
   * The constructor sets up two streams and connects them to the socket as
   * soon as the socket is available (and open).
   *
   * @param {Object} socket - an open WebSocket.
   */
  constructor(socket) {
    if (socket === undefined) {
      throw new Error('socket argument missing');
    }

    /**
     * Set up an incoming stream and attach it to the socket.
     * @type {Readable}
     */
    const incoming = new stream__WEBPACK_IMPORTED_MODULE_2__.Readable({
      objectMode: true,
      read: function () {
        //
      }
    });
    socket.onmessage = msg => {
      const buffer = Buffer.from(msg.data);
      if (!incoming.push({
        data: buffer,
        type: _message__WEBPACK_IMPORTED_MODULE_3__.MessageType.RAW
      })) {
        // Something happened down stream that it is no longer processing the
        // incoming data, and the stream buffer got full. In this case it is
        // best to just close the socket instead of throwing away data in the
        // hope that the situation will get resolved.
        if (socket.readyState === WebSocket.OPEN) {
          debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:websocket:incoming')('downstream frozen');
          socket.close();
        }
      }
    };

    // When an error is sent on the incoming stream, close the socket.
    incoming.on('error', e => {
      console.warn('closing socket due to incoming error', e);
      socket.close();
    });

    /**
     * Set up outgoing stream and attach it to the socket.
     * @type {Writable}
     */
    const outgoing = new stream__WEBPACK_IMPORTED_MODULE_2__.Writable({
      objectMode: true,
      write: function (msg, encoding, callback) {
        try {
          socket.send(msg.data);
        } catch (e) {
          console.warn('message lost during send:', msg);
        }
        callback();
      }
    });

    // When an error happens on the outgoing stream, just warn.
    outgoing.on('error', e => {
      console.warn('error during websocket send, ignoring:', e);
    });

    // When there is no more data going to be written, close!
    outgoing.on('finish', () => {
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:websocket:outgoing')('finish');
      if (socket.readyState !== WebSocket.CLOSED) {
        socket.close();
      }
    });

    /**
     * Handler for when WebSocket is CLOSED
     * @param  {CloseEvent} e The event associated with a close
     * @param  {Number} e.code The status code sent by the server
     *   Possible codes are documented here:
     *   https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     * @return {undefined}
     */
    socket.onclose = e => {
      debug__WEBPACK_IMPORTED_MODULE_0___default()('msl:websocket:close')(`${e.code}`);
      if (e.code === CLOSE_GOING_AWAY) {
        this.onServerClose && this.onServerClose();
      }
      this.onSocketClose && this.onSocketClose(e);
      // Terminate the streams.
      incoming.push(null);
      outgoing.end();
    };

    /**
     * initialize the component.
     */
    super(incoming, outgoing);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "onSocketClose", void 0);
  }

  /**
   * Expose websocket opener as a class method that returns a promise which
   * resolves with a new WebSocketComponent.
   */
  static open(config) {
    return (0,_openwebsocket__WEBPACK_IMPORTED_MODULE_4__.openWebSocket)(config).then(socket => new WSSource(socket));
  }
}

/***/ }),

/***/ "./lib/components/ws-source/openwebsocket.ts":
/*!***************************************************!*\
  !*** ./lib/components/ws-source/openwebsocket.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   openWebSocket: () => (/* binding */ openWebSocket)
/* harmony export */ });
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/config */ "./lib/utils/config.ts");


// Time in milliseconds we want to wait for a websocket to open
const WEBSOCKET_TIMEOUT = 10007;
// Default configuration
const defaultConfig = (host = window.location.host, scheme = window.location.protocol) => {
  const wsScheme = scheme === 'https:' ? 'wss:' : 'ws:';
  return {
    uri: `${wsScheme}//${host}/rtsp-over-websocket`,
    tokenUri: `${scheme}//${host}/cgi/rtspwssession.cgi`,
    protocol: 'binary',
    timeout: WEBSOCKET_TIMEOUT
  };
};

/**
 * Open a new WebSocket, fallback to token-auth on failure and retry.
 * @param  {Object} [config={}]  WebSocket configuration.
 * @param  {String} [config.host]  Specify different host
 * @param  {String} [config.sheme]  Specify different scheme.
 * @param  {String} [config.uri]  Full uri for websocket connection
 * @param  {String} [config.tokenUri]  Full uri for token API
 * @param  {String} [config.protocol] Websocket protocol
 * @param  {Number} [config.timeout] Websocket connection timeout
 * @return {Promise}  Resolves with WebSocket, rejects with error.
 */
const openWebSocket = (config = {}) => {
  const {
    uri,
    tokenUri,
    protocol,
    timeout
  } = (0,_utils_config__WEBPACK_IMPORTED_MODULE_0__.merge)(defaultConfig(config.host, config.scheme), config);
  if (uri === undefined) {
    throw new Error('ws: internal error');
  }
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(uri, protocol);
      const countdown = setTimeout(() => {
        clearTimeout(countdown);
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.onerror = null;
          reject(new Error('websocket connection timed out'));
        }
      }, timeout);
      ws.binaryType = 'arraybuffer';
      ws.onerror = originalError => {
        console.error(originalError);
        /*      
                clearTimeout(countdown)
                // try fetching an authentication token
                function onLoadToken(this: XMLHttpRequest) {
                  if (this.status >= 400) {
                    console.warn('failed to load token', this.status, this.responseText)
                    reject(originalError)
                    return
                  }
                  const token = this.responseText.trim()
                  // We have a token! attempt to open a WebSocket again.
                  const newUri = `${uri}?rtspwssession=${token}`
                  const ws2 = new WebSocket(newUri, protocol)
                  ws2.binaryType = 'arraybuffer'
                  ws2.onerror = (err) => {
                    reject(err)
                  }
                  ws2.onopen = () => resolve(ws2)
                }
                const request = new XMLHttpRequest()
                request.addEventListener('load', onLoadToken)
                request.addEventListener('error', (err) => {
                  console.warn('failed to get token')
                  reject(err)
                })
                request.addEventListener('abort', () => reject(originalError))
                request.open('GET', `${tokenUri}?${Date.now()}`)
                try {
                  request.send()
                } catch (error) {
                  reject(originalError)
                }
        */
      };

      ws.onopen = () => {
        clearTimeout(countdown);
        resolve(ws);
      };
    } catch (e) {
      reject(e);
    }
  });
};

/***/ }),

/***/ "./lib/pipelines/html5-canvas-metadata-pipeline-extended.ts":
/*!******************************************************************!*\
  !*** ./lib/pipelines/html5-canvas-metadata-pipeline-extended.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5CanvasMetadataPipelineExtended: () => (/* binding */ Html5CanvasMetadataPipelineExtended)
/* harmony export */ });
/* harmony import */ var _components_onvifdepay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/onvifdepay */ "./lib/components/onvifdepay/index.ts");
/* harmony import */ var _components_sdp_updater__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/sdp-updater */ "./lib/components/sdp-updater/index.ts");
/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/component */ "./lib/components/component.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_customdepay__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/customdepay */ "./lib/components/customdepay/index.ts");
/* harmony import */ var _components_streaminfo__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/streaminfo */ "./lib/components/streaminfo/index.ts");
/* harmony import */ var _html5_canvas_pipeline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./html5-canvas-pipeline */ "./lib/pipelines/html5-canvas-pipeline.ts");
/* harmony import */ var _components_jpegdepay__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/jpegdepay */ "./lib/components/jpegdepay/index.ts");








/**
 * Pipeline that can receive H264/AAC video over RTP
 * over WebSocket and pass it to a video element.
 * Additionally, this pipeline passes XML metadata sent
 * in the same stream to a handler.
 */
class Html5CanvasMetadataPipelineExtended extends _html5_canvas_pipeline__WEBPACK_IMPORTED_MODULE_6__.Html5CanvasPipeline {
  constructor(config) {
    const {
      metadataHandler,
      metadataType,
      picinfoHandler,
      streaminfoHandler,
      seiinfoHandler
    } = config;
    let dbg = debug__WEBPACK_IMPORTED_MODULE_3___default()('msl:canvas-pipeline-extended');
    super(config);
    if ((metadataType || '').toLowerCase() === 'onvif') {
      dbg('using onvif metadata');
      this.insertAfter(this.rtsp, new _components_onvifdepay__WEBPACK_IMPORTED_MODULE_0__.ONVIFDepay(metadataHandler));
    } else if ((metadataType || '').toLowerCase() === 'bosch') {
      dbg('using bosch metadata');
      this.insertAfter(this.rtsp, new _components_customdepay__WEBPACK_IMPORTED_MODULE_4__.CustomDepay(metadataHandler, 'VND.BOSCH.METADATA'));
    }
    if (picinfoHandler) {
      this.insertAfter(this.rtsp, new _components_customdepay__WEBPACK_IMPORTED_MODULE_4__.CustomDepay(picinfoHandler, null, 97));
    } else {
      dbg('no picinfo handler');
    }
    const sdpupdater = new _components_sdp_updater__WEBPACK_IMPORTED_MODULE_1__.SDPUpdater();
    let depay = this.findComponent(_components_jpegdepay__WEBPACK_IMPORTED_MODULE_7__.JPEGDepay);
    if (depay != null && depay instanceof _components_component__WEBPACK_IMPORTED_MODULE_2__.Tube) this.insertBefore(depay, sdpupdater);
    if (streaminfoHandler || seiinfoHandler) {
      if (depay != null && depay instanceof _components_component__WEBPACK_IMPORTED_MODULE_2__.Tube) {
        this.insertAfter(depay, new _components_streaminfo__WEBPACK_IMPORTED_MODULE_5__.StreamInfo(streaminfoHandler, seiinfoHandler));
      }
    }

    // this.listComponents()
  }

  findComponent(cls) {
    let c = this.firstComponent;
    if (c instanceof cls) return c;
    while (c.next != null) {
      c = c.next;
      if (c instanceof cls) return c;
    }
    return null;
  }
  listComponents() {
    let c = this.firstComponent;
    console.log('first: ', c);
    while (c.next != null) {
      c = c.next;
      console.log(typeof c, c);
    }
  }
}

/***/ }),

/***/ "./lib/pipelines/html5-canvas-pipeline.ts":
/*!************************************************!*\
  !*** ./lib/pipelines/html5-canvas-pipeline.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5CanvasPipeline: () => (/* binding */ Html5CanvasPipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_mjpeg_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-mjpeg-pipeline */ "./lib/pipelines/rtsp-mjpeg-pipeline.ts");
/* harmony import */ var _components_canvas__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/canvas */ "./lib/components/canvas/index.ts");
/* harmony import */ var _components_ws_source__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _components_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/auth */ "./lib/components/auth/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




/**
 * Pipeline that can receive Motion JPEG over RTP over WebSocket
 * and display it on a canvas.
 *
 * Handlers that can be set on the pipeline:
 * - onCanplay: called when the first frame is ready, at this point
 *   you can call the play method to start playback.
 *   Note: the default is to autoplay, so call .pause() inside
 *   your onCanplay function if you want to prevent this.
 * - onSync: called when UNIX time (milliseconds) is available
 *   for the start of the presentation.
 *
 * @class Html5CanvasPipeline
 * @extends {RtspMjpegPipeline}
 */
class Html5CanvasPipeline extends _rtsp_mjpeg_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspMjpegPipeline {
  /**
   * Creates an instance of Html5CanvasPipeline.
   * @param {any} [config={}] Component options
   * @memberof Html5CanvasPipeline
   */
  constructor(config) {
    const {
      ws: wsConfig,
      rtsp: rtspConfig,
      mediaElement,
      auth: authConfig
    } = config;
    super(rtspConfig);
    _defineProperty(this, "onCanplay", void 0);
    _defineProperty(this, "onSync", void 0);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "_src", void 0);
    _defineProperty(this, "_sink", void 0);
    if (authConfig) {
      const auth = new _components_auth__WEBPACK_IMPORTED_MODULE_3__.Auth(authConfig);
      this.insertBefore(this.rtsp, auth);
    }
    const canvasSink = new _components_canvas__WEBPACK_IMPORTED_MODULE_1__.CanvasSink(mediaElement);
    canvasSink.onCanplay = () => {
      canvasSink.play();
      this.onCanplay && this.onCanplay();
    };
    canvasSink.onSync = ntpPresentationTime => {
      this.onSync && this.onSync(ntpPresentationTime);
    };
    this.append(canvasSink);
    this._sink = canvasSink;
    const waitForWs = _components_ws_source__WEBPACK_IMPORTED_MODULE_2__.WSSource.open(wsConfig);
    this.ready = waitForWs.then(wsSource => {
      wsSource.onServerClose = () => {
        this.onServerClose && this.onServerClose();
      };
      this.prepend(wsSource);
      this._src = wsSource;
    });
  }
  close() {
    this._src && this._src.outgoing.end();
  }
  get currentTime() {
    return this._sink.currentTime;
  }
  play() {
    return this._sink.play();
  }
  pause() {
    return this._sink.pause();
  }
  get bitrate() {
    return this._sink.bitrate;
  }
  get framerate() {
    return this._sink.framerate;
  }
}

/***/ }),

/***/ "./lib/pipelines/html5-video-metadata-pipeline-extended.ts":
/*!*****************************************************************!*\
  !*** ./lib/pipelines/html5-video-metadata-pipeline-extended.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5VideoMetadataPipelineExtended: () => (/* binding */ Html5VideoMetadataPipelineExtended)
/* harmony export */ });
/* harmony import */ var _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./html5-video-pipeline */ "./lib/pipelines/html5-video-pipeline.ts");
/* harmony import */ var _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/onvifdepay */ "./lib/components/onvifdepay/index.ts");
/* harmony import */ var _components_sdp_updater__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/sdp-updater */ "./lib/components/sdp-updater/index.ts");
/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/component */ "./lib/components/component.ts");
/* harmony import */ var _components_mp4muxer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/mp4muxer */ "./lib/components/mp4muxer/index.ts");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js");
/* harmony import */ var debug__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(debug__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _components_customdepay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/customdepay */ "./lib/components/customdepay/index.ts");
/* harmony import */ var _components_streaminfo__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/streaminfo */ "./lib/components/streaminfo/index.ts");








/**
 * Pipeline that can receive H264/AAC video over RTP
 * over WebSocket and pass it to a video element.
 * Additionally, this pipeline passes XML metadata sent
 * in the same stream to a handler.
 */
class Html5VideoMetadataPipelineExtended extends _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_0__.Html5VideoPipeline {
  constructor(config) {
    const {
      metadataHandler,
      metadataType,
      picinfoHandler,
      streaminfoHandler,
      seiinfoHandler,
      timestampJumpFactor,
      socketClosedHandler
    } = config;
    const dbg = debug__WEBPACK_IMPORTED_MODULE_5___default()('msl:video-pipeline-extended');
    super(config);
    this.onSocketClose = e => {
      dbg("socket close received: %o", e);
      if (socketClosedHandler) {
        socketClosedHandler(e);
      }
    };
    if ((metadataType || '').toLowerCase() === 'onvif') {
      dbg('using onvif metadata');
      this.insertAfter(this.rtsp, new _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__.ONVIFDepay(metadataHandler));
    } else if ((metadataType || '').toLowerCase() === 'bosch') {
      dbg('using bosch metadata');
      this.insertAfter(this.rtsp, new _components_customdepay__WEBPACK_IMPORTED_MODULE_6__.CustomDepay(metadataHandler, 'VND.BOSCH.METADATA'));
    }
    if (picinfoHandler) {
      this.insertAfter(this.rtsp, new _components_customdepay__WEBPACK_IMPORTED_MODULE_6__.CustomDepay(picinfoHandler, null, 97));
    } else {
      dbg('no picinfo handler');
    }
    const sdpupdater = new _components_sdp_updater__WEBPACK_IMPORTED_MODULE_2__.SDPUpdater();
    const muxer = this.findComponent(_components_mp4muxer__WEBPACK_IMPORTED_MODULE_4__.Mp4Muxer);
    if (muxer != null && muxer instanceof _components_component__WEBPACK_IMPORTED_MODULE_3__.Tube) this.insertBefore(muxer, sdpupdater);
    if (streaminfoHandler || seiinfoHandler) {
      if (muxer != null && muxer instanceof _components_component__WEBPACK_IMPORTED_MODULE_3__.Tube) {
        this.insertAfter(muxer, new _components_streaminfo__WEBPACK_IMPORTED_MODULE_7__.StreamInfo(streaminfoHandler, seiinfoHandler));
      }
    }

    // this.listComponents()
  }

  findComponent(cls) {
    let c = this.firstComponent;
    if (c instanceof cls) return c;
    while (c.next != null) {
      c = c.next;
      if (c instanceof cls) return c;
    }
    return null;
  }
  listComponents() {
    let c = this.firstComponent;
    console.log('first: ', c);
    while (c.next != null) {
      c = c.next;
      console.log(typeof c, c);
    }
  }
}

/***/ }),

/***/ "./lib/pipelines/html5-video-metadata-pipeline.ts":
/*!********************************************************!*\
  !*** ./lib/pipelines/html5-video-metadata-pipeline.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5VideoMetadataPipeline: () => (/* binding */ Html5VideoMetadataPipeline)
/* harmony export */ });
/* harmony import */ var _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./html5-video-pipeline */ "./lib/pipelines/html5-video-pipeline.ts");
/* harmony import */ var _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/onvifdepay */ "./lib/components/onvifdepay/index.ts");
/* harmony import */ var _components_message__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/message */ "./lib/components/message.ts");
/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/component */ "./lib/components/component.ts");




/**
 * Pipeline that can receive H264/AAC video over RTP
 * over WebSocket and pass it to a video element.
 * Additionally, this pipeline passes XML metadata sent
 * in the same stream to a handler.
 */
class Html5VideoMetadataPipeline extends _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_0__.Html5VideoPipeline {
  constructor(config) {
    const {
      metadataHandler
    } = config;
    super(config);
    const onvifDepay = new _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__.ONVIFDepay();
    this.insertAfter(this.rtsp, onvifDepay);
    const onvifHandlerPipe = _components_component__WEBPACK_IMPORTED_MODULE_3__.Tube.fromHandlers(msg => {
      if (msg.type === _components_message__WEBPACK_IMPORTED_MODULE_2__.MessageType.XML) {
        metadataHandler(msg);
      }
    }, undefined);
    this.insertAfter(onvifDepay, onvifHandlerPipe);
  }
}

/***/ }),

/***/ "./lib/pipelines/html5-video-pipeline-http.ts":
/*!****************************************************!*\
  !*** ./lib/pipelines/html5-video-pipeline-http.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5VideoPipeline_HTTP: () => (/* binding */ Html5VideoPipeline_HTTP)
/* harmony export */ });
/* harmony import */ var _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-mp4-pipeline */ "./lib/pipelines/rtsp-mp4-pipeline.ts");
/* harmony import */ var _components_mse__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/mse */ "./lib/components/mse/index.ts");
/* harmony import */ var _components_http_tunnel_source__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/http-tunnel-source */ "./lib/components/http-tunnel-source/index.ts");
/* harmony import */ var _components_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/auth */ "./lib/components/auth/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




/**
 * Pipeline that can receive H264/AAC video over RTP
 * over WebSocket and pass it to a video element.
 *
 * @class Html5VideoPipeline
 * @extends {RtspMp4Pipeline}
 */
class Html5VideoPipeline_HTTP extends _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspMp4Pipeline {
  /**
   * Creates an instance of Html5VideoPipeline.
   * @param {any} [config={}] Component options
   * @memberof Html5VideoPipeline
   */
  constructor(config) {
    const {
      ws: http_Tunnel_Config,
      rtsp: rtspConfig,
      mediaElement,
      auth: authConfig
    } = config;
    super(rtspConfig);
    _defineProperty(this, "onDataCallback", void 0);
    _defineProperty(this, "onSourceOpen", void 0);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "tracks", void 0);
    _defineProperty(this, "_src", void 0);
    _defineProperty(this, "_sink", void 0);
    if (authConfig) {
      const auth = new _components_auth__WEBPACK_IMPORTED_MODULE_3__.Auth(authConfig);
      this.insertBefore(this.rtsp, auth);
    }
    const mseSink = new _components_mse__WEBPACK_IMPORTED_MODULE_1__.MseSink(mediaElement);
    mseSink.onSourceOpen = (mse, tracks) => {
      this.tracks = tracks;
      this.onSourceOpen && this.onSourceOpen(mse, tracks);
    };
    mseSink.onDataCallback = msg => {
      this.onDataCallback && this.onDataCallback(msg);
    };
    this.append(mseSink);
    this._sink = mseSink;
    if (http_Tunnel_Config) {
      const waitForWs = _components_http_tunnel_source__WEBPACK_IMPORTED_MODULE_2__.HTTPTunnelSource.open(http_Tunnel_Config);
      this.ready = waitForWs.then(httpTunnnelSource => {
        httpTunnnelSource.onServerClose = () => {
          this.onServerClose && this.onServerClose();
        };
        this.prepend(httpTunnnelSource);
        this._src = httpTunnnelSource;
      });
    }
  }
  close() {
    this._src && this._src.outgoing.end();
  }
  get currentTime() {
    return this._sink.currentTime;
  }
  play() {
    return this._sink.play();
  }
  pause() {
    return this._sink.pause();
  }
}

/***/ }),

/***/ "./lib/pipelines/html5-video-pipeline.ts":
/*!***********************************************!*\
  !*** ./lib/pipelines/html5-video-pipeline.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5VideoPipeline: () => (/* binding */ Html5VideoPipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-mp4-pipeline */ "./lib/pipelines/rtsp-mp4-pipeline.ts");
/* harmony import */ var _components_mse__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/mse */ "./lib/components/mse/index.ts");
/* harmony import */ var _components_ws_source__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _components_auth__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/auth */ "./lib/components/auth/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




/**
 * Pipeline that can receive H264/AAC video over RTP
 * over WebSocket and pass it to a video element.
 *
 * @class Html5VideoPipeline
 * @extends {RtspMp4Pipeline}
 */
class Html5VideoPipeline extends _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspMp4Pipeline {
  /**
   * Creates an instance of Html5VideoPipeline.
   * @param {any} [config={}] Component options
   * @memberof Html5VideoPipeline
   */
  constructor(config) {
    const {
      ws: wsConfig,
      rtsp: rtspConfig,
      mediaElement,
      auth: authConfig
    } = config;
    super(rtspConfig);
    _defineProperty(this, "onSourceOpen", void 0);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "onSocketClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "_src", void 0);
    _defineProperty(this, "_sink", void 0);
    if (authConfig) {
      const auth = new _components_auth__WEBPACK_IMPORTED_MODULE_3__.Auth(authConfig);
      this.insertBefore(this.rtsp, auth);
    }
    const mseSink = new _components_mse__WEBPACK_IMPORTED_MODULE_1__.MseSink(mediaElement);
    mseSink.onSourceOpen = (mse, tracks) => {
      this.onSourceOpen && this.onSourceOpen(mse, tracks);
    };
    this.append(mseSink);
    this._sink = mseSink;
    const waitForWs = _components_ws_source__WEBPACK_IMPORTED_MODULE_2__.WSSource.open(wsConfig);
    this.ready = waitForWs.then(wsSource => {
      wsSource.onServerClose = () => {
        this.onServerClose && this.onServerClose();
      };
      wsSource.onSocketClose = e => {
        this.onSocketClose && this.onSocketClose(e);
      };
      this.prepend(wsSource);
      this._src = wsSource;
    });
  }
  close() {
    this._src && this._src.outgoing.end();
  }
  get currentTime() {
    return this._sink.currentTime;
  }
  play() {
    return this._sink.play();
  }
  pause() {
    return this._sink.pause();
  }
}

/***/ }),

/***/ "./lib/pipelines/http-mse-pipeline.ts":
/*!********************************************!*\
  !*** ./lib/pipelines/http-mse-pipeline.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HttpMsePipeline: () => (/* binding */ HttpMsePipeline)
/* harmony export */ });
/* harmony import */ var _pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pipeline */ "./lib/pipelines/pipeline.ts");
/* harmony import */ var _components_http_source__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/http-source */ "./lib/components/http-source/index.ts");
/* harmony import */ var _components_mse__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/mse */ "./lib/components/mse/index.ts");
/* harmony import */ var _components_mp4_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/mp4-parser */ "./lib/components/mp4-parser/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




class HttpMsePipeline extends _pipeline__WEBPACK_IMPORTED_MODULE_0__.Pipeline {
  constructor(config) {
    const {
      http: httpConfig,
      mediaElement
    } = config;
    const httpSource = new _components_http_source__WEBPACK_IMPORTED_MODULE_1__.HttpSource(httpConfig);
    const mp4Parser = new _components_mp4_parser__WEBPACK_IMPORTED_MODULE_3__.Mp4Parser();
    const mseSink = new _components_mse__WEBPACK_IMPORTED_MODULE_2__.MseSink(mediaElement);
    super(httpSource, mp4Parser, mseSink);

    // Expose session for external use
    _defineProperty(this, "http", void 0);
    this.http = httpSource;
  }
}

/***/ }),

/***/ "./lib/pipelines/index.browser.ts":
/*!****************************************!*\
  !*** ./lib/pipelines/index.browser.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Html5CanvasMetadataPipelineExtended: () => (/* reexport safe */ _html5_canvas_metadata_pipeline_extended__WEBPACK_IMPORTED_MODULE_5__.Html5CanvasMetadataPipelineExtended),
/* harmony export */   Html5CanvasPipeline: () => (/* reexport safe */ _html5_canvas_pipeline__WEBPACK_IMPORTED_MODULE_4__.Html5CanvasPipeline),
/* harmony export */   Html5VideoMetadataPipeline: () => (/* reexport safe */ _html5_video_metadata_pipeline__WEBPACK_IMPORTED_MODULE_8__.Html5VideoMetadataPipeline),
/* harmony export */   Html5VideoMetadataPipelineExtended: () => (/* reexport safe */ _html5_video_metadata_pipeline_extended__WEBPACK_IMPORTED_MODULE_9__.Html5VideoMetadataPipelineExtended),
/* harmony export */   Html5VideoPipeline: () => (/* reexport safe */ _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_6__.Html5VideoPipeline),
/* harmony export */   Html5VideoPipeline_HTTP: () => (/* reexport safe */ _html5_video_pipeline_http__WEBPACK_IMPORTED_MODULE_7__.Html5VideoPipeline_HTTP),
/* harmony export */   HttpMsePipeline: () => (/* reexport safe */ _http_mse_pipeline__WEBPACK_IMPORTED_MODULE_13__.HttpMsePipeline),
/* harmony export */   MetadataPipeline: () => (/* reexport safe */ _metadata_pipeline__WEBPACK_IMPORTED_MODULE_10__.MetadataPipeline),
/* harmony export */   Pipeline: () => (/* reexport safe */ _pipeline__WEBPACK_IMPORTED_MODULE_0__.Pipeline),
/* harmony export */   RtspDecoderPipeline: () => (/* reexport safe */ _rtsp_decoder_pipeline__WEBPACK_IMPORTED_MODULE_11__.RtspDecoderPipeline),
/* harmony export */   RtspMjpegPipeline: () => (/* reexport safe */ _rtsp_mjpeg_pipeline__WEBPACK_IMPORTED_MODULE_3__.RtspMjpegPipeline),
/* harmony export */   RtspMp4Pipeline: () => (/* reexport safe */ _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_2__.RtspMp4Pipeline),
/* harmony export */   RtspPipeline: () => (/* reexport safe */ _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_1__.RtspPipeline),
/* harmony export */   WsSdpPipeline: () => (/* reexport safe */ _ws_sdp_pipeline__WEBPACK_IMPORTED_MODULE_12__.WsSdpPipeline)
/* harmony export */ });
/* harmony import */ var _pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pipeline */ "./lib/pipelines/pipeline.ts");
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
/* harmony import */ var _rtsp_mp4_pipeline__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./rtsp-mp4-pipeline */ "./lib/pipelines/rtsp-mp4-pipeline.ts");
/* harmony import */ var _rtsp_mjpeg_pipeline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rtsp-mjpeg-pipeline */ "./lib/pipelines/rtsp-mjpeg-pipeline.ts");
/* harmony import */ var _html5_canvas_pipeline__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./html5-canvas-pipeline */ "./lib/pipelines/html5-canvas-pipeline.ts");
/* harmony import */ var _html5_canvas_metadata_pipeline_extended__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./html5-canvas-metadata-pipeline-extended */ "./lib/pipelines/html5-canvas-metadata-pipeline-extended.ts");
/* harmony import */ var _html5_video_pipeline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./html5-video-pipeline */ "./lib/pipelines/html5-video-pipeline.ts");
/* harmony import */ var _html5_video_pipeline_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./html5-video-pipeline-http */ "./lib/pipelines/html5-video-pipeline-http.ts");
/* harmony import */ var _html5_video_metadata_pipeline__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./html5-video-metadata-pipeline */ "./lib/pipelines/html5-video-metadata-pipeline.ts");
/* harmony import */ var _html5_video_metadata_pipeline_extended__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./html5-video-metadata-pipeline-extended */ "./lib/pipelines/html5-video-metadata-pipeline-extended.ts");
/* harmony import */ var _metadata_pipeline__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./metadata-pipeline */ "./lib/pipelines/metadata-pipeline.ts");
/* harmony import */ var _rtsp_decoder_pipeline__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./rtsp-decoder-pipeline */ "./lib/pipelines/rtsp-decoder-pipeline.ts");
/* harmony import */ var _ws_sdp_pipeline__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ws-sdp-pipeline */ "./lib/pipelines/ws-sdp-pipeline.ts");
/* harmony import */ var _http_mse_pipeline__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./http-mse-pipeline */ "./lib/pipelines/http-mse-pipeline.ts");















/***/ }),

/***/ "./lib/pipelines/metadata-pipeline.ts":
/*!********************************************!*\
  !*** ./lib/pipelines/metadata-pipeline.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MetadataPipeline: () => (/* binding */ MetadataPipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
/* harmony import */ var _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/onvifdepay */ "./lib/components/onvifdepay/index.ts");
/* harmony import */ var _components_ws_source__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _components_message__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/message */ "./lib/components/message.ts");
/* harmony import */ var _components_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/component */ "./lib/components/component.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }






// Default configuration for XML event stream
const DEFAULT_RTSP_PARAMETERS = {
  parameters: ['audio=0', 'video=0', 'event=on', 'ptz=all']
};
/**
 * Pipeline that can receive XML metadata over RTP
 * over WebSocket and pass it to a handler.
 */
class MetadataPipeline extends _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspPipeline {
  constructor(config) {
    const {
      ws: wsConfig,
      rtsp: rtspConfig,
      metadataHandler
    } = config;
    super(Object.assign({}, DEFAULT_RTSP_PARAMETERS, rtspConfig));
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "_src", void 0);
    const onvifDepay = new _components_onvifdepay__WEBPACK_IMPORTED_MODULE_1__.ONVIFDepay();
    this.append(onvifDepay);
    const handlerSink = _components_component__WEBPACK_IMPORTED_MODULE_4__.Sink.fromHandler(msg => {
      if (msg.type === _components_message__WEBPACK_IMPORTED_MODULE_3__.MessageType.XML) {
        metadataHandler(msg);
      }
    });
    this.append(handlerSink);
    const waitForWs = _components_ws_source__WEBPACK_IMPORTED_MODULE_2__.WSSource.open(wsConfig);
    this.ready = waitForWs.then(wsSource => {
      wsSource.onServerClose = () => {
        this.onServerClose && this.onServerClose();
      };
      this.prepend(wsSource);
      this._src = wsSource;
    });
  }
  close() {
    this._src && this._src.outgoing.end();
  }
}

/***/ }),

/***/ "./lib/pipelines/pipeline.ts":
/*!***********************************!*\
  !*** ./lib/pipelines/pipeline.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pipeline: () => (/* binding */ Pipeline)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
class Pipeline {
  /**
   * Create a pipeline which is a linked list of components.
   * Works naturally with only a single component.
   * A set keeps track of which components the pipeline contains,
   * while any order is completely determined by the component's
   * connectedness.
   * @param {Array} components The components of the pipeline in order.
   */
  constructor(...components) {
    _defineProperty(this, "firstComponent", void 0);
    _defineProperty(this, "lastComponent", void 0);
    _defineProperty(this, "_set", void 0);
    const [car, ...cdr] = components;
    this._set = new Set(components);
    this.firstComponent = car;
    this.lastComponent = cdr.reduce((last, component) => {
      return last.connect(component);
    }, car);
  }
  init(...components) {
    const [car, ...cdr] = components;
    this._set = new Set(components);
    this.firstComponent = car;
    this.lastComponent = cdr.reduce((last, component) => {
      return last.connect(component);
    }, car);
  }
  insertAfter(component, newComponent) {
    if (!this._set.has(component)) {
      throw new Error('insertion point not part of pipeline');
    }
    if (this._set.has(newComponent)) {
      throw new Error('new component already in the pipeline');
    }
    const cdr = component.next;
    if (cdr === null) {
      component.connect(newComponent);
      this.lastComponent = newComponent;
    } else {
      component.disconnect();
      component.connect(newComponent).connect(cdr);
    }
    this._set.add(newComponent);
    return this;
  }
  insertBefore(component, newComponent) {
    if (!this._set.has(component)) {
      throw new Error('insertion point not part of pipeline');
    }
    if (this._set.has(newComponent)) {
      throw new Error('new component already in the pipeline');
    }
    const car = component.prev;
    if (car === null) {
      newComponent.connect(component);
      this.firstComponent = newComponent;
    } else {
      car.disconnect();
      car.connect(newComponent).connect(component);
    }
    this._set.add(newComponent);
    return this;
  }
  remove(component) {
    if (!this._set.has(component)) {
      throw new Error('component not part of pipeline');
    }
    const car = component.prev;
    const cdr = component.next;
    if (car === null && cdr === null) {
      throw new Error('cannot remove last component');
    } else if (car === null && cdr !== null) {
      component.disconnect();
      this.firstComponent = cdr;
    } else if (car !== null && cdr === null) {
      car.disconnect();
      this.lastComponent = car;
    } else if (car !== null && cdr !== null) {
      car.disconnect();
      component.disconnect();
      car.connect(cdr);
    }
    this._set.delete(component);
    return this;
  }
  append(...components) {
    components.forEach(component => {
      this.insertAfter(this.lastComponent, component);
    });
    return this;
  }
  prepend(...components) {
    components.forEach(component => {
      this.insertBefore(this.firstComponent, component);
    });
    return this;
  }
}

/***/ }),

/***/ "./lib/pipelines/rtsp-decoder-pipeline.ts":
/*!************************************************!*\
  !*** ./lib/pipelines/rtsp-decoder-pipeline.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RtspDecoderPipeline: () => (/* binding */ RtspDecoderPipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
/* harmony import */ var _components_h264depay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/h264depay */ "./lib/components/h264depay/index.ts");
/* harmony import */ var _components_aacdepay__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/aacdepay */ "./lib/components/aacdepay/index.ts");
/* harmony import */ var _components_ws_source__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _components_webcodecsdecoder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/webcodecsdecoder */ "./lib/components/webcodecsdecoder/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





class RtspDecoderPipeline extends _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspPipeline {
  constructor(config) {
    const {
      ws: wsConfig,
      rtsp: rtspConfig,
      canvasElement
    } = config;
    super(rtspConfig);
    _defineProperty(this, "onSourceOpen", void 0);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "onSocketClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "_src", void 0);
    const h264Depay = new _components_h264depay__WEBPACK_IMPORTED_MODULE_1__.H264Depay();
    const aacDepay = new _components_aacdepay__WEBPACK_IMPORTED_MODULE_2__.AACDepay();
    const decoder = new _components_webcodecsdecoder__WEBPACK_IMPORTED_MODULE_4__.WebCodecsDecoder(canvasElement);
    this.append(h264Depay, aacDepay, decoder);
    const waitForWs = _components_ws_source__WEBPACK_IMPORTED_MODULE_3__.WSSource.open(wsConfig);
    this.ready = waitForWs.then(wsSource => {
      wsSource.onServerClose = () => {
        this.onServerClose && this.onServerClose();
      };
      wsSource.onSocketClose = e => {
        this.onSocketClose && this.onSocketClose(e);
      };
      this.prepend(wsSource);
      this._src = wsSource;
    });
  }
  close() {
    this._src && this._src.outgoing.end();
  }
}

/***/ }),

/***/ "./lib/pipelines/rtsp-mjpeg-pipeline.ts":
/*!**********************************************!*\
  !*** ./lib/pipelines/rtsp-mjpeg-pipeline.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RtspMjpegPipeline: () => (/* binding */ RtspMjpegPipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
/* harmony import */ var _components_jpegdepay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/jpegdepay */ "./lib/components/jpegdepay/index.ts");



/**
 * A pipeline that deals with JPEG encoded video
 * sent over RTP, and converts it to motion JPEG
 * format.
 */
class RtspMjpegPipeline extends _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspPipeline {
  constructor(rtspConfig) {
    super(rtspConfig);
    const jpegDepay = new _components_jpegdepay__WEBPACK_IMPORTED_MODULE_1__.JPEGDepay();
    this.append(jpegDepay);
  }
}

/***/ }),

/***/ "./lib/pipelines/rtsp-mp4-pipeline.ts":
/*!********************************************!*\
  !*** ./lib/pipelines/rtsp-mp4-pipeline.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RtspMp4Pipeline: () => (/* binding */ RtspMp4Pipeline)
/* harmony export */ });
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
/* harmony import */ var _components_h264depay__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/h264depay */ "./lib/components/h264depay/index.ts");
/* harmony import */ var _components_aacdepay__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/aacdepay */ "./lib/components/aacdepay/index.ts");
/* harmony import */ var _components_mp4muxer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/mp4muxer */ "./lib/components/mp4muxer/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





/**
 * A pipeline that deals with H264/AAC encoded video
 * sent over RTP, and converts it to streaming MP4
 * format.
 *
 * The following handlers can be defined:
 * - onSync: called when the NTP time of the first frame
 *           is known, with the timestamp as argument
 *           (the timestamp is UNIX milliseconds)
 */
class RtspMp4Pipeline extends _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_0__.RtspPipeline {
  constructor(rtspConfig) {
    super(rtspConfig);
    _defineProperty(this, "onSync", void 0);
    _defineProperty(this, "_mp4Muxer", void 0);
    const h264Depay = new _components_h264depay__WEBPACK_IMPORTED_MODULE_1__.H264Depay();
    const aacDepay = new _components_aacdepay__WEBPACK_IMPORTED_MODULE_2__.AACDepay();
    const mp4Muxer = new _components_mp4muxer__WEBPACK_IMPORTED_MODULE_3__.Mp4Muxer();
    mp4Muxer.onSync = ntpPresentationTime => {
      this.onSync && this.onSync(ntpPresentationTime);
    };
    this.append(h264Depay, aacDepay, mp4Muxer);
    this._mp4Muxer = mp4Muxer;
  }
  get bitrate() {
    return this._mp4Muxer.bitrate;
  }
  get framerate() {
    return this._mp4Muxer.framerate;
  }
}

/***/ }),

/***/ "./lib/pipelines/rtsp-pipeline.ts":
/*!****************************************!*\
  !*** ./lib/pipelines/rtsp-pipeline.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RtspPipeline: () => (/* binding */ RtspPipeline)
/* harmony export */ });
/* harmony import */ var _pipeline__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pipeline */ "./lib/pipelines/pipeline.ts");
/* harmony import */ var _components_rtsp_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/rtsp-parser */ "./lib/components/rtsp-parser/index.ts");
/* harmony import */ var _components_rtsp_session__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/rtsp-session */ "./lib/components/rtsp-session/index.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }



/**
 * A pipeline that converts interleaved RTSP/RTP
 * into a series of RTP, RTCP, and RTSP packets.
 * The pipeline exposes the RTSP session component
 * as `this.session`, and wraps its play, pause
 * and stop methods.
 *
 * The following handlers can be defined:
 * - onSdp: called when the session descript protocol
 *          is available, with the SDP object as argument
 * - onPlay: called when a response from the PLAY command
 *           arrives, with the play range as argument
 */
class RtspPipeline extends _pipeline__WEBPACK_IMPORTED_MODULE_0__.Pipeline {
  constructor(rtspConfig) {
    const rtspParser = new _components_rtsp_parser__WEBPACK_IMPORTED_MODULE_1__.RtspParser();
    const rtspSession = new _components_rtsp_session__WEBPACK_IMPORTED_MODULE_2__.RtspSession(rtspConfig);
    rtspSession.onSdp = sdp => {
      this.onSdp && this.onSdp(sdp);
    };
    rtspSession.onPlay = range => {
      this.onPlay && this.onPlay(range);
    };
    super(rtspParser, rtspSession);

    // Expose session for external use
    _defineProperty(this, "onSdp", void 0);
    _defineProperty(this, "onPlay", void 0);
    _defineProperty(this, "rtsp", void 0);
    this.rtsp = rtspSession;
  }
}

/***/ }),

/***/ "./lib/pipelines/ws-sdp-pipeline.ts":
/*!******************************************!*\
  !*** ./lib/pipelines/ws-sdp-pipeline.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WsSdpPipeline: () => (/* binding */ WsSdpPipeline)
/* harmony export */ });
/* harmony import */ var _components_rtsp_session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../components/rtsp-session */ "./lib/components/rtsp-session/index.ts");
/* harmony import */ var _components_ws_source__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../components/ws-source */ "./lib/components/ws-source/index.ts");
/* harmony import */ var _components_auth__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/auth */ "./lib/components/auth/index.ts");
/* harmony import */ var _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./rtsp-pipeline */ "./lib/pipelines/rtsp-pipeline.ts");
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }




/**
 * Pipeline that can receive the SDP object for an RTS stream.
 *
 * @class WsSdpPipeline
 * @extends {RtspPipeline}
 */
class WsSdpPipeline extends _rtsp_pipeline__WEBPACK_IMPORTED_MODULE_3__.RtspPipeline {
  /**
   * Creates an instance of Html5VideoPipeline.
   * @param {any} [config={}] Component options
   * @memberof Html5VideoPipeline
   */
  constructor(config) {
    const {
      ws: wsConfig,
      rtsp: rtspConfig,
      auth: authConfig
    } = config;
    super(rtspConfig);
    _defineProperty(this, "onServerClose", void 0);
    _defineProperty(this, "ready", void 0);
    _defineProperty(this, "_src", void 0);
    if (authConfig) {
      const auth = new _components_auth__WEBPACK_IMPORTED_MODULE_2__.Auth(authConfig);
      this.insertBefore(this.rtsp, auth);
    }
    const waitForWs = _components_ws_source__WEBPACK_IMPORTED_MODULE_1__.WSSource.open(wsConfig);
    this.ready = waitForWs.then(wsSource => {
      wsSource.onServerClose = () => {
        this.onServerClose && this.onServerClose();
      };
      this.prepend(wsSource);
      this._src = wsSource;
    });
  }
  close() {
    this._src && this._src.outgoing.end();
  }
  get sdp() {
    return this.ready.then(() => {
      const sdpPromise = new Promise(resolve => {
        this.rtsp.onSdp = resolve;
      });
      this.rtsp.send({
        method: _components_rtsp_session__WEBPACK_IMPORTED_MODULE_0__.RTSP_METHOD.DESCRIBE
      });
      this.rtsp.send({
        method: _components_rtsp_session__WEBPACK_IMPORTED_MODULE_0__.RTSP_METHOD.TEARDOWN
      });
      return sdpPromise;
    });
  }
}

/***/ }),

/***/ "./lib/utils/base64.ts":
/*!*****************************!*\
  !*** ./lib/utils/base64.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   base64ToUInt8Array: () => (/* binding */ base64ToUInt8Array),
/* harmony export */   uint8ArrToBase64: () => (/* binding */ uint8ArrToBase64)
/* harmony export */ });
function uint8ArrToBase64(a) {
  return window.btoa(Array.from(a).map(function (val) {
    return String.fromCharCode(val);
  }).join(''));
}
function base64ToUInt8Array(s) {
  return new Uint8Array(window.atob(s).split('').map(function (char) {
    return char.charCodeAt(0);
  }));
}

/***/ }),

/***/ "./lib/utils/bits.ts":
/*!***************************!*\
  !*** ./lib/utils/bits.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   POS: () => (/* binding */ POS)
/* harmony export */ });
const POS = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];

/***/ }),

/***/ "./lib/utils/clamp.ts":
/*!****************************!*\
  !*** ./lib/utils/clamp.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clamp: () => (/* binding */ clamp)
/* harmony export */ });
function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

/***/ }),

/***/ "./lib/utils/clock.ts":
/*!****************************!*\
  !*** ./lib/utils/clock.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Clock: () => (/* binding */ Clock)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Clock
 *
 * A simple timer to keep track of elapsed time,
 * which can be retrieved with the `now` method.
 * The clock is initially in a stopped state, during
 * which the elapsed time does not increase. When
 * started, the clock will return the total elapsed
 * time since the first start / last reset.
 *
 * As a convenience, start/stop are aliased as
 * play/pause, to mimic a media element (for use
 * as a playback clock). The `currentTime` getter
 * returns the elapsed time in seconds (floating
 * point), also as a convenienve to closely match
 * the behaviour of a video element.
 */
class Clock {
  constructor() {
    _defineProperty(this, "started", void 0);
    _defineProperty(this, "stopped", void 0);
    _defineProperty(this, "elapsed", void 0);
    this.elapsed = 0;
    this.started = 0;
    this.stopped = true;
  }
  start() {
    if (this.stopped) {
      this.started = window.performance.now();
      this.stopped = false;
    }
  }
  stop() {
    if (!this.stopped) {
      this.elapsed = this.now();
      this.stopped = true;
    }
  }
  reset() {
    this.elapsed = 0;
    this.started = 0;
    this.stopped = true;
  }

  // Gives the elapsed time in milliseconds since the
  // clock was first started (after last reset).
  now() {
    if (this.stopped) {
      return this.elapsed;
    } else {
      return this.elapsed + (window.performance.now() - this.started);
    }
  }
  play() {
    this.start();
  }
  pause() {
    this.stop();
  }

  // Gives the elapsed time in seconds since last reset.
  get currentTime() {
    return this.now() / 1000;
  }
}

/***/ }),

/***/ "./lib/utils/config.ts":
/*!*****************************!*\
  !*** ./lib/utils/config.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   merge: () => (/* binding */ merge)
/* harmony export */ });
/**
 * Flat merge of objects, ignoring undefined override values.
 * @param  {Object} template The object with default values
 * @param  {Object} override The object with override values.
 * @return {Object}          The template object with override merged in.
 */
const merge = (template, override) => {
  let cleanOverride;
  if (override !== undefined) {
    if (typeof override !== 'object') {
      throw new Error('merge expects override to be an object!');
    } else {
      cleanOverride = Object.keys(override).reduce((acc, key) => {
        if (override[key] !== undefined) {
          acc[key] = override[key];
        }
        return acc;
      }, {});
    }
  }
  return Object.assign({}, template, cleanOverride);
};

/***/ }),

/***/ "./lib/utils/index.browser.ts":
/*!************************************!*\
  !*** ./lib/utils/index.browser.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scheduler: () => (/* reexport safe */ _scheduler__WEBPACK_IMPORTED_MODULE_0__.Scheduler),
/* harmony export */   bodyOffset: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.bodyOffset),
/* harmony export */   cSrc: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.cSrc),
/* harmony export */   cSrcCount: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.cSrcCount),
/* harmony export */   connectionEnded: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.connectionEnded),
/* harmony export */   contentBase: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.contentBase),
/* harmony export */   extHeader: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.extHeader),
/* harmony export */   extHeaderLength: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.extHeaderLength),
/* harmony export */   extension: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.extension),
/* harmony export */   extractHeaderValue: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.extractHeaderValue),
/* harmony export */   extractURIs: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.extractURIs),
/* harmony export */   getJPEGResolutionFromExtHeader: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.getJPEGResolutionFromExtHeader),
/* harmony export */   getTime: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.getTime),
/* harmony export */   marker: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.marker),
/* harmony export */   messageFromBuffer: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.messageFromBuffer),
/* harmony export */   padding: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.padding),
/* harmony export */   parse: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.parse),
/* harmony export */   parseExtHeader: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.parseExtHeader),
/* harmony export */   payload: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.payload),
/* harmony export */   payloadType: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.payloadType),
/* harmony export */   range: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.range),
/* harmony export */   sSrc: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.sSrc),
/* harmony export */   sequence: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.sequence),
/* harmony export */   sequenceNumber: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.sequenceNumber),
/* harmony export */   sessionId: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.sessionId),
/* harmony export */   sessionTimeout: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.sessionTimeout),
/* harmony export */   statusCode: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.statusCode),
/* harmony export */   timestamp: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.timestamp),
/* harmony export */   version: () => (/* reexport safe */ _protocols__WEBPACK_IMPORTED_MODULE_1__.version)
/* harmony export */ });
/* harmony import */ var _scheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./scheduler */ "./lib/utils/scheduler.ts");
/* harmony import */ var _protocols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./protocols */ "./lib/utils/protocols/index.ts");



/***/ }),

/***/ "./lib/utils/protocols/index.ts":
/*!**************************************!*\
  !*** ./lib/utils/protocols/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bodyOffset: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.bodyOffset),
/* harmony export */   cSrc: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.cSrc),
/* harmony export */   cSrcCount: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.cSrcCount),
/* harmony export */   connectionEnded: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.connectionEnded),
/* harmony export */   contentBase: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.contentBase),
/* harmony export */   extHeader: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.extHeader),
/* harmony export */   extHeaderLength: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.extHeaderLength),
/* harmony export */   extension: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.extension),
/* harmony export */   extractHeaderValue: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.extractHeaderValue),
/* harmony export */   extractURIs: () => (/* reexport safe */ _sdp__WEBPACK_IMPORTED_MODULE_0__.extractURIs),
/* harmony export */   getJPEGResolutionFromExtHeader: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.getJPEGResolutionFromExtHeader),
/* harmony export */   getTime: () => (/* reexport safe */ _ntp__WEBPACK_IMPORTED_MODULE_3__.getTime),
/* harmony export */   marker: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.marker),
/* harmony export */   messageFromBuffer: () => (/* reexport safe */ _sdp__WEBPACK_IMPORTED_MODULE_0__.messageFromBuffer),
/* harmony export */   padding: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.padding),
/* harmony export */   parse: () => (/* reexport safe */ _sdp__WEBPACK_IMPORTED_MODULE_0__.parse),
/* harmony export */   parseExtHeader: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.parseExtHeader),
/* harmony export */   payload: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.payload),
/* harmony export */   payloadType: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.payloadType),
/* harmony export */   range: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.range),
/* harmony export */   sSrc: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.sSrc),
/* harmony export */   sequence: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.sequence),
/* harmony export */   sequenceNumber: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.sequenceNumber),
/* harmony export */   sessionId: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.sessionId),
/* harmony export */   sessionTimeout: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.sessionTimeout),
/* harmony export */   statusCode: () => (/* reexport safe */ _rtsp__WEBPACK_IMPORTED_MODULE_2__.statusCode),
/* harmony export */   timestamp: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.timestamp),
/* harmony export */   version: () => (/* reexport safe */ _rtp__WEBPACK_IMPORTED_MODULE_1__.version)
/* harmony export */ });
/* harmony import */ var _sdp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sdp */ "./lib/utils/protocols/sdp.ts");
/* harmony import */ var _rtp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rtp */ "./lib/utils/protocols/rtp.ts");
/* harmony import */ var _rtsp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./rtsp */ "./lib/utils/protocols/rtsp.ts");
/* harmony import */ var _ntp__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ntp */ "./lib/utils/protocols/ntp.ts");





/***/ }),

/***/ "./lib/utils/protocols/isom.ts":
/*!*************************************!*\
  !*** ./lib/utils/protocols/isom.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BOX_HEADER_BYTES: () => (/* binding */ BOX_HEADER_BYTES),
/* harmony export */   boxType: () => (/* binding */ boxType)
/* harmony export */ });
/*
 * Track data which can be attached to an ISOM message.
 * It indicates the start of a new movie.
 */

const BOX_HEADER_BYTES = 8;
const boxType = buffer => {
  return buffer.toString('ascii', 4, 8).toLowerCase();
};

/***/ }),

/***/ "./lib/utils/protocols/ntp.ts":
/*!************************************!*\
  !*** ./lib/utils/protocols/ntp.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTime: () => (/* binding */ getTime)
/* harmony export */ });
// NTP is offset from 01.01.1900
const NTP_UNIX_EPOCH_OFFSET = Date.UTC(1900, 0, 1);

// Convenience types

/**
 * Convert NTP time to milliseconds since January 1, 1970, 00:00:00 UTC (Unix Epoch)
 * @param {Number} ntpMost Seconds since 01.01.1900
 * @param {Number} ntpLeast Fractions since 01.01.1900
 */
function getTime(ntpMost, ntpLeast) {
  const ntpMilliSeconds = (ntpMost + ntpLeast / 0x100000000) * 1000;
  return NTP_UNIX_EPOCH_OFFSET + ntpMilliSeconds;
}

/***/ }),

/***/ "./lib/utils/protocols/rtcp.ts":
/*!*************************************!*\
  !*** ./lib/utils/protocols/rtcp.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APP: () => (/* binding */ APP),
/* harmony export */   BYE: () => (/* binding */ BYE),
/* harmony export */   RR: () => (/* binding */ RR),
/* harmony export */   SDES: () => (/* binding */ SDES),
/* harmony export */   SR: () => (/* binding */ SR),
/* harmony export */   count: () => (/* binding */ count),
/* harmony export */   length: () => (/* binding */ length),
/* harmony export */   packetType: () => (/* binding */ packetType),
/* harmony export */   padding: () => (/* binding */ padding),
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* harmony import */ var _bits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bits */ "./lib/utils/bits.ts");


// Real Time Control Protocol (RTCP)
// https://tools.ietf.org/html/rfc3550#section-6

/*
Common RTCP packed header:

        0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
header |V=2|P|    RC   |   PT=SR=200   |             length            |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
*/

const version = buffer => {
  return buffer[0] >>> 6;
};
const padding = buffer => {
  return !!(buffer[0] & _bits__WEBPACK_IMPORTED_MODULE_0__.POS[2]);
};
const count = buffer => {
  return buffer[0] & 0x1f;
};
const packetType = buffer => {
  return buffer[1];
};
const length = buffer => {
  return buffer.readUInt16BE(2);
};

/*
SR: Sender Report RTCP Packet

        0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
header |V=2|P|    RC   |   PT=SR=200   |             length            |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                         SSRC of sender                        |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
sender |              NTP timestamp, most significant word             |
info   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |             NTP timestamp, least significant word             |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                         RTP timestamp                         |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                     sender's packet count                     |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                      sender's octet count                     |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
report |                 SSRC_1 (SSRC of first source)                 |
block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  1    | fraction lost |       cumulative number of packets lost       |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |           extended highest sequence number received           |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                      interarrival jitter                      |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                         last SR (LSR)                         |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                   delay since last SR (DLSR)                  |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
report |                 SSRC_2 (SSRC of second source)                |
block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  2    :                               ...                             :
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
       |                  profile-specific extensions                  |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
*/

const SR = {
  packetType: 200,
  syncSource: buffer => {
    return buffer.readUInt32BE(4);
  },
  ntpMost: buffer => {
    return buffer.readUInt32BE(8);
  },
  ntpLeast: buffer => {
    return buffer.readUInt32BE(12);
  },
  rtpTimestamp: buffer => {
    return buffer.readUInt32BE(16);
  },
  sendersPacketCount: buffer => {
    return buffer.readUInt32BE(20);
  },
  sendersOctetCount: buffer => {
    return buffer.readUInt32BE(24);
  }
};

/*
RR: Receiver Report RTCP Packet

        0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
header |V=2|P|    RC   |   PT=RR=201   |             length            |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                     SSRC of packet sender                     |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
report |                 SSRC_1 (SSRC of first source)                 |
block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  1    | fraction lost |       cumulative number of packets lost       |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |           extended highest sequence number received           |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                      interarrival jitter                      |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                         last SR (LSR)                         |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                   delay since last SR (DLSR)                  |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
report |                 SSRC_2 (SSRC of second source)                |
block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  2    :                               ...                             :
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
       |                  profile-specific extensions                  |
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
*/

const RR = {
  packetType: 201
};

/*
SDES: Source Description RTCP Packet

        0                   1                   2                   3
        0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
       +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
header |V=2|P|    SC   |  PT=SDES=202  |             length            |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
chunk  |                          SSRC/CSRC_1                          |
  1    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                           SDES items                          |
       |                              ...                              |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
chunk  |                          SSRC/CSRC_2                          |
  2    +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
       |                           SDES items                          |
       |                              ...                              |
       +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
*/

const SDES = {
  packetType: 202
};

/*
BYE: Goodbye RTCP Packet

       0                   1                   2                   3
       0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      |V=2|P|    SC   |   PT=BYE=203  |             length            |
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      |                           SSRC/CSRC                           |
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      :                              ...                              :
      +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
(opt) |     length    |               reason for leaving            ...
      +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
*/

const BYE = {
  packetType: 203
};

/*
APP: Application-Defined RTCP Packet

    0                   1                   2                   3
    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |V=2|P| subtype |   PT=APP=204  |             length            |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                           SSRC/CSRC                           |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                          name (ASCII)                         |
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
   |                   application-dependent data                ...
   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

*/

const APP = {
  packetType: 204
};

/***/ }),

/***/ "./lib/utils/protocols/rtp.ts":
/*!************************************!*\
  !*** ./lib/utils/protocols/rtp.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   cSrc: () => (/* binding */ cSrc),
/* harmony export */   cSrcCount: () => (/* binding */ cSrcCount),
/* harmony export */   extHeader: () => (/* binding */ extHeader),
/* harmony export */   extHeaderLength: () => (/* binding */ extHeaderLength),
/* harmony export */   extension: () => (/* binding */ extension),
/* harmony export */   getJPEGResolutionFromExtHeader: () => (/* binding */ getJPEGResolutionFromExtHeader),
/* harmony export */   marker: () => (/* binding */ marker),
/* harmony export */   padding: () => (/* binding */ padding),
/* harmony export */   parseExtHeader: () => (/* binding */ parseExtHeader),
/* harmony export */   payload: () => (/* binding */ payload),
/* harmony export */   payloadType: () => (/* binding */ payloadType),
/* harmony export */   sSrc: () => (/* binding */ sSrc),
/* harmony export */   sequenceNumber: () => (/* binding */ sequenceNumber),
/* harmony export */   timestamp: () => (/* binding */ timestamp),
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* harmony import */ var _bits__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../bits */ "./lib/utils/bits.ts");
/* provided dependency */ var Buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")["Buffer"];


// Real Time Protocol (RTP)
// https://tools.ietf.org/html/rfc3550#section-5.1

/*
RTP Fixed Header Fields

  0               1               2               3
  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |V=2|P|X|  CC   |M|     PT      |       sequence number         |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                           timestamp                           |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |           synchronization source (SSRC) identifier            |
  +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
  |            contributing source (CSRC) identifiers             |
  |                             ....                              |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |   profile-specific ext. id    | profile-specific ext. length  |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                 profile-specific extension                    |
  |                             ....                              |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
*/

const version = buffer => {
  return buffer[0] >>> 6;
};
const padding = buffer => {
  return !!(buffer[0] & _bits__WEBPACK_IMPORTED_MODULE_0__.POS[2]);
};
const extension = buffer => {
  return !!(buffer[0] & _bits__WEBPACK_IMPORTED_MODULE_0__.POS[3]);
};
const cSrcCount = buffer => {
  return buffer[0] & 0x0f;
};
const marker = buffer => {
  return !!(buffer[1] & _bits__WEBPACK_IMPORTED_MODULE_0__.POS[0]);
};
const payloadType = buffer => {
  return buffer[1] & 0x7f;
};
const sequenceNumber = buffer => {
  return buffer.readUInt16BE(2);
};
const timestamp = buffer => {
  return buffer.readUInt32BE(4);
};
const sSrc = buffer => {
  return buffer.readUInt32BE(8);
};
const cSrc = (buffer, rank = 0) => {
  return cSrcCount(buffer) > rank ? buffer.readUInt32BE(12 + rank * 4) : 0;
};
const extHeaderLength = buffer => {
  return extension(buffer) === false ? 0 : buffer.readUInt16BE(12 + cSrcCount(buffer) * 4 + 2);
};
const extHeader = buffer => {
  return extHeaderLength(buffer) === 0 ? Buffer.from([]) : buffer.slice(12 + cSrcCount(buffer) * 4, 12 + cSrcCount(buffer) * 4 + 4 + extHeaderLength(buffer) * 4);
};
const parseExtHeader = buffer => {
  if (!buffer || buffer.length === 0) return {};else {
    let o = {};
    // ignore 0xFFD8 and length
    let offset = 4;
    while (buffer.length - offset > 4) {
      let key = buffer.readUInt16BE(offset);
      let length = buffer.readUInt16BE(offset + 2);
      o[key] = buffer.slice(offset + 4, offset + 2 + length); // length contains length field but not header id
      offset += 2 + length;
    }
    return o;
  }
};
const getJPEGResolutionFromExtHeader = buffer => {
  let back = {
    width: 0,
    height: 0
  };
  if (buffer && buffer.length > 4) {
    // ignore 0xFFD8 and length
    let offset = 4;
    while (buffer.length - offset > 4) {
      let key = buffer.readUInt16BE(offset);
      let length = buffer.readUInt16BE(offset + 2);
      if (key === 0xFFC0) {
        back.height = buffer.readUInt16BE(offset + 5);
        back.width = buffer.readUInt16BE(offset + 7);
      }
      offset += 2 + length;
    }
    return back;
  }
  return back;
};
const payload = buffer => {
  return extension(buffer) === false ? buffer.slice(12 + cSrcCount(buffer) * 4) : buffer.slice(12 + cSrcCount(buffer) * 4 + 4 + extHeaderLength(buffer) * 4);
};

/***/ }),

/***/ "./lib/utils/protocols/rtsp.ts":
/*!*************************************!*\
  !*** ./lib/utils/protocols/rtsp.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bodyOffset: () => (/* binding */ bodyOffset),
/* harmony export */   connectionEnded: () => (/* binding */ connectionEnded),
/* harmony export */   contentBase: () => (/* binding */ contentBase),
/* harmony export */   extractHeaderValue: () => (/* binding */ extractHeaderValue),
/* harmony export */   range: () => (/* binding */ range),
/* harmony export */   sequence: () => (/* binding */ sequence),
/* harmony export */   sessionId: () => (/* binding */ sessionId),
/* harmony export */   sessionTimeout: () => (/* binding */ sessionTimeout),
/* harmony export */   statusCode: () => (/* binding */ statusCode)
/* harmony export */ });
/*
 * The RTSP response format is defined in RFC 7826,
 * using ABNF notation specified in RFC 5234.
 * Strings in ABNF rules ("...") are always case insensitive!
 *
 * Basic rules to help with the headers below:
 * ====
 * CR              =  %x0D ; US-ASCII CR, carriage return (13)
 * LF              =  %x0A  ; US-ASCII LF, linefeed (10)
 * SP              =  %x20  ; US-ASCII SP, space (32)
 * HT              =  %x09  ; US-ASCII HT, horizontal-tab (9)
 * CRLF            =  CR LF
 * LWS             =  [CRLF] 1*( SP / HT ) ; Line-breaking whitespace
 * SWS             =  [LWS] ; Separating whitespace
 * HCOLON          =  *( SP / HT ) ":" SWS
 *
 * RTSP response rules (a `*` means zero or more):
 * ====
 * Status-Line  = RTSP-Version SP Status-Code SP Reason-Phrase CRLF
 * Response     = Status-Line
 *                *((general-header
 *                /  response-header
 *                /  message-body-header) CRLF)
 *                CRLF
 *                [ message-body-data ]
 *
 * Example response:
 * ====
 * RTSP/1.0 200 OK
 * CSeq: 3
 * Content-Type: application/sdp
 * Content-Base: rtsp://192.168.0.3/media/media.amp/
 * Server: GStreamer RTSP server
 * Date: Wed, 03 Jun 2015 14:23:42 GMT
 * Content-Length: 623
 *
 * v=0
 * ....
 */

/**
 * Extract the value of a header.
 *
 * @param buffer The response bytes
 * @param header The header to search for
 */
const extractHeaderValue = (buffer, header) => {
  const anchor = `\n${header.toLowerCase()}: `;
  const start = buffer.toString().toLowerCase().indexOf(anchor);
  if (start >= 0) {
    const end = buffer.indexOf('\n', start + anchor.length);
    const headerValue = buffer.toString('ascii', start + anchor.length, end).trim();
    return headerValue;
  }
  return null;
};
const sequence = buffer => {
  /**
   * CSeq           =  "CSeq" HCOLON cseq-nr
   * cseq-nr        =  1*9DIGIT
   */
  const val = extractHeaderValue(buffer, 'CSeq');
  if (val !== null) {
    return Number(val);
  }
  return null;
};
const sessionId = buffer => {
  /**
   * Session          =  "Session" HCOLON session-id
   *                     [ SEMI "timeout" EQUAL delta-seconds ]
   * session-id        =  1*256( ALPHA / DIGIT / safe )
   * delta-seconds     =  1*19DIGIT
   */
  const val = extractHeaderValue(buffer, 'Session');
  return val ? val.split(';')[0] : null;
};
const sessionTimeout = buffer => {
  /**
   * Session          =  "Session" HCOLON session-id
   *                     [ SEMI "timeout" EQUAL delta-seconds ]
   * session-id        =  1*256( ALPHA / DIGIT / safe )
   * delta-seconds     =  1*19DIGIT
   */
  const val = extractHeaderValue(buffer, 'Session');
  if (val === null) {
    return null;
  }
  const timeoutToken = 'timeout=';
  const timeoutPosition = val.toLowerCase().indexOf(timeoutToken);
  if (timeoutPosition !== -1) {
    let timeoutVal = val.substring(timeoutPosition + timeoutToken.length);
    timeoutVal = timeoutVal.split(';')[0];
    const parsedTimeout = parseInt(timeoutVal);
    return isNaN(parsedTimeout) ? null : parsedTimeout;
  }
  return null;
};
const statusCode = buffer => {
  return Number(buffer.toString('ascii', 9, 12));
};
const contentBase = buffer => {
  /**
   * Content-Base       =  "Content-Base" HCOLON RTSP-URI
   */
  return extractHeaderValue(buffer, 'Content-Base');
};
const connectionEnded = buffer => {
  /**
   * Connection         =  "Connection" HCOLON connection-token
   *                       *(COMMA connection-token)
   * connection-token   =  "close" / token
   */
  const connectionToken = extractHeaderValue(buffer, 'Connection');
  return connectionToken !== null && connectionToken.toLowerCase() === 'close';
};
const range = buffer => {
  /**
   * Range              =  "Range" HCOLON ranges-spec
   * ranges-spec        =  npt-range / utc-range / smpte-range
   *                       /  range-ext
   * npt-range        =  "npt" [EQUAL npt-range-spec]
   * npt-range-spec   =  ( npt-time "-" [ npt-time ] ) / ( "-" npt-time )
   * npt-time         =  "now" / npt-sec / npt-hhmmss / npt-hhmmss-comp
   * npt-sec          =  1*19DIGIT [ "." 1*9DIGIT ]
   * npt-hhmmss       =  npt-hh ":" npt-mm ":" npt-ss [ "." 1*9DIGIT ]
   * npt-hh           =  2*19DIGIT   ; any positive number
   * npt-mm           =  2*2DIGIT  ; 0-59
   * npt-ss           =  2*2DIGIT  ; 0-59
   * npt-hhmmss-comp  =  npt-hh-comp ":" npt-mm-comp ":" npt-ss-comp
   *                     [ "." 1*9DIGIT ] ; Compatibility format
   * npt-hh-comp      =  1*19DIGIT   ; any positive number
   * npt-mm-comp      =  1*2DIGIT  ; 0-59
   * npt-ss-comp      =  1*2DIGIT  ; 0-59
   */

  // Example range headers:
  // Range: npt=now-
  // Range: npt=1154.598701-3610.259146
  const npt = extractHeaderValue(buffer, 'Range');
  if (npt !== null) {
    return npt.split('=')[1].split('-');
  }
  return undefined;
};

/**
 * Determine the offset of the RTSP body, where the header ends.
 * If there is no header ending, -1 is returned
 * @param {Buffer} chunk A piece of data
 * @return {Number}      The body offset, or -1 if no header end found
 */
const bodyOffset = chunk => {
  /**
   * Strictly speaking, it seems RTSP MUST have CRLF and doesn't allow CR or LF on its own.
   * That means that the end of the header part should be a pair of CRLF, but we're being
   * flexible here and also allow LF LF or CR CR instead of CRLF CRLF.
   */
  const bodyOffsets = ['\n\n', '\r\r', '\r\n\r\n'].map(s => {
    const offset = chunk.indexOf(s);
    if (offset !== -1) {
      return offset + s.length;
    }
    return offset;
  }).filter(offset => offset !== -1);
  if (bodyOffsets.length > 0) {
    return bodyOffsets.reduce((acc, offset) => {
      return Math.min(acc, offset);
    });
  } else {
    return -1;
  }
};

/***/ }),

/***/ "./lib/utils/protocols/sdp.ts":
/*!************************************!*\
  !*** ./lib/utils/protocols/sdp.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extractURIs: () => (/* binding */ extractURIs),
/* harmony export */   messageFromBuffer: () => (/* binding */ messageFromBuffer),
/* harmony export */   parse: () => (/* binding */ parse)
/* harmony export */ });
/* harmony import */ var _components_message__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../components/message */ "./lib/components/message.ts");


// RTSP extensions: https://tools.ietf.org/html/rfc7826 (22.15)
// exists on both session and media level
/**
 * The session description protocol (SDP).
 *
 * Contains parser to convert SDP data into an SDP structure.
 * https://tools.ietf.org/html/rfc4566
 *
 * NOTE: not all SDP attributes have been implemented,
 * and in some cases the handling of attributes has been
 * simplified to not cover multiple identical attributes.
 */
/**
 * Session description
 *
 * Optional items are marked with a '*'.
 *
 * v=  (protocol version)
 * o=  (owner/creator and session identifier).
 * s=  (session name)
 * i=* (session information)
 * u=* (URI of description)
 * e=* (email address)
 * p=* (phone number)
 * c=* (connection information - not required if included in all media)
 * b=* (bandwidth information)
 * One or more time descriptions (see below)
 * z=* (time zone adjustments)
 * k=* (encryption key)
 * a=* (zero or more session attribute lines)
 * Zero or more media descriptions (see below)
 *
 * Names of the fields below are annotated above with
 * the names used in Appendix A: SDP Grammar of RFC 2327.
 */
/**
 * Time description
 *
 * t=  (time the session is active)
 * r=* (zero or more repeat times)
 */
/**
 * Media description
 *
 * m=  (media name and transport address)
 * i=* (media title)
 * c=* (connection information -- optional if included at session level)
 * b=* (zero or more bandwidth information lines)
 * k=* (encryption key)
 * a=* (zero or more media attribute lines)
 *
 * The parser only handles a single fmt value
 * and only one rtpmap attribute (in theory there
 * can be multiple fmt values with corresponding rtpmap
 * attributes)
 */
const extractLineVals = (buffer, lineStart, start = 0) => {
  const anchor = `\n${lineStart}`;
  start = buffer.indexOf(anchor, start);
  let end = 0;
  const ret = [];
  while (start >= 0) {
    end = buffer.indexOf('\n', start + anchor.length);
    ret.push(buffer.toString('ascii', start + anchor.length, end).trim());
    start = buffer.indexOf(anchor, end);
  }
  return ret;
};

// SDP parsing

/**
 * Identify the start of a session-level or media-level section.
 * @param  {String} line The line to parse
 * @return {Object}      Object with a type + name
 */
const newMediaLevel = line => {
  return line.match(/^m=/);
};
const splitOnFirst = (c, text) => {
  const p = text.indexOf(c);
  if (p < 0) {
    return [text.slice(0)];
  } else {
    return [text.slice(0, p), text.slice(p + 1)];
  }
};
const attributeParsers = {
  fmtp: value => {
    const [format, stringParameters] = splitOnFirst(' ', value);
    switch (format) {
      default:
        const pairs = stringParameters.trim().split(';');
        const parameters = {};
        pairs.forEach(pair => {
          const [key, val] = splitOnFirst('=', pair);
          const normalizedKey = key.trim().toLowerCase();
          if (normalizedKey !== '') {
            parameters[normalizedKey] = val.trim();
          }
        });
        return {
          format,
          parameters
        };
    }
  },
  framerate: Number,
  rtpmap: value => {
    const [payloadType, encoding] = splitOnFirst(' ', value);
    const [encodingName, clockrate, encodingParameters] = encoding.toUpperCase().split('/');
    if (encodingParameters === undefined) {
      return {
        payloadType: Number(payloadType),
        encodingName,
        clockrate: Number(clockrate)
      };
    } else {
      return {
        payloadType: Number(payloadType),
        encodingName,
        clockrate: Number(clockrate),
        encodingParameters
      };
    }
  },
  transform: value => {
    return value.split(';').map(row => row.split(',').map(Number));
  },
  framesize: value => {
    return value.split(' ')[1].split('-').map(Number);
  }
};
const parseAttribute = body => {
  const [attribute, value] = splitOnFirst(':', body);
  if (value === undefined) {
    return {
      [attribute]: true
    };
  } else {
    if (attributeParsers[attribute] !== undefined) {
      return {
        [attribute]: attributeParsers[attribute](value)
      };
    } else {
      return {
        [attribute]: value
      };
    }
  }
};
const extractField = line => {
  const prefix = line.slice(0, 1);
  const body = line.slice(2);
  switch (prefix) {
    case 'v':
      return {
        version: body
      };
    case 'o':
      const [username, sessionId, sessionVersion, netType, addrType, unicastAddress] = body.split(' ');
      return {
        origin: {
          addrType,
          netType,
          sessionId,
          sessionVersion,
          unicastAddress,
          username
        }
      };
    case 's':
      return {
        sessionName: body
      };
    case 'i':
      return {
        sessionInformation: body
      };
    case 'u':
      return {
        uri: body
      };
    case 'e':
      return {
        email: body
      };
    case 'p':
      return {
        phone: body
      };
    // c=<nettype> <addrtype> <connection-address>
    case 'c':
      const [connectionNetType, connectionAddrType, connectionAddress] = body.split(' ');
      return {
        connectionData: {
          addrType: connectionAddrType,
          connectionAddress,
          netType: connectionNetType
        }
      };
    // b=<bwtype>:<bandwidth>
    case 'b':
      const [bwtype, bandwidth] = body.split(':');
      return {
        bwtype,
        bandwidth
      };
    // t=<start-time> <stop-time>
    case 't':
      const [startTime, stopTime] = body.split(' ').map(Number);
      return {
        time: {
          startTime,
          stopTime
        }
      };
    // r=<repeat interval> <active duration> <offsets from start-time>
    case 'r':
      const [repeatInterval, activeDuration, ...offsets] = body.split(' ').map(Number);
      return {
        repeatTimes: {
          repeatInterval,
          activeDuration,
          offsets
        }
      };
    // z=<adjustment time> <offset> <adjustment time> <offset> ....
    case 'z':
      return;
    // k=<method>
    // k=<method>:<encryption key>
    case 'k':
      return;
    // a=<attribute>
    // a=<attribute>:<value>
    case 'a':
      return parseAttribute(body);
    case 'm':
      // Only the first fmt field is parsed!
      const [type, port, protocol, fmt] = body.split(' ');
      return {
        type,
        port: Number(port),
        protocol,
        fmt: Number(fmt)
      };
    default:
    // console.log('unknown SDP prefix ', prefix);
  }
};

const extractURIs = buffer => {
  // There is a control URI above the m= line, which should not be used
  const seekFrom = buffer.indexOf('\nm=');
  return extractLineVals(buffer, 'a=control:', seekFrom);
};

/**
 * Create an array of sprop-parameter-sets elements
 * @param  {Buffer} buffer The buffer containing the sdp data
 * @return {Array}         The differen parameter strings
 */
const parse = buffer => {
  const sdp = buffer.toString('ascii').split('\n').map(s => s.trim());
  const struct = {
    session: {},
    media: []
  };
  let mediaCounter = 0;
  let current = struct.session;
  for (const line of sdp) {
    if (newMediaLevel(line)) {
      struct.media[mediaCounter] = {};
      current = struct.media[mediaCounter];
      ++mediaCounter;
    }
    current = Object.assign(current, extractField(line));
  }
  return struct;
};
const messageFromBuffer = buffer => {
  return {
    type: _components_message__WEBPACK_IMPORTED_MODULE_0__.MessageType.SDP,
    data: buffer,
    sdp: parse(buffer)
  };
};

/***/ }),

/***/ "./lib/utils/scheduler.ts":
/*!********************************!*\
  !*** ./lib/utils/scheduler.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Scheduler: () => (/* binding */ Scheduler)
/* harmony export */ });
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// The default tolerance for matching the handler
// invocation to clock presentation time.
const DEFAULT_TOLERANCE = 10;

/**
 * A scheduler that can decide when to execute a certain
 * timestamped callback so that it happens in sync with a video
 * element.
 *
 * To use it:
 *
 * (1) Initialize a new Scheduler with a clock (to synchronize
 * against) and a callback (to be called when a message is in
 * sync with the video). The clock can be a HTMLVideoElement,
 * or anything that has a `currentTime` property which gives
 * the current presentation time in seconds, and a `pause` and
 * `play` method to control playback.
 *
 * (2) Call the `run` method every time a new message arrives
 * that you want to schedule (it needs to have an ntpTimestamp).
 * As soon at the presentation time is known, call the `init`
 * method and pass in that time, so that the scheduler can
 * start to schedule the callbacks. From then on, whenever
 * a message in the queue has a timestamp that matches the
 * current presentation time of the video, your callback will
 * fire.
 *
 * @class Scheduler
 */

class Scheduler {
  /**
   * Creates an instance of Scheduler.
   * @param {any} clock The clock to use (so we can control playback)
   * @param {any} handler The callback to invoke when a message is in sync
   * @param {number} [tolerance=DEFAULT_TOLERANCE] The milliseconds defining "in sync"
   * @memberof Scheduler
   */
  constructor(clock, handler, tolerance = DEFAULT_TOLERANCE) {
    _defineProperty(this, "_clock", void 0);
    _defineProperty(this, "_handler", void 0);
    _defineProperty(this, "_tolerance", void 0);
    _defineProperty(this, "_nextRun", void 0);
    _defineProperty(this, "_nextPlay", void 0);
    _defineProperty(this, "_fifo", void 0);
    _defineProperty(this, "_ntpPresentationTime", void 0);
    _defineProperty(this, "_suspended", void 0);
    this._clock = clock;
    this._handler = handler;
    this._tolerance = tolerance;
    this._nextRun = 0;
    this._nextPlay = 0;
    this._fifo = [];
    this._ntpPresentationTime = 0;
    this._suspended = false;
  }

  /**
   * Bring the scheduler back to it's initial state.
   * @memberof Scheduler
   */
  reset() {
    clearTimeout(this._nextRun);
    clearTimeout(this._nextPlay);
    this._fifo = [];
    this._ntpPresentationTime = 0;
    this._suspended = false;
  }

  /**
   * Initialize the scheduler.
   *
   * @param {any} ntpPresentationTime The offset representing the start of the presentation
   * @memberof Scheduler
   */
  init(ntpPresentationTime) {
    this._ntpPresentationTime = ntpPresentationTime;
  }

  /**
   * Suspend the scheduler.
   *
   * This releases control of the clock and stops any scheduling activity.
   * Note that this doesn't mean the clock will be in a particular state
   * (could be started or stopped), just that the scheduler will no longer
   * control it.
   *
   * @memberof Scheduler
   */
  suspend() {
    clearTimeout(this._nextPlay);
    this._suspended = true;
  }

  /**
   * Resume the scheduler.
   *
   * This gives back control of the clock and the ability
   * to schedule messages. The scheduler will immediately
   * try to do that on resume.
   *
   * @memberof Scheduler
   */
  resume() {
    this._suspended = false;
    this.run(undefined);
  }

  /**
   * Run the scheduler.
   *
   * @param {any} [msg] New message to schedule.
   * @memberof Scheduler
   */
  run(newMessage) {
    clearTimeout(this._nextRun);
    // If there is no way to schedule anything, just return.
    // The first schedule will happen for the first .run that
    // is called after the presentation time has been initialized.
    if (typeof this._ntpPresentationTime === 'undefined') {
      return;
    }
    // If there is a new message, add it to the FIFO queue
    if (typeof newMessage !== 'undefined') {
      this._fifo.push(newMessage);
    }
    // If the scheduler is suspended, we can only keep the
    // messages and not do anything with them.
    if (this._suspended) {
      return;
    }
    // If there are no messages, we don't need to bother or
    // even re-schedule, because the new call to .run() will
    // have to come from outside with a new message.
    if (this._fifo.length === 0) {
      return;
    }
    // There is at least one message in the FIFO queue, either
    // display it, or re-schedule the method for later execution
    let timeToPresent = 0;
    let currentMessage;
    do {
      const msg = this._fifo.shift();
      if (msg === undefined) {
        throw new Error('internal error: message should never be undefined');
      }
      currentMessage = msg;
      const ntpTimestamp = currentMessage.ntpTimestamp;
      if (ntpTimestamp === undefined) {
        continue;
      }
      const presentationTime = ntpTimestamp - this._ntpPresentationTime;
      timeToPresent = presentationTime - this._clock.currentTime * 1000;
      // If the message is within a tolerance of the presentation time
      // then call the handler.
      if (Math.abs(timeToPresent) < this._tolerance) {
        this._handler && this._handler(currentMessage);
      }
    } while (timeToPresent < this._tolerance && this._fifo.length > 0);
    if (timeToPresent < -this._tolerance) {
      // We ran out of messages, delay the video with the same amount
      // of delay as the last message had on the FIFO queue.
      // Since we don't have any messages in the queue right now,
      // the only way for anything to happen is if scheduler.run
      // is called.
      clearTimeout(this._nextPlay);
      this._clock.pause();
      this._nextPlay = window.setTimeout(() => this._clock.play(), -timeToPresent);
    } else if (timeToPresent > this._tolerance) {
      // message is later than video, add it back to the queue and
      // re-run the scheduling at a later point in time
      this._fifo.unshift(currentMessage);
      this._nextRun = window.setTimeout(() => this.run(undefined), timeToPresent);
    }
  }
}

/***/ }),

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayView (arrayView) {
  if (isInstance(arrayView, Uint8Array)) {
    var copy = new Uint8Array(arrayView)
    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
  }
  return fromArrayLike(arrayView)
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      if (pos + buf.length > buffer.length) {
        Buffer.from(buf).copy(buffer, pos)
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        )
      }
    } else if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    } else {
      buf.copy(buffer, pos)
    }
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
      case 'latin1':
      case 'binary':
        return asciiWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF)
      ? 4
      : (firstByte > 0xDF)
          ? 3
          : (firstByte > 0xBF)
              ? 2
              : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
  for (var i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUintLE =
Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUintBE =
Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUint8 =
Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUint16LE =
Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUint16BE =
Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUint32LE =
Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUint32BE =
Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUintLE =
Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUintBE =
Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUint8 =
Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUint16LE =
Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUint16BE =
Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUint32LE =
Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUint32BE =
Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()


/***/ }),

/***/ "./node_modules/debug/src/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/debug/src/browser.js ***!
  \*******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {});

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = __webpack_require__(/*! ./common */ "./node_modules/debug/src/common.js")(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};


/***/ }),

/***/ "./node_modules/debug/src/common.js":
/*!******************************************!*\
  !*** ./node_modules/debug/src/common.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = __webpack_require__(/*! ms */ "./node_modules/ms/index.js");

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = createDebug.selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;

		// Env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

module.exports = setup;


/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./node_modules/hash-base/index.js":
/*!*****************************************!*\
  !*** ./node_modules/hash-base/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var Buffer = (__webpack_require__(/*! safe-buffer */ "./node_modules/safe-buffer/index.js").Buffer)
var Transform = (__webpack_require__(/*! readable-stream */ "./node_modules/readable-stream/readable-browser.js").Transform)
var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")

function throwIfNotStringOrBuffer (val, prefix) {
  if (!Buffer.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer')
  }
}

function HashBase (blockSize) {
  Transform.call(this)

  this._block = Buffer.allocUnsafe(blockSize)
  this._blockSize = blockSize
  this._blockOffset = 0
  this._length = [0, 0, 0, 0]

  this._finalized = false
}

inherits(HashBase, Transform)

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null
  try {
    this.update(chunk, encoding)
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype._flush = function (callback) {
  var error = null
  try {
    this.push(this.digest())
  } catch (err) {
    error = err
  }

  callback(error)
}

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data')
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer.isBuffer(data)) data = Buffer.from(data, encoding)

  // consume data
  var block = this._block
  var offset = 0
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++]
    this._update()
    this._blockOffset = 0
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++]

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry
    carry = (this._length[j] / 0x0100000000) | 0
    if (carry > 0) this._length[j] -= 0x0100000000 * carry
  }

  return this
}

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented')
}

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true

  var digest = this._digest()
  if (encoding !== undefined) digest = digest.toString(encoding)

  // reset state
  this._block.fill(0)
  this._blockOffset = 0
  for (var i = 0; i < 4; ++i) this._length[i] = 0

  return digest
}

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
}

module.exports = HashBase


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/inherits/inherits_browser.js":
/*!***************************************************!*\
  !*** ./node_modules/inherits/inherits_browser.js ***!
  \***************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ "./node_modules/md5.js/index.js":
/*!**************************************!*\
  !*** ./node_modules/md5.js/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")
var HashBase = __webpack_require__(/*! hash-base */ "./node_modules/hash-base/index.js")
var Buffer = (__webpack_require__(/*! safe-buffer */ "./node_modules/safe-buffer/index.js").Buffer)

var ARRAY16 = new Array(16)

function MD5 () {
  HashBase.call(this, 64)

  // state
  this._a = 0x67452301
  this._b = 0xefcdab89
  this._c = 0x98badcfe
  this._d = 0x10325476
}

inherits(MD5, HashBase)

MD5.prototype._update = function () {
  var M = ARRAY16
  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4)

  var a = this._a
  var b = this._b
  var c = this._c
  var d = this._d

  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7)
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12)
  c = fnF(c, d, a, b, M[2], 0x242070db, 17)
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22)
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7)
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12)
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17)
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22)
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7)
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12)
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17)
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22)
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7)
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12)
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17)
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22)

  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5)
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9)
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14)
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20)
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5)
  d = fnG(d, a, b, c, M[10], 0x02441453, 9)
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14)
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20)
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5)
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9)
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14)
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20)
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5)
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9)
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14)
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20)

  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4)
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11)
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16)
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23)
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4)
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11)
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16)
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23)
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4)
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11)
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16)
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23)
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4)
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11)
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16)
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23)

  a = fnI(a, b, c, d, M[0], 0xf4292244, 6)
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10)
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15)
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21)
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6)
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10)
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15)
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21)
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6)
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10)
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15)
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21)
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6)
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10)
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15)
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21)

  this._a = (this._a + a) | 0
  this._b = (this._b + b) | 0
  this._c = (this._c + c) | 0
  this._d = (this._d + d) | 0
}

MD5.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64)
    this._update()
    this._blockOffset = 0
  }

  this._block.fill(0, this._blockOffset, 56)
  this._block.writeUInt32LE(this._length[0], 56)
  this._block.writeUInt32LE(this._length[1], 60)
  this._update()

  // produce result
  var buffer = Buffer.allocUnsafe(16)
  buffer.writeInt32LE(this._a, 0)
  buffer.writeInt32LE(this._b, 4)
  buffer.writeInt32LE(this._c, 8)
  buffer.writeInt32LE(this._d, 12)
  return buffer
}

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fnF (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
}

function fnG (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
}

function fnH (a, b, c, d, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
}

function fnI (a, b, c, d, m, k, s) {
  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
}

module.exports = MD5


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/readable-stream/errors-browser.js":
/*!********************************************************!*\
  !*** ./node_modules/readable-stream/errors-browser.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
module.exports.codes = codes;


/***/ }),

/***/ "./node_modules/readable-stream/lib/_stream_duplex.js":
/*!************************************************************!*\
  !*** ./node_modules/readable-stream/lib/_stream_duplex.js ***!
  \************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
};
/*</replacement>*/

module.exports = Duplex;
var Readable = __webpack_require__(/*! ./_stream_readable */ "./node_modules/readable-stream/lib/_stream_readable.js");
var Writable = __webpack_require__(/*! ./_stream_writable */ "./node_modules/readable-stream/lib/_stream_writable.js");
__webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")(Duplex, Readable);
{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);
  Readable.call(this, options);
  Writable.call(this, options);
  this.allowHalfOpen = true;
  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;
    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}
Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

// the no-half-open enforcer
function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  process.nextTick(onEndNT, this);
}
function onEndNT(self) {
  self.end();
}
Object.defineProperty(Duplex.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

/***/ }),

/***/ "./node_modules/readable-stream/lib/_stream_passthrough.js":
/*!*****************************************************************!*\
  !*** ./node_modules/readable-stream/lib/_stream_passthrough.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;
var Transform = __webpack_require__(/*! ./_stream_transform */ "./node_modules/readable-stream/lib/_stream_transform.js");
__webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  Transform.call(this, options);
}
PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),

/***/ "./node_modules/readable-stream/lib/_stream_readable.js":
/*!**************************************************************!*\
  !*** ./node_modules/readable-stream/lib/_stream_readable.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



module.exports = Readable;

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = (__webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter);
var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(/*! ./internal/streams/stream */ "./node_modules/readable-stream/lib/internal/streams/stream-browser.js");
/*</replacement>*/

var Buffer = (__webpack_require__(/*! buffer */ "./node_modules/buffer/index.js").Buffer);
var OurUint8Array = (typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*<replacement>*/
var debugUtil = __webpack_require__(/*! util */ "?d17e");
var debug;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/

var BufferList = __webpack_require__(/*! ./internal/streams/buffer_list */ "./node_modules/readable-stream/lib/internal/streams/buffer_list.js");
var destroyImpl = __webpack_require__(/*! ./internal/streams/destroy */ "./node_modules/readable-stream/lib/internal/streams/destroy.js");
var _require = __webpack_require__(/*! ./internal/streams/state */ "./node_modules/readable-stream/lib/internal/streams/state.js"),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = (__webpack_require__(/*! ../errors */ "./node_modules/readable-stream/errors-browser.js").codes),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

// Lazy loaded to improve the startup performance.
var StringDecoder;
var createReadableStreamAsyncIterator;
var from;
__webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")(Readable, Stream);
var errorOrDestroy = destroyImpl.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];
function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}
function ReadableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(/*! ./_stream_duplex */ "./node_modules/readable-stream/lib/_stream_duplex.js");
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  this.highWaterMark = getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'end' (and potentially 'finish')
  this.autoDestroy = !!options.autoDestroy;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = (__webpack_require__(/*! string_decoder/ */ "./node_modules/string_decoder/lib/string_decoder.js").StringDecoder);
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {
  Duplex = Duplex || __webpack_require__(/*! ./_stream_duplex */ "./node_modules/readable-stream/lib/_stream_duplex.js");
  if (!(this instanceof Readable)) return new Readable(options);

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  this._readableState = new ReadableState(options, this, isDuplex);

  // legacy
  this.readable = true;
  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }
  Stream.call(this);
}
Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;
  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }
  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};
function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      errorOrDestroy(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (addToFront) {
        if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  }

  // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.
  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}
function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}
function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }
  return er;
}
Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = (__webpack_require__(/*! string_decoder/ */ "./node_modules/string_decoder/lib/string_decoder.js").StringDecoder);
  var decoder = new StringDecoder(enc);
  this._readableState.decoder = decoder;
  // If setEncoding(null), decoder.encoding equals utf8
  this._readableState.encoding = this._readableState.decoder.encoding;

  // Iterate over current buffer to convert already stored Buffers:
  var p = this._readableState.buffer.head;
  var content = '';
  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }
  this._readableState.buffer.clear();
  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
};

// Don't raise the hwm > 1GB
var MAX_HWM = 0x40000000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }
  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }
  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;
  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }
  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }
  if (ret !== null) this.emit('data', ret);
  return ret;
};
function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;
  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;
    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}
function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);
  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  }

  // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.
  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}
function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED('_read()'));
};
Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;
  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }
  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);
    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy(dest, er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);
  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }
  return dest;
};
function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}
Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    for (var i = 0; i < len; i++) dests[i].emit('unpipe', this, {
      hasUnpiped: false
    });
    return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);
  var state = this._readableState;
  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0;

    // Try start flowing on next tick if stream isn't explicitly paused
    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);
      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }
  return res;
};
Readable.prototype.addListener = Readable.prototype.on;
Readable.prototype.removeListener = function (ev, fn) {
  var res = Stream.prototype.removeListener.call(this, ev, fn);
  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
Readable.prototype.removeAllListeners = function (ev) {
  var res = Stream.prototype.removeAllListeners.apply(this, arguments);
  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }
  return res;
};
function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;
  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true;

    // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}
function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()
    state.flowing = !state.readableListening;
    resume(this, state);
  }
  state.paused = false;
  return this;
};
function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}
function resume_(stream, state) {
  debug('resume', state.reading);
  if (!state.reading) {
    stream.read(0);
  }
  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}
Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  this._readableState.paused = true;
  return this;
};
function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null);
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;
  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }
    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;
    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };
  return this;
};
if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator === undefined) {
      createReadableStreamAsyncIterator = __webpack_require__(/*! ./internal/streams/async_iterator */ "./node_modules/readable-stream/lib/internal/streams/async_iterator.js");
    }
    return createReadableStreamAsyncIterator(this);
  };
}
Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
});

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}
function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);
  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}
function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length);

  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;
      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}
if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = __webpack_require__(/*! ./internal/streams/from */ "./node_modules/readable-stream/lib/internal/streams/from-browser.js");
    }
    return from(Readable, iterable, opts);
  };
}
function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

/***/ }),

/***/ "./node_modules/readable-stream/lib/_stream_transform.js":
/*!***************************************************************!*\
  !*** ./node_modules/readable-stream/lib/_stream_transform.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;
var _require$codes = (__webpack_require__(/*! ../errors */ "./node_modules/readable-stream/errors-browser.js").codes),
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
  ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
var Duplex = __webpack_require__(/*! ./_stream_duplex */ "./node_modules/readable-stream/lib/_stream_duplex.js");
__webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")(Transform, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK());
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_transform()'));
};
Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};
Transform.prototype._destroy = function (err, cb) {
  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};
function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null)
    // single equals check for both `null` and `undefined`
    stream.push(data);

  // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}

/***/ }),

/***/ "./node_modules/readable-stream/lib/_stream_writable.js":
/*!**************************************************************!*\
  !*** ./node_modules/readable-stream/lib/_stream_writable.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;
  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(/*! util-deprecate */ "./node_modules/util-deprecate/browser.js")
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(/*! ./internal/streams/stream */ "./node_modules/readable-stream/lib/internal/streams/stream-browser.js");
/*</replacement>*/

var Buffer = (__webpack_require__(/*! buffer */ "./node_modules/buffer/index.js").Buffer);
var OurUint8Array = (typeof __webpack_require__.g !== 'undefined' ? __webpack_require__.g : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
var destroyImpl = __webpack_require__(/*! ./internal/streams/destroy */ "./node_modules/readable-stream/lib/internal/streams/destroy.js");
var _require = __webpack_require__(/*! ./internal/streams/state */ "./node_modules/readable-stream/lib/internal/streams/state.js"),
  getHighWaterMark = _require.getHighWaterMark;
var _require$codes = (__webpack_require__(/*! ../errors */ "./node_modules/readable-stream/errors-browser.js").codes),
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
  ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
  ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
  ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
  ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
  ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
var errorOrDestroy = destroyImpl.errorOrDestroy;
__webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js")(Writable, Stream);
function nop() {}
function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || __webpack_require__(/*! ./_stream_duplex */ "./node_modules/readable-stream/lib/_stream_duplex.js");
  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  this.highWaterMark = getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // Should close be emitted on destroy. Defaults to true.
  this.emitClose = options.emitClose !== false;

  // Should .destroy() be called after 'finish' (and potentially 'end')
  this.autoDestroy = !!options.autoDestroy;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}
WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}
function Writable(options) {
  Duplex = Duplex || __webpack_require__(/*! ./_stream_duplex */ "./node_modules/readable-stream/lib/_stream_duplex.js");

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.

  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5
  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex);

  // legacy.
  this.writable = true;
  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }
  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
};
function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END();
  // TODO: defer error events consistently everywhere, not just the cb
  errorOrDestroy(stream, er);
  process.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var er;
  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }
  if (er) {
    errorOrDestroy(stream, er);
    process.nextTick(cb, er);
    return false;
  }
  return true;
}
Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);
  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};
Writable.prototype.cork = function () {
  this._writableState.corked++;
};
Writable.prototype.uncork = function () {
  var state = this._writableState;
  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};
Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};
Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}
Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;
  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }
  return ret;
}
function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}
function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy(stream, er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}
function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}
function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;
    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }
    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}
function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;
  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }
    if (entry === null) state.lastBufferedRequest = null;
  }
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}
Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};
Writable.prototype._writev = null;
Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }
  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending) endWritable(this, state, cb);
  return this;
};
Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});
function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      errorOrDestroy(stream, err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}
function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;
        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }
  return need;
}
function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}
function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }

  // reuse the free corkReq.
  state.corkedRequestsFree.next = corkReq;
}
Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  cb(err);
};

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/async_iterator.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/async_iterator.js ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");


var _Object$setPrototypeO;
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var finished = __webpack_require__(/*! ./end-of-stream */ "./node_modules/readable-stream/lib/internal/streams/end-of-stream.js");
var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');
function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}
function readAndResolve(iter) {
  var resolve = iter[kLastResolve];
  if (resolve !== null) {
    var data = iter[kStream].read();
    // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'
    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}
function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}
function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }
      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}
var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },
  next: function next() {
    var _this = this;
    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];
    if (error !== null) {
      return Promise.reject(error);
    }
    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }
    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    }

    // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time
    var lastPromise = this[kLastPromise];
    var promise;
    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();
      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }
      promise = new Promise(this[kHandlePromise]);
    }
    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;
  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);
var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;
  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();
      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  finished(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject];
      // reject if we are waiting for data in the Promise
      // returned by next() and store the error
      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }
      iterator[kError] = err;
      return;
    }
    var resolve = iterator[kLastResolve];
    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }
    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};
module.exports = createReadableStreamAsyncIterator;

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/buffer_list.js":
/*!**************************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/buffer_list.js ***!
  \**************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var _require = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js"),
  Buffer = _require.Buffer;
var _require2 = __webpack_require__(/*! util */ "?ed1b"),
  inspect = _require2.inspect;
var custom = inspect && inspect.custom || 'inspect';
function copyBuffer(src, target, offset) {
  Buffer.prototype.copy.call(src, target, offset);
}
module.exports = /*#__PURE__*/function () {
  function BufferList() {
    _classCallCheck(this, BufferList);
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;
      while (p = p.next) ret += s + p.data;
      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer.alloc(0);
      var ret = Buffer.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;
      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }
      return ret;
    }

    // Consumes a specified amount of bytes or characters from the buffered data.
  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;
      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }
      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    }

    // Consumes a specified amount of characters from the buffered data.
  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;
      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;
        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Consumes a specified amount of bytes from the buffered data.
  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;
      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;
        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }
          break;
        }
        ++c;
      }
      this.length -= c;
      return ret;
    }

    // Make sure the linked list only shows the minimal necessary information.
  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);
  return BufferList;
}();

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/destroy.js":
/*!**********************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/destroy.js ***!
  \**********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process */ "./node_modules/process/browser.js");


// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });
  return this;
}
function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}
function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit('error', err);
}
function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.

  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}
module.exports = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/end-of-stream.js":
/*!****************************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/end-of-stream.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Ported from https://github.com/mafintosh/end-of-stream with
// permission from the author, Mathias Buus (@mafintosh).



var ERR_STREAM_PREMATURE_CLOSE = (__webpack_require__(/*! ../../../errors */ "./node_modules/readable-stream/errors-browser.js").codes.ERR_STREAM_PREMATURE_CLOSE);
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    callback.apply(this, args);
  };
}
function noop() {}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;
  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };
  var writableEnded = stream._writableState && stream._writableState.finished;
  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };
  var readableEnded = stream._readableState && stream._readableState.endEmitted;
  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };
  var onerror = function onerror(err) {
    callback.call(stream, err);
  };
  var onclose = function onclose() {
    var err;
    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };
  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };
  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }
  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}
module.exports = eos;

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/from-browser.js":
/*!***************************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/from-browser.js ***!
  \***************************************************************************/
/***/ ((module) => {

module.exports = function () {
  throw new Error('Readable.from is not available in the browser')
};


/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/pipeline.js":
/*!***********************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/pipeline.js ***!
  \***********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Ported from https://github.com/mafintosh/pump with
// permission from the author, Mathias Buus (@mafintosh).



var eos;
function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}
var _require$codes = (__webpack_require__(/*! ../../../errors */ "./node_modules/readable-stream/errors-browser.js").codes),
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
  ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
function noop(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}
function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}
function destroyer(stream, reading, writing, callback) {
  callback = once(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos === undefined) eos = __webpack_require__(/*! ./end-of-stream */ "./node_modules/readable-stream/lib/internal/streams/end-of-stream.js");
  eos(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true;

    // request.destroy just do .end - .abort is what we want
    if (isRequest(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED('pipe'));
  };
}
function call(fn) {
  fn();
}
function pipe(from, to) {
  return from.pipe(to);
}
function popCallback(streams) {
  if (!streams.length) return noop;
  if (typeof streams[streams.length - 1] !== 'function') return noop;
  return streams.pop();
}
function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }
  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }
  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}
module.exports = pipeline;

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/state.js":
/*!********************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/state.js ***!
  \********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ERR_INVALID_OPT_VALUE = (__webpack_require__(/*! ../../../errors */ "./node_modules/readable-stream/errors-browser.js").codes.ERR_INVALID_OPT_VALUE);
function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}
function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }
    return Math.floor(hwm);
  }

  // Default value
  return state.objectMode ? 16 : 16 * 1024;
}
module.exports = {
  getHighWaterMark: getHighWaterMark
};

/***/ }),

/***/ "./node_modules/readable-stream/lib/internal/streams/stream-browser.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/readable-stream/lib/internal/streams/stream-browser.js ***!
  \*****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter;


/***/ }),

/***/ "./node_modules/readable-stream/readable-browser.js":
/*!**********************************************************!*\
  !*** ./node_modules/readable-stream/readable-browser.js ***!
  \**********************************************************/
/***/ ((module, exports, __webpack_require__) => {

exports = module.exports = __webpack_require__(/*! ./lib/_stream_readable.js */ "./node_modules/readable-stream/lib/_stream_readable.js");
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(/*! ./lib/_stream_writable.js */ "./node_modules/readable-stream/lib/_stream_writable.js");
exports.Duplex = __webpack_require__(/*! ./lib/_stream_duplex.js */ "./node_modules/readable-stream/lib/_stream_duplex.js");
exports.Transform = __webpack_require__(/*! ./lib/_stream_transform.js */ "./node_modules/readable-stream/lib/_stream_transform.js");
exports.PassThrough = __webpack_require__(/*! ./lib/_stream_passthrough.js */ "./node_modules/readable-stream/lib/_stream_passthrough.js");
exports.finished = __webpack_require__(/*! ./lib/internal/streams/end-of-stream.js */ "./node_modules/readable-stream/lib/internal/streams/end-of-stream.js");
exports.pipeline = __webpack_require__(/*! ./lib/internal/streams/pipeline.js */ "./node_modules/readable-stream/lib/internal/streams/pipeline.js");


/***/ }),

/***/ "./node_modules/safe-buffer/index.js":
/*!*******************************************!*\
  !*** ./node_modules/safe-buffer/index.js ***!
  \*******************************************/
/***/ ((module, exports, __webpack_require__) => {

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(/*! buffer */ "./node_modules/buffer/index.js")
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype)

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}


/***/ }),

/***/ "./node_modules/stream-browserify/index.js":
/*!*************************************************!*\
  !*** ./node_modules/stream-browserify/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = (__webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter);
var inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js");

inherits(Stream, EE);
Stream.Readable = __webpack_require__(/*! readable-stream/lib/_stream_readable.js */ "./node_modules/readable-stream/lib/_stream_readable.js");
Stream.Writable = __webpack_require__(/*! readable-stream/lib/_stream_writable.js */ "./node_modules/readable-stream/lib/_stream_writable.js");
Stream.Duplex = __webpack_require__(/*! readable-stream/lib/_stream_duplex.js */ "./node_modules/readable-stream/lib/_stream_duplex.js");
Stream.Transform = __webpack_require__(/*! readable-stream/lib/_stream_transform.js */ "./node_modules/readable-stream/lib/_stream_transform.js");
Stream.PassThrough = __webpack_require__(/*! readable-stream/lib/_stream_passthrough.js */ "./node_modules/readable-stream/lib/_stream_passthrough.js");
Stream.finished = __webpack_require__(/*! readable-stream/lib/internal/streams/end-of-stream.js */ "./node_modules/readable-stream/lib/internal/streams/end-of-stream.js")
Stream.pipeline = __webpack_require__(/*! readable-stream/lib/internal/streams/pipeline.js */ "./node_modules/readable-stream/lib/internal/streams/pipeline.js")

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};


/***/ }),

/***/ "./node_modules/string_decoder/lib/string_decoder.js":
/*!***********************************************************!*\
  !*** ./node_modules/string_decoder/lib/string_decoder.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



/*<replacement>*/

var Buffer = (__webpack_require__(/*! safe-buffer */ "./node_modules/safe-buffer/index.js").Buffer);
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

/***/ }),

/***/ "./node_modules/util-deprecate/browser.js":
/*!************************************************!*\
  !*** ./node_modules/util-deprecate/browser.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!__webpack_require__.g.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = __webpack_require__.g.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}


/***/ }),

/***/ "?ed1b":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?d17e":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************!*\
  !*** ./lib/index.browser.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AACDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.AACDepay),
/* harmony export */   BasicDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.BasicDepay),
/* harmony export */   CanvasSink: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.CanvasSink),
/* harmony export */   CustomDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.CustomDepay),
/* harmony export */   H264Depay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.H264Depay),
/* harmony export */   HTTPTunnelSource: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.HTTPTunnelSource),
/* harmony export */   Html5CanvasMetadataPipelineExtended: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5CanvasMetadataPipelineExtended),
/* harmony export */   Html5CanvasPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5CanvasPipeline),
/* harmony export */   Html5VideoMetadataPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5VideoMetadataPipeline),
/* harmony export */   Html5VideoMetadataPipelineExtended: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5VideoMetadataPipelineExtended),
/* harmony export */   Html5VideoPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5VideoPipeline),
/* harmony export */   Html5VideoPipeline_HTTP: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Html5VideoPipeline_HTTP),
/* harmony export */   HttpMsePipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.HttpMsePipeline),
/* harmony export */   HttpSource: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.HttpSource),
/* harmony export */   Inspector: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Inspector),
/* harmony export */   JPEGDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.JPEGDepay),
/* harmony export */   MessageType: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.MessageType),
/* harmony export */   MetadataPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.MetadataPipeline),
/* harmony export */   Mp4Capture: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Mp4Capture),
/* harmony export */   Mp4Muxer: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Mp4Muxer),
/* harmony export */   MseSink: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.MseSink),
/* harmony export */   ONVIFDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.ONVIFDepay),
/* harmony export */   Pipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.Pipeline),
/* harmony export */   RTSP_METHOD: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.RTSP_METHOD),
/* harmony export */   RtspDecoderPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.RtspDecoderPipeline),
/* harmony export */   RtspMjpegPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.RtspMjpegPipeline),
/* harmony export */   RtspMp4Pipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.RtspMp4Pipeline),
/* harmony export */   RtspParser: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.RtspParser),
/* harmony export */   RtspPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.RtspPipeline),
/* harmony export */   RtspSession: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.RtspSession),
/* harmony export */   SDPUpdater: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.SDPUpdater),
/* harmony export */   Scheduler: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.Scheduler),
/* harmony export */   Sink: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Sink),
/* harmony export */   Source: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Source),
/* harmony export */   Tube: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.Tube),
/* harmony export */   WSSource: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.WSSource),
/* harmony export */   WebCodecsDecoder: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.WebCodecsDecoder),
/* harmony export */   WsSdpPipeline: () => (/* reexport safe */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__.WsSdpPipeline),
/* harmony export */   base64ArrayBuffer: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.base64ArrayBuffer),
/* harmony export */   bodyOffset: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.bodyOffset),
/* harmony export */   cSrc: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.cSrc),
/* harmony export */   cSrcCount: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.cSrcCount),
/* harmony export */   components: () => (/* reexport module object */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   connectionEnded: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.connectionEnded),
/* harmony export */   contentBase: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.contentBase),
/* harmony export */   createTransform: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.createTransform),
/* harmony export */   dataCatcherDepay: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.dataCatcherDepay),
/* harmony export */   extHeader: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.extHeader),
/* harmony export */   extHeaderLength: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.extHeaderLength),
/* harmony export */   extension: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.extension),
/* harmony export */   extractHeaderValue: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.extractHeaderValue),
/* harmony export */   extractURIs: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.extractURIs),
/* harmony export */   g711toPCM: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.g711toPCM),
/* harmony export */   getJPEGResolutionFromExtHeader: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.getJPEGResolutionFromExtHeader),
/* harmony export */   getTime: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.getTime),
/* harmony export */   init_connection: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.init_connection),
/* harmony export */   marker: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.marker),
/* harmony export */   messageFromBuffer: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.messageFromBuffer),
/* harmony export */   padding: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.padding),
/* harmony export */   parse: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.parse),
/* harmony export */   parseExtHeader: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.parseExtHeader),
/* harmony export */   payload: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.payload),
/* harmony export */   payloadType: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.payloadType),
/* harmony export */   pipelines: () => (/* reexport module object */ _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__),
/* harmony export */   range: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.range),
/* harmony export */   sSrc: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.sSrc),
/* harmony export */   send_command: () => (/* reexport safe */ _components_index_browser__WEBPACK_IMPORTED_MODULE_0__.send_command),
/* harmony export */   sequence: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.sequence),
/* harmony export */   sequenceNumber: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.sequenceNumber),
/* harmony export */   sessionId: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.sessionId),
/* harmony export */   sessionTimeout: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.sessionTimeout),
/* harmony export */   statusCode: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.statusCode),
/* harmony export */   timestamp: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.timestamp),
/* harmony export */   utils: () => (/* reexport module object */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__),
/* harmony export */   version: () => (/* reexport safe */ _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__.version)
/* harmony export */ });
/* harmony import */ var _components_index_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/index.browser */ "./lib/components/index.browser.ts");
/* harmony import */ var _pipelines_index_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pipelines/index.browser */ "./lib/pipelines/index.browser.ts");
/* harmony import */ var _utils_index_browser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/index.browser */ "./lib/utils/index.browser.ts");







})();

mediaStreamLibrary = __webpack_exports__;
/******/ })()
;