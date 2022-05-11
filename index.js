const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const tokenInfo = req.headers.authorization;

    if (!tokenInfo) {
        return res.status(401).send({ message: 'Unouthorize access' })
    }
    const token = tokenInfo.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vr0ke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {

    try {
        await client.connect();
        const productCollection = client.db('warehouse').collection('product');

        // add product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // get inventory from db
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        app.get('/myproduct', verifyJWT, async (req, res) => {
            const email = req?.query?.email;
            const query = { email: email };
            console.log(email);
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        //Use JWT 
        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.SECRET_KEY)
            res.send({ token });
        })

        // update product
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updateProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    serviceProvider: updateProduct.serviceProvider,
                    price: updateProduct.price,
                    quantity: updateProduct.quantity,
                    shortDescription: updateProduct.shortDescription,
                    image: updateProduct.image
                }
            }
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

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
    res.send('Server Site !')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



