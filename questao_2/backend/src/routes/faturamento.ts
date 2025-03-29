import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import dayjs from 'dayjs'

async function calcularComissao(valor: number): Promise<number> {
    const faixa = await prisma.comissao.findFirst({
        where: {
            faixaInicial: { lte: valor },
            faixaFinal: { gte: valor }
        }
    })

    if (!faixa) {
        const maiorFaixa = await prisma.comissao.findFirst({
            orderBy: { faixaFinal: 'desc' }
        })

        if (!maiorFaixa)
            return 0

        return valor * maiorFaixa.porcentagem
    }

    return valor * faixa.porcentagem
}

async function percentualComissao(valor: number): Promise<number> {
    const faixa = await prisma.comissao.findFirst({
        where: {
            faixaInicial: { lte: valor },
            faixaFinal: { gte: valor }
        }
    })

    if (!faixa) {
        const maiorFaixa = await prisma.comissao.findFirst({
            orderBy: { faixaFinal: 'desc' }
        })

        if (!maiorFaixa)
            return 0

        return maiorFaixa.porcentagem
    }

    return faixa.porcentagem
}

export async function faturamentoRoutes(app: FastifyInstance) {
    const RESOURCE = '/vendedores/faturamento'

    app.get(RESOURCE, async () => {
        const vendedores = await prisma.vendedor.findMany({
            include: {
                vendas: true,
            }
        })

        const anoAtual = new Date().getFullYear()
        const mesAtual = dayjs().format('YYYY-MM')

        const resultado = await Promise.all(vendedores.map(async (vendedor) => {
            const vendas = vendedor.vendas

            const vendasPorMes: Record<string, number> = {}

            for (const venda of vendas) {
                const mes = dayjs(venda.createdAt).format('YYYY-MM')
                vendasPorMes[mes] = (vendasPorMes[mes] || 0) + venda.total
            }

            const porMes = await Promise.all(Object.entries(vendasPorMes).map(async ([mes, totalVendas]) => {
                const percentual = await percentualComissao(totalVendas)
                const valorComissao = await calcularComissao(totalVendas)

                return {
                    mes,
                    totalVendas,
                    percentual,
                    valorComissao,
                }
            }))

            const mesAtualData = porMes.find((item) => item.mes === mesAtual)

            const totalAnualVendas = porMes
                .filter((item) => item.mes.startsWith(anoAtual.toString()))
                .reduce((sum, item) => sum + item.totalVendas, 0)

            const totalAnualComissao = porMes
                .filter((item) => item.mes.startsWith(anoAtual.toString()))
                .reduce((sum, item) => sum + item.valorComissao, 0)

            return {
                id: vendedor.id,
                nome: vendedor.nome,
                email: vendedor.email,
                fone: vendedor.fone,
                comissoes: {
                    mesAtual: mesAtualData ?? {
                        mes: mesAtual,
                        totalVendas: 0,
                        percentual: 0,
                        valorComissao: 0
                    },
                    porMes,
                    totalAnual: {
                        ano: anoAtual,
                        totalVendas: totalAnualVendas,
                        valorComissao: totalAnualComissao,
                    },
                },
            }
        }))

        return resultado
    })
}
