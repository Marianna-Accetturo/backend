const News = require("../models/newsModel")

const sendNews = async (req, res) => {

    const send = async () => {
        try{
            const news = await News.find({})
            const data = JSON.stringify(news)
            res.sse.data({data: data})
        }catch(err){
            if (!res.headersSent) res.status(500).json({msg: "error", err: err})
        }
    };

    try{
        await send();

        const intervalId = setInterval(async () => {
            await send();
          }, 10000);

        req.on('close', () => {
            clearInterval(intervalId);
          });

    } catch (err) {
        if (!res.headersSent) res.status(500).json({msg: "error", err: err})
    }
    
    try {
        setInterval(async () => {
            const news = await News.find({})
            const data = JSON.stringify(news)
            res.sse.data({data: data})
        }, 10000);
    } catch (err) {
        res.status(500).json({msg: "error", err: err})
    }

}

module.exports = { sendNews }