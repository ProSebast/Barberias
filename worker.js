export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. LOGIN ADMIN (desde admin.html)
      if (url.pathname === "/api/login" && method === "POST") {
        const { correo, password } = await request.json();
        const result = await env.DB.prepare(
          "SELECT * FROM barberos WHERE correo = ? AND password = ?"
        ).bind(correo, password).first();

        if (result) {
          return new Response(JSON.stringify({ success: true, user: { id: result.id, nombre: result.nombre } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          return new Response(JSON.stringify({ success: false, error: "Credenciales inválidas" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      // 2. OBTENER BARBEROS (desde index.html)
      if (url.pathname === "/api/barberos" && method === "GET") {
        const { results } = await env.DB.prepare("SELECT id, nombre FROM barberos").all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 3. OBTENER HORARIOS DISPONIBLES (desde index.html)
      if (url.pathname === "/api/horarios" && method === "GET") {
        const barbero_id = url.searchParams.get("barbero_id");
        const { results } = await env.DB.prepare(
          "SELECT hora FROM horarios WHERE barbero_id = ? AND disponibilidad = 1"
        ).bind(barbero_id).all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 4. CREAR RESERVA (desde index.html)
      if (url.pathname === "/api/reservas" && method === "POST") {
        const { nombre_cliente, telefono, barbero_id, fecha, hora } = await request.json();
        
        // Insertar reserva
        await env.DB.prepare(
          "INSERT INTO reservas (nombre_cliente, telefono, barbero_id, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')"
        ).bind(nombre_cliente, telefono, barbero_id, fecha, hora).run();

        // Actualizar disponibilidad del horario (opcional según tu lógica)
        // await env.DB.prepare("UPDATE horarios SET disponibilidad = 0 WHERE barbero_id = ? AND hora = ?").bind(barbero_id, hora).run();

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 5. OBTENER TODAS LAS RESERVAS (desde admin.html)
      if (url.pathname === "/api/admin/reservas" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id, nombre_cliente, telefono, fecha, hora, estado FROM reservas ORDER BY fecha DESC, hora DESC"
        ).all();
        return new Response(JSON.stringify(results), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response("Not Found", { status: 404 });

    } catch (e) {
      return new Response(e.message, { status: 500 });
    }
  },
};