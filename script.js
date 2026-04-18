const taskTitleInput = document.querySelector('input.input[type="text"]');
const taskDescriptionInput = document.querySelector('textarea.textarea');

const addTaskButton = document.querySelector('.control.mb-6 .button');

const taskListSection = document.querySelector('.main-container');

class Task {
	constructor(title, description = '') {
		this.id = Task.generateId();
		this.title = title;
		this.description = description;
		this.completed = false;
	}

	static generateId() {
		return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
	}
}

const tasks = [];
let editingTaskId = null;
let editingCardElement = null;

function resetFormState() {
    editingTaskId = null;
    editingCardElement = null;
    addTaskButton.textContent = 'Adicionar Tarefa';
}

function clearFormFields() {
    taskTitleInput.value = '';
    taskDescriptionInput.value = '';
}

function getCardTitle(card) {
    const titleElement = card.querySelector('.task-title');

    if (!titleElement) {
        return '';
    }

    const statusElement = titleElement.querySelector('.status-completed');

    if (statusElement) {
        statusElement.remove();
    }

    return titleElement.textContent.trim();
}

function updateTaskCardContent(card, title, description) {
    const cardContent = card.querySelector('.card-content');
    const titleElement = card.querySelector('.task-title');

    if (!cardContent || !titleElement) {
        return;
    }

    const isCompleted = Boolean(titleElement.querySelector('.status-completed'));
    titleElement.textContent = title;

    let descriptionElement = cardContent.querySelector('p:not(.task-title)');

    if (description) {
        if (!descriptionElement) {
            descriptionElement = document.createElement('p');
            descriptionElement.classList.add('mb-4');

            const buttonsContainer = cardContent.querySelector('.buttons');

            if (buttonsContainer) {
                cardContent.insertBefore(descriptionElement, buttonsContainer);
            } else {
                cardContent.appendChild(descriptionElement);
            }
        }

        descriptionElement.textContent = description;
    } else if (descriptionElement) {
        descriptionElement.remove();
    }

    setCardCompletedState(card, isCompleted);
}

function removeTaskById(taskId) {
    const taskIndex = tasks.findIndex((item) => item.id === taskId);

    if (taskIndex === -1) {
        return;
    }

    tasks.splice(taskIndex, 1);
}

function setCardCompletedState(card, isCompleted) {
    const titleElement = card.querySelector('.task-title');
    const concludeButton = card.querySelector('.button.is-primary');

    if (!titleElement || !concludeButton) {
        return;
    }

    let statusElement = titleElement.querySelector('.status-completed');

    if (isCompleted) {
        if (!statusElement) {
            statusElement = document.createElement('span');
            statusElement.classList.add('status-completed');
            statusElement.textContent = ' (Concluída)';
            titleElement.appendChild(statusElement);
        }

        titleElement.style.textDecoration = 'line-through';
        concludeButton.textContent = 'Desfazer';
        return;
    }

    if (statusElement) {
        statusElement.remove();
    }

    titleElement.style.textDecoration = 'none';
    concludeButton.textContent = 'Concluir';
}

function handleConcludeTask(event) {
    const concludeButton = event.target.closest('.button.is-primary');

    if (!concludeButton) {
        return;
    }

    const card = concludeButton.closest('.task-card');

    if (!card) {
        return;
    }

    const taskId = card.dataset.id;

    if (taskId) {
        const task = tasks.find((item) => item.id === taskId);

        if (task) {
            task.completed = !task.completed;
            setCardCompletedState(card, task.completed);
            return;
        }
    }
}

function handleRemoveTask(event) {
    const removeButton = event.target.closest('.button.custom-pink');

    if (!removeButton) {
        return;
    }

    const card = removeButton.closest('.task-card');

    if (!card) {
        return;
    }

    const taskId = card.dataset.id;

    if (editingCardElement === card || editingTaskId === taskId) {
        clearFormFields();
        resetFormState();
    }

    if (taskId) {
        removeTaskById(taskId);
    }

    card.remove();
}

function handleEditTask(event) {
    const editButton = event.target.closest('.button.is-link');

    if (!editButton) {
        return;
    }

    const card = editButton.closest('.task-card');

    if (!card) {
        return;
    }

    const taskId = card.dataset.id;

    if (taskId) {
        const task = tasks.find((item) => item.id === taskId);

        if (task) {
            taskTitleInput.value = task.title;
            taskDescriptionInput.value = task.description;
            editingTaskId = taskId;
            editingCardElement = card;
            addTaskButton.textContent = 'Salvar edição';
            return;
        }
    }
}

function createNewTask(tarefa) {
    const card = document.createElement('div');
    const cardContent = document.createElement('div');

    card.classList.add('card', 'task-card');
    card.setAttribute('data-id', tarefa.id);
    cardContent.classList.add('card-content');
    card.appendChild(cardContent);

    const titleElement = document.createElement('p');
    titleElement.classList.add('task-title', 'is-size-5');

    titleElement.textContent = tarefa.title;
    cardContent.appendChild(titleElement);
    
    if (tarefa.description) {
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = tarefa.description;
        cardContent.appendChild(descriptionElement);
    }
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons', 'mt-4');
    
    const concludeButton = document.createElement('button');
    concludeButton.classList.add('button', 'is-primary', 'is-small');
    concludeButton.textContent = 'Concluir';
    buttonsContainer.appendChild(concludeButton);
    
    const editButton = document.createElement('button');
    editButton.classList.add('button', 'is-link', 'is-small');
    editButton.textContent = 'Editar';
    buttonsContainer.appendChild(editButton);
    
    const removeButton = document.createElement('button');
    removeButton.classList.add('button', 'custom-pink', 'is-small');
    removeButton.textContent = 'Remover';
    buttonsContainer.appendChild(removeButton);
    
    cardContent.appendChild(buttonsContainer);
    setCardCompletedState(card, tarefa.completed);
    
    return card;
}

function addNewTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();
    
    if (!title) {
        return;
    }

    if (editingTaskId) {
        const task = tasks.find((item) => item.id === editingTaskId);
        const card = editingCardElement || document.querySelector(`.task-card[data-id="${editingTaskId}"]`);

        if (task) {
            task.title = title;
            task.description = description;
        }

        if (card) {
            updateTaskCardContent(card, title, description);
        }

        clearFormFields();
        resetFormState();
        return;
    }

    const newTask = new Task(title, description);
    tasks.push(newTask);

    const cardTask = createNewTask(newTask);
    taskListSection.appendChild(cardTask);

    clearFormFields();
}

addTaskButton.addEventListener('click',  addNewTask);
taskListSection.addEventListener('click', handleConcludeTask);
taskListSection.addEventListener('click', handleRemoveTask);
taskListSection.addEventListener('click', handleEditTask);

