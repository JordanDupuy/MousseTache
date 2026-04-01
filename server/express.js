const express = require('express');
const cors = require('cors');
const app = express();
const port = 3111;

app.use(cors());
app.use(express.json());

// Routes existantes
app.use('/tasks', require('./routes/tasks.routes'));

// ✅ NOUVEAU: Routes statistiques
app.use('/api/stats', require('./routes/stats.routes'));

// ✅ NOUVEAU: Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});

app.get('/', (req, res) => {
  res.send('API Task Manager operational !');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;