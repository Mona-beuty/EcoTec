import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  Handshake, 
  Laptop, 
  Cog,
  Rocket,
  Award,
  Globe
} from "lucide-react";
import '../style/Empresa.css';

// Importamos las imágenes
import MariaImg from "../assets/maria.jpg";
import CarlosImg from "../assets/carlos.jpg";
import AnaImg from "../assets/ana.jpeg";

const Empresa = () => {
  const [activeTab, setActiveTab] = useState("mision");
  const [counters] = useState({
    projects: 1500,
    clients: 800,
    years: 5,
    team: 20,
  });

  const teamMembers = [
    {
      name: "María López",
      role: "CEO & Fundadora",
      description: "Experta en transformación digital con 12+ años de experiencia",
      skills: ["Liderazgo", "Estrategia", "Innovación"],
      image: MariaImg,
    },
    {
      name: "Carlos Pérez",
      role: "CTO",
      description: "Especialista en ciberseguridad y arquitectura de sistemas",
      skills: ["Ciberseguridad", "Cloud", "DevOps"],
      image: CarlosImg,
    },
    {
      name: "Ana Torres",
      role: "Project Manager",
      description: "Gestión de proyectos tecnológicos complejos",
      skills: ["Gestión", "Metodologías Ágiles", "Calidad"],
      image: AnaImg,
    },
  ];

  return (
    <div className="emp-container">
      {/* Hero Section */}
      <section className="emp-hero-section">
        <div className="emp-hero-background"></div>
        <div className="emp-hero-content">
          <h1 className="emp-hero-title">
            Damos nueva vida a la tecnología
            <span className="emp-gradient-text"> Soporte Tecnológico</span>
          </h1>
          <p className="emp-hero-subtitle">
            Venta, compra y reventa de dispositivos, con soporte técnico confiable y repuestos garantizados
          </p>

          <div className="emp-badge-container">
            <div className="emp-hero-badge">
              <Rocket className="emp-badge-icon" />
              <span>Innovación Tecnológica</span>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="emp-stats-section">
        <div className="emp-inner-container">
          <div className="emp-stats-grid">
            <div className="emp-stat-item">
              <div className="emp-stat-number">{counters.projects}+</div>
              <div className="emp-stat-label">Dispositivos restaurados</div>
            </div>
            <div className="emp-stat-item">
              <div className="emp-stat-number">{counters.clients}+</div>
              <div className="emp-stat-label">Clientes Satisfechos</div>
            </div>
            <div className="emp-stat-item">
              <div className="emp-stat-number">{counters.years}+</div>
              <div className="emp-stat-label">Años de Experiencia</div>
            </div>
            <div className="emp-stat-item">
              <div className="emp-stat-number">{counters.team}+</div>
              <div className="emp-stat-label">Profesionales</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="emp-about-section">
        <div className="emp-inner-container">
          <div className="emp-section-header">
            <h2 className="emp-section-title">Conoce Nuestra Historia</h2>
            <p className="emp-section-subtitle">
              Somos pioneros en soluciones tecnológicas que impulsan el crecimiento empresarial
            </p>
          </div>
          
          <div className="emp-about-content">
            <div className="emp-about-tabs">
              <button 
                className={`emp-tab-button ${activeTab === 'mision' ? 'active' : ''}`}
                onClick={() => setActiveTab('mision')}
              >
                <Rocket />
                Misión
              </button>
              <button 
                className={`emp-tab-button ${activeTab === 'vision' ? 'active' : ''}`}
                onClick={() => setActiveTab('vision')}
              >
                <Globe />
                Visión
              </button>
              <button 
                className={`emp-tab-button ${activeTab === 'valores' ? 'active' : ''}`}
                onClick={() => setActiveTab('valores')}
              >
                <Award />
                Valores
              </button>
            </div>

            <div className="emp-tab-content">
              {activeTab === 'mision' && (
                <div className="emp-tab-panel">
                  <h3>Nuestra Misión</h3>
                  <p>
                    Transformar la manera en que las empresas interactúan con la tecnología, 
                    ofreciendo soluciones innovadoras de ciberseguridad y desarrollo que 
                    impulsen su crecimiento y protejan sus activos digitales.
                  </p>
                </div>
              )}
              {activeTab === 'vision' && (
                <div className="emp-tab-panel">
                  <h3>Nuestra Visión</h3>
                  <p>
                    Ser la empresa líder en Latinoamérica en soluciones de ciberseguridad 
                    y desarrollo tecnológico, reconocida por nuestra innovación, calidad 
                    y compromiso con la transformación digital empresarial.
                  </p>
                </div>
              )}
              {activeTab === 'valores' && (
                <div className="emp-tab-panel">
                  <h3>Nuestros Valores</h3>
                  <div className="emp-values-grid">
                    <div className="emp-value-item">
                      <Shield />
                      <span>Seguridad</span>
                    </div>
                    <div className="emp-value-item">
                      <Handshake />
                      <span>Confianza</span>
                    </div>
                    <div className="emp-value-item">
                      <Rocket />
                      <span>Innovación</span>
                    </div>
                    <div className="emp-value-item">
                      <Award />
                      <span>Excelencia</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="emp-specialties-section">
        <div className="emp-inner-container">
          <div className="emp-section-header">
            <h2 className="emp-section-title">Nuestras Especialidades</h2>
            <p className="emp-section-subtitle">
              Dominamos las tecnologías más avanzadas para ofrecerte soluciones integrales
            </p>
          </div>
          
          <div className="emp-specialties-grid">
            <div className="emp-specialty-card">
              <div className="emp-card-icon">
                <Shield />
              </div>
              <h3>Ciberseguridad</h3>
              <p>Protección integral contra amenazas digitales, auditorías de seguridad y protocolos avanzados.</p>
            </div>

            <div className="emp-specialty-card">
              <div className="emp-card-icon">
                <Laptop />
              </div>
              <h3>Desarrollo Web</h3>
              <p>Aplicaciones web modernas, escalables y seguras utilizando las últimas tecnologías.</p>
            </div>

            <div className="emp-specialty-card">
              <div className="emp-card-icon">
                <Cog />
              </div>
              <h3>Automatización</h3>
              <p>Optimizamos procesos empresariales mediante automatización inteligente y AI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="emp-team-section">
        <div className="emp-inner-container">
          <div className="emp-section-header">
            <h2 className="emp-section-title">Nuestro Equipo</h2>
            <p className="emp-section-subtitle">
              Profesionales apasionados por la tecnología y comprometidos con tu éxito
            </p>
          </div>
          
          <div className="emp-team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="emp-team-card">
                <div className="emp-team-avatar">
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="emp-avatar-placeholder">
                      <Settings />
                    </div>
                  )}
                  <div className="emp-avatar-placeholder" style={{ display: "none" }}>
                    <Settings />
                  </div>
                </div>
                <h4>{member.name}</h4>
                <p className="emp-role">{member.role}</p>
                <p className="emp-description">{member.description}</p>
                <div className="emp-skills">
                  {member.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="emp-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Empresa;
