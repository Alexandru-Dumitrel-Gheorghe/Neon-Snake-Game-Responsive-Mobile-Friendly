import React from "react";
import styles from "../styles/Snake.module.css";

const Snake = ({ snakeDots, ateFood }) => {
  return (
    <>
      {snakeDots.map((dot, i) => {
        // Each segment is centered at dot[0]%, dot[1]%
        // Then shift with translate(-50%, -50%)
        const style = {
          left: `${dot[0]}%`,
          top: `${dot[1]}%`,
          transform: "translate(-50%, -50%)"
        };

        if (i === snakeDots.length - 1) {
          // Head
          return (
            <div
              key={i}
              className={`${styles.snakeHead} ${ateFood ? styles.ate : ""}`}
              style={style}
            >
              <div className={styles.highlight}></div>
              <div className={styles.eyeLeft}></div>
              <div className={styles.eyeRight}></div>
              <div className={styles.tongue}></div>
            </div>
          );
        } else {
          // Body segment
          return (
            <div key={i} className={styles.snakeDot} style={style}></div>
          );
        }
      })}
    </>
  );
};

export default Snake;
