/* global io */
const socket = io(); // websocket
/* global ImageProcessor */
const imgProc = new ImageProcessor();

const FRAMES_PER_SECONDS = 30;
const REFRESH_RATE = (1/FRAMES_PER_SECONDS) * 1000;

const remoteVideo = document.getElementById("remoteVideo"); // video HTML element
const frameCanvas = document.getElementById("frameCanvas"); // Canva HTML element
const ctx = frameCanvas.getContext("2d"); // JS Canva


const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

const pc = new RTCPeerConnection(servers); // Peer Connection



// ===========================================================================================
// EVENT LISTENERS
// ===========================================================================================

// Event listener for the video track
pc.ontrack = (event) => {
    console.log("Received remote stream:", event.streams[0]);
    remoteVideo.srcObject = event.streams[0];
};

// Event listener for ICE candidates
pc.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit("signal", { candidate: event.candidate });
    }
};

// Event listener for initiation of socket connection
socket.on("init", (number) => {
    console.log(number);
    
    const qrCodeContainer = document.getElementById("qrcode");
    qrCodeContainer.innerHTML = "";

    new QRCode(qrCodeContainer, {
        text: number.toString()
    });
});

// Event listener on the socket for a signal
socket.on("signal", async (data) => {
    if (data.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("signal", { answer });
    } else if (data.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});

// Event listener for the full WebRTC Connection
pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected") {
        console.log("WebRTC Connecté");
    }
});



// ===========================================================================================
// EVENT LISTENERS
// ===========================================================================================

/**
 * When called, gets the current frame and analyses it
 */
function captureFrame() {
    if (remoteVideo.videoWidth && remoteVideo.videoHeight) {
        frameCanvas.width = remoteVideo.videoWidth;
        frameCanvas.height = remoteVideo.videoHeight;

        // Draw frame on canva
        ctx.drawImage(remoteVideo, 0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);

        // Extract frame
        const imageData = ctx.getImageData(0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);

        imgProc.analyseImage(imageData); // Here we have the homography matrix :)
    }
    else {
        clearInterval();
    }
}

/**
 * Gives the openCV object to the image processor
 * OpenCV needs to be imported before ! (ex: <script async src="../static/resources/opencv/opencv.js" onload="onCvReady()"></script>)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onCvReady(){
    /* global cv */ 
    cv.then((cv) => {       
        imgProc.setCV(cv);
        console.log("OpenCV set"); 
    });
}



// ===========================================================================================
// CALLS
// ===========================================================================================

// Analyse a frame every REFRESH_RATE seconds
setInterval(captureFrame, REFRESH_RATE);
