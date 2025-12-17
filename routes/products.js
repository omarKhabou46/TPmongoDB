const express = require("express");
const router = express.Router();
const { connectDB, logout } = require("../connectionDataB");

// Définit les routes pour ce module
router.get("/products", async (req, res) => {
  let db = await connectDB();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const search = req.query.search;
  const sort = req.query.sort;

  const pipeline = [];
  const match = {};

  if (category) {
    match.category = category;
  }

  if (search) {
    match.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  if (sort) {
    let s = sort.substring(1);
    if (sort == "-" + s) {
      console.log("-  - ", sort);
      pipeline.push({ $sort: { [s]: -1 } });
    } else {
      console.log(sort);
      pipeline.push({ $sort: { [sort]: 1 } });
    }
  }
  // Obtenir le total des produits filtrés
  const allProducts = await db
    .collection("products")
    .aggregate(pipeline)
    .toArray();
  const totalProducts = allProducts.length;

  // Pagination
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  const products = await db
    .collection("products")
    .aggregate(pipeline)
    .toArray();

  return res.json({ total: totalProducts, page, limit, products });
});

router.get("/products/stats", async (req, res) => {
  try {
    const m = parseInt(req.query.meilleursP) || 0;
    const b = parseInt(req.query.brandStats) || 0;
    let db = await connectDB();
    const data = await globalStatistique(db);
    const products = await meilleursProduits(db);
    const brandStats = await decompositionMarque(db);
    if (b != 0) {
       return res.json(brandStats);
    }else {
        if (m != 0) {
          res.json(products);
        } else {
          res.json(data);
        }
    }
   
  } catch (error) {
    console.error("Error fetching stats:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Exercice 6.1
const globalStatistique = async (db) => {
  try {
    const stats = await db
      .collection("products")
      .aggregate([
        // Étape 1 : $group → regrouper par catégorie et calculer les stats
        {
          $group: {
            _id: "$category", // Regroupe par catégorie
            totalProducts: { $sum: 1 }, // Nombre total de produits
            avgPrice: { $avg: "$price" }, // Prix moyen
            maxPrice: { $max: "$price" }, // Prix maximum
            minPrice: { $min: "$price" }, // Prix minimum
          },
        },
        {
          $sort: { avgPrice: -1 },
        },
        {
          $project: {
            _id: 0, // Supprime l’ancien _id
            categoryName: "$_id", // Renomme _id en categoryName
            totalProducts: 1, // Conserve totalProducts
            averagePrice: "$avgPrice", // Renomme avgPrice en averagePrice
            maxPrice: 1, // Conserve maxPrice
            minPrice: 1, // Conserve minPrice
          },
        },
      ])
      .toArray(); 
    return stats;
  } catch (error) {
    console.error("Error in globalStatistique:", error.message);
    return [];
  }
};

// Exercice 6.2
const meilleursProduits = async (db) => {
  try {
    const products = await db
      .collection("products")
      .aggregate([
        { $match: { price: { $gt: 500 }}},
        { $sort: { rating: -1 }},
        { $limit: 5 },
        { $project: { _id: 0, title: 1, price: 1, rating: 1} },
      ]).toArray();

      return products;

  }catch(error) {
    console.error("Error in globalStatistique:", error.message);
    return [];
  }
}

//Exercice 6.3 
const decompositionMarque = async (db) => {
    try {
        const brandStats = await db
          .collection("products")
          .aggregate([
            {
              $group: {
                _id: "$brand", // Regroupe par champ brand
                totalStock: { $sum: "$stock" }, // Somme de tous les stocks
                totalValue: { $sum: { $multiply: ["$price", "$stock"] } }, // Somme de price * stock
              },
            },

            {
              $project: {
                _id: 0, // Supprime l'ancien _id
                brandName: "$_id", // Renomme _id en brandName
                totalStock: 1,
                totalValue: 1,
              },
            },
            {
              $sort: { totalValue: -1 },
            },
          ])
          .toArray();
          return brandStats;

    }catch(error) {
        console.error("Error in globalStatistique:", error.message);
        return [];
    }
}


module.exports = router;
