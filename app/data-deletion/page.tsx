"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Trash2, CheckCircle2 } from "lucide-react"

export default function DataDeletionPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleDeleteRequest = () => {
    // TODO: Implement actual deletion request logic
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Solicitud de Eliminación de Datos</h1>

        {!submitted ? (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Información Importante</AlertTitle>
              <AlertDescription>
                Al solicitar la eliminación de tus datos, se eliminarán permanentemente
                toda tu información personal y datos asociados a tu cuenta.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>¿Qué datos se eliminarán?</CardTitle>
                <CardDescription>
                  La eliminación incluye los siguientes datos:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Información de perfil (nombre, email, ID de usuario)</li>
                  <li>Tokens de acceso a Facebook/redes sociales</li>
                  <li>Datos de páginas conectadas</li>
                  <li>Métricas e insights almacenados</li>
                  <li>Historial de actividad en la plataforma</li>
                  <li>Cualquier otra información personal asociada a tu cuenta</li>
                </ul>

                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Esta acción es irreversible</li>
                      <li>El proceso puede tomar hasta 30 días</li>
                      <li>Recibirás una confirmación por email cuando se complete</li>
                      <li>Deberás revocar permisos manualmente en Facebook si deseas desconectar la integración</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proceso de Eliminación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Solicita la eliminación</h3>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el botón de abajo para enviar tu solicitud
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Verificación</h3>
                      <p className="text-sm text-muted-foreground">
                        Recibirás un email de confirmación en tu correo registrado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Procesamiento</h3>
                      <p className="text-sm text-muted-foreground">
                        Procesaremos tu solicitud en un plazo de 30 días
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      4
                    </div>
                    <div>
                      <h3 className="font-medium">Confirmación final</h3>
                      <p className="text-sm text-muted-foreground">
                        Te notificaremos cuando se complete la eliminación
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Peligro</CardTitle>
                <CardDescription>
                  Una vez confirmada, esta acción no se puede deshacer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleDeleteRequest}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Solicitar Eliminación de Datos
                </Button>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground">
              <p>
                Si tienes preguntas sobre este proceso, consulta nuestra{" "}
                <a href="/privacy" className="underline hover:text-foreground">
                  Política de Privacidad
                </a>{" "}
                o contáctanos a través de nuestros canales de soporte.
              </p>
            </div>
          </div>
        ) : (
          <Card className="border-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-green-500">Solicitud Recibida</CardTitle>
                  <CardDescription>
                    Tu solicitud de eliminación de datos ha sido registrada
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Hemos recibido tu solicitud de eliminación de datos. Te enviaremos un
                email de confirmación a tu correo registrado con los siguientes pasos.
              </p>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Próximos pasos</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Revisa tu correo electrónico (incluye spam/promociones)</li>
                    <li>Confirma tu solicitud haciendo clic en el enlace del email</li>
                    <li>Espera hasta 30 días para el procesamiento completo</li>
                    <li>Recibirás una notificación final cuando se complete</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="pt-4">
                <Button variant="outline" asChild>
                  <Link href="/">Volver al Inicio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
