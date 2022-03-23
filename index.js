const cookieParser = require("cookie-parser");
const express = require("express");
const { google } = require("googleapis");
require('dotenv').config()

const PORT = process.env.PORT || 5000
const CLIENT_ID = process.env.CLIENT_ID

//Google Auth
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

function checkAuthenticated(req, res, next){

  let token = req.cookies['session-token'];
  let user = {};
  async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      user.name = payload.name;
      user.email = payload.email;
      user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err=>{
        res.redirect('/login')
    })

}

app.get("/editor", (req, res) => {
  // let user = req.user
  let user = {
    picture: 'https://lh3.googleusercontent.com/a-/AOh14GjE5dXD9oc4Qvo7yBReWn96onQrFc-yLIH1d60=s96-c',
    name: 'O. Ester'
  }
  res.render("editor", {user});
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let token = req.body.token
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    // console.log(payload)
  }
  verify()
  .then(()=>{
    res.cookie("session token", token)
    res.send('success')
  })
  .catch(console.error);
  
});

app.get('/logout', (req, res)=>{
  res.clearCookie('session-token')
  res.redirect('/login')
})

app.post("/editor", async (req, res) => {
  const { first_name, last_name, email, age } = req.body;

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials02.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;

  // // Get metadata about spreadsheet
  // const metaData = await googleSheets.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // });

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[first_name, last_name, email, age]],
    },
  });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A1:D",
  });

  res.send(getRows.data.values);
});

app.get("/", async (req, res) => {

  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials02.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A1:D",
  });

  res.send(getRows.data.values);
});



app.listen(PORT, (req, res) => console.log(`running on ${PORT}`));
