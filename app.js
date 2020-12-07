const express = require("express");
const path = require("path");
const crypto = require("crypto");
const app = express();

//Setup port for both heroku and local
let port = process.env.PORT;
if(!port || port == ""){
    port = 3000;
}


app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})

app.post("/", (req, res) => {
    console.log("got post request");
    console.log(req.body.url);
    //Hash the url then base64 encode
    var url = crypto.createHash("sha1").update(req.body.url).digest("base64");
    //base64 includes the / character so we replace it with a -
    url = url.replace('/', '-');
    //truncate string to first 6 characters
    url = url.substr(0, 5);
    var scheme = "http://";
    var body = {
        "url": scheme + url + ".com"
    }
    res.status(200).send(JSON.stringify(body));
})

