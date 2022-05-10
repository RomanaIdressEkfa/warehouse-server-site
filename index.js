const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vr0ke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        await client.connect();
        const productCollection = client.db('warehouse').collection('product');

        // use jwt
        // app.post('/login', (req, res) => {
        //     const email = req.body;
        //     const token = jwt.sign(email, process.env.SECRET_KEY)
        //     res.send({ token });
        // })

        // add product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // get inventory from db
        app.get('/products', async (req, res) => {
            // const pageNumber = Number(req.query.pageNumber);
            // const limit = Number(req.query.limit);
            // const count = await productCollection.estimatedDocumentCount();
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // app.get('/cars/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const car = await inventoryCollection.findOne(query);
        //     res.send(car);
        // })

        app.get('/myproduct', async (req, res) => {
            // const decodedEmail = req?.decoded?.email;
            const email = req?.query?.email;
            // if (email === decodedEmail) {

            // }

            // else {
            //     res.status(403).send({ message: 'Forbidden access' })
            // }
            const query = { email: email };
            console.log(email);
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        // // update car
        // app.put('/cars/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const updateCar = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             name: updateCar.name,
        //             suplier: updateCar.suplier,
        //             price: updateCar.price,
        //             quantity: updateCar.quantity,
        //             description: updateCar.description,
        //             image: updateCar.image
        //         }
        //     }
        //     const result = await inventoryCollection.updateOne(filter, updateDoc, options);
        //     res.send(result)
        // })

        // DELETE
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {
        // client.close();
    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



