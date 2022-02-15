const express = require('express')
// const fs = require('fs')
// const util = require('util')
// const unlinkFile = util.promisify(fs.unlink)

require('dotenv').config()

const PORT = process.env.PORT

const { uploadFile, getFileStream } = require('./s3')
const { setCookie, upload } = require("./middleware")
const { uploadTOnoblox } = require("./nobloxController")
const { getWalletInfo, createWalletInfo,
  getWalletInfobyId, deleteWalletInfobyId } = require('./dynamoDb')

const app = express()
app.use(express.json())

app.get('/', (_, res) => {
  res.send('app is running')
})


// download a file from s3 ===============
app.get('/downloadFile/:key', (req, res) => {
  const key = req.params.key
  const readStream = getFileStream(key)
  readStream.pipe(res)
})


// upload a file to s3 ==================
app.post('/uploadFile', upload, async (req, res) => {
  const file = req.file
  try {
    const result = await uploadFile(file)
    res.status(201).json({ success: true, result })
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false })
  }
  // await unlinkFile(file.path)
})


// upload a item to roblox ==================
app.post("/uploadItem", setCookie, async (req, res) => {
  const { user } = req
  if (!user) {
    return res.status(400).json({ error: "Noblox unauthorize" })
  }
  try {
    const data = await uploadTOnoblox(req.body)
    res.status(201).json({ data })
  } catch (error) {
    console.log("error", error.message);
    res.status(400).json({ error: error.message })
  }
})


// get wallet info of dynamodb table ==================
app.get("/walletinfo", async (req, res) => {
  try {
    const data = await getWalletInfo()
    res.status(201).json(data)
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message })
  }
})


// add a wallet info to dynamodb table ==================
app.post("/walletinfo", async (req, res) => {
  const { wallet_address } = req.body
  try {
    await createWalletInfo(wallet_address)
    res.status(201).json({ message: "wallet created" })
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message })
  }
})


// get wallet info by id from dynamodb table ====================
app.get("/walletinfo/:id", async (req, res) => {
  const { id } = req.params
  try {
    const data = await getWalletInfobyId(id)
    res.status(201).json({ item: data.Item })
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message })
  }
})


// delete a wallet info from dynamodb table ==================
app.delete("/walletinfo/:id", async (req, res) => {
  const { id } = req.params
  try {
    await deleteWalletInfobyId(id)
    res.status(201).json({ message: "wallet deleted" })
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => console.log(`listening on port ${PORT}`))