/* global io */
const socket = io();

const remoteVideo = document.getElementById("remoteVideo");
const frameCanvas = document.getElementById("frameCanvas");
const ctx = frameCanvas.getContext("2d");

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" } // Public STUN server
    ]
};

const pc = new RTCPeerConnection(servers);

// pc.ontrack = (event) => {
//     console.log("Track received:", event.streams);
//     if (!remoteVideo.srcObject) {
//         remoteVideo.srcObject = event.streams[0];
//     }
// };

pc.addEventListener("track", async (event) => {
    console.log("Track reçue");
    const [remoteStream] = event.streams;
    remoteVideo.srcObject = remoteStream;
});

socket.on("init", (number) => {
    document.getElementById("socket-num").innerHTML = number;
});

socket.on("signal", async (data) => {
    console.log("Signal reçu sur le PC :", data);
    if (data.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Réponse :", answer);
        socket.emit("signal", { answer });
    } else if (data.answer) {
        console.log(await pc.setRemoteDescription(new RTCSessionDescription(data.answer)));
    } else if (data.candidate) {
        console.log("Candidat reçu");
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});

// pc.onicecandidate = (event) => {
//     if (event.candidate) {
//         console.log("Envoi du candidat ICE :", event.candidate);
//         socket.emit("signal", { candidate: event.candidate });
//     }
// };

pc.addEventListener("icecandidate", event => {
    if (event.candidate) {
        console.log("Envoi du candidat ICE :", event.candidate);
        socket.emit("signal", {candidate: event.candidate});
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
        console.log("Frame capturée");
    }
}

setInterval(captureFrame, 250);
