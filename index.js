const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travel");
    const productCollection = database.collection("tourService");
    const orderCollection = database.collection("orders");

    //GET Tour Services API
    app.get("/tour", async (req, res) => {
      const cursor = await productCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // lOAD SINLE TOUR PACKAGE WITH ID
    app.get("/tour/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleTour = await productCollection.findOne(query);
      // console.log('load user with id: ', id);
      res.send(singleTour);
    });

    // SINGLE USER ORDER API 

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { email: id };
      const singleTour = await orderCollection.find(query).toArray();
      // console.log('load user with id: ', id);
      res.send(singleTour);
    });

    // POST Single Service API

     app.post('/tour', async (req, res) => {
      const service = req.body;
      console.log('hit the post api', service);

      const result = await productCollection.insertOne(service);
      console.log(result);
      res.json(result)
  });

    // Add Orders API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // GET Orders API
    app.get("/orders", async (req, res) => {
      const cursor = await orderCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
    });


     //UPDATE API
     app.put('/tour/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
          $set: {
              name: updatedUser.name,
              price: updatedUser.price,
              description: updatedUser.description,
              image: updatedUser.image,
          },
      };
      const result = await productCollection.updateOne(filter, updateDoc, options)
      console.log('updating', id)
      res.json(result)
  })

    // DELETE SERVICE API

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      console.log("deleting user with id ", result);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
// Show error
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel server is running");
});

app.listen(port, () => {
  console.log("Server running at  port", port);
});
