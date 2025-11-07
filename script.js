(() => {
    const lista = document.getElementById('lista');
    const limparBtn = document.getElementById('limpar');
    const campoBusca = document.getElementById('campoBusca');

    const modalContainer = document.getElementById('modal-container');
    const formEditar = {
        titulo: document.getElementById('tituloEdit'),
        imagem: document.getElementById('imagemEdit'),
        data: document.getElementById('dataEdit'),
        publisher: document.getElementById('publisherEdit'),
        dev: document.getElementById('devEdit'),
        link: document.getElementById('linkEdit')
    };
    const salvarEditBtn = document.getElementById('salvarEdit');
    const cancelarEditBtn = document.getElementById('cancelarEdit');

    let indexEditando = null;

    // storage helpers
    const getJogos = () => JSON.parse(localStorage.getItem('jogos')) || [];
    const salvarJogos = (jogos) => localStorage.setItem('jogos', JSON.stringify(jogos));

    // render
    const renderizarJogos = (filtro = '') => {
        if (!lista) return;
        const termos = (filtro || '').toLowerCase().trim();
        const jogos = getJogos().filter(j => {
            if (!termos) return true;
            return (j.titulo || '').toLowerCase().includes(termos)
                || (j.publisher || '').toLowerCase().includes(termos)
                || (j.dev || '').toLowerCase().includes(termos);
        });

        lista.innerHTML = jogos.length
            ? jogos.map((j, i) => `
                <div class="jogo-card">
                    <h3>${escapeHtml(j.titulo)}</h3>
                    ${j.imagem ? `<img src="${escapeHtml(j.imagem)}" alt="${escapeHtml(j.titulo)}">` : ''}
                    <p><strong>Data:</strong> ${escapeHtml(j.data || '-')}</p>
                    <p><strong>Publisher:</strong> ${escapeHtml(j.publisher || '-')}</p>
                    <p><strong>Desenvolvedora:</strong> ${escapeHtml(j.dev || '-')}</p>
                    ${j.link ? `<p><a href="${escapeHtml(j.link)}" target="_blank" rel="noopener">Página do Jogo</a></p>` : ''}
                    <button data-action="editar" data-index="${i}" class="btn-editar">Editar</button>
                    <button data-action="excluir" data-index="${i}" class="btn-excluir">Excluir</button>
                </div>
            `).join('')
            : `<p>Nenhum jogo encontrado.</p>`;
    };

    // simples escape para evitar injeção de HTML via localStorage
    function escapeHtml(text) {
        if (!text && text !== '') return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // excluir
    const excluirJogo = (index) => {
        const jogos = getJogos();
        if (!jogos[index]) return;
        if (!confirm(`Tem certeza que deseja excluir "${jogos[index].titulo}"?`)) return;
        jogos.splice(index,1);
        salvarJogos(jogos);
        renderizarJogos(campoBusca?.value);
    };

    // abrir edição
    const editarJogo = (index) => {
        const jogos = getJogos();
        const jogo = jogos[index];
        if (!jogo) return;

        indexEditando = index;
        formEditar.titulo.value = jogo.titulo || '';
        formEditar.imagem.value = jogo.imagem || '';
        formEditar.data.value = jogo.data || '';
        formEditar.publisher.value = jogo.publisher || '';
        formEditar.dev.value = jogo.dev || '';
        formEditar.link.value = jogo.link || '';

        showModal();
        formEditar.titulo.focus();
    };

    // salvar edição
    const salvarEdicao = () => {
        if (indexEditando == null) return;
        const jogos = getJogos();

        const atualizado = {
            titulo: formEditar.titulo.value.trim(),
            imagem: formEditar.imagem.value.trim(),
            data: formEditar.data.value.trim(),
            publisher: formEditar.publisher.value.trim(),
            dev: formEditar.dev.value.trim(),
            link: formEditar.link.value.trim()
        };

        if (!atualizado.titulo) {
            alert("O título não pode ficar em branco!");
            formEditar.titulo.focus();
            return;
        }

        jogos[indexEditando] = atualizado;
        salvarJogos(jogos);
        closeModal();
        renderizarJogos(campoBusca?.value);
    };

    // modal helpers
    function showModal() {
        if (!modalContainer) return;
        modalContainer.classList.add('show');
        modalContainer.setAttribute('aria-hidden','false');
    }
    function closeModal() {
        if (!modalContainer) return;
        modalContainer.classList.remove('show');
        modalContainer.setAttribute('aria-hidden','true');
        indexEditando = null;
        // limpa inputs por segurança
        Object.values(formEditar).forEach(inp => inp.value = '');
    }

    // eventos delegados na lista
    if (lista) {
        lista.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const acao = btn.dataset.action;
            const idx = Number(btn.dataset.index);
            if (acao === 'excluir') excluirJogo(idx);
            if (acao === 'editar') editarJogo(idx);
        });
    }

    // limpar biblioteca
    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            if (confirm('Deseja apagar todos os jogos?')) {
                localStorage.removeItem('jogos');
                renderizarJogos();
            }
        });
    }

    // busca em tempo real
    if (campoBusca) {
        campoBusca.addEventListener('input', (e) => {
            renderizarJogos(e.target.value);
        });
    }

    // botões do modal
    if (salvarEditBtn) salvarEditBtn.addEventListener('click', salvarEdicao);
    if (cancelarEditBtn) cancelarEditBtn.addEventListener('click', () => {
        closeModal();
        renderizarJogos(campoBusca?.value);
    });

    // fechar modal clicando no backdrop
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModal();
                renderizarJogos(campoBusca?.value);
            }
        });
    }

    // inicialização
    renderizarJogos();

})();