import React, { useState } from "react";
import {
  Laptop, Shield, Droplets, Thermometer, Zap, Trash2, WifiOff, Monitor,
  Play, Pause, Battery, BatteryLow, Clock, CheckCircle, AlertTriangle,
  Smartphone, Tablet, Camera, Headphones, Calculator, TrendingUp,
  Volume2, Settings, Eye, Lightbulb, Wrench, BookOpen, ExternalLink
} from "lucide-react";
import pantalla from "../assets/pantalla.png";
import teclado from "../assets/teclado.png";
import ventilacion from "../assets/ventilacion.png";
import "../style/BlogTipsDispositivos.css";


const BlogTipsDispositivos = () => {
  // 👉 Estados que faltaban
  const [checkedSteps, setCheckedSteps] = useState({});
  const [activeGuide, setActiveGuide] = useState(null);
  const [batteryCalculator, setBatteryCalculator] = useState({
    deviceType: "laptop",
    usage: "normal",
    age: 1,
    result: null,
  });

  // 👇 FUNCIÓN QUE FALTABA
  const openVideo = (url) => {
    window.open(url, "_blank");
  };


const videos = [ 
  {
    id: 'limpieza-pantalla',
    title: 'Cómo limpiar correctamente la pantalla',
    duration: '3:24',
    thumbnail: pantalla, // 👈 ahora es imagen
    category: 'Limpieza',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'limpieza-teclado',
    title: 'Mantenimiento del teclado',
    duration: '4:12',
    thumbnail: teclado, // 👈 imagen
    category: 'Mantenimiento',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'ventilacion',
    title: 'Limpiar sistema de ventilación',
    duration: '6:33',
    thumbnail: ventilacion, // 👈 imagen
    category: 'Refrigeración',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  }
];


  const tips = [
    {
      icon: <Thermometer className="tip-icon" />,
      title: "Controla la temperatura",
      description: "Usa una toallita suave para limpiar el polvo de las rejillas de ventilación. El sobrecalentamiento reduce la vida útil del equipo.",
      category: "Mantenimiento",
      details: "La temperatura ideal de operación es entre 10°C y 35°C. Limpia las rejillas cada 3 meses."

    },
    {
      icon: <Monitor className="tip-icon" />,
      title: "Limpia la pantalla correctamente",
      description: "Usa un paño de microfibra ligeramente húmedo. Nunca rocíes líquidos directamente sobre la pantalla.",
      category: "Limpieza",
      details: "Apaga el equipo antes de limpiar. Usa movimientos circulares suaves desde el centro hacia afuera."
    },
    {
      icon: <Battery className="tip-icon" />,
      title: "Optimiza la batería",
      description: "Evita descargas completas frecuentes. Mantén la carga entre 20% y 80% para maximizar la vida útil.",
      category: "Batería",
      details: "Las baterías modernas tienen entre 500-1000 ciclos de carga. Un ciclo = 0% a 100%."
    },
    {
      icon: <Trash2 className="tip-icon" />,
      title: "Limpia archivos regularmente",
      description: "Elimina archivos temporales y programas innecesarios. Mantén al menos 15% de espacio libre en el disco duro.",
      category: "Software",
      details: "Un disco lleno reduce el rendimiento hasta en un 40%. Usa herramientas de limpieza automática."
    }
  ];

  const cleaningGuides = [
    {
      id: 'pantalla',
      title: 'Limpieza de Pantalla',
      icon: <Monitor className="guide-icon" />,
      steps: [
        'Apaga completamente el dispositivo',
        'Desconecta todos los cables',
        'Prepara un paño de microfibra limpio',
        'Humedece ligeramente con agua destilada',
        'Limpia con movimientos circulares suaves',
        'Seca con otro paño limpio',
        'Espera 5 minutos antes de encender'
      ],
      warning: 'Nunca uses alcohol, acetona o limpiadores químicos'
    },
    {
      id: 'teclado',
      title: 'Limpieza de Teclado',
      icon: <Laptop className="guide-icon" />,
      steps: [
        'Apaga y desconecta el dispositivo',
        'Voltea el teclado para eliminar residuos',
        'Usa aire comprimido entre las teclas',
        'Limpia teclas con paño húmedo',
        'Para manchas difíciles: isopropílico al 70%',
        'Seca completamente',
        'Reconecta y prueba'
      ],
      warning: 'No uses demasiada agua para evitar daños internos'
    },
    {
      id: 'ventilacion',
      title: 'Sistema de Ventilación',
      icon: <Thermometer className="guide-icon" />,
      steps: [
        'Apaga y desconecta completamente',
        'Localiza las rejillas de ventilación',
        'Usa aire comprimido en ráfagas cortas',
        'Mantén 15cm de distancia mínimo',
        'Limpia desde adentro hacia afuera',
        'Usa pincel suave para polvo adherido',
        'Verifica que los ventiladores giren libremente'
      ],
      warning: 'Nunca uses aspiradora directamente en los componentes'
    }
  ];

  const batteryTips = [
    { icon: <Settings />, tip: 'Ajusta el brillo de pantalla al 50-70%' },
    { icon: <WifiOff />, tip: 'Desactiva WiFi y Bluetooth cuando no los uses' },
    { icon: <Volume2 />, tip: 'Reduce el volumen del sistema' },
    { icon: <Eye />, tip: 'Usa modo oscuro cuando sea posible' },
    { icon: <Lightbulb />, tip: 'Activa el modo de ahorro de energía' },
    { icon: <Wrench />, tip: 'Cierra aplicaciones que no uses' }
  ];

  const calculateBattery = () => {
    const { deviceType, usage, age } = batteryCalculator;
    let baseDuration = 8; // horas base
    
    // Ajuste por tipo de dispositivo
    const deviceMultiplier = {
      laptop: 1,
      smartphone: 0.6,
      tablet: 1.2
    };
    
    // Ajuste por uso
    const usageMultiplier = {
      light: 1.4,
      normal: 1,
      heavy: 0.6,
      gaming: 0.4
    };
    
    // Degradación por edad
    const ageReduction = Math.max(0.5, 1 - (age * 0.15));
    
    const result = Math.round(
      baseDuration * 
      deviceMultiplier[deviceType] * 
      usageMultiplier[usage] * 
      ageReduction * 10
    ) / 10;
    
    setBatteryCalculator(prev => ({ ...prev, result }));
  };

  const toggleStep = (guideId, stepIndex) => {
    const key = `${guideId}-${stepIndex}`;
    setCheckedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="blog-tips-container">
      {/* Hero Section */}
      <section className="tips-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Mantén tus <span className="gradient-text">dispositivos</span> como nuevos
          </h1>
          <p className="hero-subtitle">
            Guías paso a paso, videos tutoriales y calculadoras interactivas para el cuidado profesional de tus equipos
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Videos Tutoriales</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Tips Profesionales</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Guías Interactivas</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-devices">
            <Laptop className="device-icon laptop" />
            <Smartphone className="device-icon smartphone" />
            <Tablet className="device-icon tablet" />
          </div>
        </div>
      </section>

      <div className="content-container">
<section className="videos-section">
  <div className="section-header">
    <Play className="section-icon" />
    <h2 className="section-title">Videos Tutoriales</h2>
    <p className="section-subtitle">Aprende visualmente con nuestras guías paso a paso</p>
  </div>

  <div className="videos-grid">
    {videos.map((video) => (
      <div key={video.id} className="video-card" onClick={() => openVideo(video.youtubeUrl)}>
        <div
          className="video-thumbnail"
          style={{ backgroundImage: `url(${video.thumbnail})` }}
        >
          <div className="video-overlay">
            <button className="play-btn">
              <Play className="play-icon" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3>{video.title}</h3>
          <p>Haz clic para ver en YouTube</p>
        </div>
      </div>
    ))}
  </div>
</section>


        {/* Battery Calculator */}
        <section className="calculator-section">
          <div className="section-header">
            <Calculator className="section-icon" />
            <h2 className="section-title">Calculadora de Batería</h2>
            <p className="section-subtitle">Estima la duración de tu batería según el uso</p>
          </div>

          <div className="calculator-container">
            <div className="calculator-inputs">
              <div className="input-group">
                <label>Tipo de dispositivo</label>
                <select 
                  value={batteryCalculator.deviceType}
                  onChange={(e) => setBatteryCalculator(prev => ({...prev, deviceType: e.target.value}))}
                >
                  <option value="laptop">Laptop</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="tablet">Tablet</option>
                </select>
              </div>

              <div className="input-group">
                <label>Tipo de uso</label>
                <select 
                  value={batteryCalculator.usage}
                  onChange={(e) => setBatteryCalculator(prev => ({...prev, usage: e.target.value}))}
                >
                  <option value="light">Ligero (navegación, texto)</option>
                  <option value="normal">Normal (multitarea básica)</option>
                  <option value="heavy">Intensivo (video, diseño)</option>
                  <option value="gaming">Gaming/Renderizado</option>
                </select>
              </div>

              <div className="input-group">
                <label>Antigüedad (años)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  value={batteryCalculator.age}
                  onChange={(e) => setBatteryCalculator(prev => ({...prev, age: parseInt(e.target.value)}))}
                />
                <span className="range-value">{batteryCalculator.age} años</span>
              </div>

              <button className="calculate-btn" onClick={calculateBattery}>
                <Calculator className="btn-icon" />
                Calcular Duración
              </button>
            </div>

            {batteryCalculator.result && (
              <div className="calculator-result">
                <Battery className="result-icon" />
                <div className="result-text">
                  <h3>Duración estimada</h3>
                  <span className="result-hours">{batteryCalculator.result} horas</span>
                </div>
              </div>
            )}

            <div className="battery-optimization">
              <h4>Tips para optimizar la batería:</h4>
              <div className="battery-tips-grid">
                {batteryTips.map((tip, index) => (
                  <div key={index} className="battery-tip">
                    {tip.icon}
                    <span>{tip.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Cleaning Guides */}
        <section className="guides-section">
          <div className="section-header">
            <BookOpen className="section-icon" />
            <h2 className="section-title">Guías Interactivas de Limpieza</h2>
            <p className="section-subtitle">Sigue estos pasos para un mantenimiento perfecto</p>
          </div>

          <div className="guides-tabs">
            {cleaningGuides.map((guide) => (
              <button 
                key={guide.id}
                className={`guide-tab ${activeGuide === guide.id ? 'active' : ''}`}
                onClick={() => setActiveGuide(guide.id)}
              >
                {guide.icon}
                {guide.title}
              </button>
            ))}
          </div>

          {activeGuide && (
            <div className="guide-content">
              {cleaningGuides.find(g => g.id === activeGuide) && (
                <div className="guide-steps">
                  <div className="guide-warning">
                    <AlertTriangle className="warning-icon" />
                    <span>{cleaningGuides.find(g => g.id === activeGuide).warning}</span>
                  </div>
                  
                  <div className="steps-list">
                    {cleaningGuides.find(g => g.id === activeGuide).steps.map((step, index) => (
                      <div 
                        key={index} 
                        className={`step-item ${checkedSteps[`${activeGuide}-${index}`] ? 'completed' : ''}`}
                        onClick={() => toggleStep(activeGuide, index)}
                      >
                        <div className="step-checkbox">
                          {checkedSteps[`${activeGuide}-${index}`] ? (
                            <CheckCircle className="check-icon" />
                          ) : (
                            <div className="unchecked-circle" />
                          )}
                        </div>
                        <div className="step-content">
                          <span className="step-number">Paso {index + 1}</span>
                          <p className="step-description">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tips Grid */}
        <section className="tips-section">
          <div className="section-header">
            <Shield className="section-icon" />
            <h2 className="section-title">Tips Esenciales de Mantenimiento</h2>
            <p className="section-subtitle">Conocimiento profesional para el cuidado diario</p>
          </div>

          <div className="tips-grid">
            {tips.map((tip, index) => (
              <div key={index} className="tip-card">
                <div className="tip-header">
                  {tip.icon}
                  <span className="tip-category">{tip.category}</span>
                </div>
                <h3 className="tip-title">{tip.title}</h3>
                <p className="tip-description">{tip.description}</p>
                <div className="tip-details">
                  <span className="details-label">💡 Dato profesional:</span>
                  <p className="details-text">{tip.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-card">
              <TrendingUp className="stat-icon" />
              <h3>85%</h3>
              <p>De las fallas se previenen con mantenimiento regular</p>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" />
              <h3>3x</h3>
              <p>Más vida útil con cuidado adecuado</p>
            </div>
            <div className="stat-card">
              <Shield className="stat-icon" />
              <h3>60%</h3>
              <p>Menos reparaciones necesarias</p>
            </div>
            <div className="stat-card">
              <Battery className="stat-icon" />
              <h3>40%</h3>
              <p>Mejor rendimiento de batería</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
<section className="cta-section">
  <div className="cta-content">
    <h3 className="cta-title">¿Tu dispositivo necesita atención profesional?</h3>
    <p className="cta-description">
      Nuestros técnicos certificados ofrecen diagnóstico gratuito y reparaciones especializadas
    </p>
    <div className="cta-buttons">
      <a href="/servicios/solicitar-reparacion" className="cta-button primary">
        <Wrench className="button-icon" />
        Solicitar Reparación
      </a>
    </div>
    <div className="cta-guarantee">
      <CheckCircle className="guarantee-icon" />
      <span>Garantía de 6 meses en todas las reparaciones</span>
    </div>
  </div>
</section>



      </div>
    </div>
  );
};

export default BlogTipsDispositivos;

