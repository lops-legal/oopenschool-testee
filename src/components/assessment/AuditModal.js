"use client";

import React, { useState } from "react";
import { AUDIT_ITEMS } from "@/data/canonicalData";
import { Code, X } from "lucide-react";

export default function AuditModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="audit-fab">
      <button className="audit-fab-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : "DEV"}
      </button>

      {isOpen && (
        <div className="audit-panel">
          <div className="eyebrow" style={{ color: "#ff8a5c" }}>
            Auditoria v0.4 · Open Startup School
          </div>
          <h2 style={{ color: "#fff", fontSize: 20 }}>Conformidade do Projeto P01</h2>
          <p style={{ color: "#aaa", fontSize: 13, marginBottom: 16 }}>
            Motor Next.js com transcrições canônicas, áudios versionados e gravação nativa.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {AUDIT_ITEMS.map(([status, title, desc], idx) => (
              <div key={idx} className="audit-item">
                <span className={`audit-tag ${status}`}>{status}</span>
                <div>
                  <strong style={{ color: "#fff", display: "block", fontSize: 13 }}>{title}</strong>
                  <span style={{ color: "#999", fontSize: 12 }}>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
