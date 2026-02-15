import type { ReactNode } from "react";

export const StatusCard = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <section className="card stack">
      <h2>{title}</h2>
      <div className="stack">{children}</div>
    </section>
  );
};
