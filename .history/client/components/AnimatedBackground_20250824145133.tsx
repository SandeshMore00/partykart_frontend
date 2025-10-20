import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  type: 'sprinkle' | 'star';
  rotation: number;
  rotationSpeed: number;
}

const colors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
  '#ee5a24', '#009432', '#0652dd', '#9c88ff', '#fbc531'
];

export default function AnimatedBackground() {
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

    const createParticle = (id: number): Particle => ({
      id,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      type: Math.random() > 0.5 ? 'sprinkle' : 'star',
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2
    });

    const initialParticles = Array.from({ length: 50 }, (_, i) => createParticle(i));
    setParticles(initialParticles);
  }, [dimensions]);

  useEffect(() => {
    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
          rotation: particle.rotation + particle.rotationSpeed,
          ...(particle.x > dimensions.width && { x: -10 }),
          ...(particle.x < -10 && { x: dimensions.width }),
          ...(particle.y > dimensions.height && { y: -10 }),
          ...(particle.y < -10 && { y: dimensions.height })
        }))
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, [dimensions]);

  const renderParticle = (particle: Particle) => {
    if (particle.type === 'star') {
      return (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            color: particle.color,
            fontSize: particle.size * 2
          }}
        >
          ★
        </div>
      );
    } else {
      return (
        <div
          key={particle.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size * 3,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: '50%'
          }}
        />
      );
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(renderParticle)}
    </div>
  );
}
