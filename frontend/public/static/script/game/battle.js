let battle_socket = io();

// Front functions for shop

// Web socket events

battle_socket.on("start-shop-phase", () => {
    console.log("Starting shop phase.");
});

battle_socket.on("end-shop-phase", () => {
    console.log("Shop phase is finished.");

    // Send the data of the team
});

// Receive the battle result
battle_socket.on("battle-result", (battleResult) => {
    console.log("Résultat du combat reçu:", battleResult);

    const { winner, turnCount, result } = battleResult;
    console.log(`Gagnant: ${winner}, Nombre de tours: ${turnCount}, Résultat: ${result}`);
});