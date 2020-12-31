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
app.use(express.urlencoded( { extended: true }));
app.use(express.json());

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})

app.get("/*", (req, res) => {
    console.log("req.originalUrl: " + req.originalUrl);

    //Databse retrieval code
    var client = new Client({
        connectionString: connString,
        ssl: false
    });

    client.connect();

    var values = ["http://smllurl.herokuapp.com" + req.originalUrl]
    var queryString = "SELECT original_url FROM urls WHERE short_url = $1;";
    console.log("query: " + queryString);
    client.query(queryString, values, (err, databaseRes) => {
        if(err) throw err;
        
        console.log(databaseRes.rows[0]);
        if(databaseRes.rows[0] != null){
            res.redirect((databaseRes.rows[0])["original_url"]);
        }
        else{
            res.sendStatus(400);
        }
        

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
    
    values = [finalUrl, req.body.url];
    client.query("INSERT INTO urls (short_url, original_url) VALUES ($1, $2)", values, (err, databaseRes) => {
        if(err){
            if(err.code == "23505"){
                console.log("duplicate key, not adding short_url " + finalUrl + " or original_url " + req.body.url);
            }
            else{
                throw err;
            }
        }

        client.end();
    })

    

    res.status(200).send(JSON.stringify(body));
})

