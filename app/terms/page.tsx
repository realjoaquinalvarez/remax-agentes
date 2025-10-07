export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Términos de Servicio</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar este dashboard de RE/MAX, aceptas estar sujeto a
              estos Términos de Servicio y todas las leyes y regulaciones aplicables.
              Si no estás de acuerdo con alguno de estos términos, no utilices este
              servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descripción del Servicio</h2>
            <p>
              Este dashboard proporciona herramientas para agentes de RE/MAX para:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Gestionar métricas de redes sociales</li>
              <li>Visualizar datos de rendimiento</li>
              <li>Conectar cuentas de Facebook para análisis</li>
              <li>Acceder a reportes y estadísticas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Registro y Cuentas</h2>
            <p>
              Para utilizar ciertas funciones del servicio, debes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
              <li>Notificar inmediatamente sobre cualquier uso no autorizado</li>
              <li>Ser responsable de todas las actividades en tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Uso Aceptable</h2>
            <p>
              Te comprometes a:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Usar el servicio solo para propósitos legales</li>
              <li>No intentar acceder a áreas no autorizadas del sistema</li>
              <li>No interferir con el funcionamiento del servicio</li>
              <li>No compartir credenciales de acceso con terceros</li>
              <li>Cumplir con las políticas de Facebook al conectar páginas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Integración con Facebook</h2>
            <p>
              Al conectar tu cuenta de Facebook:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Aceptas los Términos de Servicio de Facebook</li>
              <li>Autorizas el acceso a tus páginas de Facebook</li>
              <li>Comprendes que revocamos el acceso en cualquier momento</li>
              <li>Eres responsable del contenido de tus páginas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, diseño, gráficos, y código del servicio son propiedad
              de RE/MAX o sus licenciantes y están protegidos por leyes de propiedad
              intelectual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitación de Responsabilidad</h2>
            <p>
              El servicio se proporciona &quot;tal cual&quot; sin garantías de ningún tipo. No
              nos hacemos responsables de:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Pérdida de datos o información</li>
              <li>Interrupciones del servicio</li>
              <li>Daños indirectos o consecuentes</li>
              <li>Problemas derivados de servicios de terceros (Facebook, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modificaciones del Servicio</h2>
            <p>
              Nos reservamos el derecho de modificar, suspender o discontinuar el
              servicio en cualquier momento, con o sin previo aviso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Terminación</h2>
            <p>
              Podemos suspender o terminar tu acceso al servicio si violas estos
              términos o por cualquier otra razón a nuestra discreción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cambios a los Términos</h2>
            <p>
              Podemos actualizar estos términos ocasionalmente. El uso continuado del
              servicio después de cambios constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Ley Aplicable</h2>
            <p>
              Estos términos se rigen por las leyes aplicables en tu jurisdicción.
              Cualquier disputa se resolverá en los tribunales competentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contáctanos a través de nuestros
              canales oficiales de soporte.
            </p>
          </section>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          <p>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  )
}
