const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;



// meddleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.tfb4xbn.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();


        // ----------- start data
        const usersCollection = client.db("boiPoka").collection("users");
        const writerCollection = client.db("boiPoka").collection("writers");
        const authorCollection = client.db("boiPoka").collection("author");
        const booksCollection = client.db("boiPoka").collection("books");






        // User releted api 
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            console.log('ExistingUser', existingUser)

            if (existingUser) {
                return res.send({ message: 'User alerady exists' })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })



        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.roal === 'admin' }
            res.send(result);
        })


        // Writer releted api
        app.post('/writer', async (req, res) => {
            const writer = req.body;
            console.log(writer)
            const query = { name: writer.name }
            const existingWriter = await writerCollection.findOne(query);
            console.log('ExistingWriter', existingWriter)

            if (existingWriter) {
                return res.send({ message: 'Writer alerady exists' })
            }
            const result = await writerCollection.insertOne(writer);
            res.send(result);
        })

        app.get('/writer', async (req, res) => {
            const result = await writerCollection.find().toArray();
            res.send(result);
        })





        // Author releted api
        app.post('/author', async (req, res) => {
            const author = req.body;
            console.log(author)
            const query = { name: author.name }
            const existingAuthor = await authorCollection.findOne(query);
            console.log('ExistingAuthor', existingAuthor)

            if (existingAuthor) {
                return res.send({ message: 'Author alerady exists' })
            }
            const result = await authorCollection.insertOne(author);
            res.send(result);
        })


        app.get('/author', async (req, res) => {
            const result = await authorCollection.find().toArray();
            res.send(result);
        })



        // book releted api
        app.post('/bookpost', async (req, res) => {
            const bookPost = req.body;
            console.log(bookPost)
            const query = { name: bookPost.bookName }
            const existingBook = await booksCollection.findOne(query);
            console.log('ExistingBook', existingBook)

            if (existingBook) {
                return res.send({ message: 'Book alerady exists' })
            }
            const result = await booksCollection.insertOne(bookPost);
            res.send(result);
        })


        app.get('/bookpost', async (req, res) => {
            const result = await booksCollection.find().toArray();
            res.send(result);
        })




        // ----------- end data






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// ------------------------------ end 

app.get('/', (req, res) => {
    res.send('Boi-poka Server is running');
})

app.listen(port, () => {
    console.log(`Boi-poka Server is running on port: ${port}`)
})