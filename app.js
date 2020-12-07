const express = require("express");
const path = require("path");
const { Client } = require("pg");
const urlModule = require("url");
const crypto = require("crypto");
const app = express();

//Setup variables for both heroku and local
let port = process.env.PORT;
if(!port || port == ""){
    port = 3000;
}

let connString = process.env.DATABASE_URL;
if(!connString || connString == ""){
    connString = "postgres://postgres:password@localhost:5432/Andrew";
}



app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.urlencoded());
app.use(express.json());

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})

app.get("/*", (req, res) => {
    console.log(req.originalUrl);

    //Databse retrieval code
    var client = new Client({
        connectionString: connString,
        ssl: false
    });

    client.connect();

    var queryString = "SELECT original_url FROM urls WHERE short_url = 'http://smllurl.herokuapp.com" + req.originalUrl + "';";
    console.log(queryString);
    client.query(queryString, (err, databaseRes) => {
        if(err) throw err;
        console.log(databaseRes.rows[0]);
        res.redirect((databaseRes.rows[0])["original_url"]);

        client.end();
    })

    
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
    console.log(connString);
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
        ssl: false
    });

    client.connect(err => {
        if (err) {
          console.error('connection error', err.stack)
        } else {
          console.log('connected')
        }
      })
    

    client.query("INSERT INTO urls (short_url, original_url) VALUES ('" + finalUrl + "', '" + req.body.url + "')", (err, databaseRes) => {
        if(err) throw err;

        client.end();
    })

    

    res.status(200).send(JSON.stringify(body));
})

