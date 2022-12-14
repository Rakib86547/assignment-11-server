const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.tiiizrg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT (req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.send({message: 'unauthorize access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
        if(err) {
            return res.send({message: 'unauthorize access'});
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const serviceCollection = client.db('albertLawyer').collection('services');
        const reviewsCollection = client.db('albertLawyer').collection('reviews');
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });
        app.get('/all_services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
            res.send({token});
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const services = await serviceCollection.findOne(query);
            res.send(services);

            app.post('/reviews', async (req, res) => {
                const review = req.body;
                const result = await reviewsCollection.insertOne(review);
                res.send(result);
            });

            app.get('/reviews', async (req, res) => {
                
                let query = {};
                const email = req.query.email;
                if (email) {
                    query = {
                        email: email
                    }
                };
                const cursor = reviewsCollection.find(query);
                const result = await cursor.toArray();
                res.send(result)
            });

            app.delete('/reviews/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const result = await reviewsCollection.deleteOne(query);
                res.send(result)
            })
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('api running')
});

app.listen(port, (req, res) => {
    console.log(`server is running ${port}`)
})