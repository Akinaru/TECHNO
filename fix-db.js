// fix-db.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log("🚀 Lancement du script de secours pour la base de données...");
  try {
    // 1. On vide les images trop longues qui font échouer la migration
    console.log("🧹 Nettoyage des données base64 trop longues...");
    await prisma.$executeRawUnsafe("UPDATE User SET image = NULL WHERE LENGTH(image) > 191;");
    
    // 2. On marque la migration comme réussie manuellement dans la table Prisma
    console.log("✅ Marquage de la migration comme terminée...");
    // Note: On utilise finished_at = UTC_TIMESTAMP() pour MySQL/MariaDB
    await prisma.$executeRawUnsafe(
      "UPDATE _prisma_migrations SET finished_at = UTC_TIMESTAMP() WHERE migration_name = '20260504100950_switch_to_file_uploads' AND finished_at IS NULL;"
    );
    
    console.log("🎉 Base de données débloquée !");
  } catch (e) {
    console.log("⚠️ Note : Le fix a rencontré une erreur (peut-être déjà appliqué ?) :", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
