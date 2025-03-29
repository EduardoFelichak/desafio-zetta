import { getNavBar } from '../components/navbar.js'

const URL_BASE = 'http://localhost:3333/comissoes'
const INSERT_STATE = 0
const EDIT_STATE = 1

let comissoes = []

$(document).ready(() => {
    $('header').append(getNavBar())

    function FetchRegistros() {
        fetch(URL_BASE)
            .then(res => res.json())
            .then(data => {
                comissoes = data.sort((a, b) => a.faixaInicial - b.faixaInicial) 
                GerarGrid(comissoes)
            })
            .catch(console.error)
    }

    function GerarGrid(dados) {
        let tableBody = $('#body-table')
        tableBody.empty()

        dados.forEach(comissao => {
            tableBody.append(`
                <tr>
                    <td>R$ ${comissao.faixaInicial.toFixed(2)}</td>
                    <td>R$ ${comissao.faixaFinal.toFixed(2)}</td>
                    <td>${comissao.porcentagem * 100}%</td>
                    <td>
                        <button type="button" class="btn btn-outline-danger btn-sm edit" data-id="${comissao.id}" data-bs-toggle="modal" data-bs-target="#comissao-modal">
                            <i class="bi bi-pen"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete" data-id="${comissao.id}" data-bs-toggle="modal" data-bs-target="#confirm-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `)
        })
    }

    $('#insert').on('click', () => {
        $('#faixa-inicial').val('')
        $('#faixa-final').val('')
        $('#porcentagem').val('')
        $('#comissao-form').removeAttr('data-id')
        $('#comissao-form').attr('data-state', INSERT_STATE)
        $('#comissao-modal-label').text('Inserir Comissão')
    })

    $(document).on('click', '.edit', function() {
        const id = $(this).data("id")
        fetch(`${URL_BASE}/${id}`)
            .then(res => res.json())
            .then(comissao => {
                $('#faixa-inicial').val(comissao.faixaInicial)
                $('#faixa-final').val(comissao.faixaFinal)
                $('#porcentagem').val(comissao.porcentagem)

                $('#comissao-form').attr('data-id', id)
                $('#comissao-form').attr('data-state', EDIT_STATE)
                $('#comissao-modal-label').text('Editar Comissão')
            })
            .catch(console.error)
    })

    $('#save-comissao').on('click', () => {
        const faixaInicial = parseFloat($('#faixa-inicial').val())
        const faixaFinal = parseFloat($('#faixa-final').val())
        const porcentagem = parseFloat($('#porcentagem').val())
        const state = $('#comissao-form').attr('data-state')
        const id = $('#comissao-form').attr('data-id')

        if (!faixaInicial || !faixaFinal || !porcentagem) {
            alert('Preencha todos os campos corretamente.')
            return
        }

        const payload = JSON.stringify({ faixaInicial, faixaFinal, porcentagem })
        const method = state == EDIT_STATE ? 'PUT' : 'POST'
        const url = state == EDIT_STATE ? `${URL_BASE}/${id}` : URL_BASE

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: payload,
            success: () => {
                bootstrap.Modal.getInstance(document.getElementById('comissao-modal')).hide()
                FetchRegistros()
            },
            error: (xhr) => {
                let errorMessage = 'Erro ao salvar Comissão'
                if (xhr.responseText) errorMessage += ': ' + xhr.responseText
                alert(errorMessage)
            }
        })
    })

    $(document).on('click', '.delete', function() {
        const id = $(this).data("id")
        $('#confirm-delete').attr('data-id', id)
    })

    $('#yes-delete').on('click', function() {
        const id = $('#confirm-delete').attr('data-id')

        $.ajax({
            url: `${URL_BASE}/${id}`,
            method: 'DELETE',
            success: () => {
                bootstrap.Modal.getInstance(document.getElementById('confirm-delete')).hide()
                FetchRegistros()
            },
            error: (xhr) => {
                let errorMessage = 'Erro ao deletar Comissão'
                if (xhr.responseText) errorMessage += ': ' + xhr.responseText
                alert(errorMessage)
            }
        })
    })

    FetchRegistros()
})
