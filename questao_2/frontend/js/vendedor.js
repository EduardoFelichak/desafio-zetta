import { getNavBar } from '../components/navbar.js'

const URL_BASE = 'http://localhost:3333/vendedores'
const INSERT_STATE = 0
const EDIT_STATE   = 1

let vendedores = []

$(document).ready(() => {
    $('header').append(getNavBar())

    function FetchRegistros() {
        fetch(URL_BASE)
            .then((res) => res.json())
            .then((dados) => {
                vendedores = dados
                GerarGrid(vendedores)
            })
            .catch(console.error)
    }

    function GerarGrid(dados) {
        let tableBody = $('#body-table')
        tableBody.empty()

        dados.forEach(vendedor => {
            tableBody.append(`
                <tr>
                    <td>${vendedor.nome}</td>
                    <td>${vendedor.email}</td>
                    <td>${vendedor.fone}</td>
                    <td>
                        <button type="button" class="btn btn-outline-danger btn-sm edit" data-id="${vendedor.id}" data-bs-toggle="modal" data-bs-target="#vendedor-modal">
                            <i class="bi bi-pen"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-sm delete" data-id="${vendedor.id}" data-bs-toggle="modal" data-bs-target="#confirm-delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>    
            `)
        })
    }

    $('#insert').on('click', () => {
        $('#vendedor-nome').val('')
        $('#vendedor-email').val('')
        $('#vendedor-fone').val('')
        $('#vendedor-form').removeAttr('data-id')
        $('#vendedor-form').attr('data-state', INSERT_STATE)
        $('#modal-label-form').text('Inserir Vendedor')
    })

    $(document).on('click', '.edit', function() {
        const id = $(this).data("id")
        fetch(`${URL_BASE}/${id}`)
            .then(res => res.json())
            .then(vendedor => {
                $('#vendedor-nome').val(vendedor.nome)
                $('#vendedor-email').val(vendedor.email)
                $('#vendedor-fone').val(vendedor.fone)

                $('#vendedor-form').attr('data-id', id)
                $('#vendedor-form').attr('data-state', EDIT_STATE)
                $('#modal-label-form').text('Editar Vendedor')
            })
            .catch(console.error)
    })

    $('#save-vendedor').on('click', () => {
        const nome  = $('#vendedor-nome').val().trim()
        const email = $('#vendedor-email').val().trim()
        const fone  = $('#vendedor-fone').val().trim()
        const state = $('#vendedor-form').attr('data-state')
        const id    = $('#vendedor-form').attr('data-id')

        if (!nome || !email || !fone) {
            alert('Preencha os campos obrigatórios: Nome, Email e Telefone.')
            return
        }

        const payload = JSON.stringify({ nome, email, fone })
        const method = state == EDIT_STATE ? 'PUT' : 'POST'
        const url = state == EDIT_STATE ? `${URL_BASE}/${id}` : URL_BASE

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: payload,
            success: () => {
                bootstrap.Modal.getInstance(document.getElementById('vendedor-modal')).hide()
                FetchRegistros()
            },
            error: (xhr) => {
                let errorMessage = 'Erro ao salvar Vendedor'
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
                let errorMessage = 'Erro ao deletar Vendedor'
                if (xhr.responseText) errorMessage += ': ' + xhr.responseText
                alert(errorMessage)
            }
        })
    })

    function FiltrarVendedores() {
        const searchType = $('#search-type').val()
        const searchTerm = $('#search-input').val().trim().toLowerCase()

        if (searchTerm === '') {
            GerarGrid(vendedores)
        } else {
            const filtrados = vendedores.filter(v => {
                if (searchType === 'nome') return v.nome.toLowerCase().includes(searchTerm)
                if (searchType === 'email') return v.email.toLowerCase().includes(searchTerm)
                return false
            })
            GerarGrid(filtrados)
        }
    }

    $('#search-input').on('input', FiltrarVendedores)
    $('#search-type').on('change', () => {
        $('#search-input').val('')
        FiltrarVendedores()
    })

    FetchRegistros()
})