import "dotenv/config";
import express from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

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

		//GET /questions
		app.get("/questions", async (req, res) => {
			try {
				const quizDb = client.db("quiz");
				const questionsCollection = quizDb.collection("questions");

				const questions = await questionsCollection.find().toArray();

				res.send(questions);
			} catch (err) {
				console.error(err);
				res.status(500).send("Server error");
			}
		});

		app.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});
	} catch (err) {
		console.error(err);
		process.exit(1);
	}

	//POST /submit-quiz
	app.post("/submit-quiz", async (req, res) => {
		try {
			const quizDb = client.db("ranking");
			const rankingCollection = quizDb.collection("leaderboard");

			const { userName, score, timeTaken } = req.body;

			await rankingCollection.insertOne({
				userName,
				score,
				timeTaken,
			});

			res.send({ message: "Saved" });
		} catch (err) {
			console.error(err);
			res.status(500).send("Server error");
		}
	});

	//GET /leaderboard
	app.get("/leaderboard", async (req, res) => {
		try {
			const quizDb = client.db("ranking");
			const rankingCollection = quizDb.collection("leaderboard");

			const top10 = await rankingCollection
				.find()
				//Highest score first, fastest time wins ties
				.sort({ score: -1, timeTaken: 1 })
				.limit(10)
				.toArray();

			res.send(top10);
		} catch (err) {
			console.error(err);
			res.status(500).send("Server error");
		}
	});
}

startServer();
