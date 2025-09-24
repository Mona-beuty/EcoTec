import React, { useEffect, useState } from "react";
import "../style/EstadoAdminReparacion.css";

const EstadoAdminReparacion = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProblemas, setExpandedProblemas] = useState({});
  // Alternar expansión de problema
  const toggleExpandProblema = (id) => {
    setExpandedProblemas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Obtener reparaciones al cargar
  useEffect(() => {
    fetchReparaciones();
  }, []);

  const fetchReparaciones = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reparaciones");
      const data = await res.json();
      setReparaciones(data);
    } catch (error) {
      console.error("Error cargando reparaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de reparación
  const actualizarEstado = async (id, nuevoEstado) => {
    // Actualización optimista en la UI
    setReparaciones((prev) =>
      prev.map((rep) =>
        rep.id_reparacion === id ? { ...rep, estado: nuevoEstado } : rep
      )
    );
    try {
      await fetch(`http://localhost:5000/api/reparaciones/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      // Si quieres refrescar desde el backend, puedes descomentar:
      // fetchReparaciones();
    } catch (error) {
      console.error("Error actualizando estado:", error);
      // Si falla, revertir el cambio en la UI
      setReparaciones((prev) =>
        prev.map((rep) =>
          rep.id_reparacion === id ? { ...rep, estado: rep.estado } : rep
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <p>Cargando reparaciones...</p>
        </div>
      </div>
    );
  }

return (
  <div className="Dashboard-wrapper">
    <div className="admin-container">
      <h1 className="admin-title">Estado de Reparaciones</h1>

      {reparaciones.length === 0 ? (
        <div className="no-data">
          <p>No hay solicitudes de reparación.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Nombre</th>
              <th>Dispositivo</th>
              <th>Problema</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reparaciones.map((rep) => (
              <tr key={rep.id_reparacion}>
                <td>#{rep.ticket}</td>
                <td>{rep.nombre}</td>
                <td>{rep.dispositivo}</td>
                <td style={{ maxWidth: 220, whiteSpace: 'pre-line' }}>
                  <span
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: expandedProblemas[rep.id_reparacion] ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: expandedProblemas[rep.id_reparacion] ? 'visible' : 'hidden',
                      textOverflow: 'ellipsis',
                      wordBreak: 'break-word',
                    }}
                  >
                    {rep.problema}
                  </span>
                  {rep.problema && rep.problema.split('\n').join(' ').length > 80 && !expandedProblemas[rep.id_reparacion] && (
                    <>
                      {' '}
                      <button
                        style={{ color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.95em' }}
                        onClick={() => toggleExpandProblema(rep.id_reparacion)}
                      >
                        Ver más
                      </button>
                    </>
                  )}
                  {expandedProblemas[rep.id_reparacion] && (
                    <>
                      {' '}
                      <button
                        style={{ color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.95em' }}
                        onClick={() => toggleExpandProblema(rep.id_reparacion)}
                      >
                        Ver menos
                      </button>
                    </>
                  )}
                </td>
                <td>
                  <span
                    className={`estado-badge ${
                      rep.estado === "pendiente"
                        ? "estado-pendiente"
                        : rep.estado === "en_proceso"
                        ? "estado-proceso"
                        : "estado-finalizado"
                    }`}
                  >
                    {rep.estado.replace("_", " ")}
                  </span>
                </td>
                <td>
                  <select
                    value={rep.estado}
                    onChange={(e) =>
                      actualizarEstado(rep.id_reparacion, e.target.value)
                    }
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
};

export default EstadoAdminReparacion;