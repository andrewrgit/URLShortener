const express = require("express");
const path = require("path");
const { Client } = require("pg");
const urlModule = require("url");
const crypto = require("crypto");
const app = express();

//Setup port for both heroku and local
let port = process.env.PORT;
if(!port || port == ""){
    port = 3000;
}

let connString = process.env.DATABASE_URL;


app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})

app.get("/*", (req, res) => {

    res.send("ope");
    console.log(req.originalUrl);

    //Databse retrieval code
    var client = new Client({
        connectionString: connString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    client.query("SELECT original_url FROM urls WHERE short_url = 'http://smllurl.herokuapps.com" + req.originalUrl + "';", (err, databaseRes) => {
        res.redirect((databaseRes.rows[0])["original_url"]);
    })

    client.end();
})

app.post("/", (req, res) => {
    if(req.body){
        if(req.body.url){
            try{
                new urlModule.URL(req.body.url);
            } catch(ex) {
                res.status(400).send();
                return;
            }
        }
    }

    //Hash the url then base64 encode
    var url = crypto.createHash("sha1").update(req.body.url).digest("base64");
    //base64 includes the / character so we replace it with a -
    url = url.replace('/', '-');
    //truncate string to first 6 characters
    url = url.substr(0, 5);

    //Database insertion code
    var scheme = "http://";
    var subdomain = "smllurl";
    var domain = "herokuapp.com";
    var finalUrl = scheme + subdomain + "." + domain + "/" + url;
    var body = {
        "url": finalUrl
    }

    var client = new Client({
        connectionString: connString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    client.connect();

    client.query("INSERT INTO urls (short_url, original_url) VALUES ('" + finalUrl + "', '" + req.body.url + "')", (err, databaseRes) => {
    })

    client.end();

    res.status(200).send(JSON.stringify(body));
})

