const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('=== Création d\'un compte Administrateur / Agent (FarmGate) ===');

  const args = process.argv.slice(2);
  let fullName = args[0];
  let phone = args[1];
  let password = args[2];
  let role = args[3];

  if (!fullName) {
    fullName = (await ask('Nom complet : ')).trim();
  }
  if (!phone) {
    phone = (await ask('Numéro de téléphone (ex: ) : ')).trim();
  }
  if (!password) {
    password = (await ask('Mot de passe : ')).trim();
  }
  if (!role) {
    const rawRole = (await ask('Rôle (ADMIN ou AGENT) [ADMIN] : ')).trim();
    role = rawRole || 'ADMIN';
  }

  if (!fullName || !phone || !password) {
    console.error(' Tous les champs sont obligatoires.');
    process.exit(1);
  }

  const roleUpper = role.toUpperCase();
  if (!['ADMIN', 'AGENT'].includes(roleUpper)) {
    console.error(' Le rôle doit être ADMIN ou AGENT.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await prisma.user.update({
      where: { phone },
      data: {
        fullName,
        passwordHash,
        role: roleUpper,
      },
    });
    console.log(`Utilisateur mis à jour avec le rôle ${roleUpper} : ${fullName} (${phone})`);
  } else {
    await prisma.user.create({
      data: {
        fullName,
        phone,
        passwordHash,
        role: roleUpper,
      },
    });
    console.log(`Compte ${roleUpper} créé avec succès : ${fullName} (${phone})`);
  }
}

main()
  .catch((e) => {
    console.error(' Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
