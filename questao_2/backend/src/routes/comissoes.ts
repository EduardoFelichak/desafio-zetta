import { FastifyInstance } from 'fastify'
import { prisma }          from '../lib/prisma'
import dayjs               from 'dayjs'

function calcularComissao(valor: number): number {
    if (valor <= 1000  ) return valor * 0.05
    if (valor <= 10000 ) return valor * 0.10
    if (valor <= 100000) return valor * 0.20
    return valor * 0.30
}

function percentualComissao(valor: number): number {
    if (valor <= 1000  ) return 0.05
    if (valor <= 10000 ) return 0.10
    if (valor <= 100000) return 0.20
    return 0.30
}

export async function comissaoRoutes(app: FastifyInstance) {
    const RESOURCE = '/vendedores/comissoes'

    app.get(RESOURCE, async () => {
        const vendedores = await prisma.vendedor.findMany({
            include: {
                vendas: true,
            }
        })

        const anoAtual = new Date().getFullYear()
        const mesAtual = dayjs().format('YYYY-MM')

        return vendedores.map((vendedor) => {
            const vendas = vendedor.vendas

            const vendasPorMes: Record<string, number> = {}

            for (const venda of vendas) {
                const mes = dayjs(venda.createdAt).format('YYYY-MM')
                vendasPorMes[mes] = (vendasPorMes[mes] || 0) + venda.total
            }

            const porMes = Object.entries(vendasPorMes).map(([mes, totalVendas]) => {
                return {
                    mes,
                    totalVendas,
                    percentual    : percentualComissao(totalVendas),
                    valorComissao : calcularComissao(totalVendas),
                }
            })

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
                        mes           : mesAtual,
                        totalVendas   : 0,
                        percentual    : 0,
                        valorComissao : 0
                    },
                    porMes,
                    totalAnual: {
                        ano           : anoAtual,
                        totalVendas   : totalAnualVendas,
                        valorComissao : totalAnualComissao,
                    },
                },
            }
        })
    })
}