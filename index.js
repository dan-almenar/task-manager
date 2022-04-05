// Saludo
console.log('¡Bienvenidos al Administrador de Tareas!')

// DOM elements
const form = document.querySelector('form')
const taskTitle = document.getElementById('task-title')
const taskDescription = document.getElementById('task-description')
const taskDate = document.getElementById('task-date')
const taskUrgent = document.getElementById('task-urgent')
const currentTasks = document.getElementById('current-tasks')
const addTaskBtn = document.getElementById('add-task-btn')
const updateTaskBtn = document.getElementById('update-task-btn')

// botones para ser añadidos a cada tarea (al crearlas o editarlas):
const createEditButton = () => {
    const editButton = document.createElement('button')
    editButton.classList.add('btn', 'hidden', 'material-icons')
    editButton.innerHTML = 'edit'
    return editButton
}

const createDeleteButton = () => {
    const deleteButton = document.createElement('button')
    deleteButton.classList.add('btn', 'hidden', 'material-icons')
    deleteButton.innerHTML = 'delete'
    return deleteButton
}

// Revisamos si hay tareas guardadas en el localStorage o inicializamos un arreglo vacío en su defecto
let tasks = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks')) : []

// callback function para eliminar tasks
const deleteTask = (id) => {
    event.stopPropagation()
    const selectedTask = document.getElementById(id)

    for (task of tasks) {
        if (task.id == id) {
            tasks.splice(tasks.indexOf(task), 1)
        }
    }
    saveTasks(tasks)
    selectedTask.remove()

    // Limpiamos el formulario por si fue pulsado el botón de editar
    clearForm()
}

// callback function para editar tasks
const editTask = (id) => {
    event.stopPropagation()
    // cambiar botón de añadir por el botón de actualizar
    addTaskBtn.classList.add('hidden')
    updateTaskBtn.classList.remove('hidden')

    /*
    Asignándole al botón de 'Actualizar' el valor del ID de la tarea a editar
    garantizamos que:
    1. Podamos encontrar la tarea en la lista de tareas guardadas (tasks)
    2. El botón de 'Actualizar' únicamente actualizará la tarea seleccionada.
    
    En la función updateTask puede apreciarse cómo se comparan los IDs de las tareas
    con el valor del botón de 'Actualizar'.
    */
    updateTaskBtn.value = id

    // identificar la tarea entre las exisstentes en el DOM
    const selectedTask = document.getElementById(id)

    // precargar el formulario con la data actual de la tarea:
    for (task of tasks) {
        if (task.id == id) {
            taskTitle.value = task.title
            taskDescription.value = task.description
            taskDate.value = task.date.iso
            taskUrgent.checked = task.urgent
        }
    }
}

const updateTask = () => {
    console.log()
    // buscar la tarea seleccionada en el arreglo de tareas
    const taskFromSaved = tasks.find(task => task.id == updateTaskBtn.value)

    // actualizar data de la tarea
    taskFromSaved.title = taskTitle.value
    taskFromSaved.description = taskDescription.value
    taskFromSaved.date.iso = taskDate.value
    taskFromSaved.urgent = taskUrgent.checked

    if (taskFromSaved.date.iso) {
        taskFromSaved.date.human = new Intl.DateTimeFormat('es-AR', {
            weekday: "long",
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(taskFromSaved.date.iso))
    }

    // actualizar el DOM
    for (child of currentTasks.children) {
        if (child.id == updateTaskBtn.value) {
            // emulamos el procedimiento de crear una tarea en el DOM

            taskFromSaved.urgent ? child.classList.add('task-urgent') : child.classList.remove('task-urgent')

            child.innerHTML = `<h3 class="task-title">${taskFromSaved.title}</h3>`

            if (taskFromSaved.description) {
                child.innerHTML += `<p class="task-description">${taskFromSaved.description}</p>`
            }
            if (taskFromSaved.date.iso) {
                child.innerHTML += `<p class="task-deadline">${taskFromSaved.date.human}</p>`
            }
            
            // agregar botones de edición y eliminación
            child.appendChild(createEditButton())
            child.appendChild(createDeleteButton())
            
            child.classList.toggle('task-active')
        }
    }

    // actualizar lista de tareas en el localStorage
    saveTasks(tasks)

    // limpiar el formulario
    clearForm()
    updateTaskBtn.classList.add('hidden')
    addTaskBtn.classList.remove('hidden')
}

// toggleActive es el callback para el 'click' event del TaskElement creado por addTask
const toggleActive = (id) => {
    const selectedTask = document.getElementById(id)
    
    selectedTask.classList.toggle('task-active')

    if (selectedTask.classList.contains('task-active')) {
       // mostrar botones de edición y borrado
       for (child of selectedTask.children) {
           console.log(child)
           child.classList.remove('hidden')

           // añadirles event listeners
           if (child.innerHTML == 'edit') {
               child.addEventListener('click', editTask.bind(this, id))
           }
           if (child.innerHTML == 'delete') {
               child.addEventListener('click', deleteTask.bind(this, id))
           }
       } 
    } else {
        // ocultar botones de edición y borrado
        for (child of selectedTask.children) {
            if (child.classList.contains('btn')) {
                child.classList.add('hidden')
            }
        }
    }

}

// Añadir tareas al DOM
const addTaskToDOM = (task) => {
    // crear nuevo elemento
    const taskElement = document.createElement('div')
    taskElement.id = task.id
    taskElement.classList.add('task')
    taskElement.classList.add('box')
    taskElement.classList.add('m-5')

    task.urgent ? taskElement.classList.add('task-urgent') : taskElement.classList = taskElement.classList

    
    taskElement.innerHTML = `<h3 class="task-title">${task.title}</h3>`
    
    if (task.description != ''){
        taskElement.innerHTML = taskElement.innerHTML + `<p class="task-description">${task.description}</p>`
    }
    if (task.date.human){
        taskElement.innerHTML = taskElement.innerHTML + `<p class="task-deadline">${task.date.human}</p>`
    }

    // añadir botones al task element
    taskElement.appendChild(createEditButton())
    taskElement.appendChild(createDeleteButton())

    // añadirle un eventListener para habilitar selección
    taskElement.addEventListener('click', toggleActive.bind(this, taskElement.id))

    // añadirlo al DOM
    currentTasks.appendChild(taskElement)
}

// función para crear tareas
const createTask = () => {
    // convertir fechas ISO a localeString (lectura humana)
    const date = ()=> {
        if (!taskDate.value) {
            return null
        } else {
            return new Date(taskDate.value).toLocaleDateString('es-AR', {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC"
            })
        }
    }

    const task = {
        id: tasks.length +1,
        title: taskTitle.value,
        description: taskDescription.value,
        date: {
            human: date(),
            iso: taskDate.value
        },
        urgent: taskUrgent.checked,
        isActive: false
    }

    // Agregar la tarea a la lista de tareas
    tasks.push(task)

    // Agregar tarea al DOM
    addTaskToDOM(task)

    // Sobreescribir el localStorage
    saveTasks(tasks)

    // Limpiar el formulario
    clearForm()
}

// Si hay tareas guardadas en el localStorage, las añadimos al DOM
if (tasks.length > 0) {
    tasks.forEach((task) => {
        addTaskToDOM(task)
    })
}

// Leer datos del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault()
    // identificar si el botón es el de añadir o el de actualizar
    if (e.submitter === updateTaskBtn) {
        console.log(e.submitter.value)
        updateTask()
    } else {
        // el botón utilizado fue el de añadir
        createTask()
    }
})

// Guardar la lista de tareas en el localStorage
const saveTasks = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

// Limpiar el formulario
const clearForm = () => {
    taskTitle.value = null
    taskDescription.value = null
    taskDate.value = null
    taskUrgent.checked = false
}

// service worker para funcionalidad de PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
}