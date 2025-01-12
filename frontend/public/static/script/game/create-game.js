let gameId = "undefined";

// HTTP Request to create a unique game ID
fetch("/game/")
    .then(response => response.json())
    .then(data => {
        // Get the game id of the game created
        const generatedGameId = data.id;

        // Receive a confirmation of the game created
        // eslint-disable-next-line no-undef
        socket.on("game-created", (response) => {
            console.log(response.message); // "Partie créée avec succès."
            gameId = generatedGameId;
        });

        // Create a game with the id received
        // eslint-disable-next-line no-undef
        socket.emit("create-game", generatedGameId);
    })
    .catch(error => {
        console.error("Erreur lors de la création de la partie:", error);
    });
