import { getNavBar } from '../components/navbar.js'

const URL_BASE      = 'http://localhost:3333/vendas'
const URL_VENDEDORES = 'http://localhost:3333/vendedores'
const INSERT_STATE  = 0
const EDIT_STATE    = 1

let vendas = []
let vendedores = []

$(document).ready(() => {
    $('header').append(getNavBar())

    function FetchVendedores() {
    fetch(URL_VENDEDORES)
        .then(res => res.json())
        .then(data => {
        vendedores = data
        const select = $('#vendedor-id')
        select.empty()
        vendedores.forEach(v => {
            select.append(`<option value="${v.id}">${v.nome}</option>`)
        })
        })
        .catch(console.error)
    }

    function FetchRegistros() {
        fetch(URL_BASE)
        .then(res => res.json())
        .then(data => {
            vendas = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            GerarGrid(vendas)
        })
        .catch(console.error)
    }

    function GerarGrid(dados) {
        const tableBody = $('#body-table')
        tableBody.empty()

        dados.forEach(v => {
        const dataFormatada = new Date(v.createdAt).toLocaleString('pt-BR')
        tableBody.append(`
            <tr>
            <td>${v.vendedor.nome}</td>
            <td>R$ ${v.total.toFixed(2)}</td>
            <td>${dataFormatada}</td>
            <td>
                <button type="button" class="btn btn-outline-danger btn-sm edit" data-id="${v.id}" data-bs-toggle="modal" data-bs-target="#venda-modal">
                <i class="bi bi-pen"></i>
                </button>
                <button type="button" class="btn btn-outline-danger btn-sm delete" data-id="${v.id}" data-bs-toggle="modal" data-bs-target="#confirm-delete">
                <i class="bi bi-trash"></i>
                </button>
            </td>
            </tr>
        `)
        })
    }

    $('#insert').on('click', () => {
        $('#venda-total').val('')
        $('#vendedor-id').val('')
        $('#vendedor-id').prop('disabled', false)
        $('#venda-form').removeAttr('data-id')
        $('#venda-form').attr('data-state', INSERT_STATE)
        $('#venda-modal-label').text('Inserir Venda')
    })

    $(document).on('click', '.edit', function () {
        const id = $(this).data('id')
        fetch(`${URL_BASE}/${id}`)
        .then(res => res.json())
        .then(venda => {
            $('#venda-total').val(venda.total)
            $('#vendedor-id').val(venda.vendedor.id).prop('disabled', true)
            $('#venda-form').attr('data-id', id)
            $('#venda-form').attr('data-state', EDIT_STATE)
            $('#venda-modal-label').text('Editar Venda')
        })
        .catch(console.error)
    })

    $('#save-venda').on('click', () => {
        const total = parseFloat($('#venda-total').val())
        const vendedorId = $('#vendedor-id').val()
        const state = $('#venda-form').attr('data-state')
        const id = $('#venda-form').attr('data-id')

        if (!total || !vendedorId) {
        alert('Preencha todos os campos corretamente.')
        return
        }

        const payload = JSON.stringify(state == EDIT_STATE ? { total } : { total, vendedorId })
        const method = state == EDIT_STATE ? 'PUT' : 'POST'
        const url = state == EDIT_STATE ? `${URL_BASE}/${id}` : URL_BASE

        $.ajax({
        url,
        method,
        contentType: 'application/json',
        data: payload,
        success: () => {
            bootstrap.Modal.getInstance(document.getElementById('venda-modal')).hide()
            FetchRegistros()
        },
        error: xhr => {
            let errorMessage = 'Erro ao salvar Venda'
            if (xhr.responseText) errorMessage += ': ' + xhr.responseText
            alert(errorMessage)
        }
        })
    })

    $(document).on('click', '.delete', function () {
        const id = $(this).data('id')
        $('#confirm-delete').attr('data-id', id)
    })

    $('#yes-delete').on('click', () => {
        const id = $('#confirm-delete').attr('data-id')
        $.ajax({
        url: `${URL_BASE}/${id}`,
        method: 'DELETE',
        success: () => {
            bootstrap.Modal.getInstance(document.getElementById('confirm-delete')).hide()
            FetchRegistros()
        },
        error: xhr => {
            let errorMessage = 'Erro ao deletar Venda'
            if (xhr.responseText) errorMessage += ': ' + xhr.responseText
            alert(errorMessage)
        }
        })
    })

    $('#search-input').on('input', FiltrarVendas)
    function FiltrarVendas() {
        const termo = $('#search-input').val().trim().toLowerCase()
        const filtradas = termo === '' ? vendas : vendas.filter(v => v.vendedor.nome.toLowerCase().includes(termo))
        GerarGrid(filtradas)
    }

    FetchVendedores()
    FetchRegistros()
})
