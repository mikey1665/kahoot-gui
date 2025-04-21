const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Kahoot = require('kahoot.js-latest');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (your frontend)
app.use(express.static('public'));

let clients = [];
let currentBotCount = 0;
let toldToStop = false;
let selectedBotNamingOption = null;
let useHydraMode = false;
let hydraAmount = 0;

function chooseBotNamingOption(baseName, index, times, nameList) {
    if (selectedBotNamingOption === "prefix-number" || selectedBotNamingOption === null) {
        return `${baseName}${index}`;
    } else if (selectedBotNamingOption === "number-suffix") {
        return `${index}${baseName}`;
    } else {
        return botNameFromList(index, times, nameList);
    }
}

function botNameFromList(index, times, nameList) {
    const nameListArray = nameList.split("\n").map(n => n.trim()).filter(Boolean);
    if (nameListArray.length === 0) return "Unnamed";
    const name = nameListArray[index % nameListArray.length];
    return times > 1 ? `${name}${times}` : name;
}

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.action === "join") {
                const { gamePin, botName, botCount, joinSpeed, namingOption, nameList, hydra } = data;

                // Set global state
                selectedBotNamingOption = namingOption;
                useHydraMode = hydra?.enabled || false;
                hydraAmount = hydra?.amount || 0;
                toldToStop = false;
                currentBotCount = 0;

                // Process name list
                const names = nameList.split("\n").map(n => n.trim()).filter(Boolean);
                let times = 1;
                let nameIndex = 0;

                const joinInterval = setInterval(() => {
                    if (toldToStop) {
                        clearInterval(joinInterval);
                        ws.send(JSON.stringify({
                            type: "status",
                            message: `Bot spawner stopped. Total bots joined: ${currentBotCount}`
                        }));
                        return;
                    }

                    if (currentBotCount >= botCount) {
                        clearInterval(joinInterval);
                        return;
                    }

                    // Generate final bot name based on selected naming option
                    const finalBotName = chooseBotNamingOption(botName, nameIndex, times, nameList);

                    joinKahoot(gamePin, finalBotName, ws);
                    currentBotCount++;

                    // For name-list mode, increment index and manage suffixes if reused
                    if (namingOption === "name-list") {
                        nameIndex++;
                        if (nameIndex >= names.length) {
                            nameIndex = 0;
                            times++;
                        }
                    } else {
                        nameIndex = currentBotCount; // for prefix-number or number-suffix
                    }
                }, joinSpeed || 100);

            } else if (data.action === "stop") {
                toldToStop = true;
                ws.send(JSON.stringify({
                    type: "status",
                    message: `Stopped joining task.`
                }));

            } else if (data.action === "leave") {
                for (const client of clients) {
                    await client.leave();
                }
                clients = [];
                ws.send(JSON.stringify({
                    type: "status",
                    message: "All bots have left the game"
                }));
            }
        } catch (err) {
            console.error("Error processing message:", err);
            ws.send(JSON.stringify({
                type: "error",
                message: "Invalid message format"
            }));
        }
    });

    ws.on('close', () => {
        console.log("Client disconnected");
        toldToStop = true;
    });
});

function joinKahoot(gamePin, name, ws) {
    const client = new Kahoot();
    client.setMaxListeners(Number.POSITIVE_INFINITY);
    clients.push(client);

    client.join(gamePin, name).catch(err => {
        ws.send(JSON.stringify({
            type: "error",
            message: `[${name}] Failed to join: ${err.message}`
        }));
    });

    client.on("Joined", () => {
        ws.send(JSON.stringify({
            type: "status",
            message: `[${name}] joined game ${gamePin}`
        }));
    });

    client.on("QuizStart", quiz => {
        ws.send(JSON.stringify({
            type: "quizInfo",
            name: quiz.name,
            questionCount: quiz.questionCount,
            message: `[${name}] Quiz has started!`
        }));
    });

    client.on("QuestionStart", question => {
        const answer = Math.floor(Math.random() * 4);
        question.answer(answer);
        ws.send(JSON.stringify({
            type: "status",
            message: `[${name}] Answering option: ${answer}`
        }));
    });

    client.on("QuestionEnd", question => {
        ws.send(JSON.stringify({
            type: "status",
            message: `[${name}] Question ended: ${question.isCorrect ? "Correct" : "Incorrect"}`
        }));
    });

    client.on("QuizEnd", (o) => {
        ws.send(JSON.stringify({
            type: "status",
            message: `[${name}] Quiz ended with correct answers: ${o.correctCount}`
        }));
    });

    client.on("Disconnect", reason => {
        ws.send(JSON.stringify({
            type: "status",
            message: `[${name}] Disconnected: ${reason}`
        }));

        if (useHydraMode) {
            for (let i = 0; i < hydraAmount; i++) {
                joinKahoot(gamePin, `${name}'s revenge ${i}`, ws);
            }
        }
    });
}

server.listen(3001, () => {
    console.log('Server listening on http://localhost:3001');
});