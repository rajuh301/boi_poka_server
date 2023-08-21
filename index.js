const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// meddleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.tfb4xbn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
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





    // app.post('/jwt', (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

    //   res.send({ token })
    // })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.roal !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }



    // User releted api
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("ExistingUser", existingUser);

      if (existingUser) {
        return res.send({ message: "User alerady exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;

      // if(req.decoded.email !==email){
      //   res.send({admin: false })
      // }

      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.roal === 'admin' }
      res.send(result);
    })


    // Writer releted api
    app.post("/writer", async (req, res) => {
      const writer = req.body;
      console.log(writer);
      const query = { name: writer.name };
      const existingWriter = await writerCollection.findOne(query);
      console.log("ExistingWriter", existingWriter);

      if (existingWriter) {
        return res.send({ message: "Writer alerady exists" });
      }
      const result = await writerCollection.insertOne(writer);
      res.send(result);
    });

    app.get("/writer", async (req, res) => {
      const result = await writerCollection.find().toArray();
      res.send(result);
    });

    // find book details
    app.get("/bookDetails/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };

        const result = await booksCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // find writer details
    app.get("/writer/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };

        const result = await writerCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });





    // ----------------------------------------- Rating Releted Api------------
    app.patch('/bookDetails/rating/:id', async (req, res) => {
      const bookId = req.params.id;
      const newRating = req.body.rating;
    
      try {
        const updatedBook = await booksCollection.findOneAndUpdate(
          { _id: new ObjectId(bookId) }, // Use new ObjectId constructor
          { $set: { rating: newRating } },
          { returnOriginal: false }
        );
    
        if (!updatedBook) {
          return res.status(404).json({ error: 'Book not found' });
        }
    
        res.json({ modifiedCount: 1 }); // Sending a response indicating success
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    });
    
  
    // ----------------------------------------- Rating Releted Api------------


    // -------------------------------------- Delete Reletd Api-------------

    app.delete('/deleteBook/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/deleteAuthor/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await authorCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/deleteWriter/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await writerCollection.deleteOne(query)
      res.send(result)
    })


    // -------------------------------------- Delete Reletd Api-------------




    app.get("/search/:text", async (req, res) => {
      try {
        const text = req.params.text;

        const result = await booksCollection
          .find({
            $or: [
              { bookName: { $regex: text, $options: "i" } },
              { category_1: { $regex: text, $options: "i" } },
              { category_2: { $regex: text, $options: "i" } },
              { category_3: { $regex: text, $options: "i" } },
              { category_4: { $regex: text, $options: "i" } },
              { bookWriter: { $regex: text, $options: "i" } },
            ],
          })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Author releted api
    app.post("/author", async (req, res) => {
      const author = req.body;
      console.log(author);
      const query = { name: author.name };
      const existingAuthor = await authorCollection.findOne(query);
      console.log("ExistingAuthor", existingAuthor);

      if (existingAuthor) {
        return res.send({ message: "Author alerady exists" });
      }
      const result = await authorCollection.insertOne(author);
      res.send(result);
    });

    app.get("/author", async (req, res) => {
      const result = await authorCollection.find().toArray();
      res.send(result);
    });

    // book releted api
    app.post("/bookpost", async (req, res) => {
      const bookPost = req.body;
      console.log(bookPost);
      const query = { name: bookPost.bookName };
      const existingBook = await booksCollection.findOne(query);
      console.log("ExistingBook", existingBook);

      if (existingBook) {
        return res.send({ message: "Book alerady exists" });
      }
      const result = await booksCollection.insertOne(bookPost);
      res.send(result);
    });

    app.get("/bookpost", async (req, res) => {
      const result = await booksCollection.find().toArray();
      res.send(result);
    });

    app.get("/bookpost/:id", async (req, res) => {
      try {
        const id = decodeURIComponent(req.params.id);
        console.log("amar id", id);

        const result = await booksCollection.find({ bookWriter: id }).toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    //find popular book of specific writer
    app.get("/bookWriter/:writerName", async (req, res) => {
      try {
        const writerName = decodeURIComponent(req.params.writerName);

        const result = await booksCollection
          .find({ bookWriter: writerName, category_4: "জনপ্রিয়" })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //find simple book of specific writer
    app.get("/simpleBookWriter/:writerName", async (req, res) => {
      try {
        const writerName = decodeURIComponent(req.params.writerName);

        const result = await booksCollection
          .find({ bookWriter: writerName, category_4: "সাধারন" })
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/writers/:writer", async (req, res) => {
      try {
        const writer = decodeURIComponent(req.params.writer);

        const result = await writerCollection.findOne({ name: writer });

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // ----------- end data

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// ------------------------------ end

app.get("/", (req, res) => {
  res.send("Boi-poka Server is running");
});

app.listen(port, () => {
  console.log(`Boi-poka Server is running on port: ${port}`);
});
