const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const BOT_TOKEN = "8925750287:AAHdk9k_vwTkLbNjhX_c21suZX1Bu9B2LiY";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, keyboard = null) {

    const data = {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML"
    };

    if (keyboard) {
        data.reply_markup = keyboard;
    }

    await axios.post(`${API}/sendMessage`, data);
}

app.post("/", async (req, res) => {

    const update = req.body;

    try {

        // MESSAGE
        if (update.message) {

            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text || "";

            // START
            if (text === "/start") {

                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: "User", callback_data: "user" },
                            { text: "Premium", callback_data: "premium" },
                            { text: "Bot", callback_data: "bot" }
                        ],
                        [
                            { text: "Group", callback_data: "group" },
                            { text: "Channel", callback_data: "channel" },
                            { text: "Forum", callback_data: "forum" }
                        ]
                    ]
                };

                const msg = `
<b>ADVANCED INFO BOT</b>

<blockquote>Forward any message to get information.</blockquote>

<u>FEATURES</u>

• User Detection
• Premium Detection
• Bot Detection
• Group Information
• Channel Information
• Forum Detection
`;

                await sendMessage(chatId, msg, keyboard);
            }

            // FORWARDED USER
            else if (message.forward_from) {

                const user = message.forward_from;

                const result = `
<b>USER INFORMATION</b>

<blockquote>
ID : <code>${user.id || "N/A"}</code>
First Name : ${user.first_name || "N/A"}
Last Name : ${user.last_name || "N/A"}
Username : ${user.username ? "@" + user.username : "No Username"}
Language : ${user.language_code || "Unknown"}
Premium : ${user.is_premium ? "True" : "False"}
Bot : ${user.is_bot ? "True" : "False"}
</blockquote>
`;

                await sendMessage(chatId, result);
            }
        }

        // BUTTONS
        else if (update.callback_query) {

            const callback = update.callback_query;

            const data = callback.data;
            const chatId = callback.message.chat.id;

            const texts = {

                user:
                    "<b>User Information</b>\n\n<blockquote>Forward user message to get information.</blockquote>",

                premium:
                    "<b>Premium Detection</b>\n\n<blockquote>Shows Telegram Premium status.</blockquote>",

                bot:
                    "<b>Bot Detection</b>\n\n<blockquote>Detects Telegram bots.</blockquote>",

                group:
                    "<b>Group Information</b>\n\n<blockquote>Add bot into group.</blockquote>",

                channel:
                    "<b>Channel Information</b>\n\n<blockquote>Add bot as admin in channel.</blockquote>",

                forum:
                    "<b>Forum Information</b>\n\n<blockquote>Detects Telegram forum groups.</blockquote>"
            };

            await axios.post(`${API}/answerCallbackQuery`, {
                callback_query_id: callback.id,
                text: "Opened"
            });

            await sendMessage(chatId, texts[data] || "Unknown");
        }

        res.status(200).send("OK");

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).send("ERROR");
    }
});

module.exports = app;
