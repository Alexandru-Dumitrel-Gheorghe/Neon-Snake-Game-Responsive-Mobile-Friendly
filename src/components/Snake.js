import React from "react";
import styles from "../styles/Snake.module.css";

const Snake = ({ snakeDots, ateFood }) => {
  return (
    <>
      {snakeDots.map((dot, i) => {
        // Each segment at [x, y], centered
        const style = {
          left: `${dot[0]}%`,
          top: `${dot[1]}%`,
          transform: "translate(-50%, -50%)"
        };

        // The head is the last segment
        if (i === snakeDots.length - 1) {
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
          // Body segments
          return (
            <div key={i} className={styles.snakeDot} style={style}></div>
          );
        }
      })}
    </>
  );
};

export default Snake;
