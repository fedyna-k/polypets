// Receive the battle result
// eslint-disable-next-line no-undef
socket.on("battle-result", (battleResult) => {
    console.log("Résultat du combat reçu:", battleResult);

    const { winner, turnCount, result } = battleResult;
    console.log(`Gagnant: ${winner}, Nombre de tours: ${turnCount}, Résultat: ${result}`);
});