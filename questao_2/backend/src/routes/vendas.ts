import { FastifyInstance } from "fastify"
import { z }               from 'zod'
import { prisma }          from "../lib/prisma"

export async function vendaRoutes(app: FastifyInstance) {
    const RESOURCE = '/vendas'
  
    app.post(RESOURCE, async (request, reply) => {
        const createVendaBody = z.object({
            vendedorId : z.string().uuid(),
            total      : z.number().positive(),
        })
  
        const { vendedorId, total } = createVendaBody.parse(request.body)
  
        try {
            const venda = await prisma.venda.create({
                data: { vendedorId, total },
            })

            return reply.status(201).send(venda)
        } catch (err) {
            return reply.status(400).send({ message: 'Erro ao registrar venda.' })
        }
    })
  
    app.get(RESOURCE, async () => {
        return await prisma.venda.findMany({
            include: {
                vendedor: true,
            },
        })
    })
  
    app.get(`${RESOURCE}/:id`, async (request, reply) => {
        const getVendaParams = z.object({
            id: z.string().uuid(),
        })
  
        const { id } = getVendaParams.parse(request.params)
  
        try {
            const venda = await prisma.venda.findUniqueOrThrow({
                where: { id },
                include: { vendedor: true },
            })
  
            return venda
        } catch (err) {
            return reply.status(404).send({ message: 'Venda não encontrada.' })
        }
    })
  
    app.put(`${RESOURCE}/:id`, async (request, reply) => {
        const putVendaParams = z.object({
            id: z.string().uuid(),
        })
  
        const putVendaBody = z.object({
            total: z.number().positive().optional(),
        })
  
        const { id } = putVendaParams.parse(request.params)
        const data   = putVendaBody.parse(request.body)
  
        try {
            const updated = await prisma.venda.update({
                where: { id },
                data,
            })
  
            return updated
        } catch (err) {
            return reply.status(404).send({ message: 'Venda não encontrada.' })
        }
    })
  
    app.delete(`${RESOURCE}/:id`, async (request, reply) => {
        const deleteVendaParams = z.object({
            id: z.string().uuid(),
        })
  
        const { id } = deleteVendaParams.parse(request.params)
  
        try {
            await prisma.venda.delete({
                where: { id },
            })
  
            return reply.status(204).send()
        } catch (err) {
            return reply.status(404).send({ message: 'Venda não encontrada.' })
        }
    })
  }