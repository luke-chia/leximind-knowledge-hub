import { useEffect, useState, useRef } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { profilesApi, Profile } from '@/services/profiles'
import { Pencil, Save, Loader2 } from 'lucide-react'

const ProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Helper function to get status description
  const getStatusDescription = (status: string) => {
    const statusMap = {
      A: 'Activo',
      I: 'Inactivo',
      C: 'Cancelado',
      B: 'Bloqueado',
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]

    const day = date.getDate().toString().padStart(2, '0')
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day} de ${month} ${year} ${hours}:${minutes}`
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await profilesApi.getCurrentProfile()
      setProfile(data)
      if (data) {
        setName(data.name || '')
        setNickname(data.nickname || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Error al cargar el perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updated = await profilesApi.updateProfile({
        name: name || null,
        nickname: nickname || null,
      })
      setProfile(updated)
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado exitosamente',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Error al actualizar el perfil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor selecciona un archivo de imagen',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'La imagen debe ser menor a 5MB',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const publicUrl = await profilesApi.uploadProfileImage(file)
      setProfile((prev) => (prev ? { ...prev, img_url: publicUrl } : null))
      toast({
        title: 'Éxito',
        description: 'Foto de perfil actualizada exitosamente',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Error',
        description: 'Error al subir la imagen',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const getInitials = () => {
    if (profile?.name) {
      return profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'A':
        return 'default' // Verde para activo
      case 'I':
        return 'secondary' // Gris para inactivo
      case 'C':
        return 'destructive' // Rojo para cancelado
      case 'B':
        return 'outline' // Amarillo para bloqueado
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-banking-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Perfil Público</h1>
          <p className="text-muted-foreground mt-1">
            Administra la información de tu perfil público
          </p>
        </div>

        <Card className="card-banking">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left side - Form fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    className="bg-banking-surface border-banking-border focus:border-banking-primary w-3/4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu nombre puede aparecer en el sistema donde contribuyes o
                    eres mencionado.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium">
                    Apodo
                  </Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ingresa tu apodo"
                    className="bg-banking-surface border-banking-border focus:border-banking-primary w-3/4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Una versión más corta de tu nombre para uso casual.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol" className="text-sm font-medium">
                    Rol
                  </Label>
                  <Input
                    id="rol"
                    value={profile?.rol || ''}
                    readOnly
                    className="bg-muted border-banking-border text-muted-foreground cursor-not-allowed w-3/4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Estado
                  </Label>
                  <Input
                    id="status"
                    value={
                      profile?.status
                        ? getStatusDescription(profile.status)
                        : ''
                    }
                    readOnly
                    className="bg-muted border-banking-border text-muted-foreground cursor-not-allowed w-3/4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo
                  </Label>
                  <Input
                    id="email"
                    value="micorreo@gmail.com"
                    readOnly
                    className="bg-muted border-banking-border text-muted-foreground cursor-not-allowed w-3/4"
                  />
                </div>
              </div>

              {/* Right side - Profile picture */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-center block">
                  Foto de Perfil
                </Label>
                <div className="relative group">
                  <div className="relative w-48 h-48 mx-auto">
                    <Avatar className="w-full h-full border-4 border-banking-primary/20">
                      <AvatarImage
                        src={profile?.img_url || undefined}
                        alt={profile?.name || 'User'}
                      />
                      <AvatarFallback className="bg-banking-primary text-banking-primary-foreground text-4xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin text-banking-primary" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full shadow-lg border-banking-border hover:bg-banking-surface-hover"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Created:{' '}
                  {profile?.created_at
                    ? formatDate(profile.created_at)
                    : 'No disponible'}
                </p>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-banking-primary"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default ProfilePage
