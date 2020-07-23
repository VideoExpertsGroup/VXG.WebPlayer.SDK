var log = new Log('out1');
log.info("Create CloudPlayerSDK instance");
window.cloudplayersdk1 = window.cloudplayersdk1 || new CloudPlayerSDK('player1');

// You can get a channel on My StreamLand - https://dashboard.videoexpertsgroup.com/?streaming=
var channel = 'eyJ0b2t....In0=';

var rc = cloudplayersdk1.setSource(channel);
if (rc.name === 'OK')
    log.info('Playing video of the channel...');
else {
    log.error('Can not play the channel camera.');
    log.error('Possible reason: ' + rc.text);
}
