const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1800000 } // 30 minutos
}));

// Configuração de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dados simulados
let usuarios = [];
let mensagens = [];

// Rotas
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/menu');
  } else {
    res.render('login');
  }
});

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    // Simulação de usuário único
    if (email === 'admin@admin.com' && senha === '1234') {
        req.session.loggedIn = true;
        req.cookies.lastAccess = new Date();
        res.redirect('/menu');
    } else {
        res.send('Credenciais inválidas. <a href="/">Voltar</a>');
    }
});


app.get('/menu', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }

    const lastAccess = req.cookies.lastAccess || 'Primeiro acesso';
    res.render('menu', { lastAccess });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/cadastroUsuario.html', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('cadastroUsuario', { usuarios });
});

app.post('/cadastrarUsuario', (req, res) => {
    const { nome, dataNascimento, nickname } = req.body;

    if (!nome || !dataNascimento || !nickname) {
        return res.send('Todos os campos são obrigatórios. <a href="/cadastroUsuario.html">Tente novamente</a>');
    }

    usuarios.push({ nome, dataNascimento, nickname });
    res.redirect('/cadastroUsuario.html');
});

app.get('/batepapo', (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/');
    }
    res.render('batepapo', { usuarios, mensagens });
});

app.post('/postarMensagem', (req, res) => {
    const { usuario, conteudo } = req.body;

    // Validação dos dados
    if (!usuario || !conteudo) {
        return res.send(
            'Preencha todos os campos. <a href="/batepapo">Voltar</a>'
        );
    }

    // Adicionar mensagem à lista com data e hora atual
    const dataHora = new Date().toLocaleString('pt-BR');
    mensagens.push({ usuario, conteudo, dataHora });

    // Redirecionar para atualizar a página
    res.redirect('/batepapo');
});

const usuariosPath = path.join(__dirname, 'data/usuarios.json');
const mensagensPath = path.join(__dirname, 'data/mensagens.json');

// Carregar dados ao iniciar o servidor
usuarios = JSON.parse(fs.readFileSync(usuariosPath, 'utf-8'));
mensagens = JSON.parse(fs.readFileSync(mensagensPath, 'utf-8'));


app.post('/cadastrarUsuario', (req, res) => {
    const { nome, dataNascimento, nickname } = req.body;

    if (!nome || !dataNascimento || !nickname) {
        return res.send('Todos os campos são obrigatórios. <a href="/cadastroUsuario.html">Tente novamente</a>');
    }

    usuarios.push({ nome, dataNascimento, nickname });

    // Salvar no arquivo JSON
    fs.writeFileSync(usuariosPath, JSON.stringify(usuarios, null, 2));

    res.redirect('/cadastroUsuario.html');
});


app.post('/postarMensagem', (req, res) => {
    const { usuario, conteudo } = req.body;

    if (!usuario || !conteudo) {
        return res.send('Preencha todos os campos. <a href="/batepapo">Voltar</a>');
    }

    const dataHora = new Date().toLocaleString('pt-BR');
    mensagens.push({ usuario, conteudo, dataHora });

    // Salvar no arquivo JSON
    fs.writeFileSync(mensagensPath, JSON.stringify(mensagens, null, 2));

    res.redirect('/batepapo');
});
