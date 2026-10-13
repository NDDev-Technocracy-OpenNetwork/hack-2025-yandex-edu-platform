import React, { useEffect, useState } from 'react';

interface AnimationNode {
  id: number;
  x: number;
  y: number;
  title: string;
  delay: number;
  connected: boolean;
}

interface GraphBuildingAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
  concepts?: { title: string }[];
}

export const GraphBuildingAnimation: React.FC<GraphBuildingAnimationProps> = ({
  isVisible,
  onComplete,
  concepts = []
}) => {
  const [animationStage, setAnimationStage] = useState<'appearing' | 'connecting' | 'finishing' | 'final_logo' | 'complete'>('appearing');
  const [visibleNodes, setVisibleNodes] = useState<number[]>([]);
  const [visibleConnections, setVisibleConnections] = useState<{from: number, to: number}[]>([]);
  
  // Забавные тексты для разных этапов
  const loadingTexts = {
    appearing: 'Прогружаем концепты...',
    connecting: 'Гладим кошек...',
    finishing: 'Прикрепляем контент...',
    final_logo: 'Финализируем магию...',
    complete: 'Удачи в учебе!'
  };
  
  // Create animation nodes from concepts
  const animationNodes: AnimationNode[] = concepts.slice(0, 8).map((concept, index) => ({
    id: index,
    x: 200 + (index % 4) * 400 + Math.random() * 100,
    y: 200 + Math.floor(index / 4) * 300 + Math.random() * 100,
    title: concept.title,
    delay: index * 250, // Ускоренная анимация - 8 секунд
    connected: false
  }));

  // If no concepts provided, use demo data
  if (animationNodes.length === 0) {
    for (let i = 0; i < 6; i++) {
      animationNodes.push({
        id: i,
        x: 300 + (i % 3) * 400 + Math.random() * 100,
        y: 250 + Math.floor(i / 3) * 200 + Math.random() * 100,
        title: `Концепт ${i + 1}`,
        delay: i * 300, // Ускоренная анимация - 8 секунд
        connected: false
      });
    }
  }

  useEffect(() => {
    if (!isVisible) {
      // Сброс состояния когда анимация скрыта
      setAnimationStage('appearing');
      setVisibleNodes([]);
      setVisibleConnections([]);
      return;
    }

    // Сброс состояния при новом запуске
    setAnimationStage('appearing');
    setVisibleNodes([]);
    setVisibleConnections([]);

    // Phase 1: Появление нодов одна за другой
    const nodeTimers: NodeJS.Timeout[] = [];
    
    animationNodes.forEach((node, index) => {
      const timer = setTimeout(() => {
        setVisibleNodes(prev => [...prev, node.id]);
      }, node.delay);
      nodeTimers.push(timer);
    });

    // Phase 2: Построение связей после появления всех нодов
    const connectionsTimer = setTimeout(() => {
      setAnimationStage('connecting');
      
      // Создаем связи между соседними нодами
      const connections: {from: number, to: number}[] = [];
      for (let i = 0; i < animationNodes.length - 1; i++) {
        connections.push({ from: i, to: i + 1 });
        
        // Добавляем некоторые дополнительные связи для красоты
        if (i < animationNodes.length - 2 && Math.random() > 0.5) {
          connections.push({ from: i, to: i + 2 });
        }
      }

      // Анимируем появление связей
      connections.forEach((connection, index) => {
        setTimeout(() => {
          setVisibleConnections(prev => [...prev, connection]);
        }, index * 120); // Ускоренная анимация - 8 секунд
      });

      // Phase 3: Финишная стадия - "Прикрепляем контент"
      const finishingTimer = setTimeout(() => {
        setAnimationStage('finishing');
        
        // Phase 4: Финальный логотип - "Финализируем магию..."
        setTimeout(() => {
          setAnimationStage('final_logo');
          
          // Phase 5: Завершение - "Удачи в учебе!"
          setTimeout(() => {
            setAnimationStage('complete');
            
            // Финальная задержка перед завершением
            setTimeout(() => {
              onComplete();
            }, 1000);
          }, 2500); // Сокращаем время показа логотипа для 8-секундной анимации
        }, 600);
      }, connections.length * 120 + 600); // Ускоряем переходы между фазами

    }, Math.max(...animationNodes.map(n => n.delay)) + 500); // Ускоряем начало фазы связей

    return () => {
      nodeTimers.forEach(clearTimeout);
      clearTimeout(connectionsTimer);
      
      // Дополнительный сброс состояния при размонтировании
      setAnimationStage('appearing');
      setVisibleNodes([]);
      setVisibleConnections([]);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-yellow-400 via-yellow-500 to-red-500 flex items-center justify-center overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #FFDB4D 0%, #FC3F1D 50%, #000000 100%)'
         }}>
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative w-full h-full">
        {/* Yandex.Education Logo - Left */}
        <div className="absolute top-8 left-8 z-10 animate-fade-in">
          <img 
            src="/edu_yandex.svg" 
            alt="Yandex Education" 
            className="h-8 filter drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
        </div>

        {/* ITMOGPT.Team Logo - Right */}
        <div className="absolute top-8 right-8 z-10 animate-fade-in">
          <div className="bg-black bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-white text-xl font-bold tracking-wider">
              ITMO<span className="text-yellow-300">GPT</span>.Team
            </span>
          </div>
        </div>

        {/* Title */}
        {animationStage !== 'final_logo' && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-10">
            <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
              🚀 Строим граф знаний
            </h1>
            <p className="text-xl text-yellow-100 animate-fade-in">
              {loadingTexts[animationStage]}
            </p>
          </div>
        )}

        {/* SVG Container for nodes and connections */}
        <svg 
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ${
            animationStage === 'final_logo' ? 'opacity-20' : 'opacity-100'
          }`}
          viewBox="0 0 1400 800"
          preserveAspectRatio="xMidYMid meet"
          style={{ position: 'fixed' }}
        >
          {/* Define gradients and filters */}
          <defs>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFDB4D" />
              <stop offset="100%" stopColor="#FC3F1D" />
            </radialGradient>
            
            <radialGradient id="nodeGlowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFDB4D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FC3F1D" stopOpacity="0.3" />
            </radialGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connections */}
          {visibleConnections.map((connection, index) => {
            const fromNode = animationNodes[connection.from];
            const toNode = animationNodes[connection.to];
            
            if (!fromNode || !toNode) return null;
            
            return (
              <g key={`connection-${connection.from}-${connection.to}`}>
                {/* Connection line with gradient */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="url(#connectionGradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  className="animate-draw-line"
                  style={{
                    strokeDasharray: Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)),
                    strokeDashoffset: Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2)),
                    animation: `drawLine 1s ease-out forwards`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
                
                {/* Animated particles along the line */}
                <circle
                  r="4"
                  fill="#FFDB4D"
                  className="animate-move-along-line"
                  style={{
                    animation: `moveAlongLine 3s ease-in-out infinite`,
                    animationDelay: `${index * 0.3}s`
                  }}
                >
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    begin={`${index * 0.3}s`}
                    path={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Linear gradient for connections */}
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFDB4D" />
              <stop offset="50%" stopColor="#FFC965" />
              <stop offset="100%" stopColor="#FC3F1D" />
            </linearGradient>
          </defs>

          {/* Nodes */}
          {animationNodes.map((node) => (
            <g 
              key={node.id} 
              className={`transition-all duration-1000 ${
                visibleNodes.includes(node.id) 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-0'
              }`}
              style={{
                transformOrigin: `${node.x}px ${node.y}px`,
                transitionDelay: `${node.delay}ms`
              }}
            >
              {/* Node glow effect */}
              <circle
                cx={node.x}
                cy={node.y}
                r="35"
                fill="url(#nodeGlowGradient)"
                className="animate-pulse"
                style={{
                  animationDuration: '2s',
                  animationDelay: `${node.delay}ms`
                }}
              />
              
              {/* Main node */}
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill="url(#nodeGradient)"
                stroke="#FFFFFF"
                strokeWidth="3"
                filter="url(#glow)"
                className="animate-bounce-gentle"
                style={{
                  animationDuration: '3s',
                  animationDelay: `${node.delay + 200}ms`
                }}
              />
              
              {/* Node icon */}
              <circle
                cx={node.x}
                cy={node.y}
                r="8"
                fill="#FFFFFF"
                className="animate-spin-slow"
                style={{
                  animationDuration: '4s',
                  animationDelay: `${node.delay + 400}ms`
                }}
              />
              
              {/* Node label */}
              <text
                x={node.x}
                y={node.y + 45}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="600"
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${node.delay + 600}ms`
                }}
              >
                {node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title}
              </text>
            </g>
          ))}
        </svg>

        {/* Final Logo Animation */}
        {animationStage === 'final_logo' && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center animate-fade-in-scale">
              {/* Main Logo Container */}
              <div className="relative">
                {/* Animated Border */}
                <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-pulse-border"
                     style={{
                       animation: 'pulse-border 2s ease-in-out infinite',
                       boxShadow: '0 0 30px rgba(255, 219, 77, 0.5), inset 0 0 30px rgba(255, 219, 77, 0.1)'
                     }}>
                </div>
                
                {/* Content */}
                <div className="relative bg-black bg-opacity-60 backdrop-blur-lg px-12 py-8 rounded-2xl border border-yellow-400 border-opacity-30">
                  {/* Yandex Education Logo */}
                  <div className="flex items-center justify-center mb-4">
                    <img 
                      src="/edu_yandex.svg" 
                      alt="Yandex Education" 
                      className="h-12 animate-float"
                      style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                    />
                  </div>
                  
                  {/* X Symbol */}
                  <div className="flex items-center justify-center my-4">
                    <div className="text-yellow-300 text-4xl font-bold animate-spin-slow">
                      ×
                    </div>
                  </div>
                  
                  {/* ITMOGPT.Team Logo */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-white text-2xl font-bold tracking-wider animate-glow">
                        ITMO<span className="text-yellow-300">GPT</span>.Team
                      </span>
                    </div>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="mt-6 text-center">
                    <p className="text-yellow-100 text-sm opacity-80 animate-fade-in-delayed">
                      Образовательная платформа нового поколения
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        {animationStage !== 'final_logo' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-black bg-opacity-40 px-6 py-3 rounded-full backdrop-blur-sm border border-yellow-400 border-opacity-30">
              <div className="w-6 h-6 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-yellow-100 font-medium">
                {Math.min(100, Math.round((visibleNodes.length / Math.max(animationNodes.length, 1)) * 100))}% готово
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS animations */}
      <style>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes moveAlongLine {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0px); 
          }
        }
        
        @keyframes fade-in-scale {
          from { 
            opacity: 0; 
            transform: scale(0.8) translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0px); 
          }
        }
        
        @keyframes pulse-border {
          0%, 100% { 
            border-color: #FFC965;
            box-shadow: 0 0 20px rgba(255, 219, 77, 0.3), inset 0 0 20px rgba(255, 219, 77, 0.1);
          }
          50% { 
            border-color: #FFDB4D;
            box-shadow: 0 0 40px rgba(255, 219, 77, 0.6), inset 0 0 40px rgba(255, 219, 77, 0.2);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255, 219, 77, 0.5); }
          50% { text-shadow: 0 0 20px rgba(255, 219, 77, 0.8), 0 0 30px rgba(255, 219, 77, 0.6); }
        }
        
        @keyframes fade-in-delayed {
          0% { opacity: 0; transform: translateY(10px); }
          30% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 1.2s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
