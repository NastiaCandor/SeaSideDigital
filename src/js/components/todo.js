const LS_NAME = 'nastiacandor-todo'; // Local Storage name

export default class Todo {
  constructor() {
    this.form = document.querySelector('.todo__form');
    this.list = document.querySelector('.todo__list');
    this.filters = document.querySelectorAll('.todo__filter-input');
    this.storage = this.restoreFromLocalStorage();
  }

  // Инициализация
  init() {
    this.activateForm();
    this.activateList();
    this.activateFilter();
  }

  // Функционал добавления новой задачи
  activateForm() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      // сбор данных новой задачи
      const formData = new FormData(this.form);
      const task = {};
      formData.forEach(function(value, key){
        task[key] = value;
      });

      // Подготовка состояния задачи
      task.state = 'active';
      task.id = this.storage.length > 0 ? this.storage[this.storage.length - 1].id + 1 : 0;

      // добавление задачи в список
      this.addTaskToDOM(task);
      // добавление задачи в local storage
      this.addTaskToLocalStorrage(task);
      // очистка формы новой задачи
      this.form.reset();
    });
  }

  // Функционал фильтрации списка задач
  activateFilter() {
    this.filters.forEach((filter) => {
      filter.addEventListener('click', () => {
        // очистка списка в DOM
        this.clearList();
        // если все задачи, то вывести все задачи в DOM
        if (filter.value === 'all') {
          this.fillList(this.storage);
        } else {
          // если фильт, то составляется новый массив согласно фильтру, затем вывод задачи в DOM
          const newList = this.storage.filter(task => task.state === filter.value);
          this.fillList(newList);
        }
      })
    });
  }

  // Добавление задачи в local storage
  addTaskToLocalStorrage(task) {
    this.storage.push(task);
    // update local storage
    this.updateLocalStorage();
  }

  // Добавление новой задачи в список
  addTaskToDOM(task) {
    // шаблон новой задачи
    const template = `
      <div class="todo__task" data-task-state="${task.state}" id="${task.id}">
        <input type="checkbox" class="todo__task-state" ${task.state === 'done' ? 'checked' : ''}>
        <div class="todo__task-text">
          <p class="todo__task-title tl3">${task.taskTitle}</p>
          <p class="todo__task-desc txt20">${task.taskDesc.replaceAll('\n', '<br>')}</p>
        </div>
        <button class="todo__task-remove tl3">x</button>
      </div>
    `;
    // добавление задачи в конец списка
    this.list.innerHTML += template;
  }

  // Функционал списка задач
  activateList() {
    this.list.addEventListener('click', (e) => {
      const target = e.target;

      // клик по статусу задачи
      if (target.classList.contains('todo__task-state')) {
        const task = target.closest('.todo__task');
        const id = task.getAttribute('id');
        const newState = target.checked ? 'done' : 'active';
        // изменение статуса задачи в input
        target.checked ? target.setAttribute('checked', '') : target.removeAttribute('checked'); 
        // изменение статуса задачи todo__task
        task.setAttribute('data-task-state', newState);
        // обновление статуса задачи в storage
        this.updateTaskStateStorage(Number(id), newState);
      }

      // клик по удалению задачи
      if (target.classList.contains('todo__task-remove')) {
        const task = target.closest('.todo__task');
        // удаление задачи в DOM
        task.remove();
        const id = task.getAttribute('id');
        // удаление задачи в local storage
        this.removeFromLocalStorage(Number(id));
      }
    });
    // заполнение списка, срабатывает при открывании страницы
    this.fillList(this.storage);
  }

  // Обновление состояния задачи в local storage
  updateTaskStateStorage(id, newState) {
    this.storage.forEach((task) => {
      if (task.id === id) {
        task.state = newState;
      }
    });
    // обновление local storage
    this.updateLocalStorage();
  }

  // Удаление задачи из localStorage
  removeFromLocalStorage(id) {
    // удаление задачи из storage
    this.storage = this.storage.filter(task => task.id !== id);
    // обнолвение local storage
    this.updateLocalStorage();
  }

  // Получение данных из local storage
  restoreFromLocalStorage() {
    const storage = localStorage.getItem(LS_NAME);
    return storage === null ? [] : JSON.parse(storage);
  }

  // Заполнение списка задачи
  fillList(list) {
    list.forEach((task) => {
      this.addTaskToDOM(task);
    });
  }

  clearList() {
    this.list.innerHTML = '';
  }

  // Обновление local storage
  updateLocalStorage() {
    localStorage.setItem(LS_NAME, JSON.stringify(this.storage));
  }
}