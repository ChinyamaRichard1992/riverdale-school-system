import { supabase } from './supabase-config.js';
import {
    saveStudentToSupabase,
    loadStudentsFromSupabase,
    deleteStudentFromSupabase,
    saveSchoolFeesToSupabase,
    loadSchoolFeesFromSupabase,
    subscribeToChanges
} from './database.js';

let students = [];
let currentStudentNumber = 20240001;
let schoolFees = {};
let currentTerm = '';
let currentYear = '';

// Initialize data and subscriptions
async function initializeApp() {
    try {
        console.log('Starting to load data from Supabase...');
        
        // Load initial data from Supabase
        students = await loadStudentsFromSupabase();
        console.log('Loaded students:', students);
        
        schoolFees = await loadSchoolFeesFromSupabase();
        console.log('Loaded school fees:', schoolFees);
        
        // Update UI with loaded data
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();

        // Subscribe to real-time changes
        subscribeToChanges(
            // Callback for student changes
            async () => {
                console.log('Received student update');
                students = await loadStudentsFromSupabase();
                updateStudentTable();
                updateDashboard();
                updateGradeSummary();
            },
            // Callback for fees changes
            async () => {
                console.log('Received fees update');
                schoolFees = await loadSchoolFeesFromSupabase();
                updateDashboard();
                updateGradeSummary();
            }
        );
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading data. Please refresh the page.', '#ff0000');
    }
}

// Save student data
async function saveStudent(student) {
    try {
        await saveStudentToSupabase(student);
        showNotification('Student data saved successfully!');
    } catch (error) {
        console.error('Error saving student:', error);
        showNotification('Error saving student data. Please try again.', '#ff0000');
        throw error;
    }
}

// Delete student
async function deleteStudent(studentNumber) {
    try {
        await deleteStudentFromSupabase(studentNumber);
        students = students.filter(s => s.studentNumber !== studentNumber);
        updateStudentTable();
        updateDashboard();
        showNotification('Student deleted successfully!');
    } catch (error) {
        console.error('Error deleting student:', error);
        showNotification('Error deleting student. Please try again.', '#ff0000');
    }
}

// Save school fees
async function saveSchoolFees(fees) {
    try {
        await saveSchoolFeesToSupabase(fees);
        showNotification('School fees updated successfully!');
    } catch (error) {
        console.error('Error saving school fees:', error);
        showNotification('Error saving school fees. Please try again.', '#ff0000');
    }
}

// Form submission handler
document.getElementById('studentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const student = {
        studentNumber: document.getElementById('studentNumber').value,
        name: document.getElementById('studentName').value,
        grade: document.getElementById('grade').value,
        term: currentTerm,
        year: currentYear,
        paymentHistory: []
    };

    try {
        await saveStudent(student);
        document.getElementById('studentForm').reset();
        showNotification('Student added successfully!');
    } catch (error) {
        console.error('Error adding student:', error);
        showNotification('Error adding student. Please try again.', '#ff0000');
    }
});

// Make these functions available globally for button clicks
window.editStudent = async function(studentNumber) {
    const student = students.find(s => s.studentNumber === studentNumber);
    if (student) {
        document.getElementById('studentNumber').value = student.studentNumber;
        document.getElementById('studentName').value = student.name;
        document.getElementById('grade').value = student.grade;
    }
};

window.deleteStudent = async function(studentNumber) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await deleteStudentFromSupabase(studentNumber);
            showNotification('Student deleted successfully!');
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Error deleting student. Please try again.', '#ff0000');
        }
    }
};

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    
    // Add search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.studentNumber.toLowerCase().includes(searchTerm)
        );
        
        const tableBody = document.querySelector('#studentTable tbody');
        tableBody.innerHTML = '';
        filteredStudents.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentNumber}</td>
                <td>${student.name}</td>
                <td>${student.grade}</td>
                <td>
                    <button onclick="editStudent('${student.studentNumber}')" class="edit-btn">Edit</button>
                    <button onclick="deleteStudent('${student.studentNumber}')" class="delete-btn">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    });
    
    // Set current term and year
    const currentDate = new Date();
    currentYear = currentDate.getFullYear().toString();
    const month = currentDate.getMonth() + 1;
    currentTerm = month <= 4 ? '1' : month <= 8 ? '2' : '3';
    
    console.log('Current term:', currentTerm, 'Current year:', currentYear);
});

// Helper function to show notifications
function showNotification(message, color = '#4CAF50') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = color;
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Update the student table display
function updateStudentTable() {
    const tableBody = document.querySelector('#studentTable tbody');
    if (!tableBody) {
        console.error('Student table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.studentNumber}</td>
            <td>${student.name}</td>
            <td>${student.grade}</td>
            <td>
                <button onclick="editStudent('${student.studentNumber}')" class="edit-btn">Edit</button>
                <button onclick="deleteStudent('${student.studentNumber}')" class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Keep all your existing UI-related functions (updateDashboard, updateGradeSummary, etc.)
// but remove their data persistence logic since that's now handled by Supabase
