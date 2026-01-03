import "dotenv/config";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";

const app = express();
const port = 3000;
app.use(express.json());

const uri = process.env.mongoUrl;
if (!uri) {
    throw new Error("mongoUrl is not defined in environment variables");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function startServer() {
    try {
        await client.connect();

        // GET /questions
        app.get("/questions", async (req, res) => {
            try {
                const quizDb = client.db("quiz");
                const questionsCollection = quizDb.collection("questions");

                const questions = await questionsCollection.find().toArray();

                res.send(questions);
            } catch (err) {
                console.error(err);
                res.send("Server error");
            }
        });

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();
