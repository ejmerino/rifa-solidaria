import { useState, useEffect } from "react";
import "./App.css";
import { Container, Row, Col, Button, ListGroup, Card } from "react-bootstrap";
import Confetti from 'react-confetti';

function App() {
  // --- State Variables ---
  const [winners, setWinners] = useState([]);
  const [eliminatedNumbers, setEliminatedNumbers] = useState([]);
  const [currentDigits, setCurrentDigits] = useState(["-", "-", "-", "-"]); // Initial state
  const [isRolling, setIsRolling] = useState(false);
  const [spinningDigits, setSpinningDigits] = useState([false, false, false, false]);
  const [rollCount, setRollCount] = useState(0); // Counter for the eliminated/winner cycle per prize
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
  });

  // --- Constants ---
  const prizes = [
    "Combo sorpresa 3", "Combo sorpresa 2", "Combo sorpresa 1", // Indices 0, 1, 2
    "Reloj Infinix Watch", "Alexa Echodot 5ta gen.", "Alexa Echodot 5ta gen.",
    "Reloj Redmi Watch 4", "Smart TV 32” TCL", "Smart TV 43” TCL",
    "Consola Play Station 5", // Indices 3 en adelante
  ];
  const MIN_NUMBER = 2500; // <--- MODIFICADO: Límite inferior
  const MAX_NUMBER = 5000; // <--- MODIFICADO: Límite superior

  // --- Effects ---
  // Update window size for Confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Control Confetti duration (8 seconds)
  useEffect(() => {
      if (showConfetti) {
          const timer = setTimeout(() => setShowConfetti(false), 8000);
          return () => clearTimeout(timer);
      }
  }, [showConfetti]);

  // --- Helper Functions ---
  // Get a random number not already drawn within the new range
  const getRandomNumber = () => {
    let num;
    const drawnNumbers = new Set([...winners, ...eliminatedNumbers].map(nStr => parseInt(nStr, 10)));
    const totalPossibleNumbersInRange = MAX_NUMBER - MIN_NUMBER + 1; // <--- MODIFICADO: Total de números posibles

    if (drawnNumbers.size >= totalPossibleNumbersInRange) { // <--- MODIFICADO: Condición de números agotados
      console.warn("Todos los números posibles en el rango han sido sorteados.");
      return null;
    }
    do {
      // Genera un número entre MIN_NUMBER y MAX_NUMBER (ambos inclusive)
      num = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER; // <--- MODIFICADO: Generación de número en rango
    } while (drawnNumbers.has(num));
    return num;
  };

  // --- Core Logic ---
  // Handle the rolling process
  const rollNumber = async () => {
    if (isRolling || currentPrizeIndex >= prizes.length) return;

    setIsRolling(true);
    setShowConfetti(false);
    setCurrentDigits(["-", "-", "-", "-"]);

    await new Promise(res => setTimeout(res, 50));

    const randomNumber = getRandomNumber();
    if (randomNumber === null) {
        setIsRolling(false);
        setCurrentDigits(["E", "R", "R", "!"]);
        alert("¡No quedan números disponibles en el rango para sortear!");
        return;
    }

    const numberStr = randomNumber.toString().padStart(4, "0"); // Asumimos que los números siempre tendrán 4 dígitos o se rellenarán.

    setSpinningDigits([true, true, true, true]);

    let tempDigits = ["0", "0", "0", "0"];
    const intervalId = setInterval(() => {
        tempDigits = tempDigits.map(() => Math.floor(Math.random() * 10).toString());
        setCurrentDigits(prev => prev.map((d, i) => spinningDigits[i] ? tempDigits[i] : d));
    }, 50);

    for (let i = 3; i >= 0; i--) {
      await new Promise((res) => setTimeout(res, 700 + (3 - i) * 150));
      const finalDigit = numberStr[i];
      setCurrentDigits((prev) => {
        const newDigits = [...prev];
        newDigits[i] = finalDigit;
        return newDigits;
      });
      setSpinningDigits((prev) => {
        const copy = [...prev];
        copy[i] = false;
        return copy;
      });
    }
    clearInterval(intervalId);

    setCurrentDigits(numberStr.split(''));
    setSpinningDigits([false, false, false, false]);

    // --- MODIFICADO: Lógica de ganador/eliminado según el premio ---
    const nextRollCount = rollCount + 1;
    let rollsNeededForThisPrize;

    // Los primeros 3 premios (índices 0, 1, 2) son los "Combo sorpresa"
    if (currentPrizeIndex <= 2) {
      rollsNeededForThisPrize = 3; // 2 eliminados, 1 ganador
    } else {
      rollsNeededForThisPrize = 5; // 4 eliminados, 1 ganador
    }

    if (nextRollCount === rollsNeededForThisPrize) { // Es el último sorteo para este premio (ganador)
      setWinners((prev) => [...prev, numberStr]);
      setCurrentPrizeIndex((prev) => prev + 1);
      setShowConfetti(true);
      setRollCount(0); // Reiniciar contador de sorteos para el próximo premio
    } else { // Es un sorteo eliminado para este premio
      setEliminatedNumbers((prev) => [...prev, numberStr]);
      setRollCount(nextRollCount); // Incrementar contador de sorteos para el premio actual
    }
    // --- FIN DE MODIFICACIÓN ---

    await new Promise((res) => setTimeout(res, 300));
    setIsRolling(false);
  };

  // Reset the entire raffle
  const restartRaffle = () => {
    setWinners([]);
    setEliminatedNumbers([]);
    setCurrentPrizeIndex(0);
    setRollCount(0);
    setCurrentDigits(["-", "-", "-", "-"]);
    setIsRolling(false);
    setSpinningDigits([false, false, false, false]);
    setShowConfetti(false);
  };

  // Check if raffle is finished
  const isRaffleFinished = currentPrizeIndex >= prizes.length;

  // --- Render ---
  return (
    <Container fluid className="app-container">
       {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15}/>}
      <div className="app">
         <Row className="g-3 main-layout-row">
           <Col lg={3} md={4} className="d-flex flex-column order-md-1 order-2 results-col eliminated-list-container">
              <Card className="flex-grow-1 result-card">
                <Card.Header as="h5" className="text-center card-header-custom">
                   <i className="bi bi-x-octagon-fill text-danger me-2"></i>Eliminados ({eliminatedNumbers.length})
                </Card.Header>
                <Card.Body className="p-0 card-body-custom">
                  <ListGroup variant="flush" className="results-list">
                    {eliminatedNumbers.length === 0 ? (
                      <ListGroup.Item className="text-muted text-center py-4 placeholder-item">
                        Aún no hay números eliminados.
                      </ListGroup.Item>
                    ) : (
                      eliminatedNumbers.map((num, idx) => (
                        <ListGroup.Item key={idx} className="text-danger result-item eliminated-item">
                          {num}
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
           </Col>
           <Col lg={6} md={4} className="d-flex flex-column align-items-center order-md-2 order-1 text-center main-raffle-col">
              <h1 className="mb-3 raffle-title">🎖️ Rifa Solidaria 🎖️</h1>
              <div className="number-display my-3">
                {currentDigits.map((digit, index) => (
                   <div key={index} className={`digit-container ${spinningDigits[index] ? "spinning" : ""}`}>
                       <div className="digit">
                          <span>{digit}</span>
                       </div>
                   </div>
                ))}
              </div>
              <div className="prize-display my-3">
                  {!isRaffleFinished ? (
                    <h3>✨ Premio Actual ✨<br/><span className="prize-name">{prizes[currentPrizeIndex]}</span></h3>
                  ) : (
                    <h3>🎉 ¡Rifa Finalizada! 🎉</h3>
                  )}
              </div>
              <div className="action-button mt-auto pt-3">
                  {!isRaffleFinished ? (
                    <Button onClick={rollNumber} disabled={isRolling} size="lg" className="roll-button">
                      {isRolling ? (
                          <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Girando...</>
                       ) : `Girar por: ${prizes[currentPrizeIndex]}`}
                    </Button>
                  ) : (
                    <Button onClick={restartRaffle} variant="danger" size="lg" className="restart-button">
                      <i className="bi bi-arrow-clockwise me-2"></i>Reiniciar Rifa
                    </Button>
                  )}
              </div>
           </Col>
           <Col lg={3} md={4} className="d-flex flex-column order-md-3 order-3 results-col winners-list-container">
              <Card className="flex-grow-1 result-card">
                 <Card.Header as="h5" className="text-center card-header-custom">
                    <i className="bi bi-trophy-fill text-warning me-2"></i>Ganadores ({winners.length}/{prizes.length})
                 </Card.Header>
                <Card.Body className="p-0 card-body-custom">
                  <ListGroup variant="flush" className="results-list">
                    {winners.length === 0 ? (
                        <ListGroup.Item className="text-muted text-center py-4 placeholder-item">
                           Aún no hay ganadores.
                        </ListGroup.Item>
                    ) : (
                      winners.map((num, idx) => (
                        <ListGroup.Item key={idx} className="text-success result-item winner-item">
                          <div className="winner-details-container">
                              <span className="winner-number">{num}</span>
                              <div className="prize-details">
                                 <i className="bi bi-award-fill prize-icon me-1"></i>
                                 <span className="prize-text">{prizes[idx]}</span>
                              </div>
                          </div>
                          <span className="winner-gift-icon ms-2">🎁</span>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
           </Col>
         </Row>
      </div>
    </Container>
  );
}

export default App;