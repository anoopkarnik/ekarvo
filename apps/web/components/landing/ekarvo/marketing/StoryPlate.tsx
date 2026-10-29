import React from "react";

export interface StoryPlateProps {
  eyebrow: string;
  title: string;
  body: string;
  stages: readonly [string, string, string];
}

export function StoryPlate({ eyebrow, title, body, stages }: StoryPlateProps) {
  return (
    <div className="container">
      <figure className="story-plate">
        <ol className="story-diagram" aria-label={stages.join(" to ")}>
          {stages.map((stage) => <li className="story-diagram-stage" key={stage}><span className="story-diagram-node" aria-hidden="true" /><strong>{stage}</strong></li>)}
        </ol>
        <figcaption className="story-plate-copy"><p className="product-category">{eyebrow}</p><h2>{title}</h2><p>{body}</p></figcaption>
      </figure>
    </div>
  );
}
