import dotenv from "dotenv";
import { httpServer } from "./app.js";
import { connectDb }  from "./db/index.js";

dotenv.config({
    path:"./.env"
})

const majorNodeVersion = 15
const startServer = () => {
  httpServer.listen(process.env.PORT || 8080, () => {
    console.info(
      `📑 Visit the documentation at: http://localhost:${
        process.env.PORT || 8080
      }`
    );
    console.log("⚙️  Server is running on port: " + process.env.PORT);
  });
};

if (majorNodeVersion > 14) {
  try {
    await connectDb();
    startServer();
  } catch (err) {
    console.log("Mongo db connect error: ", err);
  }
} else {
  connectDb()
    .then(() => {
      startServer();
    })
    .catch((err) => {
      console.log("Mongo db connect error: ", err);
    });
}
