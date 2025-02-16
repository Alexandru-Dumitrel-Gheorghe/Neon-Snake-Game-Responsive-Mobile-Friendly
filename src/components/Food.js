import React, { useState, useEffect } from "react";
import styles from "../styles/Food.module.css";

/**
 * Props:
 * - foodPosition: [x, y] coordinates for the fruit
 * - ateFood: triggers the "disappear" animation when true
 */
const Food = ({ foodPosition, ateFood }) => {
  const [spawnAnimation, setSpawnAnimation] = useState(false);
  const [disappearAnimation, setDisappearAnimation] = useState(false);

  // Position style
  const style = {
    left: `${foodPosition[0]}%`,
    top: `${foodPosition[1]}%`,
    transform: "translate(-50%, -50%)"
  };

  // Animate spawn on position change
  useEffect(() => {
    setSpawnAnimation(true);
    const timer = setTimeout(() => setSpawnAnimation(false), 300);
    return () => clearTimeout(timer);
  }, [foodPosition]);

  // Animate disappear if ateFood is true
  useEffect(() => {
    if (ateFood) {
      setDisappearAnimation(true);
      const timer = setTimeout(() => {
        setDisappearAnimation(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [ateFood]);

  const classNames = [
    styles.food,
    spawnAnimation ? styles.spawn : "",
    disappearAnimation ? styles.disappear : ""
  ].join(" ");

  return <div className={classNames} style={style}></div>;
};

export default Food;
