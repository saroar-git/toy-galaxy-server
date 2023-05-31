const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzhlcpb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
      serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
      }
});

async function run() {
      try {
            // Connect the client to the server	(optional starting in v4.7)
            client.connect();

            // collection for all toys
            const toyCollection = client.db('toyGalaxy').collection('toys');

            // read data by category, email and all for all toys
            app.get('/toys', async (req, res) => {
                  const { subCategory, email } = req.query;

                  if (!subCategory && !email) {
                        const result = await toyCollection.find().sort({ price: 1 }).limit(20).toArray();
                        res.send(result);
                  } else if (subCategory && !email) {
                        const result = await toyCollection.find({ subCategory: subCategory }).toArray();
                        res.send(result);
                  } else if (email) {
                        const result = await toyCollection.find({ email: email }).sort({ price: -1 }).toArray();
                        res.send(result);
                  }
            });

            // read data by id
            app.get('/toys/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) };

                  const options = {
                        projection: { name: 1, price: 1, picture: 1, quantity: 1, rating: 1, subCategory: 1, seller: 1, description: 1, email: 1 }
                  };
                  const result = await toyCollection.findOne(query, options);
                  res.send(result);
            });

            // post new toy
            app.post('/toys', async (req, res) => {
                  const add = req.body;
                  const result = await toyCollection.insertOne(add);
                  res.send(result);
            });

            // update a toy
            app.patch('/toys/:id', async (req, res) => {
                  const updatedToy = req.body;
                  const id = req.params.id;
                  const filter = { _id: new ObjectId(id) };
                  const options = { upsert: true };

                  const toy = {
                        $set: {
                              price: updatedToy.price,
                              quantity: updatedToy.quantity,
                              description: updatedToy.description
                        }
                  };

                  const result = await toyCollection.updateOne(filter, toy, options);
                  res.send(result);
            });

            // delete a toy
            app.delete('/toys/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: new ObjectId(id) };
                  const result = await toyCollection.deleteOne(query);
                  res.send(result);
            });

            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);

app.get('/', (req, res) => {
      res.send('Server is running');
});

app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
});