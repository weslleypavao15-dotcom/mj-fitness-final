import app from "./app";

// O Render fornece a variável de ambiente PORT, caso contrário usamos a 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});