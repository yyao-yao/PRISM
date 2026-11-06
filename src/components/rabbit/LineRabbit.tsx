'use client';

import { useEffect, useRef } from 'react';
import { mountAmbientRabbit } from './ambientRabbit.mjs';
import styles from './lineRabbit.module.css';

/** An occasional decorative visitor; no click target or announced UI. */
export default function LineRabbit() {
  const region = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!region.current) return;
    return mountAmbientRabbit(region.current);
  }, []);

  return <div ref={region} className={styles.region} data-line-rabbit aria-hidden="true" />;
}
