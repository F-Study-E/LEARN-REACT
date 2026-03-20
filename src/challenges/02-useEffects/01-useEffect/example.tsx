import { useState, useEffect } from "react";

const ScrollIndicator = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (totalHeight > 0) {
        setProgress((currentScroll / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  //   useLayoutEffect(() => {
  //     const handleScroll = () => {
  //       const totalHeight =
  //         document.documentElement.scrollHeight - window.innerHeight;
  //       const currentScroll = window.scrollY;

  //       if (totalHeight > 0) {
  //         setProgress((currentScroll / totalHeight) * 100);
  //       }
  //     };

  //     window.addEventListener("scroll", handleScroll);
  //     return () => window.removeEventListener("scroll", handleScroll);
  //   }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        height: "10px",
        background: "#eee",
        zIndex: 100,
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "#4caf50",
          transition: "width 0.1s ease-out",
        }}
      />
    </div>
  );
};

export default ScrollIndicator;
