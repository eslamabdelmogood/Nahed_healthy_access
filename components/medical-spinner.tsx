import { Heart } from "lucide-react"

export function MedicalSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-medical-primary/20" />

        {/* Rotating pulse ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-medical-primary border-r-medical-primary animate-spin" />

        {/* Center heart icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-6 h-6 text-medical-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-foreground font-medium">Analyzing Medical Report</p>
        <p className="text-sm text-muted-foreground">Processing with Gemini AI...</p>
      </div>
    </div>
  )
}
