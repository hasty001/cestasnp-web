import React, { useEffect, useRef, useState } from 'react';

const DockPanel = ({ className, children }) => {

  const panel = useRef();
  const [docked, setDocked] = useState(false);

  const scrolled = (event) => {
    
    const appBody = document.getElementsByClassName("app-body")[0];
    if (panel.current && appBody) {
      setDocked(panel.current.offsetTop + panel.current.offsetHeight - appBody.scrollTop + 15 <= appBody.clientHeight);
    }
  };

  useEffect(() => {
    document.getElementsByClassName("app-body")[0].addEventListener("scroll", scrolled);
    window.addEventListener("resize", scrolled);
    scrolled();

    return () => {
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener("resize", scrolled);
    };
  })

  
  return (
    <>
      <div ref={panel} className={className + " docked"} style={{visibility: docked ? "visible" : "hidden"}}>
        {children}
      </div>
      <div className={className} style={{visibility: docked ? "hidden" : "visible"}}>
        {children}
      </div>
    </>
  );
  }

export default DockPanel;
