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
        console.log("Envoi du candidat ICE :", event.candidate);
        socket.emit("signal", { candidate: event.candidate });
    }
};

pc.addEventListener("connectionstatechange", () => {
    console.log("PeerConnection State (PC):", pc.connectionState);
    if (pc.connectionState === "connected") {
        console.log("WebRTC Connecté");
    }
});


async function init()
{
    try {
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
            console.log("Envoi de l'offre (vidéo)", offer);
            socket.emit("signal", { offer });
            console.log("Offre (vidéo) envoyée", offer);
        }).catch((error) => {
            console.error("Erreur lors de la création de l'offre :", error);
        });
    } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
    }
}

init();

const roomId = window.location.pathname.split("/").pop(); // Room ID from Url

socket.emit("join-phone", roomId);

socket.on("signal", async (data) => {
    if (data.answer) {
        console.log("Réponse reçue", data.answer);
        const desc = new RTCSessionDescription(data.answer);
        await pc.setRemoteDescription(desc);
        console.log("Réponse appliquée");
    } else if (data.candidate) {
        console.log("Candidat ICE reçu", data.candidate);
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log("Candidat ICE ajouté", data.candidate);
    }
});
