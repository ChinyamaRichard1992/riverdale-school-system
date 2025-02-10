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
        // Load initial data from Supabase
        students = await loadStudentsFromSupabase();
        schoolFees = await loadSchoolFeesFromSupabase();
        
        // Update UI with loaded data
        updateStudentTable();
        updateDashboard();
        updateGradeSummary();

        // Subscribe to real-time changes
        subscribeToChanges(
            // Callback for student changes
            async () => {
                students = await loadStudentsFromSupabase();
                updateStudentTable();
                updateDashboard();
                updateGradeSummary();
            },
            // Callback for fees changes
            async () => {
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
        resetForm();
        showNotification('Student added successfully!');
    } catch (error) {
        showNotification('Error adding student. Please try again.', '#ff0000');
    }
});

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Add other event listeners and initialization code here
    document.getElementById('searchInput').addEventListener('input', searchStudents);
    // ... (keep other existing event listeners)
});

// Keep all your existing UI-related functions (updateStudentTable, showInvoice, etc.)
// but remove their data persistence logic since that's now handled by Supabase
