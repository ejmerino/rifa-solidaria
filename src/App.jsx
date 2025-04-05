import { useState } from "react";
import "./App.css";

function App() {
  const [winners, setWinners] = useState([]);
  const [currentDigits, setCurrentDigits] = useState(["0", "0", "0", "0"]);
  const [isRolling, setIsRolling] = useState(false);
  const [spinningDigits, setSpinningDigits] = useState([false, false, false, false]);

  const getRandomNumber = () => {
    let num;
    do {
      num = Math.floor(Math.random() * 1500) + 1;
    } while (winners.includes(num));
    return num;
  };

  const rollNumber = async () => {
    if (winners.length >= 4 || isRolling) return;

    setIsRolling(true);
    const number = getRandomNumber().toString().padStart(4, "0");
    setSpinningDigits([true, true, true, true]);

    // Simular giro visual
    for (let i = 3; i >= 0; i--) {
      await new Promise((res) => setTimeout(res, 1000));
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

    // Mostrar ganador por 2 segundos
    await new Promise((res) => setTimeout(res, 2000));
    setWinners((prev) => [...prev, parseInt(number)]);
    setCurrentDigits(["0", "0", "0", "0"]);
    setIsRolling(false);
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

      <button onClick={rollNumber} disabled={isRolling || winners.length >= 4}>
        {winners.length >= 4 ? "Rifa Terminada" : isRolling ? "Girando..." : "Girar Número"}
      </button>

      {winners.length > 0 && (
        <div className="winner-banner">
          🎉 ¡Felicidades al ganador #{winners[winners.length - 1]
            .toString()
            .padStart(4, "0")}!
        </div>
      )}

      <div className="winners-board">
        <h2>Ganadores</h2>
        <ul>
          {winners.map((num, idx) => (
            <li key={idx}>🎁 Premio {idx + 1}: <span className="num">{num.toString().padStart(4, "0")}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
