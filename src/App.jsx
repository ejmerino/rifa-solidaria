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
  const [rollCount, setRollCount] = useState(0); // Counter for the 2 eliminated, 1 winner cycle
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
  const MAX_NUMBER = 2500;

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
  // Get a random number not already drawn
  const getRandomNumber = () => {
    let num;
    const drawnNumbers = new Set([...winners, ...eliminatedNumbers].map(nStr => parseInt(nStr, 10)));
    if (drawnNumbers.size >= MAX_NUMBER) {
      console.warn("Todos los números posibles han sido sorteados.");
      return null;
    }
    do {
      num = Math.floor(Math.random() * MAX_NUMBER) + 1;
    } while (drawnNumbers.has(num));
    return num;
  };

  // --- Core Logic ---
  // Handle the rolling process
  const rollNumber = async () => {
    if (isRolling || currentPrizeIndex >= prizes.length) return;

    setIsRolling(true);
    setShowConfetti(false);
    setCurrentDigits(["-", "-", "-", "-"]); // <<<--- RESET DISPLAY TO DASHES

    // Optional short pause for visual feedback of reset
    await new Promise(res => setTimeout(res, 50));

    const randomNumber = getRandomNumber();
    if (randomNumber === null) {
        setIsRolling(false);
        setCurrentDigits(["E", "R", "R", "!"]); // Indicate error
        alert("¡No quedan números disponibles para sortear!");
        return;
    }

    const numberStr = randomNumber.toString().padStart(4, "0");

    setSpinningDigits([true, true, true, true]);

    // Fast number simulation during spin
    let tempDigits = ["0", "0", "0", "0"];
    const intervalId = setInterval(() => {
        tempDigits = tempDigits.map(() => Math.floor(Math.random() * 10).toString());
        setCurrentDigits(prev => prev.map((d, i) => spinningDigits[i] ? tempDigits[i] : d));
    }, 50);

    // Staggered reveal of the final number
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
        copy[i] = false; // Stop spinning for this digit
        return copy;
      });
    }
    clearInterval(intervalId); // Stop fast simulation

    // Ensure final state is correct
    setCurrentDigits(numberStr.split(''));
    setSpinningDigits([false, false, false, false]);

    // Determine winner or eliminated based on original logic (2 eliminated, 1 winner)
    const nextRollCount = rollCount + 1;
    if (nextRollCount % 3 === 0) { // Winner on the 3rd roll
      setWinners((prev) => [...prev, numberStr]);
      setCurrentPrizeIndex((prev) => prev + 1); // Move to next prize
      setShowConfetti(true);
      setRollCount(0); // <<<--- RESET ROLL COUNT FOR NEXT PRIZE CYCLE
    } else { // Eliminated on 1st or 2nd roll
      setEliminatedNumbers((prev) => [...prev, numberStr]);
      setRollCount(nextRollCount); // Keep track of roll 1 or 2
    }

    // Short pause before enabling button again
    await new Promise((res) => setTimeout(res, 300));
    setIsRolling(false);
  };

  // Reset the entire raffle
  const restartRaffle = () => {
    setWinners([]);
    setEliminatedNumbers([]);
    setCurrentPrizeIndex(0);
    setRollCount(0);
    setCurrentDigits(["-", "-", "-", "-"]); // Reset display
    setIsRolling(false);
    setSpinningDigits([false, false, false, false]);
    setShowConfetti(false);
  };

  // Check if raffle is finished
  const isRaffleFinished = currentPrizeIndex >= prizes.length;

  // --- Render ---
  return (
    <Container fluid className="app-container">
       {/* Confetti effect */}
       {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} gravity={0.15}/>}

      {/* Main application container */}
      <div className="app">
         {/* Main 3-column layout row */}
         <Row className="g-3 main-layout-row">

            {/* Left Column: Eliminated Numbers */}
           <Col lg={3} md={4} className="d-flex flex-column order-md-1 order-2 results-col eliminated-list-container"> {/* Added specific class */}
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

            {/* Center Column: Raffle Display and Controls */}
           <Col lg={6} md={4} className="d-flex flex-column align-items-center order-md-2 order-1 text-center main-raffle-col">
              <h1 className="mb-3 raffle-title">🎖️ Rifa Solidaria 🎖️</h1>
              {/* Number Display Area */}
              <div className="number-display my-3">
                {currentDigits.map((digit, index) => (
                   <div key={index} className={`digit-container ${spinningDigits[index] ? "spinning" : ""}`}>
                       <div className="digit">
                          <span>{digit}</span>
                       </div>
                   </div>
                ))}
              </div>
              {/* Current Prize Display */}
              <div className="prize-display my-3">
                  {!isRaffleFinished ? (
                    <h3>✨ Premio Actual ✨<br/><span className="prize-name">{prizes[currentPrizeIndex]}</span></h3>
                  ) : (
                    <h3>🎉 ¡Rifa Finalizada! 🎉</h3>
                  )}
              </div>
              {/* Action Button Area */}
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

            {/* Right Column: Winners */}
           <Col lg={3} md={4} className="d-flex flex-column order-md-3 order-3 results-col winners-list-container"> {/* Added specific class */}
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
                      // Improved display structure for winners
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

         </Row> {/* End Main Layout Row */}
      </div> {/* End .app */}
    </Container> // End .app-container
  );
}

export default App;