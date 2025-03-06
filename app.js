document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const todoInput = document.getElementById('todo-input');
    const addButton = document.getElementById('add-button');
    const todoList = document.getElementById('todo-list');
    const categorySelect = document.getElementById('category-select');
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
    const themeToggle = document.getElementById('theme-toggle');
    const foodsCounter = document.getElementById('foods-counter');
    const activitiesCounter = document.getElementById('activities-counter');
    const totalCounter = document.getElementById('total-counter');
    const nextResetDate = document.getElementById('next-reset-date');
    const historyList = document.getElementById('history-list');
    
    // Load data from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let counters = JSON.parse(localStorage.getItem('counters')) || { foods: 0, activities: 0, total: 0 };
    
    // Recalculate counters to ensure accuracy
    recalculateCounters();
    
    // Sort todos alphabetically
    sortTodosAlphabetically();
    
    let history = JSON.parse(localStorage.getItem('history')) || [];
    let lastResetTime = localStorage.getItem('lastResetTime') || null;
    
    // Initialize theme
    initTheme();
    
    // Check if we need to reset (if it's been a week since last reset)
    checkAndResetIfNeeded();
    
    // Update counters display
    updateCountersDisplay();
    
    // Update next reset date display
    updateNextResetDate();
    
    // Render existing todos
    renderTodos();
    
    // Render history
    renderHistory();
    
    // Add event listeners
    addButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    filterCategory.addEventListener('change', renderTodos);
    filterStatus.addEventListener('change', renderTodos);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Set up a timer to check for reset every minute
    setInterval(checkAndResetIfNeeded, 60000);
    
    // Mobile-specific enhancements
    function setupMobileFeatures() {
        // Check if we're running on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Add vibration feedback when toggling items
            const originalToggleComplete = toggleComplete;
            toggleComplete = function(id) {
                // Call the original function
                originalToggleComplete(id);
                
                // Add vibration feedback if supported
                if ('vibrate' in navigator) {
                    navigator.vibrate(50); // Short vibration
                }
            };
            
            // Handle back button on Android
            if (/Android/i.test(navigator.userAgent)) {
                document.addEventListener('backbutton', function(e) {
                    e.preventDefault();
                    // Show a confirmation dialog
                    if (confirm('Do you want to exit the app?')) {
                        navigator.app && navigator.app.exitApp();
                    }
                }, false);
            }
            
            // Add touch feedback to buttons
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('touchstart', function() {
                    this.style.opacity = '0.7';
                });
                button.addEventListener('touchend', function() {
                    this.style.opacity = '1';
                });
            });
        }
    }

    // Initialize mobile features after DOM is loaded
    setupMobileFeatures();
    
    // Show toast message when app is ready
    showToast('Weekly Tracker is ready!');
    
    // Function to sort todos alphabetically
    function sortTodosAlphabetically() {
        todos.sort((a, b) => {
            // Sort purely by text (case insensitive)
            return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
        });
        
        // Save the sorted todos
        saveTodos();
    }
    
    // Function to recalculate counters based on completed todos
    function recalculateCounters() {
        // Reset counters
        counters = { foods: 0, activities: 0, total: 0 };
        
        // Count completed todos
        todos.forEach(todo => {
            if (todo.completed) {
                counters[todo.category]++;
            }
        });
        
        // Calculate total
        counters.total = counters.foods + counters.activities;
        
        // Save updated counters
        saveCounters();
    }
    
    // Function to initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Function to toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Function to check if we need to reset and do it if needed
    function checkAndResetIfNeeded() {
        const now = new Date();
        const saturday = getNextSaturday(now);
        saturday.setHours(23, 59, 0, 0);
        
        // Update next reset date display
        updateNextResetDate();
        
        // If we've never reset before, set the last reset time to now
        if (!lastResetTime) {
            lastResetTime = now.toISOString();
            localStorage.setItem('lastResetTime', lastResetTime);
            return;
        }
        
        const lastReset = new Date(lastResetTime);
        
        // Check if it's a new week (past Saturday 11:59 PM)
        // For a real app, we'd need a more robust solution, but this works for demo purposes
        const daysSinceLastReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
        
        // If it's been at least a day since last reset and we're in a new week (past Saturday)
        if (daysSinceLastReset >= 1 && isPastSaturdayNight(lastReset, now)) {
            // Save current week's data to history
            saveToHistory();
            
            // Reset counters
            counters = { foods: 0, activities: 0, total: 0 };
            localStorage.setItem('counters', JSON.stringify(counters));
            
            // Mark all todos as not completed
            todos = todos.map(todo => ({ ...todo, completed: false }));
            localStorage.setItem('todos', JSON.stringify(todos));
            
            // Update last reset time
            lastResetTime = now.toISOString();
            localStorage.setItem('lastResetTime', lastResetTime);
            
            // Update UI
            updateCountersDisplay();
            renderTodos();
            renderHistory();
        }
    }
    
    // Function to check if we've passed Saturday night 11:59 PM since the last reset
    function isPastSaturdayNight(lastReset, now) {
        // Get the Saturday 11:59 PM that follows lastReset
        const saturdayAfterLastReset = getNextSaturday(lastReset);
        saturdayAfterLastReset.setHours(23, 59, 0, 0);
        
        // If now is past that Saturday, we should reset
        return now > saturdayAfterLastReset;
    }
    
    // Function to get the next Saturday (or today if it's Saturday)
    function getNextSaturday(date) {
        const result = new Date(date);
        result.setDate(result.getDate() + (6 - result.getDay()));
        return result;
    }
    
    // Function to update the next reset date display
    function updateNextResetDate() {
        const now = new Date();
        const nextSaturday = getNextSaturday(now);
        nextSaturday.setHours(23, 59, 0, 0);
        
        const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        nextResetDate.textContent = nextSaturday.toLocaleDateString('en-US', options);
    }
    
    // Function to save current week's data to history
    function saveToHistory() {
        if (counters.total > 0) {
            const historyEntry = {
                date: new Date().toISOString(),
                counters: { ...counters }
            };
            
            history.unshift(historyEntry); // Add to the beginning of the array
            
            // Keep only the last 10 entries to avoid excessive storage
            if (history.length > 10) {
                history = history.slice(0, 10);
            }
            
            localStorage.setItem('history', JSON.stringify(history));
        }
    }
    
    // Function to render history
    function renderHistory() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="no-history">No history available yet</div>';
            return;
        }
        
        history.forEach(entry => {
            const date = new Date(entry.date);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', options);
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-date">Week of ${formattedDate}</div>
                <div class="history-counters">
                    <div>Foods: <strong>${entry.counters.foods}</strong></div>
                    <div>Activities: <strong>${entry.counters.activities}</strong></div>
                    <div>Total: <strong>${entry.counters.total}</strong></div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }
    
    // Function to update counters display
    function updateCountersDisplay() {
        foodsCounter.textContent = counters.foods;
        activitiesCounter.textContent = counters.activities;
        counters.total = counters.foods + counters.activities; // Ensure total is always the sum
        totalCounter.textContent = counters.total;
    }
    
    // Function to add a new todo
    function addTodo() {
        const todoText = todoInput.value.trim();
        const category = categorySelect.value;
        
        if (todoText !== '' && category !== '') {
            // Create a new todo object
            const todo = {
                id: Date.now(),
                text: todoText,
                completed: false,
                category: category,
                dateAdded: new Date().toISOString()
            };
            
            // Add to the todos array
            todos.push(todo);
            
            // Sort todos alphabetically
            sortTodosAlphabetically();
            
            // Save to localStorage
            saveTodos();
            
            // Render the updated list
            renderTodos();
            
            // Clear the input fields
            todoInput.value = '';
            categorySelect.value = '';
            
            // Focus back on the input
            todoInput.focus();
        } else if (todoText === '') {
            alert('Please enter a task');
        } else {
            alert('Please select a category');
        }
    }
    
    // Function to render todos
    function renderTodos() {
        const todoList = document.getElementById('todo-list');
        todoList.innerHTML = '';
        
        // Get filter values
        const filterCategory = document.getElementById('filter-category').value;
        const filterStatus = document.getElementById('filter-status').value;
        
        // Apply filters
        const filteredTodos = todos.filter(todo => {
            // Category filter
            if (filterCategory !== 'all' && todo.category !== filterCategory) {
                return false;
            }
            
            // Status filter
            if (filterStatus === 'active' && todo.completed) {
                return false;
            }
            if (filterStatus === 'completed' && !todo.completed) {
                return false;
            }
            
            return true;
        });
        
        // Check if we're on a mobile device
        const isMobile = window.innerWidth <= 768;
        
        // Render filtered todos
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            // Add category class
            li.classList.add(todo.category);
            
            // Add completed class if needed
            if (todo.completed) {
                li.classList.add('completed');
            }
            
            // Create todo text element
            const todoText = document.createElement('span');
            todoText.className = 'todo-text';
            todoText.textContent = todo.text;
            
            // Add category indicator before the text
            const categoryIndicator = document.createElement('span');
            categoryIndicator.className = `category-indicator category-${todo.category}`;
            li.appendChild(categoryIndicator);
            
            li.appendChild(todoText);
            
            // Create actions container
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'todo-actions';
            
            // Complete button
            const completeBtn = document.createElement('button');
            completeBtn.className = 'complete-btn';
            completeBtn.textContent = isMobile ? 'C' : 'Complete';
            completeBtn.addEventListener('click', () => {
                toggleComplete(todo.id);
                renderTodos();
                saveData();
            });
            actionsDiv.appendChild(completeBtn);
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = isMobile ? 'E' : 'Edit';
            editBtn.addEventListener('click', () => {
                const newText = prompt('Edit task:', todo.text);
                if (newText !== null && newText.trim() !== '') {
                    todo.text = newText.trim();
                    renderTodos();
                    saveData();
                }
            });
            actionsDiv.appendChild(editBtn);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = isMobile ? 'D' : 'Delete';
            deleteBtn.addEventListener('click', () => {
                deleteTodo(todo.id);
                renderTodos();
                saveData();
            });
            actionsDiv.appendChild(deleteBtn);
            
            li.appendChild(actionsDiv);
            todoList.appendChild(li);
        });
        
        // Update counters display
        document.getElementById('foods-counter').textContent = counters.foods;
        document.getElementById('activities-counter').textContent = counters.activities;
        document.getElementById('total-counter').textContent = counters.total;
    }
    
    // Function to toggle the completed status
    function toggleComplete(id) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        const wasCompleted = todo.completed;
        
        // Update the todo
        todo.completed = !wasCompleted;
        
        // Update counters
        if (todo.completed && !wasCompleted) {
            // Item was just completed
            counters[todo.category]++;
        } else if (!todo.completed && wasCompleted) {
            // Item was just uncompleted
            counters[todo.category]--;
        }
        
        // Recalculate total
        counters.total = counters.foods + counters.activities;
        
        // Save changes
        saveTodos();
        saveCounters();
        
        // Update UI
        updateCountersDisplay();
        renderTodos();
    }
    
    // Function to edit a todo
    function editTodo(id) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        // Populate the input fields with the todo data
        todoInput.value = todo.text;
        categorySelect.value = todo.category;
        
        // Remove the todo from the array
        todos = todos.filter(t => t.id !== id);
        
        // If the todo was completed, adjust the counters
        if (todo.completed) {
            counters[todo.category]--;
            // Recalculate total
            counters.total = counters.foods + counters.activities;
            saveCounters();
            updateCountersDisplay();
        }
        
        // Save to localStorage
        saveTodos();
        
        // Render the updated list
        renderTodos();
        
        // Focus on the input
        todoInput.focus();
    }
    
    // Function to delete a todo
    function deleteTodo(id) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        // If the todo was completed, adjust the counters
        if (todo.completed) {
            counters[todo.category]--;
            // Recalculate total
            counters.total = counters.foods + counters.activities;
            saveCounters();
            updateCountersDisplay();
        }
        
        // Remove the todo
        todos = todos.filter(t => t.id !== id);
        
        // Save changes
        saveTodos();
        
        // Render the updated list
        renderTodos();
    }
    
    // Function to save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // Function to save counters to localStorage
    function saveCounters() {
        localStorage.setItem('counters', JSON.stringify(counters));
    }
    
    // Simple toast notification function
    function showToast(message, duration = 3000) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '1000';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.style.display = 'block';
        
        // Hide after duration
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
});
