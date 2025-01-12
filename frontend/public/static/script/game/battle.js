let battle_socket = io();

battle_socket.on("shop-phase-finished", )

// Receive the battle result
battle_socket.on("battle-result", (battleResult) => {
    console.log("Résultat du combat reçu:", battleResult);

    const { winner, turnCount, result } = battleResult;
    console.log(`Gagnant: ${winner}, Nombre de tours: ${turnCount}, Résultat: ${result}`);
});