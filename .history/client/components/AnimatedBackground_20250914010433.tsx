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


import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ee5a24', '#009432', '#0652dd', '#9c88ff', '#fbc531'
];

export default function BalloonBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const createBalloon = (id: number): Particle => ({
      id,
      x: Math.random() * dimensions.width,
      y: dimensions.height + Math.random() * 200, // start below screen
      size: Math.random() * 20 + 30, // bigger size for balloons
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.5, // slight horizontal drift
      speedY: -(Math.random() * 1 + 0.5), // always floating upward
      rotation: Math.random() * 10 // tiny sway
    });

    const initialBalloons = Array.from({ length: 20 }, (_, i) => createBalloon(i));
    setParticles(initialBalloons);
  }, [dimensions]);

  useEffect(() => {
    const animate = () => {
      setParticles(prev =>
        prev.map(b => {
          let newY = b.y + b.speedY;
          let newX = b.x + b.speedX;

          // Reset balloon if it floats above screen
          if (newY < -100) {
            newY = dimensions.height + 50;
            newX = Math.random() * dimensions.width;
          }

          return {
            ...b,
            x: newX,
            y: newY,
            rotation: b.rotation + Math.sin(Date.now() / 1000) * 0.1 // small wobble
          };
        })
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [dimensions]);

  const renderBalloon = (b: Particle) => (
    <div
      key={b.id}
      className="absolute pointer-events-none flex flex-col items-center"
      style={{
        left: b.x,
        top: b.y,
        transform: `rotate(${b.rotation}deg)`
      }}
    >
      {/* Balloon (oval) */}
      <div
        style={{
          width: b.size * 0.8,
          height: b.size,
          backgroundColor: b.color,
          borderRadius: '50% 50% 50% 50%',
          boxShadow: 'inset -4px -6px rgba(0,0,0,0.2)'
        }}
      ></div>
      {/* String */}
      <div
        style={{
          width: 2,
          height: b.size * 1.5,
          backgroundColor: '#666',
          marginTop: -2
        }}
      ></div>
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(renderBalloon)}
    </div>
  );
}
