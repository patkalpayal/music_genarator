export interface QAPair {
  question: string;
  answer: string;
  category: "viva" | "interview";
}

export interface Slide {
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

export const advantagesList = [
  {
    title: "Sequential Context Awareness",
    description: "Unlike Markov chains or rule-based generators, the LSTM architecture can remember musical context over long periods, capturing the structural progression and phrase repetitions of melodies."
  },
  {
    title: "Polyphonic & Monophonic Versatility",
    description: "By representing simultaneous notes (chords) as combined dot-separated string features (e.g., 'C4.E4.G4'), the model seamlessly processes and predicts complex harmonic sequences alongside simple single-note melodies."
  },
  {
    title: "Creative Variance Control",
    description: "Integrating a sampling temperature scaling formula allows the creator to toggle between highly predictable/conservative music replication and adventurous, unique improvisational melodies."
  },
  {
    title: "100% Offline & Local Execution",
    description: "Requires no paid API keys, internet connectivity, or expensive cloud infrastructure. It executes directly on consumer laptops, making it accessible and cost-free for independent developers."
  }
];

export const limitationsList = [
  {
    title: "Loss of Global Musical Form",
    description: "While LSTMs excel at local sequence structure, they struggle to capture grand sonata-allegro forms, symphonic structures, or full verses/chorus transitions, which can lead to rambling compositions over long durations."
  },
  {
    title: "High Sensitivity to Training Data Size",
    description: "With small local MIDI datasets, the model is prone to extreme overfitting (simply copying training melodies verbatim) or producing chaotic output if the dataset is not well-structured and clean."
  },
  {
    title: "Fixed Note Timing & Velocity",
    description: "In this beginner-friendly implementation, all generated notes are assigned uniform eighth-note lengths and velocities, ignoring the subtle timing swings and dynamic changes that give human performances expressiveness."
  },
  {
    title: "High Computational Demands on CPU",
    description: "As vocabulary size grows, training multiple deep LSTM layers becomes heavy on standard CPUs, requiring specialized GPU systems for fast, large-scale training sessions."
  }
];

export const futureScopeList = [
  {
    title: "Generative Adversarial Networks (GANs)",
    description: "Transitioning to MuseGAN architectures where a Generator network writes melodies while a Discriminator reviews and scores them, leading to much higher rhythmic stability and style alignment."
  },
  {
    title: "Transformers & Attention Mechanisms",
    description: "Upgrading the sequence processor to a Transformer architecture (like Music Transformer) with self-attention layers to capture extremely long-term structural dependencies and full-track compositions."
  },
  {
    title: "Dynamic Rhythm & Dynamics Prediction",
    description: "Expanding the target vector prediction from a single pitch to a multi-branch network that generates note pitches, variable durations, rest flags, and velocity (volume) values concurrently."
  },
  {
    title: "Interactive Human-AI Co-creation",
    description: "Building VST audio plugins or web interfaces where composers can input partial melodies, and the AI suggests real-time continuations, fills, or harmonic backings."
  }
];

export const qaData: QAPair[] = [
  // --- VIVA QUESTIONS (15) ---
  {
    category: "viva",
    question: "What is the primary goal of this 'Music Generation with AI' project?",
    answer: "The primary goal is to build an artificial intelligence system that can learn musical patterns, structures, and note sequences from an existing MIDI dataset and use this learned knowledge to compose original, harmonious melodies independently."
  },
  {
    category: "viva",
    question: "Why did you choose an LSTM network instead of a standard Feed-Forward Neural Network?",
    answer: "Music is inherently sequential and time-dependent; a note's meaning depends on previous notes. Standard feed-forward networks have no memory of past inputs. LSTMs (Long Short-Term Memory) possess specialized feedback loops and memory cells that allow them to remember and process sequential data over long timelines, making them perfect for capturing musical patterns."
  },
  {
    category: "viva",
    question: "What is the role of the 'music21' library in your project?",
    answer: "The 'music21' library is a powerful toolkit created by MIT for computer-aided musicology. In our project, it is used to parse raw MIDI files, extract pitch/chord sequences for data preprocessing, and convert generated numerical sequences back into notes, streams, and physical '.mid' audio files."
  },
  {
    category: "viva",
    question: "What is a MIDI file, and how does it differ from an MP3 file?",
    answer: "An MP3 file contains actual recorded audio waveforms (sound pressure information). A MIDI (Musical Instrument Digital Interface) file is a set of digital instructions (like sheet music) specifying what pitch to play, when to turn it on/off, at what volume, and with what instrument. MIDI files are tiny in size because they don't contain raw audio bytes, only performance events."
  },
  {
    category: "viva",
    question: "How do you represent a musical chord in your preprocessing dataset?",
    answer: "Chords contain multiple simultaneous notes. We convert them to a single string containing the normal-order integers of the pitches separated by dots (e.g., '0.4.7' or 'C4.E4.G4'). This turns chords into unique categorical words in our model's vocabulary, allowing it to predict chords exactly like single notes."
  },
  {
    category: "viva",
    question: "Explain the term 'Sequence Length' or 'Time Steps' in this project.",
    answer: "Sequence length (set to 16 in our script) is the number of historical notes the LSTM examines to predict the immediate next note. For example, the model looks at notes 1 to 16 to predict note 17. A longer sequence gives more context but requires more training time and memory."
  },
  {
    category: "viva",
    question: "Why do we divide the integer note values by the total vocabulary size in preprocessing?",
    answer: "This is a feature normalization step. Neural networks converge much faster and perform more stably when input features are scaled to a small range (typically 0 to 1) rather than raw arbitrary integer indices (e.g., 0 to 80)."
  },
  {
    category: "viva",
    question: "What is 'one-hot encoding' and why is it used for the output target 'y'?",
    answer: "One-hot encoding converts categorical labels (individual notes) into a binary vector where only the index of the correct note is 1, and all others are 0. It is used because our model treats note prediction as a multi-class classification problem, and categorical crossentropy loss requires one-hot targets."
  },
  {
    category: "viva",
    question: "What does the 'Dropout' layer do in your LSTM model?",
    answer: "The Dropout layer randomly disables a percentage of neurons (30% in our model) during each training step. This prevents the network from over-relying on specific neurons and forces it to learn generalized musical patterns, reducing the risk of overfitting (memorizing the dataset)."
  },
  {
    category: "viva",
    question: "What activation function is used in the final Dense layer, and why?",
    answer: "We use the 'softmax' activation function in the final output layer. Softmax takes the model's raw output scores (logits) and normalizes them into a probability distribution that sums exactly to 1.0, representing the probability of each note being the next logical choice."
  },
  {
    category: "viva",
    question: "What loss function and optimizer are used to train this network?",
    answer: "We use 'categorical_crossentropy' as the loss function since we are classifying notes out of a vocabulary of multiple unique options. We use the 'adam' optimizer, which is an adaptive learning rate optimization algorithm known for fast convergence and high stability in deep learning."
  },
  {
    category: "viva",
    question: "What is 'Temperature' in the generation phase, and how does it affect music?",
    answer: "Temperature is a scaling factor applied to the output probabilities before sampling. A low temperature (< 0.5) makes the model conservative, always selecting the highest-probability notes (often causing repetitive, safe loops). A high temperature (> 1.2) flattens the probabilities, making choices more random and creative but risking chaotic, unmelodic output."
  },
  {
    category: "viva",
    question: "What is the purpose of using a 'seed' sequence during melody generation?",
    answer: "Because the LSTM requires a history of notes (equal to the sequence length) to make its first prediction, we must supply an initial sequence of notes called a 'seed'. The model reads this seed, predicts note #17, slides the window, and repeats the process to generate music recursively."
  },
  {
    category: "viva",
    question: "How can you tell if your music model is overfitting during training?",
    answer: "If the training loss continues to drop drastically toward zero, but the generated music sounds exactly like a verbatim copy of the training midi files, or if validation loss begins to rise while training loss drops, the model is overfitting. It is memorizing notes rather than learning musical principles."
  },
  {
    category: "viva",
    question: "Name three real-world applications of AI-generated music.",
    answer: "1. Background score generation for video games that dynamically adapts to gameplay intensity.\n2. Royalties-free ambient music production for content creators and videos.\n3. Creative assistance tools for professional musicians to overcome writer's block and explore novel chord sequences."
  },

  // --- INTERVIEW QUESTIONS (10) ---
  {
    category: "interview",
    question: "How does the LSTM cell internal state maintain long-term memory?",
    answer: "The LSTM cell controls memory flow through three specialized gates: the Forget Gate (decides what information to discard from the cell state), the Input Gate (decides which new information to store in the cell state), and the Output Gate (decides what parts of the cell state to output as the hidden state). The linear cell state acts as an 'information highway,' allowing gradients to flow backward through time without vanishing."
  },
  {
    category: "interview",
    question: "Explain the difference between categorical_crossentropy and sparse_categorical_crossentropy loss.",
    answer: "Both compute crossentropy for multi-class classification. 'categorical_crossentropy' requires targets to be pre-converted to one-hot encoded vectors (e.g. [0, 0, 1]). 'sparse_categorical_crossentropy' works directly with raw integer targets (e.g. 2). Using sparse categorical crossentropy saves memory because it avoids storing giant one-hot matrices, especially with large vocabularies."
  },
  {
    category: "interview",
    question: "What are 'vanishing gradients' and how do LSTMs mitigate this compared to standard RNNs?",
    answer: "In standard RNNs, backpropagation through time multiplies weight matrices repeatedly across time steps. If weights are small, gradients shrink exponentially (vanish), preventing long-term learning. LSTMs mitigate this because their cell state updates are additive (linear) rather than multiplicative. The error can flow back indefinitely through the cell state without multiplying, maintaining a stable gradient."
  },
  {
    category: "interview",
    question: "How would you design a model to handle polyphonic music with varying note durations?",
    answer: "There are two main approaches:\n1. Tokenize pitch, duration, and rests as separate elements in a single sequential vocabulary (e.g., 'Note_C4_Duration_0.5', 'Rest_0.25').\n2. Use a multi-output model with two parallel dense layers at the output: one predicting the pitch index using softmax, and another predicting note duration as a continuous variable using regression (ReLU) or classification."
  },
  {
    category: "interview",
    question: "What is the multinomial distribution sampling technique, and why is it superior to greedy argmax in generative models?",
    answer: "Greedy argmax always selects the note with the absolute highest probability. This makes generation deterministic and leads to repetitive loops. Multinomial sampling treats the outputs as probabilities of a multi-sided die and rolls it. Even a note with a 5% probability has a chance of being chosen, creating creative, natural musical variation on every run."
  },
  {
    category: "interview",
    question: "Explain how you would handle the 'Out Of Vocabulary' (OOV) problem if a user uploads a MIDI file containing notes not in your original training set.",
    answer: "To handle OOV notes, we can:\n1. Map notes to pitch classes (transposing all MIDI files to a single key like C Major) before training, reducing the active vocab size.\n2. Introduce an '<UNK>' (Unknown) token in our vocabulary mapping. Any note unseen during training is mapped to '<UNK>'. During generation, if '<UNK>' is predicted, we can substitute it with a neighboring note or a chord tone from the current key."
  },
  {
    category: "interview",
    question: "How does the Batch Size parameter influence training speed and gradient accuracy?",
    answer: "Batch size defines the number of training samples analyzed before weights are updated. A small batch size (e.g., 8) makes training slower computationally but adds helpful stochastic noise to updates, which can help escape local minima. A large batch size (e.g., 128) processes faster due to parallelization, but yields extremely smooth, average gradients that may converge to sharp minima with poor generalization."
  },
  {
    category: "interview",
    question: "How does the music21 converter handle MIDI tick resolution and tempo changes?",
    answer: "The `music21.converter` reads the MIDI header to find the 'division' (ticks per quarter note). It then converts raw ticks into logical float durations representing beats (e.g. 1.0 is a quarter note, 0.5 is an eighth note). Tempo changes are processed by inserting special `tempo.MetronomeMark` events into the stream, which map beat durations to actual wall-clock milliseconds."
  },
  {
    category: "interview",
    question: "If your LSTM model starts generating endless loops of the same 3 notes, what architectural or algorithmic modifications would you make?",
    answer: "This is a common failure mode called 'mode collapse' or 'repetitive looping.' To fix it:\n1. Increase the sampling temperature (e.g. from 0.5 to 0.95) to introduce randomness.\n2. Implement a 'repetition penalty' during sampling that artificially reduces the probabilities of notes that have been selected frequently in the last 5-10 steps.\n3. Increase the sequence length (SEQUENCE_LENGTH) so the model remembers a longer history and notices its own loops."
  },
  {
    category: "interview",
    question: "Describe how you would deploy this trained TensorFlow LSTM model into a production web service.",
    answer: "I would:\n1. Convert the trained Keras `.h5` model into the optimized TensorFlow Lite (`.tflite`) format to reduce memory footprint.\n2. Containerize a Python FastAPI server containing the model and preprocessing scripts using Docker.\n3. Create an API endpoint `/api/generate` that receives user seeds and temperature parameters, runs the fast TFLite interpreter, writes notes to MIDI via music21, and streams the `.mid` file back to the browser. Alternatively, convert the model to TensorFlow.js to run inference directly in the client's browser!"
  }
];

export const presentationSlides: Slide[] = [
  {
    title: "Music Generation with AI",
    subtitle: "Internship Project Presentation",
    bullets: [
      "Objective: To develop an intelligent melody composing system using Deep Learning",
      "Core Technology: Python, TensorFlow/Keras, and music21",
      "Model Architecture: Recurrent Neural Network with Long Short-Term Memory (LSTM)",
      "Outcome: Autonomous creation of harmonious melodies saved as MIDI files"
    ],
    notes: "Welcome the panel. Today, I'm presenting my internship project titled 'Music Generation with AI'. In this project, we bridge the gap between mathematics, deep learning, and musicology to create a system that can compose music autonomously."
  },
  {
    title: "Project Scope & Objectives",
    bullets: [
      "Dataset Creation: Establish a clean MIDI corpus of traditional folk and classical melodies",
      "Feature Engineering: Preprocess MIDI tracks into normalized integer streams using music21",
      "Deep Learning Training: Construct and train an LSTM model to capture sequential pitch patterns",
      "Creative Composition: Implement temperature-scaled sampling to generate fresh melodies",
      "Evaluation & Output: Export compositions back to standard, playable MIDI files"
    ],
    notes: "Our primary objective is to build a fully self-contained pipeline, starting from raw MIDI representation, engineering sequential data tensors, training an LSTM classifier, and synthesizing new melodies."
  },
  {
    title: "Understanding MIDI Data",
    bullets: [
      "MIDI (Musical Instrument Digital Interface) is a protocol of instructions, not audio",
      "Key events recorded: Note On (pitch, velocity), Note Off, Tempo, Instrument",
      "Advantages for AI: Extremely small size, highly structured, clear numeric representation",
      "Challenges: High complexity of rhythms, polyphony (chords), and musical dynamics"
    ],
    notes: "It's vital to note that MIDI does not store raw waveforms. Rather, it stores control commands like 'play C4 at velocity 80.' This symbolic representation is highly suited for neural network prediction compared to raw heavy waveform processing."
  },
  {
    title: "MIDI Preprocessing with music21",
    bullets: [
      "MIT's 'music21' parses MIDI files into a symbolic object tree",
      "Extraction rules:",
      "  - Single Notes: Converted to raw pitch strings (e.g., 'E4')",
      "  - Chords: Simultaneous pitches grouped by dots (e.g., 'C4.E4.G4')",
      "Vocabulary building: Mapping all unique music tokens to numerical indices",
      "Normalization: Dividing pitch integer values by vocab size for neural stability"
    ],
    notes: "We utilize MIT's music21 library. It parses MIDI files and structures them into notes and chords. Chords are mapped as period-separated strings. This keeps the classification model clean and beginner-friendly."
  },
  {
    title: "Model Architecture: LSTM",
    bullets: [
      "Sequential model container holding sequential layers",
      "Core: LSTM layer with 128 units to learn long-term temporal dependencies",
      "Regularization: Dropout layer (0.3) to randomly deactivate 30% of nodes",
      "Classification head: Dense layer with nodes equal to Vocabulary Size",
      "Activation: Softmax to transform outputs into a probability distribution"
    ],
    notes: "The neural network is built with a 128-cell LSTM layer, which acts as the model's memory. We apply a 30% Dropout rate for regularization, and feed the output into a softmax activation layer for predicting vocabulary classes."
  },
  {
    title: "Music Generation Engine",
    bullets: [
      "Seed Sequence: A startup sequence of 16 notes is fed into the model",
      "Sliding Window Inference:",
      "  1. Normalize current 16-note pattern",
      "  2. Model predicts next note probability distribution",
      "  3. Sample next note using Temperature formula",
      "  4. Append predicted note, shift history window, repeat",
      "Conversion: Translate string array back to music21 Stream and write to 'output.mid'"
    ],
    notes: "Generation works recursively. We supply a seed melody of 16 notes. The model guesses note 17. We append note 17, drop note 1, and repeat this process 50 times to construct a full 50-note original melody."
  },
  {
    title: "Key Results & Conclusion",
    bullets: [
      "Successfully built a self-contained local Python music pipeline",
      "Successfully trained an LSTM model with smooth training loss decay",
      "Autonomous melody creation outputs highly harmonious and creative compositions",
      "Internship project provides strong foundational proof-of-concept for AI in creative arts"
    ],
    notes: "In conclusion, our project met all of its internship milestones. We created a fully working pipeline that trains locally on any computer, proves the effectiveness of LSTMs in pattern recognition, and delivers original playable MIDI audio."
  }
];
