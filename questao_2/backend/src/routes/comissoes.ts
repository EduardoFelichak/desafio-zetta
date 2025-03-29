import { FastifyInstance } from "fastify"
import { prisma }          from "../lib/prisma"
import { z }               from "zod"

export async function comissaoRoutes(app: FastifyInstance) {
    const RESOURCE = '/comissoes'

    app.post(RESOURCE, async (request, reply) => {
        const createComissaoBody = z.object({
            faixaInicial : z.number().positive(),
            faixaFinal   : z.number().positive(),
            porcentagem  : z.number().positive(),
        })

        const { faixaInicial, faixaFinal, porcentagem } = createComissaoBody.parse(request.body)

        if (faixaFinal <= faixaInicial) {
            return reply.status(400).send({ message: "Faixa final deve ser maior que a faixa inicial" })
        }

        try {
            const novaComissao = await prisma.comissao.create({
                data: {
                    faixaInicial,
                    faixaFinal,
                    porcentagem,
                },
            })

            return reply.status(201).send(novaComissao)
        } catch (err) {
            return reply.status(400).send({ message: 'Erro ao criar faixa de comissão.' })
        }
    })

    app.put(`${RESOURCE}/:id`, async (request, reply) => {
        const updateComissaoParams = z.object({
            id: z.string().uuid(),
        })

        const updateComissaoBody = z.object({
            faixaInicial : z.number().positive(),
            faixaFinal   : z.number().positive(),
            porcentagem  : z.number().positive(),
        })

        const { id } = updateComissaoParams.parse(request.params)
        const { faixaInicial, faixaFinal, porcentagem } = updateComissaoBody.parse(request.body)

        if (faixaFinal <= faixaInicial) {
            return reply.status(400).send({ message: "Faixa final deve ser maior que a faixa inicial" })
        }

        try {
            const comissaoAtualizada = await prisma.comissao.update({
                where: { id },
                data: { faixaInicial, faixaFinal, porcentagem },
            })

            return reply.status(200).send(comissaoAtualizada)
        } catch (err) {
            return reply.status(404).send({ message: 'Faixa de comissão não encontrada.' })
        }
    })

    app.delete(`${RESOURCE}/:id`, async (request, reply) => {
        const deleteComissaoParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = deleteComissaoParams.parse(request.params)

        try {
            await prisma.comissao.delete({
                where: { id },
            })

            return reply.status(204).send()
        } catch (err) {
            return reply.status(404).send({ message: 'Faixa de comissão não encontrada.' })
        }
    })

    app.get(RESOURCE, async (request, reply) => {
        try {
            const comissoes = await prisma.comissao.findMany()
            return reply.status(200).send(comissoes)
        } catch (err) {
            return reply.status(500).send({ message: 'Erro ao listar faixas de comissão.' })
        }
    })

    app.get(`${RESOURCE}/:id`, async (request, reply) => {
        const getComissaoParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = getComissaoParams.parse(request.params)

        try {
            const comissao = await prisma.comissao.findUniqueOrThrow({
                where: { id },
            })

            return reply.status(200).send(comissao)
        } catch (err) {
            return reply.status(404).send({ message: 'Faixa de comissão não encontrada.' })
        }
    })
}
