/* global io */
/* global EXIF */
const socket = io();
const localVideo = document.getElementById("localVideo");

const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
            urls: "turn:app.fedyna.fr:3478",
            username: "polypets",
            credential: "polypets"
        }
    ]
};

const pc = new RTCPeerConnection(servers);
const roomId = window.location.pathname.split("/").pop(); // Room ID from Url

let channel = pc.createDataChannel("focal_length");
channel.onopen = () => {console.log("Opened");};

pc.onicecandidate = (event) => {
    if (event.candidate) {
        // console.log("Envoi du candidat ICE :", event.candidate);
        socket.emit("signal", { "roomId": roomId, "signalData": {candidate: event.candidate} });
    }
};

pc.addEventListener("connectionstatechange", () => {
    console.log("PeerConnection State (PC):", pc.connectionState);
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
            focalLength ??= EXIF.getAllTags(this)["FocalLength"] * 5.41;

            channel.send(String(focalLength));
        });
    };
    reader.readAsArrayBuffer(input.files[0]);
}


async function init()
{
    try {
        
        socket.emit("join-phone", roomId);

        //await navigator.mediaDevices.getUserMedia({ video: {facingMode: { exact: "user" }}, audio: false }).then((stream) => {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => { // TODO switch PC / tel
            console.log("Stream local démarré", stream);
            localVideo.srcObject = stream;
            stream.getTracks().forEach((track) => {pc.addTrack(track, stream); console.log("Track :", track);});
        }).catch((error) => {
            console.error("Erreur d'accès à la caméra :", error);
        });

        console.log("Creation de l'offre (vidéo)");
        await pc.createOffer({offerToReceiveVideo: true, offerToReceiveAudio: true}).then((offer) => {
            pc.setLocalDescription(offer);
            console.log("Envoi de l'offre");
            socket.emit("signal", {"roomId": roomId, "signalData": {offer} });
            // console.log("Offre (vidéo) envoyée", offer);
        }).catch((error) => {
            console.error("Erreur lors de la création de l'offre :", error);
        });
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
    }
}

init();


socket.on("signal", async (data) => {
    if (data.answer) {
        console.log("Réponse reçue");
        const desc = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(desc);
        // console.log("Réponse appliquée");
    } else if (data.candidate) {
        console.log("Candidat reçu");
        // console.log("Candidat ICE reçu", data.candidate);
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
    else if (data.offer) {
        console.log("ATTENTION OFFER RECUE");
    }
    else {
        console.log("Signal reçu", data);
    }
});
