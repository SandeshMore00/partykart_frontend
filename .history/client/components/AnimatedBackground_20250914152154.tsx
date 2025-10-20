// import { useEffect, useState } from 'react';

// interface Particle {
//   id: number;
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   speedX: number;
//   speedY: number;
//   type: 'sprinkle' | 'star';
//   rotation: number;
//   rotationSpeed: number;
// }

// const colors = [
//   '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
//   '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
//   '#ee5a24', '#009432', '#0652dd', '#9c88ff', '#fbc531'
// ];

// export default function AnimatedBackground() {
//   const [particles, setParticles] = useState<Particle[]>([]);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     const updateDimensions = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight
//       });
//     };

//     updateDimensions();
//     window.addEventListener('resize', updateDimensions);

//     return () => window.removeEventListener('resize', updateDimensions);
//   }, []);

//   useEffect(() => {
//     if (dimensions.width === 0 || dimensions.height === 0) return;

//     const createParticle = (id: number): Particle => ({
//       id,
//       x: Math.random() * dimensions.width,
//       y: Math.random() * dimensions.height,
//       size: Math.random() * 6 + 2,
//       color: colors[Math.floor(Math.random() * colors.length)],
//       speedX: (Math.random() - 0.5) * 0.5,
//       speedY: (Math.random() - 0.5) * 0.5,
//       type: Math.random() > 0.5 ? 'sprinkle' : 'star',
//       rotation: Math.random() * 360,
//       rotationSpeed: (Math.random() - 0.5) * 2
//     });

//     const initialParticles = Array.from({ length: 50 }, (_, i) => createParticle(i));
//     setParticles(initialParticles);
//   }, [dimensions]);

//   useEffect(() => {
//     const animateParticles = () => {
//       setParticles(prevParticles =>
//         prevParticles.map(particle => ({
//           ...particle,
//           x: particle.x + particle.speedX,
//           y: particle.y + particle.speedY,
//           rotation: particle.rotation + particle.rotationSpeed,
//           ...(particle.x > dimensions.width && { x: -10 }),
//           ...(particle.x < -10 && { x: dimensions.width }),
//           ...(particle.y > dimensions.height && { y: -10 }),
//           ...(particle.y < -10 && { y: dimensions.height })
//         }))
//       );
//     };

//     const interval = setInterval(animateParticles, 50);
//     return () => clearInterval(interval);
//   }, [dimensions]);

//   const renderParticle = (particle: Particle) => {
//     if (particle.type === 'star') {
//       return (
//         <div
//           key={particle.id}
//           className="absolute pointer-events-none"
//           style={{
//             left: particle.x,
//             top: particle.y,
//             transform: `rotate(${particle.rotation}deg)`,
//             color: particle.color,
//             fontSize: particle.size * 2
//           }}
//         >
//           ★
//         </div>
//       );
//     } else {
//       return (
//         <div
//           key={particle.id}
//           className="absolute pointer-events-none rounded-full"
//           style={{
//             left: particle.x,
//             top: particle.y,
//             width: particle.size,
//             height: particle.size * 3,
//             backgroundColor: particle.color,
//             transform: `rotate(${particle.rotation}deg)`,
//             borderRadius: '50%'
//           }}
//         />
//       );
//     }
//   };

//   return (
//     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//       {particles.map(renderParticle)}
//     </div>
//   );
// }


// import { useEffect, useState } from "react";

// interface Balloon {
//   id: number;
//   x: number;
//   y: number;
//   size: number;
//   color: string;
//   speedX: number;
//   speedY: number;
//   opacity: number;
// }

// const colors = ["#ff6b6b", "#feca57", "#54a0ff", "#1dd1a1", "#f368e0"];

// export default function BalloonAnimation() {
//   const [balloons, setBalloons] = useState<Balloon[]>([]);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

//   useEffect(() => {
//     const updateDimensions = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };
//     updateDimensions();
//     window.addEventListener("resize", updateDimensions);
//     return () => window.removeEventListener("resize", updateDimensions);
//   }, []);

//   useEffect(() => {
//     if (dimensions.width === 0 || dimensions.height === 0) return;

//     const createBalloon = (id: number): Balloon => ({
//       id,
//       x: Math.random() * dimensions.width,
//       y: dimensions.height + Math.random() * 200, // start below screen
//       size: Math.random() * 30 + 30, // bigger balloons
//       color: colors[Math.floor(Math.random() * colors.length)],
//       speedX: (Math.random() - 0.5) * 0.5, // gentle drift
//       speedY: -Math.random() * 1 - 0.5, // always float upward
//       opacity: 1,
//     });

//     const initialBalloons = Array.from({ length: 20 }, (_, i) =>
//       createBalloon(i)
//     );
//     setBalloons(initialBalloons);
//   }, [dimensions]);

//   useEffect(() => {
//     const animate = () => {
//       setBalloons((prev) =>
//         prev.map((b) => {
//           let newY = b.y + b.speedY;
//           let newOpacity = b.opacity - 0.002; // fade slowly
//           if (newY < -100 || newOpacity <= 0) {
//             // reset balloon at bottom
//             return {
//               ...b,
//               x: Math.random() * dimensions.width,
//               y: dimensions.height + 50,
//               opacity: 1,
//             };
//           }
//           return {
//             ...b,
//             x: b.x + b.speedX,
//             y: newY,
//             opacity: newOpacity,
//           };
//         })
//       );
//     };

//     const interval = setInterval(animate, 30);
//     return () => clearInterval(interval);
//   }, [dimensions]);

//   return (
//     <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
//       {balloons.map((b) => (
//         <div
//           key={b.id}
//           className="absolute flex flex-col items-center"
//           style={{
//             left: b.x,
//             top: b.y,
//             opacity: b.opacity,
//           }}
//         >
//           {/* Balloon shape */}
//           <div
//             style={{
//               width: b.size,
//               height: b.size * 1.3,
//               backgroundColor: b.color,
//               borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
//               boxShadow: "inset -4px -6px rgba(0,0,0,0.1)",
//             }}
//           />
//           {/* String */}
//           <div
//             style={{
//               width: 2,
//               height: 40,
//               backgroundColor: "#555",
//               marginTop: 2,
//             }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }


import { useEffect, useState } from "react";

interface LogoParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

export default function LogoBackground() {
  const [logos, setLogos] = useState<LogoParticle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const createLogo = (id: number): LogoParticle => ({
      id,
      x: Math.random() * dimensions.width,
      y: dimensions.height + Math.random() * 200, // start below
      size: Math.random() * 60 + 40, // random size
      speedX: (Math.random() - 0.5) * 0.5, // gentle drift
      speedY: -Math.random() * 1 - 0.3, // float upward
      opacity: 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });

    setLogos(Array.from({ length: 15 }, (_, i) => createLogo(i)));
  }, [dimensions]);

  useEffect(() => {
    const animate = () => {
      setLogos((prev) =>
        prev.map((logo) => {
          let newY = logo.y + logo.speedY;
          let newOpacity = logo.opacity - 0.0015;
          let newRotation = logo.rotation + logo.rotationSpeed;

          if (newY < -100 || newOpacity <= 0) {
            // respawn at bottom
            return {
              ...logo,
              x: Math.random() * dimensions.width,
              y: dimensions.height + 50,
              opacity: 0.8,
              rotation: Math.random() * 360,
            };
          }

          return {
            ...logo,
            x: logo.x + logo.speedX,
            y: newY,
            opacity: newOpacity,
            rotation: newRotation,
          };
        })
      );
    };

    const interval = setInterval(animate, 30);
    return () => clearInterval(interval);
  }, [dimensions]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {logos.map((logo) => (
        <img
          key={logo.id}
          src="/images/logo.png"
          alt="logo"
          style={{
            position: "absolute",
            left: logo.x,
            top: logo.y,
            width: logo.size,
            height: logo.size,
            opacity: logo.opacity,
            transform: `rotate(${logo.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
