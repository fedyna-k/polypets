let join_socket = io();

document.getElementById("join-game-form").addEventListener("submit", function(event) {
    // Prevent the reloading of the web page
    event.preventDefault();

    const gameCode = document.getElementById("game-code").value;
    const errorMessage = document.querySelector(".error_message");

    // Verify if text input is empty
    if (!gameCode) {
        errorMessage.textContent = "L'id de la partie est requis.";
        errorMessage.style.display = "block";
        return;
    }

    // GET Request to join the game
    fetch(`/game/join/${gameCode}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Code de jeu invalide ou erreur serveur.");
            }
            return response.json();
        })
        .then(data => {
            console.log(`Partie ${gameCode} rejointe avec succès`, data);
            // Update local gameId
            window.GameId = gameCode;

            // Gérer les événements de WebSocket
            join_socket.on("player-joined", (data) => {
                console.log(data.message);  // "Un nouveau joueur a rejoint la partie."
                document.getElementById("second-player-info").innerHTML = data.playerInfo;
                document.getElementById("playerLoader").style.display = "none";
                document.getElementById("playerIcon").style.display = "block";
                document.getElementById("playerReady").style.display = "none";
            });

            join_socket.on("phone-joined", (data) => {
                console.log(data.message);  // "Téléphone de l'autre joueur connecté."
                document.getElementById("second-player-info").innerHTML = data.playerInfo;
                document.getElementById("playerLoader").style.display = "none";
                document.getElementById("playerIcon").style.display = "none";
                document.getElementById("playerReady").style.display = "block";
            });

            join_socket.on("phone-left", (data) => {
                console.log(data.message);  // "Téléphone de l'autre joueur déconnecté."
                document.getElementById("second-player-info").innerHTML = data.playerInfo;
                document.getElementById("playerLoader").style.display = "none";
                document.getElementById("playerIcon").style.display = "block";
                document.getElementById("playerReady").style.display = "none";
            });

            join_socket.on("game-joined", (data) => {
                console.log(data.message);  // "Vous avez rejoint la partie."
            });

            join_socket.emit("join-game", gameCode);

            // TODO Update the frontend
            document.getElementById("join-blur").style.display = "none";
            document.getElementById("main-blur").style.display = "flex";
        })
        .catch(error => {
            // Show error message
            console.log("Erreur:", error.message);
            errorMessage.textContent = error.message;
            errorMessage.style.display = "block";
        });
});
