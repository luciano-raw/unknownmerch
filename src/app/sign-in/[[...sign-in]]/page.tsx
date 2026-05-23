import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Minimalist branding above the form */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">
            UNKNOWN CLUB
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1 lowercase">
            identity & minimalist aesthetics
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-primary hover:bg-primary/90 text-primary-foreground text-xs uppercase rounded-lg transition-all font-bold tracking-widest h-10",
              card: 
                "bg-card border border-border shadow-xl rounded-2xl p-6",
              headerTitle: 
                "text-foreground font-bold tracking-tight text-xl text-center",
              headerSubtitle: 
                "text-muted-foreground text-xs text-center",
              socialButtonsBlockButton: 
                "border border-input hover:bg-secondary/40 text-foreground transition-all rounded-lg h-10",
              formFieldLabel: 
                "text-foreground text-xs font-bold uppercase tracking-wider",
              formFieldInput: 
                "bg-secondary/10 border-input text-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg h-10 px-3",
              footerActionLink: 
                "text-primary hover:underline font-bold"
            }
          }}
        />
      </div>
    </div>
  )
}
