const LS_NAME = 'nastiacandor-todo'; // Local Storage name

export default class Todo {
  constructor() {
    this.form = document.querySelector('.todo__form');
    this.list = document.querySelector('.todo__list');
    this.storage = this.restoreFromLocalStorage();
  }

  init() {
    this.activateForm();
    this.activateList();
  }

  // Task adding functionality
  activateForm() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      // collecting task info
      const formData = new FormData(this.form);
      const task = {};
      formData.forEach(function(value, key){
        task[key] = value;
      });

      task.state = 'active';
      task.id = this.storage.length > 0 ? this.storage[this.storage.length - 1].id + 1 : 0;

      // addint it to the list
      this.addTask(task);
      // add task to local storage
      this.addTaskToLocalStorrage(task);
      // clear form inputs
      this.form.reset();
    });
  }

  addTaskToLocalStorrage(task) {
    this.storage.push(task);
    // update local storage
    this.updateLocalStorage();
  }

  // add new task to the list
  addTask(task) {
    // template for new task
    const template = `
      <div class="todo__task" data-task-state="${task.state}" id="${task.id}">
        <input type="checkbox" class="todo__task-state">
        <div class="todo__task-text">
          <p class="todo__task-title tl3">${task.taskTitle}</p>
          <p class="todo__task-desc txt20">${task.taskDesc}</p>
        </div>
        <button class="todo__task-remove tl3">x</button>
      </div>
    `;
    // adding it to the list
    this.list.innerHTML += template;
  }

  // add tasks functionality
  activateList() {
    this.list.addEventListener('click', (e) => {
      const target = e.target;

      // clicked task state
      if (target.classList.contains('todo__task-state')) {
        const task = target.closest('.todo__task');
        const id = task.getAttribute('id');
        const newState = target.checked ? 'done' : 'active';
        // change task state
        task.setAttribute('data-task-state', newState);
        this.updateTaskState(Number(id), newState);
      }

      // clicked task remove button
      if (target.classList.contains('todo__task-remove')) {
        const task = target.closest('.todo__task');
        task.remove();
        const id = task.getAttribute('id');
        this.removeFromLocalStorage(Number(id));
      }
    });
    this.fillList(this.storage);
  }

  updateTaskState(id, newState) {
    this.storage.forEach((task) => {
      if (task.id === id) {
        task.state = newState;
      }
    });
    // update local storage
    this.updateLocalStorage();
  }

  // remove task from localStorage
  removeFromLocalStorage(id) {
    // delete task from storage
    this.storage = this.storage.filter(task => task.id !== id);
    // update local storage
    this.updateLocalStorage();
  }

  // restore all task from local storage
  // work once when the page is loaded/reloaded
  restoreFromLocalStorage() {
    const storage = localStorage.getItem(LS_NAME);
    return storage === null ? [] : JSON.parse(storage);
  }

  fillList(list) {
    list.forEach((task) => {
      this.addTask(task);
    });
  }

  updateLocalStorage() {
    localStorage.setItem(LS_NAME, JSON.stringify(this.storage));
  }
}