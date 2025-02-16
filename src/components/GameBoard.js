import React, { useState, useEffect, useCallback, useRef } from "react";
import Snake from "./Snake";
import Food from "./Food";
import styles from "../styles/GameBoard.module.css";

const eatSound = new Audio("/beep.mp3");

/**
 * Generate random coordinates between 0 and 98 (multiple of 2).
 */
const getRandomCoordinates = () => {
  const gridSize = 2;
  const min = 0;
  const max = 98;
  let x = Math.floor(Math.random() * ((max - min) / gridSize)) * gridSize + min;
  let y = Math.floor(Math.random() * ((max - min) / gridSize)) * gridSize + min;
  return [x, y];
};

/** Initial snake position. */
const initialSnake = [
  [50, 50],
  [52, 50]
];

const GameBoard = () => {
  const [snakeDots, setSnakeDots] = useState(initialSnake);
  const [foodPosition, setFoodPosition] = useState(getRandomCoordinates());
  const [direction, setDirection] = useState("RIGHT");
  const [ateFood, setAteFood] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Difficulty (base speed). "medium" by default.
  const [difficulty, setDifficulty] = useState("medium");

  // Additional speed factor (0..10). 0 = normal speed.
  const [speedFactor, setSpeedFactor] = useState(0);

  // High Score from localStorage
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("snakeHighScore")) || 0
  );

  // Time references for animation
  const lastUpdateTime = useRef(performance.now());
  const animationFrameId = useRef(null);

  /**
   * Returns the update interval (ms) based on difficulty + speedFactor.
   * The smaller it is, the faster the snake moves.
   */
  const getSpeed = useCallback(() => {
    let baseSpeed;
    switch (difficulty) {
      case "easy":
        baseSpeed = 150;
        break;
      case "hard":
        baseSpeed = 70;
        break;
      case "medium":
      default:
        baseSpeed = 100;
        break;
    }
    // Decrease baseSpeed by 5ms per speedFactor, down to a minimum of 30ms
    const speed = baseSpeed - speedFactor * 5;
    return speed < 30 ? 30 : speed;
  }, [difficulty, speedFactor]);

  // Check if the snake head is on the food
  const checkIfEat = useCallback((head) => {
    if (head[0] === foodPosition[0] && head[1] === foodPosition[1]) {
      setFoodPosition(getRandomCoordinates());
      setAteFood(true);

      // Play the "eat" sound
      eatSound.currentTime = 0;
      eatSound.play().catch(() => {});

      // Trigger "ateFood" animation for 300ms
      setTimeout(() => setAteFood(false), 300);
      return true;
    }
    return false;
  }, [foodPosition]);

  // Check collision with edges (0..98) or snake's own body
  const checkCollision = useCallback((head) => {
    if (head[0] < 0 || head[0] > 98 || head[1] < 0 || head[1] > 98) {
      return true;
    }
    for (let i = 0; i < snakeDots.length - 1; i++) {
      if (snakeDots[i][0] === head[0] && snakeDots[i][1] === head[1]) {
        return true;
      }
    }
    return false;
  }, [snakeDots]);

  // Handle arrow keys + "P" for pause
  const onKeyDown = useCallback((e) => {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }
    // "P" for pause
    if (e.keyCode === 80 && isStarted && !gameOver) {
      setIsPaused((prev) => !prev);
    }
    switch (e.keyCode) {
      case 37: // left
        if (direction !== "RIGHT") setDirection("LEFT");
        break;
      case 38: // up
        if (direction !== "DOWN") setDirection("UP");
        break;
      case 39: // right
        if (direction !== "LEFT") setDirection("RIGHT");
        break;
      case 40: // down
        if (direction !== "UP") setDirection("DOWN");
        break;
      default:
        break;
    }
  }, [direction, isStarted, gameOver]);

  // Move the snake each frame
  const moveSnake = useCallback((timestamp) => {
    if (!isStarted || isPaused || gameOver) {
      lastUpdateTime.current = timestamp;
      return;
    }

    const deltaTime = timestamp - lastUpdateTime.current;
    if (deltaTime > getSpeed()) {
      lastUpdateTime.current = timestamp;

      let newSnake = [...snakeDots];
      let head = newSnake[newSnake.length - 1];

      switch (direction) {
        case "RIGHT":
          head = [head[0] + 2, head[1]];
          break;
        case "LEFT":
          head = [head[0] - 2, head[1]];
          break;
        case "UP":
          head = [head[0], head[1] - 2];
          break;
        case "DOWN":
          head = [head[0], head[1] + 2];
          break;
        default:
          return;
      }

      newSnake.push(head);
      // If not eating, shift tail
      if (!checkIfEat(head)) {
        newSnake.shift();
      }

      // Check collisions
      if (checkCollision(head)) {
        setGameOver(true);
        // Update High Score if needed
        const currentScore = newSnake.length - initialSnake.length;
        if (currentScore > highScore) {
          setHighScore(currentScore);
          localStorage.setItem("snakeHighScore", currentScore.toString());
        }
        return;
      }

      setSnakeDots(newSnake);
    }
  }, [
    snakeDots,
    direction,
    isStarted,
    isPaused,
    gameOver,
    checkIfEat,
    checkCollision,
    highScore,
    getSpeed
  ]);

  // Keydown event listener
  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [onKeyDown]);

  // Animation loop
  useEffect(() => {
    const gameLoop = (timestamp) => {
      moveSnake(timestamp);
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    if (isStarted && !gameOver && !isPaused) {
      lastUpdateTime.current = performance.now();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isStarted, gameOver, isPaused, moveSnake]);

  // Restart the game
  const handleRestart = () => {
    setSnakeDots(initialSnake);
    setFoodPosition(getRandomCoordinates());
    setDirection("RIGHT");
    setGameOver(false);
    setIsPaused(false);
    lastUpdateTime.current = performance.now();
  };

  // Start the game
  const handleStart = () => {
    setSnakeDots(initialSnake);
    setFoodPosition(getRandomCoordinates());
    setDirection("RIGHT");
    setGameOver(false);
    setIsPaused(false);
    setIsStarted(true);
  };

  // Change difficulty
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  // Mobile arrow button clicks
  const handleMobileDirection = (newDir) => {
    if (!isStarted || gameOver) return;
    if (newDir === "LEFT" && direction !== "RIGHT") setDirection("LEFT");
    if (newDir === "RIGHT" && direction !== "LEFT") setDirection("RIGHT");
    if (newDir === "UP" && direction !== "DOWN") setDirection("UP");
    if (newDir === "DOWN" && direction !== "UP") setDirection("DOWN");
  };

  // Mobile pause/resume
  const handleMobilePause = () => {
    if (!isStarted || gameOver) return;
    setIsPaused((prev) => !prev);
  };

  const score = snakeDots.length - initialSnake.length;

  return (
    <div className={styles.wrapper}>
      {/* Left panel (score, difficulty, speed slider, etc.) */}
      <div className={styles.leftPanel}>
        <div className={styles.score}>Score: {score}</div>
        <div className={styles.score}>High Score: {highScore}</div>

        {/* Difficulty selector (only if not started and not game over) */}
        {!isStarted && !gameOver && (
          <div className={styles.difficultySelector}>
            <label>Difficulty: </label>
            <select value={difficulty} onChange={handleDifficultyChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        )}

        {/* Speed factor slider */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ color: "#ffca28", marginRight: "10px" }}>
            Speed Factor: {speedFactor}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={speedFactor}
            onChange={(e) => setSpeedFactor(Number(e.target.value))}
          />
        </div>

        {/* Desktop pause/resume button */}
        {isStarted && !gameOver && (
          <button
            className={styles.pauseButton}
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}

        {/* Start button (if not started) */}
        {!isStarted && (
          <button className={styles.startButton} onClick={handleStart}>
            Start Game
          </button>
        )}

        {/* Restart button (if game over) */}
        {gameOver && (
          <button className={styles.restartButton} onClick={handleRestart}>
            Restart
          </button>
        )}
      </div>

      {/* Main board area */}
      <div className={styles.boardWrapper}>
        <div className={styles.gameBoard}>
          <Snake snakeDots={snakeDots} ateFood={ateFood} />
          <Food foodPosition={foodPosition} ateFood={ateFood} />

          {/* Overlays */}
          {gameOver && (
            <div className={styles.overlay}>
              <div className={styles.gameOverText}>Game Over</div>
            </div>
          )}
          {isPaused && isStarted && !gameOver && (
            <div className={styles.overlay}>
              <div className={styles.pauseText}>Paused</div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile controls (displayed on small screens, below the board) */}
      <div className={styles.mobileControls}>
        <div className={styles.row}>
          <button 
            className={styles.controlBtn} 
            onClick={() => handleMobileDirection("UP")}
          >
            &#9650; {/* Up arrow */}
          </button>
        </div>
        <div className={styles.row}>
          <button 
            className={styles.controlBtn} 
            onClick={() => handleMobileDirection("LEFT")}
          >
            &#9664; {/* Left arrow */}
          </button>

          {/* Center button toggles between pause/play icons */}
          <button 
            className={styles.controlBtn} 
            onClick={handleMobilePause}
          >
            {isPaused ? "▶" : "⏸"}
          </button>

          <button 
            className={styles.controlBtn} 
            onClick={() => handleMobileDirection("RIGHT")}
          >
            &#9654; {/* Right arrow */}
          </button>
        </div>
        <div className={styles.row}>
          <button 
            className={styles.controlBtn} 
            onClick={() => handleMobileDirection("DOWN")}
          >
            &#9660; {/* Down arrow */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
