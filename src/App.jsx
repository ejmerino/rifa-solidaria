import { useState } from "react";
import "./App.css";

function App() {
  const [winners, setWinners] = useState([]);
  const [eliminatedNumbers, setEliminatedNumbers] = useState([]);
  const [currentDigits, setCurrentDigits] = useState(["0", "0", "0", "0"]);
  const [isRolling, setIsRolling] = useState(false);
  const [spinningDigits, setSpinningDigits] = useState([false, false, false, false]);
  const [rollCount, setRollCount] = useState(0);  // Contador de intentos
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);  // Controla el índice de premios

  const prizes = [
    "Combo sorpresa 3",
    "Combo sorpresa 2",
    "Combo sorpresa 1",
    "Reloj Infinix Watch",
    "Alexa Echodot 5ta generación",
    "Alexa Echodot 5ta generación",
    "Reloj Redmi Watch 4",
    "Smart TV 32” TCL",
    "Smart TV 43” TCL",
    "Consola Play Station 5",
  ];

  const getRandomNumber = () => {
    let num;
    do {
      num = Math.floor(Math.random() * 2500) + 1; // El rango es de 1 a 2500
    } while (winners.includes(num) || eliminatedNumbers.includes(num)); // Garantiza que no se repitan
    return num;
  };

  const rollNumber = async () => {
    if (isRolling || winners.length >= prizes.length) return;  // Evita girar si ya hay un ganador o se terminó

    setIsRolling(true);
    setRollCount((prev) => prev + 1);  // Aumenta el contador de intentos

    const number = getRandomNumber().toString().padStart(4, "0");
    setSpinningDigits([true, true, true, true]);  // Inicia la animación para todos los dígitos

    // Simula el giro visual
    for (let i = 3; i >= 0; i--) {
      await new Promise((res) => setTimeout(res, 1000));  // Espera para cada dígito
      setCurrentDigits((prev) => {
        const newDigits = [...prev];
        newDigits[i] = number[i];
        return newDigits;
      });
      setSpinningDigits((prev) => {
        const copy = [...prev];
        copy[i] = false;
        return copy;
      });
    }

    // Cuando se ha girado 2 veces, el tercer intento es el ganador
    if (rollCount % 3 === 2) {
      setWinners((prev) => [...prev, number]);
    } else {
      setEliminatedNumbers((prev) => [...prev, number]);
    }

    // Si ya tenemos 3 eliminados, pasamos al siguiente premio
    if (rollCount % 3 === 2) {
      setCurrentPrizeIndex((prev) => prev + 1);
      setRollCount(0);  // Reinicia el contador de intentos
    }

    setIsRolling(false);  // Permite que se haga otro giro
  };

  const restartRaffle = () => {
    setWinners([]);  // Reinicia la lista de ganadores
    setEliminatedNumbers([]);  // Reinicia la lista de eliminados
    setCurrentPrizeIndex(0);  // Reinicia el índice de premios
    setRollCount(0);  // Reinicia el contador de intentos
  };

  return (
    <div className="app">
      <h1>🎖️ Rifa Solidaria 🎖️</h1>
      <div className="number-display">
        {currentDigits.map((digit, index) => (
          <div
            key={index}
            className={`digit ${spinningDigits[index] ? "spin" : ""}`}
          >
            {digit}
          </div>
        ))}
      </div>

      <div className="prize">
        <h2>Premio Actual: {prizes[currentPrizeIndex]}</h2>
      </div>

      <button
        onClick={rollNumber}
        disabled={isRolling || winners.length >= prizes.length}
      >
        {winners.length >= prizes.length
          ? "Rifa Terminada"
          : isRolling
          ? "Girando..."
          : "Girar Número"}
      </button>

      {winners.length > 0 && (
        <div className="winner-banner">
          🎉 ¡Felicidades al ganador #{winners[winners.length - 1]}!
        </div>
      )}

      <div className="eliminated-numbers">
        <h3>Eliminados:</h3>
        <ul>
          {eliminatedNumbers.map((num, idx) => (
            <li key={idx}>
              🚫 {num}
            </li>
          ))}
        </ul>
      </div>

      <div className="winners-board">
        <h2>Ganadores</h2>
        <ul>
          {winners.map((num, idx) => (
            <li key={idx}>
              🎁 Premio {idx + 1}: <span className="num">{num}</span> - {prizes[idx]}
            </li>
          ))}
        </ul>
      </div>

      {winners.length === prizes.length && (
        <div className="reset-raffle">
          <button onClick={restartRaffle}>Reiniciar Rifa</button>
        </div>
      )}
    </div>
  );
}

export default App;
