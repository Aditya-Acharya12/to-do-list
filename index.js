import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import process from "dotenv";

const app = express();
const port = process.env.SERVER_PORT;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

db.connect();


app.get("/", async (req, res) => {
  try{
  const result = await db.query("SELECT * FROM items ORDER BY id ASC");
  const items = result.rows;
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
}
catch(err)
{
  console.log(err);
}
});

app.post("/add", async (req, res) => {
    const item = req.body.newItem;
try{
    await db.query("INSERT INTO items(title) VALUES($1)",[item]);
  res.redirect("/");
}
catch(err)
{
  console.log(err);
}
  
});

app.post("/edit", async (req, res) => {
  const newTitle = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  try{  
  await db.query("UPDATE items SET title = $1 WHERE id = $2",[newTitle,itemId]);
  res.redirect("/");
}catch(err){
  console.log(err);
}
  
});

app.post("/delete", async (req, res) => {
  try{
    await db.query("DELETE FROM items WHERE id = $1",[req.body.deleteItemId]);
  res.redirect("/");
  }
  catch(err)
  {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
