const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.log("Error loading .env file:", result.error);
} else {
  console.log("Parsed Variables:", result.parsed);
}