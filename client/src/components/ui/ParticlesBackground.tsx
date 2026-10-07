import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  left: string;
  width: string;
  height: string;
  animationDuration: string;
  animationDelay: string;
}

const ParticlesBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      animationDuration: `${Math.random() * 25 + 15}s`,
      animationDelay: `${Math.random() * 10}s`,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bg-cyan-500/30 rounded-full particle-anim"
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            bottom: '-10px',
            animation: `float-up ${p.animationDuration} linear infinite`,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; border-radius: 50%; }
          100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
        }
      `}</style>
    </div>
  );
};

export default ParticlesBackground;
