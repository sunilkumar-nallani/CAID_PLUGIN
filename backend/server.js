require('dotenv').config()
const express = require('express');  //express is from npm module
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const app = express();
const PORT = 3000;

app.use(cors()); // **NEW:** Use the cors middleware
app.use(bodyParser.json());
app.use('/api', apiRoutes);

//Routing

app.get('/', function(req, res){ res.send('Hello World!') });  //getting data from browser, .send is used to send data from server to browser(client)
app.get('/test', function(req, res){ res.send('This is a test!') });
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)); 







































/* var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(8080); */

