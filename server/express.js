const express = require('express');
const cors = require('cors');
const app = express();
const port = 3111;

app.use(cors());
app.use(express.json()); // Important !
app.use('/tasks', require('./routes/tasks.routes'));

app.get('/', (req, res) => {
  res.send('API Task Manager operational !');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
