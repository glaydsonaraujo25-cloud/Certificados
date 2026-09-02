import React, { useEffect, useRef, useState } from 'react';
/** Scales the preview only; PDF export retains the original A4 dimensions. */
export function CertificatePreview({children}: {children: React.ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setScale(Math.min(1, element.clientWidth / 1050));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="w-full min-w-0" style={{maxWidth:1050,height:742*scale}}><div style={{width:1050,height:742,transform:`scale(${scale})`,transformOrigin:'top left'}}>{children}</div></div>;
}
