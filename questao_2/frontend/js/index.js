import { getNavBar } from '../components/navbar.js'

let dadosComissoes = []
let chartComissoes = null

const fmtBR = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const nomeMes = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function formatarMes(yyyyMM) {
  const [yyyy, mm] = yyyyMM.split('-')
  const index = parseInt(mm, 10) - 1
  return `${nomeMes[index] || mm}/${yyyy}`
}

$(document).ready(() => {
  $('header').append(getNavBar())
  fetch('http://localhost:3333/vendedores/comissoes')
    .then(res => res.json())
    .then(data => {
      dadosComissoes = data
      popularSelectVendedores(data)
      let vendorWithLatestSale = null
      let latest = '0000-00'
      data.forEach(v => {
        v.comissoes.porMes.forEach(pm => {
          if (pm.mes > latest) {
            latest = pm.mes
            vendorWithLatestSale = v
          }
        })
      })
      if (vendorWithLatestSale) {
        $('#select-vendedor').val(vendorWithLatestSale.id)
        atualizarDashboard(vendorWithLatestSale)
      }
    })
    .catch(console.error)

  $('#select-vendedor').on('change', function () {
    const vendedorId = $(this).val()
    const vendedor = dadosComissoes.find(v => v.id === vendedorId)
    if (vendedor) {
      atualizarDashboard(vendedor)
    }
  })

  $('#mes-filtro').on('input', function () {
    const mesSelecionado = $(this).val()
    const vendedorId = $('#select-vendedor').val()
    const vendedor = dadosComissoes.find(v => v.id === vendedorId)
    if (!vendedor) return
    atualizarTotaisMes(vendedor, mesSelecionado)
  })
})

function popularSelectVendedores(vendedores) {
  const $select = $('#select-vendedor')
  $select.empty()
  $select.append('<option disabled selected>Escolha um vendedor</option>')
  vendedores.forEach(v => {
    $select.append(`<option value="${v.id}">${v.nome}</option>`)
  })
}

function atualizarDashboard(vendedor) {
  $('#total-ano-vendas').text(fmtBR.format(vendedor.comissoes.totalAnual.totalVendas))
  $('#total-ano-comissao').text(fmtBR.format(vendedor.comissoes.totalAnual.valorComissao))
  gerarGraficoComissoes(vendedor)
  const porMesDesc = [...vendedor.comissoes.porMes].sort((a, b) => b.mes.localeCompare(a.mes))
  if (porMesDesc.length > 0) {
    const ultimoMes = porMesDesc[0].mes
    $('#mes-filtro').val(ultimoMes)
    atualizarTotaisMes(vendedor, ultimoMes)
  } else {
    $('#mes-filtro').val('')
    $('#total-mes-vendas').text('0,00')
    $('#total-mes-comissao').text('0,00')
  }
}

function gerarGraficoComissoes(vendedor) {
  const porMesDesc = [...vendedor.comissoes.porMes].sort((a, b) => b.mes.localeCompare(a.mes))
  const ultimos3 = porMesDesc.slice(0, 3).reverse()
  const labels = ultimos3.map(item => formatarMes(item.mes))
  const dataComissao = ultimos3.map(item => item.valorComissao)
  if (chartComissoes) {
    chartComissoes.destroy()
    chartComissoes = null
  }
  const ctx = document.getElementById('graficoComissoes').getContext('2d')
  chartComissoes = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Comissão (R$)',
        data: dataComissao,
        backgroundColor: '#dc3545',
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => fmtBR.format(context.parsed.y)
          }
        }
      }
    }
  })
}

function atualizarTotaisMes(vendedor, mesSelecionado) {
  if (!mesSelecionado) {
    $('#total-mes-vendas').text('0,00')
    $('#total-mes-comissao').text('0,00')
    return
  }
  const itemMes = vendedor.comissoes.porMes.find(m => m.mes === mesSelecionado)
  if (!itemMes) {
    $('#total-mes-vendas').text('0,00')
    $('#total-mes-comissao').text('0,00')
  } else {
    $('#total-mes-vendas').text(fmtBR.format(itemMes.totalVendas))
    $('#total-mes-comissao').text(fmtBR.format(itemMes.valorComissao))
  }
}
