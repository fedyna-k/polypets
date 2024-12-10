/* global io */
const socket = io();
const localVideo = document.getElementById("localVideo");

const pc = new RTCPeerConnection();

navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    console.log("Stream local démarré");
    localVideo.srcObject = stream;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
}).catch((error) => {
    console.error("Erreur d'accès à la caméra :", error);
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

pc.createOffer().then((offer) => {
    pc.setLocalDescription(offer);
    console.log("Offre créée :", offer);
    socket.emit("signal", { offer });
}).catch((error) => {
    console.error("Erreur lors de la création de l'offre :", error);
});

socket.on("signal", async (data) => {
    console.log("Signal reçu sur le téléphone :", data);
    if (data.answer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
});
