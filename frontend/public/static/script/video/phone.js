/* global io */
/* global EXIF */
const socket = io();
const localVideo = document.getElementById("localVideo");

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

const pc = new RTCPeerConnection();
let channel = pc.createDataChannel("focal_length");
channel.onopen = () => {console.log("Opened");};

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

function openFile(file){
    var input = file.target;
    let reader = new FileReader();
    let focalLength;
    reader.onload = function() {
        EXIF.getData(input.files[0], function() {
            focalLength = EXIF.getAllTags(this)["FocalLengthIn35mmFilm"];
            channel.send(String(focalLength));
        });
    };
    reader.readAsArrayBuffer(input.files[0]);
}


async function init(){
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
