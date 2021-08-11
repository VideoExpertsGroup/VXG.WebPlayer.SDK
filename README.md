# VXG.WebPlayer.SDK

[![Total alerts](https://img.shields.io/lgtm/alerts/g/VideoExpertsGroup/VXG.WebPlayer.SDK.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/VideoExpertsGroup/VXG.WebPlayer.SDK/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/VideoExpertsGroup/VXG.WebPlayer.SDK.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/VideoExpertsGroup/VXG.WebPlayer.SDK/context:javascript)

## Quick Start

Add the following code to the `< head >` section of your web page.

```
<head>
<!-- all includes as in the sample apps -- >
<script>
document.addEventListener('DOMContentLoaded', function() {
    window.player = window.player || new CloudPlayerSDK('player1', {
        // options
    });
    
    // Please replace the access token below with an access token that your received either
    // 1) Using Admin UI (i.e https://dashboard.videoexpertsgroup.com/?streaming=) or
    // 2) Using Admin API function POST /v3/channels/
    var access_token = 'eyJ0b2t....In0=';
    player.setSource(access_token);
    player.play();
});
</script>
<!-- end includes and script start for CloudPlayerSDK -- >
</head>
```

Add the following element to the `< body >` section of your web page
```
<body>
    <div id="player1"></div>
</body>
```

## Class CloudPlayerSDK

__IMPORTANT__: An _access token_ should be used in the API below that was obtained 
either using the Admin UI or the Admin API.

Cloud Player SDK features:

- Playback of live video
- Playback of recorded video
- Video Play/Pause control
- Control of position in recorded video
- Audio output control: mute, unmute, volume control
- Control of timeline for recorded video (Show/Hide)

#### __CloudPlayerSDK(elid, options)__

_Description_  
Constructs a player object.

_Parameters:_  

- elid - element ID where the player will be located.
- options - player's options
    - There are following options:
    - **timeline: ''** - element ID where the timeline will be located.
    - **autohide: -1** - hide player controls 
    - **autohide: 0** - show player controls
    - **autohide: 3000** - player controls will be automaticly hidded after 3 seconds
    - **mute: true** - auto mute 
    - **preferredPlayerFormat: 'webrtc'** - preferred player's format: HLS, Flash or WebRTC (values: 'html5' / 'flash' / 'webrtc')
    - **useOnlyPlayerFormat: 'html5'** - use player only in HLS, Flash or WebRTC mode (values: 'html5' / 'flash' / 'webrtc')

*Note: if option 'useOnlyPlayerFormat' is used then preferredPlayerFormat will be ignored*

_Return values_  
Returns a new player object

_Usage:_  

HTML + Inline script:

```
<div id="player1"></div>
<div id="timeline1"></div>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        window.player = new CloudPlayerSDK('player1', {
            timeline: 'timeline1',
        });
    })
</script>
```

#### __setSource(access_token)__

_Description_  
Sets an access token of a channel that the player will be working with.

_Parameters_  
access_token - access token of a channel

_Return values_  
No return value

_Usage:_  

    player = new CloudPlayerSDK("player");
    var access_token = "eyJ0b2tlbiI6InNoYXJlLmV5SnphU0k2SURFNE0zMC41YTQwYzQ2NXQxMmNmZjc4MC5rNlIxWHdjX2ptUjRZSFU5QV9xSVFHc2liX2MiLCJjYW1pZCI6MTMxMDY0LCJhY2Nlc3MiOiJ3YXRjaCJ9";
    player.setSource(access_token);

#### __getSource()__

_Description_  
Returns the current access token of a channels that the player was previously configured to work with.

_Parameters_  
No parameters

_Return values_  
access_token - access token of a channel

_Usage:_  

    String access_token = player.getSource();

#### __play()__

_Description_  
Resume playback if the player was in a pause state.

_Parameters_  
No input parameters

_Return values_  
No return values

_Usage:_  

    mPlayer.play();

#### __stop()__

_Description_  
Stop playback and change the state to pause.

_Parameters_  
No input parameters

_Return values_  
No return values

_Usage:_  

    player.stop();


#### __destroy()__

_Description_  
Close player and free all resources (before was 'close')

_Parameters_  
No input parameters

_Return values_  
No return values

_Usage:_  

    player.destroy();

#### __setRange(startPos, endPos)__

_Description_  
Sets the range of the timeline (if enabled)

_Parameters_  
* startPos - integer, the left border of timeline (time in ms, UTC)
* endPos - integer, the right border of timeline (time in ms, UTC)

_Return values_  
No return value

_Usage:_  
```
player = new CloudPlayerSDK("player");
var access_token = "eyJ0b2tlbiI6InNoYXJlLmV5SnphU0k2SURFNE0zMC41YTQwYzQ2NXQxMmNmZjc4MC5rNlIxWHdjX2ptUjRZSFU5QV9xSVFHc2liX2MiLCJjYW1pZCI6MTMxMDY0LCJhY2Nlc3MiOiJ3YXRjaCJ9";
player.setSource(access_token);
player.setRange(
    CloudHelpers.getCurrentTimeUTC() - 20*60*1000, // current time - 20 minutes
    CloudHelpers.getCurrentTimeUTC() + 20*60*1000, // current time + 20 minutes
)
```

#### __resetRange(startPos, endPos)__

_Description_  
Resets current time range

#### __bool isPlaying()__

_Description_  
Return current status

_Parameters_  
No input parameters

_Return values_  
Returns true if the status is play, and false if the status is pause.

_Usage:_  

    bool status = player.isPlaying();
    if (status == true)
     // Player plays video 

#### __setPosition(position)__

_Description_  
Sets position in a storage and switches between live and recorded video playback.
The player should be in 'pause' state (stop() shoudl be called first).

_Parameters_  
position - position in Unix time. 
There is a predefined value for switching to live:
CloudPlayer.POSITION_LIVE

_Return values_  
No return value

_Usage:_  

Usage 1:

	// Go to to live  
    player.stop();
    player.setPosition(CloudPlayer.POSITION_LIVE);
    player.play();

Usage 2:

    // Playback video from the position equal to 1505001599476
    player.stop();
    player.setPosition(1505001599476);
    player.play();

Usage 3:

	// Playback video from a specified date and time 2017-09-09T23:59:59
    player.stop();
    var time = CloudHelpers.parseUTCTime("2017-09-09T23:59:59")
    player.setPosition(time);
    player.play();

#### __long getPostion()__

_Description_  
Returns current playback position for video from the storage or current UTC time for live video.

_Parameters_  
There are no input parameters

_Return values_  
Position in storage or UTC time in Unix time.

_Usage:_  

Usage 1:

	if (mPlayer.isLive() == false )
    {
    var position = player.getPosition(CloudPlayer.POSITION_LIVE);
    // Handle playback position
    }

#### __void showTimeline (bool)__

_Description_  
Show or hide the timeline.

_Parameters_  
True - show the timeline, false - hide the timeline.

_Return values_  
No return value

_Usage:_  

    // Show timeline  
    player.showTimeline(true);
    // Hide timeline  
    player.showTimeline(false);

#### __getChannelName()__

_Description_  
Returns the channel name


## Backward Audio 

**CloudStreamerSDK**

    public boolean enableBackwardAudio( ICloudStreamerBackwardAudioCallback callback);  //on
    public void disableBackwardAudio();  //off
    public boolean isSupportBackwardAudio(); //if BackwardAudio is supported or not

    public interface ICloudStreamerBackwardAudioCallback {
        public void onBackwardAudioStarted( String rtmp_url); //Cloud is ready to receive data
        public void onBackwardAudioStopped( ); //Cloud stopped receiving data
    }

**CloudPlayerSDK**

    public String getBackwardAudioUrl(); //get backward audio URL


## Enum CloudReturnCodes

Return codes and error codes.

```
player.onError(function(err){
    console.error("Error Name: " + err.name);
    console.error("Error Code: " + err.code);
    console.error("Error Text: " + err.text);
});
```

Name |	Code |	Description
---| ----| ---
OK |	0 | Success
OK_COMPLETIONPENDING |	1 | Operation is pending
ERROR_NOT_IMPLEMENTED |	-1 |Function or method not implemented
ERROR_NOT_CONFIGURED |	-2 |Object not configured
ERROR_NO_MEMORY|	-12|Out of memory
ERROR_ACCESS_DENIED|	-13|Access denied
ERROR_BADARGUMENT|	-22|Invalid argument
ERROR_STREAM_UNREACHABLE|	-5049| The stream is not reachable. Please double check the URL address and restart the stream
ERROR_EXPECTED_FILTER|	-5050|Expected filter
ERROR_NO_CLOUD_CONNECTION	|-5051|	No cloud connection (there is no connection object or token is invalid)
ERROR_WRONG_RESPONSE|	-5052|Response from cloud is expected in json, but we got something else
ERROR_SOURCE_NOT_CONFIGURED|	-5053|Source not configured
ERROR_INVALID_SOURCE|	-5054| Invalid source
ERROR_RECORDS_NOT_FOUND|	-5055| Records not found
ERROR_NOT_AUTHORIZED|	-5401| Failed authorization on cloud (wrong credentials)
ERROR_NOT_FOUND	| -5404| Object not found


Or you can print all errors use browser console for development:
```
console.log(CloudReturnCode)
```

#### Learn more about <a href="https://www.videoexpertsgroup.com">Cloud Video Surveillance</a>
