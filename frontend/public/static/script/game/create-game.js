let GameId = "undefined";
let create_socket = io();

// HTTP Request to create a unique game ID
fetch("/game/create")
    .then(response => response.json())
    .then(data => {
        // Get the game id of the game created
        const generatedGameId = data.id;

        // Receive a confirmation of the game created
        create_socket.on("game-created", (response) => {
            console.log(response.message); // "Partie créée avec succès."
            // Update local gameId
            GameId = generatedGameId;
        });

        // Gérer les événements de WebSocket
        create_socket.on("player-joined", (data) => {
            console.log(data.message);  // "Un nouveau joueur a rejoint la partie."
            document.getElementById("second-player-info").innerHTML = data.playerInfo;
            document.getElementById("playerLoader").style.display = "none";
            document.getElementById("playerIcon").style.display = "block";
        });

        // Create a game with the id received
        create_socket.emit("create-game", generatedGameId);
    })
    .catch(error => {
        console.error("Erreur lors de la création de la partie:", error);
    });
