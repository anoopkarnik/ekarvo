import React from "react";
import { ArrowUpRight } from "lucide-react";
import { Icon } from "./Icon";
import { ProductLink } from "./primitives";
import { marketingHref } from "./navigation";
import { PRODUCT_MAP_GROUPS, WORK_LIFECYCLE } from "./data";

export function ProductMap() {
  return (
    <div className="product-map">
      <div className="product-map-heading">
        <div><p className="product-category">THE OPERATING PICTURE</p><h2>Ekarvo Pulse</h2></div>
        <ProductLink href="/products/operations-os">Explore the product</ProductLink>
      </div>
      <div className="product-map-suites">
        {PRODUCT_MAP_GROUPS.map((group) => (
          <a className="map-suite" key={group.name} href={marketingHref(`/products/operations-os#pulse-${group.name.toLowerCase()}`)}>
            <span className="map-signal" aria-hidden="true" />
            <span className="map-suite-name">{group.name}</span>
            <span className="map-suite-role">{group.role}</span>
            <Icon icon={ArrowUpRight} />
          </a>
        ))}
      </div>
      <ol className="map-lifecycle" aria-label="Connected work lifecycle">
        {WORK_LIFECYCLE.map((stage) => <li key={stage}>{stage}</li>)}
      </ol>
      <div className="map-execution">
        <div><p className="product-category">THE DEFINED PATH TO COMPLETION</p><h2>Ekarvo Drive</h2><p>Work moves within agreed authority. Human decisions and acceptance evidence stay connected to the result.</p></div>
        <ProductLink href="/products/autonomous-execution">Explore controlled execution</ProductLink>
      </div>
    </div>
  );
}
