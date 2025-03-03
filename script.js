// DOM elements
const contactsContainer = document.getElementById('contacts-container');
const emptyState = document.getElementById('empty-state');
const modal = document.getElementById('modal');
const deleteModal = document.getElementById('delete-modal');
const modalTitle = document.getElementById('modal-title');
const contactForm = document.getElementById('contact-form');
const contactIdInput = document.getElementById('contact-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const categoryInput = document.getElementById('category');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Buttons
const addBtn = document.getElementById('add-btn');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const closeBtn = document.querySelector('.close');

// Contact data (stored in localStorage)
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
let currentContactId = null;
let filteredContacts = [];

// Initialize the app
init();

function init() {
    renderContacts();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    addBtn.addEventListener('click', openAddModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    contactForm.addEventListener('submit', saveContact);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', deleteContact);
    searchBtn.addEventListener('click', searchContacts);
    searchInput.addEventListener('input', searchContacts);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// Render contacts to the DOM
function renderContacts(contactsToRender = null) {
    const contactsToDisplay = contactsToRender || contacts;
    
    // Clear contacts container
    while (contactsContainer.firstChild) {
        contactsContainer.removeChild(contactsContainer.firstChild);
    }
    
    // Show empty state if no contacts
    if (contactsToDisplay.length === 0) {
        contactsContainer.appendChild(emptyState);
        return;
    }
    
    // Hide empty state
    if (emptyState.parentNode === contactsContainer) {
        contactsContainer.removeChild(emptyState);
    }
    
    // Render each contact
    contactsToDisplay.forEach(contact => {
        const contactCard = createContactCard(contact);
        contactsContainer.appendChild(contactCard);
    });
}

// Create a contact card element
function createContactCard(contact) {
    const card = document.createElement('div');
    card.classList.add('contact-card');
    
    const name = document.createElement('h3');
    name.textContent = contact.name;
    
    const email = document.createElement('p');
    const emailLabel = document.createElement('span');
    emailLabel.classList.add('label');
    emailLabel.textContent = 'Email:';
    email.appendChild(emailLabel);
    email.appendChild(document.createTextNode(' ' + contact.email));
    
    const phone = document.createElement('p');
    const phoneLabel = document.createElement('span');
    phoneLabel.classList.add('label');
    phoneLabel.textContent = 'Phone:';
    phone.appendChild(phoneLabel);
    phone.appendChild(document.createTextNode(' ' + contact.phone));
    
    const category = document.createElement('span');
    category.classList.add('category', contact.category);
    category.textContent = capitalizeFirstLetter(contact.category);
    
    // Action buttons container
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('contact-actions');
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.classList.add('action-btn', 'edit-btn');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', () => openEditModal(contact.id));
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action-btn', 'delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', () => openDeleteModal(contact.id));
    
    // Append all elements
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    card.appendChild(name);
    card.appendChild(email);
    card.appendChild(phone);
    card.appendChild(category);
    card.appendChild(actionsDiv);
    
    return card;
}

// Open the add contact modal
function openAddModal() {
    modalTitle.textContent = 'Add New Contact';
    contactForm.reset();
    contactIdInput.value = '';
    currentContactId = null;
    modal.style.display = 'block';
}

// Open the edit contact modal
function openEditModal(id) {
    modalTitle.textContent = 'Edit Contact';
    const contact = contacts.find(c => c.id === id);
    
    nameInput.value = contact.name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;
    categoryInput.value = contact.category;
    contactIdInput.value = contact.id;
    currentContactId = contact.id;
    
    modal.style.display = 'block';
}

// Open the delete confirmation modal
function openDeleteModal(id) {
    currentContactId = id;
    deleteModal.style.display = 'block';
}

// Close the contact modal
function closeModal() {
    modal.style.display = 'none';
    contactForm.reset();
}

// Close the delete confirmation modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Save a contact (create or update)
function saveContact(e) {
    e.preventDefault();
    
    // Get form values
    const name = nameInput.value;
    const email = emailInput.value;
    const phone = phoneInput.value;
    const category = categoryInput.value;
    
    if (currentContactId) {
        // Update existing contact
        const index = contacts.findIndex(c => c.id === currentContactId);
        contacts[index] = {
            id: currentContactId,
            name,
            email,
            phone,
            category
        };
        showNotification('Contact updated successfully!', 'success');
    } else {
        // Create new contact
        const newContact = {
            id: generateId(),
            name,
            email,
            phone,
            category
        };
        contacts.push(newContact);
        showNotification('Contact added successfully!', 'success');
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Re-render contacts
    renderContacts();
    
    // Close modal
    closeModal();
}

// Delete a contact
function deleteContact() {
    contacts = contacts.filter(c => c.id !== currentContactId);
    saveToLocalStorage();
    renderContacts();
    closeDeleteModal();
    showNotification('Contact deleted successfully!', 'danger');
}

// Search contacts
function searchContacts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === '') {
        renderContacts();
        return;
    }
    
    filteredContacts = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.phone.toLowerCase().includes(searchTerm) ||
        contact.category.toLowerCase().includes(searchTerm)
    );
    
    renderContacts(filteredContacts);
}

// Save contacts to localStorage
function saveToLocalStorage() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Generate a unique ID for a contact
function generateId() {
    return Date.now().toString();
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    
    // Add notification to the body
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// Utility function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: var(--border-radius);
        color: white;
        box-shadow: var(--box-shadow);
        z-index: 1000;
        animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
    }
    
    .success {
        background-color: var(--success-color);
    }
    
    .danger {
        background-color: var(--danger-color);
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);