import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger .env.local explicitement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');
console.log('Chargement du fichier d\'env:', envPath);
config({ path: envPath });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'school-card';

if (!uri) {
  console.error('❌ MONGODB_URI introuvable. Vérifiez .env.local');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✓ Connecté à MongoDB')
    const db = client.db(dbName);

    // etablissements
    const etablissements = db.collection('etablissements');
    await etablissements.createIndex({ nom: 1 });
    await etablissements.createIndex({ creeLe: -1 });
    await etablissements.createIndex({ anneeScolaire: 1 });
    await etablissements.createIndex({ nom: 'text', adresse: 'text' }, { default_language: 'french', weights: { nom: 10, adresse: 5 } });
    console.log(' - Index etablissements créés');

    // classes
    const classes = db.collection('classes');
    await classes.createIndex({ etablissementId: 1 });
    await classes.createIndex({ creeLe: -1 });
    await classes.createIndex({ etablissementId: 1, nom: 1 });
    await classes.createIndex({ etablissementId: 1, niveau: 1 });
    await classes.createIndex({ etablissementId: 1, creeLe: -1 });
    await classes.createIndex({ nom: 'text', niveau: 'text' }, { default_language: 'french' });
    console.log(' - Index classes créés');

    // eleves
    const eleves = db.collection('eleves');
    await eleves.createIndex({ classeId: 1 });
    await eleves.createIndex({ creeLe: -1 });
    try { await eleves.createIndex({ matricule: 1 }, { unique: true }); } catch(e){ /* ignore */ }
    await eleves.createIndex({ classeId: 1, nom: 1 });
    await eleves.createIndex({ classeId: 1, creeLe: -1 });
    await eleves.createIndex({ classeId: 1, nom: 1, prenom: 1 });
    await eleves.createIndex({ 'classe.etablissementId': 1 });
    await eleves.createIndex({ nom: 'text', prenom: 'text', lieuNaissance: 'text' }, { default_language: 'french', weights: { nom: 10, prenom: 8, lieuNaissance: 3 } });
    console.log(' - Index eleves créés');

    // personnel
    const personnel = db.collection('personnel');
    await personnel.createIndex({ etablissementId: 1 });
    await personnel.createIndex({ creeLe: -1 });
    await personnel.createIndex({ role: 1 });
    try { await personnel.createIndex({ matricule: 1 }, { unique: true, sparse: true }); } catch(e){}
    await personnel.createIndex({ etablissementId: 1, nom: 1 });
    await personnel.createIndex({ etablissementId: 1, role: 1 });
    await personnel.createIndex({ etablissementId: 1, creeLe: -1 });
    await personnel.createIndex({ role: 1, nom: 1 });
    await personnel.createIndex({ nom: 'text', prenom: 'text', fonction: 'text' }, { default_language: 'french', weights: { nom: 10, prenom: 8, fonction: 5 } });
    console.log(' - Index personnel créés');

    console.log('\n✅ Index créés/validés.');
  } catch (err) {
    console.error('❌ Erreur création index:', err);
  } finally {
    await client.close();
    console.log('✓ Déconnecté');
  }
}

run();
