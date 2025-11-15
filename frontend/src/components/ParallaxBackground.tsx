import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface Orb {
  x: number;
  y: number;
  size: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

export function ParallaxBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Initialize orbs
    const colors = [
      'rgba(239, 68, 68, 0.15)',    // red
      'rgba(251, 113, 133, 0.15)',  // rose
      'rgba(16, 185, 129, 0.15)',   // emerald
      'rgba(245, 158, 11, 0.15)',   // amber
      'rgba(59, 130, 246, 0.15)',   // blue
      'rgba(168, 85, 247, 0.15)',   // purple
    ];
    
    const orbCount = 6;
    for (let i = 0; i < orbCount; i++) {
      orbsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 150 + 100,
        color: colors[i % colors.length],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
      });
    }

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(43, 43, 43, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update orbs
      orbsRef.current.forEach((orb) => {
        orb.pulse += orb.pulseSpeed;
        const pulseSize = orb.size + Math.sin(orb.pulse) * 20;

        // Create gradient
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseSize);
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Slow movement
        orb.x += Math.sin(orb.pulse * 0.5) * 0.2;
        orb.y += Math.cos(orb.pulse * 0.3) * 0.2;

        // Wrap around screen
        if (orb.x < -orb.size) orb.x = canvas.width + orb.size;
        if (orb.x > canvas.width + orb.size) orb.x = -orb.size;
        if (orb.y < -orb.size) orb.y = canvas.height + orb.size;
        if (orb.y > canvas.height + orb.size) orb.y = -orb.size;
      });

      // Draw and update particles
      particlesRef.current.forEach((particle) => {
        // Parallax effect based on mouse
        const dx = mouseRef.current.x - canvas.width / 2;
        const dy = mouseRef.current.y - canvas.height / 2;
        const parallaxX = dx * 0.01 * particle.size;
        const parallaxY = dy * 0.01 * particle.size;

        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(
          particle.x + parallaxX,
          particle.y + parallaxY,
          particle.size,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Twinkle effect
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ background: '#2b2b2b', zIndex: -1 }}
    />
  );
}

