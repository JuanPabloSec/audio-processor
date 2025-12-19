# Audio Processor

Aplikacja webowa do obróbki audio z funkcjami:
- 🎵 Separacja wokalu od instrumentów (Demucs)
- 🎹 Transpozycja tonacji (-12 do +12 półtonów)
- ⏱️ Zmiana tempa (0.5x - 2.0x)
- 🤖 Analiza AI przez Google Gemini

## Stack Technologiczny

### Backend
- Python 3.10+
- FastAPI
- Demucs (separacja audio)
- pyrubberband (pitch/tempo)
- librosa (analiza)
- Google Gemini API

### Frontend
- React 18
- TypeScript
- Vite
- WaveSurfer.js (wizualizacja)
- React Dropzone (upload)

## Instalacja i Uruchomienie

### Wymagania
- Python 3.10 lub nowszy
- Node.js 18 lub nowszy
- pip i npm
- (Opcjonalnie) NVIDIA GPU z CUDA dla szybszej separacji

### 1. Backend Setup

```bash
# Przejdź do katalogu backend
cd backend

# Utwórz środowisko wirtualne
python -m venv venv

# Aktywuj środowisko wirtualne
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Zainstaluj zależności
pip install -r requirements.txt

# Skopiuj przykładowy plik .env
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edytuj .env i dodaj swój Google API Key
# GOOGLE_API_KEY=your_api_key_here
```

### 2. Frontend Setup

```bash
# Przejdź do katalogu frontend
cd frontend

# Zainstaluj zależności
npm install

# Skopiuj przykładowy plik .env
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

### 3. Uruchomienie Aplikacji

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # lub source venv/bin/activate na Linux/Mac
python app/main.py
```

Backend będzie dostępny na: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend będzie dostępny na: http://localhost:3000

## Jak Używać Aplikacji

### 1. Upload Pliku MP3
1. Przeciągnij plik MP3 na obszar upload lub kliknij aby wybrać
2. Poczekaj na zakończenie uploadu
3. Zobaczysz waveform i podstawowe informacje o pliku

### 2. Separacja Źródeł Audio
1. Po załadowaniu pliku, kliknij "Separate Stems" w sekcji Source Separation
2. Obserwuj progress bar - separacja może zająć 2-10 minut w zależności od:
   - Długości utworu
   - Czy masz GPU (z GPU: 2-5 min, bez GPU: 5-15 min)
3. Po zakończeniu zobaczysz 4 separated tracks:
   - 🎤 **Vocals** - wokal
   - 🥁 **Drums** - perkusja
   - 🎸 **Bass** - bas
   - 🎹 **Other** - inne instrumenty
4. Możesz odtworzyć każdy track osobno lub pobrać jako MP3

### 3. Transpozycja i Zmiana Tempa (Coming Soon)
- Pitch Shift: przesuń slider aby zmienić tonację (-12 do +12 półtonów)
- Tempo Change: przesuń slider aby zmienić tempo (0.5x do 2.0x)

### 4. AI Metadata Analysis (Coming Soon)
- Kliknij "Analyze with AI" aby uzyskać informacje o gatunku, nastroju, instrumentach

## Struktura Projektu

```
audio-processor/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Konfiguracja
│   │   ├── api/
│   │   │   ├── routes/          # Endpointy API
│   │   │   └── schemas/         # Modele Pydantic
│   │   ├── services/            # Logika biznesowa
│   │   └── core/                # Utilities, security
│   ├── uploads/                 # Tymczasowe uploady
│   ├── processed/               # Przetworzone pliki
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/          # Komponenty React
    │   ├── hooks/               # Custom hooks
    │   ├── services/            # API calls
    │   └── types/               # TypeScript types
    └── package.json
```

## API Endpoints

### Upload
- ✅ `POST /api/upload` - Upload MP3 file
- ✅ `GET /api/files/{file_id}` - Get file info
- ✅ `GET /api/files/{file_id}/download` - Download file

### Audio Processing
- ✅ `POST /api/audio/separate` - Separate audio into stems (vocals, drums, bass, other)
- ✅ `GET /api/audio/download/{file_id}` - Download processed audio file
- 🚧 `POST /api/audio/transpose` - Transpose pitch (endpoint ready, service TBD)
- 🚧 `POST /api/audio/tempo` - Change tempo (endpoint ready, service TBD)

### Tasks
- ✅ `GET /api/tasks/{task_id}` - Get task status and progress
- ✅ `DELETE /api/tasks/{task_id}` - Cancel a running task

### Metadata (Coming in Phase 4)
- 🚧 `POST /api/metadata/analyze` - AI analysis with Gemini

## Fazy Rozwoju

### ✅ Faza 1: Fundament (UKOŃCZONA)
- Upload MP3 z drag & drop
- Podstawowe odtwarzanie
- Wizualizacja waveform z WaveSurfer.js
- Wyświetlanie metadanych pliku

### ✅ Faza 2: Separacja Audio (UKOŃCZONA)
- Integracja Demucs dla separacji źródeł
- Background tasks z TaskManager
- Real-time progress tracking
- Zarządzanie separated stems (vocals, drums, bass, other)
- Pobieranie poszczególnych ścieżek

### 🚧 Faza 3: Pitch & Tempo (W TRAKCIE)
- Transpozycja (endpoint gotowy, serwis do implementacji)
- Zmiana tempa (endpoint gotowy, serwis do implementacji)
- Preview/apply workflow

### 🚧 Faza 4: AI Metadata (PLANOWANA)
- Gemini integration
- Analiza gatunku, nastroju
- Detekcja instrumentów
- Generowanie opisów

### 🚧 Faza 5: Production (PLANOWANA)
- Celery + Redis dla robust task queue
- Auto cleanup starych plików
- Rate limiting
- Docker deployment
- Testy

## Konfiguracja

### Backend (.env)
```
GOOGLE_API_KEY=your_gemini_api_key_here
UPLOAD_DIR=./uploads
PROCESSED_DIR=./processed
MAX_FILE_SIZE_MB=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Rozwiązywanie Problemów

### Backend
**Problem: ModuleNotFoundError**
```bash
# Upewnij się, że środowisko wirtualne jest aktywne
# Zainstaluj ponownie zależności
pip install -r requirements.txt
```

**Problem: CUDA not available**
- Demucs użyje CPU (wolniejsze, ale działa)
- Dla GPU: zainstaluj CUDA i PyTorch z wsparciem CUDA

### Frontend
**Problem: Cannot find module**
```bash
# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules
npm install
```

**Problem: CORS errors**
- Upewnij się, że backend działa na porcie 8000
- Sprawdź konfigurację CORS w `backend/app/main.py`

## Licencja

MIT License

## Autor

Audio Processor - Built with FastAPI, React & AI
