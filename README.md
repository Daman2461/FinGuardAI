# 💸 FinGuard AI - Smart Invoice Validator

> **Secure | Transparent | Fast**  
> End-to-end AI-powered invoice extraction, risk assessment, and logging using Mistral-7B and React.

## 🚀 Features

- **Smart Invoice Processing**: Extract structured data from invoices using Mistral AI
- **Risk Assessment**: AI-powered fraud detection and risk analysis
- **Action Logging**: Blockchain-style hash logging for audit trails
- **Modern UI**: Beautiful and responsive React interface with Material-UI
- **Secure**: End-to-end processing with no data persistence

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Material-UI
- **Backend**: Flask
- **AI/ML**: Mistral-7B-Instruct
- **Data Handling**: Pandas

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Poetry (Python package manager)
- Mistral AI API key

### Installing Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

## 🚀 Setup & Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/finguardai.git
cd finguardai
```

2. Install backend dependencies using Poetry:
```bash
poetry install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Create a `.env` file in the root directory:
```bash
MISTRAL_API_KEY=your_api_key_here
```

## 🏃‍♂️ Running the Application

1. Start the backend server:
```bash
poetry run python -m finguardai.api
```

2. In a new terminal, start the React frontend:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 📝 Usage

1. Upload an invoice (PDF or image)
2. View real-time processing status
3. See extracted data, risk assessment, and action hash
4. Download or share results as needed

## 🔒 Security

- No invoice data is stored permanently
- All processing happens in memory
- Action hashes provide immutable audit trails
- Secure API key handling
- CORS protection enabled

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Mistral AI for the powerful language model
- React and Material-UI for the amazing frontend framework
- The open-source community for various tools and libraries
