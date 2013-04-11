var oSipStack, oSipSessionCall, oSipSessionRegister;
$(document).ready(function(){
    SIPml.init(postInit);
});
function postInit() {
    // check webrtc4all version
    if (SIPml.isWebRtc4AllSupported() && SIPml.isWebRtc4AllPluginOutdated()) {
        if (confirm("Your WebRtc4all extension is outdated. A new version(" +SIPml.getWebRtc4AllVersion()+") with critical bug fix is available. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
            window.location = 'http://code.google.com/p/webrtc4all/downloads/list';
            return;
        }
    }

    // check for WebRTC support
    if (!SIPml.isWebRtcSupported()) {
        // is it chrome?
        if (SIPml.getNavigatorFriendlyName() == 'chrome') {
            if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {
                window.location = 'http://www.webrtc.org/running-the-demos';
            }
            else {
                window.location = "index.html";
            }
            return;
        }

        // for now the plugins (WebRTC4all only works on Windows)
        if (SIPml.getSystemFriendlyName() == 'windows') {
            // Internet explorer
            if (SIPml.getNavigatorFriendlyName() == 'ie') {
                // Check for IE version
                if (parseFloat(SIPml.getNavigatorVersion()) < 9.0) {
                    if (confirm("You are using an old IE version. You need at least version 9. Would you like to update IE?")) {
                        window.location = 'http://windows.microsoft.com/en-us/internet-explorer/products/ie/home';
                    }
                    else {
                        window.location = "index.html";
                    }
                }

                // check for WebRTC4all extension
                if (!SIPml.isWebRtc4AllSupported()) {
                    if (confirm("webrtc4all extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                        window.location = 'http://code.google.com/p/webrtc4all/downloads/list';
                    }
                    else {
                        // Must do nothing: give the user the chance to accept the extension
                        // window.location = "index.html";
                    }
                }
                // break page loading ('window.location' won't stop JS execution)
                if (!SIPml.isWebRtc4AllSupported()) {
                    return;
                }
            }
            else if (SIPml.getNavigatorFriendlyName() == "safari" || SIPml.getNavigatorFriendlyName() == "firefox" || SIPml.getNavigatorFriendlyName() == "opera") {
                if (confirm("Your browser don't support WebRTC.\nDo you want to install WebRTC4all extension to enjoy audio/video calls?\nIMPORTANT: You must restart your browser after the installation.")) {
                    window.location = 'http://code.google.com/p/webrtc4all/downloads/list';
                }
                else {
                    window.location = "index.html";
                }
                return;
            }
        }
        // OSX, Unix, Android, iOS...
        else {
            if (confirm('WebRTC not supported on your browser.\nDo you want to download a WebRTC-capable browser?')) {
                window.location = 'https://www.google.com/intl/en/chrome/browser/';
            }
            else {
                window.location = "index.html";
            }
            return;
        }
    }

    // checks for WebSocket support
    if (!SIPml.isWebSocketSupported() && !SIPml.isWebRtc4AllSupported()) {
        if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {
            window.location = 'https://www.google.com/intl/en/chrome/browser/';
        }
        else {
            window.location = "index.html";
        }
        return;
    }
}
function register(){
    oSipStack = new SIPml.Stack({
        realm: $("#realm").val(),
        impi: $("#prid").val(),
        impu: $("#pubid").val(),
        password: $("#pass").val(),
        events_listener: {events: "*", listener: onSipEventStack}
    });
    oSipStack.start();
}

function onSipEventStack(e){
    tsk_utils_log_info("== stack events ==" + e.type);
    switch (e.type) {
        case 'started':
        {
            oSipSessionRegister = this.newSession('register', {
                expires: 200,
                events_listener: { events: '*', listener: onSipEventSession },
                sip_caps: [
                    { name: '+g.oma.sip-im', value: null },
                    { name: '+audio', value: null },
                    { name: 'language', value: '\"en,fr\"' }
                ]
            });
            oSipSessionRegister.register();
        }
            break;

        case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
    {
        var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
        oSipStack = null;
        oSipSessionRegister = null;
        oSipSessionCall = null;

        break;
    }

        case 'i_new_call':
        {
            //if (oSipSessionCall) {
            // do not accept the incoming call if we're already 'in call'
            //    e.newSession.hangup(); // comment this line for multi-line support
            //}
            //else {
            oSipSessionCall = e.newSession;

            var sRemoteNumber = (oSipSessionCall.getRemoteUri() || 'unknown');
            //alert(sRemoteNumber);
            sendData(sRemoteNumber);
            ringtone.play();
            //}
            break;
        }

        /*case 'm_permission_requested':
         {
         divGlassPanel.style.visibility = 'visible';
         break;
         }*/
        case 'm_permission_accepted':
        case 'm_permission_refused':
        {
            //divGlassPanel.style.visibility = 'hidden';
            if(e.type == 'm_permission_refused'){
                //alert("Permission refused")
            }
            break;
        }

        case 'starting': default: break;
    }
}
function onSipEventSession(e /* SIPml.Session.Event */) {
    tsk_utils_log_info('==session event = ' + e.type);
    if(e.type == "connecting" || e.type == "connected"){
        alert("connected");
    }
}

function sendData(user){
    if(user == ""){
        user = $("[name = pub_identity]").val().trim();
    }
    $.ajax({
        url: "/sipApp/customer/",
        type: "POST",
        dataType: "json",
        data: "pub_identity=" + user + "&csrfmiddlewaretoken=" + $("[name=csrfmiddlewaretoken]").val().trim(),
        success: function(data){
            if(data){
                $("#result").append("Name: " + data.name + "<br/>");
                $("#result").append("Address: " + data.address + "<br/>");
                $("#result").append("Public_identity: " + data.public_identity + "<br/>");
                $("#result").append("Description: " + data.description + "<br/>");
            }
        }
    });
}
function stopRingTone(){
    ringtone.pause();
}