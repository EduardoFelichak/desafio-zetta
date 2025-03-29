import fastify               from "fastify"
import cors                  from "@fastify/cors"
import { vendedorRoutes }    from "./routes/vendedores"
import { vendaRoutes }       from "./routes/vendas"
import { comissaoRoutes }    from "./routes/comissoes"
import { faturamentoRoutes } from "./routes/faturamento"

const app = fastify()

app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  })

app.register( vendedorRoutes    )
app.register( vendaRoutes       )
app.register( comissaoRoutes    )
app.register( faturamentoRoutes )

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
    console.log('HTTP server running!')
})