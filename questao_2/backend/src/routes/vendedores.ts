import { FastifyInstance } from "fastify"
import { z }               from 'zod'
import { prisma }          from "../lib/prisma"
import { Prisma }          from '@prisma/client'

export async function vendedorRoutes(app: FastifyInstance) {
    const RESOURCE = '/vendedores'

    app.post(RESOURCE, async (request, reply) => {
        const createVendedorBody = z.object({
            nome  : z.string(),
            email : z.string().email(),
            fone  : z.string(),
        })

        const { nome, email, fone } = createVendedorBody.parse(request.body)

        try {
            const vendedor = await prisma.vendedor.create({
              data: { nome, email, fone },
            })
            return reply.status(201).send(vendedor)
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' && (err.meta as any)?.target?.includes('email')) 
                return reply.status(409).send({ message: 'E-mail já cadastrado para outro vendedor.' })

            return reply.status(500).send({ message: 'Erro ao criar vendedor.' })
        }
    })

    app.get(RESOURCE, async () => { return await prisma.vendedor.findMany() })

    app.get(`${RESOURCE}/:id`, async (request, reply) => {
        const getVendedorParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = getVendedorParams.parse(request.params)

        try {
            return await prisma.vendedor.findUniqueOrThrow({
                where: { id },
            })
        } catch (err) {
            return reply.status(404).send({ message: 'Vendedor não encontrado.' })
        }
    })

    app.put(`${RESOURCE}/:id`, async (request, reply) => {
        const putVendedorParams = z.object({
            id: z.string().uuid(),
        })

        const putVendedorBody = z.object({
            nome  : z.string().optional(),
            email : z.string().email().optional(),
            fone  : z.string().optional(), 
        })

        const { id } = putVendedorParams.parse(request.params)
        const data   = putVendedorBody.parse(request.body)

        try {
            const updated = await prisma.vendedor.update({
                where: { id },
                data,
            })

            return updated
        } catch (err) {
            return reply.status(404).send({ message: 'Vendedor não encontrado.' })
        }
    })

    app.delete(`${RESOURCE}/:id`, async (request, reply) => {
        const deleteVendedorParams = z.object({
            id: z.string().uuid(),
        })

        const { id } = deleteVendedorParams.parse(request.params)

        try {
            await prisma.venda.deleteMany({
                where: { vendedorId: id },
            })

            await prisma.vendedor.delete({
                where: { id },
            })

            return reply.status(204).send()
        } catch (err) {
            return reply.status(404).send({ message: 'Vendedor não encontrado.' })
        }
    })
}
