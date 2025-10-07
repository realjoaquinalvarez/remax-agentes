export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Información que Recopilamos</h2>
            <p>
              Recopilamos información básica de perfil cuando te conectas con Facebook,
              incluyendo tu nombre e ID de usuario. También accedemos a datos de tus
              páginas de Facebook que administras para mostrarte métricas y estadísticas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Cómo Usamos tu Información</h2>
            <p>
              Utilizamos tu información para:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Proporcionar acceso al dashboard y sus funcionalidades</li>
              <li>Mostrar métricas y análisis de tus páginas de Facebook</li>
              <li>Mejorar nuestros servicios y experiencia de usuario</li>
              <li>Comunicarnos contigo sobre actualizaciones del servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Compartir Información</h2>
            <p>
              No compartimos, vendemos ni divulgamos tu información personal a terceros,
              excepto cuando sea necesario para proporcionar el servicio o cuando lo
              requiera la ley.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Seguridad de Datos</h2>
            <p>
              Implementamos medidas de seguridad para proteger tu información contra
              acceso no autorizado, alteración o destrucción. Los tokens de acceso se
              almacenan de forma segura y encriptada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Tus Derechos</h2>
            <p>
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Revocar permisos de acceso a Facebook en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mantener tu sesión activa
              y mejorar tu experiencia en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te
              notificaremos sobre cambios significativos publicando la nueva política
              en esta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política de privacidad, contáctanos a
              través de nuestros canales oficiales de soporte.
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
