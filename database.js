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
                    year: student.year
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
            year: student.additional_info?.year
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
            .upsert({
                id: `${fees.grade}_${fees.term}_${fees.year}`,
                amount: fees.amount,
                grade: fees.grade,
                term: fees.term,
                year: fees.year
            });

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
        
        // Convert array to object with composite key
        return data.reduce((acc, fee) => {
            acc[`${fee.grade}_${fee.term}_${fee.year}`] = fee.amount;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error loading school fees from Supabase:', error);
        throw error;
    }
}

// Function to subscribe to real-time changes
export function subscribeToChanges(onStudentsChange, onFeesChange) {
    // Subscribe to students table changes
    const studentsSubscription = supabase
        .channel('students-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'students'
            },
            (payload) => {
                console.log('Students change received:', payload);
                onStudentsChange();
            }
        )
        .subscribe((status) => {
            console.log('Students subscription status:', status);
        });

    // Subscribe to school_fees table changes
    const feesSubscription = supabase
        .channel('fees-channel')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'school_fees'
            },
            (payload) => {
                console.log('School fees change received:', payload);
                onFeesChange();
            }
        )
        .subscribe((status) => {
            console.log('Fees subscription status:', status);
        });

    return () => {
        studentsSubscription.unsubscribe();
        feesSubscription.unsubscribe();
    };
}
