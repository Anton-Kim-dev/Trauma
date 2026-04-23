import React from "react";
import type { ReactNode } from "react";

export const Panel = ({
  action,
  children,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) => (
  <section className="panel">
    <header className="panel-header">
      <div>
        {eyebrow ? <p className="panel-eyebrow">{eyebrow}</p> : null}
        <h2 className="panel-title">{title}</h2>
      </div>
      {action}
    </header>
    {children}
  </section>
);
