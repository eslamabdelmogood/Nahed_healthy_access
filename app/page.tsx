"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Upload,
  FileJson,
  DollarSign,
  MapPin,
  Activity,
  AlertCircle,
  Clock,
  Users,
  Settings,
  History,
  CheckCircle2,
  TrendingUp,
  Phone,
  Pill,
  ExternalLink,
  Brain,
  Apple,
  Droplets,
  Leaf,
  HeartPulse,
  CircleX,
  Mic,
  Volume2,
  Globe,
  type File,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { MedicalSpinner } from "@/components/medical-spinner"

type ViewType = "upload" | "diagnostics" | "financial" | "logistics" | "wellness"
type LanguageType = "en" | "ar"

export default function NahedHealthAccessDashboard() {
  const [jsonData, setJsonData] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>("upload")
  const [patientData, setPatientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false)
  const [language, setLanguage] = useState<LanguageType>("en")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUploadToGemini = async (file: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      console.log("[v0] Sending file to Gemini API:", file.name)

      const response = await fetch("/api/analyze-report", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze report")
      }

      const extractedData = await response.json()
      console.log("[v0] Gemini extraction successful:", extractedData)

      setPatientData(extractedData)
      setJsonData(JSON.stringify(extractedData, null, 2))
      setShowResults(true)
      setActiveView("diagnostics")

      toast({
        title: "Analysis Complete",
        description: "Medical report successfully processed and extracted.",
      })

      // Trigger voice welcome message
      handleVoiceWelcome()
    } catch (error) {
      console.error("[v0] Error analyzing report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze medical report",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceWelcome = async () => {
    const welcomeText =
      language === "en"
        ? `Welcome to Nahed Health Access. Your medical report has been successfully analyzed. We have identified your diagnosis and prepared a comprehensive care plan including financial assistance options, treatment recommendations, and logistical support. Let's begin with the diagnostic summary.`
        : `أهلا وسهلا في تطبيق نهضة للوصول الصحي. تم تحليل تقريرك الطبي بنجاح. لقد حددنا التشخيص الخاص بك وأعددنا خطة رعاية شاملة تتضمن خيارات المساعدة المالية والتوصيات العلاجية والدعم اللوجستي. دعنا نبدأ بملخص التشخيص.`

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(welcomeText)
      utterance.lang = language === "en" ? "en-US" : "ar-EG"
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        let selectedVoice = null

        if (language === "en") {
          selectedVoice =
            voices.find((voice) => voice.name.includes("female") && voice.lang.includes("en")) ||
            voices.find((voice) => voice.lang.includes("en-US") && voice.name.includes("Google US English Female")) ||
            voices.find((voice) => voice.lang.includes("en") && !voice.name.includes("male")) ||
            voices.find((voice) => voice.lang.includes("en"))
        } else if (language === "ar") {
          selectedVoice =
            voices.find((voice) => voice.lang.includes("ar")) || voices.find((voice) => voice.lang.includes("ar-EG"))
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      window.speechSynthesis.onvoiceschanged = getVoices
      getVoices()

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceInteraction = async () => {
    console.log("[v0] Voice interaction initiated")

    toast({
      title: "Connecting to Voice Agent...",
      description: `Language: ${language === "en" ? "English" : "Arabic (Egyptian)"}`,
    })

    setIsVoiceSpeaking(true)

    // Get the text to speak based on the current view
    let speechText = ""

    if (activeView === "diagnostics") {
      const pharmaText = patientData?.pharma_access_integration?.drug_details?.generic_name
        ? `Recommended medication: ${patientData.pharma_access_integration.drug_details.generic_name}.`
        : ""
      speechText =
        language === "en"
          ? `The diagnostic summary shows high urgency. Initial assessment complete. Specialist referral pending. ${pharmaText}`
          : `ملخص التشخيص يظهر حالة طارئة عالية. التقييم الأولي مكتمل. الإحالة إلى متخصص معلقة.`
    } else if (activeView === "financial") {
      speechText =
        language === "en"
          ? `FIBO Financial Roadmap. Estimated total cost: $12,450. Funding breakdown: Patient coverage: $4,200. NGO support: $6,000. Grant pending: $2,250. ${
              patientData?.pharma_access_integration?.drug_details?.generic_name
                ? `Recommended medication: ${patientData.pharma_access_integration.drug_details.generic_name}.`
                : ""
            }`
          : `جدول الطريق المالي لـ FIBO. إجمالي التكلفة المقدرة: 12,450 دولار. تفصيل التمويل: تغطية المريض: 4,200 دولار. دعم المنظمات غير الحكومية: 6,000 دولار. منحة معلقة: 2,250 دولار.`
    }

    console.log("[v0] Speaking:", speechText)

    // Use Web Speech API for text-to-speech
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(speechText)
      utterance.lang = language === "en" ? "en-US" : "ar-EG"
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1

      // Get available voices and select a female voice
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        let selectedVoice = null

        // Try to find a professional female voice
        if (language === "en") {
          selectedVoice =
            voices.find((voice) => voice.name.includes("female") && voice.lang.includes("en")) ||
            voices.find((voice) => voice.lang.includes("en-US") && voice.name.includes("Google US English Female")) ||
            voices.find((voice) => voice.lang.includes("en") && !voice.name.includes("male")) ||
            voices.find((voice) => voice.lang.includes("en"))
        } else if (language === "ar") {
          selectedVoice =
            voices.find((voice) => voice.lang.includes("ar")) || voices.find((voice) => voice.lang.includes("ar-EG"))
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      // Voices might not be loaded yet, so add an event listener
      window.speechSynthesis.onvoiceschanged = getVoices
      getVoices()

      // Handle speech end
      utterance.onend = () => {
        setIsVoiceSpeaking(false)
        console.log("[v0] Voice interaction complete")

        toast({
          title: "Playback Complete",
          description: "Voice assistant finished reading.",
        })
      }

      // Handle errors
      utterance.onerror = (event) => {
        console.error("[v0] Speech synthesis error:", event.error)
        setIsVoiceSpeaking(false)

        toast({
          title: "Error",
          description: "Could not play audio. Please try again.",
          variant: "destructive",
        })
      }

      // Speak the text
      window.speechSynthesis.speak(utterance)

      toast({
        title: "AI Voice Navigator",
        description: `Reading: ${activeView === "diagnostics" ? "Diagnostic Summary" : "Financial Roadmap"}`,
      })
    } else {
      // Fallback if Web Speech API is not supported
      setIsVoiceSpeaking(false)
      toast({
        title: "Error",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const supportedTypes = [
        "application/json",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ]

      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a JSON, PDF, or image file (JPEG, PNG, GIF, WebP)",
          variant: "destructive",
        })
        return
      }

      if (file.type === "application/json") {
        // Handle JSON file as before
        const reader = new FileReader()
        reader.onload = (event) => {
          const jsonString = event.target?.result as string
          setJsonData(jsonString)
          try {
            const parsedData = JSON.parse(jsonString)
            setPatientData(parsedData)
            setShowResults(true)
            setActiveView("diagnostics")
          } catch (error) {
            console.error("Error parsing JSON:", error)
            toast({
              title: "Error",
              description: "Invalid JSON format",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      } else {
        handleFileUploadToGemini(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const supportedTypes = [
        "application/json",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ]

      if (!supportedTypes.includes(file.type)) {
        toast({
          title: "Unsupported File Type",
          description: "Please upload a JSON, PDF, or image file (JPEG, PNG, GIF, WebP)",
          variant: "destructive",
        })
        return
      }

      if (file.type === "application/json") {
        const reader = new FileReader()
        reader.onload = (event) => {
          const jsonString = event.target?.result as string
          setJsonData(jsonString)
          try {
            const parsedData = JSON.parse(jsonString)
            setPatientData(parsedData)
            setShowResults(true)
            setActiveView("diagnostics")
          } catch (error) {
            console.error("Error parsing JSON:", error)
          }
        }
        reader.readAsText(file)
      } else {
        handleFileUploadToGemini(file)
      }
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <MedicalSpinner />
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-medical-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg text-foreground">Nahed</h1>
                <p className="text-xs text-muted-foreground">Health Access</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                onClick={() => setActiveView("upload")}
                className={`w-full justify-start gap-3 ${
                  activeView === "upload"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Data</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView("diagnostics")}
                disabled={!showResults}
                className={`w-full justify-start gap-3 ${
                  activeView === "diagnostics"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm">Diagnostics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView("financial")}
                disabled={!showResults}
                className={`w-full justify-start gap-3 ${
                  activeView === "financial"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Financial</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView("logistics")}
                disabled={!showResults}
                className={`w-full justify-start gap-3 ${
                  activeView === "logistics"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Logistics</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveView("wellness")}
                disabled={!showResults}
                className={`w-full justify-start gap-3 ${
                  activeView === "wellness"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <HeartPulse className="w-4 h-4" />
                <span className="text-sm">Wellness & Recovery</span>
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-3 px-3">PATIENT HISTORY</p>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm">Recent Cases</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">All Patients</span>
                </Button>
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative">
          <div className="max-w-7xl mx-auto p-8">
            {activeView === "upload" && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Medical Data Injection</h2>
                <p className="text-muted-foreground mb-6">
                  Upload patient medical data as JSON, PDF, or medical images for comprehensive analysis and planning
                </p>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    isDragging
                      ? "border-medical-primary bg-medical-primary/5"
                      : "border-border hover:border-medical-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <FileJson className="w-8 h-8 text-medical-primary" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium mb-1">Drop your file here or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        Supported: JSON files, PDF reports, or medical images (JPEG, PNG, GIF, WebP)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/pdf,image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      onClick={handleSelectFile}
                      className="bg-medical-primary text-white hover:bg-medical-primary/90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showResults && (
              <>
                {/* Diagnostic Summary Card */}
                {activeView === "diagnostics" && (
                  <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-foreground">Diagnostic Summary</h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVoiceInteraction}
                        disabled={isVoiceSpeaking}
                        className="bg-medical-success/5 hover:bg-medical-success/10 border-medical-success/20 text-medical-success"
                      >
                        {isVoiceSpeaking ? (
                          <>
                            <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                            Speaking...
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Read Aloud
                          </>
                        )}
                      </Button>
                    </div>
                    <Card className="p-6 border-medical-alert bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-medical-alert/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-medical-alert" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Diagnostic Summary</h3>
                            <p className="text-xs text-muted-foreground">Medical Status</p>
                          </div>
                        </div>
                        <AlertCircle className="w-5 h-5 text-medical-alert" />
                      </div>

                      <div className="space-y-4">
                        {/* Urgency Meter */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Urgency Level</span>
                            <span className="text-sm font-semibold text-medical-alert">High</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-4/5 bg-medical-alert rounded-full" />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">CLINICAL STEPS</p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-medical-success mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-foreground font-medium">Initial Assessment</p>
                                <p className="text-xs text-muted-foreground">Complete diagnostic review</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 text-medical-alert mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-foreground font-medium">Specialist Referral</p>
                                <p className="text-xs text-muted-foreground">Pending cardiologist consultation</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground font-medium">Treatment Protocol</p>
                                <p className="text-xs text-muted-foreground">Awaiting assessment results</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Financial Roadmap Card */}
                {activeView === "financial" && (
                  <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold text-foreground">FIBO Financial Roadmap</h2>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleVoiceInteraction}
                        disabled={isVoiceSpeaking}
                        className="bg-medical-financial/5 hover:bg-medical-financial/10 border-medical-financial/20 text-medical-financial"
                      >
                        {isVoiceSpeaking ? (
                          <>
                            <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                            Speaking...
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Read Aloud
                          </>
                        )}
                      </Button>
                    </div>
                    <Card className="p-6 border-medical-financial bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-medical-financial/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-medical-financial" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">FIBO Financial Roadmap</h3>
                            <p className="text-xs text-muted-foreground">Cost Planning</p>
                          </div>
                        </div>
                        <TrendingUp className="w-5 h-5 text-medical-financial" />
                      </div>

                      <div className="space-y-4">
                        {/* Cost Estimate */}
                        <div className="bg-medical-financial/5 rounded-lg p-4">
                          <p className="text-xs text-muted-foreground mb-1">Estimated Total Cost</p>
                          <p className="text-3xl font-bold text-medical-financial">$12,450</p>
                        </div>

                        {/* Pharma Integration Section */}
                        {patientData?.pharma_access_integration?.drug_details && (
                          <div className="bg-gradient-to-r from-medical-success/10 to-medical-financial/10 rounded-lg p-4 border border-medical-success/20">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-medical-success" />
                                <p className="text-xs font-semibold text-medical-success">RECOMMENDED MEDICATION</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-sm font-semibold text-foreground mb-1">
                                {patientData.pharma_access_integration.drug_details.generic_name}
                              </p>
                              {patientData.pharma_access_integration.drug_details.brands && (
                                <p className="text-xs text-muted-foreground">
                                  Brand options: {patientData.pharma_access_integration.drug_details.brands.join(", ")}
                                </p>
                              )}
                              {patientData.pharma_access_integration.drug_details.treatment_duration_months && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Treatment duration:{" "}
                                  {patientData.pharma_access_integration.drug_details.treatment_duration_months} months
                                </p>
                              )}
                            </div>
                            {patientData.pharma_access_integration.patient_access_program && (
                              <div className="mb-3 p-2 bg-medical-success/5 rounded border border-medical-success/10">
                                <p className="text-xs font-medium text-foreground mb-1">Patient Access Program</p>
                                <p className="text-xs text-muted-foreground">
                                  {patientData.pharma_access_integration.patient_access_program.provider}
                                </p>
                                {patientData.pharma_access_integration.patient_access_program.subsidy_percentage && (
                                  <p className="text-xs text-medical-success font-semibold mt-1">
                                    Up to{" "}
                                    {patientData.pharma_access_integration.patient_access_program.subsidy_percentage}{" "}
                                    subsidy available
                                  </p>
                                )}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-medical-success/5 hover:bg-medical-success/10 border-medical-success/20 text-medical-success"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Check Eligibility for Patient Access Program
                            </Button>
                          </div>
                        )}

                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">FUNDING SOURCES</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-medical-financial" />
                                <span className="text-sm text-foreground">Patient Coverage</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">$4,200</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-medical-financial/60" />
                                <span className="text-sm text-foreground">NGO Support</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">$6,000</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-medical-financial/30" />
                                <span className="text-sm text-foreground">Grant Pending</span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">$2,250</span>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-medical-financial text-white hover:bg-medical-financial/90">
                          View Full Breakdown
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Logistical Execution Card */}
                {activeView === "logistics" && (
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">Logistical Execution</h2>
                    <Card className="p-6 border-medical-logistics bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-medical-logistics/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-medical-logistics" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Logistical Execution</h3>
                            <p className="text-xs text-muted-foreground">Travel & Coordination</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Travel Notes */}
                        <div className="bg-medical-logistics/5 rounded-lg p-4">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">TRAVEL NOTES</p>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3 h-3 text-medical-logistics mt-1 flex-shrink-0" />
                              <p className="text-sm text-foreground">Regional Medical Center - 45 km</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Clock className="w-3 h-3 text-medical-logistics mt-1 flex-shrink-0" />
                              <p className="text-sm text-foreground">Appointment: March 24, 2:00 PM</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="text-xs font-semibold text-muted-foreground mb-3">NGO CONTACTS</p>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="w-8 h-8 rounded-full bg-medical-logistics/20 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-medical-logistics" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Health Partners Int.</p>
                                <p className="text-xs text-muted-foreground truncate">Transportation coordinator</p>
                              </div>
                              <Button size="sm" variant="ghost" className="flex-shrink-0">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="w-8 h-8 rounded-full bg-medical-logistics/20 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-medical-logistics" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">Access Foundation</p>
                                <p className="text-xs text-muted-foreground truncate">Medical support liaison</p>
                              </div>
                              <Button size="sm" variant="ghost" className="flex-shrink-0">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <Button className="w-full bg-medical-logistics text-white hover:bg-medical-logistics/90">
                          View Route Details
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Wellness & Recovery Card */}
                {activeView === "wellness" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {/* Nutrition Plan Card */}
                    {patientData?.holistic_care_protocol?.nutrition_plan && (
                      <Card className="border-emerald-200 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <Apple className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-emerald-900">Nutrition Plan</h3>
                              <p className="text-xs text-emerald-700">
                                {patientData.holistic_care_protocol.nutrition_plan.focus}
                              </p>
                            </div>
                          </div>
                          <Leaf className="w-5 h-5 text-emerald-500" />
                        </div>

                        <div className="space-y-4">
                          {/* Recommended Foods */}
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3" />
                              RECOMMENDED FOODS
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {patientData.holistic_care_protocol.nutrition_plan.recommended_foods?.map(
                                (food: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-1.5 border border-emerald-200"
                                  >
                                    <Leaf className="w-3 h-3" />
                                    {food}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Foods to Avoid */}
                          <div>
                            <p className="text-xs font-semibold text-rose-700 mb-3 flex items-center gap-2">
                              <CircleX className="w-3 h-3" />
                              FOODS TO AVOID
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {patientData.holistic_care_protocol.nutrition_plan.avoid?.map(
                                (food: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm font-medium flex items-center gap-1.5 border border-rose-200"
                                  >
                                    <CircleX className="w-3 h-3" />
                                    {food}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Hydration Goal */}
                          {patientData.holistic_care_protocol.nutrition_plan.hydration_goal && (
                            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Droplets className="w-5 h-5 text-cyan-600" />
                                  <p className="text-sm text-cyan-900 font-medium">Daily Hydration Goal</p>
                                </div>
                                <p className="text-lg font-bold text-cyan-700">
                                  {patientData.holistic_care_protocol.nutrition_plan.hydration_goal}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Psychological Support Card */}
                    {patientData?.holistic_care_protocol?.psychological_support && (
                      <Card className="border-teal-200 shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                              <Brain className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-teal-900">Psychological Support</h3>
                              <p className="text-xs text-teal-700">
                                {patientData.holistic_care_protocol.psychological_support.status}
                              </p>
                            </div>
                          </div>
                          <HeartPulse className="w-5 h-5 text-teal-500" />
                        </div>

                        <div className="space-y-4">
                          {/* Recommended Intervention */}
                          <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                            <p className="text-xs font-semibold text-teal-700 mb-2">RECOMMENDED INTERVENTION</p>
                            <p className="text-sm text-teal-900 font-medium">
                              {patientData.holistic_care_protocol.psychological_support.recommended_intervention}
                            </p>
                          </div>

                          {/* Local Resource */}
                          <div className="flex items-start gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                            <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-teal-700 mb-1 font-semibold">LOCAL COUNSELING RESOURCE</p>
                              <p className="text-sm text-teal-900 font-medium">
                                {patientData.holistic_care_protocol.psychological_support.local_resource}
                              </p>
                            </div>
                          </div>

                          <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
                            <Phone className="w-4 h-4 mr-2" />
                            Schedule Support Session
                          </Button>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {showResults && (
            <div className="fixed bottom-8 right-8 flex flex-col gap-4 items-end z-50">
              {/* Language Toggle */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg"
                >
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      language === "en"
                        ? "bg-medical-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage("ar")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      language === "ar"
                        ? "bg-medical-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    AR
                  </button>
                </motion.div>
              </AnimatePresence>

              {/* Voice FAB */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={handleVoiceInteraction}
                  disabled={isVoiceSpeaking}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-medical-success to-medical-primary text-white shadow-xl hover:shadow-2xl transition-all relative"
                >
                  {isVoiceSpeaking ? (
                    <div className="flex flex-col items-center justify-center">
                      <Volume2 className="w-6 h-6 animate-pulse" />
                      {/* Waveform Animation */}
                      <div className="flex gap-1 mt-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-white rounded-full"
                            animate={{
                              height: ["4px", "12px", "4px"],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}

                  {/* Pulse Ring */}
                  {isVoiceSpeaking && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-medical-success"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </>
  )
}
