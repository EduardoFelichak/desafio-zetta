import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function seed() {
  console.log('⏳ Apagando registros existentes...')

  await prisma.comissao.deleteMany()
  await prisma.venda.deleteMany()
  await prisma.vendedor.deleteMany()

  console.log('🌱 Inserindo faixas de comissão...')

  const faixasComissao = [
    { faixaInicial: 0.01, faixaFinal: 1000, porcentagem: 0.05 },
    { faixaInicial: 1000.01, faixaFinal: 10000, porcentagem: 0.10 },
    { faixaInicial: 10000.01, faixaFinal: 100000, porcentagem: 0.20 },
    { faixaInicial: 100000.01, faixaFinal: 1000000, porcentagem: 0.30 }
  ]

  await prisma.comissao.createMany({
    data: faixasComissao,
  })

  console.log('🌱 Inserindo vendedores e vendas...')

  for (let i = 0; i < 20; i++) {
    const vendedor = await prisma.vendedor.create({
        data: {
          nome: faker.person.fullName(),
          email: faker.internet.email(),
          fone: faker.helpers.replaceSymbols('+55 ## 9####-####')
        },
    })

    const vendas = Array.from({ length: faker.number.int({ min: 5, max: 15 }) }).map(() => {
        const data = faker.date.between({
            from: new Date(`${new Date().getFullYear()}-01-01`),
            to: new Date(),
        })

      return {
        vendedorId: vendedor.id,
        total: Number(faker.finance.amount({
            min: 50,
            max: 10000,
            dec: 2,
        })),
        createdAt: data,
      }
    })

    await prisma.venda.createMany({
        data: vendas,
    })
  }

    console.log('✅ Seed concluído com sucesso!')
}

seed()
    .catch((e) => {
        console.error('Erro ao executar seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
