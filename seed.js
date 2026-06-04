import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcxvKbVoSiR2LSin2R-LvMui8aXibObQE",
  authDomain: "cvr-e85c2.firebaseapp.com",
  projectId: "cvr-e85c2",
  storageBucket: "cvr-e85c2.firebasestorage.app",
  messagingSenderId: "112010781487",
  appId: "1:112010781487:web:efe27c9cd45625cc86f7da"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    "name": "Traditional Brass Ganesha",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Brass Items",
    "price": 2499,
    "stock": 15,
    "description": "Handcrafted brass Ganesha idol with intricate traditional detailing."
  },
  {
    "name": "Brass Peacock Lamp",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Brass Items",
    "price": 3299,
    "stock": 10,
    "description": "Decorative brass peacock lamp suitable for pooja rooms and home decor."
  },
  {
    "name": "Premium Wooden Mandir",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Mandirs",
    "price": 12999,
    "stock": 5,
    "description": "Elegant handcrafted wooden temple with traditional carvings."
  },
  {
    "name": "Compact Home Mandir",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Mandirs",
    "price": 6999,
    "stock": 8,
    "description": "Space-saving wooden pooja mandir for apartments and homes."
  },
  {
    "name": "Sandalwood Prayer Maalai",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Sandalwood Maalai",
    "price": 1499,
    "stock": 20,
    "description": "Authentic sandalwood prayer maalai with natural fragrance."
  },
  {
    "name": "Premium Sandalwood Beads",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Sandalwood Maalai",
    "price": 1999,
    "stock": 12,
    "description": "Handcrafted sandalwood beads ideal for meditation and prayer."
  },
  {
    "name": "German Silver Bowl Set",
    "category": "ALL HANDICRAFTS",
    "subcategory": "German Silver Range",
    "price": 4499,
    "stock": 7,
    "description": "Decorative German silver bowl set for gifting and decoration."
  },
  {
    "name": "German Silver Pooja Plate",
    "category": "ALL HANDICRAFTS",
    "subcategory": "German Silver Range",
    "price": 2899,
    "stock": 9,
    "description": "Traditional German silver pooja plate with premium finish."
  },
  {
    "name": "Handcrafted Wooden Elephant",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Wooden Art Work",
    "price": 3999,
    "stock": 6,
    "description": "Beautifully carved wooden elephant handcrafted by artisans."
  },
  {
    "name": "Wooden Wall Carving",
    "category": "ALL HANDICRAFTS",
    "subcategory": "Wooden Art Work",
    "price": 5499,
    "stock": 4,
    "description": "Premium wooden wall carving for luxury interiors."
  },
  {
    "name": "Corporate Gift Hamper",
    "category": "GIFTS",
    "subcategory": "Corporate Gifts",
    "price": 1999,
    "stock": 25,
    "description": "Customized corporate gifting solution for businesses."
  },
  {
    "name": "Executive Gift Set",
    "category": "GIFTS",
    "subcategory": "Corporate Gifts",
    "price": 2999,
    "stock": 18,
    "description": "Premium executive gift set for clients and employees."
  },
  {
    "name": "Decorative Gift Box",
    "category": "GIFTS",
    "subcategory": "Gift Items",
    "price": 899,
    "stock": 30,
    "description": "Stylish decorative gift box suitable for all occasions."
  },
  {
    "name": "Festival Gift Collection",
    "category": "GIFTS",
    "subcategory": "Gift Items",
    "price": 1499,
    "stock": 20,
    "description": "Curated festive gifting collection."
  },
  {
    "name": "Golden Ganesha Idol",
    "category": "GIFTS",
    "subcategory": "Ganesha Collection",
    "price": 1799,
    "stock": 14,
    "description": "Elegant Ganesha idol perfect for gifting and worship."
  },
  {
    "name": "Crystal Ganesha Statue",
    "category": "GIFTS",
    "subcategory": "Ganesha Collection",
    "price": 2299,
    "stock": 11,
    "description": "Premium crystal Ganesha decorative piece."
  },
  {
    "name": "Hand Painted Vase",
    "category": "GIFTS",
    "subcategory": "Painted Gifts",
    "price": 1599,
    "stock": 13,
    "description": "Colorful hand-painted vase crafted by skilled artisans."
  },
  {
    "name": "Traditional Painted Plate",
    "category": "GIFTS",
    "subcategory": "Painted Gifts",
    "price": 1299,
    "stock": 15,
    "description": "Decorative painted plate with traditional artwork."
  },
  {
    "name": "Luxury Wooden Photo Frame",
    "category": "HOME DECOR",
    "subcategory": "Photo Frame",
    "price": 999,
    "stock": 22,
    "description": "Premium wooden photo frame with elegant finish."
  },
  {
    "name": "Vintage Family Photo Frame",
    "category": "HOME DECOR",
    "subcategory": "Photo Frame",
    "price": 1299,
    "stock": 18,
    "description": "Classic vintage-style photo frame."
  },
  {
    "name": "Decorative Wall Hanging",
    "category": "HOME DECOR",
    "subcategory": "Wall Hangings",
    "price": 2499,
    "stock": 12,
    "description": "Premium handcrafted wall hanging for living rooms."
  },
  {
    "name": "Bohemian Wall Decor",
    "category": "HOME DECOR",
    "subcategory": "Wall Hangings",
    "price": 1899,
    "stock": 16,
    "description": "Modern bohemian-style handcrafted wall decor."
  },
  {
    "name": "Wedding Return Gift Set",
    "category": "HOME DECOR",
    "subcategory": "Return Gifts",
    "price": 299,
    "stock": 100,
    "description": "Elegant return gift set for weddings and functions."
  },
  {
    "name": "Festival Return Gift Pack",
    "category": "HOME DECOR",
    "subcategory": "Return Gifts",
    "price": 399,
    "stock": 80,
    "description": "Affordable premium return gifts for celebrations."
  },
  {
    "name": "Customized Name Plate",
    "category": "HOME DECOR",
    "subcategory": "Customize Gifts",
    "price": 1499,
    "stock": 20,
    "description": "Personalized wooden name plate for homes and offices."
  },
  {
    "name": "Custom Engraved Wooden Gift",
    "category": "HOME DECOR",
    "subcategory": "Customize Gifts",
    "price": 1999,
    "stock": 15,
    "description": "Personalized handcrafted wooden gift with engraving."
  }
];

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function seed() {
  const productsRef = collection(db, "products");
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const slug = slugify(product.name);
    // Determine category slug from name roughly
    const catSlug = slugify(product.category);
    
    const docData = {
      name: product.name,
      slug: slug,
      sku: `CVR-${Date.now().toString().slice(-6)}-${i}`,
      price: Number(product.price),
      salePrice: null,
      stock: Number(product.stock),
      category: catSlug, // Admin interface uses slug
      categoryName: product.category, // Storing for reference
      subcategory: product.subcategory,
      description: product.description,
      shortDescription: product.description,
      featured: false,
      bestSeller: false,
      newArrival: true,
      mainImage: "",
      cloudinaryPublicId: "",
      galleryImages: [],
      galleryImagesPublicIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    try {
      const docRef = await addDoc(productsRef, docData);
      console.log(`Added product: ${product.name} with ID: ${docRef.id}`);
    } catch (e) {
      console.error(`Error adding product: ${product.name}`, e);
    }
  }
  
  console.log("Seeding complete.");
  process.exit(0);
}

seed();
