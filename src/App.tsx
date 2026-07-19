import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  RefreshCw,
  Terminal,
  BookOpen,
  HelpCircle,
  Send,
  Code,
  Sliders,
  Volume2,
  Music,
  CheckCircle,
  Layers,
  Activity,
  ArrowRight,
  Presentation,
  FileText,
  ChevronLeft,
  ChevronRight,
  Copy,
  Info,
  ExternalLink,
  Sparkles,
  Award
} from "lucide-react";
import { pythonCodebase } from "./pythonCode";
import { createMidiFile, downloadMidi, MidiNote } from "./utils/midiEncoder";
import { qaData, presentationSlides, advantagesList, limitationsList, futureScopeList } from "./projectData";

// Musical configurations
const NOTE_FREQS: { [key: string]: number } = {
  "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77
};

const NOTE_MIDI: { [key: string]: number } = {
  "G3": 55, "G#3": 56, "A3": 57, "A#3": 58, "B3": 59,
  "C4": 60, "C#4": 61, "D4": 62, "D#4": 63, "E4": 64, "F4": 65, "F#4": 66, "G4": 67, "G#4": 68, "A4": 69, "A#4": 70, "B4": 71,
  "C5": 72, "C#5": 73, "D5": 74, "D#5": 75, "E5": 76, "F5": 77, "F#5": 78, "G5": 79, "G#5": 80, "A5": 81, "A#5": 82, "B5": 83
};

// Available styled patterns for music simulation
const STYLE_MELODIES: { [key: string]: { notes: string[], seed: string[] } } = {
  classical: {
    seed: ["C4", "D4", "E4", "F4", "G4", "E4", "C4", "G3", "C4", "D4", "E4", "C4", "D4", "G4", "E4", "C4"],
    notes: ["C4", "E4", "G4", "C5", "B4", "G4", "F4", "D4", "C4", "E4", "D4", "G4", "C5", "A4", "F4", "D4", "C4", "G3", "C4", "E4", "G4", "E4", "F4", "D4", "C4", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]
  },
  folk: {
    seed: ["G4", "G4", "A4", "G4", "C5", "B4", "G4", "G4", "A4", "G4", "D5", "C5", "G4", "G4", "G5", "E5"],
    notes: ["C4", "D4", "E4", "C4", "E4", "F4", "G4", "E4", "G4", "A4", "G4", "F4", "E4", "C4", "D4", "G3", "C4", "C4", "D4", "E4", "C4", "G4", "G4", "A4", "G4", "C5", "C4", "E4", "G4", "C5"]
  },
  cinematic: {
    seed: ["A3", "C4", "E4", "D4", "F4", "E4", "B3", "A3", "A3", "C4", "E4", "D4", "E4", "C4", "B3", "A3"],
    notes: ["A3", "C4", "E4", "D4", "F4", "E4", "C4", "B3", "A3", "D4", "F4", "A4", "G4", "F4", "E4", "C4", "B3", "E4", "A3", "C4", "B3", "E4", "A3", "C4", "E4", "A4", "G#4", "E4", "B3", "A3"]
  },
  jazz: {
    seed: ["C4", "E4", "G4", "B4", "A4", "F4", "D4", "B3", "C4", "E4", "G4", "B4", "D5", "C5", "A4", "G4"],
    notes: ["C4", "E4", "G4", "B4", "D5", "C5", "A4", "G4", "F4", "A4", "C5", "E5", "D5", "B4", "G4", "E4", "D4", "F#4", "A4", "C5", "B4", "G4", "E4", "C4", "D4", "F4", "A4", "C5", "B4", "G4"]
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "code" | "workflow" | "presentation" | "quiz" | "tutor">("generator");

  // Codebase tab states
  const [selectedFileIndex, setSelectedFileIndex] = useState(1); // Default to midi_generator.py
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generator states
  const [selectedStyle, setSelectedStyle] = useState<"classical" | "folk" | "cinematic" | "jazz">("classical");
  const [temperature, setTemperature] = useState<number>(0.8);
  const [melodyLength, setMelodyLength] = useState<number>(32);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(120); // BPM
  const [synthType, setSynthType] = useState<OscillatorType>("triangle");
  const [generatedSequence, setGeneratedSequence] = useState<string[]>(STYLE_MELODIES.classical.seed);
  const [currentPlayIndex, setCurrentPlayIndex] = useState<number>(-1);
  const [generationSteps, setGenerationSteps] = useState<{ step: number; input: string[]; predicted: string; probabilities: number[] }[]>([]);

  // Simulation of model training
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainingMetrics, setTrainingMetrics] = useState<{ epoch: number; loss: number; acc: number }[]>([]);
  const [trainingParameters, setTrainingParameters] = useState({
    epochs: 30,
    batchSize: 16,
    learningRate: 0.001,
    lstmUnits: 128,
    seqLength: 16
  });

  // Presentation slides state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showPresenterNotes, setShowPresenterNotes] = useState(true);

  // Quiz state
  const [quizSearch, setQuizSearch] = useState("");
  const [quizFilter, setQuizFilter] = useState<"all" | "viva" | "interview">("all");
  const [expandedQuizIndex, setExpandedQuizIndex] = useState<number | null>(null);
  const [preparedQuestions, setPreparedQuestions] = useState<number[]>([]);

  // AI Tutor chat state
  const [tutorMessages, setTutorMessages] = useState<{ role: "user" | "model"; content: string }[]>([
    {
      role: "model",
      content: "Hello! I am your AI Music Internship Project Supervisor. Ask me any questions about music21, LSTM, training cycles, MIDI file encoding, or how to run your Python project locally!"
    }
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Web Audio Synth references
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<any>(null);

  // Initialize or get Web Audio Context
  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Sound generator
  const triggerSynth = (frequency: number, startTime: number, duration: number) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = synthType;
    osc.frequency.setValueAtTime(frequency, startTime);

    // ADSR Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.1); // Decay
    gain.gain.setValueAtTime(0.18, startTime + duration - 0.05); // Sustain
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // Release

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // Playback engine
  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentPlayIndex(-1);
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
  };

  const startPlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (generatedSequence.length === 0) return;

    setIsPlaying(true);
    getAudioContext(); // Ensure initialized

    let currentIdx = 0;
    const beatDurationMs = (60 / playbackSpeed) * 1000 * 0.5; // Eighth notes playback

    const playStep = () => {
      if (currentIdx >= generatedSequence.length) {
        stopPlayback();
        return;
      }

      setCurrentPlayIndex(currentIdx);
      const noteStr = generatedSequence[currentIdx];

      // Play note or chord
      if (noteStr.includes(".")) {
        // Chord
        const pitches = noteStr.split(".");
        pitches.forEach((p) => {
          const freq = NOTE_FREQS[p] || NOTE_FREQS[p.toUpperCase()];
          if (freq) {
            triggerSynth(freq, audioContextRef.current!.currentTime, beatDurationMs / 1000);
          }
        });
      } else {
        // Single note
        const freq = NOTE_FREQS[noteStr] || NOTE_FREQS[noteStr.toUpperCase()];
        if (freq) {
          triggerSynth(freq, audioContextRef.current!.currentTime, beatDurationMs / 1000);
        }
      }

      currentIdx++;
    };

    playStep(); // Play first immediately
    synthTimerRef.current = setInterval(playStep, beatDurationMs);
  };

  // Run simulation of model training
  const startTrainingSimulation = () => {
    if (isTraining) {
      setIsTraining(false);
      return;
    }

    setIsTraining(true);
    setTrainingEpoch(0);
    setTrainingMetrics([]);

    let currentEpoch = 0;
    const totalEpochs = trainingParameters.epochs;
    let currentLoss = 3.8;
    let currentAcc = 0.08;

    const interval = setInterval(() => {
      currentEpoch++;
      
      // Mimic deep learning model optimization trends
      const lrModifier = trainingParameters.learningRate * 100;
      const unitFactor = Math.log(trainingParameters.lstmUnits) / 5;
      
      currentLoss -= (currentLoss * 0.08 * unitFactor) + (Math.random() * 0.05);
      currentAcc += ((1 - currentAcc) * 0.06 * lrModifier * unitFactor) + (Math.random() * 0.02);
      
      if (currentLoss < 0.1) currentLoss = 0.1;
      if (currentAcc > 0.98) currentAcc = 0.98;

      setTrainingEpoch(currentEpoch);
      setTrainingMetrics(prev => [
        ...prev,
        { epoch: currentEpoch, loss: parseFloat(currentLoss.toFixed(4)), acc: parseFloat(currentAcc.toFixed(4)) }
      ]);

      if (currentEpoch >= totalEpochs) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 250); // Speed up training visualization
  };

  // Simulate LSTM Melody Generation based on the chosen style
  const runLSTMGeneration = () => {
    setIsGenerating(true);
    stopPlayback();

    const styleData = STYLE_MELODIES[selectedStyle];
    const sequence = [...styleData.seed];
    const vocabulary = styleData.notes;
    const steps: typeof generationSteps = [];

    let stepsCount = 0;

    const interval = setInterval(() => {
      if (stepsCount >= melodyLength - 16) {
        clearInterval(interval);
        setGeneratedSequence(sequence);
        setGenerationSteps(steps);
        setIsGenerating(false);
        return;
      }

      const inputHistory = sequence.slice(stepsCount, stepsCount + 16);
      
      // Simulating temperature sampling logic
      // Lower temperature -> Pick notes close to scale structure
      // Higher temperature -> Pick random notes from vocabulary
      let nextNote = "";
      const baseNoteOptions = [...STYLE_MELODIES[selectedStyle].notes];
      
      // Calculate dummy probability distribution
      const rawWeights = baseNoteOptions.map((n, i) => {
        // High probability for notes that complete a logical chord progression
        if (i % 3 === 0) return 0.5;
        if (i % 2 === 0) return 0.3;
        return 0.1;
      });

      // Scale probabilities by temperature
      const temperatureAdjusted = rawWeights.map(w => Math.exp(Math.log(w) / temperature));
      const sum = temperatureAdjusted.reduce((a, b) => a + b, 0);
      const probabilities = temperatureAdjusted.map(w => w / sum);

      // Roll multinomial
      let r = Math.random();
      let accProb = 0;
      let chosenIndex = 0;
      for (let i = 0; i < probabilities.length; i++) {
        accProb += probabilities[i];
        if (r <= accProb) {
          chosenIndex = i;
          break;
        }
      }

      nextNote = baseNoteOptions[chosenIndex];
      sequence.push(nextNote);

      steps.push({
        step: stepsCount + 1,
        input: inputHistory,
        predicted: nextNote,
        probabilities: probabilities.slice(0, 8) // Represent top 8 probabilities
      });

      setGeneratedSequence([...sequence]);
      setGenerationSteps([...steps]);
      stepsCount++;
    }, 100);
  };

  // Export & Download generated sequence as MIDI via local midiEncoder
  const triggerMidiDownload = () => {
    const notesToEncode: MidiNote[] = generatedSequence.map((noteStr, idx) => {
      // Find midi pitch
      let pitch = 60; // C4 default
      if (noteStr.includes(".")) {
        // Take the first note of the chord for simple conversion
        const first = noteStr.split(".")[0];
        pitch = NOTE_MIDI[first] || NOTE_MIDI[first.toUpperCase()] || 60;
      } else {
        pitch = NOTE_MIDI[noteStr] || NOTE_MIDI[noteStr.toUpperCase()] || 60;
      }

      return {
        pitch,
        time: idx * 0.5, // 0.5 beats per note (eighth notes)
        duration: 0.5
      };
    });

    downloadMidi(notesToEncode, `ai_melody_${selectedStyle}.mid`);
  };

  // Copy codebase file to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Download individual python file
  const downloadPythonFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle AI Tutor messages
  const sendTutorMessage = async () => {
    if (!tutorInput.trim() || isTutorLoading) return;

    const userMsg = tutorInput.trim();
    setTutorMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTutorInput("");
    setIsTutorLoading(true);

    try {
      // Attach current codebase as context to help user
      const codeContext = pythonCodebase.map(f => `--- ${f.name} ---\n${f.content.slice(0, 500)}...`).join("\n");
      
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...tutorMessages, { role: "user", content: userMsg }].map(m => ({
            role: m.role,
            content: m.content
          })),
          codeContext
        })
      });

      if (!response.ok) {
        throw new Error("Tutor failed to respond.");
      }

      const data = await response.json();
      setTutorMessages((prev) => [...prev, { role: "model", content: data.content }]);
    } catch (error: any) {
      console.error(error);
      setTutorMessages((prev) => [
        ...prev,
        { role: "model", content: "Error: I'm currently unable to reach the workspace servers. Please verify that your Gemini API Key is configured in the **Settings > Secrets** panel." }
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Quiz filters
  const filteredQuiz = qaData.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(quizSearch.toLowerCase()) || 
                          q.answer.toLowerCase().includes(quizSearch.toLowerCase());
    const matchesType = quizFilter === "all" ? true : q.category === quizFilter;
    return matchesSearch && matchesType;
  });

  const togglePreparedQuestion = (idx: number) => {
    if (preparedQuestions.includes(idx)) {
      setPreparedQuestions(prev => prev.filter(q => q !== idx));
    } else {
      setPreparedQuestions(prev => [...prev, idx]);
    }
  };

  const getPrepProgress = () => {
    if (qaData.length === 0) return 0;
    return Math.round((preparedQuestions.length / qaData.length) * 100);
  };

  // Simple download of ZIP structure instructions
  const downloadAllInstructions = () => {
    const buildScript = `# AI Music Generator Project setup script
mkdir -p music_generation_ai/dataset
cd music_generation_ai
echo "Creating python files..."
`;
    // We can compile a shell installer or detailed README download
    downloadPythonFile("setup_project_locally.sh", buildScript + pythonCodebase.map(f => `cat << 'EOF' > ${f.name}\n${f.content}\nEOF\n`).join("\n") + `echo "Done! Run python midi_generator.py to start."`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 font-sans antialiased">
      {/* HEADER BAR */}
      <header className="border-b border-slate-800 bg-[#0e1626]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/10">
            <Music size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-sans font-bold text-lg tracking-tight text-white">Music Generation with AI</h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/20">LSTM Portal</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous Melody Synthesizer & Internship Companion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-xs text-slate-400 font-mono">Status: <span className="text-emerald-400 font-medium">● Operational</span></span>
            <span className="text-[10px] text-slate-500 mt-0.5 font-mono">Python 3.10 • music21 • TensorFlow</span>
          </div>
          <button 
            onClick={downloadAllInstructions}
            className="flex items-center gap-2 text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Download size={14} />
            Download Source Code (.SH)
          </button>
        </div>
      </header>

      {/* DASHBOARD CORE CONTAINER */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <nav className="w-64 border-r border-slate-800 bg-[#0c1220]/60 p-4 space-y-1.5 hidden lg:block shrink-0">
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 mb-2">Interactions</p>
          
          <button
            onClick={() => setActiveTab("generator")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "generator"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <Sliders size={18} className={activeTab === "generator" ? "text-cyan-400" : "text-slate-400"} />
            Interactive Playground
          </button>

          <button
            onClick={() => setActiveTab("code")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "code"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <Code size={18} className={activeTab === "code" ? "text-cyan-400" : "text-slate-400"} />
            Python Codebase
          </button>

          <button
            onClick={() => setActiveTab("workflow")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "workflow"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <Activity size={18} className={activeTab === "workflow" ? "text-cyan-400" : "text-slate-400"} />
            Workflow & Diagram
          </button>

          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 pt-6 mb-2">Academics</p>

          <button
            onClick={() => setActiveTab("presentation")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "presentation"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <Presentation size={18} className={activeTab === "presentation" ? "text-cyan-400" : "text-slate-400"} />
            Internship Defense Deck
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all relative ${
              activeTab === "quiz"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <HelpCircle size={18} className={activeTab === "quiz" ? "text-cyan-400" : "text-slate-400"} />
            Viva & Exam Prep
            {preparedQuestions.length > 0 && (
              <span className="absolute right-3.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-cyan-500/20">
                {getPrepProgress()}%
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "tutor"
                ? "bg-slate-800 text-cyan-400 shadow-inner"
                : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
            }`}
          >
            <Sparkles size={18} className={activeTab === "tutor" ? "text-cyan-400" : "text-slate-400"} />
            AI Project Tutor
          </button>

          {/* PROJECT FOOTER INFO CARD */}
          <div className="pt-8 px-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1.5">
                <Award size={14} className="text-yellow-400" />
                Internship Target
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Complete and submit this portfolio along with the running Python system to achieve full internship credits.
              </p>
            </div>
          </div>
        </nav>

        {/* MOBILE NAVIGATION TAB-BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-800 flex justify-around py-2.5">
          <button onClick={() => setActiveTab("generator")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "generator" ? "text-cyan-400" : "text-slate-400"}`}>
            <Sliders size={18} />
            Playground
          </button>
          <button onClick={() => setActiveTab("code")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "code" ? "text-cyan-400" : "text-slate-400"}`}>
            <Code size={18} />
            Code
          </button>
          <button onClick={() => setActiveTab("workflow")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "workflow" ? "text-cyan-400" : "text-slate-400"}`}>
            <Activity size={18} />
            Workflow
          </button>
          <button onClick={() => setActiveTab("presentation")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "presentation" ? "text-cyan-400" : "text-slate-400"}`}>
            <Presentation size={18} />
            Slides
          </button>
          <button onClick={() => setActiveTab("quiz")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "quiz" ? "text-cyan-400" : "text-slate-400"}`}>
            <HelpCircle size={18} />
            Exam Prep
          </button>
          <button onClick={() => setActiveTab("tutor")} className={`flex flex-col items-center gap-1 text-[10px] ${activeTab === "tutor" ? "text-cyan-400" : "text-slate-400"}`}>
            <Sparkles size={18} />
            AI Supervisor
          </button>
        </div>

        {/* MAIN DISPLAY MODULE */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 p-4 lg:p-8">
          
          {/* ========================================================= */}
          {/* TAB 1: INTERACTIVE PLAYGROUND (GENERATOR & TRAINING SIMULATOR) */}
          {/* ========================================================= */}
          {activeTab === "generator" && (
            <div className="space-y-6">
              {/* WELCOME BANNER */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -z-10"></div>
                
                <div className="max-w-3xl">
                  <span className="bg-cyan-500/15 text-cyan-400 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-md border border-cyan-500/20">INTERACTIVE LABS</span>
                  <h2 className="text-2xl font-bold font-sans text-white mt-3">Play with the LSTM Music Generation Model</h2>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Test how recurrent networks predict the next note in real-time. Toggle different styles, control the sampling temperature, visualize the underlying neural nodes fire, hear the synthesized melodies, and download the actual generated MIDI file.
                  </p>
                </div>
              </div>

              {/* GRID: LEFT CONTROLS, RIGHT PREVIEW */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* 1. MODEL PREFERENCES & CONTROLS */}
                <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                      <Sliders size={16} className="text-cyan-400" />
                      Inference Settings
                    </h3>

                    {/* SELECT STYLE */}
                    <div className="mt-4 space-y-2">
                      <label className="text-xs text-slate-400 font-medium">Musical Style Preset</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(STYLE_MELODIES).map((st) => (
                          <button
                            key={st}
                            onClick={() => setSelectedStyle(st as any)}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                              selectedStyle === st
                                ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SLIDER: TEMPERATURE */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                          Sampling Temperature
                          <span className="group relative cursor-pointer">
                            <Info size={12} className="text-slate-500 hover:text-slate-300" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-slate-900 text-[10px] text-slate-300 rounded shadow-lg border border-slate-800 hidden group-hover:block z-20 leading-normal">
                              Higher temperature makes notes more creative and unpredictable; lower makes it safer and repetitive.
                            </span>
                          </span>
                        </label>
                        <span className="text-xs font-mono font-bold text-cyan-400">{temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.6"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Predictable</span>
                        <span>Balanced</span>
                        <span>Experimental</span>
                      </div>
                    </div>

                    {/* SLIDER: LENGTH */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-medium">Melody Generation Length</label>
                        <span className="text-xs font-mono font-bold text-cyan-400">{melodyLength} Notes</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="64"
                        step="4"
                        value={melodyLength}
                        onChange={(e) => setMelodyLength(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    {/* SLIDER: SPEED / BPM */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-slate-400 font-medium">Playback Tempo</label>
                        <span className="text-xs font-mono font-bold text-cyan-400">{playbackSpeed} BPM</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="200"
                        step="5"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    {/* SYNTH TYPE SELECTOR */}
                    <div className="mt-5 space-y-2">
                      <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Volume2 size={13} className="text-cyan-400" /> Synthesizer Oscillator
                      </label>
                      <select
                        value={synthType}
                        onChange={(e) => setSynthType(e.target.value as OscillatorType)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-cyan-400"
                      >
                        <option value="sine">Sine Wave (Pure, Soft)</option>
                        <option value="triangle">Triangle Wave (Flute, Retro)</option>
                        <option value="sawtooth">Sawtooth Wave (Synthesizer Solo)</option>
                        <option value="square">Square Wave (Chiptune 8-Bit)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button
                      onClick={runLSTMGeneration}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="animate-spin text-white" size={14} />
                          Generating notes step-by-step...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Generate Melody with LSTM
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={triggerMidiDownload}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-[0.98] font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <Download size={14} />
                      Download output.mid
                    </button>
                  </div>
                </div>

                {/* 2. PIANO ROLL VISUALIZER */}
                <div className="xl:col-span-2 bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                        <Music size={16} className="text-indigo-400" />
                        Interactive Piano Roll & MIDI Output
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={startPlayback}
                          disabled={isGenerating}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all cursor-pointer ${
                            isPlaying
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                          {isPlaying ? "Pause" : "Play Sequence"}
                        </button>
                      </div>
                    </div>

                    {/* MUSIC TIMELINE GRID */}
                    <div className="mt-5 bg-slate-950 rounded-xl border border-slate-900 p-4 relative overflow-hidden">
                      <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center justify-between">
                        <span>Pitches (Pitch Range: G3 - B5)</span>
                        <span>Time Steps (Eighth Notes)</span>
                      </div>
                      
                      {/* Grid Container */}
                      <div className="h-60 overflow-y-auto overflow-x-auto relative flex border border-slate-900/50">
                        {/* Piano Keys Column */}
                        <div className="sticky left-0 bg-[#0f172a] border-r border-slate-800 z-10 w-14 shrink-0 flex flex-col">
                          {Object.keys(NOTE_FREQS).reverse().map((key) => {
                            const isAccidental = key.includes("#");
                            const isCurrentNote = currentPlayIndex >= 0 && generatedSequence[currentPlayIndex]?.toUpperCase() === key;
                            return (
                              <div
                                key={key}
                                className={`h-6 flex items-center justify-end pr-2 text-[8px] font-mono border-b border-slate-900 ${
                                  isCurrentNote
                                    ? "bg-cyan-500/40 text-white font-bold"
                                    : isAccidental
                                    ? "bg-slate-950 text-slate-400"
                                    : "bg-slate-900 text-slate-300"
                                }`}
                              >
                                {key}
                              </div>
                            );
                          })}
                        </div>

                        {/* Piano Grid Cells */}
                        <div className="flex-1 flex min-w-[600px] relative">
                          {generatedSequence.map((noteStr, timeStepIdx) => {
                            const notesInStep = noteStr.split(".");
                            return (
                              <div key={timeStepIdx} className="w-10 border-r border-slate-900/30 flex flex-col relative h-full">
                                {Object.keys(NOTE_FREQS).reverse().map((key) => {
                                  const isActiveNote = notesInStep.some(n => n.toUpperCase() === key);
                                  const isCurrentlyPlayingStep = currentPlayIndex === timeStepIdx;
                                  
                                  return (
                                    <div
                                      key={key}
                                      className={`h-6 border-b border-slate-900/10 flex items-center justify-center transition-all ${
                                        isCurrentlyPlayingStep && isActiveNote
                                          ? "bg-gradient-to-r from-cyan-400 to-indigo-500 scale-95 rounded shadow-lg shadow-cyan-500/20"
                                          : isActiveNote
                                          ? "bg-indigo-600/60 border border-indigo-500/40 rounded-[2px]"
                                          : isCurrentlyPlayingStep
                                          ? "bg-cyan-500/5"
                                          : "bg-slate-950/20"
                                      }`}
                                    >
                                      {isActiveNote && (
                                        <span className="text-[7px] text-white font-bold font-mono">
                                          {key}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* VIRTUAL PIANO KEYBOARD VIEW */}
                    <div className="mt-4 bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center">
                      <div className="text-[10px] text-slate-400 font-mono mb-2">Visual Synth Piano (C4 - B4)</div>
                      <div className="flex relative w-full justify-center">
                        {["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"].map((key) => {
                          const isBlack = key.includes("#");
                          const isNoteActive = currentPlayIndex >= 0 && (
                            generatedSequence[currentPlayIndex] === key || 
                            generatedSequence[currentPlayIndex].split(".").includes(key)
                          );
                          
                          if (isBlack) {
                            return (
                              <div
                                key={key}
                                className={`w-6 h-10 -mx-3 z-10 border border-slate-950 shadow-md rounded-b transition-all ${
                                  isNoteActive 
                                    ? "bg-cyan-400" 
                                    : "bg-slate-900"
                                }`}
                              />
                            );
                          } else {
                            return (
                              <div
                                key={key}
                                className={`w-8 h-16 border-r border-slate-800 rounded-b transition-all ${
                                  isNoteActive 
                                    ? "bg-indigo-500" 
                                    : "bg-slate-100"
                                }`}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE STEPS VISUALIZATION */}
                  <div className="border-t border-slate-800 pt-4 mt-6">
                    <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2.5">Neural Network LSTM States</h4>
                    
                    {generationSteps.length === 0 ? (
                      <p className="text-xs text-slate-500 leading-normal font-mono bg-slate-950/50 rounded-xl p-3 border border-slate-900/50">
                        Click 'Generate' to see the step-by-step prediction records, input sequence buffer, and soft-max probabilities.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-xs space-y-1">
                          <p className="text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                            <Layers size={13} className="text-cyan-400" />
                            Input Context Buffer (X)
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {generationSteps[generationSteps.length - 1]?.input.map((n, i) => (
                              <span key={i} className="bg-slate-900 text-slate-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-800">
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-xs flex flex-col justify-between">
                          <div>
                            <p className="text-slate-400 font-bold mb-1 flex items-center gap-1">
                              <Activity size={13} className="text-indigo-400" />
                              Latest Predicted Note (y)
                            </p>
                            <p className="font-mono text-xs text-cyan-400 font-bold mt-1">
                              t+1 Output: <span className="text-white text-sm bg-indigo-600/50 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">{generationSteps[generationSteps.length - 1]?.predicted}</span>
                            </p>
                          </div>
                          <div className="h-2 w-full bg-slate-900 rounded overflow-hidden mt-2">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 w-3/4 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: LSTM TRAINING SIMULATION MODULE */}
              <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                      <Terminal size={18} className="text-cyan-400 animate-pulse" />
                      Visual Model Training Laboratory (Simulate model.fit)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure structural hyperparameters and watch how loss decays and accuracy climbs step-by-step.
                    </p>
                  </div>
                  <button
                    onClick={startTrainingSimulation}
                    className={`mt-3 md:mt-0 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer ${
                      isTraining
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                    }`}
                  >
                    {isTraining ? <Pause size={14} /> : <Play size={14} />}
                    {isTraining ? "Stop Training" : "Start Visual Training"}
                  </button>
                </div>

                {/* Hyperparameter Inputs */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Training Epochs</label>
                    <input
                      type="number"
                      disabled={isTraining}
                      value={trainingParameters.epochs}
                      onChange={(e) => setTrainingParameters(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Batch Size</label>
                    <input
                      type="number"
                      disabled={isTraining}
                      value={trainingParameters.batchSize}
                      onChange={(e) => setTrainingParameters(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Learning Rate</label>
                    <input
                      type="number"
                      step="0.0001"
                      disabled={isTraining}
                      value={trainingParameters.learningRate}
                      onChange={(e) => setTrainingParameters(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">LSTM Cell Units</label>
                    <input
                      type="number"
                      disabled={isTraining}
                      value={trainingParameters.lstmUnits}
                      onChange={(e) => setTrainingParameters(prev => ({ ...prev, lstmUnits: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Sequence Length</label>
                    <input
                      type="number"
                      disabled={isTraining}
                      value={trainingParameters.seqLength}
                      onChange={(e) => setTrainingParameters(prev => ({ ...prev, seqLength: parseInt(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-400 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Training Console Output & Plot */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Visual Console Logs */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-60 overflow-y-auto font-mono text-xs text-slate-400 space-y-1">
                    <div className="text-cyan-400">{`>>> Initializing TensorFlow LSTM Compiler...`}</div>
                    <div>{`>>> Vocabulary loaded from mapping.json. Size: ${STYLE_MELODIES[selectedStyle].notes.length} unique elements.`}</div>
                    <div>{`>>> Sequential model layers configured: LSTM(${trainingParameters.lstmUnits}) -> Dropout(0.3) -> Dense -> Softmax`}</div>
                    <div>{`>>> Compiled with Adam optimizer (lr=${trainingParameters.learningRate}) and Categorical Crossentropy.`}</div>
                    
                    {trainingMetrics.map((m, idx) => (
                      <div key={idx}>
                        <span className="text-indigo-400">Epoch {m.epoch}/{trainingParameters.epochs}:</span>
                        {` loss: `}
                        <span className="text-yellow-400">{m.loss}</span>
                        {` - accuracy: `}
                        <span className="text-emerald-400">{m.acc}</span>
                        {` - batch_size: ${trainingParameters.batchSize}`}
                      </div>
                    ))}

                    {isTraining && (
                      <div className="text-cyan-400 animate-pulse">{`Training in progress...`}</div>
                    )}
                    {trainingEpoch === trainingParameters.epochs && (
                      <div className="text-emerald-400 font-bold">{`>>> SUCCESS: Model training complete! Weights exported to music_generator_model.h5.`}</div>
                    )}
                  </div>

                  {/* Custom SVG Line Chart */}
                  <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 h-60 flex flex-col justify-between">
                    <div className="text-xs text-slate-300 font-mono flex justify-between items-center">
                      <span>Training Curves</span>
                      <div className="flex gap-4 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-yellow-400 inline-block"></span> Loss</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span> Accuracy</span>
                      </div>
                    </div>

                    <div className="flex-1 relative flex items-end h-full pt-4">
                      {trainingMetrics.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-mono">
                          Start training to render performance curves
                        </div>
                      ) : (
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Grid Lines */}
                          <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.25" strokeDasharray="2" />
                          <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.25" strokeDasharray="2" />
                          <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="0.25" strokeDasharray="2" />

                          {/* Loss Curve (yellow) */}
                          <polyline
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="1.5"
                            points={trainingMetrics.map((m, i) => {
                              const x = (i / (trainingParameters.epochs - 1)) * 100;
                              // Normalize loss (max 3.8 to 0) to 100 - 0 coordinate
                              const y = 100 - Math.min(100, Math.max(0, (m.loss / 3.8) * 100));
                              return `${x},${y}`;
                            }).join(" ")}
                          />

                          {/* Accuracy Curve (green) */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1.5"
                            points={trainingMetrics.map((m, i) => {
                              const x = (i / (trainingParameters.epochs - 1)) * 100;
                              // Accuracy is 0 to 1, scale directly
                              const y = 100 - (m.acc * 100);
                              return `${x},${y}`;
                            }).join(" ")}
                          />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 border-t border-slate-900 pt-1.5">
                      <span>Epoch 1</span>
                      <span>Epoch {trainingParameters.epochs}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PYTHON CODEBASE EXPLORER */}
          {/* ========================================================= */}
          {activeTab === "code" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2">
                    <Code size={20} className="text-cyan-400" />
                    Complete Python Project Source Code Explorer
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every file has exhaustive, line-by-line comments, making it instantly ready for your internship project presentation and submission.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadPythonFile(pythonCodebase[selectedFileIndex].name, pythonCodebase[selectedFileIndex].content)}
                    className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
                  >
                    <Download size={14} />
                    Download File
                  </button>
                  <button
                    onClick={() => copyToClipboard(pythonCodebase[selectedFileIndex].content, selectedFileIndex)}
                    className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
                  >
                    <Copy size={14} />
                    {copiedIndex === selectedFileIndex ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              </div>

              {/* Grid: Code Selector Sidebar & Code Display */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left File Selector list */}
                <div className="space-y-2 lg:col-span-1">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2.5 px-1">Project Modules</p>
                  
                  {pythonCodebase.map((file, idx) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFileIndex(idx)}
                      className={`w-full text-left p-3.5 rounded-xl transition-all border flex flex-col justify-start cursor-pointer ${
                        selectedFileIndex === idx
                          ? "bg-slate-800/80 border-cyan-500/50 text-white shadow-md shadow-indigo-950/20"
                          : "bg-slate-900 border-slate-800/40 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className={selectedFileIndex === idx ? "text-cyan-400" : "text-slate-500"} />
                        <span className="font-mono text-xs font-semibold">{file.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2 pl-6">
                        {file.description}
                      </p>
                    </button>
                  ))}

                  <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-4 mt-6">
                    <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                      <Terminal size={12} /> Local Setup Instructions
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1.5">
                      To run locally, install dependencies using <code className="bg-slate-950 text-slate-300 px-1 rounded font-mono">pip install -r requirements.txt</code>, then execute files in sequential order.
                    </p>
                  </div>
                </div>

                {/* Right Code Display Canvas */}
                <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                  {/* File status bar */}
                  <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-900 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                      {pythonCodebase[selectedFileIndex].name}
                    </span>
                    <span>UTF-8 • Python 3</span>
                  </div>

                  {/* Code Editor Body */}
                  <div className="p-5 overflow-auto max-h-[600px]">
                    <pre className="font-mono text-xs text-slate-300 leading-6 whitespace-pre">
                      <code>{pythonCodebase[selectedFileIndex].content}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: WORKFLOW & FLOWCHART PIPELINE */}
          {/* ========================================================= */}
          {activeTab === "workflow" && (
            <div className="space-y-6">
              {/* INTERACTIVE PIPELINE SVG */}
              <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Activity size={18} className="text-cyan-400" />
                  Visual Algorithm Flow & Pipeline Architecture
                </h3>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  The flowchart below shows how musical elements move through the pre-processing pipeline, feed the deep LSTM tensor layout, and are compiled back into binary MIDI files. Hover over or review the stages of the pipeline.
                </p>

                {/* SVG Flowchart */}
                <div className="mt-8 overflow-x-auto py-4 bg-slate-950/40 rounded-xl border border-slate-900 flex justify-center">
                  <div className="min-w-[800px] p-6 relative">
                    <svg className="w-full h-44" viewBox="0 0 800 180" xmlns="http://www.w3.org/2000/svg">
                      {/* Connection arrows */}
                      <path d="M 120 90 L 160 90" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                      <path d="M 280 90 L 320 90" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                      <path d="M 440 90 L 480 90" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                      <path d="M 600 90 L 640 90" stroke="#334155" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
                        </marker>
                        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>

                      {/* Stage 1: MIDI Dataset */}
                      <g transform="translate(10, 50)">
                        <rect x="0" y="0" width="110" height="80" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                        <text x="55" y="30" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">1. MIDI Corpus</text>
                        <text x="55" y="48" fill="#94a3b8" fontSize="8" textAnchor="middle">Collection of .mid files</text>
                        <text x="55" y="60" fill="#94a3b8" fontSize="8" textAnchor="middle">Twinkle, Beethoven, etc.</text>
                      </g>

                      {/* Stage 2: music21 extraction */}
                      <g transform="translate(170, 50)">
                        <rect x="0" y="0" width="110" height="80" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                        <text x="55" y="26" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">2. Preprocessor</text>
                        <text x="55" y="42" fill="#38bdf8" fontSize="8" textAnchor="middle">music21 parsing</text>
                        <text x="55" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Extract Pitch/Chords</text>
                        <text x="55" y="66" fill="#94a3b8" fontSize="8" textAnchor="middle">Map keys to Integers</text>
                      </g>

                      {/* Stage 3: Training sequences */}
                      <g transform="translate(330, 50)">
                        <rect x="0" y="0" width="110" height="80" rx="12" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                        <text x="55" y="26" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">3. Sequence Slicer</text>
                        <text x="55" y="42" fill="#818cf8" fontSize="8" textAnchor="middle">Sliding history blocks</text>
                        <text x="55" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Input history size: 16</text>
                        <text x="55" y="66" fill="#94a3b8" fontSize="8" textAnchor="middle">Output target (One-Hot)</text>
                      </g>

                      {/* Stage 4: LSTM Model */}
                      <g transform="translate(490, 50)">
                        <rect x="0" y="0" width="110" height="80" rx="12" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
                        <text x="55" y="26" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle">4. LSTM Model</text>
                        <text x="55" y="42" fill="#f8fafc" fontSize="8" textAnchor="middle">LSTM units (128)</text>
                        <text x="55" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">Dropout layer (0.3)</text>
                        <text x="55" y="66" fill="#94a3b8" fontSize="8" textAnchor="middle">Dense & Softmax output</text>
                      </g>

                      {/* Stage 5: Generated Melody */}
                      <g transform="translate(650, 50)">
                        <rect x="0" y="0" width="110" height="80" rx="12" fill="#061f2d" stroke="#06b6d4" strokeWidth="2" />
                        <text x="55" y="26" fill="#22d3ee" fontSize="11" fontWeight="bold" textAnchor="middle">5. MIDI Composer</text>
                        <text x="55" y="42" fill="#f8fafc" fontSize="8" textAnchor="middle">Temp-scaled sampling</text>
                        <text x="55" y="54" fill="#94a3b8" fontSize="8" textAnchor="middle">music21 stream output</text>
                        <text x="55" y="66" fill="#22d3ee" fontSize="8" fontWeight="bold" textAnchor="middle">output.mid exported</text>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* GRID: ADVANTAGES, LIMITATIONS, FUTURE SCOPE */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* 1. ADVANTAGES */}
                <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-emerald-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Project Advantages & Merits
                  </h3>
                  <div className="space-y-4">
                    {advantagesList.map((adv, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">{adv.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{adv.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. LIMITATIONS */}
                <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-rose-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Info size={16} />
                    System Limitations
                  </h3>
                  <div className="space-y-4">
                    {limitationsList.map((lim, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">{lim.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{lim.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. FUTURE SCOPE */}
                <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <ArrowRight size={16} />
                    Future Technical Scope
                  </h3>
                  <div className="space-y-4">
                    {futureScopeList.map((f, idx) => (
                      <div key={idx} className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: INTERACTIVE PRESENTATION SLIDE DECK */}
          {/* ========================================================= */}
          {activeTab === "presentation" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2">
                    <Presentation size={20} className="text-cyan-400" />
                    Internship Project Viva / Presentation Slides
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Use this built-in slides presenter to explain your 'Music Generation with AI' project to examiners, including speaker notes for each slide.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPresenterNotes(!showPresenterNotes)}
                    className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-800 cursor-pointer"
                  >
                    <BookOpen size={14} />
                    {showPresenterNotes ? "Hide Presenter Notes" : "Show Presenter Notes"}
                  </button>
                </div>
              </div>

              {/* Slide Canvas Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Main Slide Card */}
                <div className="xl:col-span-2 bg-[#101726]/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[360px] relative overflow-hidden shadow-xl">
                  {/* Backdrop decoration */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-2xl -z-10"></div>
                  
                  {/* Slide header */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>INTERNSHIP PROJECT DEFENSE</span>
                    <span>Slide {currentSlideIndex + 1} of {presentationSlides.length}</span>
                  </div>

                  {/* Slide contents */}
                  <div className="my-auto space-y-4">
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                      {presentationSlides[currentSlideIndex].title}
                    </h3>
                    
                    {presentationSlides[currentSlideIndex].subtitle && (
                      <p className="text-sm font-semibold text-cyan-400">
                        {presentationSlides[currentSlideIndex].subtitle}
                      </p>
                    )}

                    <ul className="space-y-2">
                      {presentationSlides[currentSlideIndex].bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <span className="text-indigo-400 mt-1">✦</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Slide controls footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                    <button
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                      className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-slate-300 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>

                    {/* Progress indicator */}
                    <div className="flex gap-1.5">
                      {presentationSlides.map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            currentSlideIndex === idx ? "bg-cyan-400 w-4" : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      disabled={currentSlideIndex === presentationSlides.length - 1}
                      onClick={() => setCurrentSlideIndex(prev => prev + 1)}
                      className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 text-slate-300 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Presenter Notes Column */}
                <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-4 h-full">
                    <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-400" />
                      Presenter's Oral Script / Speech notes
                    </h4>
                    
                    {showPresenterNotes ? (
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 rounded-xl p-4 border border-slate-900 h-64 overflow-y-auto italic font-medium">
                        "{presentationSlides[currentSlideIndex].notes || "No notes available for this slide."}"
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 border border-dashed border-slate-850 rounded-xl text-slate-500 text-xs">
                        <Info size={24} className="mb-2" />
                        Oral presentation script is hidden.
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-indigo-950/10 border border-indigo-900/20 rounded-xl p-3 text-[10px] text-slate-400 leading-normal flex items-start gap-2">
                    <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    Examiners typically grade based on clarity of sequence representation and overfitting prevention (Regularization via Dropout). Highlight slide points accordingly!
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: VIVA & INTERVIEW PREPARATION MODULE */}
          {/* ========================================================= */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {/* QUIZ DASHBOARD HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-sans font-bold text-white flex items-center gap-2">
                    <HelpCircle size={20} className="text-cyan-400" />
                    Internship Preparation Core (Viva & Interview Q&A)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Study these {qaData.length} highly expected Viva questions and technical Deep Learning interviews to secure an A+ project grade.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                  <div className="text-xs font-mono">
                    Prepared: <span className="text-cyan-400 font-bold">{preparedQuestions.length}</span> / {qaData.length}
                  </div>
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${getPrepProgress()}%` }}></div>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search questions or keyword definitions..."
                  value={quizSearch}
                  onChange={(e) => setQuizSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 placeholder-slate-500 outline-none focus:border-cyan-400 flex-1"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizFilter("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      quizFilter === "all"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    All Questions
                  </button>
                  <button
                    onClick={() => setQuizFilter("viva")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      quizFilter === "viva"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Viva Prep (15)
                  </button>
                  <button
                    onClick={() => setQuizFilter("interview")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      quizFilter === "interview"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    Technical Interview (10)
                  </button>
                </div>
              </div>

              {/* GRID OF FLASHCARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuiz.map((qa, index) => {
                  const globalIndex = qaData.findIndex(q => q.question === qa.question);
                  const isExpanded = expandedQuizIndex === globalIndex;
                  const isPrepared = preparedQuestions.includes(globalIndex);

                  return (
                    <div
                      key={globalIndex}
                      className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                        isPrepared 
                          ? "bg-indigo-950/20 border-cyan-500/30 shadow-md" 
                          : "bg-[#101726]/80 border-slate-800/80"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                            qa.category === "viva" 
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                              : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>
                            {qa.category === "viva" ? "Viva Q&A" : "Technical Interview"}
                          </span>

                          <button
                            onClick={() => togglePreparedQuestion(globalIndex)}
                            className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded transition-all cursor-pointer ${
                              isPrepared
                                ? "bg-cyan-500/20 text-cyan-300"
                                : "bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800"
                            }`}
                          >
                            <CheckCircle size={10} />
                            {isPrepared ? "Completed" : "Mark Prepared"}
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-white leading-relaxed">
                          {qa.question}
                        </h4>

                        {isExpanded ? (
                          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-900 mt-3 whitespace-pre-line font-medium">
                            {qa.answer}
                          </p>
                        ) : (
                          <div className="h-6 overflow-hidden relative">
                            <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-950/0 to-[#101726]/0"></div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-800/40 pt-3 mt-4 flex justify-between items-center">
                        <button
                          onClick={() => setExpandedQuizIndex(isExpanded ? null : globalIndex)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? "Hide Answer" : "Reveal Answer"}
                        </button>
                        <span className="text-[9px] text-slate-500 font-mono">Q#{globalIndex + 1}</span>
                      </div>
                    </div>
                  );
                })}

                {filteredQuiz.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                    No prep questions found matching search filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: AI PROJECT TUTOR (GEMINI) */}
          {/* ========================================================= */}
          {activeTab === "tutor" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
                <span className="bg-cyan-500/15 text-cyan-400 text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-md border border-cyan-500/20">WORK-SPACE SUPERVISION</span>
                <h2 className="text-2xl font-bold font-sans text-white mt-3">Interactive AI Project Tutor & Supervisor</h2>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Have a question about changing parameters, training logs, music21, or getting errors? Ask your supervisor in real-time. It has direct context on your internship files.
                </p>
              </div>

              {/* Chat Panel */}
              <div className="bg-[#101726]/80 border border-slate-800 rounded-2xl flex flex-col h-[480px] shadow-xl overflow-hidden">
                {/* Chat header */}
                <div className="bg-slate-900/60 border-b border-slate-900 px-5 py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                    <span className="font-bold text-slate-200">AI Project Tutor (Supervised by Gemini 3.5 Flash)</span>
                  </div>
                  <span className="text-slate-500 font-mono">Context: active_codebase</span>
                </div>

                {/* Messages Box */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {tutorMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-800 text-cyan-400 border border-slate-700"
                      }`}>
                        {msg.role === "user" ? "U" : <Sparkles size={14} />}
                      </div>

                      {/* Content Card */}
                      <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-900 text-slate-300 border border-slate-850"
                      }`}>
                        <p className="whitespace-pre-line font-medium">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {isTutorLoading && (
                    <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
                        <RefreshCw className="animate-spin" size={12} />
                      </div>
                      <div className="bg-slate-900 text-slate-500 rounded-2xl px-4 py-2 text-xs border border-slate-850 font-mono italic">
                        Supervisor is analyzing your request...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Controls Footer */}
                <div className="bg-slate-900/50 border-t border-slate-900 p-3.5 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask a question about the python code, e.g., 'What does music21.converter.parse do?'..."
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendTutorMessage()}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 flex-1"
                  />
                  <button
                    onClick={sendTutorMessage}
                    disabled={isTutorLoading || !tutorInput.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white p-3 rounded-xl transition-all cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
