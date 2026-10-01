"use client";

import React from "react";
import { LayoutDashboard, FileCheck2, FileText, History, User } from "lucide-react";

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: "overview", label: "Visão geral", icon: LayoutDashboard },
    { id: "assessments", label: "Avaliações", icon: FileCheck2 },
    { id: "reports", label: "Laudos P01", icon: FileText },
    { id: "history", label: "Histórico", icon: History },
    { id: "profile", label: "Minha conta", icon: User },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="brand brand-wrap">
            <span className="logo">O</span>
            <span>
              <small>Open Startup</small>
              School
            </span>
          </div>
          <nav className="nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={activePage === item.id ? "active" : ""}
                  onClick={() => setActivePage(item.id)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <Icon size={18} />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-foot">
          <div className="user-mini">
            <div className="avatar">LC</div>
            <div>
              <strong>Lucas</strong>
              <div className="muted" style={{ fontSize: 12 }}>Participante</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <header className="mobile-topbar">
        <div className="brand">
          <span className="logo">O</span>
          <span>Open Startup School</span>
        </div>
        <div className="badge" style={{ fontSize: 11, padding: "4px 8px" }}>
          <span className="dot orange" /> P01 v0.4
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-nav-items">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`mobile-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
