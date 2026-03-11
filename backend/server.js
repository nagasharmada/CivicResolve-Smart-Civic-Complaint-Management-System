require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

const runEscalation = require("./src/escalation");

setInterval(runEscalation, 60000); // every 1 minute

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});