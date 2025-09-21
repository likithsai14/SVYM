document.addEventListener('DOMContentLoaded', () => {
    const totalFeesElement = document.getElementById('totalFees');
    const pendingFeesElement = document.getElementById('pendingFees');
    const completedFeesElement = document.getElementById('completedFees');
    const paymentHistoryTableBody = document.getElementById('paymentHistoryTableBody');
    const downloadReceiptsBtn = document.getElementById('downloadReceiptsBtn');

    let feeRecords = []; // This will store all transactions for the logged-in student

    // Fetch student-specific fee data from Netlify function
    async function fetchStudentFeeData() {
    try {
        const studentId = sessionStorage.getItem('userId'); // or however you store it
        const res = await fetch("/.netlify/functions/getStudentFees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId })
        });

        if (!res.ok) throw new Error('Failed to fetch fee data');

        const data = await res.json(); // Array of student's transactions
        feeRecords = data;
        console.log(feeRecords);
        calculateFeeSummary();
        displayPaymentHistory();
    } catch (error) {
        console.error('Error fetching student fee data:', error);
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:red; padding:20px;">
                    Failed to load payment data.
                </td>
            </tr>
        `;
    }
}


    // Calculate total, paid, and pending amounts
    function calculateFeeSummary() {
        let totalCourseFees = 0;
        let totalPaid = 0;

        feeRecords.forEach(record => {
            totalCourseFees += record.totalAmount || 0; // total price of course
            totalPaid += record.amountPaid || 0; // payment amount
        });

        const totalPending = totalCourseFees - totalPaid;

        totalFeesElement.textContent = `INR ${totalCourseFees.toFixed(2)}`;
        pendingFeesElement.textContent = `INR ${totalPending.toFixed(2)}`;
        completedFeesElement.textContent = `INR ${totalPaid.toFixed(2)}`;
    }

    // Display payment history table
    function displayPaymentHistory() {
    paymentHistoryTableBody.innerHTML = '';

    if (!feeRecords.length) {
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                    No payment history available.
                </td>
            </tr>
        `;
        return;
    }

    let hasRecords = false;

    feeRecords.forEach(course => {
        if (course.payments && course.payments.length) {
            hasRecords = true;
            course.payments.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(record.date).toLocaleDateString()}</td>
                    <td>${course.courseName || "Course Name"}</td>
                    <td>${record.transactionId}</td>
                    <td>INR ${record.amount.toFixed(2)}</td>
                    <td>${record.method}</td>
                    <td>Completed</td>
                    <td>
                        <button class="download-receipt-btn"
                            data-transaction-id="${record.transactionId}"
                            data-course-name="${course.courseName || "Course Name"}"
                            data-amount="${record.amount.toFixed(2)}"
                            data-date="${new Date(record.date).toLocaleDateString()}"
                            data-method="${record.method}">
                            <i class="fas fa-file-download"></i>
                        </button>
                    </td>
                `;
                paymentHistoryTableBody.appendChild(row);
            });
        }
    });

    if (!hasRecords) {
        paymentHistoryTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px; color:#555;">
                    No payment history available.
                </td>
            </tr>
        `;
    }

    // Attach download button event listeners
    document.querySelectorAll('.download-receipt-btn').forEach(button => {
        button.addEventListener('click', event => {
            const data = event.currentTarget.dataset;
            generateSingleReceiptPdf(data);
        });
    });
}


    // Generate single receipt PDF
    function generateSingleReceiptPdf(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const studentName = "Student Name"; // Optionally fetch real student name

        doc.setFontSize(22);
        doc.setTextColor(30, 144, 255);
        doc.text("Tech4Hope", 105, 20, null, null, "center");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Payment Receipt", 105, 30, null, null, "center");

        doc.setLineWidth(0.5);
        doc.setDrawColor(30, 144, 255);
        doc.line(20, 35, 190, 35);

        let y = 50;
        doc.setFontSize(12);
        doc.text(`Student Name: ${studentName}`, 20, y);
        y += 10;
        doc.text(`Transaction ID: ${data.transactionId}`, 20, y);
        y += 10;
        doc.text(`Date: ${data.date}`, 20, y);
        y += 10;
        doc.text(`Course: ${data.courseName}`, 20, y);
        y += 10;
        doc.text(`Payment Method: ${data.method}`, 20, y);
        y += 20;

        doc.setFontSize(18);
        doc.setTextColor(40, 167, 69);
        doc.text(`Amount Paid: INR ${data.amount}`, 20, y);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for your payment!", 105, doc.internal.pageSize.height - 20, null, null, "center");
        doc.text("Tech4Hope, Empowering Lives Through Skills", 105, doc.internal.pageSize.height - 15, null, null, "center");

        doc.save(`Tech4Hope_Receipt_${data.transactionId}.pdf`);
    }

    // Fetch data on page load
    fetchStudentFeeData();
});
