# Web SDK for VXG Cloud & Server

### Web SDK for VXG Cloud & Server 3.1.9_210625
-   Fix errors of JPEG-mode
-   Implemented Timelapse-mode, but disabled for the moment

### Web SDK for VXG Cloud & Server 3.1.8_210512
-   IE11 support main functions
-   Implemented JPEG-mode for player

### Web SDK for VXG Cloud & Server 3.1.6_210302
-   Some elements redesign
-   Fix error in behaviour of timeline and loader
-   Implemented backward-audio module

### Web SDK for VXG Cloud & Server 3.1.6_210127
-   Supports for mobile
-   Add alot of options: disableGetShot, disableGetClip, disableAudioControl, disableZoomControl, disabling some features

### Web SDK for VXG Cloud & Server 3.1.5_210113
-   Implemented clip creating dialog 

### Web SDK for VXG Cloud & Server 3.1.4_201209
-   Support temporary access_token
-   Support access_token for VXGServer connected to Cloud

### Web SDK for VXG Cloud & Server 3.1.3_201016
-   Implemented clip creating
-   Implemented snap shoting
-   Examples are simplified

### Web SDK for VXG Cloud & Server 3.1.2_200923
-   Video.js update upto 7.9.5

### Web SDK for VXG Cloud & Server 3.0.18_200629
-   Fix videojs error handling

### Web SDK for VXG Cloud & Server 3.0.17_200609
-   Fix player behaviour while destroy

### Web SDK for VXG Cloud & Server 3.0.16_200326

-   Cleaned the SDK index.html 
-   Fixed: player does not work without web server
-   Added: new errors on the event onError

### Web SDK for VXG Cloud & Server 3.0.14_200122

- Optimized controls, controls are hidden if the user clicks on the player
- PTZ control shows only buttons for actions supported by the camera
- Fixed speed control
- Added the ability to switch 12-hour and 24-hour clocks
- Added support for remote channels in the player
- Fixed problem with video not starting after camera reboot

### Web SDK for VXG Cloud & Server 3.0.8_191017

- Fixed settings for multi-instance
- Fixed range mode in timeline

### Web SDK for VXG Cloud & Server 3.0.7_191016

- Fix zoom-panel

### Web SDK for VXG Cloud & Server 3.0.6_191014

- Fixed destroy method
- Fixed timeline behaviour. Now timeline could be in another div, or inside player div(default), that defined from CloudPlayerSDK-constructor parameters
- Fixed timeline when  multi instance is used 


### Web SDK for VXG Cloud & Server 3.0.1_190927

- Fixed examples and updated pictures
- Fixed snippets code

### Web SDK for VXG Cloud & Server 3.0.1_190914

- Changed design 
- Added speed control
- Fixed issue with formats

### Web SDK for VXG Cloud & Server 2.0.63_190715

- Added : option 'mute' sets mute on player start . 
  Broswer does not start video if there is audio in stream. 
  Example : 
  opt['mute'] = true;
  player = new CloudPlayerSDK('player1', opt);

### Web SDK for VXG Cloud & Server 2.0.62_190728

- Player is started in Mute mode

### Web SDK for VXG Cloud & Server 2.0.60_190415

- Small fix instruction
- Fixed sound control for WebRTC

### Web SDK for VXG Cloud & Server 2.0.59_190304

- Removed hardcoded 'withCredential' for HLS (not used anymore)
- Unused code was cleaned up 

### Web SDK for VXG Cloud & Server 2.0.58_190228

- Fixed autoplay for WebRTC (VXG Server)

### Web SDK for VXG Cloud & Server 2.0.57_190218

- Added new option 'trasholdPlaybackInMs'
- Updated webrtc-adapter-latest.js (7.2.0)
- Fixed autoplay for WebRTC (Cloud)

### Web SDK for VXG Cloud & Server 2.0.56_190121

- Added event TIMELINE_END_UPDATED and player will automatically restart after error on this event
- Fixed autoplay for Angular
- Added missing REANGE_ENDED
- Fixed autoplay on Safari browser

### Web SDK for VXG Cloud & Server 2.0.55_190117

- Added event 'CHANGED_CONTROLS'
- Added event 'RANGE_ENDED'
- Added event 'CHANNEL_STATUS'
- Added event 'ERROR'
- Added event 'USER_CLICKED_ON_TIMELINE'
- Added 'addCallback' to CloudPlayerSDK
- Added option 'polingRangeDataEveryInSec'
- Improved timeline in range mode
- Changed setting of ignoring holes in timeline from 2 to 4 seconds

### Web SDK for VXG Cloud & Server 2.0.54_181225

- Improved message when records are missing

### Web SDK for VXG Cloud & Server 2.0.53_181121

- Fixed playback settings 
- Added option useTimezone
- Fixed position on first start in CloudPlayerSDK
- Fixed missing include WebRTC-adapter in quick start
- Fixed CNVR-1398 'Play button on HLS when first start'
- Set default player format to HTML5 (HLS)
- Enabled example_cloudsdkplayer9 - (WebRTC+PTZ)
- Fixed calendar (days in previous month)
- Fixed CNVR-1134 CloudSDK Web: need processing cookies in sdk
- Use turn.vxg.io server
- Fixed CNVR-1312 WEBRTC/RTMP/HLS settings disappeared after you change them at playback mode
- Added CloudHelpers.unpackAccessToken

### Web SDK for VXG Cloud & Server 2.0.52_181102

- Implemented calendar
- Implemented new streaming format
- Added the new version of WebRTC
- Updated webrtc-adapter
- Improved player settings
- Fixed restrictions for CDN multi-domain option
- Fixed "zoom" function for playback
- Use turn.vxg.io server

### Web SDK for VXG Cloud & Server 2.0.51_181018

- Added new option 'mute'
- Added new option 'useOnlyPlayerFormat'
- Improved WebRTC video playback
- Fixed bug when settings dialog is not seen
- Fixed destroy timeline

### Web SDK for VXG Cloud & Server 2.0.50_180920

- Added support version for a Cloud WebRTC
- Added new options 'preferredPlayerFormat'

### Web SDK for VXG Cloud & Server 2.0.49_180914

- Updated stun for WebRTC

### Web SDK for VXG Cloud & Server 2.0.48_180827

- Added option waitSourceActivation

### Web SDK for VXG Cloud & Server 2.0.47_180820

- Fixed bug with HLS playback
- Fixed bug with working with VXG Server

### Web SDK for VXG Cloud & Server 2.0.46_180817

- Fixed timeline behavior when using mouse
- Fixed playback of small records
- Disable automoving to cursor for range
- Draw timeline optimized (fixed memory leak)

### Web SDK for VXG Cloud & Server 2.0.45_180622

- Added algorithm for timeline to follow the cursor
- Fixed CloudHelpers.parseUri
- Fixed WebRTC for flexible server port
- Added new method to destroy and re-create the player on the page

### Web SDK for VXG Cloud & Server 2.0.44_180607

- Fixed cursor position in timeline for WebRTC
- Live stream will not stop on the end of range

### Web SDK for VXG Cloud & Server 2.0.43_180606

- Fixed digital zoom for WebRTC

### Web SDK for VXG Cloud & Server 2.0.42_180605

- Fixed hide settings on button "settings"
- Fixed fullscreen for mobiles
- Fixed UI and behavior for mute/unmute

### Web SDK for VXG Cloud & Server 2.0.41_180530

- Redesigned settings
- Added handling error for WebRTC and VXG Server
- Fixed cross server play WebRTC (for VXG Server)
- Added new state "Video source is offline" and autostart from this state to play

### Web SDK for VXG Cloud & Server 2.0.40_180525

- Improved streamer for check flash in Firefox
- Extended access_token for player and for streaming
- Fixed autoplay for chrome and hls and privacy

### Web SDK for VXG Cloud & Server 2.0.39_180521

 - Added "goto live" button in timeline
 - Change behavior on search real record for play

### Web SDK for VXG Cloud & Server 2.0.38_180515

 - Fixed timezone in timeline

### Web SDK for VXG Cloud & Server 2.0.37_180510

 - Added WebRTC for a VXG Server
 
### Web SDK for VXG Cloud & Server 2.0.36_180505

 - Enabled volume control
 - Fixed autostart player in safari
 - Fixed playback
 - Fixed zip-archive for windows default zip-viewer
 - Fixed behavior in range mode
 
### Web SDK for VXG Cloud & Server 2.0.34_180124

 - Fixed problem with view zip explorer on windows
 - Implemented range mode
 - Fixes in timeline
 - Fixed "ERROR ReferenceError: d is not defined"
 - Fixed close in CloudPlayerSDK

### Web SDK for VXG Cloud & Server 2.0.33_171228

 - Fixed copy object
 - Redesign place for examples
 - Added new sample with 4 players
 - Updated icons
 - Added customization for svcp url
 - Improved CloudPlayerSDK

### Web SDK for VXG Cloud & Server 2.0.32_171222

 - Fixed quick start
 - Updated examples
 - Fixed enableSharing (added play to acls)

### Web SDK for VXG Cloud & Server 2.0.31_171219

 - Added CloudPlayerSDK
 - Fixed player double inizialization
 - Added sharing for token
 
### Web SDK for VXG Cloud & Server 2.0.30_171212
 
 - Redesign share example
 - Added getCameraListLight - for simple updating statuses


### Web SDK for VXG Cloud & Server 2.0.29_171208

 - Fixed getRecordingMode
 - Added to sdk.version date of build
 - Fixed for firefox start video
 - Improved CloudTokenConnection for custom svcp_host
 - Added CloudShareConnection
 - Updated examples list

### Web SDK for VXG Cloud & Server 2.0.28_171115

 - Added deny try example if examples/snippets opened as local file
 - Fixed problem with enter license key (dialog sometimes not closing)
 - Removed TripleValue and changed setForStream use bool

### Web SDK for VXG Cloud & Server 2.0.27_171115

 - Implemented CloudCameraListFilter setForStream
 - Implemented CloudCameraListFilter setPrivacy
 - Added enums: CloudCameraPrivacyFilter, TripleValue
 - Reset position to live on change source in player

### Web SDK for VXG Cloud & Server 2.0.26_171114

 - Fixed change source
 - Changed color

### Web SDK for VXG Cloud & Server 2.0.25_171114

 - Fixed black player screen
 - Enabled sound default on 0.5
 - New behaivor: If user click on timeline in future - than player will be play live
 - Removed cursor style 'move'

### Web SDK for VXG Cloud & Server 2.0.24_171110

 - First version fo timeline
 - Fixed examples
 - CloudPlayer: if source is null then play button will be hidden.
 - Removed showTimeline & hideTimeline from CloudPlayer and added addCallback/removeCallback
 - Added navigation to examples

### Web SDK for VXG Cloud & Server 2.0.23_171018

 - Fixed example4 (CameraLis/Create/Delete/Update)
 - Added setURLLogin and setURLPassword to CloudCamera

### CloudSDK 2.0.22_171018

 - Fixed hls playing for desktop versions
 - Removed printing to log user data (license_key)
 - Removed printing rtsp url to log
 - Fixed error on check play hls

### Web SDK for VXG Cloud & Server 2.0.21_171016

 - Fixed player for iOS 11 (hls).
 - Updated hls plugin and added min version
 - Added setPublic to CloudCameraListFilter
 - Added setOwner to CloudCameraListFilter
 - Fixed loading popper js

### Web SDK for VXG Cloud & Server 2.0.20_171013

 - Fixed update timezone on camera
 - Added moment timezone for show correct camera time

### Web SDK for VXG Cloud & Server 2.0.18_171013

 - Fixed fullscreen
 - Added sdk version to player

### Web SDK for VXG Cloud & Server 2.0.17_171013

 - Fixed call play in player twice
 - Added CloudTokenConnection

### Web SDK for VXG Cloud & Server 2.0.16_171012

 - Fixed problem with hls
 - Cleanup examples
 - Redesign fonts/menu

### Web SDK for VXG Cloud & Server 2.0.15_171005

 - Check for launching HTML from a file
 - Live URL sample has wrong file paths
 - Live URL snippet is not working

### Web SDK for VXG Cloud & Server 2.0.14_171004

 - Added missing snippets and exampels

### Web SDK for VXG Cloud & Server 2.0.13_171002

 - Start implemnetation for session timeline
 - Fixed live time for cloud session

### Web SDK for VXG Cloud & Server 2.0.12_170921

 - Fixed playing offline session
 - Fixed fullscreen in player
 - Fixed HLS for safari
 - Fixed white flash background
 - Fixed update api token
 
### Web SDK for VXG Cloud & Server 2.0.11_170921

 - CloudSession check end time is null

### Web SDK for VXG Cloud & Server 2.0.6_170912

 - Added getStatisticsLive to CloudSession (for Online)

### Web SDK for VXG Cloud & Server 2.0.4_170908

 - Added first version of player + play live/playback sessions
 - Fixed CloudSession refresh
 - Implemneted timeline animation, and scaling-mode: 12h, hr, min
 - CloudUserInfo: chnaged getCameraLimit and getCameraCreated (removed methods getStreamerLimit and getStreamerCreated)
 - Fixed styles for snippet pages

### Web SDK for VXG Cloud & Server 2.0.1_170905

 - Added getAccountCapabilities to CloudAPI
 - Implemented getUserInfo
 - CloudCameraList: Added handling error for NO CLOUD CONNECTION

### Web SDK for VXG Cloud & Server 2.0.0_170831

 - Init first version
