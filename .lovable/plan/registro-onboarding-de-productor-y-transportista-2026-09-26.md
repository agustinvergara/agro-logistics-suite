# Registro (onboarding) de Productor y Transportista

## Qué verá el usuario
- En "Iniciar Sesión" un enlace nuevo: "¿No tienes cuenta? Regístrate".
- Página "/registro" con un asistente de 3 pasos, todo en español:
  1. **Tipo de cuenta**: tarjetas "Soy Productor" / "Soy Transportista".
  2. **Datos**:
     - Comunes: Nombre completo, Correo Electrónico, Teléfono, Contraseña, Confirmar Contraseña, Empresa / Razón social, RUC o cédula.
     - Productor: Nombre de la finca, Provincia, Tipos de cultivo, ¿Cuenta con refrigeración?
     - Transportista: Tipo de vehículo (Camión, Pick-up, Furgón refrigerado), Placa, Capacidad (kg), ¿Vehículo refrigerado?, Número de licencia.
  3. **Revisión y confirmación**: resumen, casilla "Acepto los términos y condiciones", botón "Crear Cuenta".
- Barra de progreso de pasos, validación con mensajes en español, estado "Cargando...".
- Al terminar: toast "Cuenta creada con éxito", sesión iniciada y entrada directa al panel del rol.

## Conexión con el servidor
- POST `http://localhost:8080/api/auth/register` con `{ role, fullName, email, phone, password, companyName, taxId, profile: {...campos del rol} }`.
- Si responde con `token`, `tenantId`, `role`, se guardan como en el login.
- Si el servidor no responde: se crea sesión de prueba y toast "Usando datos de prueba".

## Detalles técnicos
- Nueva ruta `src/routes/registro.tsx` con head() propio.
- Validación con zod por paso (correo válido, contraseña mínimo 8, contraseñas iguales, placa y capacidad obligatorias para transportista).
- Reutiliza `saveSession`, `ROLE_ROUTES` y estilos existentes; enlace añadido en `src/routes/index.tsx`.
