const express = require("express")

const app = express()

app.use(express.json())

const connections = {}

DELAY = 2500

function waitForReciever(id) {
  return new Promise((resolve) => {
    function checkForReciever() {
      if (connections[id].connect == true) {
        resolve(connections[id].answer)
      }
      else {
        console.log(`ID : ${id} Waiting for connection!`)
        setTimeout(checkForReciever, DELAY)
      }
    }
    checkForReciever()
  })
}
app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.post("/offer", async (req, res) => {
  res.setHeader("Transfer-Encoding", "chunked")

  var id = req.body.ID
  connections[id] = (req.body)
  connections[id]["connect"] = false;

  console.log("Recieved Body = ", connections[id])
  try {
    const receiver = await waitForReciever(id);
    if (receiver) {
      delete connections[id]
      res.json({ receiver });
    } else {
      console.log("Receiver not Found!");
      res.json({ error: "Receiver not found" });
    }
  } catch (error) {
    console.error("Error while waiting for receiver:", error);
    res.json({ error: "Internal server error" });
  }

})

app.post("/sendanswer", (req, res) => {
  var id = req.body.connectID
  if (connections[id] !== null) {
    var offerObject = connections[id]
    connections[id].connect = true
    connections[id].answer = req.body.answer
    console.log("Sending offerObject", offerObject)
    res.send({ "success": true })
  }
  else {
    res.send({ "success": false })
  }
})

app.get("/getoffer", (req, res) => {
  var id = req.body.connectID
  if (connections[id] !== null) {
    var offerObject = connections[id]

    res.send({ "success": true, "offer": offerObject })
  }
  else {
    res.send({ "success": false })
  }
})

app.listen(9400, () => {
  console.log("Server running on port : 9400.")
})
