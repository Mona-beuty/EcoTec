import db from '../config/db.js';

// Obtener ventas por periodo (día, semana, mes, año)
export const getVentasPorPeriodo = async (req, res) => {
  const { periodo } = req.query;
  let query = '';

  try {
    switch (periodo) {
      case 'dia':
        query = `
          SELECT 
            HOUR(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            DATE(fecha_pedido) = CURDATE()
            AND estado = 'pagado'
          GROUP BY HOUR(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'semana':
        query = `
          SELECT 
            DATE(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            AND estado = 'pagado'
          GROUP BY DATE(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'mes':
        query = `
          SELECT 
            DATE(fecha_pedido) as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
            AND estado = 'pagado'
          GROUP BY DATE(fecha_pedido)
          ORDER BY periodo;
        `;
        break;

      case 'año':
        query = `
          SELECT 
            DATE_FORMAT(fecha_pedido, '%Y-%m') as periodo,
            SUM(total) as ventas,
            SUM(
              (SELECT SUM(cantidad) 
               FROM detalle_pedidos 
               WHERE id_pedido = pedidos.id_pedido)
            ) as cantidad
          FROM pedidos
          WHERE 
            fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
            AND estado = 'pagado'
          GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
          ORDER BY periodo;
        `;
        break;

      default:
        return res.status(400).json({ message: 'Periodo no válido' });
    }

    const [results] = await db.promise().query(query);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener las ventas' });
  }
};

// Obtener resumen de ventas (totales y promedios)
export const getResumenVentas = async (req, res) => {
  const { periodo } = req.query;
  let dateCondition = '';

  try {
    switch (periodo) {
      case 'dia':
        dateCondition = 'DATE(fecha_pedido) = CURDATE()';
        break;
      case 'semana':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
        break;
      case 'mes':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)';
        break;
      case 'año':
        dateCondition = 'fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)';
        break;
      default:
        return res.status(400).json({ message: 'Periodo no válido' });
    }

    const query = `
      SELECT 
        SUM(total) as totalVentas,
        SUM(
          (SELECT SUM(cantidad) 
           FROM detalle_pedidos 
           WHERE id_pedido = pedidos.id_pedido)
        ) as totalUnidades,
        COUNT(DISTINCT DATE(fecha_pedido)) as numeroPeriodos
      FROM pedidos
      WHERE ${dateCondition} AND estado = 'pagado';
    `;

    const [results] = await db.promise().query(query);
    res.json(results[0]);
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({ message: 'Error al obtener el resumen de ventas' });
  }
};
