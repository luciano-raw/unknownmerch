import { getStoreSettings } from "@/actions/settings"
import { SettingsForm } from "./settings-form"

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2 text-primary">Configuración Global</h1>
        <p className="text-muted-foreground mb-8">Administra el comportamiento de toda tu tienda, banners y recepciones de WhatsApp.</p>
        
        <SettingsForm initialData={settings} />
      </main>
    </div>
  )
}
