/**
 * Script pour vérifier l'état de la base de données MongoDB
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'school-card';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non configuré');
  process.exit(1);
}

async function checkDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connecté à MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📊 Collections trouvées: ${collections.length}`);
    
    if (collections.length === 0) {
      console.log('⚠️  Aucune collection trouvée - La base de données est VIDE');
      return;
    }
    
    // Compter les documents dans chaque collection
    console.log('\n📈 Nombre de documents par collection:');
    for (const collectionInfo of collections) {
      const collection = db.collection(collectionInfo.name);
      const count = await collection.countDocuments();
      console.log(`   ${collectionInfo.name}: ${count} document(s)`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.close();
    console.log('\n✓ Déconnecté');
  }
}

checkDatabase();
