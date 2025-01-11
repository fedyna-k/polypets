/* global io */
const socket = io(); // websocket
/* global ImageProcessor */
const imgProc = new ImageProcessor();

const FRAMES_PER_SECONDS = 30;
const REFRESH_RATE = (1/FRAMES_PER_SECONDS) * 1000;

// Video parameters
let focal_length;

// Video Canva
const remoteVideo = document.getElementById("remoteVideo"); // video HTML element
const frameCanvas = document.getElementById("frameCanvas"); // Canva HTML element
const ctx = frameCanvas.getContext("2d"); // JS Canva


const servers = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
};

const pc = new RTCPeerConnection(); // Peer Connection
pc.ondatachannel = (event) => {
    const channel = event.channel;

    channel.onopen = () => {console.log("Opened");};

    channel.onmessage = (event) => {
        focal_length = event.data;
        imgProc.setIntrinsicCameraMatrix(focal_length, remoteVideo.videoWidth, remoteVideo.videoHeight);
        console.log("CameraMatrixSet");
    };
};


// ===========================================================================================
// EVENT LISTENERS
// ===========================================================================================

// Ajout des listeners pour suivre les états de connexion ICE
pc.addEventListener("iceconnectionstatechange", () => {
    console.log("ICE Connection State (PC):", pc.iceConnectionState);
});

// Event listener for the video track
pc.ontrack = (event) => {
    console.log("Received remote stream:", event.streams[0]);
    remoteVideo.srcObject = event.streams[0];
};

// Event listener for ICE candidates
pc.onicecandidate = (event) => {
    if (event.candidate) {
        console.log("Envoi du candidat ICE :", event.candidate);
        socket.emit("signal", { candidate: event.candidate });
    }
};

// Event listener for initiation of socket connection
socket.on("init", (url) => {
    console.log(url);
    
    const qrCodeContainer = document.getElementById("qrcode");
    qrCodeContainer.innerHTML = "";

    new QRCode(qrCodeContainer, {
        text: url
    });
});

socket.emit("join-pc");

socket.on("signal", async (data) => {
    console.log("Signal reçu côté PC :", data);
    if (data.offer) {
        console.log("Offre reçue :", data.offer);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        console.log("Offre reçue et appliquée");

        const answer = await pc.createAnswer();
        console.log("Envoi de la réponse :", answer);
        await pc.setLocalDescription(answer);
        socket.emit("signal", { answer });
        console.log("Réponse envoyé :", answer);

    } else if (data.answer) {
        console.log("Réponse reçue", data.answer);
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log("Réponse appliquée");
    } else if (data.candidate) {
        console.log("Candidat ICE reçu", data.candidate);
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log("Candidat ICE ajouté", data.candidate);
    }
});

// Event listener for the full WebRTC Connection
pc.addEventListener("connectionstatechange", () => {
    console.log("PeerConnection State (PC):", pc.connectionState);
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
    if (remoteVideo.videoWidth && remoteVideo.videoHeight && imgProc.isIntrinsicCameraSet()) {
        frameCanvas.width = remoteVideo.videoWidth;
        frameCanvas.height = remoteVideo.videoHeight;

        // Draw frame on canva
        ctx.drawImage(remoteVideo, 0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);

        // Extract frame
        const imageData = ctx.getImageData(0, 0, remoteVideo.videoWidth, remoteVideo.videoHeight);

        imgProc.setMat(imageData);

        try {
            const detected_corners = imgProc.detectCorners();

            // Here we have the 4 corners or an error

            console.log("Corners detected :)");

            const homography_matrix = imgProc.homography(detected_corners); // Here we have the homography matrix :)
            
            const projection_matrices = imgProc.getRotationAndTranslationMatrices(detected_corners);

            console.log(imgProc.detectCards());

        } catch(error) {
            if (error.message != "Corners not detected properly")
            {
                console.log(error);
            }
        }

        
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
