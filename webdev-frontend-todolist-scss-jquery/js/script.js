$(document).ready(function () {
    // === DOM Elements ===
    const $modal = $('#addTaskModal');
    const $addButton = $('.add-button');
    const $cancelButton = $('.modal__button--cancel');
    const $applyButton = $('.modal__button--apply');
    const $taskInput = $('.modal__input');
    const $taskList = $('.todo-list__tasks');
    const $searchInput = $('.search-bar__input');
    const $filterButton = $('.controls__button--dropdown');
    const $filterSpan = $('.filter-span');
    const $dropdownMenu = $('.dropdown-menu');
    const $dropdownItems = $('.dropdown-item');
    const $themeButton = $('.controls__button--theme-toggle');

    // === Storage Keys ===
    const STORAGE_KEYS = {
        TASKS: 'todoTasks',
        THEME: 'todoTheme',
        FILTER: 'todoFilter',
    };

    // === State ===
    let currentFilter = 'all';
    $filterSpan.text('ALL');

    // === Storage Helpers ===
    function loadTasksFromStorage() {
        try {
            const taskJson = localStorage.getItem(STORAGE_KEYS.TASKS);
            return taskJson ? JSON.parse(taskJson) : [];
        } catch (e) {
            console.error('Error loading tasks:', e);
            return [];
        }
    }

    function saveTasksToStorage() {
        try {
            const tasks = [];
            $('.task-item').each(function () {
                const $task = $(this);
                tasks.push({
                    id: $task.find('.task-item__checkbox').attr('id'),
                    text: $task.find('.task-item__span').text().trim(),
                    completed: $task.hasClass('task-item--completed'),
                });
            });
            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
        }
    }

    function loadThemeFromStorage() {
        try {
            const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
            if (savedTheme === 'dark') {
                $(':root').addClass('theme-dark');
            } else {
                $(':root').removeClass('theme-dark');
            }
        } catch (e) {
            console.error('Error loading theme:', e);
        }
    }

    function saveThemeToStorage(isDark) {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        } catch (e) {
            console.error('Error saving theme:', e);
        }
    }

    function loadFilterFromStorage() {
        try {
            const savedFilter = localStorage.getItem(STORAGE_KEYS.FILTER);
            if (savedFilter) {
                currentFilter = savedFilter;
                $dropdownItems.removeClass('active');
                $dropdownItems.filter(`[data-filter="${savedFilter}"]`).addClass('active');

                const buttonText = $dropdownItems
                    .filter(`[data-filter="${savedFilter}"]`)
                    .text()
                    .toUpperCase();
                $filterSpan.text(buttonText);
            }
        } catch (e) {
            console.error('Error loading filter:', e);
        }
    }

    function saveFilterToStorage(filter) {
        try {
            localStorage.setItem(STORAGE_KEYS.FILTER, filter);
        } catch (e) {
            console.error('Error saving filter:', e);
        }
    }

    // === Initialization ===
    function initializeApp() {
        loadThemeFromStorage();
        loadFilterFromStorage();

        const savedTasks = loadTasksFromStorage();
        savedTasks.forEach((task) => {
            addTaskToList(task.text, task.completed, task.id);
        });

        applyFiltersAndSearch();
    }

    // === Task Management ===
    function addTaskToList(text, completed = false) {
        const taskId = `task-${Date.now()}`;
        const completedClass = completed ? 'task-item--completed' : '';
        const checkedAttr = completed ? 'checked' : '';

        const taskHtml = `
      <li class="task-item ${completedClass}">
        <input type="checkbox" class="task-item__checkbox" id="${taskId}" ${checkedAttr}>
        <span for="${taskId}" class="task-item__span">${text}</span>
        <div class="task-item__actions">
          <button class="task-item__action task-item__action--edit" aria-label="Edit">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.67272 5.99106L2 12.6637V16H5.33636L12.0091 9.32736M8.67272 5.99106L11.0654 3.59837L11.0669 3.59695C11.3962 3.26759 11.5612 3.10261 11.7514 3.04082C11.9189 2.98639 12.0993 2.98639 12.2669 3.04082C12.4569 3.10257 12.6217 3.26735 12.9506 3.59625L14.4018 5.04738C14.7321 5.37769 14.8973 5.54292 14.9592 5.73337C15.0136 5.90088 15.0136 6.08133 14.9592 6.24885C14.8974 6.43916 14.7324 6.60414 14.4025 6.93398L14.4018 6.93468L12.0091 9.32736M8.67272 5.99106L12.0091 9.32736" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="task-item__action task-item__action--delete" aria-label="Delete">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.87414 7.61505C3.80712 6.74386 4.49595 6 5.36971 6H12.63C13.5039 6 14.1927 6.74385 14.1257 7.61505L13.6064 14.365C13.5463 15.1465 12.8946 15.75 12.1108 15.75H5.88894C5.10514 15.75 4.45348 15.1465 4.39336 14.365L3.87414 7.61505Z" stroke="currentColor"/>
              <path d="M14.625 3.75H3.375" stroke="currentColor" stroke-linecap="round"/>
              <path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="currentColor"/>
              <path d="M10.5 9V12.75" stroke="currentColor" stroke-linecap="round"/>
              <path d="M7.5 9V12.75" stroke="currentColor" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </li>
    `;

        $taskList.append(taskHtml);
        saveTasksToStorage();
        applyFiltersAndSearch();
    }

    // === Filtering & Search ===
    function applyFiltersAndSearch() {
        const searchTerm = $searchInput.val().trim().toLowerCase();
        const $tasks = $('.task-item');
        let visibleCount = 0;

        $tasks.each(function () {
            const $task = $(this);
            const isCompleted = $task.hasClass('task-item--completed');
            const taskText = $task.find('.task-item__span').text().toLowerCase();

            let passesFilter = false;
            switch (currentFilter) {
                case 'all':
                    passesFilter = true;
                    break;
                case 'complete':
                    passesFilter = isCompleted;
                    break;
                case 'incomplete':
                    passesFilter = !isCompleted;
                    break;
            }

            const passesSearch = !searchTerm || taskText.includes(searchTerm);
            const shouldShow = passesFilter && passesSearch;

            $task.toggle(shouldShow);
            if (shouldShow) visibleCount++;
        });

        const $empty = $('.todo-list__empty');
        const $taskListContainer = $('.todo-list__tasks');

        if (visibleCount === 0) {
            $taskListContainer.hide();
            $empty.show();
        } else {
            $taskListContainer.show();
            $empty.hide();
        }
    }

    // === Event Listeners ===
    $addButton.on('click', () => {
        $modal.show();
        $taskInput.val('').focus();
    });

    $cancelButton.on('click', () => $modal.hide());

    $('.modal__overlay').on('click', () => $modal.hide());

    $(document).on('keydown', (e) => {
        if (e.key === 'Escape') $modal.hide();
    });

    $applyButton.on('click', () => {
        const taskText = $taskInput.val().trim();
        if (!taskText) {
            alert('Please enter a task');
            return;
        }
        addTaskToList(taskText);
        $modal.hide();
        $taskInput.val('');
    });

    $taskList.on('click', '.task-item__action--delete', function () {
        if (!confirm('Are you sure you want to delete it?')) return;

        const $taskItem = $(this).closest('.task-item');
        $taskItem.addClass('task-item--removing');

        setTimeout(() => {
            $taskItem.remove();
            saveTasksToStorage();
            applyFiltersAndSearch();
        }, 300);
    });

    $taskList.on('click', '.task-item__action--edit', function () {
        const $item = $(this).closest('.task-item');

        if ($item.hasClass('task-item--completed')) {
            alert('The change is not available!');
            return;
        }

        const $span = $item.find('.task-item__span');
        const originalText = $span.text().trim();

        const $input = $('<input>')
            .attr('type', 'text')
            .addClass('task-item__edit-input')
            .val(originalText);

        $span.replaceWith($input);
        $input.focus();
        $input[0].setSelectionRange(originalText.length, originalText.length);

        const saveEdit = () => {
            let newText = $input.val().trim();
            if (!newText) newText = originalText;

            const $newSpan = $('<span>')
                .attr('for', $item.find('.task-item__checkbox').attr('id'))
                .addClass('task-item__span')
                .text(newText);

            $input.replaceWith($newSpan);
            saveTasksToStorage();
        };

        $input.on('blur', saveEdit).on('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                $input.blur();
            } else if (e.key === 'Escape') {
                $input.val(originalText).blur();
            }
        });
    });

    $taskList.on('change', '.task-item__checkbox', function () {
        const $item = $(this).closest('.task-item');
        $item.toggleClass('task-item--completed', this.checked);
        saveTasksToStorage();
        applyFiltersAndSearch();
    });

    $searchInput.on('input', applyFiltersAndSearch);

    $filterButton.on('click', (e) => {
        e.stopPropagation();
        $filterButton.toggleClass('active');
        $dropdownMenu.toggleClass('active');
    });

    $(document).on('click', (e) => {
        if (!$filterButton.is(e.target) && $filterButton.has(e.target).length === 0) {
            $filterButton.removeClass('active');
            $dropdownMenu.removeClass('active');
        }
    });

    $dropdownItems.on('click', function () {
        const filterValue = $(this).data('filter');
        currentFilter = filterValue;

        $dropdownItems.removeClass('active');
        $(this).addClass('active');

        const buttonText = $(this).text().toUpperCase();
        $filterSpan.text(buttonText);

        $filterButton.removeClass('active');
        $dropdownMenu.removeClass('active');

        saveFilterToStorage(filterValue);
        applyFiltersAndSearch();
    });

    $themeButton.on('click', () => {
        const $root = $(':root');
        $root.toggleClass('theme-dark');
        saveThemeToStorage($root.hasClass('theme-dark'));
    });

    // === Start App ===
    initializeApp();
});