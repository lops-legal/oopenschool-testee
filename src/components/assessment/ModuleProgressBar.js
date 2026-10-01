"use client";

import React from "react";
import { MODULE_COVERS } from "@/data/canonicalData";

export default function ModuleProgressBar({ currentModuleIndex, currentStepIndex, totalSteps }) {
  const moduleNames = [
    "Modelo mental",
    "Conhecimentos",
    "Experiências",
    "Desafio",
    "Apresentação",
    "Fechamento"
  ];

  const overallPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;
  const currentModuleName = moduleNames[currentModuleIndex] || "Avaliação";

  return (
    <div className="gamify-wrap">
      <div className="module-progress">
        {moduleNames.map((name, idx) => {
          let statusClass = "";
          if (idx < currentModuleIndex) {
            statusClass = "done";
          } else if (idx === currentModuleIndex) {
            statusClass = "active";
          }
          return (
            <div key={idx} className={`module-seg ${statusClass}`}>
              <span />
            </div>
          );
        })}
      </div>
      <div className="module-labels">
        {moduleNames.map((name, idx) => (
          <span
            key={idx}
            style={{
              fontWeight: idx === currentModuleIndex ? "800" : "normal",
              color: idx === currentModuleIndex ? "var(--ink)" : "var(--muted)"
            }}
          >
            {name}
          </span>
        ))}
      </div>
      <div className="progress-caption">
        <span>
          <span className="dot orange" style={{ display: "inline-block", marginRight: 8 }} />
          <strong>{currentModuleName}</strong>
        </span>
        <strong>{overallPercent}% concluído</strong>
      </div>
    </div>
  );
}
