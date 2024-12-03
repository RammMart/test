let currentSequence = [];
let sequenceLength = 2;
let mistakes = 0;
let isPlaying = false;
let maxSequenceReached = 0;
let totalCorrect = 0;
let totalAttempts = 0;
let isRunning = false;
let timeoutId = null; // Variable para rastrear el timeout activo

const display = document.getElementById('display');
const startButton = document.getElementById('startButton');
const inputSection = document.getElementById('inputSection');
const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');
const results = document.getElementById('results');

function generateSequence(length) {
    const numbers = Array.from({length: 9}, (_, i) => i + 1); // Array del 1 al 9
    let sequence = [];
    
    // Mezclar el array de números
    for (let i = 0; i < length; i++) {
        if (numbers.length === 0) {
            // Si nos quedamos sin números, regenerar el array
            numbers.push(...Array.from({length: 9}, (_, i) => i + 1));
        }
        const randomIndex = Math.floor(Math.random() * numbers.length);
        sequence.push(numbers[randomIndex]);
        numbers.splice(randomIndex, 1); // Eliminar el número usado
    }
    
    return sequence;
}

async function displayDigit(digit) {
    return new Promise(resolve => {
        // Mostrar el dígito
        display.textContent = digit;
        
        // Después de 1000ms, limpiar el display
        timeoutId = setTimeout(() => {
            display.textContent = '';
            
            // Después de 500ms adicionales (intervalo), resolver la promesa
            timeoutId = setTimeout(resolve, 500);
        }, 1000);
    });
}

async function showSequence(sequence) {
    display.style.visibility = 'visible';
    inputSection.style.display = 'none';
    
    // Mostrar mensaje de "Preparado..."
    display.textContent = "Preparado...";
    timeoutId = setTimeout(async () => {
        display.textContent = '';
        timeoutId = setTimeout(async () => {
            // Mostrar cada dígito en secuencia
            for (const digit of sequence) {
                if (!isRunning) return; // Detener si se interrumpe
                await displayDigit(digit);
            }
            
            // Mostrar el input
            if (isRunning) {
                display.style.visibility = 'hidden';
                inputSection.style.display = 'block';
                userInput.value = '';
                userInput.focus();
            }
        }, 500);
    }, 1000);
}

function checkAnswer(input, sequence) {
    const userSequence = input.split('').map(Number);
    return JSON.stringify(userSequence) === JSON.stringify(sequence);
}

function endGame() {
    isPlaying = false;
    isRunning = false;
    
    // Guardar resultados con todos los datos necesarios
    const testResults = {
        maxLevel: maxSequenceReached,
        correctSequences: totalCorrect,
        totalAttempts: totalAttempts,
        mistakes: mistakes,
        finalSequenceLength: sequenceLength - 1
    };
    
    // Guardar en ResultsManager
    ResultsManager.saveTestResult('digits', testResults);

    // Asegurar que el contenedor de resultados esté visible
    display.style.visibility = 'hidden';
    inputSection.style.display = 'none';
    
    // Mostrar resultados con todos los detalles
    results.style.display = 'block';
    results.innerHTML = `
        <div class="results-content">
            <h2>Resultados del Test de Dígitos</h2>
            <p>Nivel máximo alcanzado: ${maxSequenceReached} dígitos</p>
            <p>Secuencias correctas: ${totalCorrect} de ${totalAttempts} intentos</p>
            <p>Errores cometidos: ${mistakes}</p>
            <p>Longitud final de la secuencia: ${sequenceLength - 1} dígitos</p>
            <div class="button-container">
                <button onclick="location.href='index.html'" class="back-button">Volver al menú principal</button>
                <button onclick="location.href='results.html'" class="results-button">Ver todos los resultados</button>
            </div>
        </div>
    `;
    
    // Añadir la clase visible después de establecer el contenido
    setTimeout(() => {
        results.classList.add('visible');
    }, 0);

    // Mostrar elementos de nuevo
    startButton.style.display = 'block';
    startButton.textContent = 'Jugar de nuevo';
    document.querySelector('.instructions').style.display = 'block';
    document.querySelector('h1').style.display = 'block';
}

function startNewRound() {
    currentSequence = generateSequence(sequenceLength);
    userInput.value = '';
    showSequence(currentSequence);
    totalAttempts++;
}

function interruptTest() {
    if (!isRunning) return;
    
    isRunning = false;
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
    
    // Limpiar la pantalla y estado
    display.textContent = '';
    display.style.visibility = 'hidden';
    inputSection.style.display = 'none';
    userInput.value = '';
    submitButton.style.display = 'none';
    
    // Mostrar mensaje de interrupción
    results.innerHTML = '<h2>Prueba interrumpida</h2><p>La prueba ha sido interrumpida. Pulse el botón para comenzar de nuevo.</p>';
    results.style.display = 'block';
    
    // Reiniciar variables
    currentSequence = [];
    sequenceLength = 2;
    mistakes = 0;
    maxSequenceReached = 0;
    totalCorrect = 0;
    totalAttempts = 0;
    
    // Mostrar botón de inicio
    startButton.style.display = 'block';
    startButton.textContent = 'Comenzar de nuevo';
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        interruptTest();
    }
});

startButton.addEventListener('click', () => {
    if (!isPlaying) {
        isPlaying = true;
        sequenceLength = 2;
        mistakes = 0;
        maxSequenceReached = 0;
        totalCorrect = 0;
        totalAttempts = 0;
        
        // Ocultar resultados y otros elementos
        results.style.display = 'none';
        results.classList.remove('visible');
        startButton.style.display = 'none';
        
        // Ocultar elementos excepto el botón de regreso
        document.querySelector('.instructions').style.display = 'none';
        document.querySelector('h1').style.display = 'none';
        
        // Mostrar el display para los dígitos
        display.style.visibility = 'visible';
        
        isRunning = true;
        startNewRound();
    }
});

submitButton.addEventListener('click', () => {
    if (!isPlaying) return;

    const isCorrect = checkAnswer(userInput.value, currentSequence);
    inputSection.style.display = 'none';

    if (isCorrect) {
        // Actualizar maxSequenceReached solo si es mayor que el valor actual
        maxSequenceReached = Math.max(maxSequenceReached, sequenceLength);
        totalCorrect++;
        sequenceLength++;
        startNewRound();
    } else {
        mistakes++;
        if (mistakes >= 2) {
            // Asegurar que maxSequenceReached refleje el nivel más alto alcanzado
            maxSequenceReached = Math.max(maxSequenceReached, sequenceLength - 1);
            endGame();
        } else {
            startNewRound(); // Intentar de nuevo con la misma longitud
        }
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitButton.click();
    }
});

// Agregar estilos dinámicos para los resultados
const style = document.createElement('style');
style.textContent = `
    .back-button {
        display: block !important;
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        text-decoration: none;
    }
    .back-button:hover {
        background-color: #45a049;
    }
    .button-container {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
    }
    .results-button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
    }
    .results-button:hover {
        background-color: #45a049;
    }
`;
document.head.appendChild(style);
