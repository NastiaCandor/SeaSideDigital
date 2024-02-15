export default class Todo {
  constructor() {
    this.form = document.querySelector('.todo__form');
    this.list = document.querySelector('.todo__list');
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

      // addint it to the list
      this.addTask(task);
      // clear form inputs
      this.form.reset();
    });
  }

  // add new task to the list
  addTask(task) {
    // template for new task
    const template = `
      <div class="todo__task" data-task-state="active">
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
        const newState = target.checked ? 'done' : 'active';
        // change task state
        task.setAttribute('data-task-state', newState);
      }

      // clicked task remove button
      if (target.classList.contains('todo__task-remove')) {
        const task = target.closest('.todo__task');
        task.remove();
      }
    });
  }
}