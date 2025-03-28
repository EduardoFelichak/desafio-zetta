import fastify            from "fastify"
import cors               from "@fastify/cors"
import { vendedorRoutes } from "./routes/vendedores"
import { vendaRoutes }    from "./routes/vendas"
import { comissaoRoutes } from "./routes/comissoes"

const app = fastify()

app.register(cors, {
    origin: true, 
})

app.register( vendedorRoutes )
app.register( vendaRoutes    )
app.register( comissaoRoutes )

app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})