const btnAdicionarTarefa = document.querySelector('.btn-add-task');
const formAdicionarTarefa = document.querySelector('.form-add-task');
const textarea = document.querySelector('.app__form-textarea');
const ulTarefas = document.querySelector('.app__section-task-list');
const taskDescriptionDisplay = document.getElementById('taskDescriptionDisplay');
const botaoIniciarFoco = document.getElementById('startFocusButton');
const displayTimer = document.getElementById('focusTimer');
const btnLimparTarefas = document.getElementById('clearTaskButton')

//variáveis globais
let activeTaskIndex = null; //No começo nenhuma tarefa será ativa
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || []; //lista de tarefas armazenadas
let focusTimer;
let tempo = 0.1 * 60; // 6 segundos 

// Função para formatar o tempo do cronômetro
function formatarTempo(tempo) {
    const minutos = Math.floor(tempo / 60);
    const segundos = tempo % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

//Função para iniciar o cronômetro
function iniciarCronometro() {
    if (activeTaskIndex === null) {
        alert('Por favor, selecione uma tarefa para focar!');
        return;
    }
    botaoIniciarFoco.disabled = true; //desabilita o botão enquanto o cronômetro está em andamento
    focusTimer = setInterval(() => {
        tempo--;
        displayTimer.textContent = formatarTempo(tempo);

        if (tempo <= 0) {
            clearInterval(focusTimer); //Para o cronômetro
            const evento = new CustomEvent('FocoFinalizado'); // Dispara o evento customizado
            window.dispatchEvent(evento);
        }
    }, 1000);
}

//Escutando o evento customizado "FocoFinalizado"
window.addEventListener('FocoFinalizado', () => {
    if (activeTaskIndex !== null) {
        const tarefaItem = ulTarefas.children[activeTaskIndex];
        tarefaItem.classList.add('completed'); //marca como concluída
        tarefas[activeTaskIndex].completa = true; //Atualiza o estado da tarefa
        localStorage.setItem('tarefas', JSON.stringify(tarefas)); //Salva no localStorage

        const tarefaDescricao = tarefaItem.querySelector('.app__section-task-list-item-description');
        tarefaDescricao.contentEditable = 'false'; // Desabilita edição
        const botaoEditar = tarefaItem.querySelector('.app_button-edit');
        botaoEditar.disabled = true; // Desabilita o botão "Editar"
        botaoEditar.classList.add('disabled');

        taskDescriptionDisplay.innerHTML = '<p><strong>Foco Finalizado!</strong></p>';
        displayTimer.textContent = '00:00'; //reseta o cronômetro
        botaoIniciarFoco.disabled = false; //habilita o botão para reiniciar o cronômetro
        tempo = 0.1 * 60; //Reseta o tempo

        activeTaskIndex = null;
    }
});

//Função para criar o elemento de uma tarefa
function criarElementoTarefa(tarefa, index) {
    const li = document.createElement('li');
    li.classList.add('app__section-task-list-item');

    //Alternar tarefa ativa
    li.addEventListener('click', () => {
        const itensAtivos = document.querySelectorAll('.active');
        itensAtivos.forEach(item => item.classList.remove('active'));

        if (!li.classList.contains('active')) {
            li.classList.add('active');
            taskDescriptionDisplay.textContent = tarefa.descricao;
            activeTaskIndex = index;
        } else {
            li.classList.remove('active');
            taskDescriptionDisplay.textContent = '';
            activeTaskIndex = null;
        }
    });

    const paragrafo = document.createElement('p');
    paragrafo.textContent = tarefa.descricao;
    paragrafo.classList.add('app__section-task-list-item-description');

    const botaoEditar = document.createElement('button');
    botaoEditar.classList.add('app_button-edit');
    botaoEditar.textContent = 'Editar';

    botaoEditar.addEventListener('click', () => {
        const novaDescricao = prompt('Edite sua tarefa:', tarefa.descricao);
        if (novaDescricao && novaDescricao.trim()) {
            tarefa.descricao = novaDescricao;
            paragrafo.textContent = tarefa.descricao;
            localStorage.setItem('tarefas', JSON.stringify(tarefas));
        }
    });

    li.append(paragrafo, botaoEditar);
    return li;
}

//adicionar nova tarefa
btnAdicionarTarefa.addEventListener('click', () => {
    formAdicionarTarefa.classList.toggle('hidden');
});

formAdicionarTarefa.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const descricao = textarea.value.trim();
    if (!descricao) return;

    const tarefa = { descricao, completa:false };//Adiciona a propriedade 'completa'
    tarefas.push(tarefa);
    localStorage.setItem('tarefas', JSON.stringify(tarefas));

    const elementoTarefa = criarElementoTarefa(tarefa, tarefas.length - 1);
    ulTarefas.append(elementoTarefa);

    textarea.value = '';
    formAdicionarTarefa.classList.add('hidden');
});

// renderizar tarefas salvas e aplicar o estado completo
tarefas.forEach((tarefa, index) => {
    const elementoTarefa = criarElementoTarefa(tarefa, index);
    ulTarefas.append(elementoTarefa);

    // Verifica se a tarefa está completa e atualiza a interface
    if (tarefa.completa) {
        elementoTarefa.classList.add('completed');
        const tarefaDescricao = elementoTarefa.querySelector('.app__section-task-list-item-description');
        const botaoEditar = elementoTarefa.querySelector('.app_button-edit');
        botaoEditar.disabled = 'true'; //Desabilitar o botão editar
        botaoEditar.classList.add('disabled');
    }
});

// Evento para iniciar o foco
botaoIniciarFoco.addEventListener('click', iniciarCronometro);

//Evento para limpar todas as tarfeas

clearTaskButton.addEventListener('click', () => {
    tarefas = []; //Limpa a lista de tarefas
    localStorage.removeItem('tarefas'); //Limpa o localStorage
    ulTarefas.innerHTML = ''; //Limpa a interface

});