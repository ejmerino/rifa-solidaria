import { useState, useEffect } from "react";
import "./App.css";
import { Container, Row, Col, Button, ListGroup, Card } from "react-bootstrap"; // ListGroup ya no se usará para las listas principales
import Confetti from 'react-confetti';

function App() {
  // --- State Variables ---
  const [winners, setWinners] = useState([]);
  const [eliminatedNumbers, setEliminatedNumbers] = useState([]);
  const [currentDigits, setCurrentDigits] = useState(["-", "-", "-", "-"]);
  const [isRolling, setIsRolling] = useState(false);
  const [spinningDigits, setSpinningDigits] = useState([false, false, false, false]);
  const [rollCount, setRollCount] = useState(0);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
  });

  // --- Constants ---
  const prizes = [
    "Combo sorpresa 3", "Combo sorpresa 2", "Combo sorpresa 1",
    "Reloj Infinix Watch", "Alexa Echodot 5ta gen.", "Alexa Echodot 5ta gen.",
    "Reloj Redmi Watch 4", "Smart TV 32” TCL", "Smart TV 43” TCL",
    "Consola Play Station 5",
  ];
  const MIN_NUMBER = 2500;
  const MAX_NUMBER = 5000;

  // --- Effects ---
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      if (showConfetti) {
          const timer = setTimeout(() => setShowConfetti(false), 8000);
          return () => clearTimeout(timer);
      }
  }, [showConfetti]);

  // --- Helper Functions ---
  const getRandomNumber = () => {
    let num;
    const drawnNumbers = new Set([...winners, ...eliminatedNumbers].map(nStr => parseInt(nStr, 10)));
    const totalPossibleNumbersInRange = MAX_NUMBER - MIN_NUMBER + 1;

    if (drawnNumbers.size >= totalPossibleNumbersInRange) {
      console.warn("Todos los números posibles en el rango han sido sorteados.");
      return null;
    }
    do {
      num = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
    } while (drawnNumbers.has(num));
    return num;
  };

  // --- Core Logic ---
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

    const numberStr = randomNumber.toString().padStart(4, "0");

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

    const nextRollCount = rollCount + 1;
    let rollsNeededForThisPrize;

    if (currentPrizeIndex <= 2) {
      rollsNeededForThisPrize = 3;
    } else {
      rollsNeededForThisPrize = 5;
    }

    if (nextRollCount === rollsNeededForThisPrize) {
      setWinners((prev) => [...prev, numberStr]);
      setCurrentPrizeIndex((prev) => prev + 1);
      setShowConfetti(true);
      setRollCount(0);
    } else {
      setEliminatedNumbers((prev) => [...prev, numberStr]);
      setRollCount(nextRollCount);
    }

    await new Promise((res) => setTimeout(res, 300));
    setIsRolling(false);
  };

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
                <Card.Body
                  className="card-body-custom"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    padding: '8px',
                    alignItems: 'start',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 250px)', // Ajusta según tu layout
                  }}
                >
                  {eliminatedNumbers.length === 0 ? (
                    <div
                      className="text-muted text-center py-4 placeholder-item"
                      style={{ gridColumn: '1 / -1' }}
                    >
                      Aún no hay números eliminados.
                    </div>
                  ) : (
                    eliminatedNumbers.map((num, idx) => (
                      <div
                        key={`eliminated-item-${idx}`}
                        className="text-danger result-item eliminated-item text-center"
                        style={{
                          padding: '2px',
                          wordBreak: 'break-all',
                        }}
                      >
                        {num}
                      </div>
                    ))
                  )}
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
                {/* --- MODIFICACIÓN: Renderizar ganadores en 3 columnas usando CSS Grid --- */}
                <Card.Body
                  className="card-body-custom" // Mantenemos la clase original del Card.Body
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', // 3 columnas
                    gap: '6px', // Un poco más de espacio para el contenido del ganador
                    padding: '8px',
                    alignItems: 'stretch', // Para que todas las tarjetas de ganador en una fila tengan la misma altura
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 250px)', // Ajusta según tu layout
                  }}
                >
                  {winners.length === 0 ? (
                    <div
                      className="text-muted text-center py-4 placeholder-item"
                      style={{ gridColumn: '1 / -1' }} // Placeholder ocupa todas las columnas
                    >
                       Aún no hay ganadores.
                    </div>
                  ) : (
                    winners.map((num, idx) => (
                      <div
                        key={`winner-item-${idx}`}
                        // Aplicamos clases para el estilo base del ganador.
                        // text-center es opcional, dependiendo de cómo quieras alinear el contenido interno.
                        className="text-success result-item winner-item d-flex flex-column align-items-center justify-content-center p-2"
                        style={{
                          // Opcional: si quieres un borde para cada ganador
                          // border: '1px solid #e0e0e0',
                          // borderRadius: '4px',
                          textAlign: 'center', // Centra el texto dentro de esta celda
                        }}
                      >
                        {/* Contenido del ganador, similar a como estaba en ListGroup.Item */}
                        <span className="winner-number fw-bold" style={{fontSize: '1.1em'}}>{num}</span>
                        <div className="prize-details mt-1" style={{fontSize: '0.85em'}}>
                           <i className="bi bi-award-fill prize-icon me-1"></i>
                           <span className="prize-text">{prizes[idx]}</span>
                        </div>
                        {/* El emoji de regalo 🎁 podría ser opcional si el espacio es muy reducido
                            o puedes integrarlo de otra forma. Por ahora lo mantenemos. */}
                        <span className="winner-gift-icon mt-1">🎁</span>
                      </div>
                    ))
                  )}
                </Card.Body>
                {/* --- FIN DE MODIFICACIÓN --- */}
              </Card>
           </Col>
         </Row>
      </div>
    </Container>
  );
}

export default App;