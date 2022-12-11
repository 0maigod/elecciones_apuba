const express = require('express');
const router = express.Router();
const { google } = require("googleapis");
const { ensureAuthenticated } = require('../config/checkAuth')

const  creds  = require('../utils/creds');
const arrayToJSONObject = require('../utils/arrayToJSONObject')
const sliceArrayToJSONObj = require('../utils/sliceArrayToJSONObj')
const JSONListas = require('../utils/JSONListas')
const cuantasUrnas = require('../utils/cuantasUrnas')

//------------ Welcome Route ------------//
// router.get('/', (req, res) => {
//     res.render('home');
// });
router.get('/urnas/:sede', async (req, res) => {

  let id = req.params.sede

  const auth = new google.auth.GoogleAuth({
    // keyFile: "credentials.json",
    credentials: creds,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  
  const getUrnas = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A1:R",
  });

  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet3!A2:F",
  });

  const data = await getUrnas.data.values
  const dataListas = getRows.data.values
  const [sede, idIn, idOut, listas] = cuantasUrnas(id)
  // console.log(dataListas)
  const grupo = sliceArrayToJSONObj(data, idIn, idOut, listas)
  const listasRes = JSONListas(dataListas, id, listas)
  // console.log(listasRes)
  // console.log("esta es la data ")
  // console.log(sede)
  // console.log("este es el grupo ")
  console.log(grupo)

    res.status(200).render('sedes', {  
      urnas: grupo,
      listas: listasRes,
      sede: sede
    });

})
router.get('/', async (req, res) => {

  const auth = new google.auth.GoogleAuth({
    // keyFile: "credentials.json",
    credentials: creds,
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
    range: "Sheet2!A1:L",
  });
  
  const getUrnas = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "Sheet1!A1:R",
  });


  const dataUrnas = await getUrnas.data.values
  const data = await getRows.data.values
  const total_gral = data[1][7]
  const total_por = data[1][11]
  const nulos_por = data[1][5]
  const nulos_num = data[1][10]
  const blancos_por = data[1][6]
  const blancos_num = data[1][9]
  const mesas = data[1][8]

    res.status(200).render('home', { 
      sedes: arrayToJSONObject(data), 
      urnas: arrayToJSONObject(dataUrnas),
      total: total_gral,
      total_p: total_por,
      nulos_p: nulos_por, 
      nulos: nulos_num, 
      blancos_p: blancos_por,
      blancos: blancos_num,
      mesas: mesas
    });

});

router.get("/totales", (req, res) => {
  res.render("totales");
});

router.post("/form", async (req, res) => {
  const { urna, lista_verde, lista_roja, nulo, blanco } = req.body;
  const rango = parseInt(urna) + 1
  const auth = new google.auth.GoogleAuth({
    // keyFile: "credentials02.json",
    credentials: creds,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  let sheetRange = `Sheet1!B${rango}:F${rango}`
  let values = [
        [
          lista_verde,
          lista_roja,
          nulo,
          blanco
        ]
      ];
  const sheetResource = {
    values,
  };
  await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: sheetRange,
    valueInputOption: "USER_ENTERED",
    resource: sheetResource
  }, function (err, response) {
    if (err) {
      // req.toastr.error('Ha ocurrido un error', '¡ERROR!');
        console.log('The API returned an error: ' + err);
    } else {
      // req.flash('success_msg')
      console.log('Succesa');   
    }
  });
  
  // req.toastr.success('La carga se ha registrado.');
  res.render('form')
});

router.get('/api/data', (req, res) => {
    // const data = [100, 50, 300, 40, 350, 250]; // assuming this is coming from the database
  
      fs.readFile('./flare.json', 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        // console.log(data);
        res.send(data);
      });
  });


//------------ Form Route ------------//
// router.get('/form', (req, res) => res.render('form', {
router.get('/form', ensureAuthenticated, (req, res) => res.render('form', {
    // name: req.user.name
}));

module.exports = router;