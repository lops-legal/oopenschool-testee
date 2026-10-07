"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

export default function ProctorGuard({
  isActive = true,
  onTabSwitch,
}) {
  const [switchCount, setSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Detect tab/window visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setSwitchCount((prev) => {
          const next = prev + 1;
          if (onTabSwitch) onTabSwitch(next);
          return next;
        });
        setShowWarning(true);
      }
    };

    // Detect window blur (e.g. clicking out of the browser window)
    const handleBlur = () => {
      setSwitchCount((prev) => {
        const next = prev + 1;
        if (onTabSwitch) onTabSwitch(next);
        return next;
      });
      setShowWarning(true);
    };

    // Protect against accidental page closure
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Uma avaliação está em andamento. Deseja realmente sair?";
      return e.returnValue;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, onTabSwitch]);

  if (!showWarning || switchCount === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: "#7f1d1d",
        color: "#fef2f2",
        border: "1px solid #ef4444",
        borderRadius: 12,
        padding: "14px 18px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
        maxWidth: 380,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        animation: "slideIn 0.3s ease"
      }}
    >
      <ShieldAlert size={24} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4 }}>
        <strong style={{ display: "block", marginBottom: 2, fontSize: 14 }}>
          Atenção: saída da aba detectada ({switchCount}x)
        </strong>
        <span>
          Permaneça na página da avaliação. O histórico de saídas da janela é registrado no sistema.
        </span>
      </div>
      <button
        onClick={() => setShowWarning(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "#fca5a5",
          cursor: "pointer",
          padding: 2,
          display: "flex"
        }}
        aria-label="Fechar aviso"
      >
        <X size={16} />
      </button>
    </div>
  );
}
