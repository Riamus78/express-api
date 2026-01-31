import { env } from "../env.js";
import app from "./server.js";

app.listen(env.PORT, () => {
  console.log(`server is running on ${env.PORT}`);
});
