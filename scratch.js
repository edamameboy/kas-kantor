const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const id = 'cms3wdzm9000004jgjd93x1vk'; // From the user's log
  
  // Create a 3MB string
  const largeString = 'a'.repeat(3 * 1024 * 1024);
  const base64 = 'data:image/jpeg;base64,' + largeString;

  console.log('Updating...');
  try {
    await prisma.transaction.update({
      where: { id },
      data: { 
        status: 'COMPLETED',
        transferProof: base64
      }
    });
    console.log('Success!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
