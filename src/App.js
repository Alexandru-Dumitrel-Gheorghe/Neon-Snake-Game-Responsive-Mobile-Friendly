import React from "react";
import GameBoard from "./components/GameBoard";
import styles from "./styles/App.module.css";

function App() {
  return (
    <div className={styles.app}>
      
      <div className={styles.gameContainer}>
        <GameBoard />
      </div>
    </div>
  );
}

export default App;
