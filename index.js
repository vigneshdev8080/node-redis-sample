const express = require('express')
const app = express();
const cors = require('cors')
const axios = require('axios');
const redis = require('redis');


const PORT = 3000
const DEFAULT_EXPIRE = 30000
app.use(cors())

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
    console.log("Redis connection established");
})();


app.get("/posts", async (req, res) => {
    try {
        const cacheResult = await redisClient.get("posts")

        if (cacheResult) {
            return res.status(200).send({ data: JSON.parse(cacheResult) })
        }
        else {
            const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts")
            redisClient.setEx("posts", DEFAULT_EXPIRE, JSON.stringify(data))
            return res.status(200).send(data)
        }


    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }
})

app.listen(PORT, () => console.log('Running on port', PORT));