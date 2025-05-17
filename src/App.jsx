import { useState, useEffect, useMemo } from "react"; // Añadido useMemo
import "./App.css";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Confetti from 'react-confetti';

// Función para parsear la lista de números y rangos
function parseNumbersToExclude(rawInput) {
  const numbersToExcludeStrings = new Set();
  const lines = rawInput.trim().split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue; // Saltar líneas vacías

    if (trimmedLine.includes('/')) {
      const parts = trimmedLine.split('/').map(s => s.trim());
      if (parts.length === 2) {
        const start = parseInt(parts[0], 10);
        const end = parseInt(parts[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            numbersToExcludeStrings.add(i.toString().padStart(4, '0'));
          }
        } else {
          console.warn(`Rango inválido en lista de exclusión: ${trimmedLine}`);
        }
      } else {
        console.warn(`Formato de rango incorrecto en lista de exclusión: ${trimmedLine}`);
      }
    } else {
      const num = parseInt(trimmedLine, 10);
      if (!isNaN(num)) {
        numbersToExcludeStrings.add(num.toString().padStart(4, '0'));
      } else {
        console.warn(`Número inválido en lista de exclusión: ${trimmedLine}`);
      }
    }
  }
  return Array.from(numbersToExcludeStrings); // Devolver como array de strings
}

// Tu lista de números
const rawNumbersInput = `
4251
4256
4260
4234
4236
4237
4366 / 4370
4354
4355
4359
4360
5141 / 5150
5135 / 5140
5114
5125 / 5130
3795 / 3800
3757 / 3759
5100
5084
5089
5072 / 5079
3780 / 3789
4093 / 4097
4099 / 4100
4654 / 4656
4658 / 4676
4701 / 4704
4706 / 4714
4042 / 4046
4048 / 4050
4051 / 4059
4013 / 4020
4022 / 4039
4062 / 4070
3201 / 3204
3207 / 3212
3214 / 3216
3218 / 3219
3221 / 3228
3230 / 3236
3238 / 3249
2766 / 2770
4888
4890
4891 / 4892
4893 / 4895
4872
4873
4875
4876
4878
4878 / 4880
4911
4912
4921
4881
4886
4856
4871
4910
4913
4900
4867 / 4869
4914 / 4917
4857
4858
4896
4899
4859 / 4864
4868
3720 / 3722
3725 / 3729
4541 / 4560
4566 / 4580
4595 / 4600
3973
3983 / 3987
5012 / 5013
5016
5020
5046 / 5050
5172
5175
5186 / 5188
5194
5196
5198 / 5200
3305 / 3306
3311 / 3312
3316
3318 / 3320
3322
3324 / 3326
3328 / 3332
3335 / 3340
3342 / 3348
3953 / 3955
3957 / 3964
3966 / 3968
3994 / 3998
4000
4091 / 4100
3015 / 3016 
3041 
3049
3038 / 3040
3262 / 3263
3265 / 3275
3277
3279 / 3291
3293 / 3300
3423
3425
3430 / 3431
3433 / 3435
3437
3439
3441
3443
3446 / 3449
3501 / 3502
3504 / 3522
3524 / 3550
3656 / 3700
3459 / 3469
3471 / 3489
3497
3601 / 3650
3720 / 3722
3725 / 3729
3360 / 3368
3370 / 3376
3378 / 3400
3821 / 3850
3901 / 3950
4071 / 4090
4641 / 4650
4371 / 4400
3851 / 3900
4810 / 4811
4813
4815
4817 / 4821
4828 / 4831
4833 / 4835
4837
4839
4841 / 4844
4846
4848
4850
`;


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
  const MIN_NUMBER = 2751;
  const MAX_NUMBER = 5250;

  // --- Lista de números a excluir permanentemente (procesada una vez) ---
  const NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS = useMemo(() => parseNumbersToExclude(rawNumbersInput), []);
  const NUMBERS_TO_EXCLUDE_PERMANENTLY_INTS_SET = useMemo(() =>
    new Set(NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS.map(nStr => parseInt(nStr, 10))),
    [NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS]
  );
  
  useEffect(() => {
    console.log(`Total de números excluidos permanentemente: ${NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS.length}`);
    // Opcional: si tuvieras un estado inicial cargado, podrías filtrarlo aquí:
    // const excludeSet = new Set(NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS);
    // setWinners(prev => prev.filter(w => !excludeSet.has(w)));
    // setEliminatedNumbers(prev => prev.filter(e => !excludeSet.has(e)));
  }, [NUMBERS_TO_EXCLUDE_PERMANENTLY_STRINGS]);


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
    const drawnNumbersThisSession = new Set([...winners, ...eliminatedNumbers].map(nStr => parseInt(nStr, 10)));

    // Combinar números ya sorteados en esta sesión con los permanentemente excluidos
    const allUnavailableNumbers = new Set([
        ...drawnNumbersThisSession,
        ...NUMBERS_TO_EXCLUDE_PERMANENTLY_INTS_SET
    ]);

    // Contar cuántos números son realmente elegibles dentro del rango
    let eligibleCount = 0;
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        if (!allUnavailableNumbers.has(i)) {
            eligibleCount++;
        }
    }

    if (eligibleCount === 0) {
      console.warn("Todos los números posibles en el rango (después de exclusiones) han sido sorteados o no hay números válidos.");
      return null;
    }

    do {
      num = Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
    } while (allUnavailableNumbers.has(num)); // Asegurarse de que el número no esté en la lista combinada de no disponibles
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
        alert("¡No quedan números disponibles en el rango para sortear (considerando las exclusiones)!");
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
    // Los números excluidos permanentemente seguirán siendo excluidos por getRandomNumber.
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
                    maxHeight: 'calc(100vh - 250px)', 
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
                <Card.Body
                  className="card-body-custom"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    padding: '8px',
                    alignItems: 'stretch',
                    overflowY: 'auto',
                    maxHeight: 'calc(100vh - 250px)',
                  }}
                >
                  {winners.length === 0 ? (
                    <div
                      className="text-muted text-center py-4 placeholder-item"
                      style={{ gridColumn: '1 / -1' }}
                    >
                       Aún no hay ganadores.
                    </div>
                  ) : (
                    winners.map((num, idx) => (
                      <div
                        key={`winner-item-${idx}`}
                        className="text-success result-item winner-item d-flex flex-column align-items-center justify-content-center p-2"
                        style={{
                          textAlign: 'center',
                        }}
                      >
                        <span className="winner-number fw-bold" style={{fontSize: '1.1em'}}>{num}</span>
                        <div className="prize-details mt-1" style={{fontSize: '0.85em'}}>
                           <i className="bi bi-award-fill prize-icon me-1"></i>
                           <span className="prize-text">{prizes[idx]}</span>
                        </div>
                        <span className="winner-gift-icon mt-1">🎁</span>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
           </Col>
         </Row>
      </div>
    </Container>
  );
}

export default App;