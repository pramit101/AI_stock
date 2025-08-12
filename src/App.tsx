import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./App.css";

export default function LoopingText() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // Duplicate the text content so it loops seamlessly
    const element = textRef.current;

    gsap.to(element, {
      duration: 1,
      color: "#ff0000",
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    gsap.to("#logo", {
      rotation: 360, // degrees
      transformOrigin: "50% 50%", // center point of SVG
      duration: 4, // seconds per full rotation
      repeat: -1, // loop forever
      ease: "linear", // constant speed
    });
  }, []);

  return (
    <>
      <div id="main_text">
        <div id="logo">
          <img src="/src/assets/icon.svg" alt="Logo" />
        </div>
        <div ref={textRef} style={{ display: "inline-block" }}>
          TEAM PENTAVISION
        </div>
      </div>
    </>
  );
}
