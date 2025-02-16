import React from "react";
import styles from "../styles/Portal.module.css";

/**
 * position: [x, y] în procente
 * orientation: "top" | "bottom" | "left" | "right"
 */
const Portal = ({ position, orientation }) => {
  // Poziția de bază (left, top) în procente
  const baseStyle = {
    left: `${position[0]}%`,
    top: `${position[1]}%`
  };

  // Stabilim transform-ul și dimensiunile containerului (portal)
  let transformValue = "translate(-50%, -50%)";
  let containerStyle = { width: "6%", height: "12%" }; 
  let lineClass = styles.portalLineVertical; // default vertical

  switch (orientation) {
    case "top":
      // Mijloc, sus
      transformValue = "translate(-50%, 0)";
      // Containerul e mai lat decât înalt
      containerStyle = { width: "12%", height: "6%" };
      // Linia devine orizontală
      lineClass = styles.portalLineHorizontal;
      break;

    case "bottom":
      // Mijloc, jos
      transformValue = "translate(-50%, -100%)";
      containerStyle = { width: "12%", height: "6%" };
      lineClass = styles.portalLineHorizontal;
      break;

    case "left":
      // Stânga, centrat pe verticală
      transformValue = "translate(0, -50%)";
      containerStyle = { width: "6%", height: "12%" };
      lineClass = styles.portalLineVertical;
      break;

    case "right":
      // Dreapta, centrat pe verticală
      transformValue = "translate(-100%, -50%)";
      containerStyle = { width: "6%", height: "12%" };
      lineClass = styles.portalLineVertical;
      break;

    default:
      break;
  }

  const style = {
    ...baseStyle,
    ...containerStyle,
    transform: transformValue
  };

  return (
    <div className={styles.portal} style={style}>
      <div className={lineClass}></div>
    </div>
  );
};

export default Portal;
