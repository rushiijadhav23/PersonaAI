"use client";

import { PERSONAS, PersonaId } from "@/lib/types";

interface PersonaTabsProps {
  activePersona: PersonaId;
  onSwitch: (persona: PersonaId) => void;
  disabled: boolean;
}

export default function PersonaTabs({
  activePersona,
  onSwitch,
  disabled,
}: PersonaTabsProps) {
  return (
    <div className="persona-tabs" role="tablist" aria-label="Choose a persona">
      {PERSONAS.map((persona) => {
        const isActive = persona.id === activePersona;
        return (
          <button
            key={persona.id}
            role="tab"
            aria-selected={isActive}
            className={`persona-tab ${isActive ? "persona-tab--active" : ""}`}
            style={
              isActive
                ? ({ "--tab-accent": `var(${persona.accentVar})` } as React.CSSProperties)
                : undefined
            }
            onClick={() => !disabled && onSwitch(persona.id)}
            disabled={disabled && !isActive}
          >
            <span className="persona-tab__label">{persona.tabLabel}</span>
          </button>
        );
      })}

      <style jsx>{`
        .persona-tabs {
          display: flex;
          gap: 2px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
          padding: 6px 8px 0 8px;
        }

        .persona-tab {
          background: transparent;
          border: none;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          padding: 8px 16px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          font-size: 13px;
          position: relative;
          transition: color 0.15s ease, background 0.15s ease;
        }

        .persona-tab:hover:not(:disabled) {
          color: var(--text-primary);
          background: var(--bg-panel);
        }

        .persona-tab--active {
          background: var(--bg-panel);
          color: var(--text-primary);
        }

        .persona-tab--active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          background: var(--tab-accent, var(--text-primary));
        }

        .persona-tab:disabled {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
