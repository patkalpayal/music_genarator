export interface PythonFile {
  name: string;
  description: string;
  content: string;
}

export const pythonCodebase: PythonFile[] = [
  {
    name: "requirements.txt",
    description: "Defines the required Python library versions for this project.",
    content: `# Requirements file for AI Music Generation Internship Project
# Installs music21 for parsing, creating, and exporting MIDI/music files
music21>=9.1.0
# Installs TensorFlow/Keras for building, compiling, and training the LSTM neural network
tensorflow>=2.15.0
# Installs NumPy for mathematical array operations and data restructuring
numpy>=1.23.5
`
  },
  {
    name: "midi_generator.py",
    description: "Self-contained script to generate a rich MIDI dataset of simple classical and folk melodies locally.",
    content: `import os  # Standard library to interact with operating system and directories
from music21 import stream, note, chord, midi  # Import key components from music21 library

# Create a dataset directory if it doesn't already exist to store generated MIDI files
os.makedirs("dataset", exist_ok=True)

# Define 5 simple melodies with pitches and durations to create a self-contained dataset
melodies = {
    # 1. Twinkle Twinkle Little Star
    "twinkle": [
        ("C4", 1.0), ("C4", 1.0), ("G4", 1.0), ("G4", 1.0), ("A4", 1.0), ("A4", 1.0), ("G4", 2.0),
        ("F4", 1.0), ("F4", 1.0), ("E4", 1.0), ("E4", 1.0), ("D4", 1.0), ("D4", 1.0), ("C4", 2.0),
        ("G4", 1.0), ("G4", 1.0), ("F4", 1.0), ("F4", 1.0), ("E4", 1.0), ("E4", 1.0), ("D4", 2.0),
        ("G4", 1.0), ("G4", 1.0), ("F4", 1.0), ("F4", 1.0), ("E4", 1.0), ("E4", 1.0), ("D4", 2.0),
        ("C4", 1.0), ("C4", 1.0), ("G4", 1.0), ("G4", 1.0), ("A4", 1.0), ("A4", 1.0), ("G4", 2.0),
        ("F4", 1.0), ("F4", 1.0), ("E4", 1.0), ("E4", 1.0), ("D4", 1.0), ("D4", 1.0), ("C4", 2.0)
    ],
    # 2. Ode to Joy (Beethoven's 9th Symphony Theme)
    "ode_to_joy": [
        ("E4", 1.0), ("E4", 1.0), ("F4", 1.0), ("G4", 1.0), ("G4", 1.0), ("F4", 1.0), ("E4", 1.0), ("D4", 1.0),
        ("C4", 1.0), ("C4", 1.0), ("D4", 1.0), ("E4", 1.0), ("E4", 1.5), ("D4", 0.5), ("D4", 2.0),
        ("E4", 1.0), ("E4", 1.0), ("F4", 1.0), ("G4", 1.0), ("G4", 1.0), ("F4", 1.0), ("E4", 1.0), ("D4", 1.0),
        ("C4", 1.0), ("C4", 1.0), ("D4", 1.0), ("E4", 1.0), ("D4", 1.5), ("C4", 0.5), ("C4", 2.0),
        ("D4", 1.0), ("D4", 1.0), ("E4", 1.0), ("C4", 1.0), ("D4", 1.0), ("E4", 0.5), ("F4", 0.5), ("E4", 1.0), ("C4", 1.0),
        ("D4", 1.0), ("E4", 0.5), ("F4", 0.5), ("E4", 1.0), ("D4", 1.0), ("C4", 1.0), ("D4", 1.0), ("G3", 2.0),
        ("E4", 1.0), ("E4", 1.0), ("F4", 1.0), ("G4", 1.0), ("G4", 1.0), ("F4", 1.0), ("E4", 1.0), ("D4", 1.0),
        ("C4", 1.0), ("C4", 1.0), ("D4", 1.0), ("E4", 1.0), ("D4", 1.5), ("C4", 0.5), ("C4", 2.0)
    ],
    # 3. Frere Jacques (Brother John) - Includes some Chords!
    "frere_jacques": [
        ("C4", 1.0), ("D4", 1.0), ("E4", 1.0), ("C4", 1.0),
        ("C4", 1.0), ("D4", 1.0), ("E4", 1.0), ("C4", 1.0),
        ("E4", 1.0), ("F4", 1.0), ("G4", 2.0),
        ("E4", 1.0), ("F4", 1.0), ("G4", 2.0),
        ("G4", 0.5), ("A4", 0.5), ("G4", 0.5), ("F4", 0.5), ("E4", 1.0), ("C4", 1.0),
        ("G4", 0.5), ("A4", 0.5), ("G4", 0.5), ("F4", 0.5), ("E4", 1.0), ("C4", 1.0),
        ("C4", 1.0), ("G3", 1.0), ("C4", 2.0),
        ("C4", 1.0), ("G3", 1.0), ("C4", 2.0)
    ],
    # 4. Happy Birthday Theme
    "happy_birthday": [
        ("G4", 0.5), ("G4", 0.5), ("A4", 1.0), ("G4", 1.0), ("C5", 1.0), ("B4", 2.0),
        ("G4", 0.5), ("G4", 0.5), ("A4", 1.0), ("G4", 1.0), ("D5", 1.0), ("C5", 2.0),
        ("G4", 0.5), ("G4", 0.5), ("G5", 1.0), ("E5", 1.0), ("C5", 1.0), ("B4", 1.0), ("A4", 2.0),
        ("F5", 0.5), ("F5", 0.5), ("E5", 1.0), ("C5", 1.0), ("D5", 1.0), ("C5", 2.0)
    ],
    # 5. Major Arpeggios & Chords progression
    "harmony_arpeggio": [
        ("C4.E4.G4", 2.0), ("C4", 0.5), ("E4", 0.5), ("G4", 0.5), ("C5", 0.5),
        ("F4.A4.C5", 2.0), ("F4", 0.5), ("A4", 0.5), ("C5", 0.5), ("F5", 0.5),
        ("G4.B4.D5", 2.0), ("G4", 0.5), ("B4", 0.5), ("D5", 0.5), ("G5", 0.5),
        ("C4.E4.G4.C5", 4.0)
    ]
}

# Iterate through each defined melody and save it as a MIDI file in the dataset directory
for name, notes_data in melodies.items():
    # Instantiate a music21 Stream stream container
    melody_stream = stream.Stream()
    
    # Process each note/chord tuple in the melody list
    for pitch, duration in notes_data:
        # Check if the element contains a period '.', indicating a chord (multiple simultaneous pitches)
        if "." in pitch:
            # Split the string by period and instantiate a music21 Chord object with these notes
            music_element = chord.Chord(pitch.split("."))
        else:
            # Instantiate a single music21 Note object with the corresponding pitch string
            music_element = note.Note(pitch)
            
        # Set the duration of the note/chord in quarter notes
        music_element.quarterLength = duration
        # Append the note or chord to the stream container
        melody_stream.append(music_element)
        
    # Set the destination MIDI path inside our dataset folder
    file_path = os.path.join("dataset", f"{name}.mid")
    # Convert stream to a standard MIDI file representation
    midi_file = midi.translate.streamToMidiFile(melody_stream)
    # Write the bytes of the MIDI file physically to the storage disk
    midi_file.open(file_path, "wb")
    midi_file.write()
    midi_file.close()
    
    # Print a progress log to console confirming the successful file generation
    print(f"Successfully generated dataset file: {file_path}")

print("MIDI Dataset Generation Completed!")
`
  },
  {
    name: "preprocess.py",
    description: "Extracts notes and chords from MIDI files and formats them into sequences for LSTM training.",
    content: `import os  # Interact with the operating system and manage directory structures
import glob  # Match file patterns easily (used to find all .mid files in dataset)
import json  # Save note mappings into a JSON structure for later decoding in generation
import numpy as np  # Handle multidimensional arrays and math transformations
from music21 import converter, instrument, note, chord  # Parse midi files and extract musical symbols

def extract_musical_elements(dataset_path):
    """
    Parses all MIDI files in dataset_path, extracting pitches of notes and chords.
    """
    elements = []  # Initialize an empty list to store all chronological note/chord strings
    
    # Locate all .mid files in the dataset folder recursively
    midi_files = glob.glob(os.path.join(dataset_path, "*.mid"))
    
    if not midi_files:
        raise ValueError("No MIDI files found in dataset! Please run midi_generator.py first.")
        
    # Iterate through each found midi file
    for file in midi_files:
        print(f"Processing MIDI File: {file}")  # Log current progress to console
        try:
            # Parse the MIDI file into a music21 Score structure
            midi_data = converter.parse(file)
            
            # Extract all instrument parts or individual stream components from the file
            elements_to_parse = midi_data.flat.notes
            
            # Iterate through each parsed musical object (notes or chords)
            for element in elements_to_parse:
                # Case 1: If the element is a single independent Note
                if isinstance(element, note.Note):
                    # Append its pitch name (e.g. 'C4', 'F#3') to the main array
                    elements.append(str(element.pitch))
                # Case 2: If the element is a Chord (multiple overlapping notes)
                elif isinstance(element, chord.Chord):
                    # Join individual pitch names of the chord with a dot (e.g. 'C4.E4.G4')
                    elements.append(".".join(str(n) for n in element.normalOrder))
        except Exception as e:
            # Handle and log corrupted MIDI files safely without crashing the training script
            print(f"Error parsing {file}: {e}")
            
    return elements  # Return the list containing all extracted music entities

def prepare_sequences(elements, sequence_length):
    """
    Maps music strings to integers and structures inputs (sequences) and targets (next elements) for LSTM.
    """
    # Create a sorted list of unique notes/chords to form our vocabulary
    vocab = sorted(list(set(elements)))
    vocab_size = len(vocab)  # Store size of the vocabulary (output classification categories)
    
    # Create a dictionary mapping each unique note string to a unique integer index
    note_to_int = {note_str: idx for idx, note_str in enumerate(vocab)}
    
    # Save mapping and vocabulary size for the generator script to use
    mapping_data = {
        "note_to_int": note_to_int,
        "vocab": vocab
    }
    with open("mapping.json", "w") as f:
        json.dump(mapping_data, f, indent=4)  # Save mapping physically as a JSON file
        
    network_input = []  # Initialize list to hold sequence inputs
    network_output = []  # Initialize list to hold next-note targets
    
    # Loop through musical elements to build fixed-length history blocks and targets
    for i in range(len(elements) - sequence_length):
        # Slice elements of length 'sequence_length' as training input
        seq_in = elements[i : i + sequence_length]
        # Get the immediate next element as training output/ground truth label
        seq_out = elements[i + sequence_length]
        
        # Convert strings to integers and append to the training buffers
        network_input.append([note_to_int[char] for char in seq_in])
        network_output.append(note_to_int[seq_out])
        
    n_patterns = len(network_input)  # Number of sequences generated
    
    # Reshape input to conform with LSTM requirements: [samples, time_steps, features]
    X = np.reshape(network_input, (n_patterns, sequence_length, 1))
    
    # Normalize input features into the range [0, 1] for stable neural networks training
    X = X / float(vocab_size)
    
    # Convert numerical target labels directly to one-hot encoded matrix
    from tensorflow.keras.utils import to_categorical  # Utility to convert integers to categorical vector
    y = to_categorical(network_output, num_classes=vocab_size)
    
    return X, y, vocab_size, vocab

if __name__ == "__main__":
    # Test execution
    notes = extract_musical_elements("dataset")  # Run note extractor on the dataset directory
    print(f"Total music elements parsed: {len(notes)}")  # Output total processed tokens count
    X, y, v_size, vocab = prepare_sequences(notes, sequence_length=16)  # Prepare arrays with history step=16
    print(f"Shape of X: {X.shape}, Shape of y: {y.shape}")  # Log multidimensional shapes of datasets
`
  },
  {
    name: "model.py",
    description: "Defines the LSTM Neural Network architecture using TensorFlow/Keras.",
    content: `from tensorflow.keras.models import Sequential  # Import the standard sequential API container
from tensorflow.keras.layers import LSTM, Dense, Dropout, Activation  # Import required core network layers

def create_lstm_model(input_shape, vocab_size):
    """
    Constructs a lightweight, beginner-friendly LSTM model for music note prediction.
    """
    model = Sequential()  # Instantiate a Sequential layer container
    
    # 1. Add the main LSTM layer to process temporal notes sequence
    model.add(LSTM(
        units=128,  # Number of LSTM memory cells/units (higher means more pattern memory)
        input_shape=input_shape,  # Shape of input feature block: (sequence_length, 1)
        return_sequences=False  # Returns only the final temporal step output, not full history
    ))
    
    # 2. Add a Dropout layer to randomly disable 30% of neurons to prevent overfitting/memorization
    model.add(Dropout(0.3))
    
    # 3. Add a Dense fully connected classification layer
    # Outputs a list of probabilities corresponding to every note in our vocabulary size
    model.add(Dense(vocab_size))
    
    # 4. Add a Softmax activation layer
    # Normalizes all output logs to fit a strict probability distribution summing exactly to 1.0
    model.add(Activation("softmax"))
    
    # Compile the model specifying optimization, loss function, and metrics
    model.compile(
        loss="categorical_crossentropy",  # Perfect loss criteria for multi-class categorization
        optimizer="adam",  # Highly popular and robust adaptive learning-rate optimizer
        metrics=["accuracy"]  # Metric to evaluate training correctness percentage
    )
    
    return model  # Return the fully structured, compiled model instance
`
  },
  {
    name: "train.py",
    description: "Orchestrates the entire training pipeline: pre-processing data, creating model, fitting data, and saving.",
    content: `import os  # Access directories and manipulate relative paths
from preprocess import extract_musical_elements, prepare_sequences  # Import our pre-processing utilities
from model import create_lstm_model  # Import our LSTM architecture definition

def main():
    # 1. Define hyper-parameters for training configuration
    SEQUENCE_LENGTH = 16  # How many previous notes/chords the LSTM will analyze to guess the next
    EPOCHS = 30  # Total iterations through full training dataset
    BATCH_SIZE = 16  # Group size of sequences fed to model before weight updates occur
    
    # 2. Extract and parse notes from MIDI files in dataset
    print("Step 1: Extracting musical notes and chords from dataset...")
    notes = extract_musical_elements("dataset")
    
    # 3. Preprocess notes into multi-dimensional normalized float matrices
    print("Step 2: Structuring data into training sequences...")
    X, y, vocab_size, vocab = prepare_sequences(notes, SEQUENCE_LENGTH)
    
    # 4. Initialize and compile our LSTM model
    print("Step 3: Creating and compiling the LSTM Deep Learning model...")
    input_shape = (X.shape[1], X.shape[2])  # Compute input dimensions: (16, 1)
    model = create_lstm_model(input_shape, vocab_size)
    
    # Print a textual summary of layers, parameters, and nodes inside model
    model.summary()
    
    # 5. Fit the model (train weights using the training inputs and targets)
    print("Step 4: Starting model training process...")
    history = model.fit(
        X, y,  # Input sequences and one-hot ground-truth targets
        epochs=EPOCHS,  # Iteration limits
        batch_size=BATCH_SIZE,  # Sequence batch groupings
        shuffle=True,  # Shuffle sequences dynamically at start of each epoch to improve learning
        verbose=1  # Output training progress bars and live training loss logs to standard out
    )
    
    # 6. Save the trained neural weights to disk
    model_save_path = "music_generator_model.h5"  # Target H5 file name
    model.save(model_save_path)  # Export compiled structure and weights
    print(f"Step 5: Training completed successfully! Model weights saved at: {model_save_path}")

if __name__ == "__main__":
    main()  # Run the core orchestrator script
`
  },
  {
    name: "generate.py",
    description: "Uses the trained LSTM model to creatively generate a new melody and save it as output.mid.",
    content: `import json  # Load character-to-integer mappings from disk
import numpy as np  # Manipulate arrays, normalization, and predictions
from tensorflow.keras.models import load_model  # Load saved H5 model structure and weights
from music21 import stream, note, chord  # Convert generated notes strings back to audio files

def sample_with_temperature(preds, temperature=1.0):
    """
    Helper function to sample an index from a probability array.
    Adds creative variance (temperature) to generated notes to avoid repetitive loops.
    """
    preds = np.asarray(preds).astype("float64")  # Convert predictions array to float64
    preds = np.log(preds + 1e-7) / temperature  # Divide prediction logits by temperature value
    exp_preds = np.exp(preds)  # Run exponential to remove negative values
    preds = exp_preds / np.sum(exp_preds)  # Re-normalize array to sum to 1.0
    probas = np.random.multinomial(1, preds, 1)  # Conduct a multinomial distribution roll
    return np.argmax(probas)  # Return index of the winning note category

def generate_melody(model_path, mapping_path, num_notes_to_generate=50, temperature=1.0):
    """
    Orchestrates the music generation process step-by-step using seed sequences.
    """
    # 1. Load the pre-processed vocabulary mappings file
    with open(mapping_path, "r") as f:
        mapping_data = json.load(f)
    
    note_to_int = mapping_data["note_to_int"]  # Fetch the string-to-integer dictionary map
    vocab = mapping_data["vocab"]  # Fetch unique notes ordered array
    vocab_size = len(vocab)  # Store size of musical notes vocab
    
    # Create the reverse dictionary mapping integers back to string notes
    int_to_note = {idx: note_str for note_str, idx in note_to_int.items()}
    
    # 2. Load our pre-trained Keras sequential model
    model = load_model(model_path)
    
    # Extract the sequence length required by the model from its input shape
    sequence_length = model.input_shape[1]  # Get sequence dimension, e.g., 16
    
    # 3. Create a starting seed sequence (simple repeating pitches or scales)
    print("Generating seed sequence for the melody...")
    # Select C major scale elements as seed sequence
    seed = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]
    # Ensure seed is truncated/extended to match exact expected sequence length
    seed = seed[:sequence_length]
    
    # Translate seed strings into matching index values
    pattern = [note_to_int[n] if n in note_to_int else 0 for n in seed]
    
    generated_elements = []  # Initialize list to hold generated notes/chords strings
    
    print("Generating music notes step-by-step with LSTM...")
    # Loop to generate notes sequentially one-by-one
    for note_index in range(num_notes_to_generate):
        # Format the seed integer pattern as normalized float array
        prediction_input = np.reshape(pattern, (1, len(pattern), 1))
        prediction_input = prediction_input / float(vocab_size)  # Normalize
        
        # Query model to predict probability weights for the immediate next note
        prediction = model.predict(prediction_input, verbose=0)[0]
        
        # Sample next index using temperature function to prevent boring loops
        next_index = sample_with_temperature(prediction, temperature)
        
        # Translate the numerical prediction index back into pitch character string
        next_note = int_to_note[next_index]
        
        # Append generated note string to the growing melody list
        generated_elements.append(next_note)
        
        # Slide pattern history window: append new index and discard oldest index
        pattern.append(next_index)
        pattern = pattern[1:]  # Maintain exact fixed length
        
    return generated_elements  # Return the full list of sequential generated notes

def save_melody_to_midi(generated_elements, output_filename="output.mid"):
    """
    Converts list of note/chord string characters back into playable binary .mid files.
    """
    melody_stream = stream.Stream()  # Instantiate music21 Stream container
    
    # Loop through each generated note string
    for element in generated_elements:
        # Check if the string element represents a chord (contains a dot separator)
        if "." in element:
            # Parse individual pitches of the chord string
            notes_in_chord = element.split(".")
            chord_notes = []
            for current_note in notes_in_chord:
                # Instantiate single music21 Note objects for chord members
                new_note = note.Note(int(current_note)) # music21 Normal order numbers or pitches
                chord_notes.append(new_note)
            # Create Chord instance with individual notes group
            new_element = chord.Chord(chord_notes)
        else:
            # Create a single Note instance with the pitch name
            new_element = note.Note(element)
            
        # Assign fixed beautiful duration for each note in quarter notes
        new_element.quarterLength = 0.5  # Eighth note duration for a snappy rhythm
        
        # Append note/chord container into our active music stream
        melody_stream.append(new_element)
        
    # Write the compiled stream container to local storage as binary MIDI file
    melody_stream.write("midi", fp=output_filename)
    print(f"Melody successfully exported as playable midi at: {output_filename}")

if __name__ == "__main__":
    try:
        # Generate melody sequence of 50 notes
        melody = generate_melody("music_generator_model.h5", "mapping.json", num_notes_to_generate=50, temperature=0.8)
        print("Generated Sequence:", melody)
        # Convert generated sequence to MIDI and save to local disk as output.mid
        save_melody_to_midi(melody, "output.mid")
    except Exception as e:
        print("Generation failed:", e)
        print("Please ensure you run midi_generator.py and train.py first to create model and mapping.json!")
`
  }
];
