var vxg_msl_pipelines = null;
var vxg_msl_components = null;
var vxg_msl_utils = null;

Number.prototype.toUnsigned = function() {
	return ((this >>> 1) * 2 + (this & 1));
};

var ulawencodeTable = [
	0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3,
	4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
	5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
	5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
	6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
	6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
	6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
	6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
	7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];


window.vxgplayer = function(id, options_){
	window.vxgplayer.version="1.0.8";
	window.vxgplayer.players = window.vxgplayer.players || {};

	if(!document.getElementById(id)){
		console.error(" Player with " + id + " did not found");
		return undefined;
	}

	if (!vxg_msl_pipelines || !vxg_msl_components || !vxg_msl_utils) {
		if (options_.importfunc_mediastreamlibrary) {
			options_.importfunc_mediastreamlibrary().then(function(arg){
				console.log('success');

				vxg_msl_pipelines = window.mediaStreamLibrary.pipelines;
				vxg_msl_components = window.mediaStreamLibrary.components;
				vxg_msl_utils = window.mediaStreamLibrary.utils;

				if (options_.mediastreamlibraryloaded) {
					options_.mediastreamlibraryloaded('ok');
				}
			}).catch(function(error){
				console.log(error);

				if (options_.mediastreamlibraryloaded) {
					options_.mediastreamlibraryloaded('not supported');
				}
			});
		} else if (options_.mediastreamlibrary && !CloudHelpers.isIE()) {
			var scr = document.createElement("script");
			scr.src = options_.mediastreamlibrary;
			document.head.appendChild(scr);
			scr.onload = function() {
				try {
					vxg_msl_pipelines = window.mediaStreamLibrary.pipelines;
					vxg_msl_components = window.mediaStreamLibrary.components;
					vxg_msl_utils = window.mediaStreamLibrary.utils;

					if (options_.mediastreamlibraryloaded) {
						options_.mediastreamlibraryloaded('ok');
					}
				} catch (e) {
					console.warn('Browser not supports mediaLibrary');
					if (options_.mediastreamlibraryloaded) {
						options_.mediastreamlibraryloaded('not supported');
					}
				}
			}
		} else {
			if (options_.mediastreamlibraryloaded) {
				options_.mediastreamlibraryloaded('not supported');
			}
		}
	}
	if (options_.boschbackwardaudio && !CloudHelpers.isIE() ) {
		var scr_abc = document.createElement("script");
		scr_abc.src = options_.boschbackwardaudio + "/audiobackchannel.js";
		document.head.appendChild(scr_abc);

		var scr_dm = document.createElement("script");
		scr_dm.src = options_.boschbackwardaudio + "/debug.min.js";
		document.head.appendChild(scr_dm);

		var scr_d = document.createElement("script");
		scr_d.src = options_.boschbackwardaudio + "/debug.js";
		document.head.appendChild(scr_d);

		var scr_is = document.createElement("script");
		scr_is.src = options_.boschbackwardaudio + "/inputstream.js";
		document.head.appendChild(scr_is);

		var scr_ll = document.createElement("script");
		scr_ll.src = options_.boschbackwardaudio + "/loglevel.min.js";
		document.head.appendChild(scr_ll);
		scr_ll.onload = function() {
			var scr_rcp = document.createElement("script");
			scr_rcp.src = options_.boschbackwardaudio + "/rcp.js";
			document.head.appendChild(scr_rcp);
		}

		var scr_rc2 = document.createElement("script");
		scr_rc2.src = options_.boschbackwardaudio + "/rcpclient2.js";
		document.head.appendChild(scr_rc2);

		var scr_u = document.createElement("script");
		scr_u.src = options_.boschbackwardaudio + "/utils.js";
		document.head.appendChild(scr_u);

		var scr_awp = document.createElement("script");
		scr_awp.src = options_.boschbackwardaudio + "/audioworklet-polyfill.js";
		document.head.appendChild(scr_awp);

		var scr_cs = document.createElement("script");
		scr_cs.src = options_.boschbackwardaudio + "/cookiesupport.js";
		document.head.appendChild(scr_cs);
	}

	if(!window.vxgplayer.players[id]){

		if(window.location.protocol != "https:" && vxgplayer.isFrame()){
			vxgplayer.checkWebSocket().done(function(result){
				//console.log('websocket: success');
			}).fail(function(err){
				vxgplayer.showNotStartedInIFrame(id);
			});
		}

		//window.location.href = "https://videoexpertsgroup.com/player_start/";
		window.vxgplayer.players[id] = new function(id, opts){
			var self = this;
			self.id = id;
			self.player = document.getElementById(id);
			/* init options */
			window.vxgplayer.initOptions(self, opts);

/*
			self.playerWidth=self.options.width || 640;
			self.playerHeight=self.options.height || 480;
			self.playerWidth = parseInt(self.player.getAttribute('width'),10) || self.playerWidth;
			self.playerHeight = parseInt(self.player.getAttribute('height'),10) || self.playerHeight;
			self.player.style.width = self.playerWidth + 'px';
			self.player.style.height = self.playerHeight + 'px';
*/

			self.wd = null;
			self.wdtries = 0;
			self.wdwork = null;

			var html = ''
				+ '<div class="vxgplayer-loader" style="display: inline-block"></div>'
				+ '<div class="vxgplayer-screenshot-loading" style="display: none">'
				+ '		<div class="vxgplayer-screenshot-loading">'
				+ '     </div>'
				+ '</div>'
				+ '<div class="vxgplayer-error" style="display: none">'
				+ '	<div class="vxgplayer-error-text" style="display: none"></div>'
				+ '</div>'
				+ '<div class="vxgplayer-controls-zoom-container">'
				+ '	<div class="vxgplayer-controls-zoom-position">'
				+ '		<div class="vxgplayer-zoom-position-cursor"></div>'
				+ '	</div>'
				+ '	<div class="vxgplayer-controls-zoom">'
				+ '		<div class="vxgplayer-zoom-up"></div>'
				+ '		<div class="vxgplayer-zoom-progress zoom10x"></div>'
				+ '		<div class="vxgplayer-zoom-down"></div>'
				+ '	</div>'
				+ '</div>'
				+ '<div class="vxgplayer-ptz">'
				+ '	<div class="vxgplayer-ptz-controls">'
				+ '		<div class="vxgplayer-ptz-arrow ptz-top"></div>'
				+ '		<div class="vxgplayer-ptz-arrow ptz-right"></div>'
				+ '		<div class="vxgplayer-ptz-arrow ptz-bottom"></div>'
				+ '		<div class="vxgplayer-ptz-arrow ptz-left"></div>'
				+ '		<div class="vxgplayer-ptz-zoom">'
				+ '			<div class="vxgplayer-ptz-zoom-plus"></div>'
				+ '			<div class="vxgplayer-ptz-zoom-minus"></div>'
				+ '		</div>'
				+ '	</div>'
				+ '</div>'
				+ '<div class="vxgplayer-controls">'
				+ '	<div class="vxgplayer-play"></div>'
				+ '	<div class="vxgplayer-pause" style="display: none"></div>'
				+ '	<div class="vxgplayer-stop" style="display: none"></div>'
				+ '	<div class="vxgplayer-volume-mute"></div>'
				+ '	<div class="vxgplayer-volume-container">'
				+ '		<input type="range" min="0" max="100" step="1" data-buffer="0" id="volume" class="vxgplayer-volume" data-rangeSlider>'
				+ '		<output></output>'
				+ '	</div>'
				+ '	<div class="vxgplayer-microphone disable"></div>'
				+ '	<div class="vxgplayer-volume-down"></div>'
				+ '	<div class="vxgplayer-volume-progress vol7"></div>'
				+ '	<div class="vxgplayer-volume-up"></div>'
				+'	<div class="vxgplayer-fullscreen"></div>'
				+ '	<div class="vxgplayer-show-ptz disable"></div>'
				+ '	<div class="vxgplayer-show-zoom"></div>'
				+'	<div class="vxgplayer-takescreenshot"></div>'
				+'	<div class="vxgplayer-scale"></div>'
				+ '</div>'
				+ '<canvas class="vxgplayer-stub-snapshot" style="width:100%; height:100%; display:none;"></canvas>'
				+ '<video class="vxgplayer-native-video contain" autoplay="yes" muted="yes" style="width:100%; height: 100%; position: absolute; background-color: #000;"></video>'
				+ '<video class="vxgplayer-stub-record" style="display: none;"></video>';

			self.player.innerHTML += html;

			var el_controls = self.player.getElementsByClassName('vxgplayer-controls')[0];
			var el_controls_zoom = self.player.getElementsByClassName('vxgplayer-controls-zoom')[0];
			var el_controls_zoom_position = self.player.getElementsByClassName('vxgplayer-controls-zoom-position')[0];
			var el_play = self.player.getElementsByClassName('vxgplayer-play')[0];
			var el_pause = self.player.getElementsByClassName('vxgplayer-pause')[0];
			var el_stop = self.player.getElementsByClassName('vxgplayer-stop')[0];
			var el_fullscreen = self.player.getElementsByClassName('vxgplayer-fullscreen')[0];
			var el_takescreenshot = self.player.getElementsByClassName('vxgplayer-takescreenshot')[0];
			var el_screenshot_loading = self.player.getElementsByClassName('vxgplayer-screenshot-loading')[0];
			var el_scale = self.player.getElementsByClassName('vxgplayer-scale')[0];
			var el_zoomUp = self.player.getElementsByClassName('vxgplayer-zoom-up')[0];
			var el_zoomDown = self.player.getElementsByClassName('vxgplayer-zoom-down')[0];
			var el_zoomProgress = self.player.getElementsByClassName('vxgplayer-zoom-progress')[0];
			var el_zoomPositionCursor = self.player.getElementsByClassName('vxgplayer-zoom-position-cursor')[0];
			var el_loader = self.player.getElementsByClassName('vxgplayer-loader')[0];
			var el_error = self.player.getElementsByClassName('vxgplayer-error')[0];
			var el_error_text = self.player.getElementsByClassName('vxgplayer-error-text')[0];
			var el_video  = self.player.getElementsByClassName('vxgplayer-native-video')[0];
			var el_snap_stub = self.player.getElementsByClassName('vxgplayer-stub-snapshot')[0];
			var el_record = self.player.getElementsByClassName('vxgplayer-stub-record')[0];
			var el_btnstart = document.getElementById(id + '_btnstart');

			var el_showzoom = self.player.getElementsByClassName('vxgplayer-show-zoom')[0];
			var el_zoomcontainer = self.player.getElementsByClassName('vxgplayer-controls-zoom-container')[0];
			var el_volume = self.player.getElementsByClassName('vxgplayer-volume')[0];
			var el_microphone = self.player.getElementsByClassName('vxgplayer-microphone')[0];

			self.video = el_video;
			self.m.versionapp = "unknown";
			self.m.debug = self.options.debug || self.player.hasAttribute('debug') || false;

			var watchdog_tr = self.player.getAttribute('watchdog') || self.options.watchdog;
			self.m.watchdog = ( (watchdog_tr !== undefined) && (watchdog_tr !==null) && (watchdog_tr !== "") ) ? parseInt(watchdog_tr,10) : 3;
			self.m.autostart = self.player.hasAttribute('autostart');
			self.m.is_opened = false;
			self.m.latency = 10000;
			self.m.controls = true;
			self.m.avsync = self.options.avsync || false;
			self.m.vxgReadyState = 0;
			self.m.autohide = self.options.autohide || 2000;
			self.m.lastErrorCode = -1;
			self.m.lastErrorDecoder = 0;
			self.m.autoreconnect = self.options.autoreconnect || 0;
			self.m.connection_timeout = self.options.connection_timeout || 0;
			self.m.connection_udp = self.options.connection_udp || 0;
			self.m.isCustomDigitalZoom = self.options.custom_digital_zoom || false;

			self.currentZoom = 10;
			self.m.snapshotFile = "";
			self.m.snapshotPTS = "-1";
			self.m.PTSVideo = "-1";
			self.m.PTSAudio = "-1";

			if(typeof rangeSlider !== "undefined") {
				rangeSlider.create(el_volume);
			}
			var selector = '[data-rangeSlider]', elements = document.querySelectorAll(selector);

			vxgplayer.initVolumeControls(self, false);
			vxgplayer.initPtzControls(self);

			if(self.options.disableZoomControl && self.options.disableZoomControl == true){
				el_showzoom.style.display = 'none';
			}

			if(self.m.debug){
				console.log("Player " + self.id + " - init new player");
			}

			self.set_controls_opacity = function(val){
				el_controls.style.opacity = val;
				el_controls_zoom.style.opacity = val;
				el_controls_zoom_position.style.opacity = val;
			}

			self.set_controls_display = function(val){
				el_controls.style.display = val;
				if(self.m.isCustomDigitalZoom == true){
					el_controls_zoom.style.display = "none";
					el_controls_zoom_position.style.display = "none";
				}else{
					el_controls_zoom.style.display = val;
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
				}
			}
			if(self.m.isCustomDigitalZoom == false){
				el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
			}

			if(self.player.hasAttribute('custom-digital-zoom')){
				self.m.isCustomDigitalZoom = true;
				el_controls_zoom.style.display = "none";
				el_controls_zoom_position.style.display = "none";
			}

			if(!self.player.hasAttribute('controls')){
				self.m.controls = true;
				self.set_controls_display("");
			}

			if(self.options.controls && self.options.controls == false){
				self.m.controls = false;
				self.set_controls_display("none");
			}

			self.m.avsync = self.player.hasAttribute('avsync');
			self.m.aspectRatio = (self.player.hasAttribute('aspect-ratio-mode'))?(parseInt(self.player.getAttribute('aspect-ratio-mode'),10)):0;

			if(self.player.hasAttribute('autohide')){
				self.m.autohide = parseInt(self.player.getAttribute('autohide'),10)*1000;
			}else if(self.options.autohide){
				self.m.autohide = self.options.autohide*1000;
			}

			self.timeout = undefined;

			self.loadSettings = function(){

				if(self.m.debug){
					console.log('Player ' + self.id + ' - loadSettings');
				}

				if(self.player.hasAttribute('auto-reconnect') || self.options.autoreconnect){
					self.m.autoreconnect = 1;
///					self.module.command('setautoreconnect', '1');

				}
				if(self.player.hasAttribute('connection-timeout')){
					self.m.connection_timeout = parseInt(self.player.getAttribute('connection-timeout'), 10);
				}
				if(self.options.connection_timeout != 0){
///					self.module.command('setconnection_timeout', self.m.connection_timeout.toString());
				}
				if(self.player.hasAttribute('connection-udp') || self.m.connection_udp){
					self.m.connection_udp = 1;
///					self.module.command('setconnection_udp', '1');
				}
				self.m.avsync = self.player.hasAttribute('avsync');
				self.m.aspectRatio = 0;

				if(self.player.hasAttribute('aspect-ratio-mode')){
					self.m.aspectRatio = parseInt(self.player.getAttribute('aspect-ratio-mode'), 10);
				}else if(self.options.aspect_ratio_mode){
					self.m.aspectRatio = self.options.aspect_ratio_mode;
				}
				self.aspectRatioMode(self.m.aspectRatio);
///				self.module.command('setavsync', self.m.avsync ? '1' : '0');
				if(self.player.hasAttribute('latency')){
					self.m.latency = parseInt(self.player.getAttribute('latency'), 10);
///					self.module.command('setlatency', self.m.latency.toString());
				}else if(self.options.latency){
					self.m.latency = self.options.latency;
///					self.module.command('setlatency', self.m.latency.toString());
				}

				window.vxgplayer.initVolumeControls(self, true);

				if(self.player.hasAttribute('autohide')){
					self.m.autohide = parseInt(self.player.getAttribute('autohide'),10)*1000;
				}else if(self.options.autohide){
					self.m.autohide = self.options.autohide*1000;
				}
			}

			self.moduleDidLoad = function(){
				if(self.m.debug){
					console.log('Player ' + self.id + ' - moduleDidLoad');
				}
				self.loadSettings();

				if(window.location.protocol == "https:"){
					//use Native protocol
					self.connectToApp();
				}else{
					//use Websocket protocol
///					self.module.command('startwebsclient', vxgplayer.webserverport)
				}
			}
			self.playerDidLoad = function(){
				self.loadSettings();

				if(self.m.debug){
					console.log('Player ' + self.id + " - playerDidLoad");
				}

				if(self.onReadyStateCallback){
					self.m.is_opened = false;
					self.onReadyStateCallback();
				}else{
					self.setSource(); //binary, wsurl and rtspurl should be inited
				}
			}

			self.connectToApp = function(){
				if(self.m.debug){
					console.log('Player ' + self.id + ' connectToApp');
				}
				//self.m.port = chrome.runtime.connect("hncknjnnbahamgpjoafdebabmoamcnni");
				//self.m.port = chrome.runtime.connect("invalid");
				if(self.m.debug){
					console.log('Player ' + self.id + ' connected port='+self.m.port);
				}
				self.m.portName = ""+ new Date().getTime().toString();
				if(self.m.debug)
					console.log('connected portName='+self.m.portName);
			}

			self.showerror = function(text){
				el_loader.style.display = "none";
				el_error.style.display = "inline-block";
				el_error_text.style.display = "inline-block";
				el_error_text.innerHTML = text;
			}

			self.hideerror = function(text){
				el_error.style.display = "none";
				el_error_text.style.display = "none";
			}

			self.readyState = function(){
				return self.m.vxgReadyState;
			}

			self.onReadyStateChange = function(cb){
				self.onReadyStateCallback = cb;
			}
			self.ready = self.onReadyStateChange;

			self.onStateChange = function(cb){
				self.onStateChangeCallback = cb;
			}

			self.onBandwidthError = function(cb){
				self.m.handlerBandwidthError = cb;
			}

			self.onError = function(cb){
				self.m.handlerError = cb;
			}


			self.restartTimeout = function(){
				if(self.m.autohide <= 0){
					self.set_controls_opacity("0");
					return;
				}
				self.set_controls_opacity("1.0");
				clearTimeout(self.timeout);
				self.timeout = setTimeout(function(){
					self.set_controls_opacity("0");
				},self.m.autohide);
			};

			self.player.addEventListener('mousemove', function(){
				self.restartTimeout();
			}, true);

			self.restartTimeout();

/*
			//self.module.addEventListener('load', self.moduleDidLoad, true);
*/
			if (typeof window.attachListeners !== 'undefined') {
			  window.attachListeners();
			}

			self.error = function(){
				return self.m.lastErrorCode;
			}
			self.errorDecoder = function(){
				return self.m.lastErrorDecoder;
			}

			self.controls = function(val){
				if(val == undefined){
					return self.m.controls;
				}else{
					if(val == true){
						self.set_controls_display("");
						self.m.controls = true;
					}else if(val == false){
						self.set_controls_display("none");
						self.m.controls = false;
					}
				}
			}

			self.debug = function(val){
				if(val == undefined){
					return self.m.debug;
				}else{
					self.m.debug = val;
				}
			}
			self.play = function(){
				self.hideerror();

				if (self.pipeline === undefined || self.pipeline == null) {
					var isCreated = self.createPipeline();
					if (isCreated != true) {
						el_loader.style.display = "none";
						return;
					}
				}

				self.showPtzControl()

				self.pipeline.ready.then(function(){
					firstPackage = null;
					self.pipeline.rtsp.play();
					//self.pipeline.play();
					self.video.onplaying = function(arg){
						console.log('onplaying');
						el_loader.style.display = "none";
					}

					self.video.play();
					
					if (self.audIsRun == false) {
						self.audIsRun = true;
					}

					el_stop.style.display = "inline-block";
					el_pause.style.display = "inline-block";
					if (!self.options.disableGetShot || self.options.disableGetShot === false) {
						el_takescreenshot.style.display = "inline-block";
					}
					//el_loader.style.display = "none";
					if(self.onStateChangeCallback){
						self.onStateChangeCallback(self.m.vxgReadyState);
					}
				});

				if(self.m.debug)
					console.log( 'self.play self.m.url='+self.m.url + ' self.m.is_opened='+self.m.is_opened);

				if(!self.m.is_opened){
					self.m.is_opened = true;
///					self.module.command('open', self.m.url);
				}

				el_play.style.display = "none";
				if(self.m.vxgReadyState != 4) {//not paused=>play, show progress
					el_loader.style.display = "inline-block";
				}
///				self.module.command('play', '0');
				self.applyVolume();
				self.wdwork = setTimeout(function(){
					self.updateStreamInfo();
				}, 3000);
			};

			self.updateStreamInfo = function() {
				if (self.pipeline) {
					var curtime = self.pipeline.currentTime;

					if(self.m.debug){
						console.log("curtime:" + curtime + "; wd:" + self.wd);
					}

					if (self.m.watchdog <= 0 ) {
						console.log('Watchdog disabled by user');
						return;
					}

					if ((self.wd == null) || ((curtime - self.wd >= 0.0) && (self.wdtries < self.m.watchdog) ) ){
						if (curtime - self.wd < 0.2) {
						    self.wdtries += 1;
						} else {
						    self.wdtries = 0;
						}
						self.wd = curtime;
						self.wdwork = setTimeout(function(){
							self.updateStreamInfo();
						}, 3000);
					} else {
						console.log('restart by wd');
						self.wdtries	= 0;
						self.wd		= null;
						clearTimeout(self.wdwork);
						self.wdwork = null;

						self.stop();
						self.play();
					}
				}
			}

			self.stop = function(){
///				self.module.command('stop', '0');
				var el_ptz_controller = self.player.getElementsByClassName('vxgplayer-ptz')[0];
				var el_controls_ptz_switcher = self.player.getElementsByClassName('vxgplayer-show-ptz')[0];
				el_ptz_controller.classList.remove('show');
				el_controls_ptz_switcher.classList.remove('show');
				el_controls_ptz_switcher.classList.add('disable');
				
				if (self.wdwork) {
					clearTimeout(self.wdwork);
					self.wdwork = null;
				}
				self.wdtries = 0;
				self.wd = null;

				if (self.pipeline !== undefined && self.pipeline != null) {
					self.pipeline.pause();
					self.pipeline.close();
					self.pipeline = null;
				}
				if (self.audioCtx) {
					self.audioCtx.close();
					self.audioCtx = null;
					self.audIsRun = false;
					self.audBuffer.clear();
					self.audBuffer = null;
				}

				self.video.src = "";
				self.video.load();

				self.m.vxgReadyState = 0;
				el_play.style.display = "none";
				el_stop.style.display = "none";
				el_pause.style.display = "none";
				
				el_takescreenshot.style.display = "none";
				if(self.onStateChangeCallback){
					self.onStateChangeCallback(self.m.vxgReadyState);
				}

				el_loader.style.display = "none";
			};

			self.pause = function(){
///				self.module.command('pause', '0');
				self.pipeline.pause();
				self.audIsRun = false;

				self.m.vxgReadyState = 4;
				el_play.style.display = "inline-block";
				el_stop.style.display = "inline-block";
				el_pause.style.display = "none";
				// el_takescreenshot.style.display = "none";
				if(self.onStateChangeCallback) {
					self.onStateChangeCallback(self.m.vxgReadyState);
				}
				if (self.wdwork) {
					clearTimeout(self.wdwork);
					self.wdwork = null;
				}

				el_loader.style.display = "none";
			};

			self.autohide = function(val){
				if(val){
					self.m.autohide = val*1000;
				}else{
					return self.m.autohide/1000;
				}
			}

			self.autoreconnect = function(val){
				if(val == undefined){
					return self.m.autoreconnect;
				}else{
					self.m.autoreconnect = parseInt(val,10);
///					self.module.command('setautoreconnect', self.m.autoreconnect.toString());
				}
			};


			self.latency = function(val){
				if(val){
					self.m.latency = parseInt(val,10);
///					self.module.command('setlatency', val.toString());
				}else{
					return self.m.latency;
				}
			};
			self.connection_timeout = function(val){
				if(val){
					self.m.connection_timeout = parseInt(val,10);
///					self.module.command('setconnection_timeout', val.toString());
				}else{
					return self.m.connection_timeout;
				}
			};
			self.connection_udp = function(val){
				if(val){
					self.m.connection_udp = parseInt(val,10);
///					self.module.command('setconnection_udp', val.toString());
				}else{
					return self.m.connection_udp;
				}
			};

			self.aspectRatioMode = function(val){
				if(val == undefined){
					return self.m.aspectRatioMode;
				}else{
					self.m.aspectRatioMode = (val > 0)?val:self.m.aspectRatioMode;
					self.m.aspectRatio = val;

					if (val == 0) {
						self.video.classList.remove('fill');
						self.video.classList.remove('cover');
						self.video.classList.add('contain');
					} else if (val == 1) {
						self.video.classList.remove('fill');
						self.video.classList.add('cover');
						self.video.classList.remove('contain');
					} else if (val == 2) {
						self.video.classList.add('fill');
						self.video.classList.remove('cover');
						self.video.classList.remove('contain');
					}
				}
			}
			self.aspectRatioMode(self.m.aspectRatio);

			self.avsync = function(val){
				if(val == undefined){
					return self.m.avsync;
				}else{
					self.m.avsync = val;
///					self.module.command('setavsync', self.m.avsync ? '1':'0');
				}
			}

			self.isPlaying = function(){
				return (self.m.vxgReadyState == 2);
			}
			self.versionPLG = function(){
				return window.vxgplayer.version;
			}
			self.versionAPP = function(){
				return self.m.versionapp;
			}

			self.size = function(width, height){
				if(width && height){
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
				}
			};

			self.changedFullscreen = function(){
				console.log('changedFullscreen');
				if (document.webkitIsFullScreen){
					self.size('100%', '100%');
					console.log('changedFullscreen -> fullscreen');
				}else{
					self.size(self.playerWidth + 'px', self.playerHeight + 'px');
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
				}else{
					if(self.player.requestFullscreen) {
						self.player.requestFullscreen();
					} else if(self.player.webkitRequestFullscreen) {
						self.player.webkitRequestFullscreen();
					} else if(self.player.mozRequestFullscreen) {
						self.player.mozRequestFullScreen();
					}
				}
			};

			self.takescreenshot = function(){
				var stub	= el_snap_stub;
				var videotag	= el_video;
				if (videotag != null ) {
					var width 	= videotag.videoWidth ;
					var height	= videotag.videoHeight;
					if ((width > 0) && (height > 0)) {
						stub.setAttribute('width', width);
						stub.setAttribute('height', height);
						context = stub.getContext('2d');
						if (context != null) {
							context.fillRect(0, 0, width, height);
							context.drawImage(videotag, 0, 0, width, height);
							var downloadLink = document.createElement('a');
							downloadLink.setAttribute('download', 'snapshot.png');
							stub.toBlob(function(blob) {
								var url = URL.createObjectURL(blob);
								downloadLink.setAttribute('href', url);
								downloadLink.click();
							});
						}
					}
				}
//				el_screenshot_loading.style.display = "block";
//				setTimeout(function(){
//					el_screenshot_loading.style.display = "";
//				},3000);
			};

			self.getScreenshotPTS = function(){
				return self.m.snapshotPTS;
			};
			self.getPTSVideo = function(){
				return self.m.PTSVideo;
			};
			self.getPTSAudio = function(){
				return self.m.PTSAudio;
			};

			self.initAudioCtx = function() {
				if (self.audioCtx != null && self.audioCtx !== undefined) {
					return;
				}
				if (self.options.ext_setMute || self.options.ext_setVolume){
					return;
				}
				try {
					window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext;
					self.audioCtx = new AudioContext();
					self.audioCtx.onstatechange = function() {
						if (self.audioCtx !== null && self.audioCtx !== undefined) {
							if (self.audioCtx.state === "running") {
								console.log("<binary> audio context running");
								self.audIsRun = true;
							} else if (audioContext.state === "closed") {
								console.log("<binary> audio context close");
								self.audioCtx = null;
								self.audIsRun = false;
							}
						}
					}
					if (self.audioCtx !== undefined && self.audioCtx !== null) {
						self.audioGain = self.audioCtx.createGain();
						self.audBuffer = new audioBufferPCM(self.audioCtx, self.audioGain, 8000, 48);
						self.audioGain.connect(self.audioCtx.destination)
					}
					return true;
				} catch (err) {
					console.warn("Web Audio API is not supported in this web browser! : ", err);
				}
			}

			self.audioPlayBuffer = function( data ) {
				if (!self.audIsRun) {
					return;
				}
				//test sinus for noise camera
				//for (var i = 0; i < data.length; ++i) {
				//	data[i] = (Math.sin( i ) + 1.0) * 256;
				//}

				var data_js = new Float32Array(data.length);
				for (var i = 0; i < data.length; i++) {
					data_js[i] = data[i] / Math.pow(2, 15)
				}

				if(self.isMute()) {
					self.audioGain.gain.value = 0;
				} else {
					self.audioGain.gain.value = self.m.volume;
				}

				if (self.audBuffer != null && self.audBuffer !== undefined) {
					self.audBuffer.addBuffer( data_js);
				}

				delete data_js;
				data_js = null;
			}


			self.recordedData264	= null;
			self.recordedData711	= null;
			var recData264Len	= 0;
			var recData711Len	= 0;
			var isRecording		= false;
			var isRecStopping	= false;
			var firstPackage	= null;
			var record_wd		= null;
			var record_try		= 0;
			var prevRecLen		= 0;
			self.rech264maxsize	= self.options.clipH264maxsize || Number(self.player.getAttribute('clipH264maxsize')) || 768*1024*1024; //~10min for 10Mbit
			self.recg711maxsize	= self.options.clipG711maxsize || Number(self.player.getAttribute('clipG711maxsize')) || 64*1024*1024;
			self.defaultClipName	= self.options.clipname || self.player.getAttribute('clipname') || 'clip';


			self.m.debug = self.options.debug || self.player.hasAttribute('debug') || false;

			self.createPipeline = function(){
				el_loader.style.display = "inline-block";
				firstPackage = null;

				if (!vxg_msl_pipelines){
					if (CloudHelpers.isIE()){
						console.warn('MediaStreamLibrary is not supported by browser');
					} else {
						console.warn('MediaStreamLibrary is not loaded yet');
					}
					return false;
				}

				if ((self.m.wsurl  !== undefined && self.m.wsurl.length > 0)
				&& (self.m.rtspurl !== undefined && self.m.rtspurl.length > 0)){
				    self.m.is_opened = true;
				    var Pipeline = vxg_msl_pipelines.Html5VideoPipeline_HTTP;
					var mediaElement = el_video;
					var authopts = {};

					if (self.m.protocol == "ws:" || self.m.protocol == "wss:")					
						Pipeline = vxg_msl_pipelines.Html5VideoPipeline;
					else
						Pipeline = vxg_msl_pipelines.Html5VideoPipeline_HTTP;					

					if (self.m.user && self.m.password) {
						authopts = {
							username: self.m.user,
							password: self.m.password
						}
					}

					if(self.pipeline === undefined || self.pipeline == null) {
						self.pipeline = new Pipeline({
							ws: {
								uri: self.m.wsurl
							},
							rtsp: {
								uri: self.m.rtspurl
							},
							auth: authopts,
							mediaElement: mediaElement
						});
					}

					var dataCatcherRTP = new vxg_msl_components.dataCatcherDepay(0);//ULAW
					dataCatcherRTP.onDataCallback = function( msg) {
						if(self.m.debug){
							console.log('Playback' + ((isRecording)?('+Recording'):('')) +': data(ulaw) catcher: len ' + msg.data.length + ' type:' + msg.type + ' rawdata len ' + msg.rawdata.length  );
						}
						if (isRecording == true) {
							if (recData711Len + msg.data.length < self.recg711maxsize) {
								var data = msg.data;
								self.recordedData711.set( data, recData711Len);
								recData711Len += data.length;

								delete msg.data;
								delete data; data = null;
							}
						}
						msg = null;
					}
					self.pipeline.insertAfter(self.pipeline.firstComponent.next, dataCatcherRTP);

					self.pipeline.onDataCallback = function(msg) { // mp4 with H264 or H264+AAC
						if(self.m.debug){
							console.log( 'Playback' + ((isRecording)?('+Recording'):('')) +': w.data length:' + msg.data.length );
						}
						if (firstPackage == null) {
							firstPackage = msg.data;
						}

						if (isRecording == true) {
							if( recData264Len + msg.data.length < self.rech264maxsize) {
								var data = msg.data;
								self.recordedData264.set( data, recData264Len);
								recData264Len += data.length;

								delete msg.data;
								delete data; data = null;
							}
						}
						msg = null;
					}
/* raw pcm (after g711 decode) data callback*/
				    var dataCatcherPCM = new vxg_msl_components.g711toPCM(); //96-h264, 97-aac, 98-metadata, 0-g711?
				    dataCatcherPCM.onDataCallback = function( msg) {
					self.initAudioCtx();
					self.audioPlayBuffer(msg.data);

					delete msg.data;
					msg = null;
				    }
				    self.pipeline.insertAfter(self.pipeline.firstComponent.next.next, dataCatcherPCM);

				    self.pipeline.onSdp = function(sdp) {
						console.log('onSdp');
						var str = sdp.rawdata.toString();
						console.log(str);
						console.log(sdp);
				     }
				    return true;
				}
				return false;
			}

			function runPipeline() {
				var isCreated = self.createPipeline();
				if (isCreated) {
					self.wdtries = 0;
					self.play();
				} else {
					self.m.is_opened = false;
					self.stop();
					return undefined;
				}
			}

			function checkCameraCapabilities() {
				//TODO: check backwardaudio
				if (!CloudHelpers.isIE()){
					el_microphone.classList.remove('disable');
				}

				if (self.options.disableBackwardAudio === true) {
					el_microphone.classList.remove('disable');
				}

				if (self.options.disablePTZ === true) {
					runPipeline();
				} else {
					var ptz_promise = self.checkPtzAvailable();
					if (ptz_promise == null) {
						return;
					}

					ptz_promise.done(function(){
						runPipeline();
					}).fail(function(){
						runPipeline();
					});
				}
			}

			self.setSource = function ( obj ) {
				if (obj !== undefined) {
					if (obj.options !== undefined) {
						if (obj.options.disableZoomControl !== undefined){
							self.options.disableZoomControl = obj.options.disableZoomControl;
						}
						if (obj.options.disableAudioControl !== undefined){
							self.options.disableAudioControl = obj.options.disableAudioControl;
						}
						if (obj.options.disableMicControl !== undefined){
							self.options.disableMicControl = obj.options.disableMicControl;
						}
						if (obj.options.disableSpeakerControl !== undefined){
							self.options.disableSpeakerControl = obj.options.disableSpeakerControl;
						}
						if (obj.options.disableGetShot !== undefined){
							self.options.disableGetShot = obj.options.disableGetShot;
						}
						if (obj.options.disableGetClip !== undefined){
							self.options.disableGetClip = obj.options.disableGetClip;
						}
						if (obj.options.disablePTZ !== undefined){
							self.options.disablePTZ = obj.options.disablePTZ;
						}
						if (obj.options.disableBackwardAudio !== undefined){
							self.options.disableBackwardAudio = obj.options.disableBackwardAudio;
						}

						window.vxgplayer.initVolumeControls(self, true);
						if(self.options.disableZoomControl && self.options.disableZoomControl == true){
							el_showzoom.style.display = 'none';
						}

						var el_controls_ptz_switcher = self.player.getElementsByClassName('vxgplayer-show-ptz')[0];
						el_controls_ptz_switcher.classList.add('disable');
					}
					if (obj.url !== undefined) {
						el_loader.style.display = "inline-block";

						var parsed_url = CloudHelpers.parseUri(obj.url);
						
						if (parsed_url.protocol == "ws" || parsed_url.protocol == "wss")
						{
							self.m.wsurl = parsed_url.protocol + '://'
							+ parsed_url.host
							+ (parsed_url.port?(':' + parsed_url.port):(''))
							+ parsed_url.path.replace("rtsp_tunnel","websocket/rtsp_tunnel")
							
						} else
						{														
						self.m.wsurl = parsed_url.protocol + '://'
						+ parsed_url.host
						+ (parsed_url.port?(':' + parsed_url.port):(''))
						+ parsed_url.path
						+ parsed_url.query;
						}

						self.m.user = obj.user || parsed_url.user || "";
						self.m.password = obj.password || parsed_url.password || "";

						var path_idx = parsed_url.path.indexOf('rtsp_tunnel');
						if(path_idx < 0) {
							self.m.wsurl += '/rtsp_tunnel';
							self.m.rtspurl	= 'rtsp://127.0.0.1:554/rtsp_tunnel?p=0&h26x=4&aon=1&aud=1';
						} else {
							self.m.rtspurl= 'rtsp://127.0.0.1:554/rtsp_tunnel' + parsed_url.query;
						}

						//self.m.rtspurl= 'rtsp://127.0.0.1:554/rtsp_tunnel?line=1&inst=1&enableaudio=1&aud=1';
						//'rtsp://127.0.0.1/rtsp_tunnel?h26x=4&line=1&inst=2&rec=0&vcd=1&enableaudio=1&aud=1&skipbframes=1&skipsei=0';
						path_idx = parsed_url.path.indexOf('rtsp_tunnel');
						if (path_idx <= 0) {
							self.m.path = parsed_url.path.slice(1);
						} else {
							self.m.path = parsed_url.path.slice(1, path_idx);
						}
						self.m.cameraIP = parsed_url.host;
						self.m.wsport = parsed_url.port;
						self.m.rtspport = '11254';
						self.m.protocol = parsed_url.protocol + ':';
					}
					if (self.m.cameraIP === undefined) {
						//fill default values, if url is undefined or can't be parsed
						self.m.wsurl	= 'http://82.200.1.86:11280/rtsp_tunnel?line=1&inst=1&enableaudio=1&aud=1';
						self.m.rtspurl	= 'rtsp://127.0.0.1:11254/rtsp_tunnel?p=0&h26x=4&aon=1&aud=1';
						self.m.path     = ''
						self.m.cameraIP = '82.200.1.86';
						self.m.wsport 	= '11280';
						self.m.rtspport = '11254';
						self.m.protocol = "http:";
					}

					//self.checkPtzAvailable();
					checkCameraCapabilities();
				}
			}


			self.dispose = function(){
				self.stop();
				self.player.innerHTML = "";
				delete window.vxgplayer.players[self.id];
			}

			self.custom_digital_zoom = function(newval){
				if(newval != undefined){
					if(self.m.isCustomDigitalZoom == false && newval == true){
						self.m.isCustomDigitalZoom = true;
						self.setCustomDigitalZoom(100,0,0); // reset
						self.set_controls_display("");
					}else if(self.m.isCustomDigitalZoom == true && newval == false){
						self.m.isCustomDigitalZoom = false;
						self.set_controls_display("");
						self.setNewZoom(10);
					}
				}else{
					return self.m.isCustomDigitalZoom;
				}
			}

			self.setCustomDigitalZoom = function(ratio, x, y){
				if (ratio !== parseInt(ratio, 10) || x !== parseInt(x, 10) || y !== parseInt(y, 10)){
					throw "[VXGPLAYER] setDigitalZoom / Some values is not integer";
				}
				if(ratio < 100 || ratio > 500){
					throw "[VXGPLAYER] setDigitalZoom / Parameter Ratio must be 100..500";
				}
				if(self.m.isCustomDigitalZoom != true){
					throw "[VXGPLAYER] setDigitalZoom / Please enable custom digital zoom";
				}
				self.video.style.transform = "scale(" + (ratio/100) + ")";

				el_controls_zoom_position.style.display = "none";
				var s = self.size();
				var newx = x - s.width/2;
				var newy = y - s.height/2;
				var neww = s.width*(100/ratio);
				var newh = s.height*(100/ratio);
				var left = Math.floor(-100*(newx + neww/2)/neww);
				var top = Math.floor(-100*(newy + newh/2)/newh);

				self.video.style.left = left + '%';
				self.video.style.top = top + '%';
			}

			self.setNewZoom = function(v){
				if(v >= 30){ v = 30; }
				if(v <= 10){ v = 10; }

				if(self.currentZoom != v){
					self.currentZoom = v;

					self.video.style.transform = "scale(" + (ratio/100) + ")";


					el_zoomPositionCursor.style.transform = "scale(" + (10/self.currentZoom) + ")";
					el_zoomProgress.className = el_zoomProgress.className.replace(/zoom\d+x/g,'zoom' + Math.ceil(self.currentZoom) + 'x');
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";

					self.video.style.left = left + '%';
					self.video.style.top = top + '%';

					el_zoomPositionCursor.style.left = '';
					el_zoomPositionCursor.style.top = '';
				}
			}

			self.zoomUp = function(){
				self.setNewZoom(self.currentZoom + 5)
			}
			self.zoomDown = function(){
				self.setNewZoom(self.currentZoom - 5);
			}
			self.zoomProgressDownBool = false;
			self.zoomProgressDown = function(e){
				self.zoomProgressDownBool = true;
			}

			self.zoomProgressMove = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
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
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);
				}
				self.zoomProgressDownBool = false;
			}

			self.zoomCursorDownBool = false;
			self.zoomCursorX = 0;
			self.zoomCursorY = 0;
			self.zoomCursorWidth = 176;
			self.zoomCursorHeight = 160;
			self.zoomControlsWidth = 0;
			self.zoomControlsHeight = 0;
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
					if(newx < minX) newx = minX;
					if(newy < minY) newy = minY;
					if(newx >= maxX) newx = maxX;
					if(newy >= maxY) newy = maxY;
					el_zoomPositionCursor.style.left = newx + "px";
					el_zoomPositionCursor.style.top = newy + "px";
					var zoom = self.currentZoom/10 - 1;
					var left = Math.floor(-100*((newx/d2x)*zoom));
					var top = Math.floor(-100*((newy/d2y)*zoom));

					self.video.style.left = left + '%';
					self.video.style.top = top + '%';
				}
			}

			self.setNewZoom = function(v){
				if(v >= 30){ v = 30; }
				if(v <= 10){ v = 10; }

				if(self.currentZoom != v){
					self.currentZoom = v;

					self.video.style.transform = "scale(" + (self.currentZoom/10) + ")";

					el_zoomPositionCursor.style.transform = "scale(" + (10/self.currentZoom) + ")";
					el_zoomProgress.className = el_zoomProgress.className.replace(/zoom\d+x/g,'zoom' + Math.ceil(self.currentZoom) + 'x');
					el_controls_zoom_position.style.display = self.currentZoom == 10 ? "none" : "";
					self.video.style.left = '';
					self.video.style.top = '';

					el_zoomPositionCursor.style.left = '';
					el_zoomPositionCursor.style.top = '';
				}
			}

			self.zoomUp = function(){
				self.setNewZoom(self.currentZoom + 5)
			}
			self.zoomDown = function(){
				self.setNewZoom(self.currentZoom - 5);
			}
			self.zoomProgressDownBool = false;
			self.zoomProgressDown = function(e){
				self.zoomProgressDownBool = true;
			}

			self.zoomProgressMove = function(e){
				if(self.zoomProgressDownBool == true){
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
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
					var y = e.pageY - vxgplayer.getAbsolutePosition(e.currentTarget).y;
					var height = el_zoomProgress.offsetHeight;
					var steps = height/5;
					y = 10*(Math.floor((height-y)/steps)/2 + 1);
					self.setNewZoom(y);
				}
				self.zoomProgressDownBool = false;
			}

			self.zoomCursorDownBool = false;
			self.zoomCursorX = 0;
			self.zoomCursorY = 0;
			self.zoomCursorWidth = 160;
			self.zoomCursorHeight = 120;
			self.zoomControlsWidth = 0;
			self.zoomControlsHeight = 0;
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
					if(newx < minX) newx = minX;
					if(newy < minY) newy = minY;
					if(newx >= maxX) newx = maxX;
					if(newy >= maxY) newy = maxY;
					el_zoomPositionCursor.style.left = newx + "px";
					el_zoomPositionCursor.style.top = newy + "px";
					var zoom = self.currentZoom/10 - 1;
					var left = Math.floor(-100*((newx/d2x)*zoom));
					var top = Math.floor(-100*((newy/d2y)*zoom));
					self.video.style.left = left + '%';
					self.video.style.top = top + '%';

				}
			}

			var isAudioCapture = false;
			var audioCapture = null;

			var m_audiobackchannel = null;
			var m_audiobackchannelstatus = 0;

			el_microphone.onclick = function() {
				if (m_audiobackchannelstatus == 0) {
					if (self.options.ext_backwardAudioStatus) {
						self.options.ext_backwardAudioStatus("prepare");
					} else {
						self.backwardAudioStatus("prepare");
					}

					if (self.options.ext_sendBackwardAudio) {
						self.options.ext_sendBackwardAudio(true);
					} else {
						self.startBackwardAudio();
					}
				} else {
					if (self.options.ext_sendBackwardAudio) {
						self.options.ext_sendBackwardAudio(false);
					} else {
						self.stopBackwardAudio();
					}

					if (self.options.ext_backwardAudioStatus) {
						self.options.ext_backwardAudioStatus("stop");
					} else {
						self.backwardAudioStatus("stop");
					}
				}
			}

			self.backwardAudioStatus = function(status) {
				var element = el_microphone;
				if (status === "prepare") {
					element.classList.add("prepare");
				} else if (status === "error") {
					element.classList.remove("onair");
					m_audiobackchannelstatus = 0;
				} else if (status === "onair") {
					element.classList.remove("prepare");
					element.classList.add("onair");
					m_audiobackchannelstatus = 1;
				} else {
					element.classList.remove("prepare");
					element.classList.remove("onair");
					m_audiobackchannelstatus = 0;
				}
			}

			self.startBackwardAudioBosch = function() {
				var params = {};
				params.bosch_backaud_camera_ip = self.m.cameraIP ;
				params.bosch_backaud_camera_port = self.m.wsport;
				params.bosch_backaud_camera_path = self.m.path;
				params.bosch_backaud_camera_protocol = self.m.protocol;
				params.username = self.m.user;
				params.password = self.m.password;
				
				params.options = options_;
				if (!m_audiobackchannel) {
					params.options = self.options;
					m_audiobackchannel = new AudioBackChannel(params);
				}
				m_audiobackchannel.setParams(params);
				
				m_audiobackchannel.connect().then(function(res) {
					console.log('Player('+self.id+') audiobackward connected');
					if (self.options.ext_backwardAudioStatus) {
						self.options.ext_backwardAudioStatus("onair");
					} else {
						self.backwardAudioStatus("onair");
					}
					m_audiobackchannelstatus = 1;
				}).catch(function(res) {
					if (self.options.ext_backwardAudioStatus) {
						self.options.ext_backwardAudioStatus("stop");
					} else {
						self.backwardAudioStatus("stop");
					}
					console.log('fail: ', res);
				});
			}

			self.stopBackwardAudioBosch = function() {
				if (m_audiobackchannel) {
					m_audiobackchannelstatus = 0;
					self.backwardAudioStatus("stop");
					m_audiobackchannel.disconnect();
				}
			}

			self.startBackwardAudio =  function () {
				if (1) {
					self.startBackwardAudioBosch();
					return;
				}

				if (self.isAudioCapture) {
					return;
				}

				if (!self.pipeline.rtsp.audioback_chnl) {
					console.warn('backward channel not found in SDP');
					return;
				}

				if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
					console.log('getUserMedia supported.');
					navigator.mediaDevices.getUserMedia ({ audio: true })
					.then(function(stream) {
						var buflen	= 2048;
						var numchannels = 1;
						var rtp_pkt;
						var rtsp_hdr;

						self.audioCapture = new AudioContext({ sampleRate: 8000 });
						var input = self.audioCapture.createMediaStreamSource(stream);

						var node = (input.context.createScriptProcessor ||
							input.context.createJavaScriptNode).call(input.context,
							    buflen, numchannels, numchannels
							);
						self.isAudioCapture = true;
						input.connect(node);
						node.connect(input.context.destination);

						node.onaudioprocess = function(e) {
							if (self.isAudioCapture) {
								var data = e.inputBuffer.getChannelData(0);

							/*
								console.log("got audio buffer: " + e.inputBuffer.length
								+ " for " + e.inputBuffer.duration
								+ " samplerate " + e.inputBuffer.sampleRate
								+ " data: [" + data[0] + "][" + data[1] + "][" + data[2] + "][" + data[3] + "]"
								);
							*/


								if (!rtsp_hdr) {

									//console.log(self.pipeline);
									//console.log(self.pipeline.rtsp);
									//console.log(self.pipeline.rtsp.audioback_chnl);

									// Stream data (such as RTP packets) is encapsulated by an ASCII dollar sign
									// (0x24 hexadecimal), followed by one byte of channel identifier, followed by two bytes of the length of
									// the encapsulated binary data.The stream data follows immediately afterwards.Each $ block contains
									// only one upper layer protocol data unit, such as an RTP packet.
									var len = e.inputBuffer.length + 12;
									rtsp_hdr = new Uint8Array(4);
									rtsp_hdr[0] = 0x24;
									rtsp_hdr[1] = self.pipeline.rtsp.audioback_chnl;
									rtsp_hdr[2] = (len >>> 8);
									rtsp_hdr[3] = (len & 0xFF);
									rtsp_hdr._isBuffer = true;
									rtsp_hdr.data = rtsp_hdr;

									/* RFC3550 http://www.ietf.org/rfc/rfc3550.txt
									V = 2,  // version. always 2 (2 bits)
									P = 0,  // padding. (1 bit)
									X = 0,  // header extension (1 bit)
									CC = 0, // CSRC count (4 bits)
									M = 0,  // marker (1 bit)
									PT = 0, // payload type. (7 bits)
									SN =    // sequence number. SHOULD be random (16 bits)
									TS = 1, // timestamp (32 bits)
									SSRC = 1; // synchronization source (32 bits)
									//CSRC = 0, // contributing sources (32 bits)
									//DP = 0, // header extension, 'Defined By Profile' (16 bits)
									//EL = 0; // header extension length (16 bits)
									*/
									rtp_pkt = new Uint8Array(len);
									rtp_pkt[0] = 0x80;
									rtp_pkt[1] = 0;//ulaw
									var SN = Math.floor(1000 * Math.random());
									rtp_pkt[2] = (SN >>> 8)
									rtp_pkt[3] = (SN & 0xFF);
									rtp_pkt[4] = 0;
									rtp_pkt[5] = 0;
									rtp_pkt[6] = 0;
									rtp_pkt[7] = 1;
									rtp_pkt[8] = 0;
									rtp_pkt[9] = 0;
									rtp_pkt[10] = 0;
									rtp_pkt[11] = 1;
									rtp_pkt._isBuffer = true;
									rtp_pkt.data = rtp_pkt;
								}

								var seq = (rtp_pkt[2] << 8 | rtp_pkt[3]) + 1;
								seq = seq.toUnsigned();
								if (seq <= 65535) {
									rtp_pkt[2] = (seq >>> 8);
									rtp_pkt[3] = (seq & 0xFF);
								}

								var time = (rtp_pkt[4] << 24 | rtp_pkt[5] << 16 | rtp_pkt[6] << 8 | rtp_pkt[7]) + rtp_pkt.length;
								time = time.toUnsigned();
								if (time <= 4294967295) {
									rtp_pkt[4] = (time >>> 24);
									rtp_pkt[5] = (time >>> 16 & 0xFF);
									rtp_pkt[6] = (time >>> 8 & 0xFF);
									rtp_pkt[7] = (time & 0xFF);
								}

								self.pipeline._src.outgoing.write(rtsp_hdr);
								self.pipeline._src.outgoing.write(rtp_pkt);

								var BIAS = 0x84;
								var CLIP = 32635;

								for (var i = 0; i < e.inputBuffer.length; ++i) {
									var pcm_16_sample = Math.min(1, data[i]) * 0x7FFF;
									var sign = (pcm_16_sample >> 8) & 0x80;
									if (sign != 0) pcm_16_sample = -pcm_16_sample;
									pcm_16_sample = pcm_16_sample + BIAS;
									if (pcm_16_sample > CLIP) pcm_16_sample = CLIP;
									var exponent = ulawencodeTable[(pcm_16_sample >> 7) & 0xFF];
									var mantissa = (pcm_16_sample >> (exponent + 3)) & 0x0F;
									rtp_pkt[i+12] = ~(sign | (exponent << 4) | mantissa);
								}

								self.pipeline._src.outgoing.write(rtsp_hdr);
								self.pipeline._src.outgoing.write(rtp_pkt);

							}
						}

					}).catch(function(err) {
						console.log('The following getUserMedia error occured: ' + err);
					});
				} else {
					console.log('getUserMedia not supported on your browser!');
				}
			}

			self.stopBackwardAudio = function() {
				if (1) {
					self.stopBackwardAudioBosch();
					return;
				}
				self.isAudioCapture = false;
				self.audioCapture = null;
			}

			function mergeTypedArrays(a, b) {
				if(!a && !b) throw 'Please specify valid arguments for parameters a and b.';
				if(!b || b.length === 0) return a;
				if(!a || a.length === 0) return b;
				if(Object.prototype.toString.call(a) !== Object.prototype.toString.call(b))
				throw 'The types of the two arguments passed for parameters a and b do not match.';
				var c = new a.constructor(a.length + b.length);
				c.set(a);
				c.set(b, a.length);
				return c;
			}

			self.onRecord = null;

			/*
			self.startRecord = function( ms_length ) {
				console.log('TODO: Recording not implemented');
				return;

				if (ms_length == undefined) {
					ms_length = 5000;
				}

				if (isRecording || isRecStopping) return;


				clearTimeout(record_wd);
				prevRecLen = 0;

				self.recordedData264	= new Uint8Array(self.rech264maxsize);
				self.recordedData711	= new Uint8Array(self.recg711maxsize);
				recData264Len = 0;
				recData711Len = 0;

				if (firstPackage != null) {
					self.recordedData264.set(firstPackage, recData264Len);
					recData264Len += firstPackage.length;
				}

				isRecording = true;
				isRecStopping = false;

				if (self.onRecord !== null) {
					var args = {};
					args.isRecording = isRecording;
					args.isRecStopping = isRecStopping;
					self.onRecord(args);
				}

				if (ms_length > 0) {
					setTimeout(function(){
						self.stopRecord();
					}, ms_length);
				}

				function recordWd () {
					clearTimeout(record_wd);
					if (!isRecording) return;
					if (recData264Len > prevRecLen) {
						prevRecLen = recData264Len;
						console.log('record watchdog: OK - record in process');
						record_wd = setTimeout(function(){recordWd();}, 5000);
					} else {
						if (record_try > 3) {
							console.warn('Early record save before expected time due record stream error or allocated memmory is over');
							self.stopRecord();
							record_try = 0;
						} else {
							console.log('record watchdog: may be error  (recdata:'+recData264Len+'<= prevrecorded:'+prevRecLen+'<= maxsize:'+self.rech264maxsize+'): - check in process ');
							record_try += 1;
							record_wd = setTimeout(function(){recordWd();}, 5000);
						}
					}
				}
				record_wd = setTimeout(function(){recordWd();}, 5000);
			}

			self.stopRecord = async function stopRecord() {
				console.log('TODO: Recording not implemented');
				return;

				if (isRecording == false || isRecStopping == true) {
					return;
				}
				isRecording = false;
				isRecStopping = true;
				if (self.onRecord !== null) {
					var args = {};
					args.isRecording = isRecording;
					args.isRecStopping = isRecStopping;
					self.onRecord(args);
				}
				var IN_FILE_NAME_264 = 'input.mp4';
				var IN_FILE_NAME_ULAW = 'input.ulaw';
				var OUT_FILE_NAME = self.defaultClipName + '.mp4';

				var data = self.recordedData264.subarray(0, recData264Len);

				var outfile;

				if(self.recordedData711.length>0){
					var data711 = self.recordedData711.subarray(0, recData711Len);

					var file2 = { name:IN_FILE_NAME_ULAW, data:data711}
					var args = ['-i', IN_FILE_NAME_264, '-f', 'mulaw', '-ar', '8000', '-ac', '1', '-i', IN_FILE_NAME_ULAW, '-vcodec', 'copy', '-acodec', 'copy', OUT_FILE_NAME];
					var ret = null;//await runFFmpeg(IN_FILE_NAME_264, data, args, OUT_FILE_NAME, [ file2 ] );

					data = null;
					data711 = null;

					if (ret) {
						ret.Core.PThread.ih();
						delete ret.Core;
						outfile = ret.file;
					}
				}
				else{
					var args = ['-i', IN_FILE_NAME_264, '-vcodec', 'copy', '-acodec', 'copy', OUT_FILE_NAME];
					var ret = null;//await runFFmpeg(IN_FILE_NAME_264, data, args, OUT_FILE_NAME );
					data = null;
					if (ret) {
						ret.Core.PThread.ih();
						delete ret.Core;
						outfile = ret.file;
					}
				}

				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style.display = 'none';
				a.href = URL.createObjectURL(new Blob([outfile.buffer], { type: 'video/mp4' }));
				a.download = OUT_FILE_NAME;
				a.click();

				delete self.recordedData264; self.recordedData264 = null;
				delete self.recordedData711; self.recordedData711 = null;
				recData264Len = 0;
				recData711Len = 0;

				isRecStopping = false;
				if (self.onRecord !== null) {
					var args = {};
					args.isRecording = isRecording;
					args.isRecStopping = isRecStopping;
					self.onRecord(args);
				}
			}
			*/
			self.recordStatus = function() {
				if (isRecording == true) {
					var ret = {};
					ret.recording = true;
					ret.recStopping = false;
					ret.recData264Len = recData264Len;
					ret.recData711Len = recData711Len;
					return ret;
				} else if (isRecording == false && isRecStopping) {
					var ret = {};
					ret.recording	= false;
					ret.recStopping = true;
					ret.recData264Len = recData264Len;
					ret.recData711Len = recData711Len;
					return ret;
				} else {
					var ret = {};
					ret.recording	= false;
					ret.recStopping	= false;
					ret.recData264Len = recData264Len;
					ret.recData711Len = recData711Len;
					return ret;
				}
			}

			el_play.onclick = self.play;
			el_pause.onclick = self.pause;
			el_stop.onclick = self.stop;
			el_fullscreen.onclick = self.fullscreen;
			el_takescreenshot.onclick = self.takescreenshot;
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
			el_showzoom.onclick = function(){
				if (el_zoomcontainer.classList.contains('show')){
					el_zoomcontainer.classList.remove('show');
				} else {
					el_zoomcontainer.classList.add('show');
				}
			}
		}(id, options_);
		window.vxgplayer.players[id].playerDidLoad();
	}else{
		// console.warn(id + " -  already exists player");
	}

	return window.vxgplayer.players[id];
};

window.vxgplayer.webserverport = '8778';

window.vxgplayer.isFrame = function() {
	try {
	    return window.self !== window.top;
	} catch (e) {
	    return true;
	}
}

window.vxgplayer.showGlobalErrorMessage = function(id, html){
	var player = document.getElementById(id);
	var width=640;
	var height=480;
	width = parseInt(player.width,10) || width;
	height = parseInt(player.height,10) || height;
	player.style.width = width + 'px';
	player.style.height = height + 'px';
	player.innerHTML = html;
	return undefined;
}

window.vxgplayer.showNotInstalled = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ '	<a href="https://www.videoexpertsgroup.com/player_start/" ' + (vxgplayer.isFrame() ? 'target="_blank"' : '')+ '>Click here for install plugin</a>'
		+ '	<br/><br/> or visit in webstore <a href="https://chrome.google.com/webstore/detail/vxg-media-player/hncknjnnbahamgpjoafdebabmoamcnni" target="_blank">VXG Media Player</a>'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showAvailableInChrome = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Available in <a href="https://www.google.com/chrome/" target="_blank">Chrome for Desktop PC only</a>'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showWebSocketFailed = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Could not connect to plugin (WebSocket Error). Please try restart your browser.'
		+ '	</div> '
		+ '</div>');
}

window.vxgplayer.showNotInstalledInIncognitoMode = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in incognito mode. Please open it in a regular tab, install the plugin and then come back.'
		+ '	<br/><br/> Also you can install <a href="https://chrome.google.com/webstore/detail/vxg-media-player/hncknjnnbahamgpjoafdebabmoamcnni" target="_blank">VXG Media Player</a> from webstore in regular tab.'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showNotStartedInIncognitoMode = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in incognito mode. Please open it in a regular tab and then come back.'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.startPlayerInNewTab = function(){
	console.log('start player');
	var params = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes"
	var win = window.open('https://www.videoexpertsgroup.com/player_start/', "_blank", params)
	setTimeout(function(){
		win.close();
		location.reload();
		/*for(var id in window.vxgplayer.players){
			console.log("Restart player: " + id);
		}*/
	},1000);
}

window.vxgplayer.showNotStartedInIFrame = function(id){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content"> You have opened this page in frame.<br>'
		+ ' Please click on <a href="javascript:void(0);" onclick="window.vxgplayer.startPlayerInNewTab();">this link</a> for start Chrome App (VXG Media Player).'
		+ '	</div>'
		+ '</div>');
}

window.vxgplayer.showInitFailed = function(id, str){
	vxgplayer.showGlobalErrorMessage(id, ''
		+ '<div class="vxgplayer-unsupport">'
		+ '	<div class="vxgplayer-unsupport-content">'
		+ ' Chrome plugin init error. Try to update Video/Audio drivers. '
		+ str
		+ '	</div> '
		+ '</div>');
}

window.vxgplayer.Promise = function(){
	var completed = false;

	this.done = function(callback){
		this.done_callback = callback;
		if(this.completed){
			this.done_callback(this.err);
		}
		return this;
	}

	this.fail = function(callback){
		this.fail_callback = callback;
		if(this.completed){
			this.fail_callback(this.err);
		}
		return this;
	}

	this.resolve = function(result) {
		if(!this.completed){
			this.result = result;
			this.done_callback(result);
		}
		this.completed = true;
	}
	this.reject = function(err) {
		if(!this.completed){
			this.err = err;
			this.fail_callback(err);
		}
		this.completed = true;
	}
};

// helper funxtion
window.vxgplayer.getAbsolutePosition = function(element){
	var r = { x: element.offsetLeft, y: element.offsetTop };
	if (element.offsetParent) {
	var tmp = vxgplayer.getAbsolutePosition(element.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
};

// init options
window.vxgplayer.initOptions = function(self, options){
	self.options = options || {};
	self.m = {};
	self.m.wsurl = self.player.getAttribute('wsurl') || self.options.wsurl || "";
	self.m.rtspurl = self.player.getAttribute('rtspurl') || self.options.rtspurl || "";
	self.m.user = self.player.getAttribute('user') || self.options.user || "";
	self.m.password = self.player.getAttribute('password') || self.options.password || "";
	self.m.watchdog = self.player.getAttribute('watchdog') || self.options.watchdog || 3;

	self.m.autostart_parameter = self.player.hasAttribute('autostart') ? '1' : '0';
	self.m.audio_parameter = (self.player.hasAttribute('audio') && parseInt(self.player.getAttribute('audio', 10)) == 0) ? '0' : '1';
	self.m.mute_parameter = (self.player.hasAttribute('mute') && parseInt(self.player.getAttribute('mute', 10)) == 1) ? '1' : '0';
}

window.audioBufferPCM = function(audioCtx, audioGain, sampleRate, bufferSize ){
	var self = this;

	self.ctx = audioCtx;
	self.gain = audioGain;
	self.sampleRate = sampleRate;
	self.bufferSize = bufferSize || 10;
	self.chunks = [];
	self.isPlaying = false;
	self.startTime = 0;
	self.lastChunkOffset = 0;

	self.createChunk = function(chunk) {
		var audioBuffer = this.ctx.createBuffer(1, chunk.length, self.sampleRate);
		audioBuffer.getChannelData(0).set(chunk);
		var source = self.ctx.createBufferSource();

		source.buffer = audioBuffer;
		source.connect(self.gain);
		source.onended = function(e) {
			self.chunks.splice(self.chunks.indexOf(source), 1);
			if (self.chunks.length == 0) {
				self.isPlaying = false;
				self.startTime = 0;
				self.lastChunkOffset = 0;
			}
		};
		return source;
	}

	self.clear = function() {
		self.isPlaying = false;
		self.chunks = [];
		self.startTime = 0;
		self.lastChunkOffset = 0;
	}

	self.addBuffer = function(data) {
		if (self.isPlaying && (self.chunks.length > self.bufferSize)) {
			console.warn("audio chunk discarded");
			return;
		} else if (self.isPlaying && (self.chunks.length <= self.bufferSize)) { // schedule & add right now
			var chunk = self.createChunk(data);
			chunk.start(self.startTime + self.lastChunkOffset);
			self.lastChunkOffset += chunk.buffer.duration;
			self.chunks.push(chunk);
			chunk = null;
		} else if ((self.chunks.length < (self.bufferSize / 2)) && !self.isPlaying) { // add & don't schedule
			var chunk = self.createChunk(data);
			self.chunks.push(chunk);
			chunk = null;
		} else { // add & schedule entire buffer
			self.isPlaying = true;
			var chunk = self.createChunk(data);
			this.chunks.push(chunk);
			chunk = null;
			self.startTime = self.ctx.currentTime;
			self.lastChunkOffset = 0;
			for (var i = 0; i < self.chunks.length; i++) {
				var chunk = self.chunks[i];
				chunk.start(self.startTime + self.lastChunkOffset);
				self.lastChunkOffset += chunk.buffer.duration;
			}
		}
	}
}



//init ptz-controls
window.vxgplayer.initPtzControls = function(self){
	var el_controls_ptz_switcher = self.player.getElementsByClassName('vxgplayer-show-ptz')[0];
	var el_ptz_controller = self.player.getElementsByClassName('vxgplayer-ptz')[0];
	var el_controls_ptz_left = self.player.getElementsByClassName('ptz-left')[0];
	var el_controls_ptz_right = self.player.getElementsByClassName('ptz-right')[0];
	var el_controls_ptz_up = self.player.getElementsByClassName('ptz-top')[0];
	var el_controls_ptz_down = self.player.getElementsByClassName('ptz-bottom')[0];
	var el_controls_ptz_zoomin = self.player.getElementsByClassName('vxgplayer-ptz-zoom-plus')[0];
	var el_controls_ptz_zoomout = self.player.getElementsByClassName('vxgplayer-ptz-zoom-minus')[0];
	var PTZEnabledControl = 0;

	self.showPtzControl = function () {

		if (PTZEnabledControl) {
			el_controls_ptz_switcher.classList.remove('disable');
		} else {
			el_controls_ptz_switcher.classList.add('disable');
		}
	}

	self.checkPtzAvailable = function () {
		if (self.m.cameraIP === undefined || self.m.wsport === undefined) {
			return null;
		}
		var prt = (self.m.protocol === undefined)?((window.location.protocol=='file:')?('http://'):(window.location.protocol + '//')): (self.m.protocol + '//');
		if (prt == "wss://") prt = "https://";
		else if (prt == "ws://") prt = "http://";
		var url = prt + self.m.cameraIP + ":" + self.m.wsport + "/" + self.m.path + "rcp.xml";
		var data = "command=0x0a51&type=F_FLAG&direction=READ&num=1";
		var headers = {};

		return $.ajax({
			url: url,
			type: 'GET',
			cache: false,
			dataType: "text",
			headers : headers,
			data: data
		}).done(function(response){
			//console.log( response);
			var x2js = new X2JS();
			var jsonObj = x2js.xml2js( response );
			if (jsonObj!== undefined && jsonObj.rcp && jsonObj.rcp.result!==undefined && parseInt(jsonObj.rcp.result.dec)!= 0) {
				console.log("show ptz-button");
				el_controls_ptz_switcher.classList.remove('disable');
                                PTZEnabledControl = 1;
			} else {
				console.log("hide ptz-button");
				el_controls_ptz_switcher.classList.add('disable');
                                PTZEnabledControl = 0;
			}
		}).fail(function(err){
			console.log( err);
			console.log("Error: hide ptz-button");
			el_controls_ptz_switcher.classList.add('disable');
		});
	}

	//pan = '00'~'0f' - left, '80'~'8f' - right
	//tilt = '00'~'0f' - down, '80'~'8f' - up
	//zoom = '00'~'0f' - zoom out, '80'~'8f' - zoom in
	self.cameraChangePtz = function(pan, tilt, zoom) {
		if (self.m.cameraIP === undefined || self.m.wsport === undefined) {
			return;
		}
		var prt = (self.m.protocol === undefined)?((window.location.protocol=='file:')?('http://'):(window.location.protocol + '//')): (self.m.protocol + '//');
		if (prt == "wss://") prt = "https://";
		else if (prt == "ws://") prt = "http://";
		var url = prt + self.m.cameraIP + ":" + self.m.wsport + "/" + self.m.path + "rcp.xml";
		//?command=0x09a5&type=P_OCTET&direction=WRITE&num=1&payload=0x8000060110858f0000"
		var data = "command=0x09a5&type=P_OCTET&direction=WRITE&num=1&payload=0x800006011085"+pan+tilt+zoom;
		$.ajax({
			url: url,
			type: 'GET',
			cache: false,
			dataType: "text",
			data: data
		}).done(function(response){
			//console.log( response);
			var x2js = new X2JS();
			var jsonObj = x2js.xml2js( response );
			if (jsonObj!== undefined && jsonObj.rcp && jsonObj.rcp.result !== undefined ) {
				console.log("ptz: changed: pan=" + pan + ", tilt=" + tilt + ", zoom=" + zoom);
			} else {
				console.log("ptz: no result ");
			}
		}).fail(function(err){
			console.log("Error ptz: " + err);
		});
	}

	el_controls_ptz_switcher.onclick = function(){
		el_ptz_controller.classList.toggle('show');
		el_controls_ptz_switcher.classList.toggle('show');
	};

	el_controls_ptz_left.onmousedown = function(){
		self.cameraChangePtz( '08', '00', '00');
	}
	el_controls_ptz_right.onmousedown = function(){
		self.cameraChangePtz( '88', '00', '00');
	}
	el_controls_ptz_up.onmousedown = function(){
		self.cameraChangePtz( '00', '88', '00');
	}
	el_controls_ptz_down.onmousedown = function(){
		self.cameraChangePtz( '00', '08', '00');
	}
	el_controls_ptz_zoomin.onmousedown = function(){
		self.cameraChangePtz( '00', '00', '87');
	}
	el_controls_ptz_zoomout.onmousedown = function(){
		self.cameraChangePtz( '00', '00', '07');
	}
	el_controls_ptz_zoomin.onmouseup =
	el_controls_ptz_zoomout.onmouseup =
	el_controls_ptz_left.onmouseup =
	el_controls_ptz_right.onmouseup =
	el_controls_ptz_up.onmouseup =
	el_controls_ptz_down.onmouseup = function(){
		self.cameraChangePtz( '00', '00', '00');
	}
}

// init volumes
window.vxgplayer.initVolumeControls = function(self, onloadsettings){
	self.m.volume = self.options.volume || 0.7;
	var el_volumeMute = self.player.getElementsByClassName('vxgplayer-volume-mute')[0];
	var el_volumeDown = self.player.getElementsByClassName('vxgplayer-volume-down')[0];
	var el_volumeProgress = self.player.getElementsByClassName('vxgplayer-volume-progress')[0];
	var el_volumeUp = self.player.getElementsByClassName('vxgplayer-volume-up')[0];

	var el_volumeContainer = self.player.getElementsByClassName('vxgplayer-volume-container')[0];
	var el_volumeSlider = self.player.getElementsByClassName('vxgplayer-volume')[0];
	var el_microphone = self.player.getElementsByClassName('vxgplayer-microphone')[0];

	if(self.player.hasAttribute('volume')){
		self.m.volume = parseFloat(self.player.getAttribute('volume'));
		self.m.volume = Math.ceil(self.m.volume*10)/10;
		if(onloadsettings){
///			self.module.command('setvolume', self.m.volume.toFixed(1));
		}
	}else if(self.options.volume){
		console.warn("TODO volume");
	}

	self.m.mute = self.video.hasAttribute('muted') || self.options.mute || self.m.volume == 0 || self.m.mute_parameter == '1';
	if(self.m.mute){
		el_volumeDown.style.display='none';
		el_volumeProgress.style.display='none';
		el_volumeUp.style.display='none';
		el_volumeContainer.style.display='none';
	} else {
		el_volumeContainer.style.display='inline-block';
	}

	el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));

	self.isMute = function(){
		return self.m.mute;
	}

	self.applyVolume = function( visualonly ){
		if (self.isMute()){
			self.video.setAttribute('muted', true);
			self.video.muted = true;
			if (self.audioGain != null && self.audioGain !== undefined && self.audioCtx != null && self.audioCtx !== undefined) {
				self.audioGain.gain.setValueAtTime(0, self.audioCtx.currentTime);
			}
		} else {
			self.video.removeAttribute('muted');
			self.video.muted = false;
			self.video.setAttribute('volume', self.m.volume.toFixed(1));
			self.video.volume = self.m.volume.toFixed(1);
			if (self.audioGain != null && self.audioGain !== undefined && self.audioCtx != null && self.audioCtx !== undefined) {
				self.audioGain.gain.setValueAtTime( self.m.volume, self.audioCtx.currentTime);
			}
		}
		if (self.audioCtx !== undefined && self.audioCtx != null) {
		    self.audioCtx.resume();
		}
	}

	self.mute = function(isMute){
		self.restartTimeout();
		
		if (isMute != undefined) {
			self.m.mute = isMute;
		} else {
			self.m.mute = !self.m.mute;
		}

		if(self.isMute()){
			el_volumeMute.classList.remove("unmute");
			el_volumeDown.style.display='none';
			el_volumeProgress.style.display='none';
			el_volumeUp.style.display='none';
			el_volumeContainer.style.display='none';
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol0')
		}else{
			el_volumeMute.classList.add("unmute");
			el_volumeDown.style.display='inline-block';
			el_volumeProgress.style.display='inline-block';
			el_volumeUp.style.display='inline-block';
			el_volumeContainer.style.display='inline-block';
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.floor(self.m.volume*10));
		}

		if (self.options.ext_setMute) {
			self.options.ext_setMute(self.m.mute);
		} else {
			self.applyVolume();
		}
	}

	self.volume = function(val){
		if(val != undefined){
			val = val > 1 ? 1 : val;
			val = val < 0 ? 0 : val;
			self.m.volume = Math.ceil(val*10)/10;

			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));
			
			if (self.options.ext_setVolume) {
				self.options.ext_setVolume(val);
			} else {
				self.applyVolume();
			}
		}else{
			return self.m.volume;
		}
	}

	self.volup = function(){
		self.restartTimeout();
		if(Math.round(self.m.volume*10) < 10){
			self.m.volume = self.m.volume + 0.1;
			self.applyVolume();
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));

		}
	};

	self.voldown = function(){
		self.restartTimeout();
		if(Math.round(self.m.volume*10) > 0){
			self.m.volume = self.m.volume - 0.1;
			self.applyVolume();
			el_volumeProgress.className = el_volumeProgress.className.replace(/vol\d+/g,'vol' + Math.ceil(self.m.volume*10));
		}
	};

	el_volumeMute.onclick = function() {
		self.mute();
	}
	el_volumeDown.onclick = self.voldown;
	el_volumeUp.onclick = self.volup;
	el_volumeSlider.addEventListener('input', function(event){
		if (!self.player.getElementsByClassName('vxgplayer-volume')[0]) return;
		self.volume(event.target.value/100);
	});

	if ( (self.options.disableAudioControl && self.options.disableAudioControl === true)
	|| (self.options.disableSpeakerControl && self.options.disableSpeakerControl === true)
	) {
		el_volumeMute.style.display = 'none';
		el_volumeDown.style.display = 'none';
		el_volumeProgress.style.display = 'none';
		el_volumeUp.style.display = 'none';
		el_volumeContainer.style.display = 'none';
		el_volumeSlider.style.display = 'none';
	}
	if ( (self.options.disableAudioControl && self.options.disableAudioControl === true)
	|| (self.options.disableMicControl && self.options.disableMicControl === true)
	) {
		el_microphone.style.display = 'none';
	}
}

document.addEventListener('DOMContentLoaded', function() {

	//console.log("vxgplayer isFrame: " + window.vxgplayer.isFrame());
//	console.log("vxgplayer browserSupportsPluginPnacl: " + window.vxgplayer.browserSupportsPluginPnacl());

	// search all vxgplayers
	var els = document.getElementsByClassName("vxgplayer");
	for (var i = 0; i < els.length; i++) {
		if(els[i].id){
			vxgplayer(els[i].id);
		}else{
			console.error("Player has not id", els[i]);
		}
	}


	// TODO check ws
	// TODO start Chrome App
});
