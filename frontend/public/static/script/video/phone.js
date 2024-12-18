/* global io */
const socket = io();
const localVideo = document.getElementById("localVideo");

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

const pc = new RTCPeerConnection(servers);


pc.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit("signal", { candidate: event.candidate });
    }
};

pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected") {
        console.log("WebRTC Connecté");
    }
});


async function init()
{
    await navigator.mediaDevices.getUserMedia({ video: {facingMode: { exact: "environment" }}, audio: false }).then((stream) => {
        console.log("Stream local démarré");
        localVideo.srcObject = stream;
        stream.getTracks().forEach((track) => {pc.addTrack(track, stream); console.log("Track :", track);});
    }).catch((error) => {
        console.error("Erreur d'accès à la caméra :", error);
    });

    await pc.createOffer({offerToReceiveVideo: true, offerToReceiveAudio: true}).then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit("signal", { offer });
    }).catch((error) => {
        console.error("Erreur lors de la création de l'offre :", error);
    });
}

init();

socket.on("signal", async (data) => {
    if (data.answer) {
        const desc = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(desc);
    } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});
