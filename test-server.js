// Teste simples do servidor
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;

// Servir arquivos estáticos do dist/public
app.use(express.static(path.join(__dirname, 'dist/public')));

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de teste rodando em http://localhost:${PORT}`);
});