const { connectDB, logout } = require("./connectionDataB");



const insertProducts = async (products) => {
  let db = await connectDB();
  const collection = db.collection("products");
  await collection.deleteMany({});
  await collection.insertMany(products);
  console.log("Products inserted");
};

const fetchData = async () => {
  try {
    console.log("test");
    const responce = await fetch("https://dummyjson.com/products");
    const data = await responce.json();
    await insertProducts(data.products);
  } catch (error) {
    console.log("error to insertProducts");
  } finally {
    await logout();
  }
};

fetchData();
