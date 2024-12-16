/* global io */
const socket = io();

const FRAMES_PER_SECONDS = 30;
const REFRESH_RATE = 1/FRAMES_PER_SECONDS;

const remoteVideo = document.getElementById("remoteVideo");
const frameCanvas = document.getElementById("frameCanvas");
const ctx = frameCanvas.getContext("2d");
const imgProc = new ImageProcessor();

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

const pc = new RTCPeerConnection(servers);

pc.ontrack = (event) => {
    console.log("Received remote stream:", event.streams[0]);
    remoteVideo.srcObject = event.streams[0];
};

pc.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit("signal", { candidate: event.candidate });
    }
};


socket.on("init", (number) => {
    document.getElementById("socket-num").innerHTML = number;
});

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

pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected") {
        console.log("WebRTC Connecté");
    }
});


function captureFrame() {
    if (remoteVideo.videoWidth && remoteVideo.videoHeight) {
        frameCanvas.width = remoteVideo.videoWidth;
        frameCanvas.height = remoteVideo.videoHeight;
        ctx.drawImage(remoteVideo, 0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);
        const imageData = ctx.getImageData(0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);
        console.log(imgProc.analyseImage(imageData));
    }
}

setInterval(captureFrame, REFRESH_RATE);

function onCvReady(){
    /* global cv */ 
    cv.then((cv) => {       
        imgProc.setCV(cv);
        console.log("OpenCV set"); 
    });
}