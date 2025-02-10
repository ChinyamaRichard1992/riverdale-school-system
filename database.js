import { supabase } from './supabase-config.js';

// Function to save student data to Supabase
export async function saveStudentToSupabase(student) {
    try {
        const { data, error } = await supabase
            .from('students')
            .upsert({
                student_number: student.studentNumber,
                full_name: student.name,
                grade: student.grade,
                payment_history: student.paymentHistory || [],
                additional_info: {
                    term: student.term,
                    year: student.year,
                    // Add any other student properties here
                }
            });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving student to Supabase:', error);
        throw error;
    }
}

// Function to load students from Supabase
export async function loadStudentsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('student_number', { ascending: true });

        if (error) throw error;
        return data.map(student => ({
            studentNumber: student.student_number,
            name: student.full_name,
            grade: student.grade,
            paymentHistory: student.payment_history || [],
            term: student.additional_info?.term,
            year: student.additional_info?.year,
            // Map other properties as needed
        }));
    } catch (error) {
        console.error('Error loading students from Supabase:', error);
        throw error;
    }
}

// Function to delete student from Supabase
export async function deleteStudentFromSupabase(studentNumber) {
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('student_number', studentNumber);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting student from Supabase:', error);
        throw error;
    }
}

// Function to save school fees to Supabase
export async function saveSchoolFeesToSupabase(fees) {
    try {
        const { data, error } = await supabase
            .from('school_fees')
            .upsert(Object.entries(fees).map(([id, fee]) => ({
                id,
                amount: fee.amount,
                grade: fee.grade,
                term: fee.term,
                year: fee.year
            })));

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving school fees to Supabase:', error);
        throw error;
    }
}

// Function to load school fees from Supabase
export async function loadSchoolFeesFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('school_fees')
            .select('*');

        if (error) throw error;

        const fees = {};
        data.forEach(fee => {
            fees[fee.id] = {
                amount: fee.amount,
                grade: fee.grade,
                term: fee.term,
                year: fee.year
            };
        });
        return fees;
    } catch (error) {
        console.error('Error loading school fees from Supabase:', error);
        throw error;
    }
}

// Function to subscribe to real-time changes
export function subscribeToChanges(onStudentsChange, onFeesChange) {
    const studentsSubscription = supabase
        .channel('students-channel')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'students' },
            payload => {
                console.log('Students change received:', payload);
                onStudentsChange();
            }
        )
        .subscribe();

    const feesSubscription = supabase
        .channel('fees-channel')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'school_fees' },
            payload => {
                console.log('Fees change received:', payload);
                onFeesChange();
            }
        )
        .subscribe();

    return { studentsSubscription, feesSubscription };
}
